import React, { useState, useMemo } from 'react';
import { 
  Gift, Plus, CheckCircle2, User, Clock, 
  MapPin, QrCode, ShieldCheck, Heart, Coffee, UserCheck,
  Search, Filter, X, Check, AlertCircle, Building2, Eye,
  PhoneCall, Sparkles, PlusCircle, MessageSquareShare, Info,
  TrendingUp, Compass, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FoodDonation } from '../types';

interface FoodProps {
  db: any;
  user: any;
  onPostDonation: (restaurantName: string, foodType: string, quantity: string, expiryTime: string, address: string) => void;
  onPostFoodRequest: (organizationName: string, contactPerson: string, phone: string, foodNeeded: string, quantityNeeded: string, location: string, urgency: string, description: string) => void;
  onClaimDonation: (id: string, name: string, phone: string) => void;
  onDeliverDonation: (id: string) => void;
  language: 'en' | 'ta' | 'hi';
}

const PARTNER_NGOS = [
  {
    id: 'ngo-1',
    name: 'Annai Teresa Welfare Home',
    type: 'Orphanage & Elderly Care',
    city: 'Chennai',
    location: 'Mylapore',
    distance: '1.2 km',
    capacity: '80 residents',
    needs: 'Cooked lunch, Dry rations',
    phone: '+91 44 2464 1234',
    verified: true
  },
  {
    id: 'ngo-2',
    name: 'Adyar Child Rehabilitation Center',
    type: 'Children Shelter',
    city: 'Chennai',
    location: 'Adyar',
    distance: '0.9 km',
    capacity: '45 children',
    needs: 'Evening snacks, milk, fruits',
    phone: '+91 98401 55667',
    verified: true
  },
  {
    id: 'ngo-3',
    name: 'Chennai Homeless Relief Initiative',
    type: 'Community Kitchen',
    city: 'Chennai',
    location: 'Central Chennai',
    distance: '2.8 km',
    capacity: '150 daily meals',
    needs: 'Rice packages, breads, vegetables',
    phone: '+91 44 2821 5555',
    verified: true
  },
  {
    id: 'ngo-4',
    name: 'Peace Community Kitchen',
    type: 'Shelter Kitchen',
    city: 'Chennai',
    location: 'Guindy',
    distance: '3.2 km',
    capacity: '120 homeless',
    needs: 'Any cooked surplus meals',
    phone: '+91 95001 00223',
    verified: true
  },
  {
    id: 'ngo-5',
    name: 'Care & Share Orphanage',
    type: 'Orphanage',
    city: 'Chennai',
    location: 'Velachery',
    distance: '2.1 km',
    capacity: '60 children',
    needs: 'Breakfast packs, dry grocery',
    phone: '+91 97501 23456',
    verified: true
  }
];

