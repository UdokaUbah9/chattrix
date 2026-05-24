"use client";
import GuessInput from "@/components/GuessInput";
import Image from "next/image";
import Versus from "@/components/Versus";
import { Russo_One, Share_Tech_Mono } from "next/font/google";
import { useDispatch, useSelector } from "react-redux";
import {
  clearGame,
  setGameIntro,
  setGameStatus,
  setGameTimer,
  setScores,
  setScrambleWord,
  setShowVictory,
  setWinner,
} from "@/store/authSlice";
import { useEffect, useRef } from "react";
import { socket } from "@/utils/socket";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import toast from "react-hot-toast";
import onHandleExit from "@/utils/handleGameExit";

const techMono = Share_Tech_Mono({ weight: "400", subsets: ["latin"] });
const russoOne = Russo_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function GameArena() {
  const dispatch = useDispatch();
  const router = useRouter();
  const wallpaperRef = useRef();
  const gameStatusTextRef = useRef();

  const {
    isGameIntro,
    gameTimer,
    scrambleWord,
    user,
    roomId,
    winner,
    showVictory,
    gameStatus,
    isHydrated,
    playerRole,
  } = useSelector((store) => store.auth);

  ////////////////////////////

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

  useGSAP(() => {
    gsap.fromTo(
      gameStatusTextRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
    );
  }, [scrambleWord, gameTimer === 0]);
  // GameArena.js

  // 1. HANDSHAKE & INTRO LOGIC
  useEffect(() => {
    dispatch(setScrambleWord(""));
    dispatch(setGameTimer(null)); // or 60 if you want a placeholder
    dispatch(setGameStatus(""));
    if (!roomId || !user?._id) return;

    // Join the room and sync the socket
    socket.emit("join-room", roomId);
    socket.emit("rejoin-game", { roomId, userId: user._id });

    // Start the 5-second intro
    const introTimeout = setTimeout(() => {
      dispatch(setGameIntro(false));

      // Signal the server that we are ready to see the word and start the clock
      // Using 'player-ready-in-arena' to match your server listener
      socket.emit("player-ready-in-arena", roomId);
    }, 5000);

    return () => clearTimeout(introTimeout);
  }, [roomId, user?._id, dispatch]);

  // 2. SAFETY REDIRECT
  useEffect(() => {
    if (isHydrated && !roomId) {
      router.replace("/dashboard");
    }
  }, [roomId, router, isHydrated]);

  // 3. SOCKET LISTENERS (The "Receiver" Hub)
  useEffect(() => {
    if (!socket) return;

    socket.on("word-ready", ({ scrambledWord, timeLeft }) => {
      dispatch(setGameTimer(timeLeft));
      dispatch(setScrambleWord(scrambledWord));
    });

    socket.on("timer-update", (time) => {
      dispatch(setGameTimer(time));
    });

    const successSound =
      typeof window !== "undefined"
        ? new Audio("/sounds/points-stolen.mp3")
        : null;

    // 2. Inside your socket listener setup:
    socket.on("correct-guess", (data) => {
      if (successSound) {
        successSound.currentTime = 0;
        successSound.play();
      }
      dispatch(
        setScores({
          player1: data.player1Score,
          player2: data.player2Score,
        }),
      );
    });

    socket.on("new-round", (data) => {
      dispatch(setGameTimer(data.timeLeft));
      dispatch(setScrambleWord(data.scrambledWord));
      dispatch(setGameStatus(data.message));
    });

    socket.on("game-over", ({ winner }) => {
      dispatch(setShowVictory(true));
      dispatch(setWinner(winner));
      dispatch(setGameTimer(0));
    });

    socket.on("opponent-left", (data) => {
      toast.error(data?.message || "Opponent left.");
      dispatch(clearGame());
      router.replace("/dashboard");
    });

    return () => {
      socket.off("word-ready");
      socket.off("timer-update");
      socket.off("correct-guess");
      socket.off("new-round");
      socket.off("game-over");
      socket.off("opponent-left");
    };
  }, [dispatch, router]);

  return (
    <main className="relative flex flex-col p-4 overflow-hidden">
      {isGameIntro && (
        <div
          className="fixed inset-0 z-999 h-screen w-screen flex items-center justify-center bg-black "
          ref={wallpaperRef}
        >
          <Image
            src="/neon-strike.jpg" // The one with Dice-Royale 2026
            alt="Dice Royale Intro"
            fill
            className="object-contain"
            priority
          />
          {/* Optional: Add a subtle loading spinner or "Get Ready" text */}
          <div className="absolute bottom-20 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white font-black mt-4 tracking-wide uppercase">
              Loading Arena...
            </p>
          </div>
        </div>
      )}

      <div
        className={`flex flex-col p-4 transition-all duration-700 ${showVictory && "h-screen"}  w-full 
          ${showVictory && "blur-xs scale-95 opacity-50"}`}
      >
        <Image
          src="/lamp2.jpg"
          alt="lamp Background"
          width={400}
          height={400}
          priority
          // 'absolute' pulls it out of the flow so it doesn't push content
          // 'inset-0' and 'w-full h-full' make it cover the parent
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-65 border-transparent"
        />
        <header className="flex justify-between z-50 ">
          <Versus />
        </header>
        <div className="h-[200px] w-full z-50 text-center">
          <div className="flex flex-col gap-12 items-center">
            <p
              className={`text-center tracking-widest font-bold  mt-14 uppercase ${gameTimer === 0 ? "italic text-lg" : `text-5xl ${russoOne.className}`} ${gameTimer <= 15 ? "text-red-500 animate-pulse" : "text-purple-500"}`}
              ref={gameStatusTextRef}
            >
              {!showVictory
                ? gameTimer === 0
                  ? gameStatus
                  : scrambleWord
                : ""}
            </p>
            <div
              className={`${techMono.className} ${gameTimer <= 15 ? "text-red-500 animate-pulse" : "text-green-700"} font-bold text-4xl flex items-center gap-2`}
            >
              <div className="relative w-12 h-12">
                {/* Red border helps you see the box */}
                <Image
                  src="/watch.png"
                  alt="Stop Watch"
                  fill
                  className="object-contain object-center"
                />
              </div>

              <span className="font-bold">{gameTimer}</span>
            </div>
          </div>

          {/* <footer className="bg-purple-100  p-0 w-full flex flex-col gap-5 mt-8"> */}
          <GuessInput />
          {/* </footer> */}
        </div>
      </div>

      {showVictory && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
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
                className="px-8 py-3 text-red-100 bg-red-600 rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg"
              >
                EXIT
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
