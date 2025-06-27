# DiagnosticIQ Wiki Extraction Helper Script
# PowerShell version for better cross-platform support

function Show-Banner {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "DiagnosticIQ Wiki Extraction Tool" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Test-Prerequisites {
    # Check Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
        } else {
            throw "Node.js not found"
        }
    } catch {
        Write-Host "❌ Error: Node.js is not installed or not in PATH" -ForegroundColor Red
        Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
        return $false
    }

    # Check extraction script
    if (-not (Test-Path "extract-wiki-scenarios.js")) {
        Write-Host "❌ Error: extract-wiki-scenarios.js not found in current directory" -ForegroundColor Red
        Write-Host "Please run this script from the DiagnosticIQ project directory" -ForegroundColor Yellow
        return $false
    }

    Write-Host "✅ All prerequisites met" -ForegroundColor Green
    return $true
}

function Show-Menu {
    Write-Host ""
    Write-Host "What would you like to do?" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Test the extraction tool with sample data" -ForegroundColor White
    Write-Host "2. Run extraction on your wiki (dry run)" -ForegroundColor White
    Write-Host "3. Run actual extraction on your wiki" -ForegroundColor White
    Write-Host "4. Show help" -ForegroundColor White
    Write-Host "5. Exit" -ForegroundColor White
    Write-Host ""
}

function Test-Extraction {
    Write-Host ""
    Write-Host "🧪 Running test extraction with sample data..." -ForegroundColor Cyan
    Write-Host ""

    try {
        node test-extraction.js
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Test completed successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Test failed" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error running test: $_" -ForegroundColor Red
    }

    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Start-DryRun {
    Write-Host ""
    $wikiPath = Read-Host "Enter the path to your wiki clone"

    if (-not $wikiPath -or $wikiPath.Trim() -eq "") {
        Write-Host "❌ Error: Please enter a valid path" -ForegroundColor Red
        Read-Host "Press Enter to continue"
        return
    }

    if (-not (Test-Path $wikiPath)) {
        Write-Host "❌ Error: Path does not exist: $wikiPath" -ForegroundColor Red
        Read-Host "Press Enter to continue"
        return
    }

    Write-Host ""
    Write-Host "🔍 Running dry run extraction..." -ForegroundColor Cyan
    Write-Host "This will show you what would be extracted without saving files." -ForegroundColor Yellow
    Write-Host ""

    try {
        node extract-wiki-scenarios.js "$wikiPath" --dry-run --verbose
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Dry run completed successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Dry run failed" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error running dry run: $_" -ForegroundColor Red
    }

    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Start-Extraction {
    Write-Host ""
    $wikiPath = Read-Host "Enter the path to your wiki clone"

    if (-not $wikiPath -or $wikiPath.Trim() -eq "") {
        Write-Host "❌ Error: Please enter a valid path" -ForegroundColor Red
        Read-Host "Press Enter to continue"
        return
    }

    if (-not (Test-Path $wikiPath)) {
        Write-Host "❌ Error: Path does not exist: $wikiPath" -ForegroundColor Red
        Read-Host "Press Enter to continue"
        return
    }

    Write-Host ""
    Write-Host "⚠️  WARNING: This will create new scenario files in the data/scenarios directory." -ForegroundColor Yellow
    Write-Host "Existing files with the same names will be overwritten." -ForegroundColor Yellow
    Write-Host ""

    $confirm = Read-Host "Are you sure you want to proceed? (y/N)"
    if ($confirm.ToLower() -ne "y") {
        Write-Host "Operation cancelled." -ForegroundColor Yellow
        return
    }

    Write-Host ""
    Write-Host "🚀 Running actual extraction..." -ForegroundColor Cyan
    Write-Host ""

    try {
        node extract-wiki-scenarios.js "$wikiPath" --verbose
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Extraction completed successfully!" -ForegroundColor Green
            Write-Host "Check the data/scenarios directory for extracted scenarios." -ForegroundColor Yellow
        } else {
            Write-Host "❌ Extraction failed" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error running extraction: $_" -ForegroundColor Red
    }

    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Show-Help {
    Write-Host ""
    Write-Host "DiagnosticIQ Wiki Extraction Tool Help" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "This tool extracts troubleshooting scenarios from a locally cloned" -ForegroundColor White
    Write-Host "Azure AD supportability wiki and converts them into DiagnosticIQ's" -ForegroundColor White
    Write-Host "modular JSON format." -ForegroundColor White
    Write-Host ""
    Write-Host "Prerequisites:" -ForegroundColor Yellow
    Write-Host "- Node.js installed" -ForegroundColor White
    Write-Host "- Local clone of Azure AD supportability wiki" -ForegroundColor White
    Write-Host "- DiagnosticIQ project structure" -ForegroundColor White
    Write-Host ""
    Write-Host "Manual Commands:" -ForegroundColor Yellow
    Write-Host "  node test-extraction.js" -ForegroundColor Gray
    Write-Host "  node extract-wiki-scenarios.js `"C:\path\to\wiki`" --dry-run --verbose" -ForegroundColor Gray
    Write-Host "  node extract-wiki-scenarios.js `"C:\path\to\wiki`" --verbose" -ForegroundColor Gray
    Write-Host ""
    Write-Host "For more information, see EXTRACTION_GUIDE.md" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to continue"
}

# Main script
Clear-Host
Show-Banner

Write-Host "Current directory: $PWD" -ForegroundColor Gray
Write-Host ""

if (-not (Test-Prerequisites)) {
    Read-Host "Press Enter to exit"
    exit 1
}

while ($true) {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-5)"

    switch ($choice) {
        "1" { Test-Extraction }
        "2" { Start-DryRun }
        "3" { Start-Extraction }
        "4" { Show-Help }
        "5" {
            Write-Host ""
            Write-Host "Goodbye!" -ForegroundColor Cyan
            exit 0
        }
        default {
            Write-Host ""
            Write-Host "❌ Invalid choice. Please select a number from 1-5." -ForegroundColor Red
            Start-Sleep -Seconds 2
        }
    }

    Clear-Host
    Show-Banner
}
