/**
 * Test script to debug KQL pattern extraction
 */

const fs = require('fs').promises;

async function testKQLPatterns() {
    const filePath = "c:\\Wiki\\AzureAD\\AzureAD\\GeneralPages\\AAD\\AAD-Sync\\Cross-tenant-synchronization\\TSG-Cross%2Dtenant-sync-(Azure2Azure-scenarios).md";

    try {
        // Try different encodings
        console.log('📄 Testing different encodings...');

        const encodings = ['utf-8', 'utf16le', 'latin1'];

        for (const encoding of encodings) {
            try {
                console.log(`\n🔍 Testing encoding: ${encoding}`);
                const content = await fs.readFile(filePath, encoding);
                console.log(`� File size: ${content.length} characters`);

                // Test basic searches
                const globalIfxCount = (content.match(/GlobalIfxRunProfileStatisticsEvent/g) || []).length;
                const codeBlockCount = (content.match(/```/g) || []).length;
                const whereCount = (content.match(/\|\s*where/g) || []).length;

                console.log(`  GlobalIfxRunProfileStatisticsEvent: ${globalIfxCount} occurrences`);
                console.log(`  Code blocks (```): ${codeBlockCount} occurrences`);
                console.log(`  | where: ${whereCount} occurrences`);

                if (globalIfxCount > 0) {
                    console.log(`✅ Found content with ${encoding} encoding!`);

                    // Show a sample
                    const match = content.match(/(GlobalIfxRunProfileStatisticsEvent[\s\S]{0,200})/);
                    if (match) {
                        console.log(`Sample: ${match[1].replace(/\n/g, '\\n')}`);
                    }

                    break; // Found the right encoding
                }

            } catch (err) {
                console.log(`  Error with ${encoding}: ${err.message}`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

        // Updated patterns from the main script
        const kqlPatterns = [
            // Standard KQL code blocks with language specifier
            /```(kusto|kql)\s*\n([\s\S]*?)\n```/gi,

            // Plain code blocks containing KQL table references
            /```\s*\n([\s\S]*?(?:SigninLogs|AuditLogs|AADNonInteractiveUserSignInLogs|AADServicePrincipalSignInLogs|IdentityInfo|IdentityDirectoryEvents|GlobalIfxRunProfileStatisticsEvent|GlobalIfxAuditEvent|GlobalIfxAllTraces)[\s\S]*?)\n```/gi,

            // Plain code blocks with KQL operators
            /```\s*\n([\s\S]*?(?:\|\s*where|\|\s*project|\|\s*summarize|\|\s*extend|\|\s*join|let\s+\w+\s*=)[\s\S]*?)\n```/gi,

            // Standalone let statements
            /let\s+\w+\s*=.*?;/gi,

            // KQL queries not in code blocks (loose matching)
            /(?:^|\n)([^\n]*(?:GlobalIfxRunProfileStatisticsEvent|GlobalIfxAuditEvent|GlobalIfxAllTraces|SigninLogs|AuditLogs)[^\n]*(?:\n[^\n]*\|\s*where[^\n]*)*)/gim,

            // Multi-line KQL queries starting with table name
            /(?:^|\n)((?:GlobalIfxRunProfileStatisticsEvent|GlobalIfxAuditEvent|GlobalIfxAllTraces|SigninLogs|AuditLogs)[\s\S]*?(?=\n\n|\n```|\n#|$))/gim
        ];

        console.log('\n🔍 Testing updated KQL patterns:');

        for (let i = 0; i < kqlPatterns.length; i++) {
            const pattern = kqlPatterns[i];
            console.log(`\nPattern ${i + 1}:`);
            console.log(`  Regex: ${pattern.source.substring(0, 100)}...`);

            let match;
            let matchCount = 0;
            pattern.lastIndex = 0; // Reset regex

            while ((match = pattern.exec(content)) !== null) {
                matchCount++;
                const kql = match[2] || match[1];
                console.log(`  Match ${matchCount}:`);
                console.log(`    Preview: ${kql.substring(0, 200).replace(/\n/g, '\\n')}...`);
                console.log(`    Length: ${kql.length}`);

                if (matchCount >= 2) break; // Limit output
            }

            if (matchCount === 0) {
                console.log(`  No matches found`);
            } else {
                console.log(`  Total matches: ${matchCount}`);
            }
        }

        // Also test basic string search
        console.log('\n🔍 Basic string searches:');
        const searches = [
            'GlobalIfxRunProfileStatisticsEvent',
            '```',
            '\\| where', // Escaped for regex
            'ago\\(', // Escaped for regex
            'contextId',
            'correlationId'
        ];
        searches.forEach(search => {
            try {
                const count = (content.match(new RegExp(search, 'g')) || []).length;
                console.log(`  "${search}": ${count} occurrences`);
            } catch (error) {
                console.log(`  "${search}": Error - ${error.message}`);
            }
        });

        // Look for code blocks manually
        console.log('\n🔍 Manual code block analysis:');
        const codeBlocks = content.split('```');
        console.log(`  Found ${Math.floor(codeBlocks.length / 2)} code blocks`);

        for (let i = 1; i < codeBlocks.length; i += 2) {
            const block = codeBlocks[i];
            if (block.includes('GlobalIfx') || block.includes('| where')) {
                console.log(`  Code block ${Math.floor(i/2) + 1}:`);
                console.log(`    Preview: ${block.substring(0, 200).replace(/\n/g, '\\n')}...`);
                console.log(`    Contains KQL: ${block.includes('GlobalIfx') || block.includes('| where')}`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testKQLPatterns();
