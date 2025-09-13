export class HTMLGenerator {
    constructor() {
        console.log('📄 HTMLGenerator initialized');
    }
    
    /**
     * Generate complete standalone HTML file for exported project
     * @param {Object} sceneData - Scene configuration and settings
     * @param {Object} assets - Asset inventory from AssetCollector
     * @param {Object} options - Generation options
     * @returns {string} Complete HTML content
     */
    generateHTML(sceneData, assets, options = {}) {
        const {
            projectName = 'Three.js Scene',
            useLocalLibraries = false,
            includeControls = true,
            includeStats = false,
            minified = false
        } = options;
        
        const timestamp = new Date().toISOString();
        const objectCount = sceneData.objects?.length || 0;
        
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName} - Exported from 3/LOADER</title>
    <meta name="description" content="Three.js scene exported from 3/LOADER on ${timestamp}">
    <meta name="generator" content="3/LOADER v0.0.8">
    ${this.generateStyles(sceneData, minified)}
</head>
<body>
    ${this.generateBodyContent(sceneData, objectCount, timestamp)}
    ${this.generateScriptTags(assets, useLocalLibraries, includeControls, includeStats)}
    <script src="js/scene.js"></script>
</body>
</html>`;
        
        console.log(`📄 Generated HTML for ${projectName} (${objectCount} objects)`);
        return html;
    }
    
    /**
     * Generate CSS styles for the HTML document
     * @param {Object} sceneData - Scene configuration
     * @param {boolean} minified - Whether to minify the CSS
     * @returns {string} CSS style block
     */
    generateStyles(sceneData, minified = false) {
        const backgroundColor = sceneData.background ? 
            `#${sceneData.background.toString(16).padStart(6, '0')}` : '#0f0f0f';
        
        const css = minified ? this.getMinifiedCSS(backgroundColor) : this.getFormattedCSS(backgroundColor);
        
        return `<style>
${css}
    </style>`;
    }
    
    /**
     * Get formatted CSS styles
     * @param {string} backgroundColor - Scene background color
     * @returns {string} Formatted CSS
     */
    getFormattedCSS(backgroundColor) {
        return `        body {
            margin: 0;
            padding: 0;
            background: ${backgroundColor};
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: hidden;
            color: white;
        }
        
        #scene-container {
            width: 100vw;
            height: 100vh;
            position: relative;
        }
        
        #loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 18px;
            text-align: center;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.8);
            padding: 20px 30px;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        #loading .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid #9dd9d9;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        #info {
            position: absolute;
            top: 15px;
            left: 15px;
            color: white;
            background: rgba(0, 0, 0, 0.8);
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-family: 'Courier New', monospace;
            border: 1px solid rgba(157, 217, 217, 0.3);
            backdrop-filter: blur(10px);
            z-index: 999;
        }
        
        #info strong {
            color: #9dd9d9;
        }
        
        #controls-info {
            position: absolute;
            bottom: 15px;
            right: 15px;
            color: rgba(255, 255, 255, 0.8);
            background: rgba(0, 0, 0, 0.6);
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-family: 'Courier New', monospace;
            backdrop-filter: blur(5px);
        }
        
        #error {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(220, 53, 69, 0.9);
            color: white;
            padding: 20px 30px;
            border-radius: 10px;
            font-size: 14px;
            text-align: center;
            z-index: 1001;
            display: none;
            max-width: 80vw;
            word-wrap: break-word;
        }
        
        canvas {
            display: block;
            outline: none;
        }`;
    }
    
    /**
     * Get minified CSS styles
     * @param {string} backgroundColor - Scene background color
     * @returns {string} Minified CSS
     */
    getMinifiedCSS(backgroundColor) {
        return `        body{margin:0;padding:0;background:${backgroundColor};font-family:sans-serif;overflow:hidden;color:white}#scene-container{width:100vw;height:100vh;position:relative}#loading{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:white;font-size:18px;text-align:center;z-index:1000;background:rgba(0,0,0,0.8);padding:20px 30px;border-radius:10px}#loading .spinner{width:40px;height:40px;border:3px solid rgba(255,255,255,0.3);border-top:3px solid #9dd9d9;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 15px}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}#info{position:absolute;top:15px;left:15px;color:white;background:rgba(0,0,0,0.8);padding:12px 16px;border-radius:8px;font-size:13px;font-family:monospace}#controls-info{position:absolute;bottom:15px;right:15px;color:rgba(255,255,255,0.8);background:rgba(0,0,0,0.6);padding:8px 12px;border-radius:6px;font-size:11px;font-family:monospace}#error{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(220,53,69,0.9);color:white;padding:20px 30px;border-radius:10px;font-size:14px;text-align:center;z-index:1001;display:none;max-width:80vw}canvas{display:block;outline:none}`;
    }
    
    /**
     * Generate HTML body content
     * @param {Object} sceneData - Scene configuration
     * @param {number} objectCount - Number of objects in scene
     * @param {string} timestamp - Generation timestamp
     * @returns {string} HTML body content
     */
    generateBodyContent(sceneData, objectCount, timestamp) {
        return `    <div id="scene-container"></div>
    
    <div id="loading">
        <div class="spinner"></div>
        Loading Three.js Scene...
        <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">
            ${objectCount} object${objectCount !== 1 ? 's' : ''} to load
        </div>
    </div>
    
    <div id="info">
        <strong>Exported from 3/LOADER</strong><br>
        Objects: ${objectCount}<br>
        Generated: ${new Date(timestamp).toLocaleString()}
    </div>
    
    <div id="controls-info">
        Mouse: Orbit • Wheel: Zoom • Right-click: Pan
    </div>
    
    <div id="error">
        <strong>Loading Error</strong><br>
        <span id="error-message"></span>
    </div>`;
    }
    
    /**
     * Generate script tags for Three.js libraries and dependencies
     * @param {Object} assets - Asset inventory
     * @param {boolean} useLocalLibraries - Use local vs CDN libraries
     * @param {boolean} includeControls - Include orbit controls
     * @param {boolean} includeStats - Include stats.js
     * @returns {string} Script tags HTML
     */
    generateScriptTags(assets, useLocalLibraries = false, includeControls = true, includeStats = false) {
        const scripts = [];
        
        // Three.js core library
        if (useLocalLibraries) {
            scripts.push('    <script src="js/three.min.js"></script>');
        } else {
            scripts.push('    <script src="https://unpkg.com/three@0.155.0/build/three.min.js"></script>');
        }
        
        // Controls
        if (includeControls) {
            if (useLocalLibraries) {
                scripts.push('    <script src="js/loaders/OrbitControls.js"></script>');
            } else {
                scripts.push('    <script src="https://unpkg.com/three@0.155.0/examples/js/controls/OrbitControls.js"></script>');
            }
        }
        
        // Loaders based on asset requirements
        if (assets.libraries.has('OBJLoader.js')) {
            if (useLocalLibraries) {
                scripts.push('    <script src="js/loaders/OBJLoader.js"></script>');
            } else {
                scripts.push('    <script src="https://unpkg.com/three@0.155.0/examples/js/loaders/OBJLoader.js"></script>');
            }
        }
        
        if (assets.libraries.has('MTLLoader.js')) {
            if (useLocalLibraries) {
                scripts.push('    <script src="js/loaders/MTLLoader.js"></script>');
            } else {
                scripts.push('    <script src="https://unpkg.com/three@0.155.0/examples/js/loaders/MTLLoader.js"></script>');
            }
        }
        
        // Stats.js (optional)
        if (includeStats) {
            scripts.push('    <script src="https://unpkg.com/stats.js@0.17.0/build/stats.min.js"></script>');
        }
        
        return `    <!-- Three.js Libraries -->\n${scripts.join('\n')}`;
    }
    
    /**
     * Generate minimal HTML template for basic scenes
     * @param {string} projectName - Project name
     * @param {Object} options - Generation options
     * @returns {string} Minimal HTML content
     */
    generateMinimalHTML(projectName = 'Three.js Scene', options = {}) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <style>
        body { margin: 0; background: #000; overflow: hidden; }
        #container { width: 100vw; height: 100vh; }
    </style>
</head>
<body>
    <div id="container"></div>
    <script src="https://unpkg.com/three@0.155.0/build/three.min.js"></script>
    <script src="https://unpkg.com/three@0.155.0/examples/js/controls/OrbitControls.js"></script>
    <script src="js/scene.js"></script>
</body>
</html>`;
    }
    
    /**
     * Generate development HTML with additional debug features
     * @param {Object} sceneData - Scene configuration
     * @param {Object} assets - Asset inventory
     * @param {Object} options - Generation options
     * @returns {string} Development HTML content
     */
    generateDevelopmentHTML(sceneData, assets, options = {}) {
        const baseHTML = this.generateHTML(sceneData, assets, options);
        
        // Add development-specific features
        const devFeatures = `
    <!-- Development Features -->
    <script src="https://unpkg.com/stats.js@0.17.0/build/stats.min.js"></script>
    <script src="https://unpkg.com/dat.gui@0.7.9/build/dat.gui.min.js"></script>
    
    <div id="dev-info" style="position: absolute; top: 15px; right: 15px; color: #9dd9d9; font-family: monospace; font-size: 11px; background: rgba(0,0,0,0.8); padding: 10px; border-radius: 5px;">
        <div>Development Mode</div>
        <div>Press 'h' for help</div>
    </div>`;
        
        return baseHTML.replace('</body>', `${devFeatures}\n</body>`);
    }
}