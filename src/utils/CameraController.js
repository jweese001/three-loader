import * as THREE from 'three';

export class CameraController {
    constructor(camera, controls) {
        this.camera = camera;
        this.controls = controls;
        this.moveSpeed = 1.0;
        this.zoomSpeed = 1.0;
        this.tiltSpeed = 0.1;
        
        // Store original camera settings
        this.originalPosition = camera.position.clone();
        this.originalTarget = controls.target.clone();
        
        console.log('📹 CameraController initialized');
    }
    
    // Pan movements (translate camera and target together)
    panUp(multiplier = 1) {
        const moveDistance = this.moveSpeed * multiplier;
        const upVector = new THREE.Vector3(0, 1, 0);
        
        this.camera.position.add(upVector.multiplyScalar(moveDistance));
        this.controls.target.add(upVector.multiplyScalar(moveDistance));
        this.controls.update();
        
        console.log('📹 Pan up:', moveDistance);
    }
    
    panDown(multiplier = 1) {
        const moveDistance = this.moveSpeed * multiplier;
        const downVector = new THREE.Vector3(0, -1, 0);
        
        this.camera.position.add(downVector.multiplyScalar(moveDistance));
        this.controls.target.add(downVector.multiplyScalar(moveDistance));
        this.controls.update();
        
        console.log('📹 Pan down:', moveDistance);
    }
    
    panLeft(multiplier = 1) {
        const moveDistance = this.moveSpeed * multiplier;
        const leftVector = new THREE.Vector3();
        
        // Get the camera's right vector and negate it for left
        this.camera.getWorldDirection(leftVector);
        leftVector.cross(this.camera.up).normalize().multiplyScalar(-moveDistance);
        
        this.camera.position.add(leftVector);
        this.controls.target.add(leftVector);
        this.controls.update();
        
        console.log('📹 Pan left:', moveDistance);
    }
    
    panRight(multiplier = 1) {
        const moveDistance = this.moveSpeed * multiplier;
        const rightVector = new THREE.Vector3();
        
        // Get the camera's right vector
        this.camera.getWorldDirection(rightVector);
        rightVector.cross(this.camera.up).normalize().multiplyScalar(moveDistance);
        
        this.camera.position.add(rightVector);
        this.controls.target.add(rightVector);
        this.controls.update();
        
        console.log('📹 Pan right:', moveDistance);
    }
    
    panCenter() {
        // Reset to looking at world center
        this.controls.target.set(0, 0, 0);
        this.controls.update();
        console.log('📹 Pan center - target reset to (0,0,0)');
    }
    
    // Tilt movements (rotate camera around target)
    tiltUp(multiplier = 1) {
        const tiltAmount = this.tiltSpeed * multiplier;
        const spherical = new THREE.Spherical();
        const offset = new THREE.Vector3();
        
        // Get current spherical coordinates
        offset.copy(this.camera.position).sub(this.controls.target);
        spherical.setFromVector3(offset);
        
        // Adjust polar angle (tilt up)
        spherical.phi = Math.max(0.1, spherical.phi - tiltAmount);
        
        // Apply new position
        offset.setFromSpherical(spherical);
        this.camera.position.copy(this.controls.target).add(offset);
        this.controls.update();
        
        console.log('📹 Tilt up:', tiltAmount);
    }
    
    tiltDown(multiplier = 1) {
        const tiltAmount = this.tiltSpeed * multiplier;
        const spherical = new THREE.Spherical();
        const offset = new THREE.Vector3();
        
        // Get current spherical coordinates
        offset.copy(this.camera.position).sub(this.controls.target);
        spherical.setFromVector3(offset);
        
        // Adjust polar angle (tilt down)
        spherical.phi = Math.min(Math.PI - 0.1, spherical.phi + tiltAmount);
        
        // Apply new position
        offset.setFromSpherical(spherical);
        this.camera.position.copy(this.controls.target).add(offset);
        this.controls.update();
        
        console.log('📹 Tilt down:', tiltAmount);
    }
    
