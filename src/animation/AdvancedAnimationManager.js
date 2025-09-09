import * as THREE from 'three';

export class AdvancedAnimationManager {
    constructor(scene) {
        this.scene = scene;
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.animations = new Map(); // Store all animation clips
        this.activeActions = new Map(); // Store active animation actions
        this.timelineData = []; // Timeline keyframes
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 10; // Default 10 second timeline
        this.loop = true;
        this.speed = 1.0;
        
        // Animation blending
        this.blendWeights = new Map();
        this.blendTargets = new Map();
        this.blendDuration = 0.5; // Default blend transition time
        
        // Keyframe system
        this.keyframes = new Map(); // objectId -> keyframes array
        this.selectedKeyframes = new Set();
        
        // Initialize mixer
        this.initMixer();
    }
    
    initMixer() {
        // Create a dummy object to attach the mixer to
        const mixerRoot = new THREE.Object3D();
        mixerRoot.name = 'AnimationMixerRoot';
        this.scene.add(mixerRoot);
        
        this.mixer = new THREE.AnimationMixer(mixerRoot);
        
        // Set up mixer event listeners
        this.mixer.addEventListener('finished', this.onAnimationFinished.bind(this));
        this.mixer.addEventListener('loop', this.onAnimationLoop.bind(this));
    }
    
    // === KEYFRAME ANIMATION SYSTEM ===
    
    addKeyframe(objectId, time, properties) {
        if (!this.keyframes.has(objectId)) {
            this.keyframes.set(objectId, []);
        }
        
        const keyframe = {
            time: Math.max(0, Math.min(time, this.duration)),
            properties: { ...properties },
            id: `keyframe_${Date.now()}_${Math.random()}`,
            interpolation: 'linear' // linear, smooth, step
        };
        
        const keyframes = this.keyframes.get(objectId);
        
        // Insert keyframe in chronological order
        let inserted = false;
        for (let i = 0; i < keyframes.length; i++) {
            if (keyframes[i].time > time) {
                keyframes.splice(i, 0, keyframe);
                inserted = true;
                break;
            }
        }
        
        if (!inserted) {
            keyframes.push(keyframe);
        }
        
        this.generateClipFromKeyframes(objectId);
        console.log(`Added keyframe for ${objectId} at time ${time}`, keyframe);
        
        return keyframe.id;
    }
    
    removeKeyframe(objectId, keyframeId) {
        if (!this.keyframes.has(objectId)) return false;
        
        const keyframes = this.keyframes.get(objectId);
        const index = keyframes.findIndex(kf => kf.id === keyframeId);
        
        if (index !== -1) {
            keyframes.splice(index, 1);
            this.selectedKeyframes.delete(keyframeId);
            this.generateClipFromKeyframes(objectId);
            return true;
        }
        
        return false;
    }
    
    updateKeyframe(objectId, keyframeId, updates) {
        if (!this.keyframes.has(objectId)) return false;
        
        const keyframes = this.keyframes.get(objectId);
        const keyframe = keyframes.find(kf => kf.id === keyframeId);
        
        if (keyframe) {
            if (updates.time !== undefined) {
                keyframe.time = Math.max(0, Math.min(updates.time, this.duration));
                // Resort keyframes by time
                keyframes.sort((a, b) => a.time - b.time);
            }
            
            if (updates.properties) {
                Object.assign(keyframe.properties, updates.properties);
            }
            
            if (updates.interpolation) {
                keyframe.interpolation = updates.interpolation;
            }
            
            this.generateClipFromKeyframes(objectId);
            return true;
        }
        
        return false;
    }
    
