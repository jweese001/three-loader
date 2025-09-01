/**
 * Automated Phase 1 Testing Script
 * Tests CodeTemplateGenerator, ExportManager, and integration
 */

import { CodeTemplateGenerator } from './src/codegen/CodeTemplateGenerator.js';

// Test Results Tracking
const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    errors: []
};

function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
    
    testResults.total++;
    if (type === 'success') testResults.passed++;
    else if (type === 'error') {
        testResults.failed++;
        testResults.errors.push(message);
    } else if (type === 'warning') testResults.warnings++;
}

// Mock scene and object manager
const createMockScene = (overrides = {}) => ({
    exportSceneData: () => ({
        background: 0x0f0f0f,
        camera: {
            fov: 75,
            position: [10, 10, 10]
        },
        ...overrides
    })
});

const createMockObjectManager = (objects = []) => ({
    getAllObjects: () => objects
});

const generateTestObject = (id, overrides = {}) => ({
    id: id,
    name: `test_object_${id}`,
    fileName: `object_${id}.obj`,
    material: {
        color: '#9dd9d9',
        wireframe: Math.random() > 0.5,
        opacity: Math.random(),
        roughness: Math.random(),
        metalness: Math.random()
    },
    transform: {
        position: { x: Math.random() * 20 - 10, y: Math.random() * 20 - 10, z: Math.random() * 20 - 10 },
        rotation: { x: Math.random() * Math.PI, y: Math.random() * Math.PI, z: Math.random() * Math.PI },
        scale: { x: Math.random() * 3 + 0.5, y: Math.random() * 3 + 0.5, z: Math.random() * 3 + 0.5 }
    },
    animation: {
        type: ['none', 'rotate_y', 'rotate_xyz', 'bounce'][Math.floor(Math.random() * 4)],
        speed: Math.random() * 0.05
    },
    stats: {
        meshes: Math.floor(Math.random() * 10) + 1,
        vertices: Math.floor(Math.random() * 10000) + 100,
        faces: Math.floor(Math.random() * 5000) + 50
    },
    ...overrides
});

// Test Functions
async function testBasicFunctionality() {
    log('Testing basic CodeTemplateGenerator functionality...');
    
    try {
        // Test empty scene
        const generator1 = new CodeTemplateGenerator(createMockScene(), createMockObjectManager([]));
        const emptyCode = generator1.generateEditableCode();
        
        if (emptyCode && emptyCode.includes('No objects loaded yet')) {
            log('Empty scene handling works', 'success');
        } else {
            log('Empty scene handling failed', 'error');
        }
        
        // Test single object
        const singleObject = [generateTestObject(1)];
        const generator2 = new CodeTemplateGenerator(createMockScene(), createMockObjectManager(singleObject));
        const singleCode = generator2.generateEditableCode();
        
        if (singleCode && singleCode.includes('MATERIAL_1') && singleCode.includes('TEST_OBJECT_1_CONFIG')) {
            log('Single object generation works', 'success');
        } else {
            log('Single object generation failed', 'error');
        }
        
        // Test multiple objects
        const multipleObjects = Array.from({length: 5}, (_, i) => generateTestObject(i + 1));
        const generator3 = new CodeTemplateGenerator(createMockScene(), createMockObjectManager(multipleObjects));
        const multipleCode = generator3.generateEditableCode();
        
        if (multipleCode && multipleCode.includes('MATERIAL_5') && multipleCode.includes('TEST_OBJECT_5_CONFIG')) {
            log('Multiple objects generation works', 'success');
        } else {
            log('Multiple objects generation failed', 'error');
        }
        
    } catch (error) {
        log(`Basic functionality test failed: ${error.message}`, 'error');
    }
}

async function testExportModes() {
    log('Testing different export modes...');
    
    try {
        const testObjects = [generateTestObject(1), generateTestObject(2)];
        const generator = new CodeTemplateGenerator(createMockScene(), createMockObjectManager(testObjects));
        
        const modes = [
            { name: 'Full', options: { includeComments: true, includeImports: true, includeAnimation: true } },
            { name: 'Compact', options: { includeComments: false, includeImports: true, includeAnimation: false } },
            { name: 'No Imports', options: { includeComments: true, includeImports: false, includeAnimation: true } },
            { name: 'Minimal', options: { includeComments: false, includeImports: false, includeAnimation: false } }
        ];
        
        for (const mode of modes) {
            const code = generator.generateEditableCode(mode.options);
            if (code && code.length > 100) {
                log(`${mode.name} export mode works`, 'success');
            } else {
                log(`${mode.name} export mode failed`, 'error');
            }
        }
        
    } catch (error) {
        log(`Export modes test failed: ${error.message}`, 'error');
    }
}

