import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { showErrorToast } from "@/lib/toast";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Log the error for monitoring
    console.error(
      `[404] Route not found: ${location.pathname}`,
      {
        timestamp: new Date().toISOString(),
        path: location.pathname,
        search: location.search,
        hash: location.hash,
      }
    );

    // Show user-friendly error message
    showErrorToast(
      "Page Not Found",
      `The requested page "${location.pathname}" could not be found.`
    );
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full mx-4 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
      >
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20 
            }}
          >
            <h1 className="text-8xl font-bold text-primary mb-2">404</h1>
          </motion.div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Oops! Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Requested URL: <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">{location.pathname}</code>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </Button>
            <Button asChild>
              <Link to="/" className="group">
                <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Return to Dashboard
              </Link>
            </Button>
          </div>

          <div className="pt-6 text-sm text-gray-500 dark:text-gray-400">
            <p>Need help? Contact our support team at</p>
            <a 
              href="mailto:support@albedoedu.com" 
              className="text-primary hover:underline"
            >
              support@albedoedu.com
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
