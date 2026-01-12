import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, CreditCard, Settings, 
  TrendingUp, BarChart3, Plus, Trash2, Edit3, Eye, Search, Filter,
  ChevronDown, ChevronRight, RefreshCw, Download, Upload, AlertTriangle,
  CheckCircle, XCircle, Clock, Truck, ArrowUpRight, ArrowDownRight,
  DollarSign, ShoppingCart, UserPlus, PackageX, Mail, Tag, Activity,
  Save, X, Image, MoreVertical, ExternalLink, Copy, Loader2
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import {
  supabase,
  getProducts,
  getCategories,
  getOrders,
  getCustomers,
  getPayments,
  getDashboardStats,
  getRecentOrders,
  getTopProducts,
  getSettings,
  updateProduct,
  deleteProduct,
  createProduct,
  updateOrderStatus,
  updateOrderFulfillment,
  getDiscountCodes,
  getNewsletterSubscribers,
  type Product,
  type Order,
  type Customer,
  type Payment,
  type DashboardStats,
  type Category,
  type Setting
} from '../lib/supabase';

// Types
type AdminTab = 'dashboard' | 'products' | 'orders' | 'customers' | 'payments' | 'discounts' | 'analytics' | 'settings';

interface AdminPanelProps {
  lang: Language;
}

// Utility Components
const StatCard = ({ label, value, change, changeType, icon, color }: {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}) => (
  <div className="bg-zinc-950 border border-zinc-900 p-4 md:p-6 relative group hover:border-zinc-800 transition-all">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl md:text-3xl font-black italic">{value}</p>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-bold ${
            changeType === 'up' ? 'text-[#adff2f]' : changeType === 'down' ? 'text-red-500' : 'text-zinc-500'
          }`}>
            {changeType === 'up' ? <ArrowUpRight className="w-3 h-3" /> : 
             changeType === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
            {change}
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status, type }: { status: string; type: 'order' | 'payment' | 'fulfillment' }) => {
  const configs: Record<string, { bg: string; text: string }> = {
    // Order status
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-500' },
    confirmed: { bg: 'bg-blue-500/20', text: 'text-blue-500' },
    processing: { bg: 'bg-purple-500/20', text: 'text-purple-500' },
    shipped: { bg: 'bg-cyan-500/20', text: 'text-cyan-500' },
    delivered: { bg: 'bg-green-500/20', text: 'text-green-500' },
    cancelled: { bg: 'bg-red-500/20', text: 'text-red-500' },
    refunded: { bg: 'bg-orange-500/20', text: 'text-orange-500' },
    failed: { bg: 'bg-red-500/20', text: 'text-red-500' },
    // Payment status
    paid: { bg: 'bg-green-500/20', text: 'text-green-500' },
    succeeded: { bg: 'bg-green-500/20', text: 'text-green-500' },
    // Fulfillment status
    unfulfilled: { bg: 'bg-yellow-500/20', text: 'text-yellow-500' },
    fulfilled: { bg: 'bg-green-500/20', text: 'text-green-500' },
    partially_fulfilled: { bg: 'bg-blue-500/20', text: 'text-blue-500' },
  };

  const config = configs[status] || { bg: 'bg-zinc-500/20', text: 'text-zinc-500' };

  return (
    <span className={`px-2 py-1 text-[10px] font-black uppercase rounded ${config.bg} ${config.text}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-[#00f2ff]" />
  </div>
);

const EmptyState = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="p-4 bg-zinc-900 rounded-full mb-4">{icon}</div>
    <h3 className="text-xl font-black italic uppercase mb-2">{title}</h3>
    <p className="text-zinc-500 text-sm max-w-md">{description}</p>
  </div>
);

