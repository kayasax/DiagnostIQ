# 🧠 DiagnostIQ

A comprehensive web-based troubleshooting library for Azure AD/Entra ID support engineers. Search, filter, and manage KQL queries and troubleshooting procedures with ease.

![DiagnostIQ](https://img.shields.io/badge/DiagnostIQ-Azure%20AD%20Troubleshooting-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Quick Start

1. **Open the app**: Start a local server (VS Code Live Server recommended)
2. **Navigate to**: `http://localhost:5500`
3. **Start troubleshooting**: Search scenarios, copy KQL queries, and find solutions!

## ✨ Key Features

### 🔍 **Smart Search & Navigation**
- **Search**: Find scenarios by keywords, categories, or troubleshooting steps
- **Category Navigation**: Browse by Auth, Sync, Account Management, and General
- **Tag Cloud**: Click popular tags to filter scenarios quickly
- **Advanced Filtering**: Combine search terms with category filters

### 📊 **Rich Content Library**
- **350+ Scenarios**: Comprehensive troubleshooting scenarios from Azure AD documentation
- **KQL Queries**: Production-ready Kusto queries with syntax highlighting
- **Step-by-Step Guides**: Detailed troubleshooting procedures
- **Copy-to-Clipboard**: One-click copying for queries and procedures

### 🛠️ **Management Tools**
- **Add/Edit Scenarios**: Create custom troubleshooting scenarios
- **Local Storage**: All data saved in your browser
- **Import/Export**: Backup and share scenario libraries
- **Admin Tools**: Cache management and bulk operations

## 📱 User Interface

### Navigation
- **Collapsible Verticals**: Organized by business area
  - 🔐 **Auth**: Authentication, MFA, Conditional Access
  - 🔄 **Sync**: Synchronization, Provisioning, Cross-tenant
  - 👤 **Account Management**: Users, Groups, B2B/B2C
  - ⚙️ **General**: Applications, Performance, Miscellaneous

### Features
- **Scenario Counters**: See how many scenarios in each category
- **Tag Cloud**: Visual representation of popular troubleshooting topics
- **Recent Queries**: Quick access to recently used searches
- **Statistics**: Overview of your troubleshooting library

## 🔧 Technical Details

### Architecture
- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Storage**: Browser LocalStorage for scenarios and preferences
- **Styling**: Modern CSS with responsive design
- **No Dependencies**: Self-contained, no external frameworks required

### Data Structure
- **Modular Design**: Scenarios organized by categories in JSON format
- **Lazy Loading**: Optimized performance with on-demand content loading
- **Extensible**: Easy to add new scenarios and categories

## 🛡️ Browser Compatibility

**Supported Browsers:**
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ **Important**: Must use `http://localhost` (not `file://` URLs)

## 📈 Content Stats

- **350+ Scenarios**: Covering all major Azure AD troubleshooting areas
- **Categories**: 60+ specific troubleshooting categories
- **KQL Queries**: Hundreds of production-ready queries
- **Regular Updates**: Content extracted from latest Azure AD documentation

## 🎯 For Support Engineers

**Perfect for:**
- Quick troubleshooting scenario lookup
- KQL query reference and copying
- Step-by-step troubleshooting procedures
- Building custom troubleshooting libraries
- Sharing knowledge within support teams

**Workflow:**
1. **Search** for your issue (e.g., "conditional access", "sync errors")
2. **Browse** relevant scenarios and troubleshooting steps
3. **Copy** KQL queries directly to your tools
4. **Add** custom scenarios for your specific environment

## 🚀 Getting Started

### Prerequisites
- Modern web browser
- Local web server (VS Code Live Server extension recommended)

### Installation
1. **Clone or download** this repository
2. **Open** in VS Code with Live Server extension
3. **Start Live Server** (right-click `index.html` → "Open with Live Server")
4. **Navigate** to `http://localhost:5500`
5. **Start troubleshooting!**

### First Steps
- Click **"All Categories"** to see all scenarios
- Try **searching** for "authentication" or "sync"
- **Click tags** in the tag cloud to filter scenarios
- **Expand verticals** in the navigation to browse categories
- **Click scenario cards** to view detailed KQL queries and steps

## 📖 Documentation

- **User Guide**: Explore the interface to discover features
- **Admin Tools**: Use keyboard shortcuts (Ctrl+Shift+A) for admin functions
- **Troubleshooting**: Check browser console for any issues

## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Built For

Azure AD/Entra ID support engineers who need quick access to troubleshooting resources, KQL queries, and proven procedures.

---

**Made with ❤️ for the Azure AD support community**

4. **Performance Issues - Slow Sign-ins** (3 queries)
   - Performance overview
   - Location-based analysis
   - Conditional access impact

5. **Guest User Access Issues** (3 queries)
   - Invitation tracking
   - Sign-in problems
   - B2B policy blocks

6. **Application Registration Issues** (3 queries)
   - Registration failures
   - Consent and permissions
   - Service principal issues

7. **Hybrid Identity Sync Issues** (3 queries)
   - AD Connect sync errors
   - Password hash sync
   - Object synchronization status

## 🏗️ Architecture

DiagnostIQ uses a **modular hybrid architecture** designed for scalability:

- **Core Samples**: Quick-start scenarios for immediate use
- **Modular Scenarios**: Organized by category in individual JSON files
- **DataManager**: Centralized loading and management system
- **Backward Compatible**: Supports legacy formats and smooth migrations

📖 **See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed technical documentation**

## 🛠 Technical Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Syntax Highlighting**: Prism.js with custom KQL language support
- **Storage**: LocalStorage for user data and preferences
- **Icons**: Font Awesome for professional UI elements
- **Responsive**: Mobile-first CSS design

## 📁 Project Structure

```
diagnostiq/
├── index.html              # Main application interface
├── styles.css              # Application styling and responsive design
├── app.js                  # Core application logic and interactions
├── data.js                 # Sample troubleshooting data and queries
├── session_starter.md      # Project memory and development context
├── README.md              # This documentation file
└── .gitignore             # Git ignore rules
```

## 🚀 Quick Start

### Option 1: Direct Download
1. Download or clone this repository
2. Open `index.html` in any modern web browser
3. Start searching for troubleshooting scenarios!

### Option 2: Local Web Server
```bash
# Clone the repository
git clone https://github.com/kayasax/DiagnostIQ.git
cd DiagnostIQ

# Start a local web server (Python)
python -m http.server 8000

# Or use Node.js
npx http-server

# Open http://localhost:8000 in your browser
```

### Option 3: Content Extraction (Advanced)
For advanced users with access to internal documentation:

```powershell
# Extract content from local documentation sources
# (Note: Specific extraction tools not included in public repository)

# Test with sample data
node test-extraction.js
```

📖 **See documentation for detailed extraction procedures**

## 📖 Usage Guide

### Searching for Queries
1. **Quick Search**: Type keywords like "Cross Tenant Sync" or "Authentication"
2. **Filter by Category**: Use the dropdown to narrow results by type
3. **Filter by Cluster**: Specify environment (prod, staging, dogfood)
4. **Quick Access**: Use sidebar links for common scenarios

### Using Queries
1. Find the relevant troubleshooting scenario
2. Click the "Copy" button on any KQL query
3. Paste into your Kusto environment (Azure Data Explorer, Log Analytics)
4. Follow the step-by-step troubleshooting guide

### Managing Your Library
- **Add Custom Scenarios**: Click "Add Cheat Sheet" to create your own
- **Edit Existing**: Click the pencil icon on any custom cheat sheet
- **Delete**: Click the trash icon on custom cheat sheets
- **Backup/Share**: Use Export/Import buttons for library management

### Creating Multi-Query Scenarios
1. Click "Add Cheat Sheet"
2. Fill in scenario details and troubleshooting steps
3. Add multiple queries using "Add Another Query" button
4. Each query can have its own name, description, and KQL code

## 🤝 Contributing

We welcome contributions! Here are ways you can help:

### Adding Troubleshooting Scenarios
- Create new scenarios for common Azure AD issues
- Enhance existing queries with better KQL
- Add step-by-step troubleshooting procedures

### Technical Improvements
- Enhanced KQL syntax highlighting
- Performance optimizations
- UI/UX improvements
- Mobile responsiveness enhancements

### Integration Features
- SharePoint/OneDrive integration
- GitHub repository synchronization
- Enterprise documentation integration
- Query parameterization

## 🔮 Roadmap

### Phase 1: Enhanced Data Integration
- [ ] Content parser for automatic import
- [ ] SharePoint integration for team libraries
- [ ] GitHub repository synchronization
- [x] Export/import functionality

### Phase 2: Advanced Features
- [ ] Query parameterization (dynamic values)
- [ ] Query result visualization
- [ ] Collaborative editing and sharing
- [ ] Version control for queries
- [ ] Advanced search with tags

### Phase 3: Enterprise Integration
- [ ] Azure AD authentication
- [ ] Role-based access control
- [ ] Audit logging for query usage
- [ ] Integration with support ticketing systems
- [ ] Analytics and usage reporting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for Azure AD/Entra ID support engineers
- Inspired by the need for quick access to troubleshooting resources
- KQL syntax highlighting powered by Prism.js
- Icons provided by Font Awesome

## 🐛 Issues & Support

Found a bug or have a feature request? Please:
1. Check existing [Issues](../../issues)
2. Create a new issue with detailed description
3. Include steps to reproduce (for bugs)
4. Tag appropriately (bug, enhancement, question)

## 🔗 Links

- [Azure AD Documentation](https://docs.microsoft.com/en-us/azure/active-directory/)
- [KQL Reference](https://docs.microsoft.com/en-us/azure/data-explorer/kusto/query/)
- [Azure Log Analytics](https://docs.microsoft.com/en-us/azure/azure-monitor/logs/)

---

**Made with ❤️ for the Azure AD support community**
