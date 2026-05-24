"use client";
import React, { useRef } from "react";
import Image from "next/image";
import { Check, X, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import BackButton from "@/components/BackButton";

export default function FriendRequests({ requests = [] }) {
  const router = useRouter();
  const containerRef = useRef();

  useGSAP(
    () => {
      gsap.from(".request-card", {
        x: 50,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: "back.out(1.7)",
      });
    },
    { scope: containerRef },
  );

  // 1. ANIMATE THE SHELL (Always runs, regardless of data/error)
  useGSAP(
    () => {
      gsap.fromTo(
        containerRef.current,
        { x: "100%" },
        {
          x: "0%",
          duration: 0.3,
          ease: "cubic-bezier(0.32, 1, 0.23, 1)",
          immediateRender: true,
        },
      );
    },
    { scope: containerRef },
  );
  // 1. Create a reusable Exit Animation function
  const exitAndNavigate = (path) => {
    gsap.to(containerRef.current, {
      x: "100%", // Slide it back to the right
      duration: 0.3,
      ease: "power3.in", // Fast acceleration for exits
      onComplete: () => {
        router.push(path); // Only navigate once the animation finishes
      },
    });
  };

  // 2. Update your PEEPS button click
  const requestPageRouter = () => {
    exitAndNavigate("/dashboard/calls");
  };

  return (
    <div className="bg-yellow-300 flex flex-col" ref={containerRef}>
      {/* 1. HEADER */}
      <div className="flex items-center gap-3">
        {/* <BackButton back="/dashboard/calls"> */}
        <button
          className="p-3 text-[#050505] cursor-pointer shrink-0"
          title="Go back"
          onClick={requestPageRouter}
        >
          <ArrowLeft size={20} />
        </button>

        {/* </BackButton> */}
        <div>
          <h1 className="text-2xl tracking-tighter text-zinc-900 leading-none">
            Notifications
          </h1>
        </div>
      </div>

      {/* 2. REQUEST LIST */}
      <div className="flex-1 px-4 space-y-3 overflow-y-auto pb-10">
        {requests.length > 0 ? (
          requests.map((req) => (
            <div
              key={req.id}
              className="request-card flex items-center gap-3 p-3 bg-white/40 rounded-3xl border border-white/20 shadow-sm"
            >
              {/* Profile Image */}
              <div className="size-14 rounded-full bg-zinc-800 border-2 border-yellow-500 overflow-hidden relative shrink-0">
                <Image
                  src={req.image || "/default-dp.png"}
                  alt="profile"
                  fill
                  className="object-cover"
                />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="font-black text-zinc-900 uppercase italic truncate">
                  {req.username}
                </p>
                <p className="text-[10px] text-zinc-800/70 font-bold uppercase">
                  Wants to SMILe with you
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="size-10 bg-red-500 rounded-xl flex items-center justify-center shadow-md active:scale-90 transition-all border-b-4 border-red-700">
                  <X size={18} className="text-white" strokeWidth={3} />
                </button>
                <button className="size-10 bg-zinc-900 rounded-xl flex items-center justify-center shadow-md active:scale-90 transition-all border-b-4 border-black/40">
                  <Check
                    size={18}
                    className="text-yellow-400"
                    strokeWidth={3}
                  />
                </button>
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center pt-20 opacity-40">
            <div className="size-24 bg-zinc-900/10 rounded-full flex items-center justify-center mb-4">
              <Check size={40} className="text-zinc-900" />
            </div>
            <p className="font-black uppercase italic text-zinc-900">
              All caught up!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