// Dashboard Tab
const DashboardTab = ({ stats, recentOrders, topProducts, isLoading }: {
  stats: DashboardStats | null;
  recentOrders: any[];
  topProducts: any[];
  isLoading: boolean;
}) => {
  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase">
          STREET <span className="text-gradient-street">INTEL</span>
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 transition-colors text-sm font-bold">
          <RefreshCw className="w-4 h-4" /> Odśwież
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard 
          label="Przychód Dziś"
          value={`€${stats?.revenue_today?.toFixed(2) || '0.00'}`}
          change="+12.5% vs wczoraj"
          changeType="up"
          icon={<DollarSign className="w-5 h-5 text-black" />}
          color="bg-[#adff2f]"
        />
        <StatCard 
          label="Zamówienia Dziś"
          value={stats?.orders_today || 0}
          change="+3 vs wczoraj"
          changeType="up"
          icon={<ShoppingCart className="w-5 h-5 text-black" />}
          color="bg-[#00f2ff]"
        />
        <StatCard 
          label="Nowi Klienci"
          value={stats?.new_customers_today || 0}
          icon={<UserPlus className="w-5 h-5 text-black" />}
          color="bg-[#ffff00]"
        />
        <StatCard 
          label="Do Wysyłki"
          value={stats?.orders_to_ship || 0}
          icon={<Truck className="w-5 h-5 text-black" />}
          color="bg-white"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard 
          label="Przychód Tydzień"
          value={`€${stats?.revenue_this_week?.toFixed(2) || '0.00'}`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="bg-zinc-800"
        />
        <StatCard 
          label="Przychód Miesiąc"
          value={`€${stats?.revenue_this_month?.toFixed(2) || '0.00'}`}
          icon={<BarChart3 className="w-5 h-5" />}
          color="bg-zinc-800"
        />
        <StatCard 
          label="Aktywne Produkty"
          value={stats?.active_products || 0}
          icon={<Package className="w-5 h-5" />}
          color="bg-zinc-800"
        />
        <StatCard 
          label="Niski Stan"
          value={stats?.low_stock_products || 0}
          icon={<PackageX className="w-5 h-5 text-red-500" />}
          color="bg-red-500/20"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-zinc-950 border border-zinc-900 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black italic uppercase">Ostatnie Zamówienia</h3>
            <span className="text-[#00f2ff] text-xs font-bold cursor-pointer hover:underline">Zobacz wszystkie →</span>
          </div>
          
          {recentOrders.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">Brak zamówień</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-black border border-zinc-900 hover:border-zinc-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-street flex items-center justify-center text-black font-black text-xs">
                      {order.items_count || 1}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{order.order_number}</p>
                      <p className="text-[10px] text-zinc-500">{order.customer_email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-[#adff2f]">€{order.grand_total}</p>
                    <StatusBadge status={order.status} type="order" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-zinc-950 border border-zinc-900 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black italic uppercase">Top Produkty</h3>
            <span className="text-[#00f2ff] text-xs font-bold cursor-pointer hover:underline">Zobacz wszystkie →</span>
          </div>
          
          {topProducts.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">Brak danych sprzedaży</p>
          ) : (
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((product: any, index: number) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-black border border-zinc-900 hover:border-zinc-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center text-xs font-black text-zinc-500">
                      #{index + 1}
                    </span>
                    <img src={product.image_url} alt={product.name} className="w-10 h-10 object-cover" />
                    <div>
                      <p className="font-bold text-sm truncate max-w-[150px]">{product.name}</p>
                      <p className="text-[10px] text-zinc-500">{product.units_sold || 0} sprzedanych</p>
                    </div>
                  </div>
                  <p className="font-mono font-bold text-[#adff2f]">€{product.revenue?.toFixed(2) || '0.00'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-950 border border-zinc-900 p-4">
        <div className="text-center p-4">
          <p className="text-2xl font-black text-[#00f2ff]">{stats?.total_orders || 0}</p>
          <p className="text-[10px] font-bold text-zinc-500 uppercase">Wszystkie Zamówienia</p>
        </div>
        <div className="text-center p-4 border-l border-zinc-900">
          <p className="text-2xl font-black text-[#adff2f]">€{stats?.total_revenue?.toFixed(2) || '0.00'}</p>
          <p className="text-[10px] font-bold text-zinc-500 uppercase">Całkowity Przychód</p>
        </div>
        <div className="text-center p-4 border-l border-zinc-900">
          <p className="text-2xl font-black">{stats?.total_customers || 0}</p>
          <p className="text-[10px] font-bold text-zinc-500 uppercase">Klienci</p>
        </div>
        <div className="text-center p-4 border-l border-zinc-900">
          <p className="text-2xl font-black">{stats?.newsletter_subscribers || 0}</p>
          <p className="text-[10px] font-bold text-zinc-500 uppercase">Newsletter</p>
        </div>
      </div>
    </div>
  );
};

// Products Tab
const ProductsTab = ({ products, categories, isLoading, onRefresh }: {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  onRefresh: () => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten produkt?')) {
      try {
        await deleteProduct(id);
        onRefresh();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase">
          MAGAZYN <span className="text-gradient-street">PRODUKTÓW</span>
        </h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-street text-black font-black italic uppercase text-sm hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" /> Dodaj Produkt
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Szukaj produktów..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 pl-12 pr-4 py-3 text-sm font-bold outline-none focus:border-[#00f2ff] transition-colors"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-zinc-950 border border-zinc-900 px-4 py-3 text-sm font-bold outline-none focus:border-[#00f2ff]"
        >
          <option value="all">Wszystkie kategorie</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto border border-zinc-900 bg-zinc-950">
        <table className="w-full text-left text-sm min-w-[800px]">
          <thead className="border-b border-zinc-900 text-[10px] font-black uppercase text-zinc-500">
            <tr>
              <th className="p-4 md:p-6">Produkt</th>
              <th className="p-4 md:p-6">SKU</th>
              <th className="p-4 md:p-6">Kategoria</th>
              <th className="p-4 md:p-6 text-right">Cena</th>
              <th className="p-4 md:p-6 text-center">Stan</th>
              <th className="p-4 md:p-6 text-center">Status</th>
              <th className="p-4 md:p-6 text-center">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id} className="border-b border-zinc-900 hover:bg-zinc-900/50 transition-colors">
                <td className="p-4 md:p-6">
                  <div className="flex items-center gap-3">
                    <img src={product.image_url || 'https://via.placeholder.com/50'} className="w-12 h-12 object-cover" alt="" />
                    <div>
                      <span className="font-bold italic uppercase">{product.name}</span>
                      {product.is_featured && (
                        <span className="ml-2 px-2 py-0.5 text-[8px] bg-[#adff2f] text-black font-black rounded">FEATURED</span>
                      )}
                      {product.is_new && (
                        <span className="ml-1 px-2 py-0.5 text-[8px] bg-[#00f2ff] text-black font-black rounded">NEW</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4 md:p-6 font-mono text-zinc-500">{product.sku || '-'}</td>
                <td className="p-4 md:p-6">
                  <span className="bg-zinc-900 px-2 py-1 text-[10px] font-black uppercase rounded">
                    {(product as any).categories?.name || 'Bez kategorii'}
                  </span>
                </td>
                <td className="p-4 md:p-6 text-right">
                  <span className="font-mono text-[#00f2ff] font-bold">€{product.price}</span>
                  {product.compare_at_price && (
                    <span className="ml-2 font-mono text-zinc-500 line-through text-xs">€{product.compare_at_price}</span>
                  )}
                </td>
                <td className="p-4 md:p-6 text-center">
                  <span className={`font-bold ${product.stock_quantity <= product.low_stock_threshold ? 'text-red-500' : 'text-white'}`}>
                    {product.stock_quantity}
                  </span>
                  {product.stock_quantity <= product.low_stock_threshold && (
                    <AlertTriangle className="inline ml-1 w-4 h-4 text-red-500" />
                  )}
                </td>
                <td className="p-4 md:p-6 text-center">
                  <span className={`px-2 py-1 text-[10px] font-black uppercase rounded ${
                    product.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {product.is_active ? 'Aktywny' : 'Nieaktywny'}
                  </span>
                </td>
                <td className="p-4 md:p-6">
                  <div className="flex justify-center gap-2">
                    <button className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-zinc-500 hover:text-[#00f2ff] hover:bg-zinc-900 transition-colors rounded">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-zinc-500 hover:text-red-500 hover:bg-zinc-900 transition-colors rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <EmptyState 
          icon={<Package className="w-8 h-8 text-zinc-500" />}
          title="Brak produktów"
          description="Nie znaleziono produktów pasujących do kryteriów wyszukiwania."
        />
      )}
    </div>
  );
};

// Orders Tab
const OrdersTab = ({ orders, isLoading, onRefresh }: {
  orders: Order[];
  isLoading: boolean;
  onRefresh: () => void;
}) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      onRefresh();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase">
          ZAMÓWIENIA <span className="text-gradient-street">KLIENTÓW</span>
        </h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 transition-colors text-sm font-bold">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={onRefresh} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 transition-colors text-sm font-bold">
            <RefreshCw className="w-4 h-4" /> Odśwież
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map(status => {
          const count = status === 'all' 
            ? orders.length 
            : orders.filter(o => o.status === status).length;
          
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`p-3 text-center border transition-all ${
                statusFilter === status 
                  ? 'border-[#00f2ff] bg-[#00f2ff]/10' 
                  : 'border-zinc-900 hover:border-zinc-800'
              }`}
            >
              <p className="text-lg font-black">{count}</p>
              <p className="text-[8px] font-bold uppercase text-zinc-500">
                {status === 'all' ? 'Wszystkie' : status}
              </p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Szukaj po numerze zamówienia lub emailu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-900 pl-12 pr-4 py-3 text-sm font-bold outline-none focus:border-[#00f2ff] transition-colors"
        />
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto border border-zinc-900 bg-zinc-950">
        <table className="w-full text-left text-sm min-w-[1000px]">
          <thead className="border-b border-zinc-900 text-[10px] font-black uppercase text-zinc-500">
            <tr>
              <th className="p-4 md:p-6">Zamówienie</th>
              <th className="p-4 md:p-6">Klient</th>
              <th className="p-4 md:p-6">Data</th>
              <th className="p-4 md:p-6">Status</th>
              <th className="p-4 md:p-6">Płatność</th>
              <th className="p-4 md:p-6">Wysyłka</th>
              <th className="p-4 md:p-6 text-right">Suma</th>
              <th className="p-4 md:p-6 text-center">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} className="border-b border-zinc-900 hover:bg-zinc-900/50 transition-colors">
                <td className="p-4 md:p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-street flex items-center justify-center text-black font-black text-xs">
                      {(order as any).order_items?.length || 1}
                    </div>
                    <span className="font-bold font-mono">{order.order_number}</span>
                  </div>
                </td>
                <td className="p-4 md:p-6">
                  <div>
                    <p className="font-bold">{order.customer_first_name} {order.customer_last_name}</p>
                    <p className="text-[10px] text-zinc-500">{order.customer_email}</p>
                  </div>
                </td>
                <td className="p-4 md:p-6 text-zinc-500 text-xs">
                  {new Date(order.created_at).toLocaleDateString('pl-PL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="p-4 md:p-6">
                  <StatusBadge status={order.status} type="order" />
                </td>
                <td className="p-4 md:p-6">
                  <StatusBadge status={order.payment_status} type="payment" />
                </td>
                <td className="p-4 md:p-6">
                  <StatusBadge status={order.fulfillment_status} type="fulfillment" />
                </td>
                <td className="p-4 md:p-6 text-right font-mono font-bold text-[#adff2f]">
                  €{order.grand_total}
                </td>
                <td className="p-4 md:p-6">
                  <div className="flex justify-center gap-2">
                    <button className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 text-xs px-2 py-1 outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && (
        <EmptyState 
          icon={<ShoppingBag className="w-8 h-8 text-zinc-500" />}
          title="Brak zamówień"
          description="Nie znaleziono zamówień pasujących do kryteriów wyszukiwania."
        />
      )}
    </div>
  );
};

// Customers Tab
const CustomersTab = ({ customers, isLoading }: {
  customers: Customer[];
  isLoading: boolean;
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(customer => 
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase">
          KLIENCI <span className="text-gradient-street">SKLEPU</span>
        </h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 transition-colors text-sm font-bold">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Szukaj klientów..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-900 pl-12 pr-4 py-3 text-sm font-bold outline-none focus:border-[#00f2ff] transition-colors"
        />
      </div>

      {/* Customers Table */}
      <div className="overflow-x-auto border border-zinc-900 bg-zinc-950">
        <table className="w-full text-left text-sm min-w-[800px]">
          <thead className="border-b border-zinc-900 text-[10px] font-black uppercase text-zinc-500">
            <tr>
              <th className="p-4 md:p-6">Klient</th>
              <th className="p-4 md:p-6">Email</th>
              <th className="p-4 md:p-6">Zamówienia</th>
              <th className="p-4 md:p-6 text-right">Wydane</th>
              <th className="p-4 md:p-6">Język</th>
              <th className="p-4 md:p-6">Data Rejestracji</th>
              <th className="p-4 md:p-6 text-center">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.id} className="border-b border-zinc-900 hover:bg-zinc-900/50 transition-colors">
                <td className="p-4 md:p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-street flex items-center justify-center text-black font-black text-sm rounded-full">
                      {customer.first_name?.[0] || customer.email[0].toUpperCase()}
                    </div>
                    <span className="font-bold">
                      {customer.first_name} {customer.last_name}
                    </span>
                  </div>
                </td>
                <td className="p-4 md:p-6 text-zinc-400">{customer.email}</td>
                <td className="p-4 md:p-6">
                  <span className="font-bold">{customer.total_orders}</span>
                </td>
                <td className="p-4 md:p-6 text-right font-mono font-bold text-[#adff2f]">
                  €{customer.total_spent?.toFixed(2) || '0.00'}
                </td>
                <td className="p-4 md:p-6">
                  <span className="px-2 py-1 text-[10px] bg-zinc-900 font-black uppercase rounded">
                    {customer.preferred_language}
                  </span>
                </td>
                <td className="p-4 md:p-6 text-zinc-500 text-xs">
                  {new Date(customer.created_at).toLocaleDateString('pl-PL')}
                </td>
                <td className="p-4 md:p-6">
                  <div className="flex justify-center gap-2">
                    <button className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-zinc-500 hover:text-[#00f2ff] hover:bg-zinc-900 transition-colors rounded">
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCustomers.length === 0 && (
        <EmptyState 
          icon={<Users className="w-8 h-8 text-zinc-500" />}
          title="Brak klientów"
          description="Nie znaleziono klientów pasujących do kryteriów wyszukiwania."
        />
      )}
    </div>
  );
};

// Payments Tab
const PaymentsTab = ({ payments, isLoading, onRefresh }: {
  payments: Payment[];
  isLoading: boolean;
  onRefresh: () => void;
}) => {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  // Calculate totals
  const totalRevenue = payments.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + p.amount, 0);
  const todayRevenue = payments
    .filter(p => p.status === 'succeeded' && new Date(p.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = payments.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (dateRange === 'today') {
      return new Date(p.created_at).toDateString() === new Date().toDateString();
    }
    if (dateRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(p.created_at) >= weekAgo;
    }
    if (dateRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return new Date(p.created_at) >= monthAgo;
    }
    return true;
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase">
          PŁATNOŚCI <span className="text-gradient-street">& TRANSAKCJE</span>
        </h2>
        <div className="flex gap-2">
          <button onClick={onRefresh} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 transition-colors text-sm font-bold">
            <RefreshCw className="w-4 h-4" /> Odśwież
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 transition-colors text-sm font-bold">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-street p-6 text-black">
          <p className="text-xs font-bold uppercase opacity-70">Całkowity Przychód</p>
          <p className="text-3xl font-black font-mono">€{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 p-6">
          <p className="text-xs font-bold uppercase text-zinc-500">Dziś</p>
          <p className="text-3xl font-black font-mono text-[#adff2f]">€{todayRevenue.toFixed(2)}</p>
        </div>
        <StatCard 
          label="Sukces"
          value={payments.filter(p => p.status === 'succeeded').length}
          icon={<CheckCircle className="w-5 h-5 text-green-500" />}
          color="bg-green-500/20"
        />
        <StatCard 
          label="Oczekujące"
          value={payments.filter(p => p.status === 'pending').length}
          icon={<Clock className="w-5 h-5 text-yellow-500" />}
          color="bg-yellow-500/20"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-zinc-950 border border-zinc-900 px-4 py-2 text-sm font-bold outline-none focus:border-[#00f2ff]"
          aria-label="Filtruj po statusie"
        >
          <option value="all">Wszystkie statusy</option>
          <option value="succeeded">Sukces</option>
          <option value="pending">Oczekujące</option>
          <option value="failed">Nieudane</option>
          <option value="refunded">Zwrócone</option>
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-zinc-950 border border-zinc-900 px-4 py-2 text-sm font-bold outline-none focus:border-[#00f2ff]"
          aria-label="Zakres dat"
        >
          <option value="all">Cały okres</option>
          <option value="today">Dzisiaj</option>
          <option value="week">Ostatni tydzień</option>
          <option value="month">Ostatni miesiąc</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto border border-zinc-900 bg-zinc-950">
        <table className="w-full text-left text-sm min-w-[900px]">
          <thead className="border-b border-zinc-900 text-[10px] font-black uppercase text-zinc-500">
            <tr>
              <th className="p-4 md:p-6">ID Transakcji</th>
              <th className="p-4 md:p-6">Zamówienie</th>
              <th className="p-4 md:p-6">Dostawca</th>
              <th className="p-4 md:p-6">Metoda</th>
              <th className="p-4 md:p-6">Status</th>
              <th className="p-4 md:p-6 text-right">Kwota</th>
              <th className="p-4 md:p-6">Data</th>
              <th className="p-4 md:p-6 text-center">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map(payment => (
              <tr key={payment.id} className="border-b border-zinc-900 hover:bg-zinc-900/50 transition-colors cursor-pointer" onClick={() => setSelectedPayment(payment)}>
                <td className="p-4 md:p-6 font-mono text-xs text-zinc-400">
                  {payment.external_id?.slice(0, 16) || payment.id.slice(0, 8)}...
                </td>
                <td className="p-4 md:p-6">
                  <span className="font-bold font-mono text-[#00f2ff]">
                    {(payment as any).orders?.order_number || '-'}
                  </span>
                </td>
                <td className="p-4 md:p-6">
                  <span className="px-2 py-1 text-[10px] bg-zinc-900 font-black uppercase rounded">
                    {payment.provider}
                  </span>
                </td>
                <td className="p-4 md:p-6">
                  <div className="flex items-center gap-2">
                    {payment.card_brand && (
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                        payment.card_brand === 'visa' ? 'bg-blue-600' : 
                        payment.card_brand === 'mastercard' ? 'bg-orange-500' : 'bg-zinc-700'
                      }`}>
                        {payment.card_brand}
                      </span>
                    )}
                    {payment.card_last4 && (
                      <span className="text-xs text-zinc-500 font-mono">•••• {payment.card_last4}</span>
                    )}
                    {!payment.card_brand && payment.payment_method && (
                      <span className="text-xs font-bold uppercase">{payment.payment_method}</span>
                    )}
                  </div>
                </td>
                <td className="p-4 md:p-6">
                  <StatusBadge status={payment.status} type="payment" />
                </td>
                <td className="p-4 md:p-6 text-right font-mono font-bold text-[#adff2f]">
                  €{payment.amount.toFixed(2)}
                </td>
                <td className="p-4 md:p-6 text-zinc-500 text-xs">
                  {new Date(payment.created_at).toLocaleDateString('pl-PL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="p-4 md:p-6 text-center">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedPayment(payment); }}
                    className="p-2 text-zinc-500 hover:text-[#00f2ff] hover:bg-zinc-900 transition-colors rounded"
                    title="Zobacz szczegóły"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPayments.length === 0 && (
        <EmptyState 
          icon={<CreditCard className="w-8 h-8 text-zinc-500" />}
          title="Brak płatności"
          description="Nie znaleziono płatności pasujących do filtrów."
        />
      )}

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedPayment(null)}>
          <div className="bg-zinc-950 border border-zinc-900 max-w-lg w-full p-6 space-y-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black italic uppercase">Szczegóły Płatności</h3>
              <button onClick={() => setSelectedPayment(null)} className="p-2 hover:bg-zinc-900 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-bold">Status</p>
                  <StatusBadge status={selectedPayment.status} type="payment" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-bold">Kwota</p>
                  <p className="text-2xl font-mono font-black text-[#adff2f]">
                    €{selectedPayment.amount.toFixed(2)} {selectedPayment.currency}
                  </p>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-sm">ID Transakcji</span>
                  <span className="font-mono text-xs">{selectedPayment.external_id || selectedPayment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-sm">Dostawca</span>
                  <span className="font-bold uppercase">{selectedPayment.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-sm">Metoda</span>
                  <span className="font-bold">{selectedPayment.payment_method}</span>
                </div>
                {selectedPayment.card_brand && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500 text-sm">Karta</span>
                    <span className="font-bold uppercase">{selectedPayment.card_brand} •••• {selectedPayment.card_last4}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-sm">Data</span>
                  <span>{new Date(selectedPayment.created_at).toLocaleString('pl-PL')}</span>
                </div>
              </div>

              {selectedPayment.status === 'succeeded' && (
                <button className="w-full py-3 border border-red-500 text-red-500 font-black uppercase text-sm hover:bg-red-500 hover:text-black transition-colors">
                  Zwróć płatność
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Settings Tab
const SettingsTab = ({ settings, isLoading }: {
  settings: Setting[];
  isLoading: boolean;
}) => {
  const [activeCategory, setActiveCategory] = useState('general');

  const categories = [
    { id: 'general', label: 'Ogólne', icon: <Settings className="w-4 h-4" /> },
    { id: 'shop', label: 'Sklep', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'shipping', label: 'Wysyłka', icon: <Truck className="w-4 h-4" /> },
    { id: 'payment', label: 'Płatności', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'social', label: 'Social Media', icon: <Activity className="w-4 h-4" /> },
    { id: 'seo', label: 'SEO', icon: <Search className="w-4 h-4" /> },
  ];

  const categorySettings = settings.filter(s => s.category === activeCategory);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase">
        USTAWIENIA <span className="text-gradient-street">SKLEPU</span>
      </h2>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-4 lg:pb-0">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-3 p-4 font-bold uppercase text-sm transition-all whitespace-nowrap ${
                activeCategory === cat.id 
                  ? 'bg-[#00f2ff] text-black' 
                  : 'bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-white hover:border-zinc-800'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Settings Form */}
        <div className="flex-1 bg-zinc-950 border border-zinc-900 p-6 space-y-6">
          {categorySettings.map(setting => (
            <div key={setting.id} className="space-y-2">
              <label className="block text-sm font-bold uppercase text-zinc-400">
                {setting.key.replace(/_/g, ' ')}
              </label>
              {setting.description && (
                <p className="text-xs text-zinc-600">{setting.description}</p>
              )}
              {setting.type === 'boolean' ? (
                <button
                  className={`px-4 py-2 text-sm font-bold uppercase transition-colors ${
                    setting.value === 'true' || setting.value === true ? 'bg-[#adff2f] text-black' : 'bg-zinc-900 text-zinc-500'
                  }`}
                >
                  {setting.value === 'true' || setting.value === true ? 'Włączone' : 'Wyłączone'}
                </button>
              ) : setting.type === 'array' ? (
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    try {
                      const items = typeof setting.value === 'string' 
                        ? (setting.value.startsWith('[') ? JSON.parse(setting.value) : setting.value.split(','))
                        : Array.isArray(setting.value) ? setting.value : [setting.value];
                      return items.map((item: string) => (
                        <span key={item} className="px-3 py-1 bg-zinc-900 text-sm font-bold">
                          {String(item).trim()}
                        </span>
                      ));
                    } catch {
                      return <span className="px-3 py-1 bg-zinc-900 text-sm font-bold">{String(setting.value)}</span>;
                    }
                  })()}
                </div>
              ) : (
                <input
                  type={setting.type === 'number' ? 'number' : 'text'}
                  defaultValue={typeof setting.value === 'string' ? setting.value.replace(/"/g, '') : setting.value}
                  className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm font-bold outline-none focus:border-[#00f2ff] transition-colors"
                />
              )}
            </div>
          ))}

          <div className="pt-6 border-t border-zinc-900">
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-street text-black font-black italic uppercase text-sm">
              <Save className="w-4 h-4" /> Zapisz Zmiany
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Admin Panel Component
export const AdminPanel: React.FC<AdminPanelProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  // Load data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [
        statsData,
        productsData,
        categoriesData,
        ordersData,
        customersData,
        paymentsData,
        settingsData,
        recentOrdersData,
        topProductsData,
      ] = await Promise.all([
        getDashboardStats(),
        getProducts(),
        getCategories(),
        getOrders(),
        getCustomers(),
        getPayments(),
        getSettings(),
        getRecentOrders(),
        getTopProducts(),
      ]);

      setStats(statsData);
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setOrders(ordersData || []);
      setCustomers(customersData || []);
      setPayments(paymentsData || []);
      setSettings(settingsData || []);
      setRecentOrders(recentOrdersData || []);
      setTopProducts(topProductsData || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const tabs = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'products' as AdminTab, label: 'Produkty', icon: <Package className="w-4 h-4" /> },
    { id: 'orders' as AdminTab, label: 'Zamówienia', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'customers' as AdminTab, label: 'Klienci', icon: <Users className="w-4 h-4" /> },
    { id: 'payments' as AdminTab, label: 'Płatności', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'discounts' as AdminTab, label: 'Rabaty', icon: <Tag className="w-4 h-4" /> },
    { id: 'analytics' as AdminTab, label: 'Analityka', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings' as AdminTab, label: 'Ustawienia', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="pt-24 pb-12 md:pt-32 md:pb-24 px-4 md:px-8 lg:px-12 bg-black min-h-screen">
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-4 lg:pb-0 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-3 p-3 md:p-4 font-black italic uppercase tracking-widest transition-all text-xs md:text-sm whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-[#00f2ff] text-black' 
                  : 'hover:bg-zinc-900 text-zinc-500 hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardTab 
              stats={stats} 
              recentOrders={recentOrders}
              topProducts={topProducts}
              isLoading={isLoading} 
            />
          )}
          {activeTab === 'products' && (
            <ProductsTab 
              products={products} 
              categories={categories}
              isLoading={isLoading}
              onRefresh={loadData}
            />
          )}
          {activeTab === 'orders' && (
            <OrdersTab 
              orders={orders} 
              isLoading={isLoading}
              onRefresh={loadData}
            />
          )}
          {activeTab === 'customers' && (
            <CustomersTab 
              customers={customers} 
              isLoading={isLoading}
            />
          )}
          {activeTab === 'payments' && (
            <PaymentsTab 
              payments={payments} 
              isLoading={isLoading}
              onRefresh={loadData}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsTab 
              settings={settings} 
              isLoading={isLoading}
            />
          )}
          {activeTab === 'discounts' && (
            <EmptyState 
              icon={<Tag className="w-8 h-8 text-[#00f2ff]" />}
              title="Kody Rabatowe"
              description="Sekcja kodów rabatowych - w przygotowaniu"
            />
          )}
          {activeTab === 'analytics' && (
            <EmptyState 
              icon={<BarChart3 className="w-8 h-8 text-[#00f2ff]" />}
              title="Analityka"
              description="Zaawansowana analityka - w przygotowaniu"
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
