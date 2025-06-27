// Fix category inconsistencies in scenario files
const fs = require('fs').promises;
const path = require('path');

async function fixCategoryNames() {
    const basePath = './data/scenarios';

    // Category mapping: incorrect -> correct
    const categoryFixes = {
        'auth': 'authentication',
        'sync': 'synchronization'
    };

    async function processFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            let data;

            try {
                data = JSON.parse(content);
            } catch (e) {
                console.log(`Skipping non-JSON file: ${filePath}`);
                return;
            }

            let modified = false;

            // Handle array of scenarios
            if (Array.isArray(data)) {
                data.forEach(scenario => {
                    if (scenario.category && categoryFixes[scenario.category]) {
                        console.log(`Fixing ${filePath}: ${scenario.category} -> ${categoryFixes[scenario.category]}`);
                        scenario.category = categoryFixes[scenario.category];
                        modified = true;
                    }
                });
            }
            // Handle single scenario object
            else if (data.category && categoryFixes[data.category]) {
                console.log(`Fixing ${filePath}: ${data.category} -> ${categoryFixes[data.category]}`);
                data.category = categoryFixes[data.category];
                modified = true;
            }

            if (modified) {
                await fs.writeFile(filePath, JSON.stringify(data, null, 2));
                console.log(`✅ Updated ${filePath}`);
            }

        } catch (error) {
            console.error(`Error processing ${filePath}:`, error.message);
        }
    }

    async function processDirectory(dirPath) {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                await processDirectory(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'index.json') {
                await processFile(fullPath);
            }
        }
    }

    console.log('🔧 Fixing category names in scenario files...');
    await processDirectory(basePath);
    console.log('✅ Category fixes complete!');
}

// Run the fix
fixCategoryNames().catch(console.error);
