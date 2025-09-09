import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export class ObjectManager {
    constructor(threeScene, animationController = null) {
        this.threeScene = threeScene;
        this.animationController = animationController;
        this.objLoader = new OBJLoader();
        this.loadedObjects = new Map(); // id -> objectData
        this.objectCounter = 0;
        
        // Default material settings
        this.defaultMaterial = {
            type: 'matcap', // Default to MatCap for better texture experience
            color: '#ffffff', // White color lets MatCap textures show their full color
            wireframe: false, // MatCap looks better solid
            opacity: 1.0, // Full opacity for MatCap
            roughness: 0.5, // Not used by MatCap but kept for other materials
            metalness: 0.0, // Not used by MatCap but kept for other materials
            texture: {
                file: null,
                filename: null
            }
        };
        
        console.log('📦 ObjectManager initialized');
    }
    
    // Load OBJ file from File object
    async loadOBJFile(file) {
        return new Promise((resolve, reject) => {
            if (!file.name.toLowerCase().endsWith('.obj')) {
                reject(new Error('File must be a .obj file'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    console.log(`📁 Loading OBJ file: ${file.name}`);
                    
                    const objData = event.target.result;
                    const object = this.objLoader.parse(objData);
                    
                    const processedObject = this.processLoadedObject(object, file.name);
                    resolve(processedObject);
                    
                } catch (error) {
                    console.error('❌ Failed to parse OBJ:', error);
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }
    
    // Load OBJ from URL
    async loadOBJFromURL(url) {
        return new Promise((resolve, reject) => {
            console.log(`🌐 Loading OBJ from URL: ${url}`);
            
            this.objLoader.load(
                url,
                (object) => {
                    const fileName = url.split('/').pop() || 'remote_object.obj';
                    const processedObject = this.processLoadedObject(object, fileName);
                    resolve(processedObject);
                },
                (progress) => {
                    console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
                },
                (error) => {
                    console.error('❌ Failed to load OBJ from URL:', error);
                    reject(error);
                }
            );
        });
    }
    
    // Process loaded object and add to scene
    processLoadedObject(object, fileName) {
        this.objectCounter++;
        const objectId = this.objectCounter;
        
        // Set up object metadata
        object.userData.isLoadedObject = true;
        object.userData.originalFileName = fileName;
        object.userData.loadTime = Date.now();
        object.userData.customId = objectId; // Use userData instead of trying to override id
        object.name = fileName.replace('.obj', '') + '_' + objectId;
        
        // Apply default material to all meshes
        this.applyMaterialToObject(object, this.defaultMaterial);
        
        // Center and scale object appropriately
        this.centerAndScaleObject(object);
        
        // Add to scene
        this.threeScene.addObject(object);
        
        // Register with animation controller
        if (this.animationController) {
            this.animationController.addObject(objectId, object);
        }
        
        // Store object data
        const objectData = {
            id: objectId,
            name: object.name,
            fileName: fileName,
            sceneObject: object,
            material: { ...this.defaultMaterial },
            transform: {
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 }
            },
            animation: {
                type: 'none',
                speed: 0.01
            },
            stats: this.getObjectStats(object)
        };
        
        this.loadedObjects.set(objectId, objectData);
        
        console.log(`✅ Object processed and added: ${fileName}`);
        console.log('📊 Object stats:', objectData.stats);
        
        return objectData;
    }
    
    // Apply material settings to object
    applyMaterialToObject(object, materialSettings, texture = null) {
        let material;
        
        // Determine if material should be transparent
        const needsTransparency = materialSettings.opacity < 1;
        
        // Create material based on type
        switch (materialSettings.type) {
            case 'basic':
                material = new THREE.MeshBasicMaterial({
                    color: new THREE.Color(materialSettings.color),
                    wireframe: materialSettings.wireframe,
                    transparent: needsTransparency,
                    opacity: materialSettings.opacity,
                    map: texture
                });
                break;
            case 'lambert':
                material = new THREE.MeshLambertMaterial({
                    color: new THREE.Color(materialSettings.color),
                    wireframe: materialSettings.wireframe,
                    transparent: needsTransparency,
                    opacity: materialSettings.opacity,
                    map: texture
                });
                break;
            case 'phong':
                material = new THREE.MeshPhongMaterial({
                    color: new THREE.Color(materialSettings.color),
                    wireframe: materialSettings.wireframe,
                    transparent: needsTransparency,
                    opacity: materialSettings.opacity,
                    map: texture
                });
                break;
            case 'physical':
                material = new THREE.MeshPhysicalMaterial({
                    color: new THREE.Color(materialSettings.color),
                    wireframe: materialSettings.wireframe,
                    transparent: needsTransparency,
                    opacity: materialSettings.opacity,
                    roughness: materialSettings.roughness,
                    metalness: materialSettings.metalness,
                    map: texture
                });
                break;
            case 'matcap':
                material = new THREE.MeshMatcapMaterial({
                    color: new THREE.Color(materialSettings.color),
                    wireframe: materialSettings.wireframe,
                    transparent: needsTransparency,
                    opacity: materialSettings.opacity,
                    matcap: texture // MatCap uses 'matcap' property, not 'map'
                });
                break;
            case 'standard':
            default:
                material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(materialSettings.color),
                    wireframe: materialSettings.wireframe,
                    transparent: needsTransparency,
                    opacity: materialSettings.opacity,
                    roughness: materialSettings.roughness,
                    metalness: materialSettings.metalness,
                    map: texture
                });
                break;
        }
        
        object.traverse((child) => {
            if (child.isMesh) {
                child.material = material;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }
    
    // Center and scale object to reasonable size
    centerAndScaleObject(object) {
        // Calculate bounding box
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Center the object
        object.position.sub(center);
        
        // Scale to reasonable size (max dimension ~10 units)
        const maxDimension = Math.max(size.x, size.y, size.z);
        if (maxDimension > 10) {
            const scale = 10 / maxDimension;
            object.scale.setScalar(scale);
        }
        
        console.log(`📏 Object centered and scaled. Original size: ${maxDimension.toFixed(2)}, Scale: ${object.scale.x.toFixed(3)}`);
    }
    
    // Get object statistics
    getObjectStats(object) {
        let vertices = 0;
        let faces = 0;
        let meshes = 0;
        
        object.traverse((child) => {
            if (child.isMesh) {
                meshes++;
                if (child.geometry) {
                    if (child.geometry.attributes.position) {
                        vertices += child.geometry.attributes.position.count;
                    }
                    if (child.geometry.index) {
                        faces += child.geometry.index.count / 3;
                    } else if (child.geometry.attributes.position) {
                        faces += child.geometry.attributes.position.count / 3;
                    }
                }
            }
        });
        
        return {
            meshes,
            vertices: Math.floor(vertices),
            faces: Math.floor(faces)
        };
    }
    
    // Update object material
    updateObjectMaterial(objectId, materialSettings) {
        const objectData = this.loadedObjects.get(objectId);
        if (!objectData) return false;
        
        // Update stored material data
        Object.assign(objectData.material, materialSettings);
        
        // Apply to Three.js object
        this.applyMaterialToObject(objectData.sceneObject, objectData.material);
        
        console.log(`🎨 Material updated for object: ${objectData.name}`);
        return true;
    }
    
    // Update object transform
    updateObjectTransform(objectId, transformData) {
        const objectData = this.loadedObjects.get(objectId);
        if (!objectData) return false;
        
        const sceneObject = objectData.sceneObject;
        
        if (transformData.position) {
            Object.assign(objectData.transform.position, transformData.position);
            sceneObject.position.set(
                transformData.position.x,
                transformData.position.y,
                transformData.position.z
            );
        }
        
        if (transformData.rotation) {
            Object.assign(objectData.transform.rotation, transformData.rotation);
            sceneObject.rotation.set(
                transformData.rotation.x,
                transformData.rotation.y,
                transformData.rotation.z
            );
        }
        
        if (transformData.scale) {
            Object.assign(objectData.transform.scale, transformData.scale);
            sceneObject.scale.set(
                transformData.scale.x,
                transformData.scale.y,
                transformData.scale.z
            );
        }
        
        console.log(`📐 Transform updated for object: ${objectData.name}`);
        return true;
    }
    
    // Update object animation
    updateObjectAnimation(objectId, animationData) {
        const objectData = this.loadedObjects.get(objectId);
        if (!objectData) return false;
        
        Object.assign(objectData.animation, animationData);
        
        console.log(`🎬 Animation updated for object: ${objectData.name}`);
        return true;
    }
    
    // Remove object from scene and manager
    removeObject(objectId) {
        const objectData = this.loadedObjects.get(objectId);
        if (!objectData) return false;
        
        // Remove from scene
        this.threeScene.removeObject(objectData.sceneObject);
        
        // Remove from animation controller
        if (this.animationController) {
            this.animationController.removeObject(objectId);
        }
        
        // Clean up geometry and materials
        objectData.sceneObject.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });
        
        // Remove from manager
        this.loadedObjects.delete(objectId);
        
        console.log(`🗑️ Object removed: ${objectData.name}`);
        return true;
    }
    
    // Get all loaded objects
    getAllObjects() {
        return Array.from(this.loadedObjects.values());
    }
    
    // Get object by ID
    getObject(objectId) {
        return this.loadedObjects.get(objectId);
    }
    
    // Clear all objects
    clearAll() {
        const objectIds = Array.from(this.loadedObjects.keys());
        objectIds.forEach(id => this.removeObject(id));
        console.log('🧹 All objects cleared');
    }
    
    // Export all objects data for code generation
    exportObjectsData() {
        const objectsData = [];
        
        for (const [id, objectData] of this.loadedObjects) {
            objectsData.push({
                id: id,
                name: objectData.name,
                fileName: objectData.fileName,
                material: { ...objectData.material },
                transform: { 
                    position: { ...objectData.transform.position },
                    rotation: { ...objectData.transform.rotation },
                    scale: { ...objectData.transform.scale }
                },
                animation: { ...objectData.animation },
                stats: { ...objectData.stats }
            });
        }
        
        return objectsData;
    }
    
    // Create primitive geometry
    createPrimitive(type) {
        let geometry;
        let name;
        
        switch (type) {
            case 'box':
                geometry = new THREE.BoxGeometry(2, 2, 2);
                name = 'Box';
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(1.5, 32, 16);
                name = 'Sphere';
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
                name = 'Cylinder';
                break;
            case 'cone':
                geometry = new THREE.ConeGeometry(1, 2, 32);
                name = 'Cone';
                break;
            case 'plane':
                geometry = new THREE.PlaneGeometry(3, 3);
                name = 'Plane';
                break;
            case 'circle':
                geometry = new THREE.CircleGeometry(1.5, 32);
                name = 'Circle';
                break;
            case 'ring':
                geometry = new THREE.RingGeometry(0.5, 1.5, 32);
                name = 'Ring';
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(1.2, 0.4, 16, 100);
                name = 'Torus';
                break;
            case 'torusKnot':
                geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
                name = 'Torus Knot';
                break;
            case 'dodecahedron':
                geometry = new THREE.DodecahedronGeometry(1.5);
                name = 'Dodecahedron';
                break;
            case 'icosahedron':
                geometry = new THREE.IcosahedronGeometry(1.5);
                name = 'Icosahedron';
                break;
            case 'octahedron':
                geometry = new THREE.OctahedronGeometry(1.5);
                name = 'Octahedron';
                break;
            case 'tetrahedron':
                geometry = new THREE.TetrahedronGeometry(1.5);
                name = 'Tetrahedron';
                break;
            case 'capsule':
                geometry = new THREE.CapsuleGeometry(0.8, 1.6, 4, 8);
                name = 'Capsule';
                break;
            case 'lathe':
                // Simple lathe shape - vase-like
                const points = [];
                for (let i = 0; i < 10; i++) {
                    const y = (i - 4.5) * 0.4;
                    const x = Math.sin(i * 0.2) * 0.5 + 0.8;
                    points.push(new THREE.Vector2(x, y));
                }
                geometry = new THREE.LatheGeometry(points, 32);
                name = 'Lathe';
                break;
            case 'extrude':
                // Simple star shape extrude
                const starShape = new THREE.Shape();
                const outerRadius = 1.2;
                const innerRadius = 0.6;
                const starPoints = 5;
                
                starShape.moveTo(outerRadius, 0);
                for (let i = 1; i <= starPoints * 2; i++) {
                    const angle = (i * Math.PI) / starPoints;
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    starShape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                }
                
                const extrudeSettings = {
                    depth: 0.4,
                    bevelEnabled: true,
                    bevelSegments: 2,
                    steps: 2,
                    bevelSize: 0.1,
                    bevelThickness: 0.1
                };
                
                geometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
                name = 'Star';
                break;
            case 'parametric':
                // Klein bottle parametric function
                const parametricFunction = (u, v, target) => {
                    u = u * Math.PI;
                    v = v * 2 * Math.PI;
                    const x = (3 + Math.cos(u/2) * Math.sin(v) - Math.sin(u/2) * Math.sin(2*v)) * Math.cos(u);
                    const y = (3 + Math.cos(u/2) * Math.sin(v) - Math.sin(u/2) * Math.sin(2*v)) * Math.sin(u);
                    const z = Math.sin(u/2) * Math.sin(v) + Math.cos(u/2) * Math.sin(2*v);
                    target.set(x * 0.3, y * 0.3, z * 0.3);
                };
                geometry = new THREE.ParametricGeometry(parametricFunction, 20, 20);
                name = 'Klein Bottle';
                break;
            case 'polyhedron':
                // Custom polyhedron using vertices and faces
                const vertices = [
                    1, 1, 1,    -1, -1, 1,    -1, 1, -1,    1, -1, -1
                ];
                const indices = [
                    2, 1, 0,    0, 3, 2,    1, 3, 0,    2, 3, 1
                ];
                geometry = new THREE.PolyhedronGeometry(vertices, indices, 1.5, 0);
                name = 'Custom Polyhedron';
                break;
            case 'tube':
                // Curved tube geometry
                class CustomCurve extends THREE.Curve {
                    getPoint(t, optionalTarget = new THREE.Vector3()) {
                        const tx = t * 3 - 1.5;
                        const ty = Math.sin(2 * Math.PI * t);
                        const tz = Math.cos(2 * Math.PI * t);
                        return optionalTarget.set(tx, ty, tz).multiplyScalar(0.8);
                    }
                }
                const path = new CustomCurve();
                geometry = new THREE.TubeGeometry(path, 20, 0.2, 8, false);
                name = 'Tube';
                break;
            case 'convex':
                // Convex hull of random points
                const convexPoints = [];
                for (let i = 0; i < 20; i++) {
                    convexPoints.push(new THREE.Vector3(
                        (Math.random() - 0.5) * 3,
                        (Math.random() - 0.5) * 3,
                        (Math.random() - 0.5) * 3
                    ));
                }
                geometry = new THREE.ConvexGeometry(convexPoints);
                name = 'Convex Hull';
                break;
            case 'decal':
                // Decal geometry on a cube
                const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
                const position = new THREE.Vector3(0, 0, 1);
                const orientation = new THREE.Euler(0, 0, 0);
                const size = new THREE.Vector3(1, 1, 1);
                geometry = new THREE.DecalGeometry(cubeGeometry, position, orientation, size);
                name = 'Decal';
                break;
            case 'edges':
                // Edges geometry from a dodecahedron
                const baseGeometry = new THREE.DodecahedronGeometry(1.5);
                geometry = new THREE.EdgesGeometry(baseGeometry);
                name = 'Edges';
                break;
            case 'wireframe':
                // Wireframe geometry from a icosahedron
                const wireBaseGeometry = new THREE.IcosahedronGeometry(1.5, 1);
                geometry = new THREE.WireframeGeometry(wireBaseGeometry);
                name = 'Wireframe';
                break;
            case 'shape':
                // Heart shape
                const heartShape = new THREE.Shape();
                const x = 0, y = 0;
                heartShape.moveTo(x + 25, y + 25);
                heartShape.bezierCurveTo(x + 25, y + 25, x + 20, y, x, y);
                heartShape.bezierCurveTo(x - 30, y, x - 30, y + 35, x - 30, y + 35);
                heartShape.bezierCurveTo(x - 30, y + 55, x - 10, y + 77, x + 25, y + 95);
                heartShape.bezierCurveTo(x + 60, y + 77, x + 80, y + 55, x + 80, y + 35);
                heartShape.bezierCurveTo(x + 80, y + 35, x + 80, y, x + 50, y);
                heartShape.bezierCurveTo(x + 35, y, x + 25, y + 25, x + 25, y + 25);
                geometry = new THREE.ShapeGeometry(heartShape);
                geometry.scale(0.02, 0.02, 0.02);
                name = 'Heart Shape';
                break;
            case 'text':
                // Note: TextGeometry requires font loading, using placeholder
                // In a real implementation, you would load a font first
                geometry = new THREE.PlaneGeometry(2, 0.5);
                name = 'Text (Placeholder)';
                break;
            default:
                console.error('Unknown primitive type:', type);
                return null;
        }
        
        // Create material with default settings
        let material;
        
        // Special handling for line-based geometries
        if (type === 'edges' || type === 'wireframe') {
            material = new THREE.LineBasicMaterial({
                color: new THREE.Color(this.defaultMaterial.color),
                transparent: this.defaultMaterial.opacity < 1,
                opacity: this.defaultMaterial.opacity
            });
        } else {
            switch (this.defaultMaterial.type) {
            case 'basic':
                material = new THREE.MeshBasicMaterial({
                    color: new THREE.Color(this.defaultMaterial.color),
                    wireframe: this.defaultMaterial.wireframe,
                    transparent: this.defaultMaterial.opacity < 1,
                    opacity: this.defaultMaterial.opacity
                });
                break;
            case 'lambert':
                material = new THREE.MeshLambertMaterial({
                    color: new THREE.Color(this.defaultMaterial.color),
                    wireframe: this.defaultMaterial.wireframe,
                    transparent: this.defaultMaterial.opacity < 1,
                    opacity: this.defaultMaterial.opacity
                });
                break;
            case 'phong':
                material = new THREE.MeshPhongMaterial({
                    color: new THREE.Color(this.defaultMaterial.color),
                    wireframe: this.defaultMaterial.wireframe,
                    transparent: this.defaultMaterial.opacity < 1,
                    opacity: this.defaultMaterial.opacity
                });
                break;
            case 'physical':
                material = new THREE.MeshPhysicalMaterial({
                    color: new THREE.Color(this.defaultMaterial.color),
                    wireframe: this.defaultMaterial.wireframe,
                    transparent: this.defaultMaterial.opacity < 1,
                    opacity: this.defaultMaterial.opacity,
                    roughness: this.defaultMaterial.roughness,
                    metalness: this.defaultMaterial.metalness
                });
                break;
            case 'matcap':
                material = new THREE.MeshMatcapMaterial({
                    color: new THREE.Color(this.defaultMaterial.color),
                    wireframe: this.defaultMaterial.wireframe,
                    transparent: this.defaultMaterial.opacity < 1,
                    opacity: this.defaultMaterial.opacity
                });
                break;
            case 'shader':
                // Default shader material with basic vertex/fragment shaders
                material = new THREE.ShaderMaterial({
                    vertexShader: `
                        void main() {
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `,
                    fragmentShader: `
                        uniform float time;
                        uniform vec2 resolution;
                        void main() {
                            vec2 uv = gl_FragCoord.xy / resolution.xy;
                            float r = sin(time + uv.x * 10.0) * 0.5 + 0.5;
                            float g = sin(time + uv.y * 10.0) * 0.5 + 0.5;
                            float b = sin(time + (uv.x + uv.y) * 5.0) * 0.5 + 0.5;
                            gl_FragColor = vec4(r, g, b, 1.0);
                        }
                    `,
                    uniforms: {
                        time: { value: 0.0 },
                        resolution: { value: new THREE.Vector2(800, 600) }
                    }
                });
                break;
            case 'toon':
                material = new THREE.MeshToonMaterial({
                    color: new THREE.Color(this.defaultMaterial.color),
                    wireframe: this.defaultMaterial.wireframe,
                    transparent: this.defaultMaterial.opacity < 1,
                    opacity: this.defaultMaterial.opacity
                });
                break;
            case 'normal':
                material = new THREE.MeshNormalMaterial({
                    wireframe: this.defaultMaterial.wireframe,
                    transparent: this.defaultMaterial.opacity < 1,
                    opacity: this.defaultMaterial.opacity
                });
                break;
            case 'depth':
                material = new THREE.MeshDepthMaterial({
                    wireframe: this.defaultMaterial.wireframe,
                    transparent: this.defaultMaterial.opacity < 1,
                    opacity: this.defaultMaterial.opacity
                });
                break;
            case 'distance':
                material = new THREE.MeshDistanceMaterial({
                    wireframe: this.defaultMaterial.wireframe,
                    transparent: this.defaultMaterial.opacity < 1,
                    opacity: this.defaultMaterial.opacity
                });
                break;
            case 'lineDashed':
                material = new THREE.LineDashedMaterial({
                    color: new THREE.Color(this.defaultMaterial.color),
                    transparent: this.defaultMaterial.opacity < 1,
                    opacity: this.defaultMaterial.opacity,
                    dashSize: 3,
                    gapSize: 1
                });
                break;
            case 'lineBasic':
                material = new THREE.LineBasicMaterial({
                    color: new THREE.Color(this.defaultMaterial.color),
                    transparent: this.defaultMaterial.opacity < 1,
                    opacity: this.defaultMaterial.opacity
                });
                break;
            case 'points':
                material = new THREE.PointsMaterial({
                    color: new THREE.Color(this.defaultMaterial.color),
                    transparent: this.defaultMaterial.opacity < 1,
                    opacity: this.defaultMaterial.opacity,
                    size: 2,
                    sizeAttenuation: true
                });
                break;
            case 'sprite':
                material = new THREE.SpriteMaterial({
                    color: new THREE.Color(this.defaultMaterial.color),
                    transparent: this.defaultMaterial.opacity < 1,
                    opacity: this.defaultMaterial.opacity
                });
                break;
            case 'standard':
            default:
                material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(this.defaultMaterial.color),
                    wireframe: this.defaultMaterial.wireframe,
                    transparent: this.defaultMaterial.opacity < 1,
                    opacity: this.defaultMaterial.opacity,
                    roughness: this.defaultMaterial.roughness,
                    metalness: this.defaultMaterial.metalness
                });
                break;
            }
        }
        
        // Create mesh (or LineSegments for edge/wireframe geometries)
        let mesh;
        if (type === 'edges' || type === 'wireframe') {
            mesh = new THREE.LineSegments(geometry, material);
        } else {
            mesh = new THREE.Mesh(geometry, material);
        }
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Create group (to match OBJ loading structure)
        const group = new THREE.Group();
        group.add(mesh);
        
        // Set up object metadata
        this.objectCounter++;
        const objectId = this.objectCounter;
        
        group.userData.isLoadedObject = true;
        group.userData.isPrimitive = true;
        group.userData.primitiveType = type;
        group.userData.originalFileName = `${name.toLowerCase()}.primitive`;
        group.userData.loadTime = Date.now();
        group.userData.customId = objectId;
        group.name = `${name}_${objectId}`;
        
        // Add to scene
        this.threeScene.addObject(group);
        
        // Register with animation controller
        if (this.animationController) {
            this.animationController.addObject(objectId, group);
        }
        
        // Store object data
        const objectData = {
            id: objectId,
            name: group.name,
            fileName: `${name.toLowerCase()}.primitive`,
            sceneObject: group,
            material: { ...this.defaultMaterial },
            transform: {
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 }
            },
            animation: {
                type: 'none',
                speed: 0.01
            },
            stats: this.getObjectStats(group),
            isPrimitive: true,
            primitiveType: type
        };
        
        this.loadedObjects.set(objectId, objectData);
        
        console.log(`✨ Primitive created and added: ${name} (${type})`);
        console.log('📊 Primitive stats:', objectData.stats);
        
        return objectData;
    }
}