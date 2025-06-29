# 🧠 DiagnostIQ

Your intelligent companion for Azure AD/Entra ID troubleshooting. A comprehensive web-based application designed for support engineers to quickly find, manage, and share troubleshooting queries and procedures.

![DiagnostIQ](https://img.shields.io/badge/DiagnostIQ-Azure%20AD%20Troubleshooting-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🚀 Features

### Core Functionality
- **Smart Search**: Search across troubleshooting scenarios, queries, and keywords
- **Advanced Filtering**: Filter by category (Sync, Auth, Provisioning, Performance, Applications) and cluster (Production, Staging, Dogfood)
- **KQL Syntax Highlighting**: Professional code highlighting for Kusto Query Language
- **One-Click Copy**: Easy copy-to-clipboard functionality for queries
- **Multiple Queries per Topic**: Each troubleshooting scenario supports multiple related queries

### Library Management
- **Local Storage**: Create and save custom cheat sheets locally in your browser
- **Full CRUD Operations**: Add, edit, and delete custom troubleshooting scenarios
- **Import/Export**: Backup and share your custom query libraries via JSON files
- **Recent Queries**: Track recently searched items for quick access

### 🆕 Automated Content Extraction
- **Content Integration**: Automatically extract scenarios from local documentation sources
- **Smart Content Detection**: Intelligent parsing of markdown files to identify KQL queries, steps, and metadata
- **Category Auto-Classification**: Automatic categorization based on content analysis
- **Modular Architecture**: Scenarios organized in a scalable, maintainable structure
- **Quality Validation**: Ensures extracted content meets quality standards before integration

### Sample Content
The application includes **7 comprehensive troubleshooting scenarios** with **21 production-ready KQL queries**:

1. **Cross Tenant Sync Issues** (3 queries)
   - Sync status monitoring
   - Permission analysis
   - Configuration review

2. **Authentication Failures Analysis** (3 queries)
   - Overall failure analysis
   - MFA-specific issues
   - Conditional access blocks

3. **User Provisioning Errors** (3 queries)
   - Recent provisioning failures
   - Application-specific issues
   - SCIM provisioning problems

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
