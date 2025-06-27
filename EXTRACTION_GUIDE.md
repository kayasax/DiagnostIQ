# DiagnosticIQ Wiki Extraction Tool

This tool automatically extracts troubleshooting scenarios from a locally cloned Azure AD supportability wiki and converts them into DiagnosticIQ's modular JSON format.

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- A locally cloned Azure AD supportability wiki
- DiagnosticIQ project structure

### Basic Usage

```powershell
# Test the extraction tool first
node test-extraction.js

# Run extraction on your wiki (dry run)
node extract-wiki-scenarios.js "C:\path\to\your\wiki\clone" --dry-run --verbose

# Actual extraction
node extract-wiki-scenarios.js "C:\path\to\your\wiki\clone" --verbose
```

## 📖 Features

### Automatic Detection
- **KQL Queries**: Detects Kusto queries in code blocks and inline patterns
- **Troubleshooting Steps**: Extracts numbered lists and step-by-step procedures
- **Metadata**: Automatically determines categories, difficulty, and tags
- **Content Structure**: Parses markdown headers and sections intelligently

### Smart Categorization
Automatically categorizes scenarios based on content keywords:
- **Authentication**: Sign-in, MFA, tokens, federation
- **Provisioning**: SCIM, user lifecycle, account creation
- **Synchronization**: AD Connect, directory sync, hybrid scenarios
- **Applications**: App registrations, enterprise apps, API permissions
- **Performance**: Latency, optimization, capacity issues
- **Security**: Incidents, compliance, risk analysis
- **Reporting**: Analytics, dashboards, usage metrics
- **Identity Governance**: Access reviews, PIM, lifecycle workflows

### Data Quality
- Validates KQL syntax and relevance
- Estimates scenario difficulty and completion time
- Extracts troubleshooting tips and related topics
- Maintains source traceability

## 🛠️ Command Line Options

```
node extract-wiki-scenarios.js <wiki-path> [options]

Arguments:
  wiki-path          Path to the local wiki clone directory

Options:
  --output <path>    Output directory for scenarios (default: ./data/scenarios)
  --dry-run          Preview extraction without saving files
  --verbose          Enable verbose logging
  --help, -h         Show help message
```

### Examples

```powershell
# Basic extraction
node extract-wiki-scenarios.js "C:\wikis\azuread-supportability"

# Dry run with verbose output
node extract-wiki-scenarios.js "C:\wikis\azuread-supportability" --dry-run --verbose

# Custom output directory
node extract-wiki-scenarios.js "C:\wikis\azuread-supportability" --output "./extracted-scenarios"

# Test with sample data
node test-extraction.js
```

## 📁 Output Structure

The tool creates scenarios in the following structure:

```
data/scenarios/
├── index.json                 # Scenario registry
├── authentication/
│   ├── signin-failures-abc123.json
│   └── mfa-issues-def456.json
├── provisioning/
│   ├── scim-errors-ghi789.json
│   └── user-lifecycle-jkl012.json
└── performance/
    └── slow-signin-mno345.json
```

### Generated JSON Schema

Each scenario file contains:

```json
{
  "id": "unique-scenario-id",
  "title": "Human-readable title",
  "description": "Detailed description",
  "category": "authentication",
  "cluster": "general",
  "tags": ["signin", "troubleshooting"],
  "difficulty": "intermediate",
  "estimatedTime": 15,
  "lastUpdated": "2024-01-15T10:30:00Z",
  "source": {
    "type": "wiki",
    "path": "relative/path/to/source.md",
    "section": "Section Title",
    "extractedAt": "2024-01-15T10:30:00Z"
  },
  "queries": [
    {
      "id": "query-id",
      "title": "Query Title",
      "description": "What this query does",
      "kql": "SigninLogs | where...",
      "category": "analysis",
      "complexity": "medium"
    }
  ],
  "steps": [
    "Step 1: Check the logs",
    "Step 2: Analyze patterns"
  ],
  "relatedTopics": ["conditional-access", "mfa"],
  "troubleshootingTips": [
    "Always check correlation IDs",
    "Review policy assignments"
  ]
}
```

## 🧪 Testing

Before running on your actual wiki, test the extraction:

```powershell
# Run test with sample data
node test-extraction.js

# Keep test files for inspection
node test-extraction.js --keep-files

# Clean up test files
node test-extraction.js --cleanup
```

The test creates a sample wiki structure and demonstrates the extraction process.

## ⚙️ Configuration

Customize extraction behavior with `extraction-config.json`:

```json
{
  "extraction": {
    "patterns": {
      "kql": ["regex patterns for KQL detection"],
      "description": ["patterns for descriptions"],
      "steps": ["patterns for step extraction"]
    },
    "categories": {
      "authentication": ["keywords for auth scenarios"],
      "provisioning": ["keywords for provisioning"]
    },
    "excludeDirectories": [".git", "images"],
    "qualityThresholds": {
      "minQueryLength": 10,
      "minDescriptionLength": 20
    }
  }
}
```

## 📊 Extraction Statistics

The tool provides detailed statistics:
- Files processed
- Scenarios extracted
- Queries found
- Categories detected
- Errors encountered

## 🔍 What Gets Extracted

### KQL Queries
- Code blocks with \`\`\`kusto or \`\`\`kql
- Inline queries with Azure AD table references
- Let statements and complex query patterns

### Metadata
- Titles from markdown headers
- Descriptions from content patterns
- Tags from explicit tags or inferred from content
- Categories based on keyword analysis

### Troubleshooting Content
- Numbered step lists
- Bullet point procedures
- Tips and notes (💡, ⚠️ symbols)
- Related topics and references

## 🚨 Common Issues

### No Scenarios Found
- Verify wiki path is correct
- Check that markdown files contain KQL queries
- Ensure files aren't in excluded directories

### Invalid KQL Detection
- Queries must contain Azure AD table references
- Minimum query length threshold (configurable)
- Must follow basic KQL syntax patterns

### Category Misclassification
- Update keywords in `extraction-config.json`
- Add custom category mappings
- Review content for better keyword coverage

## 🔧 Troubleshooting

Enable verbose logging for detailed output:

```powershell
node extract-wiki-scenarios.js "C:\wiki\path" --verbose --dry-run
```

Common solutions:
1. **Path issues**: Use absolute paths with proper escaping
2. **Permissions**: Ensure read access to wiki directory
3. **Memory issues**: Process large wikis in smaller batches
4. **Node.js version**: Requires Node.js v14 or higher

## 🤝 Contributing

Improvements welcome! Areas for enhancement:
- Better KQL pattern recognition
- Additional metadata extraction
- Custom category definitions
- Batch processing for large wikis
- Integration with other documentation formats

## 📄 License

This tool is part of the DiagnosticIQ project and follows the same MIT license.

---

For more information about DiagnosticIQ, visit: https://github.com/kayasax/DiagnostIQ
