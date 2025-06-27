# 🧠 AI Session Starter: Project Memory
- ✅ **NEW**: Advanced extraction from internal documentation with robust categorizationhis file serves as the persistent memory for # 🧠 AI Session Starter: Project Memory
This file serves as the persistent memory for the DiagnosticIQ project across sessions in this workspace. It should be updated regularly to reflect the current state, goals, and progress of the project.

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
- Data sources: Internal documentation, community knowledge base, local storage
- UI framework: Web-based for cross-platform support

---

## 🧠 Assistant Memory
This section is maintained by the AI assistant to track important context and decisions across sessions.

**Current Understanding:**
- ✅ **PROJECT EVOLVED**: DiagnosticIQ started as functional troubleshooting library, now enhanced with enterprise-scale architecture
- ✅ **MODULAR REFACTORING COMPLETE**: Addressed scalability concerns with hybrid file structure
- ✅ **PUBLISHED**: Successfully published to GitHub as open-source project with active development
- ✅ **EXTRACTION WORKFLOW**: Advanced content extraction and scenario management system implemented
- ✅ **ROBUST DELETE SYSTEM**: Smart deletion with persistence and restoration capabilities
- User works in Azure AD/Entra ID support and needed a specialized troubleshooting tool
- Primary use case is finding relevant queries and procedures for specific scenarios like Cross Tenant Sync
- Tool balances comprehensive sample library with local customization capabilities
- Focus is on support engineer workflow optimization - achieved through smart search, copy-paste, and categorization
- **NEW**: Modular architecture supports team collaboration and hundreds of scenarios
- **NEW**: Advanced extraction from Azure AD supportability wiki with robust categorization

**Known Constraints or Requirements:**
- ✅ KQL syntax highlighting implemented using Prism.js
- ✅ Both online (import/export) and local query storage supported
- ✅ Performance optimized - "quick and easy to use" achieved and enhanced
- ✅ Copy/paste functionality implemented for all queries
- ✅ Professional UI with responsive design and accessibility features
- ✅ **NEW**: Scalable architecture supporting hundreds of scenarios without performance degradation
- ✅ **NEW**: Wiki extraction system with robust KQL parsing and categorization
- ✅ **NEW**: Smart deletion system with persistence across page refreshes
- ✅ **NEW**: Edit/delete functionality for both custom and extracted scenarios
- ✅ **NEW**: Database field display and preservation in scenario cards and edit forms
- ✅ **NEW**: Dynamic category dropdown population with proper value mapping
- ✅ **NEW**: Query preservation in edit mode with comprehensive debug logging
- ✅ **NEW**: Enhanced category name mapping supporting both legacy and current formats

**Pending Questions / Clarifications:**
- ✅ **RESOLVED**: Web app chosen as preferred technology stack
- ✅ **RESOLVED**: Local storage with import/export for content management
- ✅ **RESOLVED**: 7 comprehensive troubleshooting scenarios implemented
- ✅ **RESOLVED**: JSON-based data synchronization strategy implemented
- ✅ **RESOLVED**: Individual use with community sharing via GitHub
- ✅ **RESOLVED**: Content extraction and automatic scenario generation
- ✅ **RESOLVED**: Edit and delete button functionality for all scenario types

**Future Considerations:**
- GitHub Pages deployment for live hosting
- Advanced authentication for enterprise integration
- Real-time collaboration features
- API integration with Azure monitoring tools
- **NEW**: Community-driven scenario contributions via modular structure
- **NEW**: Enterprise deployment with centralized scenario management
- **NEW**: Automated content synchronization and updates
- **NEW**: Advanced search with semantic matching and AI-powered recommendations

**Recent Major Enhancement - Content Extraction & Robust Management:**
- **Problem Solved**: Manual scenario creation was time-consuming and limited scalability
- **Solution Implemented**: Advanced content extraction system with robust categorization and KQL parsing
- **Architecture**: Automated extraction from internal documentation with dynamic index generation
- **Benefits Achieved**: Rapid scenario population, consistent categorization, robust edit/delete functionality
- **Smart Deletion**: Persistent hiding of scenarios with restoration capabilities via localStorage
- **Management Tools**: Browser console utilities for advanced scenario management
- **Status**: ✅ **PRODUCTION READY** - Fully functional extraction and management workflow

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
| 2025-06-26 | **MODULAR ARCHITECTURE REFACTORING** - Implemented hybrid modular data structure (Option C) to solve scalability concerns. Created category-based file organization, DataManager class, and comprehensive architecture documentation. Feature branch ready for PR. |
| 2025-06-26 | **ARCHITECTURE PR MERGED** - Successfully merged modular data structure enhancement into main branch. DiagnosticIQ now has enterprise-scale architecture supporting hundreds of scenarios. Ready for v0.2.0 release. |
| 2025-06-27 | **CONTENT EXTRACTION SYSTEM** - Developed robust content extraction workflow with advanced KQL parsing, categorization, and dynamic index generation. Enhanced data manager with sophisticated scenario loading and validation. |
| 2025-06-27 | **ROBUST DELETE & EDIT SYSTEM** - Implemented persistent deletion system using localStorage with restoration capabilities. Fixed edit/delete button functionality for all scenario types (custom and extracted). Added management utilities for advanced scenario administration. |
| 2025-06-27 | **UI/UX ENHANCEMENTS & BUG FIXES** - Fixed database field display in scenario cards, resolved query preservation issues in edit mode, implemented dynamic category dropdown population, and enhanced category name mapping. All edit/save/display functionality now working correctly for both custom and extracted scenarios. |

