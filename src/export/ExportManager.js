import { CodeTemplateGenerator } from '../codegen/CodeTemplateGenerator.js';
import { ProjectExporter } from './ProjectExporter.js';

export class ExportManager {
    constructor(scene, objectManager, projectManager = null) {
        this.scene = scene;
        this.objectManager = objectManager;
        this.projectManager = projectManager;

        // Initialize code template generator for live code generation
        this.codeTemplateGenerator = new CodeTemplateGenerator(scene, objectManager);

        // Initialize project exporter for complete folder export
        this.projectExporter = new ProjectExporter(scene, objectManager, projectManager);

        console.log('📤 ExportManager initialized with live code generation and project export support');
        if (this.projectManager) {
            console.log('✅ ProjectManager integration available for asset bundling');
        }
    }

    /**
     * Export complete standalone project folder
     * @param {Object} options - Export configuration options
     * @returns {Promise<Object>} Export result with download information
     */
    async exportCompleteProject(options = {}) {
        console.log('📁 Starting complete project export via ExportManager...');

        try {
            // Use ProjectExporter to create standalone project
            const exportResult = await this.projectExporter.exportProject({
                projectName: options.projectName || 'ThreeJS_Scene',
                includeCDN: options.includeCDN !== false,
                includeAssets: options.includeAssets !== false,
                includePackageJson: options.includePackageJson || false,
                minified: options.minified || false,
                ...options
            });

            if (exportResult.success) {
                console.log('✅ Complete project export successful:', exportResult.projectName);

                // Trigger browser downloads for each file
                this.triggerProjectDownloads(exportResult);

                return exportResult;
            } else {
                throw new Error(exportResult.error || 'Project export failed');
            }

        } catch (error) {
            console.error('❌ Complete project export failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Trigger browser downloads for all project files
     * @param {Object} exportResult - Export result from ProjectExporter
     */
    triggerProjectDownloads(exportResult) {
        console.log('📥 Triggering downloads for project files...');

        // Small delay between downloads to avoid browser blocking
        let downloadDelay = 0;

        exportResult.files.forEach((file, index) => {
            setTimeout(() => {
                this.downloadFile(file.content, file.path, file.type);
                console.log(`📥 Downloaded: ${file.path}`);
            }, downloadDelay);

            downloadDelay += 200; // 200ms between downloads
        });

        // Show completion message
        setTimeout(() => {
            this.showProjectExportComplete(exportResult);
        }, downloadDelay + 500);
    }

    /**
     * Download a single file to browser
     * @param {String} content - File content
     * @param {String} filename - File name/path
     * @param {String} type - File type
     */
    downloadFile(content, filename, type) {
        let mimeType = 'text/plain';

        switch (type) {
            case 'html':
                mimeType = 'text/html';
                break;
            case 'javascript':
                mimeType = 'application/javascript';
                break;
            case 'json':
                mimeType = 'application/json';
                break;
            case 'markdown':
                mimeType = 'text/markdown';
                break;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename.replace('/', '_'); // Replace directory separators

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up object URL after download
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    /**
     * Show project export completion message
     * @param {Object} exportResult - Export result data
     */
    showProjectExportComplete(exportResult) {
        console.log('🎉 Project export completed:', exportResult.projectName);

        // Create and show completion modal/notification
        const notification = document.createElement('div');
        notification.className = 'export-completion-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <span class="notification-icon">🎉</span>
                    <span class="notification-title">Project Export Complete!</span>
                </div>
                <div class="notification-body">
                    <p><strong>${exportResult.projectName}</strong> has been exported successfully.</p>
                    <div class="export-stats">
                        <span>📦 ${exportResult.stats.fileCount} files</span>
                        <span>🗿 ${exportResult.stats.objects} objects</span>
                        <span>📎 ${exportResult.stats.assets} assets</span>
                    </div>
                    <p class="notification-instructions">
                        Check your downloads folder for the project files.
                        Open <code>index.html</code> in a web browser to view your scene.
                    </p>
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">Got it!</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
            padding: 0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;

        // Add keyframe animation
        if (!document.getElementById('export-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'export-notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .notification-content {
                    padding: 20px;
                }
                .notification-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 15px;
                }
                .notification-icon {
                    font-size: 24px;
                    margin-right: 10px;
                }
                .notification-title {
                    font-size: 18px;
                    font-weight: 600;
                }
                .notification-body p {
                    margin: 10px 0;
                    line-height: 1.4;
                }
                .export-stats {
                    display: flex;
                    gap: 15px;
                    margin: 15px 0;
                    padding: 10px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 8px;
                    font-size: 14px;
                }
                .notification-instructions {
                    font-size: 14px;
                    opacity: 0.9;
                }
                .notification-instructions code {
                    background: rgba(255,255,255,0.2);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: monospace;
                }
                .notification-close {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    margin-top: 15px;
                    transition: background 0.2s;
                }
                .notification-close:hover {
                    background: rgba(255,255,255,0.3);
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto-remove after 15 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 15000);
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
     * Export complete project folder for standalone deployment
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Export result with files and metadata
     */
    async exportProjectFolder(options = {}) {
        try {
            console.log('📁 Starting project folder export...');
            
            const exportResult = await this.projectExporter.exportProject(options);
            
            console.log(`✅ Project folder export complete: ${exportResult.projectName}`);
            console.log(`📄 Files generated: ${Object.keys(exportResult.files).length}`);
            console.log(`📦 Assets collected: ${exportResult.assets.totalAssets}`);
            
            return exportResult;
            
        } catch (error) {
            console.error('❌ Project folder export failed:', error);
            throw new Error(`Export failed: ${error.message}`);
        }
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
            // Development workflow exports (code only)
            editable: {
                name: 'Editable Code Export',
                description: 'Structured code for real-time editing and learning',
                type: 'code',
                generate: (options) => this.generateEditableCode(options)
            },
            
            standard: {
                name: 'Standard Code Export',
                description: 'Production-ready Three.js scene code',
                type: 'code',
                generate: () => this.generateCode()
            },
            
            compact: {
                name: 'Compact Code Export', 
                description: 'Minified code with minimal comments',
                type: 'code',
                generate: () => this.generateEditableCode({
                    includeComments: false,
                    includeAnimation: false
                })
            },
            
            educational: {
                name: 'Educational Code Export',
                description: 'Heavily commented code for learning Three.js',
                type: 'code',
                generate: () => this.generateEditableCode({
                    includeComments: true,
                    includeImports: true,
                    includeAnimation: true
                })
            },
            
            // Deployment workflow exports (complete project folders)
            projectFolder: {
                name: 'Complete Project Export',
                description: 'Standalone web application with HTML, JS, and all assets',
                type: 'folder',
                generate: (options) => this.exportProjectFolder(options)
            },
            
            minimalProject: {
                name: 'Minimal Project Export',
                description: 'Lightweight standalone project with CDN libraries',
                type: 'folder',
                generate: (options) => this.exportProjectFolder({
                    ...options,
                    useLocalLibraries: false,
                    minified: true,
                    includeStats: false
                })
            },
            
            developmentProject: {
                name: 'Development Project Export',
                description: 'Full-featured project with debugging tools and local libraries',
                type: 'folder',
                generate: (options) => this.exportProjectFolder({
                    ...options,
                    useLocalLibraries: true,
                    includeStats: true,
                    includeComments: true,
                    developmentMode: true
                })
            }
        };
    }
}