async function testEdgeCases() {
    log('Testing edge cases and error handling...');
    
    try {
        // Test with special characters in names
        const specialObject = generateTestObject(1, {
            name: 'test-object with spaces & symbols!@#$%^&*()',
            fileName: 'file with spaces.obj'
        });
        
        const generator1 = new CodeTemplateGenerator(createMockScene(), createMockObjectManager([specialObject]));
        const specialCode = generator1.generateEditableCode();
        
        if (specialCode && !specialCode.includes('test-object with spaces')) {
            log('Special characters sanitized correctly', 'success');
        } else {
            log('Special characters not properly handled', 'warning');
        }
        
        // Test with malformed data
        const brokenObject = generateTestObject(2, {
            material: { color: '#ff0000' }, // Missing other properties
            transform: {
                position: { x: 'invalid', y: null, z: undefined }
            }
        });
        
        const generator2 = new CodeTemplateGenerator(createMockScene(), createMockObjectManager([brokenObject]));
        const brokenCode = generator2.generateEditableCode();
        
        if (brokenCode && !brokenCode.includes('undefined') && !brokenCode.includes('null')) {
            log('Malformed data handled gracefully', 'success');
        } else {
            log('Malformed data not handled properly', 'warning');
        }
        
    } catch (error) {
        log(`Edge cases test failed: ${error.message}`, 'error');
    }
}

async function testPerformance() {
    log('Testing performance with large datasets...');
    
    try {
        const startTime = performance.now();
        
        // Generate 50 objects
        const largeObjectSet = Array.from({length: 50}, (_, i) => generateTestObject(i + 1));
        const generator = new CodeTemplateGenerator(createMockScene(), createMockObjectManager(largeObjectSet));
        const code = generator.generateEditableCode();
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration < 1000) { // Less than 1 second
            log(`Performance test passed (${duration.toFixed(2)}ms for 50 objects)`, 'success');
        } else if (duration < 3000) { // Less than 3 seconds
            log(`Performance acceptable (${duration.toFixed(2)}ms for 50 objects)`, 'warning');
        } else {
            log(`Performance too slow (${duration.toFixed(2)}ms for 50 objects)`, 'error');
        }
        
        if (code.length > 50000) {
            log(`Generated substantial code (${(code.length / 1024).toFixed(1)}KB)`, 'success');
        }
        
    } catch (error) {
        log(`Performance test failed: ${error.message}`, 'error');
    }
}

async function testCodeValidation() {
    log('Testing generated code validity...');
    
    try {
        const testObjects = [generateTestObject(1), generateTestObject(2)];
        const generator = new CodeTemplateGenerator(createMockScene(), createMockObjectManager(testObjects));
        const code = generator.generateEditableCode();
        
        // Basic syntax checks
        const hasValidImports = code.includes("import * as THREE from 'three'");
        const hasValidExport = code.includes('export async function createEditableScene');
        const hasValidConfig = code.includes('const SCENE_CONFIG = {');
        const hasValidMaterials = code.includes('const MATERIAL_1 = {');
        const hasValidObjects = code.includes('const TEST_OBJECT_1_CONFIG = {');
        
        if (hasValidImports && hasValidExport && hasValidConfig && hasValidMaterials && hasValidObjects) {
            log('Generated code structure is valid', 'success');
        } else {
            log('Generated code structure issues detected', 'error');
        }
        
        // Check for syntax errors (basic)
        if (!code.includes('undefined') && !code.includes('NaN') && !code.includes('[object Object]')) {
            log('No obvious syntax errors detected', 'success');
        } else {
            log('Potential syntax errors detected', 'warning');
        }
        
    } catch (error) {
        log(`Code validation test failed: ${error.message}`, 'error');
    }
}

// Main test runner
async function runAllTests() {
    console.log('\n🚀 Starting Phase 1 Comprehensive Testing...\n');
    
    const startTime = performance.now();
    
    await testBasicFunctionality();
    await testExportModes();
    await testEdgeCases();
    await testPerformance();
    await testCodeValidation();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Print summary
    console.log('\n📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`⚠️ Warnings: ${testResults.warnings}`);
    console.log(`⏱️ Duration: ${duration.toFixed(2)}ms`);
    console.log(`📈 Success Rate: ${(testResults.passed / testResults.total * 100).toFixed(1)}%`);
    
    if (testResults.errors.length > 0) {
        console.log('\n❌ ERRORS FOUND:');
        testResults.errors.forEach((error, index) => {
            console.log(`  ${index + 1}. ${error}`);
        });
    }
    
    console.log('\n🏁 Testing Complete!');
    
    return testResults;
}

// Export for use in other contexts
export { runAllTests, testResults };

// Auto-run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests().then(results => {
        process.exit(results.failed > 0 ? 1 : 0);
    });
}