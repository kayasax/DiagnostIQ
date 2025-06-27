// DiagnosticIQ - Modular Data Manager
// Handles loading scenarios from multiple sources: core samples + modular scenario files

class DataManager {
    constructor() {
        this.allScenarios = [];
        this.categoriesIndex = null;
        this.deletedScenarios = JSON.parse(localStorage.getItem('deletedScenarios')) || [];
        this.loadingStatus = {
            core: false,
            scenarios: false,
            complete: false
        };
        this.scenarioSources = {
            core: '/data/core-samples.js',
            categories: [
                { name: 'authentication', files: ['token-issues.json'] },
                { name: 'synchronization', files: ['cross-tenant-sync.json', 'cross-tenant-sync-troubleshooting.json'] },
                { name: 'provisioning', files: ['user-provisioning.json'] },
                { name: 'performance', files: ['slow-signins.json'] },
                { name: 'applications', files: ['integration-issues.json'] }
            ]
        };
    }

    async loadAllScenarios() {
        try {
            console.log('🔄 Loading DiagnosticIQ scenarios...');

            // Load core samples first
            await this.loadCoreSamples();

            // Load modular scenarios
            await this.loadModularScenarios();

            this.loadingStatus.complete = true;
            console.log(`✅ Loaded ${this.allScenarios.length} scenarios successfully`);

            // Update the global variable for backward compatibility
            window.cheatSheets = this.allScenarios;

            // Trigger app initialization if needed
            if (window.initializeApp) {
                window.initializeApp();
            }

            return this.allScenarios;
        } catch (error) {
            console.error('❌ Error loading scenarios:', error);
            // Fallback to basic scenarios if loading fails
            this.loadFallbackScenarios();
            throw error;
        }
    }

