import * as THREE from 'three';
import { APIRegistry } from './APIRegistry.js';

/**
 * CodeTemplateGenerator - Enhanced with comprehensive Three.js API coverage
 * Part of Phase 2: Comprehensive Three.js API Support
 * 
 * Features:
 * - Complete Three.js API mapping
 * - Intelligent code templates
 * - Production-ready exports
 * - Advanced material/lighting support
 */
export class CodeTemplateGenerator {
    constructor(scene, objectManager) {
        this.scene = scene;
        this.objectManager = objectManager;
        
        // Initialize comprehensive API registry
        this.apiRegistry = new APIRegistry();
        
        // Enhanced template generation options
        this.templateOptions = {
            includePostProcessing: true,    // Include post-processing effects
            includeAdvancedLighting: true,  // Advanced lighting system
            includeHelpers: false,          // Debug helpers (wireframes, light helpers)
            includePhysics: false,          // Physics integration (future)
            includeAnimation: true,         // Animation system
            includeAudio: false,            // 3D audio (future)
            optimizeForProduction: false,   // Production optimizations
            includeVR: false,               // WebXR/VR support (future)
            includeAR: false,               // WebXR/AR support (future)
            includeControls: true,          // Camera controls
            includeEnvironment: false,      // HDR environment mapping
            templateFormat: 'module',       // 'module' or 'standalone'
            apiCoverage: 'comprehensive'    // 'basic', 'standard', 'comprehensive'
        };
        
        console.log('🔧 CodeTemplateGenerator initialized with comprehensive API coverage');
        console.log('📚 API Coverage:', this.apiRegistry.getStatus());
    }
    
    /**
     * Generate complete editable Three.js scene code with enhanced API support
     * @param {Object} options - Generation options
     * @returns {string} Complete Three.js scene code
     */
    generateEditableCode(options = {}) {
        const {
            includeComments = true,
            includeImports = true,
            includeAnimation = true,
            includeAdvancedFeatures = true,
            templateType = 'standard', // 'standard', 'complete', 'minimal', 'pbr'
            moduleFormat = 'es6' // 'es6' or 'iife'
        } = options;
        
        const objects = this.objectManager.getAllObjects();
        const sceneData = this.scene.exportSceneData();
        const timestamp = new Date().toISOString();
        
        if (objects.length === 0) {
            return this.generateEmptySceneTemplate(includeComments);
        }
        
        // Check for sync/simple mode
        if (moduleFormat === 'sync' || moduleFormat === 'simple') {
            return this.generateSyncModeCode({
                objects,
                sceneData,
                timestamp,
                includeComments
            });
        }
        
        return this.buildEditableCode({
            objects,
            sceneData,
            timestamp,
            includeComments,
            includeImports,
            includeAnimation,
            includeAdvancedFeatures,
            templateType,
            moduleFormat
        });
    }
    
    /**
     * Generate simple executable code for sync workflow (no imports/exports)
     * @param {Object} params - Generation parameters
     * @returns {string} Simple executable Three.js code
     */
    generateSyncModeCode({ objects, sceneData, timestamp, includeComments = true }) {
        const codeLines = [];
        
        if (includeComments) {
            codeLines.push(`// 🔄 Three.js Sync Code - Generated ${timestamp}`);
            codeLines.push(`// Objects: ${objects.length}`);
            codeLines.push(`// This code is designed for UI synchronization`);
            codeLines.push(``);
        }
        
        // Check if we need OBJ loader for any objects
        const hasOBJFiles = objects.some(obj => !obj.isPrimitive && obj.fileName);
        if (hasOBJFiles) {
            codeLines.push(`// Import OBJ loader for file loading`);
            codeLines.push(`if (typeof THREE.OBJLoader === 'undefined') {`);
            codeLines.push(`    console.warn('⚠️ OBJLoader not available. Please ensure THREE.OBJLoader is loaded.');`);
            codeLines.push(`}`);
            codeLines.push(``);
        }
        
        // Generate simple object creation code for each object
        objects.forEach((objectData, index) => {
            const objectCode = this.generateSimpleObjectCode(objectData, index, includeComments);
            codeLines.push(objectCode);
            codeLines.push(``); // Empty line between objects
        });
        
        // Generate lighting code if scene has lighting data
        if (sceneData && sceneData.lighting) {
            codeLines.push(this.generateSyncModeLightingCode(sceneData.lighting, includeComments));
            codeLines.push(``);
        }
        
        // Generate animation code if any objects have animations
        const animatedObjects = objects.filter(obj => obj.animation && obj.animation.type !== 'none');
        if (animatedObjects.length > 0) {
            codeLines.push(this.generateSyncModeAnimationCode(animatedObjects, includeComments));
        }
        
        if (includeComments && objects.length === 0) {
            codeLines.push(`// No objects to sync`);
        }
        
        return codeLines.join('\n');
    }
    
    /**
     * Generate lighting code for sync mode
     * @param {Object} lightingData - Scene lighting configuration
     * @param {boolean} includeComments - Include comments
     * @returns {string} Lighting setup code
     */
    generateSyncModeLightingCode(lightingData, includeComments) {
        const lines = [];
        
        if (includeComments) {
            lines.push(`// 💡 Scene Lighting Setup`);
            lines.push(`// Configure ambient, directional, and additional lights`);
        }
        
        // Ambient light
        if (lightingData.ambientLight) {
            const { color, intensity } = lightingData.ambientLight;
            lines.push(`const ambientLight = new THREE.AmbientLight(${color || 0x404040}, ${intensity || 0.4});`);
            lines.push(`scene.add(ambientLight);`);
        }
        
        // Directional light (main light)
        if (lightingData.directionalLight) {
            const { color, intensity, position, castShadow } = lightingData.directionalLight;
            lines.push(`const directionalLight = new THREE.DirectionalLight(${color || 0xffffff}, ${intensity || 1.2});`);
            if (position) {
                lines.push(`directionalLight.position.set(${position[0] || 20}, ${position[1] || 20}, ${position[2] || 20});`);
            }
            if (castShadow) {
                lines.push(`directionalLight.castShadow = true;`);
                lines.push(`directionalLight.shadow.mapSize.width = 2048;`);
                lines.push(`directionalLight.shadow.mapSize.height = 2048;`);
            }
            lines.push(`scene.add(directionalLight);`);
        }
        
        // Point lights
        if (lightingData.pointLights && Array.isArray(lightingData.pointLights)) {
            lightingData.pointLights.forEach((light, index) => {
                const { color, intensity, position, distance } = light;
                const lightVar = `pointLight${index + 1}`;
                lines.push(`const ${lightVar} = new THREE.PointLight(${color || 0xffffff}, ${intensity || 0.8}, ${distance || 50});`);
                if (position) {
                    lines.push(`${lightVar}.position.set(${position[0] || 10}, ${position[1] || 10}, ${position[2] || 10});`);
                }
                lines.push(`scene.add(${lightVar});`);
            });
        }
        
        // Spotlights
        if (lightingData.spotLights && Array.isArray(lightingData.spotLights)) {
            lightingData.spotLights.forEach((light, index) => {
                const { color, intensity, position, angle, penumbra, castShadow } = light;
                const lightVar = `spotLight${index + 1}`;
                lines.push(`const ${lightVar} = new THREE.SpotLight(${color || 0xffffff}, ${intensity || 1.5});`);
                if (position) {
                    lines.push(`${lightVar}.position.set(${position[0] || 15}, ${position[1] || 15}, ${position[2] || 15});`);
                }
                if (angle) {
                    lines.push(`${lightVar}.angle = ${angle};`);
                }
                if (penumbra) {
                    lines.push(`${lightVar}.penumbra = ${penumbra};`);
                }
                if (castShadow) {
                    lines.push(`${lightVar}.castShadow = true;`);
                }
                lines.push(`scene.add(${lightVar});`);
            });
        }
        
        // Hemisphere light
        if (lightingData.hemisphereLight) {
            const { skyColor, groundColor, intensity, position } = lightingData.hemisphereLight;
            lines.push(`const hemisphereLight = new THREE.HemisphereLight(${skyColor || 0x87ceeb}, ${groundColor || 0x8b4513}, ${intensity || 0.6});`);
            if (position) {
                lines.push(`hemisphereLight.position.set(${position[0] || 0}, ${position[1] || 50}, ${position[2] || 0});`);
            }
            lines.push(`scene.add(hemisphereLight);`);
        }
        
        if (includeComments) {
            lines.push(`// Enable shadows on renderer if lights cast shadows`);
            lines.push(`// renderer.shadowMap.enabled = true;`);
            lines.push(`// renderer.shadowMap.type = THREE.PCFSoftShadowMap;`);
        }
        
        return lines.join('\n');
    }
    