---

## ✅ Next Steps
### Project Status: �️ **MAJOR ENHANCEMENT - MODULAR ARCHITECTURE**
**GitHub Repository**: https://github.com/kayasax/DiagnostIQ.git
**Feature Branch**: `feature/modular-data-structure` (ready for PR)

### Recently Completed - v0.2.0 Architecture Refactoring:
- [x] **Modular Data Structure** - Implemented hybrid architecture (Option C)
- [x] **DataManager Class** - Centralized async data loading and management
- [x] **Category Organization** - Scenarios organized by auth/sync/provisioning/performance/applications
- [x] **Scalability Solution** - Now supports hundreds of scenarios without performance issues
- [x] **Backward Compatibility** - All existing functionality preserved
- [x] **Documentation** - Comprehensive ARCHITECTURE.md and technical guides
- [x] **Pull Request Ready** - Feature branch pushed and ready for review

---

## ✅ Next Steps
### Project Status: 🚀 **PRODUCTION-READY WITH POLISHED UI/UX - v0.3.1**
**GitHub Repository**: https://github.com/kayasax/DiagnostIQ.git
**Latest**: Advanced content extraction with polished UI/UX and complete scenario management

### Recently Completed - v0.3.0+ Advanced Features:
- [x] **Content Extraction System** - Automated extraction from internal documentation sources
- [x] **Advanced KQL Parsing** - Robust query extraction with encoding and regex handling
- [x] **Dynamic Categorization** - Intelligent scenario categorization with consistent mapping
- [x] **Persistent Deletion** - Smart deletion system that persists across page refreshes
- [x] **Edit/Delete for All Types** - Full CRUD operations for both custom and extracted scenarios
- [x] **Management Utilities** - Browser console tools for advanced scenario administration
- [x] **Dynamic Index Generation** - Automatic creation of searchable scenario index
- [x] **Restoration System** - Ability to restore accidentally deleted scenarios
- [x] **Database Field Management** - Complete support for database field display, editing, and saving
- [x] **Dynamic Category Dropdowns** - Automatic population of category selections in both search and edit forms
- [x] **Query Preservation** - Robust query loading and preservation in edit mode for all scenario types
- [x] **Enhanced Category Mapping** - Support for both legacy and current category naming conventions

### Core v0.2.0 Features (Completed):
- [x] **Modular Data Structure** - Implemented hybrid architecture (Option C)
- [x] **DataManager Class** - Centralized async data loading and management
- [x] **Category Organization** - Scenarios organized by auth/sync/provisioning/performance/applications
- [x] **Scalability Solution** - Now supports hundreds of scenarios without performance issues
- [x] **Backward Compatibility** - All existing functionality preserved

### Core v0.1.0 Features (Completed):
- [x] Determine optimal technology stack and application architecture - **Web-based app chosen**
- [x] Design data structure for cheat sheets (queries + cluster info + steps) - **COMPLETED & ENHANCED**
- [x] Create prototype interface with search functionality - **COMPLETED**
- [x] Implement KQL syntax highlighting - **COMPLETED**
- [x] Add delete functionality for custom cheat sheets - **COMPLETED**
- [x] Implement import/export capabilities - **COMPLETED & ENHANCED**
- [x] Add comprehensive sample scenarios (7 scenarios with multiple queries each) - **COMPLETED & MODULARIZED**
- [x] Complete documentation and open-source preparation - **COMPLETED & EXPANDED**
- [x] Git repository initialization and GitHub publication - **COMPLETED**

### Current Priority:
- [x] **✅ Advanced Extraction Complete** - Wiki extraction and scenario management fully functional
- [x] **✅ Robust Edit/Delete System** - All scenario types can be managed properly
- [x] **✅ UI/UX Polish Complete** - Database fields, category dropdowns, and query preservation all working
- [ ] **Create v0.3.1 Release** - Tag and release the UI/UX enhancement fixes
- [ ] **Update GitHub Documentation** - Ensure README reflects new extraction capabilities and recent fixes
- [ ] **Performance Optimization** - Fine-tune loading and search for large scenario collections

### Future Enhancements (Post v0.3.1):
- [ ] **Real-time Content Sync** - Automatic updates from source documentation
- [ ] **AI-Powered Search** - Semantic search and query recommendations
- [ ] **Collaboration Features** - Team sharing and scenario approval workflows
- [ ] **Advanced Analytics** - Usage tracking and scenario effectiveness metrics
- [ ] **Performance Optimization** - Fine-tune loading and search for large scenario collections
- [ ] Enable GitHub Pages for live hosting
- [ ] Add GitHub Actions for CI/CD workflows
- [ ] Mobile app version with offline capabilities
- [ ] Enterprise SSO integration
- [ ] API for external tool integration

---

> _This file is automatically referenced and updated by the AI assistant to maintain continuity across sessions._
