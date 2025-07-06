// DiagnostIQ - Main Application Logic

class QueryLibraryApp {
    constructor() {
        this.currentResults = [];
        this.recentQueries = JSON.parse(localStorage.getItem('recentQueries')) || [];
        this.localCheatSheets = JSON.parse(localStorage.getItem('localCheatSheets')) || [];
        this.allCheatSheets = []; // Will be populated by data manager
        this.currentQueries = [{ name: '', description: '', query: '' }];
        this.editingSheetId = null;
        this.dataManager = window.dataManager;

        // Don't initialize immediately - wait for data to load
        this.setupEventListeners();
        this.loadSyntaxHighlighter();

        // Initialize when data is ready
        if (this.dataManager.getLoadingStatus().complete) {
            this.onDataLoaded();
        } else {
            // Wait for data manager to load scenarios
            this.waitForDataLoad();
        }
    }

    async waitForDataLoad() {
        try {
            await this.dataManager.loadAllScenarios();
            this.onDataLoaded();
        } catch (error) {
            console.error('Failed to load data:', error);
            // Continue with fallback data
            this.onDataLoaded();
        }
    }

    onDataLoaded() {
        // Combine all scenarios from different sources
        const allSources = [...(window.cheatSheets || []), ...this.localCheatSheets];

        // Deduplicate scenarios by ID
        const uniqueScenarios = [];
        const seenIds = new Set();

        allSources.forEach(sheet => {
            if (!seenIds.has(sheet.id)) {
                seenIds.add(sheet.id);

                // Normalize category to lowercase for consistency and handle edge cases
                if (sheet.category) {
                    const originalCategory = sheet.category;
                    sheet.category = sheet.category.toLowerCase().trim();

                    // Handle specific category mappings
                    const categoryMappings = {
                        'auth': 'authentication',
                        'sync': 'synchronization',
                        'password-protection': 'authentication', // Group password-protection with authentication
                        'conditional-access': 'authentication',   // Group conditional-access with authentication
                        'provisioning': 'provisioning',
                        'performance': 'performance',
                        'applications': 'applications',
                        'general': 'general'
                    };

                    if (categoryMappings[sheet.category]) {
                        sheet.category = categoryMappings[sheet.category];
                    }

                    if (originalCategory !== sheet.category) {
                        console.log(`📝 Category normalized: "${originalCategory}" → "${sheet.category}" for "${sheet.title}"`);
                    }
                }

                uniqueScenarios.push(sheet);
            } else {
                console.log(`🔄 Duplicate scenario removed: ${sheet.title} (ID: ${sheet.id})`);
            }
        });

        this.allCheatSheets = uniqueScenarios;

        // Debug: Check what scenarios we have
        console.log('📊 Total scenarios loaded:', this.allCheatSheets.length);
        console.log(`📊 Deduplicated from ${allSources.length} total sources`);
        console.log('🔍 Categories after normalization:', [...new Set(this.allCheatSheets.map(s => s.category))].sort());
        console.log('🏷️ Scenarios by category:');
        const categoryCount = {};
        const syncScenarios = [];

        this.allCheatSheets.forEach(sheet => {
            categoryCount[sheet.category] = (categoryCount[sheet.category] || 0) + 1;
            if (sheet.category === 'general') {
                console.log('🎯 General scenario found:', sheet.title);
            }
            if (sheet.category === 'synchronization') {
                syncScenarios.push(sheet.title);
            }
        });

        console.log('📈 Category counts:', categoryCount);
        console.log('🔄 Synchronization scenarios found:', syncScenarios.length, syncScenarios.slice(0, 5)); // Show first 5

        // Populate category dropdown dynamically
        this.populateCategoryDropdown();

        // Populate new enhanced navigation
        this.populateCategoryNavigation();
        this.populateTagCloud();
        this.populateStatistics();

        // Populate quick access links dynamically
        this.populateQuickAccess();

        // Update total count in header
        this.updateTotalCount();

        // Update category changes indicator
        this.updateCategoryChangesIndicator();

        this.populateRecentQueries();
        console.log(`📊 DiagnostIQ initialized with ${this.allCheatSheets.length} scenarios`);
    }

