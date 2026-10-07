import { createContext, useContext, useState } from "react";

// Lightweight auth context so pages/components can read the logged-in
// user without prop-drilling. Login.jsx/Register.jsx call login(user, token)
// after a successful /login or /register API call; the token then gets
// attached to every request by src/services/api.js.
const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser); // { name, email, role, phone } | null
  const [token, setToken] = useState(() => localStorage.getItem("auth_token"));

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    if (authToken) localStorage.setItem("auth_token", authToken);
    if (userData) localStorage.setItem("auth_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return ctx;
}

export default AuthContext;
