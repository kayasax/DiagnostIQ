// QUICK TEST: Vertical Toggle Functionality

function testVerticalToggle() {
    console.log('🧪 Testing vertical toggle functionality...');
    
    // Find all vertical sections
    const verticalSections = document.querySelectorAll('.vertical-section');
    console.log(`📊 Found ${verticalSections.length} vertical sections`);
    
    if (verticalSections.length === 0) {
        console.error('❌ No vertical sections found. Navigation may not be loaded yet.');
        return;
    }
    
    // Test each vertical section
    verticalSections.forEach((section, index) => {
        const header = section.querySelector('.vertical-header');
        const categories = section.querySelector('.vertical-categories');
        const arrow = section.querySelector('.vertical-arrow');
        
        if (header && categories && arrow) {
            const onclickAttr = header.getAttribute('onclick');
            const verticalKey = onclickAttr ? onclickAttr.match(/toggleVertical\('([^']+)'\)/)?.[1] : null;
            
            console.log(`📁 Vertical ${index + 1}:`, {
                key: verticalKey,
                arrow: arrow.textContent,
                categoriesVisible: categories.style.display !== 'none',
                onclick: onclickAttr
            });
        } else {
            console.error(`❌ Vertical ${index + 1} missing elements:`, {
                header: !!header,
                categories: !!categories,
                arrow: !!arrow
            });
        }
    });
    
    // Test the toggleVertical function
    console.log('🔧 Testing toggleVertical function availability:');
    console.log('  window.toggleVertical:', typeof window.toggleVertical);
    console.log('  window.app.toggleVertical:', typeof window.app?.toggleVertical);
    
    // Test toggle on first vertical if available
    const firstVertical = verticalSections[0];
    if (firstVertical) {
        const header = firstVertical.querySelector('.vertical-header');
        const onclickAttr = header?.getAttribute('onclick');
        const verticalKey = onclickAttr ? onclickAttr.match(/toggleVertical\('([^']+)'\)/)?.[1] : null;
        
        if (verticalKey && typeof window.toggleVertical === 'function') {
            console.log(`🧪 Testing toggle on first vertical: ${verticalKey}`);
            
            try {
                // Test collapse
                window.toggleVertical(verticalKey);
                
                setTimeout(() => {
                    // Test expand
                    window.toggleVertical(verticalKey);
                    console.log('✅ Toggle test completed successfully');
                }, 1000);
                
            } catch (error) {
                console.error('❌ Toggle test failed:', error);
            }
        } else {
            console.error('❌ Cannot test toggle:', {
                verticalKey,
                functionAvailable: typeof window.toggleVertical
            });
        }
    }
}

function testClickFirstVertical() {
    console.log('🧪 Testing click on first vertical header...');
    
    const firstHeader = document.querySelector('.vertical-header');
    if (firstHeader) {
        console.log('🖱️ Clicking first vertical header...');
        firstHeader.click();
    } else {
        console.error('❌ No vertical header found');
    }
}

// Add to window for easy testing
window.testVerticalToggle = testVerticalToggle;
window.testClickFirstVertical = testClickFirstVertical;

console.log('🧪 Vertical toggle test functions loaded:');
console.log('  testVerticalToggle() - Test all vertical sections');
console.log('  testClickFirstVertical() - Click first vertical header');

// Auto-run test after a short delay to ensure DOM is ready
setTimeout(() => {
    testVerticalToggle();
}, 2000);
