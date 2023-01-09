import { TextureLoader } from "three";

export class BoundingBox{
    constructor(x_, z_, w_, d_){
        this.tl = { 
                    x: x_ - w_ / 2, 
                    y: z_ + d_ / 2
                };
        this.br = {
                    x: x_ + w_ / 2, 
                    y: z_ - d_ / 2
                };
        this.w = w_;
        this.d = d_;

        this.pos = {x: x_, z: z_}
        this.collision = {isCollided: false, top: false, bottom: false, left: false, right: false};
        this.target = null;
    }
    checkCollide(objs){ // hmmm
        for (let obj of objs){
            if (this.checkAABB(obj)){
                this.target = obj;
                let other = obj.boundingBox;
    
                this.collision.isCollided = other.collision.isCollided = true;
                let vx = this.pos.x - other.pos.x;
                let vy = this.pos.y - other.pos.y;

                if (Math.abs(vx) < (this.w + other.w) / 2){
                    this.top = other.bottom |= vy > 0; // Ill switch this...
                    this.bottom  = other.top |= vy < 0;
                }

                
                if (Math.abs(vy) < (this.d + other.d) / 2){
                    this.left = other.right |= vx > 0; // Ill switch this...
                    this.right = other.left |= vx < 0;
                }
            } else {
                this.target = null;
            }    
        }
    }

    setPosition(){

    }

    checkAABB(obj){
        return (this.tl.x < obj.br.x &&
            this.br.x > obj.tl.x &&
            this.br.y < obj.tl.y &&
            this.tl.y > obj.br.y);
    }
}

export class CollideManager{
    constructor(){
        this.tags = {};
        this.objects = [];  
    }

    // obj1 is stationary, obj2 is moving (maybe)
    checkCollide(obj1, obj2){
        return obj1.onCollide(obj2);
    }
}