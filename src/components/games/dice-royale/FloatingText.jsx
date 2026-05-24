"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Share_Tech_Mono } from "next/font/google";
import { useRef } from "react";
import { useSelector } from "react-redux";

const techMono = Share_Tech_Mono({ weight: "400", subsets: ["latin"] });

export function FloatingText({ trigger, targetPlayer, isMyTurn }) {
  const textRef = useRef(null);
  const { session } = useSelector((store) => store.auth);

  useGSAP(() => {
    if (trigger && session?.stealHappenned) {
      gsap.fromTo(
        textRef.current, // Match this to your class
        { opacity: 0, y: 0, scale: 0.5 },
        {
          opacity: 1,
          y: 45,
          scale: 1.3,
          duration: 0.8,
          ease: "power1.inOut",
          // Reset after animation
          onComplete: () => gsap.set(textRef.current, { opacity: 0 }),
        },
      );
    }
  }, [trigger]); // Re-run when trigger flips to true

  // 2. Simplified Logic: Who is currently rolling?
  const p1IsActive = session?.player1?.active;

  // If P1 is active, they are the "Stealer" (+6). P2 is the "Victim" (-6).
  let text = "";
  if (targetPlayer === "player1") {
    text = p1IsActive ? "+6" : "-6";
  } else {
    text = p1IsActive ? "-6" : "+6";
  }

  const isPositive = text.includes("+");

  if (!trigger || !session?.stealHappenned) return null;

  return (
    <div
      ref={textRef}
      className={`${techMono.className} absolute left-1/2 -translate-x-1/2 font-bold text-5xl
      ${isPositive ? "text-green-600" : "text-red-600"}`}
    >
      {text}
    </div>
  );
}
