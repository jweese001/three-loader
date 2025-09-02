import * as THREE from 'three';

export class TextureManager {
    constructor() {
        this.textureLoader = new THREE.TextureLoader();
        this.loadedTextures = new Map();
        this.textureCache = new Map();
        
        // Base path to cosmic textures
        this.basePath = '/512/webp/';
        
        console.log('🖼️ TextureManager initialized');
    }
    
    // Load texture from File object (for file browser)
    async loadTextureFromFile(file) {
        if (!file) return null;
        
        const textureKey = `file_${file.name}_${file.lastModified}`;
        
        // Check cache first
        if (this.textureCache.has(textureKey)) {
            return this.textureCache.get(textureKey);
        }
        
        try {
            // Create object URL for the file
            const objectURL = URL.createObjectURL(file);
            
            const texture = await new Promise((resolve, reject) => {
                this.textureLoader.load(
                    objectURL,
                    (loadedTexture) => {
                        // Clean up object URL after loading
                        URL.revokeObjectURL(objectURL);
                        resolve(loadedTexture);
                    },
                    undefined,
                    (error) => {
                        URL.revokeObjectURL(objectURL);
                        reject(error);
                    }
                );
            });
            
            // Configure texture settings
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.generateMipmaps = true;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            
            // Cache the texture
            this.textureCache.set(textureKey, texture);
            
            console.log(`✅ Texture loaded from file: ${file.name}`);
            return texture;
            
        } catch (error) {
            console.error(`❌ Failed to load texture from file: ${file.name}`, error);
            return null;
        }
    }
    
    // Legacy method - kept for backward compatibility
    async loadTexture(category, variant) {
        if (category === 'none') return null;
        
        const textureKey = `${category}_${variant}`;
        
        // Check cache first
        if (this.textureCache.has(textureKey)) {
            return this.textureCache.get(textureKey);
        }
        
        const texturePath = `${this.basePath}${category}/${variant}.webp`;
        
        try {
            const texture = await new Promise((resolve, reject) => {
                this.textureLoader.load(
                    texturePath,
                    resolve,
                    undefined,
                    reject
                );
            });
            
            // Configure texture settings
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.generateMipmaps = true;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            
            // Cache the texture
            this.textureCache.set(textureKey, texture);
            
            console.log(`✅ Texture loaded: ${textureKey}`);
            return texture;
            
        } catch (error) {
            console.error(`❌ Failed to load texture: ${texturePath}`, error);
            return null;
        }
    }
    
    // Apply texture to material settings
    applyTextureToMaterial(material, texture) {
        if (!texture) {
            // Remove texture
            material.map = null;
            material.needsUpdate = true;
            return;
        }
        
        // Apply texture as diffuse map
        material.map = texture;
        material.needsUpdate = true;
        
        console.log('🎨 Texture applied to material');
    }
    
    // Clear texture cache
    clearCache() {
        this.textureCache.forEach(texture => {
            texture.dispose();
        });
        this.textureCache.clear();
        console.log('🧹 Texture cache cleared');
    }
    
    // Dispose of specific texture
    disposeTexture(category, variant) {
        const textureKey = `${category}_${variant}`;
        const texture = this.textureCache.get(textureKey);
        if (texture) {
            texture.dispose();
            this.textureCache.delete(textureKey);
            console.log(`🗑️ Texture disposed: ${textureKey}`);
        }
    }
}