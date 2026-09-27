"use client";

import { Canvas } from "@react-three/fiber";
import { useTexture, OrbitControls } from "@react-three/drei";
import { createDeck, shuffleDeck, calculateScore } from "../../rules/deck";
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
  const [gameMessage, setGameMessage] = useState("")

  function dealCards() {
    setGameMessage("");
    let currentDeck = [...deck]

    if (currentDeck.length < 15) {
      currentDeck = createDeck()
    }

    let shuffled = shuffleDeck(deck);

    let pHand = [shuffled.pop(), shuffled.pop()];
    let dHand = [shuffled.pop(), shuffled.pop()];

    if (calculateScore(pHand) === 21) {
      setGameMessage("Blackjack!");
    }

    setPlayerHand(pHand);
    setDealerHand(dHand);
    setDeck(shuffled);
  }

  function Hit() {
    if (gameMessage !== "") return;
    if (deck.length < 1) {
      console.log("Not enough cards!");
      return;
    }
    let newDeck = [...deck];
    let newHand = [...playerHand];
    let drawnCard = newDeck.pop()
    newHand.push(drawnCard)
    if (calculateScore(newHand) > 21) {
      setGameMessage("Bust!");
    }
    setDeck(newDeck)
    setPlayerHand(newHand)

  }

  function Stand() {
    if (gameMessage !== "") return
    let newHand = [...dealerHand];
    let newDeck = [...deck];
    while (calculateScore(newHand) < 17) {
      let drawnCard = newDeck.pop()
      newHand.push(drawnCard)
      
    }
    if (calculateScore(newHand) > 21) {
      setGameMessage("Dealer Bust: YOU WIN!!!!!");
    } else {
      let pScore = calculateScore(playerHand);
      let dScore = calculateScore(newHand);
      if (pScore > dScore) {
        setGameMessage("You Win!");
      } else if (dScore > pScore) {
        setGameMessage("Dealer Wins!");
      } else {
        setGameMessage("Push! (Tie)");
      }
    }
    setDeck(newDeck)
    setDealerHand(newHand)
    
  }

  return (
    <div className="w-full h-screen bg-neutral-900 relative">
      <button
        onClick={dealCards}
        className="absolute top-4 left-4 z-10 bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-gray-200 cursor-pointer"
      >
        Deal Cards
      </button>
      <button
        onClick={Hit}
        className="absolute bottom-0 left-1/3  z-10 bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-gray-200 cursor-pointer"
      >
        Hit
      </button>
      <button
        onClick={Stand}
        className="absolute bottom-0 left-2/3  z-10 bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-gray-200 cursor-pointer"
      >
        Stand
      </button>
      <h1 className="absolute bottom-0 left-1/2 text-white z-10">{gameMessage}</h1>
      <h1 className="absolute top-20 text-white z-10">Dealer Score {gameMessage === "" ? "?" : calculateScore(dealerHand)}</h1>
      <h1 className="absolute top-25 text-white z-10">Player Score {calculateScore(playerHand)}</h1>


      <Canvas camera={{ position: [0, 0, 8] }}>
        <OrbitControls />
        <ambientLight intensity={2} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />

        {playerHand.map((card, index) => (
          <Card
            key={index}
            frontImage={card.image}
            position={[index * 3 - 0.75, -2, 0]}
          />
        ))}

        {dealerHand.map((card, index) => (
          <Card
            key={index}
            frontImage={index === 0 && gameMessage === "" ? "/png/back.png" : card.image}
            position={[index * 3 - 0.75, 3, 0]}
          />
        ))}

      </Canvas>
    </div>
  );
}
