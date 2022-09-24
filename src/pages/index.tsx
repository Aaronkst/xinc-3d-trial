import * as THREE from "three";
import * as React from "react";
import { useRef, useState, useEffect, Suspense } from "react";
import {
  Canvas,
  ThreeEvent,
  useThree,
  useLoader,
  useFrame,
  MeshProps,
} from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { PerspectiveCamera } from "@react-three/drei";
import CharacterControls from "../modules/charcterControls";

let characterControls: CharacterControls;

const Soldier = (props: MeshProps) => {
  const gltf = useLoader(GLTFLoader, "../assets/models/Soldier.glb");
  const model = gltf.scene;
  model.traverse((layer: any) => {
    if (!!layer.isMesh) layer.castShadow = true;
  });

  const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
  const mixer = new THREE.AnimationMixer(model);
  const animationsMap: Map<string, THREE.AnimationAction> = new Map();
  gltfAnimations
    .filter((a) => a.name !== "TPose")
    .forEach((a: THREE.AnimationClip) => {
      animationsMap.set(a.name, mixer.clipAction(a));
    });

  characterControls = new CharacterControls(
    model,
    mixer,
    animationsMap,
    "Idle"
  );

  useFrame((state, delta) => {
    characterControls.mixer.update(delta);
  });

  return (
    <Suspense fallback={null}>
      <primitive {...props} object={model} />
    </Suspense>
  );
};

const Floor = (props: MeshProps) => {
  const ref = useRef<THREE.Mesh>(null!);

  useEffect(() => {
    ref.current.rotateX(Math.PI / 2);
  }, []);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    console.log(e);
    characterControls.move(e.point);
  };

  return (
    <mesh {...props} ref={ref} onClick={handleClick} receiveShadow={true}>
      <planeGeometry args={[32, 32]} />
      <meshStandardMaterial color={0x00ffff} side={THREE.DoubleSide} />
    </mesh>
  );
};

const Controls = () => {
  const { camera, gl } = useThree();
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);

    //maximum scroll
    controls.minDistance = 3;
    controls.maxDistance = 20;

    //maximum rotating height
    //controls.minPolarAngle = 1;
    controls.maxPolarAngle = Math.PI / 2;

    return () => {
      controls.dispose();
    };
  }, [camera, gl]);

  return null;
};

const App = () => {
  return (
    <section>
      <Canvas shadows={true}>
        <Controls />
        <PerspectiveCamera fov={90} />
        <group>
          {
            <directionalLight
              castShadow={true}
              color={0xffffff}
              position={[0, 0, 3]}
            />
          }
          <ambientLight intensity={0.8} color={0xffffff} />
        </group>
        <directionalLight castShadow={true} color={0xaaaaaa} />
        <Soldier position={[0, -1.5, 0]} />
        <Floor position={[0, -1.5, 0]} />
      </Canvas>
    </section>
  );
};

export default App;
