// LocalStorage Persistence Test
// Testing the new localStorage-first approach

console.log('🧪 LocalStorage Persistence Test Started');

// Test 1: Check localStorage availability
try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    console.log('✅ localStorage is available');
} catch (e) {
    console.log('❌ localStorage not available:', e);
}

// Test 2: Check current localStorage data
const storedData = localStorage.getItem('diagnostiq_scenarios');
if (storedData) {
    try {
        const parsedData = JSON.parse(storedData);
        console.log(`✅ Found ${parsedData.length} scenarios in localStorage`);
    } catch (e) {
        console.log('❌ Invalid JSON in localStorage:', e);
    }
} else {
    console.log('ℹ️ No scenarios in localStorage yet');
}

// Test 3: Check DataManager methods
if (window.dataManager) {
    console.log('✅ DataManager methods available:', {
        updateScenario: typeof window.dataManager.updateScenario,
        addScenario: typeof window.dataManager.addScenario,
        deleteScenario: typeof window.dataManager.deleteScenario,
        saveToLocalStorage: typeof window.dataManager.saveToLocalStorage,
        loadFromLocalStorage: typeof window.dataManager.loadFromLocalStorage,
        resetToFiles: typeof window.dataManager.resetToFiles
    });
} else {
    console.log('❌ DataManager not available');
}

// Test 4: Check app methods
if (window.app) {
    console.log('✅ App methods available:', {
        updateScenario: typeof window.app.updateScenario,
        addNewScenario: typeof window.app.addNewScenario,
        resetToOriginalData: typeof window.app.resetToOriginalData
    });
} else {
    console.log('❌ App not available');
}

console.log('🧪 LocalStorage Persistence Test Complete');

// Export helper function to manually save current scenarios
window.debugSaveToLocalStorage = function() {
    if (window.dataManager && window.dataManager.allScenarios) {
        window.dataManager.saveToLocalStorage();
        console.log('✅ Manually saved scenarios to localStorage');
    } else {
        console.log('❌ No scenarios to save');
    }
};

// Export helper function to check localStorage size
window.debugCheckLocalStorageSize = function() {
    const data = localStorage.getItem('diagnostiq_scenarios');
    if (data) {
        const sizeKB = (data.length * 2) / 1024; // Rough estimate
        console.log(`📊 localStorage data size: ~${sizeKB.toFixed(2)} KB`);
    } else {
        console.log('📊 No data in localStorage');
    }
};
