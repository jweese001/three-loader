/**
 * ProjectDialog - Startup dialog for project folder selection and initialization
 * Handles the initial project setup workflow when the app starts
 */

export class ProjectDialog {
    constructor(projectManager) {
        this.projectManager = projectManager;
        this.dialog = null;
        this.overlay = null;
        this.onComplete = null;

        this.createDialog();
    }

    /**
     * Create the project dialog HTML structure
     */
    createDialog() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'project-dialog-overlay';
        this.overlay.innerHTML = `
            <div class="project-dialog">
                <div class="project-dialog-header">
                    <h2>🎯 Welcome to 3/LOADER</h2>
                    <p>Let's set up your workspace for consistent asset management</p>
                </div>

                <div class="project-dialog-content">
                    <div class="project-option" id="new-project-option">
                        <div class="option-icon">📁</div>
                        <div class="option-details">
                            <h3>Create New Project</h3>
                            <p>Set up a new project folder with organized asset structure</p>
                            <small>Recommended: Creates ~/Documents/3Loader-Projects/</small>
                        </div>
                        <button id="create-project-btn" class="option-button primary">Create Project</button>
                    </div>

                    <div class="project-option" id="existing-project-option">
                        <div class="option-icon">🔍</div>
                        <div class="option-details">
                            <h3>Open Existing Project</h3>
                            <p>Select an existing 3/LOADER project folder</p>
                            <small>Choose a folder with textures/, models/, projects/ subfolders</small>
                        </div>
                        <button id="open-project-btn" class="option-button secondary">Browse Folder</button>
                    </div>
                </div>

                <div class="project-dialog-footer">
                    <div class="project-status" id="project-status">
                        <span class="status-icon">⏳</span>
                        <span class="status-text">Project setup is required for proper asset management</span>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        this.addStyles();

        // Add event listeners
        this.setupEventListeners();
    }

    /**
     * Add CSS styles for the dialog
     */
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .project-dialog-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.9);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(4px);
            }

            .project-dialog {
                background: var(--bg-primary, #1a1a1a);
                border: 1px solid var(--border-color, #333);
                border-radius: 8px;
                max-width: 600px;
                width: 90vw;
                max-height: 80vh;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
            }

            .project-dialog-header {
                padding: 2rem;
                border-bottom: 1px solid var(--border-color, #333);
                text-align: center;
            }

            .project-dialog-header h2 {
                margin: 0 0 0.5rem 0;
                color: var(--text-primary, #ffffff);
                font-size: 1.5rem;
            }

            .project-dialog-header p {
                margin: 0;
                color: var(--text-secondary, #aaaaaa);
                font-size: 0.9rem;
            }

            .project-dialog-content {
                padding: 2rem;
            }

            .project-option {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1.5rem;
                border: 1px solid var(--border-color, #333);
                border-radius: 6px;
                margin-bottom: 1rem;
                transition: all 0.2s ease;
                cursor: pointer;
            }

            .project-option:hover {
                border-color: var(--accent-color, #007acc);
                background: rgba(0, 122, 204, 0.05);
            }

            .option-icon {
                font-size: 2rem;
                width: 60px;
                text-align: center;
            }

            .option-details {
                flex: 1;
            }

            .option-details h3 {
                margin: 0 0 0.5rem 0;
                color: var(--text-primary, #ffffff);
                font-size: 1.1rem;
            }

            .option-details p {
                margin: 0 0 0.25rem 0;
                color: var(--text-secondary, #aaaaaa);
                font-size: 0.9rem;
            }

            .option-details small {
                color: var(--text-tertiary, #888888);
                font-size: 0.8rem;
            }

            .option-button {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 4px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 0.9rem;
            }

            .option-button.primary {
                background: var(--accent-color, #007acc);
                color: white;
            }

            .option-button.primary:hover {
                background: var(--accent-hover, #005a9e);
            }

            .option-button.secondary {
                background: var(--bg-secondary, #333);
                color: var(--text-primary, #ffffff);
                border: 1px solid var(--border-color, #555);
            }

            .option-button.secondary:hover {
                background: var(--bg-tertiary, #444);
            }

            .project-dialog-footer {
                padding: 1.5rem 2rem;
                border-top: 1px solid var(--border-color, #333);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .project-status {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: var(--text-secondary, #aaaaaa);
                font-size: 0.9rem;
            }

            .status-icon {
                font-size: 1rem;
            }

            .skip-button {
                background: none;
                border: none;
                color: var(--text-tertiary, #888);
                cursor: pointer;
                font-size: 0.8rem;
                padding: 0.5rem 1rem;
                text-decoration: underline;
            }

            .skip-button:hover {
                color: var(--text-secondary, #aaa);
            }

            .project-status.success .status-icon {
                color: #00ff00;
            }

            .project-status.error .status-icon {
                color: #ff4444;
            }

            .project-status.loading .status-icon {
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * Set up event listeners for dialog interactions
     */
    setupEventListeners() {
        // Create new project
        this.overlay.querySelector('#create-project-btn').addEventListener('click', () => {
            this.handleCreateProject();
        });

        // Open existing project
        this.overlay.querySelector('#open-project-btn').addEventListener('click', () => {
            this.handleOpenProject();
        });


        // Click on option areas to trigger buttons
        this.overlay.querySelector('#new-project-option').addEventListener('click', (e) => {
            if (e.target.closest('.option-button')) return;
            this.handleCreateProject();
        });

        this.overlay.querySelector('#existing-project-option').addEventListener('click', (e) => {
            if (e.target.closest('.option-button')) return;
            this.handleOpenProject();
        });
    }

    /**
     * Handle create new project workflow
     */
    async handleCreateProject() {
        try {
            this.updateStatus('loading', 'Creating project structure...');

            const success = await this.projectManager.createNewProject();

            if (success) {
                this.updateStatus('success', 'Project created successfully!');
                this.saveProjectLocation();
                setTimeout(() => this.complete(true), 1000);
            } else {
                this.updateStatus('error', 'Project creation cancelled');
            }

        } catch (error) {
            console.error('Failed to create project:', error);
            this.updateStatus('error', `Failed to create project: ${error.message}`);
        }
    }

    /**
     * Handle open existing project workflow
     */
    async handleOpenProject() {
        try {
            this.updateStatus('loading', 'Opening project folder...');

            const success = await this.projectManager.openExistingProject();

            if (success) {
                this.updateStatus('success', 'Project opened successfully!');
                this.saveProjectLocation();
                setTimeout(() => this.complete(true), 1000);
            } else {
                this.updateStatus('error', 'Project opening cancelled');
            }

        } catch (error) {
            console.error('Failed to open project:', error);
            this.updateStatus('error', `Failed to open project: ${error.message}`);
        }
    }


    /**
     * Update status display
     */
    updateStatus(type, message) {
        const statusElement = this.overlay.querySelector('#project-status');
        const iconElement = statusElement.querySelector('.status-icon');
        const textElement = statusElement.querySelector('.status-text');

        statusElement.className = `project-status ${type}`;

        switch (type) {
            case 'loading':
                iconElement.textContent = '⏳';
                break;
            case 'success':
                iconElement.textContent = '✅';
                break;
            case 'error':
                iconElement.textContent = '❌';
                break;
            default:
                iconElement.textContent = '⏳';
        }

        textElement.textContent = message;
    }

    /**
     * Save project location to localStorage
     */
    saveProjectLocation() {
        if (this.projectManager.isInitialized()) {
            localStorage.setItem('3loader-project-initialized', 'true');
            localStorage.setItem('3loader-project-timestamp', new Date().toISOString());
            console.log('💾 Project location saved to localStorage');
        }
    }

    /**
     * Show the dialog
     */
    show() {
        return new Promise((resolve) => {
            this.onComplete = resolve;
            document.body.appendChild(this.overlay);
            console.log('📁 Project dialog shown');
        });
    }

    /**
     * Complete dialog workflow
     */
    complete(success) {
        if (this.onComplete) {
            this.onComplete(success);
        }
        this.hide();
    }

    /**
     * Hide the dialog
     */
    hide() {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
            console.log('📁 Project dialog hidden');
        }
    }

    /**
     * Check if project setup should be skipped (already initialized)
     */
    static shouldSkipDialog() {
        const initialized = localStorage.getItem('3loader-project-initialized');
        const timestamp = localStorage.getItem('3loader-project-timestamp');

        if (initialized === 'true' && timestamp) {
            const lastInit = new Date(timestamp);
            const daysSince = (Date.now() - lastInit.getTime()) / (1000 * 60 * 60 * 24);

            // Skip if initialized within the last 7 days
            return daysSince < 7;
        }

        return false;
    }
}