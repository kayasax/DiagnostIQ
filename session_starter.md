# 🧠 AI Session Starter: Project Memory
This file serves as the persistent memory for the AI assistant across sessions in this workspace. It should be updated regularly to reflect the current state, goals, and progress of the project.

---

## 📘 Project Overview
**Project Name:** DiagnosticIQ

**Description:** A comprehensive troubleshooting application designed for Azure AD/Entra ID support scenarios. More than just a query collection, it's a searchable library of troubleshooting cheat sheets that include cluster information, KQL queries, and step-by-step troubleshooting procedures. The app focuses on quick access, easy search, and efficient copy/paste workflows for support engineers.

**Primary Goals:**
- Create a fast, searchable interface for troubleshooting scenarios (e.g., Cross Tenant Sync)
- Support loading common query libraries from online sources (SharePoint, GitHub, etc.)
- Allow users to store and manage their own local query collections
- Provide comprehensive cheat sheets with cluster info, queries, and troubleshooting steps
- Implement syntax highlighting for KQL queries
- Optimize for usability: quick search, easy copy/paste, intuitive navigation

**Key Technologies / Tools:**
- Kusto Query Language (KQL)
- Azure AD/Entra ID troubleshooting
- Source wiki: https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/183924/AAD
- Potential data sources: SharePoint, GitHub, local storage
- UI framework (TBD - likely web-based for cross-platform support)

---

## 🧠 Assistant Memory
This section is maintained by the AI assistant to track important context and decisions across sessions.

**Current Understanding:**
- ✅ **PROJECT COMPLETED**: DiagnosticIQ is a fully functional Azure AD troubleshooting query library
- ✅ **PUBLISHED**: Successfully published to GitHub as open-source project
- User works in Azure AD/Entra ID support and needed a specialized troubleshooting tool
- Primary use case is finding relevant queries and procedures for specific scenarios like Cross Tenant Sync
- Tool balances comprehensive sample library with local customization capabilities
- Focus is on support engineer workflow optimization - achieved through smart search, copy-paste, and categorization

**Known Constraints or Requirements:**
- ✅ KQL syntax highlighting implemented using Prism.js
- ✅ Both online (import/export) and local query storage supported
- ✅ Performance optimized - "quick and easy to use" achieved
- ✅ Copy/paste functionality implemented for all queries
- ✅ Professional UI with responsive design and accessibility features

**Pending Questions / Clarifications:**
- ✅ **RESOLVED**: Web app chosen as preferred technology stack
- ✅ **RESOLVED**: Local storage with import/export for content management
- ✅ **RESOLVED**: 7 comprehensive troubleshooting scenarios implemented
- ✅ **RESOLVED**: JSON-based data synchronization strategy implemented
- ✅ **RESOLVED**: Individual use with community sharing via GitHub

**Future Considerations:**
- GitHub Pages deployment for live hosting
- Advanced authentication for enterprise integration
- Real-time collaboration features
- API integration with Azure monitoring tools

---

## 🔄 Update Log
| Date       | Summary of Update                          |
|------------|---------------------------------------------|
| 2025-06-26 | Initial project setup and context defined. User requirements gathered for Azure AD troubleshooting query library app. |
| 2025-06-26 | **PROTOTYPE COMPLETED** - Created fully functional web-based prototype with search, syntax highlighting, local storage, and 5 sample troubleshooting scenarios. |
| 2025-06-26 | **ENHANCED PROTOTYPE** - Fixed copy functionality for local files, implemented multiple queries per topic structure, improved UI for multiple queries display. |
| 2025-06-26 | **FEATURE EXPANSION** - Added delete functionality for custom cheat sheets, import/export capabilities, enhanced sample library with 7 comprehensive troubleshooting scenarios, each with multiple related queries. |
| 2025-06-26 | **BUG FIXES & POLISH** - Fixed query input form rendering issue, cleaned up debug code, fully functional add/edit/delete operations for cheat sheets with multiple queries. Application is now production-ready. |
| 2025-06-26 | **PROJECT COMPLETION** - Rebranded to "DiagnosticIQ", added comprehensive documentation (README, CONTRIBUTING, LICENSE), initialized Git repository, and successfully published to GitHub: https://github.com/kayasax/DiagnostIQ.git |

---

## ✅ Next Steps
### Project Status: 🎉 **COMPLETED AND PUBLISHED**
**GitHub Repository**: https://github.com/kayasax/DiagnostIQ.git

### Completed Features:
- [x] Determine optimal technology stack and application architecture - **Web-based app chosen**
- [x] Design data structure for cheat sheets (queries + cluster info + steps) - **COMPLETED**
- [x] Create prototype interface with search functionality - **COMPLETED**
- [x] Implement KQL syntax highlighting - **COMPLETED**
- [x] Add delete functionality for custom cheat sheets - **COMPLETED**
- [x] Implement import/export capabilities - **COMPLETED**
- [x] Add comprehensive sample scenarios (7 scenarios with multiple queries each) - **COMPLETED**
- [x] Complete documentation and open-source preparation - **COMPLETED**
- [x] Git repository initialization and GitHub publication - **COMPLETED**

### Optional Future Enhancements:
- [ ] Enable GitHub Pages for live hosting
- [ ] Add GitHub Actions for CI/CD workflows
- [ ] Design online/local content synchronization system
- [ ] Build query parser to extract content from existing wiki
- [ ] Add wiki integration for automatic content import
- [ ] Implement SharePoint/GitHub synchronization
- [ ] Add query parameterization features
- [ ] Community features (issue templates, discussions)
- [ ] Mobile app version

---

> _This file is automatically referenced and updated by the AI assistant to maintain continuity across sessions._
