// DiagnostIQ - Optimized Main Application Logic v0.6.1
// Removed: Runtime deduplication, multiple loading cycles, redundant processing

class QueryLibraryApp {
    constructor() {
        this.currentResults = [];
        this.recentQueries = JSON.parse(localStorage.getItem('recentQueries')) || [];
        this.localCheatSheets = JSON.parse(localStorage.getItem('localCheatSheets')) || [];
        this.allCheatSheets = []; // Will be populated by data manager
        this.currentQueries = [{ name: '', description: '', query: '' }];
        this.editingSheetId = null;
        this.isInitialized = false;

        // Setup immediately but wait for data
        this.setupEventListeners();
        this.loadSyntaxHighlighter();
        this.initializeApp();
    }

    async initializeApp() {
        try {
            console.log('🚀 Initializing DiagnostIQ...');

            // Load data once using optimized data manager
            await window.dataManager.loadAllScenarios();

            // Get clean scenarios (no runtime deduplication needed)
            this.allCheatSheets = window.dataManager.getAllScenarios();

            // Add any local scenarios
            if (this.localCheatSheets.length > 0) {
                this.allCheatSheets.push(...this.localCheatSheets);
            }

            console.log('✅ DiagnostIQ initialized successfully');

            // Setup UI once
            this.setupInterface();
            this.isInitialized = true;

        } catch (error) {
            console.error('❌ Failed to initialize DiagnostIQ:', error);
            // Continue with fallback
            this.setupInterface();
        }
    }

    setupInterface() {
        // Populate UI elements once
        this.populateCategoryDropdown();
        this.populateCategoryNavigation();
        this.populateTagCloud();
        this.populateStatistics();
        this.populateQuickAccess();
        this.updateTotalCount();
        this.updateCategoryChangesIndicator();
        this.populateRecentQueries();

        console.log(`📊 DiagnostIQ initialized with ${this.allCheatSheets.length} scenarios`);
    }

    setupEventListeners() {
        // Search input event
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('addCheatSheetModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    loadSyntaxHighlighter() {
        // Configure Prism.js for KQL syntax highlighting
        if (typeof Prism !== 'undefined') {
            Prism.languages.kql = {
                'keyword': /\b(?:let|where|project|extend|summarize|order|top|limit|join|union|count|distinct|ago|now|between|contains|startswith|endswith|matches|regex|sort|desc|asc|by|on|kind|inner|outer|left|right|fullouter|anti|semi|datetime|timespan|dynamic|case|iff|iif|coalesce|nullif|toscalar|tostring|toint|tolong|todouble|tobool|todatetime|totimespan|parse|split|replace|substring|strlen|indexof|countof|bin|floor|ceiling|round|abs|sign|sqrt|pow|log|log10|exp|sin|cos|tan|asin|acos|atan|degrees|radians|pi|rand|range|repeat|series|make_list|make_set|mv_expand|mv_apply|pack|pack_array|pack_dictionary|unpack|bag_keys|bag_merge|zip|array_length|array_slice|array_sort_asc|array_sort_desc|set_difference|set_intersect|set_union|prev|next|row_number|rank|dense_rank|percentile|percentiles|stdev|stdevp|variance|variancep|dcountif|countif|sumif|avgif|minif|maxif|anyif|arg_max|arg_min|take_any|make_datetime|make_timespan|dayofweek|dayofyear|monthofyear|weekofyear|hourofday|minuteofhour|secondofminute)\b/i,
                'operator': /[+\-*\/=<>!&|%]/,
                'function': /\b\w+(?=\s*\()/,
                'string': {
                    pattern: /"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'/,
                    greedy: true
                },
                'number': /\b\d+(?:\.\d+)?\b/,
                'punctuation': /[{}[\];(),.:]/
            };
        }
    }

    performSearch() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        const selectedCategory = document.getElementById('categoryFilter').value;

        if (!searchTerm && !selectedCategory) {
            this.displayMessage('Please enter a search term or select a category.');
            return;
        }

        let results = this.allCheatSheets;

        // Filter by category if selected
        if (selectedCategory && selectedCategory !== 'all') {
            results = results.filter(sheet => sheet.category === selectedCategory);
        }

        // Filter by search term if provided
        if (searchTerm) {
            results = results.filter(sheet => {
                const matchTitle = sheet.title && sheet.title.toLowerCase().includes(searchTerm);
                const matchDescription = sheet.description && sheet.description.toLowerCase().includes(searchTerm);
                const matchCategory = sheet.category && sheet.category.toLowerCase().includes(searchTerm);
                const matchTags = sheet.tags && sheet.tags.some(tag => tag.toLowerCase().includes(searchTerm));
                const matchQueries = sheet.queries && sheet.queries.some(q =>
                    (q.query && q.query.toLowerCase().includes(searchTerm)) ||
                    (q.description && q.description.toLowerCase().includes(searchTerm))
                );
                const matchKqlQueries = sheet.kqlQueries && sheet.kqlQueries.some(q =>
                    (q.query && q.query.toLowerCase().includes(searchTerm)) ||
                    (q.description && q.description.toLowerCase().includes(searchTerm))
                );

                return matchTitle || matchDescription || matchCategory || matchTags || matchQueries || matchKqlQueries;
            });

            // Add to recent queries if it's a search term
            this.addToRecentQueries(searchTerm);
        }

        this.currentResults = results;
        this.displayResults(results);
        this.updateResultsCount(results.length);
    }

    populateCategoryDropdown() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter) return;

