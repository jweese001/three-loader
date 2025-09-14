import { CodeSandbox } from './CodeSandbox.js';

/**
 * SyncManager - Core bidirectional synchronization system
 * Part of Phase 1: Safe Code Execution Engine
 * 
 * Handles seamless sync between visual editor and code editor:
 * - Visual → Code: Updates code when visual panels change
 * - Code → Visual: Updates UI panels when code is edited  
 * - Conflict resolution and smart change detection
 * - Preserves user comments and code formatting
 */

export class SyncManager {
    constructor(scene, objectManager, uiController, codeEditorManager) {
        this.scene = scene;
        this.objectManager = objectManager;
        this.uiController = uiController;
        this.codeEditorManager = codeEditorManager;
        
        // Initialize CodeSandbox for safe execution
        this.codeSandbox = new CodeSandbox();
        
        // Sync state management
        this.syncState = {
            lastVisualChange: 0,
            lastCodeChange: 0,
            isVisualSyncing: false,
            isCodeSyncing: false,
            syncDirection: null, // 'visual-to-code' or 'code-to-visual'
            preserveCodeStructure: true
        };
        
        // Change tracking
        this.visualState = {
            objects: new Map(),
            materials: new Map(),
            transforms: new Map(),
            lighting: {},
            camera: {}
        };
        
        this.codeState = {
            lastParsedCode: '',
            extractedObjects: new Map(),
            userComments: [],
            codeStructure: null
        };
        
        // Debounce timers
        this.visualSyncTimer = null;
        this.codeSyncTimer = null;
        this.syncDebounceTime = 300; // 300ms debounce
        
        // Event listeners
        this.eventListeners = new Map();
        
        console.log('🔄 SyncManager initialized');
        this.initialize();
    }
    
    /**
     * Initialize synchronization system
     */
    async initialize() {
        try {
            // Wait for CodeSandbox to initialize
            await this.waitForSandboxReady();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Capture initial states
            this.captureVisualState();
            this.captureCodeState();
            
            console.log('✅ SyncManager ready for bidirectional sync');
            
        } catch (error) {
            console.error('❌ SyncManager initialization failed:', error);
            throw error;
        }
    }
    
    /**
     * Wait for CodeSandbox to be ready
     */
    async waitForSandboxReady() {
        const maxWaitTime = 5000; // 5 seconds
        const checkInterval = 100; // 100ms
        let elapsed = 0;
        
        while (!this.codeSandbox.isInitialized && elapsed < maxWaitTime) {
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            elapsed += checkInterval;
        }
        
        if (!this.codeSandbox.isInitialized) {
            throw new Error('CodeSandbox initialization timeout');
        }
    }
    
    /**
     * Set up event listeners for visual and code changes
     */
    setupEventListeners() {
        // Visual editor change listeners
        this.addEventListener('materialChange', (event) => {
            this.onVisualChange('material', event.detail);
        });
        
        this.addEventListener('transformChange', (event) => {
            this.onVisualChange('transform', event.detail);
        });
        
        this.addEventListener('objectLoad', (event) => {
            this.onVisualChange('object', event.detail);
        });
        
        this.addEventListener('lightingChange', (event) => {
            this.onVisualChange('lighting', event.detail);
        });
        
        // Code editor change listeners
        if (this.codeEditorManager && this.codeEditorManager.editor) {
            this.codeEditorManager.editor.onDidChangeModelContent(() => {
                this.onCodeChange();
            });
        }
        
        // UI panel change listeners
        this.setupUIPanelListeners();
        
        console.log('📡 Event listeners configured for bidirectional sync');
    }
    
    /**
     * Set up UI panel change listeners
     */
    setupUIPanelListeners() {
        // Material panel listeners
        const materialInputs = document.querySelectorAll('.material-editor input, .material-editor select');
        materialInputs.forEach(input => {
            input.addEventListener('change', (event) => {
                this.onVisualChange('material', {
                    property: event.target.name || event.target.id,
                    value: event.target.value,
                    element: event.target
                });
            });
        });
        
        // Transform panel listeners
        const transformInputs = document.querySelectorAll('.transform-panel input');
        transformInputs.forEach(input => {
            input.addEventListener('input', (event) => {
                this.onVisualChange('transform', {
                    property: event.target.name || event.target.id,
                    value: event.target.value,
                    element: event.target
                });
            });
        });
        
        // Animation panel listeners
        const animationControls = document.querySelectorAll('.animation-panel select, .animation-panel input');
        animationControls.forEach(control => {
            control.addEventListener('change', (event) => {
                this.onVisualChange('animation', {
                    property: event.target.name || event.target.id,
                    value: event.target.value,
                    element: event.target
                });
            });
        });
    }
    
    /**
     * Handle visual editor changes
     * @param {string} type - Change type (material, transform, object, etc.)
     * @param {Object} data - Change data
     */
    onVisualChange(type, data) {
        if (this.syncState.isCodeSyncing) {
            console.log('🔄 Skipping visual change during code sync');
            return;
        }
        
        console.log('👁️ Visual change detected:', type, data);
        
        this.syncState.lastVisualChange = Date.now();
        this.syncState.syncDirection = 'visual-to-code';
        
        // Update visual state
        this.updateVisualState(type, data);
        
        // Debounced sync to code
        if (this.visualSyncTimer) {
            clearTimeout(this.visualSyncTimer);
        }
        
        this.visualSyncTimer = setTimeout(() => {
            this.syncVisualToCode(type, data);
        }, this.syncDebounceTime);
    }
    
    /**
     * Handle code editor changes
     */
    onCodeChange() {
        if (this.syncState.isVisualSyncing) {
            console.log('🔄 Skipping code change during visual sync');
            return;
        }
        
        console.log('💻 Code change detected');
        
        this.syncState.lastCodeChange = Date.now();
        this.syncState.syncDirection = 'code-to-visual';
        
        // Debounced sync to visual
        if (this.codeSyncTimer) {
            clearTimeout(this.codeSyncTimer);
        }
        
        this.codeSyncTimer = setTimeout(() => {
            this.syncCodeToVisual();
        }, this.syncDebounceTime);
    }
    
    /**
     * Sync visual changes to code
     * @param {string} type - Change type
     * @param {Object} data - Change data
     */
    async syncVisualToCode(type, data) {
        if (this.syncState.isVisualSyncing) return;
        
        console.log('👁️➡️💻 Syncing visual changes to code...');
        this.syncState.isVisualSyncing = true;
        
        try {
            // Get current code from editor
            const currentCode = this.codeEditorManager.getCode();
            
            // Parse current code structure to preserve user formatting
            const codeStructure = this.parseCodeStructure(currentCode);
            
            // Generate updated code based on visual state
            const updatedCode = await this.generateCodeFromVisualState(codeStructure);
            
            // Update code editor while preserving cursor position
            await this.updateCodeEditor(updatedCode, false);
            
            console.log('✅ Visual changes synced to code successfully');
            
        } catch (error) {
            console.error('❌ Visual to code sync failed:', error);
        } finally {
            this.syncState.isVisualSyncing = false;
        }
    }
    
