# 🚀 BULK EXTRACTION: Process 20 Azure AD TSG Files (Files 15-34)

## Self-Contained Instructions for GitHub Copilot

### CONTEXT:
You are processing Azure Active Directory troubleshooting documentation for the DiagnostIQ application. This is a bulk extraction of 20 TSG (TroubleShooting Guide) files to convert them into structured JSON scenarios for a searchable knowledge base.

### EXTRACTION TEMPLATE:
Extract troubleshooting scenarios from Azure AD documentation and convert them to JSON format.

**RETURN FORMAT**: JSON array with this exact structure:
```json
[
  {
    "id": "scenario-id-kebab-case",
    "title": "Descriptive Scenario Title",
    "description": "Detailed problem description",
    "vertical": "DETERMINE_FROM_WIKI_PATH",
    "category": "DETERMINE_FROM_CONTENT",
    "tags": ["relevant", "tags", "for", "search"],
    "cluster": "EXTRACT_FROM_DOCS_OR_BLANK",
    "database": "EXTRACT_FROM_DOCS_OR_BLANK",
    "steps": [
      "Action-oriented step with specific commands or queries",
      "Another concise step with clear instructions",
      "Final step with expected outcome"
    ],
    "relatedKQL": [],
    "severity": "high|medium|low",
    "source": "source-filename.md"
  }
]
```

### CATEGORIZATION RULES:
**VERTICAL**: Determine from wiki path structure:
- **"Account Management"** - User lifecycle, B2B, B2C, Identity, Domain Services, PIM
- **"Auth"** - Authentication, MFA, Conditional Access, Sign-in issues, FIDO2
- **"Sync"** - Cross-tenant sync, AAD Connect, Provisioning, Directory sync
- **"Applications"** - App integration, SSO, App proxy, Enterprise apps
- **"Performance"** - Slow sign-ins, latency, optimization
- **"General"** - Fallback for misc scenarios

**CATEGORY**: Based on folder structure and content:
- Azure-AD-B2B folder → "b2b"
- Azure-AD-B2C folder → "b2c"
- Azure-AD-Domain-Services folder → "domain-services"
- Use kebab-case format, be specific over generic

### FILES TO PROCESS (20 Files):

**15. Azure-AD-B2B-TSG-%3A-Guest-user-can't-leave-an-organization.md**
- Path: `Wiki\AzureAD\AzureAD\GeneralPages\AAD\AAD-Account-Management\Azure-AD-B2B\Azure-AD-B2B-TSG-%3A-Guest-user-can't-leave-an-organization.md`
- Vertical: **Account Management**, Category: **b2b**
- Output: `temp/tobeprocessed/Azure-AD-B2B-TSG-%3A-Guest-user-can't-leave-an-organization-extracted-scenarios.json`

**16. Azure-AD-B2B-TSG-%3A-Request-MSIT-delete-guest-account-in-microsoft.onmicrosoft.com.md**
- Path: `Wiki\AzureAD\AzureAD\GeneralPages\AAD\AAD-Account-Management\Azure-AD-B2B\Azure-AD-B2B-TSG-%3A-Request-MSIT-delete-guest-account-in-microsoft.onmicrosoft.com.md`
- Vertical: **Account Management**, Category: **b2b**
- Output: `temp/tobeprocessed/Azure-AD-B2B-TSG-%3A-Request-MSIT-delete-guest-account-in-microsoft.onmicrosoft.com-extracted-scenarios.json`

**17. Azure-AD-B2C-Conditional-Access-and-Identity-Protection.md**
- Path: `Wiki\AzureAD\AzureAD\GeneralPages\AAD\AAD-Account-Management\Azure-AD-B2C\Azure-AD-B2C-Conditional-Access-and-Identity-Protection.md`
- Vertical: **Account Management**, Category: **b2c**
- Output: `temp/tobeprocessed/Azure-AD-B2C-Conditional-Access-and-Identity-Protection-extracted-scenarios.json`

