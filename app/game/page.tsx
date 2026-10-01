"use client";

import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { createDeck, shuffleDeck, calculateScore } from "../../rules/deck";
import { useState, useRef, useEffect } from "react";
import { Slider } from "@ark-ui/react/slider";
import styles from "./slider.module.css";

function Card({ position, frontImage }: { position: [number, number, number], frontImage: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [targetRot, setTargetRot] = useState({ x: 0, y: 0 });
  const [shadowOffset, setShadowOffset] = useState({ x: 0, y: 0 });

  const [frontTexture, backTexture] = useTexture([
    frontImage,
    "/png/back.png"
  ]);

  useFrame(() => {
    if (!groupRef.current) return;
    
    const targetScale = hovered ? 1.1 : 1.0;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRot.x, 0.1);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRot.y, 0.1);

    if (shadowRef.current) {
      shadowRef.current.position.x = THREE.MathUtils.lerp(shadowRef.current.position.x, shadowOffset.x, 0.1);
      shadowRef.current.position.y = THREE.MathUtils.lerp(shadowRef.current.position.y, shadowOffset.y, 0.1);
    }
  });

  const handlePointerMove = (e: any) => {
    if (!hovered) return;
    e.stopPropagation();
    if (e.uv) {
      const limit = 15 * (Math.PI / 180);
      const rotY = (e.uv.x * 2 - 1) * limit;
      const rotX = -(e.uv.y * 2 - 1) * limit; 
      
      setTargetRot({ x: rotX, y: rotY });
      
      const sX = -(e.uv.x * 2 - 1) * 0.3;
      const sY = -(e.uv.y * 2 - 1) * 0.3;
      setShadowOffset({ x: sX, y: sY });
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
    setTargetRot({ x: 0, y: 0 });
    setShadowOffset({ x: 0, y: 0 });
  };

  return (
    <group position={position}>
      <group 
        ref={groupRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={handlePointerOut}
        onPointerMove={handlePointerMove}
      >
        <mesh>
          <boxGeometry args={[2.5, 3.5, 0.02]} />
          <meshStandardMaterial color="white" />
        </mesh>
        
        <mesh position={[0, 0, 0.011]}>
          <planeGeometry args={[2.3, 3.3]} />
          <meshStandardMaterial map={frontTexture} transparent={true} />
        </mesh>
        
        <mesh position={[0, 0, -0.011]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[2.3, 3.3]} />
          <meshStandardMaterial map={backTexture} transparent={true} />
        </mesh>

        <mesh ref={shadowRef} position={[0, 0, -0.1]}>
          <planeGeometry args={[2.5, 3.5]} />
          <meshBasicMaterial color="black" transparent={true} opacity={0.4} />
        </mesh>
      </group>
    </group>
  );
}

export default function GamePage() {
  const [deck, setDeck] = useState(createDeck());
  const [playerHand, setPlayerHand] = useState<any[]>([]);
  const [dealerHand, setDealerHand] = useState<any[]>([]);
  const [gameMessage, setGameMessage] = useState("");
  const [balance, setBalance] = useState(1000);
  const [currentBet, setCurrentBet] = useState(0);

  const isBettingPhase = playerHand.length === 0 || gameMessage !== "";

  function dealCards() {
    if (currentBet === 0) {
      alert("Place a bet first!");
      return;
    }

    setBalance(prev => prev - currentBet);
    setGameMessage("");
    let currentDeck = [...deck];

    if (currentDeck.length < 15) {
      currentDeck = createDeck();
    }

    let shuffled = shuffleDeck(currentDeck);
    let pHand = [shuffled.pop(), shuffled.pop()];
    let dHand = [shuffled.pop(), shuffled.pop()];

    if (calculateScore(pHand) === 21) {
      setGameMessage("Blackjack!");
      setBalance(prev => prev + currentBet + (currentBet * 1.5));
    }

    setPlayerHand(pHand);
    setDealerHand(dHand);
    setDeck(shuffled);
  }
  useEffect(() => {
      if (gameMessage !== "") {
        setCurrentBet(0);
      }
    }, [gameMessage]);

  function resolveDealerTurn(finalPlayerHand: any[], currentDeck: any[]) {
    let newHand = [...dealerHand];
    let newDeck = [...currentDeck];

    while (calculateScore(newHand) < 17) {
      let drawnCard = newDeck.pop();
      newHand.push(drawnCard);
    }

    let dScore = calculateScore(newHand);
    let pScore = calculateScore(finalPlayerHand);

    if (dScore > 21) {
      setGameMessage("Dealer Bust: YOU WIN!!!!!");
      setBalance(prev => prev + (currentBet * 2));
    } else if (pScore > dScore) {
      setGameMessage("You Win!");
      setBalance(prev => prev + (currentBet * 2));
    } else if (dScore > pScore) {
      setGameMessage("Dealer Wins!");
    } else {
      setGameMessage("Push! (Tie)");
      setBalance(prev => prev + currentBet);
    }

    setDeck(newDeck);
    setDealerHand(newHand);
  }

  function Hit() {
    if (playerHand.length === 0) return;
    if (gameMessage !== "") return;
    if (deck.length < 1) {
      console.log("Not enough cards!");
      return;
    }

    let newDeck = [...deck];
    let newHand = [...playerHand];
    let drawnCard = newDeck.pop();
    newHand.push(drawnCard);

    let newScore = calculateScore(newHand);

    if (newScore > 21) {
      setGameMessage("Bust!");
      setDeck(newDeck);
      setPlayerHand(newHand);
    } else if (newScore === 21) {
      setPlayerHand(newHand);
      resolveDealerTurn(newHand, newDeck);
    } else {
      setDeck(newDeck);
      setPlayerHand(newHand);
    }
  }

  function Stand() {
    if (playerHand.length === 0) return;
    if (gameMessage !== "") return;

    resolveDealerTurn(playerHand, deck);
  }

  return (
    <div className="w-full h-screen bg-[url('/background/Texturelabs_Fabric_184XL.jpg')] bg-cover bg-center relative">

      <div className="absolute top-4 right-4 z-10 text-white text-right bg-neutral-800 p-4 rounded-xl border border-neutral-700 shadow-xl">
        <h2 className="text-xl font-bold text-green-400">Bank: ${balance}</h2>
        <h3 className="text-lg">Bet: ${currentBet}</h3>
      </div>

      {isBettingPhase && balance === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-neutral-800 p-8 rounded-xl border border-red-700 shadow-2xl flex flex-col items-center gap-6 min-w-[350px]">
          <h2 className="text-3xl text-red-500 font-bold mb-2">Bankrupt!</h2>
          <p className="text-gray-300">You are out of chips.</p>
          <button
            onClick={() => {
              const sound = new Audio('/audio/re-zero-return-by-death.mp3');
              sound.currentTime = 0.8
              sound.play();
              setBalance(1000);
              setCurrentBet(0);
              setGameMessage("");
              setPlayerHand([]);
              setDealerHand([]);
              setDeck(createDeck());
            }}
            className="w-full mt-4 bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-500 cursor-pointer transition-colors"
          >
            Restart Game
          </button>
        </div>
      )}

      {isBettingPhase && balance > 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-neutral-800 p-8 rounded-xl border border-neutral-700 shadow-2xl flex flex-col items-center gap-6 min-w-[350px]">
          <h2 className="text-2xl text-white font-bold mb-4">{gameMessage || "Place Your Bet"}</h2>

          <Slider.Root
            origin="start"
            min={0}
            max={balance}
            step={10}
            value={[Math.min(currentBet, balance)]}
            onValueChange={(e) => setCurrentBet(e.value[0])}
            className={styles.Root}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Slider.Label className={styles.Label}>Wager Amount</Slider.Label>
              <Slider.ValueText className={styles.ValueText} />
            </div>
            <Slider.Control className={styles.Control}>
               <Slider.Track className={styles.Track}>
                 <Slider.Range className={styles.Range} />
               </Slider.Track>
               <Slider.Thumb index={0} className={styles.Thumb}>
                 <Slider.HiddenInput />
               </Slider.Thumb>
            </Slider.Control>
          </Slider.Root>

          <button
            onClick={dealCards}
            disabled={currentBet === 0 || currentBet > balance}
            className="w-full mt-4 bg-green-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-green-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Deal Cards
          </button>
        </div>
      )}

      {!isBettingPhase && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-4">
          <button
            onClick={Hit}
            className="bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-gray-200 cursor-pointer shadow-lg transition-transform active:scale-95"
          >
            Hit
          </button>
          <button
            onClick={Stand}
            className="bg-red-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-400 cursor-pointer shadow-lg transition-transform active:scale-95"
          >
            Stand
          </button>
        </div>
      )}

      {playerHand.length > 0 && (
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <h1 className="text-white text-xl font-bold bg-neutral-800/80 px-4 py-2 rounded-lg border border-neutral-700">
            Dealer: {gameMessage === "" ? "?" : calculateScore(dealerHand)}
          </h1>
          <h1 className="text-white text-xl font-bold bg-neutral-800/80 px-4 py-2 rounded-lg border border-neutral-700">
            Player: {calculateScore(playerHand)}
          </h1>
        </div>
      )}

      <Canvas camera={{ position: [0, 0, 8] }}>
        <ambientLight intensity={2} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />

        {playerHand.map((card, index) => (
          <Card
            key={index}
            frontImage={card.image}
            position={[index * 3 - (playerHand.length - 1) * 1.5, -2, 0]}
          />
        ))}

        {dealerHand.map((card, index) => (
          <Card
            key={index}
            frontImage={index === 0 && gameMessage === "" ? "/png/back.png" : card.image}
            position={[index * 3 - (dealerHand.length - 1) * 1.5, 3, 0]}
          />
        ))}

      </Canvas>
    </div>
  );
}
