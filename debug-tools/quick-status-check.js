// Quick App Status Check
// Run this in browser console to check app status

console.log('🔍 DiagnostIQ App Status Check');

console.log('📊 App Instance:', {
    exists: !!window.app,
    type: typeof window.app,
    initialized: window.diagnostiqInitialized || false
});

console.log('📊 DataManager:', {
    exists: !!window.dataManager,
    type: typeof window.dataManager,
    isLoaded: window.dataManager?.isLoaded || false,
    isLoading: window.dataManager?.isLoading || false,
    scenarioCount: window.dataManager?.allScenarios?.length || 0
});

console.log('📊 LocalStorage:', {
    hasScenarios: !!localStorage.getItem('diagnostiq_scenarios'),
    size: localStorage.getItem('diagnostiq_scenarios')?.length || 0
});

console.log('📊 Critical Functions:');
const criticalFunctions = [
    'showAddCheatSheet',
    'checkForNewScenarios',
    'saveCheatSheet',
    'closeModal',
    'resetToOriginalData'
];

criticalFunctions.forEach(fname => {
    console.log(`${typeof window[fname] === 'function' ? '✅' : '❌'} ${fname}`);
});

// Test localStorage scenarios
try {
    const stored = localStorage.getItem('diagnostiq_scenarios');
    if (stored) {
        const scenarios = JSON.parse(stored);
        console.log(`✅ LocalStorage has ${scenarios.length} scenarios`);
    } else {
        console.log('ℹ️ No scenarios in localStorage');
    }
} catch (e) {
    console.log('❌ Error reading localStorage:', e);
}
