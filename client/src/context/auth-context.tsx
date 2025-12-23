import React, { createContext, useContext, useState } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  user: { name: string; email: string; company: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  requireAuth: () => boolean; // Returns true if logged in, false and redirects if not
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthContextType["user"]>(null);

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setUser({
      name: "John Doe",
      email,
      company: "KINSA Global Partners",
    });
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  const requireAuth = () => {
    return isLoggedIn;
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, requireAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
