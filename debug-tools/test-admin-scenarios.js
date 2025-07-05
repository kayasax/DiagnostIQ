// Admin New Scenarios Test
// Testing the new admin functionality for detecting new scenarios

console.log('🧪 Admin New Scenarios Test Started');

// Test 1: Check if admin methods exist
if (window.dataManager) {
    console.log('✅ DataManager admin methods available:', {
        detectNewScenarios: typeof window.dataManager.detectNewScenarios,
        importNewScenarios: typeof window.dataManager.importNewScenarios,
        importAllNewScenarios: typeof window.dataManager.importAllNewScenarios,
        loadScenariosFromFiles: typeof window.dataManager.loadScenariosFromFiles
    });
} else {
    console.log('❌ DataManager not available');
}

// Test 2: Check if app admin methods exist
if (window.app) {
    console.log('✅ App admin methods available:', {
        checkForNewScenarios: typeof window.app.checkForNewScenarios,
        showNewScenariosModal: typeof window.app.showNewScenariosModal,
        importSelectedScenarios: typeof window.app.importSelectedScenarios,
        importAllNewScenarios: typeof window.app.importAllNewScenarios,
        closeNewScenariosModal: typeof window.app.closeNewScenariosModal
    });
} else {
    console.log('❌ App not available');
}

// Test 3: Check if global functions exist
console.log('✅ Global admin functions available:', {
    checkForNewScenarios: typeof window.checkForNewScenarios,
    importSelectedScenarios: typeof window.importSelectedScenarios,
    importAllNewScenarios: typeof window.importAllNewScenarios,
    closeNewScenariosModal: typeof window.closeNewScenariosModal
});

// Test 4: Check current localStorage status
const storedData = localStorage.getItem('diagnostiq_scenarios');
if (storedData) {
    try {
        const parsedData = JSON.parse(storedData);
        console.log(`✅ Current localStorage: ${parsedData.length} scenarios`);
    } catch (e) {
        console.log('❌ Invalid JSON in localStorage');
    }
} else {
    console.log('ℹ️ No scenarios in localStorage - admin function will load from files first');
}

console.log('🧪 Admin New Scenarios Test Complete');

// Export helper to test admin function
window.testAdminDetection = async function() {
    if (window.dataManager && window.dataManager.detectNewScenarios) {
        try {
            console.log('🔍 Testing admin detection...');
            const analysis = await window.dataManager.detectNewScenarios();
            console.log('📊 Detection results:', analysis.summary);
            return analysis;
        } catch (error) {
            console.error('❌ Error testing detection:', error);
        }
    } else {
        console.log('❌ Admin detection not available');
    }
};
