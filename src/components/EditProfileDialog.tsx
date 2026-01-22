import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zip_code: string | null;
  avatar_url: string | null;
}

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile | null;
  onProfileUpdate: () => void;
}

export const EditProfileDialog = ({ 
  open, 
  onOpenChange, 
  profile, 
  onProfileUpdate 
}: EditProfileDialogProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zip_code: "",
  });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Update form when profile changes or dialog opens
  useEffect(() => {
    if (profile && open) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        country: profile.country || "",
        zip_code: profile.zip_code || "",
      });
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Phone validation - only allow digits and max 10 characters
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      return;
    }

    // Zip code validation - only allow alphanumeric and max 10 characters
    if (name === "zip_code") {
      const cleanValue = value.replace(/[^a-zA-Z0-9\s-]/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: cleanValue }));
      return;
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setUploading(true);

    try {
      // Create unique file path
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success("Avatar uploaded successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return;
    
    setRemoving(true);
    try {
      setAvatarUrl("");
      toast.success("Avatar removed");
    } finally {
      setRemoving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate phone number
    if (formData.phone && formData.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name || null,
          phone: formData.phone || null,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          country: formData.country || null,
          zip_code: formData.zip_code || null,
          avatar_url: avatarUrl || null,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      onProfileUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    if (formData.full_name) {
      return formData.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || "U";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
          <DialogTitle className="text-xl font-bold text-foreground">Edit Profile</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update your personal information and profile photo.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center gap-4 p-6 bg-secondary/50 rounded-xl border border-border">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <Avatar className="h-28 w-28 border-4 border-primary/20 shadow-lg ring-4 ring-primary/10">
                  <AvatarImage src={avatarUrl} alt="Profile" className="object-cover" />
                  <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200">
                  {uploading ? (
                    <Loader2 className="h-7 w-7 text-white animate-spin" />
                  ) : (
                    <Camera className="h-7 w-7 text-white" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </div>
              
              <div className="flex flex-col items-center gap-2">
                {avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={removing}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Remove Photo
                  </Button>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  Click avatar to upload • Max 2MB • JPG, PNG
                </p>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <h4 className="text-sm font-semibold text-foreground">Personal Information</h4>
              </div>
              
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-medium text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    maxLength={100}
                    className="h-11 bg-background border-border focus:border-primary focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="10-digit phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength={10}
                    className="h-11 bg-background border-border focus:border-primary focus:ring-primary/20"
                  />
                  {formData.phone && formData.phone.length > 0 && formData.phone.length < 10 && (
                    <p className="text-xs text-destructive">Phone must be exactly 10 digits</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <h4 className="text-sm font-semibold text-foreground">Address Information</h4>
              </div>
              
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-foreground">
                    Street Address
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Street address, apartment, suite, etc."
                    value={formData.address}
                    onChange={handleInputChange}
                    maxLength={200}
                    className="h-11 bg-background border-border focus:border-primary focus:ring-primary/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium text-foreground">
                      City
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      maxLength={100}
                      className="h-11 bg-background border-border focus:border-primary focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium text-foreground">
                      State
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleInputChange}
                      maxLength={100}
                      className="h-11 bg-background border-border focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="zip_code" className="text-sm font-medium text-foreground">
                      Zip Code
                    </Label>
                    <Input
                      id="zip_code"
                      name="zip_code"
                      placeholder="Zip/Postal code"
                      value={formData.zip_code}
                      onChange={handleInputChange}
                      maxLength={10}
                      className="h-11 bg-background border-border focus:border-primary focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium text-foreground">
                      Country
                    </Label>
                    <Input
                      id="country"
                      name="country"
                      placeholder="Country"
                      value={formData.country}
                      onChange={handleInputChange}
                      maxLength={100}
                      className="h-11 bg-background border-border focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={saving}
                className="px-6 h-11 border-border hover:bg-secondary"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saving || uploading}
                className="px-6 h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
