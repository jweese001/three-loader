# PRD: glTF Import and Export Capability

**Author:** Gemini Agent
**Date:** August 31, 2025
**Status:** Proposed

## 1. Introduction & Summary

This document outlines the requirements for adding support for the glTF (GL Transmission Format) to the Three.js OBJ Loader & Editor. The new feature will enable users to import, edit, and export 3D models in both `.gltf` and `.glb` formats. This will expand the editor's capabilities beyond OBJ and position it as a more versatile and modern 3D editing tool.

## 2. Goals & Rationale

The OBJ format, while widely supported, is aging. glTF has become the industry standard for transmitting 3D scenes and models due to its efficiency, flexibility, and rich feature set (e.g., PBR materials, animations, scene graph hierarchy).

- **Goal 1: Modernize the Tool:** Align the editor with current industry standards for 3D asset delivery.
- **Goal 2: Expand User Base:** Attract users who work primarily with glTF assets.
- **Goal 3: Enhance Functionality:** Allow users to leverage glTF's advanced features, which are not available in the OBJ format.
- **Goal 4: Maintain Workflow Consistency:** Integrate glTF support seamlessly into the existing user interface and workflow.

## 3. User Stories

- As a **3D artist**, I want to be able to drag and drop a `.glb` file into the editor so I can quickly edit its materials and transforms.
- As a **web developer**, I want to import a `.gltf` model, adjust its scale and position, and export it back as a `.glb` file for optimal web performance.
- As a **user**, I want the application to handle both `.gltf` (JSON + binary files) and `.glb` (binary bundle) formats automatically, so I don't have to worry about the underlying file structure.
- As a **user**, when I export my scene, I want the option to choose between glTF and the existing OBJ/JavaScript formats, so I can get the output I need for my specific pipeline.

## 4. Functional Requirements

### 4.1. glTF Import

- **File Support:** The editor must support both `.gltf` and `.glb` file formats.
- **Import Mechanism:**
    - The existing drag-and-drop zone must be updated to accept `.gltf` and `.glb` files.
    - The "Choose Files" button must also be updated to allow selection of these file types.
- **Scene Graph:** The importer must correctly parse the glTF scene graph, including nested object hierarchies. The `ObjectManager` should represent this hierarchy.
- **Material Handling:** The importer must read and apply PBR (Physically-Based Rendering) materials from the glTF file. This includes base color, metalness, roughness, and textures.
- **Automatic Processing:** Imported glTF models should undergo the same automatic centering and scaling process as existing OBJ models to ensure they are immediately visible and usable.

### 4.2. Editing & Scene Integration

- **Object Listing:** The "Scene Objects" list should display the imported glTF model's hierarchy. Parent and child nodes should be visually represented (e.g., with indentation).
- **Material Editing:** The existing "Material Editor" panel must be able to modify the materials of a selected glTF mesh. Changes to color, opacity, roughness, and metalness should be applied in real-time.
- **Transform Editing:** The "Transform" panel must work for any selected node (mesh or group) within the glTF scene, allowing for adjustments to its position, rotation, and scale.

### 4.3. glTF Export

- **Export Option:** The UI must provide a clear way to export the scene in glTF format. This could be a new "Export as glTF" button or an option within the existing export flow.
- **Format Choice:** Users should be able to choose between exporting as `.gltf` (JSON + .bin + textures) or `.glb` (single binary file). The default should be `.glb` for its portability.
- **Data Preservation:** The exporter must preserve:
    - The scene graph hierarchy.
    - All material properties and edits made in the editor.
    - All transform (position, rotation, scale) adjustments.
- **Exporter Implementation:** The `GLTFExporter` from Three.js should be used to handle the export process.

## 5. Non-Functional Requirements

- **Performance:** The import process for glTF files should be efficient and not block the main thread for an unreasonable amount of time. A loading indicator must be displayed during import.
- **Error Handling:** The application must gracefully handle invalid or corrupted glTF files, displaying a user-friendly error message without crashing.
- **UI/UX Consistency:** The entire glTF workflow should feel native to the application. All new UI elements must adhere to the existing style guide (`styles/main.css` and `styles/editor.css`).
- **Backward Compatibility:** The existing OBJ import/export functionality must remain fully functional and unaffected.

## 6. Technical Considerations

- **Dependencies:**
    - `GLTFLoader.js` must be imported from `three/examples/jsm/loaders/GLTFLoader.js`.
    - `GLTFExporter.js` must be imported from `three/examples/jsm/exporters/GLTFExporter.js`.
- **Module Updates:**
    - **`ObjectManager.js`:** Will require significant updates to handle the `GLTFLoader` and process the more complex scene graph of glTF files. It will need to differentiate between OBJ and glTF models.
    - **`UIController.js`:** The file handling logic (`handleFiles`) and object list rendering (`updateObjectsList`) will need to be updated.
    - **`ExportManager.js`:** Will need a new method to handle glTF export using `GLTFExporter`, separate from the current JavaScript code generation.
- **Vite Configuration:** No changes to `vite.config.js` are anticipated, as the new dependencies are part of the standard `three` package.

## 7. Out of Scope

- **Animation Import/Export:** This initial implementation will **not** support the import, editing, or export of animations embedded within glTF files. The focus is on static models first.
- **Texture Editing:** While textures will be loaded and applied, the editor will not provide tools to add, remove, or edit texture maps themselves.
- **Advanced Material Properties:** Support will be limited to the PBR properties already in the Material Editor. Other properties like emissive maps, normal maps, or occlusion maps will be loaded but not editable through the UI.
- **Draco Compression:** Import/export of Draco-compressed glTF files will not be supported in this phase.