    generateClipFromKeyframes(objectId) {
        const keyframes = this.keyframes.get(objectId);
        if (!keyframes || keyframes.length === 0) return;
        
        const object = this.scene.getObjectById(parseInt(objectId));
        if (!object) return;
        
        // Group keyframes by property type
        const propertyTracks = {};
        
        keyframes.forEach(keyframe => {
            Object.entries(keyframe.properties).forEach(([property, value]) => {
                if (!propertyTracks[property]) {
                    propertyTracks[property] = {
                        times: [],
                        values: [],
                        interpolations: []
                    };
                }
                
                propertyTracks[property].times.push(keyframe.time);
                
                // Handle different value types
                if (Array.isArray(value)) {
                    propertyTracks[property].values.push(...value);
                } else if (typeof value === 'object' && value.x !== undefined) {
                    // Vector3-like object
                    propertyTracks[property].values.push(value.x, value.y, value.z);
                } else {
                    propertyTracks[property].values.push(value);
                }
                
                propertyTracks[property].interpolations.push(keyframe.interpolation);
            });
        });
        
        // Create Three.js animation tracks
        const tracks = [];
        
        Object.entries(propertyTracks).forEach(([property, data]) => {
            let trackName;
            let TrackType;
            
            // Map property names to Three.js track names
            switch (property) {
                case 'position':
                    trackName = `.position`;
                    TrackType = THREE.VectorKeyframeTrack;
                    break;
                case 'rotation':
                    trackName = `.rotation`;
                    TrackType = THREE.VectorKeyframeTrack;
                    break;
                case 'scale':
                    trackName = `.scale`;
                    TrackType = THREE.VectorKeyframeTrack;
                    break;
                case 'quaternion':
                    trackName = `.quaternion`;
                    TrackType = THREE.QuaternionKeyframeTrack;
                    break;
                case 'visible':
                    trackName = `.visible`;
                    TrackType = THREE.BooleanKeyframeTrack;
                    break;
                default:
                    trackName = `.${property}`;
                    TrackType = THREE.NumberKeyframeTrack;
            }
            
            const track = new TrackType(trackName, data.times, data.values);
            
            // Apply interpolation modes
            const interpolationMode = data.interpolations[0]; // Use first interpolation for now
            switch (interpolationMode) {
                case 'step':
                    track.setInterpolation(THREE.InterpolateDiscrete);
                    break;
                case 'smooth':
                    track.setInterpolation(THREE.InterpolateSmooth);
                    break;
                default:
                    track.setInterpolation(THREE.InterpolateLinear);
            }
            
            tracks.push(track);
        });
        
        if (tracks.length > 0) {
            const clipName = `${object.name || 'Object'}_${objectId}_keyframes`;
            const clip = new THREE.AnimationClip(clipName, this.duration, tracks);
            
            this.animations.set(objectId, clip);
            
            // Update mixer with new clip
            this.updateObjectAnimation(objectId);
        }
    }
    
    // === PHYSICS INTEGRATION ===
    
    initPhysics() {
        // Physics will be integrated here
        // This is a placeholder for Cannon.js or Ammo.js integration
        this.physicsEnabled = false;
        this.physicsWorld = null;
        this.physicsBodies = new Map();
        
        console.log('Physics system initialized (placeholder)');
    }
    
    addPhysicsBody(objectId, bodyType = 'dynamic', shape = 'box') {
        // Placeholder for physics body creation
        if (!this.physicsEnabled) {
            console.warn('Physics not enabled');
            return;
        }
        
        const object = this.scene.getObjectById(parseInt(objectId));
        if (!object) return;
        
        // This would create a physics body using Cannon.js or Ammo.js
        const physicsBody = {
            type: bodyType,
            shape: shape,
            object: object,
            position: object.position.clone(),
            rotation: object.rotation.clone()
        };
        
        this.physicsBodies.set(objectId, physicsBody);
        console.log(`Physics body added for object ${objectId}`, physicsBody);
    }
    
    removePhysicsBody(objectId) {
        if (this.physicsBodies.has(objectId)) {
            this.physicsBodies.delete(objectId);
            console.log(`Physics body removed for object ${objectId}`);
        }
    }
    
    // === ANIMATION BLENDING ===
    
    blendToAnimation(objectId, animationName, weight = 1.0, duration = this.blendDuration) {
        const action = this.activeActions.get(`${objectId}_${animationName}`);
        if (!action) return;
        
        // Store current blend targets
        this.blendTargets.set(objectId, {
            animationName,
            targetWeight: weight,
            duration,
            startTime: this.currentTime,
            startWeight: action.getEffectiveWeight()
        });
        
        console.log(`Blending to animation ${animationName} for object ${objectId}`, {
            weight, duration
        });
    }
    
