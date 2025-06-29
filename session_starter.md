# 🧠 AI Session Starter: Project Memory
This file serves as the persistent memory for the DiagnostIQ project across sessions in this workspace.
You must update it regularly with key points
---

## 📘 Project Overview
**Project Name:** DiagnostIQ

**Description:** A comprehensive troubleshooting application for Azure AD/Entra ID support scenarios. A searchable library of troubleshooting cheat sheets with cluster information, KQL queries, and step-by-step procedures for support engineers.

**Primary Goals:**
- Fast, searchable interface for troubleshooting scenarios
- Automated extraction from Azure AD documentation
- Comprehensive cheat sheets with cluster info, queries, and troubleshooting steps
- Optimized for support engineer workflow: quick search, easy copy/paste

**Key Technologies:**
- Kusto Query Language (KQL)
- Azure AD/Entra ID troubleshooting
- GitHub Copilot for content extraction
- Web-based interface

---

## 🎯 CURRENT STATUS: Enhanced Navigation & Smart Categorization ✅

### **MAJOR UX IMPROVEMENTS: Collapsible Navigation + Smart Sorting**

**What's New in v0.4.0:**
- ✅ **Collapsible Vertical Navigation**: Auth, Account Management, Sync, Applications, Performance, General
- ✅ **Hierarchical Organization**: Categories nested under verticals with visual indicators
- ✅ **Smart Sorting**: "All Scenarios" now sorted by most recent to oldest
- ✅ **Improved Categorization**: Content-based vertical assignment (moved 16+ scenarios)
- ✅ **Enhanced UI**: Color-coded sections, hover effects, smooth transitions
- ✅ **Repository Cleanup**: Removed 69+ legacy files, streamlined codebase

**Navigation Structure:**
```
📁 Auth (🛡️)
  ├── conditional-access
  ├── risk-policies
  ├── mfa
  └── authentication

📁 Account Management (👥)
  ├── b2b
  ├── b2c
  ├── domain-services
  └── identity

📁 Sync (🔄)
  ├── synchronization
  ├── provisioning
  └── cross-tenant-sync

📁 Applications (📦)
  └── integration-issues

📁 Performance (⚡)
  └── slow-signins

📁 General (⚙️)
  └── miscellaneous
```
- ✅ **Smart Auto-Detection**: Handles URL encoding mismatches (`%2D` vs `-`)
- ✅ **Seamless Auto-Import**: Automatic import and processed file management
- ✅ **Non-Blocking Design**: On-demand detection, no blocking file watchers
- ✅ **Production-Ready**: Successfully processing 244+ TSG files from Azure AD wiki

**ENHANCED WORKFLOW (v0.4.0):**
1. **Extract**: Use `#file: generic_extraction_template.txt` with Copilot to extract scenarios
2. **Process**: Run `node batch-processor.js --process-all` to auto-import
3. **Navigate**: Use new collapsible navigation to explore by vertical/category
4. **Sort**: Click "All Scenarios" to see most recent scenarios first
5. **Categorize**: Use `node fix-vertical-categorization.js` to fix any miscategorized scenarios

**EXTRACTION WORKFLOW (UNCHANGED):**
1. **Run**: `node batch-processor.js --next --open` (auto-detects completed files + opens next)
2. **Extract**: Use Copilot prompt: `#file: generic_extraction_template.txt Execute instructions in the template and save the json in temp`
3. **Repeat**: Run step 1 again - auto-imports and opens next file

> **🚀 Result**: From discovery to extracted scenario in under 2 minutes per file!

**Successfully Processed:**
- ✅ **AD-Connect-Health-Agent-Connectivity-Troubleshooting.md** (1 scenario)
- ✅ **Azure-AD-Password-Protection-for-On-Premise.md** (15 scenarios)
- ✅ **AAD-Connect-architecture-and-troubleshooting.md** (4 scenarios)
- ✅ **Control-for-'Azure-ad-join-device'-in-Conditional-access-policy.md** (1 scenario)
- **Progress**: 4/244 files completed, ready for scale

### **NAVIGATION FEATURES (v0.4.0):**
- 🗂️ **Collapsible Verticals**: Organized by business area (Auth, Account Management, Sync, etc.)
- 🎯 **Smart Categorization**: Content-based vertical assignment with bulk fixes
- 📅 **Chronological Sorting**: "All Scenarios" sorted by most recent first
- 🎨 **Enhanced UI**: Color-coded sections, hover effects, visual indicators
- 📊 **Live Counts**: Real-time scenario counts per vertical/category
- 🧹 **Clean Codebase**: Removed 69+ legacy files for better maintainability

### **BATCH PROCESSOR FEATURES:**
- 🔍 **Intelligent Discovery**: Scans directories for legitimate TSG files (excludes templates, FAQs)
- 📋 **Queue Management**: Tracks progress in `batch-workspace/batch-queue.json`
- 🔄 **Auto-Detection**: Smart filename matching with URL encoding support
- 📁 **File Management**: Moves processed files to `temp/processed/`
- 📊 **Progress Tracking**: Real-time status and remaining file counts
- 🎯 **VS Code Integration**: Auto-opens files for immediate extraction
- 🕒 **Timestamp Management**: Automatic timestamp injection for proper sorting

### **CATEGORIZATION IMPROVEMENTS (v0.4.0):**
- 🏷️ **Vertical Assignment**: Auth, Account Management, Sync, Applications, Performance, General
- � **Content Analysis**: Keyword-based categorization for accurate placement
- � **Bulk Fixes**: Successfully moved 16+ scenarios to proper verticals
- 🎯 **Category Mapping**: Conditional-access, risk-policies, b2b, synchronization, etc.
- 📱 **Enhanced Metadata**: Better visual hierarchy and responsive design

