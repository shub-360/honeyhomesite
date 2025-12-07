import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Home, User, LogOut, Shield, Wrench } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import "./Header.css";

export const Header = () => {
  const navigate = useNavigate();
  const { user, role, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const getRoleIcon = () => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "technician":
        return <Wrench className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case "admin":
        return "Admin";
      case "technician":
        return "Technician";
      default:
        return "Customer";
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <div className="header-logo-icon">
            <Home />
          </div>
          <div>
            <h1 className="header-title">Honey Homes</h1>
            <p className="header-subtitle">Trusted Home Services</p>
          </div>
        </div>

        <nav className="header-nav">
          <a href="#services" className="header-nav-link">
            Services
          </a>
          <a href="#about" className="header-nav-link">
            How it Works
          </a>
          <a href="#contact" className="header-nav-link">
            Contact
          </a>
        </nav>

        <div className="header-actions">
          {loading ? (
            <div className="header-loading" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="header-user-btn">
                  {getRoleIcon()}
                  <span className="header-user-email">{user.email?.split("@")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="header-dropdown">
                <div className="header-dropdown-info">
                  <p className="header-dropdown-email">{user.email}</p>
                  <span className="header-dropdown-role">{getRoleLabel()}</span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="header-dropdown-logout">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
              <User className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}
          
          <Button variant="default" size="sm">
            Book Service
          </Button>
        </div>
      </div>
    </header>
  );
};
