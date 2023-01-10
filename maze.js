import * as THREE from 'three';
import { BridgeUnit } from './bridge.js';
import { BaseModel } from './baseModel.js';

import {FieldVertexShader, FieldFragmentShader} from './resources/shaders/Field.js';

export class Maze {
    constructor(width=7, height=7, ctr_, tot_w, tot_h){
        this.w = width;
        this.h = height;
        this.ctr = ctr_;
        this.grid = [];
        this.totalWidth = tot_w;
        this.totalHeight = tot_h;

        // Grid dimensions
        this.gw = width*2+1;
        this.gh = height*2+1;

        this.startX = -this.totalWidth/2;
        this.startY = -this.totalHeight/2;

        // Divide up the space into w*h tiles
        this.tWidth = this.totalWidth/this.gw;
        this.tHeight = this.totalHeight/this.gh;

        // make a grid representing empty tiles and walls. 
        this.grid.push(new Array(this.gw).fill(1));
        for (let i = 1; i < this.gh - 1; i++){     
            let row = [1]
            if (i % 2 == 0){
                this.grid.push(new Array(this.gw).fill(1));
            } else {
                for (let j = 1; j < this.gw-1; j++){
                    //if (i % 2) row.push(0);
                
                    if (j % 2) row.push(0);
                    else row.push(1);
                    
                }
                row.push(1);
                this.grid.push(row);
            }

        }
        
        this.grid.push(new Array(this.gw).fill(1));
        console.log(this.grid);
        
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
        //console.log(this.grid)
        this.generateMaze();
        this.initParts();

        
        console.log(this.grid);
        console.log(this.objects)
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



    initRice(){
        this.riceMaterial = new THREE.ShaderMaterial({
            vertexShader: FieldVertexShader,
            fragmentShader: FieldFragmentShader,
            uniforms: {
                time: {
                    type: 'f',
                    value: 0.0
                }
            },
            side: THREE.DoubleSide
        });
        

        let riceGeo = new THREE.PlaneGeometry(0.01, 4, 1, 8);
        
        // num grass
        this.numGrassW = 1;
        this.numGrassL = 1;
        this.totGrass = this.numGrassW * this.numGrassL;
        
        this.numBundle = 1;
        const instanceNumber = this.w*this.h * 8 * this.totGrass * this.numBundle ;
        this.riceField = new THREE.InstancedMesh(riceGeo, this.riceMaterial, instanceNumber);
        this.riceField.position.y = 0.3;
        //this.rice = new THREE.Object3D();
        this.riceCount = 0;
    }

    addRice(x, y){
        let startX = x ;
        let startY = y ;

        console.log(x, y)
        const rice = new THREE.Object3D();
        
        for(let i = 0; i < this.numGrassW; i++){
            for (let j = 0; j < this.numGrassL; j++){
                for (let n=0; n<this.numBundle; n++){
                    rice.position.set(
                        startX + i*this.tWidth/this.totGrass + 0*( Math.random() - 0.5 )*0.05,
                      0,
                      startY + j*this.tHeight/this.totGrass + 0*( Math.random() - 0.5 )*0.05,
                    );

                    console.log(startX + x/this.totGrass);
                    
                    rice.scale.setScalar( 0.5 + Math.random() * 0.5 );
                    
                    rice.rotation.y = Math.random() * Math.PI;
                    
                    rice.updateMatrix();

                    this.riceField.setMatrixAt( this.riceCount, rice.matrix );
                    this.riceCount += 1;                  
                }
        
            }
        }
    }

    initParts(){
        this.initRice();

        for (let i = 0; i < this.w*this.h; i++){
            let gridCoord = this.getGridCoord(i);
            let localCoord = this.getGridToLocal(gridCoord.x, gridCoord.y);
            //console.log(localCoord)
            let tWidth = this.totalWidth/this.gw;
            let tHeight = this.totalHeight/this.gh;

            //console.log(tWidth)

            this.objects.push(new BridgeUnit(localCoord.x, localCoord.y, this.adjacency[i], tWidth, tHeight));

            // 4 corners always have rice
            // check bot and right

            
            localCoord = this.getGridToLocal(gridCoord.x+1, gridCoord.y);
            if (this.grid[gridCoord.y][gridCoord.x+1] == 0){ // we go right
                this.objects.push(new BridgeUnit(localCoord.x, localCoord.y, [-1, 0, -1, 0], tWidth, tHeight));
            } else {
                this.addRice(localCoord.x, localCoord.y);
            }

            localCoord = this.getGridToLocal(gridCoord.x, gridCoord.y+1);
            if (this.grid[gridCoord.y+1][gridCoord.x] == 0){ // we go bot
                this.objects.push(new BridgeUnit(localCoord.x, localCoord.y, [0, -1, 0, -1], tWidth, tHeight));
            } else {
                this.addRice(localCoord.x, localCoord.y);
            }
        }
        this.riceField.instanceNumber = this.riceCount;
        console.log(this.riceCount)
        
        this.objects.push(this.riceField);
    }

    onCollide(obj){ // only used between maze and player
        // Check the cell of the object
        let grid = maze.getLocalToGrid(fPcontrols.translation.x, fPcontrols.translation.z);
        // Find the walls surrounding the tiles
        // Call the functions corresponding to that
    }

    getLocalToGrid(x, y){
        return {gridX: Math.floor((x - this.startX)/this.tWidth), gridY: Math.floor((y- this.startY)/this.tHeight)}; 
    }

    getGridToLocal(gridX, gridY){
        // let startX = -this.totalWidth/2;
        // let startY = -this.totalHeight/2;
        //console.log(startX)
        // let endX = this.totalWidth/2;
        // let endY = this.totalHeight/2;

        // let padding = 0.25;


        return {x: this.startX + (gridX + 0.5)*this.tWidth, y: this.startY + (gridY + 0.5)*this.tHeight}
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

    render(time, uniforms){
        for (let obj of this.objects){
            
            if (obj instanceof BaseModel)
                obj.render(time, uniforms);
        }
    }

    addToScene(scene){
        for (let obj of this.objects){
            //console.log(this.objects[i]);
            if (obj instanceof BaseModel)
                obj.addToScene(scene);
            else
                scene.add(obj);
        }
    }
}


function chooseRandom(arr){
    return arr[Math.floor(Math.random()*arr.length)];
}
