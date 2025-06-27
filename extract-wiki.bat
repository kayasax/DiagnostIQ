@echo off
REM DiagnosticIQ Wiki Extraction Helper Script
REM This script helps you extract scenarios from your local wiki clone

echo.
echo ========================================
echo DiagnosticIQ Wiki Extraction Tool
echo ========================================
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Show current directory
echo Current directory: %CD%
echo.

REM Check if extraction script exists
if not exist "extract-wiki-scenarios.js" (
    echo Error: extract-wiki-scenarios.js not found in current directory
    echo Please run this script from the DiagnosticIQ project directory
    pause
    exit /b 1
)

REM Menu for user
echo What would you like to do?
echo.
echo 1. Test the extraction tool with sample data
echo 2. Run extraction on your wiki (dry run)
echo 3. Run actual extraction on your wiki
echo 4. Show help
echo 5. Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto test
if "%choice%"=="2" goto dryrun
if "%choice%"=="3" goto extract
if "%choice%"=="4" goto help
if "%choice%"=="5" goto exit
goto invalid

:test
echo.
echo Running test extraction with sample data...
echo.
node test-extraction.js
echo.
echo Test completed!
pause
goto menu

:dryrun
echo.
set /p wikipath="Enter the path to your wiki clone: "
if "%wikipath%"=="" goto invalid_path

echo.
echo Running dry run extraction...
echo This will show you what would be extracted without saving files.
echo.
node extract-wiki-scenarios.js "%wikipath%" --dry-run --verbose
echo.
echo Dry run completed!
pause
goto menu

:extract
echo.
set /p wikipath="Enter the path to your wiki clone: "
if "%wikipath%"=="" goto invalid_path

echo.
echo WARNING: This will create new scenario files in the data/scenarios directory.
echo Existing files with the same names will be overwritten.
echo.
set /p confirm="Are you sure you want to proceed? (y/N): "
if /i not "%confirm%"=="y" goto menu

echo.
echo Running actual extraction...
echo.
node extract-wiki-scenarios.js "%wikipath%" --verbose
echo.
echo Extraction completed!
echo Check the data/scenarios directory for extracted scenarios.
pause
goto menu

:help
echo.
echo DiagnosticIQ Wiki Extraction Tool Help
echo =====================================
echo.
echo This tool extracts troubleshooting scenarios from a locally cloned
echo Azure AD supportability wiki and converts them into DiagnosticIQ's
echo modular JSON format.
echo.
echo Prerequisites:
echo - Node.js installed
echo - Local clone of Azure AD supportability wiki
echo - DiagnosticIQ project structure
echo.
echo Manual Commands:
echo   node test-extraction.js
echo   node extract-wiki-scenarios.js "C:\path\to\wiki" --dry-run --verbose
echo   node extract-wiki-scenarios.js "C:\path\to\wiki" --verbose
echo.
echo For more information, see EXTRACTION_GUIDE.md
echo.
pause
goto menu

:invalid_path
echo.
echo Error: Please enter a valid path to your wiki clone.
pause
goto menu

:invalid
echo.
echo Invalid choice. Please select a number from 1-5.
pause

:menu
cls
goto :eof

:exit
echo.
echo Goodbye!
exit /b 0
