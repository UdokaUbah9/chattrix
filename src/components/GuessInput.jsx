"use client";
import { useEffect, useRef, useState } from "react";
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
    const handleExit = () => {
      dispatch(clearGame());
      router.replace("/dashboard");
    };

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
    // CRITICAL FIX: Dropped fixed positioning properties completely.
    // It now matches the 100% height boundaries of its upper flex container hub.
    <div className="absolute inset-0 w-full h-full p-4 bg-white/80 backdrop-blur-md rounded-t-[2.5rem] border-t-4 border-black flex flex-col justify-between shadow-[0_-8px_30px_rgb(0,0,0,0.06)]">
      {/* SCROLLABLE GUESS FLOW LIST */}
      <div className="flex-1 overflow-y-auto pr-1 mb-3 flex flex-col gap-3 [scrollbar-width:none] [-ms-overflow-style:none]">
        {guessedList && guessedList.length > 0 ? (
          guessedList.map((data, index) => {
            const isMe = data.playerRole === playerRole;
            return (
              <div
                key={index}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <span className="text-[10px] font-bold text-zinc-400 mb-0.5 tracking-wider uppercase">
                  {data.player?.id === user?._id
                    ? "YOU"
                    : data.player?.username?.split(" ")[0]}
                </span>

                <div
                  className={`flex items-end gap-2 max-w-[85%] ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className="relative size-8 shrink-0 ring-2 ring-purple-400 rounded-full overflow-hidden shadow-xs bg-zinc-100">
                    <Image
                      src={data.player?.avatar || "/default-avatar.png"}
                      fill
                      alt="avatar"
                      className="object-cover"
                    />
                  </div>
                  <div
                    className={`px-3 py-2 text-sm font-medium tracking-wide shadow-xs border border-black/5
                      ${
                        isMe
                          ? "bg-purple-500 text-white rounded-2xl rounded-br-none"
                          : "bg-zinc-100 text-zinc-900 rounded-2xl rounded-bl-none"
                      }`}
                  >
                    {data.word}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex-1 flex items-center justify-center opacity-30 italic text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            Send a guess to begin...
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* INPUT INTERACTION CONTROL BLOCK */}
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col gap-2 shrink-0 pt-2 border-t border-zinc-100"
      >
        <div className="relative w-full">
          <input
            type="text"
            value={guessedValue}
            onChange={(e) => setGuessedValue(e.target.value)}
            placeholder="UNSCRAMBLE WORD..."
            className="w-full px-4 py-3 pr-20 text-xs font-bold tracking-widest bg-zinc-50 border-2 border-zinc-300 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all uppercase placeholder:text-zinc-400 text-zinc-800"
            autoFocus
          />

          {!winner && (
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 font-black text-white bg-emerald-600 rounded-lg text-[10px] tracking-wider uppercase hover:bg-emerald-700 transition-colors"
            >
              Enter
            </button>
          )}
        </div>

        {!winner && (
          <button
            type="button"
            onClick={() => onHandleExit(dispatch, router, roomId, socket)}
            className="w-fit self-start px-3 py-1 font-bold text-zinc-400 hover:text-red-500 rounded-md uppercase text-[10px] tracking-wider transition-colors"
          >
            Quit Match
          </button>
        )}
      </form>
    </div>
  );
}
