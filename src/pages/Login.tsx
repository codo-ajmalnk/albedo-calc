import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [error, setError] = useState("");
  
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
        toast.success("Reset instructions sent to your email");
      } else {
        await login(email, password);
        
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
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="text-center space-y-2">
            <CardTitle className="text-sm text-muted-foreground">
              Welcome to
            </CardTitle>
            <h1 className="text-2xl font-bold">Albedo Educator | Calc</h1>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input 
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            {!forgotMode && (
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input 
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!forgotMode}
                />
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading 
                ? "Loading..." 
                : forgotMode 
                  ? "Reset Password" 
                  : "Login"
              }
            </Button>
            
            <Button 
              type="button" 
              variant="link" 
              className="w-full text-sm"
              onClick={() => setForgotMode(!forgotMode)}
            >
              {forgotMode 
                ? "Back to login" 
                : "Forgot your password?"
              }
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Demo accounts:</p>
              <p>admin@example.com</p>
              <p>coordinator1@example.com</p>
              <p>mentor1@example.com</p>
              <p className="mt-2">Any password will work</p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
