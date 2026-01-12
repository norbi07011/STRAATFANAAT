import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://nngnovnqrmedsxmpllps.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uZ25vdm5xcm1lZHN4bXBsbHBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNTQwNDgsImV4cCI6MjA4MzczMDA0OH0.7TnpOHbywW1Eo6kTvTIi46zN-4oowQ2Qa2htFh3UxXQ';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface Category {
  id: string;
  name: string;
  name_pl?: string;
  name_en?: string;
  name_nl?: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  name_pl?: string;
  name_en?: string;
  name_nl?: string;
  slug: string;
  sku?: string;
  description?: string;
  description_pl?: string;
  description_en?: string;
  description_nl?: string;
  price: number;
  compare_at_price?: number;
  cost_price?: number;
  category_id?: string;
  image_url?: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_on_sale: boolean;
  view_count: number;
  sales_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color?: string;
  color_hex?: string;
  sku?: string;
  price_adjustment: number;
  stock_quantity: number;
  reserved_quantity: number;
  is_active: boolean;
}

export interface Customer {
  id: string;
  auth_user_id?: string;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  preferred_language: 'NL' | 'EN' | 'PL';
  accepts_marketing: boolean;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  is_active: boolean;
  is_verified: boolean;
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  last_order_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  customer_email: string;
  customer_phone?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'failed';
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'failed' | 'cancelled';
  fulfillment_status: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'returned';
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  grand_total: number;
  currency: string;
  shipping_address?: any;
  billing_address?: any;
  shipping_method?: string;
  tracking_number?: string;
  tracking_url?: string;
  discount_code?: string;
  customer_notes?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  shipped_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  variant_id?: string;
  product_name: string;
  product_sku?: string;
  product_image?: string;
  size?: string;
  color?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  total: number;
  fulfillment_status: string;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  external_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
  payment_method?: string;
  card_brand?: string;
  card_last4?: string;
  created_at: string;
  paid_at?: string;
}

export interface DashboardStats {
  orders_today: number;
  revenue_today: number;
  orders_this_week: number;
  revenue_this_week: number;
  orders_this_month: number;
  revenue_this_month: number;
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  new_customers_today: number;
  active_products: number;
  low_stock_products: number;
  pending_orders: number;
  orders_to_ship: number;
  newsletter_subscribers: number;
}

export interface Setting {
  id: string;
  key: string;
  value: any;
  type: string;
  category: string;
  description?: string;
  is_public: boolean;
}

// API Functions

// Products
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getProductById = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug), product_variants(*)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createProduct = async (product: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Categories
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');
  
  if (error) throw error;
  return data;
};

// Orders
export const getOrders = async (limit = 50) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
};

export const getOrderById = async (id: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, image_url)), payments(*)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateOrderStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateOrderFulfillment = async (id: string, fulfillment_status: string, tracking_number?: string) => {
  const updates: any = { 
    fulfillment_status, 
    updated_at: new Date().toISOString() 
  };
  
  if (tracking_number) {
    updates.tracking_number = tracking_number;
    updates.shipped_at = new Date().toISOString();
  }
  
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Customers
export const getCustomers = async (limit = 50) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
};

export const getCustomerById = async (id: string) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*, addresses(*), orders(*)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

// Payments
export const getPayments = async (limit = 50) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*, orders(order_number, customer_email)')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
};

// Dashboard Stats
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data, error } = await supabase
    .from('v_dashboard_stats')
    .select('*')
    .single();
  
  if (error) {
    // Return default stats if view is empty
    return {
      orders_today: 0,
      revenue_today: 0,
      orders_this_week: 0,
      revenue_this_week: 0,
      orders_this_month: 0,
      revenue_this_month: 0,
      total_orders: 0,
      total_revenue: 0,
      total_customers: 0,
      new_customers_today: 0,
      active_products: 0,
      low_stock_products: 0,
      pending_orders: 0,
      orders_to_ship: 0,
      newsletter_subscribers: 0,
    };
  }
  
  return data;
};

// Recent Orders
export const getRecentOrders = async (limit = 10) => {
  const { data, error } = await supabase
    .from('v_recent_orders')
    .select('*')
    .limit(limit);
  
  if (error) throw error;
  return data || [];
};

// Recent Payments
export const getRecentPayments = async (limit = 10) => {
  const { data, error } = await supabase
    .from('v_recent_payments')
    .select('*')
    .limit(limit);
  
  if (error) throw error;
  return data || [];
};

// Top Products
export const getTopProducts = async (limit = 10) => {
  const { data, error } = await supabase
    .from('v_top_products')
    .select('*')
    .limit(limit);
  
  if (error) throw error;
  return data || [];
};

// Settings
export const getSettings = async (category?: string) => {
  let query = supabase.from('settings').select('*');
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query.order('key');
  
  if (error) throw error;
  return data;
};

export const updateSetting = async (key: string, value: any) => {
  const { data, error } = await supabase
    .from('settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Newsletter
export const getNewsletterSubscribers = async () => {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Analytics
export const trackEvent = async (eventType: string, data: any = {}) => {
  const { error } = await supabase
    .from('analytics_events')
    .insert({
      event_type: eventType,
      event_data: data,
      page_url: window.location.href,
      referrer: document.referrer,
      device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      browser: navigator.userAgent,
    });
  
  if (error) console.error('Analytics error:', error);
};

// Discount Codes
export const getDiscountCodes = async () => {
  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const createDiscountCode = async (code: any) => {
  const { data, error } = await supabase
    .from('discount_codes')
    .insert(code)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const validateDiscountCode = async (code: string) => {
  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();
  
  if (error) return null;
  
  // Check if expired
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null;
  }
  
  // Check usage limit
  if (data.usage_limit && data.usage_count >= data.usage_limit) {
    return null;
  }
  
  return data;
};
