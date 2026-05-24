import { createSlice } from "@reduxjs/toolkit";
import { REHYDRATE } from "redux-persist";

const initialState = {
  user: null, // authenticated user
  token: null,
  isHydrated: false, // loading | authenticated | unauthenticated
  pendingSignUp: null, // signup flow only
  forgottenPasswordEmail: null, // forgot password flow only
  activeNotice: null,
  activeChat: null,
  roomId: null,
  inComingChallenge: null,
  session: null,
  scores: { player1: 0, player2: 0 },
  isStealing: false,
  playerRole: null, // 'player1' or 'player2'
  showVictory: false,
  winner: null,
  isShowChallengeModal: true,
  gameTimer: 60,
  scrambleWord: null,
  isGameIntro: false,
  gameStatus: "",
  guessedList: [],
  onlineUserList: [],
  messages: [],
  messageStatus: null,
  isTyping: false,
  unreadUsers: [],
  conversationUsers: [],
  chatUsers: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },

    clearUser(state) {
      state.user = null;
      state.token = null;
    },

    setPendingSignUp(state, action) {
      state.pendingSignUp = action.payload;
    },
    setForgottenPasswordEmail(state, action) {
      state.forgottenPasswordEmail = action.payload;
    },
    setActiveNotice(state, action) {
      state.activeNotice = action.payload;
    },
    setActiveChat(state, action) {
      state.activeChat = action.payload;
    },
    setSession(state, action) {
      state.session = { ...action.payload };
    },
    setScores(state, action) {
      state.scores = action.payload;
    },
    setRoomId(state, action) {
      state.roomId = action.payload;
    },
    setPlayerRole(state, action) {
      state.playerRole = action.payload;
    },
    setIsStealing(state, action) {
      state.isStealing = action.payload;
    },
    setShowVictory(state, action) {
      state.showVictory = action.payload;
    },
    setWinner(state, action) {
      state.winner = action.payload;
    },
    setInComingChallenge(state, action) {
      state.inComingChallenge = action.payload;
    },
    setGameIntro(state, action) {
      state.isGameIntro = action.payload;
    },
    setGameStatus(state, action) {
      state.gameStatus = action.payload;
    },
    clearGame(state) {
      state.roomId = null;
      state.session = null;
      state.playerRole = null;
      state.showVictory = null;
      state.scores = { player1: 0, player2: 0 };
      state.winner = null;
      state.guessedList = [];
      state.scrambleWord = null;
      state.gameStatus = "";
    },
    setIsShowChallengeModal(state, action) {
      state.isShowChallengeModal = action.payload;
    },
    setGameTimer(state, action) {
      state.gameTimer = action.payload;
    },
    setScrambleWord(state, action) {
      state.scrambleWord = action.payload;
    },
    setGuessedList(state, action) {
      state.guessedList.push(action.payload);
    },
    setOnlineUserList(state, action) {
      state.onlineUserList = action.payload;
    },
    setMessages(state, action) {
      state.messages = action.payload;
      if (Array.isArray(action.payload) && action.payload.length === 0) {
        state.unreadUsers = [];
      }
    },
    setChatUsers(state, action) {
      state.chatUsers = action.payload;
    },
    setConversationUsers: (state, action) => {
      state.conversationUsers = action.payload;
    },
    addNewMessage: (state, action) => {
      const newMessage = action.payload;

      // 1. STRICT CHECK: Ensure the ID doesn't already exist in the array
      const exists = state.messages.some(
        (msg) => String(msg._id) === String(newMessage._id),
      );

      if (!exists) {
        // 2. Prepend the message only if it's truly new
        state.messages = [newMessage, ...state.messages];

        // 3. Simple Indicator Logic
        const senderId = String(newMessage.senderId);
        const isFromMe = senderId === String(state.user?._id);
        const isCurrentChat = senderId === String(state.activeChat?.receiverId);

        if (!isFromMe && !isCurrentChat) {
          if (!state.unreadUsers.includes(senderId)) {
            state.unreadUsers.push(senderId);
          }
        }
      }
    },
    moveChatUserToTop: (state, action) => {
      const userId = String(action.payload);
      const idx = state.chatUsers.findIndex((u) => String(u._id) === userId);
      if (idx === -1) return;
      const updated = [...state.chatUsers];
      const [moved] = updated.splice(idx, 1);
      state.chatUsers = [moved, ...updated];
    },

    addToChatUsers: (state, action) => {
      const exists = state.chatUsers.some(
        (u) => String(u._id) === String(action.payload._id),
      );
      if (!exists) {
        state.chatUsers = [action.payload, ...state.chatUsers];
      }
    },

    markAsRead: (state, action) => {
      // Remove user ID from unread list when chat is opened
      state.unreadUsers = state.unreadUsers.filter(
        (id) => id !== String(action.payload),
      );
    },
    setMessageStatus(state, action) {
      state.messageStatus = action.payload;
    },
    setIsTyping(state, action) {
      state.isTyping = action.payload;
    },
  },
  extraReducers: (builder) => {
    // We only care about the "Signal"
    builder.addCase(REHYDRATE, (state, action) => {
      // 1. Check if we have saved data for the 'auth' slice in LocalStorage
      if (action.payload && action.payload.auth) {
        // 2. Put the saved user back into the state
        state.user = action.payload.auth.user;
        state.token = action.payload.auth.token;
        state.pendingSignUp = action.payload.auth.pendingSignUp;
        state.forgottenPasswordEmail =
          action.payload.auth.forgottenPasswordEmail;
        state.activeNotice = action.payload.auth.activeNotice;
        state.activeChat = action.payload.auth.activeChat;
        state.playerRole = action.payload.auth.playerRole;
        state.session = action.payload.auth.session;
        state.roomId = action.payload.auth.roomId;
        state.scores = action.payload.auth.scores;
        state.showVictory = action.payload.auth.showVictory;
        state.winner = action.payload.auth.winner;
        state.inComingChallenge = action.payload.auth.inComingChallenge;
        state.isShowChallengeModal = action.payload.auth.isShowChallengeModal;
        state.gameTimer = action.payload.auth.gameTimer;
        state.scrambleWord = action.payload.auth.scrambleWord;
        state.isGameIntro = action.payload.auth.isGameIntro;
        state.gameStatus = action.payload.auth.gameStatus;
        state.guessedList = action.payload.auth.guessedList;
        state.onlineUserList = action.payload.auth.onlineUserList;
        state.messageStatus = action.payload.auth.messageStatus;
        state.unreadUsers = action.payload.auth.unreadUsers;
        state.messages = action.payload.auth.messages || [];
        state.chatUsers = action.payload.auth.chatUsers || [];
      }
      // 3. Signal that the check is finished
      state.isHydrated = true;
    });
  },
});

export const {
  setUser,
  clearUser,
  setPendingSignUp,
  setForgottenPasswordEmail,
  setActiveNotice,
  setSession,
  setRoomId,
  setPlayerRole,
  setActiveChat,
  clearGame,
  setIsStealing,
  setScores,
  setShowVictory,
  setWinner,
  setInComingChallenge,
  setIsShowChallengeModal,
  setGameTimer,
  setScrambleWord,
  setGameIntro,
  setGameStatus,
  setGuessedList,
  setOnlineUserList,
  setMessages,
  setMessageStatus,
  setIsTyping,
  addNewMessage,
  markAsRead,
  setConversationUsers,
  setChatUsers,
  moveChatUserToTop,
  addToChatUsers,
} = authSlice.actions;

export default authSlice.reducer;
