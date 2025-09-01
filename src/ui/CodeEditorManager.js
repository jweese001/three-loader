import * as monaco from 'monaco-editor';
import { CodeCompiler } from '../codegen/CodeCompiler.js';
import { LiveUpdateManager } from '../codegen/LiveUpdateManager.js';

export class CodeEditorManager {
    constructor(config) {
        this.scene = config.scene;
        this.objectManager = config.objectManager;
        this.exportManager = config.exportManager;
        this.uiController = config.uiController;
        
        this.editor = null;
        this.fullscreenEditor = null;
        this.currentCode = '';
        this.isUpdatingFromUI = false;
        this.isUpdatingFromCode = false;
        this.currentView = 'studio';
        
        // Live compilation system (Phase 2)
        this.codeCompiler = new CodeCompiler(this.scene, this.objectManager);
        this.liveUpdateManager = new LiveUpdateManager(this.scene, this.objectManager, this.codeCompiler);
        this.liveUpdatesEnabled = true;
        
        this.init();
        console.log('💻 CodeEditorManager initialized');
    }
    
    async init() {
        console.log('💻 CodeEditorManager init starting...');
        
        // Temporarily skip Monaco setup to isolate the view switching issue
        try {
            await this.setupMonacoEditor();
        } catch (error) {
            console.error('❌ Monaco setup failed:', error);
            console.log('⚠️ Continuing without Monaco editor...');
        }
        
        this.setupControls();
        this.setupViewSwitching(); // Setup after all DOM elements are ready
        this.syncFromUI(); // Initialize with current scene state
        
        console.log('💻 CodeEditorManager init completed');
    }
    
    async setupMonacoEditor() {
        await this.setupSidebarEditor();
        await this.setupFullscreenEditor();
    }
    
