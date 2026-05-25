"use client";
import React, { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import {
  SendHorizontal,
  Paperclip,
  Smile,
  Keyboard,
  Gamepad2,
  X,
  Images,
} from "lucide-react";
import gsap from "gsap";

import { useSelector, useDispatch } from "react-redux";
import {
  addToChatUsers,
  moveChatUserToTop,
  setMessages,
} from "../store/authSlice";
import { socket } from "@/utils/socket";
import Image from "next/image";
import toast from "react-hot-toast";

export default function ChatInput({ userId, children }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [isOpenGameList, setIsOpenGameList] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);
  const imageRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const dispatch = useDispatch();
  const { token, activeChat, messages } = useSelector((store) => store.auth);

  const toggleEmojiPicker = (e) => {
    e.stopPropagation();
    if (!showPicker) {
      // 1. If we are opening the picker, hide the native keyboard
      inputRef.current?.blur();
    } else {
      // 2. If we are closing the picker to show keyboard, focus the input
      inputRef.current?.focus();
    }
    setShowPicker(!showPicker);
    setIsOpenGameList(false);
  };

  const onEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const handleToggleGameList = function () {
    setIsOpenGameList((isOpenGameList) => !isOpenGameList);
    setShowPicker(false);
  };

  const handleClose = function () {
    setIsOpenGameList(false);
  };

  const handleCloseGameList = (gameItem, containerRef) => {
    const tl = gsap.timeline({ onComplete: handleClose });

    tl.to(gameItem, {
      x: 30,
      opacity: 0,
      duration: 0.2,
      stagger: { each: 0.05, from: "end" },
      ease: "power2.in",
    });

    tl.to(
      containerRef,
      {
        y: 100,
        opacity: 0,
        scale: 0.9,
        duration: 0.3,
        ease: "back.in(1.2)",
      },
      "-=0.1",
    );
  };

  /////////////Handle image upload ///////////////////////////

  // SEND MESSAGE
  const onSendMessage = async function (imageData = null) {
    const messageText = text.trim();
    const finalImage = imageData || preview;

    if (!messageText && !finalImage) return;

    const tempId = Date.now().toString();

    const optimisticMessage = {
      _id: tempId,
      type: "text",
      createdAt: Date.now(),
      text,
      image: finalImage,
      status: "sending",
    };

    const nextMessages = [...messages, optimisticMessage];

    dispatch(setMessages(nextMessages));

    setText("");
    setPreview(null);

    // Close Emoji Picker
    if (showPicker) {
      setShowPicker(false);
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/smile/v1/messages/send-message/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            text: messageText,
            image: finalImage,
          }),
        },
      );

      const data = await res.json();
      if (data.status === "success" && data.data) {
        const realMessage = data.data.data;

        const swappedMessages = nextMessages.map((msg) =>
          msg._id === tempId ? { ...realMessage, status: "sent" } : msg,
        );

        dispatch(setMessages(swappedMessages));
        socket.emit("send-message", realMessage);

        dispatch(moveChatUserToTop(userId));
        dispatch(
          addToChatUsers({
            _id: userId,
            username: activeChat?.username,
            avatar: activeChat?.avatar,
          }),
        );
        setPreview(null);
      } else {
        // This will tell you EXACTLY what went wrong (e.g., "File too large")

        toast.error(data.message || "Failed to send image");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // SENDING THE IMAGE
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional: Add a size check here (e.g., 5MB)

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      // This triggers the unified function above
      setPreview(reader.result);
    };
  };

  // UseEffect for expandable input
  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = "auto";

    const newHeight = Math.min(inputRef.current.scrollHeight, 120);
    inputRef.current.style.height = `${newHeight}px`;
  }, [text, activeChat]);

  const handleInputChange = (e) => {
    setText(e.target.value);

    // 1. Tell server they ARE typing
    socket.emit("typing", {
      receiverId: activeChat?.receiverId,
      isTyping: true,
    });

    // 2. Clear old timer
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // 3. Set timer to stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        receiverId: activeChat?.receiverId,
        isTyping: false,
      });
    }, 2000);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-yellow-300 border-t border-white/5">
      <div className="max-w-3xl mx-auto flex flex-col">
        {/* The Input Bar */}
        <div className="flex items-end gap-2 p-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={imageRef}
            onChange={handleImageChange} // We'll build this next
          />
          <button
            onClick={() => imageRef.current.click()}
            className="p-3 text-zinc-700 cursor-pointer hover:bg-zinc-100 rounded-full transition-colors"
          >
            <Images size={24} strokeWidth={2} />
          </button>

          <div className="flex-1 bg-yellow-50 rounded-2xl flex flex-col px-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {/* PREVIEW: Moved to the left using self-start */}
            {preview && (
              <div className="relative p-2 self-start mt-1">
                <div className="relative h-20 w-20">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill // This makes it fill the parent container
                    className="object-cover rounded-lg border border-black"
                    unoptimized
                  />
                </div>
                <button
                  onClick={() => setPreview(null)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 border hover:scale-110 transition-transform cursor-pointer"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            )}

            <div className="flex items-end">
              <textarea
                ref={inputRef}
                rows={1}
                value={text}
                onChange={handleInputChange}
                onFocus={() => setShowPicker(false)}
                placeholder="message..."
                className="w-full bg-transparent text-black p-2 text-sm outline-none leading-normal resize-none overflow-y-auto"
              />

              {/* EMOJI BUTTON: Still on the right */}
              <button
                onClick={toggleEmojiPicker}
                className="p-3 text-zinc-700 hover:text-purple-600 cursor-pointer z-50 transition-colors"
              >
                {showPicker ? <Keyboard size={22} /> : <Smile size={22} />}
              </button>
            </div>
          </div>

          <button
            className="bg-purple-200 text-purple-600 p-3 rounded-full self-center cursor-pointer"
            onClick={handleToggleGameList}
          >
            <Gamepad2 size={22} />
          </button>

          <button
            type="button"
            className="bg-purple-200 text-purple-600 p-3 rounded-full self-center"
            onClick={() => onSendMessage()}
          >
            <SendHorizontal size={22} />
          </button>
        </div>

        {/* 3. The Picker area*/}
        {showPicker && (
          <div className="w-full h-[300px] animate-in slide-in-from-bottom duration-200">
            <EmojiPicker
              theme="dark"
              emojiStyle="apple"
              onEmojiClick={onEmojiClick}
              width="100%"
              height="100%"
              skinTonesDisabled={false}
              searchDisabled
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}
        {isOpenGameList &&
          React.cloneElement(children, {
            isOpen: isOpenGameList,
            onClose: handleCloseGameList,
          })}
      </div>
    </div>
  );
}
