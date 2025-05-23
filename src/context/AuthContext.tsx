
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, Role } from "@/lib/types";
import { users } from "@/lib/mock-data";
import { toast } from "@/components/ui/sonner";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize user state from localStorage
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Initialize theme from localStorage or system preference
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme as "light" | "dark";
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return "dark";
    }
    return "light";
  });

  // Apply theme class to document when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Persist user state to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Mock login function
  const login = async (email: string, password: string) => {
    // In a real app, this would validate against a backend
    const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser) {
      // Mock password check - in real app, would check hashed password
      if (password) {
        setUser(foundUser);
        // toast.success(`Welcome back, ${foundUser.name}`);
        return;
      }
    }
    
    // If we reach here, login failed
    throw new Error("Invalid email or password");
  };

  // Mock logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Clear user data from localStorage
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
    <AuthContext.Provider value={{ user, login, logout, forgotPassword, theme, setTheme }}>
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
