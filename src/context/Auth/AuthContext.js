import React, { createContext } from "react";
import useAuth from "../../hooks/useAuth.js/index.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
