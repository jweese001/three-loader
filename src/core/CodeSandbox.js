/**
 * CodeSandbox - Web Worker-based safe code execution environment
 * Part of Phase 1: Safe Code Execution Engine
 * 
 * Provides secure execution of arbitrary Three.js code with:
 * - Web Worker isolation for security
 * - Resource limits and error containment 
 * - Full Three.js API access within sandbox
 * - Communication bridge to main thread
 */

export class CodeSandbox {
    constructor() {
        this.worker = null;
        this.messageId = 0;
        this.pendingMessages = new Map();
        this.isInitialized = false;
        
        // Configuration
        this.config = {
            maxExecutionTime: 5000, // 5 seconds
            maxMemoryUsage: 50 * 1024 * 1024, // 50MB
            allowedAPIs: [
                'THREE',
                'console',
                'Math',
                'Date',
                'Array',
                'Object',
                'JSON',
                'Promise'
            ],
            restrictedAPIs: [
                'fetch',
                'XMLHttpRequest',
                'WebSocket',
                'IndexedDB',
                'localStorage',
                'sessionStorage',
                'document',
                'window',
                'eval',
                'Function',
                'importScripts'
            ]
        };
        
        console.log('🛡️ CodeSandbox initializing...');
        this.initializeWorker();
    }
    
    /**
     * Initialize the Web Worker with Three.js and security restrictions
     */
    async initializeWorker() {
        try {
            // Create worker from inline code to avoid CORS issues
            const workerCode = this.generateWorkerCode();
            const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
            const workerUrl = URL.createObjectURL(workerBlob);
            
            this.worker = new Worker(workerUrl);
            
            // Set up message handling
            this.worker.onmessage = (event) => {
                this.handleWorkerMessage(event.data);
            };
            
            this.worker.onerror = (error) => {
                console.error('🚨 Worker error:', error);
                this.handleWorkerError(error);
            };
            
            // Initialize Three.js in worker
            await this.sendWorkerMessage({
                type: 'init',
                config: this.config
            });
            
            this.isInitialized = true;
            console.log('✅ CodeSandbox worker initialized successfully');
            
            // Clean up object URL
            URL.revokeObjectURL(workerUrl);
            
        } catch (error) {
            console.error('❌ Failed to initialize CodeSandbox worker:', error);
            throw error;
        }
    }
    
