class CollideManager{
    constructor(){
        this.tags = {};
        this.objects = {};  
    }

    // obj1 is stationary, obj2 is moving (maybe)
    checkCollide(obj1, obj2){
        return obj1.onCollide(obj2);
    }
}