### **READY FOR SCALE:**
- `TSG-Cross-tenant-sync-(Azure2Azure-scenarios).md` (main file, 8-10 scenarios expected)
- Any other Azure AD TSG markdown files in the wiki
- Generic prompt works with any documentation format

---

## 🔧 Core Features (Completed)
- ✅ **Web Application**: Fast, responsive interface with search functionality
- ✅ **KQL Syntax Highlighting**: Professional code display with copy buttons
- ✅ **Modular Architecture**: Scalable data structure supporting hundreds of scenarios
- ✅ **Content Extraction**: Automated scenario extraction from documentation
- ✅ **Import/Export**: JSON-based data management and sharing
- ✅ **Local Storage**: Persistent user customizations and deleted scenario tracking
- ✅ **Edit/Delete**: Full CRUD operations for all scenario types
- ✅ **Category Management**: Dynamic categorization with smart filtering
- ✅ **Enhanced UI**: Tags display, wiki source indicators, accurate query counts
- ✅ **Metadata Intelligence**: Dynamic cluster/database detection, proper fallbacks

---

## 🔍 Next Steps
### Project Status: 🚀 **UI NAVIGATION ENHANCEMENT**

**Immediate Goals:**
1. **Navigation Overhaul**: Replace quick navigation with category-based navigation and tag cloud
2. **Continue Extraction**: Scale proven workflow to remaining 240+ Azure AD TSG files
3. **User Experience**: Improve discoverability and browsing experience
4. **Search Enhancement**: Advanced filtering by categories and tags

**App Navigation Improvements (Next Focus):**
- 🎯 **Category Navigation**: Replace quick nav with category-based browsing
- ☁️ **Tag Cloud**: Visual tag cloud for easy content discovery
- 🔍 **Enhanced Filters**: Filter by category, tags, severity, query availability
- 📊 **Statistics**: Show counts by category and tag usage
- 🎨 **Visual Hierarchy**: Better organization of navigation elements

**Extraction Pipeline Status:**
- ✅ 4/244 files completed (streamlined workflow validated)
- 🎯 240 remaining TSG files ready for batch processing
- ✅ Automated queue management and progress tracking
- 🚀 Ultra-efficient: 2 commands + 1 prompt per scenario

**Enhancement Opportunities:**
- 🎯 **Category Navigation**: Replace quick navigation with category-based browsing
- ☁️ **Tag Cloud**: Visual tag cloud for content discovery and filtering
- � **Advanced Filters**: Multi-criteria filtering (category + tags + severity)
- 📊 **Navigation Statistics**: Show scenario counts per category
- 🎨 **Visual Hierarchy**: Improved navigation UX and information architecture
- 🔄 **Wiki Integration**: Direct links to source pages (future enhancement)

---

## 🔄 Recent Updates
| Date       | Summary                          |
|------------|----------------------------------|
| 2025-06-29 | **🚀 ULTRA-EFFICIENT WORKFLOW** - Achieved 2-command workflow: `--next --open` + Copilot prompt = extracted scenario! Smart auto-detection with URL encoding support, seamless auto-import, and processed file management. **4/244 files completed with streamlined batch processing.** Next: App navigation overhaul with categories and tag cloud. |
| 2025-06-29 | **🎯 BATCH PROCESSOR OPTIMIZED** - Enhanced batch processor with smart filename matching, auto-detection, and non-blocking workflow. Successfully processed multiple TSG files with automatic import and file management. **Ready for mass extraction of 244+ Azure AD wiki files.** |
| 2025-06-29 | **🎨 UI ENHANCEMENTS COMPLETE** - Added tags display with blue styling, wiki source indicators with green badges, fixed query count bug (shows 0 when no queries), enhanced metadata display with N/A fallbacks. Successfully extracted 15 Azure AD Password Protection scenarios. **DiagnostIQ now production-ready with full feature set.** |
| 2025-06-28 | **✅ COPILOT EXTRACTION SUCCESS** - Validated GitHub Copilot workflow with `#file:` reference approach. Successfully extracted deletion threshold scenario. Enhanced DiagnostIQ to support both string and object step formats. Added `relatedKQL` display support. **Workspace cleaned and decluttered.** |
| 2025-06-27 | **Enhanced DiagnostIQ Features** - Modular architecture, content extraction system, UI/UX improvements, and comprehensive scenario management. |
| 2025-06-26 | **Initial Development** - Created DiagnostIQ prototype, implemented core features, published to GitHub. |

---

**Essential Files (v0.4.0):**
- `index.html` - Main DiagnostIQ web interface with collapsible navigation
- `app.js` - Enhanced application logic with vertical navigation and smart sorting
- `data-manager.js` - Data loading and scenario management
- `styles.css` - Updated styling for collapsible navigation and visual enhancements

**Extraction & Processing:**
- `GENERIC_EXTRACTION_TEMPLATE.txt` - Generic Copilot prompt template with vertical/category mapping
- `import-scenarios.js` - Enhanced import script with timestamp injection
- `batch-processor.js` - Intelligent batch processing system with flexible file handling
- `fix-vertical-categorization.js` - Content-based categorization fixer

**Data Structure:**
- `data/scenarios/` - Organized scenario files by category with proper verticals
- `data/scenarios/index.json` - Master index for all scenarios
- `temp/processed/` - Completed extraction files archive

**Documentation:**
- `README.md` - Project overview and usage guide
- `VERSION.txt` - Version 0.4.0 with navigation and categorization improvements
- `session_starter.md` - Updated project memory with v0.4.0 features

---

> **Next Session Goal:** Continue batch extraction of remaining 240+ TSG files using the proven workflow. Focus on advanced search features, tag cloud enhancements, and performance optimizations for large datasets. The navigation infrastructure is now complete and ready for scale.