    /**
     * Generate animation code for sync mode
     * @param {Array} animatedObjects - Objects with animations
     * @param {boolean} includeComments - Include comments
     * @returns {string} Animation loop code
     */
    generateSyncModeAnimationCode(animatedObjects, includeComments) {
        const lines = [];
        
        if (includeComments) {
            lines.push(`// 🎬 Animation Loop`);
            lines.push(`// Animate ${animatedObjects.length} objects with different animation types`);
        }
        
        lines.push(`function animate() {`);
        lines.push(`    requestAnimationFrame(animate);`);
        lines.push(``);
        
        // Generate animation code for each object
        animatedObjects.forEach((obj, index) => {
            const objectVar = `object${index + 1}`;
            const { type, speed } = obj.animation;
            const safeSpeed = typeof speed === 'number' ? speed : 0.01;
            
            if (includeComments) {
                lines.push(`    // Animate ${obj.name || objectVar} (${type})`);
            }
            
            // Find the object in scene by name
            lines.push(`    const ${objectVar}Ref = scene.getObjectByName('${obj.name || objectVar}');`);
            lines.push(`    if (${objectVar}Ref) {`);
            
            switch (type) {
                case 'rotate-x':
                    lines.push(`        ${objectVar}Ref.rotation.x += ${safeSpeed};`);
                    break;
                case 'rotate-y':
                    lines.push(`        ${objectVar}Ref.rotation.y += ${safeSpeed};`);
                    break;
                case 'rotate-z':
                    lines.push(`        ${objectVar}Ref.rotation.z += ${safeSpeed};`);
                    break;
                case 'rotate-xyz':
                    lines.push(`        ${objectVar}Ref.rotation.x += ${safeSpeed * 0.7};`);
                    lines.push(`        ${objectVar}Ref.rotation.y += ${safeSpeed};`);
                    lines.push(`        ${objectVar}Ref.rotation.z += ${safeSpeed * 0.3};`);
                    break;
                case 'scale':
                    lines.push(`        const scaleValue = 1 + Math.sin(Date.now() * ${safeSpeed * 0.001}) * 0.2;`);
                    lines.push(`        ${objectVar}Ref.scale.set(scaleValue, scaleValue, scaleValue);`);
                    break;
                case 'bounce':
                    lines.push(`        const originalY_${objectVar} = ${objectVar}Ref.userData.originalY || ${objectVar}Ref.position.y;`);
                    lines.push(`        ${objectVar}Ref.position.y = originalY_${objectVar} + Math.sin(Date.now() * ${safeSpeed * 0.001}) * 2;`);
                    break;
                case 'float':
                    lines.push(`        ${objectVar}Ref.position.y += Math.sin(Date.now() * ${safeSpeed * 0.001}) * 0.01;`);
                    lines.push(`        ${objectVar}Ref.rotation.y += ${safeSpeed * 0.5};`);
                    break;
                case 'orbit':
                    lines.push(`        const orbitTime = Date.now() * ${safeSpeed * 0.002};`);
                    lines.push(`        ${objectVar}Ref.position.x = Math.cos(orbitTime) * 5;`);
                    lines.push(`        ${objectVar}Ref.position.z = Math.sin(orbitTime) * 5;`);
                    lines.push(`        ${objectVar}Ref.lookAt(0, ${objectVar}Ref.position.y, 0);`);
                    break;
                default:
                    lines.push(`        // Animation type '${type}' not implemented in sync mode`);
            }
            
            lines.push(`    }`);
            lines.push(``);
        });
        
        lines.push(`    // Note: Add renderer.render(scene, camera) to see animations`);
        lines.push(`}`);
        lines.push(``);
        lines.push(`// Start animation loop`);
        lines.push(`animate();`);
        
        return lines.join('\n');
    }
    
    /**
     * Generate simple object creation code for sync mode
     * @param {Object} objectData - Object data
     * @param {number} index - Object index
     * @param {boolean} includeComments - Include comments
     * @returns {string} Simple object creation code
     */
    generateSimpleObjectCode(objectData, index, includeComments) {
        const lines = [];
        const varName = `object${index + 1}`;
        const geometryVar = `geometry${index + 1}`;
        const materialVar = `material${index + 1}`;
        
        if (includeComments) {
            const objectType = objectData.isPrimitive ? 
                `primitive ${objectData.primitiveType}` : 
                (objectData.type || 'object');
            lines.push(`// Create ${objectData.name || 'Object'} (${objectType})`);
        }
        
        // Generate geometry creation
        if (objectData.isPrimitive) {
            lines.push(this.generateSimpleGeometryCode(objectData, geometryVar));
        } else if (objectData.fileName) {
            // Generate OBJ loader code for sync mode
            lines.push(this.generateOBJLoaderCode(objectData, geometryVar, varName));
            return lines.join('\n'); // Return early for OBJ files (they handle their own mesh creation)
        } else {
            // Fallback for unknown object types
            lines.push(`// Unknown object type - using placeholder box`);
            lines.push(`const ${geometryVar} = new THREE.BoxGeometry(2, 2, 2);`);
        }
        
        // Generate material creation
        lines.push(this.generateSimpleMaterialCode(objectData.material, materialVar));
        
        // Generate mesh creation
        lines.push(`const ${varName} = new THREE.Mesh(${geometryVar}, ${materialVar});`);
        
        // Apply transform
        const transform = objectData.transform || {};
        const pos = transform.position ? [transform.position.x || 0, transform.position.y || 0, transform.position.z || 0] : 
                   objectData.position || [0, 0, 0];
        const rot = transform.rotation ? [transform.rotation.x || 0, transform.rotation.y || 0, transform.rotation.z || 0] : 
                   objectData.rotation || [0, 0, 0];
        const scale = transform.scale ? [transform.scale.x || 1, transform.scale.y || 1, transform.scale.z || 1] : 
                     objectData.scale || [1, 1, 1];
        
        lines.push(`${varName}.position.set(${pos[0]}, ${pos[1]}, ${pos[2]});`);
        lines.push(`${varName}.rotation.set(${rot[0]}, ${rot[1]}, ${rot[2]});`);
        lines.push(`${varName}.scale.set(${scale[0]}, ${scale[1]}, ${scale[2]});`);
        
        // Set name for identification
        lines.push(`${varName}.name = '${objectData.name || `Object${index + 1}`}';`);
        
        // Store animation data if present
        if (objectData.animation && objectData.animation.type !== 'none') {
            lines.push(`${varName}.userData.animation = {`);
            lines.push(`    type: '${objectData.animation.type}',`);
            lines.push(`    speed: ${objectData.animation.speed || 1}`);
            lines.push(`};`);
        }
        
        // Add to scene
        lines.push(`scene.add(${varName});`);
        
        return lines.join('\n');
    }
    
    /**
     * Generate simple geometry creation code
     * @param {Object} objectData - Object data
     * @param {string} varName - Variable name
     * @returns {string} Geometry creation code
     */
    generateSimpleGeometryCode(objectData, varName) {
        const type = objectData.primitiveType || objectData.geometryType;
        
        switch (type) {
            case 'box':
                return `const ${varName} = new THREE.BoxGeometry(2, 2, 2);`;
            case 'sphere':
                return `const ${varName} = new THREE.SphereGeometry(1.5, 32, 16);`;
            case 'cylinder':
                return `const ${varName} = new THREE.CylinderGeometry(1, 1, 2, 32);`;
            case 'cone':
                return `const ${varName} = new THREE.ConeGeometry(1, 2, 32);`;
            case 'plane':
                return `const ${varName} = new THREE.PlaneGeometry(3, 3);`;
            case 'circle':
                return `const ${varName} = new THREE.CircleGeometry(1.5, 32);`;
            case 'ring':
                return `const ${varName} = new THREE.RingGeometry(0.5, 1.5, 32);`;
            case 'torus':
                return `const ${varName} = new THREE.TorusGeometry(1.2, 0.4, 16, 100);`;
            case 'torusKnot':
                return `const ${varName} = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);`;
            case 'dodecahedron':
                return `const ${varName} = new THREE.DodecahedronGeometry(1.5);`;
            case 'icosahedron':
                return `const ${varName} = new THREE.IcosahedronGeometry(1.5);`;
            case 'octahedron':
                return `const ${varName} = new THREE.OctahedronGeometry(1.5);`;
            case 'tetrahedron':
                return `const ${varName} = new THREE.TetrahedronGeometry(1.5);`;
            case 'capsule':
                return `const ${varName} = new THREE.CapsuleGeometry(0.8, 1.6, 4, 8);`;
            case 'lathe':
                return `const ${varName} = new THREE.LatheGeometry([/* lathe points */], 12);`;
            case 'extrude':
                return `const ${varName} = new THREE.ExtrudeGeometry(/* shape */, { depth: 0.5 });`;
            default:
                return `const ${varName} = new THREE.BoxGeometry(2, 2, 2); // Unknown type: ${type}`;
        }
    }
    
