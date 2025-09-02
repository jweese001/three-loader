import * as THREE from 'three';

export class TextureManager {
    constructor() {
        this.textureLoader = new THREE.TextureLoader();
        this.loadedTextures = new Map();
        this.textureCache = new Map();
        
        // Base path to cosmic textures
        this.basePath = '/cosmic-texture-browser/public/512/webp/';
        
        console.log('🖼️ TextureManager initialized');
    }
    
    // Get available texture variants for a category
    async getTextureVariants(category) {
        if (category === 'none') return [];
        
        try {
            // For now, we'll use a predefined list of numbers
            // In a real implementation, you might fetch this from a directory listing API
            const variants = [];
            for (let i = 1; i <= 50; i++) {
                const paddedNum = i.toString().padStart(2, '0');
                variants.push(paddedNum);
            }
            return variants;
        } catch (error) {
            console.warn(`⚠️ Could not load variants for category: ${category}`);
            return [];
        }
    }
    
    // Load a texture from the cosmic texture browser
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