import { ShaderManager } from '../materials/ShaderManager.js';
import { AdvancedAnimationManager } from '../animation/AdvancedAnimationManager.js';
import { TimelinePanel } from './TimelinePanel.js';

export class UIController {
    constructor(config) {
        this.scene = config.scene;
        this.objectManager = config.objectManager;
        this.exportManager = config.exportManager;
        this.animationController = config.animationController;
        this.textureManager = config.textureManager;
        this.shaderManager = new ShaderManager();
        
        // Initialize advanced animation system
        this.advancedAnimationManager = new AdvancedAnimationManager(this.scene.scene);
        this.timelinePanel = null;
        this.onObjectSelect = config.onObjectSelect;
        this.onObjectUpdate = config.onObjectUpdate;
        
        this.selectedObjectId = null;
        
        this.init();
        console.log('🎮 UIController initialized');
    }
    
    init() {
        // TODO: Initialize UI components
        this.setupDropZone();
        this.setupFileInput();
        this.setupPrimitiveControls();
        this.setupViewportControls();
        this.setupCameraControls();
        this.setupMaterialControls();
        this.setupTransformControls();
        this.setupAnimationControls();
        this.setupExportControls();
        this.setupLightingControls();
        this.setupAdvancedAnimationControls();
        // this.setupUIToggle(); // Disabled - now handled by ButtonController
        this.setupCollapsiblePanels();
        this.shaderManager.initializeEventHandlers();
        
        // Initialize export button state
        this.updateExportButtonState();
    }
    
    setupDropZone() {
        const fileInput = document.getElementById('file-input');
        const fileSelectBtn = document.getElementById('file-select-btn');
        const loadingIndicator = document.getElementById('loading-indicator');
        
        // File select button
        fileSelectBtn.addEventListener('click', () => {
            fileInput.click();
        });
        
        // File input change
        fileInput.addEventListener('change', (event) => {
            const files = Array.from(event.target.files);
            
            
            this.handleFiles(files);
        });
        
        // Global drag and drop for entire page
        document.addEventListener('dragover', (event) => {
            event.preventDefault();
        });
        
        document.addEventListener('drop', (event) => {
            event.preventDefault();
            const files = Array.from(event.dataTransfer.files).filter(file => 
                file.name.toLowerCase().endsWith('.obj')
            );
            if (files.length > 0) {
                this.handleFiles(files);
            }
        });
        
        console.log('📁 Drop zone setup complete');
    }
    
    async handleFiles(files) {
        const objFiles = files.filter(file => file.name.toLowerCase().endsWith('.obj'));
        
        if (objFiles.length === 0) {
            alert('Please select .obj files only');
            return;
        }
        
        const loadingIndicator = document.getElementById('loading-indicator');
        const viewportInfo = document.getElementById('viewport-info');
        
        for (const file of objFiles) {
            try {
                // Show loading
                loadingIndicator.style.display = 'flex';
                if (viewportInfo) viewportInfo.style.display = 'none';
                
                console.log(`📁 Processing file: ${file.name}`);
                
                // Load the OBJ file
                const objectData = await this.objectManager.loadOBJFile(file);
                
                // Update objects list
                this.updateObjectsList();
                
                // Update export button state first (most important)
                this.updateExportButtonState();
                
                // Try to select the new object (may fail due to animation system)
                try {
                    this.selectObject(objectData.id);
                } catch (selectionError) {
                    console.warn('⚠️ Failed to select object (non-critical):', selectionError);
                }
                
                console.log(`✅ File loaded successfully: ${file.name}`);
                
            } catch (error) {
                console.error(`❌ Failed to load ${file.name}:`, error);
                alert(`Failed to load ${file.name}: ${error.message}`);
            } finally {
                loadingIndicator.style.display = 'none';
            }
        }
    }
    
    setupFileInput() {
        // File input is handled in setupDropZone
        console.log('📁 File input integrated with drop zone');
    }
    
    setupPrimitiveControls() {
        try {
            const primitiveSelect = document.getElementById('primitive-select');
            const addPrimitiveBtn = document.getElementById('add-primitive-btn');
            
            if (!primitiveSelect) {
                console.error('❌ primitive-select element not found');
                return;
            }
            
            if (!addPrimitiveBtn) {
                console.error('❌ add-primitive-btn element not found');
                return;
            }
            
            // Enable/disable button based on selection
            primitiveSelect.addEventListener('change', () => {
                addPrimitiveBtn.disabled = !primitiveSelect.value;
                console.log('Primitive selection changed:', primitiveSelect.value);
            });
            
            // Add primitive button click
            addPrimitiveBtn.addEventListener('click', async () => {
            const selectedType = primitiveSelect.value;
            if (!selectedType) return;
            
            try {
                console.log(`✨ Creating primitive: ${selectedType}`);
                
                // Create the primitive
                const objectData = this.objectManager.createPrimitive(selectedType);
                
                if (objectData) {
                    // Hide viewport info message
                    const viewportInfo = document.getElementById('viewport-info');
                    if (viewportInfo) viewportInfo.style.display = 'none';
                    
                    // Update objects list
                    this.updateObjectsList();
                    
                    // Update export button state first (most important)
                    this.updateExportButtonState();
                    
                    // Try to select the new object (may fail due to animation system)
                    try {
                        this.selectObject(objectData.id);
                    } catch (selectionError) {
                        console.warn('⚠️ Failed to select object (non-critical):', selectionError);
                    }
                    
                    // Reset selection
                    primitiveSelect.value = '';
                    addPrimitiveBtn.disabled = true;
                    
                    console.log(`✅ Primitive created successfully: ${objectData.name}`);
                } else {
                    console.error('❌ Failed to create primitive');
                }
                
            } catch (error) {
                console.error('❌ Error creating primitive:', error);
            }
        });
        
        console.log('✨ Primitive controls setup complete');
        
        } catch (error) {
            console.error('❌ Error setting up primitive controls:', error);
        }
    }
    