    updateBlending(deltaTime) {
        this.blendTargets.forEach((blend, objectId) => {
            const progress = Math.min(1, (this.currentTime - blend.startTime) / blend.duration);
            const currentWeight = THREE.MathUtils.lerp(blend.startWeight, blend.targetWeight, progress);
            
            const actionKey = `${objectId}_${blend.animationName}`;
            const action = this.activeActions.get(actionKey);
            
            if (action) {
                action.setEffectiveWeight(currentWeight);
            }
            
            // Remove completed blends
            if (progress >= 1) {
                this.blendTargets.delete(objectId);
            }
        });
    }
    
    // === ANIMATION CONTROL ===
    
    play() {
        this.isPlaying = true;
        this.clock.start();
        
        // Resume all active actions
        this.activeActions.forEach(action => {
            action.paused = false;
        });
        
        console.log('Animation playback started');
    }
    
    pause() {
        this.isPlaying = false;
        
        // Pause all active actions
        this.activeActions.forEach(action => {
            action.paused = true;
        });
        
        console.log('Animation playback paused');
    }
    
    stop() {
        this.isPlaying = false;
        this.currentTime = 0;
        
        // Stop all active actions
        this.activeActions.forEach(action => {
            action.stop();
        });
        
        this.clock.stop();
        console.log('Animation playback stopped');
    }
    
    setTime(time) {
        this.currentTime = Math.max(0, Math.min(time, this.duration));
        
        // Update mixer time
        this.mixer.setTime(this.currentTime);
        
        console.log(`Animation time set to ${this.currentTime}`);
    }
    
    setSpeed(speed) {
        this.speed = Math.max(0.1, Math.min(speed, 5.0));
        this.mixer.timeScale = this.speed;
        
        console.log(`Animation speed set to ${this.speed}`);
    }
    
    setDuration(duration) {
        this.duration = Math.max(1, duration);
        
        // Update all keyframe-based animations
        this.keyframes.forEach((keyframes, objectId) => {
            // Clamp existing keyframes to new duration
            keyframes.forEach(keyframe => {
                if (keyframe.time > this.duration) {
                    keyframe.time = this.duration;
                }
            });
            
            this.generateClipFromKeyframes(objectId);
        });
        
        console.log(`Animation duration set to ${this.duration} seconds`);
    }
    
    // === OBJECT ANIMATION MANAGEMENT ===
    
    addObjectToAnimation(objectId) {
        const object = this.scene.getObjectById(parseInt(objectId));
        if (!object) return;
        
        // Create initial keyframe at time 0
        this.addKeyframe(objectId, 0, {
            position: object.position.toArray(),
            rotation: object.rotation.toArray(),
            scale: object.scale.toArray()
        });
        
        console.log(`Object ${objectId} added to animation system`);
    }
    
    removeObjectFromAnimation(objectId) {
        // Remove keyframes
        this.keyframes.delete(objectId);
        
        // Remove animation clips
        this.animations.delete(objectId);
        
        // Stop and remove active actions
        const actionsToRemove = [];
        this.activeActions.forEach((action, key) => {
            if (key.startsWith(`${objectId}_`)) {
                action.stop();
                actionsToRemove.push(key);
            }
        });
        
        actionsToRemove.forEach(key => {
            this.activeActions.delete(key);
        });
        
        // Remove physics body if exists
        this.removePhysicsBody(objectId);
        
        console.log(`Object ${objectId} removed from animation system`);
    }
    
    updateObjectAnimation(objectId) {
        const clip = this.animations.get(objectId);
        if (!clip) return;
        
        const object = this.scene.getObjectById(parseInt(objectId));
        if (!object) return;
        
        // Stop existing action for this object
        const existingActionKey = Array.from(this.activeActions.keys())
            .find(key => key.startsWith(`${objectId}_`));
        
        if (existingActionKey) {
            const existingAction = this.activeActions.get(existingActionKey);
            existingAction.stop();
            this.activeActions.delete(existingActionKey);
        }
        
        // Create new action
        const action = this.mixer.clipAction(clip, object);
        action.setLoop(this.loop ? THREE.LoopRepeat : THREE.LoopOnce);
        action.play();
        
        const actionKey = `${objectId}_${clip.name}`;
        this.activeActions.set(actionKey, action);
        
        console.log(`Animation updated for object ${objectId}`, clip);
    }
    
