import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

// Comprehensive viseme definitions based on Oculus OVR LipSync + professional animation references
// Each viseme has detailed parameters for lips, jaw, teeth, and tongue
const VISEME_DATA = {
  // 0: Silence - neutral closed mouth
  0: {
    name: 'sil', phonemes: ['sil', ' '],
    jawOpen: 0, lipWidth: 1, lipPucker: 0, lipUpperUp: 0, lipLowerDown: 0,
    teethUpperShow: 0, teethLowerShow: 0,
    tongueOut: 0, tongueUp: 0, tongueTip: 0,
    mouthCornerPull: 0, lipPress: 0.2,
    description: 'Relaxed, lips together'
  },
  // 1: AA - open vowel (father, hot)
  1: {
    name: 'aa', phonemes: ['a', 'ɑ', 'æ', 'ʌ', 'ah'],
    jawOpen: 0.7, lipWidth: 1.1, lipPucker: 0, lipUpperUp: 0.2, lipLowerDown: 0.3,
    teethUpperShow: 0.6, teethLowerShow: 0.3,
    tongueOut: 0, tongueUp: -0.3, tongueTip: 0,
    mouthCornerPull: 0.1, lipPress: 0,
    description: 'Wide open, tongue low and flat'
  },
  // 2: E - mid vowel (bed, head)
  2: {
    name: 'E', phonemes: ['e', 'ɛ', 'ə', 'eh'],
    jawOpen: 0.4, lipWidth: 1.15, lipPucker: 0, lipUpperUp: 0.1, lipLowerDown: 0.15,
    teethUpperShow: 0.5, teethLowerShow: 0.2,
    tongueOut: 0, tongueUp: 0.2, tongueTip: 0,
    mouthCornerPull: 0.2, lipPress: 0,
    description: 'Mid-open, relaxed spread'
  },
  // 3: IH/EE - close front vowel (see, happy)
  3: {
    name: 'I', phonemes: ['i', 'ɪ', 'ee', 'y'],
    jawOpen: 0.2, lipWidth: 1.4, lipPucker: -0.2, lipUpperUp: 0.15, lipLowerDown: 0.1,
    teethUpperShow: 0.7, teethLowerShow: 0.4,
    tongueOut: 0, tongueUp: 0.6, tongueTip: 0.2,
    mouthCornerPull: 0.5, lipPress: 0,
    description: 'Wide smile, tongue high, teeth visible'
  },
  // 4: O - rounded vowel (go, boat)
  4: {
    name: 'O', phonemes: ['o', 'ɔ', 'oh'],
    jawOpen: 0.45, lipWidth: 0.7, lipPucker: 0.5, lipUpperUp: 0.1, lipLowerDown: 0.2,
    teethUpperShow: 0.3, teethLowerShow: 0.1,
    tongueOut: 0, tongueUp: 0.1, tongueTip: 0,
    mouthCornerPull: -0.2, lipPress: 0,
    description: 'Rounded O, lips forward'
  },
  // 5: U/OO - close back rounded (food, you)
  5: {
    name: 'U', phonemes: ['u', 'ʊ', 'oo', 'w'],
    jawOpen: 0.25, lipWidth: 0.5, lipPucker: 0.8, lipUpperUp: 0.05, lipLowerDown: 0.1,
    teethUpperShow: 0.1, teethLowerShow: 0,
    tongueOut: 0, tongueUp: 0.5, tongueTip: 0,
    mouthCornerPull: -0.3, lipPress: 0,
    description: 'Tight pucker, lips protruded'
  },
  // 6: PP - bilabial plosive (p, b, m)
  6: {
    name: 'PP', phonemes: ['p', 'b', 'm'],
    jawOpen: 0.02, lipWidth: 0.95, lipPucker: 0.1, lipUpperUp: 0, lipLowerDown: 0,
    teethUpperShow: 0, teethLowerShow: 0,
    tongueOut: 0, tongueUp: 0, tongueTip: 0,
    mouthCornerPull: 0, lipPress: 0.9,
    description: 'Lips pressed firmly together'
  },
  // 7: FF - labiodental (f, v) 
  7: {
    name: 'FF', phonemes: ['f', 'v'],
    jawOpen: 0.15, lipWidth: 1.05, lipPucker: 0, lipUpperUp: 0.2, lipLowerDown: -0.3,
    teethUpperShow: 0.8, teethLowerShow: 0,
    tongueOut: 0, tongueUp: 0, tongueTip: 0,
    mouthCornerPull: 0.1, lipPress: 0, lowerLipUnderTeeth: 0.6,
    description: 'Lower lip under upper teeth'
  },
  // 8: TH - dental fricative (θ, ð) - TONGUE BETWEEN TEETH
  8: {
    name: 'TH', phonemes: ['θ', 'ð', 'th'],
    jawOpen: 0.2, lipWidth: 1.1, lipPucker: 0, lipUpperUp: 0.15, lipLowerDown: 0.15,
    teethUpperShow: 0.7, teethLowerShow: 0.5,
    tongueOut: 0.7, tongueUp: 0.3, tongueTip: 0.9,
    mouthCornerPull: 0.1, lipPress: 0,
    description: 'Tongue tip visible between teeth'
  },
  // 9: DD - alveolar (d, t, n, l)
  9: {
    name: 'DD', phonemes: ['d', 't', 'n', 'l'],
    jawOpen: 0.25, lipWidth: 1.1, lipPucker: 0, lipUpperUp: 0.1, lipLowerDown: 0.15,
    teethUpperShow: 0.5, teethLowerShow: 0.3,
    tongueOut: 0.15, tongueUp: 0.8, tongueTip: 0.7,
    mouthCornerPull: 0.15, lipPress: 0,
    description: 'Tongue tip on alveolar ridge'
  },
  // 10: KK - velar (k, g, ng)
  10: {
    name: 'kk', phonemes: ['k', 'g', 'ŋ', 'ng'],
    jawOpen: 0.3, lipWidth: 1.0, lipPucker: 0, lipUpperUp: 0.1, lipLowerDown: 0.15,
    teethUpperShow: 0.4, teethLowerShow: 0.2,
    tongueOut: 0, tongueUp: 0.3, tongueTip: -0.3, tongueBack: 0.8,
    mouthCornerPull: 0, lipPress: 0,
    description: 'Back of tongue raised to soft palate'
  },
  // 11: CH/SH - postalveolar (ʃ, ʒ, tʃ, dʒ)
  11: {
    name: 'CH', phonemes: ['ʃ', 'ʒ', 'tʃ', 'dʒ', 'sh', 'ch', 'j'],
    jawOpen: 0.2, lipWidth: 0.75, lipPucker: 0.4, lipUpperUp: 0.1, lipLowerDown: 0.1,
    teethUpperShow: 0.4, teethLowerShow: 0.2,
    tongueOut: 0, tongueUp: 0.6, tongueTip: 0.5,
    mouthCornerPull: -0.15, lipPress: 0,
    description: 'Lips rounded/protruded, tongue raised'
  },
  // 12: SS - sibilant (s, z)
  12: {
    name: 'SS', phonemes: ['s', 'z', 'c'],
    jawOpen: 0.1, lipWidth: 1.25, lipPucker: -0.1, lipUpperUp: 0.1, lipLowerDown: 0.05,
    teethUpperShow: 0.8, teethLowerShow: 0.6,
    tongueOut: 0, tongueUp: 0.7, tongueTip: 0.6,
    mouthCornerPull: 0.3, lipPress: 0,
    description: 'Teeth close together, slight smile'
  },
  // 13: RR - approximant (r)
  13: {
    name: 'RR', phonemes: ['r', 'ɹ'],
    jawOpen: 0.25, lipWidth: 0.85, lipPucker: 0.3, lipUpperUp: 0.1, lipLowerDown: 0.1,
    teethUpperShow: 0.3, teethLowerShow: 0.1,
    tongueOut: 0, tongueUp: 0.4, tongueTip: 0.3, tongueCurl: 0.5,
    mouthCornerPull: -0.1, lipPress: 0,
    description: 'Lips slightly rounded, tongue curled back'
  },
  // 14: NN - nasal (n, ng)
  14: {
    name: 'nn', phonemes: ['n', 'ŋ'],
    jawOpen: 0.2, lipWidth: 1.05, lipPucker: 0, lipUpperUp: 0.1, lipLowerDown: 0.1,
    teethUpperShow: 0.4, teethLowerShow: 0.2,
    tongueOut: 0.1, tongueUp: 0.8, tongueTip: 0.6,
    mouthCornerPull: 0.1, lipPress: 0,
    description: 'Tongue on roof of mouth'
  },
  // Y sound - palatal approximant  
  15: {
    name: 'Y', phonemes: ['j', 'y'],
    jawOpen: 0.15, lipWidth: 1.3, lipPucker: -0.15, lipUpperUp: 0.1, lipLowerDown: 0.1,
    teethUpperShow: 0.6, teethLowerShow: 0.4,
    tongueOut: 0, tongueUp: 0.85, tongueTip: 0.4,
    mouthCornerPull: 0.4, lipPress: 0,
    description: 'Tongue high and forward, like "ee"'
  }
};