    /**
     * Generate OBJ loader code for sync mode
     * @param {Object} objectData - Object data
     * @param {string} geometryVar - Geometry variable name
     * @param {string} objectVar - Object variable name
     * @returns {string} OBJ loader code
     */
    generateOBJLoaderCode(objectData, geometryVar, objectVar) {
        const lines = [];
        const loaderVar = `objLoader${objectVar.slice(-1)}`;
        const materialVar = `material${objectVar.slice(-1)}`;
        const fileName = objectData.fileName || objectData.originalFileName || 'unknown.obj';
        
        // Create OBJ loader
        lines.push(`const ${loaderVar} = new THREE.OBJLoader();`);
        
        // Generate material for OBJ
        lines.push(this.generateSimpleMaterialCode(objectData.material, materialVar));
        
        // Load OBJ file asynchronously
        lines.push(`${loaderVar}.load('${fileName}',`);
        lines.push(`    (loadedObject) => {`);
        lines.push(`        // Apply material to all meshes`);
        lines.push(`        loadedObject.traverse((child) => {`);
        lines.push(`            if (child.isMesh) {`);
        lines.push(`                child.material = ${materialVar};`);
        lines.push(`                child.castShadow = true;`);
        lines.push(`                child.receiveShadow = true;`);
        lines.push(`            }`);
        lines.push(`        });`);
        
        // Apply transform
        const transform = objectData.transform || {};
        const pos = transform.position ? [transform.position.x || 0, transform.position.y || 0, transform.position.z || 0] : 
                   objectData.position || [0, 0, 0];
        const rot = transform.rotation ? [transform.rotation.x || 0, transform.rotation.y || 0, transform.rotation.z || 0] : 
                   objectData.rotation || [0, 0, 0];
        const scale = transform.scale ? [transform.scale.x || 1, transform.scale.y || 1, transform.scale.z || 1] : 
                     objectData.scale || [1, 1, 1];
        
        lines.push(`        loadedObject.position.set(${pos[0]}, ${pos[1]}, ${pos[2]});`);
        lines.push(`        loadedObject.rotation.set(${rot[0]}, ${rot[1]}, ${rot[2]});`);
        lines.push(`        loadedObject.scale.set(${scale[0]}, ${scale[1]}, ${scale[2]});`);
        lines.push(`        loadedObject.name = '${objectData.name || `Object${objectVar.slice(-1)}`}';`);
        
        // Store animation data if present
        if (objectData.animation && objectData.animation.type !== 'none') {
            lines.push(`        loadedObject.userData.animation = {`);
            lines.push(`            type: '${objectData.animation.type}',`);
            lines.push(`            speed: ${objectData.animation.speed || 1}`);
            lines.push(`        };`);
        }
        
        lines.push(`        scene.add(loadedObject);`);
        lines.push(`        console.log('✅ OBJ loaded:', '${fileName}');`);
        lines.push(`    },`);
        lines.push(`    (progress) => {`);
        lines.push(`        console.log('🔄 Loading OBJ:', '${fileName}', progress);`);
        lines.push(`    },`);
        lines.push(`    (error) => {`);
        lines.push(`        console.error('❌ Failed to load OBJ:', '${fileName}', error);`);
        lines.push(`    }`);
        lines.push(`);`);
        
        return lines.join('\n');
    }
    
    /**
     * Generate simple material creation code
     * @param {Object} materialData - Material configuration
     * @param {string} varName - Variable name
     * @returns {string} Material creation code
     */
    generateSimpleMaterialCode(materialData, varName) {
        if (!materialData) {
            return `const ${varName} = new THREE.MeshStandardMaterial({ color: 0x00ff00 });`;
        }
        
        const type = materialData.type || 'standard';
        const color = materialData.color || '#00ff00';
        const wireframe = materialData.wireframe || false;
        const opacity = materialData.opacity || 1.0;
        const transparent = materialData.transparent || opacity < 1.0;
        
        // Handle texture loading
        const textureCode = this.generateTextureLoadingCode(materialData, varName);
        
        switch (type) {
            case 'basic':
                return textureCode + `const ${varName} = new THREE.MeshBasicMaterial({ color: '${color}', wireframe: ${wireframe}, opacity: ${opacity}, transparent: ${transparent}${this.getTextureMapCode(materialData)} });`;
            case 'lambert':
                return textureCode + `const ${varName} = new THREE.MeshLambertMaterial({ color: '${color}', wireframe: ${wireframe}, opacity: ${opacity}, transparent: ${transparent}${this.getTextureMapCode(materialData)} });`;
            case 'phong':
                return textureCode + `const ${varName} = new THREE.MeshPhongMaterial({ color: '${color}', wireframe: ${wireframe}, opacity: ${opacity}, transparent: ${transparent}${this.getTextureMapCode(materialData)} });`;
            case 'physical':
                const roughness = materialData.roughness || 0.5;
                const metalness = materialData.metalness || 0.0;
                return textureCode + `const ${varName} = new THREE.MeshPhysicalMaterial({ color: '${color}', wireframe: ${wireframe}, opacity: ${opacity}, transparent: ${transparent}, roughness: ${roughness}, metalness: ${metalness}${this.getTextureMapCode(materialData)} });`;
            case 'matcap':
                // Check for matcap texture from different possible sources
                let matcapTexture = materialData.matcap || materialData.matcapTexture || materialData.texture?.filename;
                
                // Fix incomplete texture paths for MatCap textures
                if (matcapTexture && !matcapTexture.startsWith('MatCap-Textures/') && !matcapTexture.startsWith('http')) {
                    // If it's just a filename, try to construct the full path
                    if (matcapTexture.includes('.webp') || matcapTexture.includes('.jpg') || matcapTexture.includes('.png')) {
                        // For common MatCap naming patterns, assume it's in the gray folder
                        matcapTexture = `MatCap-Textures/gray/${matcapTexture}`;
                    }
                }
                
                const matcapMap = matcapTexture ? `, matcap: texture_${varName}_matcap` : '';
                const matcapTextureCode = matcapTexture ? `const texture_${varName}_matcap = new THREE.TextureLoader().load('${matcapTexture}');\n` : '';
                return matcapTextureCode + `const ${varName} = new THREE.MeshMatcapMaterial({ color: '${color}', opacity: ${opacity}, transparent: ${transparent}${matcapMap} });`;
            case 'standard':
            default:
                const roughnessStd = materialData.roughness || 0.5;
                const metalnessStd = materialData.metalness || 0.0;
                return textureCode + `const ${varName} = new THREE.MeshStandardMaterial({ color: '${color}', wireframe: ${wireframe}, opacity: ${opacity}, transparent: ${transparent}, roughness: ${roughnessStd}, metalness: ${metalnessStd}${this.getTextureMapCode(materialData)} });`;
        }
    }
    
    /**
     * Generate texture loading code
     * @param {Object} materialData - Material configuration
     * @param {string} varName - Variable name
     * @returns {string} Texture loading code
     */
    generateTextureLoadingCode(materialData, varName) {
        const lines = [];
        const textureLoader = `textureLoader_${varName}`;
        
        // Check if any textures are used
        const hasTextures = materialData.map || materialData.normalMap || materialData.roughnessMap || 
                          materialData.metalnessMap || materialData.aoMap || materialData.matcap;
        
        if (hasTextures) {
            lines.push(`const ${textureLoader} = new THREE.TextureLoader();`);
            
            if (materialData.map) {
                lines.push(`const texture_${varName}_map = ${textureLoader}.load('${materialData.map}');`);
            }
            if (materialData.normalMap) {
                lines.push(`const texture_${varName}_normal = ${textureLoader}.load('${materialData.normalMap}');`);
            }
            if (materialData.roughnessMap) {
                lines.push(`const texture_${varName}_roughness = ${textureLoader}.load('${materialData.roughnessMap}');`);
            }
            if (materialData.metalnessMap) {
                lines.push(`const texture_${varName}_metalness = ${textureLoader}.load('${materialData.metalnessMap}');`);
            }
            if (materialData.aoMap) {
                lines.push(`const texture_${varName}_ao = ${textureLoader}.load('${materialData.aoMap}');`);
            }
            if (materialData.matcap) {
                lines.push(`const texture_${varName}_matcap = ${textureLoader}.load('${materialData.matcap}');`);
            }
            
            return lines.join('\n') + '\n';
        }
        
        return '';
    }
    
    /**
     * Generate texture map assignments for material
     * @param {Object} materialData - Material configuration
     * @returns {string} Texture map assignments
     */
    getTextureMapCode(materialData) {
        const maps = [];
        
        if (materialData.map) maps.push(`map: texture_${materialData.varName || 'material'}_map`);
        if (materialData.normalMap) maps.push(`normalMap: texture_${materialData.varName || 'material'}_normal`);
        if (materialData.roughnessMap) maps.push(`roughnessMap: texture_${materialData.varName || 'material'}_roughness`);
        if (materialData.metalnessMap) maps.push(`metalnessMap: texture_${materialData.varName || 'material'}_metalness`);
        if (materialData.aoMap) maps.push(`aoMap: texture_${materialData.varName || 'material'}_ao`);
        
        return maps.length > 0 ? `, ${maps.join(', ')}` : '';
    }
    
    /**
     * Build the complete editable code structure
     */
    buildEditableCode({
        objects,
        sceneData,
        timestamp,
        includeComments,
        includeImports,
        includeAnimation,
        moduleFormat
    }) {
        const sections = [];
        
        // Header section
        if (includeComments) {
            sections.push(this.generateHeaderSection(timestamp, objects.length));
        }
        
        // Imports section
        if (includeImports) {
            sections.push(this.generateImportsSection());
        }
        
        // Scene configuration section
        sections.push(this.generateSceneConfigSection(sceneData, includeComments));
        
        // Materials section
        sections.push(this.generateMaterialsSection(objects, includeComments));
        
        // Objects section
        sections.push(this.generateObjectsSection(objects, includeComments));
        
        // Lighting section
        sections.push(this.generateLightingSection(includeComments));
        
        // Main function section
        sections.push(this.generateMainFunctionSection(objects, includeComments, includeAnimation));
        
        // Post-processing effects section
        if (this.templateOptions.includePostProcessing) {
            sections.push(this.generatePostProcessingSection(includeComments));
        }
        
        // Production export utilities section
        if (this.templateOptions.optimizeForProduction) {
            sections.push(this.generateProductionUtilitiesSection(includeComments));
        }
        
        // Usage example section
        if (includeComments) {
            sections.push(this.generateUsageSection());
        }
        
        return sections.join('\n\n');
    }
    
