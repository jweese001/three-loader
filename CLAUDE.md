# Claude Code Instructions for Three-Loader Project

## 📝 Project Overview
This is the **3/LOADER** project (v0.0.7) - a Three.js OBJ loader and editor with advanced editing capabilities and primitive geometry support.

## 🎯 Current Status (September 9, 2025)
- **Application Name**: 3/LOADER v0.0.7
- **Branch**: main (with primitive geometry support + UI fixes)
- **Live Code Generation**: ✅ FULLY IMPLEMENTED with MeshMatcapMaterial support
- **UI**: ✅ Modern texture section with large preview and professional layout
- **MatCap System**: ✅ FULLY IMPLEMENTED with MeshMatcapMaterial
- **Primitive Geometry System**: ✅ FULLY IMPLEMENTED with 16 geometry types
- **Object Selection**: ✅ FULLY FUNCTIONAL with blue highlighting and material application
- **Lighting System**: ✅ ADVANCED CONTROLS with professional UI design and responsive layout
- **Bug Fixes**: ✅ All critical issues resolved - encoding, selection, overflow, and styling

## ✅ Recently Completed Features (September 9, 2025)

### **NEW: Critical UI and Functionality Fixes**
- **Object Selection System**: Fixed duplicate `selectObject` methods causing selection failures
- **Material Application**: Restored material editing workflow by fixing object selection
- **Active Lights Pane**: Complete design system overhaul with consistent spacing and typography
- **Spotlight Controls**: Fixed position field overflow and enhanced angle slider with real-time degree display
- **UI Design Consistency**: Implemented unified styling across all control panels
- **File Encoding Resolution**: Resolved systematic Vite parsing errors preventing module loading

### **Technical Implementation Details**
- **Dual Parameter Support**: `selectObject()` now handles both `objectId` (number) and `objectData` (object) parameters
- **CSS Grid Optimization**: Proper width constraints (`width: 100%`, `min-width: 0`, `box-sizing: border-box`)
- **Slider Styling**: Applied consistent range slider styling matching app design language
- **Real-time Value Display**: Angle slider shows live degree values with radians-to-degrees conversion
- **Focus States**: Enhanced accessibility with proper focus indicators and smooth transitions
- **Responsive Layout**: All controls properly scale within panel boundaries

## ✅ Previously Completed Features (September 6, 2025)
### **NEW: Primitive Geometry System**
- **Primitive Dropdown**: 16 Three.js geometry types in Load Objects panel
- **Geometry Types**: Box, Sphere, Cylinder, Cone, Plane, Circle, Ring, Torus, TorusKnot, Dodecahedron, Icosahedron, Octahedron, Tetrahedron, Capsule, Lathe, Extrude
- **Complex Geometries**: Custom Lathe (vase-like) and Extrude (star shape) with proper parameters
- **UI Integration**: Clean section divider between primitives and OBJ files
- **Object Management**: Primitives treated as first-class objects with full material/transform support
- **Code Export**: Enhanced code generation for both primitive and OBJ objects
- **Bug Fix**: Resolved variable naming conflict (`points` vs `starPoints`) that was breaking app

### **Previous MatCap System Features**
- **Texture Section Redesign**: Large 120x120px preview with Load/Clear buttons (Commit: 1868eaf)
- **Professional UI Layout**: Placeholder icon, proper positioning, consistent spacing
- **Layout Stability Fixes**: Texture preview always visible, no more disappearing on clear/load
- **Texture Preview Bug Fix**: Prevents texture preview from disappearing when deleting objects (Commit: 3a1668c)
- **MeshMatcapMaterial Implementation**: Full support for Three.js MatCap material type
- **File Browser Interface**: Replaced dropdowns with flexible file selection system
- **600+ MatCap Textures**: Organized in MatCap-Textures directory (16 categories)
- **Enhanced Material System**: 6 material types including proper MatCap support
- **Code Export with MatCap**: Generated code uses correct MeshMatcapMaterial syntax
- **MatCap-Optimized Defaults**: White color, solid rendering, full opacity for best results

## 🔄 Animation System Notes
- **Current**: Simple single-animation system (dropdown + speed slider)
- **Attempted**: Complex animation layering system with blend weights
- **Status**: Reverted due to UI complexity - user wants to redesign approach
- **Next**: User is considering alternative animation combination UI

## ✨ Primitive Geometry System Implementation (v0.0.7)

### Architecture Components
- **ObjectManager.createPrimitive()**: Core method creating 16 geometry types with proper Three.js constructors
- **UI Dropdown Integration**: Clean primitive selection dropdown in Load Objects panel above OBJ files
- **Code Export Enhancement**: CodeTemplateGenerator updated to handle both primitive and OBJ objects
- **Material System Compatibility**: All primitives work with existing 6 material types (Standard, Basic, Phong, Lambert, Physical, MatCap)
- **Transform & Animation Support**: Primitives treated as first-class objects with full editor capabilities

### Supported Primitive Geometries
```javascript
// Basic Shapes
- BoxGeometry(2, 2, 2)
- SphereGeometry(1.5, 32, 16)
- CylinderGeometry(1, 1, 2, 32)
- ConeGeometry(1, 2, 32)
- PlaneGeometry(3, 3)
- CircleGeometry(1.5, 32)

// Advanced Shapes  
- RingGeometry(0.5, 1.5, 32)
- TorusGeometry(1.2, 0.4, 16, 100)
- TorusKnotGeometry(1, 0.3, 100, 16)
- CapsuleGeometry(0.8, 1.6, 4, 8)

// Polyhedra
- DodecahedronGeometry(1.5)
- IcosahedronGeometry(1.5) 
- OctahedronGeometry(1.5)
- TetrahedronGeometry(1.5)

// Complex Geometries
- LatheGeometry: Custom vase-like profile with 10 points
- ExtrudeGeometry: 5-pointed star shape with beveling
```

