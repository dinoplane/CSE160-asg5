import * as THREE from 'three';
import { Mesh, Scene, TorusGeometry } from "three";

import { BaseModel } from './baseModel.js';

const loader = new THREE.TextureLoader();

export class TorusStack extends BaseModel{
    constructor(x, z,ringRadius=0.5, tubeRadius=0.25, ringSegs=8, tubeSegs=8, numRings=7){
        super();
        let stack_geo = new THREE.TorusGeometry(ringRadius, tubeRadius, ringSegs, tubeSegs).rotateX(Math.PI/2);
        let stack_mat = new THREE.MeshPhongMaterial({map: loader.load('./resources/images/sky.png')});

        // stack of toruses
        for (let i = 0; i < numRings; i++){
            this.objects.push(new THREE.Mesh(stack_geo, stack_mat));
            this.objects.at(-1).position.y = i*0.5;
            this.setPosition(x, z);
            // this.objects.at(-1).receiveShadow = true;
            // this.objects.at(-1).castShadow = true;


        }

        if (Math.random() > 0.3){
            this.objects.push(new HoveringLight(x, this.objects.at(-1).position.y + 0.5, z));
        }
    }

    setPosition(x, z){
        for (let i = 0; i < this.objects.length; i++){
            this.objects[i].position.x = x;
            this.objects[i].position.z = z;
        }
        return this;
    }


}

export class HoveringLight extends BaseModel{
    constructor(x, y, z, radius=0.5, material={color:0xFFFFF6}){
        super();
        let light_geo = new THREE.OctahedronGeometry(radius);
        let light_mat = new THREE.MeshPhongMaterial(material);
        

        this.objects.push(new THREE.Mesh(light_geo, light_mat));
        this.objects.at(-1).castShadow = true;
        let color = 0xAAAAAA;
        let intensity = 0.7;

        // let light = new THREE.PointLight(color, intensity);
        // light.distance = 1;
        // this.objects.push(light);

        this.y = y;
        for (let i = 0; i < this.objects.length; i++){
            this.objects[i].position.set(x, y, z);
        }
        
    }

    render(time){
        this.objects[0].position.y = this.y+Math.sin(time+this.objects[0].position.x);
        
    }
}


export class Wall extends BaseModel{
    constructor(w, h, d, material={color:0x4488aa}){
        super();
        let wall_geo = new THREE.BoxGeometry(w, h, d);
        //console.log(material)
        let wall_mat = new THREE.MeshPhongMaterial(material);
        
        this.objects.push(new THREE.Mesh(wall_geo, wall_mat));
        //this.objects.at(-1).castShadow = true;
        this.objects.at(-1).receiveShadow = true;
    }

    setPosition(x, y, z){
        
        this.objects[0].position.x = x;
        this.objects[0].position.y = y;
        this.objects[0].position.z = z;
        
        return this;
    }
}

export class BridgeUnit extends BaseModel{
    constructor(x=0, z=0, wallPos, w, l){
    //    / console.log(args)
        super(x, z, wallPos, w, l);

    }

    setupVariables(...args){
        this.x = args[0];
        this.z = args[1];
        this.wallPos = args[2];
        this.w = args[3];
        this.l = args[4];
    }

    initParts(){
        // let stack_geo = new THREE.TorusGeometry(1, 0.25, 6, 6).rotateX(Math.PI/2);
        // let stack_mat = new THREE.MeshPhongMaterial({color:0x8844aa});
        // let wall_geo = new THREE.BoxGeometry(4, 2, 1);
        // let wall_mat = new THREE.MeshPhongMaterial({color:0x4488aa});



        // // walls
        // for (let i = 0; i < 2; i++){
        //     this.objects.push(new THREE.Mesh(wall_geo, wall_mat));
        //     this.objects.at(-1).position.x = -3 + i*6;
        //     this.objects.at(-1).position.z = this.w/2;
        // }

        // // stack of toruses
        // for (let i = 0; i < 3; i++){
        //     this.objects.push(new THREE.Mesh(stack_geo, stack_mat));
        //     this.objects.at(-1).position.y = i*0.5;
        //     console.log(this.w)
        //     this.objects.at(-1).position.z = -this.w/2;
        // }

        // // walls
        // for (let i = 0; i < 2; i++){
        //     this.objects.push(new THREE.Mesh(wall_geo, wall_mat));
        //     this.objects.at(-1).position.x = -3 + i*6;
        //     this.objects.at(-1).position.z = -this.w/2;
        // }
        
        //console.log(this.w, this.l)

        this.objects.push(new Wall(this.w, 1, this.l).setPosition(this.x, 0, this.z));
        
        this.objects.at(-1).receiveShadow = true;
        if (this.wallPos){ // top left bot right
            //console.log(this.wallPos);
            let SPACING = this.w/2 -0.25;

            let texture = loader.load('./resources/images/fish.png')

            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.magFilter = THREE.NearestFilter;
            const repeats = 2;
            texture.repeat.set(repeats, 1);
            // 4 sides
            if (this.wallPos[0] == -1)
                this.objects.push(new Wall(this.w, 2, 0.5, {map: texture}).setPosition(this.x, 1.5, this.z-SPACING));

            if (this.wallPos[1] == -1)
                this.objects.push(new Wall(0.5, 2, this.l, {map: texture}).setPosition(this.x-SPACING, 1.5, this.z));
        
            if (this.wallPos[2] == -1)
                this.objects.push(new Wall(this.w, 2, 0.5, {map: texture}).setPosition(this.x, 1.5, this.z+SPACING));
        
            if (this.wallPos[3] == -1)
                this.objects.push(new Wall(0.5, 2, this.l, {map: texture}).setPosition(this.x+SPACING, 1.5, this.z));

            // 4 corners
            if (this.wallPos[0] == this.wallPos[1])
                this.objects.push(new TorusStack(this.x-SPACING, this.z-SPACING));

            if (this.wallPos[1] == this.wallPos[2])
                this.objects.push(new TorusStack(this.x-SPACING, this.z+SPACING));

            if (this.wallPos[2] == this.wallPos[3])
                this.objects.push(new TorusStack(this.x+SPACING, this.z+SPACING));

            if (this.wallPos[3] == this.wallPos[0])
                this.objects.push(new TorusStack(this.x+SPACING, this.z-SPACING));


            if (this.wallPos[0] > 0 &&  this.wallPos[1] > 0)
                this.objects.push(new TorusStack(this.x-SPACING, this.z-SPACING));

            if (this.wallPos[1] > 0 &&  this.wallPos[2] > 0)
                this.objects.push(new TorusStack(this.x-SPACING, this.z+SPACING));

            if (this.wallPos[2] > 0 &&  this.wallPos[3] > 0)
            this.objects.push(new TorusStack(this.x+SPACING, this.z+SPACING));

            if (this.wallPos[3] > 0 &&  this.wallPos[0] > 0)
                this.objects.push(new TorusStack(this.x+SPACING, this.z-SPACING));


        }
        
    }

    addToScene(scene){
        for (let i = 0; i < this.objects.length; i++){
            //console.log(this.objects[i]);
            this.objects[i].addToScene(scene);
        }
    }
}