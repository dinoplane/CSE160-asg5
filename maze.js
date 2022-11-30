import * as THREE from 'three';
import { BridgeUnit } from './bridge.js';

export class Maze {
    constructor(width=7, height=7, ctr_, tot_w, tot_h){
        this.w = width;
        this.h = height;
        this.ctr = ctr_;
        this.grid = [];
        this.totalWidth = tot_w;
        this.totalHeight = tot_h;


        this.gw = width*2+1;
        this.gh = height*2+1
        for (let i = 0; i < this.gh; i++){ 
            if (i % 2 == 0){
                this.grid.push(new Array(this.gw).fill(1));
            } else {
                let row = [1]
                for (let j = 1; j < this.gw-1; j++){
                    //if (i % 2) row.push(0);
                    
                        if (j % 2) row.push(0);
                        else row.push(1);
                    
                }
                row.push(1);
                this.grid.push(row.slice());
            }
            // console.log(this.grid);
        }
        //console.log(this.grid);
        // for (let i = 1; i < this.h-1; i++){
        //     this.grid[Math.floor(this.w/2)][i] = 0;
        // }
        
        this.edges = [];
        this.adjacency = [];
        this.v = this.w * this.h;
        for (let i = 0; i < this.v; i++){
            this.adjacency.push([-1, -1, -1, -1]); // top left bottom right
        }


        this.objects = [];
        console.log(this.grid)
        this.generateMaze();
        this.initParts();
    }

    getCoords(node) {
        return { x: node % this.w, y: Math.floor(node / this.w) }
    }
    getNode(x, y){
        return y * this.w + x;
    }

    // get neighbors
    getNeighbors(node){
        let ret = [];
        ret.push((node - this.w >= 0) ? node - this.w : -1);// We have a top?
        
        ret.push((node % this.w > 0) ? node - 1 : -1); // We have a) left?
            
        
        ret.push((node + this.w < this.h*this.w) ? node + this.w : -1); // We) have a bot?

        ret.push((node % this.w < this.w - 1) ? node + 1 : -1); // We have a right?
            
            
        return ret;
    }

    generateMaze(){
        //this.prerender();

        
        // Randomized DFS ftw
        let init_cell = 0;
        let stack = [0];
        let visited = [0];
        let unvisitedIndices = [];
        let neighbors;
        let chosen;
        let chosenIndex = 0;

        let curr_cell;
        while (stack.length > 0){ // While stack isnt empty
            curr_cell = stack.pop(); // pop
            neighbors = this.getNeighbors(curr_cell); // Get current cell neighbor
            unvisitedIndices = [];
            for (let n =0; n < 4; n++){ // check if we have unvisited neighbors
                if (neighbors[n] != -1 && !visited.includes(neighbors[n]))
                    unvisitedIndices.push(n); // THE INDEX 
            }

            if (unvisitedIndices.length > 0){ 
                stack.push(curr_cell); // push back the current cell
                // Remove the wall between the current cell and a random unvisited neighbor
                chosenIndex = chooseRandom(unvisitedIndices);
                //console.log(curr_cell);
                chosen = neighbors[chosenIndex];
                //console.log(chosen);

                // removing wall
                this.removeWall(curr_cell, chosen, chosenIndex);

                visited.push(chosen)
                stack.push(chosen);
            }
            //console.log(stack.length)
        }

        console.log(this.adjacency);

    }
    
    removeWall(curr_cell, chosen, chosenIndex){
        this.adjacency[curr_cell][chosenIndex] = chosen;
        this.adjacency[chosen][(chosenIndex+2) % 4] = curr_cell;
        let g_coord = this.getGridCoord(curr_cell);
        //console.log(curr_cell, g_coord)
        
        switch(chosenIndex){
            case 0: // top
                this.grid[g_coord.y-1][g_coord.x] = 0;
                break;
            case 1: // left
                this.grid[g_coord.y][g_coord.x-1] = 0;
                break;
            case 3: // right
                this.grid[g_coord.y][g_coord.x+1] = 0;
                break;
            case 2: // bottom
                this.grid[g_coord.y+1][g_coord.x] = 0;
                break;
                
        }
        
        
    }


    initParts(){
        for (let i = 0; i < this.w*this.h; i++){
            let gridCoord = this.getGridCoord(i);
            let localCoord = this.getGridToLocal(gridCoord.x, gridCoord.y);
            //console.log(localCoord)
            let tWidth = this.totalWidth/this.gw;
            let tHeight = this.totalHeight/this.gh;

            console.log(tWidth)

            this.objects.push(new BridgeUnit(localCoord.x, localCoord.y, this.adjacency[i], tWidth, tHeight));

            if (this.grid[gridCoord.y][gridCoord.x+1] == 0){ // we go right
                localCoord = this.getGridToLocal(gridCoord.x+1, gridCoord.y);
                this.objects.push(new BridgeUnit(localCoord.x, localCoord.y, [-1, 0, -1, 0], tWidth, tHeight));
            }

            if (this.grid[gridCoord.y+1][gridCoord.x] == 0){ // we go bot
                localCoord = this.getGridToLocal(gridCoord.x, gridCoord.y+1);
                this.objects.push(new BridgeUnit(localCoord.x, localCoord.y, [0, -1, 0, -1], tWidth, tHeight));
            }
        }
    }

    getGridToLocal(gridX, gridY){
        let startX = -this.totalWidth/2;
        let startY = -this.totalHeight/2;
        //console.log(startX)
        let endX = this.totalWidth/2;
        let endY = this.totalHeight/2;

        let padding = 0.25;
        // Divide up the space into w*h tiles
        let tWidth = this.totalWidth/this.gw;
        let tHeight = this.totalHeight/this.gh;


        return {x: startX+ (gridX + 0.5)*tWidth, y: startY + (gridY + 0.5)*tHeight}
    }

    getGridCoord(cell, chosenIndex){
        // get grid coordinate (center)
        let gx = (cell % this.w)*2 + 1;
        let gy = (Math.floor(cell / this.w)) * 2 + 1
        return {x: gx, y: gy};

    }

    // prerender(){
    //     let x;
    //     let sx = this.ctr[0] - this.w/2 + 0.5;
    //     let z = this.ctr[1] - this.h/2 + 0.5;
    //     for (let j = 0; j < this.h; j++){
    //         x = sx;
    //         for (let i = 0; i < this.w; i++){
    //             if (this.grid[j][i] == 1){
    //                 for (let k = 0; k < 3; k++){
    //                     let wall = new TexCube();
    //                     if (k == 0) wall.setTexture(2);
    //                     wall.translate(x, k, z);
    //                     this.cubes.push(wall);
    //                 }                    
    //             }
    //             x += 1;
    //         }
    //         z += 1;
    //     }
    // }

    // render(){
    //     for (let c of this.cubes){
    //         c.render();
    //     }
    // }

    addToScene(scene){
        for (let i = 0; i < this.objects.length; i++){
            //console.log(this.objects[i]);
            this.objects[i].addToScene(scene);
        }
    }
}


function chooseRandom(arr){
    return arr[Math.floor(Math.random()*arr.length)];
}
