import React, { useState, useEffect } from 'react';
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  LogOut, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  ArrowRight,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/products/ProductCard';
import { api } from '../services/api';
import { Order, Product, Address, isStoreAdmin } from '../types';

export const CustomerAccountPage: React.FC = () => {
  const { 
    user, 
    logout, 
    setCurrentView, 
    viewParam, 
    wishlist, 
    addToCart,
    showToast,
    setIsAuthModalOpen,
    setAuthModalMode
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'wishlist'>(
    (typeof viewParam === 'string' && ['orders', 'profile', 'addresses', 'wishlist'].includes(viewParam))
      ? (viewParam as any)
      : 'orders'
  );

  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>(user?.savedAddresses || [
    {
      id: 'addr-1',
      fullName: user?.name || 'Rameshwar Jha',
      phone: user?.phone || '+91 98350 21980',
      street: 'Near Watson High School, Opposite Durga Mandir',
      locality: 'Tirhut Colony',
      city: 'Madhubani',
      state: 'Bihar',
      pinCode: '847211',
      landmark: 'Durga Mandir Road',
      isDefault: true
    }
  ]);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newLocality, setNewLocality] = useState('Tirhut Colony');
  const [newLandmark, setNewLandmark] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        setLoading(true);
        const [ordList, prodList] = await Promise.all([
          api.getOrders({ email: user.email }),
          api.getProducts()
        ]);
        setOrders(ordList);
        setWishlistProducts(prodList.filter(p => wishlist.includes(p.id)));
      } catch (e) {
        console.error('Error fetching account data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, wishlist]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-forest/10 text-forest flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-charcoal">Sign in to your Account</h2>
        <p className="text-xs text-charcoal-muted">
          View your order history, manage delivery addresses, and track active deliveries in Madhubani.
        </p>
        <button
          onClick={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
          className="px-6 py-2.5 bg-forest hover:bg-forest-dark text-white rounded-xl text-xs font-bold transition-all shadow"
        >
          Login or Register →
        </button>
      </div>
    );
  }

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim()) return;

    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      fullName: user.name,
      phone: user.phone || '+91 98113 40853',
      street: newStreet,
      locality: newLocality,
      city: 'Madhubani',
      state: 'Bihar',
      pinCode: '847211',
      landmark: newLandmark,
      isDefault: false
    };

    setAddresses(prev => [...prev, newAddr]);
    setShowAddressForm(false);
    setNewStreet('');
    setNewLandmark('');
    showToast('New delivery address saved', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* Top Profile Banner */}
      <div className="bg-forest rounded-3xl p-6 md:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card">
        <div className="flex items-center gap-4 text-center sm:text-left">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-2xl object-cover shadow border-2 border-white/40" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-warmYellow text-forest flex items-center justify-center text-2xl font-black shadow">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-2xl text-white">{user.name}</h1>
              {user.provider === 'google' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-charcoal flex items-center gap-1 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Google Verified
                </span>
              )}
            </div>
            <p className="text-xs text-ivory-100">{user.email} • {user.phone || '+91 98113 40853'}</p>
            <p className="text-[11px] text-warmYellow mt-0.5">Madhubani, Bihar (PIN 847211)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isStoreAdmin(user) && (
            <button
              onClick={() => setCurrentView('admin')}
              className="px-4 py-2 bg-white text-forest rounded-xl text-xs font-bold shadow hover:bg-ivory transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-forest" />
              <span>Admin Panel</span>
            </button>
          )}

          <button
            onClick={logout}
            className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2 text-xs font-bold">
        {[
          { id: 'orders', label: 'My Orders', icon: Package, count: orders.length },
          { id: 'wishlist', label: 'Wishlist', icon: Heart, count: wishlist.length },
          { id: 'addresses', label: 'Delivery Addresses', icon: MapPin, count: addresses.length },
          { id: 'profile', label: 'Account Profile', icon: User }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-forest text-forest font-black'
                  : 'border-transparent text-charcoal-muted hover:text-charcoal'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-forest text-white' : 'bg-gray-100 text-charcoal'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-bold text-lg text-charcoal">Your Order History</h3>
            <span className="text-xs text-charcoal-muted">{orders.length} orders placed</span>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-charcoal-light mx-auto" />
              <p className="font-bold text-sm text-charcoal">No orders yet</p>
              <p className="text-xs text-charcoal-muted">Start filling your grocery basket with fresh essentials.</p>
              <button
                onClick={() => setCurrentView('catalog')}
                className="px-5 py-2.5 bg-forest text-white rounded-xl text-xs font-bold shadow"
              >
                Browse Catalogue
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-card space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <span className="font-mono font-bold text-sm text-charcoal">{ord.id}</span>
                      <p className="text-[11px] text-charcoal-muted">
                        Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        ord.orderStatus === 'Delivered'
                          ? 'bg-fresh/15 text-fresh-dark'
                          : ord.orderStatus === 'Cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-warmYellow/30 text-charcoal'
                      }`}>
                        {ord.orderStatus}
                      </span>
                      <button
                        onClick={() => setCurrentView('track-order', ord.id)}
                        className="px-3 py-1.5 bg-forest text-white rounded-xl text-xs font-bold hover:bg-forest-dark transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <span>Track Order</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="divide-y divide-gray-50 text-xs">
                    {ord.items.map((item, i) => (
                      <div key={i} className="py-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded-md border" />
                          <div>
                            <p className="font-bold text-charcoal">{item.name}</p>
                            <p className="text-[10px] text-charcoal-muted">{item.packSize} • Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-bold text-forest">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                    <span className="text-charcoal-muted">Total Paid via {ord.paymentMethod}:</span>
                    <span className="text-base font-black text-forest">₹{ord.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-lg text-charcoal">Saved in Wishlist ({wishlistProducts.length})</h3>
          {wishlistProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
              <Heart className="w-10 h-10 text-charcoal-light mx-auto" />
              <p className="font-bold text-sm text-charcoal">Your wishlist is currently empty</p>
              <button
                onClick={() => setCurrentView('catalog')}
                className="px-5 py-2.5 bg-forest text-white rounded-xl text-xs font-bold shadow"
              >
                Explore Supermarket Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {wishlistProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-bold text-lg text-charcoal">Saved Delivery Addresses in Madhubani</h3>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="px-3 py-1.5 bg-forest text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-card space-y-3 text-xs">
              <h4 className="font-bold text-charcoal uppercase">Add Delivery Address</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">Street / House Address</label>
                  <input
                    type="text"
                    required
                    placeholder="House No, Ward No, Colony Street"
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    className="w-full px-3 py-2 bg-ivory-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Locality in Madhubani</label>
                  <input
                    type="text"
                    required
                    value={newLocality}
                    onChange={(e) => setNewLocality(e.target.value)}
                    className="w-full px-3 py-2 bg-ivory-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Landmark</label>
                  <input
                    type="text"
                    placeholder="Near temple, school, or chowk"
                    value={newLandmark}
                    onChange={(e) => setNewLandmark(e.target.value)}
                    className="w-full px-3 py-2 bg-ivory-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-forest text-white rounded-xl font-bold">
                  Save Address
                </button>
                <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 bg-gray-100 rounded-xl">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-card space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-charcoal">{addr.fullName}</span>
                  {addr.isDefault && (
                    <span className="px-2 py-0.5 rounded bg-fresh/10 text-fresh-dark text-[10px] font-bold">
                      Default Delivery Address
                    </span>
                  )}
                </div>
                <p className="text-charcoal-muted">{addr.street}, {addr.locality}</p>
                {addr.landmark && <p className="text-charcoal-muted">Landmark: {addr.landmark}</p>}
                <p className="text-charcoal-muted">PIN: {addr.pinCode}, Madhubani, Bihar</p>
                <p className="text-charcoal-muted">Phone: {addr.phone}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-card max-w-xl space-y-4 text-xs">
          <h3 className="font-heading font-bold text-lg text-charcoal">Profile Information</h3>
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-charcoal mb-1">Full Name</label>
              <input type="text" disabled value={user.name} className="w-full px-3 py-2 bg-gray-50 border rounded-xl" />
            </div>
            <div>
              <label className="block font-bold text-charcoal mb-1">Email</label>
              <input type="email" disabled value={user.email} className="w-full px-3 py-2 bg-gray-50 border rounded-xl" />
            </div>
            <div>
              <label className="block font-bold text-charcoal mb-1">Phone</label>
              <input type="text" disabled value={user.phone || '+91 98113 40853'} className="w-full px-3 py-2 bg-gray-50 border rounded-xl" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
