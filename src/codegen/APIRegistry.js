/**
 * APIRegistry - Complete Three.js API mapping and documentation
 * Part of Phase 2: Comprehensive Three.js API Support
 * 
 * Provides intelligent code completion, parameter validation, and 
 * comprehensive coverage of the entire Three.js ecosystem.
 */

export class APIRegistry {
    constructor() {
        // Initialize API mappings
        this.geometries = this.initializeGeometryAPI();
        this.materials = this.initializeMaterialAPI();
        this.lights = this.initializeLightingAPI();
        this.cameras = this.initializeCameraAPI();
        this.controls = this.initializeControlsAPI();
        this.loaders = this.initializeLoadersAPI();
        this.postProcessing = this.initializePostProcessingAPI();
        this.helpers = this.initializeHelpersAPI();
        this.math = this.initializeMathAPI();
        this.animation = this.initializeAnimationAPI();
        
        console.log('📚 APIRegistry initialized with comprehensive Three.js coverage');
    }
    
    /**
     * Initialize all Three.js geometries with parameters and examples
     */
    initializeGeometryAPI() {
        return {
            // Basic Geometries
            'BoxGeometry': {
                parameters: [
                    { name: 'width', type: 'number', default: 1, description: 'Width of the box' },
                    { name: 'height', type: 'number', default: 1, description: 'Height of the box' },
                    { name: 'depth', type: 'number', default: 1, description: 'Depth of the box' },
                    { name: 'widthSegments', type: 'number', default: 1, description: 'Number of width segments' },
                    { name: 'heightSegments', type: 'number', default: 1, description: 'Number of height segments' },
                    { name: 'depthSegments', type: 'number', default: 1, description: 'Number of depth segments' }
                ],
                example: 'new THREE.BoxGeometry(2, 2, 2, 1, 1, 1)',
                category: 'basic',
                description: 'Creates a rectangular box geometry'
            },
            
            'SphereGeometry': {
                parameters: [
                    { name: 'radius', type: 'number', default: 1, description: 'Radius of the sphere' },
                    { name: 'widthSegments', type: 'number', default: 32, description: 'Number of horizontal segments' },
                    { name: 'heightSegments', type: 'number', default: 16, description: 'Number of vertical segments' },
                    { name: 'phiStart', type: 'number', default: 0, description: 'Horizontal starting angle' },
                    { name: 'phiLength', type: 'number', default: 'Math.PI * 2', description: 'Horizontal sweep angle' },
                    { name: 'thetaStart', type: 'number', default: 0, description: 'Vertical starting angle' },
                    { name: 'thetaLength', type: 'number', default: 'Math.PI', description: 'Vertical sweep angle' }
                ],
                example: 'new THREE.SphereGeometry(1.5, 32, 16)',
                category: 'basic',
                description: 'Creates a sphere geometry'
            },
            
            'CylinderGeometry': {
                parameters: [
                    { name: 'radiusTop', type: 'number', default: 1, description: 'Top radius' },
                    { name: 'radiusBottom', type: 'number', default: 1, description: 'Bottom radius' },
                    { name: 'height', type: 'number', default: 1, description: 'Height of the cylinder' },
                    { name: 'radialSegments', type: 'number', default: 32, description: 'Number of radial segments' },
                    { name: 'heightSegments', type: 'number', default: 1, description: 'Number of height segments' },
                    { name: 'openEnded', type: 'boolean', default: false, description: 'Open or closed ends' },
                    { name: 'thetaStart', type: 'number', default: 0, description: 'Starting angle' },
                    { name: 'thetaLength', type: 'number', default: 'Math.PI * 2', description: 'Central angle' }
                ],
                example: 'new THREE.CylinderGeometry(1, 1, 2, 32)',
                category: 'basic',
                description: 'Creates a cylinder geometry'
            },
            
            'ConeGeometry': {
                parameters: [
                    { name: 'radius', type: 'number', default: 1, description: 'Base radius of the cone' },
                    { name: 'height', type: 'number', default: 1, description: 'Height of the cone' },
                    { name: 'radialSegments', type: 'number', default: 32, description: 'Number of radial segments' },
                    { name: 'heightSegments', type: 'number', default: 1, description: 'Number of height segments' },
                    { name: 'openEnded', type: 'boolean', default: false, description: 'Open or closed bottom' },
                    { name: 'thetaStart', type: 'number', default: 0, description: 'Starting angle' },
                    { name: 'thetaLength', type: 'number', default: 'Math.PI * 2', description: 'Central angle' }
                ],
                example: 'new THREE.ConeGeometry(1, 2, 32)',
                category: 'basic',
                description: 'Creates a cone geometry'
            },
            
            'PlaneGeometry': {
                parameters: [
                    { name: 'width', type: 'number', default: 1, description: 'Width of the plane' },
                    { name: 'height', type: 'number', default: 1, description: 'Height of the plane' },
                    { name: 'widthSegments', type: 'number', default: 1, description: 'Number of width segments' },
                    { name: 'heightSegments', type: 'number', default: 1, description: 'Number of height segments' }
                ],
                example: 'new THREE.PlaneGeometry(3, 3)',
                category: 'basic',
                description: 'Creates a plane geometry'
            },
            
            'CircleGeometry': {
                parameters: [
                    { name: 'radius', type: 'number', default: 1, description: 'Radius of the circle' },
                    { name: 'segments', type: 'number', default: 32, description: 'Number of segments' },
                    { name: 'thetaStart', type: 'number', default: 0, description: 'Starting angle' },
                    { name: 'thetaLength', type: 'number', default: 'Math.PI * 2', description: 'Central angle' }
                ],
                example: 'new THREE.CircleGeometry(1.5, 32)',
                category: 'basic',
                description: 'Creates a circular geometry'
            },
            
            // Advanced Geometries
            'RingGeometry': {
                parameters: [
                    { name: 'innerRadius', type: 'number', default: 0.5, description: 'Inner radius' },
                    { name: 'outerRadius', type: 'number', default: 1, description: 'Outer radius' },
                    { name: 'thetaSegments', type: 'number', default: 32, description: 'Number of theta segments' },
                    { name: 'phiSegments', type: 'number', default: 1, description: 'Number of phi segments' },
                    { name: 'thetaStart', type: 'number', default: 0, description: 'Starting angle' },
                    { name: 'thetaLength', type: 'number', default: 'Math.PI * 2', description: 'Central angle' }
                ],
                example: 'new THREE.RingGeometry(0.5, 1.5, 32)',
                category: 'advanced',
                description: 'Creates a ring geometry'
            },
            
            'TorusGeometry': {
                parameters: [
                    { name: 'radius', type: 'number', default: 1, description: 'Radius of the torus' },
                    { name: 'tube', type: 'number', default: 0.4, description: 'Tube radius' },
                    { name: 'radialSegments', type: 'number', default: 16, description: 'Number of radial segments' },
                    { name: 'tubularSegments', type: 'number', default: 100, description: 'Number of tubular segments' },
                    { name: 'arc', type: 'number', default: 'Math.PI * 2', description: 'Central angle' }
                ],
                example: 'new THREE.TorusGeometry(1.2, 0.4, 16, 100)',
                category: 'advanced',
                description: 'Creates a torus geometry'
            },
            
            'TorusKnotGeometry': {
                parameters: [
                    { name: 'radius', type: 'number', default: 1, description: 'Radius of the torus knot' },
                    { name: 'tube', type: 'number', default: 0.4, description: 'Tube radius' },
                    { name: 'tubularSegments', type: 'number', default: 100, description: 'Number of tubular segments' },
                    { name: 'radialSegments', type: 'number', default: 16, description: 'Number of radial segments' },
                    { name: 'p', type: 'number', default: 2, description: 'How many times the geometry winds around its axis of rotational symmetry' },
                    { name: 'q', type: 'number', default: 3, description: 'How many times the geometry winds around a circle in the interior of the torus' }
                ],
                example: 'new THREE.TorusKnotGeometry(1, 0.3, 100, 16)',
                category: 'advanced',
                description: 'Creates a torus knot geometry'
            },
            
            // Polyhedra Geometries
            'DodecahedronGeometry': {
                parameters: [
                    { name: 'radius', type: 'number', default: 1, description: 'Radius of the dodecahedron' },
                    { name: 'detail', type: 'number', default: 0, description: 'Level of detail' }
                ],
                example: 'new THREE.DodecahedronGeometry(1.5)',
                category: 'polyhedra',
                description: 'Creates a dodecahedron geometry (12 faces)'
            },
            
            'IcosahedronGeometry': {
                parameters: [
                    { name: 'radius', type: 'number', default: 1, description: 'Radius of the icosahedron' },
                    { name: 'detail', type: 'number', default: 0, description: 'Level of detail' }
                ],
                example: 'new THREE.IcosahedronGeometry(1.5)',
                category: 'polyhedra',
                description: 'Creates an icosahedron geometry (20 faces)'
            },
            
            'OctahedronGeometry': {
                parameters: [
                    { name: 'radius', type: 'number', default: 1, description: 'Radius of the octahedron' },
                    { name: 'detail', type: 'number', default: 0, description: 'Level of detail' }
                ],
                example: 'new THREE.OctahedronGeometry(1.5)',
                category: 'polyhedra',
                description: 'Creates an octahedron geometry (8 faces)'
            },
            
            'TetrahedronGeometry': {
                parameters: [
                    { name: 'radius', type: 'number', default: 1, description: 'Radius of the tetrahedron' },
                    { name: 'detail', type: 'number', default: 0, description: 'Level of detail' }
                ],
                example: 'new THREE.TetrahedronGeometry(1.5)',
                category: 'polyhedra',
                description: 'Creates a tetrahedron geometry (4 faces)'
            },
            
            // Complex Geometries
            'CapsuleGeometry': {
                parameters: [
                    { name: 'radius', type: 'number', default: 1, description: 'Radius of the capsule' },
                    { name: 'length', type: 'number', default: 1, description: 'Length of the capsule' },
                    { name: 'capSubdivisions', type: 'number', default: 4, description: 'Cap subdivisions' },
                    { name: 'radialSegments', type: 'number', default: 8, description: 'Number of radial segments' }
                ],
                example: 'new THREE.CapsuleGeometry(0.8, 1.6, 4, 8)',
                category: 'complex',
                description: 'Creates a capsule geometry'
            },
            
            'LatheGeometry': {
                parameters: [
                    { name: 'points', type: 'array', default: 'points', description: 'Array of Vector2 points' },
                    { name: 'segments', type: 'number', default: 12, description: 'Number of segments' },
                    { name: 'phiStart', type: 'number', default: 0, description: 'Starting angle' },
                    { name: 'phiLength', type: 'number', default: 'Math.PI * 2', description: 'Central angle' }
                ],
                example: 'new THREE.LatheGeometry(lathePoints, 32)',
                category: 'complex',
                description: 'Creates geometry by rotating a series of points around an axis'
            },
            
            'ExtrudeGeometry': {
                parameters: [
                    { name: 'shapes', type: 'array', description: 'Array of Shape objects' },
                    { name: 'options', type: 'object', description: 'Extrusion options' }
                ],
                example: 'new THREE.ExtrudeGeometry(shape, extrudeSettings)',
                category: 'complex',
                description: 'Creates geometry by extruding a 2D shape'
            },
            
            'ShapeGeometry': {
                parameters: [
                    { name: 'shapes', type: 'array', description: 'Array of Shape objects' },
                    { name: 'curveSegments', type: 'number', default: 12, description: 'Number of curve segments' }
                ],
                example: 'new THREE.ShapeGeometry(shapes, 12)',
                category: 'complex',
                description: 'Creates geometry from one or more path shapes'
            },
            
            'TubeGeometry': {
                parameters: [
                    { name: 'path', type: 'curve', description: 'Path curve' },
                    { name: 'tubularSegments', type: 'number', default: 64, description: 'Number of tubular segments' },
                    { name: 'radius', type: 'number', default: 1, description: 'Radius of the tube' },
                    { name: 'radialSegments', type: 'number', default: 8, description: 'Number of radial segments' },
                    { name: 'closed', type: 'boolean', default: false, description: 'Is the tube closed' }
                ],
                example: 'new THREE.TubeGeometry(path, 64, 1, 8, false)',
                category: 'complex',
                description: 'Creates a tube that extrudes along a 3D curve'
            }
        };
    }
    
