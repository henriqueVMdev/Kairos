<script setup>
import { onMounted, ref } from 'vue';
import KairosMark from './components/KairosMark.vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

onMounted(() => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 10);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(5, 5, 1);
  scene.add(directionalLight);

  let diceModel = null;
  let animationFrameId = null;

  const loader = new GLTFLoader();
  loader.load(
    '/models/dice.glb',
    (gltf) => {
      // Tudo relativo ao modelo deve ficar DENTRO deste bloco
      diceModel = gltf.scene;
      diceModel.name = 'meuDado';
      scene.add(diceModel);
    },
    undefined,
    (error) => {
      console.error('Erro ao carregar o modelo:', error);
    }
  );

  function animate() { 
    animationFrameId = requestAnimationFrame(animate);

    // Anima o dado se ele já tiver sido carregado
   

    // O render DEVE ficar dentro da função animate
    renderer.render(scene, camera);
  }

  animate();
});
</script>

<template>
  <header>
    <div class="kairos-container grid grid-cols-3 items-start pt-8 flex justify-content-center">
      </div>
      <KairosMark/>    
  </header>

  <body>
     <div class="kairos-container items-start flex justify-content-center">
    
    <KairosMark/>
    </div>
  </body>
</template>