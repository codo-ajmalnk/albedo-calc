import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect based on user role, or to login if not logged in
    if (user) {
      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "coordinator":
          navigate("/coordinator");
          break;
        case "mentor":
          navigate("/mentor");
          break;
        default:
          navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [user, navigate]);
  
  // This is just a loading state - the useEffect will redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md mx-auto text-center p-8 rounded-2xl shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-primary/10">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Albedo Educator <span className="font-light">|</span> Calc
        </h1>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary/80" />
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
