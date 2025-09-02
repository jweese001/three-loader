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
}