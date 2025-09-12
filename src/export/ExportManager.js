import { CodeTemplateGenerator } from '../codegen/CodeTemplateGenerator.js';

export class ExportManager {
    constructor(scene, objectManager) {
        this.scene = scene;
        this.objectManager = objectManager;
        
        // Initialize code template generator for live code generation
        this.codeTemplateGenerator = new CodeTemplateGenerator(scene, objectManager);
        
        console.log('📤 ExportManager initialized with live code generation support');
    }
    
    generateCode() {
        const objects = this.objectManager.getAllObjects();
        const sceneData = this.scene.exportSceneData();
        
        if (objects.length === 0) {
            return '// No objects to export';
        }
        
        const code = this.buildThreeJSCode(objects, sceneData);
        return code;
    }
    
    buildThreeJSCode(objects, sceneData) {
        const timestamp = new Date().toISOString();
        
        return `// Generated Three.js Scene Code
// Created: ${timestamp}
// Objects: ${objects.length}
// Generator: Three.js OBJ Loader & Editor

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

/**
 * Creates and initializes the Three.js scene
 * @param {HTMLElement} container - The container element for the canvas
 * @returns {Object} Scene components (scene, camera, renderer, controls)
 */
export function createThreeScene(container) {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(${sceneData.background ? '0x' + sceneData.background.toString(16).padStart(6, '0') : '0x0f0f0f'});
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
        ${sceneData.camera.fov}, 
        container.clientWidth / container.clientHeight, 
        0.1, 
        1000
    );
    camera.position.set(${sceneData.camera.position.join(', ')});
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);
    
    // Lighting setup
    setupLighting(scene);
    
    // Load and add objects
    loadSceneObjects(scene);
    
    // Handle window resize
    const handleResize = () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    };
    animate();
    
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

/**
 * Sets up scene lighting
 * @param {THREE.Scene} scene - The Three.js scene
 */
function setupLighting(scene) {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(20, 20, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Fill light
    const fillLight = new THREE.DirectionalLight(0x9dd9d9, 0.3);
    fillLight.position.set(-10, -10, -10);
    scene.add(fillLight);
    
    // Accent point lights
    const pointLight1 = new THREE.PointLight(0x9dd9d9, 0.8, 50);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xc77dcd, 0.5, 30);
    pointLight2.position.set(-10, 5, -10);
    scene.add(pointLight2);
}

/**
 * Loads and adds all scene objects
 * @param {THREE.Scene} scene - The Three.js scene
 */
async function loadSceneObjects(scene) {
    const loader = new OBJLoader();
    
${objects.map(obj => this.generateObjectCode(obj)).join('\n\n')}
}

// Usage example:
// const container = document.getElementById('threejs-container');
// const sceneComponents = createThreeScene(container);
// 
// To cleanup when done:
// sceneComponents.cleanup();`;
    }
    