    /**
     * Initialize comprehensive material system
     */
    initializeMaterialAPI() {
        return {
            // Basic Materials
            'MeshBasicMaterial': {
                properties: {
                    color: { type: 'color', default: 0xffffff, description: 'Material color' },
                    map: { type: 'texture', description: 'Color (albedo) map' },
                    wireframe: { type: 'boolean', default: false, description: 'Render as wireframe' },
                    transparent: { type: 'boolean', default: false, description: 'Enable transparency' },
                    opacity: { type: 'number', default: 1.0, range: [0, 1], description: 'Material opacity' },
                    alphaMap: { type: 'texture', description: 'Alpha map for transparency' },
                    side: { type: 'enum', values: ['THREE.FrontSide', 'THREE.BackSide', 'THREE.DoubleSide'], default: 'THREE.FrontSide' }
                },
                example: 'new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })',
                category: 'basic',
                description: 'Basic material, not affected by lighting'
            },
            
            'MeshLambertMaterial': {
                properties: {
                    color: { type: 'color', default: 0xffffff, description: 'Material color' },
                    map: { type: 'texture', description: 'Color (albedo) map' },
                    emissive: { type: 'color', default: 0x000000, description: 'Emissive color' },
                    emissiveMap: { type: 'texture', description: 'Emissive map' },
                    emissiveIntensity: { type: 'number', default: 1.0, description: 'Emissive intensity' },
                    wireframe: { type: 'boolean', default: false, description: 'Render as wireframe' },
                    transparent: { type: 'boolean', default: false, description: 'Enable transparency' },
                    opacity: { type: 'number', default: 1.0, range: [0, 1], description: 'Material opacity' }
                },
                example: 'new THREE.MeshLambertMaterial({ color: 0x00ff00 })',
                category: 'basic',
                description: 'Material with non-physically based Lambertian reflectance'
            },
            
            'MeshPhongMaterial': {
                properties: {
                    color: { type: 'color', default: 0xffffff, description: 'Material color' },
                    map: { type: 'texture', description: 'Color (albedo) map' },
                    specular: { type: 'color', default: 0x111111, description: 'Specular color' },
                    shininess: { type: 'number', default: 30, description: 'Shininess factor' },
                    emissive: { type: 'color', default: 0x000000, description: 'Emissive color' },
                    emissiveMap: { type: 'texture', description: 'Emissive map' },
                    emissiveIntensity: { type: 'number', default: 1.0, description: 'Emissive intensity' },
                    wireframe: { type: 'boolean', default: false, description: 'Render as wireframe' },
                    transparent: { type: 'boolean', default: false, description: 'Enable transparency' },
                    opacity: { type: 'number', default: 1.0, range: [0, 1], description: 'Material opacity' }
                },
                example: 'new THREE.MeshPhongMaterial({ color: 0x0000ff, shininess: 100 })',
                category: 'basic',
                description: 'Material with non-physically based Blinn-Phong reflectance'
            },
            
            // PBR Materials
            'MeshStandardMaterial': {
                properties: {
                    color: { type: 'color', default: 0xffffff, description: 'Material color' },
                    map: { type: 'texture', description: 'Color (albedo) map' },
                    roughness: { type: 'number', default: 1.0, range: [0, 1], description: 'Surface roughness' },
                    roughnessMap: { type: 'texture', description: 'Roughness map' },
                    metalness: { type: 'number', default: 0.0, range: [0, 1], description: 'Metallic factor' },
                    metalnessMap: { type: 'texture', description: 'Metalness map' },
                    normalMap: { type: 'texture', description: 'Normal map' },
                    normalScale: { type: 'vector2', default: [1, 1], description: 'Normal map scale' },
                    envMap: { type: 'texture', description: 'Environment map' },
                    envMapIntensity: { type: 'number', default: 1.0, description: 'Environment map intensity' },
                    emissive: { type: 'color', default: 0x000000, description: 'Emissive color' },
                    emissiveMap: { type: 'texture', description: 'Emissive map' },
                    emissiveIntensity: { type: 'number', default: 1.0, description: 'Emissive intensity' },
                    wireframe: { type: 'boolean', default: false, description: 'Render as wireframe' },
                    transparent: { type: 'boolean', default: false, description: 'Enable transparency' },
                    opacity: { type: 'number', default: 1.0, range: [0, 1], description: 'Material opacity' }
                },
                example: 'new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.2 })',
                category: 'pbr',
                description: 'Physically based standard material'
            },
            
            'MeshPhysicalMaterial': {
                properties: {
                    // Inherits all MeshStandardMaterial properties plus:
                    clearcoat: { type: 'number', default: 0.0, range: [0, 1], description: 'Clearcoat intensity' },
                    clearcoatMap: { type: 'texture', description: 'Clearcoat map' },
                    clearcoatRoughness: { type: 'number', default: 0.0, range: [0, 1], description: 'Clearcoat roughness' },
                    clearcoatRoughnessMap: { type: 'texture', description: 'Clearcoat roughness map' },
                    clearcoatNormalMap: { type: 'texture', description: 'Clearcoat normal map' },
                    clearcoatNormalScale: { type: 'vector2', default: [1, 1], description: 'Clearcoat normal scale' },
                    transmission: { type: 'number', default: 0.0, range: [0, 1], description: 'Transmission factor' },
                    transmissionMap: { type: 'texture', description: 'Transmission map' },
                    thickness: { type: 'number', default: 0, description: 'Thickness of the volume' },
                    thicknessMap: { type: 'texture', description: 'Thickness map' },
                    attenuationDistance: { type: 'number', default: Infinity, description: 'Attenuation distance' },
                    attenuationColor: { type: 'color', default: 0xffffff, description: 'Attenuation color' },
                    ior: { type: 'number', default: 1.5, description: 'Index of refraction' },
                    reflectivity: { type: 'number', default: 0.5, range: [0, 1], description: 'Reflectivity' },
                    sheen: { type: 'number', default: 0.0, range: [0, 1], description: 'Sheen intensity' },
                    sheenColor: { type: 'color', default: 0x000000, description: 'Sheen color' },
                    sheenRoughness: { type: 'number', default: 1.0, range: [0, 1], description: 'Sheen roughness' }
                },
                example: 'new THREE.MeshPhysicalMaterial({ color: 0x888888, transmission: 0.9, thickness: 1.0 })',
                category: 'pbr',
                description: 'Extended physically based material with additional effects'
            },
            
            // Special Materials
            'MeshMatcapMaterial': {
                properties: {
                    color: { type: 'color', default: 0xffffff, description: 'Material color' },
                    matcap: { type: 'texture', description: 'MatCap texture' },
                    map: { type: 'texture', description: 'Color (albedo) map' },
                    normalMap: { type: 'texture', description: 'Normal map' },
                    normalScale: { type: 'vector2', default: [1, 1], description: 'Normal map scale' },
                    displacementMap: { type: 'texture', description: 'Displacement map' },
                    displacementScale: { type: 'number', default: 1, description: 'Displacement scale' },
                    alphaMap: { type: 'texture', description: 'Alpha map' },
                    wireframe: { type: 'boolean', default: false, description: 'Render as wireframe' },
                    transparent: { type: 'boolean', default: false, description: 'Enable transparency' },
                    opacity: { type: 'number', default: 1.0, range: [0, 1], description: 'Material opacity' }
                },
                example: 'new THREE.MeshMatcapMaterial({ matcap: matcapTexture })',
                category: 'special',
                description: 'Material using MatCap (Material Capture) technique'
            },
            
            'ShaderMaterial': {
                properties: {
                    vertexShader: { type: 'string', description: 'Vertex shader code' },
                    fragmentShader: { type: 'string', description: 'Fragment shader code' },
                    uniforms: { type: 'object', description: 'Shader uniforms' },
                    defines: { type: 'object', description: 'Shader defines' },
                    transparent: { type: 'boolean', default: false, description: 'Enable transparency' },
                    side: { type: 'enum', values: ['THREE.FrontSide', 'THREE.BackSide', 'THREE.DoubleSide'], default: 'THREE.FrontSide' }
                },
                example: 'new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms })',
                category: 'advanced',
                description: 'Custom shader material'
            }
        };
    }
    
