
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/lib/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // User is not logged in, redirect to login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no specific roles are required or the user's role is allowed
  if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // User's role is not allowed, redirect to their dashboard
  const redirectPath = `/${user.role}`;
  return <Navigate to={redirectPath} replace />;
};

export default ProtectedRoute;
