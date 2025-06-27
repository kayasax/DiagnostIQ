// Script to update cross-tenant sync scenarios with correct cluster information
const fs = require('fs');
const path = require('path');

const syncDir = 'data/scenarios/synchronization';
const correctCluster = 'idsharedwus.kusto.windows.net';
const correctDatabase = 'AADSFprod';

// Files that should have the cross-tenant sync cluster
const crossTenantFiles = [
    'cross-tenant-sync-troubleshooting.json',
    'disable-sms-sign-in-for-a-user-and-clear-the-altsecid-4f3f5e80.json',
    'how-to-retrieve-more-data-about-the-cross-tenant-sync-configuration--e8f084e7.json',
    'i-m-unable-to-change-the-matching-attribute-6b9cd85f.json',
    'sync-fails-due-to-a-web-protocol-error-why--c18d1732.json',
    'test-connection-fails-3f0b8a37.json',
    'users-in-scope-are-not-syncing-a0e20cc8.json'
];

crossTenantFiles.forEach(filename => {
    const filePath = path.join(syncDir, filename);

    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);

            // Update cluster and add database
            data.cluster = correctCluster;
            data.database = correctDatabase;

            // Write back to file
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`✅ Updated ${filename}`);
        } else {
            console.log(`⚠️ File not found: ${filename}`);
        }
    } catch (error) {
        console.error(`❌ Error updating ${filename}:`, error.message);
    }
});

console.log('🎯 Cross-tenant sync cluster update complete!');