// Map letters to viseme IDs with more accurate mapping
const getVisemeForLetter = (letter) => {
  const l = letter?.toLowerCase() || '';
  
  // Check for digraphs first
  if (l === 'th') return 8;
  if (l === 'sh') return 11;
  if (l === 'ch') return 11;
  if (l === 'ng') return 10;
  
  const mapping = {
    'a': 1, 'e': 2, 'i': 3, 'o': 4, 'u': 5,
    'b': 6, 'p': 6, 'm': 6,
    'f': 7, 'v': 7,
    'd': 9, 't': 9, 'n': 14, 'l': 9,
    'k': 10, 'g': 10, 'q': 10,
    's': 12, 'z': 12, 'c': 12, 'x': 12,
    'r': 13,
    'w': 5,
    'y': 15, 'j': 15,
    'h': 1
  };
  
  return mapping[l] ?? 0;
};

export default function Mouth3DRenderer({ 
  blendshapes, 
  targetPhoneme, 
  isTarget = false,
  width = 200,
  height = 160
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const mouthPartsRef = useRef({});
  const animationRef = useRef(null);
  const currentValuesRef = useRef({});

  // Get viseme data
  const visemeData = useMemo(() => {
    if (isTarget && targetPhoneme) {
      const viseme = getVisemeForLetter(targetPhoneme.letter);
      return VISEME_DATA[viseme] || VISEME_DATA[0];
    }
    // Convert blendshapes to viseme-like data
    if (blendshapes) {
      const jawOpen = blendshapes.jawOpen || 0;
      const pucker = blendshapes.mouthPucker || 0;
      const smile = ((blendshapes.mouthSmileLeft || 0) + (blendshapes.mouthSmileRight || 0)) / 2;
      const tongueOut = blendshapes.tongueOut || 0;
      
      return {
        jawOpen: jawOpen,
        lipWidth: 1 + smile * 0.4 - pucker * 0.3,
        lipPucker: pucker,
        lipUpperUp: jawOpen * 0.2,
        lipLowerDown: jawOpen * 0.3,
        teethUpperShow: jawOpen > 0.15 ? 0.5 + jawOpen * 0.3 : 0,
        teethLowerShow: jawOpen > 0.3 ? jawOpen * 0.4 : 0,
        tongueOut: tongueOut,
        tongueUp: 0.2,
        tongueTip: tongueOut * 0.8,
        mouthCornerPull: smile * 0.5,
        lipPress: jawOpen < 0.05 ? 0.5 : 0
      };
    }
    return VISEME_DATA[0];
  }, [blendshapes, targetPhoneme, isTarget]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isTarget ? 0xEFF6FF : 0xFAF5FF);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(2, 3, 4);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-2, 0, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
    rimLight.position.set(0, 0, -3);
    scene.add(rimLight);

    // Create mouth parts
    const parts = createMouthParts(scene);
    mouthPartsRef.current = parts;

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [width, height, isTarget]);

  // Update mouth shape
  useEffect(() => {
    const parts = mouthPartsRef.current;
    if (!parts.upperLip) return;

    updateMouthShape(parts, visemeData, currentValuesRef);
  }, [visemeData]);

  return (
    <div 
      ref={containerRef} 
      className={`rounded-xl overflow-hidden border-2 ${isTarget ? 'border-blue-300 bg-blue-50' : 'border-purple-300 bg-purple-50'}`}
      style={{ width, height }}
    />
  );
}

