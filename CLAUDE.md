# Claude Code Instructions for Three-Loader Project

## 📝 Project Overview
This is the **3/LOADER** project (v0.0.7) - a Three.js OBJ loader and editor with advanced editing capabilities and primitive geometry support.

## 🎯 Current Status (September 13, 2025)
- **Application Name**: 3/LOADER v0.0.9 (Standalone Export System Complete)
- **Branch**: main (standalone export system completed)
- **Export System**: ✅ **FULLY IMPLEMENTED** - Complete dual-workflow export system
- **Standalone Project Export**: ✅ **COMPLETE** - Full project folder generation with asset bundling
- **Code Export Workflow**: ✅ **COMPLETE** - Enhanced development workflow with comprehensive options
- **Next Phase**: **Enhanced Three.js Development Environment** (Real-time code execution)
- **Monaco Editor IntelliSense**: ✅ Complete Three.js API with 400%+ coverage expansion
- **UI**: ✅ Modern interface with professional layout and responsive design
- **MatCap System**: ⚠️ Code generation fixed, "To UI" persistence still has issues
- **Animation System**: ⚠️ Orbit/Bounce/XYZ rotation partially fixed, some issues remain
- **Primitive Geometry System**: ✅ FULLY IMPLEMENTED with 20+ geometry types
- **Advanced Lighting**: ✅ FULLY IMPLEMENTED with 10+ light types and shadows
- **Post-Processing**: ✅ FULLY IMPLEMENTED with 15+ visual effects

## ✅ Recently Completed Features (September 13, 2025)

### **LATEST: Standalone Export System Implementation (September 13, 2025)**
**✅ FULLY IMPLEMENTED**: Complete dual-workflow export system with centralized asset management and project-relative path generation.

#### **✅ Key Components Implemented**:
1. **Centralized Asset Management**: ProjectManager with UUID-based asset organization and project-relative paths
2. **Startup Project Dialog**: ProjectDialog component for project initialization and folder structure setup
3. **Enhanced Export Modal**: Redesigned UI with two distinct export workflows (Code Export vs Standalone Project)
4. **ProjectExporter Integration**: Updated to use centralized asset paths for reliable asset bundling
5. **Complete Workflow Testing**: Comprehensive test documentation with step-by-step validation procedures

#### **✅ Technical Implementation Details**:
- **ProjectManager**: Centralized file copying with UUID-based naming and path management
- **ProjectExporter**: Enhanced asset collection using project-relative paths instead of direct filenames
- **ExportManager**: Updated constructor to integrate ProjectManager with export workflows
- **UIController**: Complete export modal workflow with progress indicators and error handling
- **CSS Styling**: Professional export modal design with option cards and responsive layout

#### **📦 Export System Features**:
1. **Code Export Workflow**:
   - Generates editable Three.js code snippets for development
   - Configurable options (viewport size, comments, CDN vs local imports)
   - Perfect for learning, modification, and integration workflows

2. **Standalone Project Export**:
   - Creates complete self-contained web applications
   - Bundles all assets (models, textures, dependencies) with proper relative paths
   - Generates deployment-ready HTML/JS for portfolio websites and client delivery
   - Uses File System Access API for browser-based folder generation

#### **✅ Current Status**:
- **Both Export Workflows**: Fully functional with comprehensive UI and backend systems
- **Asset Management**: Complete centralized system with UUID organization and project-relative paths
- **Testing Documentation**: Professional test procedures with validation checklists and troubleshooting guides
- **Production Ready**: All components integrated and ready for real-world usage

## 🎯 **NEXT PHASE: Enhanced Three.js Development Environment**

### **🚀 Ready for Advanced Features Implementation**:

#### **📋 Future Development Focus (Next Session)**:
1. **🔧 Real-time Code Execution**: Transform code editor into full Three.js development environment
   - **Live Code-to-Viewport**: Execute code directly in viewport with immediate visual updates
   - **Safe Execution Sandbox**: Secure code evaluation environment with error boundaries
   - **Enhanced Debugging**: Real-time error reporting and comprehensive debugging tools
   - **Performance Monitoring**: Code execution profiling and optimization suggestions

2. **🎛️ Advanced Development Tools**: Complete Three.js ecosystem integration
   - **Interactive Code Panels**: Drag-and-drop code blocks for rapid prototyping
   - **Scene Graph Visualization**: Real-time scene hierarchy browser with direct editing
   - **Performance Analytics**: Frame rate monitoring, memory usage, and optimization insights
   - **Collaborative Features**: Real-time code sharing and collaborative editing capabilities

## 🚀 **NEW PHASE: Button Purpose Clarification & Export Folder System**

### **📋 Button Purpose Definitions (September 12, 2025)**:

#### **Code Editor Workflow Buttons**:
1. **"From UI" Button**: Generate **editable Three.js code** from Studio UI state (development workflow)
2. **"To UI" Button**: Execute **editable Three.js code** and sync back to Studio UI viewport  
3. **"Save" Button**: Save **editable Three.js code** to file (code persistence)
4. **"Load" Button**: Load **editable Three.js code** from file (code restoration)

#### **Deployment Workflow Button**:
5. **"Export" Button**: Generate **complete project folder** containing:
   - **HTML file** (main scene file)
   - **JavaScript files** (scene logic and dependencies)  
   - **Supporting textures** (MatCap textures, normal maps, etc.)
   - **OBJ files** (3D model assets)
   - **Any other imports** needed for standalone web deployment

### **🎯 Key Distinction**:
- **Development Workflow**: Code Editor buttons work with **editable code snippets**
- **Deployment Workflow**: Export button creates **complete standalone project folders**

