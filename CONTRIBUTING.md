# Contributing to DiagnosticIQ

Thank you for your interest in contributing to DiagnosticIQ! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
- Use the GitHub Issues tab to report bugs or request features
- Search existing issues first to avoid duplicates
- Provide clear, detailed descriptions
- Include steps to reproduce for bugs
- Tag issues appropriately (bug, enhancement, question, help wanted)

### Adding Troubleshooting Scenarios
We're always looking for more real-world Azure AD troubleshooting scenarios!

#### What Makes a Good Scenario:
1. **Common Support Cases**: Issues that support engineers frequently encounter
2. **Complete Information**:
   - Clear problem description
   - Multiple related KQL queries
   - Step-by-step troubleshooting procedures
   - Proper categorization and tags

3. **Production-Ready Queries**:
   - Tested KQL that works in Log Analytics
   - Proper time ranges and filters
   - Comments explaining query logic
   - Performance considerations

#### Format for New Scenarios:
```javascript
{
    id: unique_id,
    title: "Descriptive Title",
    category: "sync|auth|provisioning|performance|applications",
    cluster: "prod|staging|dogfood",
    description: "Clear description of the troubleshooting scenario",
    queries: [
        {
            name: "Query Name",
            description: "What this query does",
            query: `// KQL query with comments
            AuditLogs
            | where TimeGenerated > ago(24h)
            // Add your KQL here`
        }
        // Add more queries as needed
    ],
    steps: [
        "Step-by-step troubleshooting instructions",
        "Each step should be actionable",
        "Reference the queries above when relevant"
    ],
    tags: ["relevant", "tags", "for", "searching"]
}
```

### Code Contributions

#### Development Setup
1. Fork the repository
2. Clone your fork locally
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Commit with clear messages
7. Push to your fork
8. Create a Pull Request

#### Code Style Guidelines
- **HTML**: Use semantic HTML5 elements, proper indentation
- **CSS**: Follow BEM naming convention where possible, mobile-first approach
- **JavaScript**:
  - Use ES6+ features
  - Follow camelCase naming
  - Add comments for complex logic
  - Maintain existing code structure

#### File Structure
- `index.html`: Main application interface
- `styles.css`: All styling and responsive design
- `app.js`: Core application logic
- `data.js`: Sample troubleshooting scenarios
- `session_starter.md`: Development context (don't modify)

### Testing Your Changes
Before submitting a pull request:

1. **Functionality Testing**:
   - Search works correctly
   - Filters function properly
   - Add/Edit/Delete operations work
   - Copy-to-clipboard functionality works
   - Import/Export features work

2. **Browser Compatibility**:
   - Test in Chrome, Firefox, Edge, Safari
   - Check responsive design on mobile devices

3. **Code Quality**:
   - No JavaScript console errors
   - HTML validates
   - CSS is clean and organized

### Pull Request Guidelines

#### PR Title Format:
- `feat: Add new troubleshooting scenario for [topic]`
- `fix: Resolve issue with [component]`
- `docs: Update documentation for [section]`
- `style: Improve UI for [component]`

#### PR Description Should Include:
- Clear description of changes
- Why the change is needed
- How to test the changes
- Screenshots for UI changes
- Any breaking changes

#### Review Process:
1. Automated checks (if implemented)
2. Code review by maintainers
3. Testing verification
4. Approval and merge

## 🎯 Priority Contribution Areas

### High Priority:
1. **More Troubleshooting Scenarios**: Real-world Azure AD support cases
2. **Enhanced KQL Queries**: Better, more efficient queries
3. **Mobile Responsiveness**: Improvements for mobile devices
4. **Accessibility**: ARIA labels, keyboard navigation

### Medium Priority:
1. **Performance Optimizations**: Faster search, better caching
2. **Advanced Features**: Query parameterization, result visualization
3. **Integration Features**: SharePoint, GitHub, Azure DevOps sync

### Future Enhancements:
1. **Authentication**: Azure AD login integration
2. **Collaborative Features**: Team sharing, comments
3. **Analytics**: Usage tracking, popular queries

## 🔧 Technical Guidelines

### Adding New Features
1. Maintain backward compatibility
2. Follow existing patterns and conventions
3. Add appropriate error handling
4. Consider performance impact
5. Update documentation

### Modifying Existing Features
1. Preserve existing functionality
2. Add tests for changes
3. Update related documentation
4. Consider impact on user data

### Data Storage
- Use localStorage for user preferences
- Maintain data structure compatibility
- Provide migration paths for breaking changes

## 📚 Resources

### Useful Links:
- [Azure AD Documentation](https://docs.microsoft.com/en-us/azure/active-directory/)
- [KQL Reference](https://docs.microsoft.com/en-us/azure/data-explorer/kusto/query/)
- [Prism.js Documentation](https://prismjs.com/)
- [Font Awesome Icons](https://fontawesome.com/icons)

### Development Tools:
- [VS Code](https://code.visualstudio.com/) with HTML/CSS/JS extensions
- Browser Developer Tools for debugging
- [JSON Validator](https://jsonlint.com/) for data files

## 🙋‍♀️ Questions?

If you have questions about contributing:
1. Check existing Issues and Discussions
2. Create a new Issue with the "question" label
3. Be specific about what you need help with

## 🎉 Recognition

Contributors will be recognized in:
- README.md acknowledgments
- Release notes for significant contributions
- Special thanks for major feature additions

Thank you for helping make Azure AD troubleshooting easier for support engineers worldwide! 🚀