function createMouthParts(scene) {
  const parts = {};
  
  // Materials
  const skinMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFFDFC4, roughness: 0.6, metalness: 0.1 
  });
  const lipMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xD4736B, roughness: 0.4, metalness: 0.05 
  });
  const innerLipMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xC45555, roughness: 0.5, metalness: 0 
  });
  const mouthCavityMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1A0505, roughness: 0.9, metalness: 0, side: THREE.BackSide 
  });
  const teethMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFFFFF5, roughness: 0.2, metalness: 0.1 
  });
  const tongueMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xD06060, roughness: 0.5, metalness: 0 
  });
  const gumMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xE08888, roughness: 0.6, metalness: 0 
  });

  // Face base
  const faceGeom = new THREE.SphereGeometry(2, 32, 32);
  faceGeom.scale(1, 0.85, 0.7);
  parts.face = new THREE.Mesh(faceGeom, skinMaterial);
  parts.face.position.z = -0.5;
  scene.add(parts.face);

  // Mouth cavity (dark interior)
  const cavityGeom = new THREE.SphereGeometry(0.8, 32, 32);
  cavityGeom.scale(1.2, 0.6, 1);
  parts.cavity = new THREE.Mesh(cavityGeom, mouthCavityMaterial);
  parts.cavity.position.set(0, 0, 0.3);
  scene.add(parts.cavity);

  // Upper lip
  parts.upperLip = createLip(lipMaterial, true);
  parts.upperLip.position.set(0, 0.15, 0.9);
  scene.add(parts.upperLip);

  // Lower lip
  parts.lowerLip = createLip(lipMaterial, false);
  parts.lowerLip.position.set(0, -0.15, 0.9);
  scene.add(parts.lowerLip);

  // Inner upper lip (wet line)
  parts.innerUpperLip = createInnerLip(innerLipMaterial);
  parts.innerUpperLip.position.set(0, 0.08, 0.85);
  parts.innerUpperLip.scale.set(0.9, 0.5, 1);
  scene.add(parts.innerUpperLip);

  // Inner lower lip
  parts.innerLowerLip = createInnerLip(innerLipMaterial);
  parts.innerLowerLip.position.set(0, -0.08, 0.85);
  parts.innerLowerLip.scale.set(0.9, 0.5, 1);
  scene.add(parts.innerLowerLip);

  // Upper teeth
  parts.upperTeeth = createTeethRow(teethMaterial, true);
  parts.upperTeeth.position.set(0, 0.05, 0.7);
  scene.add(parts.upperTeeth);

  // Lower teeth
  parts.lowerTeeth = createTeethRow(teethMaterial, false);
  parts.lowerTeeth.position.set(0, -0.12, 0.65);
  scene.add(parts.lowerTeeth);

  // Upper gums
  parts.upperGums = createGums(gumMaterial);
  parts.upperGums.position.set(0, 0.18, 0.55);
  scene.add(parts.upperGums);

  // Tongue
  parts.tongue = createTongue(tongueMaterial);
  parts.tongue.position.set(0, -0.15, 0.4);
  scene.add(parts.tongue);

  // Tongue tip (for TH sounds)
  const tongueTipGeom = new THREE.SphereGeometry(0.12, 16, 16);
  tongueTipGeom.scale(1, 0.5, 1.2);
  parts.tongueTip = new THREE.Mesh(tongueTipGeom, tongueMaterial);
  parts.tongueTip.position.set(0, -0.05, 0.7);
  parts.tongueTip.visible = false;
  scene.add(parts.tongueTip);

  return parts;
}

