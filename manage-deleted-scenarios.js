// DiagnosticIQ - Deleted Scenarios Management Utility
// This script helps manage scenarios that have been "deleted" (hidden) from the UI

console.log('🗑️ DiagnosticIQ Deleted Scenarios Manager');

function showDeletedScenarios() {
    const deletedIds = JSON.parse(localStorage.getItem('deletedScenarios')) || [];
    console.log(`📊 Total deleted scenarios: ${deletedIds.length}`);

    if (deletedIds.length === 0) {
        console.log('✅ No scenarios are currently deleted/hidden');
        return;
    }

    console.log('🗑️ Deleted scenario IDs:');
    deletedIds.forEach((id, index) => {
        console.log(`${index + 1}. ${id}`);
    });

    return deletedIds;
}

function restoreScenario(scenarioId) {
    if (!window.app || !window.app.dataManager) {
        console.error('❌ DiagnosticIQ app not loaded. Please run this from the main application page.');
        return false;
    }

    const success = window.app.dataManager.restoreScenario(scenarioId);
    if (success) {
        console.log(`✅ Restored scenario: ${scenarioId}`);
        // Refresh the app data
        window.app.refreshData();
        if (window.app.populateCategoryDropdown) {
            window.app.populateCategoryDropdown();
        }
        return true;
    } else {
        console.log(`❌ Failed to restore scenario: ${scenarioId} (not found in deleted list)`);
        return false;
    }
}

function restoreAllScenarios() {
    if (!window.app || !window.app.dataManager) {
        console.error('❌ DiagnosticIQ app not loaded. Please run this from the main application page.');
        return false;
    }

    const deletedIds = showDeletedScenarios();
    if (deletedIds.length === 0) {
        console.log('✅ No scenarios to restore');
        return true;
    }

    window.app.dataManager.clearDeletedScenarios();
    console.log(`✅ Restored all ${deletedIds.length} scenarios`);

    // Refresh the app data
    window.app.refreshData();
    if (window.app.populateCategoryDropdown) {
        window.app.populateCategoryDropdown();
    }

    return true;
}

// Instructions
console.log(`
🛠️ Available commands:
- showDeletedScenarios()     : List all deleted/hidden scenarios
- restoreScenario('id')      : Restore a specific scenario by ID
- restoreAllScenarios()      : Restore all deleted scenarios

📝 Example usage:
showDeletedScenarios();
restoreScenario('m365-power-platform-c532cc70');
restoreAllScenarios();
`);

// Auto-show current state
showDeletedScenarios();
