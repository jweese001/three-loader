import * as THREE from 'three';

/**
 * CodeTemplateGenerator - Generates editable, structured Three.js code from loaded models
 * Part of the Live Code Generation & Compilation system
 */
export class CodeTemplateGenerator {
    constructor(scene, objectManager) {
        this.scene = scene;
        this.objectManager = objectManager;
        
        console.log('🔧 CodeTemplateGenerator initialized');
    }
    
    /**
     * Generate complete editable Three.js scene code
     * @param {Object} options - Generation options
     * @returns {string} Complete Three.js scene code
     */
    generateEditableCode(options = {}) {
        const {
            includeComments = true,
            includeImports = true,
            includeAnimation = true,
            moduleFormat = 'es6' // 'es6' or 'iife'
        } = options;
        
        const objects = this.objectManager.getAllObjects();
        const sceneData = this.scene.exportSceneData();
        const timestamp = new Date().toISOString();
        
        if (objects.length === 0) {
            return this.generateEmptySceneTemplate(includeComments);
        }
        
        return this.buildEditableCode({
            objects,
            sceneData,
            timestamp,
            includeComments,
            includeImports,
            includeAnimation,
            moduleFormat
        });
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
     * Generate materials section with editable properties
     */
    generateMaterialsSection(objects, includeComments) {
        const comment = includeComments ? `
// ═══════════════════════════════════════════════════════════════
// 🎨 MATERIALS 
// Edit these material properties to see instant changes in the viewport
// ═══════════════════════════════════════════════════════════════` : '';
        
        const materials = this.extractUniqueMaterials(objects);
        
        const materialDefinitions = materials.map((material, index) => {
            const name = `MATERIAL_${index + 1}`;
            return this.generateMaterialDefinition(name, material, includeComments);
        }).join('\n\n');
        
        return `${comment}
${materialDefinitions}`;
    }
    
    /**
     * Generate individual material definition
     */
    generateMaterialDefinition(name, material, includeComments) {
        const guide = includeComments ? `    // 💡 TIP: Change these values and see instant updates!` : '';
        
        // Provide defaults if material is null or missing properties
        const safeMaterial = material || {};
        const color = safeMaterial.color || '#9dd9d9';
        const wireframe = safeMaterial.wireframe !== undefined ? safeMaterial.wireframe : true;
        const opacity = safeMaterial.opacity !== undefined ? safeMaterial.opacity : 1.0;
        const roughness = safeMaterial.roughness !== undefined ? safeMaterial.roughness : 0.5;
        const metalness = safeMaterial.metalness !== undefined ? safeMaterial.metalness : 0.0;
        
        return `const ${name} = {
${guide}
    color: '${color}',           // Hex color (e.g., '#ff0000', '#9dd9d9')
    wireframe: ${wireframe},               // true/false - show wireframe
    opacity: ${opacity},                   // 0.0 to 1.0 - transparency
    transparent: ${opacity < 1},            // Enable transparency
    roughness: ${roughness},                 // 0.0 to 1.0 - surface roughness
    metalness: ${metalness}                  // 0.0 to 1.0 - metallic appearance
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
        const { name, fileName, transform, stats } = objectData;
        const varName = this.sanitizeVariableName(name);
        const materialRef = `MATERIAL_${index + 1}`;
        
        // Provide defaults if transform is null or missing properties
        const safeTransform = transform || {};
        const position = safeTransform.position || { x: 0, y: 0, z: 0 };
        const rotation = safeTransform.rotation || { x: 0, y: 0, z: 0 };
        const scale = safeTransform.scale || { x: 1, y: 1, z: 1 };
        
        const guide = includeComments ? `    // 💡 Edit these transform values for instant positioning changes!` : '';
        const statsComment = includeComments && stats ? `    // 📊 Stats: ${stats.meshes} meshes, ${stats.vertices} vertices, ${stats.faces} faces` : '';
        
        return `const ${varName.toUpperCase()}_CONFIG = {
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
    
    /**
     * Generate lighting section
     */
    generateLightingSection(includeComments) {
        const comment = includeComments ? `
// ═══════════════════════════════════════════════════════════════
// 💡 LIGHTING SETUP
// Customize the lighting to enhance your scene
// ═══════════════════════════════════════════════════════════════` : '';
        
        return `${comment}
const LIGHTING_CONFIG = {
    // Ambient light (overall scene brightness)
    ambient: {
        color: 0x404040,        // Soft gray
        intensity: 0.4          // 0.0 to 1.0
    },
    
    // Main directional light (like sun)
    directional: {
        color: 0xffffff,        // White
        intensity: 1.0,         // 0.0 to 2.0+
        position: [20, 20, 20], // [x, y, z]
        castShadow: true
    },
    
    // Fill light (reduces harsh shadows)
    fill: {
        color: 0x9dd9d9,        // Soft teal
        intensity: 0.3,         // 0.0 to 1.0
        position: [-10, -10, -10]
    },
    
    // Accent point lights
    pointLights: [
        {
            color: 0x9dd9d9,    // Teal accent
            intensity: 0.8,     // 0.0 to 2.0+
            position: [10, 10, 10],
            distance: 50        // Light reach distance
        },
        {
            color: 0xc77dcd,    // Purple accent  
            intensity: 0.5,     // 0.0 to 2.0+
            position: [-10, 5, -10],
            distance: 30        // Light reach distance
        }
    ]
};`;
    }
    
    /**
     * Generate animation code for objects with animations
     */
    generateObjectAnimations(objects, includeComments) {
        const animatedObjects = objects.filter(obj => obj.animation && obj.animation.type !== 'none');
        
        if (animatedObjects.length === 0) {
            return '        // 💡 ADD CUSTOM ANIMATIONS HERE\n        // Example: rotate objects, animate materials, etc.';
        }
        
        const comment = includeComments ? `        // 🎬 Object Animations
        // These animations are based on your UI settings` : '';
        
        const animationCode = animatedObjects.map(obj => {
            const varName = this.sanitizeVariableName(obj.name);
            const { type, speed } = obj.animation;
            
            switch (type) {
                case 'rotate-y':
                    return `        ${varName}.rotation.y += ${speed.toFixed(4)};`;
                    
                case 'rotate-xyz':
                    return `        ${varName}.rotation.x += ${(speed * 0.7).toFixed(4)};
        ${varName}.rotation.y += ${speed.toFixed(4)};
        ${varName}.rotation.z += ${(speed * 0.3).toFixed(4)};`;
                    
                case 'bounce':
                    return `        ${varName}.position.y = ${obj.transform.position[1].toFixed(2)} + Math.sin(Date.now() * ${(speed * 0.01).toFixed(4)}) * 2;`;
                    
                case 'orbit':
                    return `        const orbitTime = Date.now() * ${(speed * 0.002).toFixed(4)};
        ${varName}.position.x = ${obj.transform.position[0].toFixed(2)} + Math.cos(orbitTime) * 5;
        ${varName}.position.z = ${obj.transform.position[2].toFixed(2)} + Math.sin(orbitTime) * 5;
        ${varName}.lookAt(0, ${varName}.position.y, 0);`;
                    
                case 'pulse':
                    return `        const pulseScale = 1 + Math.sin(Date.now() * ${(speed * 0.005).toFixed(4)}) * 0.3;
        ${varName}.scale.setScalar(pulseScale);`;
                    
                case 'float':
                    return `        ${varName}.position.y = ${obj.transform.position[1].toFixed(2)} + Math.sin(Date.now() * ${(speed * 0.003).toFixed(4)}) * 1;
        ${varName}.rotation.y += ${(speed * 0.5).toFixed(4)};`;
                    
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
    const loader = new OBJLoader();
    const loadedObjects = [];
    
    // Get all object configurations
    const objectConfigs = [
        ${this.generateObjectConfigReferences()}
    ];
    
    // Load each object
    for (const config of objectConfigs) {
        try {
            console.log(\`🔄 Loading: \${config.fileName}\`);
            
            const object = await loadOBJObject(loader, config);
            scene.add(object);
            loadedObjects.push(object);
            
            console.log(\`✅ Loaded: \${config.fileName}\`);
            
        } catch (error) {
            console.error(\`❌ Failed to load \${config.fileName}:\`, error);
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
                const material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(config.material.color),
                    wireframe: config.material.wireframe,
                    transparent: config.material.transparent,
                    opacity: config.material.opacity,
                    roughness: config.material.roughness,
                    metalness: config.material.metalness
                });
                
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
}`;
    }
    
    /**
     * Generate usage example section
     */
    generateUsageSection() {
        return `
// ═══════════════════════════════════════════════════════════════
// 📋 USAGE EXAMPLE
// ═══════════════════════════════════════════════════════════════
/*

// Basic usage:
const container = document.getElementById('threejs-container');
const sceneComponents = await createEditableScene(container);

// Access scene components:
console.log('Scene:', sceneComponents.scene);
console.log('Camera:', sceneComponents.camera);

// Cleanup when done:
sceneComponents.cleanup();

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
     * Extract unique materials from objects
     */
    extractUniqueMaterials(objects) {
        const materials = objects.map(obj => obj.material);
        // For now, return all materials (could deduplicate similar ones)
        return materials;
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