### Technical Implementation
- **Variable Scope Management**: Proper variable naming to avoid conflicts (e.g., `starPoints` vs `points`)
- **Object Metadata**: Primitives flagged with `isPrimitive: true` and `primitiveType: 'geometry'`
- **Code Generation**: Different export templates for primitive vs OBJ objects
- **Error Handling**: Comprehensive try-catch blocks and element validation
- **UI State Management**: Button enable/disable based on dropdown selection

## 🎨 MatCap System Implementation

### Architecture Components
- **MeshMatcapMaterial**: Native Three.js MatCap material support with proper `matcap` property
- **TextureManager**: File-based texture loading with `loadTextureFromFile()` method
- **File Browser UI**: Intuitive file selection interface with live preview
- **Material System**: 6 material types (Standard, Basic, Phong, Lambert, Physical, MatCap)
- **Code Export**: Enhanced to generate proper MeshMatcapMaterial syntax

### File Structure
```
/MatCap-Textures/
├── black/          (22 textures: 01.webp - 22.webp)
├── blue/           (45 textures)
├── diamonds/       (33 textures: 10.webp - 42.webp)
├── gold/           (29 textures: 01.webp - 29.webp)
├── gray/           (100+ textures: extensive collection)
├── green/          (34 textures: 01.webp - 34.webp)
├── iridescent/     (45 textures: 01.webp - 45.webp)
├── metals/         (28 textures: 01.webp - 28.webp)
├── orange/         (12 textures)
├── purple/         (18 textures: 01.webp - 18.webp)
├── red/            (19 textures: 01.webp - 19.webp)
├── skin/           (15 textures)
├── toon/           (80 textures: 01.webp - 80.webp)
├── ultra-realistic/ (24 textures: 01.webp - 24.webp)
├── white/          (42 textures: 01.webp - 42.webp)
└── yellow/         (20 textures: 01.webp - 20.webp)
```

### Technical Features
- **MeshMatcapMaterial**: Uses `matcap` property (not `map`) for proper MatCap rendering
- **File Browser**: Select any texture file (.webp, .jpg, .jpeg, .png) with OS file dialog
- **Live Preview**: 40x40px thumbnail with filename display and clear button
- **Memory Management**: Proper object URL cleanup to prevent memory leaks
- **Texture Caching**: File-based caching with unique keys (`file_${name}_${lastModified}`)
- **Export Integration**: Generated code includes proper MatCap texture loading paths

### Test Results (September 2, 2025)
- ✅ **Texture Section Redesign**: Large preview positioned after Metalness per user mockup (commit: 1868eaf)
- ✅ **Professional Placeholder**: Mountain icon SVG placeholder when no texture loaded
- ✅ **Layout Stability**: Fixed texture preview disappearing on clear/OBJ load
- ✅ **Button Positioning**: Load/Clear buttons properly positioned next to preview
- ✅ **Texture Opacity Removal**: Completely removed texture opacity slider (not needed)
- ✅ **MeshMatcapMaterial**: Successfully implemented with proper `matcap` property usage
- ✅ **File Browser System**: Intuitive texture selection with OS file dialog
- ✅ **MatCap-Textures Directory**: 600+ textures organized in 16 categories
- ✅ **Material Types**: All 6 material types functional (Standard, Basic, Phong, Lambert, Physical, MatCap)
- ✅ **Code Export**: Enhanced to generate proper MeshMatcapMaterial syntax
- ✅ **Memory Management**: Object URL cleanup preventing memory leaks
- ✅ **Texture Preview Bug Fix**: Fixed texture preview disappearing on object deletion (commit: 3a1668c)
- ✅ **Branch Status**: matcap-support branch committed and pushed (latest: 3a1668c)

## 🚀 Development Guidelines
- **Architecture**: ObjectManager, ExportManager, CodeEditorManager, TextureManager, UIController, LightingManager
- **Core Methods**: 
  - `ObjectManager.loadOBJFile()` - OBJ file loading
  - `ObjectManager.createPrimitive()` - Primitive geometry creation
  - `CodeTemplateGenerator.generateEditableCode()` - Enhanced code export
  - `UIController.selectObject()` - Object selection with dual parameter support
  - `LightingManager.updateLight()` - Dynamic light configuration
- **Style**: Clean, modern, monochrome icons preferred
- **Build**: ES6+ with Vite, hot reloading active
- **Testing**: Dev server running on localhost:5173 (three-loader)
- **Variable Naming**: Always check for naming conflicts in geometry creation (learned from `points` variable issue)
- **Error Handling**: Comprehensive try-catch blocks especially in UI setup methods
- **UI Consistency**: All panels follow consistent spacing, typography, and interaction patterns

## 📋 **Three.js Development Reference**
- **Implementation Plan**: See `IMPLEMENTATION_PLAN_ENHANCED_THREEJS_CODE_EDITOR.md` for comprehensive roadmap
- **Code Editor Enhancement**: When working on Three.js, ThreeJS, or Three.js related features, always reference the implementation plan
- **Current Limitations**: Code editor currently supports basic material/transform changes only
- **Future Vision**: Transform into comprehensive Three.js development environment with full API support
- **Key Focus Areas**: Safe code execution, complete API coverage, production-ready exports, real-time collaboration