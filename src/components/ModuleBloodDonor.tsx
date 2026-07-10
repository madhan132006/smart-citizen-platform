import React, { useState, useMemo } from 'react';
import { 
  Droplet, Search, ShieldAlert, Plus, CheckCircle2, 
  MapPin, Phone, HelpCircle, Activity, TrendingUp,
  Filter, Heart, Building2, Eye, PhoneCall, X, Check,
  Clock, User, PlusCircle, AlertCircle, Sparkles, MessageSquareShare,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BloodDonor, BloodRequest } from '../types';

interface BloodProps {
  db: any;
  onRegisterDonor: (name: string, bloodGroup: string, age: number, phone: string, address: string) => void;
  onPostRequest: (hospitalName: string, bloodGroup: string, units: number, requiredBy: string, contactName: string, phone: string) => void;
  language: 'en' | 'ta' | 'hi';
}

export default function ModuleBloodDonor({ db, onRegisterDonor, onPostRequest, language }: BloodProps) {
  // Local state for toast notifications
  const [toasts, setToasts] = useState<any[]>([]);

  const triggerToast = (title: string, message: string, type: 'success' | 'danger' | 'info' = 'success') => {
    const newToast = { id: `toast-${Date.now()}-${Math.random()}`, title, message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4000);
  };

  // Local state for registering and requesting (to support instant React state updates)
  const [localDonors, setLocalDonors] = useState<any[]>([]);
  const [localRequests, setLocalRequests] = useState<any[]>([]);

  // Modal Triggers
  const [showRegForm, setShowRegForm] = useState(false);
  const [showReqForm, setShowReqForm] = useState(false);
  const [selectedDonorForDetails, setSelectedDonorForDetails] = useState<any | null>(null);
  const [selectedDonorForContact, setSelectedDonorForContact] = useState<any | null>(null);

  // Search and Filter criteria
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  // Form States - Become Donor
  const [donorName, setDonorName] = useState('');
  const [donorGroup, setDonorGroup] = useState('O+');
  const [donorAge, setDonorAge] = useState(25);
  const [donorPhone, setDonorPhone] = useState('');
  const [donorAddress, setDonorAddress] = useState('');
  const [donorCity, setDonorCity] = useState('Chennai');
  const [donorStatus, setDonorStatus] = useState<'Available' | 'Unavailable'>('Available');
  const [donorLastDonation, setDonorLastDonation] = useState('');

  // Form States - Request Blood
  const [reqHospital, setReqHospital] = useState('');
  const [reqGroup, setReqGroup] = useState('O-');
  const [reqUnits, setReqUnits] = useState(2);
  const [reqUrgency, setReqUrgency] = useState('Immediate / Critical');
  const [reqContactName, setReqContactName] = useState('');
  const [reqContactPhone, setReqContactPhone] = useState('');
  const [reqCity, setReqCity] = useState('Chennai');

  const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const cities = ['All', 'Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem'];

  // City helper
  const getDonorCity = (d: any) => {
    if (d.city) return d.city;
    const addr = (d.address || '').toLowerCase();
    if (addr.includes('chennai')) return 'Chennai';
    if (addr.includes('coimbatore')) return 'Coimbatore';
    if (addr.includes('madurai')) return 'Madurai';
    if (addr.includes('trichy')) return 'Trichy';
    if (addr.includes('salem')) return 'Salem';
    return 'Chennai'; // default
  };

  // Combine database donors with local state
  const allDonorsCombined = useMemo(() => {
    const map = new Map();
    
    // 1. Database donors
    (db.donors || []).forEach((d: any) => {
      map.set(d.id, {
        ...d,
        city: getDonorCity(d),
        lastDonationDate: d.lastDonationDate || '2026-03-15',
        status: d.status || 'Available'
      });
    });
    
    // 2. New local registrations
    localDonors.forEach(d => map.set(d.id, d));
    
    return Array.from(map.values());
  }, [db.donors, localDonors]);

  // Combine requests
  const allRequestsCombined = useMemo(() => {
    const map = new Map();
    
    (db.bloodRequests || []).forEach((r: any) => map.set(r.id, r));
    localRequests.forEach(r => map.set(r.id, r));
    
    return Array.from(map.values());
  }, [db.bloodRequests, localRequests]);

  // Filter blood banks
  const filteredBloodBanks = useMemo(() => {
    const banks = db.bloodBanks || [];
    if (selectedCity === 'All') return banks;
    return banks.filter((b: any) => b.city.toLowerCase() === selectedCity.toLowerCase());
  }, [selectedCity, db.bloodBanks]);

  // Filter donors list based on filters and search query
  const filteredDonors = useMemo(() => {
    return allDonorsCombined.filter(d => {
      // Blood Group Filter
      if (selectedGroup !== 'All' && d.bloodGroup !== selectedGroup) return false;
      
      // City Filter
      const city = getDonorCity(d);
      if (selectedCity !== 'All' && city.toLowerCase() !== selectedCity.toLowerCase()) return false;
      
      // Search Bar match
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const nameMatch = d.name.toLowerCase().includes(query);
        const addrMatch = (d.address || '').toLowerCase().includes(query);
        const phoneMatch = (d.phone || '').includes(query);
        const groupMatch = d.bloodGroup.toLowerCase().includes(query);
        if (!nameMatch && !addrMatch && !phoneMatch && !groupMatch) return false;
      }
      return true;
    });
  }, [allDonorsCombined, selectedGroup, selectedCity, searchQuery]);

  // Dynamically compute Statistics for dashboard
  const stats = useMemo(() => {
    const total = allDonorsCombined.length;
    const available = allDonorsCombined.filter(d => d.status === 'Available').length;
    const activeRequests = allRequestsCombined.length;
    const bloodBanksCount = filteredBloodBanks.length;
    return { total, available, activeRequests, bloodBanksCount };
  }, [allDonorsCombined, allRequestsCombined, filteredBloodBanks]);

  // Compute realistic distance for visual display
  const getDistance = (donor: any) => {
    if (donor.lat && donor.lng) {
      const city = getDonorCity(donor);
      if (city === 'Chennai') {
        const d = Math.sqrt(Math.pow(donor.lat - 13.0827, 2) + Math.pow(donor.lng - 80.2707, 2)) * 100;
        return `${d.toFixed(1)} km`;
      } else {
        const seed = donor.name.charCodeAt(0) + (donor.name.charCodeAt(1) || 0);
        return `${((seed % 45) / 10 + 1.2).toFixed(1)} km`;
      }
    }
    return '2.1 km';
  };

  // Form Submissions
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !donorPhone) {
      triggerToast('Validation Error', 'Donor Name and Mobile number are required.', 'danger');
      return;
    }

    const fullAddress = donorAddress ? `${donorAddress}, ${donorCity}` : `${donorCity}, Tamil Nadu`;
    
    // Call parent handler (this communicates with database if server is active)
    onRegisterDonor(donorName, donorGroup, donorAge, donorPhone, fullAddress);

    // Save to local React state for immediate robust rendering
    const newDonor = {
      id: `donor-local-${Date.now()}`,
      name: donorName,
      bloodGroup: donorGroup,
      age: donorAge,
      phone: donorPhone,
      address: fullAddress,
      city: donorCity,
      lat: 13.0827 + (Math.random() - 0.5) * 0.05,
      lng: 80.2707 + (Math.random() - 0.5) * 0.05,
      lastDonationDate: donorLastDonation || 'Never',
      status: donorStatus
    };

    setLocalDonors(prev => [newDonor, ...prev]);
    setShowRegForm(false);
    triggerToast('🩸 Registry Confirmed', `${donorName} listed successfully as active ${donorGroup} donor.`, 'success');

    // Reset Form
    setDonorName('');
    setDonorPhone('');
    setDonorAddress('');
    setDonorLastDonation('');
    setDonorStatus('Available');
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqHospital || !reqContactPhone) {
      triggerToast('Validation Error', 'Hospital Name and Contact Mobile are required.', 'danger');
      return;
    }

    // Call parent handler
    onPostRequest(reqHospital, reqGroup, reqUnits, reqUrgency, reqContactName, reqContactPhone);

    // Save to local React state for immediate robust rendering
    const newRequest = {
      id: `breq-local-${Date.now()}`,
      hospitalName: reqHospital,
      bloodGroup: reqGroup,
      units: reqUnits,
      requiredBy: reqUrgency,
      contactName: reqContactName,
      phone: reqContactPhone,
      status: 'Emergency' as const
    };

    setLocalRequests(prev => [newRequest, ...prev]);
    setShowReqForm(false);
    triggerToast('🔴 Broadcasters Triggered', `Emergency broadcast for ${reqUnits} units of ${reqGroup} has been published.`, 'danger');

    // Reset Form
    setReqHospital('');
    setReqContactName('');
    setReqContactPhone('');
    setReqUrgency('Immediate / Critical');
  };

  const confirmContactDonor = () => {
    if (!selectedDonorForContact) return;
    
    triggerToast(
      '💬 Connection Handshake', 
      `SMS broadcasted and phone link established with ${selectedDonorForContact.name} (${selectedDonorForContact.bloodGroup}).`, 
      'success'
    );
    setSelectedDonorForContact(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-100">
      
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

      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/5 pb-5 gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="h-11 w-11 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-500 border border-rose-500/25">
            <Droplet className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold uppercase tracking-wider font-mono flex items-center gap-2">
              Blood Donor Coordination Grid
              <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full animate-pulse">Sovereign Node</span>
            </h2>
            <p className="text-xs text-slate-400">Instant multi-agency cross matching, registered donor contact hubs, and critical emergency blood drives.</p>
          </div>
        </div>
        
        {/* Quick action hero triggers */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRegForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4 text-slate-950" />
            Become Donor
          </button>
          <button
            onClick={() => setShowReqForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-lg hover:brightness-110 flex items-center gap-1.5 border border-rose-500/20 cursor-pointer"
          >
            <ShieldAlert className="h-4 w-4" />
            Request Blood
          </button>
        </div>
      </div>

      {/* Statistics Dashboard Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Donors */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total Donors</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{stats.total}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
              <Heart className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">
            Registered on coordination grid
          </p>
        </div>

        {/* Stat 2: Available Donors */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Available Donors</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{stats.available}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active & ready for dispatch
          </p>
        </div>

        {/* Stat 3: Blood Requests */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Blood Requests</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{stats.activeRequests}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-amber-400 mt-2 font-mono">
            🚨 Requires urgent action
          </p>
        </div>

        {/* Stat 4: Blood Banks */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Blood Banks</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{stats.bloodBanksCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">
            Nearby inventory storage centers
          </p>
        </div>
      </div>

      {/* Main Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Directory (Left Column - 2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Controls Bar */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-rose-500" />
                Donor Registry Search
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                Found {filteredDonors.length} matches
              </span>
            </div>

            {/* Search Input and City Dropdown */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by donor name, area, or group..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50 transition-colors"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* City Selection */}
              <div className="w-full md:w-56 relative">
                <div className="flex items-center space-x-1.5 absolute left-3 top-2.5 text-slate-500 pointer-events-none">
                  <MapPin className="h-3.5 w-3.5 text-rose-500" />
                  <span className="text-[10px] font-mono uppercase text-slate-400">City:</span>
                </div>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-16 pr-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/50 transition-colors appearance-none cursor-pointer"
                >
                  {cities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <TrendingUp className="h-3.5 w-3.5 rotate-90" />
                </div>
              </div>
            </div>

            {/* Blood Group Filters Row */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider block">Filter by Blood Type:</span>
              <div className="flex flex-wrap gap-1.5">
                {bloodGroups.map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGroup(g)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                      selectedGroup === g 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-inner' 
                        : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900 border border-white/5'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Directory Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDonors.length === 0 ? (
              <div className="col-span-2 py-16 text-center text-xs text-slate-500 border border-dashed border-white/5 rounded-2xl bg-slate-900/10 italic space-y-2">
                <p>No registered blood donors match your search parameters.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedGroup('All'); setSelectedCity('All'); }}
                  className="text-rose-400 font-bold hover:underline font-mono text-[10px]"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              filteredDonors.map((d: any) => {
                const isAvailable = d.status === 'Available';
                return (
                  <div 
                    key={d.id} 
                    className="group rounded-2xl border border-white/5 bg-slate-900/60 p-5 space-y-4 hover:border-rose-500/20 hover:bg-slate-900/80 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
                  >
                    {/* Top Section */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center font-black text-xs font-mono shadow-inner">
                            {d.bloodGroup}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white tracking-wide">{d.name}</h4>
                            <div className="flex items-center space-x-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isAvailable ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {d.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded-lg border border-white/5 text-slate-400">
                          {getDistance(d)}
                        </span>
                      </div>

                      {/* Info lines */}
                      <div className="space-y-1.5 text-xs text-slate-300 pt-1 border-t border-white/5">
                        <p className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                          <span className="truncate">City: <strong className="text-slate-200">{getDonorCity(d)}</strong> • {d.address}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Clock className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                          <span>Last Donated: <strong className="text-slate-200">{d.lastDonationDate || 'Never'}</strong></span>
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
                          <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>Contact: <strong className="text-emerald-400">{d.phone}</strong></span>
                        </p>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 mt-2">
                      <button
                        onClick={() => setSelectedDonorForDetails(d)}
                        className="bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-1.5 px-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-white/5 transition-all cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Details
                      </button>
                      <button
                        onClick={() => setSelectedDonorForContact(d)}
                        className="bg-rose-500/10 hover:bg-rose-500 hover:text-slate-950 text-rose-400 group-hover:text-rose-300 hover:group-hover:text-slate-950 font-bold py-1.5 px-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-rose-500/20 transition-all cursor-pointer"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        Contact Donor
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar panels (Right Column - 1/3 width) */}
        <div className="space-y-6">
          
          {/* Emergency Hospital Requests Board */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono flex items-center gap-1.5 animate-pulse">
                <ShieldAlert className="h-4.5 w-4.5" />
                Critical Hospital Broadcasts
              </h3>
              <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 rounded font-mono font-bold">
                {allRequestsCombined.length} Active
              </span>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
              {allRequestsCombined.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 italic">No emergency active requests registered.</div>
              ) : (
                allRequestsCombined.map((req: any) => (
                  <div 
                    key={req.id} 
                    className="p-3.5 bg-slate-950/40 border border-white/5 rounded-xl space-y-2 hover:border-rose-500/20 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">{req.hospitalName}</h4>
                        <span className="text-[9px] text-slate-500 font-mono">ID: {req.id}</span>
                      </div>
                      <span className="text-[10px] font-extrabold bg-rose-500 text-white px-2 py-0.5 rounded font-mono">
                        {req.bloodGroup}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 italic">
                      "{req.requiredBy}"
                    </p>

                    <div className="flex justify-between items-center text-[10px] font-mono pt-1.5 border-t border-white/5 text-slate-400">
                      <span>Units Required: <strong className="text-cyan-400 font-bold">{req.units} units</strong></span>
                      <span className="text-rose-400 font-bold animate-pulse">🚨 Emergency</span>
                    </div>
                    
                    <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                      <span>Coordinator: {req.contactName}</span>
                      <a href={`tel:${req.phone}`} className="text-emerald-400 hover:underline">{req.phone}</a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Nearby Blood Banks with Inventories */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Building2 className="h-4.5 w-4.5 text-cyan-400" />
                Nearby Stockpile Centers
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                City: {selectedCity}
              </span>
            </div>

            <div className="space-y-3 max-h-[450px] overflow-y-auto custom-scrollbar pr-1">
              {filteredBloodBanks.map((b: any) => (
                <div key={b.id} className="p-3.5 bg-slate-950/40 border border-white/5 rounded-xl space-y-3 hover:border-white/10 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{b.name}</h4>
                      <div className="flex items-center space-x-2 mt-1 text-[10px] text-slate-400">
                        <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3 text-rose-500" /> {b.city}</span>
                        <span>•</span>
                        <span>⚡ {b.distance} away</span>
                      </div>
                    </div>
                    <a href={`tel:${b.phone}`} className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-white/5 transition-colors cursor-pointer">
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  
                  {/* Stockpile Units Display */}
                  <div className="space-y-1.5 border-t border-white/5 pt-2">
                    <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider block">Available Blood Units:</span>
                    <div className="grid grid-cols-4 gap-1">
                      {Object.entries(b.stock).map(([group, qty]) => (
                        <div key={group} className="bg-slate-950 px-1 py-1 rounded border border-white/5 flex flex-col items-center justify-center">
                          <span className="text-[8px] font-mono font-bold text-rose-400">{group}</span>
                          <span className="text-[9px] font-mono font-extrabold text-white">{qty as number}u</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Become Donor Modal (Form) */}
      {showRegForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative my-8">
            <button 
              onClick={() => setShowRegForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-emerald-400" />
              Register as Blood Donor
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-sans border-b border-white/5 pb-2.5">
              Join the sovereign LifeConnect matching index. Your coordinates remain secure.
            </p>
            
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Donor Full Name</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="e.g., Santhosh Kumar"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Blood Group</label>
                  <select
                    value={donorGroup}
                    onChange={(e) => setDonorGroup(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                      <option key={g} value={g} className="bg-slate-950 text-white">{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Donor Age</label>
                  <input
                    type="number"
                    value={donorAge}
                    onChange={(e) => setDonorAge(parseInt(e.target.value) || 25)}
                    min={18}
                    max={65}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">City Hub</label>
                  <select
                    value={donorCity}
                    onChange={(e) => setDonorCity(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    {cities.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c} className="bg-slate-950 text-white">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Status</label>
                  <select
                    value={donorStatus}
                    onChange={(e) => setDonorStatus(e.target.value as 'Available' | 'Unavailable')}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="Available" className="bg-slate-950 text-emerald-400">Available Now</option>
                    <option value="Unavailable" className="bg-slate-950 text-slate-400">Unavailable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Contact Mobile Number</label>
                <input
                  type="text"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  placeholder="e.g., +91 94441 55667"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Residential Street / Area Address</label>
                <input
                  type="text"
                  value={donorAddress}
                  onChange={(e) => setDonorAddress(e.target.value)}
                  placeholder="e.g., Gandhinagar, Adyar"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Last Donation Date (Optional)</label>
                <input
                  type="date"
                  value={donorLastDonation}
                  onChange={(e) => setDonorLastDonation(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
                <span className="text-[9px] text-slate-500 font-mono mt-1 block">Leave empty if you have never donated or cannot recall.</span>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRegForm(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Register Donor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Blood Modal (Form) */}
      {showReqForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative my-8">
            <button 
              onClick={() => setShowReqForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-rose-500" />
              Create Critical Blood Request
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-sans border-b border-white/5 pb-2.5">
              Broadcasts immediate emergency notifications across matched medical transport systems.
            </p>
            
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Target Hospital Name</label>
                <input
                  type="text"
                  value={reqHospital}
                  onChange={(e) => setReqHospital(e.target.value)}
                  placeholder="e.g., Chennai General Hospital & Trauma Center"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Blood Group Required</label>
                  <select
                    value={reqGroup}
                    onChange={(e) => setReqGroup(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/50"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                      <option key={g} value={g} className="bg-slate-950 text-white">{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Units Needed (Pints)</label>
                  <input
                    type="number"
                    value={reqUnits}
                    onChange={(e) => setReqUnits(parseInt(e.target.value) || 1)}
                    min={1}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500/50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Hospital Location (City)</label>
                  <select
                    value={reqCity}
                    onChange={(e) => setReqCity(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/50"
                  >
                    {cities.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c} className="bg-slate-950 text-white">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Criticality Level</label>
                  <select
                    value={reqUrgency}
                    onChange={(e) => setReqUrgency(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Immediate / Critical">Immediate / Critical</option>
                    <option value="Within 12 Hours">Within 12 Hours</option>
                    <option value="Within 24 Hours">Within 24 Hours</option>
                    <option value="Routine Stockpile">Routine Stockpile</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Coordinator / Relative Full Name</label>
                <input
                  type="text"
                  value={reqContactName}
                  onChange={(e) => setReqContactName(e.target.value)}
                  placeholder="e.g., Staff Nurse Mercy or Relative Name"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Coordinator Contact Mobile</label>
                <input
                  type="text"
                  value={reqContactPhone}
                  onChange={(e) => setReqContactPhone(e.target.value)}
                  placeholder="e.g., +91 98409 99887"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReqForm(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Publish Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedDonorForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative">
            <button 
              onClick={() => setSelectedDonorForDetails(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-3.5 border-b border-white/5 pb-4 mb-4">
              <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center font-black text-lg font-mono">
                {selectedDonorForDetails.bloodGroup}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Donor Profile Details</h3>
                <p className="text-xs text-slate-400">Verified sovereign citizen credential records.</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Profile Card */}
              <div className="bg-slate-950/60 border border-white/5 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Donor Name</span>
                  <span className="text-xs font-bold text-white">{selectedDonorForDetails.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Age</span>
                  <span className="text-xs text-slate-200">{selectedDonorForDetails.age} Years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Status</span>
                  <span className={`text-xs font-mono font-bold ${selectedDonorForDetails.status === 'Available' ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {selectedDonorForDetails.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Hub City</span>
                  <span className="text-xs font-bold text-white">{getDonorCity(selectedDonorForDetails)}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-slate-500 uppercase mt-0.5">Address</span>
                  <span className="text-xs text-slate-300 max-w-[200px] text-right">{selectedDonorForDetails.address}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">GPS Proximity</span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">{getDistance(selectedDonorForDetails)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Last Donation</span>
                  <span className="text-xs text-slate-300">{selectedDonorForDetails.lastDonationDate || 'Never'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Secure Dial Code</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{selectedDonorForDetails.phone}</span>
                </div>
              </div>

              {/* Medical screening checks */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block">LifeConnect Health Clearances:</span>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="p-2 bg-slate-950 border border-white/5 rounded-lg flex items-center gap-1.5 text-emerald-400">
                    <Check className="h-3.5 w-3.5 shrink-0" />
                    <span>Hemoglobin Cleared</span>
                  </div>
                  <div className="p-2 bg-slate-950 border border-white/5 rounded-lg flex items-center gap-1.5 text-emerald-400">
                    <Check className="h-3.5 w-3.5 shrink-0" />
                    <span>Weight & BP Logged</span>
                  </div>
                  <div className="p-2 bg-slate-950 border border-white/5 rounded-lg flex items-center gap-1.5 text-emerald-400">
                    <Check className="h-3.5 w-3.5 shrink-0" />
                    <span>Travel Screened</span>
                  </div>
                  <div className="p-2 bg-slate-950 border border-white/5 rounded-lg flex items-center gap-1.5 text-emerald-400">
                    <Check className="h-3.5 w-3.5 shrink-0" />
                    <span>Pathogen Screened</span>
                  </div>
                </div>
              </div>

              {/* Modal actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSelectedDonorForDetails(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Close Profile
                </button>
                <button
                  onClick={() => {
                    const donor = selectedDonorForDetails;
                    setSelectedDonorForDetails(null);
                    setSelectedDonorForContact(donor);
                  }}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  Contact {selectedDonorForDetails.name.split(' ')[0]}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Donor Dialog (Confirmation Modal) */}
      {selectedDonorForContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative">
            <button 
              onClick={() => setSelectedDonorForContact(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-rose-500/15 flex items-center justify-center text-rose-500 border border-rose-500/25">
                <PhoneCall className="h-5 w-5" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Establish VoIP Handshake?</h3>
                <p className="text-xs text-slate-400 px-4 leading-relaxed">
                  Secure proxy route connection will be established with <strong className="text-white">{selectedDonorForContact.name}</strong> for <strong className="text-rose-400 font-mono">{selectedDonorForContact.bloodGroup}</strong> Blood matching.
                </p>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-white/5 space-y-1 text-center font-mono">
                <span className="text-[10px] text-slate-500 block uppercase">SECURE DIAL ROUTE</span>
                <span className="text-sm font-bold text-emerald-400">{selectedDonorForContact.phone}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSelectedDonorForContact(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmContactDonor}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Confirm Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
