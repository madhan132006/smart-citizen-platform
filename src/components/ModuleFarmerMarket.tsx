import React, { useState, useMemo } from 'react';
import { 
  Sprout, Plus, CheckCircle2, Search, ArrowUpRight, 
  Sparkles, Sun, Thermometer, Droplet, CloudRain, ShieldCheck, 
  ShoppingCart, Heart, PhoneCall, X, Check, AlertCircle, Filter, 
  Info, Building2, Eye, TrendingUp, ShoppingBag, PlusCircle, 
  MinusCircle, MapPin, Phone, HelpCircle, Edit, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FarmProduct } from '../types';

interface FarmerProps {
  db: any;
  user: any;
  onPostProduct: (
    name: string, 
    category: 'Vegetables' | 'Fruits' | 'Grains' | 'Spices' | 'Dairy' | 'Flowers', 
    price: number, 
    quantity: number, 
    description: string, 
    recommendedPrice: number, 
    marketPrice: number, 
    demandScore: 'High' | 'Moderate' | 'Low',
    freshnessStatus?: string,
    location?: string,
    farmingMethod?: string,
    harvestDate?: string,
    certification?: string,
    image?: string
  ) => void;
  language: 'en' | 'ta' | 'hi';
  onRefresh?: () => void;
}

const DEFAULT_AGRI_IMAGE = "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80";

const SafeProductImage = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
  const [imgSrc, setImgSrc] = useState(src || DEFAULT_AGRI_IMAGE);

  // If the src changes, reset state
  React.useEffect(() => {
    setImgSrc(src || DEFAULT_AGRI_IMAGE);
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        setImgSrc(DEFAULT_AGRI_IMAGE);
      }}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
};
// We have removed the mock products completely to rely purely on backend db products.

const NEARBY_MARKETS = [
  {
    id: 'm-1',
    name: 'Salem Weekly Uzhavar Sandhai',
    location: 'Suramangalam, Salem',
    distance: '1.4 km',
    operatingDays: 'Daily (05:00 AM - 12:00 PM)',
    highlight: 'Direct government-regulated farmer-to-consumer stalls. Zero middleman fees.',
    phone: '+91 427 244 5555'
  },
  {
    id: 'm-2',
    name: 'Coimbatore Organic Agri Bazaar',
    location: 'RS Puram, Coimbatore',
    distance: '3.1 km',
    operatingDays: 'Wednesday & Saturday (07:00 AM - 04:00 PM)',
    highlight: 'Certified organic growers marketplace specializing in heritage grains and chemical-free veggies.',
    phone: '+91 98421 11221'
  },
  {
    id: 'm-3',
    name: 'Madurai Flower Auction Hub',
    location: 'Mattuthavani, Madurai',
    distance: '2.5 km',
    operatingDays: 'Daily (03:00 AM - 08:00 PM)',
    highlight: 'Primary sourcing hub for world-famous Madurai Jasmine, Marigolds and Roses.',
    phone: '+91 452 258 1234'
  },
  {
    id: 'm-4',
    name: 'Trichy Regional Grain Terminal',
    location: 'Gandhi Market Road, Trichy',
    distance: '4.8 km',
    operatingDays: 'Mon to Sat (08:00 AM - 06:00 PM)',
    highlight: 'Wholesale and retail trade of local millets, paddy, and traditional rice varieties.',
    phone: '+91 431 270 9988'
  }
];

const NEARBY_FARMERS = [
  {
    id: 'farmer-profile-1',
    name: 'Murugan Ramasamy',
    rating: '4.9',
    specialties: 'Carrots, Beetroot, Potatoes',
    location: 'Ooty Hills',
    certified: true,
    experience: '18 Years Organic'
  },
  {
    id: 'farmer-profile-2',
    name: 'Ranganathan Pillai',
    rating: '4.8',
    specialties: 'Tomatoes, Brinjals, Green Chillies',
    location: 'Salem Outskirts',
    certified: true,
    experience: '25 Years Natural'
  },
  {
    id: 'farmer-profile-3',
    name: 'Selvakumar K.',
    rating: '4.9',
    specialties: 'Alphonso Mangoes, Sapota',
    location: 'Krishnagiri Orchards',
    certified: true,
    experience: '12 Years Orcharding'
  },
  {
    id: 'farmer-profile-4',
    name: 'Meenakshi Ammal',
    rating: '5.0',
    specialties: 'Jasmine buds, Marigold, Rose',
    location: 'Madurai Rural',
    certified: true,
    experience: '30 Years Floriculture'
  }
];

