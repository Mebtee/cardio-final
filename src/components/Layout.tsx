
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, LogOut, User, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "./Footer";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/5">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 md:h-20 items-center px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Logo & Branding */}
          <Link 
            to="/" 
            className="flex items-center gap-3 font-bold hover:opacity-80 transition-all duration-300 group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
              <Heart className="h-5 w-5 text-white" fill="white" />
              <Activity className="h-3 w-3 text-white/60 absolute -top-1 -right-1" />
            </div>
            <div className="flex flex-col hidden sm:block">
              <span className="text-base md:text-lg leading-tight font-bold text-foreground">
                HeartSight AI
              </span>
              <span className="text-xs text-muted-foreground font-normal">
                Cardiomegaly Detection
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="ml-auto flex items-center gap-2 md:gap-3">
            {!isLoginPage && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate("/profile")}
                  className="hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-lg"
                >
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200 rounded-lg"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container px-4 md:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
