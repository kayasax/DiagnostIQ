# 🧠 AI Session Starter: Project Memory
This file serves as the persistent memory for the DiagnosticIQ project across sessions in this workspace.
You must update it regularly with key points
---

## 📘 Project Overview
**Project Name:** DiagnosticIQ

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

## 🎯 CURRENT STATUS: Production Ready ✅

### **PROVEN APPROACH: GitHub Copilot Extraction**

**What Works:**
- ✅ **Generic Copilot Prompts**: Using `#file:` reference for any markdown file
- ✅ **Automated Import**: `import-scenarios.js` processes Copilot JSON output
- ✅ **Rich Data Structure**: Detailed steps with description/action/expected results
- ✅ **DiagnosticIQ Integration**: Web app displays scenarios with proper formatting
- ✅ **KQL Query Support**: `relatedKQL` array displayed with copy buttons and syntax highlighting
- ✅ **Enhanced UI Features**: Tags display, wiki source indicators, accurate query counts
- ✅ **Dynamic Category Detection**: Categories determined from page content, not limited to fixed set

**Successfully Extracted:**
- **File**: `Azure-AD-Password-Protection-for-On%2DPremise.md`
- **Result**: 15 scenarios with comprehensive troubleshooting procedures
- **Status**: ✅ Fully integrated with enhanced features (tags, wiki indicators, accurate query counts)
- **Previous**: Cross-tenant sync and B2B scenarios (multiple files processed)

### **VALIDATED WORKFLOW (MANUAL BUT WORKING):**
1. **Open** the target wiki markdown page in VS Code
2. **Use this exact prompt** in Copilot Chat:
   ```
   #file: generic_extraction_template.txt

   Execute instructions in the template and save the json in temp
   ```
3. **Import** automatically via `node import-scenarios.js temp/filename-extracted-scenarios.json`
4. **View** in DiagnosticIQ - scenarios appear immediately with enhanced features

> **⚠️ Critical**: Must open the wiki page first, then use the exact prompt format above. This is manual but produces consistent results.

### **LATEST ENHANCEMENTS (June 29, 2025):**
- 🏷️ **Tags Display**: All scenario tags visible in both preview and full card views
- 📖 **Wiki Source Indicators**: Green badges and links for wiki-extracted scenarios  
- 🔢 **Accurate Query Counts**: Shows "0 queries" when no KQL exists (fixed bug)
- 🎯 **Dynamic Categories**: Categories extracted from page content (B2B, Password Protection, etc.)
- 🔗 **Cluster/Database Handling**: Shows "N/A" for empty clusters, blank values when not found
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
### Project Status: 🚀 **PRODUCTION REFINEMENT**

**Immediate Goals:**
1. **Continue Extraction**: Scale proven workflow to remaining Azure AD TSG files
2. **Feature Enhancement**: Improve wiki linking and metadata handling
3. **Quality Assurance**: Validate all imported scenarios render correctly
4. **Documentation Updates**: Maintain extraction guides and best practices

**Extraction Pipeline:**
- ✅ Azure AD Password Protection (15 scenarios extracted)
- ✅ Cross-tenant sync scenarios 
- ✅ B2B troubleshooting scenarios
- 🎯 Domain Services, MFA, Conditional Access (next targets)
- 🎯 General troubleshooting documentation

**Enhancement Opportunities:**
- 🔄 Wiki link integration (direct links to source pages)
- 📊 Advanced search filters (by tags, severity, query count)
- 🎨 Visual improvements for tag categories

---

## 🔄 Recent Updates
| Date       | Summary                          |
|------------|----------------------------------|
| 2025-06-29 | **🎨 UI ENHANCEMENTS COMPLETE** - Added tags display with blue styling, wiki source indicators with green badges, fixed query count bug (shows 0 when no queries), enhanced metadata display with N/A fallbacks. Successfully extracted 15 Azure AD Password Protection scenarios. **DiagnosticIQ now production-ready with full feature set.** |
| 2025-06-28 | **✅ COPILOT EXTRACTION SUCCESS** - Validated GitHub Copilot workflow with `#file:` reference approach. Successfully extracted deletion threshold scenario. Enhanced DiagnosticIQ to support both string and object step formats. Added `relatedKQL` display support. **Workspace cleaned and decluttered.** |
| 2025-06-27 | **Enhanced DiagnosticIQ Features** - Modular architecture, content extraction system, UI/UX improvements, and comprehensive scenario management. |
| 2025-06-26 | **Initial Development** - Created DiagnosticIQ prototype, implemented core features, published to GitHub. |

---

## 📁 Essential Files
**Core Application:**
- `index.html` - Main DiagnosticIQ web interface
- `app.js` - Application logic and UI management
- `data-manager.js` - Data loading and scenario management
- `styles.css` - Application styling

**Extraction Workflow:**
- `GENERIC_EXTRACTION_TEMPLATE.txt` - Generic Copilot prompt template
- `COMPLETE_EXTRACTION_PROMPT.txt` - Ready-to-use prompt for main TSG file
- `import-scenarios.js` - Import script for Copilot JSON output
- `AUTOMATED_INSTRUCTIONS.txt` - Step-by-step workflow guide

**Data Structure:**
- `data/scenarios/` - Organized scenario files by category
- `data/scenarios/index.json` - Master index for all scenarios

**Documentation:**
- `README.md` - Project overview and usage guide
- `ARCHITECTURE.md` - Technical architecture documentation
- `CONTRIBUTING.md` - Contribution guidelines

---

> **Next Session Goal:** Continue scaling extraction to additional Azure AD documentation and refine UI/UX based on user feedback. DiagnosticIQ is now feature-complete for production use.
