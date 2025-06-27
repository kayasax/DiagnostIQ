/**
 * Debug script to test KQL extraction from wiki files
 */

const fs = require('fs').promises;

async function debugKQLExtraction() {
    const filePath = "C:\\Wiki\\AzureAD\\AzureAD\\GeneralPages\\AAD\\AAD-Sync\\Cross-tenant-synchronization\\TSG-Cross%2Dtenant-sync-(Azure2Azure-scenarios).md";

    try {
        const content = await fs.readFile(filePath, 'utf-8');
        console.log('📄 File loaded successfully');
        console.log(`📊 File size: ${content.length} characters`);

        // Test our KQL patterns
        const kqlPatterns = [
            /```(kusto|kql)\s*\n([\s\S]*?)\n```/gi,
            /```\s*\n([^`]*(?:SigninLogs|AuditLogs|AADNonInteractiveUserSignInLogs|AADServicePrincipalSignInLogs|IdentityInfo|IdentityDirectoryEvents|GlobalIfxRunProfileStatisticsEvent|GlobalIfxAuditEvent|GlobalIfxAllTraces)[^`]*)\n```/gi,
            /```\s*\n([^`]*(?:\|\s*where|\|\s*project|\|\s*summarize|\|\s*extend|\|\s*join|let\s+\w+\s*=)[^`]*)\n```/gi,
            /let\s+\w+\s*=.*;/gi,
            /\w+\s*\|\s*where\s+/gi
        ];

        console.log('\n🔍 Testing KQL patterns:');

        for (let i = 0; i < kqlPatterns.length; i++) {
            const pattern = kqlPatterns[i];
            console.log(`\nPattern ${i + 1}:`, pattern.source);

            let match;
            let matchCount = 0;
            pattern.lastIndex = 0; // Reset regex

            while ((match = pattern.exec(content)) !== null) {
                matchCount++;
                const kql = match[2] || match[1];
                console.log(`  Match ${matchCount}:`);
                console.log(`    Text: ${kql.substring(0, 100)}...`);
                console.log(`    Length: ${kql.length}`);

                if (matchCount >= 3) break; // Limit output
            }

            if (matchCount === 0) {
                console.log(`  No matches found`);
            } else {
                console.log(`  Total matches: ${matchCount}`);
            }
        }

        // Look for code blocks manually
        console.log('\n🔍 Manual code block detection:');
        const codeBlocks = content.match(/```[\s\S]*?```/g);
        if (codeBlocks) {
            console.log(`Found ${codeBlocks.length} code blocks:`);
            codeBlocks.forEach((block, index) => {
                console.log(`\nBlock ${index + 1}:`);
                console.log(`Length: ${block.length}`);
                console.log(`First 200 chars: ${block.substring(0, 200)}...`);

                // Test if this looks like KQL
                const kqlIndicators = [
                    /\|\s*(where|project|extend|summarize|join|union|sort|take|limit)/i,
                    /(SigninLogs|AuditLogs|AADNonInteractiveUserSignInLogs|AADServicePrincipalSignInLogs|IdentityInfo|IdentityDirectoryEvents)/i,
                    /(GlobalIfxRunProfileStatisticsEvent|GlobalIfxAuditEvent|GlobalIfxAllTraces)/i,
                    /let\s+\w+\s*=/i,
                    /\w+\s*\|\s*where/i,
                    /parse\s+\w+\s+with/i,
                    /ago\(\d+[dhm]\)/i
                ];

                const hasKQL = kqlIndicators.some(pattern => pattern.test(block));
                console.log(`Contains KQL indicators: ${hasKQL}`);

                if (hasKQL) {
                    console.log('🎯 This looks like a KQL query!');
                    console.log(`Full block:\n${block}`);
                }
            });
        } else {
            console.log('No code blocks found');
        }

        // Check for specific table names
        console.log('\n🔍 Checking for specific table references:');
        const tables = ['GlobalIfxRunProfileStatisticsEvent', 'GlobalIfxAuditEvent', 'GlobalIfxAllTraces', 'SigninLogs', 'AuditLogs'];
        tables.forEach(table => {
            const count = (content.match(new RegExp(table, 'g')) || []).length;
            console.log(`  ${table}: ${count} occurrences`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

debugKQLExtraction();
