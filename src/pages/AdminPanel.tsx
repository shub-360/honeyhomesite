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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Calendar, Clock, MapPin, Phone, User, Wrench } from "lucide-react";
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

interface ServiceProvider {
  user_id: string;
  profile: {
    full_name: string | null;
    phone: string | null;
  } | null;
}

const AdminPanel = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/");
        return;
      }
      if (role !== "admin") {
        toast.error("Access denied. Admin only.");
        navigate("/dashboard");
        return;
      }
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (user && role === "admin") {
      fetchOrders();
      fetchServiceProviders();
    }
  }, [user, role]);

  const fetchOrders = async () => {
    setLoadingData(true);
    const { data, error } = await supabase
      .from("service_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } else {
      setOrders(data || []);
    }
    setLoadingData(false);
  };

  const fetchServiceProviders = async () => {
    const { data: providerRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "technician");

    if (rolesError) {
      console.error("Error fetching service providers:", rolesError);
      return;
    }

    if (providerRoles && providerRoles.length > 0) {
      const userIds = providerRoles.map((r) => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        return;
      }

      const providerList = providerRoles.map((role) => ({
        user_id: role.user_id,
        profile: profiles?.find((p) => p.id === role.user_id) || null,
      }));
      setServiceProviders(providerList);
    }
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
      fetchOrders();
    }
  };

  const assignServiceProvider = async (orderId: string, providerId: string) => {
    const { error } = await supabase
      .from("service_orders")
      .update({ assigned_technician_id: providerId, status: "confirmed" })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to assign service provider");
    } else {
      toast.success("Service provider assigned");
      fetchOrders();
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

  const getServiceProviderName = (providerId: string | null) => {
    if (!providerId) return "Unassigned";
    const provider = serviceProviders.find((p) => p.user_id === providerId);
    return provider?.profile?.full_name || "Unknown Provider";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
            <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-600 border-red-500/30">
              <Shield className="h-5 w-5" />
              <span>Admin</span>
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Manage all orders, assign service providers, and update statuses.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-foreground">{orders.length}</div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter((o) => o.status === "pending").length}
              </div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">
                {orders.filter((o) => o.status === "in_progress").length}
              </div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {orders.filter((o) => o.status === "completed").length}
              </div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>View and manage all service orders</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No orders found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Service Provider</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.service_name}</div>
                            <div className="text-sm text-primary">₹{order.service_price}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(order.scheduled_date), "MMM dd, yyyy")}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {order.scheduled_time}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {order.phone}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground truncate max-w-[150px]">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              {order.address}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.assigned_technician_id || "unassigned"}
                            onValueChange={(value) => assignServiceProvider(order.id, value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue>
                                <span className="flex items-center gap-1">
                                  <Wrench className="h-3 w-3" />
                                  {getServiceProviderName(order.assigned_technician_id)}
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {serviceProviders.map((provider) => (
                                <SelectItem key={provider.user_id} value={provider.user_id}>
                                  {provider.profile?.full_name || "Unknown"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(order.status)}>
                            {order.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default AdminPanel;
