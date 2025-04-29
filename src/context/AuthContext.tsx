
import { createContext, useContext, useState, ReactNode } from "react";
import { User, Role } from "@/lib/types";
import { users } from "@/lib/mock-data";
import { toast } from "@/components/ui/sonner";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Mock login function
  const login = async (email: string, password: string) => {
    // In a real app, this would validate against a backend
    const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser) {
      // Mock password check - in real app, would check hashed password
      if (password) {
        setUser(foundUser);
        toast.success(`Welcome back, ${foundUser.name}`);
        return;
      }
    }
    
    // If we reach here, login failed
    throw new Error("Invalid email or password");
  };

  // Mock logout function
  const logout = () => {
    setUser(null);
    toast.info("You have been logged out");
  };

  // Mock forgot password function
  const forgotPassword = async (email: string) => {
    const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser) {
      // In a real app, would send an email with password reset link
      toast.success("Password reset instructions have been sent to your email");
      return;
    }
    
    throw new Error("No account found with that email");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