        // Get categories from data manager
        const categories = window.dataManager.getAvailableCategories();

        // Clear existing options except "All Categories"
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';

        // Sort categories alphabetically
        categories.sort((a, b) => a.displayName.localeCompare(b.displayName));

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = `${category.displayName} (${category.count})`;
            categoryFilter.appendChild(option);
        });

        console.log(`🏷️ Available categories: (${categories.length})`, categories);
    }

    populateCategoryNavigation() {
        console.log('🏗️ Populating vertical-based category navigation...');

        const navContainer = document.getElementById('categoryNavigation');
        if (!navContainer) return;

        // Group categories by vertical
        const verticals = {
            authentication: { name: 'Authentication & Access', icon: '🔐', categories: [] },
            synchronization: { name: 'Synchronization', icon: '🔄', categories: [] },
            applications: { name: 'Applications & SSO', icon: '📱', categories: [] },
            collaboration: { name: 'B2B & B2C', icon: '🤝', categories: [] },
            management: { name: 'Management & Governance', icon: '⚙️', categories: [] },
            monitoring: { name: 'Monitoring & Reporting', icon: '📊', categories: [] },
            infrastructure: { name: 'Infrastructure', icon: '🏗️', categories: [] },
            general: { name: 'General & Miscellaneous', icon: '📚', categories: [] }
        };

        // Get categories and group them
        const categories = window.dataManager.getAvailableCategories();

        categories.forEach(category => {
            const vertical = this.getCategoryVertical(category.name);
            if (verticals[vertical]) {
                verticals[vertical].categories.push(category);
            }
        });

        // Build navigation HTML
        let navigationHTML = '';
        Object.entries(verticals).forEach(([key, vertical]) => {
            if (vertical.categories.length > 0) {
                navigationHTML += `
                <div class="vertical-section">
                    <h3 class="vertical-header">
                        <span class="vertical-icon">${vertical.icon}</span>
                        ${vertical.name}
                        <span class="vertical-count">(${vertical.categories.length})</span>
                    </h3>
                    <div class="vertical-categories">
                        ${vertical.categories.map(cat => `
                            <button class="category-btn" onclick="app.filterByCategory('${cat.name}')">
                                ${cat.displayName}
                                <span class="category-count">${cat.count}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>`;
            }
        });

        navContainer.innerHTML = navigationHTML;

        // Log stats
        const verticalStats = {};
        Object.entries(verticals).forEach(([key, vertical]) => {
            if (vertical.categories.length > 0) {
                verticalStats[key] = {
                    categories: vertical.categories.length,
                    scenarios: vertical.categories.reduce((sum, cat) => sum + cat.count, 0)
                };
            }
        });

        console.log('📊 Vertical stats for navigation:', verticalStats);
        console.log(`✅ Vertical-based navigation populated with ${Object.keys(verticalStats).length} verticals`);
    }

    getCategoryVertical(categoryName) {
        const verticalMap = {
            'authentication': 'authentication',
            'conditional-access': 'authentication',
            'conditional-access-policies': 'authentication',
            'mfa': 'authentication',
            'multi-factor-authentication': 'authentication',
            'consent': 'authentication',
            'device-registration': 'authentication',
            'device-certificate-prompts': 'authentication',
            'password-protection': 'authentication',
            'old-sspr-self-service-password-reset': 'authentication',
            'sspr-self-service-password-reset': 'authentication',
            'token-protection-app-compatibility': 'authentication',
            'token-protection-device-issues': 'authentication',
            'vpn-authentication-failures': 'authentication',
            'vpn-certificate-filtering': 'authentication',
            'vpn-certificate-issues': 'authentication',
            'vpn-connectivity': 'authentication',

            'synchronization': 'synchronization',
            'provisioning': 'synchronization',

            'azure-ad-application-management': 'applications',
            'applications': 'applications',
            'application-targeting': 'applications',
            'saml': 'applications',

            'b2b': 'collaboration',
            'b2c': 'collaboration',
            'b2c-identity-experience': 'collaboration',
            'b2c-protocol-support': 'collaboration',

            'azure-ad-user-management': 'management',
            'azure-ad-domain-name-management': 'management',
            'azure-ad-managed-identities-msi': 'management',
            'azure-rbac-for-resources': 'management',
            'privilege-identity-management-pim': 'management',
            'user-scoping': 'management',
            'dynamic-groups': 'management',
            'graph-api-integration': 'management',
            'graph-scope-policy-evaluation': 'management',
            'graph-scope-translation': 'management',

            'azure-ad-reporting-workflow': 'monitoring',
            'azure-ad-activity-logs-in-azure-monitor': 'monitoring',
            'azure-monitor-integration': 'monitoring',
            'reporting-workflow': 'monitoring',
            'risk-policies': 'monitoring',
            'report-only-configuration': 'monitoring',
            'report-only-result-interpretation': 'monitoring',
            'report-only-tool-limitations': 'monitoring',
            'report-only-workbook-issues': 'monitoring',
            'performance': 'monitoring',

            'domain-services': 'infrastructure',
            'adfs-and-wap': 'infrastructure',
            'adfs-troubleshooting': 'infrastructure',
            'adfs-wap-trust': 'infrastructure',
            'azure-ad-password-protection-for-on2dpremise': 'infrastructure',

            'general': 'general',
            'general-guidance': 'general',
            'miscellaneous': 'general',
            'identity': 'general',
            'testing': 'general',
            'aad-account-management': 'general',
            'aadsts-errors': 'general',
            'microsoft-entra-portal-microsoftaadiam': 'general',
            'office365-app-group-blocking': 'general',
            'office365-app-group-configuration': 'general'
        };

        return verticalMap[categoryName] || 'general';
    }

    populateTagCloud() {
        const tagCloudContainer = document.getElementById('tagCloud');
        if (!tagCloudContainer) return;

        const tagCounts = {};
        this.allCheatSheets.forEach(sheet => {
            if (sheet.tags && Array.isArray(sheet.tags)) {
                sheet.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        const sortedTags = Object.entries(tagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 20); // Top 20 tags

        tagCloudContainer.innerHTML = sortedTags.map(([tag, count]) =>
            `<span class="tag-item" onclick="app.searchByTag('${tag}')" title="${count} scenarios">
                ${tag} <span class="tag-count">${count}</span>
            </span>`
        ).join('');
    }

    populateStatistics() {
        const statsContainer = document.getElementById('statistics');
        if (!statsContainer) return;

        const categoryCount = new Set(this.allCheatSheets.map(s => s.category)).size;
        const avgQueriesPerScenario = this.allCheatSheets.reduce((sum, s) => {
            const queryCount = (s.queries?.length || 0) + (s.kqlQueries?.length || 0);
            return sum + queryCount;
        }, 0) / this.allCheatSheets.length;

        statsContainer.innerHTML = `
            <div class="stat-item">
                <div class="stat-number">${this.allCheatSheets.length}</div>
                <div class="stat-label">Total Scenarios</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${categoryCount}</div>
                <div class="stat-label">Categories</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${Math.round(avgQueriesPerScenario * 10) / 10}</div>
                <div class="stat-label">Avg Queries/Scenario</div>
            </div>
        `;
    }

    populateQuickAccess() {
        const quickAccessContainer = document.getElementById('quickAccess');
        if (!quickAccessContainer) return;

        // Get top categories by scenario count
        const categoryCount = {};
        this.allCheatSheets.forEach(sheet => {
            categoryCount[sheet.category] = (categoryCount[sheet.category] || 0) + 1;
        });

        const topCategories = Object.entries(categoryCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6)
            .map(([category, count]) => ({
                category,
                count,
                displayName: this.formatCategoryName(category)
            }));

        quickAccessContainer.innerHTML = topCategories.map(cat =>
            `<button class="quick-access-btn" onclick="app.filterByCategory('${cat.category}')">
                ${cat.displayName}
                <span class="quick-access-count">${cat.count}</span>
            </button>`
        ).join('');
    }

    populateRecentQueries() {
        const recentQueriesContainer = document.getElementById('recentQueries');
        if (!recentQueriesContainer) {
            console.log('ℹ️ Recent queries container not found - feature disabled');
            return;
        }

        if (this.recentQueries.length === 0) {
            recentQueriesContainer.innerHTML = '<p class="recent-empty">No recent queries</p>';
            return;
        }

        recentQueriesContainer.innerHTML = this.recentQueries
            .slice(-5) // Last 5 queries
            .reverse()
            .map(query =>
                `<button class="recent-query-btn" onclick="app.searchRecent('${query}')">
                    ${query}
                </button>`
            ).join('');
    }

    formatCategoryName(category) {
        if (!category) return '';
        return category.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    updateTotalCount() {
        const totalCountElement = document.getElementById('totalCount');
        if (totalCountElement) {
            totalCountElement.textContent = this.allCheatSheets.length;
        }
    }

    updateCategoryChangesIndicator() {
        // Placeholder for category changes tracking
        const changesIndicator = document.getElementById('categoryChanges');
        if (changesIndicator) {
            changesIndicator.innerHTML = '<span class="changes-status">✅ All categories loaded</span>';
        }
    }

    updateResultsCount(count) {
        const resultsCountElement = document.getElementById('resultsCount');
        if (resultsCountElement) {
            resultsCountElement.textContent = `${count} scenarios found`;
        }
    }

    // Quick filter methods
    filterByCategory(categoryName) {
        document.getElementById('categoryFilter').value = categoryName;
        document.getElementById('searchInput').value = '';
        this.performSearch();
    }

    searchByTag(tag) {
        document.getElementById('searchInput').value = tag;
        document.getElementById('categoryFilter').value = 'all';
        this.performSearch();
    }

    searchRecent(query) {
        document.getElementById('searchInput').value = query;
        this.performSearch();
    }

    addToRecentQueries(query) {
        if (query && !this.recentQueries.includes(query)) {
            this.recentQueries.push(query);
            if (this.recentQueries.length > 10) {
                this.recentQueries.shift(); // Keep only last 10
            }
            localStorage.setItem('recentQueries', JSON.stringify(this.recentQueries));
            this.populateRecentQueries();
        }
    }

    displayResults(results) {
        const resultsContainer = document.getElementById('results');
        if (!resultsContainer) return;

        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">No scenarios found matching your criteria.</div>';
            return;
        }

        resultsContainer.innerHTML = results.map(sheet => this.createScenarioCard(sheet)).join('');

        // Re-apply syntax highlighting
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }
    }

    createScenarioCard(sheet) {
        const categoryDisplayName = this.formatCategoryName(sheet.category);
        const tagsHtml = sheet.tags ?
            sheet.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';

        let queriesHtml = '';

        // Handle both old 'queries' and new 'kqlQueries' format
        const allQueries = [
            ...(sheet.queries || []),
            ...(sheet.kqlQueries || [])
        ];

        if (allQueries.length > 0) {
            queriesHtml = allQueries.map((query, index) => `
                <div class="query-section">
                    <h4>Query ${index + 1}: ${query.name || query.description || 'Untitled'}</h4>
                    ${query.description ? `<p class="query-description">${query.description}</p>` : ''}
                    <pre><code class="language-kql">${query.query}</code></pre>
                    <button class="copy-btn" onclick="app.copyToClipboard(\`${query.query.replace(/`/g, '\\`')}\`)">
                        📋 Copy Query
                    </button>
                </div>
            `).join('');
        }

        // Handle troubleshooting steps
        let stepsHtml = '';
        if (sheet.steps && sheet.steps.length > 0) {
            stepsHtml = `
                <div class="steps-section">
                    <h4>Troubleshooting Steps:</h4>
                    <ol class="steps-list">
                        ${sheet.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
            `;
        } else if (sheet.troubleshootingSteps && sheet.troubleshootingSteps.length > 0) {
            stepsHtml = `
                <div class="steps-section">
                    <h4>Troubleshooting Steps:</h4>
                    <ol class="steps-list">
                        ${sheet.troubleshootingSteps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
            `;
        }

        return `
            <div class="scenario-card" data-category="${sheet.category}">
                <div class="scenario-header">
                    <h3 class="scenario-title">${sheet.title}</h3>
                    <span class="scenario-category">${categoryDisplayName}</span>
                </div>

                ${sheet.description ? `<p class="scenario-description">${sheet.description}</p>` : ''}

                ${tagsHtml ? `<div class="scenario-tags">${tagsHtml}</div>` : ''}

                ${stepsHtml}

                ${queriesHtml}

                <div class="scenario-actions">
                    <button class="action-btn" onclick="app.viewScenarioDetails('${sheet.id}')">
                        👁️ View Details
                    </button>
                    <button class="action-btn" onclick="app.editScenario('${sheet.id}')">
                        ✏️ Edit
                    </button>
                </div>
            </div>
        `;
    }

    displayMessage(message, type = 'info') {
        const resultsContainer = document.getElementById('results');
        if (resultsContainer) {
            resultsContainer.innerHTML = `<div class="message ${type}">${message}</div>`;
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Query copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            this.showToast('Failed to copy query', 'error');
        });
    }

    showToast(message, type = 'success') {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    viewScenarioDetails(id) {
        const scenario = this.allCheatSheets.find(s => s.id === id);
        if (scenario) {
            // Open in a modal or new window
            console.log('Viewing scenario:', scenario);
            // Implementation depends on your UI design
        }
    }

    editScenario(id) {
        const scenario = this.allCheatSheets.find(s => s.id === id);
        if (scenario) {
            this.editingSheetId = id;
            // Open edit modal
            console.log('Editing scenario:', scenario);
            // Implementation depends on your UI design
        }
    }

    closeModal() {
        const modal = document.getElementById('addCheatSheetModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.editingSheetId = null;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new QueryLibraryApp();
});

// Legacy compatibility
window.initializeApp = () => {
    if (!window.app) {
        window.app = new QueryLibraryApp();
    }
};
