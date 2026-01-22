import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, User, LogOut, Shield, Wrench, ShoppingCart, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthModal } from "./AuthModal";
import "./Header.css";

interface UserProfile {
  full_name: string | null;
  avatar_url: string | null;
}

export const Header = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { user, role, signOut, loading } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        return;
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    };

    fetchProfile();

    // Subscribe to profile changes for real-time updates
    if (user) {
      const channel = supabase
        .channel('profile-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            setProfile(payload.new as UserProfile);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    setProfile(null);
    toast.success("Logged out successfully");
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
        return "Service Provider";
      default:
        return "Customer";
    }
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || "U";
  };

  const getDisplayName = () => {
    return profile?.full_name || user?.email?.split("@")[0] || "User";
  };

  return (
    <header className="header">
      <div className="header-container">
        <div 
          className="header-logo cursor-pointer transition-transform duration-200 hover:scale-105"
          onClick={() => navigate("/")}
        >
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
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative"
                onClick={() => navigate("/dashboard")}
              >
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="header-user-btn flex items-center gap-2 px-2">
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      <AvatarImage src={profile?.avatar_url || ""} alt={getDisplayName()} />
                      <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="header-user-email hidden sm:inline">{getDisplayName()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="header-dropdown w-56">
                  <div className="header-dropdown-info flex items-center gap-3 p-3">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarImage src={profile?.avatar_url || ""} alt={getDisplayName()} />
                      <AvatarFallback className="text-sm font-semibold bg-primary text-primary-foreground">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{getDisplayName()}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <span className="inline-flex items-center gap-1 mt-1 text-xs text-primary">
                        {getRoleIcon()}
                        {getRoleLabel()}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  {role === "admin" && (
                    <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  {role === "technician" && (
                    <DropdownMenuItem onClick={() => navigate("/service-provider")} className="cursor-pointer">
                      <Wrench className="h-4 w-4 mr-2" />
                      My Jobs
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="header-dropdown-logout">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setAuthModalOpen(true)}>
              <User className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}
          
          <Button variant="default" size="sm">
            Book Service
          </Button>
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </header>
  );
};
