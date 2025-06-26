// Azure AD Troubleshooting Query Library - Main Application Logic

class QueryLibraryApp {
    constructor() {
        this.currentResults = [];
        this.recentQueries = JSON.parse(localStorage.getItem('recentQueries')) || [];
        this.localCheatSheets = JSON.parse(localStorage.getItem('localCheatSheets')) || [];
        this.allCheatSheets = [...cheatSheets, ...this.localCheatSheets];
        this.currentQueries = [{ name: '', description: '', query: '' }];
        this.editingSheetId = null;

        this.initializeApp();
    }

    initializeApp() {
        this.populateRecentQueries();
        this.setupEventListeners();
        this.loadSyntaxHighlighter();
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

        // Filter cheat sheets based on search criteria
        let filteredResults = this.allCheatSheets.filter(sheet => {
            const matchesSearch = !searchTerm ||
                sheet.title.toLowerCase().includes(searchTerm) ||
                sheet.description.toLowerCase().includes(searchTerm) ||
                sheet.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                (sheet.query && sheet.query.toLowerCase().includes(searchTerm)) ||
                (sheet.queries && sheet.queries.some(q =>
                    q.query.toLowerCase().includes(searchTerm) ||
                    q.name.toLowerCase().includes(searchTerm) ||
                    q.description.toLowerCase().includes(searchTerm)
                ));

            const matchesCluster = !clusterFilter || sheet.cluster === clusterFilter;
            const matchesCategory = !categoryFilter || sheet.category === categoryFilter;

            return matchesSearch && matchesCluster && matchesCategory;
        });

        // Add to recent queries if it's a search term
        if (searchTerm) {
            this.addToRecentQueries(searchTerm);
        }

        this.displayResults(filteredResults);
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

        const resultsHTML = results.map(sheet => this.createCheatSheetCard(sheet)).join('');
        searchResults.innerHTML = resultsHTML;

        // Apply syntax highlighting after content is loaded
        setTimeout(() => {
            if (typeof Prism !== 'undefined') {
                Prism.highlightAll();
            }
        }, 100);

        this.currentResults = results;
    }

