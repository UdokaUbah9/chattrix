"use client";
import { Share_Tech_Mono } from "next/font/google";
import Image from "next/image";
import React from "react";
import { FloatingText } from "./games/dice-royale/FloatingText";
import { useSelector } from "react-redux";

const techMono = Share_Tech_Mono({ weight: "400", subsets: ["latin"] });

function Versus({ showSteal, isMyTurn }) {
  const { scores, session, user } = useSelector((store) => store.auth);

  const p1 = session.player1;
  const p2 = session.player2;
  // Assuming 'user' is your logged-in user object from Redux/State
  const p1Label =
    session?.player1?.id === user?._id ? "YOU" : session?.player1?.username;
  const p2Label =
    session?.player2?.id === user?._id ? "YOU" : session?.player2?.username;

  return (
    <>
      <div className="flex flex-col justify-center gap-1 text-center items-center ">
        <p className="text-black text-lg text-center font-semibold uppercase">
          {p1Label?.split(" ")[0]}
        </p>
        <div className="relative size-9 shrink-0 ring-2 ring-yellow-400/50 rounded-full">
          <Image
            src={p1.avatar}
            fill
            alt={`profile picture`}
            className="rounded-full object-cover"
          />
          {/* Optional: Online Status Indicator */}
          <span className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white rounded-full"></span>
        </div>
        <div className="relative">
          <FloatingText
            trigger={showSteal}
            // session={session}
            targetPlayer="player1"
            isMyTurn={isMyTurn}
          />
          <p
            className={`${techMono.className} text-black font-bold text-3xl text-center`}
          >
            {scores?.player1 || 0}
          </p>
        </div>
      </div>

      <p
        className={`${techMono.className} text-yellow-400 text-3xl font-bold
  -rotate-12 select-none
  drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] 
  filter brightness-110 saturate-150`}
      >
        vs
      </p>

      <div className="flex flex-col justify-center gap-1 text-center items-center">
        <p className="text-black font-semibold text-lg text-center uppercase">
          {p2Label?.split(" ")[0]}
        </p>
        <div className="relative size-9 shrink-0 ring-2 ring-yellow-400/50 rounded-full">
          <Image
            src={p2.avatar}
            fill
            alt={`profile picture`}
            className="rounded-full object-cover"
          />
          {/* Optional: Online Status Indicator */}
          <span className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white rounded-full"></span>
        </div>
        <div className="relative">
          <FloatingText
            trigger={showSteal}
            // session={session}
            targetPlayer="player2"
            isMyTurn={isMyTurn}
          />
          <p
            className={`${techMono.className} text-black font-bold text-5xl text-center`}
          >
            {scores?.player2 || 0}
          </p>
        </div>
      </div>
    </>
  );
}

export default Versus;