    /**
     * Initialize comprehensive lighting system
     */
    initializeLightingAPI() {
        return {
            'AmbientLight': {
                parameters: [
                    { name: 'color', type: 'color', default: 0x404040, description: 'Light color' },
                    { name: 'intensity', type: 'number', default: 1.0, description: 'Light intensity' }
                ],
                properties: {
                    color: { type: 'color', description: 'Light color' },
                    intensity: { type: 'number', description: 'Light intensity' }
                },
                example: 'new THREE.AmbientLight(0x404040, 0.4)',
                category: 'basic',
                description: 'Globally illuminates all objects equally'
            },
            
            'DirectionalLight': {
                parameters: [
                    { name: 'color', type: 'color', default: 0xffffff, description: 'Light color' },
                    { name: 'intensity', type: 'number', default: 1.0, description: 'Light intensity' }
                ],
                properties: {
                    color: { type: 'color', description: 'Light color' },
                    intensity: { type: 'number', description: 'Light intensity' },
                    position: { type: 'vector3', description: 'Light position' },
                    target: { type: 'object3d', description: 'Light target' },
                    castShadow: { type: 'boolean', default: false, description: 'Enable shadow casting' },
                    shadow: {
                        mapSize: { type: 'vector2', default: [1024, 1024], description: 'Shadow map size' },
                        camera: {
                            left: { type: 'number', default: -10, description: 'Shadow camera left' },
                            right: { type: 'number', default: 10, description: 'Shadow camera right' },
                            top: { type: 'number', default: 10, description: 'Shadow camera top' },
                            bottom: { type: 'number', default: -10, description: 'Shadow camera bottom' },
                            near: { type: 'number', default: 0.5, description: 'Shadow camera near' },
                            far: { type: 'number', default: 500, description: 'Shadow camera far' }
                        }
                    }
                },
                example: 'new THREE.DirectionalLight(0xffffff, 1.0)',
                category: 'basic',
                description: 'Light with parallel rays, like sunlight'
            },
            
            'PointLight': {
                parameters: [
                    { name: 'color', type: 'color', default: 0xffffff, description: 'Light color' },
                    { name: 'intensity', type: 'number', default: 1.0, description: 'Light intensity' },
                    { name: 'distance', type: 'number', default: 0, description: 'Light distance (0 = infinite)' },
                    { name: 'decay', type: 'number', default: 2, description: 'Light decay factor' }
                ],
                properties: {
                    color: { type: 'color', description: 'Light color' },
                    intensity: { type: 'number', description: 'Light intensity' },
                    position: { type: 'vector3', description: 'Light position' },
                    distance: { type: 'number', description: 'Light range' },
                    decay: { type: 'number', description: 'Light decay' },
                    castShadow: { type: 'boolean', default: false, description: 'Enable shadow casting' },
                    shadow: {
                        mapSize: { type: 'vector2', default: [1024, 1024], description: 'Shadow map size' },
                        camera: {
                            near: { type: 'number', default: 0.5, description: 'Shadow camera near' },
                            far: { type: 'number', default: 500, description: 'Shadow camera far' },
                            fov: { type: 'number', default: 90, description: 'Shadow camera FOV' }
                        }
                    }
                },
                example: 'new THREE.PointLight(0xff0000, 1, 100)',
                category: 'basic',
                description: 'Light that emits from a single point in all directions'
            },
            
            'SpotLight': {
                parameters: [
                    { name: 'color', type: 'color', default: 0xffffff, description: 'Light color' },
                    { name: 'intensity', type: 'number', default: 1.0, description: 'Light intensity' },
                    { name: 'distance', type: 'number', default: 0, description: 'Light distance (0 = infinite)' },
                    { name: 'angle', type: 'number', default: 'Math.PI / 3', description: 'Light cone angle' },
                    { name: 'penumbra', type: 'number', default: 0, description: 'Light edge softness' },
                    { name: 'decay', type: 'number', default: 2, description: 'Light decay factor' }
                ],
                properties: {
                    color: { type: 'color', description: 'Light color' },
                    intensity: { type: 'number', description: 'Light intensity' },
                    position: { type: 'vector3', description: 'Light position' },
                    target: { type: 'object3d', description: 'Light target' },
                    distance: { type: 'number', description: 'Light range' },
                    angle: { type: 'number', description: 'Spot angle in radians' },
                    penumbra: { type: 'number', range: [0, 1], description: 'Edge softness' },
                    decay: { type: 'number', description: 'Light decay' },
                    castShadow: { type: 'boolean', default: false, description: 'Enable shadow casting' }
                },
                example: 'new THREE.SpotLight(0xffffff, 1, 100, Math.PI / 4, 0.1)',
                category: 'advanced',
                description: 'Light that emits from a point in a cone shape'
            },
            
            'HemisphereLight': {
                parameters: [
                    { name: 'skyColor', type: 'color', default: 0xffffff, description: 'Sky color' },
                    { name: 'groundColor', type: 'color', default: 0xffffff, description: 'Ground color' },
                    { name: 'intensity', type: 'number', default: 1.0, description: 'Light intensity' }
                ],
                properties: {
                    color: { type: 'color', description: 'Sky color' },
                    groundColor: { type: 'color', description: 'Ground color' },
                    intensity: { type: 'number', description: 'Light intensity' },
                    position: { type: 'vector3', description: 'Light position' }
                },
                example: 'new THREE.HemisphereLight(0xffffbb, 0x080820, 1)',
                category: 'advanced',
                description: 'Light positioned directly above the scene, with different colors from above and below'
            },
            
            'RectAreaLight': {
                parameters: [
                    { name: 'color', type: 'color', default: 0xffffff, description: 'Light color' },
                    { name: 'intensity', type: 'number', default: 1.0, description: 'Light intensity' },
                    { name: 'width', type: 'number', default: 10, description: 'Light width' },
                    { name: 'height', type: 'number', default: 10, description: 'Light height' }
                ],
                properties: {
                    color: { type: 'color', description: 'Light color' },
                    intensity: { type: 'number', description: 'Light intensity' },
                    width: { type: 'number', description: 'Light width' },
                    height: { type: 'number', description: 'Light height' },
                    position: { type: 'vector3', description: 'Light position' },
                    rotation: { type: 'euler', description: 'Light rotation' }
                },
                example: 'new THREE.RectAreaLight(0xffffff, 1, 10, 10)',
                category: 'advanced',
                description: 'Rectangular area light that illuminates uniformly across the face of the rectangle'
            }
        };
    }
    
