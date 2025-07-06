# 🚀 How to Run DiagnostIQ

## Quick Start (2 minutes)

### Step 1: Get a Local Server
**Option A - VS Code (Recommended):**
1. Open this folder in VS Code
2. Install "Live Server" extension if you don't have it
3. Right-click `index.html` → "Open with Live Server"

**Option B - Use Start Scripts:**
- **Windows**: Double-click `start-diagnostiq.bat`
- **Mac/Linux**: Run `./start-diagnostiq.sh` in terminal

**Option C - Manual Python:**
```bash
# Navigate to this folder in terminal
python -m http.server 5500
```

### Step 2: Open Your Browser
Navigate to: **http://localhost:5500**

🚨 **IMPORTANT:** Never use `file://` URLs - they break the app!

## ✅ You're Ready!

- Click **"All Categories"** to see all scenarios
- Try searching for **"authentication"** or **"sync"**
- Click **tags** in the tag cloud to filter
- **Expand verticals** to browse categories

## ❓ Why Do I Need a Local Server?

**Opening `index.html` directly shows only 4 scenarios instead of 350+**

### The Problem
- DiagnostIQ loads scenarios from JSON files using JavaScript `fetch()`
- Browsers block `fetch()` when using `file://` protocol (security restriction)
- Only hardcoded scenarios work without a server

### The Solution
- Use any local web server (even simple ones work)
- Serves files via `http://` protocol
- All 350+ scenarios load properly

## 🔍 How to Tell Which Mode You're In

### ❌ File Mode (Limited - 4 scenarios)
- URL shows: `file:///path/to/index.html`
- Yellow warning banner appears
- Only basic scenarios available

### Server Mode (Full - 100+ scenarios)
- URL shows: `http://localhost:8080`
- No warning banner
- All scenarios and features available

## 📊 Scenario Count Comparison

| Mode | Scenarios | Features |
|------|-----------|----------|
| Direct File | 4 | Basic search, limited data |
| Web Server | 100+ | Full search, all categories, export/import |

## 🛠️ Troubleshooting

### "Python not found" Error
- Install Python from https://python.org
- Or use any other web server (Node.js, Apache, nginx)

### Port 8080 Already in Use
- Use a different port: `python -m http.server 3000`
- Then open: http://localhost:3000

### Still Not Working?
- Check browser console (F12) for error messages
- Ensure all JSON files are present in `data/scenarios/` folder
- Try a different browser

## 📁 File Structure
```
DiagnostIQ/
├── index.html              # Main app file
├── start-diagnostiq.bat    # Windows start script
├── start-diagnostiq.sh     # Mac/Linux start script
├── app.js                  # Main application logic
├── data-manager.js         # Data loading logic
├── styles.css              # Styling
└── data/
    └── scenarios/          # JSON scenario files
        ├── index.json      # Scenario index
        ├── authentication/ # Auth scenarios
        ├── synchronization/ # Sync scenarios
        └── ...             # Other categories
```

## 🎯 Best Practices
1. Always use the web server for full functionality
2. Bookmark http://localhost:8080 for easy access
3. Keep the terminal window open while using DiagnostIQ
4. Use Ctrl+C to stop the server when done
