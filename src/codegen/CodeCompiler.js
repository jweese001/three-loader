import * as THREE from 'three';

/**
 * CodeCompiler - Parses and executes user-edited Three.js code safely
 * Part of Phase 2: Live Code Generation & Compilation system
 */
export class CodeCompiler {
    constructor(scene, objectManager) {
        this.scene = scene;
        this.objectManager = objectManager;
        
        // Compilation state
        this.lastCompiledCode = '';
        this.lastValidState = null;
        this.compilationErrors = [];
        this.isCompiling = false;
        
        // Change detection
        this.lastKnownState = {
            materials: new Map(),
            transforms: new Map(),
            lighting: {},
            sceneConfig: {}
        };
        
        console.log('🔧 CodeCompiler initialized');
    }
    
    /**
     * Parse edited code and extract changes
     * @param {string} code - The edited Three.js code
     * @returns {Promise<Object>} Parsed changes object
     */
    async parseCode(code) {
        if (this.isCompiling) {
            console.log('⏳ Compilation already in progress, skipping...');
            return null;
        }
        
        this.isCompiling = true;
        this.compilationErrors = [];
        
        try {
            // Skip if code hasn't changed
            if (code === this.lastCompiledCode) {
                this.isCompiling = false;
                return null;
            }
            
            console.log('🔍 Parsing code changes...');
            
            const changes = {
                materials: this.extractMaterialChanges(code),
                transforms: this.extractTransformChanges(code),
                lighting: this.extractLightingChanges(code),
                sceneConfig: this.extractSceneConfigChanges(code),
                timestamp: Date.now()
            };
            
            // Validate changes before returning
            const validationResult = this.validateChanges(changes);
            if (!validationResult.valid) {
                this.compilationErrors = validationResult.errors;
                console.warn('⚠️ Code validation failed:', validationResult.errors);
                this.isCompiling = false;
                return { error: 'Validation failed', errors: validationResult.errors };
            }
            
            this.lastCompiledCode = code;
            this.lastValidState = changes;
            
            console.log('✅ Code parsed successfully, changes detected:', Object.keys(changes).filter(k => k !== 'timestamp'));
            
            this.isCompiling = false;
            return changes;
            
        } catch (error) {
            this.compilationErrors.push({
                type: 'compilation_error',
                message: error.message,
                line: this.extractLineNumber(error),
                column: this.extractColumnNumber(error)
            });
            
            console.error('❌ Code compilation failed:', error.message);
            this.isCompiling = false;
            return { error: 'Compilation failed', errors: this.compilationErrors };
        }
    }
    
    /**
     * Extract material property changes from code
     * @param {string} code - The Three.js code
     * @returns {Map<number, Object>} Material changes mapped by material ID
     */
    extractMaterialChanges(code) {
        const materialChanges = new Map();
        
        try {
            // Match MATERIAL_N definitions
            const materialRegex = /const\s+MATERIAL_(\d+)\s*=\s*\{([^}]+)\}/g;
            let match;
            
            while ((match = materialRegex.exec(code)) !== null) {
                const materialId = parseInt(match[1]);
                const materialContent = match[2];
                
                const materialProps = this.parseMaterialProperties(materialContent);
                
                // Compare with last known state
                const lastState = this.lastKnownState.materials.get(materialId);
                if (!lastState || this.hasPropertyChanges(materialProps, lastState)) {
                    materialChanges.set(materialId, materialProps);
                    this.lastKnownState.materials.set(materialId, { ...materialProps });
                }
            }
            
        } catch (error) {
            console.error('❌ Failed to extract material changes:', error.message);
        }
        
