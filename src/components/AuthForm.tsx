
import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Mail } from "lucide-react";
import { loginUser, resetDefaultUsers } from "@/services/api";

interface AuthFormProps {
  onAuthenticate: (success: boolean, user?: any) => void;
  showResetButton?: boolean;
}

const AuthForm = ({ onAuthenticate, showResetButton = false }: AuthFormProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await loginUser(username, password);
      if (result.success) {
        onAuthenticate(true, result.user);
      } else {
        onAuthenticate(false);
      }
    } catch (error) {
      onAuthenticate(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDefaults = async () => {
    setIsResetting(true);
    try {
      await resetDefaultUsers();
      toast({
        title: "Demo passwords reset",
        description: "Use admin123 for admin, doctor1, and technician1.",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not reset users";
      toast({ title: "Reset failed", description: msg, variant: "destructive" });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className="w-full border-border/50 shadow-xl">
      <CardHeader className="space-y-3 pb-6">
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription className="text-base">
          Sign in to your account to access the system
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <Label htmlFor="username" className="text-sm font-medium">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Username
              </div>
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="h-11 rounded-lg border-border/50 bg-background/50 hover:bg-background transition-colors focus:bg-background"
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Password
                </div>
              </Label>
              <Link 
                to="/forgot-password" 
                className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Forgot?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 rounded-lg border-border/50 bg-background/50 hover:bg-background transition-colors focus:bg-background"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button 
            type="submit" 
            className="w-full h-11 rounded-lg font-semibold text-base"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
          {showResetButton && (
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 rounded-lg border-border/50"
              onClick={handleResetDefaults}
              disabled={isResetting || isLoading}
            >
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Fix Demo Passwords"
              )}
            </Button>
          )}
          <p className="text-xs text-muted-foreground text-center pt-2">
            Demo users: <span className="font-medium">admin</span>, <span className="font-medium">doctor1</span>, <span className="font-medium">technician1</span> (password: admin123)
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AuthForm;
