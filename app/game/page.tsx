"use client";

import { Canvas } from "@react-three/fiber";
import { useTexture, OrbitControls } from "@react-three/drei";
import { createDeck, shuffleDeck } from "../../rules/deck";
import { useState } from "react";

function Card({ position, frontImage }: { position: [number, number, number], frontImage: string }) {
  const [frontTexture, backTexture] = useTexture([
    frontImage,
    "/png/back.png"
  ]);

  return (
      <group position={position}>
        <mesh>
          <boxGeometry args={[2.5, 3.5, 0.02]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[0, 0, 0.011]}>
          {/* Made the plane slightly smaller than the box to create a white border margin! */}
          <planeGeometry args={[2.3, 3.3]} />
          <meshStandardMaterial map={frontTexture} transparent={true} />
        </mesh>
        <mesh position={[0, 0, -0.011]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[2.3, 3.3]} />
          <meshStandardMaterial map={backTexture} transparent={true} />
        </mesh>
      </group>
    );
}

export default function GamePage() {
  const [deck, setDeck] = useState(createDeck());
  const [playerHand, setPlayerHand] = useState<any[]>([]);
  const [dealerHand, setDealerHand] = useState<any[]>([]);

  function dealCards() {
    if (deck.length < 4) {
      console.log("Not enough cards!");
      return;
    }

    let shuffled = shuffleDeck(deck);

    let pHand = [shuffled.pop(), shuffled.pop()];
    let dHand = [shuffled.pop(), shuffled.pop()];

    setPlayerHand(pHand);
    setDealerHand(dHand);
    setDeck(shuffled);
  }

  return (
    <div className="w-full h-screen bg-neutral-900 relative">
      <button 
        onClick={dealCards} 
        className="absolute top-4 left-4 z-10 bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-gray-200 cursor-pointer"
      >
        Deal Cards
      </button>

      <Canvas camera={{ position: [0, 0, 8] }}>
        <OrbitControls />
        <ambientLight intensity={2} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        
        {/* Map Player Hand */}
        {playerHand.map((card, index) => (
          <Card 
            key={index} 
            frontImage={card.image} 
            // Position: (X shifts right based on index, Y is pushed down towards the player)
            position={[index * 3 - 0.75, -2, 0]} 
          />
        ))}

        {/* Map Dealer Hand */}
        {dealerHand.map((card, index) => (
          <Card 
            key={index} 
            frontImage={card.image} 
            // Position: (X shifts right based on index, Y is pushed up away from the player)
            position={[index * 3 - 0.75, 3, 0]} 
          />
        ))}

      </Canvas>
    </div>
  );
}
