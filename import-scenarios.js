#!/usr/bin/env node

/**
 * Import Scenarios to DiagnosticIQ
 *
 * This script takes extracted scenarios from Copilot and imports them
 * into the DiagnosticIQ data structure.
 */

const fs = require('fs');
const path = require('path');

class ScenarioImporter {
    constructor() {
        this.baseDir = __dirname;
        this.dataDir = path.join(this.baseDir, 'data', 'scenarios');
        this.indexPath = path.join(this.dataDir, 'index.json');
    }

    async importScenarios(jsonFilePath) {
        console.log('🔄 IMPORTING SCENARIOS TO DIAGNOSTICIQ');
        console.log('=====================================');
        console.log(`📁 Reading: ${path.basename(jsonFilePath)}`);

        try {
            // Read extracted scenarios
            const scenarios = this.readScenariosFile(jsonFilePath);
            console.log(`✅ Found ${scenarios.length} scenarios to import`);

            // Import each scenario
            let imported = 0;
            for (const scenario of scenarios) {
                if (this.importScenario(scenario)) {
                    imported++;
                }
            }

            // Update index
            this.updateIndex();

            console.log(`✅ Successfully imported ${imported} scenarios`);
            console.log('✅ DiagnosticIQ data updated');
            console.log('\n🎉 Open index.html to see your new scenarios!');

            return { imported, total: scenarios.length };

        } catch (error) {
            console.error('❌ Import failed:', error.message);
            throw error;
        }
    }

    readScenariosFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const scenarios = JSON.parse(content);

        if (!Array.isArray(scenarios)) {
            throw new Error('Expected JSON array of scenarios');
        }

        return scenarios;
    }

    importScenario(scenario) {
        try {
            // Validate scenario
            if (!scenario.id || !scenario.title || !scenario.category) {
                console.warn(`⚠️ Skipping invalid scenario: ${scenario.title || 'Unknown'}`);
                return false;
            }

            // Create category directory
            const categoryDir = path.join(this.dataDir, scenario.category);
            if (!fs.existsSync(categoryDir)) {
                fs.mkdirSync(categoryDir, { recursive: true });
            }

            // Save scenario file
            const scenarioFile = path.join(categoryDir, `${scenario.id}.json`);
            fs.writeFileSync(scenarioFile, JSON.stringify(scenario, null, 2));

            console.log(`✅ Imported: ${scenario.title}`);
            return true;

        } catch (error) {
            console.error(`❌ Failed to import scenario ${scenario.id}:`, error.message);
            return false;
        }
    }

    updateIndex() {
        // Read current index
        let index = { categories: [] };
        if (fs.existsSync(this.indexPath)) {
            const existingIndex = JSON.parse(fs.readFileSync(this.indexPath, 'utf8'));
            // Preserve existing categories array structure if it exists
            if (existingIndex.categories && Array.isArray(existingIndex.categories)) {
                index = existingIndex;
            }
        }

        // Scan all scenario files and update index
        const categoryDirs = fs.readdirSync(this.dataDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        // Build categories array
        const updatedCategories = [];

        for (const categoryName of categoryDirs) {
            const categoryDir = path.join(this.dataDir, categoryName);
            const scenarioFiles = fs.readdirSync(categoryDir)
                .filter(file => file.endsWith('.json'));

            // Find existing category or create new one
            let category = index.categories.find(cat => cat.name === categoryName);
            if (!category) {
                category = {
                    name: categoryName,
                    displayName: this.getCategoryDisplayName(categoryName),
                    description: this.getCategoryDescription(categoryName),
                    scenarios: []
                };
            }

            // Update scenarios for this category
            category.scenarios = scenarioFiles.map(file => {
                const filePath = path.join(categoryDir, file);
                const scenario = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                return {
                    file: file,
                    title: scenario.title,
                    description: scenario.description,
                    queryCount: scenario.relatedKQL ? scenario.relatedKQL.length : 0
                };
            });

            updatedCategories.push(category);
        }

        index.categories = updatedCategories;

        // Save updated index
        fs.writeFileSync(this.indexPath, JSON.stringify(index, null, 2));
        console.log('✅ Index updated');
    }

    getCategoryDisplayName(categoryName) {
        const displayNames = {
            'authentication': 'Authentication',
            'synchronization': 'Synchronization',
            'provisioning': 'Provisioning',
            'general': 'General',
            'performance': 'Performance',
            'applications': 'Applications'
        };
        return displayNames[categoryName] || categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
    }

    getCategoryDescription(categoryName) {
        const descriptions = {
            'authentication': 'Authentication failures, MFA issues, and sign-in problems',
            'synchronization': 'Cross-tenant sync, directory sync, and related issues',
            'provisioning': 'User provisioning, group management, and lifecycle operations',
            'general': 'General Azure AD troubleshooting and diagnostics',
            'performance': 'Performance analysis, slow queries, and optimization',
            'applications': 'Application registration, integration, and access issues'
        };
        return descriptions[categoryName] || `${categoryName} related troubleshooting scenarios`;
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log('Usage: node import-scenarios.js <extracted-scenarios.json>');
        process.exit(1);
    }

    const importer = new ScenarioImporter();
    importer.importScenarios(args[0])
        .then(result => {
            console.log(`\n🎉 Import complete: ${result.imported}/${result.total} scenarios added!`);
        })
        .catch(error => {
            console.error('❌ Import failed:', error.message);
            process.exit(1);
        });
}

module.exports = ScenarioImporter;