    tiltReset() {
        // Reset tilt to horizontal (phi = PI/2)
        const spherical = new THREE.Spherical();
        const offset = new THREE.Vector3();
        
        offset.copy(this.camera.position).sub(this.controls.target);
        spherical.setFromVector3(offset);
        spherical.phi = Math.PI / 2; // Horizontal
        
        offset.setFromSpherical(spherical);
        this.camera.position.copy(this.controls.target).add(offset);
        this.controls.update();
        
        console.log('📹 Tilt reset to horizontal');
    }
    
    // Zoom movements (dolly in/out)
    zoomIn(multiplier = 1) {
        const zoomAmount = this.zoomSpeed * multiplier;
        const direction = new THREE.Vector3();
        
        // Get direction from camera to target
        direction.copy(this.controls.target).sub(this.camera.position).normalize();
        this.camera.position.add(direction.multiplyScalar(zoomAmount));
        this.controls.update();
        
        console.log('📹 Zoom in:', zoomAmount);
    }
    
    zoomOut(multiplier = 1) {
        const zoomAmount = this.zoomSpeed * multiplier;
        const direction = new THREE.Vector3();
        
        // Get direction from target to camera
        direction.copy(this.camera.position).sub(this.controls.target).normalize();
        this.camera.position.add(direction.multiplyScalar(zoomAmount));
        this.controls.update();
        
        console.log('📹 Zoom out:', zoomAmount);
    }
    
    setZoomDistance(distance) {
        const direction = new THREE.Vector3();
        direction.copy(this.camera.position).sub(this.controls.target).normalize();
        this.camera.position.copy(this.controls.target).add(direction.multiplyScalar(distance));
        this.controls.update();
        
        console.log('📹 Set zoom distance:', distance);
    }
    
    // Preset camera positions
    setCameraPosition(preset) {
        const distance = this.camera.position.distanceTo(this.controls.target);
        
        switch (preset) {
            case 'front':
                this.camera.position.set(0, 0, distance);
                break;
            case 'back':
                this.camera.position.set(0, 0, -distance);
                break;
            case 'top':
                this.camera.position.set(0, distance, 0);
                break;
            case 'bottom':
                this.camera.position.set(0, -distance, 0);
                break;
            case 'left':
                this.camera.position.set(-distance, 0, 0);
                break;
            case 'right':
                this.camera.position.set(distance, 0, 0);
                break;
        }
        
        this.controls.update();
        console.log('📹 Camera preset:', preset);
    }
    
    // Speed controls
    setMoveSpeed(speed) {
        this.moveSpeed = speed;
        console.log('📹 Move speed set to:', speed);
    }
    
    setZoomSpeed(speed) {
        this.zoomSpeed = speed;
        console.log('📹 Zoom speed set to:', speed);
    }
    
    setTiltSpeed(speed) {
        this.tiltSpeed = speed;
        console.log('📹 Tilt speed set to:', speed);
    }
    
    // Reset camera to original position
    resetCamera() {
        this.camera.position.copy(this.originalPosition);
        this.controls.target.copy(this.originalTarget);
        this.controls.update();
        console.log('📹 Camera reset to original position');
    }
    
    // Get current camera info
    getCameraInfo() {
        const distance = this.camera.position.distanceTo(this.controls.target);
        return {
            position: this.camera.position.clone(),
            target: this.controls.target.clone(),
            distance: distance,
            fov: this.camera.fov
        };
    }
    
    // Smooth transitions
    animateToPosition(targetPosition, targetLookAt, duration = 1000) {
        const startPosition = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Smooth easing function
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            // Interpolate position and target
            this.camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
            this.controls.target.lerpVectors(startTarget, targetLookAt, easeProgress);
            this.controls.update();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
        console.log('📹 Animating to position over', duration, 'ms');
    }
}