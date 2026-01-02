import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Package, Trash2, Calendar, Clock, MapPin, Phone, Shield, Wrench, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface CartItem {
  id: string;
  service_id: string;
  service_name: string;
  service_price: number;
  quantity: number;
  created_at: string;
}

interface ServiceOrder {
  id: string;
  service_id: string;
  service_name: string;
  service_price: number;
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  phone: string;
  notes: string | null;
  status: string;
  assigned_technician_id: string | null;
  created_at: string;
}

const Dashboard = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCartItems();
      fetchOrders();
    }
  }, [user]);

  const fetchCartItems = async () => {
    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cart:", error);
    } else {
      setCartItems(data || []);
    }
  };

  const fetchOrders = async () => {
    setLoadingData(true);
    const { data, error } = await supabase
      .from("service_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data || []);
    }
    setLoadingData(false);
  };

  const removeFromCart = async (id: string) => {
    const { error } = await supabase.from("cart_items").delete().eq("id", id);
    if (error) {
      toast.error("Failed to remove item");
    } else {
      toast.success("Item removed from cart");
      fetchCartItems();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
      case "confirmed":
        return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      case "in_progress":
        return "bg-purple-500/20 text-purple-600 border-purple-500/30";
      case "completed":
        return "bg-green-500/20 text-green-600 border-green-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-600 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case "admin":
        return <Shield className="h-5 w-5" />;
      case "technician":
        return <Wrench className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
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

  const cartTotal = cartItems.reduce((sum, item) => sum + item.service_price * item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <Badge variant="outline" className={`flex items-center gap-1.5 px-3 py-1 ${getRoleBadgeColor()}`}>
              {getRoleIcon()}
              <span className="capitalize">{role || "Customer"}</span>
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Welcome back, {user?.email?.split("@")[0]}! Manage your cart and orders here.
          </p>
        </div>

        <Tabs defaultValue="cart" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="cart" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Cart ({cartItems.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Orders ({orders.length})
            </TabsTrigger>
          </TabsList>

          {/* Cart Tab */}
          <TabsContent value="cart" className="space-y-4">
            {cartItems.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Your cart is empty</h3>
                  <p className="text-muted-foreground mb-4">Add services from our catalog to get started</p>
                  <Button onClick={() => navigate("/#services")}>Browse Services</Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-4">
                  {cartItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{item.service_name}</h3>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-primary">₹{item.service_price}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Cart Summary */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold text-primary">₹{cartTotal}</span>
                    </div>
                    <Button className="w-full" size="lg" onClick={() => navigate("/#services")}>
                      Proceed to Book
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            {loadingData ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-4">Book a service to see your orders here</p>
                  <Button onClick={() => navigate("/#services")}>Book a Service</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{order.service_name}</CardTitle>
                          <CardDescription>
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {order.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(order.scheduled_date), "MMM dd, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{order.scheduled_time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{order.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{order.phone}</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Booked on {format(new Date(order.created_at), "MMM dd, yyyy")}
                        </span>
                        <span className="font-bold text-primary">₹{order.service_price}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
