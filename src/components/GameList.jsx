"use client";
import React, { use, useEffect, useRef } from "react";
import gsap from "gsap";
import { Swords, Dices, Ghost, Target, X, Trophy } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { socket } from "@/utils/socket";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const GAMES = [
  {
    id: "words",
    name: "Words Strike",
    path: "words-strike",
    icon: Target,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    description: "Unscramble words and race to reach 100 points.",
  },
  {
    id: "luck",
    name: "Dice Royale",
    path: "dice-royale",
    icon: Dices,
    color: "text-green-400",
    bg: "bg-green-400/10",
    description: "Roll the highest numbers to hit the 60-point target.",
  },
  {
    id: "duo",
    name: "Duel Masters",
    icon: Swords,
    color: "text-red-400",
    bg: "bg-red-400/10",
    locked: true,
    description: "1v1 Combat. Coming soon.",
  },
  {
    id: "hunt",
    name: "Ghost Hunter",
    icon: Ghost,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    locked: true,
    description: "Find them before they find you.",
  },
];

export default function GameList({ isOpen, onClose }) {
  const params = useParams();
  const { userId: receiverId } = params;
  const { user, activeChat, onlineUserList } = useSelector(
    (store) => store.auth,
  );
  const containerRef = useRef(null);

  useGSAP(
    () => {
      if (isOpen) {
        const tl = gsap.timeline();

        tl.to(containerRef.current, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.2)",
          // This ensures the hardware acceleration is used
          force3D: true,
        });

        tl.fromTo(
          ".game-item",
          { x: 30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.3, stagger: 0.1, ease: "power2.out" },
          "-=0.3",
        );
      }
    },
    { dependencies: [isOpen], scope: containerRef },
  );
  useEffect(() => {
    // 1. If backend says NO: Show the validation error
    const handleChallengeError = (data) => {
      toast.error(data.message);
    };

    // 2. If backend says YES: Only now do we show the success toast!
    const handleChallengeSentSuccess = (data) => {
      toast.success(`${data.gameName} challenge sent`);
    };

    socket.on("challenge-error", handleChallengeError);
    socket.on("challenge-sent-success", handleChallengeSentSuccess);

    return () => {
      socket.off("challenge-error", handleChallengeError);
      socket.off("challenge-sent-success", handleChallengeSentSuccess);
    };
  }, []);

  const onSelect = function (game) {
    if (game.locked) return toast.error("Game is currently locked!");

    const challengePayload = {
      gameId: game.id,
      gameName: game.name,
      gamePath: game.path,
      description: game.description,
      gameColor: game.color,
      gameBg: game.bg,
      sender: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
      },
      receiverId: receiverId,
    };

    // Fast-track client offline check before talking to backend
    if (onlineUserList.includes(String(activeChat?.receiverId))) {
      // Fire it down the pipe. The backend will choose to acknowledge or reject this.
      socket.emit("send-challenge", challengePayload);
    } else {
      toast.error(`${activeChat?.username || "User"} is Offline`);
    }
  };

  // Rendering logic placeholder (keep your existing return statement here)

  //
  if (!isOpen) return null;
  return (
    <div
      ref={containerRef}
      className="absolute bottom-24 left-4 right-4 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-4xl p-5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] z-60"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-5 px-1">
        <div className="flex items-center gap-2">
          <Trophy size={22} className="text-purple-200" />
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
            Choose Challenge
          </p>
        </div>
        <button
          onClick={() => onClose(".game-item", containerRef.current)}
          className="p-1.5 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white transition-all cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Grid of Games */}
      <div className="grid grid-cols-1 gap-2">
        {GAMES.map((game) => (
          /* The key MUST go on the outermost element of the map (the div) */
          <div key={game.id}>
            <button
              disabled={game.locked}
              onClick={() => {
                if (!game.locked) {
                  onSelect(game);
                  onClose(".game-item", containerRef.current);
                }
              }}
              className={`opacity-0 game-item group w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all active:scale-[0.98] 
              ${
                game.locked
                  ? "bg-zinc-900/50 border-white/5 grayscale cursor-not-allowed"
                  : "bg-white/5 border-white/5 hover:border-[#7B61FF]/40 hover:bg-[#7B61FF]/5 cursor-pointer"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-2.5 rounded-xl ${game.bg} ${game.color} ${
                    !game.locked && "group-hover:scale-110"
                  } transition-transform duration-300`}
                >
                  <game.icon size={22} />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-bold text-zinc-100 uppercase tracking-tight">
                    {game.name}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">
                    {game.locked ? "Unlocking Soon..." : game.description}
                  </span>
                </div>
              </div>

              {!game.locked && (
                <div className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all text-[#7B61FF] font-black text-xs uppercase italic">
                  Play Now →
                </div>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