    // === UPDATE LOOP ===
    
    update() {
        if (!this.isPlaying) return;
        
        const deltaTime = this.clock.getDelta();
        
        // Update mixer
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
        
        // Update current time
        this.currentTime += deltaTime * this.speed;
        
        // Handle looping
        if (this.currentTime >= this.duration) {
            if (this.loop) {
                this.currentTime = 0;
                this.mixer.setTime(0);
            } else {
                this.currentTime = this.duration;
                this.pause();
            }
        }
        
        // Update blending
        this.updateBlending(deltaTime);
        
        // Update physics (when implemented)
        if (this.physicsEnabled && this.physicsWorld) {
            // this.updatePhysics(deltaTime);
        }
    }
    
    // === EVENT HANDLERS ===
    
    onAnimationFinished(event) {
        console.log('Animation finished:', event.action.getClip().name);
    }
    
    onAnimationLoop(event) {
        console.log('Animation looped:', event.action.getClip().name);
    }
    
    // === EXPORT/IMPORT ===
    
    exportAnimationData() {
        const data = {
            duration: this.duration,
            speed: this.speed,
            loop: this.loop,
            keyframes: Object.fromEntries(
                Array.from(this.keyframes.entries()).map(([objectId, keyframes]) => [
                    objectId,
                    keyframes.map(kf => ({
                        time: kf.time,
                        properties: kf.properties,
                        interpolation: kf.interpolation
                    }))
                ])
            ),
            physics: this.physicsEnabled ? {
                bodies: Object.fromEntries(this.physicsBodies.entries())
            } : null
        };
        
        return data;
    }
    
    importAnimationData(data) {
        this.duration = data.duration || 10;
        this.speed = data.speed || 1.0;
        this.loop = data.loop !== undefined ? data.loop : true;
        
        // Clear existing keyframes
        this.keyframes.clear();
        this.animations.clear();
        this.activeActions.forEach(action => action.stop());
        this.activeActions.clear();
        
        // Import keyframes
        if (data.keyframes) {
            Object.entries(data.keyframes).forEach(([objectId, keyframes]) => {
                keyframes.forEach(kfData => {
                    this.addKeyframe(objectId, kfData.time, kfData.properties);
                    
                    // Update interpolation if specified
                    if (kfData.interpolation) {
                        const kfs = this.keyframes.get(objectId);
                        const kf = kfs.find(k => k.time === kfData.time);
                        if (kf) kf.interpolation = kfData.interpolation;
                    }
                });
            });
        }
        
        // Import physics data (when implemented)
        if (data.physics && data.physics.bodies) {
            Object.entries(data.physics.bodies).forEach(([objectId, bodyData]) => {
                this.addPhysicsBody(objectId, bodyData.type, bodyData.shape);
            });
        }
        
        console.log('Animation data imported', data);
    }
    
    // === UTILITY METHODS ===
    
    getAnimationInfo() {
        return {
            isPlaying: this.isPlaying,
            currentTime: this.currentTime,
            duration: this.duration,
            speed: this.speed,
            loop: this.loop,
            totalKeyframes: Array.from(this.keyframes.values())
                .reduce((sum, kfs) => sum + kfs.length, 0),
            activeAnimations: this.activeActions.size,
            physicsEnabled: this.physicsEnabled,
            physicsBodies: this.physicsBodies.size
        };
    }
    
    dispose() {
        // Clean up resources
        this.stop();
        
        this.activeActions.clear();
        this.animations.clear();
        this.keyframes.clear();
        this.selectedKeyframes.clear();
        this.blendTargets.clear();
        this.blendWeights.clear();
        
        if (this.mixer) {
            this.mixer.uncacheRoot(this.mixer.getRoot());
            this.mixer = null;
        }
        
        this.physicsBodies.clear();
        
        console.log('AdvancedAnimationManager disposed');
    }
}