// DiagnosticIQ - Modular Data Manager
// Handles loading scenarios from multiple sources: core samples + modular scenario files

class DataManager {
    constructor() {
        this.allScenarios = [];
        this.loadingStatus = {
            core: false,
            scenarios: false,
            complete: false
        };
        this.scenarioSources = {
            core: '/data/core-samples.js',
            categories: [
                { name: 'authentication', files: ['token-issues.json'] },
                { name: 'synchronization', files: ['cross-tenant-sync.json'] },
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
                        this.allScenarios.push(...window.coreSamples);
                        this.loadingStatus.core = true;
                        console.log(`✅ Loaded ${window.coreSamples.length} core scenarios`);
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
            
            const scenarios = await response.json();
            
            // Validate scenario structure
            const validScenarios = scenarios.filter(scenario => this.validateScenario(scenario));
            
            if (validScenarios.length > 0) {
                this.allScenarios.push(...validScenarios);
                console.log(`✅ Loaded ${validScenarios.length} scenarios from ${filePath}`);
            }
            
            return validScenarios;
        } catch (error) {
            console.warn(`⚠️ Failed to load ${filePath}:`, error.message);
            return [];
        }
    }

    validateScenario(scenario) {
        // Basic validation to ensure scenario has required fields
        const required = ['id', 'title', 'category', 'description', 'queries'];
        return required.every(field => scenario.hasOwnProperty(field)) && 
               Array.isArray(scenario.queries) && 
               scenario.queries.length > 0;
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

    // Utility methods for the app
    getScenariosByCategory(category) {
        return this.allScenarios.filter(scenario => scenario.category === category);
    }

    getScenarioById(id) {
        return this.allScenarios.find(scenario => scenario.id === id);
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
            this.allScenarios.splice(index, 1);
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
