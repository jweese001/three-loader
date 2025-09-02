# Claude Code Instructions for Three-Loader Project

## 📝 Project Overview
This is the **3/LOADER** project (v0.0.6) - a Three.js OBJ loader and editor with advanced editing capabilities.

## 🎯 Current Status (September 2, 2025)
- **Application Name**: 3/LOADER v0.0.6
- **Branch**: matcap-support ✅ COMPLETED & TESTED
- **Live Code Generation**: ✅ FULLY IMPLEMENTED with texture/material support
- **UI**: ✅ Modern, collapsible panels with comprehensive material controls
- **Texture System**: ✅ FULLY INTEGRATED (600+ cosmic textures)

## ✅ Recently Completed Features (matcap-support branch)
- **Comprehensive Texture System**: Integrated cosmic-texture-browser with 600+ textures
- **Material Type Support**: Standard, Basic, Phong, Lambert, Physical materials
- **Texture Categories**: 16 categories (metals, gold, diamonds, iridescent, etc.) with 50 variants each
- **UI Improvements**: Fixed XYZ transform controls, replaced Lock Scale button with checkbox
- **Code Export Enhancement**: Updated to include texture loading and material type selection
- **Path Correction**: Fixed texture loading from `/512/webp/` directory
- **Live Preview**: Real-time texture and material changes in 3D viewport

## 🔄 Animation System Notes
- **Current**: Simple single-animation system (dropdown + speed slider)
- **Attempted**: Complex animation layering system with blend weights
- **Status**: Reverted due to UI complexity - user wants to redesign approach
- **Next**: User is considering alternative animation combination UI

## 🎨 Texture System Implementation (matcap-support)

### Architecture Components
- **TextureManager**: Handles loading, caching, and management of cosmic textures
- **Material Types**: Support for 5 Three.js material types with texture integration
- **UI Integration**: Dropdown selectors for category/variant selection with live preview
- **Code Export**: Enhanced to generate texture loading and material creation code

### File Structure
```
/public/512/webp/
├── black/          (50 variants: 01.webp - 50.webp)
├── blue/           
├── diamonds/       
├── gold/           
├── gray/           
├── green/          
├── iridescent/     
├── metals/         
├── orange/         
├── purple/         
├── red/            
├── skin/           
├── toon/           
├── ultra-realistic/
├── white/          
└── yellow/         
```

### Technical Features
- **Texture Caching**: Prevents duplicate loading of same textures
- **Async Loading**: Non-blocking texture loading with error handling
- **Material Binding**: Live binding of textures to material properties
- **Export Integration**: Generated code includes texture loading paths
- **UI Responsiveness**: Real-time preview of texture/material changes

### Test Results (September 2, 2025)
- ✅ **Server Configuration**: three-loader running on localhost:5175
- ✅ **Texture Path**: Successfully corrected from `/cosmic-texture-browser/public/512/webp/` to `/512/webp/`
- ✅ **File Integration**: 600+ textures properly copied to public directory
- ✅ **UI Controls**: XYZ transform fields responsive, Lock Scale checkbox functional
- ✅ **Code Export**: Enhanced to include texture loading and material type selection
- ✅ **Live Updates**: Real-time material/texture changes working
- ✅ **Branch Status**: matcap-support branch committed with 1,207 files (commit: 50fd8ea)

## 🚀 Development Guidelines
- **Architecture**: ObjectManager, ExportManager, CodeEditorManager, TextureManager
- **Style**: Clean, modern, monochrome icons preferred
- **Build**: ES6+ with Vite, hot reloading active
- **Testing**: Dev server running on localhost:5175 (three-loader) | localhost:5173 (other projects)