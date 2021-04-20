import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";
import {GUI} from "https://unpkg.com/three/examples/jsm/libs/dat.gui.module.js";
import * as IPFilter from "./IPFilter.js";
import IPGraph from "./IPGraph.js";

// Browser parameters
let url = new URL(window.location.href);
let sourceImage = url.searchParams.get("sourceimage");

var camera, controls, scene, renderer, container;
var plane;

// VIDEO AND THE ASSOCIATED TEXTURE
var video, videoTexture;

let imageProcessing;

// GUI
var gui;

init();
animate();

function createScene() {
  // initialize Sun
  let sunGeometry = new THREE.CircleGeometry( 4, 64, 0, Math.PI );
  let sunMaterial = new THREE.MeshBasicMaterial({ color: 0xE5C131, fog: false });
  let sun = new THREE.Mesh( sunGeometry, sunMaterial );
  scene.add(sun);
  sun.position.set( 0, -0.7, -8 );

  let terrainGeometry = new THREE.PlaneGeometry(
    16,
    16,
    100,
    100,
  );
  let material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    color: 0x051DF2,
    wireframe: true
  });
  plane = new THREE.Mesh(terrainGeometry, material);
  plane.position.y = -0.7;
  plane.rotation.x = -Math.PI/2;
  plane.receiveShadow = false;
  plane.castShadow = false;
  scene.add(plane);
}

function createTexturePlanes(texture, height, width) {
  let geometry = new THREE.PlaneGeometry(
    1,
    height / width,
  );

  // Image Processing Graph
  imageProcessing = new IPGraph(height, width, texture);

  // Subgraph implementing separate node for subtraction
  let ipSub = new IPGraph(height, width, texture);
  ipSub.addNode(IPFilter.SGFilter, {
    sigma: {type: "f", value: 3.0},
    kernelSize: {type: "i", value: 19.0},
  });

  imageProcessing
    .addNode(IPFilter.MedianFilter, {
      kernelSize: {type: "i", value: 3.0},
    })
    .addNode(IPFilter.IArithmetic, {
      image2: {type: "t", value: ipSub.outputTexture},
      operation: {type: "i", value: 1},
      scaleFactor: {type: "f", value: 1.9},
      offset: {type: "f", value: 0.3},
    })
    .subscribeSubGraph(ipSub)
    .addNode(IPFilter.Scaling, {
      scaleX: {type: "f", value: 2.0},
      scaleY: {type: "f", value: 2.0},
    });

  plane = new THREE.Mesh(geometry, imageProcessing.outputMaterial);
  plane.position.x = 0.5;
  plane.position.z = -0.5;
  plane.rotation.y = -Math.PI/5;
  plane.receiveShadow = false;
  plane.castShadow = false;
  scene.add(plane);

  let geometry2 = new THREE.PlaneGeometry(
    1,
    height / width
  );
  let material2 = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  plane = new THREE.Mesh(geometry2, material2);
  plane.position.x = -0.5;
  plane.position.z = -0.5;
  plane.rotation.y = Math.PI/5;
  plane.receiveShadow = false;
  plane.castShadow = false;
  scene.add(plane);
}

function initializeVideo(webCam, source) {
  video = document.createElement("video");
  if(webCam){
    video.srcObject = source;
    video.play();
  } else {
    video.src = source;
    video.load();
    video.muted = true;
    video.loop = true;
  }

  video.onloadeddata = function () {
    videoTexture = new THREE.VideoTexture(video);
    // videoTexture.wrapS = videoTexture.wrapT = THREE.RepeatWrapping;
    videoTexture.minFilter = THREE.NearestFilter;
    videoTexture.magFilter = THREE.NearestFilter;
    videoTexture.generateMipmaps = false;
    videoTexture.format = THREE.RGBFormat;

    createTexturePlanes(videoTexture, video.videoHeight, video.videoWidth);

    let pausePlayObj = {
      pausePlay: function () {
        if (!video.paused) {
          console.log("pause");
          video.pause();
        } else {
          console.log("play");
          video.play();
        }
      },
      add10sec: function () {
        video.currentTime = video.currentTime + 10;
        console.log(video.currentTime);
      },
    };

    gui = new GUI();
    gui.add(pausePlayObj, "pausePlay").name("Pause/play video");
    gui.add(pausePlayObj, "add10sec").name("Add 10 seconds");
    video.play();
  };
}

function init() {
  container = document.createElement("div");
  document.body.appendChild(container);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x13131C);

  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  renderer.autoClear = false;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = false;

  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.001,
    10
  );
  camera.position.z = 0.7;
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 0.005;
  controls.maxDistance = 1.0;
  controls.enableRotate = true;
  controls.addEventListener("change", render);
  controls.update();

  // Add image processing planes
  if(sourceImage==="webcam") {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)  {
      const constraints = {video: {width: 1280, height: 720, facingMode: 'user'}};
      navigator.mediaDevices.getUserMedia(constraints).then(function (stream){
	initializeVideo(true, stream);
      })
    };
  } else if(sourceImage==="video") {
    initializeVideo(false, "../assets/video.mp4");
  } else {
    const texLoader = new THREE.TextureLoader().load('../assets/grenouille.jpg', function(tex) {
      createTexturePlanes(tex, tex.image.height, tex.image.width);
    });
  }
}

createScene()

function render() {
  renderer.clear();

  if (typeof imageProcessing !== "undefined") {
    imageProcessing.initializeRenderer(renderer);
  }
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  render();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

// Readjust camera and renderer when window is resized
window.addEventListener("resize", onWindowResize, false);