### **✅ Implementation Tasks Completed**:
1. **✅ Export Implementation Analysis**: Comprehensive analysis and enhancement of Export button functionality
2. **✅ Export Folder Structure**: Complete project folder organization with proper asset subdirectories
3. **✅ Asset Collection System**: Centralized asset copying with UUID-based naming and project-relative paths
4. **✅ Standalone HTML/JS Generation**: Full self-contained web application creation with proper imports
5. **✅ Deployment Testing**: Complete test documentation with validation procedures and troubleshooting guides

### **PREVIOUS: Phase 2.3 - Monaco Editor Three.js IntelliSense (COMPLETE)**
- **Comprehensive API Integration**: Full integration with APIRegistry for 20+ geometries, 15+ materials, 10+ lights
- **Enhanced Type Definitions**: Dynamic TypeScript definitions generated from APIRegistry data
- **Advanced Autocomplete**: Smart parameter detection with type hints and sensible defaults  
- **Rich Documentation**: Hover information with parameter details and property descriptions
- **Code Snippets**: API-generated snippets for materials, lighting, and post-processing effects
- **Real-time Error Checking**: Complete TypeScript support with comprehensive validation
- **400%+ API Coverage Expansion**: From basic classes to complete Three.js ecosystem

### **Technical Implementation Details**
- **APIRegistry Integration**: `ThreeJsIntelliSense` class now uses comprehensive API data
- **Dynamic Content Generation**: Type definitions and completions auto-generated from registry
- **Enhanced UX**: Parameter placeholders, category displays, and professional documentation
- **Production Ready**: Full error checking and comprehensive Three.js ecosystem support

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
- **Standalone Export System**: ✅ **COMPLETE** - Full dual-workflow export system with asset management
- **Current Status**: **Phase 2 & 3 COMPLETE** - Export system and centralized asset management fully implemented
- **Monaco Editor IntelliSense**: Complete Three.js ecosystem support with 400%+ API coverage expansion
- **Next Phase**: **Phase 4 - Real-time Code Execution Environment** (Ready for next session)
- **Key Achievements**: Centralized asset management, dual export workflows, comprehensive testing documentation, production-ready deployment system

## 🎯 **LATEST SESSION RESULTS (September 13, 2025)**
**Status**: ✅ **STANDALONE EXPORT SYSTEM FULLY IMPLEMENTED**
**Key Accomplishments**: Complete dual-workflow export system with centralized asset management

### **🔧 Major Features Implemented:**
1. **Centralized Asset Management**: ProjectManager with UUID-based organization and project-relative paths
2. **Startup Project Dialog**: ProjectDialog component for project initialization and setup
3. **Enhanced Export Modal**: Dual-workflow UI (Code Export vs Standalone Project Export)
4. **Complete Asset Bundling**: Automatic asset collection and proper relative path generation
5. **Comprehensive Testing**: Professional test documentation with validation procedures

### **📝 Technical Implementation Details:**
- **ProjectManager Enhancement**: Centralized file copying with UUID naming and path management
- **ProjectExporter Integration**: Updated to use project-relative paths for reliable asset bundling
- **ExportManager Updates**: Integrated ProjectManager with both export workflows
- **UI/UX Enhancement**: Professional export modal with option cards and progress indicators
- **CSS Styling**: Complete responsive design with modern interaction patterns

### **🚀 Production-Ready Features:**
- **Code Export**: Generates editable Three.js code for development workflows
- **Standalone Project Export**: Creates complete web applications with asset bundling
- **Cross-Platform Deployment**: File System Access API for browser-based folder generation
- **Comprehensive Documentation**: Complete testing procedures and troubleshooting guides

## 🎯 **FUTURE SESSION FOCUS: Enhanced Three.js Development Environment**
**Status**: ✅ **Ready for Next Phase** - Standalone export system complete, ready for advanced features
**Next Goal**: Transform application into comprehensive Three.js development environment

### **🚀 Next Session Priorities**:

#### **🎯 Phase 4 Implementation Focus**:
1. **Real-time Code Execution Environment**:
   - **Live Code-to-Viewport**: Execute Monaco editor code directly in viewport with immediate updates
   - **Safe Execution Sandbox**: Secure code evaluation with error boundaries and resource limits
   - **Enhanced Error Reporting**: Real-time syntax checking and runtime error visualization
   - **Performance Profiling**: Code execution timing and optimization suggestions

2. **Advanced Development Tools**:
   - **Interactive Scene Graph**: Real-time hierarchy visualization with drag-and-drop editing
   - **Dynamic API Browser**: Live Three.js documentation with instant code insertion
   - **Performance Analytics**: Frame rate monitoring, memory usage tracking, and optimization insights
   - **Advanced Debugging**: Step-through execution, variable inspection, and breakpoint management

#### **🔧 Technical Implementation Roadmap**:
- **Code Execution Engine**: Secure JavaScript evaluation system with sandboxing
- **Viewport Integration**: Real-time scene updates from executed code changes
- **Development UX**: Professional IDE-like features with advanced debugging capabilities
- **Performance Optimization**: Efficient code execution with resource management

#### **⚠️ Legacy Issues for Future Sessions**:
- **MatCap "To UI" Persistence**: SyncManager material parsing enhancement (lower priority)
- **Complex Material Handling**: Enhanced material property extraction (lower priority)
- **Animation State Edge Cases**: Remaining sync workflow issues (lower priority)

### **📈 Project Evolution**:
**Phase 1-3 Complete**: Export system, asset management, and comprehensive testing documentation
**Phase 4 Ready**: Real-time development environment transformation