import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, Calendar, Clock, MapPin, Phone, Wrench, Users, ShoppingCart, IndianRupee, TrendingUp, UserCheck, User, LayoutDashboard } from "lucide-react";
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

interface UserWithRole {
  user_id: string;
  role: string;
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
  const [allUsers, setAllUsers] = useState<UserWithRole[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

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
      fetchAllUsers();
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

  const fetchAllUsers = async () => {
    const { data: userRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (rolesError) {
      console.error("Error fetching user roles:", rolesError);
      return;
    }

    if (userRoles && userRoles.length > 0) {
      const userIds = userRoles.map((r) => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        return;
      }

      const userList = userRoles.map((ur) => ({
        user_id: ur.user_id,
        role: ur.role,
        profile: profiles?.find((p) => p.id === ur.user_id) || null,
      }));
      setAllUsers(userList);
    }
  };

  const updateUserRole = async (userId: string, newRole: "admin" | "technician" | "user") => {
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", userId);

    if (error) {
      toast.error("Failed to update user role");
    } else {
      toast.success("User role updated");
      fetchAllUsers();
      fetchServiceProviders();
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-600 border-red-500/30";
      case "technician":
        return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      default:
        return "bg-green-500/20 text-green-600 border-green-500/30";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "technician":
        return <Wrench className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getServiceProviderName = (providerId: string | null) => {
    if (!providerId) return "Unassigned";
    const provider = serviceProviders.find((p) => p.user_id === providerId);
    return provider?.profile?.full_name || "Unknown Provider";
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Stats calculations
  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((acc, o) => acc + Number(o.service_price), 0);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;

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
            Manage users and orders
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <div className="text-2xl font-bold text-foreground flex items-center gap-1">
                        <IndianRupee className="h-5 w-5" />
                        {totalRevenue.toLocaleString()}
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <div className="text-2xl font-bold text-foreground">{orders.length}</div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <div className="text-2xl font-bold text-foreground">{allUsers.length}</div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Service Providers</p>
                      <div className="text-2xl font-bold text-foreground">{serviceProviders.length}</div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Orders Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Pending Orders</span>
                    <Badge variant="outline" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                      {pendingOrders}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Confirmed Orders</span>
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-600 border-blue-500/30">
                      {orders.filter((o) => o.status === "confirmed").length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">In Progress</span>
                    <Badge variant="outline" className="bg-purple-500/20 text-purple-600 border-purple-500/30">
                      {orders.filter((o) => o.status === "in_progress").length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Completed Orders</span>
                    <Badge variant="outline" className="bg-green-500/20 text-green-600 border-green-500/30">
                      {completedOrders}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Users Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="text-muted-foreground">Customers</span>
                    </div>
                    <span className="font-semibold">{allUsers.filter((u) => u.role === "user").length}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-blue-600" />
                      <span className="text-muted-foreground">Service Providers</span>
                    </div>
                    <span className="font-semibold">{allUsers.filter((u) => u.role === "technician").length}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-600" />
                      <span className="text-muted-foreground">Admins</span>
                    </div>
                    <span className="font-semibold">{allUsers.filter((u) => u.role === "admin").length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab - Enhanced UI */}
          <TabsContent value="users" className="space-y-6">
            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-green-500/20 flex items-center justify-center">
                      <User className="h-7 w-7 text-green-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-foreground">
                        {allUsers.filter((u) => u.role === "user").length}
                      </div>
                      <p className="text-sm text-muted-foreground">Customers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Wrench className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-foreground">
                        {allUsers.filter((u) => u.role === "technician").length}
                      </div>
                      <p className="text-sm text-muted-foreground">Service Providers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-red-500/20 flex items-center justify-center">
                      <Shield className="h-7 w-7 text-red-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-foreground">
                        {allUsers.filter((u) => u.role === "admin").length}
                      </div>
                      <p className="text-sm text-muted-foreground">Admins</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Users Grid */}
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : allUsers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No users found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allUsers.map((u) => (
                      <Card key={u.user_id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 border-2 border-border">
                              <AvatarFallback className={`${getRoleColor(u.role)} font-semibold`}>
                                {getInitials(u.profile?.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground truncate">
                                  {u.profile?.full_name || "Unknown User"}
                                </h3>
                                {u.user_id === user?.id && (
                                  <Badge variant="outline" className="text-xs px-1.5 py-0">You</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className={`${getRoleColor(u.role)} flex items-center gap-1`}>
                                  {getRoleIcon(u.role)}
                                  <span className="capitalize">
                                    {u.role === "technician" ? "Provider" : u.role}
                                  </span>
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                                <Phone className="h-3 w-3" />
                                <span>{u.profile?.phone || "No phone"}</span>
                              </div>
                              <div className="text-xs text-muted-foreground font-mono mb-3">
                                ID: {u.user_id.slice(0, 8).toUpperCase()}
                              </div>
                              <Select
                                value={u.role}
                                onValueChange={(value) => updateUserRole(u.user_id, value as "admin" | "technician" | "user")}
                                disabled={u.user_id === user?.id}
                              >
                                <SelectTrigger className="w-full h-9">
                                  <SelectValue placeholder="Change Role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-green-600" />
                                      Customer
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="technician">
                                    <div className="flex items-center gap-2">
                                      <Wrench className="h-4 w-4 text-blue-600" />
                                      Service Provider
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="admin">
                                    <div className="flex items-center gap-2">
                                      <Shield className="h-4 w-4 text-red-600" />
                                      Admin
                                    </div>
                                  </SelectItem>
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
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="text-xl font-bold text-foreground">{orders.length}</div>
                  <p className="text-xs text-muted-foreground">Total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="text-xl font-bold text-yellow-600">
                    {orders.filter((o) => o.status === "pending").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="text-xl font-bold text-blue-600">
                    {orders.filter((o) => o.status === "confirmed").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Confirmed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="text-xl font-bold text-purple-600">
                    {orders.filter((o) => o.status === "in_progress").length}
                  </div>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="text-xl font-bold text-green-600">
                    {orders.filter((o) => o.status === "completed").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Completed</p>
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
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default AdminPanel;