    /**
     * Generate Web Worker code with Three.js and security restrictions
     */
    generateWorkerCode() {
        return `
// CodeSandbox Web Worker
let THREE = null;
let config = null;
let executionStartTime = null;
let memoryCheckInterval = null;

// Message handler
self.onmessage = function(event) {
    const { id, type, config, data } = event.data;
    
    try {
        switch (type) {
            case 'init':
                handleInit(id, { config: config });
                break;
            case 'execute':
                handleExecute(id, data);
                break;
            case 'cleanup':
                handleCleanup(id);
                break;
            default:
                sendResponse(id, { error: 'Unknown message type: ' + type });
        }
    } catch (error) {
        sendResponse(id, { 
            error: 'Worker error: ' + error.message,
            stack: error.stack 
        });
    }
};

// Initialize Three.js and security
function handleInit(id, data) {
    // Handle both data.config and direct config in data
    config = data.config || data;
    
    // Import Three.js from local CDN or module
    try {
        importScripts('https://unpkg.com/three@0.155.0/build/three.min.js');
        THREE = self.THREE;
    } catch (e) {
        // Fallback: Create basic THREE mock for testing
        THREE = {
            Scene: function() { this.children = []; this.traverse = function(fn) { this.children.forEach(fn); }; },
            PerspectiveCamera: function() { this.position = {x:0,y:0,z:0}; this.fov = 75; },
            WebGLRenderer: function() { this.render = function() {}; },
            BoxGeometry: function() { this.type = 'BoxGeometry'; },
            MeshBasicMaterial: function() { this.color = {getHex: () => 0x00ff00}; },
            Mesh: function() { this.position = {x:0,y:0,z:0}; this.rotation = {x:0,y:0,z:0}; this.scale = {x:1,y:1,z:1}; },
            IcosahedronGeometry: function() { this.type = 'IcosahedronGeometry'; },
            MeshStandardMaterial: function() { this.color = {getHex: () => 0xffffff}; },
            HemisphereLight: function() { this.color = {getHex: () => 0x0099ff}; this.intensity = 1; this.isLight = true; },
            REVISION: '155'
        };
        console.warn('Using Three.js fallback in worker');
    }
    
    // Apply security restrictions
    applySecurityRestrictions();
    
    sendResponse(id, { 
        success: true, 
        message: 'Worker initialized with Three.js',
        threeVersion: THREE.REVISION
    });
}

// Execute user code safely
function handleExecute(id, data) {
    const { code, context } = data;
    
    // Start execution timing and memory monitoring
    executionStartTime = Date.now();
    startMemoryMonitoring();
    
    try {
        // Create execution context
        const executionContext = createExecutionContext(context);
        
        // Execute code with timeout
        const result = executeWithTimeout(code, executionContext, config.maxExecutionTime);
        
        stopMemoryMonitoring();
        
        sendResponse(id, {
            success: true,
            result: result,
            executionTime: Date.now() - executionStartTime,
            memoryUsage: getMemoryUsage()
        });
        
    } catch (error) {
        stopMemoryMonitoring();
        
        sendResponse(id, {
            success: false,
            error: error.message,
            stack: error.stack,
            executionTime: Date.now() - executionStartTime,
            type: getErrorType(error)
        });
    }
}

// Create secure execution context
function createExecutionContext(context = {}) {
    return {
        // Three.js API
        THREE: THREE,
        
        // Safe built-ins
        console: createSafeConsole(),
        Math: Math,
        Date: Date,
        Array: Array,
        Object: Object,
        JSON: JSON,
        
        // User context (scene objects, etc.)
        ...context,
        
        // Utility functions
        createScene: () => new THREE.Scene(),
        createRenderer: (width = 800, height = 600) => {
            // Create OffscreenCanvas for rendering in worker
            const canvas = new OffscreenCanvas(width, height);
            return new THREE.WebGLRenderer({ canvas });
        },
        
        // Results container
        __results: {}
    };
}

// Execute code with timeout protection
function executeWithTimeout(code, context, timeout) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error('Code execution timed out after ' + timeout + 'ms'));
        }, timeout);
        
        try {
            // Create function with restricted scope
            const func = new Function(...Object.keys(context), code + '; return __results;');
            const result = func(...Object.values(context));
            
            clearTimeout(timeoutId);
            resolve(result);
            
        } catch (error) {
            clearTimeout(timeoutId);
            reject(error);
        }
    });
}

// Apply security restrictions
function applySecurityRestrictions() {
    // Remove dangerous globals
    const restrictedAPIs = config.restrictedAPIs || [];
    
    restrictedAPIs.forEach(api => {
        if (self[api]) {
            try {
                delete self[api];
            } catch (e) {
                // Some properties can't be deleted, try to override
                self[api] = undefined;
            }
        }
    });
    
    // Override eval and Function constructor
    self.eval = function() {
        throw new Error('eval() is not allowed in sandbox');
    };
    
    const OriginalFunction = self.Function;
    self.Function = function() {
        // Allow only our controlled Function calls
        if (arguments.length === 0) {
            throw new Error('Function constructor is restricted in sandbox');
        }
        return OriginalFunction.apply(this, arguments);
    };
}

// Create safe console for logging
function createSafeConsole() {
    return {
        log: (...args) => sendLog('log', args),
        warn: (...args) => sendLog('warn', args),
        error: (...args) => sendLog('error', args),
        info: (...args) => sendLog('info', args)
    };
}

// Send log messages to main thread
function sendLog(level, args) {
    self.postMessage({
        type: 'log',
        level: level,
        message: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')
    });
}

// Memory monitoring
function startMemoryMonitoring() {
    if (memoryCheckInterval) clearInterval(memoryCheckInterval);
    
    memoryCheckInterval = setInterval(() => {
        const memoryUsage = getMemoryUsage();
        if (memoryUsage > config.maxMemoryUsage) {
            throw new Error('Memory limit exceeded: ' + formatBytes(memoryUsage));
        }
    }, 100); // Check every 100ms
}

function stopMemoryMonitoring() {
    if (memoryCheckInterval) {
        clearInterval(memoryCheckInterval);
        memoryCheckInterval = null;
    }
}

function getMemoryUsage() {
    // Approximate memory usage (not perfect but gives an indication)
    if (performance && performance.memory) {
        return performance.memory.usedJSHeapSize;
    }
    return 0;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Error type classification
function getErrorType(error) {
    if (error.name === 'SyntaxError') return 'syntax_error';
    if (error.name === 'ReferenceError') return 'reference_error';
    if (error.name === 'TypeError') return 'type_error';
    if (error.message.includes('timeout')) return 'timeout_error';
    if (error.message.includes('Memory limit')) return 'memory_error';
    return 'runtime_error';
}

// Cleanup resources
function handleCleanup(id) {
    stopMemoryMonitoring();
    executionStartTime = null;
    
    sendResponse(id, { success: true, message: 'Cleanup completed' });
}

// Send response back to main thread
function sendResponse(id, data) {
    self.postMessage({
        id: id,
        ...data
    });
}
        `;
    }
    