    /**
     * Initialize camera system API
     */
    initializeCameraAPI() {
        return {
            'PerspectiveCamera': {
                parameters: [
                    { name: 'fov', type: 'number', default: 75, description: 'Field of view in degrees' },
                    { name: 'aspect', type: 'number', default: 'window.innerWidth / window.innerHeight', description: 'Aspect ratio' },
                    { name: 'near', type: 'number', default: 0.1, description: 'Near clipping plane' },
                    { name: 'far', type: 'number', default: 1000, description: 'Far clipping plane' }
                ],
                properties: {
                    fov: { type: 'number', description: 'Field of view' },
                    aspect: { type: 'number', description: 'Aspect ratio' },
                    near: { type: 'number', description: 'Near plane' },
                    far: { type: 'number', description: 'Far plane' },
                    position: { type: 'vector3', description: 'Camera position' },
                    rotation: { type: 'euler', description: 'Camera rotation' },
                    zoom: { type: 'number', default: 1, description: 'Zoom factor' }
                },
                example: 'new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)',
                category: 'camera',
                description: 'Camera with perspective projection'
            },
            
            'OrthographicCamera': {
                parameters: [
                    { name: 'left', type: 'number', description: 'Left plane' },
                    { name: 'right', type: 'number', description: 'Right plane' },
                    { name: 'top', type: 'number', description: 'Top plane' },
                    { name: 'bottom', type: 'number', description: 'Bottom plane' },
                    { name: 'near', type: 'number', default: 0.1, description: 'Near clipping plane' },
                    { name: 'far', type: 'number', default: 1000, description: 'Far clipping plane' }
                ],
                properties: {
                    left: { type: 'number', description: 'Left plane' },
                    right: { type: 'number', description: 'Right plane' },
                    top: { type: 'number', description: 'Top plane' },
                    bottom: { type: 'number', description: 'Bottom plane' },
                    near: { type: 'number', description: 'Near plane' },
                    far: { type: 'number', description: 'Far plane' },
                    position: { type: 'vector3', description: 'Camera position' },
                    rotation: { type: 'euler', description: 'Camera rotation' },
                    zoom: { type: 'number', default: 1, description: 'Zoom factor' }
                },
                example: 'new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 1000)',
                category: 'camera',
                description: 'Camera with orthographic projection'
            }
        };
    }
    
