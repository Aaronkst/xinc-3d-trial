import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";

import { useRef, useEffect, Suspense } from "react";
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
import { TextureLoader } from "three/src/loaders/TextureLoader";
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
  const moonTexture = useLoader(TextureLoader, "../assets/textures/moon.jpg");
  const ref = useRef<THREE.Mesh>(null!);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    characterControls.move(e.point);
  };

  return (
    <mesh
      {...props}
      ref={ref}
      rotation={new THREE.Euler(Math.PI / 2, 0, 0, "XYZ")}
      onClick={handleClick}
      receiveShadow={true}
    >
      <planeGeometry args={[32, 32]} />
      <meshStandardMaterial map={moonTexture} side={THREE.DoubleSide} />
    </mesh>
  );
};

const Controls = () => {
  const { camera, gl } = useThree();
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    //maximum scroll
    controls.minDistance = 5;
    controls.maxDistance = 10;

    //maximum rotating height
    //controls.minPolarAngle = 1;
    controls.maxPolarAngle = Math.PI / 2;

    controls.mouseButtons = {
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    };

    return () => {
      controls.dispose();
    };
  }, [camera, gl]);

  return null;
};

const App = () => {
  useEffect(() => {
    const animate = (time: number) => {
      requestAnimationFrame(animate);
      TWEEN.update(time);
    };
    requestAnimationFrame(animate);
  }, []);

  return (
    <section>
      <button onClick={() => characterControls.reset()}>Reset Position</button>
      <p>
        <span>Right Click: Rotate</span>
        <span>Left Click: Move</span>
        <span>Middle Mouse: Zoom</span>
      </p>
      <Canvas shadows={true} camera={{ position: [0, 5, 5] }}>
        <Controls />
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