**18. Azure-AD-B2C-Email-Delivery-Troubleshooting.md**
- Path: `Wiki\AzureAD\AzureAD\GeneralPages\AAD\AAD-Account-Management\Azure-AD-B2C\Azure-AD-B2C-Troubleshooting\Azure-AD-B2C-Email-Delivery-Troubleshooting.md`
- Vertical: **Account Management**, Category: **b2c**
- Output: `temp/tobeprocessed/Azure-AD-B2C-Email-Delivery-Troubleshooting-extracted-scenarios.json`

**19. Configure-Fiddler-to-show-column-values-for-troubleshooting-B2C-tickets.md**
- Path: `Wiki\AzureAD\AzureAD\GeneralPages\AAD\AAD-Account-Management\Azure-AD-B2C\Azure-AD-B2C-Troubleshooting\Configure-Fiddler-to-show-column-values-for-troubleshooting-B2C-tickets.md`
- Vertical: **Account Management**, Category: **b2c**
- Output: `temp/tobeprocessed/Configure-Fiddler-to-show-column-values-for-troubleshooting-B2C-tickets-extracted-scenarios.json`

**20. How-to-troubleshoot-Authentication-issues-With-a-SAML-IDP.md**
- Path: `Wiki\AzureAD\AzureAD\GeneralPages\AAD\AAD-Account-Management\Azure-AD-B2C\Azure-AD-B2C-Troubleshooting\How-to-troubleshoot-Authentication-issues-With-a-SAML-IDP.md`
- Vertical: **Account Management**, Category: **b2c**
- Output: `temp/tobeprocessed/How-to-troubleshoot-Authentication-issues-With-a-SAML-IDP-extracted-scenarios.json`

**21. TSG-%2D-Azure-AD-B2C-Deprecation-of-login.microsoftonline.com.md**
- Path: `Wiki\AzureAD\AzureAD\GeneralPages\AAD\AAD-Account-Management\Azure-AD-B2C\Azure-AD-B2C-Troubleshooting\TSG-%2D-Azure-AD-B2C-Deprecation-of-login.microsoftonline.com.md`
- Vertical: **Account Management**, Category: **b2c**
- Output: `temp/tobeprocessed/TSG-%2D-Azure-AD-B2C-Deprecation-of-login.microsoftonline.com-extracted-scenarios.json`

**22. TSG-%2D-Azure-AD-B2C-Legacy-TLS-(1.0,-1.1,-and-3DES)-deprecation-[Archived].md**
- Path: `Wiki\AzureAD\AzureAD\GeneralPages\AAD\AAD-Account-Management\Azure-AD-B2C\Azure-AD-B2C-Troubleshooting\TSG-%2D-Azure-AD-B2C-Legacy-TLS-(1.0,-1.1,-and-3DES)-deprecation-[Archived].md`
- Vertical: **Account Management**, Category: **b2c**
- Output: `temp/tobeprocessed/TSG-%2D-Azure-AD-B2C-Legacy-TLS-(1.0,-1.1,-and-3DES)-deprecation-[Archived]-extracted-scenarios.json`

**23. TSG-%2D-Custom-Page-Layout-not-showing-the-correct-label.md**
- Path: `Wiki\AzureAD\AzureAD\GeneralPages\AAD\AAD-Account-Management\Azure-AD-B2C\Azure-AD-B2C-Troubleshooting\TSG-%2D-Custom-Page-Layout-not-showing-the-correct-label.md`
- Vertical: **Account Management**, Category: **b2c**
- Output: `temp/tobeprocessed/TSG-%2D-Custom-Page-Layout-not-showing-the-correct-label-extracted-scenarios.json`

**24. TSG-%2D-Debug-Identity-provider-federation-with-Azure-AD-B2C.md**
- Path: `Wiki\AzureAD\AzureAD\GeneralPages\AAD\AAD-Account-Management\Azure-AD-B2C\Azure-AD-B2C-Troubleshooting\TSG-%2D-Debug-Identity-provider-federation-with-Azure-AD-B2C.md`
- Vertical: **Account Management**, Category: **b2c**
- Output: `temp/tobeprocessed/TSG-%2D-Debug-Identity-provider-federation-with-Azure-AD-B2C-extracted-scenarios.json`

