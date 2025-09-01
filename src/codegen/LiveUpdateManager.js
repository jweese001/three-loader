import * as THREE from 'three';

/**
 * LiveUpdateManager - Handles real-time viewport updates from parsed code changes
 * Part of Phase 2: Live Code Generation & Compilation system
 */
export class LiveUpdateManager {
    constructor(scene, objectManager, codeCompiler) {
        this.scene = scene;
        this.objectManager = objectManager;
        this.codeCompiler = codeCompiler;
        
        // Update state management
        this.isUpdating = false;
        this.updateQueue = [];
        this.debounceTimeout = null;
        this.debounceDelay = 300; // 300ms debounce
        
        // Performance monitoring
        this.updateStats = {
            totalUpdates: 0,
            averageUpdateTime: 0,
            lastUpdateTime: 0,
            errorCount: 0
        };
        
        // Fallback state for error recovery
        this.lastValidMaterialStates = new Map();
        this.lastValidTransformStates = new Map();
        this.lastValidLightingState = null;
        
        console.log('⚡ LiveUpdateManager initialized');
    }
    
    /**
     * Start live updates with debounced compilation
     * @param {MonacoEditor} editor - Monaco editor instance
     */
    startLiveUpdates(editor) {
        if (!editor) {
            console.error('❌ Cannot start live updates: editor is null');
            return;
        }
        
        console.log('🚀 Starting live updates with 300ms debounce...');
        
        // Listen for content changes in Monaco editor
        editor.onDidChangeModelContent((event) => {
            if (this.isUpdating) return; // Prevent recursive updates
            
            // Clear existing debounce timeout
            if (this.debounceTimeout) {
                clearTimeout(this.debounceTimeout);
            }
            
            // Set new debounce timeout
            this.debounceTimeout = setTimeout(() => {
                this.handleCodeChange(editor.getValue());
            }, this.debounceDelay);
        });
        
        // Store initial valid state
        this.captureInitialState();
        
        console.log('✅ Live updates started successfully');
    }
    
    /**
     * Handle code change with compilation and updates
     * @param {string} code - Updated code from editor
     */
    async handleCodeChange(code) {
        const startTime = performance.now();
        
        try {
            console.log('🔄 Processing code change...');
            
            // Parse code for changes
            const parseResult = await this.codeCompiler.parseCode(code);
            
            if (!parseResult) {
                console.log('📝 No changes detected, skipping update');
                return;
            }
            
            if (parseResult.error) {
                console.error('❌ Code parsing failed:', parseResult.errors);
                this.handleCompilationError(parseResult.errors);
                return;
            }
            
            // Apply changes to viewport
            const updateResult = await this.applyChanges(parseResult);
            
            if (updateResult.success) {
                const endTime = performance.now();
                const updateTime = endTime - startTime;
                
                this.updatePerformanceStats(updateTime);
                console.log(`⚡ Live update completed in ${updateTime.toFixed(2)}ms`);
            } else {
                console.error('❌ Failed to apply changes:', updateResult.error);
                this.handleUpdateError(updateResult.error);
            }
            
        } catch (error) {
            console.error('❌ Live update error:', error.message);
            this.handleUpdateError(error);
        }
    }
    
