import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  const { login, forgotPassword } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      if (forgotMode) {
        await forgotPassword(email);
        setForgotMode(false);
        showSuccessToast("Reset instructions sent", "Please check your email for further instructions.");
      } else {
        await login(email, password);
        showSuccessToast("Login successful", "Welcome back!");
        
        // Based on roles redirect to different dashboards
        if (email.includes("admin")) {
          navigate("/admin");
        } else if (email.includes("coordinator")) {
          navigate("/coordinator");
        } else {
          navigate("/mentor");
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      showErrorToast("Authentication failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      </div>

      <motion.div 
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="relative overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-primary/20">
          {/* Animated background decoration */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20"
            animate={{
              background: [
                "radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 100% 0%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 0% 100%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)",
              ],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          
          <CardHeader className="relative space-y-1">
            <motion.div 
              className="text-center space-y-2"
              variants={itemVariants}
            >
              <motion.div
                variants={floatingVariants}
                initial="initial"
                animate="animate"
              >
                <CardTitle className="text-sm text-muted-foreground">
                  Welcome to
                </CardTitle>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Albedo Educator | Calc
                </h1>
              </motion.div>
            </motion.div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="relative space-y-4">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="relative"
                  >
                    <Alert variant="destructive" className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.div 
                className="space-y-2"
                variants={itemVariants}
              >
                <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <div className="relative group">
                  <Input 
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 pr-4 py-2 rounded-lg border border-muted-foreground/30 dark:border-white/20 bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/40 transition-all duration-200 text-base placeholder:text-muted-foreground/70 dark:placeholder:text-gray-400"
                    autoComplete="username"
                  />
                </div>
              </motion.div>
              
              {!forgotMode && (
                <motion.div 
                  className="space-y-2"
                  variants={itemVariants}
                >
                  <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </label>
                  <div className="relative group">
                    <Input 
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={!forgotMode}
                      className="pl-10 transition-all duration-200 group-hover:border-primary/50 focus:border-primary"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{showPassword ? "Hide password" : "Show password"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </motion.div>
              )}
            </CardContent>
            
            <CardFooter className="relative flex flex-col space-y-4">
              <motion.div variants={itemVariants} className="w-full">
                <Button 
                  type="submit" 
                  className={cn(
                    "w-full group relative overflow-hidden",
                    isLoading && "opacity-70 cursor-not-allowed"
                  )}
                  disabled={isLoading}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0"
                    animate={{
                      x: isHovering ? ["-100%", "100%"] : "100%",
                    }}
                    transition={{
                      duration: 1,
                      ease: "linear",
                    }}
                  />
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    <>
                      {forgotMode ? "Reset Password" : "Login"}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Button 
                  type="button" 
                  variant="link" 
                  className="w-full text-sm hover:text-primary transition-colors"
                  onClick={() => setForgotMode(!forgotMode)}
                >
                  {forgotMode ? "Back to login" : "Forgot your password?"}
                </Button>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="text-center text-sm text-muted-foreground space-y-1"
              >
                <p className="font-medium">Demo accounts:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    <p className="font-medium text-primary">Admin</p>
                    <p className="truncate">admin@example.com</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    <p className="font-medium text-primary">Coordinators</p>
                    <p className="truncate">jane@example.com</p>
                    <p className="truncate">john@example.com</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    <p className="font-medium text-primary">Mentor</p>
                    <p className="truncate">mike@example.com</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    <p className="font-medium text-primary">Password</p>
                    <p>Any password will work</p>
                  </div>
                </div>
              </motion.div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