const INITIAL_FOOD_DONATIONS = [
  {
    id: 'food-mock-1',
    restaurantName: 'Anjappar Chettinad Restaurant',
    foodType: 'Veg Meals (Rice, Sambar, Kootu)',
    quantity: '40 Servings',
    donorName: 'Rajesh Kannan (Manager)',
    address: 'Adyar, Chennai',
    pickupTime: '12:30 PM',
    expiryTime: 'Within 3 Hours',
    status: 'Available' as const,
    contactPhone: '+91 98402 11223',
    city: 'Chennai',
    description: 'Freshly prepared high-quality vegetarian meals, packed individually in eco-friendly boxes. Includes side dishes and pickle.',
    packaging: 'Individual Box Packets',
    dietType: 'Vegetarian',
    preparationTime: '11:45 AM'
  },
  {
    id: 'food-mock-2',
    restaurantName: 'Sangeetha Vegetarian Restaurant',
    foodType: 'Idli, Pongal & Chutney',
    quantity: '25 Servings',
    donorName: 'Karthik Pillai (Owner)',
    address: 'Mylapore, Chennai',
    pickupTime: '08:30 AM',
    expiryTime: 'Within 2 Hours',
    status: 'Available' as const,
    contactPhone: '+91 94441 55667',
    city: 'Chennai',
    description: 'Hot breakfast parcels with freshly ground coconut chutney and piping hot sambar. Excellent for community distributions.',
    packaging: 'Container Packs',
    dietType: 'Vegetarian',
    preparationTime: '07:30 AM'
  },
  {
    id: 'food-mock-3',
    restaurantName: 'Thalappakatti Biryani',
    foodType: 'Chicken Biryani & Raitha',
    quantity: '50 Servings',
    donorName: 'Sundar Govind (Admin)',
    address: 'T-Nagar, Chennai',
    pickupTime: '01:30 PM',
    expiryTime: 'Within 4 Hours',
    status: 'Assigned' as const,
    volunteerName: 'Dinesh Karthik',
    volunteerPhone: '+91 98111 22233',
    contactPhone: '+91 95001 00223',
    city: 'Chennai',
    description: 'Seera Saga Samba Chicken Biryani cooked in traditional firewood ovens. Includes cooling onion raitha packets.',
    packaging: 'Individual Foiled Boxes',
    dietType: 'Non-Vegetarian',
    preparationTime: '12:15 PM'
  },
  {
    id: 'food-mock-4',
    restaurantName: 'A2B Adyar Ananda Bhavan',
    foodType: 'Mini Sambar Idli & Sweet Kesari',
    quantity: '35 Servings',
    donorName: 'Srinivasan Raman',
    address: 'Velachery, Chennai',
    pickupTime: '06:30 PM',
    expiryTime: 'Within 3 Hours',
    status: 'Delivered' as const,
    volunteerName: 'Dinesh Karthik',
    volunteerPhone: '+91 98111 22233',
    contactPhone: '+91 98412 88990',
    city: 'Chennai',
    description: 'Ghee-roasted mini sambar idlis with sweet pineapple kesari dessert packets. Perfectly portioned and easy to hand out.',
    packaging: 'Eco Leaf Containers',
    dietType: 'Vegetarian',
    preparationTime: '05:30 PM'
  },
  {
    id: 'food-mock-5',
    restaurantName: 'Dindigul Thalappakatti',
    foodType: 'Egg Fried Rice & Gobi Manchurian',
    quantity: '20 Servings',
    donorName: 'Feroz Khan (Supervisor)',
    address: 'Anna Nagar, Chennai',
    pickupTime: '09:00 PM',
    expiryTime: 'Within 3 Hours',
    status: 'Available' as const,
    contactPhone: '+91 99620 44332',
    city: 'Chennai',
    description: 'Indo-Chinese egg fried rice with spicy gravy gobi manchurian. Freshly prepared, safe, and portioned nicely.',
    packaging: 'Thermal Zip Bags',
    dietType: 'Non-Vegetarian',
    preparationTime: '08:15 PM'
  }
];

const INITIAL_FOOD_REQUESTS = [
  {
    id: 'req-mock-1',
    organizationName: 'Annai Teresa Welfare Home',
    contactPerson: 'Sister Maria',
    phone: '+91 44 2464 1234',
    foodNeeded: 'Dinner Meals (Veg preferred)',
    quantityNeeded: '45 Servings',
    location: 'Mylapore, Chennai',
    urgency: 'Urgent / Within 2 Hours',
    status: 'Pending' as const,
    description: 'Urgent need of cooked vegetarian dinner for our senior citizens. Simple food preferred.'
  },
  {
    id: 'req-mock-2',
    organizationName: 'Care & Share Orphanage',
    contactPerson: 'Brother Paul',
    phone: '+91 97501 23456',
    foodNeeded: 'Lunch / Rice & Curry',
    quantityNeeded: '60 Servings',
    location: 'Velachery, Chennai',
    urgency: 'Normal / Lunch hour',
    status: 'Assigned' as const,
    assignedVolunteer: 'Dinesh Karthik',
    description: 'Cooked rice and sambar/gravy needed for 60 children for tomorrow afternoon lunch.'
  },
  {
    id: 'req-mock-3',
    organizationName: 'Guindy Homeless Shelter',
    contactPerson: 'Anbu Chelvan',
    phone: '+91 95001 00223',
    foodNeeded: 'Breakfast (Idli/Pongal)',
    quantityNeeded: '50 Servings',
    location: 'Guindy, Chennai',
    urgency: 'Critical / Morning',
    status: 'Pending' as const,
    description: 'Looking for hot breakfast donation for 50 shelter occupants living near Guindy industrial estate.'
  }
];

