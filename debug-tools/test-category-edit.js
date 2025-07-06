// Test script to reproduce category edit issue
// This will help us understand why category edits are not persisting

console.log('🧪 Testing category edit persistence...');

// Load the data manager
const fs = require('fs');
const path = require('path');

// Mock localStorage for Node.js environment
global.localStorage = {
    getItem: (key) => null,
    setItem: (key, value) => console.log(`📝 localStorage.setItem('${key}', ${value})`),
    removeItem: (key) => console.log(`🗑️ localStorage.removeItem('${key}')`)
};

// Mock window object
global.window = {
    cheatSheets: [],
    dataManager: null
};

// Load the data manager class
eval(fs.readFileSync('./data-manager.js', 'utf8'));

// Create an instance
const dataManager = new DataManager();

// Mock some test data
const testScenario = {
    id: 'test-scenario-123',
    title: 'Test Scenario',
    category: 'authentication',
    description: 'Test description',
    kqlQueries: [],
    troubleshootingSteps: [],
    tags: []
};

// Add the scenario to test updating
dataManager.allScenarios = [testScenario];
window.cheatSheets = dataManager.allScenarios;

console.log('📊 Initial scenario:', JSON.stringify(testScenario, null, 2));

// Test updating the category
const updatedScenario = {
    ...testScenario,
    category: 'synchronization',
    tags: ['updated'] // Mark as manually edited
};

console.log('🔄 Attempting to update category from "authentication" to "synchronization"...');

const result = dataManager.updateScenario('test-scenario-123', updatedScenario);

console.log('✅ Update result:', result);
console.log('📊 Updated scenario:', JSON.stringify(dataManager.allScenarios[0], null, 2));

// Test if the category persists
const foundScenario = dataManager.allScenarios.find(s => s.id === 'test-scenario-123');
console.log('🔍 Final category check:', foundScenario?.category);

if (foundScenario?.category === 'synchronization') {
    console.log('✅ SUCCESS: Category edit persisted correctly!');
} else {
    console.log('❌ FAILURE: Category edit was lost!');
    console.log('Expected: synchronization, Got:', foundScenario?.category);
}