**25. TSG-%2D-Undefined-error-in-SUSI-user-flow.md**
- Path: `Wiki\AzureAD\AzureAD\GeneralPages\AAD\AAD-Account-Management\Azure-AD-B2C\Azure-AD-B2C-Troubleshooting\TSG-%2D-Undefined-error-in-SUSI-user-flow.md`
- Vertical: **Account Management**, Category: **b2c**
- Output: `temp/tobeprocessed/TSG-%2D-Undefined-error-in-SUSI-user-flow-extracted-scenarios.json`

**26. TSG--%2D-Phone-MFA-Subscription-requirement.md**
- Path: `Wiki\AzureAD\AzureAD\GeneralPages\AAD\AAD-Account-Management\Azure-AD-B2C\Azure-AD-B2C-Troubleshooting\TSG--%2D-Phone-MFA-Subscription-requirement.md`
- Vertical: **Account Management**, Category: **b2c**
- Output: `temp/tobeprocessed/TSG--%2D-Phone-MFA-Subscription-requirement-extracted-scenarios.json`

**27. Azure-AD-B2C-Troubleshooting.md**
- Path: `Wiki\AzureAD\AzureAD\GeneralPages\AAD\AAD-Account-Management\Azure-AD-B2C\Azure-AD-B2C-Troubleshooting.md`
- Vertical: **Account Management**, Category: **b2c**
- Output: `temp/tobeprocessed/Azure-AD-B2C-Troubleshooting-extracted-scenarios.json`

**28. Azure-AD-Domain-Services-%2D-AAD-DS-Health-Alert-Troubleshooting.md**
- Path: `Wiki\AzureAD\AzureAD\GeneralPages\AAD\AAD-Account-Management\Azure-AD-Domain-Services\Azure-AD-Domain-Services-%2D-AAD-DS-Health-Alert-Troubleshooting.md`
- Vertical: **Account Management**, Category: **domain-services**
- Output: `temp/tobeprocessed/Azure-AD-Domain-Services-%2D-AAD-DS-Health-Alert-Troubleshooting-extracted-scenarios.json`

**29. Azure-AD-Domain-Services-%2D-Authentication-Data-Collection.md**
- Path: `Wiki\AzureAD\AzureAD\GeneralPages\AAD\AAD-Account-Management\Azure-AD-Domain-Services\Azure-AD-Domain-Services-%2D-Authentication-Data-Collection.md`
- Vertical: **Account Management**, Category: **domain-services**
- Output: `temp/tobeprocessed/Azure-AD-Domain-Services-%2D-Authentication-Data-Collection-extracted-scenarios.json`

**30. Azure-AD-Domain-Services-%2D-Data-Privacy-and-Geo-Compliance-Audit.md**
- Path: `Wiki\AzureAD\AzureAD\GeneralPages\AAD\AAD-Account-Management\Azure-AD-Domain-Services\Azure-AD-Domain-Services-%2D-Data-Privacy-and-Geo-Compliance-Audit.md`
- Vertical: **Account Management**, Category: **domain-services**
- Output: `temp/tobeprocessed/Azure-AD-Domain-Services-%2D-Data-Privacy-and-Geo-Compliance-Audit-extracted-scenarios.json`

**31. Azure-AD-Domain-Services-%2D-DNS-Troubleshooting.md**
- Path: `Wiki\AzureAD\AzureAD\GeneralPages\AAD\AAD-Account-Management\Azure-AD-Domain-Services\Azure-AD-Domain-Services-%2D-DNS-Troubleshooting.md`
- Vertical: **Account Management**, Category: **domain-services**
- Output: `temp/tobeprocessed/Azure-AD-Domain-Services-%2D-DNS-Troubleshooting-extracted-scenarios.json`

