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
        for (let obj of this.objects){
            if (obj instanceof BaseModel)
                obj.addToScene(scene);
            else 
                scene.add(obj);
        }
    }

    render(time){
        for (let obj of this.objects){
            if (obj instanceof BaseModel)
                obj.render(time);
        }
    }
}