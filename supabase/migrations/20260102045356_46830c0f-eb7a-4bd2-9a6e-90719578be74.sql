-- Create cart_items table for storing services in cart
CREATE TABLE public.cart_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id TEXT NOT NULL,
    service_name TEXT NOT NULL,
    service_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_orders table for bookings
CREATE TABLE public.service_orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id TEXT NOT NULL,
    service_name TEXT NOT NULL,
    service_price DECIMAL(10,2) NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    assigned_technician_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

-- Cart RLS policies (users can only access their own cart)
CREATE POLICY "Users can view their own cart" 
ON public.cart_items FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own cart" 
ON public.cart_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart" 
ON public.cart_items FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own cart" 
ON public.cart_items FOR DELETE 
USING (auth.uid() = user_id);

-- Orders RLS policies
CREATE POLICY "Users can view their own orders" 
ON public.service_orders FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" 
ON public.service_orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" 
ON public.service_orders FOR UPDATE 
USING (auth.uid() = user_id);

-- Admin can view/manage all orders
CREATE POLICY "Admins can view all orders" 
ON public.service_orders FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all orders" 
ON public.service_orders FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Technicians can view assigned orders
CREATE POLICY "Technicians can view assigned orders" 
ON public.service_orders FOR SELECT 
USING (public.has_role(auth.uid(), 'technician') AND assigned_technician_id = auth.uid());

CREATE POLICY "Technicians can update assigned orders" 
ON public.service_orders FOR UPDATE 
USING (public.has_role(auth.uid(), 'technician') AND assigned_technician_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_service_orders_updated_at
BEFORE UPDATE ON public.service_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();