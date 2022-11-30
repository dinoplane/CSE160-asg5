import { Scene } from "three";

export class BaseModel {
    constructor(...args){
        //console.log(args)
        this.objects = [];
        this.setupVariables(...args);
        this.initParts();
    }

    setupVariables(...args){

    }

    initParts(){

    }

    setPosition(x, y, z){

    }

    addToScene(scene){
        scene.add(...this.objects);
    }
}