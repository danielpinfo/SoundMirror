import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default function TongueAnimator({ 
  audioUrl = null,
  isPlaying = false,
  width = 400,
  height = 400,
  showPalate = true
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const tongueRef = useRef(null);
  const palateRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioElementRef = useRef(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    // Camera setup (side cutaway view)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10);
    camera.position.set(0.3, 0.15, 0.5); // Side view angle
    camera.lookAt(0, 0.15, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Load models
    const loader = new GLTFLoader();

    // Load tongue (you'll need to provide tongue.glb in public folder)
    loader.load(
      '/tongue.glb',
      (gltf) => {
        const tongue = gltf.scene;
        tongue.scale.set(0.1, 0.1, 0.1);
        scene.add(tongue);
        tongueRef.current = tongue;
      },
      undefined,
      (error) => {
        console.log('Tongue model not found, using placeholder geometry');
        // Fallback: simple tongue shape
        const geometry = new THREE.CapsuleGeometry(0.015, 0.08, 8, 16);
        const material = new THREE.MeshPhongMaterial({ 
          color: 0xff6b9d,
          shininess: 30
        });
        const tongue = new THREE.Mesh(geometry, material);
        tongue.rotation.z = Math.PI / 2;
        tongue.position.set(0, 0.12, 0);
        scene.add(tongue);
        tongueRef.current = tongue;
      }
    );

    // Load palate
    if (showPalate) {
      loader.load(
        '/palate.glb',
        (gltf) => {
          const palate = gltf.scene;
          palate.scale.set(0.1, 0.1, 0.1);
          scene.add(palate);
          palateRef.current = palate;
        },
        undefined,
        (error) => {
          console.log('Palate model not found, using placeholder');
          // Fallback: simple palate arc
          const curve = new THREE.EllipseCurve(
            0, 0,
            0.04, 0.03,
            0, Math.PI,
            false, 0
          );
          const points = curve.getPoints(50);
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({ color: 0xd1d5db });
          const palate = new THREE.Line(geometry, material);
          palate.position.set(0, 0.18, 0);
          palate.rotation.x = Math.PI / 2;
          scene.add(palate);
          palateRef.current = palate;
        }
      );
    }

    // Animation loop
    function animate() {
      animationFrameRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, [width, height, showPalate]);

  // Audio analysis and tongue animation
  useEffect(() => {
    if (!audioUrl || !isPlaying || !tongueRef.current) return;

    const audio = new Audio(audioUrl);
    audio.crossOrigin = 'anonymous';
    audioElementRef.current = audio;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;

    const source = audioContext.createMediaElementSource(audio);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const dataArray = new Float32Array(analyser.frequencyBinCount);

    function updateTongueAnimation() {
      if (!analyserRef.current || !tongueRef.current) return;

      analyserRef.current.getFloatFrequencyData(dataArray);

      // TTS-optimized frequency bands
      const low = averageBand(dataArray, 80, 300);    // jaw openness (vowel height)
      const mid = averageBand(dataArray, 500, 1500);  // tongue body position
      const high = averageBand(dataArray, 2000, 3500); // tongue tip / groove

      const tongue = tongueRef.current;

      // Map frequency bands to tongue position
      // Y-axis: tongue height (mid frequencies)
      tongue.position.y = mapRange(mid, -80, -20, 0.10, 0.15);

      // Z-axis: tongue advancement (high frequencies)
      tongue.position.z = mapRange(high, -90, -30, -0.01, 0.02);

      // X rotation: jaw openness (low frequencies)
      tongue.rotation.x = mapRange(low, -70, -25, -0.1, 0.2);

      animationFrameRef.current = requestAnimationFrame(updateTongueAnimation);
    }

    audio.play();
    updateTongueAnimation();

    return () => {
      audio.pause();
      audio.currentTime = 0;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl, isPlaying]);

  return (
    <div 
      ref={containerRef} 
      className="relative rounded-lg overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100"
      style={{ width, height }}
    >
      {!tongueRef.current && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
          Loading tongue model...
        </div>
      )}
    </div>
  );
}

// Helper function: average frequency band
function averageBand(dataArray, freqStart, freqEnd) {
  const sampleRate = 48000; // Typical sample rate
  const binCount = dataArray.length;
  const binWidth = sampleRate / 2 / binCount;

  const startBin = Math.floor(freqStart / binWidth);
  const endBin = Math.floor(freqEnd / binWidth);

  let sum = 0;
  let count = 0;

  for (let i = startBin; i <= endBin && i < dataArray.length; i++) {
    sum += dataArray[i];
    count++;
  }

  return count > 0 ? sum / count : -100;
}

// Helper function: map value from one range to another
function mapRange(value, inMin, inMax, outMin, outMax) {
  const clamped = Math.max(inMin, Math.min(inMax, value));
  return ((clamped - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}