    createCheatSheetCard(sheet) {
        const stepsHtml = sheet.steps.map((step, index) =>
            `<li>${step}</li>`
        ).join('');

        // Handle both old format (single query) and new format (multiple queries)
        let queriesHtml = '';
        if (sheet.queries && Array.isArray(sheet.queries)) {
            // New format with multiple queries
            queriesHtml = sheet.queries.map((queryObj, index) => {
                const queryId = `query_${sheet.id}_${index}`;
                return `
                <div class="query-item">
                    <div class="query-item-header">
                        <h4>${queryObj.name}</h4>
                        <p class="query-description">${queryObj.description}</p>
                    </div>
                    <div class="query-container">
                        <button class="copy-btn" onclick="app.copyQueryById('${queryId}', this)">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                        <textarea id="${queryId}" style="display: none;">${queryObj.query}</textarea>
                        <pre class="query-code"><code class="language-kql">${this.escapeHtml(queryObj.query)}</code></pre>
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
                    <div class="card-title">${sheet.title}</div>
                    <div class="card-actions">
                        <button class="btn-edit" onclick="app.editCheatSheet(${sheet.id})" title="Edit this cheat sheet">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${sheet.tags && sheet.tags.includes('custom') ? `
                        <button class="btn-delete" onclick="app.deleteCheatSheet(${sheet.id})" title="Delete this cheat sheet">
                            <i class="fas fa-trash"></i>
                        </button>
                        ` : ''}
                    </div>
                </div>
                <div class="card-meta">
                    <span><i class="fas fa-tag"></i> ${this.getCategoryName(sheet.category)}</span>
                    <span><i class="fas fa-server"></i> ${sheet.cluster}</span>
                    <span><i class="fas fa-code"></i> ${sheet.queries ? sheet.queries.length : 1} ${sheet.queries && sheet.queries.length > 1 ? 'queries' : 'query'}</span>
                </div>
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

    getCategoryName(category) {
        const categoryNames = {
            'sync': 'Synchronization',
            'auth': 'Authentication',
            'provisioning': 'Provisioning',
            'performance': 'Performance'
        };
        return categoryNames[category] || category;
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
            // Update existing cheat sheet
            const index = this.localCheatSheets.findIndex(s => s.id === this.editingSheetId);
            if (index !== -1) {
                this.localCheatSheets[index] = { ...cheatSheetData, id: this.editingSheetId };
                localStorage.setItem('localCheatSheets', JSON.stringify(this.localCheatSheets));

                // Update combined list
                this.allCheatSheets = [...cheatSheets, ...this.localCheatSheets];

                alert('Cheat sheet updated successfully!');
            } else {
                alert('Error: Could not find cheat sheet to update.');
                return;
            }
        } else {
            // Add new cheat sheet
            const newCheatSheet = {
                ...cheatSheetData,
                id: Date.now()
            };

            this.localCheatSheets.push(newCheatSheet);
            localStorage.setItem('localCheatSheets', JSON.stringify(this.localCheatSheets));

            // Update combined list
            this.allCheatSheets = [...cheatSheets, ...this.localCheatSheets];

            alert('Cheat sheet saved successfully!');
        }

        this.closeModal();

        // If currently searching, refresh results
        if (document.getElementById('searchResults').style.display === 'block') {
            this.performSearch();
        }
    }

    editCheatSheet(sheetId) {
        const sheet = this.allCheatSheets.find(s => s.id === sheetId);
        if (!sheet) {
            alert('Cheat sheet not found!');
            return;
        }

        // Set editing mode
        this.editingSheetId = sheetId;

        // Populate form with existing data
        document.getElementById('title').value = sheet.title;
        document.getElementById('category').value = sheet.category;
        document.getElementById('cluster').value = sheet.cluster;
        document.getElementById('description').value = sheet.description;
        document.getElementById('steps').value = sheet.steps.join('\n');

        // Setup queries for editing
        if (sheet.queries && Array.isArray(sheet.queries)) {
            this.currentQueries = [...sheet.queries];
        } else if (sheet.query) {
            // Convert old format to new format
            this.currentQueries = [{
                name: 'Main Query',
                description: 'Primary troubleshooting query',
                query: sheet.query
            }];
        } else {
            this.currentQueries = [{ name: '', description: '', query: '' }];
        }

        this.renderQueryInputs();

        // Update modal title and button text
        document.querySelector('#addCheatSheetModal .modal-header h2').textContent = 'Edit Cheat Sheet';
        document.querySelector('#addCheatSheetModal .modal-footer .btn-primary').textContent = 'Update Cheat Sheet';

        document.getElementById('addCheatSheetModal').style.display = 'block';
    }

    deleteCheatSheet(sheetId) {
        if (!confirm('Are you sure you want to delete this cheat sheet? This action cannot be undone.')) {
            return;
        }

        const sheet = this.allCheatSheets.find(s => s.id === sheetId);
        if (!sheet || !sheet.tags || !sheet.tags.includes('custom')) {
            alert('Only custom cheat sheets can be deleted.');
            return;
        }

        // Remove from local storage
        this.localCheatSheets = this.localCheatSheets.filter(s => s.id !== sheetId);
        localStorage.setItem('localCheatSheets', JSON.stringify(this.localCheatSheets));

        // Update combined list
        this.allCheatSheets = [...cheatSheets, ...this.localCheatSheets];

        alert('Cheat sheet deleted successfully!');

        // Refresh results if currently searching
        if (document.getElementById('searchResults').style.display === 'block') {
            this.performSearch();
        }
    }

    exportLibrary() {
        const exportData = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            customCheatSheets: this.localCheatSheets,
            recentQueries: this.recentQueries
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `query-library-export-${new Date().toISOString().split('T')[0]}.json`;
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

                if (!importData.customCheatSheets || !Array.isArray(importData.customCheatSheets)) {
                    alert('Invalid import file format.');
                    return;
                }

                const importCount = importData.customCheatSheets.length;
                if (importCount === 0) {
                    alert('No cheat sheets found in import file.');
                    return;
                }

                // Merge with existing data, avoiding duplicates by checking titles
                const existingTitles = this.localCheatSheets.map(s => s.title.toLowerCase());
                const newSheets = importData.customCheatSheets.filter(
                    sheet => !existingTitles.includes(sheet.title.toLowerCase())
                );

                if (newSheets.length === 0) {
                    alert('All cheat sheets from the import file already exist in your library.');
                    return;
                }

                // Update IDs to prevent conflicts
                newSheets.forEach(sheet => {
                    sheet.id = Date.now() + Math.random();
                });

                this.localCheatSheets.push(...newSheets);
                localStorage.setItem('localCheatSheets', JSON.stringify(this.localCheatSheets));

                // Update combined list
                this.allCheatSheets = [...cheatSheets, ...this.localCheatSheets];

                alert(`Successfully imported ${newSheets.length} cheat sheets!`);

                // Clear the file input
                event.target.value = '';

                // Refresh results if searching
                if (document.getElementById('searchResults').style.display === 'block') {
                    this.performSearch();
                }

            } catch (error) {
                alert('Error parsing import file. Please ensure it\'s a valid JSON export.');
                console.error('Import error:', error);
            }
        };

        reader.readAsText(file);
    }

    syncLibrary() {
        // Placeholder for library synchronization
        alert('Library sync feature will be implemented to pull from:\n- SharePoint libraries\n- GitHub repositories\n- Azure DevOps wikis\n\nThis will sync the latest troubleshooting queries from your team.');
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

function exportLibrary() {
    app.exportLibrary();
}

function importLibrary(event) {
    app.importLibrary(event);
}

// Initialize the application when the page loads
let app;
document.addEventListener('DOMContentLoaded', function() {
    app = new QueryLibraryApp();
});
