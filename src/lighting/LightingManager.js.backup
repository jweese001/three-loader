import * as THREE from 'three';

/**
 * LightingManager - Advanced lighting and environment system management
 * Part of Phase 2.3: Advanced Lighting and Environment Systems
 */
export class LightingManager {
    constructor(scene) {
        this.scene = scene;
        this.lights = new Map(); // Map of lightId -> light object
        this.lightIdCounter = 0;
        this.environmentMap = null;
        this.shadowsEnabled = true;
        
        // Default lighting setup
        this.defaultLightingConfig = {
            ambientLight: {
                enabled: true,
                color: '#404040',
                intensity: 0.4
            },
            directionalLight: {
                enabled: true,
                color: '#ffffff',
                intensity: 1.0,
                position: [20, 20, 20],
                castShadow: true
            },
            environmentMapping: {
                enabled: false,
                type: 'none' // 'hdr', 'cube', 'none'
            }
        };
        
        console.log('💡 LightingManager initialized');
    }
    
    /**
     * Initialize default lighting setup
     */
    initializeDefaultLighting() {
        console.log('🔆 Setting up default lighting...');
        
        // Clear existing lights
        this.clearAllLights();
        
        // Add default ambient light
        this.addLight('ambient', {
            type: 'ambient',
            color: this.defaultLightingConfig.ambientLight.color,
            intensity: this.defaultLightingConfig.ambientLight.intensity
        });
        
        // Add default directional light
        this.addLight('directional-main', {
            type: 'directional',
            color: this.defaultLightingConfig.directionalLight.color,
            intensity: this.defaultLightingConfig.directionalLight.intensity,
            position: this.defaultLightingConfig.directionalLight.position,
            castShadow: this.defaultLightingConfig.directionalLight.castShadow
        });
        
        // Add fill light
        this.addLight('directional-fill', {
            type: 'directional',
            color: '#9dd9d9',
            intensity: 0.3,
            position: [-10, -10, -10],
            castShadow: false
        });
        
        // Add accent point lights
        this.addLight('point-accent1', {
            type: 'point',
            color: '#9dd9d9',
            intensity: 0.8,
            distance: 50,
            position: [10, 10, 10]
        });
        
        this.addLight('point-accent2', {
            type: 'point',
            color: '#ffffff',
            intensity: 0.6,
            distance: 30,
            position: [-10, -10, 5]
        });
        
        console.log('✅ Default lighting setup complete');
    }
    
    /**
     * Add a light to the scene
     */
    addLight(lightId, config) {
        const light = this.createLight(config);
        if (!light) {
            console.error('❌ Failed to create light with config:', config);
            return null;
        }
        
        // Remove existing light with same ID
        this.removeLight(lightId);
        
        // Add to scene
        this.scene.add(light);
        
        // Store light reference
        this.lights.set(lightId, {
            light,
            config: { ...config },
            id: lightId
        });
        
        console.log(`💡 Added light: ${lightId} (${config.type})`);
        return light;
    }
    
    /**
     * Create a Three.js light from configuration
     */
    createLight(config) {
        const { type, color = '#ffffff', intensity = 1.0, position = [0, 0, 0] } = config;
        let light;
        
        switch (type) {
            case 'ambient':
                light = new THREE.AmbientLight(color, intensity);
                break;
                
            case 'directional':
                light = new THREE.DirectionalLight(color, intensity);
                light.position.set(...position);
                
                if (config.castShadow && this.shadowsEnabled) {
                    light.castShadow = true;
                    this.configureShadows(light, config.shadowConfig);
                }
                
                if (config.target) {
                    light.target.position.set(...config.target);
                }
                break;
                
            case 'point':
                light = new THREE.PointLight(
                    color, 
                    intensity, 
                    config.distance || 0, 
                    config.decay || 2
                );
                light.position.set(...position);
                
                if (config.castShadow && this.shadowsEnabled) {
                    light.castShadow = true;
                    this.configureShadows(light, config.shadowConfig);
                }
                break;
                
            case 'spot':
                light = new THREE.SpotLight(
                    color,
                    intensity,
                    config.distance || 0,
                    config.angle || Math.PI / 3,
                    config.penumbra || 0,
                    config.decay || 2
                );
                light.position.set(...position);
                
                if (config.target) {
                    light.target.position.set(...config.target);
                }
                
                if (config.castShadow && this.shadowsEnabled) {
                    light.castShadow = true;
                    this.configureShadows(light, config.shadowConfig);
                }
                break;
                
            case 'hemisphere':
                light = new THREE.HemisphereLight(
                    color,
                    config.groundColor || '#000000',
                    intensity
                );
                light.position.set(...position);
                break;
                
            case 'rectArea':
                light = new THREE.RectAreaLight(
                    color,
                    intensity,
                    config.width || 10,
                    config.height || 10
                );
                light.position.set(...position);
                
                if (config.target) {
                    light.lookAt(...config.target);
                }
                break;
                
            default:
                console.error(`Unknown light type: ${type}`);
                return null;
        }
        
        // Apply common properties
        if (config.visible !== undefined) {
            light.visible = config.visible;
        }
        
        if (config.userData) {
            light.userData = { ...config.userData };
        }
        
        return light;
    }
    
