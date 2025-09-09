import * as THREE from 'three';
import * as monaco from 'monaco-editor';

/**
 * ShaderManager - Handles shader editing, compilation, and uniform management
 * Part of Phase 2: Complete Material System with ShaderMaterial Support
 */
export class ShaderManager {
    constructor() {
        this.vertexEditor = null;
        this.fragmentEditor = null;
        this.currentMaterial = null;
        this.uniforms = new Map();
        this.isShaderPanelVisible = false;
        
        // Default shaders
        this.defaultVertexShader = `
uniform float time;
varying vec2 vUv;

void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Simple wave animation
    pos.z += sin(pos.x * 5.0 + time) * 0.1;
    pos.z += sin(pos.y * 5.0 + time * 1.5) * 0.1;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`;

        this.defaultFragmentShader = `
uniform float time;
uniform vec2 resolution;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    
    // Animated color pattern
    float r = sin(time + uv.x * 10.0) * 0.5 + 0.5;
    float g = sin(time + uv.y * 10.0 + 2.0) * 0.5 + 0.5;
    float b = sin(time + (uv.x + uv.y) * 5.0 + 4.0) * 0.5 + 0.5;
    
    gl_FragColor = vec4(r, g, b, 1.0);
}`;
        
        console.log('🎨 ShaderManager initialized');
    }
    
    /**
     * Initialize shader editors with Monaco
     */
    initializeEditors() {
        const vertexContainer = document.getElementById('vertex-shader-editor');
        const fragmentContainer = document.getElementById('fragment-shader-editor');
        
        if (!vertexContainer || !fragmentContainer) {
            console.warn('Shader editor containers not found');
            return false;
        }
        
        // Configure GLSL language support
        monaco.languages.register({ id: 'glsl' });
        monaco.languages.setMonarchTokensProvider('glsl', this.getGLSLTokenProvider());
        
        // Create vertex shader editor
        this.vertexEditor = monaco.editor.create(vertexContainer, {
            value: this.defaultVertexShader.trim(),
            language: 'glsl',
            theme: 'vs-dark',
            fontSize: 12,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true
        });
        
        // Create fragment shader editor
        this.fragmentEditor = monaco.editor.create(fragmentContainer, {
            value: this.defaultFragmentShader.trim(),
            language: 'glsl',
            theme: 'vs-dark',
            fontSize: 12,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true
        });
        
        // Add event listeners
        this.vertexEditor.onDidChangeModelContent(() => {
            this.onShaderChange();
        });
        
        this.fragmentEditor.onDidChangeModelContent(() => {
            this.onShaderChange();
        });
        
        console.log('✅ Shader editors initialized');
        return true;
    }
    
    /**
     * Show/hide shader panel based on material type
     */
    toggleShaderPanel(show) {
        const shaderPanel = document.getElementById('shader-panel');
        if (!shaderPanel) return;
        
        this.isShaderPanelVisible = show;
        
        if (show) {
            shaderPanel.style.display = 'block';
            document.body.classList.add('shader-material-selected');
            
            // Initialize editors if not already done
            if (!this.vertexEditor || !this.fragmentEditor) {
                setTimeout(() => this.initializeEditors(), 100);
            }
        } else {
            shaderPanel.style.display = 'none';
            document.body.classList.remove('shader-material-selected');
        }
    }
    
    /**
     * Set current shader material to edit
     */
    setCurrentMaterial(material) {
        if (!(material instanceof THREE.ShaderMaterial)) {
            console.warn('Material is not a ShaderMaterial');
            return;
        }
        
        this.currentMaterial = material;
        
        // Load existing shaders into editors
        if (this.vertexEditor && this.fragmentEditor) {
            this.vertexEditor.setValue(material.vertexShader || this.defaultVertexShader);
            this.fragmentEditor.setValue(material.fragmentShader || this.defaultFragmentShader);
        }
        
        // Update uniforms display
        this.updateUniformsDisplay(material.uniforms);
        
        console.log('🎯 Current shader material set');
    }
    
    /**
     * Compile and apply current shaders
     */
    compileShaders() {
        if (!this.currentMaterial || !this.vertexEditor || !this.fragmentEditor) {
            console.warn('No material or editors available for compilation');
            return false;
        }
        
        const vertexShader = this.vertexEditor.getValue();
        const fragmentShader = this.fragmentEditor.getValue();
        
        try {
            // Update material shaders
            this.currentMaterial.vertexShader = vertexShader;
            this.currentMaterial.fragmentShader = fragmentShader;
            this.currentMaterial.needsUpdate = true;
            
            console.log('✅ Shaders compiled successfully');
            this.showCompileStatus('success', 'Shaders compiled successfully!');
            return true;
            
        } catch (error) {
            console.error('❌ Shader compilation failed:', error);
            this.showCompileStatus('error', `Compilation failed: ${error.message}`);
            return false;
        }
    }
    
