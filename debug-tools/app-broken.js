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
        this.populateVerticalDropdown();
        this.updateTotalScenarios();
        
        // Display recent queries
        this.renderRecentQueries();
        
        // Show initial view
        if (this.allCheatSheets.length > 0) {
            this.displayResults(this.allCheatSheets);
        }
    }

    populateCategoryDropdown() {
        const categoryDropdown = document.getElementById('categoryFilter');
        if (!categoryDropdown) return;

        // Get available categories from data manager
        try {
            const categories = window.dataManager.getAvailableCategories();
            
            // Clear existing options except first
            categoryDropdown.innerHTML = '<option value="all">All Categories</option>';
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = `${category.displayName} (${category.count})`;
                categoryDropdown.appendChild(option);
            });
            
            console.log(`🏷️ Categories populated: ${categories.length} categories`);
        } catch (error) {
            console.warn('⚠️ Failed to populate categories:', error.message);
            // Continue without categories
        }
    }

    populateVerticalDropdown() {
        const verticalDropdown = document.getElementById('verticalFilter');
        if (!verticalDropdown) return;

        // For now, just log that this feature isn't implemented
        console.log('ℹ️ Vertical dropdown not implemented yet');
    }

    updateTotalScenarios() {
        const totalElement = document.getElementById('totalScenarios');
        if (totalElement) {
            totalElement.textContent = `Total Scenarios: ${this.allCheatSheets.length}`;
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Filter functionality
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => this.handleFilter());
        }

        const verticalFilter = document.getElementById('verticalFilter');
        if (verticalFilter) {
            verticalFilter.addEventListener('change', (e) => this.handleFilter());
        }

        // Clear filters
        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }

        // Add new query
        const addQueryBtn = document.getElementById('addQueryBtn');
        if (addQueryBtn) {
            addQueryBtn.addEventListener('click', () => this.addQuery());
        }

        // Export functionality
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportCheatSheet());
        }

        // Import functionality
        const importBtn = document.getElementById('importBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importCheatSheet());
        }

        // Save functionality
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveCheatSheet());
        }
    }

    handleSearch(term) {
        const filtered = this.filterScenarios(term);
        this.displayResults(filtered);
    }

    handleFilter() {
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        const verticalFilter = document.getElementById('verticalFilter')?.value || '';
        const searchTerm = document.getElementById('searchInput')?.value || '';

        let filtered = [...this.allCheatSheets];

        // Apply category filter
        if (categoryFilter) {
            filtered = filtered.filter(sheet => 
                sheet.category && sheet.category.toLowerCase() === categoryFilter.toLowerCase()
            );
        }

        // Apply vertical filter
        if (verticalFilter) {
            filtered = filtered.filter(sheet => 
                sheet.vertical && sheet.vertical.toLowerCase() === verticalFilter.toLowerCase()
            );
        }

        // Apply search term
        if (searchTerm) {
            filtered = this.filterScenarios(searchTerm, filtered);
        }

        this.displayResults(filtered);
    }

    filterScenarios(term, scenarios = null) {
        const searchIn = scenarios || this.allCheatSheets;
        
        if (!term) return searchIn;

        const searchTerm = term.toLowerCase();
        return searchIn.filter(sheet => {
            const searchableText = [
                sheet.title || '',
                sheet.description || '',
                sheet.category || '',
                sheet.vertical || '',
                sheet.tags || '',
                ...(sheet.queries || []).map(q => `${q.name} ${q.description} ${q.query}`)
            ].join(' ').toLowerCase();

            return searchableText.includes(searchTerm);
        });
    }

    clearFilters() {
        // Clear form inputs
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';

        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) categoryFilter.value = '';

        const verticalFilter = document.getElementById('verticalFilter');
        if (verticalFilter) verticalFilter.value = '';

        // Show all results
        this.displayResults(this.allCheatSheets);
    }

    displayResults(scenarios) {
        this.currentResults = scenarios;
        const resultsContainer = document.getElementById('results');
        
        if (!resultsContainer) {
            console.error('Results container not found');
            return;
        }

        if (scenarios.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">No scenarios found matching your criteria.</div>';
            return;
        }

        const html = scenarios.map(sheet => this.createScenarioCard(sheet)).join('');
        resultsContainer.innerHTML = html;
        
        // Update count
        const countElement = document.getElementById('resultCount');
        if (countElement) {
            countElement.textContent = `Showing ${scenarios.length} scenario(s)`;
        }
    }

    createScenarioCard(sheet) {
        const queries = sheet.queries || [];
        const hasQueries = queries.length > 0 && queries[0].query;

        return `
            <div class="scenario-card" data-id="${sheet.id}">
                <div class="scenario-header">
                    <h3>${this.escapeHtml(sheet.title || 'Untitled')}</h3>
                    <div class="scenario-meta">
                        ${sheet.category ? `<span class="category-tag">${this.escapeHtml(sheet.category)}</span>` : ''}
                        ${sheet.vertical ? `<span class="vertical-tag">${this.escapeHtml(sheet.vertical)}</span>` : ''}
                    </div>
                </div>
                
                <div class="scenario-description">
                    <p>${this.escapeHtml(sheet.description || 'No description available')}</p>
                </div>

                ${hasQueries ? `
                    <div class="scenario-queries">
                        <h4>KQL Queries (${queries.length})</h4>
                        ${queries.slice(0, 2).map(query => `
                            <div class="query-preview">
                                <strong>${this.escapeHtml(query.name || 'Query')}</strong>
                                <p>${this.escapeHtml(query.description || '')}</p>
                                ${query.query ? `<code class="kql-preview">${this.escapeHtml(query.query.substring(0, 100))}${query.query.length > 100 ? '...' : ''}</code>` : ''}
                            </div>
                        `).join('')}
                        ${queries.length > 2 ? `<p class="more-queries">And ${queries.length - 2} more queries...</p>` : ''}
                    </div>
                ` : '<p class="no-queries">No KQL queries available</p>'}

                <div class="scenario-actions">
                    <button onclick="app.viewScenario('${sheet.id}')" class="btn btn-primary">View Details</button>
                    <button onclick="app.editScenario('${sheet.id}')" class="btn btn-secondary">Edit</button>
                    <button onclick="app.copyToClipboard('${sheet.id}')" class="btn btn-tertiary">Copy Queries</button>
                </div>
            </div>
        `;
    }

    viewScenario(id) {
        const scenario = this.allCheatSheets.find(s => s.id === id);
        if (!scenario) return;

        // Add to recent queries
        this.addToRecentQueries(scenario);

        // Show in modal or detailed view
        this.showScenarioModal(scenario);
    }

    editScenario(id) {
        const scenario = this.allCheatSheets.find(s => s.id === id);
        if (!scenario) return;

        this.editingSheetId = id;
        this.populateEditForm(scenario);
        
        // Show edit modal/form
        const editModal = document.getElementById('editModal');
        if (editModal) {
            editModal.style.display = 'block';
        }
    }

    copyToClipboard(id) {
        const scenario = this.allCheatSheets.find(s => s.id === id);
        if (!scenario || !scenario.queries) return;

        const queries = scenario.queries
            .filter(q => q.query)
            .map(q => `// ${q.name}\n// ${q.description}\n${q.query}`)
            .join('\n\n');

        navigator.clipboard.writeText(queries).then(() => {
            this.showNotification('Queries copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
            this.showNotification('Failed to copy queries', 'error');
        });
    }

    showScenarioModal(scenario) {
        const modal = document.getElementById('scenarioModal');
        const modalContent = document.getElementById('modalContent');
        
        if (!modal || !modalContent) return;

        const queries = scenario.queries || [];
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <h2>${this.escapeHtml(scenario.title || 'Untitled')}</h2>
                <button class="close-btn" onclick="app.closeModal()">&times;</button>
            </div>
            
            <div class="modal-body">
                <div class="scenario-info">
                    <p><strong>Category:</strong> ${this.escapeHtml(scenario.category || 'Uncategorized')}</p>
                    <p><strong>Vertical:</strong> ${this.escapeHtml(scenario.vertical || 'General')}</p>
                    <p><strong>Description:</strong> ${this.escapeHtml(scenario.description || 'No description available')}</p>
                </div>
                
                ${queries.length > 0 ? `
                    <div class="queries-section">
                        <h3>KQL Queries</h3>
                        ${queries.map((query, index) => `
                            <div class="query-item">
                                <h4>${this.escapeHtml(query.name || `Query ${index + 1}`)}</h4>
                                <p>${this.escapeHtml(query.description || '')}</p>
                                ${query.query ? `
                                    <div class="query-code">
                                        <pre><code class="language-kql">${this.escapeHtml(query.query)}</code></pre>
                                        <button onclick="app.copyQuery(\`${this.escapeJs(query.query)}\`)" class="copy-btn">Copy</button>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : '<p>No queries available for this scenario.</p>'}
            </div>
        `;
        
        modal.style.display = 'block';
    }

    closeModal() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.style.display = 'none');
    }

    copyQuery(query) {
        navigator.clipboard.writeText(query).then(() => {
            this.showNotification('Query copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy query:', err);
            this.showNotification('Failed to copy query', 'error');
        });
    }

    addToRecentQueries(scenario) {
        // Remove if already exists
        this.recentQueries = this.recentQueries.filter(q => q.id !== scenario.id);
        
        // Add to beginning
        this.recentQueries.unshift({
            id: scenario.id,
            title: scenario.title,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 10
        this.recentQueries = this.recentQueries.slice(0, 10);
        
        // Save to localStorage
        localStorage.setItem('recentQueries', JSON.stringify(this.recentQueries));
        
        // Update UI
        this.renderRecentQueries();
    }

    renderRecentQueries() {
        const container = document.getElementById('recentQueries');
        if (!container) return;

        if (this.recentQueries.length === 0) {
            container.innerHTML = '<p>No recent queries</p>';
            return;
        }

        const html = this.recentQueries.map(query => `
            <div class="recent-query" onclick="app.viewScenario('${query.id}')">
                <span>${this.escapeHtml(query.title)}</span>
                <small>${new Date(query.timestamp).toLocaleDateString()}</small>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    loadSyntaxHighlighter() {
        // Load Prism.js for syntax highlighting if not already loaded
        if (!window.Prism) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/themes/prism.min.css';
            document.head.appendChild(link);

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/components/prism-core.min.js';
            script.onload = () => {
                const kqlScript = document.createElement('script');
                kqlScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/components/prism-sql.min.js';
                document.head.appendChild(kqlScript);
            };
            document.head.appendChild(script);
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    escapeJs(text) {
        return text.replace(/`/g, '\\`').replace(/\$/g, '\\$');
    }

    // Placeholder methods for additional functionality
    addQuery() {
        console.log('Add query functionality to be implemented');
    }

    exportCheatSheet() {
        console.log('Export functionality to be implemented');
    }

    importCheatSheet() {
        console.log('Import functionality to be implemented');
    }

    saveCheatSheet() {
        console.log('Save functionality to be implemented');
    }

    populateEditForm(scenario) {
        console.log('Edit form population to be implemented');
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM loaded, starting DiagnostIQ...');
    window.app = new QueryLibraryApp();
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QueryLibraryApp;
}
