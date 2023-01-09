/*
Kitten by Poly by Google [CC-BY] (https://creativecommons.org/licenses/by/3.0/) via Poly Pizza (https://poly.pizza/m/dBJgGEu5bHW)

Fish Bones by Kenney (https://poly.pizza/m/NZg3APPfF8)
*/

import * as THREE from 'three';
import { BridgeUnit } from './bridge.js';
import { Maze } from './maze.js';

import {OBJLoader} from './node_modules/three/examples/jsm/loaders/OBJLoader.js';
import {MTLLoader} from './node_modules/three/examples/jsm/loaders/MTLLoader.js';
import {OrbitControls} from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import {GUI} from './node_modules/lil-gui/dist/lil-gui.esm.min.js';
import { BackSide, PlaneGeometry, Vector3 } from 'three';
import { FirstPersonControls } from './node_modules/three/examples/jsm/controls/FirstPersonControls.js';
import {SkyBoxVertexShader, SkyBoxFragmentShader} from './resources/shaders/SkyBox.js';
import {PlayerControls, FirstPersonController} from './playerController.js'
import { CollideManager } from './collideManager.js';
import { Field } from './field.js';


let canvas;
let scene;

let collideManager;

let light;

let fPcontrols;
let startPos;

const dayColor = new Vector3(0.548, 0.425, 0.922 );
const nightColor = new Vector3( 0.0, 0.0, 0.0 );
let skyColor;

function addActionsForHtmlUI(){

}

function addToScene(obj, col_tags={}){
  
}