    /**
     * Generate header with metadata and instructions
     */
    generateHeaderSection(timestamp, objectCount) {
        return `/**
 * 🎯 LIVE EDITABLE THREE.JS SCENE
 * Generated: ${timestamp}
 * Objects: ${objectCount}
 * Generator: Three.js Loader & Editor - Live Code Generation
 * 
 * 💡 EDITING GUIDE:
 * - Edit material properties in the MATERIALS section
 * - Modify transforms in the OBJECTS section  
 * - Adjust lighting in the LIGHTING section
 * - Changes will appear instantly in the viewport
 * 
 * 🚀 This code is production-ready and self-contained
 */`;
    }
    
    /**
     * Generate imports section
     */
    generateImportsSection() {
        return `// ═══════════════════════════════════════════════════════════════
// 📦 IMPORTS
// ═══════════════════════════════════════════════════════════════
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';`;
    }
    
    /**
     * Generate scene configuration section
     */
    generateSceneConfigSection(sceneData, includeComments) {
        const comment = includeComments ? `
// ═══════════════════════════════════════════════════════════════
// 🌍 SCENE CONFIGURATION
// Edit these values to customize the basic scene setup
// ═══════════════════════════════════════════════════════════════` : '';
        
        return `${comment}
const SCENE_CONFIG = {
    // Background color (hex)
    backgroundColor: ${sceneData.background ? '0x' + sceneData.background.toString(16).padStart(6, '0') : '0x0f0f0f'},
    
    // Camera settings
    camera: {
        fov: ${sceneData.camera.fov},
        position: [${sceneData.camera.position.join(', ')}],
        near: 0.1,
        far: 1000
    },
    
    // Renderer settings
    renderer: {
        antialias: true,
        shadowMap: true,
        pixelRatio: Math.min(window.devicePixelRatio, 2)
    }
};`;
    }
    
    /**
     * Generate materials section with enhanced API support
     */
    generateMaterialsSection(objects, includeComments) {
        const comment = includeComments ? `
// ═══════════════════════════════════════════════════════════════
// 🎨 ENHANCED MATERIALS SYSTEM
// Full Three.js material API support - edit properties for instant updates
// Supports: Standard, Basic, Phong, Lambert, Physical, MatCap, Toon, Normal, and more
// ═══════════════════════════════════════════════════════════════` : '';
        
        const materials = this.extractUniqueMaterials(objects);
        
        const materialDefinitions = materials.map((material, index) => {
            const name = `MATERIAL_${index + 1}`;
            return this.generateEnhancedMaterialDefinition(name, material, includeComments);
        }).join('\n\n');
        
        return `${comment}
${materialDefinitions}`;
    }
    
    /**
     * Generate enhanced material definition with comprehensive API coverage
     */
    generateEnhancedMaterialDefinition(name, material, includeComments) {
        const guide = includeComments ? `    // 💡 EDIT THESE VALUES FOR INSTANT UPDATES!` : '';
        
        // Safety check for apiRegistry
        if (!this.apiRegistry || !this.apiRegistry.materials) {
            console.warn('⚠️  APIRegistry not available, using basic material definition');
            const safeMaterial = material || {};
            const materialType = safeMaterial.type || 'standard';
            
            return `const ${name} = {
    // Material Type: ${materialType.toUpperCase()}
${guide}
    type: '${materialType}',                // Material type (basic fallback)
    
    color: '${safeMaterial.color || '#9dd9d9'}',    // Color
    wireframe: ${safeMaterial.wireframe !== undefined ? safeMaterial.wireframe : true},    // Wireframe rendering
    opacity: ${safeMaterial.opacity !== undefined ? safeMaterial.opacity : 1.0},    // Transparency
};`;
        }
        
        const materialAPI = this.apiRegistry.materials;
        
        // Provide comprehensive defaults
        const safeMaterial = material || {};
        const materialType = safeMaterial.type || 'MeshStandardMaterial';
        const materialConfig = materialAPI[materialType] || materialAPI['MeshStandardMaterial'] || {};
        
        // Generate properties based on material type
        const properties = this.generateMaterialProperties(safeMaterial, materialConfig, includeComments);
        
        return `const ${name} = {
    // Material Type: ${materialType.toUpperCase()}
${guide}
    type: '${materialType}',                // Material type from API registry
    
${properties}
};`;
    }
    
    /**
     * Generate objects section with transforms
     */
    generateObjectsSection(objects, includeComments) {
        const comment = includeComments ? `
// ═══════════════════════════════════════════════════════════════
// 📦 OBJECTS & TRANSFORMS
// Edit position, rotation, scale values to transform objects
// ═══════════════════════════════════════════════════════════════` : '';
        
        const objectDefinitions = objects.map((obj, index) => {
            return this.generateObjectDefinition(obj, index, includeComments);
        }).join('\n\n');
        
        return `${comment}
${objectDefinitions}`;
    }
    
    /**
     * Generate individual object definition
     */
    generateObjectDefinition(objectData, index, includeComments) {
        const { name, fileName, transform, stats, isPrimitive, primitiveType } = objectData;
        const varName = this.sanitizeVariableName(name);
        const materialRef = `MATERIAL_${index + 1}`;
        
        // Provide defaults if transform is null or missing properties
        const safeTransform = transform || {};
        const position = safeTransform.position || { x: 0, y: 0, z: 0 };
        const rotation = safeTransform.rotation || { x: 0, y: 0, z: 0 };
        const scale = safeTransform.scale || { x: 1, y: 1, z: 1 };
        
        const guide = includeComments ? `    // 💡 Edit these transform values for instant positioning changes!` : '';
        const statsComment = includeComments && stats ? `    // 📊 Stats: ${stats.meshes} meshes, ${stats.vertices} vertices, ${stats.faces} faces` : '';
        
        // Different handling for primitives vs OBJ files
        if (isPrimitive) {
            const geometryType = this.getGeometryTypeForPrimitive(primitiveType);
            return `const ${varName.toUpperCase()}_CONFIG = {
    type: 'primitive',                  // Primitive geometry
    geometryType: '${primitiveType}',   // Primitive type
    geometry: ${geometryType},          // Three.js geometry constructor
    material: ${materialRef},           // Material reference
${guide}
    transform: {
        // Position in 3D space (x, y, z)
        position: [${position.x || 0}, ${position.y || 0}, ${position.z || 0}],
        
        // Rotation in radians (x, y, z)  
        rotation: [${rotation.x || 0}, ${rotation.y || 0}, ${rotation.z || 0}],
        
        // Scale multipliers (x, y, z)
        scale: [${scale.x || 1}, ${scale.y || 1}, ${scale.z || 1}]
    }${statsComment ? '\n' + statsComment : ''}
};`;
        } else {
            return `const ${varName.toUpperCase()}_CONFIG = {
    type: 'obj',                        // OBJ file loader
    fileName: '${fileName || 'unknown.obj'}',           // OBJ file path
    material: ${materialRef},           // Material reference
${guide}
    transform: {
        // Position in 3D space (x, y, z)
        position: [${position.x || 0}, ${position.y || 0}, ${position.z || 0}],
        
        // Rotation in radians (x, y, z)  
        rotation: [${rotation.x || 0}, ${rotation.y || 0}, ${rotation.z || 0}],
        
        // Scale multipliers (x, y, z)
        scale: [${scale.x || 1}, ${scale.y || 1}, ${scale.z || 1}]
    }${statsComment ? '\n' + statsComment : ''}
};`;
        }
    }
    
