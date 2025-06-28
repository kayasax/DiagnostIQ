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

**Successfully Extracted:**
- **File**: `TSG-How-to-check-cross-tenant-Deletion-Threshold.md`
- **Result**: 1 scenario with 4 detailed steps + 1 KQL query
- **Status**: ✅ Visible and functional in DiagnosticIQ

### **VALIDATED WORKFLOW (MANUAL BUT WORKING):**
1. **Open** the target wiki markdown page in VS Code
2. **Use this exact prompt** in Copilot Chat:
   ```
   #file: generic_extraction_template.txt
   
   Execute instructions in the template
   ```
3. **Save** JSON output as `extracted-scenarios.json`
4. **Run** `node import-scenarios.js extracted-scenarios.json`
5. **View** in DiagnosticIQ - scenarios appear immediately

> **⚠️ Critical**: Must open the wiki page first, then use the exact prompt format above. This is manual but produces consistent results.

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

---

## 🔍 Next Steps
### Project Status: 🚀 **EXTRACTION SCALING**

**Immediate Goals:**
1. **Scale Extraction**: Use proven workflow on main TSG file
2. **Quality Validation**: Verify scenarios render correctly in DiagnosticIQ
3. **Documentation**: Update extraction guides for production use
4. **Workspace Cleanup**: Remove obsolete test/demo files

**Extraction Targets:**
- `TSG-Cross-tenant-sync-(Azure2Azure-scenarios).md` (primary target)
- Additional Azure AD troubleshooting documentation
- Validate generic prompt effectiveness across different content types

---

## 🔄 Recent Updates
| Date       | Summary                          |
|------------|----------------------------------|
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

> **Next Session Goal:** Scale extraction to main TSG file and validate approach across multiple documentation sources.