        return materialChanges;
    }
    
    /**
     * Parse material properties from code block
     * @param {string} content - Material definition content
     * @returns {Object} Parsed material properties
     */
    parseMaterialProperties(content) {
        const props = {};
        
        // Parse color
        const colorMatch = content.match(/color:\s*['"`]([^'"`]+)['"`]/);
        if (colorMatch) props.color = colorMatch[1];
        
        // Parse wireframe
        const wireframeMatch = content.match(/wireframe:\s*(true|false)/);
        if (wireframeMatch) props.wireframe = wireframeMatch[1] === 'true';
        
        // Parse opacity
        const opacityMatch = content.match(/opacity:\s*([\d.]+)/);
        if (opacityMatch) props.opacity = parseFloat(opacityMatch[1]);
        
        // Parse roughness
        const roughnessMatch = content.match(/roughness:\s*([\d.]+)/);
        if (roughnessMatch) props.roughness = parseFloat(roughnessMatch[1]);
        
        // Parse metalness
        const metalnessMatch = content.match(/metalness:\s*([\d.]+)/);
        if (metalnessMatch) props.metalness = parseFloat(metalnessMatch[1]);
        
        // Parse transparent
        const transparentMatch = content.match(/transparent:\s*(true|false)/);
        if (transparentMatch) props.transparent = transparentMatch[1] === 'true';
        
        return props;
    }
    
    /**
     * Extract transform changes from code
     * @param {string} code - The Three.js code
     * @returns {Map<number, Object>} Transform changes mapped by object ID
     */
    extractTransformChanges(code) {
        const transformChanges = new Map();
        
        try {
            // Match OBJECT_N_CONFIG definitions
            const objectRegex = /const\s+([A-Z_]+)_CONFIG\s*=\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/g;
            let match;
            let objectId = 1; // Track object IDs sequentially
            
            while ((match = objectRegex.exec(code)) !== null) {
                const objectName = match[1];
                const objectContent = match[2];
                
                // Extract transform block from object content
                const transformMatch = objectContent.match(/transform:\s*\{([^}]+(?:\[[^\]]*\][^}]*)*)\}/s);
                if (transformMatch) {
                    const transformContent = transformMatch[1];
                    const transformProps = this.parseTransformProperties(transformContent);
                    
                    // Compare with last known state
                    const lastState = this.lastKnownState.transforms.get(objectId);
                    if (!lastState || this.hasPropertyChanges(transformProps, lastState)) {
                        transformChanges.set(objectId, {
                            objectName,
                            ...transformProps
                        });
                        this.lastKnownState.transforms.set(objectId, { ...transformProps });
                    }
                }
                
                objectId++;
            }
            
        } catch (error) {
            console.error('❌ Failed to extract transform changes:', error.message);
        }
        
        return transformChanges;
    }
    
    /**
     * Parse transform properties from code block
     * @param {string} content - Transform definition content
     * @returns {Object} Parsed transform properties
     */
    parseTransformProperties(content) {
        const props = {};
        
        try {
            // Parse position array
            const positionMatch = content.match(/position:\s*\[\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\]/);
            if (positionMatch) {
                props.position = {
                    x: parseFloat(positionMatch[1]),
                    y: parseFloat(positionMatch[2]),
                    z: parseFloat(positionMatch[3])
                };
            }
            
            // Parse rotation array
            const rotationMatch = content.match(/rotation:\s*\[\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\]/);
            if (rotationMatch) {
                props.rotation = {
                    x: parseFloat(rotationMatch[1]),
                    y: parseFloat(rotationMatch[2]),
                    z: parseFloat(rotationMatch[3])
                };
            }
            
            // Parse scale array
            const scaleMatch = content.match(/scale:\s*\[\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\]/);
            if (scaleMatch) {
                props.scale = {
                    x: parseFloat(scaleMatch[1]),
                    y: parseFloat(scaleMatch[2]),
                    z: parseFloat(scaleMatch[3])
                };
            }
            
        } catch (error) {
            console.error('❌ Failed to parse transform properties:', error.message);
        }
        
        return props;
    }
    
    /**
     * Extract lighting changes from code
     * @param {string} code - The Three.js code
     * @returns {Object} Lighting configuration changes
     */
    extractLightingChanges(code) {
        const lightingChanges = {};
        
        try {
            // Match LIGHTING_CONFIG definition
            const lightingMatch = code.match(/const\s+LIGHTING_CONFIG\s*=\s*\{([^}]+(?:\{[^}]*\}[^}]*)*(?:\[[^\]]*\][^}]*)*)\}/s);
            if (lightingMatch) {
                const lightingContent = lightingMatch[1];
                
                // Parse ambient light
                const ambientMatch = lightingContent.match(/ambient:\s*\{([^}]+)\}/);
                if (ambientMatch) {
                    lightingChanges.ambient = this.parseLightProperties(ambientMatch[1]);
                }
                
                // Parse directional light
                const directionalMatch = lightingContent.match(/directional:\s*\{([^}]+(?:\[[^\]]*\][^}]*)*)\}/);
                if (directionalMatch) {
                    lightingChanges.directional = this.parseLightProperties(directionalMatch[1]);
                }
                
                // Parse fill light
                const fillMatch = lightingContent.match(/fill:\s*\{([^}]+(?:\[[^\]]*\][^}]*)*)\}/);
                if (fillMatch) {
                    lightingChanges.fill = this.parseLightProperties(fillMatch[1]);
                }
                
                // Parse point lights array
                const pointLightsMatch = lightingContent.match(/pointLights:\s*\[([^\]]+)\]/s);
                if (pointLightsMatch) {
                    lightingChanges.pointLights = this.parsePointLightsArray(pointLightsMatch[1]);
                }
            }
            
        } catch (error) {
            console.error('❌ Failed to extract lighting changes:', error.message);
        }
        
        return lightingChanges;
    }
    
    /**
     * Parse light properties from code block
     * @param {string} content - Light properties content
     * @returns {Object} Parsed light properties
     */
    parseLightProperties(content) {
        const props = {};
        
        // Parse color (hex)
        const colorMatch = content.match(/color:\s*(0x[a-fA-F0-9]+)/);
        if (colorMatch) props.color = parseInt(colorMatch[1], 16);
        
        // Parse intensity
        const intensityMatch = content.match(/intensity:\s*([\d.]+)/);
        if (intensityMatch) props.intensity = parseFloat(intensityMatch[1]);
        
        // Parse position array
        const positionMatch = content.match(/position:\s*\[\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\]/);
        if (positionMatch) {
            props.position = [
                parseFloat(positionMatch[1]),
                parseFloat(positionMatch[2]),
                parseFloat(positionMatch[3])
            ];
        }
        
        // Parse castShadow
        const castShadowMatch = content.match(/castShadow:\s*(true|false)/);
        if (castShadowMatch) props.castShadow = castShadowMatch[1] === 'true';
        
        return props;
    }
    
    /**
     * Parse point lights array from code
     * @param {string} content - Point lights array content
     * @returns {Array} Parsed point lights
     */
    parsePointLightsArray(content) {
        const pointLights = [];
        
        try {
            // Split by light objects (simple approach)
            const lightObjects = content.split(/\}\s*,\s*\{/);
            
            lightObjects.forEach((lightContent, index) => {
                // Clean up the content
                let cleanContent = lightContent.trim();
                if (index === 0) cleanContent = cleanContent.replace(/^\{/, '');
                if (index === lightObjects.length - 1) cleanContent = cleanContent.replace(/\}$/, '');
                if (index > 0 && index < lightObjects.length - 1) {
                    cleanContent = '{' + cleanContent + '}';
                }
                
                const lightProps = this.parseLightProperties(cleanContent);
                
                // Parse distance for point lights
                const distanceMatch = cleanContent.match(/distance:\s*([\d.]+)/);
                if (distanceMatch) lightProps.distance = parseFloat(distanceMatch[1]);
                
                pointLights.push(lightProps);
            });
            
        } catch (error) {
            console.error('❌ Failed to parse point lights array:', error.message);
        }
        
        return pointLights;
    }
    
    /**
     * Extract scene configuration changes from code
     * @param {string} code - The Three.js code
     * @returns {Object} Scene configuration changes
     */
    extractSceneConfigChanges(code) {
        const sceneChanges = {};
        
        try {
            // Match SCENE_CONFIG definition
            const sceneMatch = code.match(/const\s+SCENE_CONFIG\s*=\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/s);
            if (sceneMatch) {
                const sceneContent = sceneMatch[1];
                
                // Parse background color
                const backgroundMatch = sceneContent.match(/backgroundColor:\s*(0x[a-fA-F0-9]+)/);
                if (backgroundMatch) {
                    sceneChanges.backgroundColor = parseInt(backgroundMatch[1], 16);
                }
                
                // Parse camera settings
                const cameraMatch = sceneContent.match(/camera:\s*\{([^}]+(?:\[[^\]]*\][^}]*)*)\}/);
                if (cameraMatch) {
                    sceneChanges.camera = this.parseCameraProperties(cameraMatch[1]);
                }
            }
            
        } catch (error) {
            console.error('❌ Failed to extract scene config changes:', error.message);
        }
        
        return sceneChanges;
    }
    
    /**
     * Parse camera properties from code block
     * @param {string} content - Camera properties content
     * @returns {Object} Parsed camera properties
     */
    parseCameraProperties(content) {
        const props = {};
        
        // Parse FOV
        const fovMatch = content.match(/fov:\s*([\d.]+)/);
        if (fovMatch) props.fov = parseFloat(fovMatch[1]);
        
        // Parse position
        const positionMatch = content.match(/position:\s*\[\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\]/);
        if (positionMatch) {
            props.position = [
                parseFloat(positionMatch[1]),
                parseFloat(positionMatch[2]),
                parseFloat(positionMatch[3])
            ];
        }
        
        // Parse near/far
        const nearMatch = content.match(/near:\s*([\d.]+)/);
        if (nearMatch) props.near = parseFloat(nearMatch[1]);
        
        const farMatch = content.match(/far:\s*([\d.]+)/);
        if (farMatch) props.far = parseFloat(farMatch[1]);
        
        return props;
    }
    
    /**
     * Check if properties have changed
     * @param {Object} newProps - New properties
     * @param {Object} oldProps - Old properties
     * @returns {boolean} True if changes detected
     */
    hasPropertyChanges(newProps, oldProps) {
        if (!oldProps) return true;
        
        for (const key in newProps) {
            if (typeof newProps[key] === 'object' && newProps[key] !== null) {
                if (!this.hasPropertyChanges(newProps[key], oldProps[key])) continue;
                return true;
            } else if (newProps[key] !== oldProps[key]) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Validate parsed changes for correctness
     * @param {Object} changes - Parsed changes object
     * @returns {Object} Validation result
     */
    validateChanges(changes) {
        const errors = [];
        
        try {
            // Validate materials
            if (changes.materials) {
                for (const [materialId, material] of changes.materials) {
                    if (material.color && !/^#[0-9a-fA-F]{6}$/.test(material.color)) {
                        errors.push({
                            type: 'material_error',
                            message: `Invalid color format for MATERIAL_${materialId}: ${material.color}`,
                            materialId
                        });
                    }
                    
                    if (material.opacity !== undefined && (material.opacity < 0 || material.opacity > 1)) {
                        errors.push({
                            type: 'material_error',
                            message: `Invalid opacity for MATERIAL_${materialId}: ${material.opacity} (must be 0-1)`,
                            materialId
                        });
                    }
                    
                    if (material.roughness !== undefined && (material.roughness < 0 || material.roughness > 1)) {
                        errors.push({
                            type: 'material_error',
                            message: `Invalid roughness for MATERIAL_${materialId}: ${material.roughness} (must be 0-1)`,
                            materialId
                        });
                    }
                    
                    if (material.metalness !== undefined && (material.metalness < 0 || material.metalness > 1)) {
                        errors.push({
                            type: 'material_error',
                            message: `Invalid metalness for MATERIAL_${materialId}: ${material.metalness} (must be 0-1)`,
                            materialId
                        });
                    }
                }
            }
            
            // Validate transforms
            if (changes.transforms) {
                for (const [objectId, transform] of changes.transforms) {
                    ['position', 'rotation', 'scale'].forEach(prop => {
                        if (transform[prop]) {
                            const { x, y, z } = transform[prop];
                            if (isNaN(x) || isNaN(y) || isNaN(z)) {
                                errors.push({
                                    type: 'transform_error',
                                    message: `Invalid ${prop} values for object ${objectId}: [${x}, ${y}, ${z}]`,
                                    objectId
                                });
                            }
                        }
                    });
                }
            }
            
            // Validate scene config
            if (changes.sceneConfig) {
                if (changes.sceneConfig.backgroundColor !== undefined && 
                    (typeof changes.sceneConfig.backgroundColor !== 'number' || 
                     changes.sceneConfig.backgroundColor < 0 || 
                     changes.sceneConfig.backgroundColor > 0xFFFFFF)) {
                    errors.push({
                        type: 'scene_error',
                        message: `Invalid background color: ${changes.sceneConfig.backgroundColor.toString(16)}`
                    });
                }
            }
            
        } catch (error) {
            errors.push({
                type: 'validation_error',
                message: `Validation failed: ${error.message}`
            });
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Extract line number from error
     * @param {Error} error - JavaScript error
     * @returns {number|null} Line number if available
     */
    extractLineNumber(error) {
        if (error.stack) {
            const match = error.stack.match(/:(\d+):\d+/);
            return match ? parseInt(match[1]) : null;
        }
        return null;
    }
    
    /**
     * Extract column number from error
     * @param {Error} error - JavaScript error
     * @returns {number|null} Column number if available
     */
    extractColumnNumber(error) {
        if (error.stack) {
            const match = error.stack.match(/:(\d+):(\d+)/);
            return match ? parseInt(match[2]) : null;
        }
        return null;
    }
    
    /**
     * Get current compilation errors
     * @returns {Array} Array of error objects
     */
    getCompilationErrors() {
        return [...this.compilationErrors];
    }
    
    /**
     * Clear compilation state
     */
    reset() {
        this.lastCompiledCode = '';
        this.lastValidState = null;
        this.compilationErrors = [];
        this.isCompiling = false;
        this.lastKnownState = {
            materials: new Map(),
            transforms: new Map(),
            lighting: {},
            sceneConfig: {}
        };
        console.log('🔄 CodeCompiler state reset');
    }
}