    /**
     * Configure shadow properties for a light
     */
    configureShadows(light, shadowConfig = {}) {
        if (!light.shadow) return;
        
        const {
            mapSize = 2048,
            near = 0.5,
            far = 100,
            left = -20,
            right = 20,
            top = 20,
            bottom = -20,
            bias = -0.0001
        } = shadowConfig;
        
        // Configure shadow map size
        light.shadow.mapSize.width = mapSize;
        light.shadow.mapSize.height = mapSize;
        
        // Configure shadow camera
        if (light.shadow.camera.isOrthographicCamera) {
            light.shadow.camera.left = left;
            light.shadow.camera.right = right;
            light.shadow.camera.top = top;
            light.shadow.camera.bottom = bottom;
        }
        
        light.shadow.camera.near = near;
        light.shadow.camera.far = far;
        light.shadow.bias = bias;
    }
    
    /**
     * Remove a light from the scene
     */
    removeLight(lightId) {
        const lightData = this.lights.get(lightId);
        if (lightData) {
            this.scene.remove(lightData.light);
            
            // Dispose of shadow map if exists
            if (lightData.light.shadow && lightData.light.shadow.map) {
                lightData.light.shadow.map.dispose();
            }
            
            this.lights.delete(lightId);
            console.log(`🗑️ Removed light: ${lightId}`);
        }
    }
    
    /**
     * Update light properties
     */
    updateLight(lightId, updates) {
        const lightData = this.lights.get(lightId);
        if (!lightData) {
            console.warn(`Light ${lightId} not found`);
            return;
        }
        
        const { light, config } = lightData;
        
        // Update basic properties
        if (updates.color !== undefined) {
            light.color.setStyle(updates.color);
            config.color = updates.color;
        }
        
        if (updates.intensity !== undefined) {
            light.intensity = updates.intensity;
            config.intensity = updates.intensity;
        }
        
        if (updates.position !== undefined) {
            light.position.set(...updates.position);
            config.position = updates.position;
        }
        
        if (updates.visible !== undefined) {
            light.visible = updates.visible;
            config.visible = updates.visible;
        }
        
        // Type-specific updates
        if (light.isPointLight || light.isSpotLight) {
            if (updates.distance !== undefined) {
                light.distance = updates.distance;
                config.distance = updates.distance;
            }
            
            if (updates.decay !== undefined) {
                light.decay = updates.decay;
                config.decay = updates.decay;
            }
        }
        
        if (light.isSpotLight) {
            if (updates.angle !== undefined) {
                light.angle = updates.angle;
                config.angle = updates.angle;
            }
            
            if (updates.penumbra !== undefined) {
                light.penumbra = updates.penumbra;
                config.penumbra = updates.penumbra;
            }
        }
        
        if (light.isHemisphereLight && updates.groundColor !== undefined) {
            light.groundColor.setStyle(updates.groundColor);
            config.groundColor = updates.groundColor;
        }
        
        if (light.isRectAreaLight) {
            if (updates.width !== undefined) {
                light.width = updates.width;
                config.width = updates.width;
            }
            
            if (updates.height !== undefined) {
                light.height = updates.height;
                config.height = updates.height;
            }
        }
        
        console.log(`🔧 Updated light: ${lightId}`);
    }
    
    /**
     * Clear all lights
     */
    clearAllLights() {
        for (const [lightId] of this.lights) {
            this.removeLight(lightId);
        }
        console.log('🧹 All lights cleared');
    }
    
