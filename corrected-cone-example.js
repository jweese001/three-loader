// 🔄 Three.js Sync Code - Generated 2025-09-12T17:22:00.000Z
// Objects: 1
// This code is designed for UI synchronization

// Create Cone_1 (primitive cone)
const geometry1 = new THREE.ConeGeometry(1, 2, 32);
const material1 = new THREE.MeshStandardMaterial({ color: '#ffffff', wireframe: false, roughness: 0.5, metalness: 0 });
const object1 = new THREE.Mesh(geometry1, material1);
object1.position.set(0, 0, 0);
object1.rotation.set(0, 0, 0);
object1.scale.set(1, 1, 1);
object1.name = 'Cone_1';
scene.add(object1);