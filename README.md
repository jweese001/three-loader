# Three.js OBJ Loader & Editor

A professional web-based Three.js editor for loading, editing, and exporting OBJ files with real-time material and transform controls.

## 🚀 Features

### 📁 **File Loading**
- **Drag & Drop Support** - Drop .obj files directly onto the interface
- **File Browser** - Click to select multiple OBJ files
- **Real-time Processing** - Automatic centering, scaling, and material application
- **Error Handling** - Comprehensive error reporting and fallbacks

### 🎨 **Material Editor**
- **Color Picker** - Real-time color adjustment with hex values
- **Wireframe Toggle** - Switch between solid and wireframe rendering
- **Opacity Control** - Transparent materials with smooth blending
- **PBR Properties** - Roughness and metalness for realistic materials
- **Live Preview** - All changes applied instantly to the 3D scene

### 📐 **Transform Controls**
- **Position** - X, Y, Z coordinate adjustment
- **Rotation** - Euler angle rotation (degrees converted to radians)
- **Scale** - Individual or uniform scaling with lock/unlock toggle
- **Real-time Updates** - Immediate visual feedback for all transformations

### 🎯 **Scene Management**
- **Object List** - View all loaded objects with statistics
- **Object Selection** - Click to select and edit individual objects
- **Camera Focus** - Automatically frame selected objects
- **Object Deletion** - Remove objects with confirmation
- **Scene Clearing** - Clear all objects at once

### 🎮 **Viewport Controls**
- **Orbit Controls** - Mouse interaction for camera movement
- **Camera Reset** - Return to default viewing position
- **Wireframe Toggle** - Quick wireframe mode switching
- **Fullscreen Mode** - Immersive editing experience

### 📤 **Export System**
- **Clean Code Generation** - Production-ready Three.js code
- **Complete Scene Export** - Includes lighting, camera, and all objects
- **Copy to Clipboard** - Quick code copying with visual feedback
- **File Download** - Save generated code as .js files
- **Usage Examples** - Clear documentation in exported code

## 🛠️ Technical Architecture

### **Modern ES6+ Structure**
```
three-loader/
├── src/
│   ├── main.js              # Application entry point
│   ├── core/
│   │   └── Scene.js         # Three.js scene management
│   ├── loaders/
│   │   └── ObjectManager.js # OBJ file loading and processing
│   ├── ui/
│   │   └── UIController.js  # User interface management
│   ├── export/
│   │   └── ExportManager.js # Code generation system
│   └── utils/
│       └── AnimationController.js # Animation system (extensible)
├── styles/
│   ├── main.css             # Core application styles
│   └── editor.css           # Editor-specific styles
└── examples/
    └── spiked.obj           # Sample OBJ file for testing
```

### **Key Technologies**
- **Three.js r179** - 3D rendering and scene management
- **Vite** - Fast development server and building
- **ES6 Modules** - Modern JavaScript architecture
- **CSS Grid & Flexbox** - Responsive layout system
- **Web APIs** - File handling, clipboard, fullscreen

### **Performance Features**
- **Hot Module Replacement** - Instant development updates
- **Efficient Rendering** - Optimized Three.js render loop
- **Memory Management** - Proper cleanup and disposal
- **Responsive Design** - Works on desktop and mobile devices

## 🚀 Getting Started

### **Prerequisites**
- Node.js 16+ 
- NPM or Yarn
- Modern web browser with WebGL support

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd three-loader

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Usage**
1. **Open the application** at `http://localhost:5173`
2. **Load OBJ files** by dragging them onto the drop zone or clicking "Choose Files"
3. **Select objects** from the list to edit their properties
4. **Adjust materials** using the color picker, wireframe toggle, and sliders
5. **Transform objects** with position, rotation, and scale controls
6. **Export your scene** by clicking "Export Code" for reusable Three.js code

## 🎯 Code Export

The application generates clean, production-ready Three.js code that includes:

- **Complete scene setup** with camera, renderer, and controls
- **Professional lighting** with shadows and multiple light sources
- **Object loading logic** with error handling and material application
- **Transform preservation** maintaining all your edits
- **Usage examples** and cleanup instructions

### **Example Generated Code**
```javascript
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export function createThreeScene(container) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    // Your objects and settings here...
    
    return { scene, camera, renderer, controls };
}
```

## 🎨 Design Philosophy

### **Professional Interface**
- **Dark Theme** - Reduces eye strain during long editing sessions
- **Clear Hierarchy** - Logical grouping of controls and information
- **Visual Feedback** - Immediate response to user interactions
- **Accessibility** - Keyboard navigation and screen reader support

### **Developer Experience**
- **Fast Hot Reloading** - See changes instantly during development
- **Clear Code Structure** - Modular architecture for easy extension
- **Comprehensive Logging** - Detailed console output for debugging
- **Error Boundaries** - Graceful handling of edge cases

## 🔧 Development

### **Available Scripts**
```bash
npm run dev      # Start development server with hot reloading
npm run build    # Build for production
npm run preview  # Preview production build locally
```

### **Extension Points**
The architecture is designed for easy extension:

- **New File Formats** - Add loaders in `src/loaders/`
- **Animation Systems** - Extend `AnimationController.js`
- **Export Formats** - Add generators in `src/export/`
- **UI Components** - Extend `UIController.js`

## 🏗️ Future Roadmap

### **Planned Features**
- **Animation System** - Keyframe-based animations with timeline
- **Multiple File Formats** - GLTF, FBX, Collada support
- **Material Library** - Preset materials and texture support
- **Scene Templates** - Pre-configured lighting and camera setups
- **Collaboration** - Share scenes and export settings
- **Performance Optimization** - LOD system and object pooling

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for any improvements.

---

**Built with ❤️ using Three.js and modern web technologies**