    async setupSidebarEditor() {
        const container = document.getElementById('monaco-editor-container');
        
        // Skip sidebar editor setup if container doesn't exist (removed from UI)
        if (!container) {
            console.log('💻 Sidebar editor container not found, skipping sidebar editor setup');
            return;
        }
        
        // Configure Monaco for JavaScript
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2020,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.ESNext,
            noEmit: true,
            esModuleInterop: true,
            jsx: monaco.languages.typescript.JsxEmit.React,
            allowJs: true,
            typeRoots: ['node_modules/@types']
        });
        
        // Create the sidebar editor
        this.editor = monaco.editor.create(container, {
            value: '// Your Three.js scene code will appear here...\n// Load an OBJ file or sync from UI to get started',
            language: 'javascript',
            theme: 'vs-dark',
            fontSize: 12,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            minimap: { enabled: true },
            automaticLayout: true,
            folding: true,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true
        });
        
        // Listen for code changes
        this.editor.onDidChangeModelContent(() => {
            if (!this.isUpdatingFromUI) {
                this.currentCode = this.editor.getValue();
                this.syncEditors();
                console.log('💻 Code changed by user');
            }
        });
        
        console.log('💻 Monaco Sidebar Editor setup complete');
    }
    
    async setupFullscreenEditor() {
        const container = document.getElementById('monaco-editor-fullscreen');
        
        if (!container) {
            console.error('❌ Fullscreen editor container not found!');
            return;
        }
        
        console.log('✅ Fullscreen editor container found:', container);
        
        // Create the fullscreen editor
        this.fullscreenEditor = monaco.editor.create(container, {
            value: '// Your Three.js scene code will appear here...\n// Load an OBJ file or sync from UI to get started',
            language: 'javascript',
            theme: 'vs-dark',
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            minimap: { enabled: true },
            automaticLayout: true,
            folding: true,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true
        });
        
        // Listen for code changes in fullscreen editor
        this.fullscreenEditor.onDidChangeModelContent(() => {
            if (!this.isUpdatingFromUI) {
                this.currentCode = this.fullscreenEditor.getValue();
                this.syncEditors();
                console.log('💻 Fullscreen code changed by user');
                
                // Phase 2: Trigger live compilation if enabled
                if (this.liveUpdatesEnabled && this.currentView === 'code') {
                    // LiveUpdateManager handles debouncing automatically
                    console.log('⚡ Triggering live compilation...');
                }
            }
        });
        
        console.log('💻 Monaco Fullscreen Editor setup complete');
    }
    
    syncEditors() {
        // Keep both editors in sync (if both exist)
        this.isUpdatingFromUI = true;
        try {
            if (this.editor && this.fullscreenEditor) {
                const activeEditor = this.currentView === 'code' ? this.fullscreenEditor : this.editor;
                const otherEditor = this.currentView === 'code' ? this.editor : this.fullscreenEditor;
                
                if (otherEditor.getValue() !== activeEditor.getValue()) {
                    otherEditor.setValue(activeEditor.getValue());
                }
            } else if (this.fullscreenEditor && !this.editor) {
                // Only fullscreen editor exists, no syncing needed
                console.log('💻 Only fullscreen editor exists, no sync needed');
            }
        } finally {
            this.isUpdatingFromUI = false;
        }
    }
    
    setupViewSwitching() {
        // View toggle button
        const viewToggleBtn = document.getElementById('view-toggle-btn');
        
        if (!viewToggleBtn) {
            console.error('❌ View toggle button not found!');
            return;
        }
        
        console.log('✅ View toggle button found:', viewToggleBtn);
        
        viewToggleBtn.addEventListener('click', () => {
            console.log('🔄 View button clicked! Current view:', this.currentView);
            const newView = this.currentView === 'studio' ? 'code' : 'studio';
            console.log('🔄 Switching to view:', newView);
            this.switchToView(newView);
        });
        
        console.log('💻 View switching setup complete');
    }
    
    switchToView(view) {
        console.log('🔄 switchToView called with:', view);
        this.currentView = view;
        
        const studioView = document.querySelector('.app-main');
        const codeView = document.querySelector('.code-editor-view');
        const viewToggleBtn = document.getElementById('view-toggle-btn');
        
        console.log('🔍 DOM elements found:', {
            studioView: !!studioView,
            codeView: !!codeView,
            viewToggleBtn: !!viewToggleBtn
        });
        
        if (view === 'code') {
            // Switch to code editor view
            studioView.style.display = 'none';
            codeView.style.display = 'flex';
            viewToggleBtn.textContent = 'View';
            
            // Initialize scene in code view if needed
            this.initCodeViewScene();
            
            // Sync current code to fullscreen editor (if sidebar editor exists)
            if (this.editor && this.fullscreenEditor) {
                this.fullscreenEditor.setValue(this.editor.getValue());
            } else if (this.fullscreenEditor && !this.editor) {
                // Only fullscreen editor exists, keep current code
                console.log('💻 Using fullscreen editor only, keeping existing code');
            }
            
            // Layout the fullscreen editor
            setTimeout(() => {
                if (this.fullscreenEditor) {
                    this.fullscreenEditor.layout();
                    
                    // Phase 2: Start live updates when entering code view
                    if (this.liveUpdatesEnabled) {
                        this.liveUpdateManager.startLiveUpdates(this.fullscreenEditor);
                        console.log('⚡ Live updates started for code view');
                    }
                }
            }, 100);
            
        } else {
            // Switch to studio view
            codeView.style.display = 'none';
            studioView.style.display = 'flex';
            viewToggleBtn.textContent = 'View';
            
            // Phase 2: Stop live updates when leaving code view
            if (this.liveUpdatesEnabled) {
                this.liveUpdateManager.stopLiveUpdates();
                console.log('⏹️ Live updates stopped for studio view');
            }
            
            // Return scene to studio viewport
            this.returnSceneToStudio();
        }
        
        console.log(`🔄 Switched to ${view} view`);
    }
    
    initCodeViewScene() {
        const codeViewport = document.getElementById('viewport-code');
        const mainViewport = document.getElementById('viewport');
        
        // Move the scene renderer to the code viewport
        if (this.scene && this.scene.renderer) {
            const rendererElement = this.scene.renderer.domElement;
            codeViewport.appendChild(rendererElement);
            
            // Update the scene's container reference
            this.scene.container = codeViewport;
            
            // Update renderer size for new container
            setTimeout(() => {
                if (this.scene) {
                    this.scene.handleResize();
                }
            }, 100);
        }
    }
    
    returnSceneToStudio() {
        const mainViewport = document.getElementById('viewport');
        
        // Move the scene renderer back to main viewport
        if (this.scene && this.scene.renderer) {
            const rendererElement = this.scene.renderer.domElement;
            mainViewport.appendChild(rendererElement);
            
            // Update the scene's container reference back to main viewport
            this.scene.container = mainViewport;
            
            // Update renderer size for original container
            setTimeout(() => {
                if (this.scene) {
                    this.scene.handleResize();
                }
            }, 100);
        }
    }
    
    setupControls() {
        this.setupSidebarControls();
        this.setupFullscreenControls();
    }
    
    setupSidebarControls() {
        // Skip sidebar controls setup if elements don't exist (sidebar panel removed)
        const saveBtn = document.getElementById('save-scene-btn');
        if (!saveBtn) {
            console.log('💻 Sidebar controls not found, skipping sidebar controls setup');
            return;
        }
        
        saveBtn.addEventListener('click', () => {
            this.saveSceneFile();
        });
        
        // Load scene button
        const loadBtn = document.getElementById('load-scene-btn');
        const fileInput = document.getElementById('scene-file-input');
        
        loadBtn.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                this.loadSceneFile(file);
            }
        });
        
        // Sync from UI button
        const syncFromUIBtn = document.getElementById('sync-from-ui-btn');
        syncFromUIBtn.addEventListener('click', () => {
            this.syncFromUI();
        });
        
        // Sync to UI button
        const syncToUIBtn = document.getElementById('sync-to-ui-btn');
        syncToUIBtn.addEventListener('click', () => {
            this.syncToUI();
        });
        
        console.log('💻 Sidebar controls setup complete');
    }
    
    setupFullscreenControls() {
        // Fullscreen editor controls
        const saveCodeBtn = document.getElementById('save-scene-code-btn');
        const loadCodeBtn = document.getElementById('load-scene-code-btn');
        const syncFromUICodeBtn = document.getElementById('sync-from-ui-code-btn');
        const syncToUICodeBtn = document.getElementById('sync-to-ui-code-btn');
        const fileCodeInput = document.getElementById('scene-file-code-input');
        
        saveCodeBtn.addEventListener('click', () => {
            this.saveSceneFile();
        });
        
        loadCodeBtn.addEventListener('click', () => {
            fileCodeInput.click();
        });
        
        fileCodeInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                this.loadSceneFile(file);
            }
        });
        
        syncFromUICodeBtn.addEventListener('click', () => {
            this.syncFromUI();
        });
        
        syncToUICodeBtn.addEventListener('click', () => {
            this.syncToUI();
        });
        
        // Scene controls in code view
        const resetCameraCodeBtn = document.getElementById('reset-camera-code-btn');
        const wireframeToggleCodeBtn = document.getElementById('wireframe-toggle-code-btn');
        const fullscreenSceneBtn = document.getElementById('fullscreen-scene-btn');
        
        resetCameraCodeBtn.addEventListener('click', () => {
            if (this.scene) {
                this.scene.resetCamera();
            }
        });
        
        wireframeToggleCodeBtn.addEventListener('click', () => {
            // Toggle wireframe for all objects
            if (this.objectManager) {
                this.objectManager.toggleWireframeAll();
            }
        });
        
        fullscreenSceneBtn.addEventListener('click', () => {
            const scenePanel = document.querySelector('.scene-panel');
            if (!document.fullscreenElement) {
                scenePanel.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });
        
        console.log('💻 Fullscreen controls setup complete');
    }
    
    syncFromUI() {
        if (this.isUpdatingFromCode) return;
        
        this.isUpdatingFromUI = true;
        
        try {
            // Generate fresh editable code from current UI state (NEW!)
            const code = this.exportManager.generateEditableCode({
                includeComments: true,
                includeImports: true,
                includeAnimation: true
            });
            this.currentCode = code;
            
            if (this.editor) {
                this.editor.setValue(code);
            }
            if (this.fullscreenEditor) {
                this.fullscreenEditor.setValue(code);
            }
            
            console.log('⬇️ Editable code updated from UI state');
        } catch (error) {
            console.error('❌ Failed to sync from UI:', error);
        } finally {
            this.isUpdatingFromUI = false;
        }
    }
    
    /**
     * Generate live editable code with different options
     * @param {string} exportType - 'educational', 'compact', 'standard', 'editable'
     */
    generateLiveCode(exportType = 'editable') {
        const exportOptions = this.exportManager.getExportOptions();
        
        if (!exportOptions[exportType]) {
            console.warn(`❌ Unknown export type: ${exportType}. Using 'editable' as fallback.`);
            exportType = 'editable';
        }
        
        const code = exportOptions[exportType].generate();
        this.currentCode = code;
        
        // Update editors
        this.isUpdatingFromUI = true;
        try {
            if (this.editor) {
                this.editor.setValue(code);
            }
            if (this.fullscreenEditor) {
                this.fullscreenEditor.setValue(code);
            }
            console.log(`🔧 ${exportOptions[exportType].name} code generated`);
        } finally {
            this.isUpdatingFromUI = false;
        }
        
        return code;
    }
    
    async syncToUI() {
        if (this.isUpdatingFromUI) return;
        
        this.isUpdatingFromCode = true;
        
        try {
            const activeEditor = this.currentView === 'code' ? this.fullscreenEditor : this.editor;
            const code = activeEditor.getValue();
            
            // Parse the code to extract scene data
            const sceneData = this.parseSceneCode(code);
            
            if (sceneData) {
                // Apply parsed data to UI
                await this.applySceneDataToUI(sceneData);
                console.log('⬆️ UI updated from code');
            } else {
                alert('Unable to parse scene code. Please check the code format.');
            }
        } catch (error) {
            console.error('❌ Failed to sync to UI:', error);
            alert(`Failed to apply code to UI: ${error.message}`);
        } finally {
            this.isUpdatingFromCode = false;
        }
    }
    
    saveSceneFile() {
        try {
            const code = this.editor.getValue();
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `three-scene-${timestamp}.js`;
            
            const blob = new Blob([code], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            
            URL.revokeObjectURL(url);
            
            console.log('💾 Scene saved:', filename);
        } catch (error) {
            console.error('❌ Failed to save scene:', error);
            alert(`Failed to save scene: ${error.message}`);
        }
    }
    
    async loadSceneFile(file) {
        try {
            const code = await this.readFileAsText(file);
            
            if (this.editor) {
                this.editor.setValue(code);
            }
            if (this.fullscreenEditor) {
                this.fullscreenEditor.setValue(code);
            }
            
            this.currentCode = code;
            
            // Optionally auto-sync to UI
            if (confirm('Apply loaded scene to UI controls?')) {
                await this.syncToUI();
            }
            
            console.log('📁 Scene loaded:', file.name);
        } catch (error) {
            console.error('❌ Failed to load scene:', error);
            alert(`Failed to load scene: ${error.message}`);
        }
    }
    
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
    
    parseSceneCode(code) {
        try {
            // This is a simplified parser - would need to be more robust for production
            const sceneData = {
                objects: [],
                camera: { position: [25, 15, 25], fov: 75 },
                background: 0x0f0f0f
            };
            
            // Extract object data using regex patterns
            const objectMatches = code.matchAll(/\/\/ Object: (.+)\n[\s\S]*?color: new THREE\.Color\('(.+?)'\),[\s\S]*?wireframe: (true|false),[\s\S]*?opacity: ([0-9.]+),[\s\S]*?roughness: ([0-9.]+),[\s\S]*?metalness: ([0-9.]+)[\s\S]*?position\.set\(([0-9., -]+)\)[\s\S]*?rotation\.set\(([0-9., -]+)\)[\s\S]*?scale\.set\(([0-9., -]+)\)/g);
            
            for (const match of objectMatches) {
                const [, name, color, wireframe, opacity, roughness, metalness, position, rotation, scale] = match;
                
                sceneData.objects.push({
                    name: name.trim(),
                    material: {
                        color,
                        wireframe: wireframe === 'true',
                        opacity: parseFloat(opacity),
                        roughness: parseFloat(roughness),
                        metalness: parseFloat(metalness)
                    },
                    transform: {
                        position: position.split(',').map(v => parseFloat(v.trim())),
                        rotation: rotation.split(',').map(v => parseFloat(v.trim())),
                        scale: scale.split(',').map(v => parseFloat(v.trim()))
                    }
                });
            }
            
            return sceneData;
        } catch (error) {
            console.error('❌ Failed to parse scene code:', error);
            return null;
        }
    }
    
    async applySceneDataToUI(sceneData) {
        // This would need to be implemented to actually update the UI controls
        // with the parsed scene data - complex feature requiring UI state management
        console.log('🔄 Applying scene data to UI:', sceneData);
        
        // For now, just log what would be applied
        sceneData.objects.forEach(obj => {
            console.log(`Would apply: ${obj.name}`, obj.material, obj.transform);
        });
        
        // TODO: Actually update material controls, transform controls, etc.
        alert('Code parsing successful! Full UI sync implementation coming soon...');
    }
    
    getCurrentCode() {
        if (this.currentView === 'code' && this.fullscreenEditor) {
            return this.fullscreenEditor.getValue();
        } else if (this.currentView === 'studio' && this.editor) {
            return this.editor.getValue();
        } else if (this.fullscreenEditor) {
            // Fallback to fullscreen editor if sidebar editor doesn't exist
            return this.fullscreenEditor.getValue();
        } else {
            return this.currentCode;
        }
    }
    
    setCode(code) {
        this.isUpdatingFromUI = true;
        try {
            if (this.editor) {
                this.editor.setValue(code);
            }
            if (this.fullscreenEditor) {
                this.fullscreenEditor.setValue(code);
            }
            this.currentCode = code;
        } finally {
            this.isUpdatingFromUI = false;
        }
    }
    
    /**
     * Toggle live updates on/off (Phase 2)
     * @param {boolean} enabled - Whether to enable live updates
     */
    setLiveUpdatesEnabled(enabled) {
        this.liveUpdatesEnabled = enabled;
        
        if (!enabled && this.currentView === 'code') {
            this.liveUpdateManager.stopLiveUpdates();
            console.log('⏹️ Live updates disabled');
        } else if (enabled && this.currentView === 'code' && this.fullscreenEditor) {
            this.liveUpdateManager.startLiveUpdates(this.fullscreenEditor);
            console.log('⚡ Live updates enabled');
        }
    }
    
    /**
     * Get live compilation status and performance stats (Phase 2)
     * @returns {Object} Live compilation status
     */
    getLiveCompilationStatus() {
        return {
            enabled: this.liveUpdatesEnabled,
            currentView: this.currentView,
            isCompiling: this.codeCompiler.isCompiling,
            errors: this.codeCompiler.getCompilationErrors(),
            performance: this.liveUpdateManager.getPerformanceStats()
        };
    }
    
    /**
     * Reset live compilation system (Phase 2)
     */
    resetLiveCompilation() {
        this.codeCompiler.reset();
        this.liveUpdateManager.reset();
        console.log('🔄 Live compilation system reset');
    }
    
    /**
     * Get debug information for troubleshooting (Phase 2)
     * @returns {Object} Debug information
     */
    getDebugInfo() {
        return {
            phase2Active: true,
            liveUpdatesEnabled: this.liveUpdatesEnabled,
            currentView: this.currentView,
            hasFullscreenEditor: !!this.fullscreenEditor,
            hasCodeCompiler: !!this.codeCompiler,
            hasLiveUpdateManager: !!this.liveUpdateManager,
            compilationStats: this.getLiveCompilationStatus()
        };
    }

    dispose() {
        // Phase 2: Clean up live compilation system
        if (this.liveUpdateManager) {
            this.liveUpdateManager.reset();
        }
        if (this.codeCompiler) {
            this.codeCompiler.reset();
        }
        
        if (this.editor) {
            this.editor.dispose();
        }
        if (this.fullscreenEditor) {
            this.fullscreenEditor.dispose();
        }
        
        console.log('🧹 CodeEditorManager disposed with Phase 2 cleanup');
    }
}