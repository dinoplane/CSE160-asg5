import * as THREE from 'three';
import {Reflector} from './node_modules/three/examples/jsm/objects/Reflector.js';
import {FieldVertexShader, FieldFragmentShader} from './resources/shaders/Field.js';
import { BaseModel } from './baseModel.js';
import {MeshReflectorMaterial} from './MeshReflectorMaterial.js';

// Consulted https://catlikecoding.com/unity/tutorials/flow/waves/ for waves

class Wave{
    constructor(dir_, steepness_, wavelength_){
        this.dir = dir_;
        this.dir.normalize();

        this.steepness = steepness_;
        this.wavelength = wavelength_;

        
        this.wavenumber = 2*Math.PI / this.wavelength;

        this.amplitude = this.steepness/this.wavenumber;

        this.speed = Math.sqrt(9.8) / this.wavenumber; //5;

    }

    updateWave(i, j, time){
        let f = (this.getMeshX(i, j)*this.direction.x + this.getMeshZ(i, j)*this.direction.y - this.speed * time) * this.wavenumber;


    }
}

class RiceSprout{


}


export class Field extends BaseModel{
    constructor(renderer, camera, scene){
        super();

        const planeSize = 60;
        const planeSegs = 120;
        
        this.planeSize = planeSize;
        this.planeSegs = planeSegs;
        
        this.planeGeo = new THREE.PlaneGeometry(planeSize, planeSize, planeSegs, planeSegs);
        
        // this.initReflection();

        let planeMat = new THREE.MeshStandardMaterial( {color: 0xFF0000} );
        planeMat.shininess = 1,0;
        planeMat.roughness = -0.5;
        
        // this.groundMirror = new Reflector( this.planeGeo, {
        //     clipBias: 0.003,
        //     textureWidth: window.innerWidth * window.devicePixelRatio,
        //     textureHeight: window.innerHeight * window.devicePixelRatio,
        //     color: 0x0000ff
        // } );

        
        // this.groundMirror.position.y = 0.5;
        // this.groundMirror.rotateX( - Math.PI / 2 );

        // this.groundMirror.material.transparent = true;
        // this.groundMirror.material.opacity = 0.0;
        // this.groundMirror.needsUpdate = true;
        //this.objects.push(this.groundMirror)

        this.objects.push(new THREE.Mesh(this.planeGeo, planeMat));

        this.objects.at(-1).material = new MeshReflectorMaterial(renderer, camera, scene, this.objects.at(-1), 
        {
            blur:[300, 100],
            resolution:2048,
            mixBlur:1.0,

            minDepthThreshold:0.4,
            maxDepthThreshold:1.0,
            color:"#050505",
            //metalness:0.5,
            mirror: 1
        });
        //this.objects.at(-1).receiveShadow = true;
        this.objects.at(-1).rotation.x = Math.PI * -0.5;
        this.objects.at(-1).position.y = 0.3;
        this.objects.at(-1).color = 0xff0000;
        
        

        this.material = this.objects.at(-1).material;
        

        this.positions = this.planeGeo.getAttribute('position');
        this.normals = this.planeGeo.getAttribute('normal');
        
        this.pos = this.positions.array;
        this.orig = new Float32Array(this.pos);

        this.waves=[];


        // Adding waves
        this.waves.push(new Wave(new THREE.Vector2(1, 1), 0.2, 0.45*Math.PI));
        this.waves.push(new Wave(new THREE.Vector2(1, 0.6), 0.1, 0.25*Math.PI));
        this.waves.push(new Wave(new THREE.Vector2(0, -1.3), 0.1, 0.15*Math.PI));



        // Add Rice
        
        

    }

    initReflection(){
        
        const rtWidth = 60;
        const rtHeight = 60;
        this.renderTarget = new THREE.WebGLRenderTarget(rtWidth, rtHeight);
    
        const rtLeft = -rtWidth/2;
        const rtRight = rtWidth/2;
        const rtTop = rtHeight/2;
        const rtBottom = -rtHeight/2;
        
        const rtNear = 2;
        const rtFar = 10;
        this.rtCamera = new THREE.OrthographicCamera(rtLeft, rtRight, rtTop, rtBottom, rtNear, rtFar);
        this.rtCamera.position.x = 0;
    
        console.log(this.rtCamera)
        this.rtCamera.lookAt(5,5,0);
        this.objects.push(this.rtCamera);
        this.objects.push(new THREE.CameraHelper(this.rtCamera))
    
    }

    // feasible way to update pos on a mesh // only works for x and y...
    getMeshX(x, z){
        return this.orig[3*(this.planeSegs*z + x) + 0];
    }

    getMeshY(x, z){
        return this.orig[3*(this.planeSegs*z + x) + 2];
    }

    getMeshZ(x, z){
        return this.orig[3*(this.planeSegs*z + x) + 1];
    }

    setMeshX(x, z, pos){
        //console.log(this.pos[3*(this.planeSegs*y + x) + 1])
        this.pos[3*(this.planeSegs*z + x) + 0] = pos;
    }

    setMeshY(x, z, pos){
        //console.log(this.pos[3*(this.planeSegs*y + x) + 1])
        this.pos[3*(this.planeSegs*z + x) + 2] = pos;
    }

    setMeshZ(x, z, pos){
        //console.log(this.pos[3*(this.planeSegs*y + x) + 1])
        this.pos[3*(this.planeSegs*z + x) + 1] = pos;
    }
    

    updateWave(time){
        for (let j = 0; j <= this.planeSegs; j++){
            for(let i = 0; i <= this.planeSegs; i++){
                let waveX = 0;
                let waveY = 0;
                let waveZ = 0;
                
                for (let wave of this.waves){
                    let f = (this.getMeshX(i, j)*wave.dir.x + this.getMeshZ(i, j)*wave.dir.y - wave.speed * time) * wave.wavenumber;
                
                    waveX += wave.dir.x * wave.amplitude * Math.cos(f);
                    waveY += wave.amplitude * Math.sin(f);
                    waveZ += wave.dir.y * wave.amplitude * Math.cos(f);    
                }

                this.setMeshX(i, j, waveX + this.getMeshX(i, j));
                this.setMeshY(i, j, waveY);
                this.setMeshZ(i, j, waveZ + this.getMeshZ(i, j));
            }
        }


        this.positions.needsUpdate = true;
        //this.planeGeo.computeTangents();
        this.planeGeo.computeVertexNormals();
        this.normals.needsUpdate = true;
    }

    render(time, renderer, scene){
        this.updateWave(time);
        this.material.update();

        // this.riceMaterial.uniforms.time.value = time;
        // this.riceMaterial.uniformsNeedUpdate = true;
        // renderer.setRenderTarget(this.renderTarget);
        // renderer.render(scene, this.rtCamera);
        // renderer.setRenderTarget(null);
    }
}