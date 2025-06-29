// DiagnosticIQ - Main Application Logic

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
        // Update local reference to all scenarios
        this.allCheatSheets = [...(window.cheatSheets || []), ...this.localCheatSheets];

        // Debug: Check what scenarios we have
        console.log('📊 Total scenarios loaded:', this.allCheatSheets.length);
        console.log('🏷️ Scenarios by category:');
        const categoryCount = {};
        this.allCheatSheets.forEach(sheet => {
            categoryCount[sheet.category] = (categoryCount[sheet.category] || 0) + 1;
            if (sheet.category === 'general') {
                console.log('🎯 General scenario found:', sheet.title);
            }
        });
        console.log('📈 Category counts:', categoryCount);

        // Populate category dropdown dynamically
        this.populateCategoryDropdown();

        // Populate quick access links dynamically
        this.populateQuickAccess();

        // Update total count in header
        this.updateTotalCount();

        this.populateRecentQueries();
        console.log(`📊 DiagnosticIQ initialized with ${this.allCheatSheets.length} scenarios`);
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
                sheet.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                (sheet.query && sheet.query.toLowerCase().includes(searchTerm)) ||
                (sheet.queries && sheet.queries.some(q =>
                    (q.query && q.query.toLowerCase().includes(searchTerm)) ||
                    (q.kql && q.kql.toLowerCase().includes(searchTerm)) ||
                    (q.name && q.name.toLowerCase().includes(searchTerm)) ||
                    (q.title && q.title.toLowerCase().includes(searchTerm)) ||
                    q.description.toLowerCase().includes(searchTerm)
                ));

            const matchesCluster = !clusterFilter || sheet.cluster === clusterFilter;
            const matchesCategory = !categoryFilter || sheet.category === categoryFilter;

            // Debug logging for category filter
            if (categoryFilter && categoryFilter === 'general') {
                console.log('🎯 General category filter - checking sheet:', {
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

    displayResults(results) {
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
                <h3><i class="fas fa-search"></i> Search Results</h3>
                <p>Found <strong>${results.length}</strong> troubleshooting scenario${results.length > 1 ? 's' : ''}</p>
            </div>
        `;

        const resultsHTML = results.map(sheet => this.createCheatSheetPreview(sheet)).join('');
        searchResults.innerHTML = summaryHTML + resultsHTML;

        this.currentResults = results;
    }

    createCheatSheetCard(sheet) {
        // Handle both string array and object array formats for steps
        const stepsHtml = sheet.steps.map((step, index) => {
            if (typeof step === 'string') {
                // Simple string format
                return `<li>${step}</li>`;
            } else if (typeof step === 'object' && step.action) {
                // Detailed object format
                return `<li><strong>${step.description || `Step ${step.step || index + 1}`}:</strong> ${step.action}${step.expected ? ` <em>(Expected: ${step.expected})</em>` : ''}</li>`;
            } else {
                // Fallback for unknown format
                return `<li>${step}</li>`;
            }
        }).join('');

        // Handle both old format (single query) and new format (multiple queries)
        let queriesHtml = '';
        if (sheet.queries && Array.isArray(sheet.queries)) {
            // New format with multiple queries
            queriesHtml = sheet.queries.map((queryObj, index) => {
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
                    <span><i class="fas fa-tag"></i> ${this.getCategoryName(sheet.category)}</span>
                    <span><i class="fas fa-server"></i> ${sheet.cluster || 'N/A'}</span>
                    ${sheet.database ? `<span><i class="fas fa-database"></i> ${sheet.database}</span>` : ''}
                    <span><i class="fas fa-code"></i> ${this.getQueryCount(sheet)} ${this.getQueryCount(sheet) !== 1 ? 'queries' : 'query'}</span>
                    ${sheet.source && sheet.source.endsWith('.md') ? `<span class="wiki-indicator"><i class="fas fa-book"></i> <a href="#" onclick="app.openWikiLink('${sheet.source}')" title="View source wiki page">Wiki Source</a></span>` : ''}
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
                            <i class="fas fa-code"></i> KQL ${sheet.queries && sheet.queries.length > 1 ? 'Queries' : 'Query'}
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
        const firstQuery = sheet.queries && sheet.queries.length > 0
            ? sheet.queries[0]
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
                    <span><i class="fas fa-tag"></i> ${this.getCategoryName(sheet.category)}</span>
                    <span><i class="fas fa-server"></i> ${sheet.cluster || 'N/A'}</span>
                    ${sheet.database ? `<span><i class="fas fa-database"></i> ${sheet.database}</span>` : ''}
                    <span><i class="fas fa-code"></i> ${this.getQueryCount(sheet)} ${this.getQueryCount(sheet) !== 1 ? 'queries' : 'query'}</span>
                    <span><i class="fas fa-list-ol"></i> ${sheet.steps ? sheet.steps.length : 0} steps</span>
                    ${sheet.source && sheet.source.endsWith('.md') ? `<span class="wiki-indicator"><i class="fas fa-book"></i> Wiki</span>` : ''}
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
        if (sheet.relatedKQL && Array.isArray(sheet.relatedKQL)) {
            return sheet.relatedKQL.length;
        }
        if (sheet.query) {
            return 1;
        }
        return 0;
    }

    openWikiLink(source) {
        // For now, show an alert with the source information
        // In the future, this could link to the actual wiki page
        alert(`This scenario was extracted from: ${source}\n\nThis troubleshooting scenario comes from the internal wiki documentation.`);
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

        if (!this.currentQueries || this.currentQueries.length === 0 || !this.currentQueries[0].query) {
            alert('At least one query is required.');
            return;
        }

        // Filter out empty queries
        const validQueries = this.currentQueries.filter(q => q.query.trim());

        if (validQueries.length === 0) {
            alert('At least one query with content is required.');
            return;
        }

        const cheatSheetData = {
            title: title,
            category: category,
            cluster: cluster,
            database: database,
            description: description,
            queries: validQueries.map(q => ({
                name: q.name || 'Custom Query',
                description: q.description || 'User-defined troubleshooting query',
                query: q.query
            })),
            steps: steps,
            tags: ['custom', 'user-created']
        };

        if (this.editingSheetId) {
            const originalSheet = this.allCheatSheets.find(s => s.id === this.editingSheetId);
            const isCustomSheet = originalSheet && originalSheet.tags && originalSheet.tags.includes('custom');

            if (isCustomSheet) {
                // Update existing custom cheat sheet
                if (this.dataManager.updateScenario(this.editingSheetId, cheatSheetData)) {
                    // Also update local storage for persistence
                    const index = this.localCheatSheets.findIndex(s => s.id === this.editingSheetId);
                    if (index !== -1) {
                        this.localCheatSheets[index] = { ...cheatSheetData, id: this.editingSheetId };
                        localStorage.setItem('localCheatSheets', JSON.stringify(this.localCheatSheets));
                    }
                    this.refreshData();
                    alert('Cheat sheet updated successfully!');
                } else {
                    alert('Error: Could not find cheat sheet to update.');
                    return;
                }
            } else {
                // Editing an extracted scenario - create a new custom version
                const newCheatSheet = this.dataManager.addCustomScenario(cheatSheetData);

                // Also save to local storage for persistence
                this.localCheatSheets.push(newCheatSheet);
                localStorage.setItem('localCheatSheets', JSON.stringify(this.localCheatSheets));

                this.refreshData();
                alert('Modified cheat sheet saved as a new custom version!');
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

    refreshData() {
        // Refresh the local reference to all scenarios
        this.allCheatSheets = [...(window.cheatSheets || []), ...this.localCheatSheets];

        // Update dynamic elements
        this.populateQuickAccess();
        this.updateTotalCount();
        this.populateCategoryDropdown();
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
        document.getElementById('cluster').value = sheet.cluster;
        document.getElementById('database').value = sheet.database || '';
        document.getElementById('description').value = sheet.description;
        document.getElementById('steps').value = sheet.steps.join('\n');

        // Setup queries for editing
        if (sheet.queries && Array.isArray(sheet.queries)) {
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
        link.download = `diagnosticiq-export-${new Date().toISOString().split('T')[0]}.json`;
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
        alert('DiagnosticIQ sync feature will be implemented to pull from:\n- SharePoint libraries\n- GitHub repositories\n- Azure DevOps wikis\n\nThis will sync the latest troubleshooting queries from your team.');
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
        // Clear all filters
        document.getElementById('categoryFilter').value = '';
        document.getElementById('searchInput').value = '';

        // Reset current results and display all scenarios (apply deduplication)
        console.log('🎯 Showing all scenarios...');
        const uniqueResults = [];
        const seenIds = new Set();

        this.allCheatSheets.forEach(sheet => {
            if (!seenIds.has(sheet.id)) {
                seenIds.add(sheet.id);
                uniqueResults.push(sheet);
            }
        });

        console.log(`✅ Displaying ${uniqueResults.length} unique scenarios out of ${this.allCheatSheets.length} total`);
        this.displayResults(uniqueResults);
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

// Initialize the application when the page loads
let app;
document.addEventListener('DOMContentLoaded', function() {
    app = new QueryLibraryApp();
    // Make app accessible globally for onclick handlers
    window.app = app;
});
