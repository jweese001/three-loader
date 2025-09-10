/**
 * CodeAdapter - Smart Three.js Code Adaptation System
 * Automatically converts standalone Three.js files to three-loader compatible format
 * Part of Phase 3: Enhanced Code Editor to Viewport Execution
 * 
 * Features:
 * - Detects standalone vs three-loader generated files
 * - Removes conflicting boilerplate (renderer, scene, camera)
 * - Preserves all creative content (objects, materials, lighting)
 * - Enables seamless viewport visualization
 */

export class CodeAdapter {
    constructor() {
        this.debugMode = true;
        
        // Detection patterns for standalone Three.js files
        this.standalonePatterns = {
            renderer: /new THREE\.WebGLRenderer\s*\([^)]*\)/g,
            scene: /new THREE\.Scene\s*\([^)]*\)/g,
            camera: /new THREE\.(Perspective|Orthographic)Camera\s*\([^)]*\)/g,
            animationLoop: /(function\s+animate\s*\([^)]*\)\s*\{[\s\S]*?\}[\s\S]*?animate\s*\(\s*\);)|(requestAnimationFrame\s*\([^)]*\))/g,
            domManipulation: /(document\.(body|getElementById)[^;]*appendChild[^;]*;)|(renderer\.setSize[^;]*;)/g,
            orbitControls: /new\s+OrbitControls\s*\([^)]*\)/g
        };
        
        // Patterns for creative content to preserve
        this.preservePatterns = {
            geometries: /new THREE\.\w+Geometry\s*\([^)]*\)/g,
            materials: /new THREE\.\w+Material\s*\(\s*\{[\s\S]*?\}\s*\)/g,
            meshes: /new THREE\.Mesh\s*\([^)]*\)/g,
            lights: /new THREE\.\w+Light\s*\([^)]*\)/g,
            objects: /\w+\.(position|rotation|scale)\.(set|x|y|z)\s*[=\(][^;]*;/g,
            sceneAdd: /scene\.add\s*\([^)]*\)/g
        };
        
        // Patterns for animation content detection
        this.animationPatterns = {
            animationFunctions: /function\s+animate\s*\([^)]*\)\s*\{[\s\S]*?\}/g,
            animationArrows: /const\s+animate\s*=\s*\(\s*[^)]*\)\s*=>\s*\{[\s\S]*?\}/g,
            animationCalls: /animate\s*\(\s*\)\s*;/g,
            requestAnimationFrame: /requestAnimationFrame\s*\([^)]*\)/g,
            rotationAnimations: /\w+\.rotation\.\w+\s*[=\+\-\*\/]+\s*[^;]*;/g,
            positionAnimations: /\w+\.position\.\w+\s*[=\+\-\*\/]+\s*[^;]*;/g,
            scaleAnimations: /\w+\.scale\.\w+\s*[=\+\-\*\/]+\s*[^;]*;/g,
            uniformAnimations: /\w+\.uniforms\.\w+\.value\s*[=\+\-\*\/]+\s*[^;]*;/g
        };
        
        console.log('🔄 CodeAdapter initialized - Smart Three.js file adaptation ready');
    }
    
    /**
     * Analyze code to determine if it's a standalone Three.js file
     * @param {string} code - JavaScript code to analyze
     * @returns {Object} Analysis results
     */
    analyzeCode(code) {
        const analysis = {
            isStandalone: false,
            hasRenderer: false,
            hasScene: false,
            hasCamera: false,
            hasAnimationLoop: false,
            hasDomManipulation: false,
            hasOrbitControls: false,
            creativeElements: {
                geometries: [],
                materials: [],
                meshes: [],
                lights: [],
                objects: []
            },
            confidence: 0
        };
        
        // Reset global regex lastIndex to prevent interference between tests
        Object.values(this.standalonePatterns).forEach(pattern => pattern.lastIndex = 0);
        
        // Test for standalone patterns
        analysis.hasRenderer = this.standalonePatterns.renderer.test(code);
        analysis.hasScene = this.standalonePatterns.scene.test(code);
        analysis.hasCamera = this.standalonePatterns.camera.test(code);
        analysis.hasAnimationLoop = this.standalonePatterns.animationLoop.test(code);
        analysis.hasDomManipulation = this.standalonePatterns.domManipulation.test(code);
        analysis.hasOrbitControls = this.standalonePatterns.orbitControls.test(code);
        
        // Calculate confidence score
        let confidenceFactors = 0;
        if (analysis.hasRenderer) confidenceFactors += 3;
        if (analysis.hasScene) confidenceFactors += 2;
        if (analysis.hasCamera) confidenceFactors += 2;
        if (analysis.hasAnimationLoop) confidenceFactors += 1;
        if (analysis.hasDomManipulation) confidenceFactors += 1;
        
        analysis.confidence = Math.min(confidenceFactors / 9 * 100, 100);
        analysis.isStandalone = analysis.confidence > 50;
        
        // Extract creative elements
        this.extractCreativeElements(code, analysis.creativeElements);
        
        // Extract animation information
        analysis.animationInfo = this.extractAnimationInfo(code);
        
        if (this.debugMode) {
            console.log('🔍 Code Analysis Results:', {
                isStandalone: analysis.isStandalone,
                confidence: analysis.confidence + '%',
                patterns: {
                    renderer: analysis.hasRenderer,
                    scene: analysis.hasScene,
                    camera: analysis.hasCamera,
                    animation: analysis.hasAnimationLoop,
                    dom: analysis.hasDomManipulation
                },
                creativeElements: Object.keys(analysis.creativeElements).reduce((acc, key) => {
                    acc[key] = analysis.creativeElements[key].length;
                    return acc;
                }, {})
            });
        }
        
        return analysis;
    }
    
    /**
     * Extract creative elements from code for preservation
     * @param {string} code - Code to analyze
     * @param {Object} elements - Object to populate with found elements
     */
    extractCreativeElements(code, elements) {
        // Reset global regex lastIndex
        Object.values(this.preservePatterns).forEach(pattern => pattern.lastIndex = 0);
        
        elements.geometries = [...code.matchAll(this.preservePatterns.geometries)].map(match => match[0]);
        elements.materials = [...code.matchAll(this.preservePatterns.materials)].map(match => match[0]);
        elements.meshes = [...code.matchAll(this.preservePatterns.meshes)].map(match => match[0]);
        elements.lights = [...code.matchAll(this.preservePatterns.lights)].map(match => match[0]);
        elements.objects = [...code.matchAll(this.preservePatterns.objects)].map(match => match[0]);
    }
    
    /**
     * Extract animation information from code
     * @param {string} code - Code to analyze
     * @returns {Object} Animation information
     */
    extractAnimationInfo(code) {
        // Reset global regex lastIndex
        Object.values(this.animationPatterns).forEach(pattern => pattern.lastIndex = 0);
        
        const animationInfo = {
            hasAnimations: false,
            animationFunctions: [],
            animationCalls: [],
            rotationAnimations: [],
            positionAnimations: [],
            scaleAnimations: [],
            uniformAnimations: [],
            fullAnimationCode: ''
        };
        
        // Extract different types of animations
        animationInfo.animationFunctions = [...code.matchAll(this.animationPatterns.animationFunctions)].map(match => match[0]);
        animationInfo.animationFunctions.push(...[...code.matchAll(this.animationPatterns.animationArrows)].map(match => match[0]));
        animationInfo.animationCalls = [...code.matchAll(this.animationPatterns.animationCalls)].map(match => match[0]);
        animationInfo.rotationAnimations = [...code.matchAll(this.animationPatterns.rotationAnimations)].map(match => match[0]);
        animationInfo.positionAnimations = [...code.matchAll(this.animationPatterns.positionAnimations)].map(match => match[0]);
        animationInfo.scaleAnimations = [...code.matchAll(this.animationPatterns.scaleAnimations)].map(match => match[0]);
        animationInfo.uniformAnimations = [...code.matchAll(this.animationPatterns.uniformAnimations)].map(match => match[0]);
        
        // Check if any animations were found
        animationInfo.hasAnimations = 
            animationInfo.animationFunctions.length > 0 ||
            animationInfo.rotationAnimations.length > 0 ||
            animationInfo.positionAnimations.length > 0 ||
            animationInfo.scaleAnimations.length > 0 ||
            animationInfo.uniformAnimations.length > 0;
        
        // Extract the full animation code block if animations exist
        if (animationInfo.hasAnimations && animationInfo.animationFunctions.length > 0) {
            // Find the complete animation block including function + call
            const animationFunctionMatch = code.match(/function\s+animate\s*\([^)]*\)\s*\{[\s\S]*?\}[\s\S]*?animate\s*\(\s*\)\s*;/);
            if (animationFunctionMatch) {
                animationInfo.fullAnimationCode = animationFunctionMatch[0];
            }
        }
        
        if (this.debugMode && animationInfo.hasAnimations) {
            console.log('🎬 Animation Detection Results:', {
                hasAnimations: animationInfo.hasAnimations,
                functions: animationInfo.animationFunctions.length,
                rotations: animationInfo.rotationAnimations.length,
                positions: animationInfo.positionAnimations.length,
                scales: animationInfo.scaleAnimations.length,
                uniforms: animationInfo.uniformAnimations.length
            });
        }
        
        return animationInfo;
    }
    
    /**
     * Transform standalone code to three-loader compatible format
     * @param {string} code - Original standalone code
     * @param {Object} analysis - Analysis results from analyzeCode()
     * @returns {string} Transformed code
     */
    transformCode(code, analysis) {
        if (!analysis.isStandalone) {
            if (this.debugMode) {
                console.log('✅ Code is already three-loader compatible, no transformation needed');
            }
            return code;
        }
        
        console.log('🔄 Transforming standalone Three.js code to three-loader format...');
        
        let transformedCode = code;
        
        // Step 1: Remove conflicting boilerplate
        transformedCode = this.removeConflictingCode(transformedCode);
        
        // Step 2: Replace scene references with context
        transformedCode = this.adaptSceneReferences(transformedCode);
        
        // Step 3: Add adaptation header
        transformedCode = this.addAdaptationHeader(transformedCode, analysis);
        
        // Step 4: Clean up and format
        transformedCode = this.cleanupCode(transformedCode);
        
        if (this.debugMode) {
            console.log('✅ Code transformation completed:', {
                originalLength: code.length,
                transformedLength: transformedCode.length,
                reductionPercent: Math.round((1 - transformedCode.length / code.length) * 100) + '%'
            });
        }
        
        return transformedCode;
    }
    
    /**
     * Remove conflicting boilerplate code
     * @param {string} code - Code to clean
     * @returns {string} Cleaned code
     */
    removeConflictingCode(code) {
        let cleanedCode = code;
        
        // Remove renderer declarations and setup
        cleanedCode = cleanedCode.replace(/const\s+renderer\s*=\s*new THREE\.WebGLRenderer\s*\([^)]*\)\s*;/g, '');
        cleanedCode = cleanedCode.replace(/renderer\.(setSize|setPixelRatio|setClearColor)[^;]*;/g, '');
        
        // Remove scene declarations
        cleanedCode = cleanedCode.replace(/const\s+scene\s*=\s*new THREE\.Scene\s*\([^)]*\)\s*;/g, '');
        
        // Remove camera declarations
        cleanedCode = cleanedCode.replace(/const\s+camera\s*=\s*new THREE\.(Perspective|Orthographic)Camera\s*\([^)]*\)\s*;/g, '');
        
        // Remove DOM manipulation
        cleanedCode = cleanedCode.replace(/document\.(body|getElementById)[^;]*appendChild[^;]*;/g, '');
        
        // Remove animation loops
        cleanedCode = cleanedCode.replace(/function\s+animate\s*\([^)]*\)\s*\{[\s\S]*?\}[\s\S]*?animate\s*\(\s*\);/g, '');
        cleanedCode = cleanedCode.replace(/const\s+animate\s*=\s*\(\s*\)\s*=>\s*\{[\s\S]*?\}[\s\S]*?animate\s*\(\s*\);/g, '');
        // Remove any remaining animation-related lines
        cleanedCode = cleanedCode.replace(/requestAnimationFrame\s*\([^)]*\)\s*;/g, '');
        cleanedCode = cleanedCode.replace(/renderer\.render\s*\([^)]*\)\s*;/g, '');
        // Remove loose rotation/animation lines that might be left over
        cleanedCode = cleanedCode.replace(/\w+\.rotation\.\w+\s*=\s*[^;]*;/g, '');
        
        // Remove OrbitControls setup (three-loader handles this)
        cleanedCode = cleanedCode.replace(/const\s+controls\s*=\s*new\s+OrbitControls\s*\([^)]*\)\s*;/g, '');
        // Remove ALL controls property assignments
        cleanedCode = cleanedCode.replace(/controls\.[^;]*;/g, '');
        // Remove controls.update() calls
        cleanedCode = cleanedCode.replace(/controls\.update\s*\(\s*\)\s*;/g, '');
        
        return cleanedCode;
    }
    
    /**
     * Adapt scene references to work with three-loader context
     * @param {string} code - Code to adapt
     * @returns {string} Adapted code
     */
    adaptSceneReferences(code) {
        let adaptedCode = code;
        
        // Replace scene.add() with direct scene access
        // Note: scene will be provided by three-loader context
        adaptedCode = adaptedCode.replace(/scene\.add\s*\(/g, 'scene.add(');
        
        // Replace camera references with context camera
        adaptedCode = adaptedCode.replace(/camera\.position/g, 'camera.position');
        
        // Replace renderer references with context renderer
        adaptedCode = adaptedCode.replace(/renderer\.render\s*\([^)]*\)/g, '// Rendering handled by three-loader');
        
        return adaptedCode;
    }
    
    /**
     * Add informative header to transformed code
     * @param {string} code - Transformed code
     * @param {Object} analysis - Analysis results
     * @returns {string} Code with header
     */
    addAdaptationHeader(code, analysis) {
        const timestamp = new Date().toISOString();
        const header = `/**
 * 🔄 AUTO-ADAPTED FROM STANDALONE THREE.JS FILE
 * Adapted: ${timestamp}
 * Confidence: ${Math.round(analysis.confidence)}%
 * 
 * TRANSFORMATIONS APPLIED:
 * ${analysis.hasRenderer ? '✅ Removed renderer declarations (using three-loader renderer)' : ''}
 * ${analysis.hasScene ? '✅ Removed scene declarations (using three-loader scene)' : ''}
 * ${analysis.hasCamera ? '✅ Removed camera declarations (using three-loader camera)' : ''}
 * ${analysis.hasAnimationLoop ? '✅ Removed animation loops (using three-loader animation system)' : ''}
 * ${analysis.hasDomManipulation ? '✅ Removed DOM manipulation (three-loader handles canvas)' : ''}
 * 
 * PRESERVED CREATIVE CONTENT:
 * - ${analysis.creativeElements.geometries.length} geometry definitions
 * - ${analysis.creativeElements.materials.length} material definitions  
 * - ${analysis.creativeElements.meshes.length} mesh objects
 * - ${analysis.creativeElements.lights.length} light sources
 * - ${analysis.creativeElements.objects.length} object transformations
 * 
 * 💡 This code now works with three-loader's scene/camera/renderer context
 */

`;
        
        return header + code;
    }
    
    /**
     * Clean up and format the transformed code
     * @param {string} code - Code to clean
     * @returns {string} Cleaned code
     */
    cleanupCode(code) {
        // Remove excessive whitespace
        let cleaned = code.replace(/\n{3,}/g, '\n\n');
        
        // Remove empty variable declarations
        cleaned = cleaned.replace(/const\s*;\s*\n/g, '');
        cleaned = cleaned.replace(/let\s*;\s*\n/g, '');
        
        // Remove orphaned semicolons
        cleaned = cleaned.replace(/^\s*;\s*$/gm, '');
        
        // Ensure proper spacing around preserved content
        cleaned = cleaned.replace(/^(\w+\.(position|rotation|scale))/gm, '\n$1');
        cleaned = cleaned.replace(/^(scene\.add)/gm, '\n$1');
        
        return cleaned.trim();
    }
    
    /**
     * Create animation-preserved version with boilerplate removal but animation retention
     * @param {string} code - Original standalone code
     * @param {Object} analysis - Analysis results
     * @returns {string} Code with animations preserved
     */
    createAnimationPreservedCode(code, analysis) {
        if (!analysis.animationInfo || !analysis.animationInfo.hasAnimations) {
            return this.transformCode(code, analysis);
        }
        
        console.log('🎬 Creating animation-preserved version...');
        
        let preservedCode = code;
        
        // Remove only non-animation boilerplate
        preservedCode = preservedCode.replace(/const\s+renderer\s*=\s*new THREE\.WebGLRenderer\s*\([^)]*\)\s*;/g, '');
        preservedCode = preservedCode.replace(/renderer\.(setSize|setPixelRatio|setClearColor)[^;]*;/g, '');
        preservedCode = preservedCode.replace(/const\s+scene\s*=\s*new THREE\.Scene\s*\([^)]*\)\s*;/g, '');
        preservedCode = preservedCode.replace(/const\s+camera\s*=\s*new THREE\.(Perspective|Orthographic)Camera\s*\([^)]*\)\s*;/g, '');
        preservedCode = preservedCode.replace(/document\.(body|getElementById)[^;]*appendChild[^;]*;/g, '');
        
        // Remove OrbitControls completely
        preservedCode = preservedCode.replace(/const\s+controls\s*=\s*new\s+OrbitControls\s*\([^)]*\)\s*;/g, '');
        preservedCode = preservedCode.replace(/controls\.[^;]*;/g, '');
        preservedCode = preservedCode.replace(/controls\.update\s*\(\s*\)\s*;/g, '');
        
        // Keep animations but adapt renderer.render calls
        preservedCode = preservedCode.replace(/renderer\.render\s*\([^)]*\)\s*;/g, '// renderer.render handled by three-loader');
        
        // Clean up and add animation preservation header
        const cleanedCode = this.cleanupCode(preservedCode);
        const header = this.addAnimationPreservationHeader(cleanedCode, analysis);
        
        return header;
    }
    
    /**
     * Add animation preservation header
     * @param {string} code - Code with preserved animations
     * @param {Object} analysis - Analysis results
     * @returns {string} Code with header
     */
    addAnimationPreservationHeader(code, analysis) {
        const timestamp = new Date().toISOString();
        const header = `/**
 * 🎬 AUTO-ADAPTED WITH ANIMATION PRESERVATION
 * Adapted: ${timestamp}
 * Confidence: ${Math.round(analysis.confidence)}%
 * 
 * PRESERVED ANIMATIONS:
 * - ${analysis.animationInfo.animationFunctions.length} animation functions
 * - ${analysis.animationInfo.rotationAnimations.length} rotation animations
 * - ${analysis.animationInfo.positionAnimations.length} position animations
 * - ${analysis.animationInfo.scaleAnimations.length} scale animations
 * 
 * TRANSFORMATIONS APPLIED:
 * ${analysis.hasRenderer ? '✅ Removed renderer declarations (using three-loader renderer)' : ''}
 * ${analysis.hasScene ? '✅ Removed scene declarations (using three-loader scene)' : ''}
 * ${analysis.hasCamera ? '✅ Removed camera declarations (using three-loader camera)' : ''}
 * ${analysis.hasDomManipulation ? '✅ Removed DOM manipulation (three-loader handles canvas)' : ''}
 * ⭐ Preserved original animations for runtime toggle
 * 
 * 💡 This code maintains original animations - toggle via Animation Controls
 */

`;
        
        return header + code;
    }

    /**
     * Main adaptation method - analyze and transform if needed
     * @param {string} code - Original code
     * @returns {Object} Result with transformed code and metadata
     */
    adaptCode(code) {
        const analysis = this.analyzeCode(code);
        const transformedCode = this.transformCode(code, analysis);
        
        // Create animation-preserved version if animations detected
        let animationPreservedCode = null;
        if (analysis.animationInfo && analysis.animationInfo.hasAnimations) {
            animationPreservedCode = this.createAnimationPreservedCode(code, analysis);
        }
        
        return {
            originalCode: code,
            transformedCode: transformedCode,
            animationPreservedCode: animationPreservedCode,
            wasAdapted: analysis.isStandalone,
            analysis: analysis,
            animationInfo: analysis.animationInfo || { hasAnimations: false },
            adaptationSummary: {
                confidence: analysis.confidence,
                elementsPreserved: Object.values(analysis.creativeElements).reduce((sum, arr) => sum + arr.length, 0),
                animationsDetected: analysis.animationInfo ? analysis.animationInfo.hasAnimations : false,
                transformationsApplied: [
                    analysis.hasRenderer && 'Renderer removal',
                    analysis.hasScene && 'Scene removal', 
                    analysis.hasCamera && 'Camera removal',
                    analysis.hasAnimationLoop && 'Animation loop removal',
                    analysis.hasDomManipulation && 'DOM manipulation removal'
                ].filter(Boolean)
            }
        };
    }
}