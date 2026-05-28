"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { socket } from "@/utils/socket";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { clearGame, setGuessedList } from "@/store/authSlice";
import onHandleExit from "@/utils/handleGameExit";

export default function GuessInput() {
  const { roomId, playerRole, winner, guessedList, user } = useSelector(
    (store) => store.auth,
  );
  const [guessedValue, setGuessedValue] = useState("");
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const router = useRouter();

  // Submit function handler
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedValue = guessedValue.toLowerCase().trim();
    if (!trimmedValue || !socket) return;

    socket.emit("submit-word", { roomId, word: trimmedValue, playerRole });

    setGuessedValue("");
  };

  useEffect(() => {
    if (!socket) return;

    const handleGuess = function ({ word, player, playerRole }) {
      dispatch(setGuessedList({ word, player, playerRole }));
    };
    socket.on("guessed-value", handleGuess);

    return () => socket.off("guessed-value", handleGuess);
  }, [dispatch]);

  useEffect(() => {
    const handleExit = (data) => {
      dispatch(clearGame());
      router.replace("/dashboard");
    };

    // ONLY listen for 'opponent-left' to avoid duplicates
    socket.on("opponent-left", handleExit);
    return () => {
      socket.off("opponent-left", handleExit);
    };
  }, [dispatch, router]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [guessedList?.length]);

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md mx-auto p-4 backdrop-blur-sm rounded-t-3xl flex flex-col h-[50vh] lg:h-[40vh] z-50">
      {/* 1. SCROLLABLE MESSAGE AREA */}
      {/* flex-1 makes this take all available space NOT used by the form */}
      <div className="flex-1 overflow-y-auto p-2 mb-6 flex flex-col gap-2 [scrollbar-width:none] border-t-2 border-black pb-2 rounded-2xl">
        {guessedList &&
          guessedList.length > 0 &&
          guessedList.map((data, index) => (
            <div
              key={index}
              className={`
                ${data.playerRole === playerRole ? "text-right" : "text-left"} mb-5
              `}
            >
              <p className="font-bold md:text-xs text-md mb-1 uppercase">
                {data.player.id === user._id
                  ? "YOU"
                  : data.player.username.split(" ")[0]}
              </p>
              <div
                className={`flex items-end gap-2 ${data.playerRole === playerRole ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className="relative size-7 shrink-0 ring-2 ring-yellow-400 rounded-full overflow-hidden">
                  <Image
                    src={data.player.avatar}
                    fill
                    alt="profile picture"
                    className="object-cover"
                  />
                </div>
                <p
                  className={`p-3 max-w-[70%] text-base shadow-sm rounded-2xl tracking-wide ${
                    data.playerRole === playerRole
                      ? "bg-purple-200 text-slate-900 rounded-br-none"
                      : "bg-white text-slate-900 rounded-bl-none"
                  }`}
                >
                  {data.word}
                </p>
              </div>
            </div>
          ))}
        {/* Invisible div to help with auto-scrolling if you add it later */}
        <div ref={scrollRef} />
      </div>

      {/* 2. STATIONARY FORM AREA */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 shrink-0">
        <div className="relative w-full">
          <input
            type="text"
            value={guessedValue}
            onChange={(e) => setGuessedValue(e.target.value)}
            placeholder="UNSCRAMBLE WORD..."
            className="w-full px-4 py-3 text-md tracking-widest bg-white border-3 border-purple-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
            autoFocus
          />

          {!winner && (
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 font-bold text-green-100 bg-green-600 border-2 border-green-700 rounded-lg text-xs"
            >
              ENTER
            </button>
          )}
        </div>

        {!winner && (
          <button
            onClick={() => onHandleExit(dispatch, router, roomId, socket)}
            className="w-fit px-4 py-1.5 font-bold text-red-100 bg-red-600 border-2 border-red-700 rounded-lg uppercase text-xs"
          >
            Quit Game
          </button>
        )}
      </form>
    </div>
  );
}