    /**
     * Reset shaders to default
     */
    resetToDefault() {
        if (this.vertexEditor) {
            this.vertexEditor.setValue(this.defaultVertexShader.trim());
        }
        if (this.fragmentEditor) {
            this.fragmentEditor.setValue(this.defaultFragmentShader.trim());
        }
        
        if (this.currentMaterial) {
            this.currentMaterial.vertexShader = this.defaultVertexShader;
            this.currentMaterial.fragmentShader = this.defaultFragmentShader;
            this.currentMaterial.needsUpdate = true;
        }
        
        console.log('🔄 Shaders reset to default');
    }
    
    /**
     * Update uniform values
     */
    updateUniform(uniformName, value) {
        if (!this.currentMaterial || !this.currentMaterial.uniforms[uniformName]) {
            console.warn(`Uniform ${uniformName} not found`);
            return;
        }
        
        // Handle different uniform types
        if (uniformName === 'resolution.x') {
            this.currentMaterial.uniforms.resolution.value.x = parseFloat(value);
        } else if (uniformName === 'resolution.y') {
            this.currentMaterial.uniforms.resolution.value.y = parseFloat(value);
        } else {
            this.currentMaterial.uniforms[uniformName].value = parseFloat(value);
        }
        
        this.currentMaterial.needsUpdate = true;
    }
    
    /**
     * Add new uniform
     */
    addUniform(name, type, defaultValue) {
        if (!this.currentMaterial) return;
        
        const uniformsContainer = document.getElementById('uniforms-container');
        if (!uniformsContainer) return;
        
        // Create uniform control element
        const uniformControl = document.createElement('div');
        uniformControl.className = 'uniform-control';
        uniformControl.innerHTML = `
            <label>
                <span>${name} (${type})</span>
                <input type="number" step="0.01" value="${defaultValue}" data-uniform="${name}">
                <button class="remove-uniform-btn" data-uniform="${name}">×</button>
            </label>
        `;
        
        // Insert before the "Add Uniform" button
        const addButton = document.getElementById('add-uniform-btn');
        uniformsContainer.insertBefore(uniformControl, addButton);
        
        // Add to material uniforms
        this.currentMaterial.uniforms[name] = { value: defaultValue };
        
        // Add event listeners
        const input = uniformControl.querySelector('input');
        const removeBtn = uniformControl.querySelector('.remove-uniform-btn');
        
        input.addEventListener('input', (e) => {
            this.updateUniform(name, e.target.value);
        });
        
        removeBtn.addEventListener('click', () => {
            this.removeUniform(name, uniformControl);
        });
    }
    
    /**
     * Remove uniform
     */
    removeUniform(name, controlElement) {
        if (this.currentMaterial && this.currentMaterial.uniforms[name]) {
            delete this.currentMaterial.uniforms[name];
            this.currentMaterial.needsUpdate = true;
        }
        
        controlElement.remove();
    }
    
    /**
     * Update uniforms display
     */
    updateUniformsDisplay(uniforms) {
        const container = document.getElementById('uniforms-container');
        if (!container) return;
        
        // Clear existing uniform controls (except built-in ones and add button)
        const dynamicControls = container.querySelectorAll('.uniform-control:not([data-builtin])');
        dynamicControls.forEach(control => {
            if (control.id !== 'add-uniform-btn') {
                control.remove();
            }
        });
        
        // Add controls for current uniforms
        Object.keys(uniforms).forEach(key => {
            if (!['time', 'resolution'].includes(key)) {
                const value = uniforms[key].value;
                this.addUniform(key, typeof value, value);
            }
        });
    }
    
    /**
     * Handle shader change events
     */
    onShaderChange() {
        // Debounced compilation could be added here
        // For now, require manual compilation
    }
    
    /**
     * Show compilation status
     */
    showCompileStatus(type, message) {
        // Create or update status indicator
        let statusEl = document.getElementById('shader-compile-status');
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.id = 'shader-compile-status';
            statusEl.className = 'compile-status';
            
            const compileBtn = document.getElementById('compile-shader-btn');
            if (compileBtn) {
                compileBtn.parentNode.insertBefore(statusEl, compileBtn.nextSibling);
            }
        }
        