**32. Azure-AD-Domain-Services-%2D-LDAPS-Troubleshooting.md**
- Path: `Wiki\AzureAD\AzureAD\GeneralPages\AAD\AAD-Account-Management\Azure-AD-Domain-Services\Azure-AD-Domain-Services-%2D-LDAPS-Troubleshooting.md`
- Vertical: **Account Management**, Category: **domain-services**
- Output: `temp/tobeprocessed/Azure-AD-Domain-Services-%2D-LDAPS-Troubleshooting-extracted-scenarios.json`

**33. Azure-AD-Domain-Services-%2D-Service-Log-Queries.md**
- Path: `Wiki\AzureAD\AzureAD\GeneralPages\AAD\AAD-Account-Management\Azure-AD-Domain-Services\Azure-AD-Domain-Services-%2D-Service-Log-Queries.md`
- Vertical: **Account Management**, Category: **domain-services**
- Output: `temp/tobeprocessed/Azure-AD-Domain-Services-%2D-Service-Log-Queries-extracted-scenarios.json`

**34. Azure-AD-Domain-Services-%2D-Sync-Troubleshooting.md**
- Path: `Wiki\AzureAD\AzureAD\GeneralPages\AAD\AAD-Account-Management\Azure-AD-Domain-Services\Azure-AD-Domain-Services-%2D-Sync-Troubleshooting.md`
- Vertical: **Account Management**, Category: **domain-services**
- Output: `temp/tobeprocessed/Azure-AD-Domain-Services-%2D-Sync-Troubleshooting-extracted-scenarios.json`

### PROCESSING INSTRUCTIONS:

1. **Read ALL 20 markdown files** listed above from their specified paths
2. **Extract ALL troubleshooting scenarios** from each file (typically 1-3 scenarios per file)
3. **Create separate JSON files** for each markdown file in `temp/tobeprocessed/`
4. **Use exact filenames** specified in output paths above
5. **Follow vertical/category mapping** based on folder structure
6. **Include proper metadata**: cluster, database, tags, severity, source filename
7. **Create unique IDs** using kebab-case format
8. **Format steps as array** of action-oriented strings
9. **Assess severity**: high (critical failures), medium (provisioning issues), low (informational)
10. **Search for KQL/cluster references** in documentation

### EXPECTED RESULTS:
- **20 JSON files** in `temp/tobeprocessed/` folder
- **Estimated 20-40 total scenarios** (varies by content)
- **Distribution**: B2B (2 files), B2C (11 files), Domain Services (7 files)
- **All scenarios properly categorized** as Account Management vertical
- **Ready for bulk import** using batch processor

### POST-EXTRACTION COMMANDS:
After creating all JSON files, run these commands:
1. `node batch-processor.js --process-all` (import all scenarios)
2. `node batch-processor.js --status` (check progress)

### SUCCESS METRICS:
- **Target**: Process 20 files in ~7-10 minutes (10x efficiency vs individual processing)
- **Quality**: Proper categorization and complete scenario extraction
- **Completeness**: All 20 JSON files created successfully
- **Next**: Ready to test even larger batches (30-50 files)

## 📋 HOW TO GET THE NEXT 20 FILES TO PROCESS

### STEP 1: Check Current Progress
```powershell
# Check which files have been completed
node batch-processor.js --status

# View completed files list
node batch-processor.js --completed
```

### STEP 2: Get Next Batch of Files
```powershell
# Get the next 20 files to process
node batch-processor.js --next 20

# Alternative: Get next 30 or 50 files for larger batches
node batch-processor.js --next 30
node batch-processor.js --next 50
```

### STEP 3: Generate New Extraction Document
1. **Copy this file** as template: `BULK_EXTRACTION_NEXT_20_FILES.md`
2. **Update the file numbers** in title and context (e.g., "Files 35-54")
3. **Replace the 20 file entries** with output from `--next 20` command
4. **Update categorization** based on folder paths:
   - Look for folder patterns: `Azure-AD-B2B`, `Azure-AD-B2C`, `Azure-AD-Domain-Services`
   - Check vertical assignments: Auth, Sync, Applications, Performance, etc.
   - Adjust categories based on file paths and content context

