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
    <>
      {isLoading && <SmileLoader />}

      {/* 1. Swapped min-h-screen for min-h-dvh so mobile browsers don't clip the bottom layout.
        2. Added safe vertical padding (pb-8 md:pb-12) to lock in perfect bottom breathing room.
      */}
      <div
        className="min-h-dvh bg-yellow-300 overflow-y-auto overflow-x-hidden select-none flex flex-col items-center justify-between pb-8 md:pb-12 relative w-full"
        ref={containerRef}
      >
        <Smile isFocused />

        {/* Hero Wrapper: Holds the central character asset and rotating elements */}
        <div className="relative flex items-center justify-center w-full h-[360px] md:h-[400px] shrink-0 mt-4">
          {/* CENTER HERO (frame1) */}
          <div className="main-hero relative z-20 w-[130px] h-[130px] md:w-[140px] md:h-[140px] shrink-0 bg-yellow-50 rounded-full shadow-2xl shadow-purple-400 overflow-hidden">
            <div className="absolute inset-0 blur-2xl opacity-20" />
            <Image
              src={frame1}
              alt="Hero"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* ORBITING GROUP */}
          <div className="orbit-group absolute top-1/2 left-1/2 w-0 h-0 z-10 pointer-events-none">
            {floatingFrames.map((frame, i) => {
              const angle = (i * 360) / floatingFrames.length;
              const radian = (angle * Math.PI) / 180;
              const x = Math.cos(radian) * RADIUS;
              const y = Math.sin(radian) * RADIUS;

              return (
                <div
                  key={i}
                  className="individual-frame absolute flex items-center justify-center opacity-[0.7] bg-purple-300 p-1 rounded-2xl"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    width: `${frame.size}px`,
                    height: `${frame.size}px`,
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

        {/* CTA SECTION: Changed to flex layout with responsive gaps 
          to distribute elements organically within available space.
        */}
        <div className="cta-section flex flex-col items-center justify-center gap-4 md:gap-6 text-center relative z-30 px-6 w-full max-w-md mt-auto">
          <h1 className="text-zinc-800 text-3xl md:text-4xl font-bold leading-tight">
            Real Conversations. <br />
            <span className="text-purple-500 font-medium text-2xl md:text-3xl">
              Real People.
            </span>
          </h1>

          {/* Managed margin responsively (mt-4 mobile, mt-6 desktop) */}
          <button
            onClick={onZoom}
            className="mt-4 md:mt-6 bg-yellow-50 text-black font-bold py-3.5 md:py-4 px-12 md:px-14 rounded-full text-lg md:text-xl shadow-2xl active:scale-95 transition-transform cursor-pointer"
          >
            <p className="tracking-widest">GET STARTED</p>
          </button>

          <p className="text-sm md:text-md font-semibold text-zinc-700 tracking-wide mt-2">
            Join in seconds, No pressure
          </p>
        </div>
      </div>
    </>
  );
}
