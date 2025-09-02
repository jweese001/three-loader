export class UIController {
    constructor(config) {
        this.scene = config.scene;
        this.objectManager = config.objectManager;
        this.exportManager = config.exportManager;
        this.animationController = config.animationController;
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
        this.setupViewportControls();
        this.setupCameraControls();
        this.setupMaterialControls();
        this.setupTransformControls();
        this.setupAnimationControls();
        this.setupExportControls();
        this.setupUIToggle();
        this.setupCollapsiblePanels();
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
                
                // Select the new object
                this.selectObject(objectData.id);
                
                // Enable export button
                const exportBtn = document.getElementById('export-btn');
                if (exportBtn) exportBtn.disabled = false;
                
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
                
                // Disable export button
                document.getElementById('export-btn').disabled = true;
                
                // Show viewport info again
                const viewportInfo = document.getElementById('viewport-info');
                if (viewportInfo) viewportInfo.style.display = 'block';
            }
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
        const colorInput = document.getElementById('material-color');
        const wireframeInput = document.getElementById('material-wireframe');
        const opacityInput = document.getElementById('material-opacity');
        const roughnessInput = document.getElementById('material-roughness');
        const metalnessInput = document.getElementById('material-metalness');
        
        // Get value display elements
        const opacityDisplay = opacityInput.parentElement.querySelector('.value-display');
        const roughnessDisplay = roughnessInput.parentElement.querySelector('.value-display');
        const metalnessDisplay = metalnessInput.parentElement.querySelector('.value-display');
        
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
            colorInput.value = objectData.material.color;
            wireframeInput.checked = objectData.material.wireframe;
            opacityInput.value = objectData.material.opacity;
            roughnessInput.value = objectData.material.roughness;
            metalnessInput.value = objectData.material.metalness;
            
            // Update displays
            opacityDisplay.textContent = objectData.material.opacity.toFixed(2);
            roughnessDisplay.textContent = objectData.material.roughness.toFixed(2);
            metalnessDisplay.textContent = objectData.material.metalness.toFixed(2);
            
            // Enable controls
            document.getElementById('material-panel').style.opacity = '1';
            [colorInput, wireframeInput, opacityInput, roughnessInput, metalnessInput].forEach(input => {
                input.disabled = false;
            });
        } else {
            // Disable controls
            document.getElementById('material-panel').style.opacity = '0.6';
            [colorInput, wireframeInput, opacityInput, roughnessInput, metalnessInput].forEach(input => {
                input.disabled = true;
            });
        }
    }
    
    updateObjectMaterial(materialUpdates) {
        if (!this.selectedObjectId) return;
        
        const objectData = this.objectManager.getObject(this.selectedObjectId);
        if (!objectData) return;
        
        // Update the object's material
        this.objectManager.updateObjectMaterial(this.selectedObjectId, materialUpdates);
        
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
                }, 2000);
                
            } catch (error) {
                // Fallback for older browsers
                codeTextarea.select();
                document.execCommand('copy');
                
                const originalText = copyCodeBtn.textContent;
                copyCodeBtn.textContent = 'Copied! ✓';
                setTimeout(() => {
                    copyCodeBtn.textContent = originalText;
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
        });
        
        // ESC key to close modal
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.style.display === 'flex') {
                modal.style.display = 'none';
            }
        });
        
        console.log('📤 Export controls setup complete');
    }
    
    setupUIToggle() {
        console.log('🎮 Setting up UI toggle...');
        
        const toggleUIBtn = document.getElementById('toggle-ui-btn');
        const appContainer = document.querySelector('.app-container');
        
        console.log('🔍 Toggle button found:', !!toggleUIBtn);
        console.log('🔍 App container found:', !!appContainer);
        console.log('🔍 Initial DOM check:', {
            leftSidebar: !!document.querySelector('.sidebar-left'),
            rightSidebar: !!document.querySelector('.sidebar-right'),
            leftSidebarClasses: document.querySelector('.sidebar-left')?.className,
            rightSidebarClasses: document.querySelector('.sidebar-right')?.className
        });
        
        if (!toggleUIBtn) {
            console.error('❌ Toggle UI button not found - DOM may not be ready');
            console.log('🔍 All buttons in DOM:', Array.from(document.querySelectorAll('button')).map(btn => btn.id || btn.textContent));
            return;
        }
        
        if (!appContainer) {
            console.error('❌ App container not found');
            console.log('🔍 Available containers:', Array.from(document.querySelectorAll('.app*')).map(el => el.className));
            return;
        }
        
        let isUIHidden = false;
        
        const toggleUI = () => {
            isUIHidden = !isUIHidden;
            console.log(`🔄 CSS-ONLY Toggle UI: ${isUIHidden ? 'HIDE' : 'SHOW'}`);
            
            if (isUIHidden) {
                console.log('🙈 HIDING UI - CSS handles everything');
                appContainer.classList.add('ui-hidden');
                toggleUIBtn.innerHTML = 'Show UI';
                toggleUIBtn.title = 'Show UI (H)';
                
            } else {
                console.log('👁️ SHOWING UI - CSS handles everything');
                appContainer.classList.remove('ui-hidden');
                toggleUIBtn.innerHTML = 'Hide UI';
                toggleUIBtn.title = 'Hide UI (H)';
            }
            
            // Trigger scene resize after CSS changes take effect
            setTimeout(() => {
                if (this.scene && this.scene.handleResize) {
                    this.scene.handleResize();
                    console.log('✅ Scene resized after UI toggle');
                }
            }, 100);
        };
        
        toggleUIBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            console.log('🖱️ Toggle button clicked - EVENT FIRED!');
            
            // Debug current state
            console.log('🔍 Before toggle - Current state:', {
                isUIHidden: isUIHidden,
                appContainerClasses: appContainer.className,
                leftSidebarExists: !!document.querySelector('.sidebar-left'),
                rightSidebarExists: !!document.querySelector('.sidebar-right'),
                leftSidebarDisplay: document.querySelector('.sidebar-left')?.style.display,
                rightSidebarDisplay: document.querySelector('.sidebar-right')?.style.display
            });
            
            toggleUI();
            
            // Debug after toggle
            setTimeout(() => {
                console.log('🔍 After toggle - New state:', {
                    isUIHidden: isUIHidden,
                    appContainerClasses: appContainer.className,
                    leftSidebarDisplay: document.querySelector('.sidebar-left')?.style.display,
                    rightSidebarDisplay: document.querySelector('.sidebar-right')?.style.display,
                    leftSidebarComputedDisplay: window.getComputedStyle(document.querySelector('.sidebar-left')).display,
                    rightSidebarComputedDisplay: window.getComputedStyle(document.querySelector('.sidebar-right')).display
                });
            }, 100);
        });
        
        // Keyboard shortcut: Press 'H' to toggle UI
        document.addEventListener('keydown', (event) => {
            if (event.key.toLowerCase() === 'h' && !event.ctrlKey && !event.metaKey && !event.altKey) {
                // Only trigger if not in an input field
                if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) {
                    console.log('⌨️ H key pressed - toggling UI');
                    toggleUI();
                    event.preventDefault();
                }
            }
        });
        
        console.log('👁️ UI toggle setup complete (Button + H key)');
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
    
    selectObject(objectId) {
        this.selectedObjectId = objectId;
        const objectData = this.objectManager.getObject(objectId);
        
        // Update UI
        this.updateObjectsList();
        this.updateMaterialControls(objectData);
        this.updateTransformControls(objectData);
        this.updateAnimationControls(objectData);
        
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
                    
                    // Disable export if no objects left
                    if (this.objectManager.getAllObjects().length === 0) {
                        document.getElementById('export-btn').disabled = true;
                    }
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
}