    /**
     * Initialize controls API
     */
    initializeControlsAPI() {
        return {
            'OrbitControls': {
                parameters: [
                    { name: 'object', type: 'camera', description: 'Camera to control' },
                    { name: 'domElement', type: 'element', description: 'DOM element for event listeners' }
                ],
                properties: {
                    enableDamping: { type: 'boolean', default: false, description: 'Enable damping (inertia)' },
                    dampingFactor: { type: 'number', default: 0.05, description: 'Damping factor' },
                    enableZoom: { type: 'boolean', default: true, description: 'Enable zooming' },
                    zoomSpeed: { type: 'number', default: 1.0, description: 'Zoom speed' },
                    enableRotate: { type: 'boolean', default: true, description: 'Enable rotation' },
                    rotateSpeed: { type: 'number', default: 1.0, description: 'Rotation speed' },
                    enablePan: { type: 'boolean', default: true, description: 'Enable panning' },
                    panSpeed: { type: 'number', default: 1.0, description: 'Pan speed' },
                    autoRotate: { type: 'boolean', default: false, description: 'Enable auto rotation' },
                    autoRotateSpeed: { type: 'number', default: 2.0, description: 'Auto rotation speed' },
                    target: { type: 'vector3', description: 'Target position to orbit around' }
                },
                example: 'new OrbitControls(camera, renderer.domElement)',
                category: 'controls',
                description: 'Camera controls for orbiting around a target'
            }
        };
    }
    
