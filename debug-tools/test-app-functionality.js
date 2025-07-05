#!/usr/bin/env node

/**
 * DiagnostIQ App Test Script
 *
 * This script verifies that the app is loading scenarios correctly
 * and that the search and category filtering is working.
 */

const fs = require('fs');
const path = require('path');

class AppTester {
    constructor() {
        this.baseDir = __dirname;
        this.dataDir = path.join(this.baseDir, 'data', 'scenarios');
        this.indexPath = path.join(this.dataDir, 'index.json');
    }

    async testApp() {
        console.log('🧪 DIAGNOSTIQ APP FUNCTIONALITY TEST');
        console.log('====================================');

        try {
            // Test data loading
            await this.testDataLoading();

            // Test category structure
            await this.testCategoryStructure();

            // Test search functionality
            await this.testSearchFunctionality();

            // Test wiki links
            await this.testWikiLinks();

            console.log('\\n✅ All tests completed!');

        } catch (error) {
            console.error('❌ Test failed:', error.message);
        }
    }

    async testDataLoading() {
        console.log('\\n📊 TESTING DATA LOADING');
        console.log('=======================');

        // Check if index.json exists and is valid
        if (!fs.existsSync(this.indexPath)) {
            throw new Error('index.json not found');
        }

        const indexData = JSON.parse(fs.readFileSync(this.indexPath, 'utf8'));
        console.log(`✅ Index loaded: ${indexData.categories.length} categories`);

        // Check if categories have scenarios
        let totalScenarios = 0;
        let categoriesWithScenarios = 0;

        indexData.categories.forEach(category => {
            if (category.scenarios && category.scenarios.length > 0) {
                categoriesWithScenarios++;
                totalScenarios += category.scenarios.length;
            }
        });

        console.log(`✅ Categories with scenarios: ${categoriesWithScenarios}/${indexData.categories.length}`);
        console.log(`✅ Total scenarios indexed: ${totalScenarios}`);

        return { categories: indexData.categories.length, scenarios: totalScenarios };
    }

    async testCategoryStructure() {
        console.log('\\n📂 TESTING CATEGORY STRUCTURE');
        console.log('==============================');

        const indexData = JSON.parse(fs.readFileSync(this.indexPath, 'utf8'));

        // Check for remaining duplicate categories
        const categoryNames = indexData.categories.map(cat => cat.name.toLowerCase());
        const uniqueNames = [...new Set(categoryNames)];

        if (categoryNames.length !== uniqueNames.length) {
            console.log('⚠️ Found potential duplicate categories (case variations)');
            const duplicates = categoryNames.filter((name, index) => categoryNames.indexOf(name) !== index);
            console.log('🔍 Duplicates:', [...new Set(duplicates)]);
        } else {
            console.log('✅ No duplicate categories found');
        }

        // Check for consistent naming
        const inconsistentNames = indexData.categories.filter(cat => {
            const name = cat.name;
            // Check if it follows lowercase-with-hyphens convention
            const normalized = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
            return name !== normalized && !name.includes(' '); // Allow space-separated names for now
        });

        if (inconsistentNames.length > 0) {
            console.log(`⚠️ Found ${inconsistentNames.length} categories with inconsistent naming:`);
            inconsistentNames.forEach(cat => console.log(`  📂 ${cat.name}`));
        } else {
            console.log('✅ All category names follow consistent format');
        }

        return { duplicates: categoryNames.length - uniqueNames.length, inconsistent: inconsistentNames.length };
    }

    async testSearchFunctionality() {
        console.log('\\n🔍 TESTING SEARCH FUNCTIONALITY');
        console.log('===============================');

        const indexData = JSON.parse(fs.readFileSync(this.indexPath, 'utf8'));

        // Test sample searches
        const searchTerms = ['vpn', 'conditional access', 'authentication', 'b2c', 'error'];

        searchTerms.forEach(term => {
            let matchCount = 0;

            indexData.categories.forEach(category => {
                category.scenarios.forEach(scenario => {
                    const titleMatch = scenario.title.toLowerCase().includes(term.toLowerCase());
                    const descMatch = scenario.description.toLowerCase().includes(term.toLowerCase());
                    const categoryMatch = category.name.toLowerCase().includes(term.toLowerCase());

                    if (titleMatch || descMatch || categoryMatch) {
                        matchCount++;
                    }
                });
            });

            console.log(`  🔍 "${term}": ${matchCount} matches`);
        });

        // Test category filtering
        const categoriesWithScenarios = indexData.categories.filter(cat => cat.scenarios.length > 0);
        console.log(`✅ Categories available for filtering: ${categoriesWithScenarios.length}`);

        return { searchable: true };
    }

    async testWikiLinks() {
        console.log('\\n🔗 TESTING WIKI LINKS AND REFERENCES');
        console.log('=====================================');

        let wikiReferences = 0;
        let scenariosWithWiki = 0;

        const directories = fs.readdirSync(this.dataDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        directories.forEach(dir => {
            const dirPath = path.join(this.dataDir, dir);
            const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));

            files.forEach(file => {
                try {
                    const filePath = path.join(dirPath, file);
                    const content = fs.readFileSync(filePath, 'utf8');

                    // Check for wiki references
                    if (content.includes('wiki') || content.includes('Wiki')) {
                        scenariosWithWiki++;
                        const wikiMatches = (content.match(/wiki/gi) || []).length;
                        wikiReferences += wikiMatches;
                    }

                    // Check for markdown links
                    const markdownLinks = (content.match(/\\[.*?\\]\\(.*?\\)/g) || []).length;
                    if (markdownLinks > 0) {
                        // console.log(`  📎 ${dir}/${file}: ${markdownLinks} markdown links`);
                    }

                } catch (error) {
                    // Skip invalid files
                }
            });
        });

        console.log(`✅ Scenarios with wiki references: ${scenariosWithWiki}`);
        console.log(`✅ Total wiki references found: ${wikiReferences}`);

        if (wikiReferences > 0) {
            console.log('ℹ️ Wiki links are preserved in scenario metadata');
        }

        return { scenariosWithWiki, wikiReferences };
    }
}

// CLI usage
if (require.main === module) {
    const tester = new AppTester();
    tester.testApp()
        .then(() => {
            console.log('\\n🎉 App testing completed successfully!');
        })
        .catch(error => {
            console.error('❌ App testing failed:', error.message);
            process.exit(1);
        });
}

module.exports = AppTester;
