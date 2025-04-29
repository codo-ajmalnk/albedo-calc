
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4 text-primary">Progress Pathways</h1>
        <p className="text-xl text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
};

export default Index;
