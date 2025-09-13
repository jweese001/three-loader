/**
 * AssetCollector - Asset detection and file management for project export
 * Handles finding, validating, and organizing all referenced assets
 * Part of Export Folder System Implementation - September 12, 2025
 */

export class AssetCollector {
    constructor() {
        this.basePath = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
        
        console.log('🗂️ AssetCollector initialized with base path:', this.basePath);
    }

    /**
     * Collect all assets referenced by scene objects
     * @param {Array} objects - Scene objects to analyze
     * @param {Object} sceneData - Scene configuration data
     * @returns {Object} Complete asset inventory
     */
    async collectAssets(objects, sceneData) {
        console.log('🔍 Starting asset collection for', objects.length, 'objects...');
        
        const assetInventory = {
            models: new Map(),
            textures: new Map(),
            libraries: new Set(['three.min.js', 'OrbitControls.js']),
            metadata: {
                totalSize: 0,
                fileCount: 0,
                hasOBJFiles: false,
                hasTextures: false,
                needsOBJLoader: false
            },
            paths: {
                models: [],
                textures: []
            },
            errors: []
        };

        try {
            // Step 1: Scan objects for asset references
            await this.scanObjects(objects, assetInventory);
            
            // Step 2: Validate asset accessibility
            await this.validateAssets(assetInventory);
            
            // Step 3: Determine required libraries
            this.determineLibraries(assetInventory);
            
            // Step 4: Generate asset map for export
            this.generateAssetMap(assetInventory);
            
            console.log('📊 Asset collection complete:', {
                models: assetInventory.models.size,
                textures: assetInventory.textures.size,
                libraries: assetInventory.libraries.size,
                errors: assetInventory.errors.length
            });

            return assetInventory;

        } catch (error) {
            console.error('❌ Asset collection failed:', error);
            assetInventory.errors.push({
                type: 'collection_failure',
                message: error.message
            });
            return assetInventory;
        }
    }

    /**
     * Scan scene objects for asset references
     * @param {Array} objects - Scene objects
     * @param {Object} assetInventory - Asset inventory to populate
     */
    async scanObjects(objects, assetInventory) {
        console.log('🔍 Scanning objects for asset references...');
        
        for (const [index, obj] of objects.entries()) {
            try {
                // Scan for OBJ model files
                if (!obj.isPrimitive && obj.fileName) {
                    await this.processModelAsset(obj, index, assetInventory);
                }
                
                // Scan for material textures
                if (obj.material) {
                    await this.processMaterialAssets(obj, index, assetInventory);
                }
                
            } catch (error) {
                console.warn(`⚠️ Failed to process assets for object ${obj.name || index}:`, error);
                assetInventory.errors.push({
                    type: 'object_scan_error',
                    objectId: obj.id,
                    objectName: obj.name || `Object_${index}`,
                    message: error.message
                });
            }
        }
    }

    /**
     * Process OBJ model asset
     * @param {Object} obj - Object data
     * @param {Number} index - Object index
     * @param {Object} assetInventory - Asset inventory
     */
    async processModelAsset(obj, index, assetInventory) {
        const fileName = obj.fileName || obj.originalFileName;
        if (!fileName) return;

        const assetInfo = {
            originalPath: fileName,
            fileName: this.getFileNameFromPath(fileName),
            exportPath: `assets/models/${this.getFileNameFromPath(fileName)}`,
            type: 'model',
            format: this.getFileExtension(fileName).toLowerCase(),
            objectId: obj.id,
            objectName: obj.name || `Object_${index}`,
            size: 0,
            accessible: false
        };

        // Add to inventory
        assetInventory.models.set(fileName, assetInfo);
        assetInventory.paths.models.push(assetInfo);
        assetInventory.metadata.hasOBJFiles = true;
        
        console.log(`📦 Found model asset: ${fileName} -> ${assetInfo.exportPath}`);
    }

