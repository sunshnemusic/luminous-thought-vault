
import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/services/apiService";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => void;
  logout: () => void;
  register: (userData: { email: string; username: string; password: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const auth = useAuth();

  useEffect(() => {
    // Check if user is authenticated on initial load
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
