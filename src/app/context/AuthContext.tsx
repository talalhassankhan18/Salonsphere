"use client";
import { createContext, useState, useContext, ReactNode } from "react";

// TypeScript interface for AuthContext
interface AuthContextType {
  email: string;
  setEmail: (email: string) => void;
}

// Creating the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Context Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [email, setEmail] = useState("");

  return (
    <AuthContext.Provider value={{ email, setEmail }}>
      {children}
    </AuthContext.Provider>
  );
};
