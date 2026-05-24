const { clearGame } = require("@/store/authSlice");

const onHandleExit = (dispatch, router, roomId, socket) => {
  if (roomId && socket) {
    socket.emit("leave-game", roomId);
  }

  router.replace("/dashboard");

  // Wipe the state after the redirect starts
  setTimeout(() => {
    dispatch(clearGame());
  }, 100);
};

module.exports = onHandleExit;