    /**
     * Process material texture assets
     * @param {Object} obj - Object data
     * @param {Number} index - Object index
     * @param {Object} assetInventory - Asset inventory
     */
    async processMaterialAssets(obj, index, assetInventory) {
        const material = obj.material;
        
        // MatCap textures
        if (material.matcapTexture) {
            await this.processTextureAsset(
                material.matcapTexture, 
                'matcap', 
                obj, 
                index, 
                assetInventory
            );
        }

        // Normal maps
        if (material.normalMap) {
            await this.processTextureAsset(
                material.normalMap, 
                'normal', 
                obj, 
                index, 
                assetInventory
            );
        }

        // Roughness maps
        if (material.roughnessMap) {
            await this.processTextureAsset(
                material.roughnessMap, 
                'roughness', 
                obj, 
                index, 
                assetInventory
            );
        }

        // Metalness maps
        if (material.metalnessMap) {
            await this.processTextureAsset(
                material.metalnessMap, 
                'metalness', 
                obj, 
                index, 
                assetInventory
            );
        }

        // Diffuse/base color maps
        if (material.map) {
            await this.processTextureAsset(
                material.map, 
                'diffuse', 
                obj, 
                index, 
                assetInventory
            );
        }
    }

    /**
     * Process individual texture asset
     * @param {String} texturePath - Path to texture file
     * @param {String} textureType - Type of texture (matcap, normal, etc.)
     * @param {Object} obj - Parent object
     * @param {Number} index - Object index
     * @param {Object} assetInventory - Asset inventory
     */
    async processTextureAsset(texturePath, textureType, obj, index, assetInventory) {
        const fileName = this.getFileNameFromPath(texturePath);
        const fileExtension = this.getFileExtension(fileName);
        
        const assetInfo = {
            originalPath: texturePath,
            fileName: fileName,
            exportPath: `assets/textures/${textureType}/${fileName}`,
            type: 'texture',
            subType: textureType,
            format: fileExtension.toLowerCase(),
            objectId: obj.id,
            objectName: obj.name || `Object_${index}`,
            size: 0,
            accessible: false
        };

        // Add to inventory
        assetInventory.textures.set(texturePath, assetInfo);
        assetInventory.paths.textures.push(assetInfo);
        assetInventory.metadata.hasTextures = true;
        
        console.log(`🎨 Found texture asset: ${texturePath} (${textureType}) -> ${assetInfo.exportPath}`);
    }

    /**
     * Validate that all collected assets are accessible
     * @param {Object} assetInventory - Asset inventory to validate
     */
    async validateAssets(assetInventory) {
        console.log('✅ Validating asset accessibility...');
        
        const validationPromises = [];
        
        // Validate model files
        for (const [path, assetInfo] of assetInventory.models) {
            validationPromises.push(this.validateAssetFile(path, assetInfo));
        }
        
        // Validate texture files
        for (const [path, assetInfo] of assetInventory.textures) {
            validationPromises.push(this.validateAssetFile(path, assetInfo));
        }
        
        // Wait for all validations
        await Promise.allSettled(validationPromises);
        
        // Count accessible assets
        const accessibleModels = Array.from(assetInventory.models.values()).filter(a => a.accessible).length;
        const accessibleTextures = Array.from(assetInventory.textures.values()).filter(a => a.accessible).length;
        
        console.log(`📊 Asset validation complete: ${accessibleModels}/${assetInventory.models.size} models, ${accessibleTextures}/${assetInventory.textures.size} textures accessible`);
    }

