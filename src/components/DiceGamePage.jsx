"use client";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import RollAndHoldButtons from "./RollAndHoldButtons";
import Dice from "./Dice";
import { socket } from "@/utils/socket";
import { Share_Tech_Mono } from "next/font/google";
import { setScores, setSession, setWinner } from "@/store/authSlice";
import { useDispatch, useSelector } from "react-redux";

const techMono = Share_Tech_Mono({ weight: "400", subsets: ["latin"] });

export default function DiceGamePage({ setShowSteal, isMyTurn }) {
  const [isRolling, setIsRolling] = useState(false);
  const { roomId, session } = useSelector((store) => store.auth);
  const [diceValue, setDiceValue] = useState(1);

  const dispatch = useDispatch();

  const stealSound = useRef(null);
  const whistleDown = useRef(null);

  // Initialize sounds safely on client-side mount
  useEffect(() => {
    stealSound.current = new Audio("/sounds/points-stolen.mp3");
    whistleDown.current = new Audio("/sounds/whistle-down.mp3");
  }, []);

  // Main game state update listener
  useEffect(() => {
    const handleUpdate = (updatedSession) => {
      dispatch(
        setScores({
          player1: updatedSession?.player1?.score,
          player2: updatedSession?.player2?.score,
        }),
      );
      dispatch(setSession(updatedSession));
    };

    socket.on("update-game-state", handleUpdate);
    return () => socket.off("update-game-state", handleUpdate);
  }, [dispatch]);

  // Dice roll outcome listener
  useEffect(() => {
    const handleDiceResult = (data) => {
      const { result, turnSwapped, session: serverSession } = data;

      setIsRolling(true);

      setTimeout(() => {
        setDiceValue(result);
        setIsRolling(false);
        dispatch(setSession(serverSession));

        if (result === 6 && serverSession?.stealHappened) {
          if (stealSound.current) {
            stealSound.current.currentTime = 0;
            stealSound.current.play().catch(() => {});
          }
          if (navigator.vibrate) navigator.vibrate([50, 30, 50]);

          setShowSteal(true);
          setTimeout(() => setShowSteal(false), 800);
        }

        if (turnSwapped && whistleDown.current) {
          whistleDown.current.currentTime = 0;
          whistleDown.current.play().catch(() => {});
        }
      }, 400);
    };

    socket.on("dice-result", handleDiceResult);
    return () => socket.off("dice-result", handleDiceResult);
  }, [dispatch, setShowSteal]);

  // CRITICAL FIX: Moved game-over out of the click handler to avoid duplicate listener leaks
  useEffect(() => {
    const handleGameOver = ({ winner }) => {
      dispatch(setWinner(winner));
    };

    socket.on("game-over", handleGameOver);
    return () => socket.off("game-over", handleGameOver);
  }, [dispatch]);

  const handleRoll = () => {
    if (isRolling || !isMyTurn || !session?.player1 || !session?.player2)
      return;

    const diceAudio = new Audio("/sounds/dice-rolled.mp3");
    diceAudio.play().catch(() => {});

    socket.emit("roll-dice", roomId);
  };

  const handleHold = () => {
    if (!session || session?.currentTurnScore === 0 || isRolling || !isMyTurn)
      return;
    socket.emit("player-hold", { roomId, points: session?.currentTurnScore });
  };

  return (
    <>
      {/* 3D RENDER CANVAS AREA */}
      <div className="absolute inset-0 z-10">
        <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={7.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <Dice rolling={isRolling} value={diceValue} />
        </Canvas>
      </div>

      {/* UI INTERACTION CONTROLS STACK */}
      {/* CRITICAL FIX: Standardized layout context prevents element crowding at the screen baseline */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none flex flex-col items-center pb-8 sm:pb-12 z-20 gap-4">
        {/* Turn Status Message Indicator */}
        <div className="pointer-events-auto bg-white/90 backdrop-blur px-4 py-1.5 rounded-full border border-zinc-200/50 shadow-sm">
          {!session?.player2 ? (
            <p className="text-xs font-bold text-zinc-600 animate-pulse uppercase tracking-wider">
              Waiting for Player...
            </p>
          ) : isMyTurn ? (
            <p className="text-xs font-bold text-amber-500 animate-pulse uppercase tracking-wider">
              Your turn!
            </p>
          ) : (
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Opponent is rolling...
            </p>
          )}
        </div>

        {/* Action Button Set Container */}
        <div className="pointer-events-auto min-h-[52px] flex items-center justify-center">
          {isMyTurn && (
            <RollAndHoldButtons
              onRoll={handleRoll}
              onHold={handleHold}
              isRolling={isRolling}
              disabled={isRolling || !isMyTurn}
            />
          )}
        </div>

        {/* Current Cumulative Turn Score Frame */}
        {/* CRITICAL FIX: Dropped absolute tracking completely, allowing natural stacking */}
        <div
          className={`pointer-events-auto flex flex-col justify-center text-center items-center shadow-lg transition-colors duration-300
            ${session?.currentTurnScore > 0 ? "size-16 sm:size-20" : "size-14"}
            ${diceValue === 1 ? "text-red-500 bg-red-50 border border-red-200" : "text-zinc-900 bg-white border border-zinc-200"} 
            font-semibold rounded-full`}
        >
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tight leading-none mb-0.5">
            Turn
          </span>
          <p
            className={`${techMono.className} text-xl sm:text-2xl font-bold tracking-tight leading-none`}
          >
            {session?.currentTurnScore || 0}
          </p>
        </div>
      </div>
    </>
  );
}
