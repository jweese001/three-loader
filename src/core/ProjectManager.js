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
     * Create a new project folder structure (for "Create New Project")
     */
    async createNewProject() {
        try {
            if (!this.isFileSystemAccessSupported()) {
                throw new Error('File System Access API not supported in this browser');
            }

            console.log('📁 Creating new 3Loader project...');

            // Request access to a location where user wants to create the project
            const options = {
                mode: 'readwrite',
                startIn: 'documents'
            };

            try {
                // Let user select where to create the project folder
                this.projectRootHandle = await window.showDirectoryPicker(options);

                // Create or verify project structure
                await this.setupProjectFolders();

            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('👤 User cancelled project creation');
                    return false;
                }
                throw error;
            }

            console.log('✅ New project created successfully');
            return true;

        } catch (error) {
            console.error('❌ Failed to create new project:', error);
            throw error;
        }
    }

    /**
     * Open an existing project folder (for "Open Existing Project")
     */
    async openExistingProject() {
        try {
            if (!this.isFileSystemAccessSupported()) {
                throw new Error('File System Access API not supported in this browser');
            }

            console.log('📂 Opening existing 3Loader project...');

            // Request access to existing project folder
            const options = {
                mode: 'readwrite',
                startIn: 'documents'
            };

            try {
                // Let user select an existing project folder
                this.projectRootHandle = await window.showDirectoryPicker(options);

                // Verify this is a valid 3Loader project folder
                await this.validateProjectStructure();

                // Set up folder handles for existing structure
                await this.setupProjectFolders();

            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('👤 User cancelled project opening');
                    return false;
                }
                throw error;
            }

            console.log('✅ Existing project opened successfully');
            return true;

        } catch (error) {
            console.error('❌ Failed to open existing project:', error);
            throw error;
        }
    }

    /**
     * Initialize project folder structure (legacy method for backward compatibility)
     */
    async initializeProjectStructure() {
        // Default to creating new project for backward compatibility
        return await this.createNewProject();
    }

    /**
     * Validate that a folder is a valid 3Loader project
     */
    async validateProjectStructure() {
        try {
            console.log('🔍 Validating project structure...');

            // Check if this folder has the expected 3Loader structure
            const requiredFolders = ['textures', 'models', 'projects'];
            const missingFolders = [];

            for (const folderName of requiredFolders) {
                try {
                    await this.projectRootHandle.getDirectoryHandle(folderName);
                    console.log(`✅ Found folder: ${folderName}`);
                } catch (error) {
                    missingFolders.push(folderName);
                    console.log(`❌ Missing folder: ${folderName}`);
                }
            }

            // If some folders are missing, ask user if they want to create them
            if (missingFolders.length > 0) {
                console.log(`⚠️ This folder appears to be missing some 3Loader project folders: ${missingFolders.join(', ')}`);
                console.log('📁 Will create missing folders to complete project structure...');
                // We'll let setupProjectFolders() create the missing ones
            }

            return true;

        } catch (error) {
            console.error('❌ Failed to validate project structure:', error);
            throw new Error('Failed to validate project folder structure');
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

            // Generate short ID for the asset
            const assetId = this.generateShortId();
            const fileExtension = this.getFileExtension(file.name);
            const cleanName = this.sanitizeFilename(file.name);
            const newFileName = `${assetId}-${cleanName}`;

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
                storedPath: `./${folderName}/${newFileName}`,        // Relative path for exports
                absolutePath: `models/${newFileName}`,              // Simplified absolute path
                folderName: folderName,
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
     * Generate short ID for asset naming (much more readable)
     */
    generateShortId() {
        // Generate a 6-character alphanumeric ID (like a1b2c3)
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
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
     * Try to restore previous project without user interaction
     * Only works if we have stored project information - currently returns false
     */
    async tryRestorePreviousProject() {
        try {
            // For now, we don't have persistent project storage
            // This would require implementing IndexedDB or localStorage for project handles
            // Auto-restoration without user gesture is not possible with File System Access API
            console.log('📁 Auto-restoration requires user gesture - skipping');
            return false;

        } catch (error) {
            console.error('❌ Failed to restore previous project:', error);
            return false;
        }
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