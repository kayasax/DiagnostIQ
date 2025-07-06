# 🗄️ DiagnostIQ LocalStorage Persistence Guide

## 🎯 How It Works

**First Load:**
1. App checks localStorage for `diagnostiq_scenarios`
2. If empty → loads all 350 scenarios from JSON files
3. Saves everything to localStorage
4. All future operations use localStorage only

**Subsequent Loads:**
1. App loads directly from localStorage (instant!)
2. No file loading needed
3. All edits persist between sessions

## 🔧 User Operations

### ✏️ **Edit Scenario**
- Click any scenario card → "Edit"
- Make changes → "Save"
- **Result**: Changes saved to localStorage permanently

### ➕ **Add New Scenario**
- Click "Add Cheat Sheet" button
- Fill form → "Save"
- **Result**: New scenario added to localStorage

### 🗑️ **Delete Scenario** (if implemented)
- **Result**: Scenario removed from localStorage

### 🔄 **Reset to Original**
- Click "Reset Data" button in header
- Confirms → clears localStorage → reloads from files
- **Result**: All edits lost, back to original 350 scenarios

## 💾 Technical Details

**localStorage Key**: `diagnostiq_scenarios`
**Data Format**: JSON array of scenario objects
**Size**: ~350 scenarios ≈ 2-3MB (well within 5MB limit)

**DataManager Methods:**
- `loadFromLocalStorage()` - Load scenarios from localStorage
- `saveToLocalStorage()` - Save scenarios to localStorage
- `updateScenario(data)` - Update + save
- `addScenario(data)` - Add + save
- `deleteScenario(id)` - Delete + save
- `resetToFiles()` - Clear localStorage + reload files

## 🧪 Debug Console Commands

```javascript
// Check localStorage data
debugCheckLocalStorageSize()

// Manually save current data
debugSaveToLocalStorage()

// Check what's in localStorage
JSON.parse(localStorage.getItem('diagnostiq_scenarios')).length

// Clear localStorage (forces reload from files)
localStorage.removeItem('diagnostiq_scenarios')
```

## ✅ Benefits

- **Full Persistence** - All edits survive page refresh
- **Fast Loading** - Instant startup after first load
- **Simple Architecture** - Single source of truth
- **User Control** - Can reset to original data anytime
- **No Server Needed** - Everything stored locally
