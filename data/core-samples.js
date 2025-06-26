// Core sample data for DiagnosticIQ - Quick Start Scenarios
// These are basic examples to get users started quickly

const coreSamples = [
    {
        id: 'core-1',
        title: "Quick Authentication Check",
        category: "auth",
        cluster: "prod",
        description: "Basic authentication failure analysis for quick troubleshooting.",
        queries: [
            {
                name: "Recent Sign-in Failures",
                description: "Get recent authentication failures with error codes",
                query: `// Quick Authentication Check
SigninLogs
| where TimeGenerated > ago(1h)
| where ResultType != "0"
| project TimeGenerated, UserPrincipalName, AppDisplayName, Status.errorCode, Status.failureReason
| order by TimeGenerated desc
| take 50`
            }
        ],
        steps: [
            "Check recent sign-in failures in the past hour",
            "Look for error patterns and affected users",
            "Review conditional access policies if needed"
        ],
        tags: ["quick", "auth", "basic"]
    },
    {
        id: 'core-2',
        title: "Basic Sync Status Check",
        category: "sync",
        cluster: "prod",
        description: "Quick overview of synchronization status and recent operations.",
        queries: [
            {
                name: "Recent Sync Operations",
                description: "Monitor recent synchronization activities",
                query: `// Basic Sync Check
AuditLogs
| where TimeGenerated > ago(2h)
| where Category == "DirectoryManagement"
| where OperationName contains "Sync"
| project TimeGenerated, OperationName, Result, ResultReason
| order by TimeGenerated desc
| take 25`
            }
        ],
        steps: [
            "Review recent sync operations",
            "Check for any failed synchronization attempts",
            "Verify sync service health"
        ],
        tags: ["quick", "sync", "basic"]
    }
];

// Export for use in the main application
window.coreSamples = coreSamples;
