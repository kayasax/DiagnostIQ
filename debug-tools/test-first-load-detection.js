// QUICK TEST SCRIPT for checking first-load detection

console.log('🧪 Starting Quick Test for First-Load Detection...');

// Function to test the checkForNewScenarios flow
async function testCheckForNewScenarios() {
    console.log('\n=== TESTING checkForNewScenarios ===');

    // Check if dataManager is available
    if (!window.dataManager) {
        console.error('❌ dataManager not available');
        return;
    }

    // Get current localStorage state
    const localStorageData = localStorage.getItem('diagnostiq_scenarios');
    const lastRefreshData = localStorage.getItem('diagnostiq_last_refresh');

    console.log('📊 Current State:');
    console.log(`  localStorage scenarios: ${localStorageData ? JSON.parse(localStorageData).length : 'none'}`);
    console.log(`  Last refresh: ${lastRefreshData ? new Date(parseInt(lastRefreshData)).toLocaleString() : 'never'}`);
    console.log(`  Force refresh flag: ${localStorage.getItem('diagnostiq_force_refresh') || 'not set'}`);

    // Test the checkForNewScenarios method
    try {
        console.log('\n🔍 Calling checkForNewScenarios...');
        await window.dataManager.checkForNewScenarios();
        console.log('✅ checkForNewScenarios completed');
    } catch (error) {
        console.error('❌ checkForNewScenarios failed:', error);
    }
}

// Function to clear localStorage and test first load
function testFirstLoadScenario() {
    console.log('\n=== TESTING FIRST LOAD SCENARIO ===');

    if (confirm('This will clear localStorage to simulate first load. Continue?')) {
        localStorage.removeItem('diagnostiq_scenarios');
        localStorage.removeItem('diagnostiq_last_refresh');
        localStorage.removeItem('diagnostiq_force_refresh');
        localStorage.removeItem('deletedScenarios');

        console.log('✅ localStorage cleared. Now testing first load...');

        setTimeout(async () => {
            await testCheckForNewScenarios();
        }, 1000);
    }
}

// Function to test user modification detection
function testUserModificationDetection() {
    console.log('\n=== TESTING USER MODIFICATION DETECTION ===');

    const localStorageData = localStorage.getItem('diagnostiq_scenarios');
    if (!localStorageData) {
        console.log('❌ No localStorage data to test');
        return;
    }

    const scenarios = JSON.parse(localStorageData);

    if (window.dataManager && typeof window.dataManager.hasUserModifications === 'function') {
        const hasModifications = window.dataManager.hasUserModifications(scenarios);
        console.log(`📊 hasUserModifications result: ${hasModifications}`);
    } else {
        console.error('❌ hasUserModifications method not available');
    }
}

// Add convenience functions to window for easy testing
window.testFirstLoad = testFirstLoadScenario;
window.testCheckScenarios = testCheckForNewScenarios;
window.testModificationDetection = testUserModificationDetection;

console.log('\n🎯 Test functions available:');
console.log('  window.testFirstLoad() - Clear localStorage and test first load');
console.log('  window.testCheckScenarios() - Test checkForNewScenarios');
console.log('  window.testModificationDetection() - Test user modification detection');
console.log('\n💡 You can also run these commands manually in the console.');

// Auto-run the basic test
testCheckForNewScenarios();
