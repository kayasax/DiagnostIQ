// DEBUG: Test category dropdown population

function debugCategoryDropdown() {
    console.log('🧪 Testing category dropdown population...');
    
    // Check elements
    const filterDropdown = document.getElementById('categoryFilter');
    const formDropdown = document.getElementById('category');
    
    console.log('📊 Element check:');
    console.log('  categoryFilter (filter dropdown):', filterDropdown ? 'Found' : 'Not found');
    console.log('  category (form dropdown):', formDropdown ? 'Found' : 'Not found');
    
    // Check dataManager
    console.log('📊 DataManager check:');
    console.log('  window.dataManager:', window.dataManager ? 'Available' : 'Not available');
    
    if (window.dataManager) {
        const categories = window.dataManager.getAvailableCategories();
        console.log('  Categories available:', categories.length);
        console.log('  First 3 categories:', categories.slice(0, 3));
    }
    
    // Test form dropdown population
    if (formDropdown && window.dataManager) {
        console.log('🔧 Testing form dropdown population...');
        
        try {
            // Get categories
            const categories = window.dataManager.getAvailableCategories();
            
            // Clear and populate
            formDropdown.innerHTML = '<option value="">Select a category...</option>';
            
            categories.sort((a, b) => a.displayName.localeCompare(b.displayName));
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = `${category.displayName} (${category.count})`;
                formDropdown.appendChild(option);
            });
            
            console.log(`✅ Successfully populated form dropdown with ${categories.length} categories`);
            console.log(`📊 Form dropdown now has ${formDropdown.options.length} options`);
            
            // List first few options
            const optionsList = Array.from(formDropdown.options).slice(0, 5).map(opt => opt.textContent);
            console.log('📋 First 5 options:', optionsList);
            
        } catch (error) {
            console.error('❌ Error populating form dropdown:', error);
        }
    } else {
        console.error('❌ Cannot test - missing form dropdown or dataManager');
    }
}

function debugFilterDropdown() {
    console.log('🧪 Testing filter dropdown population...');
    
    const filterDropdown = document.getElementById('categoryFilter');
    
    if (filterDropdown && window.dataManager) {
        console.log('📊 Filter dropdown current options:', filterDropdown.options.length);
        
        const optionsList = Array.from(filterDropdown.options).slice(0, 5).map(opt => opt.textContent);
        console.log('📋 First 5 filter options:', optionsList);
    } else {
        console.error('❌ Cannot test filter dropdown - missing element or dataManager');
    }
}

function testEditModalCategoryPopulation() {
    console.log('🧪 Testing edit modal category population...');
    
    // Check if app is available
    if (!window.app) {
        console.error('❌ window.app not available');
        return;
    }
    
    // Test the method directly
    if (typeof window.app.populateFormCategoryDropdown === 'function') {
        console.log('🔧 Calling populateFormCategoryDropdown directly...');
        window.app.populateFormCategoryDropdown();
    } else {
        console.error('❌ populateFormCategoryDropdown method not found on window.app');
    }
}

// Add to window for easy testing
window.debugCategoryDropdown = debugCategoryDropdown;
window.debugFilterDropdown = debugFilterDropdown;
window.testEditModalCategoryPopulation = testEditModalCategoryPopulation;

console.log('🧪 Category dropdown debug functions loaded:');
console.log('  debugCategoryDropdown() - Test both dropdowns');
console.log('  debugFilterDropdown() - Test filter dropdown only');
console.log('  testEditModalCategoryPopulation() - Test edit modal method');

// Auto-run basic test
debugCategoryDropdown();