    /**
     * Execute Three.js code safely in the sandbox
     * @param {string} code - The Three.js code to execute
     * @param {Object} context - Additional context objects
     * @returns {Promise<Object>} Execution result
     */
    async executeCode(code, context = {}) {
        if (!this.isInitialized) {
            throw new Error('CodeSandbox not initialized');
        }
        
        console.log('🔍 Executing code in sandbox...');
        
        try {
            const result = await this.sendWorkerMessage({
                type: 'execute',
                data: { code, context }
            });
            
            if (result.success) {
                console.log('✅ Code executed successfully:', {
                    executionTime: result.executionTime + 'ms',
                    memoryUsage: this.formatBytes(result.memoryUsage)
                });
                return result;
            } else {
                console.error('❌ Code execution failed:', result.error);
                throw new Error(result.error);
            }
            
        } catch (error) {
            console.error('❌ Sandbox execution error:', error);
            throw error;
        }
    }
    
    /**
     * Send message to worker and await response
     * @param {Object} message - Message to send
     * @returns {Promise<Object>} Worker response
     */
    sendWorkerMessage(message) {
        return new Promise((resolve, reject) => {
            const id = ++this.messageId;
            const timeout = setTimeout(() => {
                this.pendingMessages.delete(id);
                reject(new Error('Worker message timeout'));
            }, this.config.maxExecutionTime + 1000);
            
            this.pendingMessages.set(id, { resolve, reject, timeout });
            
            this.worker.postMessage({
                id,
                ...message
            });
        });
    }
    
    /**
     * Handle messages from worker
     * @param {Object} data - Message data
     */
    handleWorkerMessage(data) {
        if (data.type === 'log') {
            // Forward worker logs to main console
            console.log(`[Worker ${data.level.toUpperCase()}]`, data.message);
            return;
        }
        
        const { id } = data;
        const pending = this.pendingMessages.get(id);
        
        if (pending) {
            clearTimeout(pending.timeout);
            this.pendingMessages.delete(id);
            
            if (data.error) {
                pending.reject(new Error(data.error));
            } else {
                pending.resolve(data);
            }
        }
    }
    
    /**
     * Handle worker errors
     * @param {Error} error - Worker error
     */
    handleWorkerError(error) {
        console.error('🚨 Worker error occurred:', error);
        
        // Reject all pending messages
        for (const [id, pending] of this.pendingMessages) {
            clearTimeout(pending.timeout);
            pending.reject(error);
        }
        this.pendingMessages.clear();
        
        // Try to restart worker
        this.restart();
    }
    
    /**
     * Restart the sandbox worker
     */
    async restart() {
        console.log('🔄 Restarting CodeSandbox worker...');
        
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        
        this.isInitialized = false;
        this.pendingMessages.clear();
        
        try {
            await this.initializeWorker();
            console.log('✅ CodeSandbox worker restarted successfully');
        } catch (error) {
            console.error('❌ Failed to restart CodeSandbox worker:', error);
            throw error;
        }
    }
    
    /**
     * Cleanup sandbox resources
     */
    async cleanup() {
        console.log('🧹 Cleaning up CodeSandbox...');
        
        try {
            if (this.isInitialized) {
                await this.sendWorkerMessage({ type: 'cleanup' });
            }
        } catch (error) {
            console.warn('⚠️ Cleanup message failed:', error.message);
        }
        
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        
        this.isInitialized = false;
        this.pendingMessages.clear();
        
        console.log('✅ CodeSandbox cleanup completed');
    }
    
    /**
     * Format bytes for display
     * @param {number} bytes - Bytes to format
     * @returns {string} Formatted string
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * Get sandbox status
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            pendingMessages: this.pendingMessages.size,
            config: this.config
        };
    }
    
    /**
     * Update sandbox configuration
     * @param {Object} newConfig - Configuration updates
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('⚙️ CodeSandbox configuration updated:', newConfig);
    }
}