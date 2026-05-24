"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useSelector } from "react-redux";

// Asset Imports
import frame1 from "../../public/frame1.png";
import gamePad from "../../public/game-pad.png";
import chatBubbles from "../../public/chat-bubbles.png";
import videoClip from "../../public/video-clip.png";
import connect from "../../public/connect.png";

import Smile from "../components/Smile";
import SmileLoader from "@/components/SmileLoader";

export default function Home() {
  const router = useRouter();
  const containerRef = useRef(null);
  const { isHydrated, user } = useSelector((state) => state.auth);
  const [zoomingIn, setZoomingIn] = useState(false);

  useEffect(() => {
    if (isHydrated && user) {
      router.replace("/dashboard/chat");
    }
  }, [user, isHydrated, router]);

  // 1. ANIMATION LOGIC
  useGSAP(
    () => {
      if (!zoomingIn) {
        // Rotate the entire group
        gsap.to(".orbit-group", {
          rotation: 360,
          duration: 25,
          repeat: -1,
          ease: "none",
        });

        // Counter-rotate frames to stay upright
        gsap.to(".individual-frame", {
          rotation: -360,
          duration: 25,
          repeat: -1,
          ease: "none",
        });
      }
    },
    { scope: containerRef, dependencies: [zoomingIn] },
  );

  const onZoom = () => {
    setZoomingIn(true);
    const tl = gsap.timeline();

    tl.to(".orbit-group", {
      opacity: 0,
      scale: 0.5,
      duration: 0.6,
      ease: "power2.inOut",
    })
      .to(
        ".main-hero",
        {
          scale: 50,
          duration: 0.3,
          ease: "power4.in",
        },
        "+=0.2",
      )
      .to(
        ".cta-section",
        {
          opacity: 0,
          duration: 0.5,
        },
        "-=0.9",
      )
      .call(
        () => {
          router.replace("/signup");
        },
        null,
        "-=0.5",
      ); // Moves the "call" 0.3s earlier in the tim
  };

  if (!isHydrated) return <SmileLoader />;
  if (user) return null;

  const floatingFrames = [
    { src: gamePad, size: 58 },
    { src: chatBubbles, size: 65 },
    // { src: connect, size: 65 },
    // { src: videoClip, size: 70 },
  ];

  const RADIUS = 135; // Controls how far out they orbit

  return (
    <div
      className="min-h-screen bg-yellow-300 overflow-hidden select-none flex flex-col items-center relative"
      ref={containerRef}
    >
      <Smile isFocused />

      {/* Hero Wrapper: This keeps everything aligned to one center point */}
      <div className="relative flex items-center justify-center w-full h-[400px]">
        {/* CENTER HERO (frame1) */}
        <div className="main-hero relative z-20 w-[140px] h-[140px] shrink-0  bg-yellow-50 rounded-full shadow-2xl shadow-purple-400 overflow-hidden">
          <div className="absolute inset-0 blur-2xl opacity-20" />
          <Image
            src={frame1}
            alt="Hero"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* ORBITING GROUP: 
            Positioned absolute center with 0 width/height 
            so children are measured from the exact middle. 
        */}
        <div className="orbit-group absolute top-1/2 left-1/2 w-0 h-0 z-10 pointer-events-none">
          {floatingFrames.map((frame, i) => {
            const angle = (i * 360) / floatingFrames.length;
            const radian = (angle * Math.PI) / 180;
            const x = Math.cos(radian) * RADIUS;
            const y = Math.sin(radian) * RADIUS;

            return (
              <div
                key={i}
                className={`individual-frame absolute flex items-center justify-center opacity-[0.7] bg-purple-300 p-1 rounded-2xl`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${frame.size}px`,
                  height: `${frame.size}px`,
                  // Centers the frame on its own coordinate
                  marginLeft: `-${frame.size / 2}px`,
                  marginTop: `-${frame.size / 2}px`,
                }}
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/20">
                  <Image
                    src={frame.src}
                    alt="User"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA SECTION */}
      <div className="cta-section text-center relative z-30 px-6">
        <h1 className="text-zinc-800 text-4xl font-bold leading-tight">
          Real Conversations. <br />
          <span className="text-purple-500 font-medium text-3xl">
            Real People.
          </span>
        </h1>
        <button
          onClick={onZoom}
          className="mt-10 bg-yellow-50 text-black font-bold py-4 px-14 rounded-full text-xl shadow-2xl active:scale-95 transition-transform cursor-pointer"
        >
          <p className="tracking-widest">Get Started</p>
        </button>
        <p className="text-md font-semibold mt-8 text-zinc-700 tracking-wide">
          Join in seconds, No pressure
        </p>
      </div>
    </div>
  );
}