function createLip(material, isUpper) {
  const shape = new THREE.Shape();
  const w = 0.6;
  const h = isUpper ? 0.12 : 0.15;
  
  // Create cupid's bow for upper lip, rounder for lower
  if (isUpper) {
    shape.moveTo(-w, 0);
    shape.quadraticCurveTo(-w * 0.6, h * 1.2, -0.08, h * 0.7);
    shape.quadraticCurveTo(0, h * 0.5, 0.08, h * 0.7);
    shape.quadraticCurveTo(w * 0.6, h * 1.2, w, 0);
    shape.quadraticCurveTo(w * 0.6, -h * 0.5, 0, -h * 0.3);
    shape.quadraticCurveTo(-w * 0.6, -h * 0.5, -w, 0);
  } else {
    shape.moveTo(-w, 0);
    shape.quadraticCurveTo(-w * 0.5, -h * 1.3, 0, -h * 1.5);
    shape.quadraticCurveTo(w * 0.5, -h * 1.3, w, 0);
    shape.quadraticCurveTo(w * 0.5, h * 0.4, 0, h * 0.3);
    shape.quadraticCurveTo(-w * 0.5, h * 0.4, -w, 0);
  }

  const extrudeSettings = {
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 4
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  return new THREE.Mesh(geometry, material);
}

function createInnerLip(material) {
  const geometry = new THREE.TorusGeometry(0.5, 0.03, 8, 32, Math.PI);
  return new THREE.Mesh(geometry, material);
}

function createTeethRow(material, isUpper) {
  const group = new THREE.Group();
  const toothWidth = 0.11;
  const toothHeight = isUpper ? 0.12 : 0.1;
  const toothDepth = 0.06;
  const teeth = 8;
  
  for (let i = 0; i < teeth; i++) {
    const x = (i - (teeth - 1) / 2) * (toothWidth + 0.01);
    const toothGeom = new THREE.BoxGeometry(toothWidth, toothHeight, toothDepth);
    toothGeom.translate(0, 0, toothDepth / 2);
    
    // Round the edges
    const tooth = new THREE.Mesh(toothGeom, material);
    tooth.position.x = x;
    tooth.position.y = isUpper ? -toothHeight / 2 : toothHeight / 2;
    group.add(tooth);
  }
  
  return group;
}

function createGums(material) {
  const geometry = new THREE.BoxGeometry(0.9, 0.08, 0.15);
  return new THREE.Mesh(geometry, material);
}

function createTongue(material) {
  const group = new THREE.Group();
  
  // Tongue body
  const bodyGeom = new THREE.SphereGeometry(0.35, 24, 24);
  bodyGeom.scale(1.3, 0.4, 1.2);
  const body = new THREE.Mesh(bodyGeom, material);
  group.add(body);
  
  // Tongue front (tip area)
  const frontGeom = new THREE.SphereGeometry(0.2, 16, 16);
  frontGeom.scale(1, 0.5, 1.3);
  const front = new THREE.Mesh(frontGeom, material);
  front.position.z = 0.3;
  front.name = 'tongueFront';
  group.add(front);
  
  return group;
}

function updateMouthShape(parts, data, currentValuesRef) {
  // Smooth interpolation
  const lerp = (current, target, speed = 0.3) => {
    return current + (target - current) * speed;
  };
  
  const cv = currentValuesRef.current;
  
  // Initialize current values if needed
  if (!cv.jawOpen) {
    Object.assign(cv, {
      jawOpen: 0, lipWidth: 1, lipPucker: 0, tongueOut: 0, tongueTip: 0
    });
  }
  
  // Interpolate values
  cv.jawOpen = lerp(cv.jawOpen, data.jawOpen || 0);
  cv.lipWidth = lerp(cv.lipWidth, data.lipWidth || 1);
  cv.lipPucker = lerp(cv.lipPucker, data.lipPucker || 0);
  cv.tongueOut = lerp(cv.tongueOut, data.tongueOut || 0);
  cv.tongueTip = lerp(cv.tongueTip, data.tongueTip || 0);

  const jawOpen = cv.jawOpen;
  const lipWidth = cv.lipWidth;
  const lipPucker = cv.lipPucker;
  const tongueOut = cv.tongueOut;
  const tongueTip = cv.tongueTip;

  // Jaw opening - move lips apart
  const lipSeparation = jawOpen * 0.5;
  parts.upperLip.position.y = 0.15 + lipSeparation * 0.3 + (data.lipUpperUp || 0) * 0.1;
  parts.lowerLip.position.y = -0.15 - lipSeparation * 0.7 - (data.lipLowerDown || 0) * 0.1;
  
  // Inner lips follow
  parts.innerUpperLip.position.y = 0.08 + lipSeparation * 0.25;
  parts.innerLowerLip.position.y = -0.08 - lipSeparation * 0.6;

  // Lip width (smile vs pucker)
  const widthScale = lipWidth;
  const puckerDepth = lipPucker * 0.15;
  
  parts.upperLip.scale.x = widthScale;
  parts.lowerLip.scale.x = widthScale;
  parts.upperLip.position.z = 0.9 + puckerDepth;
  parts.lowerLip.position.z = 0.9 + puckerDepth;

  // Lip press (for m/b/p)
  if (data.lipPress > 0.5) {
    parts.upperLip.scale.y = 0.7;
    parts.lowerLip.scale.y = 0.7;
  } else {
    parts.upperLip.scale.y = 1;
    parts.lowerLip.scale.y = 1;
  }

  // Mouth cavity scaling
  parts.cavity.scale.y = 0.3 + jawOpen * 0.7;
  parts.cavity.position.y = -jawOpen * 0.1;
  parts.cavity.visible = jawOpen > 0.05;

  // Teeth visibility
  const showTeeth = jawOpen > 0.1;
  parts.upperTeeth.visible = showTeeth && (data.teethUpperShow || 0) > 0.2;
  parts.lowerTeeth.visible = showTeeth && jawOpen > 0.25 && (data.teethLowerShow || 0) > 0.1;
  
  if (parts.upperTeeth.visible) {
    parts.upperTeeth.position.y = 0.05 + lipSeparation * 0.15;
  }
  if (parts.lowerTeeth.visible) {
    parts.lowerTeeth.position.y = -0.12 - lipSeparation * 0.4;
  }

  // Upper gums
  parts.upperGums.visible = jawOpen > 0.4;
  if (parts.upperGums.visible) {
    parts.upperGums.position.y = 0.18 + lipSeparation * 0.2;
  }

  // Tongue
  const showTongue = jawOpen > 0.15 || tongueOut > 0.3;
  parts.tongue.visible = showTongue;
  
  if (showTongue) {
    // Tongue position based on phoneme
    parts.tongue.position.y = -0.15 - jawOpen * 0.15 + (data.tongueUp || 0) * 0.15;
    parts.tongue.position.z = 0.4 + tongueOut * 0.4;
    parts.tongue.scale.z = 1 + tongueOut * 0.3;
  }

  // Tongue tip for TH sound - protrudes between teeth
  const showTongueTip = tongueTip > 0.5;
  parts.tongueTip.visible = showTongueTip;
  
  if (showTongueTip) {
    parts.tongueTip.position.z = 0.75 + tongueTip * 0.2;
    parts.tongueTip.position.y = 0;
    parts.tongueTip.scale.set(1 + tongueTip * 0.3, 0.5, 1.2);
  }

  // F/V sound - lower lip tucks under upper teeth
  if (data.lowerLipUnderTeeth > 0.3) {
    parts.lowerLip.position.y = -0.05;
    parts.lowerLip.position.z = 0.75;
    parts.lowerLip.scale.y = 0.6;
  }
}