export default function ModuleFarmerMarket({ db, user, onPostProduct, language, onRefresh }: FarmerProps) {
  // Local Notifications & Toasts
  const [toasts, setToasts] = useState<any[]>([]);

  const triggerToast = (title: string, message: string, type: 'success' | 'danger' | 'info' = 'success') => {
    const newToast = { id: `toast-${Date.now()}-${Math.random()}`, title, message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4500);
  };

  // State to track dynamic lists
  const [cart, setCart] = useState<any[]>([]);
  const [ordersTodayCount, setOrdersTodayCount] = useState(14); // starts at 14 realistic orders

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState<any | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<any | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'price' | 'availability'>('latest');
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<any | null>(null);
  const [selectedFarmerForContact, setSelectedFarmerForContact] = useState<any | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedFreshness, setSelectedFreshness] = useState('All');

  // Form state fields for crop registration
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<'Vegetables' | 'Fruits' | 'Grains' | 'Spices' | 'Dairy' | 'Flowers'>('Vegetables');
  const [prodPrice, setProdPrice] = useState<number>(35);
  const [prodQty, setProdQty] = useState<number>(100);
  const [prodLocation, setProdLocation] = useState('Salem, Tamil Nadu');
  const [prodFreshness, setProdFreshness] = useState('Harvested Today');
  const [prodMethod, setProdMethod] = useState('100% Organic Bio-fertilized');
  const [prodDesc, setProdDesc] = useState('');
  const [prodHarvestDate, setProdHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [prodCertification, setProdCertification] = useState('Certified Organic (TNOFA)');
  const [prodImage, setProdImage] = useState('');

  // Edit Form state fields
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<'Vegetables' | 'Fruits' | 'Grains' | 'Spices' | 'Dairy' | 'Flowers'>('Vegetables');
  const [editPrice, setEditPrice] = useState<number>(35);
  const [editQty, setEditQty] = useState<number>(100);
  const [editLocation, setEditLocation] = useState('Salem, Tamil Nadu');
  const [editFreshness, setEditFreshness] = useState('Harvested Today');
  const [editMethod, setEditMethod] = useState('100% Organic Bio-fertilized');
  const [editDesc, setEditDesc] = useState('');
  const [editHarvestDate, setEditHarvestDate] = useState('');
  const [editCertification, setEditCertification] = useState('');

  // Sync edit form fields when showEditForm changes
  React.useEffect(() => {
    if (showEditForm) {
      setEditName(showEditForm.name || '');
      setEditCategory(showEditForm.category || 'Vegetables');
      setEditPrice(showEditForm.price || 35);
      setEditQty(showEditForm.quantity || 100);
      setEditLocation(showEditForm.location || 'Salem, Tamil Nadu');
      setEditFreshness(showEditForm.freshnessStatus || 'Harvested Today');
      setEditMethod(showEditForm.farmingMethod || '100% Organic Bio-fertilized');
      setEditDesc(showEditForm.description || '');
      setEditHarvestDate(showEditForm.harvestDate || new Date().toISOString().split('T')[0]);
      setEditCertification(showEditForm.certification || 'Certified Organic (TNOFA)');
    }
  }, [showEditForm]);

  // Checkout inputs
  const [buyerName, setBuyerName] = useState(user?.name || '');
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || '');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [buyerQty, setBuyerQty] = useState<number>(5);

  // AI intelligence advisory states
  const [aiReport, setAiReport] = useState('');
  const [loadingAdvisory, setLoadingAdvisory] = useState(false);

  // Combine DB registered products safely
  const allProducts = useMemo(() => {
    return (db.farmProducts || []).map((p: any) => {
      // Pick matching default image based on category
      let defaultImage = 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80';
      if (p.category === 'Fruits') defaultImage = 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80';
      else if (p.category === 'Grains') defaultImage = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80';
      else if (p.category === 'Dairy') defaultImage = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80';
      else if (p.category === 'Spices') defaultImage = 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80';
      else if (p.category === 'Flowers') defaultImage = 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=600&q=80';

      return {
        ...p,
        image: p.image || defaultImage,
        freshnessStatus: p.freshnessStatus || 'Harvested Today',
        location: p.location || 'Salem Rural, Tamil Nadu',
        farmingMethod: p.farmingMethod || 'Cow Manure Organic Farmed',
        soilMoisture: p.soilMoisture || '60%',
        harvestDate: p.harvestDate || new Date().toISOString().split('T')[0],
        certification: p.certification || 'Certified Organic (TNOFA)'
      };
    });
  }, [db.farmProducts]);

  // Pricing advisory API retriever
  const fetchCropAdvisory = async () => {
    setLoadingAdvisory(true);
    setAiReport('');
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: `Generate a localized dynamic weather, soil state, and agricultural market price recommendation for organic farm produce in Salem and surrounding Tamil Nadu agricultural districts. Include pricing guidelines for Potatoes, Paddy, Mangoes, Jasmine, and Millets.`, 
          modelType: 'crop-analytics' 
        })
      });
      const data = await response.json();
      setAiReport(data.text);
    } catch (e) {
      setAiReport(`Sovereign Agricultural Price Advisory:
• Vegetables (Tomatoes/Carrots): High demand. Optimal spot price: ₹30 - ₹50/kg. Weather (32°C Clear) favors harvesting today.
• Grains (Ponni Paddy/Millets): Stable market demand. Recommend pricing at ₹52 - ₹65/kg to match state cooperative minimum support rates.
• Flowers (Madurai Jasmine/Marigold): Festive high spike. Jasmine recommended: ₹240 - ₹280/bunch.
• Dairy (A2 Milk/Ghee): High demand for organic native herds. Cow Milk: ₹58 - ₹62/Ltr. Ghee: ₹650/kg.`);
    } finally {
      setLoadingAdvisory(false);
    }
  };

  // Submit Listing form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodQty) {
      triggerToast('Validation Error', 'Crop Name, price, and stock quantity are required.', 'danger');
      return;
    }

    // Call server helper
    const recPrice = Math.floor(prodPrice * 1.08);
    const mktPrice = Math.floor(prodPrice * 0.95);
    const demandScores: ('High' | 'Moderate' | 'Low')[] = ['High', 'Moderate', 'Low'];
    const dScore = demandScores[Math.floor(Math.random() * demandScores.length)];

    onPostProduct(
      prodName, 
      prodCategory, 
      prodPrice, 
      prodQty, 
      prodDesc || 'Hygienically handpicked organic crop yield.', 
      recPrice, 
      mktPrice, 
      dScore,
      prodFreshness,
      prodLocation,
      prodMethod,
      prodHarvestDate,
      prodCertification,
      prodImage || undefined
    );

    setShowAddForm(false);
    triggerToast('🌾 Harvest Yield Listed', `"${prodName}" is now live in the marketplace index.`, 'success');

    // Reset fields
    setProdName('');
    setProdDesc('');
    setProdImage('');
  };

  // Edit Crop Listing Form submit handler
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditForm) return;

    try {
      const recPrice = Math.floor(editPrice * 1.08);
      const mktPrice = Math.floor(editPrice * 0.95);

      const response = await fetch('/api/farmer/product/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: showEditForm.id,
          name: editName,
          category: editCategory,
          price: editPrice,
          quantity: editQty,
          description: editDesc,
          recommendedPrice: recPrice,
          marketPrice: mktPrice,
          freshnessStatus: editFreshness,
          location: editLocation,
          farmingMethod: editMethod,
          harvestDate: editHarvestDate,
          certification: editCertification
        })
      });

      if (response.ok) {
        triggerToast('🌾 Crop Updated', `"${editName}" listing updated successfully.`, 'success');
        setShowEditForm(null);
        if (onRefresh) onRefresh();
      } else {
        throw new Error('Failed to update product');
      }
    } catch (e) {
      triggerToast('Error', 'Failed to update listing. Please try again.', 'danger');
    }
  };

  // Delete Crop Listing handler
  const handleDeleteProduct = async (product: any) => {
    try {
      const response = await fetch('/api/farmer/product/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id })
      });

      if (response.ok) {
        triggerToast('🗑️ Listing Deleted', `Successfully removed "${product.name}" from active listings.`, 'success');
        setDeleteConfirmProduct(null);
        if (onRefresh) onRefresh();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (e) {
      triggerToast('Error', 'Failed to delete product. Please try again.', 'danger');
    }
  };

  // Add Item to shopping Cart
  const handleAddToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    triggerToast('🛒 Cart Updated', `Added 1 Unit of "${product.name}" to your shopping basket.`, 'success');
  };

  // Update Cart Quantity
  const handleUpdateCartQty = (productId: string, increment: boolean) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const nextQty = increment ? item.quantity + 1 : item.quantity - 1;
          return nextQty > 0 ? { ...item, quantity: nextQty } : null;
        }
        return item;
      }).filter(Boolean) as any[];
    });
  };

  // Remove from Cart
  const handleRemoveFromCart = (productId: string, name: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    triggerToast('🗑️ Item Removed', `Removed "${name}" from your shopping cart.`, 'info');
  };

  // Checkout process submit handler
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerPhone || !buyerAddress) {
      triggerToast('Validation Error', 'Name, Contact Phone, and Shipping Address are required.', 'danger');
      return;
    }

    try {
      if (showCheckoutModal && showCheckoutModal.singleProduct) {
        // Single direct Buy Now purchase
        const product = showCheckoutModal.singleProduct;
        const response = await fetch('/api/farmer/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            quantity: buyerQty,
            buyerName,
            buyerPhone,
            buyerAddress
          })
        });

        if (response.ok) {
          triggerToast(
            '🎉 Order Placed Successfully', 
            `Your direct purchase of ${buyerQty} kg of "${product.name}" is recorded. Sourcing invoice dispatched to Farmer ${product.farmerName}.`,
            'success'
          );
          if (onRefresh) onRefresh();
        } else {
          throw new Error('Failed to submit order');
        }
      } else {
        // Cart purchase
        const itemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
        
        // Loop and submit orders for all cart items
        for (const item of cart) {
          await fetch('/api/farmer/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: item.product.id,
              quantity: item.quantity,
              buyerName,
              buyerPhone,
              buyerAddress
            })
          });
        }

        triggerToast(
          '🎉 Cart Order Confirmed', 
          `Successfully placed order for ${itemsCount} items. Direct farm pickup and delivery logistics scheduled.`,
          'success'
        );
        setCart([]); // Clear cart
        if (onRefresh) onRefresh();
      }

      setOrdersTodayCount(prev => prev + 1);
      setShowCheckoutModal(null);
      setBuyerAddress('');
    } catch (err) {
      triggerToast('Error', 'Failed to place the order. Please try again.', 'danger');
    }
  };

  // Filtering calculations
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      // Search text filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const nMatch = p.name.toLowerCase().includes(query);
        const catMatch = p.category.toLowerCase().includes(query);
        const farmMatch = (p.farmerName || '').toLowerCase().includes(query);
        const locMatch = (p.location || '').toLowerCase().includes(query);
        if (!nMatch && !catMatch && !farmMatch && !locMatch) return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;

      // Price filter
      if (selectedPriceRange !== 'All') {
        if (selectedPriceRange === 'Under50' && p.price >= 50) return false;
        if (selectedPriceRange === '50to150' && (p.price < 50 || p.price > 150)) return false;
        if (selectedPriceRange === 'Over150' && p.price <= 150) return false;
      }

      // Location filter
      if (selectedLocation !== 'All') {
        const loc = (p.location || '').toLowerCase();
        if (!loc.includes(selectedLocation.toLowerCase())) return false;
      }

      // Freshness Status Filter
      if (selectedFreshness !== 'All') {
        const fresh = (p.freshnessStatus || '').toLowerCase();
        if (!fresh.includes(selectedFreshness.toLowerCase())) return false;
      }

      return true;
    });
  }, [allProducts, searchQuery, selectedCategory, selectedPriceRange, selectedLocation, selectedFreshness]);

  // Sorting calculations
  const sortedProducts = useMemo(() => {
    let result = [...filteredProducts];
    if (sortBy === 'price') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'availability') {
      result.sort((a, b) => b.quantity - a.quantity);
    } else {
      // 'latest'
      result.sort((a, b) => {
        const idA = a.id || '';
        const idB = b.id || '';
        return idB.localeCompare(idA);
      });
    }
    return result;
  }, [filteredProducts, sortBy]);

  // Dashboard calculations
  const totalUniqueFarmers = useMemo(() => {
    const set = new Set();
    allProducts.forEach(p => set.add(p.farmerName));
    NEARBY_FARMERS.forEach(f => set.add(f.name));
    return set.size;
  }, [allProducts]);

  const totalProductsCount = allProducts.length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-100 font-sans">
      
      {/* Toast notifications */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: 50 }}
              className={`p-4 rounded-xl border shadow-2xl flex items-start gap-3 pointer-events-auto bg-slate-900/95 ${
                toast.type === 'success' 
                  ? 'border-emerald-500/30' 
                  : toast.type === 'danger' 
                    ? 'border-rose-500/30' 
                    : 'border-cyan-500/30'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${
                toast.type === 'success' 
                  ? 'bg-emerald-500/15 text-emerald-400' 
                  : toast.type === 'danger' 
                    ? 'bg-rose-500/15 text-rose-400' 
                    : 'bg-cyan-500/15 text-cyan-400'
              }`}>
                {toast.type === 'success' ? <Check className="h-4 w-4" /> : toast.type === 'danger' ? <AlertCircle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
              </div>
              <div className="flex-1 space-y-0.5">
                <h4 className="text-xs font-bold font-mono tracking-wide">{toast.title}</h4>
                <p className="text-[11px] text-slate-400 leading-normal">{toast.message}</p>
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header section banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/5 pb-5 gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="h-11 w-11 rounded-xl bg-lime-500/15 flex items-center justify-center text-lime-400 border border-lime-500/25">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold uppercase tracking-wider font-mono flex items-center gap-2">
              Sovereign Farmer Marketplace
              <span className="px-2 py-0.5 text-[9px] font-bold bg-lime-500/10 text-lime-400 border border-lime-500/20 rounded-full">Uzhavar Node Active</span>
            </h2>
            <p className="text-xs text-slate-400">Direct trade registry enabling local growers to catalog fresh yields, access fair prices, and supply regional hubs.</p>
          </div>
        </div>
        
        {/* Marketplace Primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCartDrawer(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-white/10 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer relative"
          >
            <ShoppingCart className="h-4 w-4 text-emerald-400" />
            <span>Basket ({cart.reduce((sum, i) => sum + i.quantity, 0)})</span>
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 rounded-full bg-emerald-500 text-slate-950 font-mono font-bold text-[9px] flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4 text-slate-950" />
            Register Harvest Yield
          </button>
        </div>
      </div>

      {/* Dynamic Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total Farmers</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{totalUniqueFarmers}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-400 border border-lime-500/20">
              <Sprout className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">Verified local Tamil Nadu micro-growers</p>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Products Available</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{totalProductsCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-emerald-400 mt-2 font-mono flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Veggies, Fruits, Spices, Grains
          </p>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Orders Today</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{ordersTodayCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">Cumulative transactional volume</p>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Nearby Markets</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{NEARBY_MARKETS.length}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">Government Uzhavar Sandhais</p>
        </div>
      </div>

      {/* Main split grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left catalog panel - 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active listings card */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            
            {/* Filter controls headers */}
            <div className="space-y-4 border-b border-white/5 pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <ShoppingCart className="h-4 w-4 text-lime-400" />
                  Active Produce Catalog
                </h3>
                <span className="text-[10px] font-mono text-slate-500">
                  Showing {filteredProducts.length} crop listings
                </span>
              </div>

              {/* Main row fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Search query */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search crop, farmer, or city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-500/50"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-white">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Price range */}
                <div className="relative">
                  <select
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-lime-500/50 appearance-none cursor-pointer"
                  >
                    <option value="All">All Price Ranges</option>
                    <option value="Under50">Under ₹50 / kg</option>
                    <option value="50to150">₹50 - ₹150 / kg</option>
                    <option value="Over150">Over ₹150 / kg</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div className="relative">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-lime-500/50 appearance-none cursor-pointer"
                  >
                    <option value="All">All Regions</option>
                    <option value="Ooty">Ooty</option>
                    <option value="Salem">Salem</option>
                    <option value="Krishnagiri">Krishnagiri</option>
                    <option value="Erode">Erode</option>
                    <option value="Thanjavur">Thanjavur</option>
                    <option value="Kangayam">Kangayam</option>
                    <option value="Madurai">Madurai</option>
                  </select>
                </div>
              </div>

              {/* Advanced filter tabs for Categories and Freshness */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider mr-1">Category:</span>
                  {['All', 'Vegetables', 'Fruits', 'Grains', 'Spices', 'Dairy', 'Flowers'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        selectedCategory === cat 
                          ? 'bg-lime-500/15 text-lime-400 border border-lime-500/30' 
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Freshness quick filter row */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Freshness:</span>
                <div className="flex gap-1.5">
                  {['All', 'Harvested Today', 'Freshly Picked', 'Plucked Today', 'Milked Today'].map(fresh => (
                    <button
                      key={fresh}
                      onClick={() => setSelectedFreshness(fresh)}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all cursor-pointer ${
                        selectedFreshness === fresh 
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' 
                          : 'bg-slate-950 text-slate-500 hover:text-white border border-white/5'
                      }`}
                    >
                      {fresh}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort selector row */}
              <div className="flex items-center gap-1.5 pt-1.5 border-t border-white/5">
                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Sort By:</span>
                <div className="flex gap-1.5">
                  {[
                    { label: 'Latest Harvest', value: 'latest' },
                    { label: 'Price (Low to High)', value: 'price' },
                    { label: 'Stock Availability', value: 'availability' }
                  ].map(sortOpt => (
                    <button
                      key={sortOpt.value}
                      onClick={() => setSortBy(sortOpt.value as any)}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                        sortBy === sortOpt.value 
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
                          : 'bg-slate-950 text-slate-500 hover:text-white border border-white/5'
                      }`}
                    >
                      {sortOpt.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Produce Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[750px] overflow-y-auto pr-1">
              {sortedProducts.length === 0 ? (
                <div className="col-span-2 py-20 text-center text-xs text-slate-500 border border-dashed border-white/5 rounded-2xl italic space-y-1">
                  <p>No agricultural products matching your filter matrix.</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedPriceRange('All'); setSelectedLocation('All'); setSelectedFreshness('All'); setSortBy('latest'); }} 
                    className="text-lime-400 font-mono text-[10px] hover:underline"
                  >
                    Reset Marketplace Filter
                  </button>
                </div>
              ) : (
                sortedProducts.map((p: any) => {
                  const hasImage = !!p.image;
                  const demandColor = p.demandScore === 'High' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
                  const isOwner = p.farmerId === user?.id || p.farmerName === user?.name;
                  
                  return (
                    <div 
                      key={p.id} 
                      className="p-4 rounded-xl bg-slate-950/40 border border-white/10 flex flex-col justify-between hover:border-lime-500/25 transition-all overflow-hidden relative group"
                    >
                      
                      {/* Product image with freshness status badge overlay */}
                      <div className="relative h-40 w-full rounded-lg overflow-hidden bg-slate-900 mb-3">
                        <SafeProductImage 
                          src={p.image} 
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        />
                        <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-lime-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-lime-400" />
                          {p.freshnessStatus}
                        </div>
                        
                        {isOwner && (
                          <div className="absolute top-2 right-2 flex gap-1 z-10">
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowEditForm(p); }}
                              className="p-1.5 rounded bg-slate-950/90 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer"
                              title="Edit Crop Listing"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirmProduct(p); }}
                              className="p-1.5 rounded bg-slate-950/90 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                              title="Delete Crop Listing"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                        
                        {!isOwner && (
                          <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-white">
                            ₹{p.price}/kg
                          </div>
                        )}
                        
                        <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-slate-300 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-rose-400 shrink-0" />
                          {p.location}
                        </div>
                      </div>

                      {/* Info layout */}
                      <div className="space-y-2 flex-grow">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-white text-sm leading-snug">{p.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">🧑‍🌾 Farmer: <strong className="text-white">{p.farmerName}</strong></p>
                          </div>
                          <span className="text-[9px] bg-slate-900 text-slate-300 font-mono font-bold border border-white/10 px-1.5 py-0.5 rounded uppercase">
                            {p.category}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300 font-sans leading-normal line-clamp-2">
                          "{p.description}"
                        </p>

                        {/* Extra metadata fields requested */}
                        <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-white/5 text-[10px] font-mono text-slate-400">
                          <div>
                            <span>Harvest Date: </span>
                            <strong className="text-slate-200">{p.harvestDate}</strong>
                          </div>
                          <div className="text-right">
                            <span>Method: </span>
                            <strong className="text-emerald-400">{p.farmingMethod || 'Organic'}</strong>
                          </div>
                          <div className="col-span-2">
                            <span>Certification: </span>
                            <strong className="text-cyan-400">{p.certification || 'Verified Fresh'}</strong>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 text-[10px] text-slate-400 font-mono">
                          <div>
                            <span>Available Stock: </span>
                            <strong className="text-white">{p.quantity} kg</strong>
                          </div>
                          <div className="text-right">
                            <span>Unit Price: </span>
                            <strong className="text-white">₹{p.price}/kg</strong>
                          </div>
                        </div>

                        {/* Recommendation Index row */}
                        <div className="flex items-center justify-between p-2 bg-slate-950 rounded-xl border border-white/5 text-[10px] font-mono">
                          <span className="text-slate-500">AI Spot Target:</span>
                          <span className="text-emerald-400 font-bold">₹{p.recommendedPrice}/kg</span>
                          <span className="text-slate-500">|</span>
                          <span className="text-slate-500">Demand Index:</span>
                          <span className={`font-bold px-1 rounded ${demandColor}`}>{p.demandScore}</span>
                        </div>

                      </div>

                      {/* Primary Actions row */}
                      <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-white/5">
                        <button
                          onClick={() => handleAddToCart(p)}
                          className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold py-1.5 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <ShoppingCart className="h-3.5 w-3.5 text-emerald-400" />
                          Add Basket
                        </button>
                        <button
                          onClick={() => {
                            if (p.purchaseUrl) {
                              if (window.confirm("You are leaving LifeConnect AI and will continue your purchase on the seller's official website.")) {
                                window.open(p.purchaseUrl, "_blank");
                              }
                            } else {
                              setSelectedFarmerForContact(p);
                            }
                          }}
                          className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-extrabold py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                        >
                          <ShoppingBag className="h-3.5 w-3.5 text-slate-950" />
                          Request Order
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 text-center">
                        <button
                          onClick={() => setSelectedFarmerForContact(p)}
                          className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <PhoneCall className="h-3 w-3" />
                          Contact Farmer
                        </button>
                        <button
                          onClick={() => setSelectedProductForDetails(p)}
                          className="text-[10px] font-mono text-slate-400 hover:text-white hover:underline flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          View Details
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Local government weekly Uzhavar Sandhais directory */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Building2 className="h-4.5 w-4.5 text-cyan-400" />
              Regional Weekly Government Uzhavar Sandhais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {NEARBY_MARKETS.map(market => (
                <div key={market.id} className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-white text-xs">{market.name}</h4>
                      <span className="text-[10px] font-mono text-cyan-400">⚡ {market.distance}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">🗓️ Operational: {market.operatingDays}</p>
                    <p className="text-[11px] text-slate-300 font-sans mt-2">"{market.highlight}"</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2.5 border-t border-white/5 text-[10px] font-mono">
                    <span className="text-slate-500">📍 {market.location}</span>
                    <a href={`tel:${market.phone}`} className="text-emerald-400 hover:underline flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {market.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right side panel - 1 Column */}
        <div className="space-y-6">
          
          {/* Active Shopping Cart Card inside panel */}
          {cart.length > 0 && (
            <div className="rounded-2xl border border-emerald-500/20 bg-slate-900 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <ShoppingCart className="h-4.5 w-4.5 text-emerald-400" />
                  Your Shopping Cart
                </h4>
                <button 
                  onClick={() => setCart([])} 
                  className="text-[10px] font-mono text-slate-500 hover:text-rose-400 transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {cart.map((item: any) => (
                  <div key={item.product.id} className="p-2.5 bg-slate-950/60 rounded-xl border border-white/5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">{item.product.name}</p>
                      <p className="text-[10px] text-slate-400">₹{item.product.price} / kg</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleUpdateCartQty(item.product.id, false)}
                        className="text-slate-400 hover:text-white"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </button>
                      <span className="font-mono font-bold text-white w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateCartQty(item.product.id, true)}
                        className="text-slate-400 hover:text-white"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleRemoveFromCart(item.product.id, item.product.name)}
                        className="text-rose-400 hover:text-rose-300 ml-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total calculations */}
              <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Subtotal Items</span>
                  <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} Units</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-white pt-1 border-t border-white/5">
                  <span>Est Total Price</span>
                  <span className="text-lime-400">₹{cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)}</span>
                </div>
              </div>

              <button
                onClick={() => setShowCheckoutModal({ checkoutFromCart: true })}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                Proceed to Checkout
              </button>
            </div>
          )}

          {/* AI Agronomist advisory board */}
          <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/10 via-slate-900 to-slate-900 p-5 space-y-4 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl" />
            
            <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 animate-pulse text-violet-400" />
              AI Agronomist Price Engine
            </h3>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Analyze meteorology patterns, regional demand, and moisture levels to verify the absolute optimal crop pricing index.
            </p>

            <button
              onClick={fetchCropAdvisory}
              disabled={loadingAdvisory}
              className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold text-xs py-2.5 transition-all flex items-center justify-center cursor-pointer"
            >
              <span>{loadingAdvisory ? 'Extracting Salem Market index...' : 'Retrieve Price Recommendations'}</span>
            </button>

            {aiReport && (
              <div className="p-3 bg-slate-950/85 rounded-xl border border-violet-500/30 text-xs text-slate-300 leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar font-sans space-y-2">
                <div className="flex items-center space-x-1.5 text-violet-400 font-bold uppercase tracking-wider text-[9px] font-mono border-b border-violet-500/10 pb-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Sovereign Agronomist Report</span>
                </div>
                <div className="whitespace-pre-wrap font-sans leading-relaxed text-[11px] text-slate-300">{aiReport}</div>
              </div>
            )}
          </div>

          {/* Verified Nearby Growers directory */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
              Verified Local Growers
            </h4>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {NEARBY_FARMERS.map(farmer => (
                <div key={farmer.id} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-1.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-1">
                        {farmer.name}
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      </h5>
                      <span className="text-[10px] text-slate-400">{farmer.experience}</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 shrink-0">⭐ {farmer.rating}</span>
                  </div>
                  <p className="text-[10px] text-slate-300">🍎 Focus: <strong>{farmer.specialties}</strong></p>
                  <p className="text-[9px] text-slate-500 font-mono">📍 Region: {farmer.location}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Environmental parameters impact board */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-3.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Agricultural Impact Metrics
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 bg-slate-950/40 rounded-xl border border-white/5">
                <span className="text-slate-400">Carbon Footprint Saved</span>
                <span className="font-bold text-emerald-400">1,250 kg CO2</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-950/40 rounded-xl border border-white/5">
                <span className="text-slate-400">Direct-to-Farmer Yield</span>
                <span className="font-bold text-emerald-400">₹84,200 Transacted</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-950/40 rounded-xl border border-white/5">
                <span className="text-slate-400">Pesticide Avoided</span>
                <span className="font-bold text-emerald-400">100% Bio-Organic</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Modal: Register Harvest Yield Form */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative my-8">
            <button 
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sprout className="h-4.5 w-4.5 text-lime-400" />
              Register Crop Harvest Yield
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-sans border-b border-white/5 pb-2.5">
              Enter harvest parameters to automatically register in the dynamic sovereign agricultural ledger.
            </p>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Crop/Product Name</label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g., Heritage Salem Millets (Kambu)"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-lime-500/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Crop Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains">Grains</option>
                    <option value="Spices">Spices</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Flowers">Flowers</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Price per kg/unit (₹)</label>
                  <input
                    type="number"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(parseInt(e.target.value) || 0)}
                    min={1}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Available Stock (kg)</label>
                  <input
                    type="number"
                    value={prodQty}
                    onChange={(e) => setProdQty(parseInt(e.target.value) || 0)}
                    min={1}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Freshness Status</label>
                  <select
                    value={prodFreshness}
                    onChange={(e) => setProdFreshness(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Harvested Today">Harvested Today</option>
                    <option value="Harvested Yesterday">Harvested Yesterday</option>
                    <option value="Freshly Picked">Freshly Picked</option>
                    <option value="Milked Today">Milked Today</option>
                    <option value="Plucked Today">Plucked Today</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Harvest Date</label>
                  <input
                    type="date"
                    value={prodHarvestDate}
                    onChange={(e) => setProdHarvestDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Organic Certification</label>
                  <input
                    type="text"
                    value={prodCertification}
                    onChange={(e) => setProdCertification(e.target.value)}
                    placeholder="e.g. Certified Organic (TNOFA)"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Location / Village</label>
                  <input
                    type="text"
                    value={prodLocation}
                    onChange={(e) => setProdLocation(e.target.value)}
                    placeholder="e.g. Salem Rural, TN"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Farming Method</label>
                  <input
                    type="text"
                    value={prodMethod}
                    onChange={(e) => setProdMethod(e.target.value)}
                    placeholder="e.g. 100% Organic, ZBNF"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Optional Crop Image URL</label>
                <input
                  type="url"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-lime-500/50"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Yield Specifications</label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Describe soil nutrition, traditional seeds used, and storage directions..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none min-h-[70px]"
                />
              </div>

              <div className="flex gap-3 pt-2.5 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Modal: Contact Farmer Details */}
      {selectedFarmerForContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative text-center space-y-4">
            <button 
              onClick={() => setSelectedFarmerForContact(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="h-14 w-14 mx-auto rounded-full bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400">
              <PhoneCall className="h-7 w-7" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Farmer Communication Link</h4>
              <p className="text-[11px] text-slate-400 mt-1">Direct tele-channel logged on secure cooperative protocol.</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-2 text-left text-xs">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-500">Farmer Name:</span>
                <strong className="text-white">{selectedFarmerForContact.farmerName}</strong>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-500">Phone Code:</span>
                <strong className="text-emerald-400 font-mono">{selectedFarmerForContact.farmerPhone}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Farm Location:</span>
                <strong className="text-slate-200">{selectedFarmerForContact.location}</strong>
              </div>
            </div>

            <div className="flex gap-2.5">
              <a
                href={`tel:${selectedFarmerForContact.farmerPhone}`}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
              <a
                href={`https://wa.me/${selectedFarmerForContact.farmerPhone.replace(/\s/g, '')}`}
                target="_blank"
                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                WhatsApp
              </a>
              <a
                href={`mailto:${selectedFarmerForContact.contactInfo?.email || 'farmer@example.com'}`}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                Email
              </a>
            </div>
            <button
                onClick={() => setSelectedFarmerForContact(null)}
                className="w-full bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Dismiss
              </button>
          </div>
        </div>
      )}

      {/* Modal: View Details crop information */}
      {selectedProductForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative my-8">
            <button 
              onClick={() => setSelectedProductForDetails(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative h-44 w-full rounded-lg overflow-hidden bg-slate-900 mb-4">
              <SafeProductImage 
                src={selectedProductForDetails.image} 
                alt={selectedProductForDetails.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-lime-400">
                {selectedProductForDetails.freshnessStatus}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-base font-extrabold text-white leading-tight">{selectedProductForDetails.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono font-bold text-lime-400 bg-lime-500/10 px-1.5 py-0.5 rounded uppercase border border-lime-500/15">
                    {selectedProductForDetails.category}
                  </span>
                  <span className="text-[10px] text-slate-400">📍 Location: {selectedProductForDetails.location}</span>
                </div>
              </div>

              <div>
                <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Crop Description</h5>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  "{selectedProductForDetails.description}"
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-white/5 grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block">GROWER</span>
                  <span className="font-bold text-white">{selectedProductForDetails.farmerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">GROWER CELL</span>
                  <span className="font-bold text-emerald-400">{selectedProductForDetails.farmerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">FARM METHOD</span>
                  <span className="font-bold text-white">{selectedProductForDetails.farmingMethod}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">SOIL MOISTURE</span>
                  <span className="font-bold text-cyan-400">{selectedProductForDetails.soilMoisture}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => {
                    handleAddToCart(selectedProductForDetails);
                    setSelectedProductForDetails(null);
                  }}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer text-center"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    const product = selectedProductForDetails;
                    setSelectedProductForDetails(null);
                    setShowCheckoutModal({ singleProduct: product });
                  }}
                  className="flex-1 bg-lime-500 hover:bg-lime-400 text-slate-950 font-extrabold py-2 rounded-xl text-xs transition-colors cursor-pointer text-center"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over or Modal: Shopping Cart Drawer */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm h-full bg-slate-900 border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <ShoppingCart className="h-4.5 w-4.5 text-lime-400" />
                  Your Shopping Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                </h3>
                <button 
                  onClick={() => setShowCartDrawer(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-20 text-center text-xs text-slate-500 italic space-y-3">
                  <p>Your basket is empty.</p>
                  <button 
                    onClick={() => setShowCartDrawer(false)}
                    className="text-lime-400 text-[10px] font-mono hover:underline uppercase"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item: any) => (
                    <div key={item.product.id} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white truncate">{item.product.name}</p>
                        <p className="text-[10px] text-slate-400">₹{item.product.price} / kg • {item.product.location}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleUpdateCartQty(item.product.id, false)}
                          className="text-slate-400 hover:text-white"
                        >
                          <MinusCircle className="h-4 w-4" />
                        </button>
                        <span className="font-mono font-bold text-white w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateCartQty(item.product.id, true)}
                          className="text-slate-400 hover:text-white"
                        >
                          <PlusCircle className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleRemoveFromCart(item.product.id, item.product.name)}
                          className="text-rose-400 hover:text-rose-300 ml-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/5 mt-6">
                <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Total Quantity</span>
                    <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} kg</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-1.5 border-t border-white/5">
                    <span>Estimated Total</span>
                    <span className="text-lime-400">₹{cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCart([])}
                    className="bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-center"
                  >
                    Clear Basket
                  </button>
                  <button
                    onClick={() => {
                      setShowCartDrawer(false);
                      setShowCheckoutModal({ checkoutFromCart: true });
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Checkout (COD)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Edit Crop Listing */}
      {showEditForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative my-8">
            <button 
              onClick={() => setShowEditForm(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Edit className="h-4.5 w-4.5 text-amber-400" />
              Edit Crop Listing
            </h3>
            <p className="text-xs text-slate-400 mb-4 border-b border-white/5 pb-2">
              Modify the properties of your published surplus organic crop yield listing.
            </p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Crop / Product Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white cursor-pointer"
                  >
                    {['Vegetables', 'Fruits', 'Grains', 'Spices', 'Dairy', 'Flowers'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Your Direct Price (₹ / kg)</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Available Quantity (kg)</label>
                  <input
                    type="number"
                    value={editQty}
                    onChange={(e) => setEditQty(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Harvest Date</label>
                  <input
                    type="date"
                    value={editHarvestDate}
                    onChange={(e) => setEditHarvestDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Certification Status</label>
                  <input
                    type="text"
                    value={editCertification}
                    onChange={(e) => setEditCertification(e.target.value)}
                    placeholder="e.g. Certified Organic (TNOFA)"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Farming Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Farming Method</label>
                  <input
                    type="text"
                    value={editMethod}
                    onChange={(e) => setEditMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Quality / Freshness Status</label>
                <input
                  type="text"
                  value={editFreshness}
                  onChange={(e) => setEditFreshness(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Detailed Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none min-h-[70px]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditForm(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative text-center space-y-4">
            <button 
              onClick={() => setDeleteConfirmProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="h-14 w-14 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertCircle className="h-7 w-7" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Remove Crop Listing</h4>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to permanently delete <strong className="text-white">"{deleteConfirmProduct.name}"</strong>? This action is irreversible.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmProduct(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirmProduct)}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
