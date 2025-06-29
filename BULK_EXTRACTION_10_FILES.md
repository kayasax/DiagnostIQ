# 🚀 BULK EXTRACTION: Process 10 Azure AD TSG Files (Files 4-13)

## Instructions for GitHub Copilot

Please apply the extraction instructions from `#file: GENERIC_EXTRACTION_TEMPLATE.txt` to **ALL TEN** of the following Azure AD TSG markdown files:

### Files to Process (Next 10 in Queue):

4. **Excluded-users-list-does-not-enumerate-in-Conditional-Access-policy,-unable-to-add-or-remove-excluded-users.md**
   - Path: `Wiki\AzureAD\AzureAD\ACE-Identity-TSGs\Identity-Technical-Wiki\Conditional-Access\Excluded-users-list-does-not-enumerate-in-Conditional-Access-policy,-unable-to-add-or-remove-excluded-users.md`
   - Expected Vertical: **"Auth"** (Conditional-Access folder)
   - Expected Category: **"conditional-access"**
   - Output: `temp/tobeprocessed/Excluded-users-list-does-not-enumerate-in-Conditional-Access-policy,-unable-to-add-or-remove-excluded-users-extracted-scenarios.json`

5. **Troubleshooting-Preview-Named-Locations.md**
   - Path: `Wiki\AzureAD\AzureAD\ACE-Identity-TSGs\Identity-Technical-Wiki\Conditional-Access\Troubleshooting-Preview-Named-Locations.md`
   - Expected Vertical: **"Auth"** (Conditional-Access folder)
   - Expected Category: **"conditional-access"**
   - Output: `temp/tobeprocessed/Troubleshooting-Preview-Named-Locations-extracted-scenarios.json`

6. **TSG-%2D-You-can't-setup-Microsoft-authenticator-because-you-already-have-5-authenticator-apps.md**
   - Path: `Wiki\AzureAD\AzureAD\ACE-Identity-TSGs\Identity-Technical-Wiki\Multi%2DFactor-Authentication\TSG-%2D-You-can't-setup-Microsoft-authenticator-because-you-already-have-5-authenticator-apps.md`
   - Expected Vertical: **"Auth"** (Multi-Factor-Authentication folder)
   - Expected Category: **"mfa"**
   - Output: `temp/tobeprocessed/TSG-%2D-You-can't-setup-Microsoft-authenticator-because-you-already-have-5-authenticator-apps-extracted-scenarios.json`

7. **What-is-RamLogData-in-Auth-Troubleshooter%3F.md**
   - Path: `Wiki\AzureAD\AzureAD\ACE-Identity-TSGs\Identity-Technical-Wiki\What-is-RamLogData-in-Auth-Troubleshooter%3F.md`
   - Expected Vertical: **"Auth"** (Auth Troubleshooter content)
   - Expected Category: **"authentication"**
   - Output: `temp/tobeprocessed/What-is-RamLogData-in-Auth-Troubleshooter%3F-extracted-scenarios.json`

8. **Azure-AD-FIDO2-Sign%2Din-Troubleshooting.md**
   - Path: `Wiki\AzureAD\AzureAD\Authentication\StrongAuth-Passwordless(WHfB-FIDO-phone-based)\Azure-AD-FIDO2-Sign%2Din-Troubleshooting.md`
   - Expected Vertical: **"Auth"** (Authentication/Passwordless folder)
   - Expected Category: **"authentication"** (FIDO2/passwordless)
   - Output: `temp/tobeprocessed/Azure-AD-FIDO2-Sign%2Din-Troubleshooting-extracted-scenarios.json`

9. **FIDO2%3A-Android-Data-Collection-and-Troubleshooting.md**
   - Path: `Wiki\AzureAD\AzureAD\Authentication\StrongAuth-Passwordless(WHfB-FIDO-phone-based)\FIDO2-passkeys\FIDO2%3A-Android-Data-Collection-and-Troubleshooting.md`
   - Expected Vertical: **"Auth"** (FIDO2-passkeys folder)
   - Expected Category: **"authentication"** (FIDO2/Android)
   - Output: `temp/tobeprocessed/FIDO2%3A-Android-Data-Collection-and-Troubleshooting-extracted-scenarios.json`