    /**
     * Initialize loaders API
     */
    initializeLoadersAPI() {
        return {
            'TextureLoader': {
                methods: {
                    load: {
                        parameters: [
                            { name: 'url', type: 'string', description: 'URL to texture file' },
                            { name: 'onLoad', type: 'function', optional: true, description: 'Load callback' },
                            { name: 'onProgress', type: 'function', optional: true, description: 'Progress callback' },
                            { name: 'onError', type: 'function', optional: true, description: 'Error callback' }
                        ]
                    }
                },
                example: 'new THREE.TextureLoader().load("texture.jpg")',
                category: 'loaders',
                description: 'Loads textures from image files'
            },
            
            'OBJLoader': {
                methods: {
                    load: {
                        parameters: [
                            { name: 'url', type: 'string', description: 'URL to OBJ file' },
                            { name: 'onLoad', type: 'function', optional: true, description: 'Load callback' },
                            { name: 'onProgress', type: 'function', optional: true, description: 'Progress callback' },
                            { name: 'onError', type: 'function', optional: true, description: 'Error callback' }
                        ]
                    }
                },
                example: 'new OBJLoader().load("model.obj", (object) => { scene.add(object); })',
                category: 'loaders',
                description: 'Loads 3D models from OBJ files'
            },
            
            'GLTFLoader': {
                methods: {
                    load: {
                        parameters: [
                            { name: 'url', type: 'string', description: 'URL to GLTF file' },
                            { name: 'onLoad', type: 'function', optional: true, description: 'Load callback' },
                            { name: 'onProgress', type: 'function', optional: true, description: 'Progress callback' },
                            { name: 'onError', type: 'function', optional: true, description: 'Error callback' }
                        ]
                    }
                },
                example: 'new GLTFLoader().load("model.gltf", (gltf) => { scene.add(gltf.scene); })',
                category: 'loaders',
                description: 'Loads 3D models and animations from GLTF files'
            }
        };
    }
    
    /**
     * Initialize post-processing API
     */
    initializePostProcessingAPI() {
        return {
            'EffectComposer': {
                parameters: [
                    { name: 'renderer', type: 'renderer', description: 'WebGL renderer' },
                    { name: 'renderTarget', type: 'rendertarget', optional: true, description: 'Custom render target' }
                ],
                methods: {
                    addPass: { description: 'Add a post-processing pass' },
                    render: { description: 'Render with post-processing effects' }
                },
                example: 'new EffectComposer(renderer)',
                category: 'postprocessing',
                description: 'Manager for post-processing effects'
            },
            
            'BloomPass': {
                parameters: [
                    { name: 'strength', type: 'number', default: 1.0, description: 'Bloom strength' },
                    { name: 'kernelSize', type: 'number', default: 25, description: 'Kernel size' },
                    { name: 'sigma', type: 'number', default: 4.0, description: 'Sigma value' }
                ],
                example: 'new BloomPass(1.0, 25, 4.0)',
                category: 'postprocessing',
                description: 'Bloom effect pass'
            },
            
            'FilmPass': {
                parameters: [
                    { name: 'noiseIntensity', type: 'number', default: 0.5, description: 'Noise intensity' },
                    { name: 'scanlinesIntensity', type: 'number', default: 0.05, description: 'Scanlines intensity' },
                    { name: 'scanlinesCount', type: 'number', default: 4096, description: 'Number of scanlines' },
                    { name: 'grayscale', type: 'boolean', default: false, description: 'Enable grayscale' }
                ],
                example: 'new FilmPass(0.35, 0.025, 648, false)',
                category: 'postprocessing',
                description: 'Film grain and scanlines effect'
            }
        };
    }
    
