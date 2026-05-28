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
  const successSoundRef = useRef(null);

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
  } = useSelector((store) => store.auth);

  // Safely initialize audio instance on client-side mount
  useEffect(() => {
    successSoundRef.current = new Audio("/sounds/points-stolen.mp3");
  }, []);

  useGSAP(() => {
    if (isGameIntro) {
      gsap.to(wallpaperRef.current, {
        opacity: 0,
        duration: 1,
        delay: 4,
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

  useEffect(() => {
    dispatch(setScrambleWord(""));
    dispatch(setGameTimer(null));
    dispatch(setGameStatus(""));
    if (!roomId || !user?._id) return;

    socket.emit("join-room", roomId);
    socket.emit("rejoin-game", { roomId, userId: user._id });

    const introTimeout = setTimeout(() => {
      dispatch(setGameIntro(false));
      socket.emit("player-ready-in-arena", roomId);
    }, 5000);

    return () => clearTimeout(introTimeout);
  }, [roomId, user?._id, dispatch]);

  useEffect(() => {
    if (isHydrated && !roomId) {
      router.replace("/dashboard");
    }
  }, [roomId, router, isHydrated]);

  useEffect(() => {
    if (!socket) return;

    socket.on("word-ready", ({ scrambledWord, timeLeft }) => {
      dispatch(setGameTimer(timeLeft));
      dispatch(setScrambleWord(scrambledWord));
    });

    socket.on("timer-update", (time) => {
      dispatch(setGameTimer(time));
    });

    socket.on("correct-guess", (data) => {
      if (successSoundRef.current) {
        successSoundRef.current.currentTime = 0;
        successSoundRef.current.play().catch(() => {});
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
    <main className="relative w-full h-screen  flex flex-col bg-slate-50 overflow-hidden select-none">
      {isGameIntro && (
        <div
          className="fixed inset-0 z-[999] h-screen w-screen flex items-center justify-center bg-black"
          ref={wallpaperRef}
        >
          <Image
            src="/neon-strike.jpg"
            alt="World Strike Intro"
            fill
            className="object-contain"
            priority
          />
          <div className="absolute bottom-20 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white font-black mt-4 tracking-wide uppercase">
              Loading Arena...
            </p>
          </div>
        </div>
      )}

      {/* Background Graphic Watermark */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply">
        <Image
          src="/lamp2.jpg"
          alt="lamp Background"
          fill
          priority
          className="object-cover object-center"
        />
      </div>

      {/* PRIMARY LAYOUT FLOW CONTROLLER */}
      <div
        className={`relative z-10 flex flex-col w-full h-full max-w-md mx-auto transition-all duration-700 
          ${showVictory ? "blur-xs scale-95 opacity-50 pointer-events-none" : ""}`}
      >
        {/* UPPER PANEL: Info metrics & Word Box (45% viewport height space) */}
        <header className="w-full flex flex-col p-4 pt-3 h-[45vh] sm:h-[48vh] justify-between shrink-0 z-50">
          <Versus />

          <div className="flex flex-col items-center justify-center flex-1 my-auto gap-4">
            {/* FIXED: The text is now enclosed beautifully inside ONE single h2 element */}
            <h2
              ref={gameStatusTextRef}
              className={`text-center tracking-widest font-black uppercase max-w-full break-words px-2 transition-colors
                ${gameTimer === 0 ? "italic text-base text-zinc-600" : `text-4xl sm:text-5xl ${russoOne.className}`} 
                ${gameTimer <= 15 && gameTimer > 0 ? "text-red-500 animate-pulse" : "text-purple-600"}`}
            >
              {!showVictory
                ? gameTimer === 0
                  ? gameStatus
                  : scrambleWord
                : ""}
            </h2>

            {/* Timer Layout Hub Frame */}
            <div
              className={`${techMono.className} ${gameTimer <= 15 ? "text-red-500 animate-pulse" : "text-emerald-700"} 
                font-black text-2xl sm:text-3xl flex items-center gap-2 bg-white/60 backdrop-blur-xs py-1 px-4 rounded-full border border-white/40`}
            >
              <div className="relative w-8 h-8">
                <Image
                  src="/watch.png"
                  alt="Stop Watch"
                  fill
                  className="object-contain"
                />
              </div>
              <span>{gameTimer ?? "--"}</span>
            </div>
          </div>
        </header>

        {/* LOWER PANEL: Dedicated scroll viewport box window context for the GuessInput stream */}
        <div className="w-full h-[55vh] sm:h-[52vh] relative shrink-0 z-50">
          <GuessInput />
        </div>
      </div>

      {/* VICTORY OVERLAY CONTROLLERS */}
      {showVictory && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs">
          <video
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          >
            <source src="/videos/victory-output.webm" type="video/webm" />
          </video>

          <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-500 w-full max-w-[320px] p-6 bg-white border-4 border-black rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-4xl mb-2 drop-shadow-lg">👑</span>
            <h1 className="text-4xl font-black text-black italic uppercase tracking-tighter">
              Winner!
            </h1>
            <p className="text-purple-600 text-2xl font-black mt-1 uppercase tracking-widest animate-pulse">
              {winner?.username}
            </p>

            <div className="flex gap-4 mt-8 w-full">
              <button
                onClick={() => onHandleExit(dispatch, router, roomId, socket)}
                className="w-full py-3 text-white bg-red-600 font-bold rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase text-sm"
              >
                Exit Arena
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