    /**
     * Get Three.js geometry constructor for primitive type
     */
    getGeometryTypeForPrimitive(primitiveType) {
        const geometryMap = {
            'box': 'new THREE.BoxGeometry(2, 2, 2)',
            'sphere': 'new THREE.SphereGeometry(1.5, 32, 16)',
            'cylinder': 'new THREE.CylinderGeometry(1, 1, 2, 32)',
            'cone': 'new THREE.ConeGeometry(1, 2, 32)',
            'plane': 'new THREE.PlaneGeometry(3, 3)',
            'circle': 'new THREE.CircleGeometry(1.5, 32)',
            'ring': 'new THREE.RingGeometry(0.5, 1.5, 32)',
            'torus': 'new THREE.TorusGeometry(1.2, 0.4, 16, 100)',
            'torusKnot': 'new THREE.TorusKnotGeometry(1, 0.3, 100, 16)',
            'dodecahedron': 'new THREE.DodecahedronGeometry(1.5)',
            'icosahedron': 'new THREE.IcosahedronGeometry(1.5)',
            'octahedron': 'new THREE.OctahedronGeometry(1.5)',
            'tetrahedron': 'new THREE.TetrahedronGeometry(1.5)',
            'capsule': 'new THREE.CapsuleGeometry(0.8, 1.6, 4, 8)',
            'lathe': `new THREE.LatheGeometry(
                Array.from({length: 10}, (_, i) => {
                    const y = (i - 4.5) * 0.4;
                    const x = Math.sin(i * 0.2) * 0.5 + 0.8;
                    return new THREE.Vector2(x, y);
                }), 32
            )`,
            'extrude': `(() => {
                const starShape = new THREE.Shape();
                const outerRadius = 1.2, innerRadius = 0.6, points = 5;
                starShape.moveTo(outerRadius, 0);
                for (let i = 1; i <= points * 2; i++) {
                    const angle = (i * Math.PI) / points;
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    starShape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                }
                return new THREE.ExtrudeGeometry(starShape, {
                    depth: 0.4, bevelEnabled: true, bevelSegments: 2, steps: 2, 
                    bevelSize: 0.1, bevelThickness: 0.1
                });
            })()`,
            'parametric': `new THREE.ParametricGeometry(
                (u, v, target) => {
                    u = u * Math.PI;
                    v = v * 2 * Math.PI;
                    const x = (3 + Math.cos(u/2) * Math.sin(v) - Math.sin(u/2) * Math.sin(2*v)) * Math.cos(u);
                    const y = (3 + Math.cos(u/2) * Math.sin(v) - Math.sin(u/2) * Math.sin(2*v)) * Math.sin(u);
                    const z = Math.sin(u/2) * Math.sin(v) + Math.cos(u/2) * Math.sin(2*v);
                    target.set(x * 0.3, y * 0.3, z * 0.3);
                }, 20, 20
            )`,
            'polyhedron': 'new THREE.PolyhedronGeometry([1,1,1,-1,-1,1,-1,1,-1,1,-1,-1], [2,1,0,0,3,2,1,3,0,2,3,1], 1.5, 0)',
            'tube': `(() => {
                class CustomCurve extends THREE.Curve {
                    getPoint(t, optionalTarget = new THREE.Vector3()) {
                        const tx = t * 3 - 1.5;
                        const ty = Math.sin(2 * Math.PI * t);
                        const tz = Math.cos(2 * Math.PI * t);
                        return optionalTarget.set(tx, ty, tz).multiplyScalar(0.8);
                    }
                }
                return new THREE.TubeGeometry(new CustomCurve(), 20, 0.2, 8, false);
            })()`,
            'convex': `(() => {
                const points = [];
                for (let i = 0; i < 20; i++) {
                    points.push(new THREE.Vector3((Math.random()-0.5)*3, (Math.random()-0.5)*3, (Math.random()-0.5)*3));
                }
                return new THREE.ConvexGeometry(points);
            })()`,
            'decal': `(() => {
                const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
                return new THREE.DecalGeometry(cubeGeometry, new THREE.Vector3(0,0,1), new THREE.Euler(0,0,0), new THREE.Vector3(1,1,1));
            })()`,
            'edges': 'new THREE.EdgesGeometry(new THREE.DodecahedronGeometry(1.5))',
            'wireframe': 'new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.5, 1))',
            'shape': `(() => {
                const heartShape = new THREE.Shape();
                const x = 0, y = 0;
                heartShape.moveTo(x + 25, y + 25);
                heartShape.bezierCurveTo(x + 25, y + 25, x + 20, y, x, y);
                heartShape.bezierCurveTo(x - 30, y, x - 30, y + 35, x - 30, y + 35);
                heartShape.bezierCurveTo(x - 30, y + 55, x - 10, y + 77, x + 25, y + 95);
                heartShape.bezierCurveTo(x + 60, y + 77, x + 80, y + 55, x + 80, y + 35);
                heartShape.bezierCurveTo(x + 80, y + 35, x + 80, y, x + 50, y);
                heartShape.bezierCurveTo(x + 35, y, x + 25, y + 25, x + 25, y + 25);
                const geometry = new THREE.ShapeGeometry(heartShape);
                geometry.scale(0.02, 0.02, 0.02);
                return geometry;
            })()`,
            'text': 'new THREE.PlaneGeometry(2, 0.5) // TextGeometry requires font loading'
        };
        
        return geometryMap[primitiveType] || 'new THREE.BoxGeometry(1, 1, 1)';
    }
    
    /**
     * Create material from configuration
     */
    createMaterialFromConfig(materialConfig) {
        const { type = 'standard', color = '#ffffff', wireframe = false, transparent = false, 
                opacity = 1.0, roughness = 0.5, metalness = 0.0 } = materialConfig;
        
        switch (type) {
            case 'basic':
                return new THREE.MeshBasicMaterial({
                    color: new THREE.Color(color),
                    wireframe, transparent, opacity
                });
                
            case 'lambert':
                return new THREE.MeshLambertMaterial({
                    color: new THREE.Color(color),
                    wireframe, transparent, opacity
                });
                
            case 'phong':
                return new THREE.MeshPhongMaterial({
                    color: new THREE.Color(color),
                    wireframe, transparent, opacity
                });
                
            case 'physical':
                return new THREE.MeshPhysicalMaterial({
                    color: new THREE.Color(color),
                    wireframe, transparent, opacity,
                    roughness, metalness
                });
                
            case 'matcap':
                return new THREE.MeshMatcapMaterial({
                    color: new THREE.Color(color),
                    wireframe, transparent, opacity
                });
                
            case 'shader':
                return new THREE.ShaderMaterial({
                    vertexShader: materialConfig.vertexShader || this.getDefaultVertexShader(),
                    fragmentShader: materialConfig.fragmentShader || this.getDefaultFragmentShader(),
                    uniforms: materialConfig.uniforms || this.getDefaultUniforms()
                });
                
            case 'toon':
                return new THREE.MeshToonMaterial({
                    color: new THREE.Color(color),
                    wireframe, transparent, opacity
                });
                
            case 'normal':
                return new THREE.MeshNormalMaterial({ wireframe, transparent, opacity });
                
            case 'depth':
                return new THREE.MeshDepthMaterial({ wireframe, transparent, opacity });
                
            case 'distance':
                return new THREE.MeshDistanceMaterial({ wireframe, transparent, opacity });
                
            case 'lineDashed':
                return new THREE.LineDashedMaterial({
                    color: new THREE.Color(color), transparent, opacity,
                    dashSize: 3, gapSize: 1
                });
                
            case 'lineBasic':
                return new THREE.LineBasicMaterial({
                    color: new THREE.Color(color), transparent, opacity
                });
                
            case 'points':
                return new THREE.PointsMaterial({
                    color: new THREE.Color(color), transparent, opacity,
                    size: 2, sizeAttenuation: true
                });
                
            case 'sprite':
                return new THREE.SpriteMaterial({
                    color: new THREE.Color(color), transparent, opacity
                });
                
            case 'standard':
            default:
                return new THREE.MeshStandardMaterial({
                    color: new THREE.Color(color),
                    wireframe, transparent, opacity,
                    roughness, metalness
                });
        }
    }
    
    /**
     * Get default vertex shader
     */
    getDefaultVertexShader() {
        return `
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vUv = uv;
                vec3 pos = position;
                
                // Simple wave animation
                pos.z += sin(pos.x * 5.0 + time) * 0.1;
                pos.z += sin(pos.y * 5.0 + time * 1.5) * 0.1;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }`;
    }
    
    /**
     * Get default fragment shader
     */
    getDefaultFragmentShader() {
        return `
            uniform float time;
            uniform vec2 resolution;
            varying vec2 vUv;
            
            void main() {
                vec2 uv = vUv;
                
                // Animated color pattern
                float r = sin(time + uv.x * 10.0) * 0.5 + 0.5;
                float g = sin(time + uv.y * 10.0 + 2.0) * 0.5 + 0.5;
                float b = sin(time + (uv.x + uv.y) * 5.0 + 4.0) * 0.5 + 0.5;
                
                gl_FragColor = vec4(r, g, b, 1.0);
            }`;
    }
    
    /**
     * Get default shader uniforms
     */
    getDefaultUniforms() {
        return {
            time: { value: 0.0 },
            resolution: { value: new THREE.Vector2(800, 600) }
        };
    }
    
