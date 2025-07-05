// Auto-setup global functions for DiagnostIQ
// This ensures all functions are always available for HTML onclick handlers

(function() {
    'use strict';

    console.log('🔧 Auto-setup global functions script loaded');

    // Function to set up global mappings
    function setupAllGlobalFunctions() {
        if (!window.app) {
            console.log('⏳ App not ready yet, retrying in 500ms...');
            setTimeout(setupAllGlobalFunctions, 500);
            return;
        }

        console.log('🔗 Setting up all global function mappings...');

        // Core UI functions
        window.performSearch = () => {
            if (window.app && typeof window.app.performSearch === 'function') {
                return window.app.performSearch();
            } else {
                console.error('❌ performSearch not available');
            }
        };

        window.clearSearch = () => {
            if (window.app && typeof window.app.clearSearch === 'function') {
                return window.app.clearSearch();
            } else {
                console.error('❌ clearSearch not available');
            }
        };

        window.clearAllFilters = () => {
            if (window.app && typeof window.app.clearAllFilters === 'function') {
                return window.app.clearAllFilters();
            } else {
                console.error('❌ clearAllFilters not available');
            }
        };

        window.goHome = () => {
            if (window.app && typeof window.app.goHome === 'function') {
                return window.app.goHome();
            } else {
                console.error('❌ goHome not available');
            }
        };

        // Admin functions
        window.showAddCheatSheet = () => {
            if (window.app && typeof window.app.showAddCheatSheet === 'function') {
                return window.app.showAddCheatSheet();
            } else {
                console.error('❌ showAddCheatSheet not available');
            }
        };

        window.resetToOriginalData = () => {
            if (window.app && typeof window.app.resetToOriginalData === 'function') {
                return window.app.resetToOriginalData();
            } else {
                console.error('❌ resetToOriginalData not available');
            }
        };

        window.checkForNewScenarios = () => {
            if (window.app && typeof window.app.checkForNewScenarios === 'function') {
                return window.app.checkForNewScenarios();
            } else {
                console.error('❌ checkForNewScenarios not available');
            }
        };

        // Admin reset function
        window.resetToFilesData = () => {
            if (window.dataManager && typeof window.dataManager.resetToFilesData === 'function') {
                return window.dataManager.resetToFilesData();
            } else {
                console.error('❌ resetToFilesData not available');
            }
        };

        // Force refresh function
        window.forceRefreshFromFiles = () => {
            if (window.dataManager && typeof window.dataManager.forceRefreshFromFiles === 'function') {
                return window.dataManager.forceRefreshFromFiles();
            } else {
                console.error('❌ forceRefreshFromFiles not available');
            }
        };

        // Force import all function
        window.forceImportAllFromFiles = () => {
            if (window.dataManager && typeof window.dataManager.forceImportAllFromFiles === 'function') {
                return window.dataManager.forceImportAllFromFiles();
            } else {
                console.error('❌ forceImportAllFromFiles not available');
            }
        };

        // Modal functions
        window.saveCheatSheet = () => {
            if (window.app && typeof window.app.saveCheatSheet === 'function') {
                return window.app.saveCheatSheet();
            } else {
                console.error('❌ saveCheatSheet not available');
            }
        };

        window.closeModal = () => {
            if (window.app && typeof window.app.closeModal === 'function') {
                return window.app.closeModal();
            } else {
                console.error('❌ closeModal not available');
            }
        };

        // Import/Export functions
        window.exportLibrary = () => {
            if (window.app && typeof window.app.exportLibrary === 'function') {
                return window.app.exportLibrary();
            } else {
                console.error('❌ exportLibrary not available');
            }
        };

        window.importLibrary = (event) => {
            if (window.app && typeof window.app.importLibrary === 'function') {
                return window.app.importLibrary(event);
            } else {
                console.error('❌ importLibrary not available');
            }
        };

        window.syncLibrary = () => {
            if (window.app && typeof window.app.syncLibrary === 'function') {
                return window.app.syncLibrary();
            } else {
                console.error('❌ syncLibrary not available');
            }
        };

        // Import modal functions
        window.closeImportModal = () => {
            if (window.app && typeof window.app.closeImportModal === 'function') {
                return window.app.closeImportModal();
            } else {
                console.error('❌ closeImportModal not available');
            }
        };

        window.confirmImport = () => {
            if (window.app && typeof window.app.confirmImport === 'function') {
                return window.app.confirmImport();
            } else {
                console.error('❌ confirmImport not available');
            }
        };

        window.closeSyncModal = () => {
            if (window.app && typeof window.app.closeSyncModal === 'function') {
                return window.app.closeSyncModal();
            } else {
                console.error('❌ closeSyncModal not available');
            }
        };

        // Admin scenario functions
        window.importSelectedScenarios = () => {
            if (window.app && typeof window.app.importSelectedScenarios === 'function') {
                return window.app.importSelectedScenarios();
            } else {
                console.error('❌ importSelectedScenarios not available');
            }
        };

        window.importAllNewScenarios = () => {
            if (window.app && typeof window.app.importAllNewScenarios === 'function') {
                return window.app.importAllNewScenarios();
            } else {
                console.error('❌ importAllNewScenarios not available');
            }
        };

        window.closeNewScenariosModal = () => {
            if (window.app && typeof window.app.closeNewScenariosModal === 'function') {
                return window.app.closeNewScenariosModal();
            } else {
                console.error('❌ closeNewScenariosModal not available');
            }
        };

        // Scenario interaction functions
        window.editScenario = (id) => {
            if (window.app && typeof window.app.editScenario === 'function') {
                return window.app.editScenario(id);
            } else {
                console.error('❌ editScenario not available');
            }
        };

        window.editCheatSheet = (id) => {
            if (window.app && typeof window.app.editCheatSheet === 'function') {
                return window.app.editCheatSheet(id);
            } else {
                console.error('❌ editCheatSheet not available');
            }
        };

        window.deleteCheatSheet = (id) => {
            if (window.app && typeof window.app.deleteCheatSheet === 'function') {
                return window.app.deleteCheatSheet(id);
            } else {
                console.error('❌ deleteCheatSheet not available');
            }
        };

        window.expandCheatSheet = (id) => {
            if (window.app && typeof window.app.expandCheatSheet === 'function') {
                return window.app.expandCheatSheet(id);
            } else {
                console.error('❌ expandCheatSheet not available');
            }
        };

        window.collapseCheatSheet = (id) => {
            if (window.app && typeof window.app.collapseCheatSheet === 'function') {
                return window.app.collapseCheatSheet(id);
            } else {
                console.error('❌ collapseCheatSheet not available');
            }
        };

        // Filter functions
        window.filterByCategory = (category) => {
            if (window.app && typeof window.app.filterByCategory === 'function') {
                return window.app.filterByCategory(category);
            } else {
                console.error('❌ filterByCategory not available');
            }
        };

        window.toggleVertical = (verticalKey) => {
            if (window.app && typeof window.app.toggleVertical === 'function') {
                return window.app.toggleVertical(verticalKey);
            } else {
                console.error('❌ toggleVertical not available');
            }
        };

        // Verify all functions are mapped
        const functions = [
            'performSearch', 'clearSearch', 'clearAllFilters', 'goHome',
            'showAddCheatSheet', 'resetToOriginalData', 'checkForNewScenarios',
            'saveCheatSheet', 'closeModal', 'exportLibrary', 'importLibrary', 'syncLibrary',
            'closeImportModal', 'confirmImport', 'closeSyncModal',
            'importSelectedScenarios', 'importAllNewScenarios', 'closeNewScenariosModal',
            'editScenario', 'editCheatSheet', 'deleteCheatSheet', 'expandCheatSheet', 'collapseCheatSheet',
            'filterByCategory', 'toggleVertical', 'clearCategoryFilter', 'filterByTag'
        ];

        const mapped = {};
        const missing = [];

        functions.forEach(fn => {
            if (typeof window[fn] === 'function') {
                mapped[fn] = '✅';
            } else {
                mapped[fn] = '❌';
                missing.push(fn);
            }
        });

        console.log('🔗 Global functions mapping status:', mapped);

        if (missing.length > 0) {
            console.warn('⚠️ Missing functions:', missing);
        } else {
            console.log('✅ All functions mapped successfully!');
        }

        // Set a flag that functions are ready
        window.globalFunctionsReady = true;
    }

    // Start setup immediately if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupAllGlobalFunctions);
    } else {
        setupAllGlobalFunctions();
    }

    // Also monitor for app initialization
    let checkCount = 0;
    const checkForApp = () => {
        checkCount++;
        if (window.app && window.diagnostiqInitialized) {
            setupAllGlobalFunctions();
        } else if (checkCount < 20) { // Check for up to 10 seconds
            setTimeout(checkForApp, 500);
        } else {
            console.warn('⚠️ App initialization check timed out');
        }
    };

    // Start checking
    checkForApp();

})();