### STEP 4: Verify File Paths and Categories
For each file in the next batch:
1. **Confirm the source path** exists in the Wiki structure
2. **Determine vertical** from folder hierarchy:
   - `AAD-Account-Management` → Account Management
   - `AAD-Authentication` → Auth
   - `AAD-Sync` → Sync
   - `AAD-Applications` → Applications
   - `AAD-Performance` → Performance
   - Other paths → General
3. **Set category** from subfolder:
   - `Azure-AD-B2B` → "b2b"
   - `Azure-AD-B2C` → "b2c"
   - `Azure-AD-Domain-Services` → "domain-services"
   - `Conditional-Access` → "conditional-access"
   - `MFA` → "mfa"
   - etc.

### STEP 5: Update Output Paths
Format output paths as:
```
temp/tobeprocessed/[FILENAME-WITHOUT-.md]-extracted-scenarios.json
```

### AUTOMATION COMMANDS:
```powershell
# Quick workflow for next batch:
node batch-processor.js --next 20 > next-files.txt
# Copy output to new extraction document
# Process with Copilot
# Import results:
node batch-processor.js --process-all
```

### FILE NUMBERING SYSTEM:
- **Current batch**: Files 15-34 (20 files)
- **Next batch**: Files 35-54 (20 files)
- **Following batch**: Files 55-74 (20 files)
- **Total remaining**: 227 files (as of last count)
- **Estimated batches**: ~11-12 more batches of 20 files each

### FOLDER STRUCTURE MAPPING:
Common folder patterns and their verticals:
- `AAD-Account-Management\Azure-AD-B2B\` → Account Management / b2b
- `AAD-Account-Management\Azure-AD-B2C\` → Account Management / b2c
- `AAD-Account-Management\Azure-AD-Domain-Services\` → Account Management / domain-services
- `AAD-Authentication\Conditional-Access\` → Auth / conditional-access
- `AAD-Authentication\MFA\` → Auth / mfa
- `AAD-Sync\Cross-Tenant-Sync\` → Sync / cross-tenant-sync
- `AAD-Applications\Enterprise-Apps\` → Applications / enterprise-apps
- `AAD-Performance\` → Performance / performance-optimization

---

## 📋 HOW TO GET THE NEXT 20 FILES FOR PROCESSING

### STEP 1: Check Current Progress Status
```powershell
# Run batch processor status to see what's been completed
node batch-processor.js --status
node batch-processor.js --completed
```

### STEP 2: Discover Available Files
```powershell
# Get the next batch of 20 files from the queue
node batch-processor.js --next 20