    /**
     * Generate advanced lighting section with comprehensive API support
     */
    generateLightingSection(includeComments) {
        const comment = includeComments ? `
// ═══════════════════════════════════════════════════════════════
// 💡 ADVANCED LIGHTING SYSTEM
// Full Three.js lighting API - supports all light types and advanced features
// Edit values for real-time lighting changes in your scene
// ═══════════════════════════════════════════════════════════════` : '';
        
        const lightingAPI = this.apiRegistry.lights;
        
        return `${comment}
const LIGHTING_CONFIG = {
    // Environment mapping
    environment: {
        enabled: false,              // Enable HDR environment mapping
        hdrPath: null,              // Path to .hdr environment map
        intensity: 1.0              // Environment intensity
    },
    
    // Ambient lighting
    ambient: {
        type: 'AmbientLight',       // Basic ambient illumination
        color: 0x404040,            // Soft gray
        intensity: 0.4              // 0.0 to 1.0
    },
    
    // Hemisphere light (sky/ground simulation)
    hemisphere: {
        enabled: true,
        skyColor: 0x87ceeb,         // Sky blue
        groundColor: 0x8b4513,      // Brown ground
        intensity: 0.6,             // 0.0 to 2.0+
        position: [0, 50, 0]        // High above scene
    },
    
    // Main directional light (sun simulation)
    directional: {
        type: 'DirectionalLight',
        color: 0xffffff,            // White sunlight
        intensity: 1.2,             // 0.0 to 2.0+
        position: [20, 20, 20],     // Sun position [x, y, z]
        target: [0, 0, 0],          // Look at point
        castShadow: true,           // Enable shadows
        shadow: {
            mapSize: 2048,          // Shadow resolution (512, 1024, 2048, 4096)
            camera: {
                near: 1,            // Shadow camera near plane
                far: 200,           // Shadow camera far plane
                left: -50,          // Shadow camera bounds
                right: 50,
                top: 50,
                bottom: -50
            }
        }
    },
    
    // Spotlight array (focused lighting)
    spotLights: [
        {
            type: 'SpotLight',
            color: 0xffffff,        // White
            intensity: 1.5,         // 0.0 to 2.0+
            position: [15, 15, 15], // Light position
            target: [0, 0, 0],      // Focus point
            angle: Math.PI / 6,     // Cone angle (radians)
            penumbra: 0.3,          // Soft edge (0.0 = hard, 1.0 = soft)
            decay: 1,               // Light falloff
            distance: 100,          // Max range
            castShadow: true
        }
    ],
    
    // Point lights array (omnidirectional)
    pointLights: [
        {
            type: 'PointLight',
            color: 0x9dd9d9,        // Teal accent
            intensity: 0.8,         // 0.0 to 2.0+
            position: [10, 10, 10], // Light position
            distance: 50,           // Light reach distance (0 = infinite)
            decay: 2                // Physical light falloff
        },
        {
            type: 'PointLight',
            color: 0xc77dcd,        // Purple accent  
            intensity: 0.5,         // 0.0 to 2.0+
            position: [-10, 5, -10],
            distance: 30,           // Shorter range
            decay: 2
        }
    ],
    
    // Area lights (advanced realistic lighting)
    areaLights: [
        {
            type: 'RectAreaLight',
            color: 0xffffff,        // White
            intensity: 10,          // Higher intensity for area lights
            width: 10,              // Light panel width
            height: 10,             // Light panel height
            position: [0, 20, 0],   // Position above scene
            rotation: [-Math.PI/2, 0, 0] // Point downward
        }
    ],
    
    // Light probes (for realistic ambient)
    lightProbes: [
        {
            type: 'AmbientLightProbe',
            color: 0x444466,
            intensity: 0.3
        }
    ],
    
    // Global lighting settings
    global: {
        enableShadows: true,        // Master shadow enable
        shadowType: 'PCFSoft',      // Shadow type (Basic, PCF, PCFSoft, VSM)
        shadowAutoUpdate: true,     // Auto-update shadows
        physicallyCorrectLights: true, // Physically accurate lighting
        outputEncoding: 'sRGB',     // Color space (Linear, sRGB, Gamma)
        toneMapping: 'ACES',        // Tone mapping (Linear, Reinhard, Cineon, ACES)
        toneMappingExposure: 1.0    // Exposure adjustment
    }
};`;
    }
    
    /**
     * Generate animation code for objects with animations
     */
    generateObjectAnimations(objects, includeComments) {
        console.log('🎬 Generating animations for', objects.length, 'objects');
        objects.forEach((obj, i) => {
            console.log(`  ${i}: ${obj.name} - animation: ${obj.animation?.type || 'none'}`);
        });
        
        const animatedObjects = objects.filter(obj => obj.animation && obj.animation.type !== 'none');
        
        if (animatedObjects.length === 0) {
            console.log('🎬 No animated objects found, returning placeholder');
            return '        // 💡 ADD CUSTOM ANIMATIONS HERE\n        // Example: rotate objects, animate materials, etc.';
        }
        
        console.log('🎬 Found', animatedObjects.length, 'animated objects');
        
        const comment = includeComments ? `        // 🎬 Object Animations
        // These animations are based on your UI settings` : '';
        
        const animationCode = animatedObjects.map(obj => {
            // Safety checks for object structure
            if (!obj || !obj.name || !obj.animation) {
                console.warn('⚠️ Invalid animated object detected:', obj);
                return '        // Invalid animation object skipped';
            }
            
            const varName = this.sanitizeVariableName(obj.name);
            const { type, speed } = obj.animation;
            
            // Safety check for speed value
            const safeSpeed = typeof speed === 'number' ? speed : 0.01;
            
            switch (type) {
                case 'rotate-y':
                    return `        ${varName}.rotation.y += ${safeSpeed.toFixed(4)};`;
                    
                case 'rotate-xyz':
                    return `        ${varName}.rotation.x += ${(safeSpeed * 0.7).toFixed(4)};
        ${varName}.rotation.y += ${safeSpeed.toFixed(4)};
        ${varName}.rotation.z += ${(safeSpeed * 0.3).toFixed(4)};`;
                    
                case 'bounce':
                    const bounceY = obj.transform?.position?.[1] ?? 0;
                    return `        ${varName}.position.y = ${bounceY.toFixed(2)} + Math.sin(Date.now() * ${(safeSpeed * 0.01).toFixed(4)}) * 2;`;
                    
                case 'orbit':
                    const orbitX = obj.transform?.position?.[0] ?? 0;
                    const orbitZ = obj.transform?.position?.[2] ?? 0;
                    return `        const orbitTime = Date.now() * ${(safeSpeed * 0.002).toFixed(4)};
        ${varName}.position.x = ${orbitX.toFixed(2)} + Math.cos(orbitTime) * 5;
        ${varName}.position.z = ${orbitZ.toFixed(2)} + Math.sin(orbitTime) * 5;
        ${varName}.lookAt(0, ${varName}.position.y, 0);`;
                    
                case 'pulse':
                    return `        const pulseScale = 1 + Math.sin(Date.now() * ${(safeSpeed * 0.005).toFixed(4)}) * 0.3;
        ${varName}.scale.setScalar(pulseScale);`;
                    
                case 'float':
                    const floatY = obj.transform?.position?.[1] ?? 0;
                    return `        ${varName}.position.y = ${floatY.toFixed(2)} + Math.sin(Date.now() * ${(safeSpeed * 0.003).toFixed(4)}) * 1;
        ${varName}.rotation.y += ${(safeSpeed * 0.5).toFixed(4)};`;
                    
                default:
                    return `        // Animation type '${type}' not implemented`;
            }
        }).join('\n');
        
        return `${comment}
${animationCode}`;
    }
    
