"use client";
import React, { useRef } from "react";
import Image from "next/image";
import { ShieldCheck, Calendar, Trophy, XCircle } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function UserProfile({ user, onClose, profilePicture }) {
  const containerRef = useRef();
  const contentRef = useRef();

  useGSAP(() => {
    const tl = gsap.timeline();
    // Fade in overlay
    tl.to(containerRef.current, { opacity: 1, duration: 0.3 });
    // Scale up content from center
    tl.fromTo(
      contentRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" },
      "-=0.1",
    );
  }, []);

  const handleClose = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.2,
      onComplete: onClose,
    });
  };

  if (!user) return null;

  return (
    <div
      ref={containerRef}
      // CRITICAL FIX: Changed to 'fixed', added 'overflow-y-auto' and vertical padding 'py-10'
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-10 overflow-y-auto opacity-0"
      onClick={handleClose}
    >
      <div
        ref={contentRef}
        // CRITICAL FIX: Removed rigid margins internally, allowed margins globally for safety
        className="w-full max-w-sm bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center">
          {/* AVATAR - Responsive heights prevent vertical squeezing */}
          <div className="relative w-36 h-36 xs:w-40 xs:h-40 md:w-48 md:h-48 rounded-full ring-4 ring-yellow-400 p-1 mb-4 sm:mb-6 shrink-0">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-zinc-100">
              <Image
                src={user.avatar || profilePicture || "/default-dp.png"}
                fill
                className="object-cover"
                alt="user avatar"
                priority
                sizes="(max-width: 768px) 160px, 192px"
              />
            </div>
            <div className="absolute bottom-2 right-2 xs:bottom-3 xs:right-3 size-6 xs:size-7 bg-green-500 border-4 border-white rounded-full z-20" />
          </div>

          {/* USER INFO */}
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 lowercase italic text-center break-all">
            @{user.username}
          </h2>
          <p className="text-zinc-400 font-medium mb-4 sm:mb-6 text-xs sm:text-sm text-center break-all">
            {user.email}
          </p>

          {/* WINS & LOSSES GRID */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full mb-4 sm:mb-6">
            <div className="bg-green-50 border border-green-100 p-3 sm:p-4 rounded-3xl flex flex-col items-center justify-center">
              <Trophy className="text-green-600 mb-1" size={22} />
              <span className="text-xl sm:text-2xl font-black text-green-900">
                {user?.wins || 0}
              </span>
              <span className="text-[10px] uppercase tracking-tighter font-bold text-green-600">
                Wins
              </span>
            </div>

            <div className="bg-red-50 border border-red-100 p-3 sm:p-4 rounded-3xl flex flex-col items-center justify-center">
              <XCircle className="text-red-600 mb-1" size={22} />
              <span className="text-xl sm:text-2xl font-black text-red-900">
                {user?.losses || 0}
              </span>
              <span className="text-[10px] uppercase tracking-tighter font-bold text-red-600">
                Losses
              </span>
            </div>
          </div>

          {/* SECONDARY INFO */}
          <div className="w-full space-y-2.5 sm:space-y-3 bg-zinc-50 p-4 sm:p-5 rounded-3xl sm:rounded-4xl border border-zinc-100 mb-5 sm:mb-6">
            <div className="flex items-center gap-3 text-zinc-600">
              <ShieldCheck size={18} className="text-yellow-600 shrink-0" />
              <span className="text-xs font-bold">Verified Chattrix User</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-600">
              <Calendar size={18} className="text-yellow-600 shrink-0" />
              <span className="text-xs font-bold">
                Joined{" "}
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "Recent"}
              </span>
            </div>
          </div>

          {/* ACTIONS */}
          <button
            onClick={handleClose}
            className="w-full py-3.5 sm:py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-zinc-200 shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
