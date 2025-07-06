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

        // Initialize modal handler
        this.modalHandler = new ModalHandler(this);

        // Setup immediately but don't auto-initialize data
        this.setupEventListeners();
        this.loadSyntaxHighlighter();
        // Note: initializeApp() will be called externally to prevent multiple initializations
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

        // Show welcome message initially
        this.showWelcomeMessage();

        console.log(`📊 DiagnostIQ initialized with ${this.allCheatSheets.length} scenarios`);
    }

    clearSearch() {
        const searchInput = document.getElementById('searchInput');
        const clusterFilter = document.getElementById('clusterFilter');
        const categoryFilter = document.getElementById('categoryFilter');

        if (searchInput) searchInput.value = '';
        if (clusterFilter) clusterFilter.value = '';
        if (categoryFilter) categoryFilter.value = '';

        this.showWelcomeMessage();
    }

    showWelcomeMessage() {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const searchResults = document.getElementById('searchResults');

        if (welcomeMessage) {
            welcomeMessage.style.display = 'block';
        }
        if (searchResults) {
            searchResults.style.display = 'none';
        }
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

        // Add keyboard shortcut for cache clearing (Ctrl+Shift+R)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                console.log('🧹 Cache clear shortcut triggered');
                this.clearCacheAndReload();
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

        console.log('🔍 Performing search:', { searchTerm, selectedCategory, totalScenarios: this.allCheatSheets.length });

        // If no search term and no category, show message
        if (!searchTerm && (!selectedCategory || selectedCategory === 'all')) {
            this.displayMessage('Please enter a search term or select a category.');
            return;
        }

        let results = this.allCheatSheets;

        // Filter by category if selected
        if (selectedCategory && selectedCategory !== 'all') {
            results = results.filter(sheet => sheet.category === selectedCategory);
            console.log(`🏷️ Category filter applied (${selectedCategory}): ${results.length} scenarios`);
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

            console.log(`🔍 Search filter applied (${searchTerm}): ${results.length} scenarios`);

            // Add to recent queries if it's a search term
            this.addToRecentQueries(searchTerm);
        }

        console.log(`✅ Final results: ${results.length} scenarios`);

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

        // Group categories by vertical - SIMPLIFIED TO 4 MAIN VERTICALS as specified
        const verticals = {
            'account-management': { name: 'Account Management', icon: '👤', categories: [] },
            'sync': { name: 'Sync', icon: '�', categories: [] },
            'auth': { name: 'Auth', icon: '🔐', categories: [] },
            'general': { name: 'General', icon: '�', categories: [] }
        };

        // Get categories and group them
        const categories = window.dataManager ? window.dataManager.getAvailableCategories() : [];
        console.log('📂 Categories from data manager:', categories);

        categories.forEach(category => {
            const vertical = this.getCategoryVertical(category.name);
            if (verticals[vertical]) {
                verticals[vertical].categories.push(category);
            }
        });

        // Build navigation HTML with proper structure for existing CSS
        let navigationHTML = '';

        // Add "All Categories" option first
        navigationHTML += `
            <div class="category-item all-categories" onclick="app.clearAllFilters()">
                <div class="category-label">
                    <i class="fas fa-list"></i>
                    All Categories
                </div>
                <span class="category-count">${categories.reduce((sum, cat) => sum + cat.count, 0)}</span>
            </div>
            <div class="nav-divider"></div>
        `;

        Object.entries(verticals).forEach(([key, vertical]) => {
            if (vertical.categories.length > 0) {
                const totalScenarios = vertical.categories.reduce((sum, cat) => sum + cat.count, 0);

                navigationHTML += `
                <div class="vertical-section">
                    <div class="vertical-header" onclick="app.toggleVertical('${key}')">
                        <span class="vertical-arrow" id="arrow-${key}">▶</span>
                        <span class="vertical-icon">${vertical.icon}</span>
                        <span class="vertical-name">${vertical.name}</span>
                        <span class="vertical-count">${totalScenarios}</span>
                    </div>
                    <div class="vertical-categories" id="categories-${key}" style="display: none;">
                        ${vertical.categories.map(cat => `
                            <div class="category-item subcategory" onclick="app.filterByCategory('${cat.name}')">
                                <div class="category-label">
                                    ${cat.displayName}
                                </div>
                                <span class="category-count">${cat.count}</span>
                            </div>
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
            // Auth - Authentication, MFA, Conditional Access, Device Registration, Password Protection
            'authentication': 'auth',
            'conditional-access': 'auth',
            'conditional-access-policies': 'auth',
            'mfa': 'auth',
            'multi-factor-authentication': 'auth',
            'consent': 'auth',
            'device-registration': 'auth',
            'device-certificate-prompts': 'auth',
            'password-protection': 'auth',
            'old-sspr-self-service-password-reset': 'auth',
            'sspr-self-service-password-reset': 'auth',
            'token-protection-app-compatibility': 'auth',
            'token-protection-device-issues': 'auth',
            'vpn-authentication-failures': 'auth',
            'vpn-certificate-filtering': 'auth',
            'vpn-certificate-issues': 'auth',
            'vpn-connectivity': 'auth',

            // Sync - Synchronization, Provisioning, ADFS, Hybrid Identity
            'synchronization': 'sync',
            'provisioning': 'sync',
            'domain-services': 'sync',
            'adfs-and-wap': 'sync',
            'adfs-troubleshooting': 'sync',
            'adfs-wap-trust': 'sync',
            'azure-ad-password-protection-for-on2dpremise': 'sync',

            // Account Management - User Management, Groups, Identities, RBAC, PIM
            'azure-ad-user-management': 'account-management',
            'azure-ad-domain-name-management': 'account-management',
            'azure-ad-managed-identities-msi': 'account-management',
            'azure-rbac-for-resources': 'account-management',
            'privilege-identity-management-pim': 'account-management',
            'user-scoping': 'account-management',
            'dynamic-groups': 'account-management',
            'aad-account-management': 'account-management',
            'b2b': 'account-management',
            'b2c': 'account-management',
            'b2c-identity-experience': 'account-management',
            'b2c-protocol-support': 'account-management',

            // General - Everything else including applications, monitoring, reporting, misc
            'azure-ad-application-management': 'general',
            'applications': 'general',
            'application-targeting': 'general',
            'saml': 'general',
            'azure-ad-reporting-workflow': 'general',
            'azure-ad-activity-logs-in-azure-monitor': 'general',
            'azure-monitor-integration': 'general',
            'reporting-workflow': 'general',
            'risk-policies': 'general',
            'report-only-configuration': 'general',
            'report-only-result-interpretation': 'general',
            'report-only-tool-limitations': 'general',
            'report-only-workbook-issues': 'general',
            'performance': 'general',
            'graph-api-integration': 'general',
            'graph-scope-policy-evaluation': 'general',
            'graph-scope-translation': 'general',
            'general': 'general',
            'general-guidance': 'general',
            'miscellaneous': 'general',
            'identity': 'general',
            'testing': 'general',
            'aadsts-errors': 'general',
            'microsoft-entra-portal-microsoftaadiam': 'general',
            'office365-app-group-blocking': 'general',
            'office365-app-group-configuration': 'general'
        };

        return verticalMap[categoryName] || 'general';
    }

    getVerticalIcon(vertical) {
        const iconMap = {
            'authentication': '🔐',
            'synchronization': '🔄',
            'applications': '📱',
            'collaboration': '🤝',
            'management': '⚙️',
            'monitoring': '📊',
            'infrastructure': '🏗️',
            'general': '📚'
        };
        return iconMap[vertical] || '📄';
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

        tagCloudContainer.innerHTML = sortedTags.map(([tag, count]) => {
            // Determine tag size based on count
            let sizeClass = 'size-sm';
            if (count >= 10) sizeClass = 'size-xl';
            else if (count >= 7) sizeClass = 'size-lg';
            else if (count >= 5) sizeClass = 'size-md';
            else if (count >= 3) sizeClass = 'size-sm';
            else sizeClass = 'size-xs';

            return `<span class="cloud-tag ${sizeClass}" onclick="app.filterByTag('${tag}')" title="${count} scenarios">
                ${tag} <span class="tag-count">${count}</span>
            </span>`;
        }).join('');
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
    clearAllFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('categoryFilter').value = 'all';

        // Sort scenarios by most recent first (lastUpdated field)
        const sortedScenarios = [...this.allCheatSheets].sort((a, b) => {
            const dateA = new Date(a.lastUpdated || '2020-01-01');
            const dateB = new Date(b.lastUpdated || '2020-01-01');
            return dateB - dateA; // Most recent first
        });

        this.displayResults(sortedScenarios);
        this.updateResultsCount(sortedScenarios.length);
    }

    filterByCategory(categoryName) {
        document.getElementById('categoryFilter').value = categoryName;
        document.getElementById('searchInput').value = '';
        this.performSearch();
    }

    toggleVertical(verticalKey) {
        console.log('🔄 Toggling vertical:', verticalKey);

        const categoriesContainer = document.getElementById(`categories-${verticalKey}`);
        const arrow = document.getElementById(`arrow-${verticalKey}`);

        if (!categoriesContainer || !arrow) {
            console.error('❌ Vertical elements not found:', {
                verticalKey,
                categoriesContainer: !!categoriesContainer,
                arrow: !!arrow
            });
            return;
        }

        // Check current visibility state
        // If display is not set or is block/empty, consider it visible
        const currentDisplay = categoriesContainer.style.display;
        const isVisible = currentDisplay !== 'none';

        console.log('📊 Current state:', {
            verticalKey,
            currentDisplay,
            isVisible,
            arrowText: arrow.textContent
        });

        if (isVisible) {
            // Collapse
            categoriesContainer.style.display = 'none';
            arrow.textContent = '▶';
            console.log('📁 Collapsed vertical:', verticalKey);
        } else {
            // Expand
            categoriesContainer.style.display = 'block';
            arrow.textContent = '▼';
            console.log('📂 Expanded vertical:', verticalKey);
        }
    }

    searchByTag(tag) {
        document.getElementById('searchInput').value = tag;
        document.getElementById('categoryFilter').value = 'all';
        this.performSearch();
    }

    filterByTag(tag) {
        console.log(`🏷️ Filtering by tag: ${tag}`);
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
        const resultsContainer = document.getElementById('searchResults');
        const welcomeMessage = document.getElementById('welcomeMessage');

        console.log('🎨 displayResults called:', {
            containerFound: !!resultsContainer,
            welcomeFound: !!welcomeMessage,
            resultsCount: results.length,
            firstResult: results[0]
        });

        if (!resultsContainer) {
            console.error('❌ searchResults container not found!');
            return;
        }

        // Show results container and hide welcome message
        resultsContainer.style.display = 'block';
        if (welcomeMessage) {
            welcomeMessage.style.display = 'none';
        }

        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">No scenarios found matching your criteria.</div>';
            return;
        }

        console.log('🏗️ Creating scenario cards...');

        // Handle async loading internally without requiring callers to be async
        this.renderScenariosAsync(results, resultsContainer);
    }

    async renderScenariosAsync(results, resultsContainer) {
        try {
            console.log('🔄 Loading full scenarios for card display...');

            // Load full scenarios before creating cards to ensure KQL queries are available
            const fullScenarios = await Promise.all(
                results.map(async (sheet) => {
                    if (!sheet.isLoaded && window.dataManager) {
                        console.log(`📄 Loading full content for: ${sheet.title}`);
                        const fullScenario = await window.dataManager.loadFullScenario(sheet);
                        if (fullScenario) {
                            console.log(`✅ Loaded full scenario: ${fullScenario.title}, KQL queries: ${fullScenario.kqlQueries ? fullScenario.kqlQueries.length : 'none'}`);
                            return fullScenario;
                        }
                    }
                    return sheet;
                })
            );

            console.log('🎯 Full scenarios loaded, creating cards...');
            const cardsHTML = fullScenarios.map(sheet => {
                console.log(`🔍 Creating card for: ${sheet.title}, isLoaded: ${sheet.isLoaded}, kqlQueries: ${sheet.kqlQueries ? sheet.kqlQueries.length : 'none'}`);
                return this.createScenarioCard(sheet);
            }).join('');

            console.log('📝 Generated HTML length:', cardsHTML.length);

            resultsContainer.innerHTML = cardsHTML;
            console.log('✅ HTML set to container');

            // Re-apply syntax highlighting
            if (typeof Prism !== 'undefined') {
                Prism.highlightAll();
            }
        } catch (error) {
            console.error('❌ Error loading scenarios:', error);
            // Show error message instead of broken cards
            resultsContainer.innerHTML = `<div class="no-results">Error loading scenarios: ${error.message}</div>`;
        }
    }    createScenarioCard(sheet) {
        console.log('🎴 Creating card for scenario:', {
            id: sheet.id,
            title: sheet.title,
            category: sheet.category,
            isLoaded: sheet.isLoaded,
            hasKqlQueries: !!sheet.kqlQueries,
            kqlQueriesLength: sheet.kqlQueries ? sheet.kqlQueries.length : 0
        });

        const categoryDisplayName = this.formatCategoryName(sheet.category);
        const tagsHtml = sheet.tags ?
            sheet.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';

        let queriesHtml = '';

        // Handle both old 'queries' and new 'kqlQueries' format
        const allQueries = [
            ...(sheet.queries || []),
            ...(sheet.kqlQueries || [])
        ].filter(query => query && (query.query || query.description || query.name));

        console.log(`🔍 Queries found for ${sheet.title}:`, {
            oldQueries: sheet.queries ? sheet.queries.length : 0,
            kqlQueries: sheet.kqlQueries ? sheet.kqlQueries.length : 0,
            totalFiltered: allQueries.length
        });

        if (allQueries.length > 0) {
            queriesHtml = allQueries.map((query, index) => `
                <div class="query-section">
                    <h4 class="section-title">
                        <i class="fas fa-code"></i>
                        Query ${index + 1}: ${query.name || query.description || 'Untitled'}
                    </h4>
                    ${query.description ? `<p class="query-description">${query.description}</p>` : ''}
                    <div class="query-container">
                        <pre><code class="language-kql query-code">${query.query || ''}</code></pre>
                        <button class="copy-btn" onclick="app.copyToClipboard(\`${(query.query || '').replace(/`/g, '\\`')}\`)">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                </div>
            `).join('');
        }

        // Handle troubleshooting steps
        let stepsHtml = '';
        if (sheet.steps && sheet.steps.length > 0) {
            stepsHtml = `
                <div class="steps-section">
                    <h4 class="section-title">
                        <i class="fas fa-list-ol"></i>
                        Troubleshooting Steps
                    </h4>
                    <div class="steps-list">
                        <ol>
                            ${sheet.steps.map(step => `<li>${step}</li>`).join('')}
                        </ol>
                    </div>
                </div>
            `;
        } else if (sheet.troubleshootingSteps && sheet.troubleshootingSteps.length > 0) {
            stepsHtml = `
                <div class="steps-section">
                    <h4 class="section-title">
                        <i class="fas fa-list-ol"></i>
                        Troubleshooting Steps
                    </h4>
                    <div class="steps-list">
                        <ol>
                            ${sheet.troubleshootingSteps.map(step => {
                                // Handle both object and string formats
                                if (typeof step === 'object' && step !== null) {
                                    const stepTitle = step.step || step.title || 'Step';
                                    const stepDesc = step.description || '';
                                    return `<li><strong>${stepTitle}</strong>${stepDesc ? `: ${stepDesc}` : ''}</li>`;
                                } else {
                                    return `<li>${step}</li>`;
                                }
                            }).join('')}
                        </ol>
                    </div>
                </div>
            `;
        }

        // Get category vertical icon
        const verticalIcon = this.getVerticalIcon(sheet.vertical || this.getCategoryVertical(sheet.category));

        const cardHTML = `
            <div class="cheat-sheet-card" data-category="${sheet.category}">
                <div class="card-header">
                    <div class="card-icon">
                        ${verticalIcon}
                    </div>
                    <div class="card-main">
                        <h3 class="card-title" onclick="app.modalHandler.viewScenarioDetails('${sheet.id}')">${sheet.title}</h3>
                        <div class="card-meta">
                            <span class="category">
                                <i class="fas fa-tag"></i> ${categoryDisplayName}
                            </span>
                            ${allQueries.length > 0 ? `<span class="queries">
                                <i class="fas fa-code"></i> ${allQueries.length} ${allQueries.length === 1 ? 'Query' : 'Queries'}
                            </span>` : ''}
                            ${sheet.tags && sheet.tags.length > 0 ? `<span class="tags">
                                <i class="fas fa-tags"></i> ${sheet.tags.length} ${sheet.tags.length === 1 ? 'Tag' : 'Tags'}
                            </span>` : ''}
                            ${sheet.queryCount > 0 ? `<span class="query-count">
                                <i class="fas fa-search"></i> ${sheet.queryCount} Queries
                            </span>` : ''}
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="action-btn view-btn" onclick="app.modalHandler.viewScenarioDetails('${sheet.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>

                <div class="card-content">
                    ${sheet.description ? `<p class="card-description">${sheet.description}</p>` : ''}

                    ${tagsHtml ? `<div class="tags-section">${tagsHtml}</div>` : ''}

                    ${stepsHtml}

                    ${queriesHtml}
                </div>
            </div>
        `;

        console.log('🎴 Generated card HTML length:', cardHTML.length);
        return cardHTML;
    }

    displayMessage(message, type = 'info') {
        const resultsContainer = document.getElementById('searchResults');
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

    editScenario(scenarioId) {
        console.log('✏️ Edit scenario requested:', scenarioId);

        const scenario = this.allCheatSheets.find(s => s.id === scenarioId);
        if (scenario) {
            this.editingSheetId = scenarioId;
            console.log('Editing scenario:', scenario);

            // Close any existing modals first
            if (this.modalHandler) {
                this.modalHandler.closeScenarioModal();
            }

            // Small delay to ensure modal is closed before opening edit modal
            setTimeout(() => {
                // Populate the edit modal with scenario data
                this.populateEditModal(scenario);

                // Show the modal with edit-mode class for higher z-index
                const modal = document.getElementById('addCheatSheetModal');
                if (modal) {
                    modal.classList.add('edit-mode');
                    modal.style.display = 'block';
                    console.log('✅ Edit modal opened for scenario:', scenarioId);
                } else {
                    console.error('❌ addCheatSheetModal not found');
                }
            }, 100);
        } else {
            this.showToast('Scenario not found', 'error');
        }
    }

    populateEditModal(scenario) {
        // Update modal title for editing
        const modalTitle = document.querySelector('#addCheatSheetModal .modal-header h2');
        if (modalTitle) {
            modalTitle.textContent = 'Edit Scenario';
        }

        // Update save button text
        const saveButton = document.querySelector('#addCheatSheetModal .modal-footer .btn-primary');
        if (saveButton) {
            saveButton.textContent = 'Update Scenario';
        }

        // Populate form fields
        const titleField = document.getElementById('title');
        const categoryField = document.getElementById('category');
        const clusterField = document.getElementById('cluster');
        const databaseField = document.getElementById('database');
        const descriptionField = document.getElementById('description');
        const stepsField = document.getElementById('steps');

        if (titleField) titleField.value = scenario.title || '';
        if (categoryField) {
            // Populate categories first using the form-specific method
            this.populateFormCategoryDropdown();
            categoryField.value = scenario.category || '';
        }
        if (clusterField) clusterField.value = scenario.cluster || '';
        if (databaseField) databaseField.value = scenario.database || '';
        if (descriptionField) descriptionField.value = scenario.description || '';

        // Handle steps (convert array to numbered list if needed)
        if (stepsField) {
            const steps = scenario.steps || scenario.troubleshootingSteps || [];
            if (Array.isArray(steps)) {
                stepsField.value = steps.map((step, index) => `${index + 1}. ${step}`).join('\n');
            } else {
                stepsField.value = steps || '';
            }
        }

        // Populate queries
        this.populateQueryInputs(scenario);
    }

    populateQueryInputs(scenario) {
        const queryInputsContainer = document.getElementById('queryInputs');
        if (!queryInputsContainer) return;

        // Get all queries from scenario
        const allQueries = [
            ...(scenario.queries || []),
            ...(scenario.kqlQueries || [])
        ];

        // Clear existing query inputs
        queryInputsContainer.innerHTML = '';

        // Add existing queries
        allQueries.forEach((query, index) => {
            this.addQueryInput(index, query);
        });

        // Add one empty query input if no queries exist
        if (allQueries.length === 0) {
            this.addQueryInput(0);
        }

        // Add "Add Query" button
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = 'btn btn-secondary';
        addButton.textContent = '+ Add Query';
        addButton.onclick = () => this.addQueryInput(allQueries.length);
        queryInputsContainer.appendChild(addButton);
    }

    addQueryInput(index, queryData = null) {
        const queryInputsContainer = document.getElementById('queryInputs');
        if (!queryInputsContainer) return;

        const queryDiv = document.createElement('div');
        queryDiv.className = 'query-input-group';
        queryDiv.innerHTML = `
            <div class="form-group">
                <label for="queryName${index}">Query ${index + 1} Name:</label>
                <input type="text" id="queryName${index}" value="${queryData?.name || queryData?.description || ''}" placeholder="Query name or description">
            </div>
            <div class="form-group">
                <label for="queryCode${index}">Query ${index + 1} Code:</label>
                <textarea id="queryCode${index}" rows="4" placeholder="KQL query code...">${queryData?.query || ''}</textarea>
            </div>
            <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">Remove Query</button>
        `;

        // Insert before the "Add Query" button
        const addButton = queryInputsContainer.querySelector('.btn.btn-secondary');
        if (addButton) {
            queryInputsContainer.insertBefore(queryDiv, addButton);
        } else {
            queryInputsContainer.appendChild(queryDiv);
        }
    }

    /**
     * Export current scenarios to a JSON file
     */
    exportLibrary() {
        try {
            console.log('📤 Starting export...');

            // Get all current scenarios from data manager
            const scenarios = window.dataManager.getAllScenarios();

            // Create export data structure
            const exportData = {
                metadata: {
                    exportDate: new Date().toISOString(),
                    version: "v0.6.1",
                    source: "DiagnostIQ",
                    totalScenarios: scenarios.length
                },
                scenarios: scenarios,
                localCheatSheets: this.localCheatSheets || []
            };

            // Create and download file
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

            const exportFileDefaultName = `diagnostiq-export-${new Date().toISOString().split('T')[0]}.json`;

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();

            console.log('✅ Export completed successfully');
            this.showNotification('📤 Library exported successfully!', 'success');

        } catch (error) {
            console.error('❌ Export failed:', error);
            this.showNotification('❌ Export failed: ' + error.message, 'error');
        }
    }

    /**
     * Import scenarios from a JSON file
     */
    importLibrary(event) {
        try {
            console.log('📥 Starting import...');

            const file = event.target.files[0];
            if (!file) {
                console.log('🚫 No file selected');
                return;
            }

            if (!file.name.endsWith('.json')) {
                this.showNotification('❌ Please select a JSON file', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    this.processImportData(importData, file.name);
                } catch (parseError) {
                    console.error('❌ Invalid JSON file:', parseError);
                    this.showNotification('❌ Invalid JSON file format', 'error');
                }
            };

            reader.onerror = () => {
                console.error('❌ File reading failed');
                this.showNotification('❌ Failed to read file', 'error');
            };

            reader.readAsText(file);

        } catch (error) {
            console.error('❌ Import failed:', error);
            this.showNotification('❌ Import failed: ' + error.message, 'error');
        }
    }

    /**
     * Process imported data and merge with existing scenarios
     */
    processImportData(importData, fileName) {
        try {
            console.log('🔄 Processing import data from:', fileName);

            // Validate import data structure
            if (!importData.scenarios || !Array.isArray(importData.scenarios)) {
                throw new Error('Invalid import format: scenarios array not found');
            }

            const importedScenarios = importData.scenarios;
            const existingScenarios = window.dataManager.getAllScenarios();

            // Create a map of existing scenarios by ID for quick lookup
            const existingIds = new Set(existingScenarios.map(s => s.id));

            // Filter new scenarios
            const newScenarios = importedScenarios.filter(scenario => !existingIds.has(scenario.id));
            const duplicateCount = importedScenarios.length - newScenarios.length;

            if (newScenarios.length === 0) {
                this.showNotification('ℹ️ No new scenarios to import (all duplicates)', 'info');
                return;
            }

            // Show import confirmation modal
            this.showImportConfirmationModal(newScenarios, duplicateCount, importData);

        } catch (error) {
            console.error('❌ Import processing failed:', error);
            this.showNotification('❌ Import processing failed: ' + error.message, 'error');
        }
    }

    /**
     * Show import confirmation modal
     */
    showImportConfirmationModal(newScenarios, duplicateCount, importData) {
        const modalHtml = `
            <div id="importConfirmationModal" class="modal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-upload"></i> Import Scenarios</h2>
                        <span class="close" onclick="closeImportModal()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="import-summary">
                            <p><strong>Import Summary:</strong></p>
                            <ul>
                                <li>📥 New scenarios to import: <strong>${newScenarios.length}</strong></li>
                                ${duplicateCount > 0 ? `<li>⚠️ Duplicate scenarios (will be skipped): <strong>${duplicateCount}</strong></li>` : ''}
                                <li>📊 Your current scenarios: <strong>${window.dataManager.getAllScenarios().length}</strong></li>
                            </ul>
                        </div>

                        ${newScenarios.length > 0 ? `
                            <div class="import-preview">
                                <h4>New Scenarios Preview:</h4>
                                <div class="scenarios-list" style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
                                    ${newScenarios.slice(0, 10).map(scenario => `
                                        <div class="scenario-item" style="margin-bottom: 8px; padding: 5px; background: #f5f5f5; border-radius: 3px;">
                                            <strong>${scenario.title || scenario.id}</strong>
                                            <br><small>Category: ${scenario.category || 'Unknown'}</small>
                                        </div>
                                    `).join('')}
                                    ${newScenarios.length > 10 ? `<div style="text-align: center; color: #666; margin-top: 10px;">... and ${newScenarios.length - 10} more scenarios</div>` : ''}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="closeImportModal()">Cancel</button>
                        ${newScenarios.length > 0 ? `<button type="button" class="btn btn-primary" onclick="confirmImport()">Import ${newScenarios.length} Scenarios</button>` : ''}
                    </div>
                </div>
            </div>
        `;

        // Store import data temporarily for confirmation
        this.pendingImportData = { newScenarios, importData };

        // Add modal to page
        const existingModal = document.getElementById('importConfirmationModal');
        if (existingModal) {
            existingModal.remove();
        }
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    /**
     * Confirm and execute the import
     */
    confirmImport() {
        try {
            if (!this.pendingImportData) {
                throw new Error('No pending import data found');
            }

            const { newScenarios, importData } = this.pendingImportData;

            console.log(`📥 Importing ${newScenarios.length} new scenarios...`);

            // Add new scenarios to data manager
            for (const scenario of newScenarios) {
                // Ensure scenario has required fields
                if (!scenario.id) {
                    scenario.id = this.generateScenarioId(scenario.title || 'imported-scenario');
                }

                window.dataManager.addScenario(scenario);
            }

            // Handle local cheat sheets if present
            if (importData.localCheatSheets && Array.isArray(importData.localCheatSheets)) {
                const newLocalSheets = importData.localCheatSheets.filter(sheet =>
                    !this.localCheatSheets.some(existing => existing.id === sheet.id)
                );

                if (newLocalSheets.length > 0) {
                    this.localCheatSheets.push(...newLocalSheets);
                    localStorage.setItem('localCheatSheets', JSON.stringify(this.localCheatSheets));
                    console.log(`📥 Imported ${newLocalSheets.length} local cheat sheets`);
                }
            }

            // Refresh the display
            this.allCheatSheets = window.dataManager.getAllScenarios();
            if (this.localCheatSheets.length > 0) {
                this.allCheatSheets.push(...this.localCheatSheets);
            }

            this.closeImportModal();
            this.setupInterface(); // Refresh the UI

            this.showNotification(`✅ Successfully imported ${newScenarios.length} scenarios!`, 'success');
            console.log('✅ Import completed successfully');

            // Clear pending data
            this.pendingImportData = null;

        } catch (error) {
            console.error('❌ Import confirmation failed:', error);
            this.showNotification('❌ Import failed: ' + error.message, 'error');
        }
    }

    /**
     * Close the import modal
     */
    closeImportModal() {
        const modal = document.getElementById('importConfirmationModal');
        if (modal) {
            modal.remove();
        }
        this.pendingImportData = null;
    }

    /**
     * Generate a unique scenario ID
     */
    generateScenarioId(title) {
        const base = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        const timestamp = Date.now();
        return `${base}-${timestamp}`;
    }

    /**
     * Sync library (placeholder for future remote sync functionality)
     */
    syncLibrary() {
        console.log('🔄 Sync library triggered');

        // Show sync options modal
        const modalHtml = `
            <div id="syncLibraryModal" class="modal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-sync"></i> Sync Library</h2>
                        <span class="close" onclick="closeSyncModal()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="sync-options">
                            <p>Choose synchronization method:</p>

                            <div class="sync-option" style="margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                                <h4><i class="fas fa-download"></i> Export Current Data</h4>
                                <p>Download your current scenarios as a backup file.</p>
                                <button class="btn btn-primary" onclick="window.app.exportLibrary(); closeSyncModal();">
                                    <i class="fas fa-download"></i> Export Now
                                </button>
                            </div>

                            <div class="sync-option" style="margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                                <h4><i class="fas fa-upload"></i> Import External Data</h4>
                                <p>Import scenarios from a previously exported file.</p>
                                <input type="file" id="syncImportFile" accept=".json" style="margin-bottom: 10px;">
                                <button class="btn btn-primary" onclick="if(document.getElementById('syncImportFile').files[0]) { window.app.importLibrary({target: document.getElementById('syncImportFile')}); closeSyncModal(); } else { alert('Please select a file first'); }">
                                    <i class="fas fa-upload"></i> Import File
                                </button>
                            </div>

                            <div class="sync-option" style="margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                                <h4><i class="fas fa-search-plus"></i> Check for Updates</h4>
                                <p>Check for new scenarios in the original data files.</p>
                                <button class="btn btn-primary" onclick="window.app.checkForNewScenarios(); closeSyncModal();">
                                    <i class="fas fa-search-plus"></i> Check Updates
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="closeSyncModal()">Close</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        const existingModal = document.getElementById('syncLibraryModal');
        if (existingModal) {
            existingModal.remove();
        }
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    /**
     * Close the sync modal
     */
    closeSyncModal() {
        const modal = document.getElementById('syncLibraryModal');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
        `;
        notification.textContent = message;

        // Add to page
        document.body.appendChild(notification);

        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // ===== END IMPORT/EXPORT FUNCTIONALITY =====

    /**
     * Show the add cheat sheet modal
     */
    showAddCheatSheet() {
        console.log('📝 showAddCheatSheet called');
        // Reset editing mode
        this.editingSheetId = null;

        // Clear form first
        this.clearForm();

        // Update modal title and button text for adding (not editing)
        const modalTitle = document.querySelector('#addCheatSheetModal .modal-header h2');
        const saveButton = document.querySelector('#addCheatSheetModal .modal-footer .btn-primary');

        if (modalTitle) {
            modalTitle.textContent = 'Add New Cheat Sheet';
        }
        if (saveButton) {
            saveButton.textContent = 'Save Cheat Sheet';
        }

        // Remove edit-mode class if present
        const modal = document.getElementById('addCheatSheetModal');
        if (modal) {
            modal.classList.remove('edit-mode');
            modal.style.display = 'block';
            console.log('✅ Add cheat sheet modal opened');
        } else {
            console.error('❌ addCheatSheetModal not found');
        }

        // Populate categories in the dropdown
        this.populateFormCategoryDropdown();
    }

    /**
     * Reset to original data from files
     */
    resetToOriginalData() {
        console.log('🔄 resetToOriginalData called');

        if (confirm('This will reset all your edits and reload original data from files. Are you sure?')) {
            try {
                // Clear localStorage
                localStorage.removeItem('diagnostiq_scenarios');
                localStorage.removeItem('deletedScenarios');

                // Reset data manager
                if (window.dataManager && typeof window.dataManager.resetToFiles === 'function') {
                    window.dataManager.resetToFiles();
                }

                // Reload the page to get fresh data
                window.location.reload();

            } catch (error) {
                console.error('❌ Reset failed:', error);
                this.showNotification('❌ Reset failed: ' + error.message, 'error');
            }
        }
    }

    /**
     * Check for new scenarios in files vs localStorage
     */
    checkForNewScenarios() {
        console.log('🔍 checkForNewScenarios called');

        if (window.dataManager && typeof window.dataManager.checkForNewScenarios === 'function') {
            return window.dataManager.checkForNewScenarios();
        } else {
            console.error('❌ DataManager.checkForNewScenarios not available');
            this.showNotification('❌ Admin function not available', 'error');
        }
    }

    /**
     * Import selected scenarios from the admin modal
     */
    importSelectedScenarios() {
        console.log('📥 importSelectedScenarios called');

        if (window.dataManager && typeof window.dataManager.importSelectedScenarios === 'function') {
            return window.dataManager.importSelectedScenarios();
        } else {
            console.error('❌ DataManager.importSelectedScenarios not available');
            this.showNotification('❌ Import function not available', 'error');
        }
    }

    /**
     * Import all new scenarios from the admin modal
     */
    importAllNewScenarios() {
        console.log('📥 importAllNewScenarios called');

        if (window.dataManager && typeof window.dataManager.importAllNewScenarios === 'function') {
            return window.dataManager.importAllNewScenarios();
        } else {
            console.error('❌ DataManager.importAllNewScenarios not available');
            this.showNotification('❌ Import function not available', 'error');
        }
    }

    /**
     * Close the new scenarios modal
     */
    closeNewScenariosModal() {
        console.log('❌ closeNewScenariosModal called');

        const modal = document.getElementById('newScenariosModal');
        if (modal) {
            modal.remove();
            console.log('✅ New scenarios modal closed');
        }
    }

    /**
     * Save cheat sheet (for modal) - handles both add and edit modes
     */
    saveCheatSheet() {
        console.log('💾 saveCheatSheet called');

        try {
            // Get form data
            const form = document.getElementById('cheatSheetForm');
            if (!form) {
                throw new Error('Cheat sheet form not found');
            }

            const formData = new FormData(form);
            const title = formData.get('title')?.trim();
            const description = formData.get('description')?.trim() || '';
            const category = formData.get('category');
            const cluster = formData.get('cluster')?.trim() || '';
            const database = formData.get('database')?.trim() || '';
            const stepsText = formData.get('steps')?.trim() || '';

            console.log('📋 Form data collected:', {
                title: title,
                category: category,
                description: description ? 'Present' : 'Empty',
                cluster: cluster,
                database: database,
                steps: stepsText ? 'Present' : 'Empty'
            });

            if (!title || !category) {
                this.showNotification('❌ Title and category are required', 'error');
                console.error('❌ Validation failed:', { title: !!title, category: !!category });
                return;
            }

            // Parse steps
            const steps = stepsText.split('\n')
                .map(step => step.replace(/^\d+\.\s*/, '').trim())
                .filter(step => step.length > 0);

            // Collect query data
            const queries = [];
            const queryInputs = document.querySelectorAll('.query-input-group');
            queryInputs.forEach((queryGroup, index) => {
                const nameField = queryGroup.querySelector(`#queryName${index}`);
                const codeField = queryGroup.querySelector(`#queryCode${index}`);

                if (nameField && codeField && codeField.value.trim()) {
                    queries.push({
                        name: nameField.value.trim() || `Query ${index + 1}`,
                        description: nameField.value.trim() || `Query ${index + 1}`,
                        query: codeField.value.trim()
                    });
                }
            });

            // Create scenario object
            const scenarioData = {
                id: this.editingSheetId || this.generateScenarioId(title),
                title: title,
                description: description,
                category: category,
                cluster: cluster,
                database: database,
                steps: steps,
                kqlQueries: queries,
                vertical: this.getCategoryVertical(category),
                tags: [],
                isLoaded: true,
                queryCount: queries.length
            };

            console.log('💾 Scenario data prepared:', {
                id: scenarioData.id,
                title: scenarioData.title,
                category: scenarioData.category,
                isEdit: !!this.editingSheetId,
                queryCount: queries.length
            });

            // Add or update scenario via data manager
            if (window.dataManager) {
                const isEditMode = !!this.editingSheetId;

                if (isEditMode) {
                    // Update existing scenario
                    console.log('✏️ Updating existing scenario:', this.editingSheetId);
                    window.dataManager.updateScenario(scenarioData);
                } else {
                    // Add new scenario
                    console.log('➕ Adding new scenario');
                    window.dataManager.addScenario(scenarioData);
                }

                // Refresh the display
                this.allCheatSheets = window.dataManager.getAllScenarios();
                this.setupInterface();

                // Reset editing state
                this.editingSheetId = null;

                // Close modal
                this.closeModal();

                const actionText = isEditMode ? 'updated' : 'saved';
                this.showNotification(`✅ Scenario ${actionText} successfully!`, 'success');
                console.log(`✅ Scenario ${actionText}:`, scenarioData.id);
            } else {
                throw new Error('DataManager not available');
            }

        } catch (error) {
            console.error('❌ Save failed:', error);
            this.showNotification('❌ Save failed: ' + error.message, 'error');
        }
    }

    /**
     * Close modal
     */
    closeModal() {
        console.log('❌ closeModal called');

        const modals = [
            'addCheatSheetModal',
            'newScenariosModal',
            'importConfirmationModal',
            'syncLibraryModal'
        ];

        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
                console.log(`✅ Modal ${modalId} closed`);
            }
        });
    }

    /**
     * Go to home/welcome view
     */
    goHome() {
        console.log('🏠 goHome called');

        // Clear search
        this.clearSearch();

        // Show welcome message
        this.showWelcomeMessage();

        console.log('✅ Returned to home view');
    }

    clearForm() {
        const form = document.getElementById('cheatSheetForm');
        if (form) {
            form.reset();
        }

        // Reset current queries
        this.currentQueries = [{ name: '', description: '', query: '' }];

        // Clear query inputs container
        const queryInputsContainer = document.getElementById('queryInputs');
        if (queryInputsContainer) {
            queryInputsContainer.innerHTML = '';
        }
    }

    populateFormCategoryDropdown() {
        const categorySelect = document.getElementById('category');
        if (!categorySelect) {
            console.warn('❌ Category select element not found');
            return;
        }

        // Check if dataManager is available
        if (!window.dataManager) {
            console.error('❌ dataManager not available for form category population');
            return;
        }

        // Get categories from data manager
        const categories = window.dataManager.getAvailableCategories();
        console.log('🏷️ Populating form categories:', categories.length);

        if (!categories || categories.length === 0) {
            console.warn('⚠️ No categories available from dataManager');
            categorySelect.innerHTML = '<option value="">No categories available</option>';
            return;
        }

        // Clear existing options
        categorySelect.innerHTML = '<option value="">Select a category...</option>';

        // Sort categories alphabetically
        categories.sort((a, b) => a.displayName.localeCompare(b.displayName));

        // Add category options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = `${category.displayName} (${category.count})`;
            categorySelect.appendChild(option);
        });

        console.log(`✅ Form category dropdown populated with ${categories.length} categories`);
    }

    // Clear cache and force reload - for debugging
    async clearCacheAndReload() {
        try {
            console.log('🧹 Clearing cache and reloading...');

            if (window.dataManager) {
                await window.dataManager.forceReload();
                this.allCheatSheets = window.dataManager.getAllScenarios();

                // Refresh the UI
                this.setupInterface();
                this.showWelcomeMessage();

                this.showToast('✅ Cache cleared and data reloaded!', 'success');
                console.log('✅ Cache cleared and reloaded successfully');
            }
        } catch (error) {
            console.error('❌ Cache clear failed:', error);
            this.showToast('❌ Cache clear failed: ' + error.message, 'error');
        }
    }
}

// Global function for HTML button
function clearSearch() {
    if (window.app) {
        window.app.clearSearch();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.diagnostiqInitialized) {
        console.warn('⚠️ DiagnostIQ already initialized, skipping...');
        return;
    }
    window.diagnostiqInitialized = true;

    if (!window.dataManager) {
        window.dataManager = new DataManager();
    }
    if (!window.app) {
        window.app = new QueryLibraryApp();
        window.app.initializeApp();
    }
});

// Legacy compatibility
window.initializeApp = () => {
    if (window.diagnostiqInitialized) {
        console.warn('⚠️ DiagnostIQ already initialized, skipping legacy init...');
        return;
    }
    window.diagnostiqInitialized = true;

    if (!window.dataManager) {
        window.dataManager = new DataManager();
    }
    if (!window.app) {
        window.app = new QueryLibraryApp();
        window.app.initializeApp();
    }
};

// Note: Global function exposures are handled in index.html setupGlobalFunctions()
// to avoid duplication and ensure proper initialization order
