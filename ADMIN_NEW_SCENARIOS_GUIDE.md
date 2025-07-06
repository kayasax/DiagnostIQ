# 🔍 Admin New Scenarios Detection Guide

## 🎯 Purpose

This admin function detects when new scenario files have been added to the `data/scenarios/` directory and allows selective import into your localStorage-based DiagnostIQ data.

## 🚀 How to Use

### 1. **Click "Check New" Button**
- Located in the header next to other admin buttons
- Compares localStorage scenarios vs file system scenarios
- Shows detailed analysis modal

### 2. **Review Analysis Modal**
The modal shows:
- **LocalStorage count** - scenarios in your saved data
- **Files count** - scenarios available in files
- **New in Files** - scenarios added to files since last sync
- **Only in LocalStorage** - custom scenarios you created

### 3. **Import Options**
- **Select specific scenarios** - check boxes for desired scenarios
- **Import Selected** - import only checked scenarios
- **Import All New** - import everything new at once

## 📊 Use Cases

### **Scenario 1: New Documentation Added**
```
Files: 375 scenarios
LocalStorage: 350 scenarios
New: 25 scenarios found!
```
→ Review and import the 25 new scenarios

### **Scenario 2: Up to Date**
```
Files: 350 scenarios
LocalStorage: 350 scenarios
New: 0 scenarios
```
→ "No new scenarios found" message

### **Scenario 3: Custom Scenarios**
```
Files: 350 scenarios
LocalStorage: 355 scenarios
New: 0 scenarios
Only in LocalStorage: 5 scenarios
```
→ Shows your 5 custom scenarios that don't exist in files

## 🔧 Technical Details

**Detection Logic:**
1. Loads current localStorage scenarios (your working data)
2. Scans `data/scenarios/index.json` for file-based scenarios
3. Compares IDs to find differences
4. Presents options for selective import

**Import Process:**
1. Loads full scenario data from files (lazy loading)
2. Adds selected scenarios to localStorage
3. Updates app's working data
4. Refreshes UI (categories, navigation)

## 🧪 Testing Scenarios

### **Test 1: Add a New File**
1. Add a JSON file to `data/scenarios/[category]/`
2. Update `data/scenarios/index.json` to include it
3. Click "Check New" → should detect the new scenario

### **Test 2: Custom Scenarios**
1. Create a custom scenario via "Add Cheat Sheet"
2. Click "Check New" → should show custom scenarios in "Only in LocalStorage"

### **Test 3: Import Workflow**
1. Find new scenarios with "Check New"
2. Select specific scenarios via checkboxes
3. Click "Import Selected" → should add to localStorage
4. Verify scenarios appear in app

## 🎯 Console Commands for Testing

```javascript
// Manually check for new scenarios
await window.dataManager.detectNewScenarios()

// Check localStorage scenario count
JSON.parse(localStorage.getItem('diagnostiq_scenarios')).length

// Import specific scenarios by ID
await window.dataManager.importNewScenarios(['scenario-id-1', 'scenario-id-2'])

// Import all new scenarios
await window.dataManager.importAllNewScenarios()
```

## ✅ Benefits

- **Stay Current** - easily sync with new documentation
- **Selective Import** - choose which scenarios to add
- **Preserve Custom Work** - keeps your edits and custom scenarios
- **Visual Analysis** - clear overview of data differences
- **Safe Operation** - no risk of losing existing data

This admin function ensures you never miss new scenarios while maintaining full control over your DiagnostIQ data!
