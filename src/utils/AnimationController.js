export class AnimationController {
    constructor() {
        this.animations = new Map(); // objectId -> animationData
        this.objectReferences = new Map(); // objectId -> sceneObject
        this.animationStates = new Map(); // objectId -> state data
        this.isRunning = true;
        this.time = 0;
        
        console.log('🎬 AnimationController initialized');
    }
    
    update() {
        if (!this.isRunning) return;
        
        this.time += 0.016; // Approximate 60fps delta time
        
        for (const [objectId, animationData] of this.animations) {
            if (animationData.type === 'none') continue;
            
            const sceneObject = this.objectReferences.get(objectId);
            if (!sceneObject) continue;
            
            this.updateAnimation(sceneObject, animationData, objectId);
        }
    }
    
    updateAnimation(sceneObject, animationData, objectId) {
        const speed = animationData.speed || 0.01;
        
        // Get or create animation state
        if (!this.animationStates.has(objectId)) {
            this.animationStates.set(objectId, {
                originalPosition: sceneObject.position.clone(),
                originalRotation: sceneObject.rotation.clone(),
                time: 0,
                bounceDirection: 1
            });
        }
        
        const state = this.animationStates.get(objectId);
        state.time += speed;
        
        switch (animationData.type) {
            case 'rotate-y':
                sceneObject.rotation.y += speed;
                break;
                
            case 'rotate-xyz':
                sceneObject.rotation.x += speed * 0.7;
                sceneObject.rotation.y += speed;
                sceneObject.rotation.z += speed * 0.3;
                break;
                
            case 'bounce':
                const bounceHeight = 2;
                const bounceSpeed = speed * 10;
                sceneObject.position.y = state.originalPosition.y + Math.sin(state.time * bounceSpeed) * bounceHeight;
                break;
                
            case 'orbit':
                const orbitRadius = 5;
                const orbitSpeed = speed * 2;
                sceneObject.position.x = state.originalPosition.x + Math.cos(state.time * orbitSpeed) * orbitRadius;
                sceneObject.position.z = state.originalPosition.z + Math.sin(state.time * orbitSpeed) * orbitRadius;
                // Make object face center while orbiting
                sceneObject.lookAt(0, sceneObject.position.y, 0);
                break;
                
            case 'pulse':
                const pulseAmount = 0.3;
                const pulseSpeed = speed * 5;
                const scale = 1 + Math.sin(state.time * pulseSpeed) * pulseAmount;
                sceneObject.scale.setScalar(scale);
                break;
                
            case 'float':
                const floatHeight = 1;
                const floatSpeed = speed * 3;
                sceneObject.position.y = state.originalPosition.y + Math.sin(state.time * floatSpeed) * floatHeight;
                sceneObject.rotation.y += speed * 0.5;
                break;
        }
    }
    
    addObject(objectId, sceneObject) {
        this.objectReferences.set(objectId, sceneObject);
        console.log('🎬 Object added to animation controller:', objectId);
    }
    
    removeObject(objectId) {
        this.animations.delete(objectId);
        this.objectReferences.delete(objectId);
        this.animationStates.delete(objectId);
        console.log('🎬 Object removed from animation controller:', objectId);
    }
    
    updateObjectAnimation(objectData) {
        console.log('🎬 Update object animation:', objectData.name, objectData.animation.type);
        
        // Store the animation data
        this.animations.set(objectData.id, objectData.animation);
        
        // Reset animation state when type changes
        if (this.animationStates.has(objectData.id)) {
            const sceneObject = this.objectReferences.get(objectData.id);
            if (sceneObject) {
                const state = this.animationStates.get(objectData.id);
                state.originalPosition = sceneObject.position.clone();
                state.originalRotation = sceneObject.rotation.clone();
                state.time = 0;
            }
        }
    }
    
    stopObjectAnimation(objectId) {
        const animationData = this.animations.get(objectId);
        if (animationData) {
            animationData.type = 'none';
            this.animations.set(objectId, animationData);
            
            // Reset object to original position/rotation
            const sceneObject = this.objectReferences.get(objectId);
            const state = this.animationStates.get(objectId);
            if (sceneObject && state) {
                sceneObject.position.copy(state.originalPosition);
                sceneObject.rotation.copy(state.originalRotation);
                sceneObject.scale.setScalar(1);
            }
        }
    }
    
    getAnimationTypes() {
        return [
            { value: 'none', label: 'None' },
            { value: 'rotate-y', label: 'Rotate Y' },
            { value: 'rotate-xyz', label: 'Rotate XYZ' },
            { value: 'bounce', label: 'Bounce' },
            { value: 'orbit', label: 'Orbit' },
            { value: 'pulse', label: 'Pulse Scale' },
            { value: 'float', label: 'Float & Rotate' }
        ];
    }
    
    start() {
        this.isRunning = true;
        console.log('▶️ Animations started');
    }
    
    stop() {
        this.isRunning = false;
        console.log('⏹️ Animations stopped');
    }
    
    toggle() {
        this.isRunning = !this.isRunning;
        console.log(this.isRunning ? '▶️ Animations resumed' : '⏸️ Animations paused');
        return this.isRunning;
    }
}