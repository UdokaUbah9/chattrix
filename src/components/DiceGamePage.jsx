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

  const stealSound =
    typeof Audio !== "undefined"
      ? new Audio("/sounds/points-stolen.mp3")
      : null;
  const whistleDown =
    typeof Audio !== "undefined" ? new Audio("/sounds/whistle-down.mp3") : null;

  useEffect(() => {
    const handleDiceResult = (data) => {
      const {
        result,
        turnSwapped,
        session: serverSession,
        stealHappened,
      } = data;

      setIsRolling(true);

      setTimeout(() => {
        setDiceValue(result);
        setIsRolling(false);

        dispatch(setSession(serverSession));
        //Setting the rolled-6 EFFECT
        if (result === 6 && serverSession?.stealHappenned) {
          if (stealSound) {
            stealSound.currentTime = 0;
            stealSound.play();
          }

          // Add a tiny vibration for mobile users
          if (navigator.vibrate) navigator.vibrate([50, 30, 50]);

          setShowSteal(true);
          setTimeout(() => setShowSteal(false), 800); // Reset after anim
        }

        if (turnSwapped) {
          if (whistleDown) {
            whistleDown.currentTime = 0;
            whistleDown.play();
          }
        }
        dispatch(setSession(serverSession));
      }, 400);
    };

    socket.on("dice-result", handleDiceResult);
    return () => socket.off("dice-result", handleDiceResult);
  }, [dispatch]);

  const handleRoll = () => {
    if (isRolling || !isMyTurn || !session.player1 || !session.player2) return;

    const diceAudio = new Audio("/sounds/dice-rolled.mp3");
    // Inside handleRoll
    if (diceAudio) {
      diceAudio.currentTime = 0; // Rewind to start
      diceAudio.play();
    }

    socket.emit("roll-dice", roomId);
  };

  // 1. The Action (Only sends the intent)
  const handleHold = () => {
    if (!session || session?.currentTurnScore === 0 || isRolling) return;

    socket.emit("player-hold", { roomId, points: session?.currentTurnScore });
    socket.on("game-over", ({ winner }) => {
      dispatch(setWinner(winner));
    });

    // dispatch(setSession(session));
  };

  // 2. The Listener (The only place setScores is called)
  useEffect(() => {
    const handleUpdate = (session) => {
      // We overwrite the local state with the Backend's absolute Truth
      dispatch(
        setScores({
          player1: session?.player1?.score,
          player2: session?.player2?.score,
        }),
      );

      // Safety check: ensure turn score is 0 for everyone after a hold

      dispatch(setSession(session));
    };

    socket.on("update-game-state", handleUpdate);
    return () => socket.off("update-game-state", handleUpdate);
  }, [dispatch]);

  return (
    <>
      <div className="absolute inset-0 z-10">
        <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={7.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          {/* Dice receives rolling state and value from parent */}
          <Dice rolling={isRolling} value={diceValue} />
        </Canvas>
      </div>

      {/* UI INTERACTION LAYER (Centered) */}
      <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-20 z-20">
        <div className="flex flex-col justify-center items-center gap-5 pointer-events-auto">
          <div className="status-bar">
            {/* 4. DYNAMIC UI MESSAGING */}
            {!session?.player2 ? (
              <p className="text-black font-bold animate-pulse uppercase">
                Waiting for Player...
              </p>
            ) : isMyTurn ? (
              <p className="text-black font-bold animate-pulse uppercase">
                Your turn!
              </p>
            ) : (
              <p className="text-black font-bold animate-pulse uppercase">
                Opponent is rolling...
              </p>
            )}
          </div>

          {isMyTurn && (
            <RollAndHoldButtons
              onRoll={handleRoll}
              onHold={handleHold}
              isRolling={isRolling}
              // currentTurnScore={currentTurnScore}
              disabled={!isMyTurn}
            />
          )}
        </div>
      </div>
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 flex flex-col justify-center text-center item-center text-3xl mb-2 size-16 ${diceValue === 1 ? "text-red-500 bg-red-50" : "text-black bg-white"}  font-semibold rounded-full`}
      >
        <p className={`${techMono.className}`}>
          {session?.currentTurnScore || 0}
        </p>
      </div>
    </>
  );
}
