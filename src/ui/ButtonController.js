/**
 * Simple, robust button controller to fix recurring UI toggle issues
 */
export class ButtonController {
    constructor() {
        this.isUIHidden = false;
        this.currentView = 'studio';
        this.init();
    }
    
    init() {
        // Ensure DOM is ready before setting up buttons
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupButtons());
        } else {
            this.setupButtons();
        }
    }
    
    setupButtons() {
        console.log('🔘 Setting up button controls...');
        
        // Retry button setup with timeout if DOM isn't ready
        let attempts = 0;
        const maxAttempts = 10;
        
        const trySetupButtons = () => {
            attempts++;
            console.log(`🔄 Button setup attempt ${attempts}/${maxAttempts}`);
            
            const success = this.setupUIToggle() && this.setupViewToggle();
            
            if (!success && attempts < maxAttempts) {
                console.log('⏳ Buttons not ready, retrying in 500ms...');
                setTimeout(trySetupButtons, 500);
            } else if (success) {
                console.log('✅ All buttons setup successfully');
            } else {
                console.error('❌ Failed to setup buttons after maximum attempts');
                this.debugDOM();
            }
        };
        
        trySetupButtons();
    }
    
    setupUIToggle() {
        const toggleUIBtn = document.getElementById('toggle-ui-btn');
        const appContainer = document.querySelector('.app-container');
        
        console.log('🔍 UI Toggle - Button found:', !!toggleUIBtn);
        console.log('🔍 UI Toggle - Container found:', !!appContainer);
        
        if (!toggleUIBtn || !appContainer) {
            return false;
        }
        
        // Remove any existing listeners
        const newBtn = toggleUIBtn.cloneNode(true);
        toggleUIBtn.parentNode.replaceChild(newBtn, toggleUIBtn);
        
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🖱️ UI Toggle clicked!');
            
            this.isUIHidden = !this.isUIHidden;
            
            if (this.isUIHidden) {
                console.log('🙈 Hiding UI');
                appContainer.classList.add('ui-hidden');
                newBtn.textContent = 'Show UI';
                newBtn.title = 'Show UI (H)';
            } else {
                console.log('👁️ Showing UI');
                appContainer.classList.remove('ui-hidden');
                newBtn.textContent = 'Hide UI';
                newBtn.title = 'Hide UI (H)';
            }
            
            // Trigger resize after UI change
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        });
        
        // Add keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.key === 'h' || e.key === 'H') {
                // Only trigger if not in an input field
                if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
                    e.preventDefault();
                    newBtn.click();
                }
            }
        });
        
        console.log('✅ UI toggle button setup complete');
        return true;
    }
    
    setupViewToggle() {
        const viewToggleBtn = document.getElementById('view-toggle-btn');
        const studioView = document.querySelector('.app-main');
        const codeView = document.querySelector('.code-editor-view');
        
        console.log('🔍 View Toggle - Button found:', !!viewToggleBtn);
        console.log('🔍 View Toggle - Studio view found:', !!studioView);
        console.log('🔍 View Toggle - Code view found:', !!codeView);
        
        if (!viewToggleBtn) {
            console.warn('⚠️ View toggle button not found, view switching disabled');
            return true; // Don't fail if code view isn't implemented
        }
        
        // Remove any existing listeners
        const newBtn = viewToggleBtn.cloneNode(true);
        viewToggleBtn.parentNode.replaceChild(newBtn, viewToggleBtn);
        
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🖱️ View Toggle clicked! Current view:', this.currentView);
            
            const newView = this.currentView === 'studio' ? 'code' : 'studio';
            this.switchToView(newView);
        });
        
        console.log('✅ View toggle button setup complete');
        return true;
    }
    
    switchToView(view) {
        console.log('🔄 Switching to view:', view);
        
        const studioView = document.querySelector('.app-main');
        const codeView = document.querySelector('.code-editor-view');
        const viewToggleBtn = document.getElementById('view-toggle-btn');
        
        this.currentView = view;
        
        if (view === 'code') {
            if (studioView) studioView.style.display = 'none';
            if (codeView) codeView.style.display = 'flex';
            if (viewToggleBtn) viewToggleBtn.textContent = 'Studio';
        } else {
            if (studioView) studioView.style.display = 'flex';
            if (codeView) codeView.style.display = 'none';
            if (viewToggleBtn) viewToggleBtn.textContent = 'Code';
        }
        
        // Trigger resize after view change
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
        
        console.log('✅ View switched to:', view);
    }
    
    debugDOM() {
        console.log('🔍 DOM Debug Info:');
        console.log('- Document ready state:', document.readyState);
        console.log('- All elements with IDs:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
        console.log('- All buttons:', Array.from(document.querySelectorAll('button')).map(btn => ({
            id: btn.id,
            text: btn.textContent.trim(),
            classes: btn.className
        })));
        console.log('- App container:', document.querySelector('.app-container'));
        console.log('- Main view:', document.querySelector('.app-main'));
        console.log('- Code view:', document.querySelector('.code-editor-view'));
    }
    
    // Public API for manual control
    toggleUI() {
        const toggleBtn = document.getElementById('toggle-ui-btn');
        if (toggleBtn) {
            toggleBtn.click();
        }
    }
    
    switchView() {
        const viewBtn = document.getElementById('view-toggle-btn');
        if (viewBtn) {
            viewBtn.click();
        }
    }
}