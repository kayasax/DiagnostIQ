#!/usr/bin/env node

// DiagnostIQ Repository Cleanup Script v0.4.0
// Prepares repository for new version by removing temporary and test files

const fs = require('fs');
const path = require('path');

console.log('🧹 DiagnostIQ Repository Cleanup v0.4.0');
console.log('==========================================');

// Files and directories to clean up
const filesToRemove = [
    // Test files
    'test-nav.html',
    'test-navigation.html',
    'test-ai-integration.html',
    'test-data-loading.html',
    'test-sync.html',

    // Development scripts
    'analyze-file-structure.js',
    'analyze-file.js',
    'analyze-verticals.js',
    'debug-duplicates.js',
    'debug-kql-detection.js',
    'debug-sync.html',
    'find-test-file.js',
    'test-ai-summary.js',
    'test-chunked-extraction.js',
    'test-chunked.js',
    'test-chunking-simple.js',
    'test-correct-path.js',
    'test-enhanced-extractor.js',
    'test-ollama-connection.js',
    'test-quick-ai.js',
    'test-simple-ai.js',

    // Legacy extraction files
    'ai-integration-server.js',
    'ai-scenario-integration.js',
    'ai-scenario-loader.js',
    'chunked-ai-extractor.js',
    'enhanced-ai-extractor-clean.js',
    'enhanced-ai-extractor.js',
    'enhanced-automated-extractor.js',
    'extract-cli.js',
    'fully-automated-extractor.js',
    'integration-flow-demo.js',
    'large-file-processor.js',
    'memory-efficient-processor.js',
    'simple-extractor.js',
    'simple-summarize-test.js',

    // Sample/demo files
    'demo-extract-request.json',
    'SAMPLE_KQL_RESPONSE.json',
    'SAMPLE_SCENARIOS_RESPONSE.json',
    'cross-tenant-sync-test.md',
    'real-cross-tenant-sync.md',
    'real-provisioning-troubleshooting.md',
    'sample-auth-troubleshooting.md',

    // Legacy documentation
    'AUTOMATED_INSTRUCTIONS.txt',
    'COMPLETE_EXTRACTION_PROMPT.txt',
    'COMPLETE_INTEGRATION_FLOW.md',
    'COPILOT_SECURITY_ANALYSIS.md',
    'COPILOT_SOLUTION.md',
    'INTEGRATION_FLOW_RESULTS.md',
    'LIVE_DEMO_GUIDE.md',
    'READY_TO_EXTRACT.md',
    'SOLUTION_COMPLETE.md',
    'AI_INTEGRATION_COMPLETE.md',

    // Legacy prompts/configs
    'copilot-extraction-prompt.txt',
    'copilot-extraction-workflow.js',
    'copilot-file-analyzer.js',
    'copilot-integrator.js'
];

// Directories to clean up
const dirsToRemove = [
    'batch-workspace',
    'copilot-analysis'
];

let removedCount = 0;
let keptCount = 0;

// Remove files
filesToRemove.forEach(file => {
    if (fs.existsSync(file)) {
        try {
            fs.unlinkSync(file);
            console.log(`🗑️  Removed: ${file}`);
            removedCount++;
        } catch (error) {
            console.log(`❌ Failed to remove ${file}: ${error.message}`);
        }
    } else {
        console.log(`⚪ Not found: ${file}`);
        keptCount++;
    }
});

// Remove directories
dirsToRemove.forEach(dir => {
    if (fs.existsSync(dir)) {
        try {
            fs.rmSync(dir, { recursive: true, force: true });
            console.log(`🗑️  Removed directory: ${dir}`);
            removedCount++;
        } catch (error) {
            console.log(`❌ Failed to remove directory ${dir}: ${error.message}`);
        }
    } else {
        console.log(`⚪ Directory not found: ${dir}`);
    }
});

// Clean up temp directory but keep structure
const tempDir = './temp';
if (fs.existsSync(tempDir)) {
    const tempSubdirs = ['processed', 'tobeprocessed'];

    tempSubdirs.forEach(subdir => {
        const subdirPath = path.join(tempDir, subdir);
        if (fs.existsSync(subdirPath)) {
            const files = fs.readdirSync(subdirPath);
            files.forEach(file => {
                const filePath = path.join(subdirPath, file);
                if (fs.statSync(filePath).isFile()) {
                    fs.unlinkSync(filePath);
                    console.log(`🗑️  Cleaned temp file: ${file}`);
                    removedCount++;
                }
            });
        }
    });
}

console.log('\\n📊 CLEANUP SUMMARY:');
console.log(`🗑️  Removed: ${removedCount} files/directories`);
console.log(`📁 Repository cleaned and ready for v0.4.0`);
console.log('\\n✅ Next steps:');
console.log('1. Update VERSION.txt to v0.4.0');
console.log('2. Update session_starter.md with new features');
console.log('3. Update README.md with navigation changes');
console.log('4. Create release notes');
console.log('5. Commit and create PR');
