# Claude Code Instructions for Three-Loader Project

## 🚨 IMPORTANT: Next Session Reminder

**⚡ ACTIVE DEVELOPMENT - Live Code Generation Feature**

When starting the next session, IMMEDIATELY remind the user about the **Live Code Generation & Compilation** feature that is currently in development:

### 📋 Quick Summary to Show User:
```
🎯 CURRENT PRIORITY: Live Code Generation & Compilation Feature
📅 Started: September 1, 2025  
🌿 Branch: gltf-support
📍 Status: Phase 1 (Week 1) - Ready to begin implementation

🎯 GOAL: Enable users to:
- Load 3D models → See generated Three.js code
- Edit code directly → See changes instantly in viewport
- Export production-ready code for other projects

📋 NEXT STEPS:
Phase 1 Tasks (This Week):
□ Create CodeTemplateGenerator.js
□ Extend ExportManager with generateEditableCode()
□ Build modular code blocks for materials/transforms
□ Add structured code templates with guidance

📁 Full plan documented in TASKS.md (lines 92-185)
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
- Just completed planning phase for live code generation feature
- Ready to begin Phase 1 implementation
- All architecture analysis and planning documentation complete

## 🚀 Development Guidelines
- Use existing architecture (ObjectManager, ExportManager, CodeEditorManager)
- Maintain clean modular structure
- Follow ES6+ standards with Vite build system
- Prioritize performance and user experience