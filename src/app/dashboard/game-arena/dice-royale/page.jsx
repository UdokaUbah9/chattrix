"use client";
import { useEffect, useRef, useState } from "react";
import DiceRoyale from "@/components/games/dice-royale/DiceRoyale";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "@/utils/socket";
import {
  clearGame,
  setGameIntro,
  setSession,
  setShowVictory,
  setWinner,
} from "@/store/authSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import onHandleExit from "@/utils/handleGameExit";

export default function Page() {
  const { roomId, showVictory, winner, user, isGameIntro, session } =
    useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const wallpaperRef = useRef();

  useGSAP(() => {
    if (isGameIntro) {
      gsap.to(wallpaperRef.current, {
        opacity: 0,
        duration: 1,
        delay: 4, // Wait 4 seconds before fading
        ease: "power2.inOut",
      });
    }
  }, [isGameIntro]);

  useEffect(() => {
    if (!roomId) {
      router.replace("/dashboard");
    }
  }, [roomId, router]);
  // Consolidate into ONE effect to avoid conflicting logic
  useEffect(() => {
    const handleOpponentStatus = (data) => {
      if (data?.isReconnecting) return;

      toast.dismiss("recon");
      toast.error(data?.message || "Opponent left.");

      // This clears roomId, which triggers your Safety Guard redirect
      dispatch(clearGame());

      // Safety backup redirect
      router.replace("/dashboard");
    };

    socket.on("opponent-left", handleOpponentStatus);
    return () => socket.off("opponent-left", handleOpponentStatus);
  }, [dispatch, router]);

  /////////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (roomId) {
      // Tell the server "I'm back!" so it puts this new socket connection
      // into the correct room for broadcasts.
      socket.emit("join-room", roomId);
    }
    setTimeout(() => dispatch(setGameIntro(false)), 5000);
  }, [roomId, dispatch]);

  useEffect(() => {
    if (socket && roomId && user?._id) {
      // Every time the socket connects (including refresh), sync up
      socket.emit("rejoin-game", { roomId, userId: user._id });
    }
  }, [user, roomId]);

  useEffect(() => {
    const onGameOver = ({ session, winner }) => {
      // console.log("🏆 Game Over received:", winner.username);
      dispatch(setSession(session));
      dispatch(setWinner(winner)); // Pass the whole object if your slice handles it, or winner.username
      dispatch(setShowVictory(true));
    };

    socket.on("game-over", onGameOver);

    return () => {
      socket.off("game-over", onGameOver);
    };
  }, [dispatch]);

  // You would trigger this when your socket sends 'game-over'
  // For now, let's keep the logic ready
  return (
    <main className="relative min-h-screen overflow-hidden">
      {isGameIntro && (
        <div
          className="fixed inset-0 z-999 h-screen w-screen flex items-center justify-center bg-[#4a3f3a]"
          ref={wallpaperRef}
        >
          <Image
            src="/dice-wallpaper.jpg" // The one with Dice-Royale 2026
            alt="Dice Royale Intro"
            fill
            className="object-contain"
            priority
          />
          {/* Optional: Add a subtle loading spinner or "Get Ready" text */}
          <div className="absolute bottom-20 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white font-black mt-4 tracking-[0.5em] uppercase">
              Loading Arena...
            </p>
          </div>
        </div>
      )}
      <div
        className={`transition-all duration-700 ${showVictory ? "blur-md scale-95" : ""}`}
      >
        <DiceRoyale />
      </div>

      {showVictory && winner && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center">
          {/* 2A: The Transparent Video (Paper Poof) */}
          <video
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          >
            <source src="/videos/victory-output.webm" type="video/webm" />
          </video>

          {/* 2B: The Typography Layer */}
          <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-500 w-full max-w-[360px]">
            {/* Crown Icon or Emoji */}
            <span className="text-4xl mb-4 drop-shadow-lg">👑</span>

            <h1 className="text-5xl text-black italic uppercase tracking-tighter">
              Winner!
            </h1>

            <p className="text-black text-3xl font-bold mt-2 uppercase tracking-widest animate-pulse">
              {winner.username}
            </p>
            {/* Action Buttons */}
            <div className="flex gap-4 mt-12">
              {/* <button
                onClick={""}
                className="px-8 py-3 bg-yellow-400 font-black rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg"
              >
                PLAY AGAIN
              </button> */}
              <button
                onClick={() => onHandleExit(dispatch, router, roomId, socket)}
                className="px-8 py-3 bg-yellow-400 font-black rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg"
              >
                EXIT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Temporary button to test the "Poof" */}
      {!winner && (
        // <button
        //   onClick={() => onHandleExit(dispatch, router, roomId, socket)}
        //   className="fixed bottom-4 left-4 z-50 px-2 py-1 font-bold text-red-100 bg-red-600 border-2 rounded-lg uppercase"
        // >
        //   Quit Game
        // </button>
        <button
          onClick={() => onHandleExit(dispatch, router, roomId, socket)}
          className="fixed bottom-4 left-4 z-50 px-2 py-1 font-bold text-red-100 bg-red-600 border-red-700 border-2  rounded-lg uppercase text-xs"
        >
          Quit Game
        </button>
      )}
    </main>
  );
}
