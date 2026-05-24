"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowLeft, Zap } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

export default function ChangePassword() {
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { token, user } = useSelector((store) => store.auth);
  const router = useRouter();
  const containerRef = useRef(null);

  const updatePasswordHandler = async function (e) {
    if (e) e.preventDefault();
    setIsUpdating(true);

    try {
      const res = await fetch(
        `${NEXT_PUBLIC_API_URL}/api/smile/v1/users/password-change`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: user._id,
            password: password.trim(),
            newPassword: newPassword.trim(),
            confirmPassword: confirmPassword.trim(),
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");

      router.replace("/dashboard/me");
      toast.success(data.message);
    } catch (err) {
      if (err.name === "AbortError") {
        toast.error("Request timed out. Try again!");
      } else {
        toast.error(err.message);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  useGSAP(
    () => {
      const tl = gsap.timeline();

      tl.from(".password-card", {
        y: 100,
        rotationX: -20,
        opacity: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.75)",
      }).from(
        ".animate-item",
        {
          scale: 0.5,
          opacity: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: "back.out(2)",
        },
        "-=0.4",
      );

      gsap.to(".password-card", {
        y: "-=10",
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen p-3 pb-32 flex flex-col items-center justify-start overflow-y-auto"
    >
      <div className="password-card w-full max-w-md backdrop-blur-3xl rounded-4xl p-4 z-10  relative">
        <button
          onClick={() => router.replace("/dashboard/me")}
          className="fixed -top-10 left-0 p-3 rounded-full hover:bg-yellow-100 transition-all active:scale-90 text-zinc-600 hover:text-black"
        >
          <ArrowLeft size={32} />
        </button>

        <header className="animate-item mb-10 text-center">
          <h1 className="text-5xl font-black text-zinc-800 uppercase italic tracking-tighter leading-none">
            New{" "}
            <span className="text-zinc-800 block drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
              Password?
            </span>
          </h1>
        </header>

        <form
          className="space-y-6 text-zinc-800"
          onSubmit={updatePasswordHandler}
        >
          <div className="animate-item">
            <PasswordField
              label="The Old One"
              placeholder="Don't forget it..."
              value={password}
              setValue={setPassword}
            />
          </div>

          <div className="animate-item flex items-center gap-4">
            <div className="h-0.5 bg-white/10 flex-1" />
            <span className="text-xs font-black text-zinc-800">
              THE UPGRADE
            </span>
            <div className="h-0.5 bg-white/10 flex-1" />
          </div>

          <div className="animate-item">
            <PasswordField
              label="New Password"
              placeholder="Make it beefy"
              className="text-zinc-800"
              value={newPassword}
              setValue={setNewPassword}
            />
          </div>

          <div className="animate-item">
            <PasswordField
              label="Confirm it"
              placeholder="Just to be sure"
              value={confirmPassword}
              setValue={setConfirmPassword}
            />
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full p-6 font-semibold bg-purple-100 text-purple-600 uppercase tracking-wider rounded-2xl transition-all active:scale-90 mt-4 text-sm hover:rotate-1"
          >
            {isUpdating ? "Locking..." : "Lock it in!"}
          </button>
        </form>
      </div>
    </div>
  );
}

function PasswordField({ label, placeholder, value, setValue }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-black text-zinc-800 uppercase tracking-wider ml-2">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20  transition-colors">
          <Lock size={20} strokeWidth={3} className="text-zinc-800" />
        </div>
        <input
          required
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-white/5 border-2 border-yellow-100 rounded-[25px] py-5 pl-14 pr-14 text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all font-black text-lg"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-800 hover:text-white transition-colors"
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
}
