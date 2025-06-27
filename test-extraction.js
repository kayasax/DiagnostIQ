/**
 * Test script for WikiExtractor
 * Creates sample markdown files to test the extraction functionality
 */

const fs = require('fs').promises;
const path = require('path');
const WikiExtractor = require('./extract-wiki-scenarios');

// Sample markdown content for testing
const sampleMarkdownFiles = [
    {
        name: 'authentication-troubleshooting.md',
        content: `# Azure AD Authentication Troubleshooting

## Sign-in Failures Investigation

This section helps investigate sign-in failures in Azure AD.

### Description
Use these queries to analyze authentication issues and identify root causes of sign-in failures.

### Steps to Investigate
1. Check the SigninLogs for error patterns
2. Analyze conditional access policy impacts
3. Review MFA authentication attempts
4. Validate user risk signals

### Query 1: Basic Sign-in Failures

\`\`\`kusto
SigninLogs
| where TimeGenerated > ago(24h)
| where ResultType != 0
| summarize FailureCount = count() by ResultType, ResultDescription
| order by FailureCount desc
\`\`\`

### Query 2: Conditional Access Impact

\`\`\`kql
SigninLogs
| where TimeGenerated > ago(7d)
| where ConditionalAccessStatus == "failure"
| project TimeGenerated, UserPrincipalName, AppDisplayName, ConditionalAccessPolicies
| order by TimeGenerated desc
\`\`\`

### Troubleshooting Tips
- Always check the correlation ID for detailed error tracking
- Review the conditional access policies applied to the user
- Validate MFA methods are properly configured

Tags: authentication, signin, troubleshooting, conditional-access
`
    },
    {
        name: 'provisioning-issues.md',
        content: `# User Provisioning Issues

## SCIM Provisioning Failures

### Overview
This guide helps troubleshoot SCIM-based user provisioning failures in Azure AD.

Common scenarios include:
- User creation failures
- Attribute mapping issues
- Sync conflicts

### Investigation Query

\`\`\`kusto
let ProvisioningLogs =
AuditLogs
| where Category == "ProvisioningLogs"
| where TimeGenerated > ago(24h);
ProvisioningLogs
| where Result == "failure"
| summarize count() by ResultReason
| order by count_ desc
\`\`\`

### Related Topics
- Azure AD Connect synchronization
- SCIM protocol specifications
- Attribute mappings configuration

Category: provisioning
Difficulty: intermediate
`
    },
    {
        name: 'performance-analysis.md',
        content: `# Performance Analysis Guide

## Slow Sign-in Investigation

### Description
Analyze slow authentication performance and identify bottlenecks.

### Performance Query

\`\`\`kql
SigninLogs
| where TimeGenerated > ago(1h)
| extend SigninDuration = datetime_diff('millisecond', TimeGenerated, CreatedDateTime)
| where SigninDuration > 5000
| summarize AvgDuration = avg(SigninDuration) by AppDisplayName
| order by AvgDuration desc
\`\`\`

Performance impact: high
Estimated time: 15 minutes
`
    }
];

async function createTestWikiStructure() {
    const testWikiPath = './test-wiki';

    try {
        // Create test directory structure
        await fs.mkdir(testWikiPath, { recursive: true });
        await fs.mkdir(path.join(testWikiPath, 'authentication'), { recursive: true });
        await fs.mkdir(path.join(testWikiPath, 'provisioning'), { recursive: true });
        await fs.mkdir(path.join(testWikiPath, 'performance'), { recursive: true });

        // Create sample files
        for (const file of sampleMarkdownFiles) {
            let targetPath;
            if (file.name.includes('authentication')) {
                targetPath = path.join(testWikiPath, 'authentication', file.name);
            } else if (file.name.includes('provisioning')) {
                targetPath = path.join(testWikiPath, 'provisioning', file.name);
            } else {
                targetPath = path.join(testWikiPath, 'performance', file.name);
            }

            await fs.writeFile(targetPath, file.content, 'utf-8');
        }

        console.log('✅ Test wiki structure created successfully!');
        console.log(`📁 Test wiki path: ${path.resolve(testWikiPath)}`);

        return path.resolve(testWikiPath);

    } catch (error) {
        console.error('❌ Failed to create test wiki structure:', error.message);
        throw error;
    }
}

async function runExtractionTest() {
    console.log('🧪 Starting WikiExtractor Test...\n');

    try {
        // Create test wiki structure
        const testWikiPath = await createTestWikiStructure();

        // Run extraction in dry-run mode
        console.log('\n🔍 Running extraction in dry-run mode...');
        const extractor = new WikiExtractor(testWikiPath, {
            dryRun: true,
            verbose: true,
            outputPath: './test-scenarios'
        });

        await extractor.extract();

        console.log('\n✅ Test completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Review the extraction results above');
        console.log('2. If satisfied, run the extraction on your actual wiki:');
        console.log('   node extract-wiki-scenarios.js /path/to/your/wiki --verbose');
        console.log('3. Remove --dry-run flag to save the results');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

async function cleanupTest() {
    try {
        await fs.rm('./test-wiki', { recursive: true });
        console.log('🧹 Test files cleaned up');
    } catch (error) {
        // Ignore cleanup errors
    }
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
WikiExtractor Test Script

Usage: node test-extraction.js [options]

Options:
  --cleanup          Remove test files and exit
  --keep-files       Keep test files after running test
  --help, -h         Show this help message

Examples:
  node test-extraction.js
  node test-extraction.js --keep-files
  node test-extraction.js --cleanup
        `);
        process.exit(0);
    }

    if (args.includes('--cleanup')) {
        await cleanupTest();
        process.exit(0);
    }

    try {
        await runExtractionTest();

        if (!args.includes('--keep-files')) {
            await cleanupTest();
        }
    } catch (error) {
        console.error('Test failed:', error.message);
        process.exit(1);
    }
}

// Export for programmatic use
module.exports = {
    createTestWikiStructure,
    runExtractionTest,
    cleanupTest
};

// Run if called directly
if (require.main === module) {
    main();
}
