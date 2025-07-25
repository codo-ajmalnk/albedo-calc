import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { NotificationPanel } from "./NotificationPanel";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { ConfirmationModal } from "./ui/confirmation-modal";

type Role = "admin" | "coordinator" | "mentor" | "student";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  const NavLink = ({
    to,
    children,
  }: {
    to: string;
    children: React.ReactNode;
  }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={cn(
          "px-4 py-2 rounded-lg transition-all duration-200 relative group",
          "dark:hover:bg-white/10 shadow-md dark:hover:text-white hover:bg-black/10 hover:text-black",
          isActive
            ? "dark:text-white text-black"
            : "dark:text-white/80 text-black/80"
        )}
      >
        <span className="relative z-10">{children}</span>
        {isActive && (
          <motion.div
            layoutId="active-nav"
            className="absolute inset-0 dark:bg-white/10 bg-black/10 rounded-lg shadow-md"
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
            <NavLink to="/admin/teachers">Teachers</NavLink>
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
          "bg-card shadow-md",
          scrolled
            ? "shadow-lg bg-opacity-95 backdrop-blur-lg"
            : "bg-opacity-98"
        )}
      >
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-1">
          <div className="flex items-center h-14 sm:h-16 md:h-18 w-full">
            {/* Left: Logo and user badge */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-1 sm:gap-2"
              >
                <span className="bg-clip-text text-palette-purple">
                  Albedo Educator
                </span>
                <span className="text-palette-info/80 mx-0.5 sm:mx-1">|</span>
                <span className="text-palette-info/90 font-semibold">Calc</span>
              </motion.h1>
              <div className="hidden xs:flex items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    // Use accent color for badge background
                    "text-xs sm:text-sm bg-palette-accent text-white/90 rounded-full px-2 sm:px-3 py-1",
                    "font-medium backdrop-blur-sm transition-all duration-200",
                    "hover:bg-palette-accent/80 hover:scale-105",
                    "border border-white/10 shadow-sm"
                  )}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </motion.div>
              </div>
            </div>

            {/* Center: Nav links (xl+ only) */}
            <nav className="hidden xl:flex flex-wrap justify-center items-center flex-1 gap-x-3 gap-y-1 2xl:gap-x-5 3xl:gap-x-8 px-2">
              {renderNavLinks(user.role)}
            </nav>

            {/* Right: Controls (xl+ only) */}
            <div className="hidden xl:flex items-center gap-2 flex-shrink-0">
              <NotificationPanel />
              <ThemeToggle />
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogoutClick}
                  className={cn(
                    "hover:bg-white/90 hover:text-black transition-all duration-200",
                    "shadow-sm hover:shadow-md active:shadow-sm",
                    "border border-white/10"
                  )}
                >
                  Logout
                </Button>
              </motion.div>
            </div>

            {/* Mobile/Tablet menu button (below xl) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "xl:hidden p-2 rounded-lg transition-colors duration-200 text-white ml-auto",
                "hover:bg-palette-accent/80 focus:outline-none focus:ring-2 focus:ring-white/20"
              )}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <motion.div
                animate={isMobileMenuOpen ? "open" : "closed"}
                variants={{
                  open: { rotate: 180 },
                  closed: { rotate: 0 },
                }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </motion.div>
            </motion.button>
          </div>

          {/* Mobile/Tablet nav dropdown */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="xl:hidden absolute left-0 right-0 top-full bg-palette-primary shadow-lg border-t border-white/10"
              >
                <div className="flex flex-col gap-1 py-2 px-2">
                  <div className="flex items-center gap-2 px-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                      <span className="text-xs text-white/90 font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm text-white/90 font-medium">
                        {user.name}
                      </div>
                      <div className="text-xs text-white/70">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </div>
                    </div>
                  </div>
                  <nav className="flex flex-col gap-1">
                    {renderNavLinks(user.role)}
                  </nav>
                  <div className="flex items-center gap-2 mt-2 px-2">
                    <ThemeToggle />
                    <NotificationPanel />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className={cn(
                      "w-full bg-palette-danger/10 hover:bg-palette-danger/20 text-palette-danger mt-2",
                      "transition-all duration-200 border border-palette-danger/20",
                      "hover:scale-[1.02] active:scale-[0.98]"
                    )}
                    onClick={handleLogoutClick}
                  >
                    Logout
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 md:px-6 pt-16 sm:pt-20 md:pt-24 pb-4 sm:pb-6 md:pb-8">
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
