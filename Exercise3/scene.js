import * as THREE from "https://unpkg.com/three/build/three.module.js";
import {OrbitControls} from "https://unpkg.com/three/examples/jsm/controls/OrbitControls.js";
import {GUI} from "https://unpkg.com/three/examples/jsm/libs/dat.gui.module.js";
import * as IPGraph from "./IPGraph.js";


function IVprocess(imageProcessing, renderer) {
  renderer.setRenderTarget(imageProcessing.rtt);
  renderer.render(imageProcessing.scene, imageProcessing.orthoCamera);
  renderer.setRenderTarget(null);
}

var camera, controls, scene, renderer, container;
var plane;

// VIDEO AND THE ASSOCIATED TEXTURE
var video, videoTexture;

var imageProcessing, imageProcessingMaterial;

// GUI
var gui;

init();
animate();

function init() {
  container = document.createElement("div");
  document.body.appendChild(container);

  scene = new THREE.Scene();

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

  video = document.createElement("video");
  video.src = "./assets/video.mp4";
  video.load();
  video.muted = true;
  video.loop = true;

  video.onloadeddata = function () {
    videoTexture = new THREE.VideoTexture(video);
    videoTexture.wrapS = videoTexture.wrapT = THREE.RepeatWrapping;
    videoTexture.minFilter = THREE.NearestFilter;
    videoTexture.magFilter = THREE.NearestFilter;
    videoTexture.generateMipmaps = false;
    videoTexture.format = THREE.RGBFormat;

    imageProcessing = new IPGraph.GaussFilter(
      video.videoHeight,
      video.videoWidth,
      videoTexture,
      {
	// sigma: {type: "f", value: 5.0},
	// kernelSize: {type: "i", value: 31.0},
      }
    );

    var geometry = new THREE.PlaneGeometry(
      1,
      video.videoHeight / video.videoWidth,
    );
    var material = new THREE.MeshBasicMaterial({
      map: videoTexture,
      side: THREE.DoubleSide,
    });
    plane = new THREE.Mesh(geometry, imageProcessing.material);
    plane.receiveShadow = false;
    plane.castShadow = false;
    scene.add(plane);

    var geometry2 = new THREE.PlaneGeometry(
      1,
      video.videoHeight / video.videoWidth
    );
    var material2 = new THREE.MeshBasicMaterial({
      map: videoTexture,
      side: THREE.DoubleSide,
    });
    plane = new THREE.Mesh(geometry2, material2);
    plane.position.z = -0.5;
    plane.receiveShadow = false;
    plane.castShadow = false;
    scene.add(plane);

    var pausePlayObj = {
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

  window.addEventListener("resize", onWindowResize, false);
}

function render() {
  renderer.clear();

  if (typeof imageProcessing !== "undefined")
    IVprocess(imageProcessing, renderer);
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
