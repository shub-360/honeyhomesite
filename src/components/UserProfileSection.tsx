import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Wrench, User, Pencil } from "lucide-react";
import { EditProfileDialog } from "./EditProfileDialog";

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  avatar_url: string | null;
}

export const UserProfileSection = () => {
  const { user, role } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

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

  const getRoleBadgeColor = () => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-600 border-red-500/30";
      case "technician":
        return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      default:
        return "bg-green-500/20 text-green-600 border-green-500/30";
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-8 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20" />
        <CardContent className="p-6 -mt-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-background shadow-lg ring-2 ring-primary/20">
              <AvatarImage src={profile?.avatar_url || ""} alt={getDisplayName()} />
              <AvatarFallback className="text-xl font-semibold bg-primary text-primary-foreground">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-foreground">{getDisplayName()}</h2>
                <Badge variant="outline" className={`flex items-center gap-1.5 ${getRoleBadgeColor()}`}>
                  {getRoleIcon()}
                  <span>{getRoleLabel()}</span>
                </Badge>
              </div>
              <p className="text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-primary font-medium mt-2">
                {getGreeting()}, {profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0]}! Here's your activity overview.
              </p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setEditDialogOpen(true)}
              className="flex items-center gap-2 shrink-0"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>

          {(profile?.phone || profile?.address || profile?.city) && (
            <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 text-sm text-muted-foreground">
              {profile?.phone && (
                <span className="flex items-center gap-1.5">
                  📞 {profile.phone}
                </span>
              )}
              {(profile?.address || profile?.city) && (
                <span className="flex items-center gap-1.5">
                  📍 {[profile.address, profile.city].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <EditProfileDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen}
        profile={profile}
        onProfileUpdate={fetchProfile}
      />
    </>
  );
};