10. **TSG-Obtaining-pending-consent-request-details-for-Azure-Lockbox.md**
    - Path: `Wiki\AzureAD\AzureAD\Customer-LockBox\Azure-Customer-LockBox\TSG-Obtaining-pending-consent-request-details-for-Azure-Lockbox.md`
    - Expected Vertical: **"General"** (Customer-LockBox folder)
    - Expected Category: **"miscellaneous"**
    - Output: `temp/tobeprocessed/TSG-Obtaining-pending-consent-request-details-for-Azure-Lockbox-extracted-scenarios.json`

11. **When-to-Ask-for-Help.md**
    - Path: `Wiki\AzureAD\AzureAD\DP-Processes-Guidelines-and-others\Case-Handling-Flows\When-to-Ask-for-Help.md`
    - Expected Vertical: **"General"** (Process guidelines)
    - Expected Category: **"miscellaneous"**
    - Output: `temp/tobeprocessed/When-to-Ask-for-Help-extracted-scenarios.json`

12. **AAD-Government-Troubleshooting.md**
    - Path: `Wiki\AzureAD\AzureAD\GeneralPages\AAD\AAD-Account-Management\AAD-Government-Troubleshooting.md`
    - Expected Vertical: **"Account Management"** (AAD-Account-Management folder)
    - Expected Category: **"identity"**
    - Output: `temp/tobeprocessed/AAD-Government-Troubleshooting-extracted-scenarios.json`

13. **Azure-AD-B2B-TSG-%3A-AADSTS-Error-Codes.md**
    - Path: `Wiki\AzureAD\AzureAD\GeneralPages\AAD\AAD-Account-Management\Azure-AD-B2B\Azure-AD-B2B-TSG-%3A-AADSTS-Error-Codes.md`
    - Expected Vertical: **"Account Management"** (Azure-AD-B2B folder)
    - Expected Category: **"b2b"**
    - Output: `temp/tobeprocessed/Azure-AD-B2B-TSG-%3A-AADSTS-Error-Codes-extracted-scenarios.json`

## Bulk Processing Instructions:

1. **Apply `#file: GENERIC_EXTRACTION_TEMPLATE.txt` to ALL ten files above**
2. **Extract ALL troubleshooting scenarios** from each file
3. **Create separate JSON files** for each markdown file in `temp/tobeprocessed/`
4. **Use the exact filenames** specified in the output paths above
5. **Follow vertical/category mapping** based on wiki folder structure
6. **Include proper metadata**: cluster, database, tags, severity, source filename

## Expected Vertical Distribution:
- **Auth (7 files)**: Conditional Access (2), MFA (1), Authentication/FIDO2 (3), Auth Troubleshooter (1)
- **Account Management (2 files)**: Government (1), B2B (1)
- **General (1 file)**: Customer Lockbox (1), Process Guidelines (1)

## Expected Results:

- **10 JSON files** in `temp/tobeprocessed/` folder
- **Multiple scenarios per file** (varies by content - expect 10-30 total scenarios)
- **Proper categorization** based on folder structure
- **Ready for batch import** using `node batch-processor.js --process-all`

## Next Steps After Extraction:

1. Run `node batch-processor.js --process-all` to import all scenarios
2. Run `node batch-processor.js --status` to see progress
3. **Test 20-file batch next** if this 10-file batch is successful

---

> **🎯 Goal**: Process 10 files in ~4 minutes instead of 20 minutes (5x efficiency gain)
> **📊 Progress**: Files 4-13 of 237 remaining TSG files
> **🚀 Next Test**: If successful, try 20 files in next bulk extraction
