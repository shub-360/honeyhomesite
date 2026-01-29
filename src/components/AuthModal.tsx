import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Mail, Lock, User, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import "./AuthModal.css";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100),
  email: z.string().trim().email({ message: "Invalid email address" }),
  phone: z.string().trim().regex(/^\d{10}$/, { message: "Only 10 digits allowed" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
  onSuccess?: () => void;
}

export const AuthModal = ({ open, onOpenChange, message, onSuccess }: AuthModalProps) => {
  const { signIn, signUp } = useAuth();
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setLoginEmail("");
    setLoginPassword("");
    setSignupName("");
    setSignupEmail("");
    setSignupPhone("");
    setSignupPassword("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsSubmitting(false);
    
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password. Please try again.");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Welcome back!");
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = signupSchema.safeParse({
      fullName: signupName,
      email: signupEmail,
      phone: signupPhone,
      password: signupPassword,
    });
    
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName, signupPhone);
    setIsSubmitting(false);
    
    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered. Please login instead.");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Account created successfully! Welcome to Honey Homes.");
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="auth-modal-content">
        <DialogHeader>
          <div className="auth-modal-brand">
            <div className="auth-modal-logo">
              <Home className="h-7 w-7" />
            </div>
            <DialogTitle className="auth-modal-title">Honey Homes</DialogTitle>
            <p className="auth-modal-subtitle">Your trusted partner for home services</p>
            {message && (
              <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-primary font-medium text-center">{message}</p>
              </div>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="login" className="auth-modal-tabs">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="auth-modal-form">
              <div className="auth-modal-field">
                <Label htmlFor="modal-login-email">Email Address</Label>
                <div className="auth-modal-input-wrapper">
                  <Mail className="auth-modal-input-icon" />
                  <Input 
                    id="modal-login-email" 
                    type="email" 
                    placeholder="Enter your email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="auth-modal-input"
                    required
                  />
                </div>
              </div>
              <div className="auth-modal-field">
                <Label htmlFor="modal-login-password">Password</Label>
                <div className="auth-modal-input-wrapper">
                  <Lock className="auth-modal-input-icon" />
                  <Input 
                    id="modal-login-password" 
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="auth-modal-input"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="auth-modal-submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="auth-modal-form">
              <div className="auth-modal-field">
                <Label htmlFor="modal-signup-name">Full Name</Label>
                <div className="auth-modal-input-wrapper">
                  <User className="auth-modal-input-icon" />
                  <Input 
                    id="modal-signup-name" 
                    placeholder="Enter your full name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="auth-modal-input"
                    required
                  />
                </div>
              </div>
              <div className="auth-modal-field">
                <Label htmlFor="modal-signup-email">Email Address</Label>
                <div className="auth-modal-input-wrapper">
                  <Mail className="auth-modal-input-icon" />
                  <Input 
                    id="modal-signup-email" 
                    type="email" 
                    placeholder="Enter your email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="auth-modal-input"
                    required
                  />
                </div>
              </div>
              <div className="auth-modal-field">
                <Label htmlFor="modal-signup-phone">Phone Number</Label>
                <div className="auth-modal-input-wrapper">
                  <Phone className="auth-modal-input-icon" />
                  <Input 
                    id="modal-signup-phone" 
                    type="tel" 
                    placeholder="9876543210"
                    value={signupPhone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setSignupPhone(value);
                    }}
                    maxLength={10}
                    className="auth-modal-input"
                    required
                  />
                </div>
              </div>
              <div className="auth-modal-field">
                <Label htmlFor="modal-signup-password">Password</Label>
                <div className="auth-modal-input-wrapper">
                  <Lock className="auth-modal-input-icon" />
                  <Input 
                    id="modal-signup-password" 
                    type="password"
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="auth-modal-input"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="auth-modal-submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
