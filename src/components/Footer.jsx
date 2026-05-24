"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus, CirclePlay, MessageSquarePlus, User } from "lucide-react";

const navItems = [
  // { name: "Games", icon: Gamepad2, path: "/dashboard/games" },
  { name: "Peeps", icon: UserPlus, path: "/dashboard/peeps" },
  // { name: "Reels", icon: CirclePlay, path: "/dashboard/reels", isCenter: true },
  { name: "Chat", icon: MessageSquarePlus, path: "/dashboard/chat" },
  { name: "Me", icon: User, path: "/dashboard/me" },
];

export default function AppFooter() {
  const pathname = usePathname();
  return (
    // Mobile: fixed bottom bar | Desktop: relative sidebar on the left
    <footer className="fixed bottom-0 left-0 w-full md:relative md:w-24 md:h-screen z-50 bg-black/40 backdrop-blur-md border-t md:border-t-0 md:border-r border-white/50 p-4">
      <div className="flex flex-row md:flex-col w-full justify-around md:justify-center items-center max-w-lg mx-auto h-full gap-8">
        {navItems.map((tab) => {
          const isActive = pathname === tab.path;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.path}
              href={tab.path}
              className="relative flex flex-col justify-center items-center w-16 h-16 group"
            >
              {isActive && (
                <motion.div
                  layoutId="active-underline"
                  // Mobile: underline | Desktop: vertical bar on the left
                  className="absolute bottom-0 md:bottom-auto md:left-0 w-10 md:w-1 h-1 md:h-10 bg-yellow-400 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <div
                className={`relative z-10 flex flex-col gap-1 items-center justify-center transition-all duration-300 ${
                  isActive ? "-translate-y-1 md:translate-x-1" : ""
                }`}
              >
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-colors duration-300 ${
                    isActive
                      ? "text-yellow-400 scale-110"
                      : "text-zinc-800 group-hover:text-zinc-200"
                  }`}
                />
                <span
                  className={`text-[10px] md:text-xs uppercase font-bold transition-colors duration-300 ${
                    isActive ? "text-yellow-400" : "text-zinc-800"
                  }`}
                >
                  {tab.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </footer>
  );
}