        statusEl.className = `compile-status ${type}`;
        statusEl.textContent = message;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (statusEl.parentNode) {
                statusEl.remove();
            }
        }, 3000);
    }
    
    /**
     * Get GLSL language token provider for Monaco
     */
    getGLSLTokenProvider() {
        return {
            keywords: [
                'attribute', 'const', 'uniform', 'varying', 'layout', 'centroid', 'flat', 'smooth',
                'break', 'continue', 'do', 'for', 'while', 'switch', 'case', 'default',
                'if', 'else', 'return', 'discard',
                'void', 'bool', 'int', 'uint', 'float', 'double',
                'vec2', 'vec3', 'vec4', 'dvec2', 'dvec3', 'dvec4',
                'bvec2', 'bvec3', 'bvec4', 'ivec2', 'ivec3', 'ivec4',
                'uvec2', 'uvec3', 'uvec4', 'mat2', 'mat3', 'mat4',
                'mat2x2', 'mat2x3', 'mat2x4', 'mat3x2', 'mat3x3', 'mat3x4',
                'mat4x2', 'mat4x3', 'mat4x4', 'dmat2', 'dmat3', 'dmat4',
                'sampler1D', 'sampler2D', 'sampler3D', 'samplerCube',
                'samplerBuffer', 'sampler2DRect', 'samplerCubeArray',
                'precision', 'lowp', 'mediump', 'highp'
            ],
            
            builtins: [
                'gl_Position', 'gl_FragColor', 'gl_FragCoord', 'gl_FrontFacing',
                'gl_PointCoord', 'gl_PointSize', 'gl_Vertex', 'gl_Normal',
                'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'pow', 'exp', 'log',
                'sqrt', 'abs', 'sign', 'floor', 'ceil', 'fract', 'mod', 'min', 'max',
                'clamp', 'mix', 'step', 'smoothstep', 'length', 'distance', 'dot',
                'cross', 'normalize', 'reflect', 'refract', 'texture2D', 'textureCube'
            ],
            
            tokenizer: {
                root: [
                    [/[a-zA-Z_]\w*/, {
                        cases: {
                            '@keywords': 'keyword',
                            '@builtins': 'builtin',
                            '@default': 'identifier'
                        }
                    }],
                    [/\/\/.*$/, 'comment'],
                    [/\/\*.*?\*\//, 'comment'],
                    [/"([^"\\\\]|\\\\.)*$/, 'string.invalid'],
                    [/"/, 'string', '@string'],
                    [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
                    [/\d+/, 'number']
                ],
                
                string: [
                    [/[^\\\\"]+/, 'string'],
                    [/"/, 'string', '@pop']
                ]
            }
        };
    }
    
    /**
     * Initialize event handlers
     */
    initializeEventHandlers() {
        const compileBtn = document.getElementById('compile-shader-btn');
        const resetBtn = document.getElementById('reset-shader-btn');
        const addUniformBtn = document.getElementById('add-uniform-btn');
        
        if (compileBtn) {
            compileBtn.addEventListener('click', () => this.compileShaders());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetToDefault());
        }
        
        if (addUniformBtn) {
            addUniformBtn.addEventListener('click', () => {
                const name = prompt('Uniform name:');
                const defaultValue = parseFloat(prompt('Default value:', '0.0') || '0.0');
                if (name) {
                    this.addUniform(name, 'float', defaultValue);
                }
            });
        }
        
        // Uniform input handlers
        document.addEventListener('input', (e) => {
            if (e.target.dataset.uniform) {
                this.updateUniform(e.target.dataset.uniform, e.target.value);
            }
        });
    }
    
    /**
     * Animate shader uniforms (call this in animation loop)
     */
    updateAnimation(deltaTime) {
        if (this.currentMaterial && this.currentMaterial.uniforms.time) {
            this.currentMaterial.uniforms.time.value += deltaTime * 0.001; // Convert to seconds
        }
    }
    
    /**
     * Cleanup
     */
    destroy() {
        if (this.vertexEditor) {
            this.vertexEditor.dispose();
            this.vertexEditor = null;
        }
        
        if (this.fragmentEditor) {
            this.fragmentEditor.dispose();
            this.fragmentEditor = null;
        }
        
        this.currentMaterial = null;
        this.uniforms.clear();
        
        console.log('🧹 ShaderManager destroyed');
    }
}