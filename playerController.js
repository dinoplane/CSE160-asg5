import * as THREE from 'three';
import { Vector3 } from 'three';
import { BaseModel } from './baseModel.js';
import { BoundingBox } from './collideManager.js';
// Adapted from https://www.youtube.com/watch?v=oqKzxPMLWxo


export class PlayerControls{
    constructor(canvas_){
        this.init(canvas_);
    }

    init(canvas_){
        this.current = {
            leftButton: false,
            rightButton: false,
            mouseX: 0,
            mouseY: 0,
            mouseXDelta: 0,
            mouseYDelta: 0,
        }
        this.previous = {...this.current};
        this.keys = {83: false, 87: false, 65: false, 68: false};
        this.previousKeys = null;

        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));

        this.canvas = canvas_;
        
    }

    onMouseDown(e){
        //console.log("MouseDown")
        if (document.pointerLockElement != this.canvas){
            this.canvas.requestPointerLock();
            // this.current.mouseX = e.pageX - window.innerWidth / 2;
            // this.current.mouseY = e.pageY - window.innerHeight / 2;
        }
            
        switch (e.button){
            case 0:
                this.current.leftButton = true;
                break;
            case 2:
                this.current.rightButton = true;
                break;
        }
    }

    onMouseUp(e){
        //console.log("MouseUp");
        switch (e.button){
            case 0:
                this.current.leftButton = false;
                break;
            case 2:
                this.current.rightButton = false;
                break;
        }
    }

    onMouseMove(e){
        if (document.pointerLockElement == this.canvas)
        {

        //console.log(this.keys);

        if (this.previous === null){
            this.previous = {...this.current};
        }


        this.current.mouseX += e.movementX;
        this.current.mouseY += e.movementY;
        }
    }

    onKeyDown(e){
        //console.log("Keydown")
        this.keys[e.keyCode] = true;
    }

    onKeyUp(e){
        //console.log("keyup");
        this.keys[e.keyCode] = false;                                
    }

    update(){
        this.current.mouseXDelta = this.current.mouseX - this.previous.mouseX;
        this.current.mouseYDelta = this.current.mouseY - this.previous.mouseY;

        this.previous = {...this.current};

    }
}


export class FirstPersonController{
    constructor(canvas_, camera_, initpos, w, h){
        this.camera = camera_;
        this.input = new PlayerControls(canvas_);
        this.rotation = new THREE.Quaternion();
        this.translation = new THREE.Vector3(...initpos);
        this.phi = 0;
        this.theta = 0;
        this.prevtime = null;

        this.boundingBox = new BoundingBox(initpos[0], initpos[2], w/4, h/4);
    }



    update(time){
            this.input.update();
            this.updateRotation(time);
            this.updateTranslation(time);
            this.updateCamera();
    }

    updateCamera(){
        //console.log(this.translation);
        this.camera.quaternion.copy(this.rotation);
        this.camera.position.copy(this.translation);
    }

    updateRotation(time){
        const xh = this.input.current.mouseXDelta / window.innerWidth;
        const yh = this.input.current.mouseYDelta / window.innerHeight;
        
        this.phi += -xh * 5;        
        
        this.theta = THREE.MathUtils.clamp(this.theta + -yh *5, -Math.PI / 3, Math.PI / 3);

        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi);

        const qz = new THREE.Quaternion();
        qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta);

        const q = new THREE.Quaternion();
        q.multiply(qx);
        q.multiply(qz);

        this.rotation.copy(q);
    }

    updateTranslation(time){
        const forwardVelocity = (this.input.keys[87] ? 1 : 0 ) + (this.input.keys[83] ? -1 : 0 );
        const strafeVelocity = (this.input.keys[65] ? 1 : 0 ) + (this.input.keys[68] ? -1 : 0 );
        
        const qx  = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi);

        const forward = new Vector3(0, 0, -1);
        forward.applyQuaternion(qx);
        

        forward.multiplyScalar(forwardVelocity*0.05);


        const left = new Vector3(-1, 0, 0);
        left.applyQuaternion(qx);
        left.multiplyScalar(strafeVelocity*0.05);


        this.translation.add(forward);
        this.translation.add(left)
        
    }
}

