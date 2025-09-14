// Simple cone test for SyncManager
const scene = new THREE.Scene();

// Create cone geometry and material
const coneGeometry = new THREE.ConeGeometry(1, 2, 32);
const coneMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: false });

// Create cone mesh and add to scene
const cone = new THREE.Mesh(coneGeometry, coneMaterial);
cone.position.set(0, 0, 0);
cone.rotation.set(0, 0, 0);
cone.scale.set(1, 1, 1);
cone.name = 'Cone';

scene.add(cone);

console.log('Test cone added to scene:', cone);