    /**
     * Validate individual asset file accessibility
     * @param {String} path - Asset file path
     * @param {Object} assetInfo - Asset information object
     */
    async validateAssetFile(path, assetInfo) {
        try {
            // Attempt to fetch the asset to check accessibility
            const fullPath = this.resolveAssetPath(path);
            const response = await fetch(fullPath, { method: 'HEAD' });
            
            if (response.ok) {
                assetInfo.accessible = true;
                assetInfo.size = parseInt(response.headers.get('content-length') || '0');
                assetInfo.mimeType = response.headers.get('content-type');
                console.log(`✅ Asset accessible: ${path} (${assetInfo.size} bytes)`);
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            assetInfo.accessible = false;
            assetInfo.error = error.message;
            console.warn(`❌ Asset not accessible: ${path} - ${error.message}`);
            
            // Add to errors list
            if (assetInfo.type === 'model') {
                // Models are critical - add as error
                assetInfo.inventory?.errors?.push({
                    type: 'model_not_accessible',
                    path,
                    objectName: assetInfo.objectName,
                    message: `Critical: OBJ file not accessible - ${error.message}`
                });
            } else {
                // Textures are less critical - add as warning
                assetInfo.inventory?.errors?.push({
                    type: 'texture_not_accessible',
                    path,
                    objectName: assetInfo.objectName,
                    message: `Warning: Texture not accessible - ${error.message}`
                });
            }
        }
    }

    /**
     * Determine required Three.js libraries based on collected assets
     * @param {Object} assetInventory - Asset inventory
     */
    determineLibraries(assetInventory) {
        console.log('📚 Determining required libraries...');
        
        // Always need Three.js core and OrbitControls
        assetInventory.libraries.add('three.min.js');
        assetInventory.libraries.add('OrbitControls.js');
        
        // OBJ Loader if we have OBJ files
        if (assetInventory.metadata.hasOBJFiles) {
            assetInventory.libraries.add('OBJLoader.js');
            assetInventory.metadata.needsOBJLoader = true;
        }
        
        // Future: Add other loaders based on file types
        // GLTFLoader, FBXLoader, etc.
        
        console.log('📚 Required libraries:', Array.from(assetInventory.libraries));
    }

    /**
     * Generate asset mapping for export system
     * @param {Object} assetInventory - Asset inventory
     */
    generateAssetMap(assetInventory) {
        console.log('🗺️ Generating asset export map...');
        
        assetInventory.exportMap = {
            models: {},
            textures: {},
            libraries: Array.from(assetInventory.libraries)
        };
        
        // Map models for export
        for (const [originalPath, assetInfo] of assetInventory.models) {
            if (assetInfo.accessible) {
                assetInventory.exportMap.models[originalPath] = {
                    exportPath: assetInfo.exportPath,
                    fileName: assetInfo.fileName,
                    size: assetInfo.size,
                    mimeType: assetInfo.mimeType
                };
            }
        }
        
        // Map textures for export
        for (const [originalPath, assetInfo] of assetInventory.textures) {
            if (assetInfo.accessible) {
                assetInventory.exportMap.textures[originalPath] = {
                    exportPath: assetInfo.exportPath,
                    fileName: assetInfo.fileName,
                    subType: assetInfo.subType,
                    size: assetInfo.size,
                    mimeType: assetInfo.mimeType
                };
            }
        }
        
        // Calculate total metadata
        assetInventory.metadata.fileCount = 
            Object.keys(assetInventory.exportMap.models).length + 
            Object.keys(assetInventory.exportMap.textures).length;
            
        assetInventory.metadata.totalSize = 
            Object.values(assetInventory.exportMap.models).reduce((sum, asset) => sum + asset.size, 0) +
            Object.values(assetInventory.exportMap.textures).reduce((sum, asset) => sum + asset.size, 0);
    }

    /**
     * Copy assets to export structure (browser-based implementation)
     * @param {Object} assetInventory - Asset inventory
     * @returns {Object} Asset copy results
     */
    async copyAssets(assetInventory) {
        console.log('📂 Preparing assets for export...');
        
        const copyResults = {
            models: {},
            textures: {},
            errors: [],
            totalSize: 0
        };
        
        try {
            // Copy models
            for (const [originalPath, exportInfo] of Object.entries(assetInventory.exportMap.models)) {
                const copyResult = await this.copyAssetFile(originalPath, exportInfo);
                copyResults.models[originalPath] = copyResult;
                if (copyResult.success) {
                    copyResults.totalSize += copyResult.size;
                } else {
                    copyResults.errors.push(copyResult.error);
                }
            }
            
            // Copy textures
            for (const [originalPath, exportInfo] of Object.entries(assetInventory.exportMap.textures)) {
                const copyResult = await this.copyAssetFile(originalPath, exportInfo);
                copyResults.textures[originalPath] = copyResult;
                if (copyResult.success) {
                    copyResults.totalSize += copyResult.size;
                } else {
                    copyResults.errors.push(copyResult.error);
                }
            }
            
            console.log(`📂 Asset copying complete: ${copyResults.totalSize} bytes total`);
            return copyResults;
            
        } catch (error) {
            console.error('❌ Asset copying failed:', error);
            copyResults.errors.push({
                type: 'copy_failure',
                message: error.message
            });
            return copyResults;
        }
    }

    /**
     * Copy individual asset file (browser-based)
     * @param {String} originalPath - Original asset path
     * @param {Object} exportInfo - Export information
     * @returns {Object} Copy result
     */
    async copyAssetFile(originalPath, exportInfo) {
        try {
            const fullPath = this.resolveAssetPath(originalPath);
            const response = await fetch(fullPath);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            
            return {
                success: true,
                originalPath,
                exportPath: exportInfo.exportPath,
                size: arrayBuffer.byteLength,
                data: arrayBuffer,
                mimeType: blob.type || exportInfo.mimeType
            };
            
        } catch (error) {
            console.error(`❌ Failed to copy asset ${originalPath}:`, error);
            return {
                success: false,
                originalPath,
                exportPath: exportInfo.exportPath,
                error: {
                    type: 'copy_error',
                    message: error.message
                }
            };
        }
    }

    /**
     * Resolve asset path to full URL
     * @param {String} assetPath - Relative or absolute asset path
     * @returns {String} Full asset URL
     */
    resolveAssetPath(assetPath) {
        // If already absolute URL, return as-is
        if (assetPath.startsWith('http://') || assetPath.startsWith('https://')) {
            return assetPath;
        }
        
        // If absolute path from root, use with current origin
        if (assetPath.startsWith('/')) {
            return window.location.origin + assetPath;
        }
        
        // Relative path - resolve against base path
        return this.basePath + assetPath;
    }

    /**
     * Get file name from path
     * @param {String} filePath - Full file path
     * @returns {String} File name only
     */
    getFileNameFromPath(filePath) {
        return filePath.split('/').pop().split('\\').pop();
    }

    /**
     * Get file extension from path
     * @param {String} filePath - File path
     * @returns {String} File extension
     */
    getFileExtension(filePath) {
        const fileName = this.getFileNameFromPath(filePath);
        const lastDot = fileName.lastIndexOf('.');
        return lastDot > 0 ? fileName.substring(lastDot + 1) : '';
    }

    /**
     * Generate asset summary for export
     * @param {Object} assetInventory - Complete asset inventory
     * @returns {Object} Asset summary
     */
    generateAssetSummary(assetInventory) {
        const accessibleModels = Array.from(assetInventory.models.values()).filter(a => a.accessible);
        const accessibleTextures = Array.from(assetInventory.textures.values()).filter(a => a.accessible);
        
        return {
            total: {
                models: assetInventory.models.size,
                textures: assetInventory.textures.size,
                libraries: assetInventory.libraries.size
            },
            accessible: {
                models: accessibleModels.length,
                textures: accessibleTextures.length
            },
            size: {
                total: assetInventory.metadata.totalSize,
                formatted: this.formatBytes(assetInventory.metadata.totalSize)
            },
            errors: assetInventory.errors.length,
            warnings: assetInventory.errors.filter(e => e.type.includes('texture')).length,
            critical: assetInventory.errors.filter(e => e.type.includes('model')).length
        };
    }

    /**
     * Format bytes to human readable string
     * @param {Number} bytes - Bytes to format
     * @returns {String} Formatted string
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}