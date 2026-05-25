"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Mail,
  Trophy,
  LogOut,
  Settings,
  HeartOff,
  User,
  Lock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "@/store/authSlice";
import { socket } from "@/utils/socket";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import LostInternet from "@/utils/LostInternet";
import EditProfileModal from "@/components/EditProfileModal";
import Image from "next/image";
import toast from "react-hot-toast";

export default function ProfileWithLogout() {
  const [getMe, setGetMe] = useState(null);
  const [error, setError] = useState(false);
  const [isShowEditModal, setIsShowEditModal] = useState(false);
  const [isShowSettingsModal, setIsShowSettingsModal] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const menuRef = useRef();

  const { user, token, onlineUserList } = useSelector((store) => store.auth);

  //////////////////////MENU REF GSAP ANIMATION ////////////////////

  useGSAP(() => {
    if (isShowSettingsModal) {
      // 1. Animate the container (The UL)
      gsap.fromTo(
        menuRef.current,
        { opacity: 0, y: -10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power2.out" },
      );

      // 2. Animate the list items (The LI tags)
      gsap.fromTo(
        menuRef.current.querySelectorAll("li"),
        { opacity: 0, x: -10 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.05, // Each item enters 0.05s after the last
          ease: "power1.out",
          delay: 0.1, // Wait for the menu to scale up slightly first
        },
      );
    }
  }, [isShowSettingsModal]);

  const getMyProfile = async function () {
    if (!token || !user) return;
    setError(false);

    const { email, username } = user;
    const timeoutController = new AbortController();
    const timer = setTimeout(() => timeoutController.abort(), 4000);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/smile/v1/users/getMe`,
        {
          method: "POST",
          signal: timeoutController.signal,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, username }),
        },
      );

      // Clear Abort Timer
      clearTimeout(timer);

      const data = await res.json();
      if (data.status !== "success") {
        return;
      }

      setGetMe(data.data.data);
      // console.log(data.data.data);
    } catch (err) {
      // toast.error("failed");
      return setError(true);
    }
  };

  useEffect(() => {
    const callProfile = async () => {
      await getMyProfile();
    };

    callProfile(); // Actually call it!
  }, [token, user]);

  const handleLogout = async () => {
    try {
      // 1. Tell backend to clear the cookie
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/smile/v1/users/logout`,
        {
          method: "GET", // or POST depending on your router
          credentials: "include", // THIS IS KEY: It sends the cookie to be cleared
        },
      );

      // 2. Clear Redux
      dispatch(clearUser());

      // 3. Disconnect Socket
      socket.disconnect();

      router.replace("/login");
    } catch (err) {
      // console.error("Logout failed", err);
    }
  };

  useGSAP(() => {
    // Only animate if getMe is no longer null
    if (getMe) {
      gsap.from(".card", {
        scale: 0.8, // Scale 3 is huge! 0.8 to 1 feels like a nice "pop"
        duration: 0.4,
        opacity: 0,
        ease: "back.out(1.7)", // Gives it a bouncy "SMILE" energy
      });
    }
  }, [getMe]); // Trigger when data arrives

  const handleCloseEditModal = function () {
    router.replace("/dashboard/me");
    setIsShowEditModal(false);
  };

  ////////////////////////////////////Close settings modal when click anywhere/////////////////////////
  useEffect(() => {
    const handleClickOutside = () => {
      setIsShowSettingsModal(false);
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  if (!getMe && !error) return null;

  const isOnline = onlineUserList.includes(user?._id);
  return (
    <>
      {error ? (
        <>
          <LostInternet onRetry={getMyProfile} />
        </>
      ) : (
        <div className="card flex flex-col gap-10 items-center justify-center p-4">
          {isShowEditModal && (
            <EditProfileModal
              onClose={handleCloseEditModal}
              getMyProfile={getMyProfile}
            />
          )}
          {/* The Transparent Glass Card */}
          <div
            className={`w-full max-w-sm backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden bg-yellow-100 ${isShowEditModal && "backdrop-blur-sm opacity-0"}`}
          >
            {/* Subtle Background Glow for Brand Identity */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-smile-primary/10 rounded-full blur-[80px]" />

            {/* 1. Header with Settings Icon */}
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10" /> {/* Spacer to center avatar */}
              <div className="relative w-24 h-24">
                <Image
                  key={user?.avatar}
                  src={user?.avatar || "/default-dp.png"}
                  className="rounded-4xl border object-cover p-1"
                  fill
                  alt="Avatar"
                  priority
                />
                {isOnline ? (
                  <span className="absolute bottom-0 right-0 size-4 bg-green-700 rounded-full border-2 border-white animate-pulse shadow-[0_0_8px_#22c55e]" />
                ) : (
                  <span className="absolute bottom-0 right-0 size-4 rounded-full border-2 border-white bg-zinc-300" />
                )}
              </div>
              <div className="relative">
                <div className="relative">
                  <button
                    className="p-2 bg-white/40 rounded-xl hover:bg-white/60 transition-all text-zinc-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsShowSettingsModal((prev) => !prev);
                    }}
                  >
                    <Settings size={20} />
                  </button>

                  {isShowSettingsModal && (
                    <ul
                      ref={menuRef}
                      className="absolute right-0 mt-2 w-48 bg-white border border-black/5 rounded-2xl py-2 shadow-2xl z-[100] overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <li
                        className="px-4 py-3 text-sm text-zinc-600 hover:bg-yellow-50 cursor-pointer flex items-center gap-3 transition-colors"
                        onClick={() => {
                          setIsShowEditModal(true);
                          router.replace("/dashboard/me?edit=true");
                          setIsShowSettingsModal(false);
                        }}
                      >
                        <User size={16} /> Edit Profile
                      </li>
                      <li
                        className="px-4 py-3 text-sm text-zinc-600 hover:bg-yellow-50 cursor-pointer flex items-center gap-3 transition-colors"
                        onClick={() =>
                          router.replace("/dashboard/me/settings/password")
                        }
                      >
                        <Lock size={16} /> Change Password
                      </li>
                      <div className="h-px bg-black/5 my-1" />
                      <li
                        className="px-4 py-3 text-sm text-red-500 font-bold hover:bg-red-50 cursor-pointer flex items-center gap-3 transition-colors"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} /> Logout
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* 2. User Info */}
            <div className="text-center mb-10">
              <h1 className="text-2xl  tracking-tight text-black">
                {getMe.username}
              </h1>
              <div className="flex items-center justify-center gap-2 text-zinc-500 mt-1">
                <Mail size={12} className="text-smile-primary" />
                <span className="text-xs font-medium">{getMe.email}</span>
              </div>
            </div>

            {/* 3. Stats Section */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-white/5 rounded-3xl p-5 border border-white/5 flex flex-col items-center">
                <Trophy className="text-smile-primary mb-1" size={18} />
                <span className="text-xl text-green-600">{getMe.wins}</span>
                <span className="text-sm uppercase tracking-widest text-zinc-500 font-bold">
                  Wins
                </span>
              </div>
              <div className="bg-white/5 rounded-3xl p-5 border border-white/5 flex flex-col items-center">
                <HeartOff
                  className="text-red-400 mb-1 group-hover:scale-110 transition-transform"
                  size={18}
                />
                <span className="text-xl text-green-600">{getMe.losses}</span>
                <span className="text-sm uppercase tracking-widest text-zinc-500 font-bold">
                  Losses
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
