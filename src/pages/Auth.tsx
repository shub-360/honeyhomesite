import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Mail, Lock, User, Phone, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import "./Auth.css";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100),
  email: z.string().trim().email({ message: "Invalid email address" }),
  phone: z.string().trim().min(10, { message: "Invalid phone number" }).max(15),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading } = useAuth();
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

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
      navigate("/");
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
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner" />
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Button 
          variant="ghost" 
          className="auth-back-btn"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="auth-brand">
          <div className="auth-logo">
            <Home className="h-8 w-8" />
          </div>
          <h1 className="auth-title">Honey Homes</h1>
          <p className="auth-subtitle">Trusted Home Services</p>
        </div>

        <Tabs defaultValue="login" className="auth-tabs">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="auth-card">
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="auth-form">
                  <div className="auth-field">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="auth-input-wrapper">
                      <Mail className="auth-input-icon" />
                      <Input 
                        id="login-email" 
                        type="email" 
                        placeholder="your@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="auth-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="auth-field">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="auth-input-wrapper">
                      <Lock className="auth-input-icon" />
                      <Input 
                        id="login-password" 
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="auth-input"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card className="auth-card">
              <CardHeader>
                <CardTitle>Create your account</CardTitle>
                <CardDescription>
                  Join thousands of satisfied customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="auth-form">
                  <div className="auth-field">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="auth-input-wrapper">
                      <User className="auth-input-icon" />
                      <Input 
                        id="signup-name" 
                        placeholder="John Doe"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="auth-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="auth-field">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="auth-input-wrapper">
                      <Mail className="auth-input-icon" />
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="your@email.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="auth-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="auth-field">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <div className="auth-input-wrapper">
                      <Phone className="auth-input-icon" />
                      <Input 
                        id="signup-phone" 
                        type="tel" 
                        placeholder="+91 98765 43210"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        className="auth-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="auth-field">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="auth-input-wrapper">
                      <Lock className="auth-input-icon" />
                      <Input 
                        id="signup-password" 
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="auth-input"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
