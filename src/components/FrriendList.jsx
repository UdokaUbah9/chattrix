"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SearchInput from "@/components/SearchInput";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useDispatch, useSelector } from "react-redux";
import LostInternet from "@/utils/LostInternet";
import { Mail } from "lucide-react";
import {
  addNewMessage,
  addToChatUsers,
  markAsRead,
  moveChatUserToTop,
  setActiveChat,
  setChatUsers,
  setIsTyping,
  setMessages,
  updateMessageStatus,
} from "@/store/authSlice";
import { socket } from "@/utils/socket";

export default function FriendList() {
  const [error, setError] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [typingUserId, setTypingUserId] = useState(null);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();
  const slideContentRef = useRef(null);

  const {
    token,
    activeChat,
    onlineUserList,
    messages,
    user,
    unreadUsers,
    chatUsers,
  } = useSelector((store) => store.auth);

  const getAllUsers = async () => {
    setLoadingUsers(true);
    setError(false);

    const timeoutController = new AbortController();
    const timer = setTimeout(() => timeoutController.abort(), 4000);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/smile/v1/users/chat-users`,
        {
          method: "GET",
          cache: "no-store",
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
        dispatch(setChatUsers(data.data.users));
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoadingUsers(false);
    }
  };

  ////////////////////////FETCH ALL MESSAGES /////////////////////////

  const fetchInitialData = async () => {
    try {
      // 2. Fetch All Messages automatically
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/smile/v1/messages/`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await res.json();
      if (data.status === "success") {
        // This populates your Redux 'messages' state globally
        // so the .find() logic in your map has data to work with!
        dispatch(setMessages(data.data.data));
      }
    } catch (err) {
      toast.error("Failed to fetch friends");
    }
  };

  useEffect(() => {
    if (!token || !user?._id) return;
    Promise.all([fetchInitialData(), getAllUsers()]);
  }, [token, user?._id]);

  ///////////////////////ADD NEW MESSAGE///////////////////////
  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (newMessage) => {
      dispatch(addNewMessage(newMessage));

      const existingUser = chatUsers.find(
        (u) => String(u._id) === String(newMessage.senderId),
      );

      if (existingUser) {
        dispatch(moveChatUserToTop(newMessage.senderId));
      } else if (newMessage.senderData) {
        dispatch(addToChatUsers(newMessage.senderData));
      }
    };

    socket.on("receive-message", handleIncoming);
    return () => socket.off("receive-message", handleIncoming);
  }, [dispatch, chatUsers]);

  // 1. ANIMATE THE SHELL (Always runs, regardless of data/error)
  useGSAP(
    () => {
      gsap.fromTo(
        slideContentRef.current,
        { x: "100%" },
        {
          x: "0%",
          duration: 0.3,
          ease: "cubic-bezier(0.32, 1, 0.23, 1)",
          immediateRender: true,
        },
      );
    },
    { scope: slideContentRef },
  );

  // 2. ANIMATE CONTENT (Staggers users OR fades in error)
  useGSAP(
    () => {
      if (chatUsers.length > 0) {
        gsap.from(".user-item", {
          y: 20,
          opacity: 0,
          stagger: 0.05,
          duration: 0.4,
          ease: "power2.out",
        });
      }
      if (error) {
        gsap.from(".error-state", {
          scale: 0.9,
          opacity: 0,
          duration: 0.5,
          ease: "back.out(1.7)",
        });
      }
    },
    { scope: slideContentRef, dependencies: [chatUsers.length, error] },
  );

  useEffect(() => {
    if (!socket) return;

    const handleStatus = ({ isTyping, senderId }) => {
      dispatch(setIsTyping(isTyping ? "typing..." : ""));
      setTypingUserId(isTyping ? senderId : null);
    };

    socket.on("sender-typing-status", handleStatus);

    return () => socket.off("sender-typing-status", handleStatus);
  }, [dispatch]);

  useEffect(() => {
    if (!socket) return;

    const handleDelete = (messageId) => {
      dispatch((dispatch, getState) => {
        const { messages } = getState().auth;
        const updated = messages.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                text: "This message was deleted",
                isDeleted: true,
                image: "",
              }
            : msg,
        );
        dispatch(setMessages(updated));
      });
    };

    socket.on("delete-both-message", handleDelete);
    return () => socket.off("delete-both-message", handleDelete);
  }, [dispatch]);

  // Filter users based on username (case-insensitive)
  const filteredUsers = chatUsers.filter((peep) => {
    const searchTerm = query.toLowerCase();
    return peep.username?.toLowerCase().includes(searchTerm);
  });

  const formatConversationTime = (createdAt) => {
    if (!createdAt) return "";
    const msgDate = new Date(createdAt);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (msgDate.toDateString() === today) {
      return msgDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (msgDate.toDateString() === yesterday) {
      return "Yesterday";
    }
    return msgDate.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Decide which list to display
  const displayUsers = query.length > 0 ? filteredUsers : chatUsers;

  return (
    <div className="bg-yellow-300" ref={slideContentRef}>
      {/* SEARCH BAR SECTION */}
      <div className="flex justify-between gap-3 items-center backdrop-blur-md px-2 rounded-4xl max-w-[396px] w-full">
        <SearchInput query={query} setQuery={setQuery} />
        <div className="flex flex-col items-center cursor-pointer">
          {/* Add your request icon here if needed */}
        </div>
      </div>

      <div className="px-2">
        {error ? (
          <LostInternet onRetry={getAllUsers} />
        ) : (
          <>
            <p className="mt-2 text-xs md:text-sm font-bold text-zinc-600">
              {query.length > 0 ? "Search results" : "Recent chats"}
            </p>

            <div className="mt-3 space-y-1">
              {displayUsers.length > 0 ? (
                displayUsers.map((currentUser) => {
                  const isOnline = onlineUserList.includes(currentUser._id);

                  // Add [...messages].reverse() to look from newest to oldest
                  const conversationMessage = messages.find(
                    (msg) =>
                      (String(msg.senderId) === String(user._id) &&
                        String(msg.receiverId) === String(currentUser._id)) ||
                      (String(msg.senderId) === String(currentUser._id) &&
                        String(msg.receiverId) === String(user._id)),
                  );

                  return (
                    <div
                      key={currentUser._id}
                      className={`user-item flex items-center gap-2 rounded-2xl active:scale-[0.98] transition-all ${
                        currentUser._id === activeChat?.receiverId
                          ? "bg-yellow-50"
                          : "hover:bg-white/40"
                      } p-1 cursor-pointer`}
                      onClick={() => {
                        dispatch(markAsRead(currentUser._id));
                        dispatch(setActiveChat(currentUser));
                        router.push(
                          `/dashboard/chat/${currentUser._id}?name=${encodeURIComponent(currentUser.username)}&profile-picture=${encodeURIComponent(currentUser.avatar)}`,
                        );
                      }}
                    >
                      {/* AVATAR */}
                      <div className="relative shrink-0 ">
                        <div className="relative size-9 md:size-14 rounded-full overflow-hidden bg-purple-100">
                          <Image
                            src={currentUser.avatar || "/default-dp.png"}
                            fill
                            className="object-cover"
                            alt={currentUser.username}
                            priority
                          />
                        </div>
                        <span
                          className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-white ${
                            isOnline
                              ? "bg-green-700 animate-pulse"
                              : "bg-zinc-300"
                          }`}
                        />
                      </div>

                      {/* CONTENT */}
                      <div className="flex-1 border-b border-purple-200 px-2 py-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <p className="text-zinc-900 truncate text-xs md:text-sm font-semibold">
                            {currentUser.username}
                          </p>

                          <div className="flex items-center flex-col gap-2">
                            {conversationMessage &&
                              !unreadUsers.includes(
                                String(currentUser._id),
                              ) && (
                                <span className="text-xs text-zinc-400 font-bold">
                                  {formatConversationTime(
                                    conversationMessage.createdAt,
                                  )}
                                </span>
                              )}
                            {unreadUsers.includes(String(currentUser._id)) &&
                              !conversationMessage?.isDeleted && (
                                <div className="text-green-600 animate-pulse flex items-center justify-center flex-col">
                                  {/* Unread Mail Icon */}
                                  <Mail size={12} strokeWidth={2.5} />

                                  {/* Dynamic Smart Timestamp */}
                                  <div className="text-xs text-zinc-400 font-bold mt-0.5 select-none">
                                    <span className="text-xs text-zinc-400 font-bold">
                                      {formatConversationTime(
                                        conversationMessage.createdAt,
                                      )}
                                    </span>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>

                        <div className="md:text-xs text-sm text-zinc-700 font-medium truncate">
                          {typingUserId &&
                          String(currentUser._id) === String(typingUserId) ? (
                            <span className="text-purple-600 italic">
                              is typing...
                            </span>
                          ) : (
                            <p className="text-xs md:text-sm text-zinc-500 truncate">
                              {conversationMessage
                                ? conversationMessage.image
                                  ? "📷 Photo"
                                  : conversationMessage.isDeleted
                                    ? "This message was deleted"
                                    : conversationMessage.text
                                : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 opacity-50 text-sm italic">
                  {query && "No peeps found..."}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
