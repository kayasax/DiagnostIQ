const fs = require('fs');

// Test KQL pattern matching with the real wiki file
const filePath = 'c:/Wiki/AzureAD/AzureAD/GeneralPages/AAD/AAD-Sync/Cross-tenant-synchronization/TSG-Cross%2Dtenant-sync-(Azure2Azure-scenarios).md';

console.log('Testing KQL pattern extraction...\n');

function tryReadFile(filePath) {
    const encodings = ['utf8', 'utf16le', 'latin1'];

    for (const encoding of encodings) {
        try {
            console.log(`🔍 Trying encoding: ${encoding}`);
            let content = fs.readFileSync(filePath, encoding);

            // Remove BOM if present
            if (content.charCodeAt(0) === 0xFEFF) {
                console.log('🔧 Removed BOM from file content');
                content = content.slice(1);
            }

            // Test if this encoding makes sense by looking for common characters
            if (encoding === 'utf16le') {
                // For UTF-16, check if we have reasonable text
                const testChars = content.substring(0, 100);
                const nullCount = (testChars.match(/\u0000/g) || []).length;
                if (nullCount > testChars.length * 0.3) {
                    console.log(`❌ Too many null characters, trying next encoding`);
                    continue;
                }
            }

            // Quick test for expected content
            if (content.includes('Tags:') || content.includes('GlobalIfx') || content.includes('```')) {
                console.log(`✅ Found readable content with ${encoding} encoding!`);
                return content;
            }

        } catch (error) {
            console.log(`❌ Error with ${encoding}: ${error.message}`);
        }
    }

    throw new Error('Could not read file with any supported encoding');
}

try {
    const content = tryReadFile(filePath);

    console.log(`📄 File length: ${content.length} characters`);
    console.log(`📄 First 200 characters: ${JSON.stringify(content.substring(0, 200))}`);

    // Enhanced patterns that match the extract-wiki-scenarios.js
    const kqlPatterns = [
        /```(?:kusto|kql)[\s\r\n]+([\s\S]*?)[\s\r\n]*```/gi,
        /```[\s\r\n]*([\s\S]*?(?:SigninLogs|AuditLogs|AADNonInteractiveUserSignInLogs|AADServicePrincipalSignInLogs|IdentityInfo|IdentityDirectoryEvents|GlobalIfxRunProfileStatisticsEvent|GlobalIfxAuditEvent|GlobalIfxAllTraces)[\s\S]*?)[\s\r\n]*```/gi,
        /```[\s\r\n]*([\s\S]*?(?:\|\s*where|\|\s*project|\|\s*summarize|\|\s*extend|\|\s*join|let\s+\w+\s*=)[\s\S]*?)[\s\r\n]*```/gi,
        /let\s+\w+\s*=\s*[^;]+;/gi,
        /(?:^|\r?\n)[ \t]*([^\r\n]*(?:GlobalIfxRunProfileStatisticsEvent|GlobalIfxAuditEvent|GlobalIfxAllTraces|SigninLogs|AuditLogs)[^\r\n]*(?:(?:\r?\n[ \t]*[^\r\n]*\|\s*where[^\r\n]*)*)?)/gim,
        /(?:^|\r?\n)[ \t]*((?:GlobalIfxRunProfileStatisticsEvent|GlobalIfxAuditEvent|GlobalIfxAllTraces|SigninLogs|AuditLogs)[\s\S]*?(?=(?:\r?\n){2,}|\r?\n```|\r?\n#|$))/gim
    ];

    console.log('\n🔍 Testing patterns:\n');

    kqlPatterns.forEach((pattern, index) => {
        console.log(`Pattern ${index + 1}:`);
        const matches = [...content.matchAll(pattern)];
        console.log(`  Found ${matches.length} matches`);

        matches.forEach((match, matchIndex) => {
            const queryContent = match[1] || match[0];
            console.log(`  Match ${matchIndex + 1}:`);
            console.log(`    Content preview: ${JSON.stringify(queryContent.substring(0, 100))}...`);
            console.log(`    Length: ${queryContent.length}`);
        });
        console.log('');
    });

    // Test with a simple code block search
    console.log('\n🔍 Simple code block test:');
    const simpleCodeBlocks = content.match(/```[\s\S]*?```/g);
    console.log(`Found ${simpleCodeBlocks ? simpleCodeBlocks.length : 0} code blocks`);

    if (simpleCodeBlocks) {
        simpleCodeBlocks.slice(0, 3).forEach((block, index) => {
            console.log(`Code block ${index + 1}:`);
            console.log(`  Preview: ${JSON.stringify(block.substring(0, 150))}...`);
        });
    }

    // Test for specific table names
    console.log('\n🔍 Table name search:');
    const tableNames = ['SigninLogs', 'AuditLogs', 'GlobalIfxRunProfileStatisticsEvent', 'GlobalIfxAuditEvent', 'GlobalIfxAllTraces'];

    tableNames.forEach(tableName => {
        const count = (content.match(new RegExp(tableName, 'gi')) || []).length;
        console.log(`  ${tableName}: ${count} occurrences`);
    });

} catch (error) {
    console.error('❌ Error:', error.message);
}