    /**
     * Generate main function that creates the scene
     */
    generateMainFunctionSection(objects, includeComments, includeAnimation) {
        const comment = includeComments ? `
// ═══════════════════════════════════════════════════════════════
// 🚀 MAIN SCENE CREATION FUNCTION
// This function creates and initializes the complete Three.js scene
// ═══════════════════════════════════════════════════════════════` : '';
        
        const animationSection = includeAnimation ? `
    
    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        
${this.generateObjectAnimations(objects, includeComments)}
        
        renderer.render(scene, camera);
    };
    animate();` : `
    
    // Render the scene
    renderer.render(scene, camera);`;
        
        return `${comment}
export async function createEditableScene(container) {
    // ────────────────────────────────────────────────────────────
    // Scene Setup
    // ────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(SCENE_CONFIG.backgroundColor);
    
    // Camera Setup
    const camera = new THREE.PerspectiveCamera(
        SCENE_CONFIG.camera.fov,
        container.clientWidth / container.clientHeight,
        SCENE_CONFIG.camera.near,
        SCENE_CONFIG.camera.far
    );
    camera.position.set(...SCENE_CONFIG.camera.position);
    
    // Renderer Setup
    const renderer = new THREE.WebGLRenderer(SCENE_CONFIG.renderer);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(SCENE_CONFIG.renderer.pixelRatio);
    renderer.shadowMap.enabled = SCENE_CONFIG.renderer.shadowMap;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Controls Setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // ────────────────────────────────────────────────────────────
    // Lighting Setup
    // ────────────────────────────────────────────────────────────
    setupLighting(scene);
    
    // ────────────────────────────────────────────────────────────
    // Load Objects
    // ────────────────────────────────────────────────────────────
    await loadSceneObjects(scene);
    
    // ────────────────────────────────────────────────────────────
    // Resize Handler
    // ────────────────────────────────────────────────────────────
    const handleResize = () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);${animationSection}
    
    // Return scene components for external access
    return {
        scene,
        camera, 
        renderer,
        controls,
        cleanup: () => {
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
        }
    };
}

// ═══════════════════════════════════════════════════════════════
// 🔧 HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Setup scene lighting based on LIGHTING_CONFIG
 */
function setupLighting(scene) {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(
        LIGHTING_CONFIG.ambient.color,
        LIGHTING_CONFIG.ambient.intensity
    );
    scene.add(ambientLight);
    
    // Main directional light
    const directionalLight = new THREE.DirectionalLight(
        LIGHTING_CONFIG.directional.color,
        LIGHTING_CONFIG.directional.intensity
    );
    directionalLight.position.set(...LIGHTING_CONFIG.directional.position);
    directionalLight.castShadow = LIGHTING_CONFIG.directional.castShadow;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Fill light
    const fillLight = new THREE.DirectionalLight(
        LIGHTING_CONFIG.fill.color,
        LIGHTING_CONFIG.fill.intensity
    );
    fillLight.position.set(...LIGHTING_CONFIG.fill.position);
    scene.add(fillLight);
    
    // Point lights
    LIGHTING_CONFIG.pointLights.forEach(lightConfig => {
        const pointLight = new THREE.PointLight(
            lightConfig.color,
            lightConfig.intensity,
            lightConfig.distance
        );
        pointLight.position.set(...lightConfig.position);
        scene.add(pointLight);
    });
}

/**
 * Load all scene objects based on configuration
 */
async function loadSceneObjects(scene) {
    const objLoader = new OBJLoader();
    const loadedObjects = [];
    
    // Get all object configurations
    const objectConfigs = [
        ${this.generateObjectConfigReferences()}
    ];
    
    // Load each object based on its type
    for (const config of objectConfigs) {
        try {
            let object;
            
            if (config.type === 'primitive') {
                // Create primitive geometry directly
                console.log(\`🔄 Creating primitive: \${config.geometryType}\`);
                object = createPrimitiveObject(config);
                console.log(\`✅ Created primitive: \${config.geometryType}\`);
            } else {
                // Load OBJ file
                console.log(\`🔄 Loading OBJ: \${config.fileName}\`);
                object = await loadOBJObject(objLoader, config);
                console.log(\`✅ Loaded OBJ: \${config.fileName}\`);
            }
            
            scene.add(object);
            loadedObjects.push(object);
            
        } catch (error) {
            const identifier = config.type === 'primitive' ? config.geometryType : config.fileName;
            console.error(\`❌ Failed to load \${identifier}:\`, error);
        }
    }
    
    return loadedObjects;
}

/**
 * Load individual OBJ object with material and transform
 */
function loadOBJObject(loader, config) {
    return new Promise((resolve, reject) => {
        loader.load(
            config.fileName,
            (object) => {
                // Apply material
                const material = createMaterialFromConfig(config.material);
                
                object.traverse((child) => {
                    if (child.isMesh) {
                        child.material = material;
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                // Apply transform
                object.position.set(...config.transform.position);
                object.rotation.set(...config.transform.rotation);
                object.scale.set(...config.transform.scale);
                
                resolve(object);
            },
            undefined,
            reject
        );
    });
}

/**
 * Create primitive object with material and transform
 */
function createPrimitiveObject(config) {
    // Create geometry from configuration
    const geometry = config.geometry;
    
    // Create material
    const material = createMaterialFromConfig(config.material);
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    
    // Enable shadows
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Apply transform
    mesh.position.set(...config.transform.position);
    mesh.rotation.set(...config.transform.rotation);
    mesh.scale.set(...config.transform.scale);
    
    return mesh;
}

/**
 * Create Three.js material from configuration object
 */
function createMaterialFromConfig(materialConfig) {
    const { type = 'standard', color = '#ffffff', wireframe = false, transparent = false, 
            opacity = 1.0, roughness = 0.5, metalness = 0.0 } = materialConfig;
    
    switch (type) {
        case 'basic':
            return new THREE.MeshBasicMaterial({
                color: new THREE.Color(color),
                wireframe, transparent, opacity
            });
            
        case 'lambert':
            return new THREE.MeshLambertMaterial({
                color: new THREE.Color(color),
                wireframe, transparent, opacity
            });
            
        case 'phong':
            return new THREE.MeshPhongMaterial({
                color: new THREE.Color(color),
                wireframe, transparent, opacity
            });
            
        case 'physical':
            return new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(color),
                wireframe, transparent, opacity,
                roughness, metalness
            });
            
        case 'matcap':
            return new THREE.MeshMatcapMaterial({
                color: new THREE.Color(color),
                transparent, opacity
            });
            
        case 'shader':
            return new THREE.ShaderMaterial({
                vertexShader: materialConfig.vertexShader || getDefaultVertexShader(),
                fragmentShader: materialConfig.fragmentShader || getDefaultFragmentShader(),
                uniforms: materialConfig.uniforms || getDefaultUniforms()
            });
            
        case 'toon':
            return new THREE.MeshToonMaterial({
                color: new THREE.Color(color),
                wireframe, transparent, opacity
            });
            
        case 'normal':
            return new THREE.MeshNormalMaterial({ wireframe, transparent, opacity });
            
        case 'depth':
            return new THREE.MeshDepthMaterial({ wireframe, transparent, opacity });
            
        case 'distance':
            return new THREE.MeshDistanceMaterial({ wireframe, transparent, opacity });
            
        case 'lineDashed':
            return new THREE.LineDashedMaterial({
                color: new THREE.Color(color), transparent, opacity,
                dashSize: 3, gapSize: 1
            });
            
        case 'lineBasic':
            return new THREE.LineBasicMaterial({
                color: new THREE.Color(color), transparent, opacity
            });
            
        case 'points':
            return new THREE.PointsMaterial({
                color: new THREE.Color(color), transparent, opacity,
                size: 2, sizeAttenuation: true
            });
            
        case 'sprite':
            return new THREE.SpriteMaterial({
                color: new THREE.Color(color), transparent, opacity
            });
            
        case 'standard':
        default:
            return new THREE.MeshStandardMaterial({
                color: new THREE.Color(color),
                wireframe, transparent, opacity,
                roughness, metalness
            });
    }
}`;
    }
    
    /**
     * Generate post-processing effects section
     */
    generatePostProcessingSection(includeComments) {
        const comment = includeComments ? `
// ═══════════════════════════════════════════════════════════════
// ✨ POST-PROCESSING EFFECTS
// Advanced visual effects pipeline - edit values for stunning visual enhancements
// Includes: Bloom, SSAO, DOF, Color Correction, Film Grain, and more
// ═══════════════════════════════════════════════════════════════` : '';
        
        return `${comment}
const POST_PROCESSING_CONFIG = {
    // Master toggle
    enabled: true,
    
    // Bloom effect (glowing highlights)
    bloom: {
        enabled: true,
        threshold: 0.8,             // Brightness threshold for bloom
        strength: 0.3,              // Bloom intensity
        radius: 0.8,                // Bloom spread
        exposure: 1.0               // Scene exposure
    },
    
    // Screen Space Ambient Occlusion
    ssao: {
        enabled: false,
        radius: 0.1,                // AO radius
        bias: 0.01,                 // AO bias
        intensity: 0.3,             // AO strength
        scale: 1.0,                 // AO scale
        kernelSize: 32              // Quality (8, 16, 32, 64)
    },
    
    // Depth of Field (camera focus)
    dof: {
        enabled: false,
        focusDistance: 10,          // Focus point distance
        aperture: 0.025,            // Aperture size (blur strength)
        maxBlur: 0.01               // Maximum blur amount
    },
    
    // Color correction
    colorCorrection: {
        enabled: true,
        brightness: 0.0,            // -1.0 to 1.0
        contrast: 0.1,              // -1.0 to 1.0
        saturation: 0.2,            // -1.0 to 1.0
        hue: 0.0,                   // -180 to 180 degrees
        gamma: 2.2                  // Gamma correction
    },
    
    // Film grain and noise
    filmGrain: {
        enabled: false,
        intensity: 0.5,             // 0.0 to 1.0
        size: 1.0                   // Grain size multiplier
    },
    
    // Anti-aliasing
    antialiasing: {
        enabled: true,
        type: 'FXAA',               // 'FXAA', 'SMAA', 'TAA'
        quality: 'medium'           // 'low', 'medium', 'high', 'ultra'
    },
    
    // Vignette effect
    vignette: {
        enabled: false,
        darkness: 0.5,              // 0.0 to 1.0
        offset: 1.0                 // Vignette offset
    },
    
    // Chromatic aberration
    chromaticAberration: {
        enabled: false,
        offset: 0.001               // Aberration strength
    },
    
    // God rays (volumetric lighting)
    godRays: {
        enabled: false,
        lightPosition: [10, 10, 10], // Light source position
        density: 0.96,              // Ray density
        decay: 0.96,                // Ray decay
        weight: 0.4,                // Ray weight
        samples: 100                // Quality samples
    }
};`;
    }
    
    /**
     * Generate production utilities section
     */
    generateProductionUtilitiesSection(includeComments) {
        const comment = includeComments ? `
// ═══════════════════════════════════════════════════════════════
// 🚀 PRODUCTION UTILITIES
// Advanced scene export, optimization, and deployment tools
// ═══════════════════════════════════════════════════════════════` : '';
        
        return `${comment}
const PRODUCTION_CONFIG = {
    // Performance optimization
    optimization: {
        enableFrustumCulling: true,     // Cull objects outside view
        enableGeometryMerging: false,   // Merge similar geometries
        enableTextureCompression: true,  // Compress textures
        enableInstancing: false,        // Use instanced rendering
        enableLOD: false,              // Level of Detail system
        maxObjects: 1000,              // Object count limit
        targetFPS: 60                  // Performance target
    },
    
    // Export formats
    export: {
        formats: ['gltf', 'obj', 'fbx', 'dae', 'ply', 'stl'],
        includeTextures: true,          // Include texture files
        includeLighting: true,          // Include light setup
        includeAnimation: true,         // Include animations
        optimize: true,                 // Optimize exported mesh
        precision: 6                    // Decimal precision
    },
    
    // Asset management
    assets: {
        basePath: './assets/',          // Asset base directory
        textureFormat: 'webp',          // Preferred texture format
        compressionLevel: 0.8,          // Texture compression (0.0 to 1.0)
        generateMipmaps: true,          // Auto-generate mipmaps
        maxTextureSize: 2048            // Maximum texture resolution
    },
    
    // Development tools
    development: {
        showStats: true,                // Show performance stats
        enableDebugger: false,          // Three.js debugger
        logPerformance: true,           // Log performance metrics
        showBoundingBoxes: false,       // Visual debugging
        enableWireframe: false          // Global wireframe toggle
    }
};`;
    }
    
