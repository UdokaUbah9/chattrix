"use client";

import Footer from "../../components/Footer";
import { useSelector, useDispatch } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearUser,
  setActiveNotice,
  setGameIntro,
  setInComingChallenge,
  setIsShowChallengeModal,
  setOnlineUserList,
  setPlayerRole,
  setRoomId,
  setSession,
  setMessages,
} from "@/store/authSlice";
import { persistor } from "../../store/index";
import { Poppins } from "next/font/google"; // 👈 Change to Poppins
import { socket } from "@/utils/socket";
import SmileLoader from "@/components/SmileLoader";
import GameChallengeModal from "@/components/GameChallengeModal";
import { X } from "lucide-react";
import toast from "react-hot-toast";

const poppins = Poppins({
  weight: ["400", "600", "700"], // 👈 Define the weights you need
  subsets: ["latin"],
  variable: "--font-poppins", // 👈 Rename the variable
  display: "swap",
});

export default function DashboardGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const {
    user,
    isHydrated,
    token,
    activeNotice,
    activeChat,
    session,
    inComingChallenge,
    isShowChallengeModal,
    onlineUserList,
    messages,
  } = useSelector((state) => state.auth);
  const [pageName, setPageName] = useState("");
  const [isValidating, setIsValidating] = useState(true);

  const isMessage = pathname.includes("/message");
  const isRequestPath = pathname.includes("/request");
  const isGamePath = pathname.includes("game");
  const isPageName = pathname.includes("/chat");
  const isPasswordPage = pathname.includes("/settings/password");

  const isChatting = pathname.includes("/chat/") && activeChat?.receiverId;

  useEffect(() => {
    // 1. WAIT until Redux is hydrated and check if we even have a token
    if (!isHydrated) return;

    if (!token || !user) {
      setIsValidating(false);
      router.replace("/login");
      persistor.purge();
      return;
    }

    const checkUser = async function () {
      const { email, username } = user;
      try {
        const res = await fetch(
          `${NEXT_PUBLIC_API_URL}/api/smile/v1/users/getMe`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, username }),
          },
        );

        // 2. Check if the server actually authorized the token
        if (!res.ok) {
          throw new Error("Session expired or invalid token");
        }

        const data = await res.json();

        setIsValidating(false); // Success! Stop showing loader
      } catch (err) {
        dispatch(clearUser()); // Wipe the "fake" or expired data
        await persistor.purge(); // Clears LocalStorage Disk officially
        router.replace("/login");
      }
    };

    checkUser();
  }, [isHydrated, token, user, router, dispatch, session]); // 3. Added token/user/dispatch here

  // DYNAMIC PAGE NAME
  useEffect(
    function () {
      if (pathname.includes("chat")) {
        setPageName("CHAT");
        return;
      }
      if (pathname.includes("peeps")) {
        setPageName("PEEPS");
        return;
      }
      if (pathname.includes("password")) {
        setPageName("");
        return;
      }
      if (pathname.includes("me")) {
        setPageName("ME");
        return;
      }
    },
    [pageName, pathname],
  );

  //////////////////////////////////////////////////
  useEffect(() => {
    if (!socket || !user) return;

    //Attach the identity to the socket's auth object
    socket.auth = {
      userId: user._id,
      userName: user.username,
    };

    socket.connect();

    const fetchOnlineUsersId = (onlineIds) => {
      dispatch(setOnlineUserList(onlineIds));
    };
    // Function to perform the handshake
    const identify = () => {
      socket.emit("identify-user", user._id);
      socket.on("update-online-users", fetchOnlineUsersId);
    };

    //If disconnected, Connect it
    if (socket.disconnected) {
      socket.connect();
    }

    // 1. Identify immediately if already connected
    if (socket.connected) identify();

    // 2. Identify whenever the socket connects (or reconnects after a refresh)
    socket.on("connect", identify);

    return () => {
      socket.off("connect", identify);
      socket.off("update-online-users", fetchOnlineUsersId);
    };
  }, [user, dispatch]);

  /////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (!socket) return;

    const handleChallenge = (data) => {
      dispatch(setInComingChallenge(data));
      dispatch(setIsShowChallengeModal(true));
    };

    socket.on("receive-challenge", handleChallenge);

    return () => socket.off("receive-challenge", handleChallenge);
  }, [dispatch]);

  // UseEffect to re-render the Game rejection
  useEffect(() => {
    if (!socket) return;

    let hideTimer;

    socket.on("challenge-declined", (data) => {
      if (hideTimer) clearTimeout(hideTimer);

      dispatch(
        setActiveNotice({
          type: "rejection",
          message: data.message,
          time: new Date(),
        }),
      );

      // Auto-hide after 5 seconds if you want, or keep it pinned!
      hideTimer = setTimeout(() => dispatch(setActiveNotice(null)), 5000);
    });

    return () => {
      socket.off("challenge-declined");
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [dispatch]);

  // Handle reject Challenge
  const handleRejectChallenge = function () {
    dispatch(setIsShowChallengeModal(false));

    socket.emit("reject-challenge", {
      receiverId: inComingChallenge.sender._id,
      senderId: user._id, // The ID of the person who challenged you
    });
  };

  const isOnline = onlineUserList.includes(inComingChallenge?.sender?._id);
  //accept challenge
  const onAccept = () => {
    if (!isOnline) {
      toast.error(`${inComingChallenge.sender.username} is now offline`);
      return;
    }
    // We ONLY send the challengeId.
    // The server knows who 'we' are via the socket connection itself.
    socket.emit("accept-challenge", {
      challengeId: inComingChallenge.challengeId,
      sender: inComingChallenge.sender, // The person who challenged you
      receiverId: user._id, // Your ID
      gamePath: inComingChallenge.gamePath,
    });
  };

  // Inside your Layout or Game Launcher component
  useEffect(() => {
    const handleAssignRole = (role) => {
      dispatch(setPlayerRole(role));
    };

    const handleStartGame = ({ roomId, session, gamePath }) => {
      dispatch(setRoomId(roomId));
      dispatch(setSession(session));
      dispatch(setActiveNotice(null));
      router.replace(`/dashboard/game-arena/${gamePath}`);
      dispatch(setGameIntro(true));
    };

    socket.on("assign-role", handleAssignRole);
    socket.on("start-game", handleStartGame);

    return () => {
      socket.off("assign-role", handleAssignRole);
      socket.off("start-game", handleStartGame);
    };
  }, [dispatch, router, inComingChallenge]);

  useEffect(() => {
    if (activeNotice?.message) {
      // Trigger the toast
      toast.error(activeNotice.message, {
        id: "active-notice-toast", // Prevents duplicate toasts if the state updates rapidly
        icon: "🚫",
        // Smile Neobrutalist Style
        style: {
          border: "3px solid #000",
          borderRadius: "9999px",
          background: "#fff",
          color: "#000",
          fontWeight: "900",
          textTransform: "uppercase",
          fontSize: "12px",
        },
      });

      // Optional: Clear the Redux state after showing it
      dispatch(setActiveNotice(null));
    }
  }, [activeNotice, dispatch]);

  // Listen for the status changing to "read"
  useEffect(() => {
    if (!socket) return;

    socket.on("message-delivered-update", ({ messageId }) => {
      // ✅ Map through the current 'messages' from your selector
      const updatedMessages = messages.map((msg) =>
        String(msg._id) === String(messageId)
          ? { ...msg, status: "delivered" }
          : msg,
      );

      dispatch(setMessages(updatedMessages));
    });

    return () => socket.off("message-delivered-update");
  }, [dispatch, messages]);

  if (!isHydrated || isValidating) return <SmileLoader />;
  if (isGamePath && !session && !session?.player1 && !session?.player2) {
    return <SmileLoader />;
  }

  if (!user) return null;

  return (
    <div
      className={`flex flex-col md:flex-row h-screen w-full overflow-hidden ${
        !isMessage && !isGamePath && "pt-0 pb-0"
      } ${isGamePath ? "bg-yellow-400" : "bg-yellow-300"} ${poppins.className}`}
    >
      {/* 1. Sidebar/Footer - Appears first in DOM for md:flex-row (Left side) */}
      {!isRequestPath && !isGamePath && !isPasswordPage && <Footer />}

      {/* 2. Main Content Container */}
      <div className="flex-1 flex flex-col w-full min-w-0 overflow-y-auto scrollbar-hide">
        {!isPageName && !isGamePath && !isPasswordPage && (
          <p
            className={`text-2xl font-bold text-zinc-900 uppercase leading-none select-none ${!isGamePath && "p-5"} tracking-wide`}
          >
            {pageName}
          </p>
        )}

        <div className="flex-1">{children}</div>

        {!isGamePath && (
          <GameChallengeModal
            isOpen={isShowChallengeModal}
            challenge={inComingChallenge}
            onAccept={onAccept}
            onReject={handleRejectChallenge}
          />
        )}
      </div>
    </div>
  );
}
