# 📁 Export Folder System Design

## 🎯 **Purpose**
Transform the Export button from generating editable code snippets to creating complete, standalone Three.js project folders ready for web deployment.

## 📋 **Current State vs Required State**

### **❌ Current Export Button (INCORRECT)**
- Generates editable Three.js code snippets
- Shows code in modal dialog
- No assets included
- Same functionality as "From UI" button
- Not self-contained or deployable

### **✅ Required Export Button (NEW FUNCTIONALITY)**
- Generates complete project folder with HTML + JS + Assets
- Creates deployable web application
- Includes all referenced assets (OBJ files, textures, etc.)
- Self-contained - works in any web browser
- Separate purpose from development workflow buttons

## 🏗️ **Export Folder Structure**

```
[Scene_Name]_Export_[Timestamp]/
├── index.html              # Main HTML file with embedded Three.js
├── js/
│   ├── scene.js           # Scene creation and object loading
│   ├── three.min.js       # Three.js library (CDN or local)
│   └── loaders/
│       ├── OBJLoader.js   # OBJ loader if needed
│       └── OrbitControls.js # Camera controls
├── assets/
│   ├── models/
│   │   ├── spiked.obj     # Copy of all OBJ files used
│   │   └── [other_models.obj]
│   ├── textures/
│   │   ├── matcaps/
│   │   │   ├── gray_01.webp # Copy of MatCap textures used
│   │   │   └── [other_matcaps.webp]
│   │   ├── normal/
│   │   └── roughness/
│   └── README.md          # Asset attribution and usage info
└── package.json           # Optional - for npm deployment
```

## 📄 **File Templates**

### **index.html Structure**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Three.js Scene - Exported from 3/LOADER</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #000;
            font-family: Arial, sans-serif;
            overflow: hidden;
        }
        
        #scene-container {
            width: 100vw;
            height: 100vh;
        }
        
        #loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 18px;
        }
        
        #info {
            position: absolute;
            top: 10px;
            left: 10px;
            color: white;
            background: rgba(0,0,0,0.7);
            padding: 10px;
            border-radius: 5px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div id="scene-container"></div>
    <div id="loading">Loading Three.js Scene...</div>
    <div id="info">
        <strong>Exported from 3/LOADER</strong><br>
        Objects: {{OBJECT_COUNT}}<br>
        Generated: {{TIMESTAMP}}
    </div>
    
    <!-- Three.js Library -->
    <script src="https://unpkg.com/three@0.155.0/build/three.min.js"></script>
    <script src="https://unpkg.com/three@0.155.0/examples/js/controls/OrbitControls.js"></script>
    <script src="https://unpkg.com/three@0.155.0/examples/js/loaders/OBJLoader.js"></script>
    
    <!-- Scene Implementation -->
    <script src="js/scene.js"></script>
</body>
</html>
```

### **scene.js Structure**
```javascript
// Three.js Scene - Exported from 3/LOADER
// Generated: {{TIMESTAMP}}
// Objects: {{OBJECT_COUNT}}

let scene, camera, renderer, controls;
let loadingElement;

// Initialize the scene
function init() {
    loadingElement = document.getElementById('loading');
    
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color({{BACKGROUND_COLOR}});
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set({{CAMERA_POSITION}});
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor({{BACKGROUND_COLOR}});
    renderer.shadowMap.enabled = {{SHADOWS_ENABLED}};
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    document.getElementById('scene-container').appendChild(renderer.domElement);
    
    // Controls setup
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Load scene objects
    loadSceneObjects();
    
    // Start animation loop
    animate();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

// Load all scene objects
function loadSceneObjects() {
    {{LIGHTING_CODE}}
    
    {{OBJECTS_CODE}}
    
    // Hide loading message
    setTimeout(() => {
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }, 1000);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    {{ANIMATION_CODE}}
    
    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize when page loads
window.addEventListener('load', init);
```

## 🔧 **Implementation Architecture**

### **New Classes Needed**
1. **`ProjectExporter.js`** - Main export orchestration
2. **`AssetCollector.js`** - Find and copy all referenced assets  
3. **`HTMLGenerator.js`** - Generate index.html from template
4. **`SceneCodeGenerator.js`** - Generate scene.js from scene state
5. **`FolderManager.js`** - Handle folder creation and file operations

### **Export Workflow**
1. **Analyze Scene**: Identify all objects, materials, textures, OBJ files
2. **Collect Assets**: Copy all referenced files to assets folder
3. **Generate HTML**: Create index.html with proper structure  
4. **Generate JS**: Create scene.js with all objects/animations/lighting
5. **Create Folder**: Organize everything in timestamped folder
6. **ZIP/Download**: Offer download as ZIP file

### **Asset Detection Logic**
```javascript
// Pseudo-code for asset collection
const collectAssets = (objects, sceneData) => {
    const assets = {
        models: new Set(),
        textures: new Set(),
        libraries: new Set(['three.min.js'])
    };
    
    // Scan objects for asset references
    objects.forEach(obj => {
        // OBJ files
        if (!obj.isPrimitive && obj.fileName) {
            assets.models.add(obj.fileName);
        }
        
        // Textures (MatCap, normal maps, etc.)
        if (obj.material?.matcapTexture) {
            assets.textures.add(obj.material.matcapTexture);
        }
        if (obj.material?.normalMap) {
            assets.textures.add(obj.material.normalMap);
        }
        
        // Determine needed loaders
        if (obj.fileName?.endsWith('.obj')) {
            assets.libraries.add('OBJLoader.js');
        }
    });
    
    // Add controls if camera movement enabled
    assets.libraries.add('OrbitControls.js');
    
    return assets;
};
```

## 🎯 **User Experience**

### **Export Button Flow**
1. User clicks "Export" button
2. System analyzes scene and collects assets
3. Show progress dialog: "Creating project folder..."
4. Generate complete folder structure
5. Present download dialog or file save location
6. User gets ready-to-deploy web application

### **Export Options (Future)**
- **Export Format**: ZIP file vs folder selection
- **CDN vs Local**: Use CDN links vs bundled Three.js files
- **Optimization**: Minified vs readable code
- **Asset Quality**: Original vs compressed textures

## ✅ **Success Criteria**
1. **Complete Folder**: All HTML, JS, and assets included
2. **Self-Contained**: Works offline in any modern browser
3. **Asset Integrity**: All textures and models correctly referenced
4. **Professional Output**: Clean, deployable web application
5. **User-Friendly**: Simple download and run process

## 🚀 **Implementation Priority**
1. **Phase 1**: Basic HTML + JS generation with CDN Three.js
2. **Phase 2**: Asset collection and copying system
3. **Phase 3**: Advanced options and optimization features
4. **Phase 4**: ZIP packaging and download management

This design transforms the Export button into a complete project deployment system while maintaining clear separation from the development workflow buttons.