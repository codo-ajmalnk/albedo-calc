
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/lib/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
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
            <Link to="/admin" className="block px-4 py-2 hover:bg-primary/10 rounded-md">Dashboard</Link>
            <Link to="/admin/coordinators" className="block px-4 py-2 hover:bg-primary/10 rounded-md">Coordinators</Link>
            <Link to="/admin/mentors" className="block px-4 py-2 hover:bg-primary/10 rounded-md">Mentors</Link>
            <Link to="/admin/students" className="block px-4 py-2 hover:bg-primary/10 rounded-md">Students</Link>
            <Link to="/admin/batches" className="block px-4 py-2 hover:bg-primary/10 rounded-md">Batches</Link>
          </>
        );
      case "coordinator":
        return (
          <>
            <Link to="/coordinator" className="block px-4 py-2 hover:bg-primary/10 rounded-md">Dashboard</Link>
            <Link to="/coordinator/mentors" className="block px-4 py-2 hover:bg-primary/10 rounded-md">My Mentors</Link>
            <Link to="/coordinator/students" className="block px-4 py-2 hover:bg-primary/10 rounded-md">All Students</Link>
          </>
        );
      case "mentor":
        return (
          <>
            <Link to="/mentor" className="block px-4 py-2 hover:bg-primary/10 rounded-md">Dashboard</Link>
            <Link to="/mentor/students" className="block px-4 py-2 hover:bg-primary/10 rounded-md">My Students</Link>
          </>
        );
      default:
        return null;
    }
  };
  
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
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
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
        
        {/* Mobile navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden p-4 bg-white text-primary">
            <div className="space-y-2">
              <div className="font-medium">Welcome, {user.name}</div>
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
      </header>
      
      <div className="flex">
        {/* Sidebar for desktop */}
        <aside className="hidden md:block w-64 bg-white h-[calc(100vh-64px)] shadow-sm p-4">
          <nav className="space-y-2">
            {renderNavLinks(user.role)}
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