    setupEventListeners() {
        // Search input event
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

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
                    pattern: /(["'])(?:(?!\1)[^\\\r\n]|\\.)*\1/,
                    greedy: true
                },
                'number': /\b\d+(?:\.\d+)?\b/,
                'comment': /\/\/.*$/m,
                'punctuation': /[(){}[\];,.|]/
            };
        }
    }

    performSearch() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        const clusterFilter = document.getElementById('clusterFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;

        if (!searchTerm && !clusterFilter && !categoryFilter) {
            this.showWelcomeMessage();
            return;
        }

        // Debug logging
        console.log('🔍 Search criteria:', { searchTerm, clusterFilter, categoryFilter });
        console.log('📊 Total scenarios available:', this.allCheatSheets.length);

        // Filter cheat sheets based on search criteria
        let filteredResults = this.allCheatSheets.filter(sheet => {
            const matchesSearch = !searchTerm ||
                sheet.title.toLowerCase().includes(searchTerm) ||
                sheet.description.toLowerCase().includes(searchTerm) ||
                (sheet.tags && sheet.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
                (sheet.query && sheet.query.toLowerCase().includes(searchTerm)) ||
                (sheet.queries && sheet.queries.some(q =>
                    (q.query && q.query.toLowerCase().includes(searchTerm)) ||
                    (q.kql && q.kql.toLowerCase().includes(searchTerm)) ||
                    (q.name && q.name.toLowerCase().includes(searchTerm)) ||
                    (q.title && q.title.toLowerCase().includes(searchTerm)) ||
                    (q.description && q.description.toLowerCase().includes(searchTerm))
                ));

            const matchesCluster = !clusterFilter || sheet.cluster === clusterFilter;

            // Category matching with normalization support
            const normalizeCategoryForFilter = (category) => {
                if (!category) return 'general';

                // Convert to lowercase-with-hyphens format for consistent filtering
                const normalized = category.toLowerCase().trim()
                    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
                    .replace(/\s+/g, '-') // Replace spaces with hyphens
                    .replace(/-+/g, '-') // Collapse multiple hyphens
                    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

                const categoryMappings = {
                    'auth': 'authentication',
                    'sync': 'synchronization',
                    'password-protection': 'authentication',
                    'conditional-access': 'authentication',
                    'provisioning': 'provisioning',
                    'performance': 'performance',
                    'applications': 'applications',
                    'general': 'general'
                };

                return categoryMappings[normalized] || normalized;
            };

            const normalizedSheetCategory = normalizeCategoryForFilter(sheet.category);
            const normalizedFilterCategory = normalizeCategoryForFilter(categoryFilter);
            const matchesCategory = !categoryFilter || normalizedSheetCategory === normalizedFilterCategory;

            // Debug logging for synchronization category filter
            if (categoryFilter === 'synchronization') {
                console.log('🔄 Synchronization category filter - checking sheet:', {
                    title: sheet.title,
                    category: sheet.category,
                    matches: matchesCategory
                });
            }

            return matchesSearch && matchesCluster && matchesCategory;
        });

        // Remove duplicates based on ID (in case there are any)
        const uniqueResults = [];
        const seenIds = new Set();

        filteredResults.forEach(sheet => {
            if (!seenIds.has(sheet.id)) {
                seenIds.add(sheet.id);
                uniqueResults.push(sheet);
            } else {
                console.warn('🔄 Duplicate scenario found and removed:', sheet.title, sheet.id);
            }
        });

        console.log(`✅ Filtered results: ${uniqueResults.length} scenarios (${filteredResults.length - uniqueResults.length} duplicates removed)`);

        // Add to recent queries if it's a search term
        if (searchTerm) {
            this.addToRecentQueries(searchTerm);
        }

        this.displayResults(uniqueResults);
    }

    displayResults(results, customMessage = null) {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const searchResults = document.getElementById('searchResults');

        welcomeMessage.style.display = 'none';
        searchResults.style.display = 'block';

        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No results found</h3>
                    <p>Try adjusting your search terms or filters.</p>
                </div>
            `;
            return;
        }

        // Add summary header
        const summaryHTML = `
            <div class="results-summary">
                <h3><i class="fas fa-search"></i> ${customMessage || 'Search Results'}</h3>
                <p>Found <strong>${results.length}</strong> troubleshooting scenario${results.length > 1 ? 's' : ''}</p>
            </div>
        `;

        const resultsHTML = results.map(sheet => this.createCheatSheetPreview(sheet)).join('');
        searchResults.innerHTML = summaryHTML + resultsHTML;

        this.currentResults = results;
    }

    createCheatSheetCard(sheet) {
        // Handle both formats: steps/troubleshootingSteps
        const steps = sheet.steps || sheet.troubleshootingSteps || [];

        // Handle both string array and object array formats for steps
        const stepsHtml = steps.map((step, index) => {
            if (typeof step === 'string') {
                // Simple string format
                return `<li>${step}</li>`;
            } else if (typeof step === 'object') {
                // Handle different object formats
                if (step.action) {
                    // Old detailed object format
                    return `<li><strong>${step.description || `Step ${step.step || index + 1}`}:</strong> ${step.action}${step.expected ? ` <em>(Expected: ${step.expected})</em>` : ''}</li>`;
                } else if (step.step && step.description) {
                    // ADFS troubleshooting steps format
                    return `<li><strong>${step.step}:</strong> ${step.description}</li>`;
                } else if (step.description) {
                    // Generic description format
                    return `<li>${step.description}</li>`;
                }
            }
            // Fallback for unknown format
            return `<li>${JSON.stringify(step)}</li>`;
        }).join('');

        // Handle both old format (single query) and new format (multiple queries)
        let queriesHtml = '';
        const queries = sheet.queries || sheet.kqlQueries || [];

        if (queries && Array.isArray(queries)) {
            // New format with multiple queries
            queriesHtml = queries.map((queryObj, index) => {
                const queryId = `query_${sheet.id}_${index}`;
                return `
                <div class="query-item">
                    <div class="query-item-header">
                        <h4>${queryObj.name || queryObj.title}</h4>
                        <p class="query-description">${queryObj.description}</p>
                    </div>
                    <div class="query-container">
                        <button class="copy-btn" onclick="app.copyQueryById('${queryId}', this)">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                        <textarea id="${queryId}" style="display: none;">${queryObj.query || queryObj.kql}</textarea>
                        <pre class="query-code"><code class="language-kql">${this.escapeHtml(queryObj.query || queryObj.kql)}</code></pre>
                    </div>
                </div>
                `;
            }).join('');
        } else if (sheet.relatedKQL && Array.isArray(sheet.relatedKQL)) {
            // Handle relatedKQL format from extracted scenarios
            queriesHtml = sheet.relatedKQL.map((query, index) => {
                const queryId = `query_${sheet.id}_kql_${index}`;
                return `
                <div class="query-item">
                    <div class="query-container">
                        <button class="copy-btn" onclick="app.copyQueryById('${queryId}', this)">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                        <textarea id="${queryId}" style="display: none;">${query}</textarea>
                        <pre class="query-code"><code class="language-kql">${this.escapeHtml(query)}</code></pre>
                    </div>
                </div>
                `;
            }).join('');
        } else if (sheet.query) {
            // Old format with single query - maintain backwards compatibility
            const queryId = `query_${sheet.id}_single`;
            queriesHtml = `
                <div class="query-item">
                    <div class="query-container">
                        <button class="copy-btn" onclick="app.copyQueryById('${queryId}', this)">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                        <textarea id="${queryId}" style="display: none;">${sheet.query}</textarea>
                        <pre class="query-code"><code class="language-kql">${this.escapeHtml(sheet.query)}</code></pre>
                    </div>
                </div>
            `;
        }        return `
            <div class="cheat-sheet-card" data-sheet-id="${sheet.id}">
                <div class="card-header">
                    <div class="card-title" onclick="collapseCheatSheet('${sheet.id}')" title="Click to minimize to preview">${sheet.title}</div>
                    <div class="card-actions">
                        <button class="btn-minimize" onclick="collapseCheatSheet('${sheet.id}')" title="Minimize to preview">
                            <i class="fas fa-compress"></i>
                        </button>
                        <button class="btn-edit" onclick="editCheatSheet('${sheet.id}')" title="Edit this cheat sheet">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="deleteCheatSheet('${sheet.id}')" title="Delete this cheat sheet">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-meta">
                    ${sheet.vertical ? `<span><i class="fas fa-layer-group"></i> ${sheet.vertical}</span>` : ''}
                    <span><i class="fas fa-tag"></i> ${this.getCategoryName(sheet.category)}</span>
                    <span><i class="fas fa-server"></i> ${sheet.cluster || 'N/A'}</span>
                    ${sheet.database ? `<span><i class="fas fa-database"></i> ${sheet.database}</span>` : ''}
                    <span><i class="fas fa-code"></i> ${this.getQueryCount(sheet)} ${this.getQueryCount(sheet) !== 1 ? 'queries' : 'query'}</span>
                    ${this.isWikiSource(sheet) ? `<span class="wiki-indicator"><i class="fas fa-book"></i> <a href="#" onclick="app.openWikiLink('${this.getSourcePath(sheet)}')" title="View source wiki page">Wiki Source</a></span>` : ''}
                </div>
                ${sheet.tags && sheet.tags.length > 0 ? `
                <div class="card-tags">
                    <i class="fas fa-tags"></i>
                    ${sheet.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>` : ''}
                <div class="card-content">
                    <div class="card-description">${sheet.description}</div>

                    <div class="query-section">
                        <div class="section-title">
                            <i class="fas fa-code"></i> KQL ${queries && queries.length > 1 ? 'Queries' : 'Query'}
                        </div>
                        ${queriesHtml}
                    </div>

                    <div class="steps-section">
                        <div class="section-title">
                            <i class="fas fa-list-ol"></i> Troubleshooting Steps
                        </div>
                        <div class="steps-list">
                            <ol>${stepsHtml}</ol>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createCheatSheetPreview(sheet) {
        // Create a preview card with excerpt and expand option
        // Handle both query formats
        const queries = sheet.queries || sheet.kqlQueries || [];
        const firstQuery = queries && queries.length > 0
            ? queries[0]
            : (sheet.query ? { name: 'Main Query', query: sheet.query } : null);

        const descriptionExcerpt = sheet.description.length > 150
            ? sheet.description.substring(0, 150) + '...'
            : sheet.description;

        const queryPreview = firstQuery
            ? `<div class="query-preview">
                <strong>${firstQuery.name || 'Query'}:</strong>
                <code>${(firstQuery.query || firstQuery.kql || '').substring(0, 100)}${(firstQuery.query || firstQuery.kql || '').length > 100 ? '...' : ''}</code>
               </div>`
            : '';

        return `
            <div class="cheat-sheet-preview" data-sheet-id="${sheet.id}">
                <div class="preview-header">
                    <div class="preview-title" onclick="expandCheatSheet('${sheet.id}')" title="Click to expand">${sheet.title}</div>
                    <div class="preview-actions">
                        <button class="btn-expand" onclick="expandCheatSheet('${sheet.id}')" title="View full details">
                            <i class="fas fa-expand"></i> Open
                        </button>
                        <button class="btn-edit" onclick="editCheatSheet('${sheet.id}')" title="Edit this cheat sheet">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="deleteCheatSheet('${sheet.id}')" title="Delete this cheat sheet">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="preview-meta">
                    ${sheet.vertical ? `<span><i class="fas fa-layer-group"></i> ${sheet.vertical}</span>` : ''}
                    <span><i class="fas fa-tag"></i> ${this.getCategoryName(sheet.category)}</span>
                    <span><i class="fas fa-server"></i> ${sheet.cluster || 'N/A'}</span>
                    ${sheet.database ? `<span><i class="fas fa-database"></i> ${sheet.database}</span>` : ''}
                    <span><i class="fas fa-code"></i> ${this.getQueryCount(sheet)} ${this.getQueryCount(sheet) !== 1 ? 'queries' : 'query'}</span>
                    <span><i class="fas fa-list-ol"></i> ${sheet.steps ? sheet.steps.length : 0} steps</span>
                    ${this.isWikiSource(sheet) ? `<span class="wiki-indicator"><i class="fas fa-book"></i> Wiki</span>` : ''}
                </div>
                ${sheet.tags && sheet.tags.length > 0 ? `
                <div class="preview-tags">
                    <i class="fas fa-tags"></i>
                    ${sheet.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    ${sheet.tags.length > 3 ? `<span class="tag-more">+${sheet.tags.length - 3} more</span>` : ''}
                </div>` : ''}
                <div class="preview-content">
                    <div class="preview-description">${descriptionExcerpt}</div>
                    ${queryPreview}
                </div>
            </div>
        `;
    }

    expandCheatSheet(sheetId) {
        const sheet = this.allCheatSheets.find(s => s.id === sheetId);
        if (!sheet) {
            alert('Scenario not found!');
            return;
        }

        // Replace the preview with the full card
        const previewElement = document.querySelector(`[data-sheet-id="${sheetId}"]`);
        if (previewElement) {
            previewElement.outerHTML = this.createCheatSheetCard(sheet);

            // Apply syntax highlighting to the new content
            setTimeout(() => {
                if (typeof Prism !== 'undefined') {
                    Prism.highlightAll();
                }
            }, 100);
        }
    }

    collapseCheatSheet(sheetId) {
        const sheet = this.allCheatSheets.find(s => s.id === sheetId);
        if (!sheet) {
            alert('Scenario not found!');
            return;
        }

        // Replace the full card with the preview
        const cardElement = document.querySelector(`[data-sheet-id="${sheetId}"]`);
        if (cardElement) {
            cardElement.outerHTML = this.createCheatSheetPreview(sheet);
        }
    }

    getCategoryName(category) {
        const categoryNames = {
            'sync': 'Synchronization',
            'synchronization': 'Synchronization',
            'auth': 'Authentication',
            'authentication': 'Authentication',
            'provisioning': 'Provisioning',
            'performance': 'Performance',
            'applications': 'Applications',
            'general': 'General'
        };
        return categoryNames[category] || this.capitalizeFirst(category);
    }

    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    getQueryCount(sheet) {
        // Count queries from different possible sources
        if (sheet.queries && Array.isArray(sheet.queries)) {
            return sheet.queries.length;
        }
        if (sheet.kqlQueries && Array.isArray(sheet.kqlQueries)) {
            return sheet.kqlQueries.length;
        }
        if (sheet.relatedKQL && Array.isArray(sheet.relatedKQL)) {
            return sheet.relatedKQL.length;
        }
        if (sheet.query) {
            return 1;
        }
        return 0;
    }

    openWikiLink(source) {
        // Create a modern modal to display source information
        this.showSourceModal(source);
    }

    showSourceModal(source) {
        // Try to build a wiki URL from the source path
        const wikiData = this.buildWikiUrl(source);

        // Get the article title for search
        const searchTitle = this.getArticleTitle(source);

        // Create modal HTML
        const modalHtml = `
            <div id="sourceModal" class="modal" style="display: block;">
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <h2><i class="fas fa-book"></i> Wiki Source Information</h2>
                        <button class="close" onclick="app.closeSourceModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="source-info">
                            <div class="source-item">
                                <label><i class="fas fa-search"></i> Find Article in Wiki:</label>
                                <div class="source-value">
                                    <a href="https://supportability.visualstudio.com/AzureAD/_search?text=${encodeURIComponent(searchTitle)}&type=wiki&filters=Project%7BAzureAD%7D" target="_blank" class="wiki-link">
                                        <i class="fas fa-search"></i> Search Wiki for "${searchTitle}"
                                    </a>
                                    <button class="btn btn-outline btn-small copy-btn" onclick="app.copyToClipboard('${this.escapeHtml(searchTitle)}')" title="Copy article title">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="source-item">
                                <label><i class="fas fa-external-link-alt"></i> Direct Wiki Access:</label>
                                <div class="source-value">
                                    <a href="https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD" target="_blank" class="wiki-link">
                                        <i class="fas fa-globe"></i> Open Azure AD Wiki
                                    </a>
                                    <span class="wiki-search-note">Then search for: <strong>"${searchTitle}"</strong></span>
                                </div>
                            </div>
                            <div class="source-item">
                                <label><i class="fas fa-file-alt"></i> Source File:</label>
                                <div class="source-value">
                                    <code class="source-path">${this.escapeHtml(source)}</code>
                                    <button class="btn btn-outline btn-small copy-btn" onclick="app.copyToClipboard('${this.escapeHtml(source)}')" title="Copy source path">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="source-item">
                                <label><i class="fas fa-info-circle"></i> Information:</label>
                                <div class="source-description">
                                    This troubleshooting scenario was automatically extracted from the internal Azure AD wiki documentation.
                                    Use the search link above to find the original article, or browse the wiki directly and search for the article title.
                                    The exact article ID is not available in the extracted data.
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="app.closeSourceModal()">Close</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to document
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    closeSourceModal() {
        const modal = document.getElementById('sourceModal');
        if (modal) {
            modal.remove();
        }
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            // Show temporary feedback
            this.showCopyFeedback();
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showCopyFeedback();
        }
    }

    showCopyFeedback() {
        // Create temporary feedback element
        const feedback = document.createElement('div');
        feedback.className = 'copy-feedback';
        feedback.innerHTML = '<i class="fas fa-check"></i> Copied to clipboard!';
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        document.body.appendChild(feedback);

        // Remove after 2 seconds
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 2000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    copyQueryById(queryId, button) {
        const textarea = document.getElementById(queryId);
        if (!textarea) {
            console.error('Query element not found:', queryId);
            return;
        }
        const text = textarea.value;
        this.copyToClipboard(text, button);
    }

    copyToClipboard(text, button) {
        // Enhanced fallback method that works with local files
        const fallbackCopy = () => {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                return successful;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        };

        const showSuccess = () => {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.style.background = 'rgba(40, 167, 69, 0.8)';

            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = 'rgba(255,255,255,0.1)';
            }, 2000);
        };

        const showError = () => {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-exclamation"></i> Copy Failed';
            button.style.background = 'rgba(220, 53, 69, 0.8)';

            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = 'rgba(255,255,255,0.1)';
            }, 2000);
        };

        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                showSuccess();
            }).catch(() => {
                // Fallback to execCommand
                if (fallbackCopy()) {
                    showSuccess();
                } else {
                    showError();
                }
            });
        } else {
            // Use fallback method for local files
            if (fallbackCopy()) {
                showSuccess();
            } else {
                showError();
            }
        }
    }

    searchFor(term) {
        document.getElementById('searchInput').value = term;
        this.performSearch();
    }

    clearSearch() {
        document.getElementById('searchInput').value = '';
        document.getElementById('clusterFilter').value = '';
        document.getElementById('categoryFilter').value = '';
        this.showWelcomeMessage();
    }

    showWelcomeMessage() {
        document.getElementById('welcomeMessage').style.display = 'block';
        document.getElementById('searchResults').style.display = 'none';
    }

    addToRecentQueries(query) {
        // Remove if already exists
        this.recentQueries = this.recentQueries.filter(item => item.query !== query);

        // Add to beginning
        this.recentQueries.unshift({
            query: query,
            timestamp: new Date().toLocaleString()
        });

        // Keep only last 10
        this.recentQueries = this.recentQueries.slice(0, 10);

        // Save to localStorage
        localStorage.setItem('recentQueries', JSON.stringify(this.recentQueries));

        this.populateRecentQueries();
    }

    populateRecentQueries() {
        const recentQueriesContainer = document.getElementById('recentQueries');

        // Handle case where recent queries element doesn't exist (removed from sidebar)
        if (!recentQueriesContainer) {
            console.log('ℹ️ Recent queries container not found - feature disabled');
            return;
        }

        if (this.recentQueries.length === 0) {
            recentQueriesContainer.innerHTML = '<li><em>No recent queries</em></li>';
            return;
        }

        const recentHTML = this.recentQueries.map(item =>
            `<li><a href="#" onclick="app.searchFor('${item.query}')">${item.query}</a></li>`
        ).join('');

        recentQueriesContainer.innerHTML = recentHTML;
    }

    populateCategoryDropdown() {
        // Populate search filter dropdown
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            // Get available categories from data manager
            const categories = this.dataManager.getAvailableCategories();

            console.log('🏷️ Available categories:', categories);

            // Clear existing options except "All Categories"
            categoryFilter.innerHTML = '<option value="">All Categories</option>';

            // Add dynamic categories
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.value;
                option.textContent = `${category.label}${category.count ? ` (${category.count})` : ''}`;

                // Add description as title attribute for tooltip
                if (category.description) {
                    option.title = category.description;
                }

                categoryFilter.appendChild(option);
            });
        }

        // Populate modal form dropdown
        const categoryModal = document.getElementById('category');
        if (categoryModal) {
            // Get available categories from data manager
            const categories = this.dataManager.getAvailableCategories();

            // Clear existing options
            categoryModal.innerHTML = '';

            // Add dynamic categories
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.value;
                option.textContent = category.label;
                categoryModal.appendChild(option);
            });

            // If no categories are available, add default ones
            if (categories.length === 0) {
                const defaultCategories = [
                    { value: 'synchronization', label: 'Synchronization' },
                    { value: 'authentication', label: 'Authentication' },
                    { value: 'provisioning', label: 'Provisioning' },
                    { value: 'performance', label: 'Performance' },
                    { value: 'applications', label: 'Applications' },
                    { value: 'general', label: 'General' }
                ];

                defaultCategories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.value;
                    option.textContent = category.label;
                    categoryModal.appendChild(option);
                });
            }
        }
    }

    showAddCheatSheet() {
        // Reset editing mode
        this.editingSheetId = null;

        // Clear form first
        this.clearForm();
        // Reset to single query mode
        this.currentQueries = [{ name: '', description: '', query: '' }];

        this.renderQueryInputs();

        // Update modal title and button text
        document.querySelector('#addCheatSheetModal .modal-header h2').textContent = 'Add New Cheat Sheet';
        document.querySelector('#addCheatSheetModal .modal-footer .btn-primary').textContent = 'Save Cheat Sheet';

        document.getElementById('addCheatSheetModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('addCheatSheetModal').style.display = 'none';
        this.clearForm();
    }

    clearForm() {
        document.getElementById('cheatSheetForm').reset();
        this.currentQueries = [{ name: '', description: '', query: '' }];
    }

    renderQueryInputs() {
        const queryContainer = document.getElementById('queryInputs');
        if (!queryContainer) return;

        const queriesHtml = this.currentQueries.map((query, index) => `
            <div class="query-input-group" data-index="${index}">
                <div class="query-input-header">
                    <h4>Query ${index + 1}</h4>
                    ${this.currentQueries.length > 1 ? `<button type="button" class="btn-remove-query" onclick="app.removeQuery(${index})"><i class="fas fa-trash"></i></button>` : ''}
                </div>
                <div class="form-group">
                    <label>Query Name:</label>
                    <input type="text" value="${query.name}" onchange="app.updateQuery(${index}, 'name', this.value)" placeholder="e.g., Check Sync Status">
                </div>
                <div class="form-group">
                    <label>Query Description:</label>
                    <input type="text" value="${query.description}" onchange="app.updateQuery(${index}, 'description', this.value)" placeholder="Brief description of what this query does">
                </div>
                <div class="form-group">
                    <label>KQL Query:</label>
                    <textarea rows="6" onchange="app.updateQuery(${index}, 'query', this.value)" placeholder="Enter your KQL query here...">${query.query}</textarea>
                </div>
            </div>
        `).join('');

        const finalHtml = queriesHtml + `
            <button type="button" class="btn btn-secondary" onclick="app.addQuery()" style="display: block; width: 100%; margin-top: 15px; padding: 10px; background: #6c757d; color: white; border: none; border-radius: 4px;">
                <i class="fas fa-plus"></i> Add Another Query
            </button>
        `;

        queryContainer.innerHTML = finalHtml;
    }

    addQuery() {
        this.currentQueries.push({ name: '', description: '', query: '' });
        this.renderQueryInputs();
    }

    removeQuery(index) {
        if (this.currentQueries.length > 1) {
            this.currentQueries.splice(index, 1);
            this.renderQueryInputs();
        }
    }

    updateQuery(index, field, value) {
        if (this.currentQueries[index]) {
            this.currentQueries[index][field] = value;
        }
    }    saveCheatSheet() {
        const title = document.getElementById('title').value;
        const category = document.getElementById('category').value;
        const cluster = document.getElementById('cluster').value || 'custom';
        const database = document.getElementById('database').value || '';
        const description = document.getElementById('description').value;
        const steps = document.getElementById('steps').value.split('\n').filter(step => step.trim());

        // Validate required fields
        if (!title) {
            alert('Title is required.');
            return;
        }

        // KQL queries are optional - scenarios can exist without queries
        // Filter out empty queries if any exist
        const validQueries = this.currentQueries ? this.currentQueries.filter(q => q.query && q.query.trim()) : [];

        // Get the original scenario to preserve all fields
        const originalSheet = this.editingSheetId ? this.allCheatSheets.find(s => s.id === this.editingSheetId) : null;

        // Create updated data by preserving original fields and only updating edited ones
        const cheatSheetData = originalSheet ? {
            ...originalSheet, // Preserve all original fields
            // Update only the fields that can be edited
            title: title,
            category: category,
            description: description,
            // Update KQL queries if provided, otherwise keep original
            kqlQueries: validQueries.length > 0 ? validQueries.map(q => ({
                description: q.description || q.name || 'User-defined troubleshooting query',
                query: q.query
            })) : originalSheet.kqlQueries || [],
            // Update troubleshooting steps if provided
            troubleshootingSteps: steps.length > 0 ? steps.map(step => ({
                step: step.split(':')[0]?.trim() || 'Step',
                description: step.trim()
            })) : originalSheet.troubleshootingSteps || [],
            // Mark as manually edited to prevent category normalization
            tags: [...(originalSheet.tags || []).filter(tag => tag !== 'updated'), 'updated'],
            // Update timestamp
            lastUpdated: new Date().toISOString(),
            // Preserve cluster/database info for custom scenarios
            ...(cluster && { cluster: cluster }),
            ...(database && { database: database })
        } : {
            // New scenario case
            title: title,
            category: category,
            cluster: cluster,
            database: database,
            description: description,
            kqlQueries: validQueries.map(q => ({
                description: q.description || q.name || 'User-defined troubleshooting query',
                query: q.query
            })),
            troubleshootingSteps: steps.map(step => ({
                step: step.split(':')[0] || 'Step',
                description: step
            })),
            tags: ['custom', 'user-created'],
            vertical: 'general',
            applicableServices: ['Custom'],
            severity: 'medium',
            timeToResolve: 'Variable',
            lastUpdated: new Date().toISOString()
        };

        if (this.editingSheetId) {
            const originalSheet = this.allCheatSheets.find(s => s.id === this.editingSheetId);
            const isCustomSheet = originalSheet && originalSheet.tags && originalSheet.tags.includes('custom');

            const categoryChanged = originalSheet?.category !== cheatSheetData.category;

            console.log('🔄 Updating scenario:', {
                id: this.editingSheetId,
                originalCategory: originalSheet?.category,
                newCategory: cheatSheetData.category,
                isCustomSheet: isCustomSheet,
                categoryChanged: categoryChanged
            });

            // Always update the existing scenario in place
            if (this.dataManager.updateScenario(this.editingSheetId, cheatSheetData)) {
                // If it's a custom sheet, also update local storage
                if (isCustomSheet) {
                    const index = this.localCheatSheets.findIndex(s => s.id === this.editingSheetId);
                    if (index !== -1) {
                        this.localCheatSheets[index] = { ...cheatSheetData, id: this.editingSheetId };
                        localStorage.setItem('localCheatSheets', JSON.stringify(this.localCheatSheets));
                        console.log('💾 Updated local storage for custom scenario');
                    }
                } else if (categoryChanged) {
                    // Track category changes for extracted scenarios
                    this.trackCategoryChange(this.editingSheetId, originalSheet.category, cheatSheetData.category, originalSheet.title);
                }

                this.refreshData();

                // Verify the update worked
                const updatedSheet = this.allCheatSheets.find(s => s.id === this.editingSheetId);
                console.log('✅ Verification - Updated category:', updatedSheet?.category);

                // Show appropriate success message
                if (categoryChanged && !isCustomSheet) {
                    this.showCategoryChangeNotification(originalSheet.category, cheatSheetData.category);
                } else {
                    alert('Cheat sheet updated successfully!');
                }
            } else {
                console.error('❌ Failed to update scenario in data manager');
                alert('Error: Could not find cheat sheet to update.');
                return;
            }
        } else {
            // Add new cheat sheet using data manager
            const newCheatSheet = this.dataManager.addCustomScenario(cheatSheetData);

            // Also save to local storage for persistence
            this.localCheatSheets.push(newCheatSheet);
            localStorage.setItem('localCheatSheets', JSON.stringify(this.localCheatSheets));

            this.refreshData();
            alert('Cheat sheet saved successfully!');
        }

        this.closeModal();

        // If currently searching, refresh results
        if (document.getElementById('searchResults').style.display === 'block') {
            this.performSearch();
        }
    }

    trackCategoryChange(scenarioId, oldCategory, newCategory, title) {
        // Get existing category changes from localStorage
        const categoryChanges = JSON.parse(localStorage.getItem('categoryChanges')) || [];

        // Check if this scenario already has a tracked change
        const existingIndex = categoryChanges.findIndex(change => change.scenarioId === scenarioId);

        if (existingIndex !== -1) {
            // Update existing change
            categoryChanges[existingIndex] = {
                scenarioId: scenarioId,
                title: title,
                oldCategory: categoryChanges[existingIndex].oldCategory, // Keep original old category
                newCategory: newCategory,
                timestamp: new Date().toISOString()
            };
        } else {
            // Add new change
            categoryChanges.push({
                scenarioId: scenarioId,
                title: title,
                oldCategory: oldCategory,
                newCategory: newCategory,
                timestamp: new Date().toISOString()
            });
        }

        localStorage.setItem('categoryChanges', JSON.stringify(categoryChanges));
        console.log('📝 Tracked category change:', { scenarioId, oldCategory, newCategory, title });
    }

    showCategoryChangeNotification(oldCategory, newCategory) {
        const message = `✅ Scenario updated successfully!\n\n` +
                       `⚠️ Category changed from "${oldCategory}" to "${newCategory}"\n\n` +
                       `💡 Note: This change is only in memory. To move the file to the correct folder, you'll need to:\n` +
                       `1. Stop the web server (Ctrl+C)\n` +
                       `2. Run: node sync-category-changes.js --dry-run\n` +
                       `3. Run: node sync-category-changes.js --apply\n` +
                       `4. Restart the web server\n\n` +
                       `Check the browser console for a list of all pending category changes.`;

        alert(message);

        // Also log to console for easy access
        this.logPendingCategoryChanges();
    }

    showCategoryChangesSummary() {
        const categoryChanges = JSON.parse(localStorage.getItem('categoryChanges')) || [];

        if (categoryChanges.length === 0) {
            alert('✅ No pending category changes!\n\nAll scenarios are in their correct categories.');
            return;
        }

        let message = `📋 PENDING CATEGORY CHANGES (${categoryChanges.length})\n\n`;

        categoryChanges.forEach((change, index) => {
            message += `${index + 1}. "${change.title}"\n`;
            message += `   📁 ${change.oldCategory} → ${change.newCategory}\n`;
            message += `   🕐 ${new Date(change.timestamp).toLocaleString()}\n\n`;
        });

        message += '🔧 TO SYNC THESE CHANGES:\n';
        message += '1. Stop the web server (Ctrl+C in terminal)\n';
        message += '2. Run: node sync-category-changes.js --dry-run\n';
        message += '3. Run: node sync-category-changes.js --apply\n';
        message += '4. Restart the web server\n\n';
        message += '💡 Check browser console for command details.';

        alert(message);
        this.logPendingCategoryChanges();
    }

    updateCategoryChangesIndicator() {
        const categoryChanges = JSON.parse(localStorage.getItem('categoryChanges')) || [];
        const countElement = document.getElementById('categoryChangesCount');
        const buttonElement = document.getElementById('checkCategoryChanges');

        if (categoryChanges.length > 0) {
            countElement.textContent = `${categoryChanges.length} pending`;
            countElement.className = 'changes-count warning';
            buttonElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Check Changes';
            buttonElement.className = 'btn-warning';
        } else {
            countElement.textContent = '';
            countElement.className = 'changes-count hidden';
            buttonElement.innerHTML = '<i class="fas fa-folder-open"></i> Check Changes';
            buttonElement.className = 'btn-secondary';
        }
    }

    refreshData() {
        // Refresh the local reference to all scenarios
        const allSources = [...(window.cheatSheets || []), ...this.localCheatSheets];

        // Apply category normalization (same as loadData) - but preserve manually edited categories
        const uniqueScenarios = [];
        const seenIds = new Set();

        allSources.forEach(sheet => {
            if (!seenIds.has(sheet.id)) {
                seenIds.add(sheet.id);

                // Only normalize categories for scenarios that haven't been manually edited
                // Check if this scenario has been updated by looking for custom tags or checking if it's in localCheatSheets
                const isManuallyEdited = (sheet.tags && sheet.tags.includes('updated')) ||
                                       this.localCheatSheets.some(local => local.id === sheet.id);

                if (sheet.category && !isManuallyEdited) {
                    const originalCategory = sheet.category;
                    sheet.category = sheet.category.toLowerCase().trim();

                    // Handle specific category mappings
                    const categoryMappings = {
                        'auth': 'authentication',
                        'sync': 'synchronization',
                        'password-protection': 'authentication', // Group password-protection with authentication
                        'conditional-access': 'authentication',   // Group conditional-access with authentication
                        'provisioning': 'provisioning',
                        'performance': 'performance',
                        'applications': 'applications',
                        'general': 'general'
                    };

                    if (categoryMappings[sheet.category]) {
                        sheet.category = categoryMappings[sheet.category];
                    }

                    if (originalCategory !== sheet.category) {
                        console.log(`📝 Category normalized in refresh: "${originalCategory}" → "${sheet.category}" for "${sheet.title}"`);
                    }
                } else if (isManuallyEdited) {
                    console.log(`🔒 Preserving manually edited category: "${sheet.category}" for "${sheet.title}"`);
                }

                uniqueScenarios.push(sheet);
            }
        });

        this.allCheatSheets = uniqueScenarios;
        console.log(`🔄 Data refreshed: ${this.allCheatSheets.length} scenarios`);

        // Update dynamic elements
        this.populateQuickAccess();
        this.updateTotalCount();
        this.populateCategoryDropdown();
        this.populateCategoryNavigation();
        this.populateTagCloud();
    }

    editCheatSheet(sheetId) {
        const sheet = this.allCheatSheets.find(s => s.id === sheetId);
        if (!sheet) {
            alert('Cheat sheet not found!');
            return;
        }

        console.log('🛠️ Editing sheet:', {
            id: sheet.id,
            title: sheet.title,
            category: sheet.category,
            cluster: sheet.cluster,
            database: sheet.database,
            queries: sheet.queries ? sheet.queries.length : 'N/A'
        });

        // Set editing mode
        this.editingSheetId = sheetId;

        // Populate form with existing data
        document.getElementById('title').value = sheet.title;
        document.getElementById('category').value = sheet.category;
        document.getElementById('cluster').value = sheet.cluster || '';
        document.getElementById('database').value = sheet.database || '';
        document.getElementById('description').value = sheet.description;

        // Handle troubleshooting steps - convert from troubleshootingSteps or steps array
        let stepsText = '';
        if (sheet.troubleshootingSteps && Array.isArray(sheet.troubleshootingSteps)) {
            stepsText = sheet.troubleshootingSteps.map(step =>
                typeof step === 'object' ? step.description || step.step : step
            ).join('\n');
        } else if (sheet.steps && Array.isArray(sheet.steps)) {
            stepsText = sheet.steps.join('\n');
        }
        document.getElementById('steps').value = stepsText;

        // Setup queries for editing - handle both kqlQueries and queries formats
        if (sheet.kqlQueries && Array.isArray(sheet.kqlQueries)) {
            this.currentQueries = sheet.kqlQueries.map(q => ({
                name: q.description || 'Query',
                description: q.description || '',
                query: q.query || ''
            }));
            console.log('📝 Loaded queries from sheet.kqlQueries:', this.currentQueries.length);
        } else if (sheet.queries && Array.isArray(sheet.queries)) {
            this.currentQueries = [...sheet.queries];
            console.log('📝 Loaded queries from sheet.queries:', this.currentQueries.length);
        } else if (sheet.query) {
            // Convert old format to new format
            this.currentQueries = [{
                name: 'Main Query',
                description: 'Primary troubleshooting query',
                query: sheet.query
            }];
            console.log('📝 Converted single query to array format');
        } else {
            this.currentQueries = [{ name: '', description: '', query: '' }];
            console.log('⚠️ No queries found, using empty template');
        }

        console.log('📋 Current queries for editing:', this.currentQueries);

        this.renderQueryInputs();

        // Update modal title and button text
        document.querySelector('#addCheatSheetModal .modal-header h2').textContent = 'Edit Cheat Sheet';
        document.querySelector('#addCheatSheetModal .modal-footer .btn-primary').textContent = 'Update Cheat Sheet';

        document.getElementById('addCheatSheetModal').style.display = 'block';
    }

    deleteCheatSheet(sheetId) {
        const sheet = this.allCheatSheets.find(s => s.id === sheetId);
        if (!sheet) {
            alert('Cheat sheet not found!');
            return;
        }

        // Check if it's a custom sheet or extracted sheet
        const isCustomSheet = sheet.tags && sheet.tags.includes('custom');

        const confirmMessage = isCustomSheet
            ? 'Are you sure you want to delete this custom cheat sheet? This action cannot be undone.'
            : 'Are you sure you want to delete this scenario? It will be hidden until you refresh the page or restore it from the settings.';

        if (!confirm(confirmMessage)) {
            return;
        }

        if (isCustomSheet) {
            // Remove custom sheet from localStorage and data manager
            this.localCheatSheets = this.localCheatSheets.filter(s => s.id !== sheetId);
            localStorage.setItem('localCheatSheets', JSON.stringify(this.localCheatSheets));
        }

        // Remove from data manager (works for both custom and extracted scenarios)
        if (this.dataManager.removeScenario(sheetId)) {
            this.refreshData();

            const successMessage = isCustomSheet
                ? 'Custom cheat sheet deleted successfully!'
                : 'Scenario hidden successfully! (Use browser tools console and call app.dataManager.restoreScenario("' + sheetId + '") to restore)';

            alert(successMessage);

            // Refresh results if currently searching
            if (document.getElementById('searchResults').style.display === 'block') {
                this.performSearch();
            }
        } else {
            alert('Error: Could not delete cheat sheet.');
        }
    }

    exportLibrary() {
        // Use data manager for export
        const exportData = this.dataManager.exportScenarios(true); // Export only custom scenarios

        // Add recent queries for completeness
        exportData.recentQueries = this.recentQueries;

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `diagnostiq-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert('Library exported successfully!');
    }

    importLibrary(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);

                // Support both old and new export formats
                let scenariosToImport = [];

                if (importData.scenarios) {
                    // New format from data manager
                    scenariosToImport = importData.scenarios;
                } else if (importData.customCheatSheets) {
                    // Old format - convert to new format
                    scenariosToImport = importData.customCheatSheets;
                }

                if (!Array.isArray(scenariosToImport) || scenariosToImport.length === 0) {
                    alert('No valid scenarios found in import file.');
                    return;
                }

                // Use data manager to import
                const importedCount = this.dataManager.importScenarios({ scenarios: scenariosToImport });

                // Also update local storage
                const newLocalSheets = scenariosToImport.map(sheet => ({
                    ...sheet,
                    id: sheet.id || `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    isCustom: true
                }));

                this.localCheatSheets.push(...newLocalSheets);
                localStorage.setItem('localCheatSheets', JSON.stringify(this.localCheatSheets));

                // Import recent queries if available
                if (importData.recentQueries && Array.isArray(importData.recentQueries)) {
                    // Merge recent queries, keeping existing ones at the top
                    const mergedQueries = [...this.recentQueries];
                    importData.recentQueries.forEach(q => {
                        if (!mergedQueries.some(existing => existing.query === q.query)) {
                            mergedQueries.push(q);
                        }
                    });
                    this.recentQueries = mergedQueries.slice(0, 10); // Keep only 10 most recent
                    localStorage.setItem('recentQueries', JSON.stringify(this.recentQueries));
                    this.populateRecentQueries();
                }

                this.refreshData();
                alert(`Successfully imported ${importedCount} scenarios!`);

            } catch (error) {
                console.error('Import error:', error);
                alert('Error reading import file. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }

    syncLibrary() {
        // Placeholder for library synchronization
        alert('DiagnostIQ sync feature will be implemented to pull from:\n- SharePoint libraries\n- GitHub repositories\n- Azure DevOps wikis\n\nThis will sync the latest troubleshooting queries from your team.');
    }

    populateQuickAccess() {
        const quickLinksContainer = document.querySelector('.quick-links');
        if (!quickLinksContainer) return;

        // Get category counts (deduplicated)
        const categoryStats = {};
        const seenIds = new Set();

        this.allCheatSheets.forEach(sheet => {
            if (!seenIds.has(sheet.id)) {
                seenIds.add(sheet.id);
                categoryStats[sheet.category] = (categoryStats[sheet.category] || 0) + 1;
            }
        });

        console.log('📊 Quick Access - Category counts (deduplicated):', categoryStats);

        // Create dynamic quick access based on most popular categories
        const sortedCategories = Object.entries(categoryStats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5); // Top 5 categories

        const quickAccessHTML = sortedCategories.map(([category, count]) => {
            const displayName = this.getCategoryName(category);
            return `<li><a href="#" onclick="app.searchForCategory('${category}')">${displayName} (${count})</a></li>`;
        }).join('');

        // Calculate total unique scenarios for "Show All"
        const totalUniqueScenarios = seenIds.size;
        const showAllHTML = `<li><a href="#" onclick="app.showAllScenarios()"><i class="fas fa-th-list"></i> All Scenarios (${totalUniqueScenarios})</a></li>`;

        quickLinksContainer.innerHTML = quickAccessHTML + showAllHTML;
    }

    searchForCategory(category) {
        document.getElementById('categoryFilter').value = category;
        document.getElementById('searchInput').value = '';
        this.performSearch();
    }

    showAllScenarios() {
        console.log('🎯 Showing all scenarios...');

        // Clear all filters (don't call other methods to avoid loops)
        document.getElementById('categoryFilter').value = '';
        document.getElementById('searchInput').value = '';

        // Hide welcome message and show search results
        document.getElementById('welcomeMessage').style.display = 'none';
        document.getElementById('searchResults').style.display = 'block';

        // Reset current results and display all scenarios (apply deduplication)
        const uniqueResults = [];
        const seenIds = new Set();

        this.allCheatSheets.forEach(sheet => {
            if (!seenIds.has(sheet.id)) {
                seenIds.add(sheet.id);
                uniqueResults.push(sheet);
            }
        });        // Sort scenarios from recent to oldest
        uniqueResults.sort((a, b) => {
            // Get the most recent date for each scenario
            const getScenarioDate = (scenario) => {
                // Priority: lastUpdated > source.extractedAt > id-based date heuristic for newer scenarios
                if (scenario.lastUpdated) {
                    return new Date(scenario.lastUpdated);
                }
                if (scenario.source && scenario.source.extractedAt) {
                    return new Date(scenario.source.extractedAt);
                }

                // For scenarios with modern-style IDs (like our newly extracted ones),
                // assume they're more recent than legacy scenarios
                if (scenario.id && scenario.id.includes('-') && scenario.id.length > 10) {
                    return new Date('2025-06-28'); // Recent but not today
                }

                // Fallback for older scenarios without date info
                return new Date('2020-01-01');
            };

            const dateA = getScenarioDate(a);
            const dateB = getScenarioDate(b);

            // Sort descending (most recent first)
            return dateB - dateA;
        });

        // Debug: Show first few scenarios with their dates
        console.log('📅 Top 10 scenarios after sorting:');
        uniqueResults.slice(0, 10).forEach((scenario, index) => {
            const date = scenario.lastUpdated || (scenario.source && scenario.source.extractedAt) || 'No date';
            console.log(`${index + 1}. ${scenario.title} - ${date} (vertical: ${scenario.vertical || 'none'}, category: ${scenario.category || 'none'})`);
        });

        console.log(`✅ Displaying ${uniqueResults.length} unique scenarios out of ${this.allCheatSheets.length} total (sorted by most recent)`);
        this.displayResults(uniqueResults, 'All Scenarios');
    }

    updateTotalCount() {
        // Add total count to the header (deduplicated)
        const headerContent = document.querySelector('.header-content h1');
        if (headerContent) {
            const existingCount = headerContent.querySelector('.scenario-count');
            if (existingCount) {
                existingCount.remove();
            }

            // Calculate unique scenario count
            const seenIds = new Set();
            this.allCheatSheets.forEach(sheet => seenIds.add(sheet.id));
            const uniqueCount = seenIds.size;

            const countSpan = document.createElement('span');
            countSpan.className = 'scenario-count';
            countSpan.innerHTML = ` <small>(${uniqueCount} scenarios)</small>`;
            headerContent.appendChild(countSpan);
        }
    }

    // Enhanced Navigation Methods

    populateCategoryNavigation() {
        const categoryNav = document.getElementById('categoryNavigation');
        if (!categoryNav) return;

        console.log('🏗️ Populating vertical-based category navigation...');

        // Get vertical and category counts (deduplicated and normalized)
        const verticalStats = {};
        const seenIds = new Set();

        this.allCheatSheets.forEach(sheet => {
            if (!seenIds.has(sheet.id)) {
                seenIds.add(sheet.id);
                const vertical = sheet.vertical || 'General';
                const category = sheet.category || 'general';

                if (!verticalStats[vertical]) {
                    verticalStats[vertical] = {
                        count: 0,
                        categories: {}
                    };
                }

                verticalStats[vertical].count++;
                verticalStats[vertical].categories[category] = (verticalStats[vertical].categories[category] || 0) + 1;
            }
        });

        console.log('📊 Vertical stats for navigation:', verticalStats);

        // Create navigation HTML with collapsible verticals
        const totalCount = seenIds.size;

        // Add "All Categories" option at the top
        let navigationHTML = `
            <div class="category-item all-categories" onclick="app.showAllScenarios()" data-category="">
                <div class="category-label">
                    <i class="fas fa-th-list"></i>
                    <span>All Scenarios</span>
                </div>
                <span class="category-count">${totalCount}</span>
            </div>
            <div class="nav-divider"></div>
        `;

        // Sort verticals by count (highest first)
        const sortedVerticals = Object.entries(verticalStats)
            .sort(([,a], [,b]) => b.count - a.count);

        sortedVerticals.forEach(([vertical, data]) => {
            const verticalId = `vertical-${vertical.toLowerCase().replace(/\s+/g, '-')}`;
            const verticalIcon = this.getVerticalIcon(vertical);

            // Vertical header (collapsible)
            navigationHTML += `
                <div class="vertical-section">
                    <div class="vertical-header" onclick="app.toggleVertical('${verticalId}')" data-vertical="${vertical}">
                        <i class="fas fa-chevron-right vertical-arrow" id="${verticalId}-arrow"></i>
                        <i class="${verticalIcon} vertical-icon"></i>
                        <span class="vertical-name">${vertical}</span>
                        <span class="vertical-count">${data.count}</span>
                    </div>
                    <div class="vertical-categories" id="${verticalId}" style="display: none;">
            `;

            // Sort categories within this vertical
            const sortedCategories = Object.entries(data.categories)
                .sort(([,a], [,b]) => b - a);

            sortedCategories.forEach(([category, count]) => {
                const displayName = this.getCategoryName(category);
                const categoryIcon = this.getCategoryIcon(category);

                navigationHTML += `
                    <div class="category-item subcategory" onclick="app.filterByCategory('${category}')" data-category="${category}">
                        <div class="category-label">
                            <i class="${categoryIcon}"></i>
                            <span>${displayName}</span>
                        </div>
                        <span class="category-count">${count}</span>
                    </div>
                `;
            });

            navigationHTML += `
                    </div>
                </div>
            `;
        });

        categoryNav.innerHTML = navigationHTML;
        console.log('✅ Vertical-based navigation populated with', sortedVerticals.length, 'verticals');
    }

    populateTagCloud() {
        const tagCloud = document.getElementById('tagCloud');
        if (!tagCloud) return;

        // Collect all tags and their frequencies
        const tagStats = {};
        const seenIds = new Set();

        this.allCheatSheets.forEach(sheet => {
            if (!seenIds.has(sheet.id) && sheet.tags) {
                seenIds.add(sheet.id);
                sheet.tags.forEach(tag => {
                    tagStats[tag] = (tagStats[tag] || 0) + 1;
                });
            }
        });

        // Sort tags by frequency and take top 20
        const sortedTags = Object.entries(tagStats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 20);

        if (sortedTags.length === 0) {
            tagCloud.innerHTML = '<p class="text-muted">No tags available</p>';
            return;
        }

        // Calculate tag sizes based on frequency
        const maxCount = Math.max(...sortedTags.map(([,count]) => count));
        const minCount = Math.min(...sortedTags.map(([,count]) => count));

        const tagHTML = sortedTags.map(([tag, count]) => {
            const sizeClass = this.getTagSizeClass(count, minCount, maxCount);
            return `
                <span class="cloud-tag ${sizeClass}" onclick="filterByTag('${tag}')"
                      title="${tag} (${count} scenarios)" data-tag="${tag}">
                    ${tag}
                </span>
            `;
        }).join('');

        tagCloud.innerHTML = tagHTML;
    }

    populateStatistics() {
        const statsDisplay = document.getElementById('statsDisplay');
        if (!statsDisplay) return;

        const seenIds = new Set();
        let totalScenarios = 0;
        let scenariosWithKQL = 0;
        let wikiExtracted = 0;
        let highSeverity = 0;

        this.allCheatSheets.forEach(sheet => {
            if (!seenIds.has(sheet.id)) {
                seenIds.add(sheet.id);
                totalScenarios++;

                if (sheet.queries && sheet.queries.length > 0) {
                    scenariosWithKQL++;
                }

                if (sheet.relatedKQL && sheet.relatedKQL.length > 0) {
                    scenariosWithKQL++;
                }

                if (this.isWikiSource(sheet)) {
                    wikiExtracted++;
                }

                if (sheet.severity === 'high') {
                    highSeverity++;
                }
            }
        });

        const categoryCount = new Set(this.allCheatSheets.map(s => s.category)).size;
        const totalTags = new Set(this.allCheatSheets.flatMap(s => s.tags || [])).size;

        const statsHTML = `
            <div class="stat-item">
                <span class="stat-label">Total Scenarios</span>
                <span class="stat-value">${totalScenarios}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Categories</span>
                <span class="stat-value">${categoryCount}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Tags</span>
                <span class="stat-value">${totalTags}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">With KQL</span>
                <span class="stat-value">${scenariosWithKQL}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Wiki Extracted</span>
                <span class="stat-value">${wikiExtracted}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Critical</span>
                <span class="stat-value">${highSeverity}</span>
            </div>
        `;

        statsDisplay.innerHTML = statsHTML;
    }

    // Helper methods for enhanced navigation

    getCategoryIcon(category) {
        const iconMap = {
            'authentication': 'fas fa-key',
            'synchronization': 'fas fa-sync',
            'provisioning': 'fas fa-user-plus',
            'conditional-access': 'fas fa-shield-alt',
            'performance': 'fas fa-tachometer-alt',
            'applications': 'fas fa-cube',
            'general': 'fas fa-info-circle',
            'b2b': 'fas fa-handshake',
            'b2c': 'fas fa-users',
            'mfa': 'fas fa-mobile-alt',
            'governance': 'fas fa-gavel',
            'domain-services': 'fas fa-server'
        };
        return iconMap[category] || 'fas fa-folder';
    }

    getVerticalIcon(vertical) {
        const iconMap = {
            'Auth': 'fas fa-shield-alt',
            'Account Management': 'fas fa-users',
            'Sync': 'fas fa-sync-alt',
            'Applications': 'fas fa-cube',
            'Performance': 'fas fa-tachometer-alt',
            'General': 'fas fa-cog'
        };
        return iconMap[vertical] || 'fas fa-folder';
    }

    getTagSizeClass(count, minCount, maxCount) {
        if (maxCount === minCount) return 'size-md';

        const range = maxCount - minCount;
        const normalized = (count - minCount) / range;

        if (normalized < 0.2) return 'size-xs';
        if (normalized < 0.4) return 'size-sm';
        if (normalized < 0.6) return 'size-md';
        if (normalized < 0.8) return 'size-lg';
        return 'size-xl';
    }

    toggleVertical(verticalId) {
        const verticalElement = document.getElementById(verticalId);
        const arrowElement = document.getElementById(`${verticalId}-arrow`);

        if (!verticalElement || !arrowElement) return;

        const isVisible = verticalElement.style.display !== 'none';

        if (isVisible) {
            verticalElement.style.display = 'none';
            arrowElement.classList.remove('fa-chevron-down');
            arrowElement.classList.add('fa-chevron-right');
        } else {
            verticalElement.style.display = 'block';
            arrowElement.classList.remove('fa-chevron-right');
            arrowElement.classList.add('fa-chevron-down');
        }
    }

    // Enhanced filtering methods

    filterByCategory(category) {
        console.log(`🏷️ Filtering by category: ${category}`);

        // Update UI to show active category
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`)?.classList.add('active');

        // Hide welcome message and show search results
        document.getElementById('welcomeMessage').style.display = 'none';
        document.getElementById('searchResults').style.display = 'block';

        // Update search
        document.getElementById('categoryFilter').value = category;
        document.getElementById('searchInput').value = '';
        this.performSearch();
    }

    filterByTag(tag) {
        console.log(`🏷️ Filtering by tag: ${tag}`);

        // Update UI to show active tag
        document.querySelectorAll('.cloud-tag').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tag="${tag}"]`)?.classList.add('active');

        // Hide welcome message and show search results
        document.getElementById('welcomeMessage').style.display = 'none';
        document.getElementById('searchResults').style.display = 'block';

        // Clear search inputs
        document.getElementById('searchInput').value = '';
        document.getElementById('categoryFilter').value = '';

        // Filter scenarios by exact tag match
        const filteredResults = this.allCheatSheets.filter(sheet => {
            return sheet.tags && sheet.tags.some(sheetTag =>
                sheetTag.toLowerCase() === tag.toLowerCase()
            );
        });

        console.log(`🏷️ Found ${filteredResults.length} scenarios with tag "${tag}"`);
        this.displayResults(filteredResults, `Scenarios tagged with "${tag}"`);
    }

    clearCategoryFilter() {
        console.log('🧹 Clearing category filter');

        // Update UI to show "All Categories" as active
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector('[data-category=""]')?.classList.add('active');

        // Clear filters
        document.getElementById('categoryFilter').value = '';
        document.getElementById('searchInput').value = '';

        // Show all scenarios instead of calling performSearch which might show welcome message
        this.showAllScenarios();
    }

    clearAllFilters() {
        console.log('🧹 Clearing all filters');

        // Clear category selection but don't call clearCategoryFilter to avoid double processing
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector('[data-category=""]')?.classList.add('active');

 // Clear tag selection
        document.querySelectorAll('.cloud-tag').forEach(item => {
            item.classList.remove('active');
        });

        // Clear form inputs
        document.getElementById('categoryFilter').value = '';
        document.getElementById('searchInput').value = '';

        // Show all scenarios
        this.showAllScenarios();
    }

    goHome() {
        // Clear all filters and search
        document.getElementById('searchInput').value = '';
        document.getElementById('categoryFilter').value = '';

        // Clear all visual indicators
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector('[data-category=""]')?.classList.add('active'); // Activate "All Categories"

        document.querySelectorAll('.cloud-tag').forEach(item => {
            item.classList.remove('active');
        });

        // Show welcome message
        document.getElementById('searchResults').style.display = 'none';
        document.getElementById('welcomeMessage').style.display = 'block';

        // Clear recent queries selection
        document.querySelectorAll('#recentQueries a').forEach(a => {
            a.classList.remove('active');
        });

        console.log('🏠 Returned to home');
    }

    isWikiSource(sheet) {
        if (!sheet.source) return false;

        // Handle both string and object formats
        if (typeof sheet.source === 'string') {
            return sheet.source.endsWith('.md');
        }

        // Handle object format with path property
        if (typeof sheet.source === 'object') {
            return (sheet.source.type === 'wiki') ||
                   (sheet.source.path && sheet.source.path.endsWith('.md'));
        }

        return false;
    }

    getSourcePath(sheet) {
        if (!sheet.source) return '';

        // Handle string format
        if (typeof sheet.source === 'string') {
            return sheet.source;
        }

        // Handle object format
        if (typeof sheet.source === 'object') {
            return sheet.source.path || sheet.source.url || '';
        }

        return '';
    }

    getArticleTitle(source) {
        if (!source || typeof source !== 'string') {
            return '';
        }

        // Extract title from filename
        let title = source;

        // Remove .md extension
        if (title.endsWith('.md')) {
            title = title.replace('.md', '');
        }

        // Convert dashes and underscores to spaces
        title = title
            .replace(/[-_]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        // Handle encoded characters (like %2D for -)
        try {
            title = decodeURIComponent(title);
        } catch (e) {
            // If decoding fails, keep the original
        }

        // Clean up common prefixes
        const prefixesToRemove = [
            'TSG - ',
            'TSG-',
            'Azure AD ',
            'Azure-AD-',
            'AAD ',
            'AAD-'
        ];

        prefixesToRemove.forEach(prefix => {
            if (title.startsWith(prefix)) {
                title = title.substring(prefix.length);
            }
        });

        return title.trim();
    }

    buildWikiUrl(source) {
        // Try to construct a proper wiki URL from the source path
        if (!source || typeof source !== 'string') {
            return { wikiUrl: null, originalPath: source };
        }

        // Clean up the source path and try to build a wiki URL
        let cleanPath = source;

        // Remove common prefixes that might be in the path
        const prefixesToRemove = [
            'AAD/',
            'AzureAD/',
            'Azure-AD/',
            'wiki/',
            'wikis/',
            '/'
        ];

        prefixesToRemove.forEach(prefix => {
            if (cleanPath.startsWith(prefix)) {
                cleanPath = cleanPath.substring(prefix.length);
            }
        });

        // Remove .md extension
        if (cleanPath.endsWith('.md')) {
            cleanPath = cleanPath.replace('.md', '');
        }

        // Process the path for wiki URL format
        // Wiki URLs use specific patterns - no URL encoding, just character replacement
        let wikiPath = cleanPath;

        // Replace special characters with wiki-friendly versions
        wikiPath = wikiPath
            .replace(/\s+/g, '-')          // Spaces become dashes
            .replace(/\?/g, '')            // Remove question marks entirely
            .replace(/!/g, '')             // Remove exclamation marks
            .replace(/['"]/g, '')          // Remove quotes
            .replace(/[<>]/g, '')          // Remove angle brackets
            .replace(/[|\\]/g, '')         // Remove pipes and backslashes
            .replace(/:/g, '-')            // Colons become dashes
            .replace(/\*/g, '')            // Remove asterisks
            .replace(/\+/g, '-')           // Plus signs become dashes
            .replace(/=/g, '-')            // Equal signs become dashes
            .replace(/&/g, 'and')          // Ampersands become 'and'
            .replace(/\(/g, '')            // Remove opening parentheses
            .replace(/\)/g, '')            // Remove closing parentheses
            .replace(/\[/g, '')            // Remove opening brackets
            .replace(/\]/g, '')            // Remove closing brackets
            .replace(/\{/g, '')            // Remove opening braces
            .replace(/\}/g, '')            // Remove closing braces
            .replace(/,/g, '')             // Remove commas
            .replace(/\./g, '')            // Remove periods (except in extensions)
            .replace(/;/g, '')             // Remove semicolons
            .replace(/--+/g, '-')          // Multiple dashes become single dash
            .replace(/^-+|-+$/g, '');      // Remove leading/trailing dashes

        // Base wiki URL for Azure AD documentation
        const baseWikiUrl = 'https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD';

        // Generate article ID based on the cleaned path
        if (wikiPath) {
            const articleId = this.generateArticleId(cleanPath);

            // Construct the final URL - no additional encoding needed
            const wikiUrl = `${baseWikiUrl}/${articleId}/${wikiPath}`;

            return {
                wikiUrl: wikiUrl,
                originalPath: source,
                cleanPath: cleanPath,
                wikiPath: wikiPath,
                articleId: articleId
            };
        }

        return { wikiUrl: null, originalPath: source };
    }

    generateArticleId(path) {
        // Generate a simple hash-based article ID
        // This is a simple hash function for demo purposes
        let hash = 0;
        if (path.length === 0) return '1000000';

        for (let i = 0; i < path.length; i++) {
            const char = path.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        // Ensure it's positive and in a reasonable range for article IDs
        const articleId = Math.abs(hash) % 9000000 + 1000000;
        return articleId.toString();
    }
}

// Global functions for HTML onclick events
function performSearch() {
    app.performSearch();
}

function clearSearch() {
    app.clearSearch();
}

function showAddCheatSheet() {
    app.showAddCheatSheet();
}

function closeModal() {
    app.closeModal();
}

function saveCheatSheet() {
    app.saveCheatSheet();
}

function syncLibrary() {
    app.syncLibrary();
}

function searchFor(term) {
    app.searchFor(term);
}

function deleteCheatSheet(sheetId) {
    app.deleteCheatSheet(sheetId);
}

function editCheatSheet(sheetId) {
    app.editCheatSheet(sheetId);
}

function exportLibrary() {
    app.exportLibrary();
}

function importLibrary(event) {
    app.importLibrary(event);
}

function expandCheatSheet(sheetId) {
    app.expandCheatSheet(sheetId);
}

function collapseCheatSheet(sheetId) {
    app.collapseCheatSheet(sheetId);
}

// Global function to go home
function goHome() {
    app.goHome();
}

// Global functions for enhanced navigation
function filterByCategory(category) {
    app.filterByCategory(category);
}

function filterByTag(tag) {
    app.filterByTag(tag);
}

function clearCategoryFilter() {
    app.clearCategoryFilter();
}

function clearAllFilters() {
    app.clearAllFilters();
}

// Initialize the application when the page loads
let app;
document.addEventListener('DOMContentLoaded', function() {
    app = new QueryLibraryApp();
    // Make app accessible globally for onclick handlers
    window.app = app;
});
