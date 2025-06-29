# get-next-batch.ps1 - Helper script for bulk extraction preparation

param([int]$Count = 20)

Write-Host "Getting next $Count files for bulk extraction..." -ForegroundColor Cyan
Write-Host ""

# Get current status first
Write-Host "Current Progress:" -ForegroundColor Yellow
& node batch-processor.js --status
Write-Host ""

# Read the batch queue to get next pending files
$queueFile = "batch-workspace\batch-queue.json"
if (Test-Path $queueFile) {
    $queue = Get-Content $queueFile | ConvertFrom-Json
    $pendingFiles = $queue.files | Where-Object { $_.status -eq "pending" } | Select-Object -First $Count

    Write-Host "Next $Count files to process:" -ForegroundColor Green
    $fileNumber = ($queue.files | Where-Object { $_.status -eq "completed" }).Count + 1

    foreach ($file in $pendingFiles) {
        Write-Host ""
        Write-Host "**$fileNumber. $($file.filename)**" -ForegroundColor White
        Write-Host "- Path: ``$($file.fullPath)``" -ForegroundColor Gray

        # Determine vertical and category from path
        $vertical = "General"
        $category = "general"
        $path = $file.fullPath

        # Vertical mapping
        if ($path -like "*AAD-Account-Management*") { $vertical = "Account Management" }
        elseif ($path -like "*AAD-Authentication*") { $vertical = "Auth" }
        elseif ($path -like "*AAD-Sync*" -or $path -like "*Cross-Tenant-Sync*") { $vertical = "Sync" }
        elseif ($path -like "*AAD-Applications*") { $vertical = "Applications" }
        elseif ($path -like "*AAD-Performance*") { $vertical = "Performance" }

        # Category mapping
        if ($path -like "*Azure-AD-B2B*") { $category = "b2b" }
        elseif ($path -like "*Azure-AD-B2C*") { $category = "b2c" }
        elseif ($path -like "*Azure-AD-Domain-Services*") { $category = "domain-services" }
        elseif ($path -like "*Cross-Tenant-Sync*") { $category = "cross-tenant-sync" }
        elseif ($path -like "*Conditional-Access*") { $category = "conditional-access" }
        elseif ($path -like "*MFA*") { $category = "mfa" }
        elseif ($path -like "*SSO*") { $category = "sso" }
        elseif ($path -like "*SAML*") { $category = "saml" }
        elseif ($path -like "*Federation*") { $category = "federation" }
        else {
            # Extract category from folder name
            $pathParts = $path -split '[\\/]'
            if ($pathParts.Length -gt 1) {
                $folderName = $pathParts[-2]  # Second to last part (folder before filename)
                if ($folderName) {
                    $category = $folderName.ToLower() -replace '\s+', '-' -replace '[^a-z0-9-]', '' -replace '-+', '-'
                }
            }
        }

        Write-Host "- Vertical: **$vertical**, Category: **$category**" -ForegroundColor Cyan
        $outputName = $file.filename -replace '\.md$', '-extracted-scenarios.json'
        Write-Host "- Output: ``temp/tobeprocessed/$outputName``" -ForegroundColor Gray

        $fileNumber++
    }

    Write-Host ""
    Write-Host "Range: Files $($fileNumber - $Count) to $($fileNumber - 1)" -ForegroundColor Yellow
} else {
    Write-Host "No batch queue found. Run batch processor on a directory first." -ForegroundColor Red
}

Write-Host ""
Write-Host "Manual Steps to Create Bulk Extraction Document:" -ForegroundColor Yellow
Write-Host "1. Copy BULK_EXTRACTION_20_FILES.md as BULK_EXTRACTION_20_FILES_BATCH2.md" -ForegroundColor White
Write-Host "2. Update header with new file range" -ForegroundColor White
Write-Host "3. Replace file list using the paths shown above" -ForegroundColor White
Write-Host "4. Map verticals based on path patterns (shown above)" -ForegroundColor White
Write-Host "5. Execute bulk extraction with Copilot" -ForegroundColor White
Write-Host "6. Run: node batch-processor.js --process-all" -ForegroundColor White
Write-Host "7. Verify: node batch-processor.js --status" -ForegroundColor White
Write-Host ""

Write-Host "Ready for bulk extraction setup!" -ForegroundColor Green
