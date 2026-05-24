"use client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../store/index";
import SmileLoader from "./SmileLoader";

function AuthProvider({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={<SmileLoader />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}

export default AuthProvider;
