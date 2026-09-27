"use client";

import { Canvas } from "@react-three/fiber";
import { useTexture, OrbitControls} from "@react-three/drei";

function Card({ position }: { position: [number, number, number] }) {
  const [frontTexture, backTexture] = useTexture([
    "/png/2_of_clubs.png",
    "/png/back.png"
  ]);

  return (
      <group position={position}>

        <mesh>
          <boxGeometry args={[2.5, 3.5, 0.02]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[0, 0, 0.011]}>
          <planeGeometry args={[2.3, 3.3]} />
          <meshStandardMaterial map={frontTexture} transparent={true} />
        </mesh>
        <mesh position={[0, 0, -0.011]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[2.5, 3.5]} />
          <meshStandardMaterial map={backTexture} transparent={true} />
        </mesh>
      </group>
    );
  }

export default function GamePage() {
  return (
    <div className="w-full h-screen bg-neutral-900">
      <Canvas camera={{ position: [0, 0, 5] }}>

        {/* Lets you drag to spin the camera around! */}
        <OrbitControls />

        {/* Lighting is required for meshStandardMaterial */}
        <ambientLight intensity={2} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />

        {/* Draw a single card right in the middle */}
        <Card position={[0, 0, 0]} />

      </Canvas>
    </div>
  );
}
