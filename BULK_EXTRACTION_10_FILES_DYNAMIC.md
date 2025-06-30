# 🚀 DYNAMIC BULK EXTRACTION: Process Next 10 Azure AD TSG Files

## Self-Contained Instructions for GitHub Copilot

### STEP 1: DISCOVER NEXT 10 FILES
Execute this command to get the next 10 files from the batch queue:
```
.\get-next-batch.ps1 10
```

### STEP 2: ATTACH FILES TO CONTEXT
**AUTOMATICALLY** add each file from Step 1 output to your context using the #file: pattern.

**For each file path shown in Step 1 output, use:**
```
#file:[EXACT_PATH_FROM_STEP1_OUTPUT]
```

**IMPORTANT**: Use the EXACT path as shown in the Step 1 output - do not modify paths!

### STEP 3: EXECUTE EXTRACTION
Once all 10 files are attached to context, follow these extraction instructions:

#### EXTRACTION TEMPLATE:
Extract troubleshooting scenarios from Azure AD documentation and convert them to JSON format.

**RETURN FORMAT**: JSON with this exact structure for each file:
```json
{
  "scenarios": [
    {
      "id": "scenario-id-kebab-case",
      "title": "Descriptive Scenario Title",
      "description": "Detailed problem description",
      "category": "DETERMINE_FROM_FOLDER",
      "vertical": "DETERMINE_FROM_PATH",
      "tags": ["relevant", "tags", "for", "search"],
      "relatedConcepts": ["concept1", "concept2"],
      "applicableServices": ["service1", "service2"],
      "kqlQueries": [
        {
          "description": "Query description",
          "query": "KQL query if found in documentation"
        }
      ],
      "troubleshootingSteps": [
        {
          "step": "Step name",
          "description": "Detailed step description",
          "kqlQuery": "Optional KQL for this step"
        }
      ],
      "commonCauses": ["cause1", "cause2"],
      "resolution": "Resolution summary",
      "escalationCriteria": "When to escalate",
      "documentationLinks": ["url1", "url2"],
      "severity": "high|medium|low",
      "timeToResolve": "Estimated time",
      "lastUpdated": "2025-01-27T22:00:00Z"
    }
  ]
}
```

#### CATEGORIZATION RULES:
**VERTICAL**: Determine from wiki path structure:
- **"authentication"** - AAD-Authentication, MFA, Conditional Access, Sign-in issues, FIDO2
- **"synchronization"** - AAD-Sync, Cross-tenant sync, AAD Connect, Provisioning, Directory sync
- **"applications"** - AAD-Applications, App integration, SSO, App proxy, Enterprise apps
- **"performance"** - AAD-Performance, Slow sign-ins, latency, optimization
- **"general"** - Fallback for misc scenarios

**CATEGORY**: Based on folder structure:
- Azure-AD-B2B folder → "B2B Guest Management"
- Azure-AD-B2C folder → "B2C Identity Experience"
- Azure-AD-Domain-Services folder → "Domain Services"
- Conditional-Access folder → "Conditional Access"
- MFA folder → "Multi-Factor Authentication"
- Cross-Tenant-Sync folder → "Cross-Tenant Synchronization"
- Use descriptive names, not just folder names

### STEP 4: CREATE JSON FILES
For each of the 10 markdown files, create a separate JSON file in `temp/tobeprocessed/` with this naming convention:
```
temp/tobeprocessed/[FILENAME-WITHOUT-.md]-extracted-scenarios.json
```

### STEP 5: IMPORT SCENARIOS
After creating all 10 JSON files, run:
```
node batch-processor.js --process-all
```

### WORKFLOW AUTOMATION:
1. ✅ Run `.\get-next-batch.ps1 10` to discover files
2. ✅ Add each file to context using `#file:[EXACT_PATH_FROM_OUTPUT]`
3. ✅ Extract scenarios using the template above
4. ✅ Create 10 individual JSON files in `temp/tobeprocessed/`
5. ✅ Run `node batch-processor.js --process-all` to import
6. ✅ Verify with `node batch-processor.js --status`

### EXPECTED RESULTS:
- **10 JSON files** in `temp/tobeprocessed/` folder
- **Estimated 10-20 total scenarios** (varies by content)
- **All scenarios properly categorized** by vertical and category
- **Ready for bulk import** using batch processor
- **Efficiency**: ~5-7 minutes for 10 files (5x improvement over individual processing)

### SUCCESS CRITERIA:
- All 10 files processed successfully
- JSON files created with proper structure
- Scenarios imported into DiagnostIQ
- Ready to repeat process for next batch

---

## 🔄 REPEAT PROCESS
To continue with the next batch, simply run this prompt again - it will automatically get the next 10 files from the queue and repeat the process.

**Target**: Process all remaining TSG files in batches of 10 until completion.

---

## 🚀 EXECUTE EXTRACTION NOW

Now that you have the 10 files attached to context, **EXECUTE THE EXTRACTION** using our established generic extraction template:

**TASK**: Analyze each of the 10 markdown files attached above and extract ALL troubleshooting scenarios. Each scenario should represent a specific problem/solution pair.

**RETURN**: Individual JSON files for each markdown file using this exact format:

```json
{
  "scenarios": [
    {
      "id": "scenario-id-kebab-case",
      "title": "Descriptive Scenario Title",
      "description": "Detailed problem description",
      "category": "DETERMINE_FROM_FOLDER",
      "vertical": "authentication",
      "tags": ["relevant", "tags", "for", "search"],
      "relatedConcepts": ["concept1", "concept2"],
      "applicableServices": ["service1", "service2"],
      "kqlQueries": [
        {
          "description": "Query description",
          "query": "KQL query if found in documentation"
        }
      ],
      "troubleshootingSteps": [
        {
          "step": "Step name",
          "description": "Detailed step description",
          "kqlQuery": "Optional KQL for this step"
        }
      ],
      "commonCauses": ["cause1", "cause2"],
      "resolution": "Resolution summary",
      "escalationCriteria": "When to escalate",
      "documentationLinks": ["url1", "url2"],
      "severity": "high|medium|low",
      "timeToResolve": "Estimated time",
      "lastUpdated": "2025-01-27T22:00:00Z"
    }
  ]
}
```

**EXTRACTION RULES**:
- Extract ALL troubleshooting scenarios from each file
- Use "authentication" vertical for all Account Management files
- Use specific categories: "B2B Guest Management", "B2C Identity Experience", etc.
- Create unique kebab-case IDs
- Include KQL queries found in documentation
- Save each as separate JSON file in `temp/tobeprocessed/`

**CREATE 10 JSON FILES NOW** - one for each markdown file attached to context.
