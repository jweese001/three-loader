import * as monaco from 'monaco-editor';
import { APIRegistry } from '../codegen/APIRegistry.js';

export class ThreeJsIntelliSense {
    constructor() {
        this.isInitialized = false;
        this.customCompletionProvider = null;
        this.hoverProvider = null;
        this.signatureProvider = null;
        
        // Phase 2.3: Enhanced API integration
        this.apiRegistry = new APIRegistry();
        console.log('🧠 ThreeJsIntelliSense initialized with comprehensive API registry');
    }
    
    async initialize() {
        if (this.isInitialized) return;
        
        console.log('🧠 Initializing Three.js IntelliSense...');
        
        // Configure TypeScript/JavaScript compiler options for Three.js
        this.setupCompilerOptions();
        
        // Add Three.js type definitions
        await this.addThreeJsTypeDefinitions();
        
        // Register custom completion provider
        this.registerCompletionProvider();
        
        // Register hover provider for API documentation
        this.registerHoverProvider();
        
        // Register signature help provider
        this.registerSignatureProvider();
        
        // Add custom snippets
        this.addThreeJsSnippets();
        
        this.isInitialized = true;
        console.log('✅ Three.js IntelliSense initialized successfully');
    }
    
    setupCompilerOptions() {
        // Configure JavaScript/TypeScript defaults for better Three.js support
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2020,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.ESNext,
            noEmit: true,
            esModuleInterop: true,
            allowJs: true,
            checkJs: false, // Disable to avoid too many errors
            strict: false,
            skipLibCheck: true,
            allowSyntheticDefaultImports: true
        });
        
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2020,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.ESNext,
            noEmit: true,
            esModuleInterop: true,
            strict: false,
            skipLibCheck: true,
            allowSyntheticDefaultImports: true
        });
    }
    
    generateEnhancedTypeDefinitions() {
        let typeDefinitions = '\n// Enhanced Three.js API definitions from APIRegistry\n';
        
        // Generate geometry type definitions from APIRegistry
        typeDefinitions += '\n// Enhanced Geometry Types\n';
        Object.entries(this.apiRegistry.geometries).forEach(([key, geometry]) => {
            const className = geometry.className;
            const params = geometry.parameters.map(p => `${p.name}?: ${p.type || 'number'}`).join(', ');
            
            typeDefinitions += `declare class ${className} extends BufferGeometry {\n`;
            typeDefinitions += `    constructor(${params});\n`;
            typeDefinitions += '}\n\n';
        });
        
        // Generate material type definitions from APIRegistry  
        typeDefinitions += '\n// Enhanced Material Types\n';
        Object.entries(this.apiRegistry.materials).forEach(([key, material]) => {
            const className = material.className;
            
            typeDefinitions += `declare class ${className} extends Material {\n`;
            typeDefinitions += `    constructor(parameters?: ${className}Parameters);\n`;
            
            // Add key properties
            if (material.properties) {
                Object.entries(material.properties).forEach(([propKey, prop]) => {
                    if (prop.type) {
                        typeDefinitions += `    ${propKey}: ${this.mapPropertyType(prop.type)};\n`;
                    }
                });
            }
            
            typeDefinitions += '}\n\n';
        });
        
        // Generate lighting type definitions from APIRegistry
        typeDefinitions += '\n// Enhanced Lighting Types\n';
        Object.entries(this.apiRegistry.lighting).forEach(([key, light]) => {
            const className = light.className;
            const params = light.parameters?.map(p => `${p.name}?: ${p.type || 'ColorRepresentation | number'}`).join(', ') || '';
            
            typeDefinitions += `declare class ${className} extends Light {\n`;
            typeDefinitions += `    constructor(${params});\n`;
            
            // Add specific light properties
            if (light.properties) {
                Object.entries(light.properties).forEach(([propKey, prop]) => {
                    typeDefinitions += `    ${propKey}: ${this.mapPropertyType(prop.type || 'number')};\n`;
                });
            }
            
            typeDefinitions += '}\n\n';
        });
        
        return typeDefinitions;
    }
    
    mapPropertyType(apiType) {
        const typeMap = {
            'color': 'ColorRepresentation',
            'texture': 'Texture | null',
            'number': 'number',
            'boolean': 'boolean',
            'string': 'string',
            'vector3': 'Vector3',
            'object3d': 'Object3D'
        };
        return typeMap[apiType?.toLowerCase()] || 'any';
    }

    async addThreeJsTypeDefinitions() {
        // Enhanced Three.js type definitions using APIRegistry
        const threeJsTypes = this.generateEnhancedTypeDefinitions() + `
declare module 'three' {
    export namespace THREE {
        // Core classes
        export class Object3D {
            position: Vector3;
            rotation: Euler;
            scale: Vector3;
            quaternion: Quaternion;
            matrix: Matrix4;
            matrixWorld: Matrix4;
            name: string;
            visible: boolean;
            children: Object3D[];
            parent: Object3D | null;
            userData: any;
            
            add(...object: Object3D[]): this;
            remove(...object: Object3D[]): this;
            traverse(callback: (object: Object3D) => void): void;
            getObjectById(id: number): Object3D | undefined;
            getObjectByName(name: string): Object3D | undefined;
            clone(recursive?: boolean): this;
            copy(object: Object3D, recursive?: boolean): this;
        }
        
        export class Scene extends Object3D {
            background: Color | Texture | null;
            environment: Texture | null;
            fog: Fog | FogExp2 | null;
            overrideMaterial: Material | null;
        }
        
        // Cameras
        export class Camera extends Object3D {
            matrixWorldInverse: Matrix4;
            projectionMatrix: Matrix4;
            projectionMatrixInverse: Matrix4;
        }
        
        export class PerspectiveCamera extends Camera {
            constructor(fov?: number, aspect?: number, near?: number, far?: number);
            fov: number;
            aspect: number;
            near: number;
            far: number;
            zoom: number;
            updateProjectionMatrix(): void;
        }
        
        export class OrthographicCamera extends Camera {
            constructor(left: number, right: number, top: number, bottom: number, near?: number, far?: number);
            left: number;
            right: number;
            top: number;
            bottom: number;
            zoom: number;
            updateProjectionMatrix(): void;
        }
        
        // Geometries
        export class BufferGeometry {
            attributes: { [name: string]: BufferAttribute };
            index: BufferAttribute | null;
            constructor();
            setAttribute(name: string, attribute: BufferAttribute): this;
            getAttribute(name: string): BufferAttribute | undefined;
            dispose(): void;
        }
        
        export class BoxGeometry extends BufferGeometry {
            constructor(width?: number, height?: number, depth?: number, widthSegments?: number, heightSegments?: number, depthSegments?: number);
        }
        
        export class SphereGeometry extends BufferGeometry {
            constructor(radius?: number, widthSegments?: number, heightSegments?: number, phiStart?: number, phiLength?: number, thetaStart?: number, thetaLength?: number);
        }
        
        export class CylinderGeometry extends BufferGeometry {
            constructor(radiusTop?: number, radiusBottom?: number, height?: number, radialSegments?: number, heightSegments?: number, openEnded?: boolean, thetaStart?: number, thetaLength?: number);
        }
        
        export class PlaneGeometry extends BufferGeometry {
            constructor(width?: number, height?: number, widthSegments?: number, heightSegments?: number);
        }
        
        // Materials
        export class Material {
            name: string;
            transparent: boolean;
            opacity: number;
            visible: boolean;
            side: Side;
            dispose(): void;
        }
        
        export class MeshBasicMaterial extends Material {
            constructor(parameters?: MeshBasicMaterialParameters);
            color: Color;
            map: Texture | null;
            wireframe: boolean;
        }
        
        export class MeshStandardMaterial extends Material {
            constructor(parameters?: MeshStandardMaterialParameters);
            color: Color;
            roughness: number;
            metalness: number;
            map: Texture | null;
            normalMap: Texture | null;
            roughnessMap: Texture | null;
            metalnessMap: Texture | null;
            wireframe: boolean;
        }
        
        export class ShaderMaterial extends Material {
            constructor(parameters?: ShaderMaterialParameters);
            vertexShader: string;
            fragmentShader: string;
            uniforms: { [uniform: string]: { value: any } };
        }
        
        // Meshes
        export class Mesh extends Object3D {
            constructor(geometry?: BufferGeometry, material?: Material | Material[]);
            geometry: BufferGeometry;
            material: Material | Material[];
            isMesh: boolean;
        }
        
        // Lights
        export class Light extends Object3D {
            color: Color;
            intensity: number;
        }
        
        export class AmbientLight extends Light {
            constructor(color?: ColorRepresentation, intensity?: number);
        }
        
        export class DirectionalLight extends Light {
            constructor(color?: ColorRepresentation, intensity?: number);
            target: Object3D;
            shadow: DirectionalLightShadow;
            castShadow: boolean;
        }
        
        export class PointLight extends Light {
            constructor(color?: ColorRepresentation, intensity?: number, distance?: number, decay?: number);
            distance: number;
            decay: number;
            shadow: PointLightShadow;
            castShadow: boolean;
        }
        
        export class SpotLight extends Light {
            constructor(color?: ColorRepresentation, intensity?: number, distance?: number, angle?: number, penumbra?: number, decay?: number);
            target: Object3D;
            distance: number;
            angle: number;
            penumbra: number;
            decay: number;
            shadow: SpotLightShadow;
            castShadow: boolean;
        }
        
        // Math
        export class Vector3 {
            constructor(x?: number, y?: number, z?: number);
            x: number;
            y: number;
            z: number;
            set(x: number, y: number, z: number): this;
            copy(v: Vector3): this;
            add(v: Vector3): this;
            sub(v: Vector3): this;
            multiply(v: Vector3): this;
            multiplyScalar(scalar: number): this;
            normalize(): this;
            length(): number;
            distanceTo(v: Vector3): number;
            toArray(): number[];
        }
        
        export class Euler {
            constructor(x?: number, y?: number, z?: number, order?: string);
            x: number;
            y: number;
            z: number;
            order: string;
            set(x: number, y: number, z: number, order?: string): this;
            copy(euler: Euler): this;
            toArray(): number[];
        }
        
        export class Color {
            constructor(r?: ColorRepresentation, g?: number, b?: number);
            r: number;
            g: number;
            b: number;
            set(color: ColorRepresentation): this;
            setHex(hex: number): this;
            setRGB(r: number, g: number, b: number): this;
            getHex(): number;
        }
        
        // Renderer
        export class WebGLRenderer {
            constructor(parameters?: WebGLRendererParameters);
            domElement: HTMLCanvasElement;
            setSize(width: number, height: number, updateStyle?: boolean): void;
            setPixelRatio(value: number): void;
            render(scene: Scene, camera: Camera): void;
            dispose(): void;
            setClearColor(color: ColorRepresentation, alpha?: number): void;
            shadowMap: WebGLShadowMap;
        }
        
        // Animation
        export class AnimationMixer {
            constructor(root: Object3D);
            clipAction(clip: AnimationClip, optionalRoot?: Object3D): AnimationAction;
            update(deltaTime: number): void;
        }
        
        export class AnimationClip {
            constructor(name?: string, duration?: number, tracks?: KeyframeTrack[]);
            name: string;
            duration: number;
            tracks: KeyframeTrack[];
        }
        
        export class AnimationAction {
            play(): AnimationAction;
            stop(): AnimationAction;
            pause(): AnimationAction;
            setLoop(mode: AnimationActionLoopStyles, repetitions?: number): AnimationAction;
            setEffectiveWeight(weight: number): AnimationAction;
        }
        
        // Loaders
        export class TextureLoader {
            load(url: string, onLoad?: (texture: Texture) => void, onProgress?: (progress: ProgressEvent) => void, onError?: (error: ErrorEvent) => void): Texture;
        }
        
        export class OBJLoader {
            load(url: string, onLoad?: (object: Group) => void, onProgress?: (progress: ProgressEvent) => void, onError?: (error: ErrorEvent) => void): void;
            parse(data: string): Group;
        }
        
        // Controls (from examples)
        export class OrbitControls {
            constructor(object: Camera, domElement?: HTMLElement);
            object: Camera;
            domElement: HTMLElement;
            target: Vector3;
            enableDamping: boolean;
            dampingFactor: number;
            enableZoom: boolean;
            enableRotate: boolean;
            enablePan: boolean;
            update(): void;
            dispose(): void;
        }
        
        // Types
        export type ColorRepresentation = Color | string | number;
        export type Side = number;
        
        // Enums and constants
        export const FrontSide: Side;
        export const BackSide: Side;
        export const DoubleSide: Side;
        export const NoBlending: number;
        export const NormalBlending: number;
        export const AdditiveBlending: number;
        export const SubtractiveBlending: number;
        export const MultiplyBlending: number;
        
        // Additional interfaces
        export interface MeshBasicMaterialParameters {
            color?: ColorRepresentation;
            map?: Texture;
            wireframe?: boolean;
            transparent?: boolean;
            opacity?: number;
        }
        
        export interface MeshStandardMaterialParameters extends MeshBasicMaterialParameters {
            roughness?: number;
            metalness?: number;
            normalMap?: Texture;
            roughnessMap?: Texture;
            metalnessMap?: Texture;
        }
        
        export interface ShaderMaterialParameters {
            vertexShader?: string;
            fragmentShader?: string;
            uniforms?: { [uniform: string]: { value: any } };
            transparent?: boolean;
            side?: Side;
        }
        
        export interface WebGLRendererParameters {
            canvas?: HTMLCanvasElement;
            antialias?: boolean;
            alpha?: boolean;
            powerPreference?: string;
        }
    }
}

// Global THREE namespace
declare const THREE: typeof import('three').THREE;
`;
        
        // Add the type definitions to Monaco
        monaco.languages.typescript.javascriptDefaults.addExtraLib(
            threeJsTypes,
            'three.d.ts'
        );
        
        console.log('📚 Three.js type definitions added to Monaco');
    }
    
    registerCompletionProvider() {
        this.customCompletionProvider = monaco.languages.registerCompletionItemProvider('javascript', {
            provideCompletionItems: (model, position, context, token) => {
                const suggestions = this.getThreeJsCompletions(model, position);
                return { suggestions };
            }
        });
        
        console.log('🔍 Three.js completion provider registered');
    }
    
    getEnhancedAPICompletions(model, position) {
        const completions = [];
        
        // Generate geometry completions from APIRegistry
        Object.entries(this.apiRegistry.geometries).forEach(([key, geometry]) => {
            const className = geometry.className;
            const params = geometry.parameters.map(p => `\${${p.name}:${p.defaultValue || (p.type === 'number' ? '1' : '""')}}`).join(', ');
            
            completions.push({
                label: `new THREE.${className}()`,
                kind: monaco.languages.CompletionItemKind.Constructor,
                documentation: geometry.description || `Creates a ${className} geometry`,
                insertText: `new THREE.${className}(${params})`,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: this.getWordRange(model, position),
                detail: `${className} - ${geometry.category || 'Geometry'}`
            });
        });
        
        // Generate material completions from APIRegistry
        Object.entries(this.apiRegistry.materials).forEach(([key, material]) => {
            const className = material.className;
            
            // Build parameter object from properties
            let paramString = '{ ';
            if (material.properties && Object.keys(material.properties).length > 0) {
                const propEntries = Object.entries(material.properties).slice(0, 3); // First 3 props
                paramString += propEntries.map(([propKey, prop], index) => {
                    const defaultVal = this.getDefaultValueForType(prop.type);
                    return `${propKey}: \${${index + 1}:${defaultVal}}`;
                }).join(', ');
            }
            paramString += ' }';
            
            completions.push({
                label: `new THREE.${className}()`,
                kind: monaco.languages.CompletionItemKind.Constructor,
                documentation: material.description || `Creates a ${className} material`,
                insertText: `new THREE.${className}(${paramString})`,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: this.getWordRange(model, position),
                detail: `${className} - Material`
            });
        });
        
        // Generate lighting completions from APIRegistry
        Object.entries(this.apiRegistry.lighting).forEach(([key, light]) => {
            const className = light.className;
            const params = light.parameters?.map((p, index) => {
                const defaultVal = this.getDefaultValueForType(p.type);
                return `\${${index + 1}:${defaultVal}}`;
            }).join(', ') || '';
            
            completions.push({
                label: `new THREE.${className}()`,
                kind: monaco.languages.CompletionItemKind.Constructor,
                documentation: light.description || `Creates a ${className} light`,
                insertText: `new THREE.${className}(${params})`,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: this.getWordRange(model, position),
                detail: `${className} - Light`
            });
        });
        
        return completions;
    }
    
    getDefaultValueForType(type) {
        const defaults = {
            'color': '0xffffff',
            'number': '1',
            'boolean': 'true',
            'string': '""',
            'texture': 'null'
        };
        return defaults[type?.toLowerCase()] || '1';
    }
    
    getThreeJsCompletions(model, position) {
        const completions = [];
        
        // Enhanced completions from APIRegistry
        completions.push(...this.getEnhancedAPICompletions(model, position));
        
        // Three.js object creation completions
        completions.push(...[
            {
                label: 'new THREE.Scene()',
                kind: monaco.languages.CompletionItemKind.Constructor,
                documentation: 'Creates a new Three.js scene',
                insertText: 'new THREE.Scene()',
                range: this.getWordRange(model, position)
            },
            {
                label: 'new THREE.PerspectiveCamera()',
                kind: monaco.languages.CompletionItemKind.Constructor,
                documentation: 'Creates a perspective camera with field of view, aspect ratio, near and far clipping planes',
                insertText: 'new THREE.PerspectiveCamera(${1:75}, ${2:window.innerWidth / window.innerHeight}, ${3:0.1}, ${4:1000})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: this.getWordRange(model, position)
            },
            {
                label: 'new THREE.WebGLRenderer()',
                kind: monaco.languages.CompletionItemKind.Constructor,
                documentation: 'Creates a WebGL renderer with optional parameters',
                insertText: 'new THREE.WebGLRenderer({ ${1:antialias: true} })',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: this.getWordRange(model, position)
            },
            {
                label: 'new THREE.BoxGeometry()',
                kind: monaco.languages.CompletionItemKind.Constructor,
                documentation: 'Creates a box geometry with width, height, and depth',
                insertText: 'new THREE.BoxGeometry(${1:1}, ${2:1}, ${3:1})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: this.getWordRange(model, position)
            },
            {
                label: 'new THREE.SphereGeometry()',
                kind: monaco.languages.CompletionItemKind.Constructor,
                documentation: 'Creates a sphere geometry with radius and segments',
                insertText: 'new THREE.SphereGeometry(${1:1}, ${2:32}, ${3:16})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: this.getWordRange(model, position)
            },
            {
                label: 'new THREE.MeshStandardMaterial()',
                kind: monaco.languages.CompletionItemKind.Constructor,
                documentation: 'Creates a standard material with PBR properties',
                insertText: 'new THREE.MeshStandardMaterial({ ${1:color: 0xffffff} })',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: this.getWordRange(model, position)
            },
            {
                label: 'new THREE.Mesh()',
                kind: monaco.languages.CompletionItemKind.Constructor,
                documentation: 'Creates a mesh from geometry and material',
                insertText: 'new THREE.Mesh(${1:geometry}, ${2:material})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: this.getWordRange(model, position)
            },
            {
                label: 'new THREE.DirectionalLight()',
                kind: monaco.languages.CompletionItemKind.Constructor,
                documentation: 'Creates a directional light with color and intensity',
                insertText: 'new THREE.DirectionalLight(${1:0xffffff}, ${2:1})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: this.getWordRange(model, position)
            },
            {
                label: 'new THREE.Vector3()',
                kind: monaco.languages.CompletionItemKind.Constructor,
                documentation: 'Creates a 3D vector with x, y, z components',
                insertText: 'new THREE.Vector3(${1:0}, ${2:0}, ${3:0})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: this.getWordRange(model, position)
            }
        ]);
        
        // Method completions
        completions.push(...[
            {
                label: 'scene.add()',
                kind: monaco.languages.CompletionItemKind.Method,
                documentation: 'Adds an object to the scene',
                insertText: 'scene.add(${1:object})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: this.getWordRange(model, position)
            },
            {
                label: 'renderer.render()',
                kind: monaco.languages.CompletionItemKind.Method,
                documentation: 'Renders the scene from the camera perspective',
                insertText: 'renderer.render(${1:scene}, ${2:camera})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: this.getWordRange(model, position)
            },
            {
                label: 'object.position.set()',
                kind: monaco.languages.CompletionItemKind.Method,
                documentation: 'Sets the position of an object',
                insertText: 'object.position.set(${1:x}, ${2:y}, ${3:z})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: this.getWordRange(model, position)
            },
            {
                label: 'object.rotation.set()',
                kind: monaco.languages.CompletionItemKind.Method,
                documentation: 'Sets the rotation of an object in radians',
                insertText: 'object.rotation.set(${1:x}, ${2:y}, ${3:z})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: this.getWordRange(model, position)
            }
        ]);
        
        return completions;
    }
    
    registerHoverProvider() {
        this.hoverProvider = monaco.languages.registerHoverProvider('javascript', {
            provideHover: (model, position, token) => {
                const word = model.getWordAtPosition(position);
                if (!word) return null;
                
                const hoverInfo = this.getThreeJsHoverInfo(word.word);
                if (!hoverInfo) return null;
                
                return {
                    range: new monaco.Range(
                        position.lineNumber,
                        word.startColumn,
                        position.lineNumber,
                        word.endColumn
                    ),
                    contents: [
                        { value: `**${hoverInfo.title}**` },
                        { value: hoverInfo.description, isTrusted: true }
                    ]
                };
            }
        });
        
        console.log('ℹ️ Three.js hover provider registered');
    }
    
    getAPIRegistryHoverInfo(word) {
        // Check geometries
        const geometry = Object.values(this.apiRegistry.geometries).find(g => 
            g.className.includes(word) || word.includes(g.className.replace('Geometry', ''))
        );
        if (geometry) {
            const params = geometry.parameters.map(p => `${p.name}: ${p.type || 'number'}`).join(', ');
            return {
                title: `THREE.${geometry.className}`,
                description: `**${geometry.description || 'Creates geometry'}**\n\nParameters: ${params}\n\nCategory: ${geometry.category || 'Geometry'}`
            };
        }
        
        // Check materials
        const material = Object.values(this.apiRegistry.materials).find(m => 
            m.className.includes(word) || word.includes(m.className.replace('Material', ''))
        );
        if (material) {
            let description = `**${material.description || 'Creates material'}**\n\nType: ${material.type}\n`;
            
            if (material.properties && Object.keys(material.properties).length > 0) {
                description += '\nKey Properties:\n';
                Object.entries(material.properties).slice(0, 5).forEach(([key, prop]) => {
                    description += `- ${key}: ${prop.type || 'any'}\n`;
                });
            }
            
            return {
                title: `THREE.${material.className}`,
                description
            };
        }
        
        // Check lighting
        const light = Object.values(this.apiRegistry.lighting).find(l => 
            l.className.includes(word) || word.includes(l.className.replace('Light', ''))
        );
        if (light) {
            const params = light.parameters?.map(p => `${p.name}: ${p.type || 'number'}`).join(', ') || '';
            let description = `**${light.description || 'Creates light'}**\n`;
            
            if (params) {
                description += `\nParameters: ${params}\n`;
            }
            
            if (light.properties && Object.keys(light.properties).length > 0) {
                description += '\nProperties:\n';
                Object.entries(light.properties).slice(0, 4).forEach(([key, prop]) => {
                    description += `- ${key}: ${prop.type || 'any'}\n`;
                });
            }
            
            return {
                title: `THREE.${light.className}`,
                description
            };
        }
        
        return null;
    }
    
    getThreeJsHoverInfo(word) {
        // First check APIRegistry for enhanced hover info
        const apiHoverInfo = this.getAPIRegistryHoverInfo(word);
        if (apiHoverInfo) return apiHoverInfo;
        
        // Fallback to basic hover data
        const hoverData = {
            'Scene': {
                title: 'THREE.Scene',
                description: 'Scenes allow you to set up what and where is to be rendered. This is where you place objects, lights and cameras.'
            },
            'PerspectiveCamera': {
                title: 'THREE.PerspectiveCamera',
                description: 'Camera that uses perspective projection. This projection mode is designed to mimic the way the human eye sees.'
            },
            'WebGLRenderer': {
                title: 'THREE.WebGLRenderer',
                description: 'The WebGL renderer displays your beautifully crafted scenes using WebGL.'
            },
            'BoxGeometry': {
                title: 'THREE.BoxGeometry',
                description: 'BoxGeometry is a geometry class for a rectangular cuboid with a given width, height, and depth.'
            },
            'SphereGeometry': {
                title: 'THREE.SphereGeometry',
                description: 'A class for generating sphere geometries.'
            },
            'MeshStandardMaterial': {
                title: 'THREE.MeshStandardMaterial',
                description: 'A standard physically based material, using Metallic-Roughness workflow.'
            },
            'MeshBasicMaterial': {
                title: 'THREE.MeshBasicMaterial',
                description: 'A material for drawing geometries in a simple shaded (flat or wireframe) way.'
            },
            'Mesh': {
                title: 'THREE.Mesh',
                description: 'Class representing triangular polygon mesh based objects.'
            },
            'DirectionalLight': {
                title: 'THREE.DirectionalLight',
                description: 'A light that gets emitted in a specific direction. This light will behave as though it is infinitely far away and the rays produced from it are all parallel.'
            },
            'Vector3': {
                title: 'THREE.Vector3',
                description: 'Class representing a 3D vector. A 3D vector is an ordered triplet of numbers (labeled x, y, and z).'
            }
        };
        
        return hoverData[word] || null;
    }
    
    registerSignatureProvider() {
        this.signatureProvider = monaco.languages.registerSignatureHelpProvider('javascript', {
            signatureHelpTriggerCharacters: ['(', ','],
            provideSignatureHelp: (model, position, token, context) => {
                const signatures = this.getThreeJsSignatures(model, position);
                return {
                    value: { signatures, activeSignature: 0, activeParameter: 0 }
                };
            }
        });
        
        console.log('✏️ Three.js signature provider registered');
    }
    
    getThreeJsSignatures(model, position) {
        // Get the text before the cursor
        const textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
        });
        
        // Check for Three.js constructor patterns
        if (textUntilPosition.includes('new THREE.PerspectiveCamera(')) {
            return [{
                label: 'PerspectiveCamera(fov?: number, aspect?: number, near?: number, far?: number)',
                documentation: 'Creates a perspective camera',
                parameters: [
                    { label: 'fov', documentation: 'Camera frustum vertical field of view' },
                    { label: 'aspect', documentation: 'Camera frustum aspect ratio' },
                    { label: 'near', documentation: 'Camera frustum near plane' },
                    { label: 'far', documentation: 'Camera frustum far plane' }
                ]
            }];
        }
        
        if (textUntilPosition.includes('new THREE.BoxGeometry(')) {
            return [{
                label: 'BoxGeometry(width?: number, height?: number, depth?: number, widthSegments?: number, heightSegments?: number, depthSegments?: number)',
                documentation: 'Creates a box geometry',
                parameters: [
                    { label: 'width', documentation: 'Width of the box' },
                    { label: 'height', documentation: 'Height of the box' },
                    { label: 'depth', documentation: 'Depth of the box' }
                ]
            }];
        }
        
        return [];
    }
    
    generateAPIRegistrySnippets() {
        const snippets = [];
        
        // Generate material setup snippets
        Object.entries(this.apiRegistry.materials).forEach(([key, material]) => {
            if (material.category === 'Standard') { // Focus on most commonly used materials
                snippets.push({
                    label: `three-${key}-material`,
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    documentation: `Creates a ${material.className} with common properties`,
                    insertText: [
                        `// Create ${material.className}`,
                        `const material = new THREE.${material.className}({`,
                        ...this.generateMaterialPropertiesSnippet(material),
                        '});'
                    ].join('\n'),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: this.getWordRange(null, null)
                });
            }
        });
        
        // Generate lighting setup snippets
        Object.entries(this.apiRegistry.lighting).forEach(([key, light], index) => {
            if (index < 4) { // Limit to most common lights
                const params = light.parameters?.map((p, i) => `\${${i + 1}:${this.getDefaultValueForType(p.type)}}`).join(', ') || '';
                snippets.push({
                    label: `three-${key}-light`,
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    documentation: `Creates and configures a ${light.className}`,
                    insertText: [
                        `// Create ${light.className}`,
                        `const ${key} = new THREE.${light.className}(${params});`,
                        `${key}.position.set(\${${light.parameters?.length + 1 || 1}:5}, \${${light.parameters?.length + 2 || 2}:5}, \${${light.parameters?.length + 3 || 3}:5});`,
                        light.className.includes('Directional') ? `${key}.castShadow = true;` : '',
                        `scene.add(${key});`
                    ].filter(line => line).join('\n'),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: this.getWordRange(null, null)
                });
            }
        });
        
        // Generate post-processing snippets
        if (this.apiRegistry.postProcessing) {
            Object.entries(this.apiRegistry.postProcessing).slice(0, 3).forEach(([key, effect]) => {
                snippets.push({
                    label: `three-${key}-effect`,
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    documentation: `Adds ${effect.name} post-processing effect`,
                    insertText: [
                        `// Add ${effect.name} effect`,
                        `const ${key}Pass = new THREE.${effect.passClass || 'Pass'}();`,
                        ...this.generateEffectPropertiesSnippet(effect),
                        `composer.addPass(${key}Pass);`
                    ].join('\n'),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: this.getWordRange(null, null)
                });
            });
        }
        
        return snippets;
    }
    
    generateMaterialPropertiesSnippet(material) {
        const lines = [];
        if (material.properties) {
            Object.entries(material.properties).slice(0, 4).forEach(([key, prop], index) => {
                const defaultVal = this.getDefaultValueForType(prop.type);
                lines.push(`    ${key}: \${${index + 1}:${defaultVal}},`);
            });
        }
        return lines;
    }
    
    generateEffectPropertiesSnippet(effect) {
        const lines = [];
        if (effect.properties) {
            Object.entries(effect.properties).slice(0, 3).forEach(([key, prop], index) => {
                const defaultVal = prop.defaultValue || this.getDefaultValueForType('number');
                lines.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()}Pass.${key} = \${${index + 1}:${defaultVal}};`);
            });
        }
        return lines;
    }
    
    addThreeJsSnippets() {
        // Register enhanced snippets including APIRegistry patterns
        monaco.languages.registerCompletionItemProvider('javascript', {
            provideCompletionItems: (model, position) => {
                const snippets = [
                    // Enhanced snippets using APIRegistry data
                    ...this.generateAPIRegistrySnippets(),
                    {
                        label: 'three-basic-scene',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        documentation: 'Creates a basic Three.js scene setup',
                        insertText: [
                            '// Create scene',
                            'const scene = new THREE.Scene();',
                            '',
                            '// Create camera',
                            'const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);',
                            'camera.position.z = 5;',
                            '',
                            '// Create renderer',
                            'const renderer = new THREE.WebGLRenderer({ antialias: true });',
                            'renderer.setSize(window.innerWidth, window.innerHeight);',
                            'document.body.appendChild(renderer.domElement);',
                            '',
                            '// Create geometry and material',
                            'const geometry = new THREE.${1:BoxGeometry}(${2:1, 1, 1});',
                            'const material = new THREE.${3:MeshStandardMaterial}({ color: ${4:0x00ff00} });',
                            'const ${5:cube} = new THREE.Mesh(geometry, material);',
                            'scene.add(${5:cube});',
                            '',
                            '// Add lighting',
                            'const light = new THREE.DirectionalLight(0xffffff, 1);',
                            'light.position.set(5, 5, 5);',
                            'scene.add(light);',
                            '',
                            '// Animation loop',
                            'function animate() {',
                            '    requestAnimationFrame(animate);',
                            '    ${5:cube}.rotation.x += 0.01;',
                            '    ${5:cube}.rotation.y += 0.01;',
                            '    renderer.render(scene, camera);',
                            '}',
                            'animate();'
                        ].join('\n'),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: this.getWordRange(model, position)
                    },
                    {
                        label: 'three-animation-loop',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        documentation: 'Creates a basic animation loop',
                        insertText: [
                            'function animate() {',
                            '    requestAnimationFrame(animate);',
                            '    ',
                            '    // Update objects here',
                            '    ${1:object}.rotation.x += ${2:0.01};',
                            '    ${1:object}.rotation.y += ${2:0.01};',
                            '    ',
                            '    // Render',
                            '    renderer.render(scene, camera);',
                            '}',
                            'animate();'
                        ].join('\n'),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: this.getWordRange(model, position)
                    },
                    {
                        label: 'three-orbit-controls',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        documentation: 'Adds OrbitControls to camera',
                        insertText: [
                            '// Add orbit controls',
                            'const controls = new THREE.OrbitControls(camera, renderer.domElement);',
                            'controls.enableDamping = true;',
                            'controls.dampingFactor = 0.05;',
                            'controls.enableZoom = true;',
                            '',
                            '// Update in animation loop',
                            'controls.update();'
                        ].join('\n'),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: this.getWordRange(model, position)
                    },
                    {
                        label: 'three-load-obj',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        documentation: 'Loads an OBJ file',
                        insertText: [
                            '// Load OBJ file',
                            'const loader = new THREE.OBJLoader();',
                            'loader.load(',
                            '    \'${1:path/to/model.obj}\',',
                            '    function (object) {',
                            '        // Success callback',
                            '        scene.add(object);',
                            '        console.log(\'Model loaded successfully\');',
                            '    },',
                            '    function (progress) {',
                            '        // Progress callback',
                            '        console.log(\'Loading progress:\', (progress.loaded / progress.total * 100) + \'%\');',
                            '    },',
                            '    function (error) {',
                            '        // Error callback',
                            '        console.error(\'Error loading model:\', error);',
                            '    }',
                            ');'
                        ].join('\n'),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: this.getWordRange(model, position)
                    }
                ];
                
                return { suggestions: snippets };
            }
        });
        
        console.log('📝 Three.js code snippets registered');
    }
    
    getWordRange(model, position) {
        const word = model.getWordAtPosition(position);
        if (word) {
            return new monaco.Range(
                position.lineNumber,
                word.startColumn,
                position.lineNumber,
                word.endColumn
            );
        }
        return new monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
        );
    }
    
    dispose() {
        if (this.customCompletionProvider) {
            this.customCompletionProvider.dispose();
        }
        if (this.hoverProvider) {
            this.hoverProvider.dispose();
        }
        if (this.signatureProvider) {
            this.signatureProvider.dispose();
        }
        
        console.log('Three.js IntelliSense disposed');
    }
}