# Claude Code Instructions for Three-Loader Project

## 🚨 IMPORTANT: Next Session Reminder

**⚡ ACTIVE DEVELOPMENT - Live Code Generation Feature**

When starting the next session, IMMEDIATELY remind the user about the **Live Code Generation & Compilation** feature that is currently in development:

### 📋 Quick Summary to Show User:
```
🎯 CURRENT PRIORITY: Live Code Generation & Compilation Feature
📅 Started: September 1, 2025  
🌿 Branch: gltf-support
📍 Status: Phase 2 (Week 2) - ACTIVE DEVELOPMENT

🎯 GOAL: Enable users to:
- Load 3D models → See generated Three.js code ✅
- Edit code directly → See changes instantly in viewport ✅
- Export production-ready code for other projects ✅

📋 CURRENT STATUS:
✅ Phase 1 (Week 1): COMPLETED
- CodeTemplateGenerator.js with animation support
- ExportManager with generateEditableCode()
- Modular code blocks for all properties
- Comprehensive testing (100% success rate)

🎯 Phase 2 (Week 2): COMPLETED
- CodeCompiler.js for parsing edited code
- LiveUpdateManager.js for real-time updates
- Animation code generation and sync
- UI improvements: collapsed panels, compact headers

📁 Full documentation in TASKS.md (lines 92-185)
```

### 🔧 Technical Context:
- User requested "load file, edit code directly, see changes in viewport, export edited file"
- Chose Option 1: Live Code Generation & Compilation approach
- Comprehensive 4-phase implementation plan created
- Architecture analysis completed, ready for development
- All tasks documented in TASKS.md with detailed breakdown

### 💡 User Intent:
Enable advanced users to modify materials, apply custom transforms, and make complex changes through direct Three.js code editing while maintaining real-time visual feedback.

---

## 📝 Project Overview
This is the **three-loader** project - a Three.js OBJ loader and editor with advanced editing capabilities.

## 🎯 Current Session Context
- Working on gltf-support branch
- Phase 1 & Phase 2 COMPLETED (September 1, 2025)
- Live code generation system fully implemented and working
- Animation code sync between UI and code editor working
- UI improvements: collapsed panels, compact design, fixed Hide UI
- Ready for Phase 3 or new feature development

## 🚀 Development Guidelines
- Use existing architecture (ObjectManager, ExportManager, CodeEditorManager)
- Maintain clean modular structure
- Follow ES6+ standards with Vite build system
- Prioritize performance and user experience