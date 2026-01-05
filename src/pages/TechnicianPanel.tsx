import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Phone, Wrench, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ServiceOrder {
  id: string;
  user_id: string;
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

const TechnicianPanel = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/");
        return;
      }
      if (role !== "technician") {
        toast.error("Access denied. Technicians only.");
        navigate("/dashboard");
        return;
      }
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (user && role === "technician") {
      fetchAssignedOrders();
    }
  }, [user, role]);

  const fetchAssignedOrders = async () => {
    setLoadingData(true);
    const { data, error } = await supabase
      .from("service_orders")
      .select("*")
      .eq("assigned_technician_id", user?.id)
      .order("scheduled_date", { ascending: true });

    if (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } else {
      setOrders(data || []);
    }
    setLoadingData(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("service_orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated");
      fetchAssignedOrders();
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "in_progress":
        return <AlertCircle className="h-5 w-5 text-purple-600" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (role !== "technician") {
    return null;
  }

  const activeJobs = orders.filter((o) => o.status === "in_progress" || o.status === "confirmed");
  const completedJobs = orders.filter((o) => o.status === "completed");
  const todayJobs = orders.filter(
    (o) => format(new Date(o.scheduled_date), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-foreground">Technician Panel</h1>
            <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-600 border-blue-500/30">
              <Wrench className="h-5 w-5" />
              <span>Service Provider</span>
            </Badge>
          </div>
          <p className="text-muted-foreground">
            View and manage your assigned service jobs.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-foreground">{orders.length}</div>
              <p className="text-sm text-muted-foreground">Total Assigned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">{todayJobs.length}</div>
              <p className="text-sm text-muted-foreground">Today's Jobs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">{activeJobs.length}</div>
              <p className="text-sm text-muted-foreground">Active Jobs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{completedJobs.length}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Jobs</CardTitle>
            <CardDescription>Your assigned service orders</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Wrench className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">No jobs assigned yet</p>
                <p className="text-sm">You'll see your assigned jobs here</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <Card key={order.id} className="border-l-4" style={{ borderLeftColor: order.status === "in_progress" ? "#9333ea" : order.status === "completed" ? "#16a34a" : "#3b82f6" }}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(order.status)}
                            <h3 className="font-semibold text-foreground">{order.service_name}</h3>
                            <Badge variant="outline" className={getStatusColor(order.status)}>
                              {order.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(order.scheduled_date), "MMM dd, yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{order.scheduled_time}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span>{order.phone}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground truncate">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{order.address}</span>
                            </div>
                          </div>

                          {order.notes && (
                            <p className="mt-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                              <strong>Notes:</strong> {order.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <span className="text-lg font-bold text-primary">₹{order.service_price}</span>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default TechnicianPanel;
