#!/usr/bin/env node

/**
 * DiagnostIQ Batch Processor v0.3.2
 *
 * Discovers TSG markdown files in a directory and creates an organized
 * batch processing workflow for Copilot extraction.
 *
 * Usage:
 *   node batch-processor.js ./Wiki/AzureAD
 *   node batch-processor.js "d:\Wiki\AzureAD\AzureAD\GeneralPages"
 *   node batch-processor.js --status
 *   node batch-processor.js --next
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BatchProcessor {
    constructor() {
        this.batchDir = './batch-workspace';
        this.queueFile = path.join(this.batchDir, 'batch-queue.json');
        this.statusFile = path.join(this.batchDir, 'batch-status.txt');
        this.tempDir = './temp';
        this.processedDir = './temp/processed';

        // Ensure directories exist
        this.ensureDirectories();
    }

    ensureDirectories() {
        if (!fs.existsSync(this.batchDir)) {
            fs.mkdirSync(this.batchDir, { recursive: true });
        }
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
        if (!fs.existsSync(this.processedDir)) {
            fs.mkdirSync(this.processedDir, { recursive: true });
        }
    }

    /**
     * Discover TSG markdown files in a directory
     */
    discoverTSGFiles(directory) {
        console.log(`🔍 Scanning directory: ${directory}`);

        if (!fs.existsSync(directory)) {
            console.error(`❌ Directory not found: ${directory}`);
            process.exit(1);
        }

        const tsgFiles = [];

        const scanDirectory = (dir) => {
            const items = fs.readdirSync(dir, { withFileTypes: true });

            for (const item of items) {
                const fullPath = path.join(dir, item.name);

                if (item.isDirectory()) {
                    // Recursively scan subdirectories
                    scanDirectory(fullPath);
                } else if (item.isFile() && item.name.endsWith('.md')) {
                    // Check if it's likely a TSG file
                    if (this.isTSGFile(fullPath)) {
                        tsgFiles.push({
                            filename: item.name,
                            fullPath: fullPath,
                            relativePath: path.relative(process.cwd(), fullPath),
                            directory: path.dirname(fullPath),
                            size: fs.statSync(fullPath).size,
                            lastModified: fs.statSync(fullPath).mtime
                        });
                    }
                }
            }
        };

        scanDirectory(directory);

        console.log(`📄 Found ${tsgFiles.length} TSG markdown files`);
        return tsgFiles;
    }

    /**
     * Determine if a markdown file is likely a TSG/troubleshooting document
     */
    isTSGFile(filePath) {
        const filename = path.basename(filePath).toLowerCase();
        const fullPath = filePath.toLowerCase();

        try {
            const content = fs.readFileSync(filePath, 'utf8').toLowerCase();

            // Skip empty files
            if (content.trim().length === 0) {
                console.log(`⏭️ Skipping empty file: ${filename}`);
                return false;
            }

            // Skip very small files (less than 50 characters, likely empty or just metadata)
            if (content.trim().length < 50) {
                console.log(`⏭️ Skipping too small file: ${filename} (${content.trim().length} chars)`);
                return false;
            }

            // Exclude common non-TSG patterns
            const excludePatterns = [
                '.templates',
                'template',
                'faq',
                'readme',
                'table-',
                'api-',
                'sdk-',
                'example',
                'overview',
                'introduction',
                'getting-started',
                'escalation-guidelines',
                'prerequisite'
            ];

            // Skip if path/filename contains exclusion patterns
            if (excludePatterns.some(pattern => fullPath.includes(pattern) || filename.includes(pattern))) {
                return false;
            }

            // Strong TSG filename indicators
            const strongTsgPatterns = [
                'tsg-',
                'troubleshoot',
                'troubleshooting',
                'password-protection',
                'cross-tenant-sync',
                'domain-services',
                'conditional-access'
            ];

            // Content patterns that strongly indicate troubleshooting docs
            const strongContentPatterns = [
                'troubleshooting steps',
                'resolution steps',
                'diagnostic steps',
                'kusto query',
                'kql query',
                'azure ad logs',
                'sign-in logs',
                'audit logs',
                'error message',
                'issue description',
                'symptom',
                'root cause'
            ];

            // Check filename patterns
            const hasStrongFilenameMatch = strongTsgPatterns.some(pattern => filename.includes(pattern));

            // Check content patterns (sample first 3000 characters)
            const contentSample = content.substring(0, 3000);
            const strongContentMatches = strongContentPatterns.filter(pattern => contentSample.includes(pattern)).length;

            // Must have strong filename match OR multiple strong content matches
            return hasStrongFilenameMatch || strongContentMatches >= 2;

        } catch (error) {
            // Skip files that can't be read
            return false;
        }
    }

    /**
     * Create batch queue from discovered files
     */
    createBatchQueue(files) {
        const batchId = `batch-${new Date().toISOString().split('T')[0]}-${Date.now()}`;

        const queue = {
            batchId: batchId,
            createdAt: new Date().toISOString(),
            totalFiles: files.length,
            status: 'created',
            files: files.map((file, index) => ({
                id: index + 1,
                filename: file.filename,
                fullPath: file.fullPath,
                relativePath: file.relativePath,
                directory: file.directory,
                status: 'pending',
                outputFile: path.join(this.tempDir, `${path.basename(file.filename, '.md')}-extracted-scenarios.json`),
                processedAt: null,
                importedAt: null,
                scenarioCount: null,
                notes: null
            }))
        };

        // Save queue to file
        fs.writeFileSync(this.queueFile, JSON.stringify(queue, null, 2));
        console.log(`📋 Created batch queue: ${batchId}`);
        console.log(`💾 Queue saved to: ${this.queueFile}`);

        return queue;
    }

    /**
     * Display current batch status
     */
    showStatus() {
        if (!fs.existsSync(this.queueFile)) {
            console.log('❌ No active batch found. Run with a directory path to create one.');
            return;
        }

        // Check for any completed files first
        this.checkForCompletedFiles();

        const queue = JSON.parse(fs.readFileSync(this.queueFile, 'utf8'));

        const completed = queue.files.filter(f => f.status === 'completed').length;
        const pending = queue.files.filter(f => f.status === 'pending').length;
        const processing = queue.files.filter(f => f.status === 'processing').length;

        console.log(`\n🎯 DiagnostIQ Batch Processor v0.3.2`);
        console.log(`📊 Batch: ${queue.batchId}`);
        console.log(`📈 Progress: ${completed}/${queue.totalFiles} files completed`);
        console.log(`⏳ Status: ${completed} completed, ${processing} processing, ${pending} pending\n`);

        // Show completed files
        if (completed > 0) {
            console.log('✅ Completed:');
            queue.files
                .filter(f => f.status === 'completed')
                .forEach(f => {
                    const scenarios = f.scenarioCount ? `(${f.scenarioCount} scenarios)` : '';
                    console.log(`   ✓ ${f.filename} ${scenarios}`);
                });
            console.log('');
        }

        // Show next file to process
        const nextFile = queue.files.find(f => f.status === 'pending');
        if (nextFile) {
            console.log('📍 NEXT TO PROCESS:');
            console.log(`   📄 File: ${nextFile.filename}`);
            console.log(`   📂 Path: ${nextFile.relativePath}`);
            console.log(`   💾 Output: ${nextFile.outputFile}`);
            console.log('');
            this.writeStatusFile(nextFile);
        } else {
            console.log('🎉 All files completed!');
        }

        // Show remaining files
        const remainingFiles = queue.files.filter(f => f.status === 'pending');
        if (remainingFiles.length > 1) {
            console.log('⏳ Remaining:');
            remainingFiles.slice(1, 6).forEach(f => {
                console.log(`   • ${f.filename}`);
            });
            if (remainingFiles.length > 6) {
                console.log(`   ... and ${remainingFiles.length - 5} more`);
            }
            console.log('');
        }

        this.showInstructions();
    }

    /**
     * Show the next file to process
     */
    showNext(autoOpen = false) {
        if (!fs.existsSync(this.queueFile)) {
            console.log('❌ No active batch found. Run with a directory path to create one.');
            return;
        }

        // First, check for any completed files that need processing
        this.checkForCompletedFiles();

        const queue = JSON.parse(fs.readFileSync(this.queueFile, 'utf8'));
        const nextFile = queue.files.find(f => f.status === 'pending');

        if (!nextFile) {
            console.log('🎉 No more files to process!');
            return;
        }

        console.log('\n📍 NEXT FILE TO PROCESS:');
        console.log(`📄 ${nextFile.filename}`);
        console.log(`📂 ${nextFile.relativePath}`);
        console.log(`💾 Save as: ${nextFile.outputFile}`);

        // Auto-open in VS Code if requested
        if (autoOpen) {
            this.openInVSCode(nextFile.fullPath);
        }

        this.writeStatusFile(nextFile);
        this.showInstructions();
    }

    /**
     * Check temp directory for completed files and process them
     */
    checkForCompletedFiles() {
        if (!fs.existsSync(this.tempDir) || !fs.existsSync(this.queueFile)) {
            return;
        }

        const queue = JSON.parse(fs.readFileSync(this.queueFile, 'utf8'));
        const tempFiles = fs.readdirSync(this.tempDir).filter(f => f.endsWith('.json'));

        for (const filename of tempFiles) {
            const filePath = path.join(this.tempDir, filename);

            // Try exact match first
            let file = queue.files.find(f => path.basename(f.outputFile) === filename);

            // If no exact match, try with URL encoding/decoding
            if (!file) {
                file = queue.files.find(f => {
                    const queueBasename = path.basename(f.outputFile);
                    // Try URL decoding the queue filename
                    const decodedQueueName = decodeURIComponent(queueBasename);
                    // Also try encoding the temp filename
                    const encodedTempName = encodeURIComponent(filename);

                    return decodedQueueName === filename ||
                           queueBasename === encodedTempName ||
                           // Handle common cases like %2D vs -
                           queueBasename.replace(/%2D/g, '-') === filename ||
                           filename.replace(/-/g, '%2D') === queueBasename;
                });
            }

            if (file && file.status === 'pending') {
                console.log(`📥 Found completed file: ${filename}`);
                this.processCompletedFile(file, filePath);
            }
        }
    }

    /**
     * Process a completed file: import, mark as done, move to processed
     */
    processCompletedFile(queueFile, outputFile) {
        // Mark as completed
        queueFile.status = 'completed';
        queueFile.processedAt = new Date().toISOString();

        // Count scenarios
        try {
            const data = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
            queueFile.scenarioCount = data.length;
            console.log(`✅ Processed: ${queueFile.filename} (${queueFile.scenarioCount} scenarios)`);
        } catch (e) {
            console.log(`⚠️ Could not count scenarios in ${outputFile}`);
            queueFile.scenarioCount = 0;
        }

        // Auto-import
        this.autoImport(outputFile);

        // Move to processed directory
        const processedPath = path.join(this.processedDir, path.basename(outputFile));
        try {
            fs.renameSync(outputFile, processedPath);
            console.log(`📁 Moved to processed: ${path.basename(outputFile)}`);
        } catch (error) {
            console.log(`⚠️ Could not move file to processed: ${error.message}`);
        }

        // Update queue
        const queue = JSON.parse(fs.readFileSync(this.queueFile, 'utf8'));
        const fileIndex = queue.files.findIndex(f => f.id === queueFile.id);
        if (fileIndex !== -1) {
            queue.files[fileIndex] = queueFile;
            fs.writeFileSync(this.queueFile, JSON.stringify(queue, null, 2));
        }
    }

    /**
     * Open the next file directly in VS Code
     */
    openNextFile() {
        if (!fs.existsSync(this.queueFile)) {
            console.log('❌ No active batch found. Run with a directory path to create one.');
            return;
        }

        const queue = JSON.parse(fs.readFileSync(this.queueFile, 'utf8'));
        const nextFile = queue.files.find(f => f.status === 'pending');

        if (!nextFile) {
            console.log('🎉 No more files to process!');
            return;
        }

        console.log(`📂 Opening next file: ${nextFile.filename}`);
        this.openInVSCode(nextFile.fullPath);

        // Also show the processing info
        console.log(`💾 Remember to save JSON as: ${nextFile.outputFile}`);
        this.writeStatusFile(nextFile);
    }

    /**
     * Open file in VS Code
     */
    openInVSCode(filePath) {
        try {
            console.log(`📂 Opening in VS Code: ${path.basename(filePath)}`);

            // Try to open with VS Code
            execSync(`code "${filePath}"`, {
                stdio: 'ignore',
                timeout: 5000
            });

            console.log('✅ File opened in VS Code');
        } catch (error) {
            console.log(`⚠️ Could not auto-open in VS Code: ${error.message}`);
            console.log(`💡 Please open manually: ${filePath}`);
        }
    }

    /**
     * Mark current file as completed and move to next
     */
    markCompleted(outputFile) {
        if (!fs.existsSync(this.queueFile)) {
            console.log('❌ No active batch found.');
            return;
        }

        const queue = JSON.parse(fs.readFileSync(this.queueFile, 'utf8'));
        const file = queue.files.find(f => f.outputFile === outputFile);

        if (!file) {
            console.log(`❌ File not found in queue: ${outputFile}`);
            return;
        }

        file.status = 'completed';
        file.processedAt = new Date().toISOString();

        // Try to count scenarios in the output file
        if (fs.existsSync(outputFile)) {
            try {
                const data = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
                file.scenarioCount = data.length;
            } catch (e) {
                console.log(`⚠️ Could not count scenarios in ${outputFile}`);
            }
        }

        fs.writeFileSync(this.queueFile, JSON.stringify(queue, null, 2));
        console.log(`✅ Marked as completed: ${file.filename} (${file.scenarioCount || '?'} scenarios)`);

        // Auto-import if possible
        this.autoImport(outputFile);

        // Show next file and auto-open it
        setTimeout(() => this.showNext(true), 100);
    }

    /**
     * Auto-import completed extractions
     */
    autoImport(outputFile) {
        if (!fs.existsSync(outputFile)) {
            console.log(`⚠️ Output file not found for auto-import: ${outputFile}`);
            return false;
        }

        try {
            console.log(`🔄 Auto-importing: ${outputFile}`);
            const result = execSync(`node import-scenarios.js "${outputFile}"`, {
                encoding: 'utf8',
                cwd: process.cwd()
            });
            console.log(`✅ Import successful!`);

            // Update import status in queue
            if (fs.existsSync(this.queueFile)) {
                const queue = JSON.parse(fs.readFileSync(this.queueFile, 'utf8'));
                const file = queue.files.find(f => f.outputFile === outputFile);
                if (file) {
                    file.importedAt = new Date().toISOString();
                    fs.writeFileSync(this.queueFile, JSON.stringify(queue, null, 2));
                }
            }
            return true;
        } catch (error) {
            console.log(`❌ Auto-import failed: ${error.message}`);
            console.log(`💡 Run manually: node import-scenarios.js "${outputFile}"`);
            return false;
        }
    }

    /**
     * Write status file for easy reference
     */
    writeStatusFile(nextFile) {
        const statusContent = `DiagnostIQ Batch Processor - Current Status
Generated: ${new Date().toISOString()}

NEXT FILE TO PROCESS:
📄 ${nextFile.filename}
📂 ${nextFile.relativePath}
💾 Save JSON as: ${nextFile.outputFile}

COPILOT INSTRUCTIONS:
1. Open the file above in VS Code
2. Use this exact prompt in Copilot Chat:

#file: generic_extraction_template.txt

Execute instructions in the template and save the json in temp

3. Save the JSON with the exact filename shown above
4. Run: node batch-processor.js --completed "${nextFile.outputFile}"

ALTERNATIVE:
- Run: node batch-processor.js --next (to see this again)
- Run: node batch-processor.js --status (to see full progress)
`;
        fs.writeFileSync(this.statusFile, statusContent);
    }

    /**
     * Show usage instructions
     */
    showInstructions() {
        console.log('🔧 NEXT STEPS:');
        console.log('1. Use Copilot Chat with: #file: generic_extraction_template.txt');
        console.log('2. Execute instructions and save JSON to temp/');
        console.log('3. Run --next to auto-detect, import, and open next file');
        console.log('');
        console.log('💡 Commands:');
        console.log('   node batch-processor.js --status         (show progress + auto-detect)');
        console.log('   node batch-processor.js --next           (auto-detect + show next file)');
        console.log('   node batch-processor.js --next --open    (auto-detect + show next + open in VS Code)');
        console.log('   node batch-processor.js --open           (just open next file)');
        console.log(`   📄 Status file: ${this.statusFile}`);
        console.log('   📁 Processed files moved to: temp/processed/');
    }

    /**
     * Process all JSON files from temp/tobeprocessed folder
     */
    processToBeProcessedFiles() {
        const tobeprocessedDir = './temp/tobeprocessed';

        if (!fs.existsSync(tobeprocessedDir)) {
            console.log('📁 Creating temp/tobeprocessed directory...');
            fs.mkdirSync(tobeprocessedDir, { recursive: true });
            console.log('ℹ️ No files found in temp/tobeprocessed. Place JSON files there to process them.');
            return;
        }

        const jsonFiles = fs.readdirSync(tobeprocessedDir).filter(f => f.endsWith('.json'));

        if (jsonFiles.length === 0) {
            console.log('ℹ️ No JSON files found in temp/tobeprocessed directory.');
            return;
        }

        console.log(`🔄 Processing ${jsonFiles.length} files from temp/tobeprocessed...`);

        let processed = 0;
        let errors = 0;

        for (const filename of jsonFiles) {
            const filePath = path.join(tobeprocessedDir, filename);

            try {
                console.log(`📥 Processing: ${filename}`);

                // Count scenarios
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const scenarioCount = Array.isArray(data) ? data.length : 1;

                // Auto-import
                const success = this.autoImport(filePath);

                if (success) {
                    // Move to processed directory
                    const processedPath = path.join(this.processedDir, filename);
                    fs.renameSync(filePath, processedPath);

                    console.log(`✅ Processed: ${filename} (${scenarioCount} scenarios)`);
                    console.log(`📁 Moved to processed: ${filename}`);
                    processed++;
                } else {
                    console.log(`❌ Failed to import: ${filename}`);
                    errors++;
                }

            } catch (error) {
                console.log(`❌ Error processing ${filename}: ${error.message}`);
                errors++;
            }
        }

        console.log(`\n📊 PROCESSING SUMMARY:`);
        console.log(`✅ Successfully processed: ${processed} files`);
        if (errors > 0) {
            console.log(`❌ Errors: ${errors} files`);
        }
        console.log(`📁 All processed files moved to: ${this.processedDir}`);
    }

    /**
     * Main entry point
     */
    run(args) {
        if (args.includes('--help') || args.includes('-h')) {
            this.showHelp();
            return;
        }

        if (args.includes('--status')) {
            this.showStatus();
            return;
        }

        if (args.includes('--next')) {
            const shouldOpen = args.includes('--open');
            this.showNext(shouldOpen);
            return;
        }

        if (args.includes('--open')) {
            // Check for completed files first, then open next
            this.checkForCompletedFiles();
            this.openNextFile();
            return;
        }

        if (args.includes('--process-all')) {
            this.processToBeProcessedFiles();
            return;
        }

        if (args.includes('--watch')) {
            console.log('⚠️ File watcher mode removed. Use --next for auto-detection instead.');
            return;
        }

        const completedIndex = args.findIndex(arg => arg === '--completed');
        if (completedIndex !== -1 && args[completedIndex + 1]) {
            this.markCompleted(args[completedIndex + 1]);
            return;
        }

        // Directory path provided
        const directory = args[2];
        if (!directory) {
            console.log('❌ Please provide a directory path.');
            this.showHelp();
            return;
        }

        // Discover and create batch
        const files = this.discoverTSGFiles(directory);
        if (files.length === 0) {
            console.log('❌ No TSG files found in the specified directory.');
            return;
        }

        const queue = this.createBatchQueue(files);
        console.log('\n📋 Batch created successfully!');

        // Show status
        this.showStatus();
    }

    showHelp() {
        console.log(`
🎯 DiagnostIQ Batch Processor v0.3.2

USAGE:
  node batch-processor.js <directory>       Create batch from directory
  node batch-processor.js --status          Show current batch progress + auto-detect
  node batch-processor.js --next            Auto-detect completed files + show next
  node batch-processor.js --next --open     Auto-detect + show next + open in VS Code
  node batch-processor.js --open            Auto-detect + open next file in VS Code
  node batch-processor.js --process-all     Process all JSON files from temp/tobeprocessed/
  node batch-processor.js --completed <file>  Mark file as completed (manual)

EXAMPLES:
  node batch-processor.js ./Wiki/AzureAD
  node batch-processor.js "C:\\Wiki\\AzureAD\\GeneralPages"
  node batch-processor.js --next --open     (recommended workflow)
  node batch-processor.js --process-all     (process any JSON files)

IMPROVED WORKFLOW:
1. Run with directory path to discover TSG files
2. Extract scenarios with Copilot and save JSON to temp/
3. Run --next --open to auto-detect, import, and open next file
4. Repeat until all files processed

FLEXIBLE PROCESSING:
- Place ANY JSON files in temp/tobeprocessed/ folder
- Run --process-all to import them all, regardless of filename
- Files will be imported and moved to temp/processed/

AUTO-FEATURES:
- Auto-detects completed JSON files in temp/
- Auto-imports scenarios to DiagnostIQ
- Moves processed files to temp/processed/
- Opens next file in VS Code automatically
- No blocking file watchers - use commands when ready
        `);
    }
}

// CLI execution
if (require.main === module) {
    const processor = new BatchProcessor();
    processor.run(process.argv);
}

module.exports = BatchProcessor;
