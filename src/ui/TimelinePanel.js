export class TimelinePanel {
    constructor(animationManager) {
        this.animationManager = animationManager;
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        this.isInitialized = false;
        
        // Timeline properties
        this.pixelsPerSecond = 100; // Zoom level
        this.timelineHeight = 300;
        this.headerHeight = 40;
        this.trackHeight = 60;
        this.keyframeRadius = 6;
        this.playheadColor = '#ff4444';
        this.keyframeColor = '#4CAF50';
        this.selectedKeyframeColor = '#FFC107';
        this.gridColor = '#333333';
        this.textColor = '#ffffff';
        this.backgroundColor = '#1a1a1a';
        
        // Interaction state
        this.isDragging = false;
        this.dragTarget = null;
        this.dragOffset = { x: 0, y: 0 };
        this.selectedKeyframes = new Set();
        this.viewportOffset = 0; // Horizontal scroll offset
        this.zoom = 1.0;
        this.playheadPosition = 0;
        
        // Animation frame
        this.animationFrame = null;
        
        this.init();
    }
    
    init() {
        this.createTimelinePanel();
        this.setupEventListeners();
        this.startAnimationLoop();
        this.isInitialized = true;
        console.log('✅ Timeline Panel initialized');
    }
    
    createTimelinePanel() {
        // Find the sidebar or create timeline container
        let sidebar = document.querySelector('.sidebar-right');
        
        if (!sidebar) {
            // Create sidebar if it doesn't exist
            sidebar = document.createElement('div');
            sidebar.className = 'sidebar sidebar-right';
            sidebar.style.width = '400px';
            document.querySelector('.app-main').appendChild(sidebar);
        }
        
        // Create timeline panel
        this.container = document.createElement('div');
        this.container.id = 'timeline-panel';
        this.container.className = 'panel';
        this.container.style.height = `${this.timelineHeight + 100}px`;
        
        this.container.innerHTML = `
            <div class="panel-header">
                <h3>🎬 Animation Timeline</h3>
                <div class="timeline-controls">
                    <button id="timeline-play" class="btn btn-small timeline-btn" title="Play/Pause">▶️</button>
                    <button id="timeline-stop" class="btn btn-small timeline-btn" title="Stop">⏹️</button>
                    <button id="timeline-beginning" class="btn btn-small timeline-btn" title="Go to Beginning">⏪</button>
                    <button id="timeline-end" class="btn btn-small timeline-btn" title="Go to End">⏩</button>
                </div>
            </div>
            
            <div class="timeline-settings">
                <div class="timeline-setting">
                    <label>Duration (s):</label>
                    <input type="number" id="timeline-duration" min="1" max="60" step="0.1" value="10">
                </div>
                <div class="timeline-setting">
                    <label>Speed:</label>
                    <input type="range" id="timeline-speed" min="0.1" max="3" step="0.1" value="1">
                    <span id="timeline-speed-value">1.0x</span>
                </div>
                <div class="timeline-setting">
                    <label>
                        <input type="checkbox" id="timeline-loop" checked> Loop
                    </label>
                </div>
            </div>
            
            <div class="timeline-info">
                <div class="timeline-time">
                    Time: <span id="timeline-current-time">0.00</span>s / <span id="timeline-total-time">10.00</span>s
                </div>
                <div class="timeline-zoom-controls">
                    <button id="timeline-zoom-out" class="btn btn-small">-</button>
                    <span id="timeline-zoom-level">100%</span>
                    <button id="timeline-zoom-in" class="btn btn-small">+</button>
                </div>
            </div>
            
            <div class="timeline-canvas-container" style="height: ${this.timelineHeight}px; overflow: hidden; position: relative; background: ${this.backgroundColor};">
                <canvas id="timeline-canvas" style="cursor: crosshair;"></canvas>
            </div>
            
            <div class="timeline-object-controls">
                <button id="add-keyframe" class="btn btn-small btn-primary" title="Add Keyframe at Current Time">+ Add Keyframe</button>
                <button id="remove-keyframe" class="btn btn-small btn-secondary" title="Remove Selected Keyframes">🗑️ Remove</button>
                <select id="interpolation-mode" title="Keyframe Interpolation">
                    <option value="linear">Linear</option>
                    <option value="smooth">Smooth</option>
                    <option value="step">Step</option>
                </select>
            </div>
        `;
        
        sidebar.appendChild(this.container);
        
        // Initialize canvas
        this.canvas = document.getElementById('timeline-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = this.timelineHeight * window.devicePixelRatio;
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = this.timelineHeight + 'px';
        
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        // Redraw after resize
        this.draw();
    }
    
    setupEventListeners() {
        // Playback controls
        document.getElementById('timeline-play').addEventListener('click', () => {
            if (this.animationManager.isPlaying) {
                this.animationManager.pause();
                document.getElementById('timeline-play').textContent = '▶️';
            } else {
                this.animationManager.play();
                document.getElementById('timeline-play').textContent = '⏸️';
            }
        });
        
        document.getElementById('timeline-stop').addEventListener('click', () => {
            this.animationManager.stop();
            document.getElementById('timeline-play').textContent = '▶️';
            this.playheadPosition = 0;
            this.draw();
        });
        
        document.getElementById('timeline-beginning').addEventListener('click', () => {
            this.animationManager.setTime(0);
            this.playheadPosition = 0;
            this.draw();
        });
        
        document.getElementById('timeline-end').addEventListener('click', () => {
            this.animationManager.setTime(this.animationManager.duration);
            this.playheadPosition = this.animationManager.duration;
            this.draw();
        });
        
        // Settings controls
        document.getElementById('timeline-duration').addEventListener('input', (e) => {
            const duration = parseFloat(e.target.value);
            this.animationManager.setDuration(duration);
            document.getElementById('timeline-total-time').textContent = duration.toFixed(2);
            this.draw();
        });
        
        document.getElementById('timeline-speed').addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            this.animationManager.setSpeed(speed);
            document.getElementById('timeline-speed-value').textContent = speed.toFixed(1) + 'x';
        });
        
        document.getElementById('timeline-loop').addEventListener('change', (e) => {
            this.animationManager.loop = e.target.checked;
        });
        
        // Zoom controls
        document.getElementById('timeline-zoom-in').addEventListener('click', () => {
            this.zoom = Math.min(this.zoom * 1.5, 10);
            this.updateZoomLevel();
            this.draw();
        });
        
        document.getElementById('timeline-zoom-out').addEventListener('click', () => {
            this.zoom = Math.max(this.zoom / 1.5, 0.1);
            this.updateZoomLevel();
            this.draw();
        });
        
        // Keyframe controls
        document.getElementById('add-keyframe').addEventListener('click', () => {
            this.addKeyframeAtCurrentTime();
        });
        
        document.getElementById('remove-keyframe').addEventListener('click', () => {
            this.removeSelectedKeyframes();
        });
        
        document.getElementById('interpolation-mode').addEventListener('change', (e) => {
            this.updateSelectedKeyframesInterpolation(e.target.value);
        });
        
        // Canvas interaction
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('click', this.onClick.bind(this));
        this.canvas.addEventListener('dblclick', this.onDoubleClick.bind(this));
        this.canvas.addEventListener('wheel', this.onWheel.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('#timeline-panel')) {
                this.onKeyDown(e);
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }
    
    startAnimationLoop() {
        const animate = () => {
            if (this.animationManager.isPlaying) {
                this.playheadPosition = this.animationManager.currentTime;
                this.updateTimeDisplay();
            }
            this.draw();
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }
    
    updateTimeDisplay() {
        const currentElement = document.getElementById('timeline-current-time');
        if (currentElement) {
            currentElement.textContent = this.animationManager.currentTime.toFixed(2);
        }
    }
    
    updateZoomLevel() {
        this.pixelsPerSecond = 100 * this.zoom;
        document.getElementById('timeline-zoom-level').textContent = Math.round(this.zoom * 100) + '%';
    }
    
    // === DRAWING METHODS ===
    
    draw() {
        if (!this.ctx) return;
        
        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;
        
        // Clear canvas
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, width, height);
        
        // Draw grid and time markers
        this.drawGrid(width, height);
        
        // Draw object tracks
        this.drawObjectTracks(width, height);
        
        // Draw keyframes
        this.drawKeyframes(width, height);
        
        // Draw playhead
        this.drawPlayhead(width, height);
    }
    
    drawGrid(width, height) {
        this.ctx.strokeStyle = this.gridColor;
        this.ctx.lineWidth = 1;
        this.ctx.font = '12px Inter, sans-serif';
        this.ctx.fillStyle = this.textColor;
        
        const duration = this.animationManager.duration;
        const pixelsPerSecond = this.pixelsPerSecond;
        
        // Calculate time step based on zoom
        let timeStep = 1; // 1 second default
        if (this.zoom > 2) timeStep = 0.5;
        if (this.zoom > 5) timeStep = 0.1;
        if (this.zoom < 0.5) timeStep = 5;
        if (this.zoom < 0.2) timeStep = 10;
        
        // Draw vertical grid lines and time labels
        for (let time = 0; time <= duration; time += timeStep) {
            const x = time * pixelsPerSecond - this.viewportOffset;
            
            if (x >= 0 && x <= width) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, this.headerHeight);
                this.ctx.lineTo(x, height);
                this.ctx.stroke();
                
                // Time label
                this.ctx.fillText(time.toFixed(1) + 's', x + 2, this.headerHeight - 5);
            }
        }
        
        // Draw horizontal lines for tracks
        const objects = this.getAnimatedObjects();
        objects.forEach((objectId, index) => {
            const y = this.headerHeight + (index + 1) * this.trackHeight;
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        });
    }
    
    drawObjectTracks(width, height) {
        const objects = this.getAnimatedObjects();
        
        this.ctx.font = '14px Inter, sans-serif';
        this.ctx.fillStyle = this.textColor;
        
        objects.forEach((objectId, index) => {
            const y = this.headerHeight + index * this.trackHeight + this.trackHeight / 2;
            
            // Get object name
            const object = this.animationManager.scene.getObjectById(parseInt(objectId));
            const objectName = object ? (object.name || `Object ${objectId}`) : `Object ${objectId}`;
            
            // Draw object label
            this.ctx.fillText(objectName, 10, y + 5);
            
            // Draw track background
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            this.ctx.fillRect(0, this.headerHeight + index * this.trackHeight, width, this.trackHeight);
            this.ctx.fillStyle = this.textColor;
        });
    }
    
    drawKeyframes(width, height) {
        const objects = this.getAnimatedObjects();
        
        objects.forEach((objectId, index) => {
            const keyframes = this.animationManager.keyframes.get(objectId) || [];
            const trackY = this.headerHeight + index * this.trackHeight + this.trackHeight / 2;
            
            keyframes.forEach(keyframe => {
                const x = keyframe.time * this.pixelsPerSecond - this.viewportOffset;
                
                if (x >= -this.keyframeRadius && x <= width + this.keyframeRadius) {
                    // Check if keyframe is selected
                    const isSelected = this.selectedKeyframes.has(keyframe.id);
                    
                    this.ctx.fillStyle = isSelected ? this.selectedKeyframeColor : this.keyframeColor;
                    this.ctx.strokeStyle = isSelected ? '#ffffff' : this.keyframeColor;
                    this.ctx.lineWidth = 2;
                    
                    // Draw keyframe diamond
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, trackY - this.keyframeRadius);
                    this.ctx.lineTo(x + this.keyframeRadius, trackY);
                    this.ctx.lineTo(x, trackY + this.keyframeRadius);
                    this.ctx.lineTo(x - this.keyframeRadius, trackY);
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.stroke();
                    
                    // Draw interpolation indicator
                    if (keyframe.interpolation === 'step') {
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.fillRect(x - 2, trackY - 2, 4, 4);
                    } else if (keyframe.interpolation === 'smooth') {
                        this.ctx.strokeStyle = '#ffffff';
                        this.ctx.lineWidth = 1;
                        this.ctx.beginPath();
                        this.ctx.arc(x, trackY, 3, 0, Math.PI * 2);
                        this.ctx.stroke();
                    }
                }
            });
        });
    }
    
    drawPlayhead(width, height) {
        const x = this.playheadPosition * this.pixelsPerSecond - this.viewportOffset;
        
        if (x >= 0 && x <= width) {
            this.ctx.strokeStyle = this.playheadColor;
            this.ctx.lineWidth = 2;
            
            // Draw playhead line
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
            
            // Draw playhead handle
            this.ctx.fillStyle = this.playheadColor;
            this.ctx.beginPath();
            this.ctx.moveTo(x - 8, 0);
            this.ctx.lineTo(x + 8, 0);
            this.ctx.lineTo(x, 16);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }
    
    // === INTERACTION METHODS ===
    
    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check for keyframe hit
        const keyframe = this.getKeyframeAt(x, y);
        if (keyframe) {
            this.isDragging = true;
            this.dragTarget = keyframe;
            this.dragOffset.x = x - (keyframe.keyframe.time * this.pixelsPerSecond - this.viewportOffset);
            
            // Select keyframe
            if (!e.shiftKey) {
                this.selectedKeyframes.clear();
            }
            this.selectedKeyframes.add(keyframe.keyframe.id);
            
            this.draw();
            return;
        }
        
        // Check for playhead hit
        const playheadX = this.playheadPosition * this.pixelsPerSecond - this.viewportOffset;
        if (Math.abs(x - playheadX) < 10 && y < this.headerHeight) {
            this.isDragging = true;
            this.dragTarget = 'playhead';
            this.draw();
            return;
        }
    }
    
    onMouseMove(e) {
        if (!this.isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        
        if (this.dragTarget === 'playhead') {
            // Move playhead
            const time = (x + this.viewportOffset) / this.pixelsPerSecond;
            this.playheadPosition = Math.max(0, Math.min(time, this.animationManager.duration));
            this.animationManager.setTime(this.playheadPosition);
            this.draw();
        } else if (this.dragTarget && this.dragTarget.keyframe) {
            // Move keyframe
            const time = (x - this.dragOffset.x + this.viewportOffset) / this.pixelsPerSecond;
            const clampedTime = Math.max(0, Math.min(time, this.animationManager.duration));
            
            this.animationManager.updateKeyframe(
                this.dragTarget.objectId,
                this.dragTarget.keyframe.id,
                { time: clampedTime }
            );
            
            this.draw();
        }
    }
    
    onMouseUp(e) {
        this.isDragging = false;
        this.dragTarget = null;
        this.dragOffset = { x: 0, y: 0 };
    }
    
    onClick(e) {
        if (this.isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check for keyframe selection
        const keyframe = this.getKeyframeAt(x, y);
        if (keyframe) {
            if (e.shiftKey) {
                // Toggle selection
                if (this.selectedKeyframes.has(keyframe.keyframe.id)) {
                    this.selectedKeyframes.delete(keyframe.keyframe.id);
                } else {
                    this.selectedKeyframes.add(keyframe.keyframe.id);
                }
            } else {
                // Single selection
                this.selectedKeyframes.clear();
                this.selectedKeyframes.add(keyframe.keyframe.id);
            }
            
            this.draw();
            return;
        }
        
        // Clear selection if clicking empty area
        if (!e.shiftKey) {
            this.selectedKeyframes.clear();
            this.draw();
        }
    }
    
    onDoubleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Add keyframe at double-click position
        const time = (x + this.viewportOffset) / this.pixelsPerSecond;
        const trackIndex = Math.floor((y - this.headerHeight) / this.trackHeight);
        const objects = this.getAnimatedObjects();
        
        if (trackIndex >= 0 && trackIndex < objects.length) {
            const objectId = objects[trackIndex];
            this.addKeyframeForObject(objectId, time);
        }
    }
    
    onWheel(e) {
        e.preventDefault();
        
        if (e.ctrlKey || e.metaKey) {
            // Zoom
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoom = Math.max(0.1, Math.min(this.zoom * zoomFactor, 10));
            this.updateZoomLevel();
        } else {
            // Horizontal scroll
            this.viewportOffset += e.deltaY;
            this.viewportOffset = Math.max(0, this.viewportOffset);
        }
        
        this.draw();
    }
    
    onKeyDown(e) {
        switch (e.key) {
            case 'Delete':
            case 'Backspace':
                this.removeSelectedKeyframes();
                break;
            case 'a':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.selectAllKeyframes();
                }
                break;
            case ' ':
                e.preventDefault();
                document.getElementById('timeline-play').click();
                break;
        }
    }
    
    // === UTILITY METHODS ===
    
    getAnimatedObjects() {
        return Array.from(this.animationManager.keyframes.keys()).sort();
    }
    
    getKeyframeAt(x, y) {
        const objects = this.getAnimatedObjects();
        
        for (let i = 0; i < objects.length; i++) {
            const objectId = objects[i];
            const trackY = this.headerHeight + i * this.trackHeight + this.trackHeight / 2;
            
            if (Math.abs(y - trackY) < this.keyframeRadius + 5) {
                const keyframes = this.animationManager.keyframes.get(objectId) || [];
                
                for (const keyframe of keyframes) {
                    const keyframeX = keyframe.time * this.pixelsPerSecond - this.viewportOffset;
                    
                    if (Math.abs(x - keyframeX) < this.keyframeRadius + 2) {
                        return { objectId, keyframe };
                    }
                }
            }
        }
        
        return null;
    }
    
    addKeyframeAtCurrentTime() {
        // Get selected object from main UI
        const selectedObject = this.getSelectedObject();
        if (!selectedObject) {
            alert('Please select an object first');
            return;
        }
        
        this.addKeyframeForObject(selectedObject.id.toString(), this.playheadPosition);
    }
    
    addKeyframeForObject(objectId, time) {
        const object = this.animationManager.scene.getObjectById(parseInt(objectId));
        if (!object) return;
        
        // Capture current object state
        const properties = {
            position: object.position.toArray(),
            rotation: object.rotation.toArray(),
            scale: object.scale.toArray()
        };
        
        this.animationManager.addKeyframe(objectId, time, properties);
        this.draw();
        
        console.log(`Keyframe added for object ${objectId} at time ${time}`);
    }
    
    removeSelectedKeyframes() {
        this.selectedKeyframes.forEach(keyframeId => {
            // Find which object this keyframe belongs to
            for (const [objectId, keyframes] of this.animationManager.keyframes.entries()) {
                const keyframe = keyframes.find(kf => kf.id === keyframeId);
                if (keyframe) {
                    this.animationManager.removeKeyframe(objectId, keyframeId);
                    break;
                }
            }
        });
        
        this.selectedKeyframes.clear();
        this.draw();
    }
    
    selectAllKeyframes() {
        this.selectedKeyframes.clear();
        
        for (const keyframes of this.animationManager.keyframes.values()) {
            keyframes.forEach(keyframe => {
                this.selectedKeyframes.add(keyframe.id);
            });
        }
        
        this.draw();
    }
    
    updateSelectedKeyframesInterpolation(interpolation) {
        this.selectedKeyframes.forEach(keyframeId => {
            for (const [objectId, keyframes] of this.animationManager.keyframes.entries()) {
                const keyframe = keyframes.find(kf => kf.id === keyframeId);
                if (keyframe) {
                    this.animationManager.updateKeyframe(objectId, keyframeId, { interpolation });
                    break;
                }
            }
        });
        
        this.draw();
    }
    
    getSelectedObject() {
        // This should interface with the main application's object selection
        // For now, return the first object with keyframes
        const objects = this.getAnimatedObjects();
        if (objects.length > 0) {
            const objectId = objects[0];
            return this.animationManager.scene.getObjectById(parseInt(objectId));
        }
        return null;
    }
    
    dispose() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        if (this.container) {
            this.container.remove();
        }
        
        console.log('Timeline Panel disposed');
    }
}