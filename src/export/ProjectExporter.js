/**
 * ProjectExporter - Complete project folder export system
 * Creates standalone Three.js web applications with all assets
 * Part of Export Folder System Implementation - September 12, 2025
 */

export class ProjectExporter {
    constructor(scene, objectManager, projectManager = null) {
        this.scene = scene;
        this.objectManager = objectManager;
        this.projectManager = projectManager;

        console.log('📁 ProjectExporter initialized for standalone project creation');
        if (this.projectManager) {
            console.log('✅ ProjectManager integration available for asset management');
        }
    }

    /**
     * Export complete project folder with HTML, JS, and all assets
     * @param {Object} options - Export configuration options
     * @returns {Object} Export result with download information
     */
    async exportProject(options = {}) {
        console.log('📁 Starting complete project export...');
        
        const exportConfig = {
            projectName: options.projectName || 'ThreeJS_Scene',
            timestamp: new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5),
            includeCDN: options.includeCDN !== false, // Default to CDN
            includeAssets: options.includeAssets !== false, // Default to include assets
            minified: options.minified || false,
            ...options
        };

        try {
            // Step 1: Analyze scene and collect data
            const sceneAnalysis = await this.analyzeScene();
            console.log('📊 Scene analysis complete:', sceneAnalysis);

            // Step 2: Generate project structure
            const projectStructure = await this.generateProjectStructure(sceneAnalysis, exportConfig);
            console.log('🏗️ Project structure generated');

            // Step 3: Create downloadable content
            const exportResult = await this.packageProject(projectStructure, exportConfig);
            console.log('📦 Project packaging complete');

            return {
                success: true,
                projectName: `${exportConfig.projectName}_${exportConfig.timestamp}`,
                files: exportResult.files,
                downloadUrl: exportResult.downloadUrl,
                structure: projectStructure,
                stats: {
                    objects: sceneAnalysis.objects.length,
                    assets: sceneAnalysis.assets.models.size + sceneAnalysis.assets.textures.size,
                    fileCount: exportResult.files.length,
                    timestamp: exportConfig.timestamp
                }
            };

        } catch (error) {
            console.error('❌ Project export failed:', error);
            return {
                success: false,
                error: error.message,
                timestamp: exportConfig.timestamp
            };
        }
    }

    /**
     * Analyze the current scene and collect all necessary data
     * @returns {Object} Scene analysis with objects, assets, and metadata
     */
    async analyzeScene() {
        const objects = this.objectManager.getAllObjects();
        const sceneData = this.scene.exportSceneData();
        
        // Collect all referenced assets
        const assets = this.collectAssets(objects, sceneData);
        
        // Analyze scene complexity
        const complexity = this.analyzeComplexity(objects, sceneData);
        
        return {
            objects,
            sceneData,
            assets,
            complexity,
            metadata: {
                exportTime: new Date().toISOString(),
                objectCount: objects.length,
                hasAnimations: objects.some(obj => obj.animation && obj.animation.type !== 'none'),
                hasLighting: sceneData.lighting || false,
                hasOBJFiles: objects.some(obj => !obj.isPrimitive),
                hasTextures: objects.some(obj => obj.material && (obj.material.matcapTexture || obj.material.normalMap))
            }
        };
    }

    /**
     * Collect all assets referenced by the scene
     * @param {Array} objects - Scene objects
     * @param {Object} sceneData - Scene configuration
     * @returns {Object} Organized asset collections
     */
    collectAssets(objects, sceneData) {
        const assets = {
            models: new Set(),
            textures: new Set(),
            libraries: new Set(['three.min.js']), // Always need Three.js
            paths: {
                models: [],
                textures: []
            }
        };

        // Scan objects for asset references
        objects.forEach(obj => {
            // OBJ model files - use centralized asset management paths
            if (!obj.isPrimitive && (obj.fileName || obj.projectAssetInfo)) {
                const assetPath = obj.projectAssetInfo?.storedPath || obj.fileName;
                const fileName = this.getFileNameFromPath(assetPath);

                assets.models.add(assetPath);
                assets.paths.models.push({
                    original: obj.fileName || assetPath,
                    storedPath: obj.projectAssetInfo?.storedPath,
                    relative: `assets/models/${fileName}`,
                    objectId: obj.id,
                    objectName: obj.name
                });
            }

            // Material textures - use centralized asset management paths
            if (obj.material) {
                // Check for stored texture path from centralized system
                const textureAssetPath = obj.material.texture?.storedPath || obj.material.matcapTexture;
                if (textureAssetPath) {
                    const fileName = this.getFileNameFromPath(textureAssetPath);
                    const textureType = obj.material.texture?.storedPath ? 'centralized' : 'matcap';

                    assets.textures.add(textureAssetPath);
                    assets.paths.textures.push({
                        original: obj.material.matcapTexture || obj.material.texture?.filename,
                        storedPath: obj.material.texture?.storedPath,
                        relative: `assets/textures/${textureType}/${fileName}`,
                        type: textureType,
                        objectId: obj.id
                    });
                }
                if (obj.material.normalMap) {
                    assets.textures.add(obj.material.normalMap);
                    assets.paths.textures.push({
                        original: obj.material.normalMap,
                        relative: `assets/textures/normal/${this.getFileNameFromPath(obj.material.normalMap)}`,
                        type: 'normal',
                        objectId: obj.id
                    });
                }
                if (obj.material.roughnessMap) {
                    assets.textures.add(obj.material.roughnessMap);
                    assets.paths.textures.push({
                        original: obj.material.roughnessMap,
                        relative: `assets/textures/roughness/${this.getFileNameFromPath(obj.material.roughnessMap)}`,
                        type: 'roughness',
                        objectId: obj.id
                    });
                }
            }
        });

        // Determine required Three.js loaders and controls
        if (assets.models.size > 0) {
            assets.libraries.add('OBJLoader.js');
        }
        
        // Always include OrbitControls for camera interaction
        assets.libraries.add('OrbitControls.js');

        // Add animation system if needed
        if (objects.some(obj => obj.animation && obj.animation.type !== 'none')) {
            assets.libraries.add('animation-system'); // Custom flag
        }

        console.log('📊 Asset collection complete:', {
            models: assets.models.size,
            textures: assets.textures.size,
            libraries: assets.libraries.size
        });

        return assets;
    }

    /**
     * Analyze scene complexity for optimization decisions
     * @param {Array} objects - Scene objects
     * @param {Object} sceneData - Scene configuration
     * @returns {Object} Complexity analysis
     */
    analyzeComplexity(objects, sceneData) {
        const complexity = {
            level: 'simple', // simple, moderate, complex
            factors: {
                objectCount: objects.length,
                animatedObjects: objects.filter(obj => obj.animation && obj.animation.type !== 'none').length,
                objFiles: objects.filter(obj => !obj.isPrimitive).length,
                texturedObjects: objects.filter(obj => obj.material && obj.material.matcapTexture).length,
                uniqueMaterials: new Set(objects.map(obj => JSON.stringify(obj.material))).size
            },
            recommendations: {}
        };

        // Determine complexity level
        if (complexity.factors.objectCount > 20 || 
            complexity.factors.objFiles > 5 || 
            complexity.factors.texturedObjects > 10) {
            complexity.level = 'complex';
            complexity.recommendations.optimization = 'Consider LOD system for performance';
            complexity.recommendations.loading = 'Use loading manager for asset coordination';
        } else if (complexity.factors.objectCount > 10 || 
                   complexity.factors.animatedObjects > 5 ||
                   complexity.factors.objFiles > 2) {
            complexity.level = 'moderate';
            complexity.recommendations.loading = 'Show loading progress for better UX';
        }

        return complexity;
    }

    /**
     * Generate complete project structure with all files
     * @param {Object} sceneAnalysis - Scene analysis data
     * @param {Object} exportConfig - Export configuration
     * @returns {Object} Project structure with file contents
     */
    async generateProjectStructure(sceneAnalysis, exportConfig) {
        const projectName = `${exportConfig.projectName}_${exportConfig.timestamp}`;
        
        // Generate HTML file
        const htmlContent = this.generateHTML(sceneAnalysis, exportConfig);
        
        // Generate scene JavaScript
        const sceneJSContent = this.generateSceneJS(sceneAnalysis, exportConfig);
        
        // Generate README
        const readmeContent = this.generateREADME(sceneAnalysis, exportConfig);

        const projectStructure = {
            name: projectName,
            files: {
                'index.html': {
                    content: htmlContent,
                    type: 'html'
                },
                'js/scene.js': {
                    content: sceneJSContent,
                    type: 'javascript'
                },
                'README.md': {
                    content: readmeContent,
                    type: 'markdown'
                }
            },
            assets: sceneAnalysis.assets,
            metadata: sceneAnalysis.metadata
        };

        // Add package.json for npm deployment option
        if (exportConfig.includePackageJson) {
            projectStructure.files['package.json'] = {
                content: this.generatePackageJSON(sceneAnalysis, exportConfig),
                type: 'json'
            };
        }

        return projectStructure;
    }

    /**
     * Package the project for download
     * @param {Object} projectStructure - Complete project structure
     * @param {Object} exportConfig - Export configuration
     * @returns {Object} Package result with download information
     */
    async packageProject(projectStructure, exportConfig) {
        // For now, return the structure for browser-based file creation
        // In a full implementation, this would create ZIP files or handle file system operations
        
        const files = [];
        
        // Convert project structure to downloadable file list
        Object.entries(projectStructure.files).forEach(([path, fileData]) => {
            files.push({
                path,
                content: fileData.content,
                type: fileData.type,
                size: fileData.content.length
            });
        });

        // Create download data (browser-compatible)
        const downloadData = {
            files,
            projectName: projectStructure.name,
            downloadUrl: this.createDownloadableContent(files, projectStructure.name)
        };

        return downloadData;
    }

    /**
     * Create downloadable content for browser
     * @param {Array} files - File list
     * @param {String} projectName - Project name
     * @returns {String} Download URL or data
     */
    createDownloadableContent(files, projectName) {
        // For browser implementation, we'll create a JSON structure
        // that the UI can use to trigger individual file downloads
        const downloadPackage = {
            projectName,
            files: files.map(f => ({
                path: f.path,
                content: f.content,
                type: f.type
            }))
        };

        // Create blob URL for download trigger
        const blob = new Blob([JSON.stringify(downloadPackage, null, 2)], 
                             { type: 'application/json' });
        return URL.createObjectURL(blob);
    }

    /**
     * Generate HTML file content
     * @param {Object} sceneAnalysis - Scene analysis
     * @param {Object} exportConfig - Export configuration  
     * @returns {String} HTML content
     */
    generateHTML(sceneAnalysis, exportConfig) {
        const { metadata, sceneData } = sceneAnalysis;
        const projectName = `${exportConfig.projectName}_${exportConfig.timestamp}`;

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName} - Three.js Scene</title>
    <meta name="description" content="Interactive Three.js scene exported from 3/LOADER">
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow: hidden;
        }
        
        #scene-container {
            width: 100vw;
            height: 100vh;
            position: relative;
        }
        
        #loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 18px;
            text-align: center;
            z-index: 100;
        }
        
        #loading .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        #info {
            position: absolute;
            top: 20px;
            left: 20px;
            color: white;
            background: rgba(0, 0, 0, 0.7);
            padding: 15px;
            border-radius: 8px;
            font-size: 14px;
            line-height: 1.4;
            max-width: 280px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        #controls-hint {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            background: rgba(0, 0, 0, 0.7);
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 12px;
            text-align: center;
            backdrop-filter: blur(10px);
        }
        
        .hide {
            opacity: 0;
            transition: opacity 0.5s ease;
        }
    </style>
