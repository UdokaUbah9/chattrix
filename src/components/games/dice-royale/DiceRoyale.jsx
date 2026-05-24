"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import DiceGamePage from "../../DiceGamePage"; // This contains your Canvas/Dice
import Versus from "../../Versus";
import { useSelector } from "react-redux";

export default function DiceRoyale({ roomId }) {
  const [showSteal, setShowSteal] = useState(false);
  const [floatingText, setFloatingText] = useState("");

  const [currentTurnScore, setCurrentTurnScore] = useState(0);
  const { session, playerRole } = useSelector((store) => store.auth);

  //Checking Players turn
  const isMyTurn = session && playerRole ? session[playerRole]?.active : false;

  return (
    <div className="relative flex flex-col h-screen p-4 overflow-hidden">
      {/* Background stays here */}
      <Image
        src="/plank.jpg"
        fill
        className="absolute object-cover z-0"
        alt="plank Background"
        priority
      />

      {/* Pass scores to the header */}
      <header className="flex justify-between z-50 pointer-events-none">
        <Versus
          showSteal={showSteal}
          floatingText={floatingText}
          isMyTurn={isMyTurn}
          playerRole={playerRole}
        />
      </header>

      {/* Pass state setters to the Game Engine */}
      <DiceGamePage
        setShowSteal={setShowSteal}
        session={session}
        isMyTurn={isMyTurn}
        setFloatingText={setFloatingText}
        roomId={roomId}
        currentTurnScore={currentTurnScore}
        setCurrentTurnScore={setCurrentTurnScore}
      />
    </div>
  );
}
