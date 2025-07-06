// DiagnostIQ - Optimized Data Manager v0.6.13-DEBUG
// TRUE LAZY LOADING: Only placeholders created at startup, full content loaded on demand

console.log('🚀 DATA-MANAGER-OPTIMIZED v0.6.13-DEBUG LOADED');

class DataManager {
    constructor() {
        console.log('🔧 DataManager constructor called - OPTIMIZED version with lazy loading');
        this.allScenarios = [];
        this.categoriesIndex = null;
        this.scenarioSources = { categories: [] };
        this.deletedScenarios = JSON.parse(localStorage.getItem('deletedScenarios')) || [];
        this.isLoaded = false;
        this.isLoading = false;
    }

    async loadAllScenarios() {
        // Prevent multiple simultaneous loads
        if (this.isLoading) {
            console.log('⏳ Data loading already in progress...');
            return this.allScenarios;
        }

        if (this.isLoaded) {
            console.log('✅ Data already loaded, returning cached scenarios');
            return this.allScenarios;
        }

        this.isLoading = true;

        try {
            console.log('🔄 Loading DiagnostIQ scenarios...');

            // Try to load from localStorage first
            if (this.loadFromLocalStorage()) {
                console.log('✅ Loaded scenarios from localStorage');
            } else {
                console.log('🔄 No localStorage data, loading from files...');
                // Load from files and save to localStorage
                await this.loadModularScenarios();
                this.saveToLocalStorage();
                console.log('✅ Scenarios loaded from files and saved to localStorage');
            }

            this.isLoaded = true;
            this.isLoading = false;

            console.log(`✅ Loaded ${this.allScenarios.length} scenarios successfully`);

            // Update the global variable for backward compatibility
            window.cheatSheets = this.allScenarios;

            return this.allScenarios;
        } catch (error) {
            console.error('❌ Error loading scenarios:', error);
            this.isLoading = false;
            throw error;
        }
    }

    async loadModularScenarios() {
        console.log('🎯 DEBUG: loadModularScenarios called - this should only create placeholders');

        // TRUE LAZY LOADING: Load only index metadata, not actual scenario files
        await this.loadScenariosFromIndex();

        if (this.scenarioSources.categories.length === 0) {
            console.warn('⚠️ No categories found in index, falling back to discovery');
            await this.discoverScenarios();
        }

        console.log(`🎯 DEBUG: About to create placeholders for ${this.scenarioSources.categories.length} categories`);

        // Create placeholder scenarios with just metadata (no HTTP requests for content)
        this.allScenarios = [];
        for (const category of this.scenarioSources.categories) {
            console.log(`🎯 DEBUG: Processing category ${category.name} with ${category.scenarios?.length || 0} scenarios`);
            for (const scenarioMeta of category.scenarios || []) {
                // Create lightweight placeholder with just metadata
                const placeholder = {
                    id: scenarioMeta.file.replace('.json', ''),
                    title: scenarioMeta.title,
                    description: scenarioMeta.description,
                    category: category.name,
                    vertical: this.getCategoryVertical(category.name),
                    queryCount: scenarioMeta.queryCount || 0,
                    tags: [], // Will be loaded on demand
                    isLoaded: false, // Flag to track if full content is loaded
                    filePath: `data/scenarios/${category.name}/${scenarioMeta.file}`
                };
                this.allScenarios.push(placeholder);
            }
        }

        console.log(`📄 Created ${this.allScenarios.length} scenario placeholders (lazy loading enabled)`);
        console.log('🎯 DEBUG: loadModularScenarios completed - NO files should have been loaded');
    }

    async loadScenariosFromIndex() {
        try {
            const response = await fetch('data/scenarios/index.json');
            if (!response.ok) {
                throw new Error(`Failed to load index: ${response.status}`);
            }

            const indexData = await response.json();
            this.categoriesIndex = indexData.categories || [];

            // Keep the original categories structure for lazy loading
            this.scenarioSources = {
                categories: this.categoriesIndex
            };

            console.log(`📂 Found ${this.categoriesIndex.length} categories in index.json`);
            const totalScenarios = this.categoriesIndex.reduce((total, cat) => total + (cat.scenarios?.length || 0), 0);
            console.log(`📄 Total scenarios available: ${totalScenarios} (lazy loading)`);
            return true;
        } catch (error) {
            console.warn('⚠️ Could not load scenarios index:', error);
            this.scenarioSources = { categories: [] };
            return false;
        }
    }

