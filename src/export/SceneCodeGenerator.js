export class SceneCodeGenerator {
    constructor() {
        console.log('🎬 SceneCodeGenerator initialized');
    }
    
    /**
     * Generate complete scene.js file for standalone deployment
     * @param {Object} sceneData - Scene configuration and objects
     * @param {Object} assets - Asset inventory from AssetCollector
     * @param {Object} options - Generation options
     * @returns {string} Complete scene.js content
     */
    generateSceneJS(sceneData, assets, options = {}) {
        const {
            includeComments = true,
            includeAnimations = true,
            includeStats = false,
            minified = false
        } = options;
        
        const timestamp = new Date().toISOString();
        const objectCount = sceneData.objects?.length || 0;
        
        const code = `${this.generateHeader(timestamp, objectCount, includeComments)}

${this.generateGlobalVariables(includeComments)}

${this.generateInitFunction(sceneData, includeComments, includeStats)}

${this.generateLightingFunction(sceneData, includeComments)}

${this.generateObjectsFunction(sceneData, assets, includeComments)}

${this.generateAnimationFunction(sceneData, includeComments, includeAnimations)}

${this.generateUtilityFunctions(includeComments)}

${this.generateEventListeners(includeComments)}`;
        
        console.log(`🎬 Generated scene.js for ${objectCount} objects`);
        return minified ? this.minifyCode(code) : code;
    }
    
    /**
     * Generate file header with metadata
     * @param {string} timestamp - Generation timestamp
     * @param {number} objectCount - Number of objects
     * @param {boolean} includeComments - Include comment blocks
     * @returns {string} Header code
     */
    generateHeader(timestamp, objectCount, includeComments = true) {
        if (!includeComments) return '';
        
        return `// Three.js Scene - Exported from 3/LOADER
// Generated: ${timestamp}
// Objects: ${objectCount}
// 
// This file contains a complete Three.js scene ready for web deployment
// No additional dependencies required - works in any modern browser`;
    }
    
    /**
     * Generate global variable declarations
     * @param {boolean} includeComments - Include comment blocks
     * @returns {string} Global variables code
     */
    generateGlobalVariables(includeComments = true) {
        const comment = includeComments ? `${includeComments ? '// Global Three.js components' : ''}\n` : '';
        
        return `${comment}let scene, camera, renderer, controls;
let loadingElement, errorElement;
let stats; // Performance monitor (optional)
let animationObjects = []; // Objects with animations
let loadedObjects = {}; // Track loaded objects for cleanup`;
    }
    
    /**
     * Generate main initialization function
     * @param {Object} sceneData - Scene configuration
     * @param {boolean} includeComments - Include comment blocks
     * @param {boolean} includeStats - Include stats.js integration
     * @returns {string} Init function code
     */
    generateInitFunction(sceneData, includeComments = true, includeStats = false) {
        const backgroundColor = sceneData.background ? 
            `0x${sceneData.background.toString(16).padStart(6, '0')}` : '0x0f0f0f';
        
        const cameraPos = sceneData.camera?.position || [0, 5, 10];
        const cameraFov = sceneData.camera?.fov || 75;
        
        return `${includeComments ? '// Initialize the Three.js scene' : ''}
function init() {
    ${includeComments ? '// Get DOM elements' : ''}
    loadingElement = document.getElementById('loading');
    errorElement = document.getElementById('error');
    
    try {
        ${includeComments ? '// Scene setup' : ''}
        scene = new THREE.Scene();
        scene.background = new THREE.Color(${backgroundColor});
        
        ${includeComments ? '// Camera setup' : ''}
        camera = new THREE.PerspectiveCamera(
            ${cameraFov}, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        camera.position.set(${cameraPos.join(', ')});
        
        ${includeComments ? '// Renderer setup' : ''}
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setClearColor(${backgroundColor}, 1);
        
        document.getElementById('scene-container').appendChild(renderer.domElement);
        ${includeComments ? 'console.log(\'✅ Three.js renderer initialized\');' : ''}
        
        ${includeComments ? '// Controls setup' : ''}
        if (typeof THREE.OrbitControls !== 'undefined') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.target.set(0, 0, 0);
            controls.enableZoom = true;
            controls.enablePan = true;
            controls.enableRotate = true;
            ${includeComments ? 'console.log(\'✅ Orbit controls initialized\');' : ''}
        }
        
        ${includeStats ? this.generateStatsSetup(includeComments) : ''}
        
        ${includeComments ? '// Setup scene content' : ''}
        setupLighting();
        loadSceneObjects();
        
        ${includeComments ? '// Start animation loop' : ''}
        animate();
        
        ${includeComments ? '// Setup event listeners' : ''}
        setupEventListeners();
        
    } catch (error) {
        console.error('❌ Failed to initialize Three.js scene:', error);
        showError('Failed to initialize 3D scene: ' + error.message);
    }
}`;
    }
    
    /**
     * Generate stats.js setup code
     * @param {boolean} includeComments - Include comment blocks
     * @returns {string} Stats setup code
     */
    generateStatsSetup(includeComments = true) {
        return `        ${includeComments ? '// Stats.js setup (performance monitor)' : ''}
        if (typeof Stats !== 'undefined') {
            stats = new Stats();
            stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
            document.body.appendChild(stats.dom);
            stats.dom.style.position = 'absolute';
            stats.dom.style.top = '60px';
            stats.dom.style.left = '15px';
            stats.dom.style.zIndex = '1000';
        }`;
    }
    
    /**
     * Generate lighting setup function
     * @param {Object} sceneData - Scene configuration
     * @param {boolean} includeComments - Include comment blocks
     * @returns {string} Lighting function code
     */
    generateLightingFunction(sceneData, includeComments = true) {
        const lights = sceneData.lighting || this.getDefaultLighting();
        
        let lightCode = '';
        lights.forEach((light, index) => {
            lightCode += this.generateLightCode(light, index, includeComments);
        });
        
        return `${includeComments ? '// Setup scene lighting' : ''}
function setupLighting() {
    ${includeComments ? '// Configure lighting for optimal object visibility' : ''}
    
${lightCode}
    
    ${includeComments ? 'console.log(\'✅ Lighting setup complete\');' : ''}
}`;
    }
    
    /**
     * Generate code for individual light
     * @param {Object} light - Light configuration
     * @param {number} index - Light index
     * @param {boolean} includeComments - Include comment blocks
     * @returns {string} Light code
     */
    generateLightCode(light, index, includeComments = true) {
        const { type, color, intensity, position, target, castShadow } = light;
        const lightVar = `light${index + 1}`;
        
        let code = '';
        
        switch (type) {
            case 'ambient':
                code = `    ${includeComments ? `// Ambient light ${index + 1}` : ''}
    const ${lightVar} = new THREE.AmbientLight(${color || '0x404040'}, ${intensity || 0.4});
    scene.add(${lightVar});`;
                break;
                
            case 'directional':
                code = `    ${includeComments ? `// Directional light ${index + 1}` : ''}
    const ${lightVar} = new THREE.DirectionalLight(${color || '0xffffff'}, ${intensity || 1});
    ${lightVar}.position.set(${position ? position.join(', ') : '20, 20, 20'});
    ${castShadow ? `${lightVar}.castShadow = true;
    ${lightVar}.shadow.mapSize.width = 2048;
    ${lightVar}.shadow.mapSize.height = 2048;` : ''}
    scene.add(${lightVar});`;
                break;
                
            case 'point':
                code = `    ${includeComments ? `// Point light ${index + 1}` : ''}
    const ${lightVar} = new THREE.PointLight(${color || '0xffffff'}, ${intensity || 0.8}, ${light.distance || 50});
    ${lightVar}.position.set(${position ? position.join(', ') : '10, 10, 10'});
    ${castShadow ? `${lightVar}.castShadow = true;` : ''}
    scene.add(${lightVar});`;
                break;
                
            case 'spot':
                code = `    ${includeComments ? `// Spot light ${index + 1}` : ''}
    const ${lightVar} = new THREE.SpotLight(${color || '0xffffff'}, ${intensity || 1}, ${light.distance || 100}, ${light.angle || 'Math.PI / 6'});
    ${lightVar}.position.set(${position ? position.join(', ') : '0, 20, 0'});
    ${target ? `${lightVar}.target.position.set(${target.join(', ')});
    scene.add(${lightVar}.target);` : ''}
    ${castShadow ? `${lightVar}.castShadow = true;` : ''}
    scene.add(${lightVar});`;
                break;
        }
        
        return code + '\n';
    }
    
    /**
     * Generate object loading function
     * @param {Object} sceneData - Scene configuration
     * @param {Object} assets - Asset inventory
     * @param {boolean} includeComments - Include comment blocks
     * @returns {string} Objects function code
     */
    generateObjectsFunction(sceneData, assets, includeComments = true) {
        const objects = sceneData.objects || [];
        
        let objectCode = '';
        objects.forEach((obj, index) => {
            objectCode += this.generateObjectCode(obj, index, assets, includeComments);
        });
        
        const hideLoadingCode = includeComments ? 
            '    // Hide loading screen after all objects are processed' : '';
        
        return `${includeComments ? '// Load and setup all scene objects' : ''}
async function loadSceneObjects() {
    ${includeComments ? 'console.log(\'🔄 Loading scene objects...\');' : ''}
    
    try {
${objectCode}
        
        ${hideLoadingCode}
        setTimeout(() => {
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            ${includeComments ? 'console.log(\'✅ All scene objects loaded successfully\');' : ''}
        }, 1000);
        
    } catch (error) {
        console.error('❌ Error loading scene objects:', error);
        showError('Failed to load 3D objects: ' + error.message);
    }
}`;
    }
    
    /**
     * Generate code for individual object
     * @param {Object} obj - Object data
     * @param {number} index - Object index
     * @param {Object} assets - Asset inventory
     * @param {boolean} includeComments - Include comment blocks
     * @returns {string} Object code
     */
    generateObjectCode(obj, index, assets, includeComments = true) {
        const objectVar = this.sanitizeVariableName(obj.name || `object${index + 1}`);
        
        if (obj.isPrimitive) {
            return this.generatePrimitiveCode(obj, objectVar, includeComments);
        } else {
            return this.generateOBJCode(obj, objectVar, assets, includeComments);
        }
    }
    
    /**
     * Generate code for primitive objects
     * @param {Object} obj - Object data
     * @param {string} objectVar - Variable name
     * @param {boolean} includeComments - Include comment blocks
     * @returns {string} Primitive object code
     */
    generatePrimitiveCode(obj, objectVar, includeComments = true) {
        const { primitiveType, material, transform, animation } = obj;
        
        return `        ${includeComments ? `// ${obj.name} (${primitiveType})` : ''}
        const ${objectVar}Geometry = ${this.getPrimitiveGeometryCode(primitiveType)};
        const ${objectVar}Material = ${this.getMaterialCode(material, includeComments)};
        const ${objectVar} = new THREE.Mesh(${objectVar}Geometry, ${objectVar}Material);
        
        ${this.getTransformCode(objectVar, transform)}
        
        ${this.getObjectPropertiesCode(objectVar, obj, includeComments)}
        
        scene.add(${objectVar});
        loadedObjects['${obj.name}'] = ${objectVar};
        ${animation?.type !== 'none' ? `animationObjects.push({ object: ${objectVar}, animation: ${JSON.stringify(animation)} });` : ''}
        ${includeComments ? `console.log('✅ Added ${obj.name}');` : ''}
`;
    }
    
    /**
     * Generate code for OBJ file objects
     * @param {Object} obj - Object data
     * @param {string} objectVar - Variable name
     * @param {Object} assets - Asset inventory
     * @param {boolean} includeComments - Include comment blocks
     * @returns {string} OBJ object code
     */
    generateOBJCode(obj, objectVar, assets, includeComments = true) {
        const { fileName, material, transform, animation } = obj;
        
        return `        ${includeComments ? `// ${obj.name} (OBJ File: ${fileName})` : ''}
        try {
            const ${objectVar} = await new Promise((resolve, reject) => {
                const loader = new THREE.OBJLoader();
                loader.load(
                    'assets/models/${fileName}',
                    async (object) => {
                        ${includeComments ? '// Apply material to all meshes' : ''}
                        const objectMaterial = ${this.getMaterialCode(material, includeComments)};
                        
                        object.traverse((child) => {
                            if (child.isMesh) {
                                child.material = objectMaterial;
                                child.castShadow = true;
                                child.receiveShadow = true;
                            }
                        });
                        
                        ${this.getTransformCode('object', transform)}
                        ${this.getObjectPropertiesCode('object', obj, includeComments)}
                        
                        object.name = '${obj.name}';
                        resolve(object);
                    },
                    (progress) => {
                        ${includeComments ? 'console.log(\'Loading progress:\', (progress.loaded / progress.total * 100) + \'%\');' : ''}
                    },
                    reject
                );
            });
            
            scene.add(${objectVar});
            loadedObjects['${obj.name}'] = ${objectVar};
            ${animation?.type !== 'none' ? `animationObjects.push({ object: ${objectVar}, animation: ${JSON.stringify(animation)} });` : ''}
            ${includeComments ? `console.log('✅ Loaded OBJ: ${obj.name}');` : ''}
            
        } catch (error) {
            console.error('❌ Failed to load ${obj.name}:', error);
            ${includeComments ? '// Add fallback geometry if OBJ fails to load' : ''}
            const fallback = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
            );
            ${this.getTransformCode('fallback', transform)}
            fallback.name = '${obj.name}_fallback';
            scene.add(fallback);
            loadedObjects['${obj.name}'] = fallback;
        }
`;
    }
    
    /**
     * Generate animation function
     * @param {Object} sceneData - Scene configuration
     * @param {boolean} includeComments - Include comment blocks
     * @param {boolean} includeAnimations - Include animation code
     * @returns {string} Animation function code
     */
    generateAnimationFunction(sceneData, includeComments = true, includeAnimations = true) {
        const animationCode = includeAnimations ? this.getAnimationUpdateCode(includeComments) : '';
        
        return `${includeComments ? '// Main animation loop' : ''}
function animate() {
    requestAnimationFrame(animate);
    
    ${includeComments ? '// Update stats if available' : ''}
    if (stats) stats.begin();
    
    ${animationCode}
    
    ${includeComments ? '// Update controls and render' : ''}
    if (controls) controls.update();
    renderer.render(scene, camera);
    
    if (stats) stats.end();
}`;
    }
    
    /**
     * Generate utility functions
     * @param {boolean} includeComments - Include comment blocks
     * @returns {string} Utility functions code
     */
    generateUtilityFunctions(includeComments = true) {
        return `${includeComments ? '// Utility functions' : ''}

${includeComments ? '// Handle window resize' : ''}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

${includeComments ? '// Show error message' : ''}
function showError(message) {
    if (errorElement) {
        document.getElementById('error-message').textContent = message;
        errorElement.style.display = 'block';
        if (loadingElement) loadingElement.style.display = 'none';
    }
    console.error('Scene Error:', message);
}

${includeComments ? '// Cleanup function for scene disposal' : ''}
function cleanup() {
    ${includeComments ? '// Dispose of geometries, materials, and textures' : ''}
    Object.values(loadedObjects).forEach(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(mat => mat.dispose());
            } else {
                obj.material.dispose();
            }
        }
    });
    
    if (renderer) {
        renderer.dispose();
    }
    
    ${includeComments ? 'console.log(\'✅ Scene cleanup complete\');' : ''}
}`;
    }
    
    /**
     * Generate event listeners setup
     * @param {boolean} includeComments - Include comment blocks
     * @returns {string} Event listeners code
     */
    generateEventListeners(includeComments = true) {
        return `${includeComments ? '// Setup event listeners' : ''}