</head>
<body>
    <div id="scene-container"></div>
    
    <div id="loading">
        <div class="spinner"></div>
        Loading Three.js Scene...
    </div>
    
    <div id="info">
        <strong>📦 Exported from 3/LOADER</strong><br>
        <strong>Objects:</strong> ${metadata.objectCount}<br>
        <strong>Generated:</strong> ${new Date(metadata.exportTime).toLocaleString()}<br>
        ${metadata.hasAnimations ? '<strong>✨ Animations:</strong> Enabled<br>' : ''}
        ${metadata.hasOBJFiles ? '<strong>🗿 Models:</strong> OBJ Files<br>' : ''}
        ${metadata.hasTextures ? '<strong>🎨 Textures:</strong> MatCap/PBR<br>' : ''}
    </div>
    
    <div id="controls-hint">
        <strong>Controls:</strong> Mouse to rotate • Scroll to zoom • Right-click to pan
    </div>
    
    <!-- Three.js Library -->
    ${exportConfig.includeCDN ? `
    <script src="https://unpkg.com/three@0.155.0/build/three.min.js"></script>
    <script src="https://unpkg.com/three@0.155.0/examples/js/controls/OrbitControls.js"></script>
    ${sceneAnalysis.assets.models.size > 0 ? '<script src="https://unpkg.com/three@0.155.0/examples/js/loaders/OBJLoader.js"></script>' : ''}
    ` : `
    <script src="js/lib/three.min.js"></script>
    <script src="js/lib/OrbitControls.js"></script>
    ${sceneAnalysis.assets.models.size > 0 ? '<script src="js/lib/OBJLoader.js"></script>' : ''}
    `}
    
    <!-- Scene Implementation -->
    <script src="js/scene.js"></script>
