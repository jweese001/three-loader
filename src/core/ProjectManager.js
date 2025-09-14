/**
 * ProjectManager - Centralized Asset Management System for 3Loader
 *
 * Manages project structure in ~/Documents/3Loader-Projects/
 * Handles texture copying, asset organization, and path resolution
 */

export class ProjectManager {
    constructor() {
        this.projectRootHandle = null;
        this.texturesHandle = null;
        this.modelsHandle = null;
        this.projectsHandle = null;
        this.exportsHandle = null;
        this.tempHandle = null;

        // Asset database for tracking files
        this.assetDatabase = new Map();

        // Project structure
        this.projectStructure = {
            root: '3Loader-Projects',
            folders: {
                textures: 'textures',
                models: 'models',
                projects: 'projects',
                exports: 'exports',
                temp: 'temp'
            }
        };

        console.log('🏗️ ProjectManager initialized');
    }

    /**
     * Check if File System Access API is supported
     */
    isFileSystemAccessSupported() {
        return 'showDirectoryPicker' in window;
    }

    /**
     * Initialize project folder structure
     */
    async initializeProjectStructure() {
        try {
            if (!this.isFileSystemAccessSupported()) {
                throw new Error('File System Access API not supported in this browser');
            }

            console.log('📁 Initializing 3Loader project structure...');

            // Request access to Documents folder or let user choose location
            const options = {
                mode: 'readwrite',
                startIn: 'documents'
            };

            try {
                // Try to get existing project folder
                this.projectRootHandle = await window.showDirectoryPicker(options);

                // Verify this is the correct folder or create structure
                await this.setupProjectFolders();

            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('👤 User cancelled folder selection');
                    return false;
                }
                throw error;
            }

            console.log('✅ Project structure initialized successfully');
            return true;

        } catch (error) {
            console.error('❌ Failed to initialize project structure:', error);
            throw error;
        }
    }

    /**
     * Setup project folder structure
     */
    async setupProjectFolders() {
        try {
            const folders = this.projectStructure.folders;

            // Create or get each required folder
            this.texturesHandle = await this.getOrCreateFolder(this.projectRootHandle, folders.textures);
            this.modelsHandle = await this.getOrCreateFolder(this.projectRootHandle, folders.models);
            this.projectsHandle = await this.getOrCreateFolder(this.projectRootHandle, folders.projects);
            this.exportsHandle = await this.getOrCreateFolder(this.projectRootHandle, folders.exports);
            this.tempHandle = await this.getOrCreateFolder(this.projectRootHandle, folders.temp);

            console.log('📂 Project folders created/verified:', folders);

        } catch (error) {
            console.error('❌ Failed to setup project folders:', error);
            throw error;
        }
    }

    /**
     * Get or create a folder in the specified directory
     */
    async getOrCreateFolder(parentHandle, folderName) {
        try {
            // Try to get existing folder first
            try {
                return await parentHandle.getDirectoryHandle(folderName);
            } catch (error) {
                // Folder doesn't exist, create it
                console.log(`📁 Creating folder: ${folderName}`);
                return await parentHandle.getDirectoryHandle(folderName, { create: true });
            }
        } catch (error) {
            console.error(`❌ Failed to get/create folder ${folderName}:`, error);
            throw error;
        }
    }

    /**
     * Copy any asset file to the appropriate project folder with UUID naming
     */
    async copyAssetToProject(file, assetType = null) {
        try {
            if (!this.isInitialized()) {
                throw new Error('Project structure not initialized. Call initializeProjectStructure() first.');
            }

            // Determine asset type if not provided
            if (!assetType) {
                assetType = this.detectAssetType(file.name);
            }

            // Get the appropriate folder handle
            const folderHandle = this.getFolderHandleForAssetType(assetType);
            const folderName = this.getFolderNameForAssetType(assetType);

            // Generate UUID for the asset
            const assetId = this.generateUUID();
            const fileExtension = this.getFileExtension(file.name);
            const newFileName = `${assetId}-${this.sanitizeFilename(file.name)}`;

            console.log(`📋 Copying ${assetType} to project:`, {
                originalName: file.name,
                newFileName: newFileName,
                assetId: assetId,
                folder: folderName
            });

            // Create file in appropriate folder
            const fileHandle = await folderHandle.getFileHandle(newFileName, { create: true });
            const writable = await fileHandle.createWritable();

            // Copy file content
            await writable.write(file);
            await writable.close();

            // Store in asset database
            const assetInfo = {
                id: assetId,
                originalName: file.name,
                storedName: newFileName,
                storedPath: `./${folderName}/${newFileName}`,
                type: assetType,
                size: file.size,
                lastModified: file.lastModified,
                dateAdded: new Date().toISOString()
            };

            this.assetDatabase.set(assetId, assetInfo);

            console.log(`✅ ${assetType} copied successfully:`, assetInfo);
            return assetInfo;

        } catch (error) {
            console.error(`❌ Failed to copy ${assetType} to project:`, error);
            throw error;
        }
    }

    /**
     * Copy a texture file to the textures folder (legacy method - now uses copyAssetToProject)
     */
    async copyTextureToProject(file) {
        return this.copyAssetToProject(file, 'texture');
    }

    /**
     * Copy a model file to the models folder
     */
    async copyModelToProject(file) {
        return this.copyAssetToProject(file, 'model');
    }

    /**
     * Detect asset type from file extension
     */
    detectAssetType(filename) {
        const extension = this.getFileExtension(filename).toLowerCase();

        // Texture extensions
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'tga', 'dds', 'hdr', 'exr'].includes(extension)) {
            return 'texture';
        }

        // Model extensions
        if (['obj', 'gltf', 'glb', 'fbx', 'dae', 'ply', 'stl', '3ds', 'x3d'].includes(extension)) {
            return 'model';
        }

        // Default to generic asset
        return 'asset';
    }

    /**
     * Get folder handle for asset type
     */
    getFolderHandleForAssetType(assetType) {
        switch (assetType) {
            case 'texture':
                return this.texturesHandle;
            case 'model':
                return this.modelsHandle;
            default:
                return this.tempHandle; // Generic assets go to temp folder
        }
    }

    /**
     * Get folder name for asset type
     */
    getFolderNameForAssetType(assetType) {
        switch (assetType) {
            case 'texture':
                return this.projectStructure.folders.textures;
            case 'model':
                return this.projectStructure.folders.models;
            default:
                return this.projectStructure.folders.temp;
        }
    }

    /**
     * Get asset path for code generation
     */
    getAssetPathForCode(assetId) {
        const asset = this.assetDatabase.get(assetId);
        if (!asset) {
            console.warn('⚠️ Asset not found in asset database:', assetId);
            return null;
        }

        return asset.storedPath;
    }

    /**
     * Get texture path for code generation (legacy method)
     */
    getTexturePathForCode(textureId) {
        return this.getAssetPathForCode(textureId);
    }

    /**
     * Get model path for code generation
     */
    getModelPathForCode(modelId) {
        return this.getAssetPathForCode(modelId);
    }

    /**
     * Find asset by original filename (useful for migration)
     */
    findAssetByOriginalName(originalName, assetType = null) {
        for (const [id, asset] of this.assetDatabase.entries()) {
            if (asset.originalName === originalName) {
                if (!assetType || asset.type === assetType) {
                    return { id, ...asset };
                }
            }
        }
        return null;
    }

    /**
     * Get all assets of a specific type
     */
    getAssetsByType(assetType) {
        const assets = [];
        for (const [id, asset] of this.assetDatabase.entries()) {
            if (asset.type === assetType) {
                assets.push({ id, ...asset });
            }
        }
        return assets;
    }

    /**
     * Generate UUID for asset naming
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Get file extension from filename
     */
    getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    }

    /**
     * Sanitize filename for safe storage
     */
    sanitizeFilename(filename) {
        return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    }

    /**
     * Check if project structure is initialized
     */
    isInitialized() {
        return this.projectRootHandle !== null && this.texturesHandle !== null;
    }

    /**
     * Get asset database info
     */
    getAssetDatabase() {
        return Array.from(this.assetDatabase.entries()).map(([id, info]) => ({ id, ...info }));
    }

    /**
     * Clean up unused assets (future implementation)
     */
    async cleanupUnusedAssets() {
        console.log('🧹 Asset cleanup not yet implemented');
        // TODO: Implement asset cleanup based on usage tracking
    }
}