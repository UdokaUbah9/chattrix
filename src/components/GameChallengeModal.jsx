"use client";
import React from "react";
import { Check, X, Gamepad2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { setIsShowChallengeModal } from "@/store/authSlice";

export default function GameChallengeModal({
  isOpen,
  challenge,
  onAccept,
  onReject,
}) {
  const dispatch = useDispatch();
  if (!isOpen || !challenge) return null;

  return (
    /* Remove fixed inset-0 to kill the backdrop; use fixed top-6 for the floating effect */
    <div className="fixed top-6 left-0 right-0 z-[9999] flex justify-center px-4 pointer-events-none">
      {/* The Notification - Added pointer-events-auto so buttons still work */}
      <div className="pointer-events-auto flex items-center gap-4 bg-white/95 backdrop-blur-md px-4 py-3 rounded-full border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] animate-in fade-in slide-in-from-top-6 duration-500">
        {/* Mini Game Icon with a soft glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-green-400/20 blur-lg rounded-full" />
          <div className="relative size-10 flex items-center justify-center bg-green-50 text-green-600 rounded-full">
            <Gamepad2 size={20} strokeWidth={2.5} />
          </div>
        </div>

        {/* Info Group */}
        <div className="flex flex-col min-w-0 pr-2">
          <p className="text-sm font-bold text-black leading-none flex items-center gap-1.5">
            {challenge.sender.username
              .split(" ")[0]
              .toLowerCase()
              .replace(/^\w/, (c) => c.toUpperCase())}
            <span className="text-[11px] text-zinc-400 font-medium lowercase">
              challenge you
            </span>
          </p>
          <p className="text-[11px] font-black uppercase text-zinc-500 tracking-tighter mt-1">
            {challenge.gameName}
          </p>
        </div>

        {/* Vertical Divider */}
        <div className="h-8 w-px bg-zinc-100" />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReject}
            className="size-9 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
          >
            <X size={18} strokeWidth={3} />
          </button>

          <button
            onClick={() => {
              dispatch(setIsShowChallengeModal(false));
              onAccept();
            }}
            className="h-9 px-5 flex items-center justify-center rounded-full bg-black text-white text-[12px] font-bold uppercase tracking-wide hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-black/10"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