# This will show files 35-54 (or next available range)
# Output format: "File X: path/to/file.md"
```

### STEP 3: Create New Bulk Extraction Document
1. **Copy this file** as template: `BULK_EXTRACTION_20_FILES_BATCH2.md` (or appropriate batch number)
2. **Update the header** with new file range: "Process 20 Azure AD TSG Files (Files 35-54)"
3. **Replace the file list** with output from `--next 20` command
4. **Update current progress** in the goal section

### STEP 4: Format File List for New Document
For each file from `--next 20` output, create entries like:

```markdown
**35. [FILENAME].md**
- Path: `[FULL_PATH_FROM_QUEUE]`
- Vertical: **[DETERMINE_FROM_PATH]**, Category: **[FOLDER_BASED]**
- Output: `temp/tobeprocessed/[FILENAME]-extracted-scenarios.json`
```

### STEP 5: Determine Vertical & Category from Path
Use these mapping rules based on folder structure:

**VERTICAL MAPPING:**
- `AAD-Account-Management` → **Account Management**
- `AAD-Authentication` → **Auth**
- `AAD-Sync` OR `Cross-Tenant-Sync` → **Sync**
- `AAD-Applications` → **Applications**
- `AAD-Performance` → **Performance**
- Other paths → **General**

**CATEGORY MAPPING:**
- `Azure-AD-B2B` folder → **b2b**
- `Azure-AD-B2C` folder → **b2c**
- `Azure-AD-Domain-Services` folder → **domain-services**
- `Cross-Tenant-Sync` folder → **cross-tenant-sync**
- `Conditional-Access` folder → **conditional-access**
- `MFA` folder → **mfa**
- `SSO` folder → **sso**
- Other folders → **general** or derive from folder name in kebab-case

### STEP 6: Update Expected Results Section
```markdown
### EXPECTED RESULTS:
- **20 JSON files** in `temp/tobeprocessed/` folder
- **Estimated 20-40 total scenarios** (varies by content)
- **Distribution**: [UPDATE_BASED_ON_ACTUAL_FOLDERS]
- **All scenarios properly categorized** by vertical
- **Ready for bulk import** using batch processor
```

### STEP 7: Update Progress Tracking
```markdown
> **🎯 Goal**: Continue bulk extraction workflow validation
> **📊 Current Progress**: Files [START]-[END] of 227 remaining TSG files
> **📈 Efficiency**: Target 10x improvement over individual processing
```

### AUTOMATION HELPER SCRIPT
Create a PowerShell script to automate next batch preparation:

```powershell
# get-next-batch.ps1
param([int]$count = 20)

Write-Host "🔍 Getting next $count files for bulk extraction..." -ForegroundColor Cyan

# Get next files from queue
$nextFiles = node batch-processor.js --next $count

# Parse and format for documentation
$fileNumber = 35  # Update based on current progress
foreach ($line in $nextFiles) {
    if ($line -match "File \d+: (.+)") {
        $path = $matches[1]
        $filename = Split-Path $path -Leaf
        $filename = $filename -replace "\.md$", ""

        # Determine vertical and category from path
        $vertical = "General"
        $category = "general"

        if ($path -match "AAD-Account-Management") { $vertical = "Account Management" }
        elseif ($path -match "AAD-Authentication") { $vertical = "Auth" }
        elseif ($path -match "AAD-Sync|Cross-Tenant-Sync") { $vertical = "Sync" }
        elseif ($path -match "AAD-Applications") { $vertical = "Applications" }
        elseif ($path -match "AAD-Performance") { $vertical = "Performance" }

        if ($path -match "Azure-AD-B2B") { $category = "b2b" }
        elseif ($path -match "Azure-AD-B2C") { $category = "b2c" }
        elseif ($path -match "Azure-AD-Domain-Services") { $category = "domain-services" }
        elseif ($path -match "Cross-Tenant-Sync") { $category = "cross-tenant-sync" }
        elseif ($path -match "Conditional-Access") { $category = "conditional-access" }
        elseif ($path -match "MFA") { $category = "mfa" }

        Write-Host "**$fileNumber. $filename.md**"
        Write-Host "- Path: ``$path``"
        Write-Host "- Vertical: **$vertical**, Category: **$category**"
        Write-Host "- Output: ``temp/tobeprocessed/$filename-extracted-scenarios.json``"
        Write-Host ""

        $fileNumber++
    }
}
```

### WORKFLOW SUMMARY FOR NEXT BATCH:
1. ✅ Run `node batch-processor.js --next 20`
2. ✅ Copy this file as new template
3. ✅ Replace file list with new batch
4. ✅ Update verticals/categories based on paths
5. ✅ Update progress tracking numbers
6. ✅ Execute bulk extraction with Copilot
7. ✅ Run `node batch-processor.js --process-all`
8. ✅ Verify import with `node batch-processor.js --status`

---
> **🎯 Goal**: Validate 20-file bulk extraction as stepping stone to processing all 227 remaining files efficiently
> **📊 Current Progress**: Files 15-34 of 227 remaining TSG files
> **🔄 Next Steps**: Use `--next 20` command to get files 35-54 for the next bulk extraction session
