
export type Language = 'NL' | 'EN' | 'PL';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  images: string[];
  description: Record<Language, string>;
  colors: string[];
  sizes: string[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
}

export interface Translation {
  // Nav & Hero
  nav_shop: string;
  nav_lookbook: string;
  nav_about: string;
  hero_title: string;
  hero_subtitle: string;
  shop_now: string;
  est_drop: string;
  
  // Shop
  the_drop: string;
  trending_now: string;
  view_all: string;
  add_to_cart: string;
  size: string;
  
  // Cart
  cart_title: string;
  empty_cart: string;
  checkout: string;
  total: string;
  
  // About / Manifesto
  brand_story: string;
  manifesto_title: string;
  manifesto_desc: string;
  pillar_auth_title: string;
  pillar_auth_desc: string;
  pillar_innov_title: string;
  pillar_innov_desc: string;
  pillar_comm_title: string;
  pillar_comm_desc: string;
  born_in: string;
  no_boundaries: string;
  join_family: string;
  
  // Social & Culture
  culture_manifesto_head: string;
  culture_manifesto_sub: string;
  join_revolution: string;
  explore_story: string;
  
  // AI Stylist
  ai_stylist_btn: string;
  ai_stylist_loading: string;
  ai_stylist_title: string;
  ai_stylist_prompt: string;
  
  // Admin
  admin_lock: string;
  admin_dashboard: string;
  admin_inventory: string;
  admin_orders: string;
  admin_revenue: string;
  admin_visitors: string;
  admin_stock: string;
  admin_intel: string;
  admin_add_prod: string;
  admin_actions: string;
  
  // Footer
  footer_desc: string;
  footer_links: string;
  footer_newsletter: string;
  footer_join_btn: string;
  footer_rights: string;
  footer_made_by: string;
}

export type Page = 'home' | 'shop' | 'lookbook' | 'about' | 'product' | 'admin' | 'checkout';
export type AdminTab = 'dashboard' | 'products' | 'orders' | 'customers' | 'payments' | 'discounts' | 'analytics' | 'settings';