    /**
     * Get light configuration by ID
     */
    getLightConfig(lightId) {
        const lightData = this.lights.get(lightId);
        return lightData ? lightData.config : null;
    }
    
    /**
     * Get all light configurations
     */
    getAllLightConfigs() {
        const configs = {};
        for (const [lightId, lightData] of this.lights) {
            configs[lightId] = lightData.config;
        }
        return configs;
    }
    
    /**
     * Set environment mapping
     */
    setEnvironmentMap(textureOrPath, type = 'hdr') {
        // This would integrate with a texture loader
        // For now, implement basic environment mapping setup
        if (typeof textureOrPath === 'string') {
            console.log(`📷 Loading environment map: ${textureOrPath}`);
            // TODO: Load HDR/EXR environment map
        } else if (textureOrPath instanceof THREE.Texture) {
            this.environmentMap = textureOrPath;
            this.scene.environment = textureOrPath;
            this.scene.background = textureOrPath;
            console.log('🌍 Environment map applied');
        }
    }
    
    /**
     * Enable/disable shadows globally
     */
    setShadowsEnabled(enabled) {
        this.shadowsEnabled = enabled;
        
        // Update all existing lights
        for (const [lightId, lightData] of this.lights) {
            const { light, config } = lightData;
            if (config.castShadow !== undefined) {
                light.castShadow = enabled && config.castShadow;
            }
        }
        
        console.log(`${enabled ? '🌚' : '☀️'} Shadows ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Create preset lighting setups
     */
    applyLightingPreset(presetName) {
        console.log(`🎨 Applying lighting preset: ${presetName}`);
        
        this.clearAllLights();
        
        switch (presetName) {
            case 'studio':
                this.addLight('key-light', {
                    type: 'directional',
                    color: '#ffffff',
                    intensity: 1.2,
                    position: [10, 10, 5],
                    castShadow: true
                });
                
                this.addLight('fill-light', {
                    type: 'directional',
                    color: '#cce7ff',
                    intensity: 0.8,
                    position: [-5, 5, 2]
                });
                
                this.addLight('rim-light', {
                    type: 'directional',
                    color: '#fff2cc',
                    intensity: 0.5,
                    position: [0, -10, -5]
                });
                
                this.addLight('ambient', {
                    type: 'ambient',
                    color: '#404040',
                    intensity: 0.3
                });
                break;
                
            case 'outdoor':
                this.addLight('sun', {
                    type: 'directional',
                    color: '#fff5e6',
                    intensity: 2.0,
                    position: [20, 30, 10],
                    castShadow: true
                });
                
                this.addLight('sky', {
                    type: 'hemisphere',
                    color: '#87ceeb',
                    groundColor: '#362f21',
                    intensity: 0.5
                });
                break;
                
            case 'night':
                this.addLight('moon', {
                    type: 'directional',
                    color: '#b3ccff',
                    intensity: 0.3,
                    position: [-20, 20, -10],
                    castShadow: true
                });
                
                this.addLight('street-light', {
                    type: 'point',
                    color: '#ffcc99',
                    intensity: 1.5,
                    distance: 25,
                    position: [5, 8, 5]
                });
                
                this.addLight('ambient-night', {
                    type: 'ambient',
                    color: '#1a1a2e',
                    intensity: 0.1
                });
                break;
                
            case 'warm':
                this.addLight('warm-key', {
                    type: 'point',
                    color: '#ffcc80',
                    intensity: 1.5,
                    distance: 30,
                    position: [8, 8, 8],
                    castShadow: true
                });
                
                this.addLight('warm-fill', {
                    type: 'point',
                    color: '#ff8a65',
                    intensity: 0.8,
                    distance: 20,
                    position: [-5, 5, -5]
                });
                
                this.addLight('warm-ambient', {
                    type: 'ambient',
                    color: '#4a3c28',
                    intensity: 0.4
                });
                break;
                
            case 'cool':
                this.addLight('cool-key', {
                    type: 'directional',
                    color: '#80d8ff',
                    intensity: 1.0,
                    position: [15, 15, 10],
                    castShadow: true
                });
                
                this.addLight('cool-fill', {
                    type: 'directional',
                    color: '#b39ddb',
                    intensity: 0.6,
                    position: [-10, 10, -5]
                });
                
                this.addLight('cool-ambient', {
                    type: 'ambient',
                    color: '#263238',
                    intensity: 0.3
                });
                break;
                
            case 'default':
            default:
                this.initializeDefaultLighting();
                break;
        }
    }
    
    /**
     * Generate lighting code for export
     */
    generateLightingCode(includeComments = true) {
        const lines = [];
        
        if (includeComments) {
            lines.push('// ═══════════════════════════════════════════════════════════════');
            lines.push('// LIGHTING SETUP');
            lines.push('// ═══════════════════════════════════════════════════════════════');
            lines.push('');
        }
        
        for (const [lightId, lightData] of this.lights) {
            const { config } = lightData;
            lines.push(this.generateLightCode(lightId, config, includeComments));
            lines.push('');
        }
        
        if (this.shadowsEnabled && includeComments) {
            lines.push('// Enable shadows in renderer');
            lines.push('renderer.shadowMap.enabled = true;');
            lines.push('renderer.shadowMap.type = THREE.PCFSoftShadowMap;');
            lines.push('');
        }
        
        return lines.join('\n');
    }
    
    /**
     * Generate code for individual light
     */
    generateLightCode(lightId, config, includeComments = true) {
        const lines = [];
        const varName = lightId.replace(/-/g, '_');
        
        if (includeComments) {
            lines.push(`// ${lightId} (${config.type})`);
        }
        
        switch (config.type) {
            case 'ambient':
                lines.push(`const ${varName} = new THREE.AmbientLight('${config.color}', ${config.intensity});`);
                break;
                
            case 'directional':
                lines.push(`const ${varName} = new THREE.DirectionalLight('${config.color}', ${config.intensity});`);
                lines.push(`${varName}.position.set(${config.position.join(', ')});`);
                
                if (config.castShadow) {
                    lines.push(`${varName}.castShadow = true;`);
                    lines.push(`${varName}.shadow.mapSize.setScalar(2048);`);
                    lines.push(`${varName}.shadow.camera.near = 0.5;`);
                    lines.push(`${varName}.shadow.camera.far = 100;`);
                    lines.push(`${varName}.shadow.camera.left = ${varName}.shadow.camera.bottom = -20;`);
                    lines.push(`${varName}.shadow.camera.right = ${varName}.shadow.camera.top = 20;`);
                }
                break;
                
            case 'point':
                lines.push(`const ${varName} = new THREE.PointLight('${config.color}', ${config.intensity}, ${config.distance || 0}, ${config.decay || 2});`);
                lines.push(`${varName}.position.set(${config.position.join(', ')});`);
                
                if (config.castShadow) {
                    lines.push(`${varName}.castShadow = true;`);
                    lines.push(`${varName}.shadow.mapSize.setScalar(1024);`);
                }
                break;
                
            case 'spot':
                lines.push(`const ${varName} = new THREE.SpotLight('${config.color}', ${config.intensity}, ${config.distance || 0}, ${config.angle || Math.PI/3}, ${config.penumbra || 0}, ${config.decay || 2});`);
                lines.push(`${varName}.position.set(${config.position.join(', ')});`);
                
                if (config.target) {
                    lines.push(`${varName}.target.position.set(${config.target.join(', ')});`);
                }
                
                if (config.castShadow) {
                    lines.push(`${varName}.castShadow = true;`);
                    lines.push(`${varName}.shadow.mapSize.setScalar(1024);`);
                }
                break;
                
            case 'hemisphere':
                lines.push(`const ${varName} = new THREE.HemisphereLight('${config.color}', '${config.groundColor || '#000000'}', ${config.intensity});`);
                lines.push(`${varName}.position.set(${config.position.join(', ')});`);
                break;
                
            case 'rectArea':
                lines.push(`const ${varName} = new THREE.RectAreaLight('${config.color}', ${config.intensity}, ${config.width || 10}, ${config.height || 10});`);
                lines.push(`${varName}.position.set(${config.position.join(', ')});`);
                
                if (config.target) {
                    lines.push(`${varName}.lookAt(${config.target.join(', ')});`);
                }
                break;
        }
        
        lines.push(`scene.add(${varName});`);
        
        return lines.join('\n');
    }
    
    /**
     * Cleanup resources
     */
    destroy() {
        this.clearAllLights();
        
        if (this.environmentMap) {
            this.environmentMap.dispose();
            this.environmentMap = null;
        }
        
        console.log('🧹 LightingManager destroyed');
    }
}