    /**
     * Generate enhanced usage example section
     */
    generateUsageSection() {
        return `
// ═══════════════════════════════════════════════════════════════
// 📋 USAGE EXAMPLES & API REFERENCE
// ═══════════════════════════════════════════════════════════════
/*

// 🚀 BASIC USAGE:
const container = document.getElementById('threejs-container');
const sceneComponents = await createEditableScene(container);

// 🎯 ACCESS SCENE COMPONENTS:
const { scene, camera, renderer, controls } = sceneComponents;
console.log('Scene objects:', scene.children.length);
console.log('Camera position:', camera.position);

// 🎨 DYNAMIC MATERIAL UPDATES:
const material = scene.getObjectByName('MyObject')?.material;
if (material) {
    material.color.setHex(0xff0000);    // Change to red
    material.roughness = 0.1;           // Make it shiny
    material.metalness = 0.8;           // Make it metallic
}

// 💡 DYNAMIC LIGHTING:
const light = scene.getObjectByName('DirectionalLight');
if (light) {
    light.intensity = 2.0;              // Increase intensity
    light.position.set(30, 30, 30);     // Move light
}

// 🎬 ANIMATION CONTROL:
const animatedObject = scene.getObjectByName('AnimatedCube');
if (animatedObject) {
    animatedObject.rotation.speed = 0.05; // Custom animation property
}

// ✨ POST-PROCESSING CONTROL (if enabled):
if (sceneComponents.composer) {
    // Access post-processing passes
    const bloomPass = sceneComponents.composer.passes.find(pass => pass.name === 'bloom');
    if (bloomPass) {
        bloomPass.strength = 0.5;       // Adjust bloom intensity
    }
}

// 🚀 PRODUCTION EXPORT:
const exportData = {
    scene: scene.toJSON(),              // Export scene structure
    materials: extractMaterialData(scene), // Custom material extractor
    lighting: extractLightingData(scene),  // Custom lighting extractor
    metadata: {
        generator: 'Three.js Loader & Editor v0.0.7',
        timestamp: new Date().toISOString(),
        apiVersion: 'Phase 2.3 Complete'
    }
};

// 🗎️ SAVE SCENE (example):
localStorage.setItem('myScene', JSON.stringify(exportData));

// 📋 CLEANUP:
sceneComponents.cleanup();

// 🔧 ADVANCED API USAGE:
// Access the comprehensive Three.js API registry:
const availableGeometries = Object.keys(sceneComponents.apiRegistry.geometries);
const availableMaterials = Object.keys(sceneComponents.apiRegistry.materials);
const availableLights = Object.keys(sceneComponents.apiRegistry.lights);

console.log('Available geometries:', availableGeometries.length);
console.log('Available materials:', availableMaterials.length);
console.log('Available lights:', availableLights.length);

*/`;
    }
    
    /**
     * Generate empty scene template for when no objects are loaded
     */
    generateEmptySceneTemplate(includeComments) {
        const comment = includeComments ? `
/**
 * 🎯 EMPTY SCENE TEMPLATE
 * No objects currently loaded. Load some OBJ files to generate code!
 */` : '';
        
        return `${comment}
// Load some objects in the Three.js Loader & Editor to generate code here!
console.log('No objects loaded yet. Start by loading OBJ files!');`;
    }
    
    /**
     * Generate material properties based on type and API registry
     */
    generateMaterialProperties(material, materialConfig, includeComments) {
        const properties = [];
        
        // Safety check for materialConfig
        if (!materialConfig || !materialConfig.properties) {
            console.warn('⚠️  materialConfig missing or invalid, using fallback properties');
            // Fallback basic properties
            const color = material.color || '#9dd9d9';
            const wireframe = material.wireframe !== undefined ? material.wireframe : true;
            const opacity = material.opacity !== undefined ? material.opacity : 1.0;
            
            properties.push(`    color: '${color}',    // Color (hex, rgb, hsl, or Three.js Color)`);
            properties.push(`    wireframe: ${wireframe},    // Wireframe rendering (true/false)`);
            properties.push(`    opacity: ${opacity},    // Transparency (0.0 = invisible, 1.0 = opaque)`);
            
            return properties.join('\n');
        }
        
        // Add common properties with enhanced documentation
        if (materialConfig.properties.color) {
            const color = material.color || '#9dd9d9';
            const comment = includeComments ? '    // Color (hex, rgb, hsl, or Three.js Color)' : '';
            properties.push(`    color: '${color}',${comment}`);
        }
        
        if (materialConfig.properties.wireframe) {
            const wireframe = material.wireframe !== undefined ? material.wireframe : true;
            const comment = includeComments ? '    // Wireframe rendering (true/false)' : '';
            properties.push(`    wireframe: ${wireframe},${comment}`);
        }
        
        if (materialConfig.properties.opacity) {
            const opacity = material.opacity !== undefined ? material.opacity : 1.0;
            const transparent = opacity < 1;
            const comment = includeComments ? '    // Transparency (0.0 = invisible, 1.0 = opaque)' : '';
            properties.push(`    opacity: ${opacity},${comment}`);
            properties.push(`    transparent: ${transparent},    // Auto-set based on opacity`);
        }
        
        if (materialConfig.properties.roughness) {
            const roughness = material.roughness !== undefined ? material.roughness : 0.5;
            const comment = includeComments ? '    // Surface roughness (0.0 = mirror, 1.0 = rough)' : '';
            properties.push(`    roughness: ${roughness},${comment}`);
        }
        
        if (materialConfig.properties.metalness) {
            const metalness = material.metalness !== undefined ? material.metalness : 0.0;
            const comment = includeComments ? '    // Metallic appearance (0.0 = dielectric, 1.0 = metallic)' : '';
            properties.push(`    metalness: ${metalness},${comment}`);
        }
        
        // Add advanced properties for PBR materials
        if (materialConfig.properties.clearcoat) {
            const clearcoat = material.clearcoat || 0.0;
            const clearcoatRoughness = material.clearcoatRoughness || 0.0;
            if (includeComments) properties.push('    // Advanced PBR properties:');
            properties.push(`    clearcoat: ${clearcoat},        // Clear coat intensity (0.0 to 1.0)`);
            properties.push(`    clearcoatRoughness: ${clearcoatRoughness}, // Clear coat roughness (0.0 to 1.0)`);
        }
        
        if (materialConfig.properties.transmission) {
            const transmission = material.transmission || 0.0;
            const thickness = material.thickness || 0.0;
            properties.push(`    transmission: ${transmission},    // Light transmission (0.0 to 1.0)`);
            properties.push(`    thickness: ${thickness},         // Material thickness`);
        }
        
        if (materialConfig.properties.emissive) {
            const emissive = material.emissive || '#000000';
            const emissiveIntensity = material.emissiveIntensity || 1.0;
            properties.push(`    emissive: '${emissive}',        // Self-illumination color`);
            properties.push(`    emissiveIntensity: ${emissiveIntensity},  // Emission intensity`);
        }
        
        // Add material-specific properties
        if (material.type === 'matcap' && material.matcap) {
            properties.push(`    matcapPath: '${material.matcap}', // MatCap texture file path`);
        }
        
        if (material.type === 'shader') {
            properties.push('    // Custom shader properties:');
            properties.push('    vertexShader: null,      // Custom vertex shader (will use default)');
            properties.push('    fragmentShader: null,    // Custom fragment shader (will use default)');
            properties.push('    uniforms: {},            // Custom uniforms object');
        }
        
        return properties.join('\n');
    }
    
    /**
     * Extract unique materials with comprehensive type detection
     */
    extractUniqueMaterials(objects) {
        const materials = objects.map(obj => {
            const material = obj.material || {};
            
            // Enhance material with comprehensive API data
            return {
                ...material,
                type: this.detectMaterialType(material),
                apiSupport: this.apiRegistry.materials[material.type || 'standard']
            };
        });
        
        // For now, return all materials (could deduplicate similar ones in future)
        return materials;
    }
    
    /**
     * Detect material type from material properties
     */
    detectMaterialType(material) {
        if (!material) return 'standard';
        
        // Check for specific material types
        if (material.matcap) return 'matcap';
        if (material.vertexShader || material.fragmentShader) return 'shader';
        if (material.transmission !== undefined) return 'physical';
        if (material.clearcoat !== undefined) return 'physical';
        if (material.specular !== undefined) return 'phong';
        if (material.gradientMap !== undefined) return 'toon';
        
        // Default detection based on properties
        if (material.roughness !== undefined || material.metalness !== undefined) {
            return 'standard';
        }
        
        return material.type || 'standard';
    }
    
    /**
     * Generate object configuration references for the main function
     */
    generateObjectConfigReferences() {
        const objects = this.objectManager.getAllObjects();
        return objects.map(obj => {
            const varName = this.sanitizeVariableName(obj.name);
            return `${varName.toUpperCase()}_CONFIG`;
        }).join(',\n        ');
    }
    
    /**
     * Sanitize name for valid JavaScript variable
     */
    sanitizeVariableName(name) {
        // Handle null/undefined names with fallback
        const safeName = name || 'unknown_object';
        return safeName.toString().replace(/[^a-zA-Z0-9_]/g, '_').replace(/^[0-9]/, '_$&');
    }
}