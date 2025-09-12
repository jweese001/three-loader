// Test script for Phase 3 Code Editor to Viewport Execution
// Simplified version of indexIcosahedron.js for testing in three-loader

// Create Icosahedron geometry
const geometry = new THREE.IcosahedronGeometry(1.0, 2);

// Create material with flat shading
const material = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    flatShading: true
});

// Create mesh
const icosahedron = new THREE.Mesh(geometry, material);
icosahedron.position.set(0, 0, 0);

// Add wireframe overlay
const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true
});
const wireframe = new THREE.Mesh(geometry, wireframeMaterial);
wireframe.scale.setScalar(1.001);
icosahedron.add(wireframe);

// Add to scene (scene should be available in context)
scene.add(icosahedron);

// Add hemisphere light for proper lighting
const hemiLight = new THREE.HemisphereLight(0x0099ff, 0xaa5500);
hemiLight.position.set(0, 1, 0);
scene.add(hemiLight);

// Return results for SyncManager
__results.objects = [icosahedron];
__results.lights = [hemiLight];
__results.message = "Icosahedron with wireframe and hemisphere light created successfully";