</body>
</html>`;
    }

    /**
     * Generate scene.js file content
     * @param {Object} sceneAnalysis - Scene analysis
     * @param {Object} exportConfig - Export configuration
     * @returns {String} JavaScript content
     */
    generateSceneJS(sceneAnalysis, exportConfig) {
        // This method will be implemented to generate the complete scene.js
        // For now, return a placeholder
        const { objects, sceneData, metadata } = sceneAnalysis;

        return `// Three.js Scene - Exported from 3/LOADER
// Generated: ${metadata.exportTime}
// Objects: ${metadata.objectCount}

let scene, camera, renderer, controls;
let loadingElement, controlsHint;

// Initialize the scene
function init() {
    console.log('🎬 Initializing Three.js scene...');
    
    loadingElement = document.getElementById('loading');
    controlsHint = document.getElementById('controls-hint');
    
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(${sceneData.background ? '0x' + sceneData.background.toString(16).padStart(6, '0') : '0x0f0f0f'});
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(${sceneData.camera ? sceneData.camera.position.join(', ') : '10, 10, 10'});
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(${sceneData.background ? '0x' + sceneData.background.toString(16).padStart(6, '0') : '0x0f0f0f'});
    renderer.shadowMap.enabled = ${metadata.hasLighting || objects.some(obj => obj.material?.castShadow)};
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    document.getElementById('scene-container').appendChild(renderer.domElement);
    
    // Controls setup
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 50;
    controls.minDistance = 1;
    
    // Load scene objects
    loadSceneObjects();
    
    // Start animation loop
    animate();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
    
    // Hide controls hint after 5 seconds
    setTimeout(() => {
        if (controlsHint) {
            controlsHint.classList.add('hide');
        }
    }, 5000);
}

