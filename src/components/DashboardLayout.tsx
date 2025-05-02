
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { ConfirmationModal } from "./ui/confirmation-modal";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationPanel } from "./NotificationPanel";

type Role = "admin" | "coordinator" | "mentor" | "student";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={cn(
          "px-4 py-2 rounded-lg transition-all duration-200 relative group",
          "hover:bg-white/10 hover:text-white",
          isActive ? "text-white bg-white/10" : "text-white/80"
        )}
      >
        <span className="relative z-10">{children}</span>
        {isActive && (
          <motion.div
            layoutId="active-nav"
            className="absolute inset-0 bg-white/10 rounded-lg"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </Link>
    );
  };

  const renderNavLinks = (role: Role) => {
    switch (role) {
      case "admin":
        return (
          <>
            <NavLink to="/admin">Dashboard</NavLink>
            <NavLink to="/admin/coordinators">Coordinators</NavLink>
            <NavLink to="/admin/mentors">Mentors</NavLink>
            <NavLink to="/admin/students">Students</NavLink>
            <NavLink to="/admin/notification-settings">Notifications</NavLink>
          </>
        );
      case "coordinator":
        return (
          <>
            <NavLink to="/coordinator">Dashboard</NavLink>
            <NavLink to="/coordinator/mentors">My Mentors</NavLink>
            <NavLink to="/coordinator/students">All Students</NavLink>
          </>
        );
      case "mentor":
        return (
          <>
            <NavLink to="/mentor">Dashboard</NavLink>
            <NavLink to="/mentor/students">My Students</NavLink>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      <header 
        className={cn(
          "fixed w-full top-0 z-50 transition-all duration-300",
          "bg-gradient-to-r from-primary via-primary to-primary/95",
          scrolled ? "shadow-lg bg-opacity-95 backdrop-blur-lg" : "bg-opacity-98"
        )}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16 sm:h-18">
            <div className="flex items-center space-x-4">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center space-x-2"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/90">
                  Albedo Educator
                </span>
                <span className="text-primary-foreground/80 mx-1">|</span>
                <span className="text-primary-foreground/90 font-semibold">Calc</span>
              </motion.h1>
              <div className="hidden md:flex items-center">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "text-xs sm:text-sm bg-white/10 text-white/90 rounded-full px-3 py-1.5",
                    "font-medium backdrop-blur-sm transition-all duration-200",
                    "hover:bg-white/15 hover:scale-105",
                    "border border-white/10 shadow-sm"
                  )}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </motion.div>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "md:hidden p-2 rounded-lg transition-colors duration-200 text-white",
                "hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
              )}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <motion.div
                animate={isMobileMenuOpen ? "open" : "closed"}
                variants={{
                  open: { rotate: 180 },
                  closed: { rotate: 0 }
                }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </motion.div>
            </motion.button>
            
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex items-center space-x-2">
                {renderNavLinks(user.role)}
              </nav>
              <div className="h-6 w-px bg-white/20" />
              <div className="flex items-center space-x-2">
                <NotificationPanel />
                <ThemeToggle />
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleLogoutClick}
                  className={cn(
                    "hover:bg-white/90 transition-all duration-200",
                    "shadow-sm hover:shadow-md active:shadow-sm",
                    "border border-white/10"
                  )}
                >
                  Logout
                </Button>
              </motion.div>
            </div>
          </div>
          
          {/* Mobile navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="md:hidden overflow-hidden"
              >
                <motion.div 
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="py-4 space-y-4 border-t border-white/10"
                >
                  <div className="flex items-center space-x-3 px-2">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                      <span className="text-sm text-white/90 font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm text-white/90 font-medium">{user.name}</div>
                      <div className="text-xs text-white/70">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <ThemeToggle />
                    <NotificationPanel />
                  </div>
                  <nav className="flex flex-col space-y-1 px-2">
                    {renderNavLinks(user.role)}
                  </nav>
                  <div className="px-2">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className={cn(
                        "w-full bg-red-500/10 hover:bg-red-500/20 text-red-500",
                        "transition-all duration-200 border border-red-500/20",
                        "hover:scale-[1.02] active:scale-[0.98]"
                      )}
                      onClick={handleLogoutClick}
                    >
                      Logout
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-6 sm:pb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-[2000px] mx-auto"
        >
          {children}
        </motion.div>
      </main>

      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
      />
    </div>
  );
}
