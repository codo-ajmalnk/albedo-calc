import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Role = "admin" | "coordinator" | "mentor" | "student";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderNavLinks = (role: Role) => {
    switch (role) {
      case "admin":
        return (
          <>
            <Link to="/admin" className="px-4 py-2 hover:bg-primary/10 rounded-md">Dashboard</Link>
            <Link to="/admin/coordinators" className="px-4 py-2 hover:bg-primary/10 rounded-md">Coordinators</Link>
            <Link to="/admin/mentors" className="px-4 py-2 hover:bg-primary/10 rounded-md">Mentors</Link>
            <Link to="/admin/students" className="px-4 py-2 hover:bg-primary/10 rounded-md">Students</Link>
            <Link to="/admin/batches" className="px-4 py-2 hover:bg-primary/10 rounded-md">Batches</Link>
          </>
        );
      case "coordinator":
        return (
          <>
            <Link to="/coordinator" className="px-4 py-2 hover:bg-primary/10 rounded-md">Dashboard</Link>
            <Link to="/coordinator/mentors" className="px-4 py-2 hover:bg-primary/10 rounded-md">My Mentors</Link>
            <Link to="/coordinator/students" className="px-4 py-2 hover:bg-primary/10 rounded-md">All Students</Link>
          </>
        );
      case "mentor":
        return (
          <>
            <Link to="/mentor" className="px-4 py-2 hover:bg-primary/10 rounded-md">Dashboard</Link>
            <Link to="/mentor/students" className="px-4 py-2 hover:bg-primary/10 rounded-md">My Students</Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">Progress Pathways</h1>
              <div className="hidden md:block text-sm bg-white/20 rounded-full px-3 py-1">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </div>
            </div>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
            
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-sm">Welcome, {user.name}</div>
              {renderNavLinks(user.role)}
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
          
          {/* Mobile navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 space-y-2">
              <div className="font-medium">Welcome, {user.name}</div>
              <div className="flex flex-col space-y-2">
                {renderNavLinks(user.role)}
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
