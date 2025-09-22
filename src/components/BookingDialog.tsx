import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  IndianRupee, 
  MapPin, 
  Phone, 
  User,
  Sparkles, 
  Wrench, 
  Zap, 
  ChefHat, 
  Flower2, 
  Car,
  Users,
  ArrowLeft
} from "lucide-react";

interface Service {
  id: string;
  icon: any;
  title: string;
  description: string;
  price: string;
  duration: string;
  popular: boolean;
  features: string[];
}

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
}

const services: Service[] = [
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

export const BookingDialog = ({ open, onOpenChange, service: initialService }: BookingDialogProps) => {
  const [selectedService, setSelectedService] = useState<Service | null>(initialService || null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    date: "",
    time: "",
    notes: ""
  });

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  const handleBack = () => {
    setSelectedService(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    console.log("Booking submitted:", { service: selectedService.id, ...formData });
    onOpenChange(false);
    setSelectedService(null);
    setFormData({
      name: "",
      phone: "",
      address: "",
      date: "",
      time: "",
      notes: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {!selectedService ? (
          // Service Selection View
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Select a Service</DialogTitle>
              <DialogDescription>
                Choose the service you would like to book
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {services.map((service) => {
                const IconComponent = service.icon;
                return (
                  <Card 
                    key={service.id} 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 border-border/50"
                    onClick={() => handleServiceSelect(service)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">{service.title}</h3>
                            {service.popular && (
                              <Badge className="bg-primary text-primary-foreground text-xs">Popular</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <div className="flex items-center space-x-1">
                              <IndianRupee className="h-3 w-3 text-primary" />
                              <span className="font-semibold text-foreground">{service.price}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 text-primary" />
                              <span className="text-muted-foreground">{service.duration}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        ) : (
          // Booking Form View  
          <>
            <DialogHeader>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="p-1 h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <DialogTitle className="text-2xl">Book {selectedService.title}</DialogTitle>
                  <DialogDescription>
                    Fill in your details to book this service
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Service Summary */}
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    {selectedService.title}
                    {selectedService.popular && (
                      <Badge className="bg-primary text-primary-foreground">Popular</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">{selectedService.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-1">
                      <IndianRupee className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{selectedService.price}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{selectedService.duration}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">What's included:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedService.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>Full Name</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>Phone Number</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>Service Address</span>
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter complete address where service is needed"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Preferred Date</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time" className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Preferred Time</span>
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special requirements or notes..."
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Confirm Booking
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};