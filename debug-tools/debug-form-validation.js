// QUICK TEST: Form validation debug

function testFormValidation() {
    console.log('🧪 Testing form validation...');
    
    // Check form existence
    const form = document.getElementById('cheatSheetForm');
    console.log('📋 Form found:', !!form);
    
    if (!form) {
        console.error('❌ Form not found!');
        return;
    }
    
    // Check form fields
    const titleField = document.getElementById('title');
    const categoryField = document.getElementById('category');
    
    console.log('📋 Form fields:', {
        title: !!titleField,
        category: !!categoryField,
        titleValue: titleField?.value,
        categoryValue: categoryField?.value,
        titleName: titleField?.name,
        categoryName: categoryField?.name
    });
    
    // Test FormData extraction
    try {
        const formData = new FormData(form);
        console.log('📊 FormData extraction test:');
        console.log('  title:', formData.get('title'));
        console.log('  category:', formData.get('category'));
        console.log('  description:', formData.get('description'));
        console.log('  cluster:', formData.get('cluster'));
        console.log('  database:', formData.get('database'));
        console.log('  steps:', formData.get('steps'));
        
        // Check if validation would pass
        const title = formData.get('title')?.trim();
        const category = formData.get('category');
        
        console.log('✅ Validation check:');
        console.log('  title valid:', !!title);
        console.log('  category valid:', !!category);
        console.log('  would pass:', !!(title && category));
        
    } catch (error) {
        console.error('❌ FormData extraction failed:', error);
    }
}

function fillTestData() {
    console.log('🧪 Filling test data...');
    
    const titleField = document.getElementById('title');
    const categoryField = document.getElementById('category');
    const descriptionField = document.getElementById('description');
    
    if (titleField) titleField.value = 'Test Scenario Title';
    if (descriptionField) descriptionField.value = 'Test description for validation';
    
    if (categoryField) {
        // Try to select the first available category
        if (categoryField.options.length > 1) {
            categoryField.selectedIndex = 1; // Skip the "Select a category..." option
            console.log('✅ Selected category:', categoryField.value);
        } else {
            console.log('❌ No categories available in dropdown');
        }
    }
    
    console.log('✅ Test data filled');
    testFormValidation();
}

// Add to window
window.testFormValidation = testFormValidation;
window.fillTestData = fillTestData;

console.log('🧪 Form validation test functions loaded:');
console.log('  testFormValidation() - Check current form state');
console.log('  fillTestData() - Fill form with test data and validate');

// Auto-run test
testFormValidation();
