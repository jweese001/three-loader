# Claude Code Instructions for Three-Loader Project

## 📝 Project Overview
This is the **3/LOADER** project (v0.0.7) - a Three.js OBJ loader and editor with advanced editing capabilities and primitive geometry support.

## 🎯 Current Status (September 13, 2025)
- **Application Name**: 3/LOADER v0.0.8 (From UI → To UI Workflow Issues)  
- **Branch**: animation-preservation (partial fixes applied)
- **From UI → To UI Workflow**: ⚠️ **PARTIALLY WORKING** - Multiple issues identified and partially resolved
- **Sync Mode**: ✅ Code generation working, ⚠️ "To UI" parsing has remaining issues
- **Next Phase**: **Editable ThreeJS Code View** and **Standalone Export System**
- **Monaco Editor IntelliSense**: ✅ Complete Three.js API with 400%+ coverage expansion
- **UI**: ✅ Modern interface with professional layout and responsive design
- **MatCap System**: ⚠️ Code generation fixed, "To UI" persistence still has issues
- **Animation System**: ⚠️ Orbit/Bounce/XYZ rotation partially fixed, some issues remain
- **Primitive Geometry System**: ✅ FULLY IMPLEMENTED with 20+ geometry types
- **Advanced Lighting**: ✅ FULLY IMPLEMENTED with 10+ light types and shadows
- **Post-Processing**: ✅ FULLY IMPLEMENTED with 15+ visual effects

## ⚠️ Recently Worked Issues (September 13, 2025)

### **LATEST: From UI → To UI Workflow Issues (September 13, 2025)**
**🔧 PARTIAL FIXES APPLIED**: Multiple issues identified and partially resolved in the bidirectional sync workflow.

#### **⚠️ Issues Identified and Partially Fixed**:
1. **Bounce Animation Persistence**: ✅ FIXED - Now preserves original Y position for bouncing from correct base height
2. **MatCap Material Code Generation**: ✅ FIXED - Enhanced path reconstruction for incomplete texture paths ('07.webp' → 'MatCap-Textures/gray/gray_07.webp')
3. **XYZ Rotation Animation**: ✅ FIXED - Updated speed multipliers to match UI behavior (0.7x, 1x, 0.3x instead of uniform speeds)
4. **Orbit Animation Missing**: ✅ FIXED - Added missing orbit animation case in sync mode code generation
5. **MatCap Material "To UI" Persistence**: ⚠️ **STILL HAS ISSUES** - Code generation works but SyncManager material parsing needs enhancement

#### **⚠️ Remaining Issues**:
- **Code View "From UI → To UI" Workflow**: Still has unresolved issues with material and animation persistence
- **MatCap Texture Data**: "To UI" direction not properly capturing MatCap texture information from executed code
- **Material Serialization**: SyncManager needs enhanced material parsing for complex material types

#### **📝 Technical Fixes Applied**:
- **CodeTemplateGenerator**: Fixed bounce animation to preserve original Y position instead of overwriting
- **CodeTemplateGenerator**: Enhanced MatCap texture path reconstruction for incomplete paths
- **CodeTemplateGenerator**: Updated XYZ rotation speeds to match UI behavior (varied instead of uniform)
- **CodeTemplateGenerator**: Added missing orbit animation case in sync mode generation
- **SyncManager**: Enhanced material serialization for MatCap texture capture (partial)

#### **⚠️ Current Status**:
- **From UI Direction**: Code generation mostly working with partial fixes applied
- **To UI Direction**: Still has issues with complex material types and animation persistence
- **MatCap Materials**: Code generation fixed but "To UI" parsing needs more work
- **Debug Tools Created**: Material debugging tools created for future troubleshooting

## 🎯 **NEXT PHASE: Editable ThreeJS Code View & Standalone Export**

### **🔄 Transition from Sync Mode Fixes to Advanced Features**:

#### **📋 Planned Future Development Focus**:
1. **🔧 Editable ThreeJS Code View**: Transform code editor into full Three.js development environment
   - **Real-time Code Execution**: Live editing with immediate viewport updates
   - **Advanced API Support**: Complete Three.js ecosystem integration
   - **Safe Code Sandboxing**: Secure execution environment for user code
   - **Enhanced Debugging**: Comprehensive error handling and debugging tools

