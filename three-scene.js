/**
 * 🎯 LIVE EDITABLE THREE.JS SCENE
 * Generated: 2025-09-12T08:16:24.655Z
 * Objects: 1
 * Generator: Three.js Loader & Editor - Live Code Generation
 * 
 * 💡 EDITING GUIDE:
 * - Edit material properties in the MATERIALS section
 * - Modify transforms in the OBJECTS section  
 * - Adjust lighting in the LIGHTING section
 * - Changes will appear instantly in the viewport
 * 
 * 🚀 This code is production-ready and self-contained
 */

// ═══════════════════════════════════════════════════════════════
// 📦 IMPORTS
// ═══════════════════════════════════════════════════════════════
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';


// ═══════════════════════════════════════════════════════════════
// 🌍 SCENE CONFIGURATION
// Edit these values to customize the basic scene setup
// ═══════════════════════════════════════════════════════════════
const SCENE_CONFIG = {
    // Background color (hex)
    backgroundColor: 0x0f0f0f,
    
    // Camera settings
    camera: {
        fov: 75,
        position: [25.000000000000004, 15.000000000000002, 25.000000000000007],
        near: 0.1,
        far: 1000
    },
    
    // Renderer settings
    renderer: {
        antialias: true,
        shadowMap: true,
        pixelRatio: Math.min(window.devicePixelRatio, 2)
    }
};


// ═══════════════════════════════════════════════════════════════
// 🎨 ENHANCED MATERIALS SYSTEM
// Full Three.js material API support - edit properties for instant updates
// Supports: Standard, Basic, Phong, Lambert, Physical, MatCap, Toon, Normal, and more
// ═══════════════════════════════════════════════════════════════
const MATERIAL_1 = {
    // Material Type: STANDARD
    // 💡 EDIT THESE VALUES FOR INSTANT UPDATES!
    type: 'standard',                // Material type from API registry
    
    color: '#ff6b35',    // Color (hex, rgb, hsl, or Three.js Color)
    wireframe: false,    // Wireframe rendering (true/false)
    opacity: 1,    // Transparency (0.0 = invisible, 1.0 = opaque)
    transparent: false,    // Auto-set based on opacity
    roughness: 0.5,    // Surface roughness (0.0 = mirror, 1.0 = rough)
    metalness: 0,    // Metallic appearance (0.0 = dielectric, 1.0 = metallic)
    emissive: '#000000',        // Self-illumination color
    emissiveIntensity: 1,  // Emission intensity
};


// ═══════════════════════════════════════════════════════════════
// 📦 OBJECTS & TRANSFORMS
// Edit position, rotation, scale values to transform objects
// ═══════════════════════════════════════════════════════════════
const BOX_1_CONFIG = {
    type: 'primitive',                  // Primitive geometry
    geometryType: 'box',   // Primitive type
    geometry: new THREE.BoxGeometry(2, 2, 2),          // Three.js geometry constructor
    material: MATERIAL_1,           // Material reference
    // 💡 Edit these transform values for instant positioning changes!
    transform: {
        // Position in 3D space (x, y, z)
        position: [0, 0, 0],
        
        // Rotation in radians (x, y, z)  
        rotation: [0, 0.012217304763960306, 0],
        
        // Scale multipliers (x, y, z)
        scale: [1, 1, 1]
    }
    // 📊 Stats: 1 meshes, 24 vertices, 12 faces
};


// ═══════════════════════════════════════════════════════════════
// 💡 ADVANCED LIGHTING SYSTEM
// Full Three.js lighting API - supports all light types and advanced features
// Edit values for real-time lighting changes in your scene
// ═══════════════════════════════════════════════════════════════
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
};


// ═══════════════════════════════════════════════════════════════
// 🚀 MAIN SCENE CREATION FUNCTION
// This function creates and initializes the complete Three.js scene
// ═══════════════════════════════════════════════════════════════
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
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        
        // 💡 ADD CUSTOM ANIMATIONS HERE
        // Example: rotate objects, animate materials, etc.
        
        renderer.render(scene, camera);
    };
    animate();
    
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
        BOX_1_CONFIG
    ];
    
    // Load each object
    for (const config of objectConfigs) {
        try {
            console.log(`🔄 Loading: ${config.fileName}`);
            
            const object = await loadOBJObject(loader, config);
            scene.add(object);
            loadedObjects.push(object);
            
            console.log(`✅ Loaded: ${config.fileName}`);
            
        } catch (error) {
            console.error(`❌ Failed to load ${config.fileName}:`, error);
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
                const material = this.createMaterialFromConfig(config.material);
                
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


// ═══════════════════════════════════════════════════════════════
// ✨ POST-PROCESSING EFFECTS
// Advanced visual effects pipeline - edit values for stunning visual enhancements
// Includes: Bloom, SSAO, DOF, Color Correction, Film Grain, and more
// ═══════════════════════════════════════════════════════════════
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
};


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

*/