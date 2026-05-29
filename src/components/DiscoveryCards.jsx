"use client";
import React, { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { MessageSquare } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import LostInternet from "@/utils/LostInternet";
import { useRouter } from "next/navigation";

export default function DiscoveryCard({ query }) {
  const [users, setAllUsers] = useState([]);
  const [error, setError] = useState(false); // Added error state
  const [loadingUsers, setLoadingUsers] = useState(false);
  const router = useRouter();
  const { token, onlineUserList } = useSelector((store) => store.auth);

  const getAllUsers = async () => {
    setLoadingUsers(true);
    setError(false);

    const timeoutController = new AbortController();
    const timer = setTimeout(() => timeoutController.abort(), 4000);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/smile/v1/users`,
        {
          method: "GET",
          signal: timeoutController.signal,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      clearTimeout(timer);
      const data = await res.json();

      if (data.status === "success") {
        setAllUsers(data.data.users);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (token) getAllUsers();
  }, [token]);

  // Filter users based on username or fullname (case-insensitive)
  const filteredUsers = users.filter((peep) => {
    const searchTerm = query.toLowerCase();
    return peep.username?.toLowerCase().includes(searchTerm);
  });

  return (
    <div className={`w-full relative`}>
      <div className="">
        {error ? (
          /* ERROR STATE - Matching your design exactly */
          <LostInternet onRetry={getAllUsers} />
        ) : (
          <div className="space-y-2">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((peep) => {
                const isOnline = onlineUserList.includes(peep?._id);
                return (
                  <div
                    key={peep._id}
                    className="user-card flex items-center justify-between bg-yellow-100 px-2 py-1 rounded-2xl"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative shrink-0">
                        {/* 1. IMAGE CONTAINER */}
                        <div className="relative size-9  md:size-14 rounded-full overflow-hidden bg-purple-100">
                          <Image
                            src={peep.avatar || "/default-dp.png"}
                            className="object-cover"
                            fill
                            alt={peep.username}
                            priority
                          />
                        </div>
                        {isOnline ? (
                          <span className="absolute bottom-0 right-0 size-4 bg-green-700 rounded-full border-2 border-white animate-pulse shadow-[0_0_8px_#22c55e]" />
                        ) : (
                          <span className="absolute bottom-0 right-0 size-4 rounded-full border-2 border-white bg-zinc-300" />
                        )}
                      </div>

                      {/* User Details */}
                      <div className="flex flex-col min-w-0">
                        <h3 className="text-zinc-800 font-semibold text-sm leading-none truncate">
                          {peep.username}
                        </h3>
                        <p className="text-xs tracking-wide font-light text-zinc-700 truncate mt-1">
                          {peep.email}
                        </p>
                      </div>
                    </div>

                    {/* Direct Chat Button */}
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/chat/${peep._id}?name=${peep.username}`,
                        )
                      }
                      className="ml-2 bg-purple-200 px-2 py-1 rounded-xl text-sm font-bold flex items-center gap-1"
                    >
                      Chat
                      <MessageSquare size={14} strokeWidth={1} fill="black" />
                    </button>
                  </div>
                );
              })
            ) : (
              /* EMPTY SEARCH STATE */
              <div className="flex flex-col items-center justify-center py-10 opacity-60">
                <p className="text-zinc-500 font-medium">
                  {query && "No peeps found..."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