    /**
     * Initialize helpers API
     */
    initializeHelpersAPI() {
        return {
            'GridHelper': {
                parameters: [
                    { name: 'size', type: 'number', default: 10, description: 'Grid size' },
                    { name: 'divisions', type: 'number', default: 10, description: 'Number of divisions' },
                    { name: 'colorCenterLine', type: 'color', default: 0x444444, description: 'Center line color' },
                    { name: 'colorGrid', type: 'color', default: 0x888888, description: 'Grid color' }
                ],
                example: 'new THREE.GridHelper(20, 20)',
                category: 'helpers',
                description: 'Grid helper for ground plane visualization'
            },
            
            'AxesHelper': {
                parameters: [
                    { name: 'size', type: 'number', default: 1, description: 'Size of the axes' }
                ],
                example: 'new THREE.AxesHelper(5)',
                category: 'helpers',
                description: 'Displays coordinate system axes (X=red, Y=green, Z=blue)'
            },
            
            'DirectionalLightHelper': {
                parameters: [
                    { name: 'light', type: 'light', description: 'Directional light' },
                    { name: 'size', type: 'number', default: 1, description: 'Size of the helper' },
                    { name: 'color', type: 'color', optional: true, description: 'Helper color' }
                ],
                example: 'new THREE.DirectionalLightHelper(directionalLight, 5)',
                category: 'helpers',
                description: 'Visual helper for directional lights'
            }
        };
    }
    
    /**
     * Initialize math utilities API
     */
    initializeMathAPI() {
        return {
            'Vector3': {
                constructor: {
                    parameters: [
                        { name: 'x', type: 'number', default: 0, description: 'X coordinate' },
                        { name: 'y', type: 'number', default: 0, description: 'Y coordinate' },
                        { name: 'z', type: 'number', default: 0, description: 'Z coordinate' }
                    ]
                },
                methods: {
                    set: { parameters: ['x', 'y', 'z'], description: 'Set vector components' },
                    normalize: { description: 'Normalize the vector' },
                    length: { description: 'Get vector length' },
                    dot: { parameters: ['vector'], description: 'Dot product with another vector' },
                    cross: { parameters: ['vector'], description: 'Cross product with another vector' }
                },
                example: 'new THREE.Vector3(1, 2, 3)',
                category: 'math',
                description: '3D vector with x, y, z components'
            },
            
            'Color': {
                constructor: {
                    parameters: [
                        { name: 'color', type: 'color', description: 'Color value (hex, string, or RGB)' }
                    ]
                },
                methods: {
                    setHex: { parameters: ['hex'], description: 'Set color from hex value' },
                    setRGB: { parameters: ['r', 'g', 'b'], description: 'Set color from RGB values' },
                    getHex: { description: 'Get hex color value' }
                },
                example: 'new THREE.Color(0xff0000)',
                category: 'math',
                description: 'Color representation and manipulation'
            }
        };
    }
    
    /**
     * Initialize animation API
     */
    initializeAnimationAPI() {
        return {
            'AnimationMixer': {
                parameters: [
                    { name: 'root', type: 'object3d', description: 'Root object for animations' }
                ],
                methods: {
                    clipAction: { parameters: ['clip'], description: 'Create action from animation clip' },
                    update: { parameters: ['deltaTime'], description: 'Update animations' }
                },
                example: 'new THREE.AnimationMixer(model)',
                category: 'animation',
                description: 'Player for animation clips'
            },
            
            'Clock': {
                methods: {
                    getDelta: { description: 'Get time since last call' },
                    getElapsedTime: { description: 'Get total elapsed time' }
                },
                example: 'new THREE.Clock()',
                category: 'animation',
                description: 'Time tracking for animations'
            }
        };
    }
    
    /**
     * Get API information for a specific Three.js class
     * @param {string} className - Name of the Three.js class
     * @returns {Object|null} API information
     */
    getAPIInfo(className) {
        // Search across all API categories
        const categories = [
            this.geometries, this.materials, this.lights, 
            this.cameras, this.controls, this.loaders,
            this.postProcessing, this.helpers, this.math, this.animation
        ];
        
        for (const category of categories) {
            if (category[className]) {
                return category[className];
            }
        }
        
        return null;
    }
    
    /**
     * Get all available APIs by category
     * @returns {Object} Complete API registry
     */
    getAllAPIs() {
        return {
            geometries: this.geometries,
            materials: this.materials,
            lights: this.lights,
            cameras: this.cameras,
            controls: this.controls,
            loaders: this.loaders,
            postProcessing: this.postProcessing,
            helpers: this.helpers,
            math: this.math,
            animation: this.animation
        };
    }
    