function setupEventListeners() {
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('beforeunload', cleanup, false);
    
    ${includeComments ? '// Keyboard shortcuts (optional)' : ''}
    document.addEventListener('keydown', (event) => {
        switch(event.code) {
            case 'KeyF':
                ${includeComments ? '// F key - focus camera on scene' : ''}
                if (controls) {
                    controls.reset();
                }
                break;
            case 'KeyH':
                ${includeComments ? '// H key - toggle help info' : ''}
                const info = document.getElementById('info');
                if (info) {
                    info.style.display = info.style.display === 'none' ? 'block' : 'none';
                }
                break;
        }
    });
}

${includeComments ? '// Initialize when page loads' : ''}
window.addEventListener('load', init);`;
    }
    
    // Helper methods
    
    getPrimitiveGeometryCode(primitiveType) {
        const geometries = {
            'box': 'new THREE.BoxGeometry(2, 2, 2)',
            'sphere': 'new THREE.SphereGeometry(1.5, 32, 16)',
            'cylinder': 'new THREE.CylinderGeometry(1, 1, 2, 32)',
            'cone': 'new THREE.ConeGeometry(1, 2, 32)',
            'plane': 'new THREE.PlaneGeometry(3, 3)',
            'circle': 'new THREE.CircleGeometry(1.5, 32)',
            'ring': 'new THREE.RingGeometry(0.5, 1.5, 32)',
            'torus': 'new THREE.TorusGeometry(1.2, 0.4, 16, 100)',
            'torusknot': 'new THREE.TorusKnotGeometry(1, 0.3, 100, 16)',
            'dodecahedron': 'new THREE.DodecahedronGeometry(1.5)',
            'icosahedron': 'new THREE.IcosahedronGeometry(1.5)',
            'octahedron': 'new THREE.OctahedronGeometry(1.5)',
            'tetrahedron': 'new THREE.TetrahedronGeometry(1.5)',
            'capsule': 'new THREE.CapsuleGeometry(0.8, 1.6, 4, 8)'
        };
        
        return geometries[primitiveType] || 'new THREE.BoxGeometry(1, 1, 1)';
    }
    
    getMaterialCode(material, includeComments = true) {
        const { type, color, wireframe, opacity, roughness, metalness } = material;
        
        const materialConfig = {
            color: color || '#ffffff',
            wireframe: wireframe || false,
            transparent: opacity < 1,
            opacity: opacity || 1
        };
        
        if (type === 'standard' || type === 'physical') {
            materialConfig.roughness = roughness || 0.5;
            materialConfig.metalness = metalness || 0;
        }
        
        const configStr = Object.entries(materialConfig)
            .map(([key, value]) => `${key}: ${typeof value === 'string' ? `'${value}'` : value}`)
            .join(', ');
        
        const materialTypes = {
            'basic': 'THREE.MeshBasicMaterial',
            'lambert': 'THREE.MeshLambertMaterial',
            'phong': 'THREE.MeshPhongMaterial',
            'standard': 'THREE.MeshStandardMaterial',
            'physical': 'THREE.MeshPhysicalMaterial',
            'matcap': 'THREE.MeshMatcapMaterial'
        };
        
        const materialClass = materialTypes[type] || 'THREE.MeshStandardMaterial';
        return `new ${materialClass}({ ${configStr} })`;
    }
    
    getTransformCode(objectVar, transform) {
        const { position, rotation, scale } = transform;
        
        return `        ${objectVar}.position.set(${position.x}, ${position.y}, ${position.z});
        ${objectVar}.rotation.set(${rotation.x}, ${rotation.y}, ${rotation.z});
        ${objectVar}.scale.set(${scale.x}, ${scale.y}, ${scale.z});`;
    }
    
    getObjectPropertiesCode(objectVar, obj, includeComments = true) {
        return `        ${objectVar}.castShadow = true;
        ${objectVar}.receiveShadow = true;
        ${objectVar}.userData.originalData = ${JSON.stringify(obj, null, 8)};`;
    }
    
    getAnimationUpdateCode(includeComments = true) {
        return `    ${includeComments ? '// Update animated objects' : ''}
    animationObjects.forEach(({ object, animation }) => {
        if (!object || !animation || animation.type === 'none') return;
        
        const time = Date.now() * 0.001;
        const speed = animation.speed || 1;
        
        switch (animation.type) {
            case 'rotate-x':
                object.rotation.x = time * speed;
                break;
            case 'rotate-y':
                object.rotation.y = time * speed;
                break;
            case 'rotate-z':
                object.rotation.z = time * speed;
                break;
            case 'rotate-xyz':
                object.rotation.x = time * speed;
                object.rotation.y = time * speed * 0.7;
                object.rotation.z = time * speed * 0.3;
                break;
            case 'scale':
                const scaleValue = 1 + Math.sin(time * speed * 2) * 0.2;
                object.scale.setScalar(scaleValue);
                break;
            case 'bounce':
                object.position.y = Math.abs(Math.sin(time * speed * 3)) * 2;
                break;
            case 'float':
                object.position.y += Math.sin(time * speed) * 0.01;
                break;
        }
    });`;
    }
    
    getDefaultLighting() {
        return [
            { type: 'ambient', color: '0x404040', intensity: 0.4 },
            { type: 'directional', color: '0xffffff', intensity: 1, position: [20, 20, 20], castShadow: true },
            { type: 'point', color: '0x9dd9d9', intensity: 0.8, position: [10, 10, 10], distance: 50 },
            { type: 'point', color: '0xc77dcd', intensity: 0.5, position: [-10, 5, -10], distance: 30 }
        ];
    }
    
    sanitizeVariableName(name) {
        return name.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^[0-9]/, '_$&');
    }
    
    minifyCode(code) {
        return code
            .replace(/\/\/.*$/gm, '')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\s+/g, ' ')
            .replace(/;\s*}/g, ';}')
            .replace(/{\s*/g, '{')
            .replace(/}\s*/g, '}')
            .trim();
    }
}