// Load all scene objects
function loadSceneObjects() {
    console.log('📦 Loading scene objects...');
    
    ${this.generateLightingCode(sceneData)}
    
    ${this.generateObjectsCode(objects)}
    
    // Hide loading message
    setTimeout(() => {
        if (loadingElement) {
            loadingElement.classList.add('hide');
            setTimeout(() => {
                loadingElement.style.display = 'none';
            }, 500);
        }
    }, 1000);
    
    console.log('✅ Scene loading complete');
}

${metadata.hasAnimations ? this.generateAnimationCode(objects) : ''}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    ${metadata.hasAnimations ? 'updateAnimations();' : ''}
    
    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize when page loads
window.addEventListener('load', init);`;
    }

    /**
     * Generate lighting code for scene.js
     * @param {Object} sceneData - Scene configuration
     * @returns {String} Lighting setup code
     */
    generateLightingCode(sceneData) {
        return `    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(20, 20, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);`;
    }

    /**
     * Generate objects creation code for scene.js
     * @param {Array} objects - Scene objects
     * @returns {String} Objects creation code
     */
    generateObjectsCode(objects) {
        if (objects.length === 0) {
            return '    // No objects to load';
        }

        let code = '    // Create scene objects\n';
        
        objects.forEach((obj, index) => {
            code += this.generateSingleObjectCode(obj, index + 1);
            code += '\n';
        });

        return code;
    }

    /**
     * Generate code for a single object
     * @param {Object} obj - Object data
     * @param {Number} index - Object index
     * @returns {String} Single object creation code
     */
    generateSingleObjectCode(obj, index) {
        if (obj.isPrimitive) {
            return this.generatePrimitiveCode(obj, index);
        } else {
            return this.generateOBJCode(obj, index);
        }
    }

    /**
     * Generate primitive object code
     * @param {Object} obj - Primitive object data
     * @param {Number} index - Object index
     * @returns {String} Primitive creation code
     */
    generatePrimitiveCode(obj, index) {
        const geometryMap = {
            'box': `new THREE.BoxGeometry(2, 2, 2)`,
            'sphere': `new THREE.SphereGeometry(1.5, 32, 16)`,
            'cone': `new THREE.ConeGeometry(1, 2, 32)`,
            'cylinder': `new THREE.CylinderGeometry(1, 1, 2, 32)`,
            'plane': `new THREE.PlaneGeometry(3, 3)`,
            'circle': `new THREE.CircleGeometry(1.5, 32)`
        };

        const geometry = geometryMap[obj.primitiveType] || geometryMap['box'];
        
        return `    // Create ${obj.name || 'Object' + index} (${obj.primitiveType} primitive)
    const geometry${index} = ${geometry};
    const material${index} = ${this.generateMaterialCode(obj.material)};
    const object${index} = new THREE.Mesh(geometry${index}, material${index});
    object${index}.position.set(${obj.position?.x || 0}, ${obj.position?.y || 0}, ${obj.position?.z || 0});
    object${index}.rotation.set(${obj.rotation?.x || 0}, ${obj.rotation?.y || 0}, ${obj.rotation?.z || 0});
    object${index}.scale.set(${obj.scale?.x || 1}, ${obj.scale?.y || 1}, ${obj.scale?.z || 1});
    object${index}.name = '${obj.name || 'Object' + index}';
    object${index}.castShadow = true;
    object${index}.receiveShadow = true;
    scene.add(object${index});`;
    }

    /**
     * Generate OBJ loading code
     * @param {Object} obj - OBJ object data
     * @param {Number} index - Object index
     * @returns {String} OBJ loading code
     */
    generateOBJCode(obj, index) {
        const fileName = this.getFileNameFromPath(obj.fileName || 'unknown.obj');
        
        return `    // Load ${obj.name || 'Object' + index} (OBJ file)
    const objLoader${index} = new THREE.OBJLoader();
    const material${index} = ${this.generateMaterialCode(obj.material)};
    
    objLoader${index}.load('assets/models/${fileName}',
        (loadedObject) => {
            loadedObject.traverse((child) => {
                if (child.isMesh) {
                    child.material = material${index};
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            loadedObject.position.set(${obj.position?.x || 0}, ${obj.position?.y || 0}, ${obj.position?.z || 0});
            loadedObject.rotation.set(${obj.rotation?.x || 0}, ${obj.rotation?.y || 0}, ${obj.rotation?.z || 0});
            loadedObject.scale.set(${obj.scale?.x || 1}, ${obj.scale?.y || 1}, ${obj.scale?.z || 1});
            loadedObject.name = '${obj.name || 'Object' + index}';
            
            scene.add(loadedObject);
            console.log('✅ OBJ loaded: ${fileName}');
        },
        (progress) => {
            console.log('🔄 Loading OBJ: ${fileName}', progress);
        },
        (error) => {
            console.error('❌ Failed to load OBJ: ${fileName}', error);
        }
    );`;
    }

    /**
     * Generate material code
     * @param {Object} material - Material data
     * @returns {String} Material creation code
     */
    generateMaterialCode(material) {
        if (!material) {
            return 'new THREE.MeshStandardMaterial({ color: 0xcccccc })';
        }

        const materialType = material.type || 'standard';
        const color = material.color || '#cccccc';
        
        switch (materialType) {
            case 'matcap':
                return `new THREE.MeshMatcapMaterial({ 
                    color: ${this.formatColor(color)}${material.matcapTexture ? ',\n                    matcap: textureLoader.load("assets/textures/matcaps/' + this.getFileNameFromPath(material.matcapTexture) + '")' : ''}
                })`;
            case 'standard':
                return `new THREE.MeshStandardMaterial({ 
                    color: ${this.formatColor(color)},
                    metalness: ${material.metalness || 0},
                    roughness: ${material.roughness || 0.5},
                    wireframe: ${material.wireframe || false}
                })`;
            case 'phong':
                return `new THREE.MeshPhongMaterial({ 
                    color: ${this.formatColor(color)},
                    shininess: ${material.shininess || 100},
                    wireframe: ${material.wireframe || false}
                })`;
            case 'lambert':
                return `new THREE.MeshLambertMaterial({ 
                    color: ${this.formatColor(color)},
                    wireframe: ${material.wireframe || false}
                })`;
            default:
                return `new THREE.MeshStandardMaterial({ 
                    color: ${this.formatColor(color)},
                    wireframe: ${material.wireframe || false}
                })`;
        }
    }

    /**
     * Generate animation code
     * @param {Array} objects - Objects with animations
     * @returns {String} Animation code
     */
    generateAnimationCode(objects) {
        const animatedObjects = objects.filter(obj => obj.animation && obj.animation.type !== 'none');
        if (animatedObjects.length === 0) return '';

        let code = `
// Animation system
function updateAnimations() {
    const time = Date.now() * 0.001;
`;

        animatedObjects.forEach((obj, index) => {
            const objIndex = objects.indexOf(obj) + 1;
            const objVar = `object${objIndex}`;
            const { type, speed } = obj.animation;
            const safeSpeed = typeof speed === 'number' ? speed : 0.01;

            code += `
    // Animate ${obj.name || objVar} (${type})
    const ${objVar}Ref = scene.getObjectByName('${obj.name || objVar}');
    if (${objVar}Ref) {`;

            switch (type) {
                case 'rotate-x':
                    code += `
        ${objVar}Ref.rotation.x += ${safeSpeed};`;
                    break;
                case 'rotate-y':
                    code += `
        ${objVar}Ref.rotation.y += ${safeSpeed};`;
                    break;
                case 'rotate-z':
                    code += `
        ${objVar}Ref.rotation.z += ${safeSpeed};`;
                    break;
                case 'rotate-xyz':
                    code += `
        ${objVar}Ref.rotation.x += ${safeSpeed};
        ${objVar}Ref.rotation.y += ${safeSpeed};
        ${objVar}Ref.rotation.z += ${safeSpeed};`;
                    break;
                case 'scale':
                    code += `
        const scaleValue = 1 + Math.sin(time * ${safeSpeed}) * 0.2;
        ${objVar}Ref.scale.set(scaleValue, scaleValue, scaleValue);`;
                    break;
                case 'bounce':
                    code += `
        ${objVar}Ref.position.y = Math.abs(Math.sin(time * ${safeSpeed})) * 2;`;
                    break;
                case 'float':
                    code += `
        ${objVar}Ref.position.y += Math.sin(time * ${safeSpeed}) * 0.1;`;
                    break;
            }

            code += `
    }`;
        });

        code += `
}`;

        return code;
    }

    /**
     * Generate README.md content
     * @param {Object} sceneAnalysis - Scene analysis
     * @param {Object} exportConfig - Export configuration
     * @returns {String} README content
     */
    generateREADME(sceneAnalysis, exportConfig) {
        const { metadata, objects, assets } = sceneAnalysis;
        const projectName = `${exportConfig.projectName}_${exportConfig.timestamp}`;

        return `# ${projectName}

Interactive Three.js scene exported from **3/LOADER**.

## 📊 Scene Information

- **Objects:** ${metadata.objectCount}
- **Animations:** ${metadata.hasAnimations ? 'Yes' : 'No'}
- **3D Models:** ${metadata.hasOBJFiles ? 'Yes (OBJ files)' : 'Primitives only'}
- **Textures:** ${metadata.hasTextures ? 'Yes (MatCap/PBR)' : 'No'}
- **Generated:** ${new Date(metadata.exportTime).toLocaleString()}

## 🚀 Getting Started

1. Open \`index.html\` in a modern web browser
2. The scene will load automatically
3. Use mouse controls to interact:
   - **Left click + drag:** Rotate camera
   - **Right click + drag:** Pan camera
   - **Scroll wheel:** Zoom in/out

## 📁 Project Structure

\`\`\`
${projectName}/
├── index.html          # Main HTML file
├── js/
│   └── scene.js        # Three.js scene implementation
├── assets/
${assets.models.size > 0 ? '│   ├── models/         # 3D model files (.obj)\n' : ''}${assets.textures.size > 0 ? '│   └── textures/       # Texture files (MatCap, etc.)\n' : ''}└── README.md           # This file
\`\`\`

## 🛠 Technical Details

- **Three.js Version:** r155
- **Renderer:** WebGL with antialiasing
- **Controls:** OrbitControls for camera interaction
- **Loading:** ${assets.models.size > 0 ? 'OBJLoader for 3D models' : 'Primitive geometries only'}
- **Shadows:** ${metadata.hasLighting ? 'Enabled' : 'Disabled'}

## 📋 Object List

${objects.map((obj, index) => `${index + 1}. **${obj.name || 'Object ' + (index + 1)}** - ${obj.isPrimitive ? obj.primitiveType + ' primitive' : 'OBJ model'}${obj.animation && obj.animation.type !== 'none' ? ' (animated)' : ''}`).join('\n')}

## 🎨 Materials & Textures

${objects.filter(obj => obj.material && obj.material.type).map(obj => `- **${obj.name}:** ${obj.material.type} material${obj.material.matcapTexture ? ' with MatCap texture' : ''}`).join('\n') || 'No custom materials defined.'}

## 🌐 Deployment

This project is ready for web deployment:

1. **Static Hosting:** Upload entire folder to any web server
2. **GitHub Pages:** Commit to repository and enable GitHub Pages
3. **Netlify/Vercel:** Drag and drop folder for instant deployment
4. **Local Development:** Serve with any local web server

---

*Generated by 3/LOADER - Three.js OBJ Loader & Editor*`;
    }

    /**
     * Generate package.json for npm deployment
     * @param {Object} sceneAnalysis - Scene analysis
     * @param {Object} exportConfig - Export configuration
     * @returns {String} Package.json content
     */
    generatePackageJSON(sceneAnalysis, exportConfig) {
        const projectName = `${exportConfig.projectName}_${exportConfig.timestamp}`.toLowerCase();
        
        return JSON.stringify({
            name: projectName,
            version: "1.0.0",
            description: `Interactive Three.js scene with ${sceneAnalysis.metadata.objectCount} objects`,
            main: "index.html",
            scripts: {
                "start": "npx http-server . -p 3000",
                "build": "echo 'No build step required - static files'",
                "deploy": "echo 'Upload to your hosting provider'"
            },
            keywords: ["threejs", "3d", "webgl", "interactive", "scene"],
            author: "3/LOADER Export System",
            license: "MIT",
            dependencies: {},
            devDependencies: {
                "http-server": "^14.1.1"
            }
        }, null, 2);
    }

    /**
     * Utility: Extract filename from path
     * @param {String} filePath - Full file path
     * @returns {String} Just the filename
     */
    getFileNameFromPath(filePath) {
        return filePath.split('/').pop().split('\\').pop();
    }

    /**
     * Utility: Format color for Three.js
     * @param {String} color - Color string
     * @returns {String} Formatted color
     */
    formatColor(color) {
        if (typeof color === 'string' && color.startsWith('#')) {
            return '0x' + color.substring(1);
        }
        return color;
    }
}