    /**
     * Sync code changes to visual
     */
    async syncCodeToVisual() {
        if (this.syncState.isCodeSyncing) return;
        
        console.log('💻➡️👁️ Syncing code changes to visual...');
        this.syncState.isCodeSyncing = true;
        
        try {
            // Get current code from editor
            const currentCode = this.codeEditorManager.getCode();
            
            // Execute code in sandbox to extract scene state
            const executionResult = await this.executeCodeInSandbox(currentCode);

            // Add safety check for undefined result
            if (executionResult && executionResult.success) {
                // Update visual editor based on extracted state
                await this.updateVisualFromCode(executionResult.result);
                
                // Update viewport to reflect changes
                this.updateViewport(executionResult.result);
                
                console.log('✅ Code changes synced to visual successfully');
            } else {
                const errorMessage = executionResult
                    ? `Code execution failed: ${executionResult.error}`
                    : 'Code execution returned undefined result';
                console.error('❌', errorMessage);
                this.showCodeError({ error: errorMessage });
            }
            
        } catch (error) {
            console.error('❌ Code to visual sync failed:', error);
            this.showCodeError({ error: error.message });
        } finally {
            this.syncState.isCodeSyncing = false;
        }
    }
    
    /**
     * Execute code in sandbox and extract Three.js scene state
     * @param {string} code - The Three.js code to execute
     * @returns {Promise<Object>} Execution result with scene state
     */
    async executeCodeInSandbox(code) {
        try {
            // Check if this is adapted standalone code
            const isAdaptedCode = code.includes('🔄 AUTO-ADAPTED FROM STANDALONE THREE.JS FILE');
            
            if (isAdaptedCode) {
                console.log('🔧 Executing adapted standalone Three.js code with enhanced context...');
                return await this.executeAdaptedCodeInSandbox(code);
            }
            
            // Standard execution for three-loader generated code
            const wrappedCode = this.wrapCodeForStateExtraction(code);
            
            // Execute in sandbox
            const result = await this.codeSandbox.executeCode(wrappedCode, {
                // Provide current scene objects as context
                currentScene: this.serializeCurrentScene()
            });

            // Ensure we always return a proper result object
            return result || {
                success: false,
                error: 'Code execution returned undefined result',
                type: 'undefined_result'
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                type: 'execution_error'
            };
        }
    }
    