    async loadCoreSamples() {
        try {
            // Core samples are still in JS format for quick loading
            const script = document.createElement('script');
            script.src = 'data/core-samples.js';

            return new Promise((resolve, reject) => {
                script.onload = () => {
                    if (window.coreSamples) {
                        // Filter out deleted scenarios from core samples too
                        const filteredCoreSamples = window.coreSamples.filter(scenario =>
                            !this.deletedScenarios.includes(scenario.id)
                        );
                        this.allScenarios.push(...filteredCoreSamples);
                        this.loadingStatus.core = true;
                        console.log(`✅ Loaded ${filteredCoreSamples.length} core scenarios`);

                        const filteredCount = window.coreSamples.length - filteredCoreSamples.length;
                        if (filteredCount > 0) {
                            console.log(`🗑️ Filtered out ${filteredCount} deleted core scenarios`);
                        }
                        resolve();
                    } else {
                        reject(new Error('Core samples not found'));
                    }
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });
        } catch (error) {
            console.warn('⚠️ Failed to load core samples:', error);
        }
    }

    async loadModularScenarios() {
        // Try to load from index.json first
        const indexLoaded = await this.loadScenariosFromIndex();

        const loadPromises = [];

        for (const category of this.scenarioSources.categories) {
            for (const file of category.files) {
                const filePath = `data/scenarios/${category.name}/${file}`;
                loadPromises.push(this.loadScenarioFile(filePath, category.name));
            }
        }

        await Promise.allSettled(loadPromises);
        this.loadingStatus.scenarios = true;
    }

    async loadScenarioFile(filePath, categoryName) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Handle both array of scenarios and single scenario objects
            let scenarios;
            if (Array.isArray(data)) {
                scenarios = data;
            } else if (data && typeof data === 'object') {
                // Single scenario object
                scenarios = [data];
            } else {
                throw new Error('Invalid JSON format - expected array or object');
            }

            // Validate scenario structure and filter out deleted scenarios
            const validScenarios = scenarios
                .filter(scenario => this.validateScenario(scenario))
                .filter(scenario => !this.deletedScenarios.includes(scenario.id));

            if (validScenarios.length > 0) {
                this.allScenarios.push(...validScenarios);
                console.log(`✅ Loaded ${validScenarios.length} scenarios from ${filePath}`);
            }

            // Log filtered scenarios
            const filteredCount = scenarios.length - validScenarios.length;
            if (filteredCount > 0) {
                console.log(`🗑️ Filtered out ${filteredCount} scenarios (invalid or deleted)`);
            }

            return validScenarios;
        } catch (error) {
            console.warn(`⚠️ Failed to load ${filePath}:`, error.message);
            return [];
        }
    }

    validateScenario(scenario) {
        // Basic validation to ensure scenario has required fields
        const required = ['id', 'title', 'category', 'description'];
        const hasRequiredFields = required.every(field => scenario.hasOwnProperty(field));

        // Must have either queries or steps to be useful
        const hasQueries = Array.isArray(scenario.queries) && scenario.queries.length > 0;
        const hasSteps = Array.isArray(scenario.steps) && scenario.steps.length > 0;
        const hasUsefulContent = hasQueries || hasSteps;

        return hasRequiredFields && hasUsefulContent;
    }

    loadFallbackScenarios() {
        // Minimal fallback scenarios if all loading fails
        console.log('🔄 Loading fallback scenarios...');
        this.allScenarios = [
            {
                id: 'fallback-1',
                title: 'Basic Authentication Check',
                category: 'auth',
                cluster: 'prod',
                description: 'Basic authentication troubleshooting when main scenarios fail to load.',
                queries: [{
                    name: 'Recent Sign-in Failures',
                    description: 'Basic sign-in failure query',
                    query: 'SigninLogs\\n| where TimeGenerated > ago(1h)\\n| where ResultType != "0"\\n| take 10'
                }],
                steps: ['Check recent failures', 'Review error patterns'],
                tags: ['basic', 'fallback']
            }
        ];
        window.cheatSheets = this.allScenarios;
    }

    /**
     * Load scenario files dynamically from index.json
     */
    async loadScenariosFromIndex() {
        try {
            const response = await fetch('data/scenarios/index.json');
            if (!response.ok) {
                console.warn('⚠️ index.json not found, falling back to hardcoded file list');
                return false;
            }

            const index = await response.json();

            // Store the categories information for dropdown population
            if (index.categories && Array.isArray(index.categories)) {
                this.categoriesIndex = index.categories;
                console.log(`📂 Found ${index.categories.length} categories in index.json`);
            }

            // Clear existing category files and rebuild from index
            const discoveredCategories = [];

            // Handle new categories array format first
            if (index.categories && Array.isArray(index.categories)) {
                for (const category of index.categories) {
                    if (category.scenarios && Array.isArray(category.scenarios)) {
                        const files = category.scenarios.map(scenario => scenario.file);
                        discoveredCategories.push({
                            name: category.name,
                            files: files
                        });
                    }
                }
            } else {
                // Fallback to old format
                for (const [categoryName, data] of Object.entries(index)) {
                    if (['version', 'lastUpdated', 'categories', 'totalScenarios', 'totalQueries'].includes(categoryName)) continue;

                    let files = [];

                    // Handle different index formats
                    if (Array.isArray(data)) {
                        // Format: categoryName: [{id, file, ...}, ...]
                        files = data.map(scenario => scenario.file || `${scenario.id}.json`);
                    } else if (data && data.scenarios && Array.isArray(data.scenarios)) {
                        // Format: categoryName: {scenarios: [{file, ...}, ...]}
                        files = data.scenarios.map(scenario => scenario.file);
                    }

                    if (files.length > 0) {
                        discoveredCategories.push({
                            name: categoryName,
                            files: files
                        });
                    }
                }
            }

            if (discoveredCategories.length > 0) {
                this.scenarioSources.categories = discoveredCategories;
                console.log(`🔍 Discovered ${discoveredCategories.length} categories from index.json`);
                return true;
            }

        } catch (error) {
            console.warn('⚠️ Failed to load index.json:', error.message);
        }

        return false;
    }

    // Utility methods for the app
    getScenariosByCategory(category) {
        return this.allScenarios.filter(scenario => scenario.category === category);
    }

    getScenarioById(id) {
        return this.allScenarios.find(scenario => scenario.id === id);
    }

    getAvailableCategories() {
        console.log('🔍 Getting available categories...');
        console.log('📂 Categories index:', this.categoriesIndex);

        // Return categories from index.json if available
        if (this.categoriesIndex && Array.isArray(this.categoriesIndex)) {
            const result = this.categoriesIndex.map(cat => ({
                value: cat.name,
                label: cat.displayName || this.capitalizeFirst(cat.name),
                description: cat.description || '',
                count: cat.scenarios ? cat.scenarios.length : 0
            }));
            console.log('✅ Returning categories from index:', result);
            return result;
        }

        console.log('⚠️ No categories index, extracting from scenarios...');
        console.log('📊 All scenarios count:', this.allScenarios.length);

        // Fallback: Extract unique categories from loaded scenarios
        const categorySet = new Set();
        const categoryData = {};

        this.allScenarios.forEach(scenario => {
            console.log(`📋 Scenario: "${scenario.title}" - Category: "${scenario.category}"`);
            if (scenario.category) {
                categorySet.add(scenario.category);
                if (!categoryData[scenario.category]) {
                    categoryData[scenario.category] = { count: 0 };
                }
                categoryData[scenario.category].count++;
            }
        });

        console.log('🏷️ Unique categories found:', Array.from(categorySet));
        console.log('📊 Category counts:', categoryData);

        const result = Array.from(categorySet).map(category => ({
            value: category,
            label: this.capitalizeFirst(category),
            description: `${categoryData[category].count} scenarios`,
            count: categoryData[category].count
        })).sort((a, b) => a.label.localeCompare(b.label));

        console.log('✅ Final categories result:', result);
        return result;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    addCustomScenario(scenario) {
        // Ensure unique ID for custom scenarios
        scenario.id = `custom-${Date.now()}`;
        scenario.isCustom = true;
        this.allScenarios.push(scenario);

        // Update global variable
        window.cheatSheets = this.allScenarios;

        return scenario;
    }

    removeScenario(id) {
        const index = this.allScenarios.findIndex(scenario => scenario.id === id);
        if (index !== -1) {
            const scenario = this.allScenarios[index];

            // Check if it's a custom scenario (has custom tag or isCustom flag)
            const isCustom = (scenario.tags && scenario.tags.includes('custom')) || scenario.isCustom;

            if (isCustom) {
                // For custom scenarios, remove from memory
                this.allScenarios.splice(index, 1);
                console.log(`🗑️ Removed custom scenario: ${scenario.title}`);
            } else {
                // For extracted scenarios, add to deleted list and remove from memory
                if (!this.deletedScenarios.includes(id)) {
                    this.deletedScenarios.push(id);
                    localStorage.setItem('deletedScenarios', JSON.stringify(this.deletedScenarios));
                    console.log(`🗑️ Marked extracted scenario as deleted: ${scenario.title}`);
                }
                this.allScenarios.splice(index, 1);
            }

            window.cheatSheets = this.allScenarios;
            return true;
        }
        return false;
    }

    updateScenario(id, updatedScenario) {
        const index = this.allScenarios.findIndex(scenario => scenario.id === id);
        if (index !== -1) {
            this.allScenarios[index] = { ...updatedScenario, id };
            window.cheatSheets = this.allScenarios;
            return true;
        }
        return false;
    }

    exportScenarios(customOnly = false) {
        const scenariosToExport = customOnly
            ? this.allScenarios.filter(s => s.isCustom)
            : this.allScenarios;

        return {
            exportedAt: new Date().toISOString(),
            source: 'DiagnosticIQ',
            version: '1.0',
            scenarios: scenariosToExport
        };
    }

    importScenarios(importData) {
        if (!importData.scenarios || !Array.isArray(importData.scenarios)) {
            throw new Error('Invalid import data format');
        }

        const validScenarios = importData.scenarios.filter(scenario => this.validateScenario(scenario));

        // Mark as custom and ensure unique IDs
        validScenarios.forEach(scenario => {
            scenario.id = `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            scenario.isCustom = true;
        });

        this.allScenarios.push(...validScenarios);
        window.cheatSheets = this.allScenarios;

        return validScenarios.length;
    }

    // Methods to manage deleted scenarios
    getDeletedScenarios() {
        return [...this.deletedScenarios];
    }

    restoreScenario(id) {
        const deletedIndex = this.deletedScenarios.indexOf(id);
        if (deletedIndex !== -1) {
            this.deletedScenarios.splice(deletedIndex, 1);
            localStorage.setItem('deletedScenarios', JSON.stringify(this.deletedScenarios));

            // Reload scenarios to include the restored one
            this.reloadAllScenarios();

            console.log(`🔄 Restored scenario: ${id}`);
            return true;
        }
        return false;
    }

    clearDeletedScenarios() {
        this.deletedScenarios = [];
        localStorage.removeItem('deletedScenarios');

        // Reload scenarios to include all previously deleted ones
        this.reloadAllScenarios();

        console.log('🔄 Cleared all deleted scenarios - all scenarios restored');
    }

    async reloadAllScenarios() {
        // Clear current scenarios and reload everything
        this.allScenarios = [];
        this.loadingStatus.core = false;
        this.loadingStatus.scenarios = false;
        this.loadingStatus.complete = false;

        await this.loadAllScenarios();
    }

    getLoadingStatus() {
        return this.loadingStatus;
    }

    getTotalScenarioCount() {
        return this.allScenarios.length;
    }

    getStatistics() {
        const stats = {
            total: this.allScenarios.length,
            byCategory: {},
            byCluster: {},
            customCount: this.allScenarios.filter(s => s.isCustom).length
        };

        this.allScenarios.forEach(scenario => {
            // Count by category
            stats.byCategory[scenario.category] = (stats.byCategory[scenario.category] || 0) + 1;

            // Count by cluster
            if (scenario.cluster) {
                stats.byCluster[scenario.cluster] = (stats.byCluster[scenario.cluster] || 0) + 1;
            }
        });

        return stats;
    }
}

// Create global instance
window.dataManager = new DataManager();

// Auto-load scenarios when script loads
document.addEventListener('DOMContentLoaded', () => {
    window.dataManager.loadAllScenarios().catch(error => {
        console.error('Failed to load scenarios:', error);
    });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}
