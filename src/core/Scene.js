import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CameraController } from '../utils/CameraController.js';

export class ThreeScene {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = null;
        
        // Three.js core objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.cameraController = null;
        
        // Scene properties
        this.defaultCameraPosition = { x: 25, y: 15, z: 25 };
        this.backgroundColor = 0x0f0f0f;
        
        // Lighting
        this.lights = [];
        
        this.isInitialized = false;
    }
    
    async init() {
        try {
            console.log('🎭 Initializing Three.js scene...');
            
            // Get container element
            this.container = document.getElementById(this.containerId);
            if (!this.container) {
                throw new Error(`Container element with ID '${this.containerId}' not found`);
            }
            
            // Initialize Three.js components
            this.initScene();
            this.initCamera();
            this.initRenderer();
            this.initControls();
            this.initCameraController();
            this.initLighting();
            
            // Add renderer to DOM
            this.container.appendChild(this.renderer.domElement);
            
            // Set up resize handling
            this.handleResize();
            
            this.isInitialized = true;
            console.log('✅ Scene initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize scene:', error);
            throw error;
        }
    }
    
    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.backgroundColor);
        
        // Add fog for depth
        this.scene.fog = new THREE.Fog(this.backgroundColor, 50, 200);
        
        console.log('📦 Scene created');
    }
    
    initCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        
        // Set initial camera position
        this.resetCamera();
        
        console.log('📷 Camera created');
    }
    
    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Enable shadows
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Set tone mapping for better colors
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;
        
        console.log('🎨 Renderer created');
    }
    
    initControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        
        // Configure controls
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        this.controls.enableRotate = true;
        
        // Set limits
        this.controls.maxDistance = 200;
        this.controls.minDistance = 1;
        this.controls.maxPolarAngle = Math.PI; // Allow full rotation
        
        // Set target to center
        this.controls.target.set(0, 0, 0);
        this.controls.update();
        
        console.log('🎮 Controls initialized');
    }
    
    initCameraController() {
        this.cameraController = new CameraController(this.camera, this.controls);
        console.log('📹 Camera controller initialized');
    }
    
    initLighting() {
        // Clear existing lights
        this.lights.forEach(light => this.scene.remove(light));
        this.lights = [];
        
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);
        
        // Main directional light (sun-like)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(20, 20, 20);
        directionalLight.castShadow = true;
        
        // Configure shadow properties
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        
        this.scene.add(directionalLight);
        this.lights.push(directionalLight);
        
        // Fill light (opposite side)
        const fillLight = new THREE.DirectionalLight(0x9dd9d9, 0.3);
        fillLight.position.set(-10, -10, -10);
        this.scene.add(fillLight);
        this.lights.push(fillLight);
        
        // Point lights for accent
        const pointLight1 = new THREE.PointLight(0x9dd9d9, 0.8, 50);
        pointLight1.position.set(10, 10, 10);
        this.scene.add(pointLight1);
        this.lights.push(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xc77dcd, 0.5, 30);
        pointLight2.position.set(-10, 5, -10);
        this.scene.add(pointLight2);
        this.lights.push(pointLight2);
        
        console.log('💡 Lighting setup complete');
    }
    
    resetCamera() {
        this.camera.position.set(
            this.defaultCameraPosition.x,
            this.defaultCameraPosition.y,
            this.defaultCameraPosition.z
        );
        
        if (this.controls) {
            this.controls.target.set(0, 0, 0);
            this.controls.update();
        }
        
        console.log('📷 Camera reset to default position');
    }
    
    handleResize() {
        if (!this.isInitialized) return;
        
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        // Update camera
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        // Update renderer
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        console.log(`🔄 Scene resized to ${width}x${height}`);
    }
    
    render() {
        if (!this.isInitialized) return;
        this.renderer.render(this.scene, this.camera);
    }
    
    // Utility methods
    addObject(object) {
        this.scene.add(object);
        console.log('➕ Object added to scene:', object.name || 'Unnamed');
    }
    
    removeObject(object) {
        this.scene.remove(object);
        console.log('➖ Object removed from scene:', object.name || 'Unnamed');
    }
    
    getObjectByCustomId(customId) {
        // Find object by our custom ID stored in userData
        let foundObject = null;
        this.scene.traverse((child) => {
            if (child.userData.customId === customId) {
                foundObject = child;
            }
        });
        return foundObject;
    }
    
    getObjectById(id) {
        return this.scene.getObjectById(id);
    }
    
    getAllObjects() {
        const objects = [];
        this.scene.traverse((child) => {
            if (child.userData.isLoadedObject) {
                objects.push(child);
            }
        });
        return objects;
    }
    
    clearScene() {
        // Remove all loaded objects
        const objectsToRemove = this.getAllObjects();
        objectsToRemove.forEach(obj => this.scene.remove(obj));
        
        console.log('🧹 Scene cleared of loaded objects');
    }
    
    // Camera controls
    focusOnObject(object) {
        if (!object) return;
        
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxSize = Math.max(size.x, size.y, size.z);
        const distance = maxSize * 2;
        
        this.controls.target.copy(center);
        this.camera.position.copy(center).add(new THREE.Vector3(distance, distance, distance));
        this.controls.update();
        
        console.log('🎯 Camera focused on object');
    }
    
    // Get scene statistics
    getSceneStats() {
        let vertices = 0;
        let faces = 0;
        let objects = 0;
        
        this.scene.traverse((child) => {
            if (child.isMesh) {
                objects++;
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
        
        return { vertices, faces, objects };
    }
    
    // Export scene data
    exportSceneData() {
        return {
            camera: {
                position: this.camera.position.toArray(),
                rotation: this.camera.rotation.toArray(),
                fov: this.camera.fov
            },
            background: this.scene.background?.getHex(),
            objects: this.getAllObjects().map(obj => ({
                id: obj.id,
                name: obj.name,
                position: obj.position.toArray(),
                rotation: obj.rotation.toArray(),
                scale: obj.scale.toArray(),
                userData: obj.userData
            }))
        };
    }
}