    /**
     * Apply parsed changes to the Three.js scene
     * @param {Object} changes - Parsed changes from CodeCompiler
     * @returns {Promise<Object>} Update result
     */
    async applyChanges(changes) {
        this.isUpdating = true;
        
        try {
            const results = {
                materialsUpdated: 0,
                transformsUpdated: 0,
                lightingUpdated: false,
                sceneConfigUpdated: false,
                errors: []
            };
            
            // Apply material changes
            if (changes.materials && changes.materials.size > 0) {
                const materialResult = await this.applyMaterialChanges(changes.materials);
                results.materialsUpdated = materialResult.updated;
                results.errors.push(...materialResult.errors);
            }
            
            // Apply transform changes
            if (changes.transforms && changes.transforms.size > 0) {
                const transformResult = await this.applyTransformChanges(changes.transforms);
                results.transformsUpdated = transformResult.updated;
                results.errors.push(...transformResult.errors);
            }
            
            // Apply lighting changes
            if (changes.lighting && Object.keys(changes.lighting).length > 0) {
                const lightingResult = await this.applyLightingChanges(changes.lighting);
                results.lightingUpdated = lightingResult.updated;
                results.errors.push(...lightingResult.errors);
            }
            
            // Apply scene config changes
            if (changes.sceneConfig && Object.keys(changes.sceneConfig).length > 0) {
                const sceneResult = await this.applySceneConfigChanges(changes.sceneConfig);
                results.sceneConfigUpdated = sceneResult.updated;
                results.errors.push(...sceneResult.errors);
            }
            
            this.isUpdating = false;
            
            return {
                success: results.errors.length === 0,
                results,
                error: results.errors.length > 0 ? results.errors : null
            };
            
        } catch (error) {
            this.isUpdating = false;
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Apply material changes to objects
     * @param {Map} materialChanges - Material changes map
     * @returns {Promise<Object>} Update result
     */
    async applyMaterialChanges(materialChanges) {
        const result = { updated: 0, errors: [] };
        
        try {
            const allObjects = this.objectManager.getAllObjects();
            
            for (const [materialId, materialProps] of materialChanges) {
                try {
                    // Find object with this material ID (1-based indexing)
                    const objectIndex = materialId - 1;
                    const targetObject = allObjects[objectIndex];
                    
                    if (!targetObject) {
                        result.errors.push(`Material ${materialId}: No object found at index ${objectIndex}`);
                        continue;
                    }
                    
                    // Store current state for rollback
                    this.lastValidMaterialStates.set(targetObject.id, { ...targetObject.material });
                    
                    // Update object manager's material data
                    const updateSuccess = this.objectManager.updateObjectMaterial(targetObject.id, materialProps);
                    
                    if (updateSuccess) {
                        result.updated++;
                        console.log(`✅ Updated material for object: ${targetObject.name}`);
                    } else {
                        result.errors.push(`Failed to update material for object ID: ${targetObject.id}`);
                    }
                    
                } catch (error) {
                    result.errors.push(`Material ${materialId} update failed: ${error.message}`);
                }
            }
            
        } catch (error) {
            result.errors.push(`Material updates failed: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Apply transform changes to objects
     * @param {Map} transformChanges - Transform changes map
     * @returns {Promise<Object>} Update result
     */
    async applyTransformChanges(transformChanges) {
        const result = { updated: 0, errors: [] };
        
        try {
            const allObjects = this.objectManager.getAllObjects();
            
            for (const [objectId, transformProps] of transformChanges) {
                try {
                    // Find object by sequential ID (1-based)
                    const objectIndex = objectId - 1;
                    const targetObject = allObjects[objectIndex];
                    
                    if (!targetObject) {
                        result.errors.push(`Transform ${objectId}: No object found at index ${objectIndex}`);
                        continue;
                    }
                    
                    // Store current state for rollback
                    this.lastValidTransformStates.set(targetObject.id, {
                        position: { ...targetObject.transform.position },
                        rotation: { ...targetObject.transform.rotation },
                        scale: { ...targetObject.transform.scale }
                    });
                    
                    // Prepare transform data for ObjectManager
                    const transformData = {};
                    if (transformProps.position) transformData.position = transformProps.position;
                    if (transformProps.rotation) transformData.rotation = transformProps.rotation;
                    if (transformProps.scale) transformData.scale = transformProps.scale;
                    
                    // Update object manager's transform data
                    const updateSuccess = this.objectManager.updateObjectTransform(targetObject.id, transformData);
                    
                    if (updateSuccess) {
                        result.updated++;
                        console.log(`✅ Updated transform for object: ${targetObject.name}`);
                    } else {
                        result.errors.push(`Failed to update transform for object ID: ${targetObject.id}`);
                    }
                    
                } catch (error) {
                    result.errors.push(`Transform ${objectId} update failed: ${error.message}`);
                }
            }
            
        } catch (error) {
            result.errors.push(`Transform updates failed: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Apply lighting changes to scene
     * @param {Object} lightingChanges - Lighting changes object
     * @returns {Promise<Object>} Update result
     */
    async applyLightingChanges(lightingChanges) {
        const result = { updated: false, errors: [] };
        
        try {
            // Store current lighting state for rollback
            this.lastValidLightingState = this.getCurrentLightingState();
            
            // Get scene's Three.js scene
            const threeScene = this.scene.scene || this.scene;
            
            // Update ambient light
            if (lightingChanges.ambient) {
                const ambientLight = threeScene.children.find(child => 
                    child.type === 'AmbientLight'
                );
                
                if (ambientLight) {
                    if (lightingChanges.ambient.color !== undefined) {
                        ambientLight.color.setHex(lightingChanges.ambient.color);
                    }
                    if (lightingChanges.ambient.intensity !== undefined) {
                        ambientLight.intensity = lightingChanges.ambient.intensity;
                    }
                    result.updated = true;
                }
            }
            
            // Update directional lights
            if (lightingChanges.directional || lightingChanges.fill) {
                const directionalLights = threeScene.children.filter(child => 
                    child.type === 'DirectionalLight'
                );
                
                // Update main directional light
                if (lightingChanges.directional && directionalLights[0]) {
                    const mainLight = directionalLights[0];
                    this.updateLightProperties(mainLight, lightingChanges.directional);
                    result.updated = true;
                }
                
                // Update fill light
                if (lightingChanges.fill && directionalLights[1]) {
                    const fillLight = directionalLights[1];
                    this.updateLightProperties(fillLight, lightingChanges.fill);
                    result.updated = true;
                }
            }
            
            // Update point lights
            if (lightingChanges.pointLights) {
                const pointLights = threeScene.children.filter(child => 
                    child.type === 'PointLight'
                );
                
                lightingChanges.pointLights.forEach((lightProps, index) => {
                    if (pointLights[index]) {
                        this.updateLightProperties(pointLights[index], lightProps);
                        if (lightProps.distance !== undefined) {
                            pointLights[index].distance = lightProps.distance;
                        }
                        result.updated = true;
                    }
                });
            }
            
        } catch (error) {
            result.errors.push(`Lighting updates failed: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Update individual light properties
     * @param {THREE.Light} light - Three.js light object
     * @param {Object} props - Light properties to update
     */
    updateLightProperties(light, props) {
        if (props.color !== undefined) {
            light.color.setHex(props.color);
        }
        if (props.intensity !== undefined) {
            light.intensity = props.intensity;
        }
        if (props.position !== undefined) {
            light.position.set(...props.position);
        }
        if (props.castShadow !== undefined) {
            light.castShadow = props.castShadow;
        }
    }
    
    /**
     * Apply scene configuration changes
     * @param {Object} sceneChanges - Scene config changes
     * @returns {Promise<Object>} Update result
     */
    async applySceneConfigChanges(sceneChanges) {
        const result = { updated: false, errors: [] };
        
        try {
            const threeScene = this.scene.scene || this.scene;
            
            // Update background color
            if (sceneChanges.backgroundColor !== undefined) {
                threeScene.background = new THREE.Color(sceneChanges.backgroundColor);
                result.updated = true;
                console.log(`✅ Updated scene background color: 0x${sceneChanges.backgroundColor.toString(16).padStart(6, '0')}`);
            }
            
            // Update camera properties
            if (sceneChanges.camera) {
                const camera = this.scene.camera;
                if (camera) {
                    if (sceneChanges.camera.fov !== undefined) {
                        camera.fov = sceneChanges.camera.fov;
                        camera.updateProjectionMatrix();
                        result.updated = true;
                    }
                    if (sceneChanges.camera.position !== undefined) {
                        camera.position.set(...sceneChanges.camera.position);
                        result.updated = true;
                    }
                    if (sceneChanges.camera.near !== undefined) {
                        camera.near = sceneChanges.camera.near;
                        camera.updateProjectionMatrix();
                        result.updated = true;
                    }
                    if (sceneChanges.camera.far !== undefined) {
                        camera.far = sceneChanges.camera.far;
                        camera.updateProjectionMatrix();
                        result.updated = true;
                    }
                }
            }
            
        } catch (error) {
            result.errors.push(`Scene config updates failed: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Handle compilation errors with user feedback
     * @param {Array} errors - Compilation error array
     */
    handleCompilationError(errors) {
        this.updateStats.errorCount++;
        
        console.group('❌ Compilation Errors:');
        errors.forEach(error => {
            console.error(`${error.type}: ${error.message}`);
        });
        console.groupEnd();
        
        // TODO: In future, display errors in Monaco editor with decorations
        // For now, we rely on console output
    }
    
    /**
     * Handle update errors with fallback recovery
     * @param {string|Array} error - Update error(s)
     */
    handleUpdateError(error) {
        this.updateStats.errorCount++;
        
        console.error('❌ Live update error:', error);
        
        // TODO: Implement rollback to last valid state
        // For now, we log the error and continue
    }
    
    /**
     * Get current lighting state for rollback
     * @returns {Object} Current lighting state
     */
    getCurrentLightingState() {
        const state = {};
        
        try {
            const threeScene = this.scene.scene || this.scene;
            
            // Capture ambient light
            const ambientLight = threeScene.children.find(child => child.type === 'AmbientLight');
            if (ambientLight) {
                state.ambient = {
                    color: ambientLight.color.getHex(),
                    intensity: ambientLight.intensity
                };
            }
            
            // Capture directional lights
            const directionalLights = threeScene.children.filter(child => child.type === 'DirectionalLight');
            state.directional = directionalLights.map(light => ({
                color: light.color.getHex(),
                intensity: light.intensity,
                position: light.position.toArray(),
                castShadow: light.castShadow
            }));
            
            // Capture point lights
            const pointLights = threeScene.children.filter(child => child.type === 'PointLight');
            state.pointLights = pointLights.map(light => ({
                color: light.color.getHex(),
                intensity: light.intensity,
                position: light.position.toArray(),
                distance: light.distance
            }));
            
        } catch (error) {
            console.error('❌ Failed to capture lighting state:', error.message);
        }
        
        return state;
    }
    
    /**
     * Capture initial state for error recovery
     */
    captureInitialState() {
        try {
            const allObjects = this.objectManager.getAllObjects();
            
            // Capture initial material states
            allObjects.forEach(obj => {
                this.lastValidMaterialStates.set(obj.id, { ...obj.material });
                this.lastValidTransformStates.set(obj.id, {
                    position: { ...obj.transform.position },
                    rotation: { ...obj.transform.rotation },
                    scale: { ...obj.transform.scale }
                });
            });
            
            // Capture initial lighting state
            this.lastValidLightingState = this.getCurrentLightingState();
            
            console.log('📸 Captured initial scene state for error recovery');
            
        } catch (error) {
            console.error('❌ Failed to capture initial state:', error.message);
        }
    }
    
    /**
     * Update performance statistics
     * @param {number} updateTime - Update time in milliseconds
     */
    updatePerformanceStats(updateTime) {
        this.updateStats.totalUpdates++;
        this.updateStats.lastUpdateTime = updateTime;
        
        // Calculate rolling average
        if (this.updateStats.totalUpdates === 1) {
            this.updateStats.averageUpdateTime = updateTime;
        } else {
            this.updateStats.averageUpdateTime = 
                (this.updateStats.averageUpdateTime * (this.updateStats.totalUpdates - 1) + updateTime) / 
                this.updateStats.totalUpdates;
        }
    }
    
    /**
     * Get performance statistics
     * @returns {Object} Performance stats
     */
    getPerformanceStats() {
        return { ...this.updateStats };
    }
    
    /**
     * Stop live updates
     */
    stopLiveUpdates() {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = null;
        }
        
        this.isUpdating = false;
        console.log('⏹️ Live updates stopped');
    }
    
    /**
     * Reset live update manager state
     */
    reset() {
        this.stopLiveUpdates();
        this.updateQueue = [];
        this.lastValidMaterialStates.clear();
        this.lastValidTransformStates.clear();
        this.lastValidLightingState = null;
        this.updateStats = {
            totalUpdates: 0,
            averageUpdateTime: 0,
            lastUpdateTime: 0,
            errorCount: 0
        };
        
        console.log('🔄 LiveUpdateManager state reset');
    }
}