    /**
     * Get autocompletion suggestions for Monaco Editor
     * @param {string} prefix - Current typing prefix
     * @returns {Array} Completion suggestions
     */
    getCompletionSuggestions(prefix = '') {
        const suggestions = [];
        const apis = this.getAllAPIs();
        
        Object.entries(apis).forEach(([category, items]) => {
            Object.entries(items).forEach(([className, info]) => {
                if (className.toLowerCase().includes(prefix.toLowerCase())) {
                    suggestions.push({
                        label: className,
                        kind: monaco.languages.CompletionItemKind.Class,
                        insertText: info.example || className,
                        documentation: info.description,
                        detail: `${category} - ${info.description}`,
                        sortText: `0_${className}` // Prioritize in autocompletion
                    });
                }
            });
        });
        
        return suggestions;
    }
    
    /**
     * Generate comprehensive code templates
     * @param {string} type - Template type
     * @param {Object} options - Template options
     * @returns {string} Generated code template
     */
    generateCodeTemplate(type, options = {}) {
        switch (type) {
            case 'complete_scene':
                return this.generateCompleteSceneTemplate(options);
            case 'pbr_materials':
                return this.generatePBRMaterialsTemplate(options);
            case 'advanced_lighting':
                return this.generateAdvancedLightingTemplate(options);
            case 'post_processing':
                return this.generatePostProcessingTemplate(options);
            default:
                return this.generateBasicTemplate(options);
        }
    }
    
    /**
     * Generate complete scene template with all features
     */
    generateCompleteSceneTemplate(options) {
        return `
/**
 * 🌟 Complete Three.js Scene Template
 * Generated with comprehensive API support
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// ═══════════════════════════════════════════════════════════════
// 🌍 SCENE SETUP
// ═══════════════════════════════════════════════════════════════

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.body.appendChild(renderer.domElement);

// ═══════════════════════════════════════════════════════════════
// 🎮 CONTROLS
// ═══════════════════════════════════════════════════════════════

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0);

// ═══════════════════════════════════════════════════════════════
// 💡 ADVANCED LIGHTING
// ═══════════════════════════════════════════════════════════════

// Ambient light for base illumination
const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
scene.add(ambientLight);

// Main directional light (sun)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(10, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.setScalar(2048);
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
scene.add(directionalLight);

// Fill light
const fillLight = new THREE.DirectionalLight(0x9bb7ff, 0.3);
fillLight.position.set(-5, 5, -5);
scene.add(fillLight);

// Accent point lights
const pointLight1 = new THREE.PointLight(0xff4444, 0.5, 20);
pointLight1.position.set(5, 3, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x4444ff, 0.5, 20);
pointLight2.position.set(-5, 3, -5);
scene.add(pointLight2);

// ═══════════════════════════════════════════════════════════════
// 🎨 PBR MATERIALS
// ═══════════════════════════════════════════════════════════════

const materials = {
    metal: new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 1.0,
        roughness: 0.2
    }),
    
    plastic: new THREE.MeshStandardMaterial({
        color: 0xff4444,
        metalness: 0.0,
        roughness: 0.5
    }),
    
    glass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.0,
        roughness: 0.0,
        transmission: 0.9,
        thickness: 1.0
    }),
    
    ceramic: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.0,
        roughness: 0.1
    })
};

// ═══════════════════════════════════════════════════════════════
// 📐 GEOMETRIES
// ═══════════════════════════════════════════════════════════════

// Create various geometries
const geometries = [
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.SphereGeometry(1.2, 32, 16),
    new THREE.CylinderGeometry(1, 1, 2, 32),
    new THREE.TorusGeometry(1, 0.4, 16, 100),
    new THREE.IcosahedronGeometry(1.2)
];

// Create meshes with different materials
geometries.forEach((geometry, index) => {
    const materialNames = Object.keys(materials);
    const material = materials[materialNames[index % materialNames.length]];
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.x = (index - 2) * 4;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    scene.add(mesh);
});

// Ground plane
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x404040,
    metalness: 0.0,
    roughness: 0.8
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2;
ground.receiveShadow = true;
scene.add(ground);

// ═══════════════════════════════════════════════════════════════
// 🔧 HELPERS (Development only)
// ═══════════════════════════════════════════════════════════════

const gridHelper = new THREE.GridHelper(20, 20);
gridHelper.position.y = -1.99;
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// ═══════════════════════════════════════════════════════════════
// 🎬 ANIMATION LOOP
// ═══════════════════════════════════════════════════════════════

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    
    // Update controls
    controls.update();
    
    // Animate objects
    scene.children.forEach((child, index) => {
        if (child.isMesh && child.geometry.type !== 'PlaneGeometry') {
            child.rotation.y = elapsedTime * 0.5 + index * 0.5;
            child.position.y = Math.sin(elapsedTime + index) * 0.2;
        }
    });
    
    // Animate lights
    pointLight1.intensity = 0.5 + Math.sin(elapsedTime * 2) * 0.2;
    pointLight2.intensity = 0.5 + Math.cos(elapsedTime * 2) * 0.2;
    
    renderer.render(scene, camera);
}

// ═══════════════════════════════════════════════════════════════
// 📱 RESPONSIVE HANDLING
// ═══════════════════════════════════════════════════════════════

window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ═══════════════════════════════════════════════════════════════
// 🚀 START ANIMATION
// ═══════════════════════════════════════════════════════════════

camera.position.set(10, 5, 10);
controls.update();
animate();
        `.trim();
    }
    
    /**
     * Get status and statistics
     * @returns {Object} Registry statistics
     */
    getStatus() {
        const apis = this.getAllAPIs();
        const stats = {};
        
        Object.entries(apis).forEach(([category, items]) => {
            stats[category] = Object.keys(items).length;
        });
        
        return {
            totalAPIs: Object.values(stats).reduce((a, b) => a + b, 0),
            categories: stats,
            coverage: {
                geometries: stats.geometries > 15,
                materials: stats.materials > 5,
                lights: stats.lights > 4,
                complete: Object.values(stats).every(count => count > 0)
            }
        };
    }
}