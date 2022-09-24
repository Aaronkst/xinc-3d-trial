import * as THREE from "three";
import * as React from "react";
import { useRef, useState, useEffect } from "react";
import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PerspectiveCamera } from "@react-three/drei";

const Box = (props: JSX.IntrinsicElements["mesh"]) => {
  // This reference will give us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh>(null!);
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  // Rotate mesh every frame, this is outside of React without overhead
  useFrame((state, delta) => (ref.current.rotation.x += 0.01));

  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
};

const Floor = (props: JSX.IntrinsicElements["mesh"]) => {
  const ref = useRef<THREE.Mesh>(null!);

  useEffect(() => {
    ref.current.rotateX(1.5);
  }, []);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {};

  return (
    <mesh {...props} ref={ref} onClick={(event) => console.log(event)}>
      <planeGeometry args={[64, 64]} />
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
    controls.minPolarAngle = 1;
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
      <Canvas>
        <PerspectiveCamera />
        <Controls />
        <pointLight position={[10, 10, 10]} />
        <ambientLight intensity={0.5} />
        <Floor position={[0, -1.5, 0]} />
      </Canvas>
    </section>
  );
};

export default App;