    async discoverScenarios() {
        try {
            // Fallback discovery - simplified version
            const knownCategories = [
                'authentication', 'conditional-access', 'synchronization',
                'azure-ad-application-management', 'domain-services'
            ];

            this.scenarioSources.categories = [];

            for (const categoryName of knownCategories) {
                try {
                    // Try to load a sample file to see if category exists
                    const testResponse = await fetch(`data/scenarios/${categoryName}/`);
                    if (testResponse.ok) {
                        // Add basic category info
                        this.scenarioSources.categories.push({
                            name: categoryName,
                            files: [] // Will be populated during actual loading
                        });
                    }
                } catch (e) {
                    // Category doesn't exist, skip
                }
            }
        } catch (error) {
            console.warn('⚠️ Scenario discovery failed:', error);
        }
    }

    async loadScenarioFile(filePath, categoryName) {
        console.error('🚨 CRITICAL: loadScenarioFile called during lazy loading! This should NOT happen at startup!');
        console.error('🚨 File path:', filePath, 'Category:', categoryName);
        console.error('🚨 Stack trace:', new Error().stack);

        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            let scenarios = Array.isArray(data) ? data : [data];

            // Filter out deleted scenarios
            scenarios = scenarios.filter(scenario => {
                if (!scenario || !scenario.id) return false;
                if (this.deletedScenarios.includes(scenario.id)) return false;
                return this.validateScenario(scenario);
            });

            // Set category for each scenario
            scenarios.forEach(scenario => {
                scenario.category = categoryName;
            });

            this.allScenarios.push(...scenarios);

            if (scenarios.length > 0) {
                console.log(`✅ Loaded ${scenarios.length} scenarios from ${filePath} (category: ${categoryName})`);
            }

            return scenarios;
        } catch (error) {
            console.warn(`⚠️ Failed to load ${filePath}:`, error.message);
            return [];
        }
    }

    validateScenario(scenario) {
        // Basic validation - scenario must have some content
        if (!scenario.id || !scenario.title) {
            return false;
        }

        // Check for useful content
        const hasContent = scenario.queries?.length > 0 ||
                          scenario.kqlQueries?.length > 0 ||
                          scenario.steps?.length > 0 ||
                          scenario.troubleshootingSteps?.length > 0 ||
                          scenario.description?.length > 0;

        if (!hasContent) {
            console.log(`⚠️ Scenario ${scenario.id} has no useful content (queries, kqlQueries, steps, or troubleshootingSteps)`);
            return false;
        }

        return true;
    }

    getAvailableCategories() {
        console.log('🔍 Getting available categories...');

        if (this.categoriesIndex && this.categoriesIndex.length > 0) {
            console.log(`📂 Categories index: (${this.categoriesIndex.length})`, this.categoriesIndex);
            // Return categories with actual scenario counts from loaded data
            const categoryMap = new Map();
            this.allScenarios.forEach(scenario => {
                if (scenario.category) {
                    if (!categoryMap.has(scenario.category)) {
                        categoryMap.set(scenario.category, 0);
                    }
                    categoryMap.set(scenario.category, categoryMap.get(scenario.category) + 1);
                }
            });

            const categoriesWithCounts = this.categoriesIndex.map(cat => ({
                name: cat.name,
                displayName: this.formatCategoryName(cat.name),
                count: categoryMap.get(cat.name) || 0,
                vertical: this.getCategoryVertical(cat.name)
            }));

            console.log(`✅ Returning categories from index with actual counts: (${categoriesWithCounts.length})`, categoriesWithCounts);
            return categoriesWithCounts;
        }

        // Fallback: generate from loaded scenarios
        const categoryMap = new Map();
        this.allScenarios.forEach(scenario => {
            if (scenario.category) {
                if (!categoryMap.has(scenario.category)) {
                    categoryMap.set(scenario.category, {
                        name: scenario.category,
                        displayName: this.formatCategoryName(scenario.category),
                        count: 0,
                        vertical: this.getCategoryVertical(scenario.category)
                    });
                }
                categoryMap.get(scenario.category).count++;
            }
        });

        const categories = Array.from(categoryMap.values());
        console.log(`✅ Generated categories from scenarios: (${categories.length})`, categories);
        return categories;
    }

    formatCategoryName(name) {
        return name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    getCategoryVertical(categoryName) {
        const verticalMap = {
            'authentication': 'authentication',
            'conditional-access': 'authentication',
            'mfa': 'authentication',
            'synchronization': 'synchronization',
            'azure-ad-application-management': 'applications',
            'domain-services': 'domain-services',
            'b2b': 'collaboration',
            'b2c': 'collaboration'
        };

        return verticalMap[categoryName] || 'general';
    }

    getScenariosByCategory(categoryName) {
        return this.allScenarios.filter(scenario => scenario.category === categoryName);
    }

    getAllScenarios() {
        return this.allScenarios;
    }

    getScenarioById(id) {
        return this.allScenarios.find(scenario => scenario.id === id);
    }

    // Lazy loading: Load full scenario content on demand
    async loadFullScenario(scenario) {
        if (scenario.isLoaded) {
            return scenario; // Already loaded
        }

        try {
            console.log(`📄 Loading full content for: ${scenario.title}`);
            const response = await fetch(scenario.filePath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const fullScenario = Array.isArray(data) ? data[0] : data;

            // Merge full content with placeholder
            Object.assign(scenario, {
                ...fullScenario,
                isLoaded: true,
                // Preserve metadata from index
                title: scenario.title,
                description: scenario.description,
                category: scenario.category,
                vertical: scenario.vertical,
                filePath: scenario.filePath
            });

            // Filter out deleted scenarios
            if (this.deletedScenarios.includes(scenario.id)) {
                console.log(`⚠️ Scenario ${scenario.id} is marked as deleted`);
                return null;
            }

            return scenario;
        } catch (error) {
            console.warn(`⚠️ Failed to load scenario ${scenario.title}:`, error.message);
            return null;
        }
    }

    // Load multiple scenarios on demand (for search results, etc.)
    async loadMultipleScenarios(scenarios) {
        const loadPromises = scenarios
            .filter(s => !s.isLoaded)
            .map(s => this.loadFullScenario(s));

        await Promise.allSettled(loadPromises);
        return scenarios;
    }

    // Cleanup method to prevent memory leaks
    dispose() {
        this.allScenarios = [];
        this.categoriesIndex = null;
        this.isLoaded = false;
        this.isLoading = false;
    }

    // LocalStorage management methods
    loadFromLocalStorage() {
        try {
            const storedData = localStorage.getItem('diagnostiq_scenarios');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                if (parsedData && Array.isArray(parsedData) && parsedData.length > 0) {
                    this.allScenarios = parsedData;
                    console.log(`📦 Loaded ${parsedData.length} scenarios from localStorage`);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('❌ Error loading from localStorage:', error);
            return false;
        }
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('diagnostiq_scenarios', JSON.stringify(this.allScenarios));
            localStorage.setItem('diagnostiq_last_refresh', Date.now().toString());
            console.log(`💾 Saved ${this.allScenarios.length} scenarios to localStorage with timestamp`);
            return true;
        } catch (error) {
            console.error('❌ Error saving to localStorage:', error);
            return false;
        }
    }

    // Update a scenario and persist to localStorage
    updateScenario(scenarioData) {
        const index = this.allScenarios.findIndex(s => s.id === scenarioData.id);
        if (index !== -1) {
            this.allScenarios[index] = { ...this.allScenarios[index], ...scenarioData };
            this.saveToLocalStorage();
            console.log(`✅ Updated scenario "${scenarioData.title}" in localStorage`);
            return true;
        } else {
            console.error('❌ Scenario not found for update:', scenarioData.id);
            return false;
        }
    }

    // Add a new scenario and persist to localStorage
    addScenario(scenarioData) {
        // Ensure the scenario has required fields
        const newScenario = {
            isLoaded: true,
            queryCount: (scenarioData.kqlQueries || []).length,
            ...scenarioData
        };

        this.allScenarios.push(newScenario);
        this.saveToLocalStorage();
        console.log(`✅ Added new scenario "${scenarioData.title}" to localStorage`);
        return true;
    }

    // Delete a scenario and persist to localStorage
    deleteScenario(scenarioId) {
        const index = this.allScenarios.findIndex(s => s.id === scenarioId);
        if (index !== -1) {
            const deleted = this.allScenarios.splice(index, 1)[0];
            this.saveToLocalStorage();
            console.log(`✅ Deleted scenario "${deleted.title}" from localStorage`);
            return true;
        } else {
            console.error('❌ Scenario not found for deletion:', scenarioId);
            return false;
        }
    }

    // Clear all data and reload from files
    resetToFiles() {
        localStorage.removeItem('diagnostiq_scenarios');
        console.log('🗑️ Cleared localStorage, will reload from files');
        return this.loadScenarios(); // Reload from files
    }

    // Admin function to detect new scenarios in files vs localStorage
    async detectNewScenarios() {
        try {
            console.log('🔍 Detecting new scenarios in files...');

            // Get current localStorage scenarios
            const localScenarios = this.allScenarios || [];
            const localIds = new Set(localScenarios.map(s => s.id));

            console.log(`📦 LocalStorage has ${localScenarios.length} scenarios`);

            // Load fresh data from files (without affecting current data)
            const fileScenarios = await this.loadScenariosFromFiles();
            const fileIds = new Set(fileScenarios.map(s => s.id));

            console.log(`📁 Files have ${fileScenarios.length} scenarios`);

            // Find differences
            const newInFiles = fileScenarios.filter(s => !localIds.has(s.id));
            const removedFromFiles = localScenarios.filter(s => !fileIds.has(s.id));
            const existingInBoth = fileScenarios.filter(s => localIds.has(s.id));

            const analysis = {
                newInFiles: newInFiles,
                removedFromFiles: removedFromFiles,
                existingInBoth: existingInBoth,
                summary: {
                    localStorageCount: localScenarios.length,
                    filesCount: fileScenarios.length,
                    newScenariosCount: newInFiles.length,
                    removedScenariosCount: removedFromFiles.length,
                    commonScenariosCount: existingInBoth.length
                }
            };

            console.log('📊 Scenario Analysis:', analysis.summary);

            if (newInFiles.length > 0) {
                console.log('🆕 New scenarios found:', newInFiles.map(s => s.title));
            }

            if (removedFromFiles.length > 0) {
                console.log('🗑️ Scenarios in localStorage but not in files:', removedFromFiles.map(s => s.title));
            }

            return analysis;

        } catch (error) {
            console.error('❌ Error detecting new scenarios:', error);
            throw error;
        }
    }

    // Import specific new scenarios from files
    async importNewScenarios(scenarioIds) {
        try {
            console.log('📥 Importing new scenarios:', scenarioIds);

            const analysis = await this.detectNewScenarios();
            const newScenarios = analysis.newInFiles.filter(s => scenarioIds.includes(s.id));

            if (newScenarios.length === 0) {
                console.log('ℹ️ No matching new scenarios to import');
                return { imported: 0, scenarios: [] };
            }

            // Add new scenarios to current data
            this.allScenarios.push(...newScenarios);

            // Save to localStorage
            this.saveToLocalStorage();

            console.log(`✅ Imported ${newScenarios.length} new scenarios`);

            return {
                imported: newScenarios.length,
                scenarios: newScenarios
            };

        } catch (error) {
            console.error('❌ Error importing new scenarios:', error);
            throw error;
        }
    }

    // Import ALL new scenarios from files
    async importAllNewScenarios() {
        try {
            const analysis = await this.detectNewScenarios();

            if (analysis.newInFiles.length === 0) {
                console.log('ℹ️ No new scenarios to import');
                return { imported: 0, scenarios: [] };
            }

            const newIds = analysis.newInFiles.map(s => s.id);
            return await this.importNewScenarios(newIds);

        } catch (error) {
            console.error('❌ Error importing all new scenarios:', error);
            throw error;
        }
    }

    // Helper method to load scenarios from files without affecting current data
    async loadScenariosFromFiles() {
        try {
            // Load index.json to get file structure
            const indexResponse = await fetch('data/scenarios/index.json');
            if (!indexResponse.ok) {
                throw new Error(`Failed to load index.json: ${indexResponse.status}`);
            }

            const indexData = await indexResponse.json();
            console.log(`📂 Found ${indexData.categories?.length || 0} categories in index.json`);

            const allFileScenarios = [];

            // Process each category (index.json uses array format, not object)
            for (const categoryData of indexData.categories || []) {
                const categoryName = categoryData.name;
                console.log(`🎯 Loading category: ${categoryName} (${categoryData.scenarios?.length || 0} scenarios)`);

                for (const scenarioInfo of categoryData.scenarios || []) {
                    try {
                        // Create scenario from index info
                        const scenario = {
                            id: scenarioInfo.id,
                            title: scenarioInfo.title,
                            description: scenarioInfo.description || '',
                            category: categoryName,
                            vertical: scenarioInfo.vertical || 'general',
                            tags: scenarioInfo.tags || [],
                            queryCount: scenarioInfo.queryCount || 0,
                            file: scenarioInfo.file,
                            isLoaded: false // Mark as placeholder initially
                        };

                        allFileScenarios.push(scenario);
                    } catch (scenarioError) {
                        console.warn(`⚠️ Error processing scenario ${scenarioInfo.id}:`, scenarioError);
                    }
                }
            }

            console.log(`📄 Loaded ${allFileScenarios.length} scenario placeholders from files`);
            return allFileScenarios;

        } catch (error) {
            console.error('❌ Error loading scenarios from files:', error);
            throw error;
        }
    }

    // ===== ADMIN SCENARIO COMPARISON METHODS =====

    /**
     * Check for new scenarios by comparing localStorage with files
     */
    async checkForNewScenarios() {
        try {
            console.log('🔍 Checking for new scenarios...');

            // Get current scenarios from localStorage
            const localScenarios = this.getAllScenarios();
            console.log(`📦 Local scenarios count: ${localScenarios.length}`);

            // Check if this is a first load scenario
            const localStorageData = localStorage.getItem('diagnostiq_scenarios');
            const lastRefreshData = localStorage.getItem('diagnostiq_last_refresh');
            const isFirstLoad = !localStorageData;

            if (isFirstLoad) {
                console.log('🚀 First load detected - importing all scenarios to localStorage');

                // This is first load, save current scenarios to localStorage
                this.saveToLocalStorage();

                if (window.app && typeof window.app.showNotification === 'function') {
                    window.app.showNotification(`✅ Imported ${localScenarios.length} scenarios to localStorage on first load!`, 'success');
                }
                return;
            }

            // Check if we should force refresh (user can set flag or if data is old)
            const shouldForceRefresh = localStorage.getItem('diagnostiq_force_refresh') === 'true';
            const lastRefreshTime = lastRefreshData ? parseInt(lastRefreshData) : 0;
            const daysSinceRefresh = (Date.now() - lastRefreshTime) / (1000 * 60 * 60 * 24);

            if (shouldForceRefresh || daysSinceRefresh > 7) {
                console.log('🔄 Force refresh requested or data is old - refreshing from files');
                localStorage.removeItem('diagnostiq_force_refresh'); // Clear flag

                await this.refreshFromFiles();

                if (window.app && typeof window.app.showNotification === 'function') {
                    window.app.showNotification(`✅ Force refreshed ${this.allScenarios.length} scenarios from files!`, 'success');
                }
                return;
            }

            // Check if the localStorage data is just the initial placeholder data
            // by comparing counts and checking if scenarios have been modified
            const storedScenarios = JSON.parse(localStorageData);
            const hasUserModifications = this.hasUserModifications(storedScenarios);

            if (!hasUserModifications) {
                console.log('📋 No user modifications detected - treating as fresh import');

                // Reload fresh data and save to localStorage
                await this.refreshFromFiles();

                if (window.app && typeof window.app.showNotification === 'function') {
                    window.app.showNotification(`✅ Refreshed ${this.allScenarios.length} scenarios from files!`, 'success');
                }
                return;
            }

            // User has modifications, do actual comparison
            console.log('🔄 User modifications detected - performing comparison...');
            await this.performScenarioComparison();

        } catch (error) {
            console.error('❌ Error checking for new scenarios:', error);
            if (window.app && typeof window.app.showNotification === 'function') {
                window.app.showNotification('❌ Error checking for new scenarios: ' + error.message, 'error');
            }
        }
    }

    /**
     * Check if localStorage scenarios have user modifications
     */
    hasUserModifications(scenarios) {
        console.log('🔍 Checking for user modifications in', scenarios.length, 'scenarios...');

        // Track reasons for modification detection
        const modificationReasons = [];

        // Check for signs of user modifications:
        // 1. Custom scenarios with generated IDs (contain timestamp patterns)
        // 2. Scenarios with custom titles/descriptions
        // 3. Scenarios not matching the standard file pattern
        // 4. User-created or modified scenarios

        for (const scenario of scenarios) {
            // Check for timestamp-based IDs (user-generated)
            // Look for patterns like "custom-1234567890" or IDs with 13-digit timestamps
            if (scenario.id && /-(1[0-9]{12}|custom|user)/i.test(scenario.id)) {
                console.log('🔍 Found user-generated ID:', scenario.id);
                modificationReasons.push(`User-generated ID: ${scenario.id}`);
                break; // Found one, that's enough
            }

            // Check for scenarios marked as user-created
            if (scenario.isUserCreated || scenario.source === 'user') {
                console.log('🔍 Found user-created scenario:', scenario.id);
                modificationReasons.push(`User-created scenario: ${scenario.id}`);
                break;
            }

            // Check for edited scenarios (would have lastModified field)
            if (scenario.lastModified) {
                console.log('🔍 Found modified scenario:', scenario.id);
                modificationReasons.push(`Modified scenario: ${scenario.id}`);
                break;
            }

            // Check for scenarios with custom metadata indicating user changes
            if (scenario.customTitle || scenario.userNotes || scenario.isCustom) {
                console.log('🔍 Found custom scenario metadata:', scenario.id);
                modificationReasons.push(`Custom metadata: ${scenario.id}`);
                break;
            }
        }

        // For count differences, be more forgiving - only consider it a user modification
        // if the difference is significant (more than 10 scenarios)
        // Small differences could be due to data inconsistencies or temporary duplicates
        const expectedCount = 350; // Typical file count
        const countDifference = Math.abs(scenarios.length - expectedCount);

        if (countDifference > 10) {
            console.log('🔍 Significant scenario count difference:', scenarios.length, 'vs expected', expectedCount);
            modificationReasons.push(`Significant count difference: ${scenarios.length} vs ${expectedCount}`);
        } else if (countDifference > 0) {
            console.log('ℹ️ Minor scenario count difference:', scenarios.length, 'vs expected', expectedCount, '(within tolerance)');
        }

        const hasModifications = modificationReasons.length > 0;

        if (hasModifications) {
            console.log('❌ User modifications detected:', modificationReasons);
        } else {
            console.log('✅ No significant user modifications detected in', scenarios.length, 'scenarios (treating as fresh data)');
        }

        return hasModifications;
    }

    /**
     * Refresh all scenarios from files and save to localStorage
     */
    async refreshFromFiles() {
        console.log('🔄 Refreshing all scenarios from files...');

        // Clear current data
        this.allScenarios = [];
        this.isLoaded = false;

        // Load fresh from files
        await this.loadModularScenarios();

        // Save to localStorage
        this.saveToLocalStorage();

        // Update app if available
        if (window.app) {
            window.app.allCheatSheets = this.getAllScenarios();
            if (typeof window.app.setupInterface === 'function') {
                window.app.setupInterface();
            }
        }

        console.log(`✅ Refreshed ${this.allScenarios.length} scenarios from files`);
    }

    /**
     * Perform actual scenario comparison between local and files
     */
    async performScenarioComparison() {
        console.log('📊 Performing detailed scenario comparison...');

        // Get current scenarios from localStorage
        const localScenarios = this.getAllScenarios();

        // Load scenarios from files using the same method that initial load uses
        console.log('🔄 Loading fresh scenarios from files for comparison...');

        // Reset and load fresh from files (without localStorage)
        const originalAllScenarios = [...this.allScenarios]; // Backup current
        this.allScenarios = [];
        this.isLoaded = false;

        // Load from files only
        await this.loadModularScenarios();
        const fileScenarios = [...this.allScenarios];

        // Restore original scenarios
        this.allScenarios = originalAllScenarios;
        this.isLoaded = true;

        console.log(`📂 File scenarios count: ${fileScenarios.length}`);

        // Compare by ID
        const localIds = new Set(localScenarios.map(s => s.id));
        const fileIds = new Set(fileScenarios.map(s => s.id));

        // Find differences
        const onlyInFiles = fileScenarios.filter(s => !localIds.has(s.id));
        const onlyInLocal = localScenarios.filter(s => !fileIds.has(s.id));

        console.log(`📊 Comparison results:`, {
            localCount: localScenarios.length,
            fileCount: fileScenarios.length,
            onlyInFiles: onlyInFiles.length,
            onlyInLocal: onlyInLocal.length,
            sampleLocalIds: Array.from(localIds).slice(0, 5),
            sampleFileIds: Array.from(fileIds).slice(0, 5)
        });

        // Show results
        if (onlyInFiles.length === 0 && onlyInLocal.length === 0) {
            if (window.app && typeof window.app.showNotification === 'function') {
                window.app.showNotification('✅ No new scenarios found. Your data is up to date!', 'success');
            }
        } else {
            // Show admin modal
            this.showNewScenariosModal(onlyInFiles, onlyInLocal);
        }
    }

    /**
     * Show the new scenarios comparison modal
     */
    showNewScenariosModal(newScenarios, removedScenarios) {
        const modalHtml = `
            <div id="newScenariosModal" class="modal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-search-plus"></i> Scenario Comparison Results</h2>
                        <span class="close" onclick="closeNewScenariosModal()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="scenarios-comparison">
                            ${newScenarios.length > 0 ? `
                                <div class="new-scenarios-section">
                                    <h4><i class="fas fa-plus-circle" style="color: #28a745;"></i> New Scenarios in Files (${newScenarios.length})</h4>
                                    <div class="scenarios-list" style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
                                        ${newScenarios.map(scenario => `
                                            <div class="scenario-item" style="margin-bottom: 8px; padding: 5px; background: #d4edda; border-radius: 3px;">
                                                <input type="checkbox" id="import_${scenario.id}" checked>
                                                <label for="import_${scenario.id}">
                                                    <strong>${scenario.title || scenario.id}</strong>
                                                    <br><small>Category: ${scenario.category || 'Unknown'}</small>
                                                </label>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : `
                                <div class="no-new-scenarios">
                                    <p><i class="fas fa-check-circle" style="color: #28a745;"></i> No new scenarios found in files.</p>
                                </div>
                            `}

                            ${removedScenarios.length > 0 ? `
                                <div class="removed-scenarios-section">
                                    <h4><i class="fas fa-minus-circle" style="color: #dc3545;"></i> Scenarios Only in Your Local Data (${removedScenarios.length})</h4>
                                    <div class="scenarios-list" style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
                                        ${removedScenarios.map(scenario => `
                                            <div class="scenario-item" style="margin-bottom: 8px; padding: 5px; background: #f8d7da; border-radius: 3px;">
                                                <strong>${scenario.title || scenario.id}</strong>
                                                <br><small>Category: ${scenario.category || 'Unknown'}</small>
                                                <br><small style="color: #666;">This scenario exists in your local data but not in files</small>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}

                            <div class="admin-actions" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
                                <h4><i class="fas fa-cogs"></i> Admin Actions</h4>
                                <p style="color: #666; margin-bottom: 10px;">
                                    If you're seeing unexpected results, you can force refresh or reset your localStorage.
                                </p>
                                <button type="button" class="btn btn-info" onclick="forceRefreshFromFiles()" style="background: #17a2b8; color: white; border: none; padding: 8px 15px; border-radius: 4px; margin-right: 10px;">
                                    <i class="fas fa-refresh"></i> Force Refresh from Files
                                </button>
                                <button type="button" class="btn btn-success" onclick="forceImportAllFromFiles()" style="background: #28a745; color: white; border: none; padding: 8px 15px; border-radius: 4px; margin-right: 10px;">
                                    <i class="fas fa-download"></i> Force Import All (${this.allScenarios.length} → localStorage)
                                </button>
                                <button type="button" class="btn btn-warning" onclick="resetToFilesData()" style="background: #ffc107; color: #212529; border: none; padding: 8px 15px; border-radius: 4px; margin-right: 10px;">
                                    <i class="fas fa-sync-alt"></i> Reset to Files (${this.allScenarios.length} scenarios)
                                </button>
                                <br><small style="color: #666;">Force Refresh: Updates localStorage if no user modifications detected<br>
                                Force Import All: Bypasses modification checks and imports all from files<br>
                                Reset: Completely replaces localStorage with fresh file data (loses user changes)</small>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="closeNewScenariosModal()">Close</button>
                        ${newScenarios.length > 0 ? `
                            <button type="button" class="btn btn-success" onclick="importSelectedScenarios()">Import Selected</button>
                            <button type="button" class="btn btn-primary" onclick="importAllNewScenarios()">Import All (${newScenarios.length})</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        // Store scenarios for import functions
        this.pendingNewScenarios = newScenarios;
        this.pendingRemovedScenarios = removedScenarios;

        // Remove existing modal if present
        const existingModal = document.getElementById('newScenariosModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    /**
     * Import selected scenarios from the modal
     */
    importSelectedScenarios() {
        try {
            if (!this.pendingNewScenarios) {
                throw new Error('No pending scenarios to import');
            }

            // Get selected scenarios
            const selectedScenarios = this.pendingNewScenarios.filter(scenario => {
                const checkbox = document.getElementById(`import_${scenario.id}`);
                return checkbox && checkbox.checked;
            });

            if (selectedScenarios.length === 0) {
                if (window.app && typeof window.app.showNotification === 'function') {
                    window.app.showNotification('ℹ️ No scenarios selected for import', 'info');
                }
                return;
            }

            // Add selected scenarios
            selectedScenarios.forEach(scenario => {
                this.addScenario(scenario);
            });

            // Close modal and refresh UI
            this.closeNewScenariosModal();

            if (window.app && typeof window.app.setupInterface === 'function') {
                window.app.allCheatSheets = this.getAllScenarios();
                window.app.setupInterface();
            }

            if (window.app && typeof window.app.showNotification === 'function') {
                window.app.showNotification(`✅ Imported ${selectedScenarios.length} scenarios successfully!`, 'success');
            }

            console.log(`✅ Imported ${selectedScenarios.length} selected scenarios`);

        } catch (error) {
            console.error('❌ Import selected scenarios failed:', error);
            if (window.app && typeof window.app.showNotification === 'function') {
                window.app.showNotification('❌ Import failed: ' + error.message, 'error');
            }
        }
    }

    /**
     * Import all new scenarios from the modal
     */
    importAllNewScenarios() {
        try {
            if (!this.pendingNewScenarios) {
                throw new Error('No pending scenarios to import');
            }

            // Add all new scenarios
            this.pendingNewScenarios.forEach(scenario => {
                this.addScenario(scenario);
            });

            // Close modal and refresh UI
            this.closeNewScenariosModal();

            if (window.app && typeof window.app.setupInterface === 'function') {
                window.app.allCheatSheets = this.getAllScenarios();
                window.app.setupInterface();
            }

            if (window.app && typeof window.app.showNotification === 'function') {
                window.app.showNotification(`✅ Imported all ${this.pendingNewScenarios.length} scenarios successfully!`, 'success');
            }

            console.log(`✅ Imported all ${this.pendingNewScenarios.length} new scenarios`);

        } catch (error) {
            console.error('❌ Import all scenarios failed:', error);
            if (window.app && typeof window.app.showNotification === 'function') {
                window.app.showNotification('❌ Import failed: ' + error.message, 'error');
            }
        }
    }

    /**
     * Close the new scenarios modal
     */
    closeNewScenariosModal() {
        const modal = document.getElementById('newScenariosModal');
        if (modal) {
            modal.remove();
        }

        // Clear pending data
        this.pendingNewScenarios = null;
        this.pendingRemovedScenarios = null;
    }

    /**
     * Reset localStorage to match files exactly (admin function)
     */
    async resetToFilesData() {
        try {
            console.log('🔄 Resetting localStorage to match files exactly...');

            if (confirm('This will replace all your localStorage data with fresh data from files. Any local modifications will be lost. Continue?')) {
                // Clear all localStorage data
                localStorage.removeItem('diagnostiq_scenarios');
                localStorage.removeItem('diagnostiq_last_refresh');
                localStorage.removeItem('deletedScenarios');
                localStorage.removeItem('diagnostiq_force_refresh');

                // Reload fresh from files
                await this.refreshFromFiles();

                // Close modal
                this.closeNewScenariosModal();

                if (window.app && typeof window.app.showNotification === 'function') {
                    window.app.showNotification(`✅ Reset complete! Loaded ${this.allScenarios.length} scenarios from files.`, 'success');
                }

                console.log(`✅ Reset to files completed - ${this.allScenarios.length} scenarios loaded`);
            }

        } catch (error) {
            console.error('❌ Reset to files failed:', error);
            if (window.app && typeof window.app.showNotification === 'function') {
                window.app.showNotification('❌ Reset failed: ' + error.message, 'error');
            }
        }
    }

    /**
     * Force refresh from files (sets flag for next checkForNewScenarios call)
     */
    forceRefreshFromFiles() {
        try {
            console.log('🔄 Setting force refresh flag...');
            localStorage.setItem('diagnostiq_force_refresh', 'true');

            if (window.app && typeof window.app.showNotification === 'function') {
                window.app.showNotification('✅ Force refresh flag set. Use "Check for New Scenarios" to refresh.', 'info');
            }

            // Optionally run the check immediately
            this.checkForNewScenarios();

        } catch (error) {
            console.error('❌ Force refresh failed:', error);
            if (window.app && typeof window.app.showNotification === 'function') {
                window.app.showNotification('❌ Force refresh failed: ' + error.message, 'error');
            }
        }
    }

    /**
     * Force import all scenarios from files to localStorage (admin function)
     * This bypasses all modification checks and loads fresh data
     */
    async forceImportAllFromFiles() {
        try {
            console.log('🔄 Force importing all scenarios from files to localStorage...');

            if (confirm('This will replace ALL localStorage data with fresh data from files, bypassing any user modification checks. Continue?')) {
                // Clear all localStorage data
                localStorage.removeItem('diagnostiq_scenarios');
                localStorage.removeItem('diagnostiq_last_refresh');
                localStorage.removeItem('diagnostiq_force_refresh');
                localStorage.removeItem('deletedScenarios');

                // Reload fresh from files
                await this.refreshFromFiles();

                if (window.app && typeof window.app.showNotification === 'function') {
                    window.app.showNotification(`✅ Force imported ${this.allScenarios.length} scenarios from files!`, 'success');
                }

                console.log(`✅ Force import completed - ${this.allScenarios.length} scenarios loaded from files`);
            }

        } catch (error) {
            console.error('❌ Force import failed:', error);
            if (window.app && typeof window.app.showNotification === 'function') {
                window.app.showNotification('❌ Force import failed: ' + error.message, 'error');
            }
        }
    }

    // ===== END ADMIN SCENARIO COMPARISON METHODS =====

    async loadFullScenario(id) {
        const scenario = this.getScenarioById(id);
        if (!scenario) {
            console.error('❌ Scenario not found:', id);
            return null;
        }

        return this.loadFullScenario(scenario);
    }
}

// Create singleton instance
const dataManager = new DataManager();

// Legacy compatibility functions
async function loadAllDiagnosticScenarios() {
    return await dataManager.loadAllScenarios();
}

function getAvailableCategories() {
    return dataManager.getAvailableCategories();
}

function getScenariosByCategory(categoryName) {
    return dataManager.getScenariosByCategory(categoryName);
}

// Export for use
window.dataManager = dataManager;
window.loadAllDiagnosticScenarios = loadAllDiagnosticScenarios;
window.getAvailableCategories = getAvailableCategories;
window.getScenariosByCategory = getScenariosByCategory;
