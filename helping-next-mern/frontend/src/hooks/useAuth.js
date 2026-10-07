import { useAuthContext } from "../context/AuthContext";

// Thin convenience wrapper around AuthContext — import this in
// components instead of the context directly, e.g.:
//   const { user, isAuthenticated, logout } = useAuth();
export function useAuth() {
  return useAuthContext();
}

export default useAuth;
