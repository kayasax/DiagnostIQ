// DEBUG SCRIPT: Analyze localStorage vs Files Scenario Mismatch

function analyzeScenarioMismatch() {
    console.log('🔍 Starting scenario mismatch analysis...');

    // Get localStorage data
    const localStorageData = localStorage.getItem('diagnostiq_scenarios');
    if (!localStorageData) {
        console.log('❌ No localStorage data found');
        return;
    }

    const localScenarios = JSON.parse(localStorageData);
    console.log(`📦 localStorage: ${localScenarios.length} scenarios`);

    // Analyze scenario IDs for patterns
    const idPatterns = {
        userGenerated: [],
        timestampBased: [],
        duplicates: [],
        standardFormat: []
    };

    const seenIds = new Set();

    localScenarios.forEach((scenario, index) => {
        const id = scenario.id;

        // Check for duplicates
        if (seenIds.has(id)) {
            idPatterns.duplicates.push({ id, index });
        } else {
            seenIds.add(id);
        }

        // Analyze ID patterns
        if (/-(1[0-9]{12}|custom|user)/i.test(id)) {
            idPatterns.timestampBased.push({ id, index });
        } else if (scenario.isUserCreated || scenario.source === 'user') {
            idPatterns.userGenerated.push({ id, index });
        } else {
            idPatterns.standardFormat.push({ id, index });
        }
    });

    console.log('📊 ID Pattern Analysis:');
    console.log(`  Standard format: ${idPatterns.standardFormat.length}`);
    console.log(`  Timestamp-based: ${idPatterns.timestampBased.length}`);
    console.log(`  User-generated: ${idPatterns.userGenerated.length}`);
    console.log(`  Duplicates: ${idPatterns.duplicates.length}`);

    if (idPatterns.duplicates.length > 0) {
        console.log('🔍 Duplicate scenarios found:', idPatterns.duplicates);
    }

    if (idPatterns.timestampBased.length > 0) {
        console.log('🔍 Timestamp-based scenarios:', idPatterns.timestampBased.slice(0, 5));
    }

    if (idPatterns.userGenerated.length > 0) {
        console.log('🔍 User-generated scenarios:', idPatterns.userGenerated.slice(0, 5));
    }

    // Check for scenarios with modification indicators
    const modifiedScenarios = localScenarios.filter(s =>
        s.lastModified || s.customTitle || s.userNotes || s.isCustom
    );

    console.log(`🔍 Modified scenarios: ${modifiedScenarios.length}`);
    if (modifiedScenarios.length > 0) {
        console.log('📝 Sample modified scenarios:', modifiedScenarios.slice(0, 3).map(s => ({
            id: s.id,
            lastModified: s.lastModified,
            customTitle: s.customTitle,
            userNotes: s.userNotes,
            isCustom: s.isCustom
        })));
    }

    // Look for the 3 extra scenarios
    const allIds = localScenarios.map(s => s.id).sort();
    console.log(`🔍 Total unique scenarios: ${seenIds.size}`);
    console.log(`🔍 Expected to find 3 extra scenarios (${localScenarios.length} - 350 = ${localScenarios.length - 350})`);

    // Check if any scenarios look suspicious
    const suspiciousScenarios = localScenarios.filter(s => {
        return (
            s.id && (
                s.id.includes('duplicate') ||
                s.id.includes('copy') ||
                s.id.includes('temp') ||
                /-(1[0-9]{12})/i.test(s.id)
            )
        );
    });

    if (suspiciousScenarios.length > 0) {
        console.log('🚨 Suspicious scenarios found:', suspiciousScenarios.map(s => ({
            id: s.id,
            title: s.title,
            isUserCreated: s.isUserCreated,
            source: s.source
        })));
    }

    return {
        total: localScenarios.length,
        unique: seenIds.size,
        patterns: idPatterns,
        modified: modifiedScenarios.length,
        suspicious: suspiciousScenarios.length
    };
}

// Run analysis
const analysis = analyzeScenarioMismatch();
console.log('📋 Analysis complete:', analysis);
