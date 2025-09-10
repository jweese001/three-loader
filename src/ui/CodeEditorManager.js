import * as monaco from 'monaco-editor';
import { CodeCompiler } from '../codegen/CodeCompiler.js';
import { LiveUpdateManager } from '../codegen/LiveUpdateManager.js';
import { SyncManager } from '../core/SyncManager.js';
import { ThreeJsIntelliSense } from './ThreeJsIntelliSense.js';
import { CodeAdapter } from '../utils/CodeAdapter.js';

// Configure Monaco Environment for web workers
self.MonacoEnvironment = {
    getWorkerUrl: function (moduleId, label) {
        if (label === 'json') {
            return './monaco-editor/json.worker.js';
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return './monaco-editor/css.worker.js';
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return './monaco-editor/html.worker.js';
        }
        if (label === 'typescript' || label === 'javascript') {
            return './monaco-editor/ts.worker.js';
        }
        return './monaco-editor/editor.worker.js';
    }
};

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
        
        // Live compilation system (Enhanced for Phase 1)
        this.codeCompiler = new CodeCompiler(this.scene, this.objectManager);
        this.liveUpdateManager = new LiveUpdateManager(this.scene, this.objectManager, this.codeCompiler);
        this.liveUpdatesEnabled = true;
        
        // Phase 1: Bidirectional synchronization system
        this.syncManager = null; // Initialize after all dependencies are ready
        
        // Phase 2.5: Three.js IntelliSense
        this.threeJsIntelliSense = new ThreeJsIntelliSense();
        
        // Phase 3: Smart Code Adaptation System
        this.codeAdapter = new CodeAdapter();
        
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
        
        // Phase 1: Initialize SyncManager after all components are ready
        await this.initializeSyncManager();
        
        console.log('💻 CodeEditorManager init completed');
    }
    
    /**
     * Initialize SyncManager for bidirectional synchronization
     */
    async initializeSyncManager() {
        try {
            console.log('🔄 Initializing SyncManager for Phase 3 code execution...');
            this.syncManager = new SyncManager(
                this.scene,
                this.objectManager, 
                this.uiController,
                this
            );
            
            await this.syncManager.initialize();
            console.log('✅ SyncManager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize SyncManager:', error);
            console.warn('⚠️ Falling back to legacy code parsing');
            this.syncManager = null;
        }
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
        
        // Initialize Three.js IntelliSense
        await this.threeJsIntelliSense.initialize();
        
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
        console.log('🔄 Setting up view switching...');
        console.log('🔍 DOM ready state:', document.readyState);
        console.log('🔍 Available buttons:', Array.from(document.querySelectorAll('button')).map(btn => ({id: btn.id, text: btn.textContent})));
        
        // View toggle button
        const viewToggleBtn = document.getElementById('view-toggle-btn');
        
        if (!viewToggleBtn) {
            console.error('❌ View toggle button not found!');
            console.log('🔍 Searching for view-toggle-btn in DOM:', document.querySelector('[id*="view"]'));
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
    
    async syncFromUI() {
        if (this.isUpdatingFromCode) return;
        
        this.isUpdatingFromUI = true;
        
        try {
            // Use SyncManager for enhanced UI → Code sync if available
            if (this.syncManager) {
                console.log('🔄 Using SyncManager for enhanced UI → Code sync');
                const success = await this.syncManager.manualSyncFromUI();
                
                if (success) {
                    this.showNotification('✅ UI successfully synced to code!', 'success');
                } else {
                    this.showNotification('❌ Failed to sync UI to code', 'error');
                }
                return;
            }
            
            // Fallback: Generate fresh editable code from current UI state
            console.log('📝 Using legacy code generation (SyncManager not available)');
            
            if (!this.exportManager) {
                throw new Error('ExportManager is not available');
            }
            
            console.log('🔄 Calling exportManager.generateEditableCode()...');
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
            
            this.showNotification('✅ UI successfully synced to code!', 'success');
            console.log('✅ Editable code updated from UI state successfully');
        } catch (error) {
            console.error('❌ Failed to sync from UI:', error);
            this.showNotification(`❌ Failed to sync from UI: ${error.message}`, 'error');
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
    
    /**
     * Enhanced syncToUI - Reverse-engineers Three.js code to update UI
     * Supports both template-based and arbitrary Three.js code
     */
    async syncToUI() {
        if (this.isUpdatingFromUI) return;
        
        this.isUpdatingFromCode = true;
        console.log('⬆️ Starting code to UI synchronization...');
        
        try {
            const activeEditor = this.currentView === 'code' ? this.fullscreenEditor : this.editor;
            const code = activeEditor.getValue();
            
            if (!code || code.trim().length === 0) {
                console.warn('⚠️ No code to sync to UI');
                return;
            }
            
            // Phase 1: Check if this is adapted code and use enhanced execution
            const isAdaptedCode = code.includes('🔄 AUTO-ADAPTED FROM STANDALONE THREE.JS FILE');
            
            if (isAdaptedCode && this.syncManager) {
                console.log('🔄 Detected adapted code - using enhanced execution path');
                try {
                    const result = await this.syncManager.executeCodeInSandbox(code);
                    if (result.success) {
                        this.showNotification('✅ Adapted code successfully executed in viewport!', 'success');
                        return;
                    } else {
                        console.error('Enhanced execution failed:', result.error);
                    }
                } catch (error) {
                    console.error('Enhanced execution error:', error);
                }
            }
            
            // Phase 2: Use enhanced SyncManager for comprehensive code analysis
            if (this.syncManager) {
                console.log('🔄 Using enhanced SyncManager for Code → UI sync');
                const success = await this.syncManager.manualSyncFromCode();
                
                if (success) {
                    this.showNotification('✅ Code successfully synced to UI controls!', 'success');
                } else {
                    // Fallback to existing method if enhanced sync fails
                    console.log('🔄 Enhanced sync failed, falling back to legacy method');
                    await this.syncCodeToUIWithSyncManager(code);
                }
            } else {
                console.log('📝 Using legacy code parsing (SyncManager not available)');
                await this.syncCodeToUILegacy(code);
            }
            
            console.log('✅ Code to UI synchronization completed');
            
        } catch (error) {
            console.error('❌ Failed to sync code to UI:', error);
            this.showSyncError('Code to UI sync failed', error.message);
        } finally {
            this.isUpdatingFromCode = false;
        }
    }
    
    /**
     * Advanced code to UI sync using SyncManager
     * @param {string} code - The Three.js code to analyze
     */
    async syncCodeToUIWithSyncManager(code) {
        try {
            // Use enhanced CodeCompiler for arbitrary code execution
            const result = await this.codeCompiler.parseCode(code, { mode: 'arbitrary' });
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            if (result.type === 'arbitrary_execution') {
                // Apply execution results to UI
                await this.applyArbitraryExecutionToUI(result);
            } else if (result.type === 'template_parsing') {
                // Apply template parsing results to UI
                await this.applyTemplateParsingToUI(result);
            }
            
            console.log('✅ SyncManager-based code sync completed');
            
        } catch (error) {
            console.error('❌ SyncManager code sync failed:', error);
            // Fallback to legacy parsing
            console.log('🔄 Falling back to legacy code parsing...');
            await this.syncCodeToUILegacy(code);
        }
    }
    
    /**
     * Apply arbitrary code execution results to UI
     * @param {Object} result - Execution result from CodeCompiler
     */
    async applyArbitraryExecutionToUI(result) {
        console.log('🚀 Applying arbitrary code execution results to UI...');
        
        const { sceneObjects, materials, lights, camera, background } = result;
        
        // Update scene objects and their properties
        if (sceneObjects && sceneObjects.length > 0) {
            await this.updateUIFromSceneObjects(sceneObjects);
        }
        
        // Update lighting
        if (lights && lights.length > 0) {
            await this.updateUIFromLights(lights);
        }
        
        // Update camera
        if (camera) {
            await this.updateUIFromCamera(camera);
        }
        
        // Update scene background
        if (background !== undefined) {
            await this.updateUIFromBackground(background);
        }
        
        // Show execution stats
        this.showExecutionStats(result);
    }
    
    /**
     * Apply template parsing results to UI
     * @param {Object} result - Parsing result from CodeCompiler
     */
    async applyTemplateParsingToUI(result) {
        console.log('📝 Applying template parsing results to UI...');
        
        const { materials, transforms, lighting, sceneConfig } = result;
        
        // Update materials
        if (materials && materials.size > 0) {
            for (const [materialId, material] of materials) {
                await this.updateMaterialUI(materialId, material);
            }
        }
        
        // Update transforms
        if (transforms && transforms.size > 0) {
            for (const [objectId, transform] of transforms) {
                await this.updateTransformUI(objectId, transform);
            }
        }
        
        // Update lighting
        if (lighting && Object.keys(lighting).length > 0) {
            await this.updateLightingUI(lighting);
        }
        
        // Update scene config
        if (sceneConfig && Object.keys(sceneConfig).length > 0) {
            await this.updateSceneConfigUI(sceneConfig);
        }
    }
    
    /**
     * Update UI from scene objects data
     * @param {Array} sceneObjects - Scene objects from code execution
     */
    async updateUIFromSceneObjects(sceneObjects) {
        for (const objData of sceneObjects) {
            console.log(`🔄 Updating UI for object: ${objData.name || objData.uuid}`);
            
            // Update transform controls
            if (objData.position) {
                this.updateUIControl('position-x', objData.position[0]);
                this.updateUIControl('position-y', objData.position[1]);
                this.updateUIControl('position-z', objData.position[2]);
            }
            
            if (objData.rotation) {
                this.updateUIControl('rotation-x', objData.rotation[0]);
                this.updateUIControl('rotation-y', objData.rotation[1]);
                this.updateUIControl('rotation-z', objData.rotation[2]);
            }
            
            if (objData.scale) {
                this.updateUIControl('scale-x', objData.scale[0]);
                this.updateUIControl('scale-y', objData.scale[1]);
                this.updateUIControl('scale-z', objData.scale[2]);
            }
            
            // Update material controls
            if (objData.material) {
                await this.updateMaterialUIFromData(objData.material);
            }
            
            // Update object visibility
            if (objData.visible !== undefined) {
                this.updateUIControl('object-visible', objData.visible);
            }
        }
    }
    
    /**
     * Update material UI from material data
     * @param {Object} materialData - Material data from code
     */
    async updateMaterialUIFromData(materialData) {
        if (materialData.color !== null && materialData.color !== undefined) {
            const colorHex = '#' + materialData.color.toString(16).padStart(6, '0');
            this.updateUIControl('material-color', colorHex);
        }
        
        if (materialData.opacity !== undefined) {
            this.updateUIControl('material-opacity', materialData.opacity);
        }
        
        if (materialData.wireframe !== undefined) {
            this.updateUIControl('material-wireframe', materialData.wireframe);
        }
        
        if (materialData.roughness !== undefined) {
            this.updateUIControl('material-roughness', materialData.roughness);
        }
        
        if (materialData.metalness !== undefined) {
            this.updateUIControl('material-metalness', materialData.metalness);
        }
        
        if (materialData.transparent !== undefined) {
            this.updateUIControl('material-transparent', materialData.transparent);
        }
    }
    
    /**
     * Update UI control element
     * @param {string} controlId - Control element ID
     * @param {*} value - New value
     */
    updateUIControl(controlId, value) {
        const element = document.getElementById(controlId);
        if (!element) {
            console.warn(`⚠️ UI control not found: ${controlId}`);
            return;
        }
        
        try {
            if (element.type === 'checkbox' || element.type === 'radio') {
                element.checked = Boolean(value);
            } else if (element.type === 'range' || element.type === 'number') {
                element.value = Number(value);
            } else {
                element.value = String(value);
            }
            
            // Trigger change event to update any listeners
            element.dispatchEvent(new Event('change', { bubbles: true }));
            element.dispatchEvent(new Event('input', { bubbles: true }));
            
            console.log(`🔄 Updated UI control ${controlId}:`, value);
            
        } catch (error) {
            console.error(`❌ Failed to update UI control ${controlId}:`, error);
        }
    }
    
    /**
     * Update material UI controls
     * @param {number} materialId - Material ID
     * @param {Object} material - Material data
     */
    async updateMaterialUI(materialId, material) {
        console.log(`🎨 Updating material UI for material ${materialId}:`, material);
        
        if (material.color) {
            this.updateUIControl('material-color', material.color);
        }
        
        if (material.wireframe !== undefined) {
            this.updateUIControl('material-wireframe', material.wireframe);
        }
        
        if (material.opacity !== undefined) {
            this.updateUIControl('material-opacity', material.opacity);
        }
        
        if (material.roughness !== undefined) {
            this.updateUIControl('material-roughness', material.roughness);
        }
        
        if (material.metalness !== undefined) {
            this.updateUIControl('material-metalness', material.metalness);
        }
        
        if (material.transparent !== undefined) {
            this.updateUIControl('material-transparent', material.transparent);
        }
    }
    
    /**
     * Update transform UI controls
     * @param {number} objectId - Object ID
     * @param {Object} transform - Transform data
     */
    async updateTransformUI(objectId, transform) {
        console.log(`📐 Updating transform UI for object ${objectId}:`, transform);
        
        if (transform.position) {
            this.updateUIControl('position-x', transform.position.x);
            this.updateUIControl('position-y', transform.position.y);
            this.updateUIControl('position-z', transform.position.z);
        }
        
        if (transform.rotation) {
            this.updateUIControl('rotation-x', transform.rotation.x);
            this.updateUIControl('rotation-y', transform.rotation.y);
            this.updateUIControl('rotation-z', transform.rotation.z);
        }
        
        if (transform.scale) {
            this.updateUIControl('scale-x', transform.scale.x);
            this.updateUIControl('scale-y', transform.scale.y);
            this.updateUIControl('scale-z', transform.scale.z);
        }
    }
    
    /**
     * Show execution statistics
     * @param {Object} result - Execution result
     */
    showExecutionStats(result) {
        const stats = `
Code Execution Completed Successfully:
• Execution time: ${result.executionTime}ms
• Memory usage: ${this.formatBytes(result.memoryUsage)}
• Objects processed: ${result.sceneObjects?.length || 0}
• Lights processed: ${result.lights?.length || 0}
        `.trim();
        
        console.log('📊 Execution Stats:\n' + stats);
        
        // Show success notification
        this.showNotification('Code synchronized to UI successfully!', 'success');
    }
    
    /**
     * Legacy code to UI sync (existing functionality)
     * @param {string} code - The Three.js code to parse
     */
    async syncCodeToUILegacy(code) {
        // Parse the code to extract scene data
        const sceneData = this.parseSceneCode(code);
        
        if (sceneData) {
            // Apply parsed data to UI
            await this.applySceneDataToUI(sceneData);
            console.log('⬆️ UI updated from code (legacy parsing)');
        } else {
            throw new Error('Unable to parse scene code. Please check the code format.');
        }
    }
    
    /**
     * Show sync error notification
     * @param {string} title - Error title
     * @param {string} message - Error message
     */
    showSyncError(title, message) {
        console.error(`❌ ${title}:`, message);
        this.showNotification(`${title}: ${message}`, 'error');
    }
    
    /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Notification type ('success', 'error', 'warning', 'info')
     */
    showNotification(message, type = 'info') {
        // Create or update notification display
        let notification = document.getElementById('sync-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'sync-notification';
            notification.className = 'sync-notification';
            
            const container = document.querySelector('.code-editor-view') || document.body;
            container.appendChild(notification);
        }
        
        notification.className = `sync-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.style.display='none'">×</button>
            </div>
        `;
        
        notification.style.display = 'block';
        
        // Auto-hide success notifications
        if (type === 'success') {
            setTimeout(() => {
                if (notification) {
                    notification.style.display = 'none';
                }
            }, 3000);
        } else if (type === 'error') {
            // Keep error notifications visible longer
            setTimeout(() => {
                if (notification) {
                    notification.style.display = 'none';
                }
            }, 10000);
        }
    }
    
    /**
     * Format bytes for display
     * @param {number} bytes - Bytes to format
     * @returns {string} Formatted string
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * Update UI from lights data
     * @param {Array} lights - Lights from code execution
     */
    async updateUIFromLights(lights) {
        console.log('💡 Updating lighting UI from code execution:', lights);
        
        // Update lighting controls based on extracted lights
        for (const lightData of lights) {
            console.log(`💡 Processing light: ${lightData.type}`, lightData);
            
            // Update based on light type
            if (lightData.type === 'DirectionalLight' || lightData.type === 'AmbientLight') {
                this.updateUIControl('light-intensity', lightData.intensity);
                
                if (lightData.color !== undefined) {
                    const colorHex = '#' + lightData.color.toString(16).padStart(6, '0');
                    this.updateUIControl('light-color', colorHex);
                }
            }
        }
    }
    
    /**
     * Update UI from camera data
     * @param {Object} camera - Camera data from code execution
     */
    async updateUIFromCamera(camera) {
        console.log('📷 Updating camera UI from code execution:', camera);
        
        if (camera.fov !== undefined) {
            this.updateUIControl('camera-fov', camera.fov);
        }
        
        if (camera.position) {
            this.updateUIControl('camera-position-x', camera.position[0]);
            this.updateUIControl('camera-position-y', camera.position[1]);
            this.updateUIControl('camera-position-z', camera.position[2]);
        }
        
        if (camera.near !== undefined) {
            this.updateUIControl('camera-near', camera.near);
        }
        
        if (camera.far !== undefined) {
            this.updateUIControl('camera-far', camera.far);
        }
    }
    
    /**
     * Update UI from background data
     * @param {number} background - Background color from code execution
     */
    async updateUIFromBackground(background) {
        console.log('🎨 Updating background UI from code execution:', background);
        
        if (background !== undefined) {
            const colorHex = '#' + background.toString(16).padStart(6, '0');
            this.updateUIControl('scene-background', colorHex);
        }
    }
    
    /**
     * Update lighting UI from lighting data
     * @param {Object} lighting - Lighting configuration
     */
    async updateLightingUI(lighting) {
        console.log('💡 Updating lighting UI from template parsing:', lighting);
        
        if (lighting.ambient) {
            this.updateUIControl('ambient-light-intensity', lighting.ambient.intensity);
            if (lighting.ambient.color !== undefined) {
                const colorHex = '#' + lighting.ambient.color.toString(16).padStart(6, '0');
                this.updateUIControl('ambient-light-color', colorHex);
            }
        }
        
        if (lighting.directional) {
            this.updateUIControl('directional-light-intensity', lighting.directional.intensity);
            if (lighting.directional.color !== undefined) {
                const colorHex = '#' + lighting.directional.color.toString(16).padStart(6, '0');
                this.updateUIControl('directional-light-color', colorHex);
            }
        }
    }
    
    /**
     * Update scene config UI from scene configuration data
     * @param {Object} sceneConfig - Scene configuration
     */
    async updateSceneConfigUI(sceneConfig) {
        console.log('🎬 Updating scene config UI from template parsing:', sceneConfig);
        
        if (sceneConfig.backgroundColor !== undefined) {
            const colorHex = '#' + sceneConfig.backgroundColor.toString(16).padStart(6, '0');
            this.updateUIControl('scene-background-color', colorHex);
        }
        
        if (sceneConfig.camera) {
            const camera = sceneConfig.camera;
            
            if (camera.fov !== undefined) {
                this.updateUIControl('camera-fov', camera.fov);
            }
            
            if (camera.position) {
                this.updateUIControl('camera-position-x', camera.position[0]);
                this.updateUIControl('camera-position-y', camera.position[1]);
                this.updateUIControl('camera-position-z', camera.position[2]);
            }
            
            if (camera.near !== undefined) {
                this.updateUIControl('camera-near', camera.near);
            }
            
            if (camera.far !== undefined) {
                this.updateUIControl('camera-far', camera.far);
            }
        }
    }
    
    /**
     * Show notification to user
     * @param {string} message - Message to display
     * @param {string} type - Notification type ('success', 'error', 'info')
     */
    showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('code-editor-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'code-editor-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                font-family: 'Inter', sans-serif;
                font-size: 14px;
                font-weight: 500;
                z-index: 10000;
                max-width: 400px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transform: translateX(100%);
                transition: transform 0.3s ease-in-out;
            `;
            document.body.appendChild(notification);
        }
        
        // Set style based on type
        const styles = {
            success: 'background: #10b981; color: white;',
            error: 'background: #ef4444; color: white;',
            info: 'background: #3b82f6; color: white;'
        };
        
        notification.style.cssText += styles[type] || styles.info;
        notification.textContent = message;
        
        // Show notification
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
        
        // Hide after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
        
        console.log(`📢 Notification (${type}): ${message}`);
    }

    /**
     * Get current code from active editor
     * @returns {string} Current code
     */
    getCode() {
        return this.getCurrentCode();
    }
    
    saveSceneFile() {
        try {
            // Get code from the appropriate editor
            let code = '';
            const activeEditor = this.currentView === 'code' ? this.fullscreenEditor : this.editor;
            
            if (activeEditor) {
                code = activeEditor.getValue();
            } else if (this.currentCode) {
                code = this.currentCode;
            } else {
                throw new Error('No code available to save');
            }
            
            if (!code || code.trim().length === 0) {
                throw new Error('Cannot save empty code');
            }
            
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
            this.showNotification(`✅ Scene saved as ${filename}`, 'success');
        } catch (error) {
            console.error('❌ Failed to save scene:', error);
            this.showNotification(`❌ Failed to save scene: ${error.message}`, 'error');
        }
    }
    
    async loadSceneFile(file) {
        try {
            console.log('📁 Loading scene file:', file.name);
            
            // Read the original file content
            const originalCode = await this.readFileAsText(file);
            console.log('📄 Original code length:', originalCode.length);
            
            // Use smart adaptation system to analyze and transform if needed
            const adaptationResult = this.codeAdapter.adaptCode(originalCode);
            
            if (adaptationResult.wasAdapted) {
                console.log('🔄 Standalone file detected and adapted:', {
                    confidence: adaptationResult.analysis.confidence + '%',
                    elementsPreserved: adaptationResult.adaptationSummary.elementsPreserved,
                    transformations: adaptationResult.adaptationSummary.transformationsApplied
                });
            }
            
            // Load the adapted code into the editor(s)
            const codeToLoad = adaptationResult.transformedCode;
            
            if (this.editor) {
                this.editor.setValue(codeToLoad);
            }
            if (this.fullscreenEditor) {
                this.fullscreenEditor.setValue(codeToLoad);
            }
            
            this.currentCode = codeToLoad;
            
            // Show appropriate notification based on adaptation
            let notificationMessage;
            if (adaptationResult.wasAdapted) {
                notificationMessage = `✅ Loaded and adapted: ${file.name} (standalone → three-loader compatible)`;
                console.log('🔧 Adaptation Summary:', adaptationResult.adaptationSummary);
            } else {
                notificationMessage = `✅ Loaded: ${file.name}`;
            }
            
            this.showNotification(notificationMessage, 'success');
            
            // Auto-sync to viewport with enhanced confirmation dialog
            let confirmMessage = 'Apply loaded scene to UI controls?';
            if (adaptationResult.wasAdapted) {
                confirmMessage = `Apply adapted ${file.name} to viewport?\n\n` +
                    `🔧 Adaptation applied (${adaptationResult.analysis.confidence.toFixed(0)}% confidence)\n` +
                    `📦 ${adaptationResult.adaptationSummary.elementsPreserved} creative elements preserved\n` +
                    `🔄 ${adaptationResult.adaptationSummary.transformationsApplied.length} transformations applied`;
            }
            
            if (confirm(confirmMessage)) {
                console.log('🔄 Syncing adapted code to UI...');
                await this.syncToUI();
                
                if (adaptationResult.wasAdapted) {
                    // Show additional success message for adapted files
                    setTimeout(() => {
                        this.showNotification(
                            `🎯 ${file.name} successfully adapted and loaded into viewport!`, 
                            'success'
                        );
                    }, 1000);
                }
            }
            
            console.log('📁 Scene loaded:', file.name);
            
        } catch (error) {
            console.error('❌ Failed to load scene:', error);
            this.showNotification(`❌ Failed to load scene: ${error.message}`, 'error');
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
        console.log('🔄 Applying scene data to UI:', sceneData);
        
        try {
            // Update scene background if available
            if (sceneData.background !== undefined) {
                await this.updateUIFromBackground(sceneData.background);
            }
            
            // Update camera settings if available
            if (sceneData.camera) {
                await this.updateUIFromCamera(sceneData.camera);
            }
            
            // Update lighting if available
            if (sceneData.lighting) {
                await this.updateLightingUI(sceneData.lighting);
            }
            
            // Apply object data to UI controls
            if (sceneData.objects && sceneData.objects.length > 0) {
                // For now, apply the first object's data to the current UI controls
                // In a more advanced implementation, we'd need object selection logic
                const firstObject = sceneData.objects[0];
                
                if (firstObject) {
                    console.log(`🎯 Applying data from object: ${firstObject.name}`);
                    
                    // Update material controls if available
                    if (firstObject.material) {
                        await this.updateMaterialUIFromData(firstObject.material);
                    }
                    
                    // Update transform controls if available
                    if (firstObject.transform) {
                        const transform = firstObject.transform;
                        
                        if (transform.position) {
                            this.updateUIControl('position-x', transform.position[0]);
                            this.updateUIControl('position-y', transform.position[1]);
                            this.updateUIControl('position-z', transform.position[2]);
                        }
                        
                        if (transform.rotation) {
                            this.updateUIControl('rotation-x', transform.rotation[0]);
                            this.updateUIControl('rotation-y', transform.rotation[1]);
                            this.updateUIControl('rotation-z', transform.rotation[2]);
                        }
                        
                        if (transform.scale) {
                            this.updateUIControl('scale-x', transform.scale[0]);
                            this.updateUIControl('scale-y', transform.scale[1]);
                            this.updateUIControl('scale-z', transform.scale[2]);
                        }
                    }
                    
                    // Update object visibility if available
                    if (firstObject.visible !== undefined) {
                        this.updateUIControl('object-visible', firstObject.visible);
                    }
                }
                
                // Log summary of what was applied
                console.log(`✅ Applied UI data for ${sceneData.objects.length} object(s)`);
                sceneData.objects.forEach((obj, index) => {
                    console.log(`  ${index + 1}. ${obj.name}:`, {
                        material: obj.material ? 'Updated' : 'None',
                        transform: obj.transform ? 'Updated' : 'None',
                        visible: obj.visible !== undefined ? obj.visible : 'Default'
                    });
                });
            }
            
            console.log('✅ Scene data successfully applied to UI controls');
            
            // Show success message instead of alert
            this.showNotification('✅ Code successfully synced to UI controls!', 'success');
            
        } catch (error) {
            console.error('❌ Failed to apply scene data to UI:', error);
            this.showNotification(`❌ Failed to sync to UI: ${error.message}`, 'error');
            throw error;
        }
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

    async dispose() {
        // Phase 1: Clean up SyncManager
        if (this.syncManager) {
            await this.syncManager.cleanup();
            this.syncManager = null;
        }
        
        // Enhanced: Clean up live compilation system
        if (this.liveUpdateManager) {
            this.liveUpdateManager.reset();
        }
        if (this.codeCompiler) {
            await this.codeCompiler.cleanup();
        }
        
        if (this.editor) {
            this.editor.dispose();
        }
        if (this.fullscreenEditor) {
            this.fullscreenEditor.dispose();
        }
        
        // Dispose Three.js IntelliSense
        if (this.threeJsIntelliSense) {
            this.threeJsIntelliSense.dispose();
        }
        
        console.log('🧹 CodeEditorManager disposed with Phase 2.5 cleanup');
    }
}