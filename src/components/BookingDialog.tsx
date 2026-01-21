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
  serviceCategory?: string | null;
}

const servicesByCategory: Record<string, Service[]> = {
  "cleaning": [
    {
      id: "utensil-cleaning",
      icon: Sparkles,
      title: "Utensil Cleaning",
      description: "Deep cleaning of all kitchen utensils and dishes",
      price: "₹199",
      duration: "1-2 hours",
      popular: false,
      features: ["All utensils", "Sanitization", "Eco-friendly products"]
    },
    {
      id: "full-furnished-cleaning",
      icon: Sparkles,
      title: "Full Furnished Cleaning",
      description: "Complete cleaning of fully furnished home",
      price: "₹499",
      duration: "3-4 hours",
      popular: true,
      features: ["All rooms", "Furniture dusting", "Floor mopping"]
    },
    {
      id: "unfurnished-cleaning",
      icon: Sparkles,
      title: "Unfurnished Cleaning",
      description: "Deep cleaning of unfurnished spaces",
      price: "₹299",
      duration: "2-3 hours",
      popular: false,
      features: ["Floor cleaning", "Wall wiping", "Window cleaning"]
    },
    {
      id: "full-kitchen-cleaning",
      icon: Sparkles,
      title: "Full Kitchen Cleaning",
      description: "Complete kitchen deep cleaning service",
      price: "₹399",
      duration: "2-3 hours",
      popular: true,
      features: ["Chimney cleaning", "Appliances", "Platform & sink"]
    }
  ],
  "plumbing": [
    {
      id: "bathroom-pipes-change",
      icon: Wrench,
      title: "Bathroom Pipes Change",
      description: "Complete bathroom pipe replacement",
      price: "₹599",
      duration: "2-3 hours",
      popular: true,
      features: ["Pipe replacement", "Leak testing", "Quality materials"]
    },
    {
      id: "valves-pipes-cleaning",
      icon: Wrench,
      title: "Valves & Pipes Cleaning",
      description: "Professional valve and pipe cleaning",
      price: "₹299",
      duration: "1-2 hours",
      popular: false,
      features: ["Valve cleaning", "Pipe descaling", "Leak check"]
    },
    {
      id: "tap-installation",
      icon: Wrench,
      title: "Tap Installation & Repair",
      description: "New tap installation and repairs",
      price: "₹199",
      duration: "1 hour",
      popular: false,
      features: ["All types of taps", "Leak repair", "Warranty included"]
    },
    {
      id: "drain-cleaning",
      icon: Wrench,
      title: "Drain Cleaning",
      description: "Blocked drain and sewage cleaning",
      price: "₹399",
      duration: "1-2 hours",
      popular: true,
      features: ["Drain unclogging", "Sewage cleaning", "24/7 available"]
    }
  ],
  "painting": [
    {
      id: "interior-painting",
      icon: Zap,
      title: "Interior Painting",
      description: "Professional interior wall painting",
      price: "₹399",
      duration: "4-6 hours",
      popular: true,
      features: ["Room painting", "Color options", "Premium finish"]
    },
    {
      id: "exterior-painting",
      icon: Zap,
      title: "Exterior Painting",
      description: "Durable exterior wall painting",
      price: "₹599",
      duration: "6-8 hours",
      popular: false,
      features: ["Weatherproof paint", "Surface prep", "Long lasting"]
    },
    {
      id: "texture-painting",
      icon: Zap,
      title: "Texture Painting",
      description: "Designer texture wall painting",
      price: "₹799",
      duration: "6-8 hours",
      popular: true,
      features: ["Multiple designs", "Premium texture", "Expert application"]
    },
    {
      id: "furniture-painting",
      icon: Zap,
      title: "Furniture Painting",
      description: "Furniture repainting and refinishing",
      price: "₹299",
      duration: "2-3 hours",
      popular: false,
      features: ["All furniture types", "Color matching", "Smooth finish"]
    }
  ],
  "food": [
    {
      id: "daily-meals",
      icon: ChefHat,
      title: "Daily Meals Package",
      description: "Fresh home-cooked meals every day",
      price: "₹149",
      duration: "45 mins",
      popular: true,
      features: ["Lunch & dinner", "Fresh ingredients", "Custom menu"]
    },
    {
      id: "party-catering",
      icon: ChefHat,
      title: "Party Catering",
      description: "Catering services for parties and events",
      price: "₹999",
      duration: "2-3 hours",
      popular: true,
      features: ["Multiple dishes", "Serves 10-15", "Setup included"]
    },
    {
      id: "diet-meals",
      icon: ChefHat,
      title: "Diet & Healthy Meals",
      description: "Customized diet-friendly meals",
      price: "₹199",
      duration: "45 mins",
      popular: false,
      features: ["Low calorie", "High protein", "Nutritionist approved"]
    },
    {
      id: "traditional-meals",
      icon: ChefHat,
      title: "Traditional Indian Meals",
      description: "Authentic traditional Indian cuisine",
      price: "₹179",
      duration: "45 mins",
      popular: false,
      features: ["Regional cuisine", "Traditional recipes", "Home style"]
    }
  ],
  "mens-massage": [
    {
      id: "sports-massage",
      icon: Users,
      title: "Sports Massage",
      description: "Deep tissue massage for athletes",
      price: "₹699",
      duration: "60 mins",
      popular: true,
      features: ["Male therapist", "Deep tissue", "Muscle recovery"]
    },
    {
      id: "stress-relief",
      icon: Users,
      title: "Stress Relief Therapy",
      description: "Relaxation massage for stress relief",
      price: "₹599",
      duration: "60 mins",
      popular: true,
      features: ["Male therapist", "Full body", "Aromatherapy"]
    },
    {
      id: "back-shoulder-massage",
      icon: Users,
      title: "Back & Shoulder Massage",
      description: "Targeted massage for back and shoulders",
      price: "₹499",
      duration: "45 mins",
      popular: false,
      features: ["Male therapist", "Pain relief", "Pressure point therapy"]
    },
    {
      id: "head-massage",
      icon: Users,
      title: "Head & Neck Massage",
      description: "Relaxing head and neck massage",
      price: "₹399",
      duration: "30 mins",
      popular: false,
      features: ["Male therapist", "Hair oil included", "Stress relief"]
    }
  ],
  "womens-massage": [
    {
      id: "spa-package",
      icon: Flower2,
      title: "Premium Spa Package",
      description: "Complete spa experience at home",
      price: "₹899",
      duration: "90 mins",
      popular: true,
      features: ["Female therapist", "Full body massage", "Facial included"]
    },
    {
      id: "aromatherapy",
      icon: Flower2,
      title: "Aromatherapy Massage",
      description: "Relaxing aromatherapy session",
      price: "₹649",
      duration: "60 mins",
      popular: true,
      features: ["Female therapist", "Essential oils", "Full relaxation"]
    },
    {
      id: "prenatal-massage",
      icon: Flower2,
      title: "Prenatal Massage",
      description: "Safe massage for expecting mothers",
      price: "₹799",
      duration: "60 mins",
      popular: false,
      features: ["Female therapist", "Pregnancy safe", "Gentle techniques"]
    },
    {
      id: "beauty-treatments",
      icon: Flower2,
      title: "Beauty Treatments",
      description: "Facial and beauty services",
      price: "₹599",
      duration: "60 mins",
      popular: true,
      features: ["Female therapist", "Facial & cleanup", "Beauty products"]
    }
  ],
  "car": [
    {
      id: "basic-car-wash",
      icon: Car,
      title: "Basic Car Wash",
      description: "Exterior wash and vacuum",
      price: "₹199",
      duration: "30 mins",
      popular: true,
      features: ["Exterior wash", "Vacuum cleaning", "At your location"]
    },
    {
      id: "deep-car-cleaning",
      icon: Car,
      title: "Deep Car Cleaning",
      description: "Complete interior and exterior cleaning",
      price: "₹499",
      duration: "60 mins",
      popular: true,
      features: ["Full interior", "Exterior polish", "Dashboard cleaning"]
    },
    {
      id: "car-polish",
      icon: Car,
      title: "Car Polish & Wax",
      description: "Professional car polishing service",
      price: "₹799",
      duration: "90 mins",
      popular: false,
      features: ["Body polish", "Wax coating", "Scratch removal"]
    },
    {
      id: "engine-cleaning",
      icon: Car,
      title: "Engine Cleaning",
      description: "Professional engine bay cleaning",
      price: "₹399",
      duration: "45 mins",
      popular: false,
      features: ["Engine degreasing", "Bay cleaning", "Safe for engine"]
    }
  ]
};

export const BookingDialog = ({ open, onOpenChange, serviceCategory }: BookingDialogProps) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const availableServices = serviceCategory ? servicesByCategory[serviceCategory] || [] : [];
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
              {availableServices.map((service) => {
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
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, phone: value });
                      }}
                      placeholder="Enter 10-digit phone number"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                    />
                    {formData.phone && formData.phone.length !== 10 && (
                      <p className="text-xs text-destructive">Phone number must be exactly 10 digits</p>
                    )}
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