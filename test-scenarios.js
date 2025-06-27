// Quick test script to check scenario loading and database fields
console.log('=== DiagnosticIQ Scenario Test ===');

// Wait for app to load
setTimeout(async () => {
    try {
        // Check if data manager exists
        if (window.dataManager) {
            console.log('✅ Data manager found');

            // Get all scenarios
            const scenarios = window.dataManager.allScenarios;
            console.log(`📊 Total scenarios: ${scenarios.length}`);

            // Check scenarios with database fields
            const scenariosWithDatabase = scenarios.filter(s => s.database);
            console.log(`🗄️ Scenarios with database field: ${scenariosWithDatabase.length}`);

            // Show first few scenarios with database
            if (scenariosWithDatabase.length > 0) {
                console.log('📋 Sample scenarios with database:');
                scenariosWithDatabase.slice(0, 3).forEach(s => {
                    console.log(`  - "${s.title}" | Database: ${s.database} | Category: ${s.category}`);
                });
            }

            // Check categories
            const categories = window.dataManager.getAvailableCategories();
            console.log('🏷️ Available categories:', categories.map(c => c.value));

            // Test editing scenario functionality
            const testScenario = scenariosWithDatabase[0];
            if (testScenario) {
                console.log(`🧪 Testing edit functionality with scenario: "${testScenario.title}"`);
                console.log(`   - ID: ${testScenario.id}`);
                console.log(`   - Category: ${testScenario.category}`);
                console.log(`   - Database: ${testScenario.database}`);
                console.log(`   - Queries: ${testScenario.queries ? testScenario.queries.length : 'N/A'}`);
            }

        } else {
            console.log('❌ Data manager not found');
        }

        // Check if app instance exists
        if (window.app) {
            console.log('✅ App instance found');
        } else {
            console.log('❌ App instance not found');
        }

    } catch (error) {
        console.error('❌ Test error:', error);
    }
}, 2000); // Wait 2 seconds for app to initialize
