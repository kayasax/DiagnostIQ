// Test script to validate the initialization fix
// Run this in browser console after loading the app

function testInitializationFix() {
    console.log('🧪 Testing DiagnostIQ Initialization Fix...');

    // Check if only one app instance exists
    console.log('📋 App Instance Check:');
    console.log('  - window.app exists:', !!window.app);
    console.log('  - window.dataManager exists:', !!window.dataManager);
    console.log('  - diagnostiqInitialized flag:', window.diagnostiqInitialized);

    // Check scenario count
    if (window.dataManager && window.dataManager.getAllScenarios) {
        const scenarios = window.dataManager.getAllScenarios();
        console.log('📊 Scenario Count Check:');
        console.log('  - Total scenarios loaded:', scenarios.length);
        console.log('  - Expected: ~327 scenarios (not 654+)');

        if (scenarios.length > 500) {
            console.error('❌ FAILED: Too many scenarios loaded - multiple initialization detected!');
        } else if (scenarios.length >= 300 && scenarios.length <= 400) {
            console.log('✅ PASSED: Scenario count looks correct');
        } else {
            console.warn('⚠️ WARNING: Unexpected scenario count');
        }
    }

    // Check app initialization state
    if (window.app) {
        console.log('🎯 App State Check:');
        console.log('  - App initialized:', window.app.isInitialized);
        console.log('  - All cheat sheets count:', window.app.allCheatSheets?.length);
    }

    // Check for duplicate log messages in console
    console.log('📝 Console Log Check:');
    console.log('  - Look for SINGLE "🚀 Initializing DiagnostIQ..." message');
    console.log('  - Look for SINGLE "✅ DiagnostIQ initialized successfully" message');
    console.log('  - No duplicate scenario loading messages');

    console.log('🧪 Test completed. Check results above.');
}

// Auto-run test after a short delay to let app initialize
setTimeout(testInitializationFix, 2000);
