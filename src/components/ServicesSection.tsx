import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingDialog } from "./BookingDialog";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "./AuthModal";
import { 
  Sparkles, 
  Wrench, 
  Zap, 
  ChefHat, 
  Flower2, 
  Car,
  ArrowRight,
  Clock,
  IndianRupee,
  Users,
  ShoppingCart
} from "lucide-react";

const services = [
  {
    id: "cleaning",
    icon: Sparkles,
    title: "Home & Kitchen Cleaning",
    description: "Professional deep cleaning for your home and kitchen",
    price: "₹299",
    duration: "2-3 hours",
    popular: true,
    features: ["Deep cleaning", "Sanitization", "Eco-friendly products"]
  },
  {
    id: "plumbing",
    icon: Wrench,
    title: "Plumbing Services",
    description: "Expert plumbing repairs and installations",
    price: "₹199",
    duration: "1-2 hours",
    popular: false,
    features: ["Leak repairs", "Pipe installation", "24/7 emergency"]
  },
  {
    id: "painting",
    icon: Zap,
    title: "Painting Services",
    description: "Professional home and room painting",
    price: "₹399",
    duration: "4-6 hours",
    popular: false,
    features: ["Interior painting", "Exterior painting", "Color consultation"]
  },
  {
    id: "food",
    icon: ChefHat,
    title: "Home-Cooked Food",
    description: "Fresh, healthy meals delivered to your door",
    price: "₹149",
    duration: "45 mins",
    popular: true,
    features: ["Fresh ingredients", "Custom diet", "Same day delivery"]
  },
  {
    id: "mens-massage",
    icon: Users,
    title: "Men's Massage & Spa",
    description: "Relaxing spa treatments for men at your home",
    price: "₹599",
    duration: "60-90 mins",
    popular: false,
    features: ["Male therapists", "Sports massage", "Stress relief therapy"]
  },
  {
    id: "womens-massage",
    icon: Flower2,
    title: "Women's Massage & Spa",
    description: "Premium spa treatments for women at your home",
    price: "₹649",
    duration: "60-90 mins",
    popular: true,
    features: ["Female therapists", "Beauty treatments", "Aromatherapy"]
  },
  {
    id: "car",
    icon: Car,
    title: "Car Wash & Care",
    description: "Professional car cleaning and maintenance",
    price: "₹199",
    duration: "45-60 mins",
    popular: false,
    features: ["Wash & vacuum", "Interior cleaning", "At your location"]
  }
];

export const ServicesSection = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | undefined>();
  const [pendingServiceId, setPendingServiceId] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleBookNow = (serviceId: string) => {
    if (!user) {
      setAuthMessage("Please log in to book a service");
      setPendingServiceId(serviceId);
      setAuthModalOpen(true);
      return;
    }
    setSelectedServiceCategory(serviceId);
    setIsBookingOpen(true);
  };

  const handleAuthSuccess = () => {
    if (pendingServiceId) {
      // Open booking dialog after successful login
      setTimeout(() => {
        setSelectedServiceCategory(pendingServiceId);
        setIsBookingOpen(true);
        setPendingServiceId(null);
        setAuthMessage(undefined);
      }, 100);
    }
  };

  const handleAuthModalChange = (open: boolean) => {
    setAuthModalOpen(open);
    if (!open) {
      setAuthMessage(undefined);
      setPendingServiceId(null);
    }
  };

  const handleAddToCart = (service: { id: string; title: string; price: string }) => {
    if (!user) {
      setAuthMessage("Please log in to add items to your cart");
      setAuthModalOpen(true);
      return;
    }
    addToCart(service);
  };

  return (
    <section id="services" className="py-20 bg-background">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold text-foreground lg:text-4xl">
            Our <span className="bg-gradient-primary bg-clip-text text-transparent">Services</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From everyday chores to specialized services, we've got everything 
            covered for your home needs
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <Card 
                key={service.id} 
                className="group relative overflow-hidden border-border/50 shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
              >
                {service.popular && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary text-primary-foreground">Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">{service.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <IndianRupee className="h-3 w-3" />
                          <span className="font-semibold text-foreground">{service.price}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{service.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="text-muted-foreground">
                    {service.description}
                  </CardDescription>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">What's included:</p>
                    <ul className="space-y-1">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 group-hover:shadow-soft transition-all" 
                      variant="outline"
                      onClick={() => handleBookNow(service.id)}
                    >
                      Book Now
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button 
                      variant="secondary"
                      size="icon"
                      onClick={() => handleAddToCart({ id: service.id, title: service.title, price: service.price })}
                      title="Add to Cart"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="default" className="shadow-glow">
            View All Services
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <BookingDialog
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
        serviceCategory={selectedServiceCategory}
      />

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={handleAuthModalChange}
        message={authMessage}
        onSuccess={handleAuthSuccess}
      />
    </section>
  );
};