    generateObjectCode(objectData) {
        const { name, fileName, material, transform, animation, stats } = objectData;
        
        return `    // Object: ${name}
    // File: ${fileName}
    // Stats: ${stats.meshes} meshes, ${stats.vertices} vertices, ${stats.faces} faces
    try {
        const ${this.sanitizeVariableName(name)} = await new Promise((resolve, reject) => {
            loader.load(
                '${fileName}', // Update this path to your OBJ file location
                async (object) => {
                    // Load texture if specified
                    let texture = null;
                    if ('${material.texture.filename}') {
                        const textureLoader = new THREE.TextureLoader();
                        try {
                            // Note: Update this path to point to your texture file location
                            texture = await new Promise((texResolve, texReject) => {
                                textureLoader.load(
                                    './textures/${material.texture.filename}', // Update this path as needed
                                    texResolve,
                                    undefined,
                                    texReject
                                );
                            });
                            texture.wrapS = THREE.RepeatWrapping;
                            texture.wrapT = THREE.RepeatWrapping;
                            texture.generateMipmaps = true;
                            texture.minFilter = THREE.LinearMipmapLinearFilter;
                            texture.magFilter = THREE.LinearFilter;
                        } catch (textureError) {
                            console.warn('Failed to load texture: ${material.texture.filename}', textureError);
                        }
                    }
                    
                    // Apply material settings
                    const materialConfig = {
                        color: new THREE.Color('${material.color}'),
                        wireframe: ${material.wireframe},
                        transparent: ${material.opacity < 1},
                        opacity: ${material.opacity}
                    };
                    
                    // Add texture if loaded
                    if (texture) {
                        materialConfig.map = texture;
                    }
                    
                    // Add material-specific properties
                    if ('${material.type}' === 'standard' || '${material.type}' === 'physical') {
                        materialConfig.roughness = ${material.roughness};
                        materialConfig.metalness = ${material.metalness};
                    }
                    
                    // Create material based on type
                    let objectMaterial;
                    switch ('${material.type}') {
                        case 'basic':
                            objectMaterial = new THREE.MeshBasicMaterial(materialConfig);
                            break;
                        case 'lambert':
                            objectMaterial = new THREE.MeshLambertMaterial(materialConfig);
                            break;
                        case 'phong':
                            objectMaterial = new THREE.MeshPhongMaterial(materialConfig);
                            break;
                        case 'physical':
                            objectMaterial = new THREE.MeshPhysicalMaterial(materialConfig);
                            break;
                        case 'matcap':
                            // MatCap material uses 'matcap' property instead of 'map'
                            const matcapConfig = { ...materialConfig };
                            if (matcapConfig.map) {
                                matcapConfig.matcap = matcapConfig.map;
                                delete matcapConfig.map;
                            }
                            objectMaterial = new THREE.MeshMatcapMaterial(matcapConfig);
                            break;
                        case 'standard':
                        default:
                            objectMaterial = new THREE.MeshStandardMaterial(materialConfig);
                            break;
                    }
                    
                    object.traverse((child) => {
                        if (child.isMesh) {
                            child.material = objectMaterial;
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    
                    // Apply transform
                    object.position.set(${transform.position.x}, ${transform.position.y}, ${transform.position.z});
                    object.rotation.set(${transform.rotation.x}, ${transform.rotation.y}, ${transform.rotation.z});
                    object.scale.set(${transform.scale.x}, ${transform.scale.y}, ${transform.scale.z});
                    
                    ${animation.type !== 'none' ? `
                    // Store animation data for later use
                    object.userData.animation = {
                        type: '${animation.type}',
                        speed: ${animation.speed}
                    };` : ''}
                    
                    object.name = '${name}';
                    resolve(object);
                },
                undefined,
                reject
            );
        });
        
        scene.add(${this.sanitizeVariableName(name)});
        console.log('✅ Loaded: ${name}');
        
    } catch (error) {
        console.error('❌ Failed to load ${name}:', error);
    }`;
    }
    
    sanitizeVariableName(name) {
        // Convert to valid JavaScript variable name
        return name.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^[0-9]/, '_$&');
    }
    
    exportScene() {
        // Use the same editable format as "From UI" button for consistency
        const code = this.generateEditableCode({
            includeComments: true,
            includeImports: true,
            includeAnimation: true
        });
        console.log('📤 Scene exported successfully (editable format)');
        return code;
    }
    
    /**
     * Generate editable Three.js code for live editing
     * @param {Object} options - Generation options
     * @returns {string} Editable Three.js code
     */
    generateEditableCode(options = {}) {
        console.log('🔧 Generating editable code for live editing...');
        const editableCode = this.codeTemplateGenerator.generateEditableCode(options);
        console.log('✅ Editable code generated successfully');
        return editableCode;
    }
    
    /**
     * Export options for different use cases
     */
    getExportOptions() {
        return {
            // Standard export (existing functionality)
            standard: {
                name: 'Standard Export',
                description: 'Production-ready Three.js scene code',
                generate: () => this.generateCode()
            },
            
            // Live editable export (new functionality)
            editable: {
                name: 'Live Editable Export',
                description: 'Structured code for real-time editing and learning',
                generate: (options) => this.generateEditableCode(options)
            },
            
            // Compact export
            compact: {
                name: 'Compact Export', 
                description: 'Minified code with minimal comments',
                generate: () => this.generateEditableCode({
                    includeComments: false,
                    includeAnimation: false
                })
            },
            
            // Educational export
            educational: {
                name: 'Educational Export',
                description: 'Heavily commented code for learning Three.js',
                generate: () => this.generateEditableCode({
                    includeComments: true,
                    includeImports: true,
                    includeAnimation: true
                })
            }
        };
    }
}