// Sample data for DiagnosticIQ
const cheatSheets = [
    {
        id: 1,
        title: "Cross Tenant Sync Issues",
        category: "sync",
        cluster: "prod",
        description: "Troubleshoot Cross Tenant Synchronization issues including failed syncs, permission errors, and configuration problems.",
        queries: [
            {
                name: "Check Sync Status and Errors",
                description: "Monitor recent Cross Tenant Sync operations and identify failures",
                query: `// Cross Tenant Sync - Check sync status and errors
AuditLogs
| where TimeGenerated > ago(24h)
| where Category == "CrossTenantAccessSettings"
| where OperationName contains "Sync"
| extend TargetTenant = tostring(TargetResources[0].displayName)
| extend Result = tostring(Result)
| extend ErrorCode = tostring(ResultReason)
| project TimeGenerated, OperationName, Result, ErrorCode, TargetTenant, InitiatedBy
| order by TimeGenerated desc`
            },
            {
                name: "Permission Issues Analysis",
                description: "Identify permission-related failures in cross-tenant operations",
                query: `// Cross Tenant Sync - Permission analysis
AuditLogs
| where TimeGenerated > ago(24h)
| where Category == "CrossTenantAccessSettings"
| where Result == "failure"
| where ResultReason contains "permission" or ResultReason contains "forbidden" or ResultReason contains "unauthorized"
| extend TargetTenant = tostring(TargetResources[0].displayName)
| extend Actor = tostring(InitiatedBy.user.userPrincipalName)
| project TimeGenerated, OperationName, Actor, TargetTenant, ResultReason
| summarize FailureCount = count() by ResultReason, TargetTenant
| order by FailureCount desc`
            },
            {
                name: "Sync Configuration Analysis",
                description: "Review cross-tenant sync configuration and scope settings",
                query: `// Cross Tenant Sync - Configuration review
AuditLogs
| where TimeGenerated > ago(7d)
| where Category == "CrossTenantAccessSettings"
| where OperationName contains "Configure" or OperationName contains "Update"
| extend TargetTenant = tostring(TargetResources[0].displayName)
| extend ConfigChange = tostring(TargetResources[0].modifiedProperties)
| extend Actor = tostring(InitiatedBy.user.userPrincipalName)
| project TimeGenerated, OperationName, Actor, TargetTenant, ConfigChange
| order by TimeGenerated desc`
            }
        ],
        steps: [
            "Verify Cross Tenant Sync configuration in Azure AD",
            "Check if proper permissions are granted between tenants",
            "Review audit logs for sync failures using the KQL query above",
            "Validate user/group scope settings",
            "Check network connectivity between tenant endpoints",
            "Verify that the sync service principal has required permissions"
        ],
        tags: ["cross-tenant", "sync", "b2b", "collaboration"]
    },
    {
        id: 2,
        title: "Authentication Failures Analysis",
        category: "auth",
        cluster: "prod",
        description: "Analyze authentication failures including sign-in errors, MFA issues, and conditional access blocks.",
        queries: [
            {
                name: "Overall Authentication Failures",
                description: "Get a high-level view of authentication failures by error code and application",
                query: `// Authentication Failures - Overview
SigninLogs
| where TimeGenerated > ago(4h)
| where ResultType != "0"  // Non-successful sign-ins
| extend ErrorCode = tostring(Status.errorCode)
| extend FailureReason = tostring(Status.failureReason)
| extend ConditionalAccessStatus = tostring(ConditionalAccessStatus)
| summarize FailureCount = count() by ErrorCode, FailureReason, ConditionalAccessStatus, AppDisplayName
| order by FailureCount desc`
            },
            {
                name: "MFA-Related Failures",
                description: "Focus on Multi-Factor Authentication related sign-in issues",
                query: `// Authentication Failures - MFA specific
SigninLogs
| where TimeGenerated > ago(4h)
| where ResultType != "0"
| where Status.failureReason contains "MFA" or Status.failureReason contains "authentication"
| extend MFAMethod = tostring(AuthenticationDetails[0].authenticationMethod)
| extend MFAResult = tostring(AuthenticationDetails[0].succeeded)
| project TimeGenerated, UserPrincipalName, AppDisplayName, MFAMethod, MFAResult, Status
| order by TimeGenerated desc`
            },
            {
                name: "Conditional Access Blocks",
                description: "Analyze sign-ins blocked by conditional access policies",
                query: `// Authentication Failures - Conditional Access
SigninLogs
| where TimeGenerated > ago(4h)
| where ConditionalAccessStatus == "failure"
| mv-expand ConditionalAccessPolicies
| extend PolicyName = tostring(ConditionalAccessPolicies.displayName)
| extend PolicyResult = tostring(ConditionalAccessPolicies.result)
| where PolicyResult == "failure"
| project TimeGenerated, UserPrincipalName, AppDisplayName, PolicyName, PolicyResult
| summarize BlockCount = count() by PolicyName, AppDisplayName
| order by BlockCount desc`
            }
        ],
        steps: [
            "Run the overview query to identify the most common authentication failures",
            "Check if failures are related to conditional access policies",
            "Use the MFA query to verify MFA configuration if MFA-related errors appear",
            "Review conditional access policies that are blocking users",
            "Check user risk policies if risk-based failures occur",
            "Validate user account status and licensing",
            "Review application-specific authentication requirements"
        ],
        tags: ["authentication", "signin", "mfa", "conditional-access"]
    },
    {
        id: 3,
        title: "User Provisioning Errors",
        category: "provisioning",
        cluster: "prod",
        description: "Investigate user provisioning failures in connected applications and services.",
        queries: [
            {
                name: "Recent Provisioning Failures",
                description: "Get all recent provisioning failures across applications",
                query: `// User Provisioning Errors - Recent failures
AuditLogs
| where TimeGenerated > ago(6h)
| where Category == "ApplicationManagement"
| where OperationName contains "Provision"
| where Result == "failure"
| extend TargetApp = tostring(TargetResources[0].displayName)
| extend UserPrincipalName = tostring(TargetResources[0].userPrincipalName)
| extend ErrorDetails = tostring(ResultReason)
| project TimeGenerated, OperationName, TargetApp, UserPrincipalName, ErrorDetails
| order by TimeGenerated desc`
            },
            {
                name: "Provisioning Failures by Application",
                description: "Summary of provisioning failures grouped by application",
                query: `// User Provisioning Errors - By application
AuditLogs
| where TimeGenerated > ago(24h)
| where Category == "ApplicationManagement"
| where OperationName contains "Provision"
| where Result == "failure"
| extend TargetApp = tostring(TargetResources[0].displayName)
| extend ErrorCode = tostring(ResultReason)
| summarize FailureCount = count() by TargetApp, ErrorCode
| order by FailureCount desc`
            },
            {
                name: "SCIM Provisioning Issues",
                description: "Focus on SCIM-related provisioning problems",
                query: `// User Provisioning Errors - SCIM specific
AuditLogs
| where TimeGenerated > ago(12h)
| where Category == "ApplicationManagement"
| where OperationName contains "SCIM" or ResultReason contains "SCIM"
| extend TargetApp = tostring(TargetResources[0].displayName)
| extend SCIMError = tostring(ResultReason)
| extend UserPrincipalName = tostring(TargetResources[0].userPrincipalName)
| project TimeGenerated, OperationName, TargetApp, UserPrincipalName, SCIMError
| order by TimeGenerated desc`
            }
        ],
        steps: [
            "Run the recent failures query to identify which applications are experiencing provisioning failures",
            "Use the application summary to see which apps have the most issues",
            "Check if the failures are user-specific or application-wide",
            "For SCIM apps, run the SCIM-specific query to identify protocol issues",
            "Verify application configuration and attribute mappings",
            "Review service principal permissions for the target application",
            "Check if the target application service is accessible",
            "Validate user attributes required for provisioning"
        ],
        tags: ["provisioning", "applications", "scim", "user-management"]
    },
    {
        id: 4,
        title: "Performance Issues - Slow Sign-ins",
        category: "performance",
        cluster: "prod",
        description: "Analyze slow authentication performance and identify bottlenecks in the sign-in process.",
        queries: [
            {
                name: "Slow Sign-ins Overview",
                description: "Identify sign-ins taking longer than expected",
                query: `// Performance Analysis - Slow Sign-ins
SigninLogs
| where TimeGenerated > ago(2h)
| where ProcessingTimeInMilliseconds > 5000  // Sign-ins taking more than 5 seconds
| extend ProcessingTimeSeconds = ProcessingTimeInMilliseconds / 1000.0
| project TimeGenerated, UserPrincipalName, AppDisplayName, ProcessingTimeSeconds,
          LocationDetails, DeviceDetail, ConditionalAccessStatus
| order by ProcessingTimeSeconds desc`
            },
            {
                name: "Performance by Location",
                description: "Analyze performance issues by geographic location",
                query: `// Performance Analysis - By location
SigninLogs
| where TimeGenerated > ago(4h)
| where ProcessingTimeInMilliseconds > 3000
| extend ProcessingTimeSeconds = ProcessingTimeInMilliseconds / 1000.0
| extend Country = tostring(LocationDetails.countryOrRegion)
| extend City = tostring(LocationDetails.city)
| summarize AvgProcessingTime = avg(ProcessingTimeSeconds), Count = count() by Country, City
| where Count > 5
| order by AvgProcessingTime desc`
            },
            {
                name: "Conditional Access Performance Impact",
                description: "Measure the performance impact of conditional access policies",
                query: `// Performance Analysis - Conditional Access impact
SigninLogs
| where TimeGenerated > ago(2h)
| where isnotempty(ConditionalAccessPolicies)
| extend ProcessingTimeSeconds = ProcessingTimeInMilliseconds / 1000.0
| extend PolicyCount = array_length(ConditionalAccessPolicies)
| summarize AvgProcessingTime = avg(ProcessingTimeSeconds) by PolicyCount
| order by PolicyCount desc`
            }
        ],
        steps: [
            "Run the slow sign-ins query to identify users and applications with consistently slow sign-ins",
            "Use the location analysis to check if delays are location-specific (network latency)",
            "Review conditional access policy evaluation times using the CA impact query",
            "Analyze device-based authentication factors",
            "Check if MFA methods are causing delays",
            "Monitor for patterns in slow authentication times",
            "Consider geographic distribution of authentication endpoints"
        ],
        tags: ["performance", "latency", "signin", "optimization"]
    },
    {
        id: 5,
        title: "Guest User Access Issues",
        category: "auth",
        cluster: "prod",
        description: "Troubleshoot guest user access problems including invitation redemption and permission issues.",
        queries: [
            {
                name: "Guest User Invitation Status",
                description: "Track guest user invitations and redemption status",
                query: `// Guest User Access Issues - Invitation tracking
AuditLogs
| where TimeGenerated > ago(12h)
| where Category == "UserManagement"
| where OperationName contains "Invite" or OperationName contains "Guest"
| extend GuestUser = tostring(TargetResources[0].userPrincipalName)
| extend InvitationStatus = tostring(Result)
| extend InviterUser = tostring(InitiatedBy.user.userPrincipalName)
| project TimeGenerated, OperationName, GuestUser, InviterUser, InvitationStatus, ResultReason
| order by TimeGenerated desc`
            },
            {
                name: "Guest User Sign-in Issues",
                description: "Analyze sign-in problems specific to guest users",
                query: `// Guest User Access Issues - Sign-in problems
SigninLogs
| where TimeGenerated > ago(4h)
| where UserType == "Guest"
| where ResultType != "0"
| extend GuestUserUPN = tostring(UserPrincipalName)
| extend FailureReason = tostring(Status.failureReason)
| extend ErrorCode = tostring(Status.errorCode)
| project TimeGenerated, GuestUserUPN, AppDisplayName, FailureReason, ErrorCode, ConditionalAccessStatus
| order by TimeGenerated desc`
            },
            {
                name: "B2B Collaboration Policy Blocks",
                description: "Identify guests blocked by B2B collaboration policies",
                query: `// Guest User Access Issues - B2B policy blocks
AuditLogs
| where TimeGenerated > ago(24h)
| where Category == "B2BCollaboration" or ResultReason contains "B2B"
| where Result == "failure"
| extend GuestUser = tostring(TargetResources[0].userPrincipalName)
| extend BlockReason = tostring(ResultReason)
| extend InviterTenant = tostring(InitiatedBy.app.displayName)
| project TimeGenerated, OperationName, GuestUser, BlockReason, InviterTenant
| order by TimeGenerated desc`
            }
        ],
        steps: [
            "Use the invitation tracking query to check guest user invitation status and redemption",
            "Run the sign-in issues query to identify authentication problems for guest users",
            "Check B2B collaboration policy blocks using the policy blocks query",
            "Verify external collaboration settings are properly configured",
            "Review B2B collaboration policies and restrictions",
            "Check if guest user has proper application permissions",
            "Validate domain allow/block lists for external users",
            "Ensure guest user's home tenant allows external collaboration"
        ],
        tags: ["guest-users", "b2b", "external-collaboration", "invitations"]
    },
    {
        id: 6,
        title: "Application Registration Issues",
        category: "applications",
        cluster: "prod",
        description: "Troubleshoot application registration, consent, and permission-related issues.",
        queries: [
            {
                name: "Application Registration Failures",
                description: "Track failed application registrations and updates",
                query: `// Application Registration Issues - Registration failures
AuditLogs
| where TimeGenerated > ago(12h)
| where Category == "ApplicationManagement"
| where OperationName contains "Register" or OperationName contains "Update application"
| where Result == "failure"
| extend AppName = tostring(TargetResources[0].displayName)
| extend ErrorDetails = tostring(ResultReason)
| extend Actor = tostring(InitiatedBy.user.userPrincipalName)
| project TimeGenerated, OperationName, AppName, Actor, ErrorDetails
| order by TimeGenerated desc`
            },
            {
                name: "Consent and Permission Issues",
                description: "Analyze application consent failures and permission grants",
                query: `// Application Registration Issues - Consent problems
AuditLogs
| where TimeGenerated > ago(24h)
| where Category == "ApplicationManagement"
| where OperationName contains "Consent" or OperationName contains "Permission"
| extend AppName = tostring(TargetResources[0].displayName)
| extend ConsentType = tostring(TargetResources[0].type)
| extend Permissions = tostring(TargetResources[0].modifiedProperties)
| extend User = tostring(InitiatedBy.user.userPrincipalName)
| project TimeGenerated, OperationName, AppName, ConsentType, User, Result, Permissions
| order by TimeGenerated desc`
            },
            {
                name: "Service Principal Creation Issues",
                description: "Monitor service principal creation and configuration problems",
                query: `// Application Registration Issues - Service Principal problems
AuditLogs
| where TimeGenerated > ago(12h)
| where Category == "ApplicationManagement"
| where OperationName contains "Add service principal" or OperationName contains "Update service principal"
| where Result == "failure"
| extend ServicePrincipalName = tostring(TargetResources[0].displayName)
| extend ErrorDetails = tostring(ResultReason)
| extend Actor = tostring(InitiatedBy.user.userPrincipalName)
| project TimeGenerated, OperationName, ServicePrincipalName, Actor, ErrorDetails
| order by TimeGenerated desc`
            }
        ],
        steps: [
            "Run the registration failures query to identify app registration issues",
            "Use the consent query to check for permission and consent problems",
            "Monitor service principal creation issues with the SP query",
            "Verify the user has appropriate permissions to register applications",
            "Check if application registration policies are blocking creation",
            "Review required vs. delegated permissions for the application",
            "Validate redirect URIs and application manifest settings",
            "Ensure service principal has necessary API permissions"
        ],
        tags: ["applications", "registration", "consent", "service-principal", "permissions"]
    },
    {
        id: 7,
        title: "Hybrid Identity Sync Issues",
        category: "sync",
        cluster: "prod",
        description: "Diagnose Azure AD Connect and hybrid identity synchronization problems.",
        queries: [
            {
                name: "AD Connect Sync Errors",
                description: "Monitor Azure AD Connect synchronization errors and failures",
                query: `// Hybrid Identity - AD Connect sync errors
AuditLogs
| where TimeGenerated > ago(6h)
| where Category == "DirectorySync"
| where Result == "failure"
| extend SyncError = tostring(ResultReason)
| extend ObjectType = tostring(TargetResources[0].type)
| extend ObjectName = tostring(TargetResources[0].displayName)
| extend SourceAnchor = tostring(TargetResources[0].id)
| project TimeGenerated, OperationName, ObjectType, ObjectName, SyncError, SourceAnchor
| order by TimeGenerated desc`
            },
            {
                name: "Password Hash Sync Issues",
                description: "Analyze password hash synchronization problems",
                query: `// Hybrid Identity - Password Hash Sync issues
AuditLogs
| where TimeGenerated > ago(12h)
| where Category == "DirectorySync"
| where OperationName contains "Password" or ResultReason contains "password"
| extend UserUPN = tostring(TargetResources[0].userPrincipalName)
| extend SyncResult = tostring(Result)
| extend PasswordSyncError = tostring(ResultReason)
| project TimeGenerated, OperationName, UserUPN, SyncResult, PasswordSyncError
| order by TimeGenerated desc`
            },
            {
                name: "Object Synchronization Status",
                description: "Track object sync status and identify stuck synchronizations",
                query: `// Hybrid Identity - Object sync status
AuditLogs
| where TimeGenerated > ago(4h)
| where Category == "DirectorySync"
| extend ObjectType = tostring(TargetResources[0].type)
| extend SyncResult = tostring(Result)
| summarize SyncCount = count() by ObjectType, SyncResult, bin(TimeGenerated, 30m)
| order by TimeGenerated desc`
            }
        ],
        steps: [
            "Use the AD Connect sync errors query to identify recent synchronization failures",
            "Run the password hash sync query if users report authentication issues",
            "Monitor object synchronization patterns with the sync status query",
            "Check Azure AD Connect server health and connectivity",
            "Verify that the AD Connect service account has proper permissions",
            "Review attribute mapping and filtering rules",
            "Check for duplicate objects or conflicting source anchors",
            "Validate forest and domain functional levels"
        ],
        tags: ["hybrid-identity", "ad-connect", "sync", "directory-sync", "password-sync"]
    }
];

// Additional sample data for demonstration
const recentQueries = [
    { title: "Cross Tenant Sync Issues", timestamp: "10 minutes ago" },
    { title: "Authentication Failures", timestamp: "1 hour ago" },
    { title: "MFA Configuration", timestamp: "2 hours ago" }
];

// Export data for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { cheatSheets, recentQueries };
}
