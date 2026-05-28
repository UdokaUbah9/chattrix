"use client";
import React, { useEffect, useRef, useState } from "react";
import BackButton from "@/components/BackButton";
import ChatInput from "@/components/ChatInput";
import GameList from "@/components/GameList";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { socket } from "@/utils/socket";
import { setActiveChat, setIsTyping, setMessages } from "@/store/authSlice";
import { Check, CheckCheck, Trash2, X } from "lucide-react";
import LostInternet from "@/utils/LostInternet";
import toast from "react-hot-toast";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import UserProfile from "./UserProfile";
import NotFound from "@/app/not-found";

export default function EachMessage() {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const searchParams = useSearchParams();
  const username = searchParams.get("name");
  const profilePicture = searchParams.get("profile-picture");
  const [expandedImage, setExpandedImage] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [error, setError] = useState(false);
  const [friend, setFriend] = useState({ username: username || "User" });
  const [userProfile, setUserProfile] = useState(null);
  const messagesContainerRef = useRef();
  const scrollRef = useRef();
  const modalRef = useRef();
  const modalImgRef = useRef();
  const holdTimeoutRef = useRef(null);

  const { token, activeChat, onlineUserList, messages, isTyping } = useSelector(
    (store) => store.auth,
  );

  // Validate Mongo ID Shape
  const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(userId);

  useGSAP(() => {
    if (expandedImage) {
      const tl = gsap.timeline();
      tl.to(modalRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
      tl.fromTo(
        modalImgRef.current,
        { scale: 0.5, opacity: 0, rotation: -5 },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 0.5,
          ease: "back.out(1.7)",
        },
        "-=0.2",
      );
    }
  }, [expandedImage]);

  const closeExpandedView = () => {
    gsap.to(modalRef.current, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => setExpandedImage(null),
    });
  };

  // Initial Sync Layout Hook
  useEffect(() => {
    if (userId && isValidMongoId) {
      dispatch(setMessages([]));
      dispatch(setActiveChat({ receiverId: userId, username, profilePicture }));
    }

    return () => {
      dispatch(setActiveChat(null));
      dispatch(setMessages([]));
    };
  }, [userId, username, profilePicture, dispatch, isValidMongoId]);

  const fetchChatHistory = async () => {
    if (!isValidMongoId) return;
    setError(false);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/smile/v1/messages/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        },
      );
      const data = await response.json();

      if (data.status === "success") {
        dispatch(setMessages(data.data.messages));
        setFriend(data.data.friend);
      } else {
        setError(true);
      }
    } catch (err) {
      toast.error("Fetching history failed");
    }
  };

  useEffect(() => {
    if (token && userId && isValidMongoId) {
      fetchChatHistory();
    }
  }, [token, userId, isValidMongoId]);

  const fetchUserProfile = async (id) => {
    setError(false);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/smile/v1/users/getUser/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        },
      );
      const data = await response.json();

      if (data.status === "success") {
        setUserProfile(data.data.user);
      } else {
        setError(true);
      }
    } catch (err) {
      toast.error("Fetching profile failed");
    }
  };

  const handleDeleteMessage = async function (id) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/smile/v1/messages/delete-message/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error("message failed to delete");

      const deletedMessage = messages.map((msg) => {
        if (msg._id === id) {
          return {
            ...msg,
            text: "This message was deleted",
            image: "",
            isDeleted: true,
          };
        }
        return msg;
      });
      dispatch(setMessages(deletedMessage));

      socket.emit("message-deleted", {
        messageId: id,
        receiverId: activeChat?.receiverId,
      });
      toast.success("Message deleted");
    } catch (err) {
      toast.error(err.message || "Message failed to delete");
    }
  };

  // Live Socket Listeners
  useEffect(() => {
    if (!socket || !userId || !isValidMongoId) return;

    const handleNewMessage = (newMessage) => {
      const isRelevant =
        String(newMessage.senderId) === String(userId) ||
        String(newMessage.receiverId) === String(userId);

      if (isRelevant) {
        dispatch((dispatch, getState) => {
          const { messages: currentMessages } = getState().auth;
          const exists = currentMessages.some((m) => m._id === newMessage._id);
          if (!exists) {
            dispatch(setMessages([...currentMessages, newMessage]));
          }
        });

        if (String(newMessage.senderId) === String(userId)) {
          socket.emit("mark-read", {
            messageId: newMessage._id,
            senderId: newMessage.senderId,
          });
        }
      }
    };

    const handleDelete = (messageId) => {
      dispatch((dispatch, getState) => {
        const { messages: currentMessages } = getState().auth;
        const updated = currentMessages.map((msg) =>
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

    const handleReadUpdate = ({ messageId }) => {
      dispatch((dispatch, getState) => {
        const { messages: currentMessages } = getState().auth;
        const updated = currentMessages.map((msg) =>
          msg._id === messageId ? { ...msg, status: "read" } : msg,
        );
        dispatch(setMessages(updated));
      });
    };

    socket.on("receive-message", handleNewMessage);
    socket.on("delete-both-message", handleDelete);
    socket.on("message-read-update", handleReadUpdate);

    return () => {
      socket.off("receive-message", handleNewMessage);
      socket.off("delete-both-message", handleDelete);
      socket.off("message-read-update", handleReadUpdate);
    };
  }, [userId, dispatch, isValidMongoId]);

  // Read History Marker
  const totalMessagesCount = messages?.length || 0;
  useEffect(() => {
    if (!socket || !userId || !isValidMongoId || totalMessagesCount === 0)
      return;

    const unreadMessages = messages.filter(
      (msg) =>
        String(msg.senderId) === String(userId) &&
        msg.status !== "read" &&
        /^[0-9a-fA-F]{24}$/.test(msg._id),
    );

    if (unreadMessages.length > 0) {
      unreadMessages.forEach((msg) => {
        socket.emit("mark-read", {
          messageId: msg._id,
          senderId: msg.senderId,
        });
      });

      const updatedMessages = messages.map((msg) =>
        unreadMessages.find((u) => u._id === msg._id)
          ? { ...msg, status: "read" }
          : msg,
      );
      dispatch(setMessages(updatedMessages));
    }
  }, [totalMessagesCount, userId, dispatch, isValidMongoId]);

  // Smooth Scroll Anchor
  useEffect(() => {
    if (messages?.length > 0) {
      scrollRef.current?.scrollIntoView({ behavior: "instant", block: "end" });
    }
  }, [messages?.length]);

  // Typing Listener
  useEffect(() => {
    if (!socket) return;
    const handleStatus = ({ isTyping }) => {
      dispatch(setIsTyping(isTyping ? "typing..." : ""));
    };
    socket.on("sender-typing-status", handleStatus);
    return () => socket.off("sender-typing-status", handleStatus);
  }, [dispatch]);

  // Click Outside Popover Dismisals
  useEffect(() => {
    const handleClickOutside = () => setSelectedMessageId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleHoldStart = (id) => {
    holdTimeoutRef.current = setTimeout(() => {
      setSelectedMessageId(id);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 600);
  };

  const handleHoldEnd = () => {
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
  };

  if (!isValidMongoId) {
    return <NotFound />;
  }

  const isOnline = onlineUserList.includes(activeChat?.receiverId);

  const getDateHeading = (dateStr) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (dateStr === today) return "Today";
    if (dateStr === yesterday) return "Yesterday";

    return new Date(dateStr).toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="relative w-full h-full max-h-full flex flex-col overflow-hidden isolation-auto">
      <div className="relative h-full max-h-full w-full overflow-hidden bg-yellow-400 z-50 flex flex-col">
        <Image
          src="/chat-background3.jpg"
          alt="Chat background"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-yellow-50 opacity-90 pointer-events-none z-0" />

        <div className="relative z-10 flex flex-col h-full w-full justify-between min-h-0">
          {userProfile && (
            <UserProfile
              user={userProfile}
              onClose={() => setUserProfile(null)}
              profilePicture={profilePicture}
            />
          )}

          {/* HEADER */}
          <header className="flex items-center justify-between p-4 backdrop-blur-md border-b border-black/5 bg-yellow-300 shrink-0">
            <div className="flex items-center gap-3">
              <div className="md:hidden">
                <BackButton />
              </div>

              <div
                className="flex items-center gap-3 active:opacity-70 transition-opacity cursor-pointer"
                onClick={() => fetchUserProfile(userId)}
              >
                <div className="relative size-10 shrink-0 ring-2 ring-yellow-400/50 rounded-full">
                  <Image
                    src={profilePicture || "/default-dp.png"}
                    fill
                    alt={`${friend.username}'s profile`}
                    className="rounded-full object-cover"
                    priority
                  />
                  {isOnline ? (
                    <span className="absolute bottom-0 right-0 size-3 bg-green-700 rounded-full border-2 border-white animate-pulse shadow-[0_0_8px_#22c55e]" />
                  ) : (
                    <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-zinc-300" />
                  )}
                </div>

                <div className="flex flex-col">
                  <h2 className="text-zinc-900 font-bold leading-none">
                    {friend.username}
                  </h2>
                  <span className="text-xs text-zinc-600 font-medium mt-1">
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* MESSAGES VIEWPORT BOX */}
          <div
            className="messages-container flex-1 overflow-y-auto px-4 pb-4 min-h-0"
            ref={messagesContainerRef}
          >
            {error ? (
              <LostInternet onRetry={fetchChatHistory} />
            ) : messages?.length > 0 ? (
              <div className="flex flex-col w-full gap-2 mt-3 mb-4">
                {messages.map((msg, idx) => {
                  const currentMsgDate = new Date(msg.createdAt).toDateString();
                  const previousMsgDate =
                    idx > 0
                      ? new Date(messages[idx - 1].createdAt).toDateString()
                      : null;
                  const isNewDay = currentMsgDate !== previousMsgDate;

                  return (
                    <React.Fragment key={msg._id}>
                      {isNewDay && (
                        <div className="flex justify-center my-4 animate-in fade-in zoom-in-95 duration-200 select-none">
                          <span className="bg-black/10 text-zinc-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-xs backdrop-blur-xs border border-white/20">
                            {getDateHeading(currentMsgDate)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 w-full group relative">
                        <div
                          onMouseDown={() => handleHoldStart(msg._id)}
                          onMouseUp={handleHoldEnd}
                          onMouseLeave={handleHoldEnd}
                          onTouchStart={() => handleHoldStart(msg._id)}
                          onTouchEnd={handleHoldEnd}
                          className={`message-bubble relative p-3.5 max-w-[80%] text-[16px] shadow-sm mb-1 font-medium transition-colors break-words
                            ${
                              msg.senderId !== userId
                                ? "bg-purple-200 text-slate-900 ml-auto rounded-2xl rounded-br-none"
                                : "bg-white text-slate-900 mr-auto rounded-2xl rounded-bl-none"
                            }
                            ${msg.isDeleted ? "text-zinc-600 italic pointer-events-none bg-zinc-100/50" : ""}`}
                        >
                          {msg.image && (
                            <div
                              className="mb-2 relative w-full min-w-[200px] h-48 cursor-pointer"
                              onClick={() => setExpandedImage(msg.image)}
                            >
                              <Image
                                src={msg.image}
                                alt="Sent image"
                                fill
                                sizes="(max-width: 768px) 60vw, 280px"
                                className="object-cover rounded-lg border border-black/10"
                              />
                            </div>
                          )}

                          {msg.text && (
                            <p
                              className={`${msg.isDeleted ? "italic" : ""} leading-tight`}
                            >
                              {msg.text}
                            </p>
                          )}

                          {!msg.isDeleted && (
                            <div className="flex gap-2 justify-between items-center mt-2">
                              {msg.senderId !== userId && (
                                <div className="flex items-center gap-1 opacity-50">
                                  {msg.status === "sending" && (
                                    <span className="text-xs italic">...</span>
                                  )}
                                  {msg.status === "sent" && (
                                    <Check size={16} strokeWidth={1.5} />
                                  )}
                                  {msg.status === "delivered" && (
                                    <CheckCheck size={16} strokeWidth={1.5} />
                                  )}
                                  {msg.status === "read" && (
                                    <CheckCheck
                                      size={16}
                                      strokeWidth={3.5}
                                      className="text-yellow-500"
                                    />
                                  )}
                                </div>
                              )}
                              <span className="text-[10px] opacity-40 italic block">
                                {new Date(msg.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        {msg.senderId !== userId &&
                          selectedMessageId === msg._id && (
                            <div
                              className="ml-2"
                              onClick={() => handleDeleteMessage(msg._id)}
                            >
                              <Trash2
                                size={22}
                                className="text-red-500 hover:text-red-700 cursor-pointer transition-all"
                              />
                            </div>
                          )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            ) : null}

            {/* Dynamic Real-time Chatting Animation Bubble */}
            <div className="h-12 ml-2 mt-2 shrink-0">
              {isTyping && (
                <div className="flex items-end gap-1 animate-in fade-in slide-in-from-bottom-2 text-left">
                  <p className="animate-bounce text-xl">🤳🏼</p>
                  <div className="relative">
                    <div className="absolute -bottom-2 -left-1 w-2 h-2 bg-white rounded-full shadow-sm" />
                    <div className="absolute -bottom-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                    <div className="bg-white px-4 py-3 rounded-[25px] shadow-sm flex gap-1.5 items-center min-w-[55px] justify-center border border-black/5">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={scrollRef} />
          </div>

          {/* FOOTER INPUT BOX */}
          <footer className="w-full shrink-0 z-10">
            <ChatInput userId={userId}>
              <GameList />
            </ChatInput>
          </footer>
        </div>

        {/* ⚡ ROOT-LEVEL IMAGE ZOOM VIEWER (Fixed outside scrolling tags for iOS context) */}
        {expandedImage && (
          <div
            ref={modalRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md opacity-0"
            onClick={closeExpandedView}
          >
            <div
              className="relative w-[90vw] h-[75vh] md:w-[85vw] md:h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div ref={modalImgRef} className="relative w-full h-full">
                <Image
                  src={expandedImage}
                  fill
                  sizes="90vw"
                  alt="Expanded view"
                  className="object-contain"
                  unoptimized
                />
              </div>
              <button
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white rounded-full p-2.5 transition-all shadow-md cursor-pointer"
                onClick={closeExpandedView}
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