function main() {
    canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({canvas});
    renderer.shadowMap.enabled = true;
    const loader = new THREE.TextureLoader();


    

    collideManager = new CollideManager();

    addActionsForHtmlUI();


    let fpPos;
    let tpPos = new Vector3(10, 10, 10);
    let cat;
    
    let isThirdPerson = true;

    // third person camera
    const tPfov = 75;
    const tPaspect = 2;  // the canvas default
    const tPnear = 0.1;
    const tPfar = 30000;
    const tPcamera = new THREE.PerspectiveCamera(tPfov, tPaspect, tPnear, tPfar);
    tPcamera.position.set(tpPos.x, tpPos.y, tpPos.z);
    
    const tPcontrols = new OrbitControls(tPcamera, canvas);
    tPcontrols.target.set(0, 0, 0);
    tPcontrols.update();

    // first person camera
    const fPfov = 75;
    const fPaspect = 2;  // the canvas default
    const fPnear = 0.1;
    const fPfar = 2000;
    const fPcamera = new THREE.PerspectiveCamera(fPfov, fPaspect, fPnear, fPfar);
    

    let camera = fPcamera;

    


    scene = new THREE.Scene();

    // Add a skybox
    // const texture = loader.load(
    //     'resources/images/tears_of_steel_bridge_2k.jpg',
    //     () => {
    //       const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
    //       rt.fromEquirectangularTexture(renderer, texture);
    //       scene.background = rt.texture;
    // });

    const SKYBOX_SIZE = 1000;
    const skyBoxMat = new THREE.ShaderMaterial({
        uniforms: {
            u_size: {type: 'vec3', value: new THREE.Vector3(SKYBOX_SIZE, SKYBOX_SIZE, SKYBOX_SIZE)},
            u_time: {type: 'f', value : 1.0}
        },
        // Put these shaders in their own file...
        vertexShader: SkyBoxVertexShader,
        fragmentShader: SkyBoxFragmentShader,
        side: THREE.BackSide
      });

    // const material = new THREE.MeshPhongMaterial({
    //     map: loader.load('./resources/images/sky.png'), side: THREE.BackSide
    // });

    const skySphere = new THREE.SphereGeometry(SKYBOX_SIZE);
    const skyBox = new THREE.Mesh(skySphere, skyBoxMat);

    scene.add(skyBox);
    
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    // maze...
    let maze = new Maze(3,3, [0,0], 40, 40);
    maze.addToScene(scene);
    
    let startCoord = maze.getGridCoord(0);
    startPos = maze.getGridToLocal(startCoord.x, startCoord.y);
    fPcontrols = new FirstPersonController(canvas, fPcamera, [startPos.x, 1, startPos.y], maze.gw, maze.gh);



    // Fog
    const near = 1;
    const far = 3;
    const fogColor = 'lightblue';
    scene.fog = new THREE.Fog(fogColor, near, far);
    

    {
        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();
        mtlLoader.load('./resources/models/fishBones.mtl', (mtl) => {
            mtl.preload();
            objLoader.setMaterials(mtl);
            objLoader.load('./resources/models/fishBones.obj', (root) => {
                scene.add(root);
            });
        });
    }

    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();
    mtlLoader.load('./resources/models/tubbs.mtl', (mtl) => {
        mtl.preload();
        objLoader.setMaterials(mtl);
        let object = objLoader.load('./resources/models/tubbs.obj', (root) => {
            root.scale.multiplyScalar(2);
            let p = maze.getGridToLocal(1,1);
            console.log(root.position);
            root.position.set( p.x, 1, p.y);
            
            fPcamera.position.set( p.x, 1, p.y);
            //root.attack(fPcamera)
            scene.add(root);
            cat = root;
        });
    });

    
    tpPos = new Vector3(0, 30, 0)

    // let planeSize = 40;
    // const planeMat = new THREE.MeshBasicMaterial();
    // const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    // let field = new THREE.Mesh(planeGeo, planeMat);
    // scene.add(field);
    {

        
        // const texture = loader.load('./resources/images/checker.png');
        // texture.wrapS = THREE.RepeatWrapping;
        // texture.wrapT = THREE.RepeatWrapping;
        // texture.magFilter = THREE.NearestFilter;
        // const repeats = planeSize / 2;
        // texture.repeat.set(repeats, repeats);


    }

    let field = new Field(renderer, camera, scene);
    field.addToScene(scene);

    function makeInstance(geometry, color, x) {
        const material = new THREE.MeshPhongMaterial({
            map: loader.load('./resources/images/sky.png'),
        });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
    
        cube.position.x = x;
    
        return cube;
    }


    


    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
          renderer.setSize(width, height, false);
        }
        return needResize;
    }

    class ColorGUIHelper {
        constructor(object, prop) {
          this.object = object;
          this.prop = prop;
        }
        get value() {
          return `#${this.object[this.prop].getHexString()}`;
        }
        set value(hexString) {
          this.object[this.prop].set(hexString);
        }
      }

      let spotlight;
       // spot light
        const color = 0xFF0000;
        const intensity = 1;
        spotlight = new THREE.SpotLight(color, intensity);
        spotlight.angle = Math.PI/8;
        spotlight.penumbra = 0;


        let p = maze.getGridToLocal(1,1);
        spotlight.position.set(p.x, 10, p.y)
        spotlight.target.position.set(p.x, 0, p.y);
        scene.add(spotlight);
        scene.add(spotlight.target);

      

      canvas.addEventListener('keydown', (e) => {
        //console.log("HELLO");
        if (e.keyCode == 32){
            isThirdPerson = !isThirdPerson;
            camera = (isThirdPerson) ? tPcamera : fPcamera;
            fPcontrols.enabled = !isThirdPerson;
        }
        
        
        
    });

      //const gui = new GUI();
      { // Hemisphere Light
        const skyColor = 0xB1E1FF;  // light blue
        const groundColor = 0xB97A20;  // brownish orange
        const intensity = 1;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);
    
        // gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('skyColor');
        // gui.addColor(new ColorGUIHelper(light, 'groundColor'), 'value').name('groundColor');
        // gui.add(light, 'intensity', 0, 1, 0.01);
      }

    let helper;

    function updateLight() {
        light.target.updateMatrixWorld();
        helper.update();
    }
    { // Directional Light
        const color = 0xFFFFFF;
        const intensity = 0.5;
        light = new THREE.DirectionalLight(color, intensity);
        light.position.set(20, 0, 0);
        light.target.position.set(0, 0, 0);
        light.shadow.camera.left = -15;
        light.shadow.camera.bottom = -15;
        light.shadow.camera.right = 15;
        light.shadow.camera.top = 15;
        
        light.castShadow = true;
        scene.add(light);
        scene.add(light.target);

        helper = new THREE.DirectionalLightHelper(light);
        scene.add(helper);

        // function makeXYZGUI(gui, vector3, name, onChangeFn) {
        //     const folder = gui.addFolder(name);
        //     folder.add(vector3, 'x', -20, 20).onChange(onChangeFn);
        //     folder.add(vector3, 'y', 0, 20).onChange(onChangeFn);
        //     folder.add(vector3, 'z', -20, 20).onChange(onChangeFn);
        //     folder.open();
        // }


        updateLight();


        // gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
        // gui.add(light, 'intensity', 0, 1, 0.01);

        // makeXYZGUI(gui, light.position, 'position', updateLight);
        // makeXYZGUI(gui, light.target.position, 'target', updateLight);
        

    }
  

    function mix(x, y, a){
        let ret = new Vector3(x.x, x.y, x.z);
        let j = new Vector3(y.x, y.y, y.z);

        return ret.multiplyScalar(1 - a).add(j.multiplyScalar(a));
    }
    function hsv2rgb(c){

        let rx = c.x;
        let ry = c.y;
        let rz = c.z;


        ry = THREE.MathUtils.clamp(Math.abs(THREE.MathUtils.euclideanModulo(rx*6.0+4.0, 6.0) - 3.0) - 1.0, 0.0, 1.0);
        rz = THREE.MathUtils.clamp(Math.abs(THREE.MathUtils.euclideanModulo(rx*6.0+2.0, 6.0) - 3.0) - 1.0, 0.0, 1.0);
        rx = THREE.MathUtils.clamp(Math.abs(THREE.MathUtils.euclideanModulo(rx*6.0, 6.0) - 3.0) - 1.0, 0.0, 1.0);

        let rgb = new Vector3(rx, ry, rz);

        return mix(new Vector3(1.0, 1.0, 1.0), rgb, c.y).multiplyScalar(c.z);
    }
    
    function render(time) {
        time *= 0.001;  // convert time to seconds
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        //collideManager.checkCollide(maze, fPcontrols);
        //console.log(camera.position)
        maze.render(time, {lightPos: light.position, lightIntensity: light.intensity, cameraPos: camera.position});
        field.render(time, renderer, scene);
        skyColor = hsv2rgb(mix(dayColor, nightColor, (Math.sin(time+Math.PI)+1.0)/2.0));
        console.log(skyColor)
        scene.background = new THREE.Color(skyColor);
        scene.fog.color = new THREE.Color(skyColor.x, skyColor.y, skyColor.z);
        fPcontrols.update(time);
        light.position.set(10*Math.cos(time), 10, 0);
        
        light.target.position.set(0, 0, 0);
        updateLight();
        skyBox.rotation.z = time;
        skyBoxMat.uniforms['u_time'].value = time;
        renderer.render(scene, camera);


        //console.log(fPcontrols.input.current)
        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);

}

main();