import { Card, CardContent } from "@/components/ui/card";
import { Search, Calendar, UserCheck, Star } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse Services",
    description: "Choose from our wide range of verified home services",
    step: "01"
  },
  {
    icon: Calendar,
    title: "Schedule Booking",
    description: "Pick your preferred date and time slot",
    step: "02"
  },
  {
    icon: UserCheck,
    title: "Get Service",
    description: "Our verified professional arrives at your doorstep",
    step: "03"
  },
  {
    icon: Star,
    title: "Rate & Review",
    description: "Share your experience and help others",
    step: "04"
  }
];

export const HowItWorksSection = () => {
  return (
    <section id="about" className="py-20 bg-secondary/30">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold text-foreground lg:text-4xl">
            How It <span className="bg-gradient-primary bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting help for your home has never been this simple. 
            Just four easy steps to a better home experience.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={step.step} className="relative">
                <Card className="border-none shadow-card bg-gradient-card hover:shadow-glow transition-all duration-300">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="relative">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                      <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {step.step}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
                
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-8 h-px bg-gradient-to-r from-primary/50 to-primary/20 z-10" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};