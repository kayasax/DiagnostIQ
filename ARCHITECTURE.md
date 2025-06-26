# 🏗️ DiagnosticIQ - Modular Data Structure

## Overview

DiagnosticIQ now uses a **hybrid modular architecture** that scales to hundreds of troubleshooting scenarios while maintaining simplicity and performance.

## 📁 New File Structure

```
/data/
├── core-samples.js              # Quick-start scenarios (JS format)
├── data-manager.js              # Central data management system
└── scenarios/                   # Modular scenario library
    ├── index.json              # Scenario catalog and metadata
    ├── authentication/
    │   └── token-issues.json    # Authentication troubleshooting
    ├── synchronization/
    │   └── cross-tenant-sync.json
    ├── provisioning/
    │   └── user-provisioning.json
    ├── performance/
    │   └── slow-signins.json
    └── applications/
        └── integration-issues.json
```

## 🚀 Benefits

### **Scalability**
- ✅ Support hundreds of scenarios without performance issues
- ✅ Lazy loading - load only needed scenarios
- ✅ Organized by category for easy navigation

### **Maintainability** 
- ✅ Individual files are easy to find and edit
- ✅ Better version control with smaller, focused commits
- ✅ Reduced merge conflicts in team environments
- ✅ Clear separation of concerns

### **Collaboration**
- ✅ Different teams can maintain their expertise areas
- ✅ Easier to contribute new scenarios
- ✅ Category-based ownership and review processes

### **Performance**
- ✅ Core samples load instantly for quick start
- ✅ Additional scenarios load asynchronously
- ✅ Smaller initial bundle size
- ✅ Better caching strategies possible

## 📋 Scenario JSON Format

Each scenario file follows this structure:

```json
[
    {
        "id": "category-1",
        "title": "Scenario Title",
        "category": "auth|sync|provisioning|performance|applications",
        "cluster": "prod|staging|dogfood|custom",
        "description": "Brief description of the troubleshooting scenario",
        "queries": [
            {
                "name": "Query Name",
                "description": "What this query does",
                "query": "// KQL query content\nAuditLogs\n| where ..."
            }
        ],
        "steps": [
            "Step 1: Do this",
            "Step 2: Then this",
            "Step 3: Finally this"
        ],
        "tags": ["keyword1", "keyword2", "keyword3"]
    }
]
```

## 🔧 DataManager API

The `DataManager` class handles all data operations:

### Loading Data
```javascript
// Auto-loads when page loads
await dataManager.loadAllScenarios();

// Get loading status
const status = dataManager.getLoadingStatus();
```

### Scenario Management
```javascript
// Add custom scenario
const newScenario = dataManager.addCustomScenario(scenarioData);

// Update existing scenario
dataManager.updateScenario(id, updatedData);

// Remove scenario
dataManager.removeScenario(id);

// Get by category
const authScenarios = dataManager.getScenariosByCategory('auth');
```

### Import/Export
```javascript
// Export (custom scenarios only)
const exportData = dataManager.exportScenarios(true);

// Import scenarios
const count = dataManager.importScenarios(importData);
```

### Statistics
```javascript
// Get usage statistics
const stats = dataManager.getStatistics();
// Returns: { total, byCategory, byCluster, customCount }
```

## 📊 Categories

| Category | Description | Example Scenarios |
|----------|-------------|-------------------|
| **authentication** | Sign-in failures, MFA, conditional access | Token issues, MFA failures, CA blocks |
| **synchronization** | Directory sync, cross-tenant sync | Cross-tenant sync errors, AD Connect issues |
| **provisioning** | User provisioning, SCIM | Provisioning failures, SCIM errors |
| **performance** | Slow operations, latency | Slow sign-ins, performance bottlenecks |
| **applications** | App integration, service principals | App registration, consent issues |

## 🔄 Migration from Legacy Format

The system maintains **full backward compatibility**:

- ✅ Old `data.js` format still supported
- ✅ Existing custom scenarios preserved
- ✅ Import/export works with both formats
- ✅ Smooth transition for existing users

## 🤝 Contributing New Scenarios

### 1. Choose the Right Category
- `authentication/` - Sign-in, MFA, conditional access issues
- `synchronization/` - Directory sync, cross-tenant scenarios  
- `provisioning/` - User/group provisioning, SCIM
- `performance/` - Latency, slow operations analysis
- `applications/` - App registration, consent, service principals

### 2. Create Scenario File
```bash
# Create new scenario file
touch data/scenarios/authentication/new-scenario.json
```

### 3. Follow JSON Schema
- Use descriptive IDs: `auth-token-refresh`, `sync-permissions`
- Include 1-5 related queries per scenario
- Add clear troubleshooting steps
- Use relevant tags for searchability

### 4. Update Index (Optional)
Add entry to `data/scenarios/index.json` for documentation.

## 🛠️ Development Workflow

### Adding New Scenarios
1. Create JSON file in appropriate category directory
2. Follow the schema format
3. Test locally by refreshing the app
4. Commit with descriptive message

### Modifying Existing Scenarios  
1. Edit the JSON file directly
2. Validate JSON syntax
3. Test changes locally
4. Commit changes

### Creating New Categories
1. Create new directory under `data/scenarios/`
2. Add scenarios following the JSON format
3. Update `DataManager.scenarioSources.categories`
4. Update documentation

## 🔍 Validation

The DataManager includes built-in validation:

- ✅ Required fields: `id`, `title`, `category`, `description`, `queries`
- ✅ Array validation for `queries` and `steps`
- ✅ Non-empty query content
- ✅ Proper JSON syntax

Invalid scenarios are automatically filtered out with warnings in console.

## 📈 Future Enhancements

- **Auto-discovery**: Automatically detect new scenario files
- **Schema validation**: JSON schema validation for scenarios
- **Hot reloading**: Live updates during development
- **CDN support**: Load scenarios from external sources
- **Versioning**: Track scenario versions and changes
- **Analytics**: Track most-used scenarios and queries

---

This modular structure positions DiagnosticIQ for enterprise-scale usage while maintaining the simplicity that makes it powerful for individual users. 🚀
