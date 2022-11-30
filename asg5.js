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
let scene;


function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({canvas});
    renderer.shadowMap.enabled = true;
    const loader = new THREE.TextureLoader();



    
    //const cameraMode;
//    moveUp

    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 30, 0);
    
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.update();

    scene = new THREE.Scene();

    // Add a skybox
    const texture = loader.load(
        'resources/images/tears_of_steel_bridge_2k.jpg',
        () => {
          const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
          rt.fromEquirectangularTexture(renderer, texture);
          scene.background = rt.texture;
    });

    {
        // const color = 0xFFFFFF;
        // const intensity = 1;
        // const light = new THREE.DirectionalLight(color, intensity);
        // light.position.set(-1, 2, 4);
        // scene.add(light);   
    }
    
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    // maze...
    let maze = new Maze(7, 7, [0,0], 40, 40);
    maze.addToScene(scene);

    console.log(maze.getGridToLocal(1, 1));


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

    {
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
                scene.add(root);
            });
        });
    }
    


    {
        const planeSize = 40;
        const texture = loader.load('./resources/images/checker.png');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        const repeats = planeSize / 2;
        texture.repeat.set(repeats, repeats);

        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.receiveShadow = true;
        mesh.rotation.x = Math.PI * -.5;
        scene.add(mesh);
    }

    const cubes = [
        //makeInstance(geometry, 0x44aa88,  0),
        makeInstance(geometry, 0x8844aa, -2),
        makeInstance(geometry, 0xaa8844,  2),
    ];



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
        console.log("HELLO");
        if (e.keyCode == 65){
            spotlight.position.x -= 1;
            spotlight.target.position.x -= 1;
        } else if (e.keyCode == 68){
            spotlight.position.x += 1;
            spotlight.target.position.x += 1;
        } else if (e.keyCode == 87) {
            spotlight.position.z -= 1;
            spotlight.target.position.z -= 1;
        } else if (e.keyCode == 83){
            spotlight.position.z += 1;
            spotlight.target.position.z += 1;
        }
    });

      const gui = new GUI();
      { // Hemisphere Light
        const skyColor = 0xB1E1FF;  // light blue
        const groundColor = 0xB97A20;  // brownish orange
        const intensity = 1;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);
    
        gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('skyColor');
        gui.addColor(new ColorGUIHelper(light, 'groundColor'), 'value').name('groundColor');
        gui.add(light, 'intensity', 0, 1, 0.01);
      }


    { // Directional Light
        const color = 0xFFFFFF;
        const intensity = 0.5;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(0, 20, 0);
        light.target.position.set(-5, 0, 0);
        light.shadow.camera.left = -15;
        light.shadow.camera.bottom = -15;
        light.shadow.camera.right = 15;
        light.shadow.camera.top = 15;
        
        light.castShadow = true;
        scene.add(light);
        scene.add(light.target);

        const helper = new THREE.DirectionalLightHelper(light);
        scene.add(helper);

        function makeXYZGUI(gui, vector3, name, onChangeFn) {
            const folder = gui.addFolder(name);
            folder.add(vector3, 'x', -20, 20).onChange(onChangeFn);
            folder.add(vector3, 'y', 0, 20).onChange(onChangeFn);
            folder.add(vector3, 'z', -20, 20).onChange(onChangeFn);
            folder.open();
        }

        function updateLight() {
            light.target.updateMatrixWorld();
            helper.update();
        }
        updateLight();


        gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
        gui.add(light, 'intensity', 0, 1, 0.01);

        makeXYZGUI(gui, light.position, 'position', updateLight);
        makeXYZGUI(gui, light.target.position, 'target', updateLight);
    }
    function render(time) {
        time *= 0.001;  // convert time to seconds
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        cubes.forEach((cube, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        });
        maze.render(time);
        renderer.render(scene, camera);
       
        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);

}

main();