    setupViewportControls() {
        // Reset camera button
        const resetCameraBtn = document.getElementById('reset-camera-btn');
        resetCameraBtn.addEventListener('click', () => {
            this.scene.resetCamera();
            // Auto-sync code editor
            if (this.onObjectUpdate) {
                setTimeout(() => this.triggerCodeSync(), 100);
            }
        });
        
        // Wireframe toggle button
        const wireframeToggleBtn = document.getElementById('wireframe-toggle-btn');
        wireframeToggleBtn.addEventListener('click', () => {
            if (this.selectedObjectId) {
                const objectData = this.objectManager.getObject(this.selectedObjectId);
                if (objectData) {
                    const newWireframeState = !objectData.material.wireframe;
                    this.updateObjectMaterial({ wireframe: newWireframeState });
                    
                    // Update material controls UI
                    document.getElementById('material-wireframe').checked = newWireframeState;
                }
            }
        });
        
        // Fullscreen button
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });
        
        // Clear scene button
        const clearSceneBtn = document.getElementById('clear-scene-btn');
        clearSceneBtn.addEventListener('click', () => {
            if (confirm('Clear all objects from the scene?')) {
                this.objectManager.clearAll();
                this.selectedObjectId = null;
                this.updateObjectsList();
                this.updateMaterialControls(null);
                this.updateTransformControls(null);
                // Auto-sync code editor after clearing scene
                setTimeout(() => this.triggerCodeSync(), 100);
                this.updateAnimationControls(null);
                
                // Update export button state
                this.updateExportButtonState();
                
                // Show viewport info again
                const viewportInfo = document.getElementById('viewport-info');
                if (viewportInfo) viewportInfo.style.display = 'block';
            }
        });
        
        // Export scene button
        const exportBtn = document.getElementById('export-btn');
        exportBtn.addEventListener('click', () => {
            console.log('🔘 Export button clicked');
            this.exportScene();
        });
        
        console.log('🎯 Viewport controls setup complete');
    }
    
    setupCameraControls() {
        // Setup collapsible sections
        this.setupCollapsibleSections();
        
        // Camera controls toggle button (scroll to camera panel)
        const cameraControlsToggleBtn = document.getElementById('camera-controls-toggle-btn');
        cameraControlsToggleBtn.addEventListener('click', () => {
            const cameraPanel = document.getElementById('camera-panel');
            cameraPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        
        // Pan controls
        const panUpBtn = document.getElementById('pan-up-btn');
        const panDownBtn = document.getElementById('pan-down-btn');
        const panLeftBtn = document.getElementById('pan-left-btn');
        const panRightBtn = document.getElementById('pan-right-btn');
        const panCenterBtn = document.getElementById('pan-center-btn');
        
        panUpBtn.addEventListener('click', () => {
            if (this.scene.cameraController) {
                this.scene.cameraController.panUp();
            }
        });
        
        panDownBtn.addEventListener('click', () => {
            if (this.scene.cameraController) {
                this.scene.cameraController.panDown();
            }
        });
        
        panLeftBtn.addEventListener('click', () => {
            if (this.scene.cameraController) {
                this.scene.cameraController.panLeft();
            }
        });
        
        panRightBtn.addEventListener('click', () => {
            if (this.scene.cameraController) {
                this.scene.cameraController.panRight();
            }
        });
        
        panCenterBtn.addEventListener('click', () => {
            if (this.scene.cameraController) {
                this.scene.cameraController.panCenter();
            }
        });
        
        // Tilt controls
        const tiltUpBtn = document.getElementById('tilt-up-btn');
        const tiltDownBtn = document.getElementById('tilt-down-btn');
        const tiltResetBtn = document.getElementById('tilt-reset-btn');
        
        tiltUpBtn.addEventListener('click', () => {
            if (this.scene.cameraController) {
                this.scene.cameraController.tiltUp();
            }
        });
        
        tiltDownBtn.addEventListener('click', () => {
            if (this.scene.cameraController) {
                this.scene.cameraController.tiltDown();
            }
        });
        
        tiltResetBtn.addEventListener('click', () => {
            if (this.scene.cameraController) {
                this.scene.cameraController.tiltReset();
            }
        });
        
        // Zoom controls
        const zoomInBtn = document.getElementById('zoom-in-btn');
        const zoomOutBtn = document.getElementById('zoom-out-btn');
        const zoomSlider = document.getElementById('zoom-slider');
        const zoomValue = document.getElementById('zoom-value');
        
        zoomInBtn.addEventListener('click', () => {
            if (this.scene.cameraController) {
                this.scene.cameraController.zoomIn();
                this.updateZoomSlider();
            }
        });
        
        zoomOutBtn.addEventListener('click', () => {
            if (this.scene.cameraController) {
                this.scene.cameraController.zoomOut();
                this.updateZoomSlider();
            }
        });
        
        zoomSlider.addEventListener('input', (event) => {
            const distance = parseFloat(event.target.value);
            zoomValue.textContent = distance;
            if (this.scene.cameraController) {
                this.scene.cameraController.setZoomDistance(distance);
            }
        });
        
        // Speed control
        const speedSlider = document.getElementById('camera-speed-slider');
        const speedValue = document.getElementById('speed-value');
        
        speedSlider.addEventListener('input', (event) => {
            const speed = parseFloat(event.target.value);
            speedValue.textContent = speed.toFixed(1) + 'x';
            if (this.scene.cameraController) {
                this.scene.cameraController.setMoveSpeed(speed);
                this.scene.cameraController.setZoomSpeed(speed);
                this.scene.cameraController.setTiltSpeed(speed * 0.1);
            }
        });
        
        // Quick preset positions
        const cameraPresets = ['front', 'back', 'top', 'bottom', 'left', 'right'];
        cameraPresets.forEach(preset => {
            const btn = document.getElementById(`camera-${preset}-btn`);
            btn.addEventListener('click', () => {
                if (this.scene.cameraController) {
                    this.scene.cameraController.setCameraPosition(preset);
                }
            });
        });
        
        console.log('📹 Camera controls setup complete');
    }
    
    updateZoomSlider() {
        if (this.scene.cameraController) {
            const info = this.scene.cameraController.getCameraInfo();
            const zoomSlider = document.getElementById('zoom-slider');
            const zoomValue = document.getElementById('zoom-value');
            zoomSlider.value = info.distance;
            zoomValue.textContent = Math.round(info.distance);
        }
    }
    
    setupCollapsibleSections() {
        // Setup new panel-level collapsible system
        const panelHeaders = document.querySelectorAll('.panel-header');
        panelHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const targetId = header.getAttribute('data-target');
                const content = document.getElementById(targetId);
                const arrow = header.querySelector('.collapse-arrow');
                
                // Toggle collapsed state
                const isCollapsed = content.classList.contains('collapsed');
                
                if (isCollapsed) {
                    content.classList.remove('collapsed');
                    header.setAttribute('aria-expanded', 'true');
                    if (arrow) arrow.style.transform = 'rotate(0deg)';
                } else {
                    content.classList.add('collapsed');
                    header.setAttribute('aria-expanded', 'false');
                    if (arrow) arrow.style.transform = 'rotate(-90deg)';
                }
                
                console.log(`📋 ${isCollapsed ? 'Expanded' : 'Collapsed'} panel: ${targetId}`);
            });
            
            // Set initial state (all panels collapsed by default)
            const content = document.getElementById(header.getAttribute('data-target'));
            content.classList.add('collapsed');
            header.setAttribute('aria-expanded', 'false');
            const arrow = header.querySelector('.collapse-arrow');
            if (arrow) arrow.style.transform = 'rotate(-90deg)';
        });
        
        // Keep legacy support for any remaining old-style sections
        const legacyHeaders = document.querySelectorAll('.section-header');
        legacyHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const targetId = header.getAttribute('data-target');
                const content = document.getElementById(targetId);
                const arrow = header.querySelector('.collapse-arrow');
                
                // Toggle collapsed state
                const isCollapsed = content.classList.contains('collapsed');
                
                if (isCollapsed) {
                    content.classList.remove('collapsed');
                    header.setAttribute('aria-expanded', 'true');
                } else {
                    content.classList.add('collapsed');
                    header.setAttribute('aria-expanded', 'false');
                }
                
                console.log(`📹 ${isCollapsed ? 'Expanded' : 'Collapsed'} ${targetId}`);
            });
            
            // Set initial state (all sections expanded by default)
            header.setAttribute('aria-expanded', 'true');
        });
    }
    
    setupMaterialControls() {
        const materialPanel = document.getElementById('material-panel');
        
        // Get all material control elements
        const materialTypeSelect = document.getElementById('material-type');
        const textureBrowseBtn = document.getElementById('texture-browse-btn');
        const textureFileInput = document.getElementById('texture-file-input');
        const selectedTextureInfo = document.getElementById('selected-texture-info');
        const texturePreview = document.getElementById('texture-preview');
        const clearTextureBtn = document.getElementById('clear-texture-btn');
        const colorInput = document.getElementById('material-color');
        const wireframeInput = document.getElementById('material-wireframe');
        const opacityInput = document.getElementById('material-opacity');
        const roughnessInput = document.getElementById('material-roughness');
        const metalnessInput = document.getElementById('material-metalness');
        
        // Get value display elements
        const opacityDisplay = opacityInput.parentElement.querySelector('.value-display');
        const roughnessDisplay = roughnessInput.parentElement.querySelector('.value-display');
        const metalnessDisplay = metalnessInput.parentElement.querySelector('.value-display');
        
        // Material type change
        materialTypeSelect.addEventListener('change', (event) => {
            const materialType = event.target.value;
            if (this.selectedObjectId) {
                this.updateObjectMaterial({ type: materialType });
                
                // Show/hide shader panel for shader materials
                this.shaderManager.toggleShaderPanel(materialType === 'shader');
                
                // If switching to shader material, set current material
                if (materialType === 'shader') {
                    const object = this.objectManager.getObjectById(this.selectedObjectId);
                    if (object && object.children[0] && object.children[0].material) {
                        this.shaderManager.setCurrentMaterial(object.children[0].material);
                    }
                }
            }
        });
        
        // Texture browse button
        textureBrowseBtn.addEventListener('click', () => {
            textureFileInput.click();
        });
        
        // Texture file selection
        textureFileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file && this.selectedObjectId) {
                try {
                    
                    // Show preview
                    const previewUrl = URL.createObjectURL(file);
                    texturePreview.src = previewUrl;
                    selectedTextureInfo.style.display = 'flex';
                    selectedTextureInfo.classList.add('has-texture');
                    
                    // Update material with file texture
                    this.updateObjectMaterial({ texture: { file, filename: file.name } });
                    
                } catch (error) {
                    console.error('❌ Failed to load texture file:', error);
                    alert('Failed to load texture file: ' + error.message);
                }
            }
        });
        
        // Clear texture button
        clearTextureBtn.addEventListener('click', () => {
            if (this.selectedObjectId) {
                // Clear file input
                textureFileInput.value = '';
                // Keep texture preview container visible, just remove the texture
                selectedTextureInfo.classList.remove('has-texture');
                
                // Revoke object URL
                if (texturePreview.src.startsWith('blob:')) {
                    URL.revokeObjectURL(texturePreview.src);
                }
                texturePreview.src = '';
                
                // Clear texture
                this.updateObjectMaterial({ texture: { file: null, filename: null } });
            }
        });
        
        // Color change
        colorInput.addEventListener('input', (event) => {
            if (this.selectedObjectId) {
                this.updateObjectMaterial({ color: event.target.value });
            }
        });
        
        // Wireframe toggle
        wireframeInput.addEventListener('change', (event) => {
            if (this.selectedObjectId) {
                this.updateObjectMaterial({ wireframe: event.target.checked });
            }
        });
        
        // Opacity slider
        opacityInput.addEventListener('input', (event) => {
            const value = parseFloat(event.target.value);
            opacityDisplay.textContent = value.toFixed(2);
            if (this.selectedObjectId) {
                this.updateObjectMaterial({ opacity: value });
            }
        });
        
        // Roughness slider
        roughnessInput.addEventListener('input', (event) => {
            const value = parseFloat(event.target.value);
            roughnessDisplay.textContent = value.toFixed(2);
            if (this.selectedObjectId) {
                this.updateObjectMaterial({ roughness: value });
            }
        });
        
        // Metalness slider
        metalnessInput.addEventListener('input', (event) => {
            const value = parseFloat(event.target.value);
            metalnessDisplay.textContent = value.toFixed(2);
            if (this.selectedObjectId) {
                this.updateObjectMaterial({ metalness: value });
            }
        });
        
        
        console.log('🎨 Material controls setup complete');
    }
    
    updateMaterialControls(objectData) {
        const materialTypeSelect = document.getElementById('material-type');
        const selectedTextureInfo = document.getElementById('selected-texture-info');
        const texturePreview = document.getElementById('texture-preview');
        const colorInput = document.getElementById('material-color');
        const wireframeInput = document.getElementById('material-wireframe');
        const opacityInput = document.getElementById('material-opacity');
        const roughnessInput = document.getElementById('material-roughness');
        const metalnessInput = document.getElementById('material-metalness');
        
        const opacityDisplay = opacityInput.parentElement.querySelector('.value-display');
        const roughnessDisplay = roughnessInput.parentElement.querySelector('.value-display');
        const metalnessDisplay = metalnessInput.parentElement.querySelector('.value-display');
        
        if (objectData) {
            // Update controls with object's material properties
            materialTypeSelect.value = objectData.material.type || 'standard';
            colorInput.value = objectData.material.color;
            wireframeInput.checked = objectData.material.wireframe;
            opacityInput.value = objectData.material.opacity;
            roughnessInput.value = objectData.material.roughness;
            metalnessInput.value = objectData.material.metalness;
            
            // Always show texture preview container
            selectedTextureInfo.style.display = 'flex';
            
            // Update texture display
            const texture = objectData.material.texture;
            if (texture && texture.filename) {
                // Note: We can't restore the file preview since we don't have the file reference
                texturePreview.src = ''; // Clear preview for now
                selectedTextureInfo.classList.remove('has-texture'); // Show placeholder until texture loads
            } else {
                selectedTextureInfo.classList.remove('has-texture');
                texturePreview.src = '';
            }
            
            // Update displays
            opacityDisplay.textContent = objectData.material.opacity.toFixed(2);
            roughnessDisplay.textContent = objectData.material.roughness.toFixed(2);
            metalnessDisplay.textContent = objectData.material.metalness.toFixed(2);
            
            // Enable controls
            document.getElementById('material-panel').style.opacity = '1';
            [materialTypeSelect, colorInput, wireframeInput, opacityInput, roughnessInput, metalnessInput].forEach(input => {
                input.disabled = false;
            });
        } else {
            // Disable controls
            document.getElementById('material-panel').style.opacity = '0.6';
            [materialTypeSelect, colorInput, wireframeInput, opacityInput, roughnessInput, metalnessInput].forEach(input => {
                input.disabled = true;
            });
            // Keep texture preview visible even when no object is selected
            selectedTextureInfo.style.display = 'flex';
            selectedTextureInfo.classList.remove('has-texture');
            texturePreview.src = '';
        }
    }
    
    async updateObjectMaterial(materialUpdates) {
        if (!this.selectedObjectId) return;
        
        const objectData = this.objectManager.getObject(this.selectedObjectId);
        if (!objectData) return;
        
        // Handle texture loading if texture update is requested
        if (materialUpdates.texture) {
            const { file, filename } = materialUpdates.texture;
            let texture = null;
            
            if (file) {
                try {
                    texture = await this.textureManager.loadTextureFromFile(file);
                } catch (error) {
                    console.error('Failed to load texture from file:', error);
                }
            }
            
            // Update material settings and apply texture
            Object.assign(objectData.material, materialUpdates);
            this.objectManager.applyMaterialToObject(objectData.sceneObject, objectData.material, texture);
        } else {
            // Regular material update without texture change
            this.objectManager.updateObjectMaterial(this.selectedObjectId, materialUpdates);
        }
        
        // Notify main app
        if (this.onObjectUpdate) {
            this.onObjectUpdate(objectData, 'material');
        }
    }
    
    setupTransformControls() {
        // Position controls
        ['x', 'y', 'z'].forEach(axis => {
            const input = document.getElementById(`pos-${axis}`);
            input.addEventListener('input', (event) => {
                if (this.selectedObjectId) {
                    const value = parseFloat(event.target.value) || 0;
                    this.updateObjectTransform({
                        position: { [axis]: value }
                    });
                }
            });
        });
        
        // Rotation controls
        ['x', 'y', 'z'].forEach(axis => {
            const input = document.getElementById(`rot-${axis}`);
            input.addEventListener('input', (event) => {
                if (this.selectedObjectId) {
                    const value = parseFloat(event.target.value) || 0;
                    this.updateObjectTransform({
                        rotation: { [axis]: value * Math.PI / 180 } // Convert to radians
                    });
                }
            });
        });
        
        // Scale controls
        let scaleLinked = false;
        const uniformScaleCheckbox = document.getElementById('uniform-scale-checkbox');
        
        uniformScaleCheckbox.addEventListener('change', () => {
            scaleLinked = uniformScaleCheckbox.checked;
        });
        
        ['x', 'y', 'z'].forEach(axis => {
            const input = document.getElementById(`scale-${axis}`);
            input.addEventListener('input', (event) => {
                if (this.selectedObjectId) {
                    const value = parseFloat(event.target.value) || 0.1;
                    
                    if (scaleLinked) {
                        // Update all scale axes to the same value
                        ['x', 'y', 'z'].forEach(a => {
                            document.getElementById(`scale-${a}`).value = value;
                        });
                        
                        this.updateObjectTransform({
                            scale: { x: value, y: value, z: value }
                        });
                    } else {
                        this.updateObjectTransform({
                            scale: { [axis]: value }
                        });
                    }
                }
            });
        });
        
        console.log('📐 Transform controls setup complete');
    }
    
    updateTransformControls(objectData) {
        const posInputs = ['x', 'y', 'z'].map(axis => document.getElementById(`pos-${axis}`));
        const rotInputs = ['x', 'y', 'z'].map(axis => document.getElementById(`rot-${axis}`));
        const scaleInputs = ['x', 'y', 'z'].map(axis => document.getElementById(`scale-${axis}`));
        
        if (objectData) {
            // Update position inputs
            posInputs.forEach((input, index) => {
                const axis = ['x', 'y', 'z'][index];
                input.value = objectData.transform.position[axis].toFixed(2);
                input.disabled = false;
            });
            
            // Update rotation inputs (convert from radians to degrees)
            rotInputs.forEach((input, index) => {
                const axis = ['x', 'y', 'z'][index];
                input.value = (objectData.transform.rotation[axis] * 180 / Math.PI).toFixed(1);
                input.disabled = false;
            });
            
            // Update scale inputs
            scaleInputs.forEach((input, index) => {
                const axis = ['x', 'y', 'z'][index];
                input.value = objectData.transform.scale[axis].toFixed(2);
                input.disabled = false;
            });
            
            // Enable transform panel
            document.getElementById('transform-panel').style.opacity = '1';
            document.getElementById('uniform-scale-checkbox').disabled = false;
        } else {
            // Disable all transform controls
            [...posInputs, ...rotInputs, ...scaleInputs].forEach(input => {
                input.disabled = true;
            });
            
            document.getElementById('transform-panel').style.opacity = '0.6';
            document.getElementById('uniform-scale-checkbox').disabled = true;
        }
    }
    
    updateObjectTransform(transformUpdates) {
        if (!this.selectedObjectId) return;
        
        const objectData = this.objectManager.getObject(this.selectedObjectId);
        if (!objectData) return;
        
        // Update the object's transform
        this.objectManager.updateObjectTransform(this.selectedObjectId, transformUpdates);
        
        // Update the UI with the actual values
        if (transformUpdates.position) {
            Object.keys(transformUpdates.position).forEach(axis => {
                objectData.transform.position[axis] = transformUpdates.position[axis];
            });
        }
        
        if (transformUpdates.rotation) {
            Object.keys(transformUpdates.rotation).forEach(axis => {
                objectData.transform.rotation[axis] = transformUpdates.rotation[axis];
            });
        }
        
        if (transformUpdates.scale) {
            Object.keys(transformUpdates.scale).forEach(axis => {
                objectData.transform.scale[axis] = transformUpdates.scale[axis];
            });
        }
        
        // Notify main app
        if (this.onObjectUpdate) {
            this.onObjectUpdate(objectData, 'transform');
        }
    }
    
    setupAnimationControls() {
        // Animation type dropdown
        const animationTypeSelect = document.getElementById('animation-type');
        const animationSpeedSlider = document.getElementById('animation-speed');
        const playBtn = document.getElementById('play-animation-btn');
        const pauseBtn = document.getElementById('pause-animation-btn');
        const speedDisplay = animationSpeedSlider.parentElement.querySelector('.value-display');
        
        // Populate animation types
        if (this.animationController) {
            const types = this.animationController.getAnimationTypes();
            animationTypeSelect.innerHTML = types.map(type => 
                `<option value="${type.value}">${type.label}</option>`
            ).join('');
        }
        
        // Animation type change
        animationTypeSelect.addEventListener('change', (event) => {
            if (this.selectedObjectId) {
                this.updateObjectAnimation({
                    type: event.target.value,
                    speed: parseFloat(animationSpeedSlider.value)
                });
            }
        });
        
        // Speed slider
        animationSpeedSlider.addEventListener('input', (event) => {
            const value = parseFloat(event.target.value);
            speedDisplay.textContent = value.toFixed(3);
            
            if (this.selectedObjectId) {
                this.updateObjectAnimation({
                    type: animationTypeSelect.value,
                    speed: value
                });
            }
        });
        
        // Play/Pause buttons
        playBtn.addEventListener('click', () => {
            if (this.animationController) {
                this.animationController.start();
                playBtn.style.display = 'none';
                pauseBtn.style.display = 'inline-flex';
            }
        });
        
        pauseBtn.addEventListener('click', () => {
            if (this.animationController) {
                this.animationController.stop();
                pauseBtn.style.display = 'none';
                playBtn.style.display = 'inline-flex';
            }
        });
        
        console.log('🎬 Animation controls setup complete');
    }
    
    updateAnimationControls(objectData) {
        const animationTypeSelect = document.getElementById('animation-type');
        const animationSpeedSlider = document.getElementById('animation-speed');
        const speedDisplay = animationSpeedSlider.parentElement.querySelector('.value-display');
        const playBtn = document.getElementById('play-animation-btn');
        const pauseBtn = document.getElementById('pause-animation-btn');
        
        if (objectData) {
            // Update controls with object's animation properties
            animationTypeSelect.value = objectData.animation.type;
            animationSpeedSlider.value = objectData.animation.speed;
            speedDisplay.textContent = objectData.animation.speed.toFixed(3);
            
            // Enable controls
            document.getElementById('animation-panel').style.opacity = '1';
            animationTypeSelect.disabled = false;
            animationSpeedSlider.disabled = false;
            playBtn.disabled = false;
            pauseBtn.disabled = false;
        } else {
            // Disable controls
            document.getElementById('animation-panel').style.opacity = '0.6';
            animationTypeSelect.disabled = true;
            animationSpeedSlider.disabled = true;
            playBtn.disabled = true;
            pauseBtn.disabled = true;
        }
    }
    
    updateObjectAnimation(animationUpdates) {
        if (!this.selectedObjectId) return;
        
        const objectData = this.objectManager.getObject(this.selectedObjectId);
        if (!objectData) return;
        
        // Update the object's animation data
        Object.assign(objectData.animation, animationUpdates);
        this.objectManager.updateObjectAnimation(this.selectedObjectId, animationUpdates);
        
        // Notify animation controller
        if (this.animationController) {
            this.animationController.updateObjectAnimation(objectData);
        }
        
        // Notify main app
        if (this.onObjectUpdate) {
            this.onObjectUpdate(objectData, 'animation');
        }
    }
    
    setupLightingControls() {
        const lightingManager = this.scene.getLightingManager();
        if (!lightingManager) {
            console.warn('No lighting manager available');
            return;
        }
        
        // Preset controls
        const presetSelect = document.getElementById('lighting-preset');
        const applyPresetBtn = document.getElementById('apply-preset-btn');
        
        applyPresetBtn.addEventListener('click', () => {
            const preset = presetSelect.value;
            if (preset) {
                lightingManager.applyLightingPreset(preset);
                this.refreshLightsList();
            }
        });
        
        // Global settings
        const shadowsCheckbox = document.getElementById('shadows-enabled');
        const environmentCheckbox = document.getElementById('environment-mapping');
        
        shadowsCheckbox.addEventListener('change', (e) => {
            lightingManager.setShadowsEnabled(e.target.checked);
        });
        
        environmentCheckbox.addEventListener('change', (e) => {
            // TODO: Implement environment mapping toggle
            console.log('Environment mapping:', e.target.checked);
        });
        
        // Add light controls
        const lightTypeSelect = document.getElementById('light-type');
        const addLightBtn = document.getElementById('add-light-btn');
        
        lightTypeSelect.addEventListener('change', (e) => {
            addLightBtn.disabled = !e.target.value;
        });
        
        addLightBtn.addEventListener('click', () => {
            const lightType = lightTypeSelect.value;
            if (lightType) {
                this.addCustomLight(lightType);
                lightTypeSelect.value = '';
                addLightBtn.disabled = true;
                this.refreshLightsList();
            }
        });
        
        // Initialize lights list
        this.refreshLightsList();
    }
    
    addCustomLight(type) {
        const lightingManager = this.scene.getLightingManager();
        const lightId = `custom-${type}-${Date.now()}`;
        
        // Default configurations for different light types
        const defaultConfigs = {
            ambient: {
                type: 'ambient',
                color: '#ffffff',
                intensity: 0.5
            },
            directional: {
                type: 'directional',
                color: '#ffffff',
                intensity: 1.0,
                position: [10, 10, 10],
                castShadow: true
            },
            point: {
                type: 'point',
                color: '#ffffff',
                intensity: 1.0,
                distance: 50,
                position: [0, 5, 0],
                castShadow: false
            },
            spot: {
                type: 'spot',
                color: '#ffffff',
                intensity: 1.0,
                distance: 50,
                angle: Math.PI / 4,
                penumbra: 0.1,
                position: [0, 10, 0],
                target: [0, 0, 0],
                castShadow: true
            },
            hemisphere: {
                type: 'hemisphere',
                color: '#ffffff',
                groundColor: '#444444',
                intensity: 0.8,
                position: [0, 10, 0]
            },
            rectArea: {
                type: 'rectArea',
                color: '#ffffff',
                intensity: 1.0,
                width: 10,
                height: 10,
                position: [0, 5, 0]
            }
        };
        
        const config = defaultConfigs[type] || defaultConfigs.point;
        lightingManager.addLight(lightId, config);
        
        console.log(`💡 Added custom ${type} light: ${lightId}`);
    }
    
    refreshLightsList() {
        const lightsList = document.getElementById('lights-list');
        const lightingManager = this.scene.getLightingManager();
        
        if (!lightingManager) return;
        
        const lightConfigs = lightingManager.getAllLightConfigs();
        const customLights = Object.entries(lightConfigs).filter(([id]) => id.startsWith('custom-'));
        
        if (customLights.length === 0) {
            lightsList.innerHTML = '<div class="no-lights-message">No custom lights added</div>';
            return;
        }
        
        const lightsHtml = customLights.map(([lightId, config]) => {
            return this.createLightItemHtml(lightId, config);
        }).join('');
        
        lightsList.innerHTML = lightsHtml;
        
        // Add event listeners for light controls
        this.setupLightItemControls();
    }
    
    createLightItemHtml(lightId, config) {
        const shortId = lightId.replace('custom-', '').replace(/-\d+$/, '');
        
        return `
            <div class="light-item" data-light-id="${lightId}" data-light-type="${config.type}">
                <div class="light-header">
                    <div>
                        <div class="light-name">${shortId.charAt(0).toUpperCase() + shortId.slice(1)} Light</div>
                        <div class="light-type">${config.type}</div>
                    </div>
                    <div class="light-controls">
                        <button class="btn btn-sm toggle-light-btn" data-light-id="${lightId}">
                            ${config.visible !== false ? 'Hide' : 'Show'}
                        </button>
                        <button class="btn btn-sm btn-danger remove-light-btn" data-light-id="${lightId}">Remove</button>
                    </div>
                </div>
                
                <div class="light-properties">
                    <div class="light-property">
                        <label>Color</label>
                        <input type="color" class="light-color" data-light-id="${lightId}" value="${config.color || '#ffffff'}">
                    </div>
                    
                    <div class="light-property">
                        <label>Intensity</label>
                        <input type="number" class="light-intensity" data-light-id="${lightId}" 
                               value="${config.intensity}" min="0" max="5" step="0.1">
                    </div>
                    
                    ${config.distance !== undefined ? `
                    <div class="light-property">
                        <label>Distance</label>
                        <input type="number" class="light-distance" data-light-id="${lightId}" 
                               value="${config.distance}" min="0" max="100" step="1">
                    </div>
                    ` : ''}
                    
                    ${config.type === 'spot' ? `
                    <div class="light-property light-property-full">
                        <label>Angle</label>
                        <div class="slider-container">
                            <input type="range" class="light-angle" data-light-id="${lightId}" 
                                   value="${config.angle}" min="0.1" max="${Math.PI/2}" step="0.01">
                            <span class="slider-value">${(config.angle * 180 / Math.PI).toFixed(0)}°</span>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${config.type !== 'ambient' ? `
                    <div class="position-controls">
                        <input type="number" class="light-pos-x" data-light-id="${lightId}" 
                               value="${config.position[0]}" step="0.5" placeholder="X">
                        <input type="number" class="light-pos-y" data-light-id="${lightId}" 
                               value="${config.position[1]}" step="0.5" placeholder="Y">
                        <input type="number" class="light-pos-z" data-light-id="${lightId}" 
                               value="${config.position[2]}" step="0.5" placeholder="Z">
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    setupLightItemControls() {
        const lightingManager = this.scene.getLightingManager();
        
        // Toggle light visibility
        document.querySelectorAll('.toggle-light-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lightId = e.target.dataset.lightId;
                const config = lightingManager.getLightConfig(lightId);
                const newVisibility = config.visible !== false ? false : true;
                
                lightingManager.updateLight(lightId, { visible: newVisibility });
                e.target.textContent = newVisibility ? 'Hide' : 'Show';
            });
        });
        
        // Remove light
        document.querySelectorAll('.remove-light-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lightId = e.target.dataset.lightId;
                lightingManager.removeLight(lightId);
                this.refreshLightsList();
            });
        });
        
        // Update light properties
        this.setupLightPropertyControls();
    }
    
    setupLightPropertyControls() {
        const lightingManager = this.scene.getLightingManager();
        
        // Color changes
        document.querySelectorAll('.light-color').forEach(input => {
            input.addEventListener('change', (e) => {
                const lightId = e.target.dataset.lightId;
                lightingManager.updateLight(lightId, { color: e.target.value });
            });
        });
        
        // Intensity changes
        document.querySelectorAll('.light-intensity').forEach(input => {
            input.addEventListener('input', (e) => {
                const lightId = e.target.dataset.lightId;
                lightingManager.updateLight(lightId, { intensity: parseFloat(e.target.value) });
            });
        });
        
        // Position changes
        document.querySelectorAll('.light-pos-x, .light-pos-y, .light-pos-z').forEach(input => {
            input.addEventListener('input', (e) => {
                const lightId = e.target.dataset.lightId;
                const config = lightingManager.getLightConfig(lightId);
                const position = [...config.position];
                
                if (e.target.classList.contains('light-pos-x')) position[0] = parseFloat(e.target.value);
                if (e.target.classList.contains('light-pos-y')) position[1] = parseFloat(e.target.value);
                if (e.target.classList.contains('light-pos-z')) position[2] = parseFloat(e.target.value);
                
                lightingManager.updateLight(lightId, { position });
            });
        });
        
        // Distance changes
        document.querySelectorAll('.light-distance').forEach(input => {
            input.addEventListener('input', (e) => {
                const lightId = e.target.dataset.lightId;
                lightingManager.updateLight(lightId, { distance: parseFloat(e.target.value) });
            });
        });
        
        // Angle changes (for spot lights)
        document.querySelectorAll('.light-angle').forEach(input => {
            input.addEventListener('input', (e) => {
                const lightId = e.target.dataset.lightId;
                const angleValue = parseFloat(e.target.value);
                
                // Update the light
                lightingManager.updateLight(lightId, { angle: angleValue });
                
                // Update the display value
                const valueDisplay = e.target.parentElement.querySelector('.slider-value');
                if (valueDisplay) {
                    valueDisplay.textContent = `${(angleValue * 180 / Math.PI).toFixed(0)}°`;
                }
            });
        });
    }
    
    setupExportControls() {
        // Export button
        const exportBtn = document.getElementById('export-btn');
        exportBtn.addEventListener('click', () => {
            this.exportScene();
        });
        
        // Modal controls
        const modal = document.getElementById('export-modal');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const copyCodeBtn = document.getElementById('copy-code-btn');
        const downloadCodeBtn = document.getElementById('download-code-btn');
        const codeTextarea = document.getElementById('export-code');
        
        // Close modal
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Copy code to clipboard
        copyCodeBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(codeTextarea.value);
                
                // Visual feedback
                const originalText = copyCodeBtn.textContent;
                copyCodeBtn.textContent = 'Copied! ✓';
                setTimeout(() => {
                    copyCodeBtn.textContent = originalText;
                    modal.style.display = 'none'; // Close modal after feedback
                }, 2000);
                
            } catch (error) {
                // Fallback for older browsers
                codeTextarea.select();
                document.execCommand('copy');
                
                const originalText = copyCodeBtn.textContent;
                copyCodeBtn.textContent = 'Copied! ✓';
                setTimeout(() => {
                    copyCodeBtn.textContent = originalText;
                    modal.style.display = 'none'; // Close modal after feedback
                }, 2000);
            }
        });
        
        // Download code as file
        downloadCodeBtn.addEventListener('click', () => {
            const code = codeTextarea.value;
            const blob = new Blob([code], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'three-scene.js';
            a.click();
            
            URL.revokeObjectURL(url);
            
            // Close modal after download
            modal.style.display = 'none';
        });
        
        // Clear any stuck modals on initialization (temp fix for stuck dialogs)
        modal.style.display = 'none';
        
        // ESC key to close modal
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.style.display === 'flex') {
                modal.style.display = 'none';
            }
        });
        
        console.log('📤 Export controls setup complete');
    }
    
    updateObjectsList() {
        const objectsList = document.getElementById('objects-list');
        const objects = this.objectManager.getAllObjects();
        
        if (objects.length === 0) {
            objectsList.innerHTML = '<p class="no-objects">No objects loaded</p>';
            return;
        }
        
        objectsList.innerHTML = objects.map(obj => `
            <div class="object-item ${obj.id === this.selectedObjectId ? 'selected' : ''}" data-id="${obj.id}">
                <div class="object-info">
                    <div class="object-name">${obj.name}</div>
                    <div class="object-details">${obj.stats.meshes} meshes, ${obj.stats.vertices} vertices</div>
                </div>
                <div class="object-actions">
                    <button class="object-action focus" data-action="focus" data-id="${obj.id}" title="Focus Camera">🎯</button>
                    <button class="object-action delete" data-action="delete" data-id="${obj.id}" title="Delete">🗑️</button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to object items
        objectsList.querySelectorAll('.object-item').forEach(item => {
            item.addEventListener('click', (event) => {
                if (!event.target.classList.contains('object-action')) {
                    const objectId = parseInt(item.dataset.id);
                    this.selectObject(objectId);
                }
            });
        });
        
        // Add event listeners to action buttons
        objectsList.querySelectorAll('.object-action').forEach(btn => {
            btn.addEventListener('click', (event) => {
                event.stopPropagation();
                const action = btn.dataset.action;
                const objectId = parseInt(btn.dataset.id);
                this.handleObjectAction(action, objectId);
            });
        });
    }
    
    selectObject(objectIdOrData) {
        // Handle both objectId (number) and objectData (object) parameters
        let objectId, objectData;
        
        if (typeof objectIdOrData === 'number') {
            // Called with objectId
            objectId = objectIdOrData;
            objectData = this.objectManager.getObject(objectId);
        } else if (objectIdOrData && typeof objectIdOrData === 'object') {
            // Called with objectData
            objectData = objectIdOrData;
            objectId = objectData.id;
        } else {
            console.error('selectObject called with invalid parameter:', objectIdOrData);
            return;
        }
        
        this.selectedObjectId = objectId;
        
        // Update UI
        this.updateObjectsList();
        this.updateMaterialControls(objectData);
        this.updateTransformControls(objectData);
        this.updateAnimationControls(objectData);
        
        // Add object to advanced animation system if not already added
        if (this.advancedAnimationManager && objectData &&
            !this.advancedAnimationManager.keyframes.has(objectData.id.toString())) {
            this.advancedAnimationManager.addObjectToAnimation(objectData.id.toString());
        }
        
        // Update animation info
        this.updateAnimationInfo();
        
        // Notify main app
        if (this.onObjectSelect) {
            this.onObjectSelect(objectData);
        }
        
        console.log('🎯 Object selected:', objectData?.name);
    }
    
    handleObjectAction(action, objectId) {
        const objectData = this.objectManager.getObject(objectId);
        if (!objectData) return;
        
        switch (action) {
            case 'focus':
                this.scene.focusOnObject(objectData.sceneObject);
                break;
            case 'delete':
                if (confirm(`Delete ${objectData.name}?`)) {
                    this.objectManager.removeObject(objectId);
                    
                    // Clear selection if deleted object was selected
                    if (this.selectedObjectId === objectId) {
                        this.selectedObjectId = null;
                        this.updateMaterialControls(null);
                        this.updateTransformControls(null);
                        this.updateAnimationControls(null);
                    }
                    
                    // Update objects list
                    this.updateObjectsList();
                    
                    // Update export button state
                    this.updateExportButtonState();
                }
                break;
        }
    }
    
    updateObjectSelection(objectData) {
        this.selectedObjectId = objectData?.id || null;
        console.log('🎯 Object selection updated:', this.selectedObjectId);
    }
    
    triggerCodeSync() {
        // Trigger auto-sync of code editor when UI changes occur
        if (window.threeLoaderApp && window.threeLoaderApp.codeEditorManager) {
            window.threeLoaderApp.codeEditorManager.syncFromUI();
        }
    }
    
    exportScene() {
        if (this.exportManager) {
            const code = this.exportManager.exportScene();
            this.showExportModal(code);
        }
    }
    
    showExportModal(code) {
        const modal = document.getElementById('export-modal');
        const codeTextarea = document.getElementById('export-code');
        
        codeTextarea.value = code;
        modal.style.display = 'flex';
        
        // Focus and select text
        codeTextarea.focus();
        codeTextarea.select();
    }
    
    /**
     * Update export button state based on scene content
     */
    updateExportButtonState() {
        console.log('🔘 updateExportButtonState() called');
        
        const exportBtn = document.getElementById('export-btn');
        if (!exportBtn) {
            console.error('❌ Export button element not found!');
            return;
        }
        
        console.log('🔘 Export button element found:', exportBtn);
        
        if (!this.objectManager) {
            console.error('❌ ObjectManager not available!');
            return;
        }
        
        const objects = this.objectManager.getAllObjects();
        console.log('🔘 getAllObjects() returned:', objects);
        console.log('🔘 Objects array length:', objects ? objects.length : 'null/undefined');
        console.log('🔘 Objects array contents:', objects);
        
        const hasObjects = objects && objects.length > 0;
        
        exportBtn.disabled = !hasObjects;
        console.log(`🔘 Export button ${hasObjects ? 'ENABLED' : 'DISABLED'} - ${objects ? objects.length : 0} objects`);
        console.log('🔘 Export button disabled property:', exportBtn.disabled);
    }
    
    setupCollapsiblePanels() {
        // Setup collapsible panels for left sidebar
        const panelHeaders = document.querySelectorAll('.collapsible-panel .panel-header');
        
        panelHeaders.forEach(header => {
            const targetId = header.getAttribute('data-target');
            const content = document.getElementById(targetId);
            const arrow = header.querySelector('.collapse-arrow');
            
            if (!content) return;
            
            // Remove existing event listeners to prevent duplicates
            const newHeader = header.cloneNode(true);
            header.parentNode.replaceChild(newHeader, header);
            
            // Get references to the new elements
            const newArrow = newHeader.querySelector('.collapse-arrow');
            
            newHeader.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Toggle the class
                content.classList.toggle('collapsed');
                
                // Update UI based on new state
                const nowCollapsed = content.classList.contains('collapsed');
                newHeader.setAttribute('aria-expanded', nowCollapsed ? 'false' : 'true');
                if (newArrow) {
                    newArrow.style.transform = nowCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)';
                }
                
                console.log(`📋 ${nowCollapsed ? 'Collapsed' : 'Expanded'} panel: ${targetId}`);
            });
            
            // Set initial state (all panels expanded by default)
            newHeader.setAttribute('aria-expanded', 'true');
            content.classList.remove('collapsed');
        });
        
        console.log('📋 Collapsible panels setup complete');
    }
    
    setupAdvancedAnimationControls() {
        // Create timeline panel button in the header
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            const timelineToggleBtn = document.createElement('button');
            timelineToggleBtn.id = 'timeline-toggle-btn';
            timelineToggleBtn.className = 'btn btn-secondary';
            timelineToggleBtn.innerHTML = '🎬 Timeline';
            timelineToggleBtn.title = 'Toggle Animation Timeline';
            
            timelineToggleBtn.addEventListener('click', () => {
                this.toggleTimelinePanel();
            });
            
            headerActions.appendChild(timelineToggleBtn);
        }
        
        // Enhance existing animation panel instead of creating a new one
        this.enhanceExistingAnimationPanel();
        
        // Remove any duplicate advanced animation panels that might have been created
        this.removeDuplicateAdvancedAnimationPanels();
        
        // Also remove from left sidebar if it was added there
        this.cleanupLeftSidebarForSceneObjectsOnly();
        
        console.log('🎬 Advanced animation controls setup complete');
    }
    
    enhanceExistingAnimationPanel() {
        const animationContent = document.getElementById('animation-content');
        if (!animationContent) {
            console.warn('Animation panel not found, cannot enhance');
            return;
        }
        
        console.log('🎬 Enhancing existing animation panel...');
        
        // Add advanced animation mode controls to existing animation panel
        const advancedAnimationHTML = `
            <div class="section-divider"></div>
            <div class="animation-mode-section">
                <h4>Advanced Animation Mode</h4>
                <div class="animation-mode-controls">
                    <label>
                        <input type="radio" name="animation-mode" value="simple" checked> Simple
                    </label>
                    <label>
                        <input type="radio" name="animation-mode" value="keyframe"> Keyframe
                    </label>
                    <label>
                        <input type="radio" name="animation-mode" value="physics"> Physics
                    </label>
                </div>
            </div>
            
            <div class="keyframe-section" style="display: none;">
                <h4>Keyframe Animation</h4>
                <div class="keyframe-controls">
                    <button id="add-keyframe-btn" class="btn btn-small btn-primary" title="Add keyframe at current object state">
                        + Add Keyframe
                    </button>
                    <button id="remove-keyframe-btn" class="btn btn-small btn-secondary" title="Remove selected keyframes">
                        🗑️ Remove
                    </button>
                    <button id="preview-animation-btn" class="btn btn-small btn-outline" title="Preview animation">
                        👁️ Preview
                    </button>
                </div>
                <div class="interpolation-controls">
                    <label>Interpolation:</label>
                    <select id="keyframe-interpolation">
                        <option value="linear">Linear</option>
                        <option value="smooth">Smooth</option>
                        <option value="step">Step</option>
                    </select>
                </div>
            </div>
            
            <div class="physics-section" style="display: none;">
                <h4>Physics Animation</h4>
                <div class="physics-controls">
                    <div class="physics-setting">
                        <label>Body Type:</label>
                        <select id="physics-body-type">
                            <option value="dynamic">Dynamic</option>
                            <option value="static">Static</option>
                            <option value="kinematic">Kinematic</option>
                        </select>
                    </div>
                    <div class="physics-setting">
                        <label>Shape:</label>
                        <select id="physics-shape">
                            <option value="box">Box</option>
                            <option value="sphere">Sphere</option>
                            <option value="cylinder">Cylinder</option>
                            <option value="hull">Convex Hull</option>
                        </select>
                    </div>
                    <button id="add-physics-body-btn" class="btn btn-small btn-primary">
                        ⚡ Add Physics
                    </button>
                </div>
            </div>
            
            <div class="animation-info">
                <small id="animation-status">Ready for animation</small>
            </div>
        `;
        
        // Append to existing animation content
        animationContent.insertAdjacentHTML('beforeend', advancedAnimationHTML);
        this.setupAdvancedAnimationEventListeners();
    }
    
    removeDuplicateAdvancedAnimationPanels() {
        // Remove any existing advanced animation panels from the sidebar
        const existingAdvancedPanels = document.querySelectorAll('#advanced-animation-panel');
        existingAdvancedPanels.forEach(panel => {
            panel.remove();
            console.log('🗑️ Removed duplicate advanced animation panel');
        });
    }
    
    cleanupLeftSidebarForSceneObjectsOnly() {
        // Ensure left sidebar only contains scene-related panels
        // Remove any animation-related panels from left sidebar
        const leftSidebar = document.querySelector('.sidebar-left');
        if (leftSidebar) {
            const animationPanelsInLeftSidebar = leftSidebar.querySelectorAll('[id*="advanced-animation"], [id*="timeline"]');
            animationPanelsInLeftSidebar.forEach(panel => {
                if (panel.id !== 'timeline-toggle-btn') { // Keep the timeline button in header
                    panel.remove();
                    console.log('🗑️ Removed animation panel from left sidebar:', panel.id);
                }
            });
        }
    }
    
    setupAdvancedAnimationEventListeners() {
        // Animation mode selection
        const modeInputs = document.querySelectorAll('input[name="animation-mode"]');
        modeInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.switchAnimationMode(e.target.value);
            });
        });
        
        // Keyframe controls
        document.getElementById('add-keyframe-btn')?.addEventListener('click', () => {
            this.addKeyframeForSelectedObject();
        });
        
        document.getElementById('remove-keyframe-btn')?.addEventListener('click', () => {
            this.removeSelectedKeyframes();
        });
        
        document.getElementById('preview-animation-btn')?.addEventListener('click', () => {
            this.previewAnimation();
        });
        
        document.getElementById('keyframe-interpolation')?.addEventListener('change', (e) => {
            this.updateSelectedKeyframesInterpolation(e.target.value);
        });
        
        // Physics controls
        document.getElementById('add-physics-body-btn')?.addEventListener('click', () => {
            this.addPhysicsBodyToSelectedObject();
        });
        
        document.getElementById('remove-physics-body-btn')?.addEventListener('click', () => {
            this.removePhysicsBodyFromSelectedObject();
        });
        
        // Animation data management
        document.getElementById('export-animation-btn')?.addEventListener('click', () => {
            this.exportAnimationData();
        });
        
        document.getElementById('import-animation-btn')?.addEventListener('click', () => {
            document.getElementById('animation-file-input').click();
        });
        
        document.getElementById('animation-file-input')?.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.importAnimationData(e.target.files[0]);
            }
        });
    }
    
    switchAnimationMode(mode) {
        const keyframeSection = document.querySelector('.keyframe-section');
        const physicsSection = document.querySelector('.physics-section');
        const currentModeDisplay = document.getElementById('animation-current-mode');
        
        // Hide all sections
        keyframeSection.style.display = 'none';
        physicsSection.style.display = 'none';
        
        // Show relevant section
        switch (mode) {
            case 'keyframe':
                keyframeSection.style.display = 'block';
                currentModeDisplay.textContent = 'Keyframe';
                break;
            case 'physics':
                physicsSection.style.display = 'block';
                currentModeDisplay.textContent = 'Physics';
                break;
            default:
                currentModeDisplay.textContent = 'Simple';
        }
        
        console.log(`Animation mode switched to: ${mode}`);
    }
    
    toggleTimelinePanel() {
        if (this.timelinePanel) {
            // Dispose existing timeline panel
            this.timelinePanel.dispose();
            this.timelinePanel = null;
            
            const toggleBtn = document.getElementById('timeline-toggle-btn');
            toggleBtn.textContent = '🎬 Timeline';
            toggleBtn.classList.remove('active');
        } else {
            // Create new timeline panel
            this.timelinePanel = new TimelinePanel(this.advancedAnimationManager);
            
            const toggleBtn = document.getElementById('timeline-toggle-btn');
            toggleBtn.textContent = '🎬 Hide Timeline';
            toggleBtn.classList.add('active');
        }
    }
    
    addKeyframeForSelectedObject() {
        if (!this.selectedObjectId) {
            alert('Please select an object first');
            return;
        }
        
        const object = this.objectManager.getObjectById(this.selectedObjectId);
        if (!object || !object.children[0]) return;
        
        const mesh = object.children[0];
        const currentTime = this.advancedAnimationManager.currentTime;
        
        // Capture current object state
        const properties = {
            position: mesh.position.toArray(),
            rotation: mesh.rotation.toArray(),
            scale: mesh.scale.toArray()
        };
        
        const keyframeId = this.advancedAnimationManager.addKeyframe(
            this.selectedObjectId.toString(),
            currentTime,
            properties
        );
        
        this.updateAnimationInfo();
        
        console.log(`Keyframe added for object ${this.selectedObjectId} at time ${currentTime}`);
    }
    
    removeSelectedKeyframes() {
        if (this.timelinePanel) {
            this.timelinePanel.removeSelectedKeyframes();
            this.updateAnimationInfo();
        }
    }
    
    previewAnimation() {
        if (this.advancedAnimationManager.isPlaying) {
            this.advancedAnimationManager.pause();
        } else {
            this.advancedAnimationManager.play();
        }
        
        // Update timeline if open
        if (this.timelinePanel) {
            const playBtn = document.getElementById('timeline-play');
            if (playBtn) {
                playBtn.textContent = this.advancedAnimationManager.isPlaying ? '⏸️' : '▶️';
            }
        }
    }
    
    updateSelectedKeyframesInterpolation(interpolation) {
        if (this.timelinePanel) {
            this.timelinePanel.updateSelectedKeyframesInterpolation(interpolation);
        }
    }
    
    addPhysicsBodyToSelectedObject() {
        if (!this.selectedObjectId) {
            alert('Please select an object first');
            return;
        }
        
        const bodyType = document.getElementById('physics-body-type').value;
        const shape = document.getElementById('physics-shape').value;
        
        this.advancedAnimationManager.addPhysicsBody(
            this.selectedObjectId.toString(),
            bodyType,
            shape
        );
        
        console.log(`Physics body added to object ${this.selectedObjectId}: ${bodyType} ${shape}`);
    }
    
    removePhysicsBodyFromSelectedObject() {
        if (!this.selectedObjectId) return;
        
        this.advancedAnimationManager.removePhysicsBody(this.selectedObjectId.toString());
        console.log(`Physics body removed from object ${this.selectedObjectId}`);
    }
    
    exportAnimationData() {
        const data = this.advancedAnimationManager.exportAnimationData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'animation_data.json';
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('Animation data exported');
    }
    
    async importAnimationData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            this.advancedAnimationManager.importAnimationData(data);
            this.updateAnimationInfo();
            
            console.log('Animation data imported');
        } catch (error) {
            console.error('Failed to import animation data:', error);
            alert('Failed to import animation data: ' + error.message);
        }
    }
    
    updateAnimationInfo() {
        const info = this.advancedAnimationManager.getAnimationInfo();
        
        const durationDisplay = document.getElementById('animation-duration-display');
        const keyframeCountDisplay = document.getElementById('animation-keyframe-count');
        
        if (durationDisplay) {
            durationDisplay.textContent = info.duration.toFixed(1) + 's';
        }
        
        if (keyframeCountDisplay) {
            keyframeCountDisplay.textContent = info.totalKeyframes.toString();
        }
    }
    
    // Override the render method to update advanced animation
    update() {
        // Update advanced animation system
        if (this.advancedAnimationManager) {
            this.advancedAnimationManager.update();
        }
        
        // Update timeline panel if active
        if (this.timelinePanel && this.advancedAnimationManager.isPlaying) {
            this.updateAnimationInfo();
        }
    }
    
}