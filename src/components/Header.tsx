import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, User, Shield, Star } from "lucide-react";
import "./Header.css";

export const Header = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

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
          <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="auth-dialog-title">Welcome to Honey Homes</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="login" className="auth-tabs">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Card>
                    <CardHeader>
                      <CardTitle>Login to your account</CardTitle>
                      <CardDescription>
                        Enter your credentials to access your bookings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="auth-card-content">
                      <div className="auth-form-field">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="your@email.com" />
                      </div>
                      <div className="auth-form-field">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" />
                      </div>
                      <Button className="w-full" variant="default">
                        Login
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="signup">
                  <Card>
                    <CardHeader>
                      <CardTitle>Create your account</CardTitle>
                      <CardDescription>
                        Join thousands of satisfied customers
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="auth-card-content">
                      <div className="auth-form-field">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="John Doe" />
                      </div>
                      <div className="auth-form-field">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input id="signup-email" type="email" placeholder="your@email.com" />
                      </div>
                      <div className="auth-form-field">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" placeholder="+91 98765 43210" />
                      </div>
                      <div className="auth-form-field">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input id="signup-password" type="password" />
                      </div>
                      <Button className="w-full" variant="default">
                        Create Account
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
          
          <Button variant="default" size="sm">
            Book Service
          </Button>
        </div>
      </div>
    </header>
  );
};