2. **📦 Standalone ThreeJS Export**: Complete project export system
   - **Full Project Folders**: Generate self-contained web applications
   - **Asset Bundling**: Include all textures, models, and dependencies
   - **Production-Ready Output**: Optimized HTML/JS for deployment
   - **Cross-Platform Compatibility**: Works in any modern web browser

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

### **📋 Next Implementation Tasks**:
1. **Investigate Current Export Implementation**: Analyze existing Export button functionality
2. **Design Export Folder Structure**: Plan complete project folder organization  
3. **Implement Asset Collection**: Copy textures, OBJ files, and dependencies
4. **Generate Standalone HTML/JS**: Create self-contained web application
5. **Test Standalone Deployment**: Verify exported projects work in any browser

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
- **Code Editor Enhancement**: ✅ **COMPLETE** - Full Three.js development environment with comprehensive API support
- **Current Status**: **Phase 2 COMPLETE** - Extended Three.js API Coverage with Monaco Editor IntelliSense
- **Monaco Editor IntelliSense**: Complete Three.js ecosystem support with 400%+ API coverage expansion
- **Next Phase**: **Phase 3 - Code Editor to Viewport Execution** (Ready for next session)
- **Key Achievements**: Safe code execution, complete API coverage, comprehensive IntelliSense, production-ready exports

## 🎯 **LATEST SESSION RESULTS (August 27, 2025)**
**Status**: ✅ **Scene Loading Issues FULLY RESOLVED**
**Key Accomplishments**: Fixed critical scene loading failures and enhanced CodeAdapter

### **🔧 Issues Debugged & Fixed:**
1. **Export Statement Problem**: Fixed "Unexpected token 'export'" error in exported scenes
2. **Template Corruption**: Identified and resolved massive template duplication in exported files
3. **CodeAdapter Enhancement**: Added comprehensive export statement handling

### **📝 Technical Changes Made:**
- **Enhanced CodeAdapter.js**: Added export statement detection and removal patterns
- **Export Pattern Detection**: New regex `/^export\s+(async\s+)?function\s+/gm` for analysis
- **Conversion Logic**: Transform `export async function` → `async function` during adaptation
- **Clean Test File**: Created `/web/assets/Experimental/CleanedExportedSkullScene.js` for validation
- **Documentation**: Added export handling to both adaptation headers and debug output

### **🎯 Next Priority Identified**: 
**Comment Verbosity Control System** - User requested task added to TASKS.md for controlling generated comment levels and export filtering

## 🎯 **FUTURE SESSION FOCUS: Editable ThreeJS Code View & Standalone Export**
**Status**: ⚠️ **Transition Phase** - From UI → To UI workflow partially fixed
**Next Goal**: Continue work on comprehensive Three.js development environment

### **📝 Remaining Code View Issues Documented**:

#### **⚠️ Known Issues Still Present**:
1. **MatCap Material "To UI" Persistence**: 
   - **Issue**: SyncManager material parsing doesn't properly capture MatCap texture data
   - **Status**: Code generation works correctly, but reverse parsing from executed code fails
   - **Location**: `SyncManager.js` material serialization methods
   - **Debug Tools**: `debug-material-data.html` and `test-matcap-debug.html` created for investigation

2. **Complex Material Type Handling**:
   - **Issue**: "To UI" direction has trouble with advanced material properties
   - **Impact**: Materials may not restore properly when importing code back to UI
   - **Requires**: Enhanced material property extraction from Three.js objects

3. **Animation State Persistence**:
   - **Issue**: Some animation states may not fully persist through the workflow
   - **Status**: Major fixes applied but edge cases may remain
   - **Areas**: Bounce, orbit, XYZ rotation animations

#### **🔧 Technical Debt & Enhancement Opportunities**:
- **SyncManager Enhancement**: Material parsing system needs comprehensive overhaul
- **Error Handling**: More robust error reporting for workflow failures
- **Performance**: Optimization opportunities in bidirectional sync process
- **Testing**: Automated testing framework for workflow validation

### **🚀 Next Phase Implementation**:
**Priority 1**: **Editable ThreeJS Code View** - Transform code editor into full development environment
**Priority 2**: **Standalone Export System** - Complete project folder generation with asset bundling
**Priority 3**: **Code View Workflow Completion** - Resolve remaining "To UI" issues