// DiagnosticIQ - AI-Powered Extraction Test
// Simple test to verify local LLM setup and basic extraction capability

const LocalLLMInterface = require('./llm-interface');

// Sample Azure AD troubleshooting content for testing
const SAMPLE_CONTENT = `
# Cross-Tenant Sync Troubleshooting

## Overview
This guide helps troubleshoot Cross-Tenant Sync (CTS) issues in Azure AD.

## Common Issues

### User Not Syncing
When users are not syncing between tenants, use these queries to investigate:

**Check Sync Status**
\`\`\`kql
AADProvisioningLogs
| where TimeGenerated > ago(24h)
| where SourceIdentity contains "user@contoso.com"
| project TimeGenerated, Action, Result, ResultDescription
| order by TimeGenerated desc
\`\`\`

**Check for Errors**
\`\`\`kql
AADProvisioningLogs
| where TimeGenerated > ago(7d)
| where Result == "Failure"
| summarize count() by ResultDescription, SourceSystem
| order by count_ desc
\`\`\`

## Troubleshooting Steps
1. Verify the user is in scope for synchronization
2. Check if there are any attribute mapping conflicts
3. Review the provisioning logs for specific error messages
4. Validate the source tenant user exists and is active
5. Check target tenant for any duplicate or conflicting objects

## Additional Queries

**Monitor Sync Performance**
\`\`\`kql
AADProvisioningLogs
| where TimeGenerated > ago(1h)
| summarize avg(DurationMs) by bin(TimeGenerated, 5m)
| render timechart
\`\`\`
`;

async function testAIExtraction() {
    console.log('🤖 DiagnosticIQ - AI Extraction Test');
    console.log('=====================================\n');

    const llm = new LocalLLMInterface({ verbose: true });

    // Step 1: Check if Ollama is available
    console.log('🔍 Checking LLM availability...');
    const systemInfo = await llm.getSystemInfo();
    console.log('📊 System Status:', systemInfo);

    if (!systemInfo.available) {
        console.log('\n❌ Ollama is not running. Please:');
        console.log('1. Install Ollama: winget install Ollama.Ollama');
        console.log('2. Download model: ollama pull llama3.1:8b');
        console.log('3. Start Ollama service');
        console.log('4. Run this test again\n');
        return;
    }

    if (!systemInfo.modelReady) {
        console.log('\n⚠️ Model not available. Please run:');
        console.log('ollama pull llama3.1:8b\n');
        return;
    }

    console.log('✅ LLM is ready!\n');

    // Step 2: Test basic extraction
    console.log('🔬 Testing scenario extraction...');
    try {
        const scenarios = await llm.extractStructuredData(SAMPLE_CONTENT, 'scenarios');
        
        console.log('📊 Extraction Results:');
        console.log(`   Scenarios found: ${Array.isArray(scenarios) ? scenarios.length : 'Invalid format'}`);
        
        if (Array.isArray(scenarios) && scenarios.length > 0) {
            scenarios.forEach((scenario, index) => {
                console.log(`\n📋 Scenario ${index + 1}:`);
                console.log(`   Title: ${scenario.title || 'Missing'}`);
                console.log(`   Category: ${scenario.category || 'Missing'}`);
                console.log(`   Queries: ${scenario.queries?.length || 0}`);
                console.log(`   Steps: ${scenario.steps?.length || 0}`);
                
                if (scenario.queries && scenario.queries.length > 0) {
                    console.log('   Sample Query:', scenario.queries[0].name);
                }
            });
        }

        console.log('\n✅ AI extraction test completed successfully!');
        
        // Save results for inspection
        const fs = require('fs');
        fs.writeFileSync('./ai-extraction/test-results.json', JSON.stringify(scenarios, null, 2));
        console.log('💾 Results saved to ai-extraction/test-results.json');

    } catch (error) {
        console.error('❌ Extraction failed:', error.message);
        console.log('\n🔧 Troubleshooting tips:');
        console.log('- Ensure Ollama is running: ollama serve');
        console.log('- Check model is available: ollama list');
        console.log('- Try a simpler model: ollama pull llama3.1:8b');
    }
}

// Test individual components
async function testComponents() {
    console.log('\n🔧 Component Tests');
    console.log('==================\n');

    const llm = new LocalLLMInterface({ verbose: false });

    // Test 1: Basic connectivity
    console.log('Test 1: Basic connectivity...');
    const available = await llm.isAvailable();
    console.log(`   Result: ${available ? '✅ Connected' : '❌ Failed'}`);

    // Test 2: Model availability
    console.log('Test 2: Model availability...');
    const modelReady = await llm.isModelAvailable();
    console.log(`   Result: ${modelReady ? '✅ Model ready' : '❌ Model not found'}`);

    // Test 3: Simple generation
    if (available && modelReady) {
        console.log('Test 3: Simple generation...');
        try {
            const response = await llm.generate('Say "Hello from DiagnosticIQ AI extraction!"');
            console.log(`   Result: ✅ Generated ${response.length} characters`);
            console.log(`   Sample: "${response.substring(0, 50)}..."`);
        } catch (error) {
            console.log(`   Result: ❌ Generation failed: ${error.message}`);
        }
    }
}

// Main test runner
async function runTests() {
    try {
        await testAIExtraction();
        await testComponents();
        
        console.log('\n🎯 Next Steps:');
        console.log('1. Review test-results.json to see extracted scenarios');
        console.log('2. Compare with current regex extraction results');
        console.log('3. Run: node ai-extraction/compare-methods.js');
        console.log('4. Tune prompts in extraction-prompts.js if needed\n');
        
    } catch (error) {
        console.error('💥 Test suite failed:', error);
    }
}

// Run tests if called directly
if (require.main === module) {
    runTests();
}

module.exports = {
    testAIExtraction,
    testComponents,
    runTests,
    SAMPLE_CONTENT
};
