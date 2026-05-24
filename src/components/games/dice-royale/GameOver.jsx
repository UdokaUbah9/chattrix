"use client";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { socket } from "@/utils/socket";

export default function GameOver() {
  // FIX 1: Start as 'null', not 'true'. If it's true, the overlay shows immediately.
  const [winnerData, setWinnerData] = useState(true);

  useEffect(() => {
    // FIX 2: Place the listener INSIDE useEffect to prevent multiple listeners
    const handleGameOver = (data) => {
      console.log("Game Over received:", data);
      setWinnerData(data);

      // The "Paper Poof" Celebration
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration; // FIX 3: Must be Date.now() + duration
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 9999,
      };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    };

    socket.on("game-over", handleGameOver);

    // Cleanup listener when component unmounts
    return () => socket.off("game-over", handleGameOver);
  }, []);

  // If no winner yet, don't render the overlay
  if (!winnerData) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
      <div className="text-center p-8 rounded-3xl border-4 border-yellow-400 bg-white/5 shadow-[0_0_50px_rgba(250,204,21,0.3)]">
        <h1 className="text-7xl font-black text-yellow-400 mb-2 italic tracking-tighter uppercase drop-shadow-[0_5px_0_rgba(0,0,0,1)]">
          VICTORY!
        </h1>
        <p className="text-white text-3xl font-bold mb-6">
          {winnerData.winnerName || "Player"} dominates the board
        </p>

        <div className="flex gap-8 justify-center items-center mb-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm uppercase">Francis</p>
            <p className="text-white text-4xl font-mono">
              {winnerData?.finalScores?.player1}
            </p>
          </div>
          <div className="text-yellow-400 text-2xl font-black">VS</div>
          <div className="text-center">
            <p className="text-gray-400 text-sm uppercase">Udoka</p>
            <p className="text-white text-4xl font-mono">
              {winnerData?.finalScores?.player2}
            </p>
          </div>
        </div>

        <button
          onClick={() => setWinnerData(null)}
          className="bg-yellow-400 text-black px-10 py-4 rounded-full font-black text-xl hover:bg-yellow-300 hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(250,204,21,0.5)]"
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}
