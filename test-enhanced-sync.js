// Enhanced Sync Mode Feature Test
// This script tests all the new features we added to the CodeTemplateGenerator

// Test data for complex scene with all enhanced features
const testSceneData = {
    objects: [
        // Test 1: Multiple primitive geometries
        {
            id: 1,
            name: 'TestBox',
            isPrimitive: true,
            primitiveType: 'box',
            material: {
                type: 'standard',
                color: '#ff4444',
                metalness: 0.3,
                roughness: 0.7
            },
            transform: {
                position: { x: -3, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 }
            },
            animation: {
                type: 'rotate-x',
                speed: 0.5
            }
        },
        {
            id: 2,
            name: 'TestSphere',
            isPrimitive: true,
            primitiveType: 'sphere',
            material: {
                type: 'phong',
                color: '#44ff44'
            },
            transform: {
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 }
            },
            animation: {
                type: 'rotate-y',
                speed: 0.7
            }
        },
        {
            id: 3,
            name: 'TestCone',
            isPrimitive: true,
            primitiveType: 'cone',
            material: {
                type: 'lambert',
                color: '#4444ff'
            },
            transform: {
                position: { x: 3, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 }
            },
            animation: {
                type: 'scale',
                speed: 2.0
            }
        },
        
        // Test 2: OBJ file
        {
            id: 4,
            name: 'TestOBJ',
            isPrimitive: false,
            filePath: 'examples/spiked.obj',
            material: {
                type: 'standard',
                color: '#cccccc',
                wireframe: true,
                metalness: 0.8,
                roughness: 0.2
            },
            transform: {
                position: { x: 0, y: 3, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 }
            },
            animation: {
                type: 'rotate-xyz',
                speed: 1.0
            }
        },
        
        // Test 3: MatCap material with texture
        {
            id: 5,
            name: 'TestMatCap',
            isPrimitive: true,
            primitiveType: 'sphere',
            material: {
                type: 'matcap',
                color: '#ffffff',
                matcapTexture: 'MatCap-Textures/gray/01.webp'
            },
            transform: {
                position: { x: -6, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 0.8, y: 0.8, z: 0.8 }
            }
        }
    ],
    
    // Test 4: Lighting system
    lights: [
        {
            id: 1,
            type: 'ambient',
            name: 'AmbientLight',
            color: '#404040',
            intensity: 0.3
        },
        {
            id: 2,
            type: 'directional',
            name: 'DirectionalLight',
            color: '#ffffff',
            intensity: 0.8,
            position: { x: 5, y: 10, z: 5 },
            castShadow: true,
            shadowMapSize: 1024
        },
        {
            id: 3,
            type: 'point',
            name: 'PointLight',
            color: '#ff6600',
            intensity: 0.6,
            distance: 10,
            position: { x: -3, y: 2, z: 3 }
        },
        {
            id: 4,
            type: 'spot',
            name: 'SpotLight',
            color: '#0066ff',
            intensity: 0.5,
            distance: 15,
            angle: Math.PI / 4,
            position: { x: 3, y: 5, z: 3 },
            target: { x: 3, y: 0, z: 0 },
            castShadow: true
        }
    ],
    
    // Scene settings
    sceneData: {
        backgroundColor: '#111111',
        enableShadows: true,
        shadowMapType: 'PCFSoft'
    }
};

console.log('=== Enhanced Sync Mode Test Data ===');
console.log('Objects:', testSceneData.objects.length);
console.log('- Primitives:', testSceneData.objects.filter(o => o.isPrimitive).length);
console.log('- OBJ files:', testSceneData.objects.filter(o => !o.isPrimitive).length);
console.log('- With animations:', testSceneData.objects.filter(o => o.animation).length);
console.log('- With textures:', testSceneData.objects.filter(o => o.material.matcapTexture).length);
console.log('Lights:', testSceneData.lights.length);
console.log('- Shadow casting:', testSceneData.lights.filter(l => l.castShadow).length);

// Test individual feature functions
console.log('\n=== Testing Enhanced Feature Functions ===');

// If we were to import CodeTemplateGenerator (this would be done in actual app)
/*
import { CodeTemplateGenerator } from './src/codegen/CodeTemplateGenerator.js';

const generator = new CodeTemplateGenerator();

// Test 1: OBJ Loader Code Generation
console.log('1. Testing OBJ Loader Code Generation:');
const objCode = generator.generateOBJLoaderCode(testSceneData.objects[3], 3);
console.log(objCode);

// Test 2: Animation Code Generation
console.log('2. Testing Animation Code Generation:');
const animationCode = generator.generateSyncModeAnimationCode(testSceneData.objects);
console.log(animationCode);

// Test 3: Lighting Code Generation  
console.log('3. Testing Lighting Code Generation:');
const lightingCode = generator.generateSyncModeLightingCode(testSceneData.lights);
console.log(lightingCode);

// Test 4: Texture Loading Code Generation
console.log('4. Testing Texture Loading Code Generation:');
const textureCode = generator.generateTextureLoadingCode(testSceneData.objects[4].material);
console.log(textureCode);

// Test 5: Full Sync Mode Code Generation
console.log('5. Testing Full Enhanced Sync Mode Generation:');
const fullCode = generator.generateSyncModeCode({
    objects: testSceneData.objects,
    sceneData: testSceneData.sceneData,
    timestamp: new Date().toISOString(),
    includeComments: true
});
console.log(fullCode);
*/

export default testSceneData;