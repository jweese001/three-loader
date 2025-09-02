# Claude Code Instructions for Three-Loader Project

## 📝 Project Overview
This is the **3/LOADER** project (v0.0.6) - a Three.js OBJ loader and editor with advanced editing capabilities.

## 🎯 Current Status (September 2, 2025)
- **Application Name**: 3/LOADER v0.0.6
- **Branch**: matcap-support ✅ COMPLETED & TESTED (Commit: 5f4fe14)
- **Live Code Generation**: ✅ FULLY IMPLEMENTED with MeshMatcapMaterial support
- **UI**: ✅ Modern file browser interface with texture preview
- **MatCap System**: ✅ FULLY IMPLEMENTED with MeshMatcapMaterial

## ✅ Recently Completed Features (matcap-support branch)
- **MeshMatcapMaterial Implementation**: Full support for Three.js MatCap material type
- **File Browser Interface**: Replaced dropdowns with flexible file selection system
- **600+ MatCap Textures**: Organized in MatCap-Textures directory (16 categories)
- **Live Texture Preview**: 40x40px preview with filename display and clear functionality
- **Enhanced Material System**: 6 material types including proper MatCap support
- **Code Export with MatCap**: Generated code uses correct MeshMatcapMaterial syntax
- **MatCap-Optimized Defaults**: White color, solid rendering, full opacity for best results

## 🔄 Animation System Notes
- **Current**: Simple single-animation system (dropdown + speed slider)
- **Attempted**: Complex animation layering system with blend weights
- **Status**: Reverted due to UI complexity - user wants to redesign approach
- **Next**: User is considering alternative animation combination UI

## 🎨 MatCap System Implementation (matcap-support)

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
- ✅ **MeshMatcapMaterial**: Successfully implemented with proper `matcap` property usage
- ✅ **File Browser System**: Intuitive texture selection with OS file dialog
- ✅ **MatCap-Textures Directory**: 600+ textures organized in 16 categories
- ✅ **Live Preview System**: Texture thumbnails and filename display working
- ✅ **Material Types**: All 6 material types functional (Standard, Basic, Phong, Lambert, Physical, MatCap)
- ✅ **Code Export**: Enhanced to generate proper MeshMatcapMaterial syntax
- ✅ **Memory Management**: Object URL cleanup preventing memory leaks
- ✅ **Branch Status**: matcap-support branch committed with 607 files (commit: 5f4fe14)

## 🚀 Development Guidelines
- **Architecture**: ObjectManager, ExportManager, CodeEditorManager, TextureManager
- **Style**: Clean, modern, monochrome icons preferred
- **Build**: ES6+ with Vite, hot reloading active
- **Testing**: Dev server running on localhost:5175 (three-loader) | localhost:5173 (other projects)