export default function ModuleFoodDonation({ 
  db, user, onPostDonation, onPostFoodRequest, onClaimDonation, onDeliverDonation, language 
}: FoodProps) {
  // Toasts management
  const [toasts, setToasts] = useState<any[]>([]);

  const triggerToast = (title: string, message: string, type: 'success' | 'danger' | 'info' = 'success') => {
    const newToast = { id: `toast-${Date.now()}-${Math.random()}`, title, message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4500);
  };

  // Local React State for live persistence and fallback handling
  const [localDonations, setLocalDonations] = useState<any[]>([]);
  const [localRequests, setLocalRequests] = useState<any[]>([]);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Form modal triggers
  const [showDonateForm, setShowDonateForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Detail modals
  const [selectedDonationForDetails, setSelectedDonationForDetails] = useState<any | null>(null);
  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState<any | null>(null);

  // Donate Form Inputs
  const [restaurantName, setRestaurantName] = useState('');
  const [foodType, setFoodType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryTime, setExpiryTime] = useState('Within 3 Hours');
  const [address, setAddress] = useState('');
  const [donorNameInput, setDonorNameInput] = useState(user?.name || '');
  const [contactPhoneInput, setContactPhoneInput] = useState(user?.phone || '');
  const [pickupTimeInput, setPickupTimeInput] = useState('12:30 PM');
  const [dietTypeInput, setDietTypeInput] = useState('Vegetarian');
  const [packagingInput, setPackagingInput] = useState('Individual Box Packets');
  const [descriptionInput, setDescriptionInput] = useState('');

  // Request Form Inputs
  const [reqOrg, setReqOrg] = useState('');
  const [reqFood, setReqFood] = useState('');
  const [reqQuantity, setReqQuantity] = useState('');
  const [reqLocation, setReqLocation] = useState('');
  const [reqUrgency, setReqUrgency] = useState('Urgent / Within 2 Hours');
  const [reqContactName, setReqContactName] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqDesc, setReqDesc] = useState('');

  const locations = ['All', 'Adyar', 'Mylapore', 'T-Nagar', 'Velachery', 'Anna Nagar', 'Guindy', 'Central Chennai'];
  const statusOptions = ['All', 'Available', 'Assigned', 'Delivered'];
  const dietOptions = ['All', 'Vegetarian', 'Non-Vegetarian'];

  // Sync server DB donations into local state if they exist
  const allDonations = useMemo(() => {
    const map = new Map();
    
    // Add default initial mock data
    localDonations.forEach(d => map.set(d.id, d));
    
    // Add server DB donations
    (db.foodDonations || []).forEach((d: any) => {
      map.set(d.id, {
        ...d,
        donorName: d.donorName || d.restaurantName,
        pickupTime: d.pickupTime || 'Immediate',
        dietType: d.dietType || 'Vegetarian',
        description: d.description || 'Surplus hot food, safe and hygienic, ready for pickup by designated NGOs.',
        packaging: d.packaging || 'Container Packs',
        preparationTime: d.preparationTime || 'Recent'
      });
    });

    return Array.from(map.values());
  }, [db.foodDonations, localDonations]);

  // Combine requests
  const allRequests = useMemo(() => {
    const map = new Map();
    
    localRequests.forEach(r => map.set(r.id, r));
    
    (db.foodRequests || []).forEach((r: any) => {
      map.set(r.id, {
        ...r
      });
    });

    return Array.from(map.values());
  }, [db.foodRequests, localRequests]);

  // Filtering Logic
  const filteredDonations = useMemo(() => {
    return allDonations.filter(d => {
      // Diet Type filter
      if (selectedDiet !== 'All' && d.dietType !== selectedDiet) return false;

      // Location filter
      if (selectedLocation !== 'All') {
        const addr = (d.address || '').toLowerCase();
        if (!addr.includes(selectedLocation.toLowerCase())) return false;
      }

      // Status filter
      if (selectedStatus !== 'All' && d.status !== selectedStatus) return false;

      // Search Query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const restMatch = d.restaurantName.toLowerCase().includes(query);
        const foodMatch = d.foodType.toLowerCase().includes(query);
        const donorMatch = (d.donorName || '').toLowerCase().includes(query);
        const addrMatch = (d.address || '').toLowerCase().includes(query);
        if (!restMatch && !foodMatch && !donorMatch && !addrMatch) return false;
      }

      return true;
    });
  }, [allDonations, selectedDiet, selectedLocation, selectedStatus, searchQuery]);

  // Dashboard Stats
  const stats = useMemo(() => {
    const total = allDonations.length;
    const available = allDonations.filter(d => d.status === 'Available').length;
    const activeRequests = allRequests.filter(r => r.status === 'Pending').length;
    const partnerNgos = PARTNER_NGOS.length;
    return { total, available, activeRequests, partnerNgos };
  }, [allDonations, allRequests]);

  // Donate food submit handler
  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantName || !foodType || !quantity) {
      triggerToast('Validation Error', 'Restaurant Name, Food Type, and Quantity are required.', 'danger');
      return;
    }

    // Call the parent callback to post to the Express API (if server is live)
    onPostDonation(
      restaurantName, 
      foodType, 
      quantity, 
      expiryTime, 
      address || 'Chennai Metropolitan Area'
    );

    // Save locally for instant robust UI rendering
    const newDonation = {
      id: `food-local-${Date.now()}`,
      restaurantName,
      foodType,
      quantity,
      expiryTime,
      address: address || 'Chennai Metropolitan Area',
      donorName: donorNameInput || user?.name || 'Authorized Donor',
      contactPhone: contactPhoneInput || user?.phone || '+91 94440 12345',
      pickupTime: pickupTimeInput || 'Within 1 Hour',
      dietType: dietTypeInput,
      packaging: packagingInput,
      description: descriptionInput || 'Fresh surplus edible food packaged under highly hygienic parameters.',
      preparationTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Available' as const,
      timestamp: new Date().toISOString()
    };

    setLocalDonations(prev => [newDonation, ...prev]);
    setShowDonateForm(false);
    triggerToast('🥗 Donation Registered', `Surplus food from "${restaurantName}" is live on the zero-waste ledger!`, 'success');

    // Reset Form Inputs
    setRestaurantName('');
    setFoodType('');
    setQuantity('');
    setAddress('');
    setDescriptionInput('');
  };

  // Request food submit handler
  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqOrg || !reqFood || !reqQuantity || !reqPhone) {
      triggerToast('Validation Error', 'Organization Name, Food Needed, Quantity, and Phone are required.', 'danger');
      return;
    }

    onPostFoodRequest(
        reqOrg,
        reqContactName || 'Coordinator',
        reqPhone,
        reqFood,
        reqQuantity,
        reqLocation || 'Chennai City Hub',
        reqUrgency,
        reqDesc || 'Cooked meals needed to support our community feeding drives.'
    );

    const newRequest = {
      id: `req-local-${Date.now()}`,
      organizationName: reqOrg,
      foodNeeded: reqFood,
      quantityNeeded: reqQuantity,
      location: reqLocation || 'Chennai City Hub',
      urgency: reqUrgency,
      contactPerson: reqContactName || 'Coordinator',
      phone: reqPhone,
      status: 'Pending' as const,
      description: reqDesc || 'Cooked meals needed to support our community feeding drives.'
    };

    setLocalRequests(prev => [newRequest, ...prev]);
    setShowRequestForm(false);
    triggerToast('🔴 Request Broadcasted', `Community food request for ${reqQuantity} of ${reqFood} has been published.`, 'info');

    // Reset Form Inputs
    setReqOrg('');
    setReqFood('');
    setReqQuantity('');
    setReqLocation('');
    setReqContactName('');
    setReqPhone('');
    setReqDesc('');
  };

  // Accept Request (Claim/Accept Donation)
  const handleAcceptRequest = (donationId: string) => {
    // Call server claim handler if it exists
    onClaimDonation(
      donationId,
      user?.name || 'Volunteer Dinesh',
      user?.phone || '+91 98111 22233'
    );

    // Update local state instantly for robust rendering
    setLocalDonations(prev => prev.map(d => {
      if (d.id === donationId) {
        return {
          ...d,
          status: 'Assigned',
          volunteerName: user?.name || 'Dinesh Karthik',
          volunteerPhone: user?.phone || '+91 98111 22233'
        };
      }
      return d;
    }));

    triggerToast(
      '🚚 Acceptance Registered', 
      'Logistics node locked. Delivery route mapped to nearest community kitchen.', 
      'success'
    );
  };

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
              className={`p-4 rounded-xl border shadow-2xl flex items-start gap-3 pointer-events-auto ${
                toast.type === 'success' 
                  ? 'bg-slate-900/95 border-emerald-500/30 text-white' 
                  : toast.type === 'danger' 
                    ? 'bg-slate-900/95 border-rose-500/30 text-white' 
                    : 'bg-slate-900/95 border-cyan-500/30 text-white'
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

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/5 pb-5 gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="h-11 w-11 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 border border-emerald-500/25">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold uppercase tracking-wider font-mono flex items-center gap-2">
              Zero Waste Food Donation Network
              <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full animate-pulse">Eco-Vault Active</span>
            </h2>
            <p className="text-xs text-slate-400">Harmonizing surplus retail food with active NGO shelters and welfare kitchens with transparent tracking.</p>
          </div>
        </div>
        
        {/* Actions bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDonateForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4 text-slate-950" />
            Donate Food
          </button>
          <button
            onClick={() => setShowRequestForm(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            Request Food
          </button>
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total Donations</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{stats.total}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Coffee className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">Cumulative ecological savings</p>
        </div>

        {/* Stat 2 */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Available Food</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{stats.available}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-emerald-400 mt-2 font-mono flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active batches ready
          </p>
        </div>

        {/* Stat 3 */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Active Requests</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{stats.activeRequests}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-rose-400 mt-2 font-mono">Shelter demand streams</p>
        </div>

        {/* Stat 4 */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Partner NGOs</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{stats.partnerNgos}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">Verified logistics centers</p>
        </div>
      </div>

      {/* Main split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Donations & Requests directories */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Donations List Container */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            
            {/* Filter controls */}
            <div className="space-y-4 border-b border-white/5 pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Coffee className="h-4 w-4 text-emerald-400" />
                  Surplus Food Donation Ledger
                </h3>
                <span className="text-[10px] font-mono text-slate-500">
                  Showing {filteredDonations.length} records
                </span>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search restaurant or food item..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-white">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Location Filter */}
                <div className="relative">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                  >
                    <option value="All">All Locations</option>
                    <option value="Adyar">Adyar</option>
                    <option value="Mylapore">Mylapore</option>
                    <option value="T-Nagar">T-Nagar</option>
                    <option value="Velachery">Velachery</option>
                    <option value="Anna Nagar">Anna Nagar</option>
                    <option value="Guindy">Guindy</option>
                  </select>
                </div>

                {/* Availability Filter */}
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                  >
                    <option value="All">All Availabilities</option>
                    <option value="Available">Available Only</option>
                    <option value="Assigned">Assigned Only</option>
                    <option value="Delivered">Delivered Only</option>
                  </select>
                </div>
              </div>

              {/* Diet Type filters row */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Diet:</span>
                <div className="flex gap-1.5">
                  {dietOptions.map(diet => (
                    <button
                      key={diet}
                      onClick={() => setSelectedDiet(diet)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        selectedDiet === diet 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* List */}
            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredDonations.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500 border border-dashed border-white/5 rounded-2xl italic space-y-1">
                  <p>No food donations matching search criteria.</p>
                  <button onClick={() => { setSearchQuery(''); setSelectedDiet('All'); setSelectedLocation('All'); setSelectedStatus('All'); }} className="text-emerald-400 font-mono text-[10px] hover:underline">
                    Clear Filters
                  </button>
                </div>
              ) : (
                filteredDonations.map((food: any) => {
                  const isAvailable = food.status === 'Available';
                  const isVeg = food.dietType === 'Vegetarian';
                  return (
                    <div 
                      key={food.id} 
                      className={`p-4 rounded-xl border transition-all ${
                        food.status === 'Delivered' 
                          ? 'bg-slate-950/20 border-white/5 opacity-60' 
                          : 'bg-slate-950/40 border-white/10 hover:border-emerald-500/20'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-white text-xs">{food.restaurantName}</span>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              isVeg ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {food.dietType}
                            </span>
                            <span className="text-[10px] bg-slate-900 text-slate-300 font-mono font-extrabold px-1.5 py-0.5 rounded border border-white/5">
                              {food.quantity}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-200 font-semibold pt-1">🍽️ Food Item: {food.foodType}</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1.5 font-sans">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-rose-400" />
                              Location: {food.address}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3 text-cyan-400" />
                              Donor: {food.donorName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-amber-400" />
                              Safe Expiry: {food.expiryTime}
                            </span>
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="h-3 w-3 text-emerald-400" />
                              Phone: {food.contactPhone || '+91 94440 12345'}
                            </span>
                          </div>
                        </div>

                        {/* Actions buttons */}
                        <div className="flex sm:flex-col items-stretch justify-end gap-2 shrink-0 pt-2 sm:pt-0">
                          {isAvailable ? (
                            <button
                              onClick={() => handleAcceptRequest(food.id)}
                              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 transition-colors cursor-pointer text-center whitespace-nowrap"
                            >
                              Accept Request
                            </button>
                          ) : (
                            <span className={`text-[9px] font-mono px-2 py-1 rounded text-center block font-bold ${
                              food.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            }`}>
                              {food.status === 'Assigned' ? 'Claimed' : food.status}
                            </span>
                          )}
                          <button
                            onClick={() => setSelectedDonationForDetails(food)}
                            className="rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold px-3 py-1.5 transition-colors border border-white/5 cursor-pointer text-center"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Food Requests Board Section */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <AlertCircle className="h-4.5 w-4.5 text-rose-500" />
                NGO & Shelter Immediate Requests
              </h3>
              <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 rounded font-mono font-bold">
                {allRequests.filter(r => r.status === 'Pending').length} Pending
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allRequests.length === 0 ? (
                <div className="col-span-2 py-8 text-center text-xs text-slate-500 italic">No community requests filed.</div>
              ) : (
                allRequests.map((req: any) => (
                  <div key={req.id} className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-white text-xs block leading-tight">{req.organizationName}</span>
                        <span className={`text-[9px] font-mono px-1.5 rounded uppercase font-bold ${
                          req.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-300">😋 Needed: <strong className="text-white">{req.foodNeeded}</strong></p>
                      <p className="text-[10px] text-slate-400">📊 Vol/Servings: {req.quantityNeeded}</p>
                      
                      <div className="space-y-0.5 text-[10px] text-slate-500 pt-1 border-t border-white/5">
                        <p>📍 Location: {req.location}</p>
                        <p>⏰ Urgency: <strong className="text-rose-400 font-mono font-bold">{req.urgency}</strong></p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => setSelectedRequestForDetails(req)}
                        className="bg-white/5 hover:bg-white/10 text-slate-300 py-1 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors border border-white/5 cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Details
                      </button>
                      
                      {req.status === 'Pending' ? (
                        <button
                          onClick={() => {
                            setLocalRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'Assigned', assignedVolunteer: user?.name || 'Volunteer Dinesh' } : r));
                            triggerToast('👍 Request Matched', `You committed to deliver food to ${req.organizationName}.`, 'success');
                          }}
                          className="bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-bold py-1 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors border border-emerald-500/25 cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Commit
                        </button>
                      ) : (
                        <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 rounded py-1 border border-emerald-500/20 text-center block select-none">
                          Committed
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Side Column */}
        <div className="space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-3.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-emerald-400" />
              Express Node Triggers
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => setShowDonateForm(true)}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs py-3.5 transition-all shadow-lg hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Donate Surplus Food
              </button>
              <button
                onClick={() => setShowRequestForm(true)}
                className="w-full rounded-xl bg-slate-950 hover:bg-slate-900 text-emerald-400 border border-emerald-500/20 font-bold text-xs py-3.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4 text-emerald-400" />
                File Food Request
              </button>
            </div>
          </div>

          {/* Verified Nearby NGOs & Shelters Directory */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Building2 className="h-4.5 w-4.5 text-cyan-400" />
                Verified Partner Hubs
              </h4>
              <span className="text-[9px] bg-cyan-500/10 text-cyan-400 font-mono font-bold border border-cyan-500/20 px-1.5 rounded">
                NGO Directory
              </span>
            </div>

            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {PARTNER_NGOS.map(ngo => (
                <div key={ngo.id} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-2 hover:border-white/10 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-1">
                        {ngo.name}
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      </h5>
                      <span className="text-[10px] text-slate-400 font-sans">{ngo.type}</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 shrink-0">⚡ {ngo.distance}</span>
                  </div>

                  <div className="space-y-1 text-[10px] text-slate-300 pt-1.5 border-t border-white/5">
                    <p>📍 Location: <strong>{ngo.location}, {ngo.city}</strong></p>
                    <p>👥 Serving Capacity: <strong>{ngo.capacity}</strong></p>
                    <p>🍎 Urgent Needs: <strong className="text-amber-400">{ngo.needs}</strong></p>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <a 
                      href={`tel:${ngo.phone}`} 
                      className="text-[10px] font-mono text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <PhoneCall className="h-3 w-3" />
                      {ngo.phone}
                    </a>
                    <button
                      onClick={() => {
                        setReqOrg(ngo.name);
                        setReqLocation(`${ngo.location}, ${ngo.city}`);
                        setReqPhone(ngo.phone);
                        setShowRequestForm(true);
                        triggerToast('NGO Selected', `Loaded coordinates for ${ngo.name}`, 'info');
                      }}
                      className="text-[10px] font-mono text-slate-400 hover:text-white"
                    >
                      Raise Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Environmental parameters impact board */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-3.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Sovereign Impact Metrics
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 bg-slate-950/40 rounded-xl border border-white/5">
                <span className="text-slate-400">CO2 Emissions Saved</span>
                <span className="font-bold text-emerald-400">480 kg CO2</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-950/40 rounded-xl border border-white/5">
                <span className="text-slate-400">Landfill Waste Diverted</span>
                <span className="font-bold text-emerald-400">320 kg Solid</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-950/40 rounded-xl border border-white/5">
                <span className="text-slate-400">Poverty Shelter Meals</span>
                <span className="font-bold text-emerald-400">1,420 Meals</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Modal: Donate Food Form */}
      {showDonateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative my-8">
            <button 
              onClick={() => setShowDonateForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Gift className="h-4 w-4 text-emerald-400" />
              List Excess Surplus Food
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-sans border-b border-white/5 pb-2.5">
              Provide specific descriptions and thermal storage parameters to expedite volunteers.
            </p>
            
            <form onSubmit={handleDonateSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Establishment Name</label>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="e.g., Sangeetha Veg Restaurant"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Food Items & Preparation details</label>
                <input
                  type="text"
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value)}
                  placeholder="e.g., Sambar Rice, Curd Rice packets, Papad"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Diet Type</label>
                  <select
                    value={dietTypeInput}
                    onChange={(e) => setDietTypeInput(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Quantity (Servings)</label>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g., 30 Servings"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Pickup Time</label>
                  <input
                    type="text"
                    value={pickupTimeInput}
                    onChange={(e) => setPickupTimeInput(e.target.value)}
                    placeholder="e.g., 12:30 PM"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Safe Expiry</label>
                  <select
                    value={expiryTime}
                    onChange={(e) => setExpiryTime(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Within 1 Hour">Within 1 Hour</option>
                    <option value="Within 2 Hours">Within 2 Hours</option>
                    <option value="Within 3 Hours">Within 3 Hours</option>
                    <option value="Within 5 Hours">Within 5 Hours</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Packaging Format</label>
                  <input
                    type="text"
                    value={packagingInput}
                    onChange={(e) => setPackagingInput(e.target.value)}
                    placeholder="e.g., Individual Box Packets"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Donor Name</label>
                  <input
                    type="text"
                    value={donorNameInput}
                    onChange={(e) => setDonorNameInput(e.target.value)}
                    placeholder="e.g., Rajesh Kannan"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={contactPhoneInput}
                  onChange={(e) => setContactPhoneInput(e.target.value)}
                  placeholder="e.g., +91 98402 11223"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Pickup Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g., Alwarpet, Chennai"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Description / Allergen Flags (Optional)</label>
                <textarea
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  placeholder="Specify any dietary tags, preparation warmth, or handling guidelines..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none min-h-[70px] resize-none"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowDonateForm(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Publish Donation Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Request Food Form */}
      {showRequestForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative my-8">
            <button 
              onClick={() => setShowRequestForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <PlusCircle className="h-4 w-4 text-emerald-400" />
              File Community Food Request
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-sans border-b border-white/5 pb-2.5">
              Publish shelter requirements. Registered hotels and local volunteers will match parameters.
            </p>
            
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Welfare/NGO Organization Name</label>
                <input
                  type="text"
                  value={reqOrg}
                  onChange={(e) => setReqOrg(e.target.value)}
                  placeholder="e.g., Annai Teresa Welfare Home"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Food Items Needed</label>
                  <input
                    type="text"
                    value={reqFood}
                    onChange={(e) => setReqFood(e.target.value)}
                    placeholder="e.g., Lunch Rice & Sambar"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Volume Required</label>
                  <input
                    type="text"
                    value={reqQuantity}
                    onChange={(e) => setReqQuantity(e.target.value)}
                    placeholder="e.g., 50 Servings"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Location / Area</label>
                  <input
                    type="text"
                    value={reqLocation}
                    onChange={(e) => setReqLocation(e.target.value)}
                    placeholder="e.g., Mylapore, Chennai"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Urgency Matrix</label>
                  <select
                    value={reqUrgency}
                    onChange={(e) => setReqUrgency(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Urgent / Within 2 Hours">Urgent / Within 2 Hours</option>
                    <option value="Normal / Lunch hour">Normal / Lunch hour</option>
                    <option value="Evening snacks">Evening snacks</option>
                    <option value="Critical / Morning">Critical / Morning</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Contact Coordinator</label>
                  <input
                    type="text"
                    value={reqContactName}
                    onChange={(e) => setReqContactName(e.target.value)}
                    placeholder="e.g., Sister Maria"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Coordinator Mobile</label>
                  <input
                    type="text"
                    value={reqPhone}
                    onChange={(e) => setReqPhone(e.target.value)}
                    placeholder="e.g., +91 44 2464 1234"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Specific Needs / Storage Flags (Optional)</label>
                <textarea
                  value={reqDesc}
                  onChange={(e) => setReqDesc(e.target.value)}
                  placeholder="Specify beneficiary demographics (e.g. elderly/kids), spice tolerances, or vessel requirements..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none min-h-[70px] resize-none"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Broadcast Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Donation Details */}
      {selectedDonationForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative space-y-4">
            <button 
              onClick={() => setSelectedDonationForDetails(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-3 border-b border-white/5 pb-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <Coffee className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{selectedDonationForDetails.restaurantName}</h3>
                <p className="text-[10px] text-slate-400 font-mono">ID: {selectedDonationForDetails.id}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 space-y-1.5">
                <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">Food Specifications</p>
                <p>🥗 Items: <strong className="text-white">{selectedDonationForDetails.foodType}</strong></p>
                <p>📊 Quantity: <strong className="text-emerald-400 font-mono">{selectedDonationForDetails.quantity}</strong></p>
                <p>🥑 Diet Classification: <strong>{selectedDonationForDetails.dietType}</strong></p>
              </div>

              <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 space-y-1.5">
                <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">Hygiene & Safety Log</p>
                <p>🍳 Prep Time: <strong>{selectedDonationForDetails.preparationTime || 'Not logged'}</strong></p>
                <p>📦 Thermal Packaging: <strong>{selectedDonationForDetails.packaging || 'Container Bags'}</strong></p>
                <p>⏰ Safe Expiry window: <strong className="text-amber-400">{selectedDonationForDetails.expiryTime}</strong></p>
              </div>

              <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 space-y-1.5">
                <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">Logistics & Contact coordinates</p>
                <p>👤 Point of Contact: <strong>{selectedDonationForDetails.donorName}</strong></p>
                <p>📍 Pickup Coordinates: <strong className="text-white">{selectedDonationForDetails.address}</strong></p>
                <p>📞 Coordinator Mobile: <strong className="text-emerald-400 font-mono">{selectedDonationForDetails.contactPhone || '+91 94440 12345'}</strong></p>
              </div>

              {selectedDonationForDetails.description && (
                <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold mb-1">Donor remarks</p>
                  <p className="italic text-slate-400">"{selectedDonationForDetails.description}"</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/5">
              <button
                onClick={() => setSelectedDonationForDetails(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close details
              </button>
              {selectedDonationForDetails.status === 'Available' && (
                <button
                  onClick={() => {
                    handleAcceptRequest(selectedDonationForDetails.id);
                    setSelectedDonationForDetails(null);
                  }}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Accept Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Request Details */}
      {selectedRequestForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative space-y-4">
            <button 
              onClick={() => setSelectedRequestForDetails(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-3 border-b border-white/5 pb-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{selectedRequestForDetails.organizationName}</h3>
                <p className="text-[10px] text-slate-400 font-mono">ID: {selectedRequestForDetails.id}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 space-y-1.5">
                <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">Beneficiary Requirements</p>
                <p>😋 Needed Food Type: <strong className="text-white">{selectedRequestForDetails.foodNeeded}</strong></p>
                <p>📊 Required Servings: <strong className="text-cyan-400 font-mono">{selectedRequestForDetails.quantityNeeded}</strong></p>
              </div>

              <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 space-y-1.5">
                <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">Delivery Parameters</p>
                <p>📍 Destination Address: <strong>{selectedRequestForDetails.location}</strong></p>
                <p>⏰ Urgency Matrix: <strong className="text-rose-400 font-bold">{selectedRequestForDetails.urgency}</strong></p>
              </div>

              <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 space-y-1.5">
                <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">Contact Coordinates</p>
                <p>👤 Coordinator Name: <strong>{selectedRequestForDetails.contactPerson}</strong></p>
                <p>📞 Shelter Contact Phone: <strong className="text-emerald-400 font-mono">{selectedRequestForDetails.phone}</strong></p>
              </div>

              {selectedRequestForDetails.description && (
                <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold mb-1">Request notes</p>
                  <p className="italic text-slate-400">"{selectedRequestForDetails.description}"</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/5">
              <button
                onClick={() => setSelectedRequestForDetails(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close details
              </button>
              {selectedRequestForDetails.status === 'Pending' && (
                <button
                  onClick={() => {
                    setLocalRequests(prev => prev.map(r => r.id === selectedRequestForDetails.id ? { ...r, status: 'Assigned', assignedVolunteer: user?.name || 'Volunteer Dinesh' } : r));
                    triggerToast('👍 Request Matched', `Committed to deliver food to ${selectedRequestForDetails.organizationName}.`, 'success');
                    setSelectedRequestForDetails(null);
                  }}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Commit Delivery
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
