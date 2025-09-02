import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

import { ThreeScene } from './core/Scene.js';
import { ObjectManager } from './loaders/ObjectManager.js';
import { UIController } from './ui/UIController.js';
import { CodeEditorManager } from './ui/CodeEditorManager.js';
import { ExportManager } from './export/ExportManager.js';
import { AnimationController } from './utils/AnimationController.js';
import { TextureManager } from './utils/TextureManager.js';

// Main application class
class ThreeLoaderApp {
    constructor() {
        this.scene = null;
        this.objectManager = null;
        this.uiController = null;
        this.codeEditorManager = null;
        this.exportManager = null;
        this.animationController = null;
        this.textureManager = null;
        
        this.selectedObject = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Initializing Three.js Loader App...');
            
            // Initialize core scene
            this.scene = new ThreeScene('viewport');
            await this.scene.init();
            
            // Initialize managers
            this.animationController = new AnimationController();
            this.textureManager = new TextureManager();
            this.objectManager = new ObjectManager(this.scene, this.animationController);
            this.exportManager = new ExportManager(this.scene, this.objectManager);
            
            // Initialize UI controller
            this.uiController = new UIController({
                scene: this.scene,
                objectManager: this.objectManager,
                exportManager: this.exportManager,
                animationController: this.animationController,
                textureManager: this.textureManager,
                onObjectSelect: this.handleObjectSelect.bind(this),
                onObjectUpdate: this.handleObjectUpdate.bind(this)
            });
            
            // Initialize code editor manager
            this.codeEditorManager = new CodeEditorManager({
                scene: this.scene,
                objectManager: this.objectManager,
                exportManager: this.exportManager,
                uiController: this.uiController
            });
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Start render loop
            this.startRenderLoop();
            
            this.isInitialized = true;
            console.log('✅ App initialized successfully');
            
            // Hide viewport info
            const viewportInfo = document.getElementById('viewport-info');
            if (viewportInfo) {
                viewportInfo.style.opacity = '0.7';
            }
            
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.showError('Failed to initialize application: ' + error.message);
        }
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.scene.handleResize();
        });
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey || event.metaKey) {
                switch (event.code) {
                    case 'KeyE':
                        event.preventDefault();
                        this.uiController.exportScene();
                        break;
                    case 'KeyR':
                        event.preventDefault();
                        this.scene.resetCamera();
                        break;
                    case 'Delete':
                    case 'Backspace':
                        if (this.selectedObject) {
                            event.preventDefault();
                            this.objectManager.removeObject(this.selectedObject.id);
                            this.selectedObject = null;
                            this.uiController.updateObjectSelection(null);
                        }
                        break;
                }
            }
        });
        
        // Prevent default drag behaviors
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }
    
    startRenderLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Update controls
            this.scene.controls.update();
            
            // Update animations
            this.animationController.update();
            
            // Render scene
            this.scene.render();
        };
        
        animate();
        console.log('🎬 Render loop started');
    }
    
    handleObjectSelect(objectData) {
        this.selectedObject = objectData;
        console.log('📦 Object selected:', objectData?.name || 'none');
    }
    
    handleObjectUpdate(objectData, updateType) {
        if (!objectData) return;
        
        console.log('🔄 Object updated:', objectData.name, updateType);
        
        // Update object in scene based on update type
        const sceneObject = this.scene.getObjectByCustomId(objectData.id);
        if (!sceneObject) return;
        
        switch (updateType) {
            case 'material':
                this.updateObjectMaterial(sceneObject, objectData.material);
                break;
            case 'transform':
                this.updateObjectTransform(sceneObject, objectData.transform);
                break;
            case 'animation':
                this.updateObjectAnimation(objectData);
                break;
        }
        
        // Auto-sync code editor with UI changes
        if (this.codeEditorManager) {
            this.codeEditorManager.syncFromUI();
        }
    }
    
    updateObjectMaterial(sceneObject, materialData) {
        sceneObject.traverse((child) => {
            if (child.isMesh) {
                const material = child.material;
                if (materialData.color !== undefined) {
                    material.color.setHex(parseInt(materialData.color.replace('#', ''), 16));
                }
                if (materialData.wireframe !== undefined) {
                    material.wireframe = materialData.wireframe;
                }
                if (materialData.opacity !== undefined) {
                    material.opacity = materialData.opacity;
                    material.transparent = materialData.opacity < 1;
                }
                if (materialData.roughness !== undefined && material.roughness !== undefined) {
                    material.roughness = materialData.roughness;
                }
                if (materialData.metalness !== undefined && material.metalness !== undefined) {
                    material.metalness = materialData.metalness;
                }
            }
        });
    }
    
    updateObjectTransform(sceneObject, transformData) {
        if (transformData.position) {
            sceneObject.position.set(
                transformData.position.x,
                transformData.position.y,
                transformData.position.z
            );
        }
        if (transformData.rotation) {
            sceneObject.rotation.set(
                transformData.rotation.x,
                transformData.rotation.y,
                transformData.rotation.z
            );
        }
        if (transformData.scale) {
            sceneObject.scale.set(
                transformData.scale.x,
                transformData.scale.y,
                transformData.scale.z
            );
        }
    }
    
    updateObjectAnimation(objectData) {
        this.animationController.updateObjectAnimation(objectData);
    }
    
    showError(message) {
        console.error('Error:', message);
        // Could implement toast notifications here
        alert('Error: ' + message);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.threeLoaderApp = new ThreeLoaderApp();
});

// Make THREE available globally for debugging
window.THREE = THREE;