    /**
     * Execute adapted standalone Three.js code with enhanced context bridge
     * @param {string} adaptedCode - Adapted standalone code
     * @returns {Promise<Object>} Execution result
     */
    async executeAdaptedCodeInSandbox(adaptedCode) {
        try {
            console.log('🌉 Executing adapted code directly in main thread for full Three.js access...');
            
            // Clear existing scene objects (keep lights and camera)
            const existingObjects = [];
            this.scene.scene.children.forEach(child => {
                if (child.type !== 'DirectionalLight' && child.type !== 'HemisphereLight' && 
                    child.type !== 'PointLight' && child.type !== 'SpotLight' && 
                    child.type !== 'AmbientLight' && !child.isCamera) {
                    existingObjects.push(child);
                }
            });
            existingObjects.forEach(obj => this.scene.scene.remove(obj));
            
            // Create execution context with real Three.js objects
            const scene = this.scene.scene;
            const camera = this.scene.camera; 
            const renderer = this.scene.renderer;
            
            // Remove adaptation header and imports for execution  
            let cleanCode = adaptedCode.replace(/\/\*\*[\s\S]*?\*\/\s*/, '');
            cleanCode = cleanCode.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '');
            
            console.log('🚀 Executing adapted Three.js code...');
            console.log('Clean code length:', cleanCode.length);
            console.log('Clean code preview:', cleanCode.substring(0, 200) + '...');
            
            // Direct execution in main thread context with full variable scope
            const executeCode = new Function(
                'THREE', 'scene', 'camera', 'renderer', 'console',
                `
                try {
                    // Execute the cleaned adapted code
                    ${cleanCode}
                    
                    console.log('Code execution completed');
                    console.log('Scene children count:', scene.children.length);
                    return { success: true, message: 'Code executed successfully' };
                } catch (error) {
                    console.error('Code execution error:', error);
                    console.error('Error stack:', error.stack);
                    return { success: false, error: error.message, stack: error.stack };
                }
                `
            );
            
            // Execute with real context
            const result = executeCode(window.THREE, scene, camera, renderer, console);
            
            if (result.success) {
                console.log('✅ Adapted code executed successfully in viewport');
                
                // Hide viewport info messages when content is loaded
                const viewportInfo = document.getElementById('viewport-info');
                if (viewportInfo) {
                    viewportInfo.style.display = 'none';
                }
                
                // Debug scene state
                console.log('🔍 Scene debug info:', {
                    childrenCount: this.scene.scene.children.length,
                    cameraPosition: {
                        x: this.scene.camera.position.x,
                        y: this.scene.camera.position.y, 
                        z: this.scene.camera.position.z
                    },
                    cameraTarget: this.scene.camera.lookAt ? 'has lookAt' : 'no lookAt'
                });
                
                // List scene children for debugging
                this.scene.scene.children.forEach((child, index) => {
                    console.log(`Child ${index}:`, child.type, child.name || 'unnamed');
                });
                
                // Force viewport update
                if (this.scene.renderer) {
                    this.scene.renderer.render(this.scene.scene, this.scene.camera);
                }
                return { success: true, message: 'Adapted code executed and viewport updated' };
            } else {
                console.error('❌ Adapted code execution failed:', result.error);
                if (result.stack) {
                    console.error('Error stack:', result.stack);
                }
                return { success: false, error: result.error };
            }
            
        } catch (error) {
            console.error('❌ Direct execution failed:', error);
            return {
                success: false,
                error: error.message,
                type: 'direct_execution_error'
            };
        }
    }
    
    /**
     * Get scene object for context bridge
     * @returns {Object} Scene object for sandbox context
     */
    getSceneForContext() {
        if (!this.scene || !this.scene.scene) {
            console.error('❌ Scene not available for context bridge');
            return null;
        }
        return this.scene.scene;
    }
    
    /**
     * Get camera object for context bridge  
     * @returns {Object} Camera object for sandbox context
     */
    getCameraForContext() {
        if (!this.scene || !this.scene.camera) {
            console.error('❌ Camera not available for context bridge');
            return null;
        }
        return this.scene.camera;
    }
    
    /**
     * Get renderer object for context bridge
     * @returns {Object} Renderer object for sandbox context  
     */
    getRendererForContext() {
        if (!this.scene || !this.scene.renderer) {
            console.error('❌ Renderer not available for context bridge');
            return null;
        }
        return this.scene.renderer;
    }
    
    /**
     * Wrap adapted code for proper execution in three-loader context
     * @param {string} adaptedCode - Adapted standalone code
     * @returns {string} Wrapped code ready for execution
     */
    wrapAdaptedCodeForExecution(adaptedCode) {
        return `
// Enhanced context bridge for adapted standalone Three.js code
try {
    console.log('🔧 Executing adapted code with three-loader context...');
    
    // Execute adapted user code
    ${adaptedCode}
    
    // Capture scene state after execution
    __results.sceneState = {
        objects: [],
        materials: [],
        lights: [],
        camera: {
            position: camera ? [camera.position.x, camera.position.y, camera.position.z] : [0, 0, 5],
            rotation: camera ? [camera.rotation.x, camera.rotation.y, camera.rotation.z] : [0, 0, 0],
            fov: camera ? camera.fov : 75
        },
        background: scene ? scene.background : null
    };
    
    // Extract objects added to scene
    if (scene && scene.children) {
        scene.traverse((object) => {
            if (object.isMesh) {
                __results.sceneState.objects.push({
                    name: object.name || 'Unnamed',
                    type: 'Mesh',
                    geometry: object.geometry ? object.geometry.type : 'Unknown',
                    material: object.material ? object.material.type : 'Unknown',
                    position: [object.position.x, object.position.y, object.position.z],
                    rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
                    scale: [object.scale.x, object.scale.y, object.scale.z]
                });
            } else if (object.isLight) {
                __results.sceneState.lights.push({
                    name: object.name || 'Unnamed',
                    type: object.type,
                    color: object.color ? object.color.getHex() : 0xffffff,
                    intensity: object.intensity || 1,
                    position: [object.position.x, object.position.y, object.position.z]
                });
            }
        });
    }
    
    console.log('✅ Adapted code execution completed');
    console.log('📊 Scene state captured:', __results.sceneState);
    
} catch (error) {
    console.error('❌ Error in adapted code execution:', error);
    __results.error = error.message;
    throw error;
}
        `;
    }
    
    /**
     * Process results from adapted code execution
     * @param {Object} result - Raw execution result
     * @returns {Object} Processed result for three-loader integration
     */
    processAdaptedCodeResults(result) {
        console.log('🔄 Processing adapted code results...');
        
        if (result.result && result.result.sceneState) {
            const sceneState = result.result.sceneState;
            console.log('📦 Extracted scene state:', {
                objects: sceneState.objects.length,
                lights: sceneState.lights.length,
                camera: sceneState.camera
            });
            
            return {
                success: true,
                result: {
                    objects: sceneState.objects,
                    lights: sceneState.lights, 
                    camera: sceneState.camera,
                    background: sceneState.background,
                    executionTime: result.executionTime,
                    memoryUsage: result.memoryUsage
                },
                type: 'adapted_execution_success'
            };
        }
        
        return result;
    }
    
    /**
     * Wrap user code to extract scene state after execution
     * @param {string} userCode - Original user code
     * @returns {string} Wrapped code with state extraction
     */
    wrapCodeForStateExtraction(userCode) {
        return `
// User code execution with state extraction
try {
    ${userCode}
    
    // Extract scene state after user code execution
    if (typeof scene !== 'undefined' && scene) {
        __results.sceneObjects = [];
        __results.materials = [];
        __results.lights = [];
        __results.camera = null;
        
        // Extract materials first (unique materials)
        const processedMaterials = new Set();
        scene.traverse((object) => {
            if (object.material && !processedMaterials.has(object.material.uuid)) {
                processedMaterials.add(object.material.uuid);
                __results.materials.push({
                    uuid: object.material.uuid,
                    type: object.material.constructor.name,
                    color: object.material.color ? object.material.color.getHex() : null,
                    opacity: object.material.opacity,
                    transparent: object.material.transparent,
                    wireframe: object.material.wireframe,
                    roughness: object.material.roughness,
                    metalness: object.material.metalness,
                    matcap: object.material.matcap || null,
                    matcapTexture: object.material.matcap ? (
                        object.material.matcap.image?.src ||
                        object.material.matcap.source?.data?.src
                    ) : null
                });
            }
        });

        // Extract objects and their properties
        scene.traverse((object) => {
            if (object.type === 'Mesh' || object.type === 'Group') {
                __results.sceneObjects.push({
                    uuid: object.uuid,
                    name: object.name,
                    type: object.type,
                    position: [object.position.x, object.position.y, object.position.z],
                    rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
                    scale: [object.scale.x, object.scale.y, object.scale.z],
                    visible: object.visible,
                    geometry: object.geometry ? {
                        type: object.geometry.type,
                        parameters: object.geometry.parameters
                    } : null,
                    material: object.material ? {
                        uuid: object.material.uuid,
                        type: object.material.constructor.name,
                        color: object.material.color ? object.material.color.getHex() : null,
                        opacity: object.material.opacity,
                        transparent: object.material.transparent,
                        wireframe: object.material.wireframe,
                        roughness: object.material.roughness,
                        metalness: object.material.metalness,
                        matcap: object.material.matcap || null,
                        matcapTexture: object.material.matcap ? (
                            object.material.matcap.image?.src ||
                            object.material.matcap.source?.data?.src
                        ) : null
                    } : null
                });
            }
            
            // Extract lights
            if (object.isLight) {
                __results.lights.push({
                    uuid: object.uuid,
                    type: object.type,
                    color: object.color.getHex(),
                    intensity: object.intensity,
                    position: [object.position.x, object.position.y, object.position.z],
                    castShadow: object.castShadow
                });
            }
        });
        
        // Extract camera
        if (typeof camera !== 'undefined' && camera) {
            __results.camera = {
                type: camera.type,
                fov: camera.fov,
                position: [camera.position.x, camera.position.y, camera.position.z],
                near: camera.near,
                far: camera.far
            };
        }
        
        // Extract scene background
        if (scene.background) {
            __results.background = scene.background.getHex ? scene.background.getHex() : scene.background;
        }
        
        __results.executionSuccess = true;
    } else {
        __results.error = 'No scene object found after code execution';
        __results.executionSuccess = false;
    }
    
} catch (error) {
    __results.error = error.message;
    __results.stack = error.stack;
    __results.executionSuccess = false;
}
        `;
    }
    
    /**
     * Update visual editor from extracted code state
     * @param {Object} codeState - Extracted state from code execution
     */
    async updateVisualFromCode(codeState) {
        if (!codeState.executionSuccess) {
            console.warn('⚠️ Code execution was not successful, skipping visual update');
            return;
        }
        
        try {
            // Update scene objects
            if (codeState.sceneObjects) {
                await this.updateSceneObjectsFromCode(codeState.sceneObjects);
            }
            
            // Update materials
            if (codeState.materials) {
                await this.updateMaterialsFromCode(codeState.materials);
            }
            
            // Update lighting
            if (codeState.lights) {
                await this.updateLightingFromCode(codeState.lights);
            }
            
            // Update camera
            if (codeState.camera) {
                await this.updateCameraFromCode(codeState.camera);
            }
            
            // Update scene background
            if (codeState.background !== undefined) {
                await this.updateSceneBackgroundFromCode(codeState.background);
            }
            
            console.log('✅ Visual editor updated from code state');
            
        } catch (error) {
            console.error('❌ Failed to update visual from code:', error);
        }
    }

    /**
     * Update materials from code state (MISSING IMPLEMENTATION FIXED!)
     * @param {Array} materials - Material data from code execution
     */
    async updateMaterialsFromCode(materials) {
        console.log('🎨 Updating materials from code:', materials?.length || 0, 'materials');

        if (!materials || materials.length === 0) {
            console.log('⚠️ No materials to process');
            return;
        }

        for (const materialData of materials) {
            try {
                console.log('🎨 Processing material:', materialData);

                // Find objects in scene that use this material
                const sceneObjects = this.findObjectsWithMaterial(materialData);

                for (const obj of sceneObjects) {
                    // Update ObjectManager data
                    await this.updateObjectMaterialFromCode(obj, materialData);

                    // Update UI if this object is selected
                    const selectedObj = this.objectManager.getSelectedObject();
                    if (selectedObj && selectedObj.sceneObject === obj.sceneObject) {
                        await this.updateMaterialUIFromCode(materialData);
                    }
                }

                console.log('✅ Material processing complete for:', materialData.type);

            } catch (error) {
                console.error('❌ Failed to process material:', materialData, error);
            }
        }
    }

    /**
     * Find objects that use a specific material
     * @param {Object} materialData - Material data from code execution
     * @returns {Array} Objects using this material
     */
    findObjectsWithMaterial(materialData) {
        const results = [];
        const allObjects = this.objectManager.getAllObjects();

        // Search by material UUID if available
        if (materialData.uuid) {
            for (const obj of allObjects) {
                if (obj.sceneObject?.material?.uuid === materialData.uuid) {
                    results.push(obj);
                }
            }
        }

        // If no UUID matches, try to find by material type and properties
        if (results.length === 0 && materialData.type) {
            for (const obj of allObjects) {
                const material = obj.sceneObject?.material;
                if (material && material.constructor.name === materialData.type) {
                    // Additional checks for better matching
                    if (this.materialsMatch(material, materialData)) {
                        results.push(obj);
                    }
                }
            }
        }

        console.log(`🔍 Found ${results.length} objects using material type: ${materialData.type}`);
        return results;
    }

    /**
     * Check if a Three.js material matches the material data
     * @param {THREE.Material} material - Three.js material object
     * @param {Object} materialData - Material data from code
     * @returns {Boolean} Whether materials match
     */
    materialsMatch(material, materialData) {
        // For MatCap materials, check if both have MatCap textures
        if (materialData.type === 'MeshMatcapMaterial') {
            return !!(material.matcap && materialData.matcap);
        }

        // For other materials, basic type matching
        return true;
    }

    /**
     * Update ObjectManager data for an object's material
     * @param {Object} objectData - Object from ObjectManager
     * @param {Object} materialData - Material data from code
     */
    async updateObjectMaterialFromCode(objectData, materialData) {
        console.log('🎨 Updating ObjectManager material for:', objectData.name);

        if (!objectData.material) {
            objectData.material = {};
        }

        // Update basic material properties
        const materialType = this.mapThreeJSTypeToUI(materialData.type);
        objectData.material.type = materialType;

        if (materialData.color !== undefined) {
            objectData.material.color = materialData.color;
        }
        if (materialData.opacity !== undefined) {
            objectData.material.opacity = materialData.opacity;
        }
        if (materialData.transparent !== undefined) {
            objectData.material.transparent = materialData.transparent;
        }
        if (materialData.wireframe !== undefined) {
            objectData.material.wireframe = materialData.wireframe;
        }

        // Handle MatCap materials specifically
        if (materialData.type === 'MeshMatcapMaterial' && materialData.matcap) {
            console.log('🎨 Processing MatCap material data from code execution');

            const matcapTexture = materialData.matcap;
            let textureSrc = null;
            let filename = 'unknown.webp';

            // Extract texture source using multiple strategies
            if (matcapTexture.image?.src) {
                textureSrc = matcapTexture.image.src;
            } else if (matcapTexture.source?.data?.src) {
                textureSrc = matcapTexture.source.data.src;
            }

            if (textureSrc) {
                // Handle blob URLs and extract filename
                if (textureSrc.startsWith('blob:')) {
                    filename = matcapTexture.userData?.originalFilename ||
                              objectData.material.texture?.filename ||
                              'matcap_texture.webp';
                } else {
                    filename = textureSrc.split('/').pop();
                }

                // Update material data
                objectData.material.matcapTexture = textureSrc;
                objectData.material.texture = {
                    filename: filename,
                    path: textureSrc
                };

                console.log('✅ MatCap texture data captured from code:', {
                    source: textureSrc,
                    filename: filename
                });
            }
        }

        // Handle PBR properties
        if (materialData.roughness !== undefined) {
            objectData.material.roughness = materialData.roughness;
        }
        if (materialData.metalness !== undefined) {
            objectData.material.metalness = materialData.metalness;
        }

        console.log('✅ ObjectManager material updated');
    }

    /**
     * Update material UI controls from code execution
     * @param {Object} materialData - Material data from code
     */
    async updateMaterialUIFromCode(materialData) {
        console.log('🎨 Updating material UI from code execution');

        try {
            // Update material type selector
            const materialType = this.mapThreeJSTypeToUI(materialData.type);
            const materialTypeSelect = document.getElementById('material-type');
            if (materialTypeSelect && materialTypeSelect.value !== materialType) {
                materialTypeSelect.value = materialType;
                materialTypeSelect.dispatchEvent(new Event('change'));
            }

            // Update basic properties
            if (materialData.color !== undefined) {
                this.updateUIInput('material-color', materialData.color);
            }
            if (materialData.opacity !== undefined) {
                this.updateUIInput('material-opacity', materialData.opacity);
            }
            if (materialData.wireframe !== undefined) {
                this.updateUIInput('material-wireframe', materialData.wireframe);
            }

            // Handle MatCap UI updates
            if (materialData.type === 'MeshMatcapMaterial' && materialData.matcap) {
                console.log('🎨 Updating MatCap UI from code execution');

                const texturePreview = document.getElementById('texture-preview');
                const textureFilename = document.getElementById('texture-filename');

                if (texturePreview && materialData.matcap.image) {
                    texturePreview.src = materialData.matcap.image.src;
                    texturePreview.style.display = 'block';

                    if (textureFilename) {
                        const filename = materialData.matcap.userData?.originalFilename ||
                                       materialData.matcap.image.src.split('/').pop();
                        textureFilename.textContent = filename;
                        textureFilename.style.display = 'block';
                    }

                    console.log('✅ MatCap UI updated from code execution');
                }
            }

            // Handle PBR properties
            if (materialData.roughness !== undefined) {
                this.updateUIInput('material-roughness', materialData.roughness);
            }
            if (materialData.metalness !== undefined) {
                this.updateUIInput('material-metalness', materialData.metalness);
            }

            console.log('✅ Material UI updated from code execution');

        } catch (error) {
            console.error('❌ Failed to update material UI from code:', error);
        }
    }

    /**
     * Map Three.js material type to UI material type
     * @param {String} threeJSType - Three.js material constructor name
     * @returns {String} UI material type
     */
    mapThreeJSTypeToUI(threeJSType) {
        const typeMap = {
            'MeshMatcapMaterial': 'matcap',
            'MeshStandardMaterial': 'standard',
            'MeshPhongMaterial': 'phong',
            'MeshLambertMaterial': 'lambert',
            'MeshPhysicalMaterial': 'physical',
            'MeshBasicMaterial': 'basic'
        };

        return typeMap[threeJSType] || 'standard';
    }

    /**
     * Update scene objects from code state
     * @param {Array} objects - Scene objects from code
     */
    async updateSceneObjectsFromCode(objects) {
        console.log('🔄 Updating scene objects from code:', objects?.length || 0, 'objects');
        
        if (!objects || objects.length === 0) {
            console.log('⚠️ No objects to process');
            return;
        }
        
        for (const objData of objects) {
            const existingObject = this.scene.getObjectByProperty('uuid', objData.uuid);
            
            if (existingObject) {
                // Update existing object transform
                if (objData.position) {
                    existingObject.position.set(...objData.position);
                }
                if (objData.rotation) {
                    existingObject.rotation.set(...objData.rotation);
                }
                if (objData.scale) {
                    existingObject.scale.set(...objData.scale);
                }
                
                // Update UI controls to reflect changes
                this.updateTransformUI(objData);
                
                // Update material if changed
                if (objData.material && existingObject.material) {
                    this.updateObjectMaterial(existingObject, objData.material);
                }
            } else {
                console.log('🆕 New object detected in scene (not in UI registry):', objData.name || objData.type || 'Unknown');
            }
        }
        
        // Always refresh the Scene Objects panel to reflect any changes
        // This catches objects created directly in the scene via code execution
        console.log('🔄 Refreshing Scene Objects panel...');
        if (this.uiController && this.uiController.updateObjectsList) {
            this.uiController.updateObjectsList();
            console.log('✅ Scene Objects panel refreshed');
        } else {
            console.warn('⚠️ UIController or updateObjectsList method not available');
        }
    }
    
    /**
     * Update transform UI controls
     * @param {Object} objData - Object data with transform
     */
    updateTransformUI(objData) {
        if (objData.position) {
            this.updateUIInput('position-x', objData.position[0]);
            this.updateUIInput('position-y', objData.position[1]);
            this.updateUIInput('position-z', objData.position[2]);
        }
        
        if (objData.rotation) {
            this.updateUIInput('rotation-x', objData.rotation[0]);
            this.updateUIInput('rotation-y', objData.rotation[1]);
            this.updateUIInput('rotation-z', objData.rotation[2]);
        }
        
        if (objData.scale) {
            this.updateUIInput('scale-x', objData.scale[0]);
            this.updateUIInput('scale-y', objData.scale[1]);
            this.updateUIInput('scale-z', objData.scale[2]);
        }
    }
    
    /**
     * Update UI input element value
     * @param {string} inputId - Input element ID
     * @param {number} value - New value
     */
    updateUIInput(inputId, value) {
        const input = document.getElementById(inputId);
        if (input && Math.abs(parseFloat(input.value) - value) > 0.001) {
            input.value = value.toFixed(3);
            
            // Trigger change event to update any listeners
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
    
    /**
     * Update object material from code data
     * @param {THREE.Object3D} object - Three.js object
     * @param {Object} materialData - Material data from code
     */
    updateObjectMaterial(object, materialData) {
        const material = object.material;
        
        if (materialData.color !== null && material.color) {
            material.color.setHex(materialData.color);
            this.updateUIInput('material-color', '#' + materialData.color.toString(16).padStart(6, '0'));
        }
        
        if (materialData.opacity !== undefined) {
            material.opacity = materialData.opacity;
            this.updateUIInput('material-opacity', materialData.opacity);
        }
        
        if (materialData.wireframe !== undefined) {
            material.wireframe = materialData.wireframe;
            const wireframeCheckbox = document.getElementById('material-wireframe');
            if (wireframeCheckbox) wireframeCheckbox.checked = materialData.wireframe;
        }
        
        if (materialData.roughness !== undefined && material.roughness !== undefined) {
            material.roughness = materialData.roughness;
            this.updateUIInput('material-roughness', materialData.roughness);
        }
        
        if (materialData.metalness !== undefined && material.metalness !== undefined) {
            material.metalness = materialData.metalness;
            this.updateUIInput('material-metalness', materialData.metalness);
        }
        
        // Handle MatCap material type and texture
        if (materialData.type === 'MeshMatcapMaterial' && materialData.matcapTexture) {
            console.log('🎨 MatCap material detected in To UI sync:', materialData);

            // Update material type in UI
            const materialTypeSelect = document.getElementById('material-type');
            if (materialTypeSelect) {
                materialTypeSelect.value = 'matcap';
                materialTypeSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Update texture preview in UI
            this.updateMatCapTexturePreview(materialData);

            // Update ObjectManager data for persistence
            const objectInManager = this.findObjectInManager(object);
            if (objectInManager) {
                console.log('🔄 Updating ObjectManager material data with MatCap info');
                objectInManager.material = objectInManager.material || {};
                objectInManager.material.type = 'matcap';
                objectInManager.material.matcapTexture = materialData.matcapTexture;

                if (materialData.texture && materialData.texture.filename) {
                    objectInManager.material.texture = {
                        filename: materialData.texture.filename,
                        path: materialData.matcapTexture
                    };
                }

                // Store additional metadata for better persistence
                objectInManager.material.matCapInfo = {
                    source: materialData.matcapTexture,
                    filename: materialData.texture?.filename || 'unknown.webp',
                    extractedAt: new Date().toISOString()
                };
            } else {
                console.warn('⚠️ Object not found in ObjectManager for MatCap update');
            }
        }
        
        material.needsUpdate = true;
    }
    
    /**
     * Find an object in ObjectManager by matching its scene object
     * @param {THREE.Object3D} sceneObject - The Three.js scene object
     * @returns {Object|null} ObjectManager object data or null
     */
    findObjectInManager(sceneObject) {
        if (!this.objectManager) return null;

        const allObjects = this.objectManager.getAllObjects();
        return allObjects.find(obj => obj.sceneObject === sceneObject) || null;
    }

    /**
     * Update MatCap texture preview in UI
     * @param {Object} materialData - Material data with texture info
     */
    updateMatCapTexturePreview(materialData) {
        const texturePreview = document.getElementById('texture-preview');
        const textureFilename = document.getElementById('texture-filename');
        const materialSection = document.querySelector('.texture-section');

        if (texturePreview && materialData.matcapTexture) {
            try {
                // Update preview image
                texturePreview.src = materialData.matcapTexture;
                texturePreview.style.display = 'block';

                // Update filename display
                if (textureFilename && materialData.texture && materialData.texture.filename) {
                    textureFilename.textContent = materialData.texture.filename;
                    textureFilename.style.display = 'block';
                }

                // Show texture section if hidden
                if (materialSection) {
                    materialSection.style.display = 'block';
                }

                console.log('🎨 MatCap texture preview updated:', materialData.texture?.filename);

            } catch (error) {
                console.warn('⚠️ Failed to update MatCap texture preview:', error);

                // Fallback: show placeholder or filename only
                if (textureFilename && materialData.texture && materialData.texture.filename) {
                    textureFilename.textContent = `MatCap: ${materialData.texture.filename}`;
                    textureFilename.style.display = 'block';
                }
            }
        }
    }
    
    /**
     * Parse code structure to preserve user formatting
     * @param {string} code - Source code
     * @returns {Object} Code structure information
     */
    parseCodeStructure(code) {
        return {
            comments: this.extractComments(code),
            imports: this.extractImports(code),
            variables: this.extractVariables(code),
            functions: this.extractFunctions(code),
            structure: this.extractCodeBlocks(code)
        };
    }
    
    /**
     * Extract comments from code
     * @param {string} code - Source code
     * @returns {Array} Comments with positions
     */
    extractComments(code) {
        const comments = [];
        const lines = code.split('\n');
        
        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('//')) {
                comments.push({
                    line: index,
                    content: trimmed,
                    type: 'single-line'
                });
            }
        });
        
        // Extract block comments
        const blockCommentRegex = /\/\*([\s\S]*?)\*\//g;
        let match;
        while ((match = blockCommentRegex.exec(code)) !== null) {
            comments.push({
                start: match.index,
                end: match.index + match[0].length,
                content: match[0],
                type: 'block'
            });
        }
        
        return comments;
    }
    
    /**
     * Extract imports from code
     * @param {string} code - Source code
     * @returns {Array} Import statements
     */
    extractImports(code) {
        const imports = [];
        const importRegex = /import\s+.*?from\s+['"`][^'"`]+['"`];?/g;
        let match;
        
        while ((match = importRegex.exec(code)) !== null) {
            imports.push({
                statement: match[0],
                start: match.index,
                end: match.index + match[0].length
            });
        }
        
        return imports;
    }
    
    /**
     * Extract variable declarations
     * @param {string} code - Source code
     * @returns {Array} Variable declarations
     */
    extractVariables(code) {
        const variables = [];
        const varRegex = /(const|let|var)\s+(\w+)\s*=/g;
        let match;
        
        while ((match = varRegex.exec(code)) !== null) {
            variables.push({
                type: match[1],
                name: match[2],
                start: match.index,
                end: match.index + match[0].length
            });
        }
        
        return variables;
    }
    
    /**
     * Extract function declarations
     * @param {string} code - Source code
     * @returns {Array} Function declarations
     */
    extractFunctions(code) {
        const functions = [];
        const funcRegex = /function\s+(\w+)\s*\([^)]*\)\s*\{/g;
        let match;
        
        while ((match = funcRegex.exec(code)) !== null) {
            functions.push({
                name: match[1],
                start: match.index,
                declaration: match[0]
            });
        }
        
        return functions;
    }
    
    /**
     * Extract code blocks structure
     * @param {string} code - Source code
     * @returns {Object} Code blocks information
     */
    extractCodeBlocks(code) {
        return {
            hasScene: /scene\s*=/.test(code),
            hasCamera: /camera\s*=/.test(code),
            hasRenderer: /renderer\s*=/.test(code),
            hasAnimationLoop: /requestAnimationFrame|animate/.test(code),
            hasEventHandlers: /addEventListener/.test(code)
        };
    }
    
    /**
     * Generate code from current visual state
     * @param {Object} codeStructure - Existing code structure to preserve
     * @returns {Promise<string>} Updated code
     */
    async generateCodeFromVisualState(codeStructure) {
        console.log('🔧 generateCodeFromVisualState: Starting...');
        
        // Use existing CodeTemplateGenerator but preserve user structure
        const templateGenerator = this.codeEditorManager.exportManager?.codeTemplateGenerator;
        console.log('🔧 templateGenerator available:', !!templateGenerator);
        console.log('🔧 exportManager available:', !!this.codeEditorManager.exportManager);
        
        if (templateGenerator) {
            console.log('🔧 Calling templateGenerator.generateEditableCode()...');
            try {
                const generatedCode = templateGenerator.generateEditableCode({
                    includeComments: true,
                    includeImports: false,  // No imports needed for sync mode
                    includeAnimation: false, // Keep it simple for sync mode
                    moduleFormat: 'sync'    // Use sync mode for executable code
                });
                console.log('🔧 Generated code length:', generatedCode?.length || 0);
                
                // Merge with preserved structure
                console.log('🔧 Merging with code structure...');
                const mergedCode = this.mergeCodeWithStructure(generatedCode, codeStructure);
                console.log('🔧 Final merged code length:', mergedCode?.length || 0);
                return mergedCode;
            } catch (templateError) {
                console.error('🔧 Error in templateGenerator.generateEditableCode():', templateError);
                throw templateError;
            }
        }
        
        console.log('🔧 Using fallback generateBasicCode()');
        return this.generateBasicCode();
    }
    
    /**
     * Merge generated code with preserved user structure
     * @param {string} generatedCode - New generated code
     * @param {Object} codeStructure - Preserved structure
     * @returns {string} Merged code
     */
    mergeCodeWithStructure(generatedCode, codeStructure) {
        // SIMPLIFIED: Just return the generated code without complex merging
        // The complex comment preservation was causing duplication issues
        console.log('🔧 Returning generated code without complex merging to avoid duplication');
        return generatedCode;

        // TODO: Implement safer comment preservation later if needed
        // The previous implementation was causing massive code duplication
    }
    
    /**
     * Update code editor with new content
     * @param {string} newCode - Updated code
     * @param {boolean} preserveCursor - Whether to preserve cursor position
     */
    async updateCodeEditor(newCode, preserveCursor = true) {
        if (this.codeEditorManager) {
            // Use CodeEditorManager's setCode method to update both editors
            this.codeEditorManager.setCode(newCode);
        }
    }
    
    /**
     * Show code execution error in UI
     * @param {Object} errorResult - Error information
     */
    showCodeError(errorResult) {
        // Create or update error display
        let errorDisplay = document.getElementById('code-error-display');
        
        if (!errorDisplay) {
            errorDisplay = document.createElement('div');
            errorDisplay.id = 'code-error-display';
            errorDisplay.className = 'code-error-display';
            
            const codeEditor = document.querySelector('.code-editor');
            if (codeEditor) {
                codeEditor.appendChild(errorDisplay);
            }
        }
        
        errorDisplay.innerHTML = `
            <div class="error-header">
                <span class="error-icon">⚠️</span>
                <span class="error-title">Code Execution Error</span>
                <button class="error-close" onclick="this.parentElement.parentElement.style.display='none'">×</button>
            </div>
            <div class="error-content">
                <div class="error-message">${errorResult.error || 'Unknown error'}</div>
                ${errorResult.stack ? `<div class="error-stack">${errorResult.stack}</div>` : ''}
            </div>
        `;
        
        errorDisplay.style.display = 'block';
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (errorDisplay) {
                errorDisplay.style.display = 'none';
            }
        }, 10000);
    }
    
    /**
     * Capture current visual state
     */
    captureVisualState() {
        // Capture current scene state for comparison
        console.log('🔍 captureVisualState: this.scene =', this.scene);
        console.log('🔍 captureVisualState: this.scene type =', typeof this.scene);
        console.log('🔍 captureVisualState: this.scene.scene =', this.scene?.scene);
        console.log('🔍 captureVisualState: this.scene constructor =', this.scene?.constructor?.name);
        
        if (this.scene && this.objectManager) {
            this.visualState.objects = new Map();
            
            // Get the actual Three.js Scene object (scene might be a wrapper)
            const actualScene = this.scene.scene || this.scene;
            console.log('🔍 actualScene =', actualScene);
            console.log('🔍 actualScene type =', typeof actualScene);
            console.log('🔍 actualScene.traverse =', actualScene?.traverse);
            
            if (actualScene && actualScene.traverse) {
                console.log('✅ About to call actualScene.traverse...');
                actualScene.traverse((object) => {
                    if (object.userData && object.userData.isLoadedObject) {
                        this.visualState.objects.set(object.uuid, {
                            position: object.position.clone(),
                            rotation: object.rotation.clone(),
                            scale: object.scale.clone(),
                            material: object.material ? this.serializeMaterial(object.material) : null
                        });
                    }
                });
                console.log('✅ actualScene.traverse completed successfully');
            } else {
                console.error('❌ Scene object does not have traverse method:', this.scene);
                console.error('❌ actualScene:', actualScene);
            }
        }
    }
    
    /**
     * Capture current code state
     */
    captureCodeState() {
        if (this.codeEditorManager) {
            this.codeState.lastParsedCode = this.codeEditorManager.getCode();
            this.codeState.codeStructure = this.parseCodeStructure(this.codeState.lastParsedCode);
        }
    }
    
    /**
     * Update visual state tracking
     * @param {string} type - Change type
     * @param {Object} data - Change data
     */
    updateVisualState(type, data) {
        // Update internal state tracking based on change type
        switch (type) {
            case 'material':
                // Track material changes
                if (data.objectId) {
                    const current = this.visualState.materials.get(data.objectId) || {};
                    this.visualState.materials.set(data.objectId, {
                        ...current,
                        [data.property]: data.value,
                        lastModified: Date.now()
                    });
                }
                break;
                
            case 'transform':
                // Track transform changes
                if (data.objectId) {
                    const current = this.visualState.transforms.get(data.objectId) || {};
                    this.visualState.transforms.set(data.objectId, {
                        ...current,
                        [data.property]: data.value,
                        lastModified: Date.now()
                    });
                }
                break;
        }
    }
    
    /**
     * Serialize current scene for sandbox context
     * @returns {Object} Serialized scene data
     */
    serializeCurrentScene() {
        const serialized = {
            objects: [],
            lights: [],
            camera: null,
            background: null
        };
        
        if (this.scene) {
            // Get the actual Three.js Scene object (scene might be a wrapper)
            const actualScene = this.scene.scene || this.scene;
            
            if (actualScene && actualScene.traverse) {
                actualScene.traverse((object) => {
                    if (object.isMesh || object.isGroup) {
                        serialized.objects.push({
                            uuid: object.uuid,
                            name: object.name,
                            type: object.type,
                            position: [object.position.x, object.position.y, object.position.z],
                            rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
                            scale: [object.scale.x, object.scale.y, object.scale.z]
                        });
                    }
                    
                    if (object.isLight) {
                        serialized.lights.push({
                            uuid: object.uuid,
                            type: object.type,
                            color: object.color.getHex(),
                            intensity: object.intensity,
                            position: [object.position.x, object.position.y, object.position.z]
                        });
                    }
                });
                
                // Check scene background
                const sceneBackground = actualScene.background;
                if (sceneBackground) {
                    serialized.background = sceneBackground.getHex ? 
                        sceneBackground.getHex() : sceneBackground;
                }
            }
        }
        
        return serialized;
    }
    
    /**
     * Serialize material for state tracking
     * @param {THREE.Material} material - Three.js material
     * @returns {Object} Serialized material
     */
    serializeMaterial(material) {
        const serialized = {
            type: material.type,
            color: material.color ? material.color.getHex() : null,
            opacity: material.opacity,
            transparent: material.transparent,
            wireframe: material.wireframe,
            roughness: material.roughness,
            metalness: material.metalness
        };

        // Enhanced MatCap texture information extraction
        if (material.type === 'MeshMatcapMaterial' && material.matcap) {
            console.log('🎨 Serializing MatCap material:', material);
            console.log('🎨 MatCap texture object:', material.matcap);

            // Multiple extraction strategies for texture information
            let textureSrc = null;
            let filename = null;

            // Strategy 1: Direct source data
            if (material.matcap.source && material.matcap.source.data) {
                if (material.matcap.source.data.src) {
                    textureSrc = material.matcap.source.data.src;
                } else if (material.matcap.source.data.currentSrc) {
                    textureSrc = material.matcap.source.data.currentSrc;
                }
            }

            // Strategy 2: Image element properties
            if (!textureSrc && material.matcap.image) {
                if (material.matcap.image.src) {
                    textureSrc = material.matcap.image.src;
                } else if (material.matcap.image.currentSrc) {
                    textureSrc = material.matcap.image.currentSrc;
                }
            }

            // Strategy 3: User data (if stored during texture loading)
            if (!textureSrc && material.matcap.userData) {
                if (material.matcap.userData.originalPath) {
                    textureSrc = material.matcap.userData.originalPath;
                } else if (material.matcap.userData.filename) {
                    filename = material.matcap.userData.filename;
                }
            }

            // Strategy 4: Material user data
            if (!textureSrc && material.userData && material.userData.matcapTexture) {
                textureSrc = material.userData.matcapTexture;
            }

            // Extract filename if we have a source
            if (textureSrc) {
                // Handle blob URLs by checking if there's a stored original filename
                if (textureSrc.startsWith('blob:')) {
                    // Try to get original filename from user data
                    filename = material.userData?.originalFilename ||
                              material.matcap.userData?.originalFilename ||
                              'matcap_texture.webp';
                    console.log('🎨 Blob URL detected, using stored filename:', filename);
                } else {
                    // Extract filename from path/URL
                    filename = textureSrc.split('/').pop();
                }

                serialized.matcapTexture = textureSrc;
                serialized.texture = { filename };

                console.log('🎨 MatCap texture data captured:', {
                    source: textureSrc,
                    filename: filename,
                    isBlob: textureSrc.startsWith('blob:')
                });
            } else {
                console.warn('⚠️ Could not extract MatCap texture source:', material.matcap);
                // Fallback: create a generic texture reference
                serialized.matcapTexture = 'unknown';
                serialized.texture = { filename: 'unknown_matcap.webp' };
            }
        }

        // Handle other texture types (diffuse, normal, etc.)
        if (material.map && material.map.image) {
            const textureInfo = this.extractTextureInfo(material.map);
            if (textureInfo) {
                serialized.diffuseTexture = textureInfo.source;
                serialized.diffuseTextureFile = textureInfo.filename;
            }
        }

        return serialized;
    }

    /**
     * Extract texture information from a Three.js texture
     * @param {THREE.Texture} texture - Three.js texture object
     * @returns {Object|null} Texture info with source and filename
     */
    extractTextureInfo(texture) {
        if (!texture || !texture.image) return null;

        let source = null;
        let filename = null;

        // Try multiple extraction strategies
        if (texture.image.src) {
            source = texture.image.src;
        } else if (texture.image.currentSrc) {
            source = texture.image.currentSrc;
        } else if (texture.source && texture.source.data && texture.source.data.src) {
            source = texture.source.data.src;
        }

        // Check user data for original filename
        if (texture.userData && texture.userData.originalFilename) {
            filename = texture.userData.originalFilename;
        } else if (source) {
            filename = source.startsWith('blob:') ? 'texture.webp' : source.split('/').pop();
        }

        return source ? { source, filename } : null;
    }
    
    /**
     * Add event listener with cleanup tracking
     * @param {string} eventName - Event name
     * @param {Function} handler - Event handler
     */
    addEventListener(eventName, handler) {
        document.addEventListener(eventName, handler);
        
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(handler);
    }
    
    /**
     * Update viewport to reflect code changes
     * @param {Object} codeState - Extracted code state
     */
    updateViewport(codeState) {
        // Trigger a render update
        if (this.objectManager && this.objectManager.render) {
            this.objectManager.render();
        }
    }
    
    /**
     * Generate basic code template
     * @returns {string} Basic Three.js code
     */
    generateBasicCode() {
        return `
// Basic Three.js Scene
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Basic cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();
        `.trim();
    }
    
    /**
     * Get synchronization status
     * @returns {Object} Current sync status
     */
    getSyncStatus() {
        return {
            ...this.syncState,
            sandboxStatus: this.codeSandbox.getStatus(),
            lastVisualUpdate: this.syncState.lastVisualChange,
            lastCodeUpdate: this.syncState.lastCodeChange,
            activeDirection: this.syncState.syncDirection
        };
    }
    
    /**
     * Manual sync from UI to Code (for "From UI" button)
     * @returns {Promise<boolean>} Success status
     */
    async manualSyncFromUI() {
        console.log('🔄 Manual sync: UI → Code');
        
        try {
            this.syncState.isVisualSyncing = true;
            
            // Force capture current visual state
            console.log('📋 Step 1: Capturing visual state...');
            this.captureVisualState();
            
            // Generate code from current visual state
            console.log('📋 Step 2: Getting current code...');
            const currentCode = this.codeEditorManager.getCode();
            console.log('📋 Current code length:', currentCode?.length || 0);
            
            console.log('📋 Step 3: Parsing code structure...');
            const codeStructure = this.parseCodeStructure(currentCode);
            
            console.log('📋 Step 4: Generating code from visual state...');
            const updatedCode = await this.generateCodeFromVisualState(codeStructure);
            console.log('📋 Updated code length:', updatedCode?.length || 0);
            
            // Update code editor
            console.log('📋 Step 5: Updating code editor...');
            await this.updateCodeEditor(updatedCode, true);
            
            console.log('✅ Manual UI → Code sync completed');
            return true;
            
        } catch (error) {
            console.error('❌ Manual UI → Code sync failed:', error);
            console.error('❌ Error details:', {
                message: error.message,
                stack: error.stack
            });
            return false;
        } finally {
            this.syncState.isVisualSyncing = false;
        }
    }
    
    /**
     * Manual sync from Code to UI (for "To UI" button)
     * @returns {Promise<boolean>} Success status
     */
    async manualSyncFromCode() {
        console.log('🔄 Manual sync: Code → UI');
        
        try {
            this.syncState.isCodeSyncing = true;
            
            // Get current code and execute it
            const currentCode = this.codeEditorManager.getCode();
            
            // Try sandbox execution first, fall back to direct execution if it fails
            let executionResult;
            try {
                executionResult = await this.executeCodeInSandbox(currentCode);
            } catch (sandboxError) {
                console.log('🔄 Sandbox execution failed, using direct execution fallback...');
                // Use direct execution as fallback (like CodeEditorManager does)
                executionResult = await this.executeCodeDirectly(currentCode);
            }
            
            if (executionResult && executionResult.success) {
                // Update visual editor and viewport
                await this.updateVisualFromCode(executionResult.result);
                this.updateViewport(executionResult.result);
                
                console.log('✅ Manual Code → UI sync completed');
                return true;
            } else {
                throw new Error(executionResult.error || 'Code execution failed');
            }
            
        } catch (error) {
            console.error('❌ Manual Code → UI sync failed:', error);
            return false;
        } finally {
            this.syncState.isCodeSyncing = false;
        }
    }
    
    /**
     * Execute code directly (fallback when sandbox fails)
     * @param {string} code - The code to execute
     * @returns {Promise<Object>} Execution result
     */
    async executeCodeDirectly(code) {
        console.log('🔄 Executing code directly (fallback mode)...');
        
        try {
            // Create a simple execution context that captures scene state
            const scene = this.scene.scene;
            let capturedObjects = [];
            
            // Capture objects before execution
            const beforeCount = scene.children.length;
            
            // Execute the code in a safe context
            const executeInContext = new Function('THREE', 'scene', 'console', code);
            executeInContext(window.THREE, scene, console);
            
            // Capture objects after execution
            const afterCount = scene.children.length;
            
            // Extract newly added objects (simple approach)
            scene.traverse((child) => {
                if (child.isMesh || child.isGroup || child.isObject3D) {
                    capturedObjects.push({
                        id: child.uuid,
                        name: child.name || `Object_${child.uuid.slice(0, 8)}`,
                        type: child.type,
                        position: child.position.toArray(),
                        rotation: child.rotation.toArray(),
                        scale: child.scale.toArray(),
                        visible: child.visible,
                        geometry: child.geometry ? {
                            type: child.geometry.type,
                            vertices: child.geometry.attributes?.position?.count || 0
                        } : null,
                        material: child.material ? this.serializeMaterial(child.material) : null
                    });
                }
            });
            
            console.log(`✅ Direct execution completed. Objects: ${beforeCount} → ${afterCount}`);
            
            return {
                success: true,
                result: {
                    executionSuccess: true,
                    sceneObjects: capturedObjects,  // Use sceneObjects instead of objects
                    objects: capturedObjects,        // Keep objects for compatibility
                    objectCount: afterCount - beforeCount,
                    scene: {
                        children: scene.children.length
                    }
                }
            };
            
        } catch (error) {
            console.error('❌ Direct execution failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Enhanced sync status for debugging
     * @returns {Object} Comprehensive sync status
     */
    getEnhancedSyncStatus() {
        return {
            initialized: this.codeSandbox?.isInitialized || false,
            sandboxReady: this.codeSandbox?.isReady || false,
            visualSyncing: this.syncState.isVisualSyncing,
            codeSyncing: this.syncState.isCodeSyncing,
            lastVisualChange: this.syncState.lastVisualChange,
            lastCodeChange: this.syncState.lastCodeChange,
            syncDirection: this.syncState.syncDirection,
            preserveCodeStructure: this.syncState.preserveCodeStructure,
            visualStateSize: this.visualState.objects.size,
            codeStateLength: this.codeState.lastParsedCode.length,
            eventListenersCount: this.eventListeners.size,
            pendingTimers: {
                visual: !!this.visualSyncTimer,
                code: !!this.codeSyncTimer
            }
        };
    }

    /**
     * Clean up resources and event listeners
     */
    async cleanup() {
        console.log('🧹 Cleaning up SyncManager...');
        
        // Clear timers
        if (this.visualSyncTimer) clearTimeout(this.visualSyncTimer);
        if (this.codeSyncTimer) clearTimeout(this.codeSyncTimer);
        
        // Remove event listeners
        for (const [eventName, handlers] of this.eventListeners) {
            handlers.forEach(handler => {
                document.removeEventListener(eventName, handler);
            });
        }
        this.eventListeners.clear();
        
        // Cleanup CodeSandbox
        if (this.codeSandbox) {
            await this.codeSandbox.cleanup();
        }
        
        console.log('✅ SyncManager cleanup completed');
    }
}