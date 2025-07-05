// Debug Global Functions
// Run this in the browser console to check if functions are defined

console.log('🧪 Testing Global Functions');

const functions = [
    'checkForNewScenarios',
    'showAddCheatSheet',
    'saveCheatSheet',
    'closeModal',
    'resetToOriginalData',
    'goHome',
    'editScenario',
    'importSelectedScenarios',
    'importAllNewScenarios',
    'closeNewScenariosModal'
];

console.log('📋 Global Function Status:');
functions.forEach(funcName => {
    const exists = typeof window[funcName] === 'function';
    console.log(`${exists ? '✅' : '❌'} ${funcName}: ${typeof window[funcName]}`);
});

console.log('📋 App Method Status:');
if (window.app) {
    functions.forEach(funcName => {
        const exists = typeof window.app[funcName] === 'function';
        console.log(`${exists ? '✅' : '❌'} app.${funcName}: ${typeof window.app[funcName]}`);
    });
} else {
    console.log('❌ window.app not available');
}

// Test if we can call the problematic functions
console.log('🧪 Testing Function Calls:');

try {
    if (typeof window.checkForNewScenarios === 'function') {
        console.log('✅ checkForNewScenarios function exists');
    } else {
        console.log('❌ checkForNewScenarios not defined');
    }
} catch (e) {
    console.log('❌ Error with checkForNewScenarios:', e);
}

try {
    if (typeof window.showAddCheatSheet === 'function') {
        console.log('✅ showAddCheatSheet function exists');
    } else {
        console.log('❌ showAddCheatSheet not defined');
    }
} catch (e) {
    console.log('❌ Error with showAddCheatSheet:', e);
}
