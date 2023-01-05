export class BoundingBox{
    constructor(x_, z_, w_, d_){
        this.tl = { 
                    x: x_ - w_/2, 
                    y: z_ + d_/2
                };
        this.br = {
                    x: x_ + w_/2, 
                    y: z_ - d_/2
                };
    }

    onCollide(obj){
        if ()
    }
}

export class CollideManager{
    constructor(){
        this.tags = {};
        this.objects = {};  
    }

    // obj1 is stationary, obj2 is moving (maybe)
    checkCollide(obj1, obj2){
        return obj1.onCollide(obj2);
    }
}