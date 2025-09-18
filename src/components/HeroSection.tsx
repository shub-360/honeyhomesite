import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Star, Clock, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-home-services.jpg";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 lg:py-32">
      <div className="container relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight text-foreground lg:text-6xl">
                Life gets messy —{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  your home shouldn't be
                </span>
              </h1>
              <p className="text-lg text-muted-foreground lg:text-xl">
                Book trusted home services in minutes. From cleaning to plumbing, 
                get verified professionals at your doorstep with Honey Homes.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="shadow-glow">
                Book a Service Now
              </Button>
              <Button variant="outline" size="lg">
                Become a Provider
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card className="border-none shadow-card bg-gradient-card">
                <CardContent className="flex items-center space-x-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Verified</p>
                    <p className="text-sm text-muted-foreground">Professionals</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-card bg-gradient-card">
                <CardContent className="flex items-center space-x-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">4.8+ Rating</p>
                    <p className="text-sm text-muted-foreground">From 10k+ users</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-card bg-gradient-card">
                <CardContent className="flex items-center space-x-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Same Day</p>
                    <p className="text-sm text-muted-foreground">Service Available</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-soft">
              <img 
                src={heroImage} 
                alt="Professional home service provider in a clean, modern home"
                className="h-[400px] w-full object-cover lg:h-[600px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Floating service card */}
            <Card className="absolute -bottom-6 -left-6 w-48 border-none shadow-glow bg-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success">
                    <MapPin className="h-4 w-4 text-success-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Service Completed</p>
                    <p className="text-xs text-muted-foreground">Home Cleaning • Mumbai</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};