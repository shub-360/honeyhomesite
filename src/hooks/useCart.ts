import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CartItem {
  id: string;
  service_id: string;
  service_name: string;
  service_price: number;
  quantity: number;
}

export const useCart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cart:", error);
    } else {
      setCartItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (service: { id: string; title: string; price: string }) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return false;
    }

    const priceNumber = parseInt(service.price.replace(/[^0-9]/g, ""));

    // Check if already in cart
    const existingItem = cartItems.find((item) => item.service_id === service.id);
    
    if (existingItem) {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + 1 })
        .eq("id", existingItem.id);

      if (error) {
        toast.error("Failed to update cart");
        return false;
      }
    } else {
      const { error } = await supabase.from("cart_items").insert({
        user_id: user.id,
        service_id: service.id,
        service_name: service.title,
        service_price: priceNumber,
        quantity: 1,
      });

      if (error) {
        toast.error("Failed to add to cart");
        return false;
      }
    }

    toast.success("Added to cart!");
    fetchCart();
    return true;
  };

  const removeFromCart = async (id: string) => {
    const { error } = await supabase.from("cart_items").delete().eq("id", id);
    
    if (error) {
      toast.error("Failed to remove item");
      return false;
    }
    
    toast.success("Item removed");
    fetchCart();
    return true;
  };

  const clearCart = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Error clearing cart:", error);
    } else {
      setCartItems([]);
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.service_price * item.quantity, 0);

  return {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    fetchCart,
    cartCount,
    cartTotal,
  };
};
