import React, { useState, useMemo, useEffect } from 'react';
import { 
  Trash2, Plus, CheckCircle2, Search, MapPin, 
  Activity, ShieldAlert, Clock, BarChart3, Filter,
  Navigation, Eye, Phone, RefreshCw, AlertTriangle,
  FileText, Truck, ShieldCheck, Heart, User, Sparkles,
  ChevronRight, Calendar, Info, X, Check, ArrowRight,
  Leaf, RotateCcw, Box, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WasteComplaint } from '../types';

interface WasteProps {
  db: any;
  onPostComplaint: (type: 'Garbage Overflow' | 'Biomedical Waste' | 'Hazardous Chemical Dump' | 'Clogged Public Drain', address: string, description: string) => void;
  language: 'en' | 'ta' | 'hi';
}

// Local Interfaces
interface WasteRequest {
  id: string;
  type: 'Organic Waste' | 'Plastic Waste' | 'Paper Waste' | 'Glass Waste' | 'Metal Waste' | 'Electronic Waste (E-Waste)' | 'Medical Waste' | string;
  address: string;
  citizenName: string;
  phone: string;
  date: string;
  timeSlot?: string;
  status: 'Pending' | 'Dispatched' | 'Completed' | 'Cancelled';
  priority: 'High' | 'Medium' | 'Low';
  vehicleNo: string;
  driverName?: string;
  driverPhone?: string;
  description: string;
  weightEst?: string;
  purpose?: 'Residential' | 'Commercial' | 'Community' | 'Industrial';
  ecoImpactPoints?: number; // Estimated carbon points or green points
}

interface RecyclingCenter {
  id: string;
  name: string;
  location: string;
  acceptedTypes: string[];
  distance: string;
  contact: string;
  status: 'Open' | 'Busy' | 'Maintenance';
  capacityUsed: number; // percentage
}

export default function ModuleWasteManagement({ db, onPostComplaint, language }: WasteProps) {
  // --- Toast Alerts System ---
  const [toasts, setToasts] = useState<any[]>([]);
  const triggerToast = (title: string, message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    const newToast = { id: `toast-${Date.now()}-${Math.random()}`, title, message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4500);
  };

  // --- Mock Data ---
  const INITIAL_CENTERS: RecyclingCenter[] = [
    {
      id: 'center-1',
      name: 'Anna Nagar Zero-Waste Recovery Hub',
      location: 'Block V, Near Central Park, Anna Nagar',
      acceptedTypes: ['Organic Waste', 'Plastic Waste', 'Paper Waste', 'Glass Waste'],
      distance: '0.8 km',
      contact: '+91 94445 11223',
      status: 'Open',
      capacityUsed: 62
    },
    {
      id: 'center-2',
      name: 'Adyar Smart E-Waste & Metal Depot',
      location: 'Sardar Patel Road, Sector 3, Adyar',
      acceptedTypes: ['Electronic Waste (E-Waste)', 'Metal Waste', 'Plastic Waste'],
      distance: '2.1 km',
      contact: '+91 94445 22334',
      status: 'Open',
      capacityUsed: 44
    },
    {
      id: 'center-3',
      name: 'Mylapore Bio-Composting Facility',
      location: 'Near Sri Kapaleeshwarar Temple Lane, Mylapore',
      acceptedTypes: ['Organic Waste', 'Paper Waste'],
      distance: '3.4 km',
      contact: '+91 94445 33445',
      status: 'Busy',
      capacityUsed: 88
    },
    {
      id: 'center-4',
      name: 'Metro Biomedical Disposal Facility',
      location: 'Industrial Estate, Guindy',
      acceptedTypes: ['Medical Waste', 'Metal Waste'],
      distance: '4.7 km',
      contact: '+91 94445 44556',
      status: 'Open',
      capacityUsed: 71
    }
  ];

  const INITIAL_REQUESTS: WasteRequest[] = [
    {
      id: 'W-9041',
      type: 'Electronic Waste (E-Waste)',
      address: 'Plot 48, 5th Cross Street, Anna Nagar, Chennai',
      citizenName: 'Santhosh Kumar',
      phone: '+91 94441 55667',
      date: '2026-07-08',
      timeSlot: '10:00 AM - 01:00 PM',
      status: 'Dispatched',
      priority: 'Medium',
      vehicleNo: 'TN-01-EQ-9852',
      driverName: 'Saravanan K.',
      driverPhone: '+91 98455 99112',
      description: 'Old desktop computer monitor, damaged lithium battery pack, and discarded multi-meters.',
      weightEst: '12 kg',
      purpose: 'Residential',
      ecoImpactPoints: 120
    },
    {
      id: 'W-9042',
      type: 'Organic Waste',
      address: 'Anna Nagar West Block Food Plaza, Chennai',
      citizenName: 'Santhosh Kumar',
      phone: '+91 94441 55667',
      date: '2026-07-09',
      timeSlot: '07:00 AM - 10:00 AM',
      status: 'Pending',
      priority: 'High',
      vehicleNo: 'TN-06-WT-4028',
      driverName: 'Arumugam P.',
      driverPhone: '+91 98455 33221',
      description: 'Large commercial kitchen vegetable waste and food scrap bins.',
      weightEst: '85 kg',
      purpose: 'Commercial',
      ecoImpactPoints: 425
    },
    {
      id: 'W-9039',
      type: 'Plastic Waste',
      address: 'Sector-3 Housing Board, Adyar, Chennai',
      citizenName: 'Santhosh Kumar',
      phone: '+91 94441 55667',
      date: '2026-07-06',
      timeSlot: '02:00 PM - 05:00 PM',
      status: 'Completed',
      priority: 'Low',
      vehicleNo: 'TN-10-CZ-1120',
      driverName: 'Dinesh Karthik',
      driverPhone: '+91 98455 44889',
      description: 'Baled pet bottles, empty milk sachets, and transparent packaging material.',
      weightEst: '24 kg',
      purpose: 'Community',
      ecoImpactPoints: 180
    },
    {
      id: 'W-9037',
      type: 'Medical Waste',
      address: 'Adyar Family Clinic, Canal Bank Road, Chennai',
      citizenName: 'Santhosh Kumar',
      phone: '+91 94441 55667',
      date: '2026-07-05',
      timeSlot: '11:00 AM - 01:00 PM',
      status: 'Completed',
      priority: 'High',
      vehicleNo: 'TN-02-BM-8831',
      driverName: 'Nagarajan M.',
      driverPhone: '+91 98455 77665',
      description: 'Secured biohazard disposal boxes containing expired clinical supplies and syringes.',
      weightEst: '8 kg',
      purpose: 'Commercial',
      ecoImpactPoints: 160
    }
  ];

  const WASTE_NOTIFICATIONS = [
    {
      id: 'wn-1',
      title: 'E-Waste Drive Active',
      message: 'Zero-Emission recovery campaign active in Adyar. Recyclers get double green impact points.',
      time: '2 hours ago',
      type: 'success'
    },
    {
      id: 'wn-2',
      title: 'Monsoon Sanitation Schedule',
      message: 'Compost pickup times modified to morning hours to avoid afternoon heavy shower logging.',
      time: '5 hours ago',
      type: 'info'
    },
    {
      id: 'wn-3',
      title: 'Plastic Ban Auditing',
      message: 'Inspection squad active near T. Nagar market. Ensure segregation of single-use polymers.',
      time: '1 day ago',
      type: 'warning'
    }
  ];

  // --- State Managers ---
  const [fetchedRequests, setFetchedRequests] = useState<WasteRequest[]>([]);
  const [fetchedComplaints, setFetchedComplaints] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  useEffect(() => {
    fetch('/api/waste/requests').then(res => res.json()).then(setFetchedRequests);
    fetch('/api/waste/complaints').then(res => res.json()).then(setFetchedComplaints);
  }, []);

  // Modal triggers
  const [showReportModal, setShowReportModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [viewingDetailsRequest, setViewingDetailsRequest] = useState<WasteRequest | null>(null);
  const [trackingRequest, setTrackingRequest] = useState<WasteRequest | null>(null);

  // Form states - Report Waste
  const [reportType, setReportType] = useState<'Garbage Overflow' | 'Biomedical Waste' | 'Hazardous Chemical Dump' | 'Clogged Public Drain'>('Garbage Overflow');
  const [reportAddress, setReportAddress] = useState('');
  const [reportPhone, setReportPhone] = useState('+91 94441 55667');
  const [reportPriority, setReportPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [reportDesc, setReportDesc] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Form states - Schedule Pickup
  const [schedType, setSchedType] = useState<'Organic Waste' | 'Plastic Waste' | 'Paper Waste' | 'Glass Waste' | 'Metal Waste' | 'Electronic Waste (E-Waste)' | 'Medical Waste'>('Organic Waste');
  const [schedAddress, setSchedAddress] = useState('');
  const [schedPhone, setSchedPhone] = useState('+91 94441 55667');
  const [schedDate, setSchedDate] = useState('2026-07-09');
  const [schedTimeSlot, setSchedTimeSlot] = useState('09:00 AM - 12:00 PM');
  const [schedPurpose, setSchedPurpose] = useState<'Residential' | 'Commercial' | 'Community' | 'Industrial'>('Residential');
  const [schedWeight, setSchedWeight] = useState('10 kg');
  const [schedDesc, setSchedDesc] = useState('');
  const [submittingSchedule, setSubmittingSchedule] = useState(false);

  // --- Merge Database Grievances into a single list ---
  const combinedRequestsAndGrievances = useMemo(() => {
    const list = [...fetchedRequests];

    // Map database complaints (fetchedComplaints) into the general ledger
    (fetchedComplaints || []).forEach((c: any) => {
      // Prevent duplication by checking matching IDs or address/desc combinations
      const exists = list.some(item => item.id === c.id);
      if (!exists) {
        // Map database grievance categories to supported waste types logically
        let mappedType = 'Garbage Accumulation';
        if (c.type === 'Biomedical Waste') mappedType = 'Medical Waste';
        else if (c.type === 'Hazardous Chemical Dump') mappedType = 'Hazardous Waste';
        else if (c.type === 'Clogged Public Drain') mappedType = 'Drainage Sewer';
        else if (c.type === 'Garbage Overflow') mappedType = 'Organic / Mixed Overflow';

        list.push({
          id: c.id,
          type: mappedType,
          address: c.address || 'Chennai Central',
          citizenName: c.citizenName || 'Santhosh Kumar',
          phone: c.phone || '+91 94441 55667',
          date: c.date || new Date().toISOString().split('T')[0],
          status: c.status === 'Resolved' ? 'Completed' : c.status === 'In Progress' ? 'Dispatched' : 'Pending',
          priority: c.priority || 'High',
          vehicleNo: 'TN-06-WT-4028',
          driverName: 'Arumugam P.',
          driverPhone: '+91 98455 33221',
          description: c.description || 'Public garbage complaint reported.',
          weightEst: 'Unknown volume',
          purpose: 'Community',
          ecoImpactPoints: 50
        });
      }
    });

    return list;
  }, [fetchedRequests, fetchedComplaints]);

  // --- Search & Filters Engine ---
  const filteredRequests = useMemo(() => {
    return combinedRequestsAndGrievances.filter(req => {
      const matchesSearch = searchQuery === '' || 
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'All' || req.type.includes(selectedType);
      
      const matchesArea = selectedArea === 'All' || 
        req.address.toLowerCase().includes(selectedArea.toLowerCase());

      const matchesStatus = selectedStatus === 'All' || req.status === selectedStatus;

      return matchesSearch && matchesType && matchesArea && matchesStatus;
    });
  }, [combinedRequestsAndGrievances, searchQuery, selectedType, selectedArea, selectedStatus]);

  // --- Dynamic Dashboard Metrics ---
  const stats = useMemo(() => {
    const total = combinedRequestsAndGrievances.length;
    const pending = combinedRequestsAndGrievances.filter(r => r.status === 'Pending').length;
    const completed = combinedRequestsAndGrievances.filter(r => r.status === 'Completed').length;
    // Count active collection vehicles in nearby centers + dispatched vehicles
    const activeVehicles = 12; // Static realistic municipal index
    return { total, pending, completed, activeVehicles };
  }, [combinedRequestsAndGrievances]);

  // --- Handlers ---
  const handleReportWasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportAddress.trim()) {
      triggerToast('Validation Error', 'Please supply a specific location address.', 'warning');
      return;
    }

    setSubmittingReport(true);
    try {
      const response = await fetch('/api/waste/complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: reportType,
          address: reportAddress,
          description: reportDesc || 'Sanitation issue flagged via public report.',
          citizenName: 'Santhosh Kumar',
          phone: reportPhone,
          priority: reportPriority
        })
      });
      const data = await response.json();

      if (data.success) {
        setFetchedComplaints(prev => [data.complaint, ...prev]);
        setShowReportModal(false);
        setReportAddress('');
        setReportDesc('');
        triggerToast('🗑️ Incident Registered', `Sanitation grievance registered. Reference ticket: ${data.complaint.id}. Dispatching crew shortly.`, 'success');
      } else {
        triggerToast('Error', 'Failed to log complaint.', 'warning');
      }
    } catch (err) {
      triggerToast('Error', 'Server error.', 'warning');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleSchedulePickupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedAddress.trim()) {
      triggerToast('Validation Error', 'Please specify a pickup address.', 'warning');
      return;
    }

    setSubmittingSchedule(true);
    try {
      const response = await fetch('/api/waste/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: schedType,
          address: schedAddress,
          citizenName: 'Santhosh Kumar',
          phone: schedPhone,
          date: schedDate,
          timeSlot: schedTimeSlot,
          description: schedDesc || 'Scheduled recyclable materials recycling pickup.',
          weightEst: schedWeight,
          purpose: schedPurpose
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setFetchedRequests(prev => [data.request, ...prev]);
        setShowScheduleModal(false);
        setSchedAddress('');
        setSchedDesc('');
        triggerToast('🗓️ Slot Booked', `Waste collection scheduled for ${schedDate}. Ticket ID: ${data.request.id}.`, 'success');
      } else {
        triggerToast('Error', 'Failed to log request.', 'warning');
      }
    } catch (err) {
      triggerToast('Error', 'Server error.', 'warning');
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const triggerDirectCenterDrop = (center: RecyclingCenter) => {
    // Autopopulate location matching recycling center and launch scheduler
    const preferredWaste = center.acceptedTypes[0] || 'Organic Waste';
    setSchedType(preferredWaste as any);
    setSchedAddress(`Dropoff Gate @ ${center.name}`);
    setShowScheduleModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-100 font-sans">
      
      {/* Dynamic Toast Alerts Container */}
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
                  : toast.type === 'warning' 
                    ? 'border-amber-500/30' 
                    : 'border-teal-500/30'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${
                toast.type === 'success' 
                  ? 'bg-emerald-500/15 text-emerald-400' 
                  : toast.type === 'warning' 
                    ? 'bg-amber-500/15 text-amber-400' 
                    : 'bg-teal-500/15 text-teal-400'
              }`}>
                {toast.type === 'success' ? <Check className="h-4 w-4" /> : toast.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
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

      {/* Modern Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/5 pb-5 gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="h-11 w-11 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 border border-emerald-500/25">
            <Trash2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold uppercase tracking-wider font-mono flex items-center gap-2">
              Solid Waste & Sanitation Board
              <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">Sovereign SCADA Node</span>
            </h2>
            <p className="text-xs text-slate-400">Garbage overflow grievances, sanitation truck routing, public recycling centers, and private eco segregation pickup schedulers.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => {
              triggerToast('🔄 Synchronizing Sanitation', 'Updating route logs and vehicle telemetry sensors...', 'info');
              // Instantly simulate minor update
              setRequests(prev => prev.map(req => {
                if (req.status === 'Pending' && Math.random() > 0.6) {
                  return { ...req, status: 'Dispatched' };
                }
                return req;
              }));
            }}
            className="px-3.5 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 text-xs border border-white/5 transition-all flex items-center gap-2 cursor-pointer font-bold font-mono"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sync Sanitation
          </button>
        </div>
      </div>

      {/* Dynamic Dashboard Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Requests */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total Requests</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{stats.total}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">Dispatches & grievances logged</p>
        </div>

        {/* Pending Pickups */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Pending Pickups</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{stats.pending}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          {/* Progress loader mapping */}
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2.5">
            <div 
              className="bg-amber-400 h-full rounded-full transition-all duration-300" 
              style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }} 
            />
          </div>
        </div>

        {/* Completed Pickups */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Completed Pickups</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{stats.completed}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-emerald-400 mt-2 font-mono flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Recycled & processed safely
          </p>
        </div>

        {/* Active Collection Vehicles */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Active Vehicles</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{stats.activeVehicles}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-indigo-300 mt-2 font-mono">Live route maps telemetry active</p>
        </div>
      </div>

      {/* Main Layout Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column (2 cols): Main requests ledger & Recycling points */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Waste Request Ledger and Filter Board */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-5">
            
            {/* Header controls toolbar */}
            <div className="space-y-4 border-b border-white/5 pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Activity className="h-4.5 w-4.5 text-emerald-400" />
                  Primary Waste Collection & Segregation Ledger
                </h3>
                <span className="text-[10px] font-mono text-slate-500">
                  {filteredRequests.length} tickets monitored
                </span>
              </div>

              {/* Advanced multi-dimensional filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Search */}
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search requests (ID, location, details)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-white">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Area / Location */}
                <div className="relative">
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                  >
                    <option value="All">All Locations</option>
                    <option value="Anna Nagar">Anna Nagar</option>
                    <option value="Adyar">Adyar</option>
                    <option value="Mylapore">Mylapore</option>
                    <option value="Guindy">Guindy</option>
                  </select>
                </div>

                {/* Filter Category type */}
                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    <option value="Organic">Organic Waste</option>
                    <option value="Plastic">Plastic Waste</option>
                    <option value="Paper">Paper Waste</option>
                    <option value="Glass">Glass Waste</option>
                    <option value="Metal">Metal Waste</option>
                    <option value="Electronic">E-Waste</option>
                    <option value="Medical">Medical Waste</option>
                  </select>
                </div>
              </div>

              {/* Status selectors */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider mr-1">Status Filter:</span>
                {(['All', 'Pending', 'Dispatched', 'Completed'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      selectedStatus === st 
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

            </div>

            {/* List scroll panel */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredRequests.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500 border border-dashed border-white/5 rounded-2xl italic space-y-2">
                  <p>No sanitation requests match your search filters.</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setSelectedArea('All'); setSelectedType('All'); setSelectedStatus('All'); }}
                    className="text-emerald-400 font-mono text-[10px] underline"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                filteredRequests.map(req => {
                  const isHigh = req.priority === 'High';
                  const isEwaste = req.type.includes('Electronic');
                  const isMedical = req.type.includes('Medical');

                  return (
                    <div 
                      key={req.id} 
                      className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        req.status === 'Completed' 
                          ? 'bg-slate-950/25 border-white/5 opacity-75' 
                          : 'bg-slate-950/50 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                            isMedical ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            isEwaste ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {req.type}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">ID: {req.id}</span>
                          
                          {req.ecoImpactPoints && req.status === 'Completed' && (
                            <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5 bg-emerald-500/5 px-1.5 py-0.2 rounded border border-emerald-500/10">
                              <Leaf className="h-2.5 w-2.5" />
                              +{req.ecoImpactPoints} Offset Pts
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-200 font-sans leading-relaxed">"{req.description}"</p>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400 font-mono">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-emerald-400" />
                            {req.address}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-500" />
                            Pickup Sched: {req.date}
                          </span>
                          {req.weightEst && (
                            <span className="flex items-center gap-1">
                              <Box className="h-3 w-3 text-slate-500" />
                              Est: {req.weightEst}
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-slate-500 font-mono">
                          Assigned Vehicle: <strong className="text-slate-300">{req.vehicleNo || 'Pending Allocation'}</strong>
                          {req.driverName && ` (Driver: ${req.driverName})`}
                        </p>
                      </div>

                      {/* Status indicator and action panel */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          req.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          req.status === 'Dispatched' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {req.status}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setViewingDetailsRequest(req)}
                            className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 px-2 py-1.5 rounded-lg text-[10px] font-mono transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="h-3 w-3 text-emerald-400" />
                            View Details
                          </button>
                          
                          {req.status !== 'Completed' && (
                            <button
                              onClick={() => {
                                // Direct to live tracking interface simulation
                                setTrackingRequest(req);
                              }}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2 py-1.5 rounded-lg text-[10px] font-mono transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Navigation className="h-3 w-3" />
                              Track Vehicle
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Nearby Recycling & Composting Depots */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Leaf className="h-4.5 w-4.5 text-emerald-400" />
              Primary Municipal Recycling Centers & Segregation Depots
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INITIAL_CENTERS.map(center => (
                <div 
                  key={center.id} 
                  className="p-3.5 bg-slate-950/45 border border-white/5 rounded-xl hover:border-white/10 transition-colors flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white leading-tight">{center.name}</h4>
                      <span className="text-[9px] font-mono text-emerald-400 shrink-0">{center.distance}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">📍 {center.location}</p>
                    
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {center.acceptedTypes.map((type, idx) => (
                        <span key={idx} className="text-[8px] bg-white/5 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                          {type.split(' ')[0]} {/* shortened category name */}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    {/* Capacity Indicator */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-mono text-slate-500">
                        <span>Intake Capacity Used</span>
                        <span>{center.capacityUsed}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${center.capacityUsed > 80 ? 'bg-rose-400' : 'bg-emerald-400'}`} 
                          style={{ width: `${center.capacityUsed}%` }} 
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <a href={`tel:${center.contact}`} className="font-mono text-emerald-400 hover:underline flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {center.contact}
                      </a>
                      <button
                        onClick={() => triggerDirectCenterDrop(center)}
                        className="text-[9px] text-slate-300 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded border border-white/10 cursor-pointer"
                      >
                        Schedule Dropoff
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline and Notifications history */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Activity className="h-4.5 w-4.5 text-indigo-400" />
              Sovereign Sanitation Notifications & Public Announcements
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {WASTE_NOTIFICATIONS.map(notif => (
                <div key={notif.id} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white font-mono flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${notif.type === 'success' ? 'bg-emerald-400' : notif.type === 'warning' ? 'bg-amber-400' : 'bg-cyan-400'}`} />
                      {notif.title}
                    </span>
                    <span className="text-[8px] font-mono text-slate-500">{notif.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">{notif.message}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column (1 col): Primary Action Center & Eco Scoreboards */}
        <div className="space-y-6">
          
          {/* Quick Municipal Command actions */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
              Sanitation Hub Actions
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => setShowScheduleModal(true)}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-bold text-xs py-3.5 transition-all shadow-lg hover:from-emerald-300 hover:to-teal-400 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Calendar className="h-4 w-4" />
                Schedule Waste Collection Slot
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                className="w-full rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 font-bold text-xs py-3.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                Report Waste Grievance / Overflow
              </button>
            </div>
          </div>

          {/* Eco Segregation Guidelines & Impact Tracker */}
          <div className="rounded-2xl border border-emerald-500/10 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Leaf className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
                Sovereign Citizen Eco Impact
              </h3>
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every scheduled pickup that undergoes segregation recycling accrues <strong>Sovereign Green Points</strong>, helping fund urban afforestation initiatives.
            </p>

            {/* Simulated citizen stats */}
            <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5 grid grid-cols-2 gap-3 text-center">
              <div>
                <span className="text-[9px] font-mono text-slate-500 block">Total Green Points</span>
                <span className="text-lg font-extrabold text-emerald-400 font-mono">465 Pts</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-500 block">Co2 Offset Est</span>
                <span className="text-lg font-extrabold text-emerald-400 font-mono">1.2 Tons</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <span className="text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider block">Segregation Quick-Guide</span>
              
              <div className="flex items-start gap-2.5 text-[11px] text-slate-300">
                <div className="h-5 w-5 shrink-0 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-[10px] font-bold font-mono">1</div>
                <div>
                  <strong className="text-white">Organic & Food scraps</strong>
                  <p className="text-[10px] text-slate-400">Must be kept wet. Segregate in green bins. Used for district compost yards.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-[11px] text-slate-300">
                <div className="h-5 w-5 shrink-0 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-[10px] font-bold font-mono">2</div>
                <div>
                  <strong className="text-white">Recyclables (Plastics, Paper, Metal)</strong>
                  <p className="text-[10px] text-slate-400">Must be kept clean & dry. Segregate in blue bins for direct sorting recovery.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-[11px] text-slate-300">
                <div className="h-5 w-5 shrink-0 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center text-[10px] font-bold font-mono">3</div>
                <div>
                  <strong className="text-white">Medical & Hazardous materials</strong>
                  <p className="text-[10px] text-slate-400">Must be safely bagged & marked. Call special clinic handlers immediately.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Eco-Clock Sanitation schedule */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Clock className="h-4.5 w-4.5 text-indigo-400" />
              Regional Daily Route Timetables
            </h3>

            <div className="space-y-2.5">
              {[
                { block: 'Anna Nagar Blocks A-H', day: 'Mon, Wed, Fri', type: 'Organic + Plastics' },
                { block: 'Adyar Canal Sectors', day: 'Tue, Thu, Sat', type: 'Mixed Recyclables' },
                { block: 'Guindy Industrial Estate', day: 'Daily Midnight', type: 'Commercial Segregates' }
              ].map((sched, idx) => (
                <div key={idx} className="p-2.5 bg-slate-950/40 rounded-xl border border-white/5 space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-white">
                    <span>{sched.block}</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-normal">{sched.day}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-mono">Intake Classification: {sched.type}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* MODAL: Report Sanitation Grievance Overflow */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Report Waste Grievance</h3>
                  <p className="text-[10px] text-slate-400">File a municipal report about public littering or overflowing bins.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleReportWasteSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Incident Classification</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                  >
                    <option value="Garbage Overflow">Overflowing Public Dustbin</option>
                    <option value="Biomedical Waste">Improper Medical Waste dumping</option>
                    <option value="Hazardous Chemical Dump">Hazardous Chemical / Oils dumping</option>
                    <option value="Clogged Public Drain">Clogged sewer / water log</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Priority Degree</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Low', 'Medium', 'High'] as const).map(pr => (
                      <button
                        type="button"
                        key={pr}
                        onClick={() => setReportPriority(pr)}
                        className={`py-2 rounded-xl text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                          reportPriority === pr 
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' 
                            : 'bg-slate-950 text-slate-400 border-white/5 hover:text-white'
                        }`}
                      >
                        {pr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Reporter Contact Name</label>
                  <input
                    type="text"
                    defaultValue="Santhosh Kumar"
                    disabled
                    className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-3.5 py-2 text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Reporter Mobile Phone</label>
                  <input
                    type="text"
                    value={reportPhone}
                    onChange={(e) => setReportPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Specific Incident Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={reportAddress}
                    onChange={(e) => setReportAddress(e.target.value)}
                    placeholder="e.g. Plot 10, 5th Main Loop, Anna Nagar West, Chennai"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Detailed description</label>
                <textarea
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Describe the severity (e.g., trash spilling onto road, foul odour, biomedical risks, path blockages...)"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 min-h-[80px]"
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-2.5 rounded-xl transition-all font-mono font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-extrabold py-2.5 rounded-xl transition-all hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submittingReport ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Publishing Report...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Publish Grievance Report
                    </>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: Schedule Segregated Waste Collection Pickup */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-xl rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Schedule Recycling Pickup</h3>
                  <p className="text-[10px] text-slate-400">Reserve an environmental sanitation compactor slot for segregated garbage.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSchedulePickupSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Waste Segregation Category</label>
                  <select
                    value={schedType}
                    onChange={(e) => setSchedType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                  >
                    <option value="Organic Waste">Organic Waste (Food scraps, raw compostables)</option>
                    <option value="Plastic Waste">Plastic Waste (Baled bottles, polymers, wraps)</option>
                    <option value="Paper Waste">Paper Waste (Cardboard, books, newspaper stacks)</option>
                    <option value="Glass Waste">Glass Waste (Bottles, broken windows, ceramics)</option>
                    <option value="Metal Waste">Metal Waste (Copper wires, scrap iron, aluminum cans)</option>
                    <option value="Electronic Waste (E-Waste)">Electronic Waste (Computers, chips, batteries)</option>
                    <option value="Medical Waste">Medical Waste (Clinical supplies, biohazard bags)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Facility Purpose</label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['Residential', 'Commercial', 'Community', 'Industrial'] as const).map(purp => (
                      <button
                        type="button"
                        key={purp}
                        onClick={() => setSchedPurpose(purp)}
                        className={`py-2 rounded-xl text-[9px] font-mono font-bold border transition-colors cursor-pointer ${
                          schedPurpose === purp 
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                            : 'bg-slate-950 text-slate-400 border-white/5 hover:text-white'
                        }`}
                      >
                        {purp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Target Pickup Date</label>
                  <input
                    type="date"
                    value={schedDate}
                    onChange={(e) => setSchedDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Preferred Hours Window</label>
                  <select
                    value={schedTimeSlot}
                    onChange={(e) => setSchedTimeSlot(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="07:00 AM - 10:00 AM">Morning Early (07:00 AM - 10:00 AM)</option>
                    <option value="10:00 AM - 01:00 PM">Morning Late (10:00 AM - 01:00 PM)</option>
                    <option value="01:00 PM - 04:00 PM">Afternoon (01:00 PM - 04:00 PM)</option>
                    <option value="04:00 PM - 07:00 PM">Evening (04:00 PM - 07:00 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Est. Segregated Weight</label>
                  <select
                    value={schedWeight}
                    onChange={(e) => setSchedWeight(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="5 kg">Small Bundle (~5 kg)</option>
                    <option value="15 kg">Medium Bundle (~15 kg)</option>
                    <option value="30 kg">Large Box (~30 kg)</option>
                    <option value="80 kg">Industrial segregate (~80 kg)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Citizen Registered Name</label>
                  <input
                    type="text"
                    defaultValue="Santhosh Kumar"
                    disabled
                    className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-3.5 py-2 text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Confirm Mobile Phone</label>
                  <input
                    type="text"
                    value={schedPhone}
                    onChange={(e) => setSchedPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Specific Pickup Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={schedAddress}
                    onChange={(e) => setSchedAddress(e.target.value)}
                    placeholder="e.g. Plot 48, 5th Cross Street, Anna Nagar East, Chennai"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Segregation specifications & comments</label>
                <textarea
                  value={schedDesc}
                  onChange={(e) => setSchedDesc(e.target.value)}
                  placeholder="Identify specific items (e.g. dry plastics, shredded paper cardboard boxes, metal rods)..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 min-h-[60px]"
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-2.5 rounded-xl transition-all font-mono font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSchedule}
                  className="flex-1 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-extrabold py-2.5 rounded-xl transition-all hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submittingSchedule ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Booking Slot...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Confirm Pickup Booking
                    </>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: VIEW DETAILS */}
      {viewingDetailsRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <Trash2 className="h-5 w-5 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Waste Ticket Details</h3>
              </div>
              <button 
                onClick={() => setViewingDetailsRequest(null)}
                className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              
              <div className="flex justify-between items-start bg-slate-950/50 p-3.5 rounded-xl border border-white/5">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">Intake Type</span>
                  <span className="font-bold text-white text-sm">{viewingDetailsRequest.type}</span>
                </div>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                  viewingDetailsRequest.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  viewingDetailsRequest.status === 'Dispatched' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                  'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {viewingDetailsRequest.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
                  <div>
                    <span className="text-slate-500 block">TICKET ID</span>
                    <span className="text-slate-200 font-bold">{viewingDetailsRequest.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">PRIORITY VALUE</span>
                    <span className={`font-bold ${viewingDetailsRequest.priority === 'High' ? 'text-rose-400' : 'text-slate-200'}`}>
                      {viewingDetailsRequest.priority}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">TARGET DATE</span>
                    <span className="text-slate-200">{viewingDetailsRequest.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">TIME WINDOW</span>
                    <span className="text-slate-200">{viewingDetailsRequest.timeSlot || 'Urgent Schedule'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">EST. WEIGHT</span>
                    <span className="text-slate-200 font-bold text-emerald-400">{viewingDetailsRequest.weightEst || 'Varying volume'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">ECO OFFSET POINTS</span>
                    <span className="text-emerald-400 font-extrabold">+{viewingDetailsRequest.ecoImpactPoints || 40} Points</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 bg-slate-950/20 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono text-slate-500 block">PICKUP LOCATION</span>
                <p className="text-white leading-relaxed">📍 {viewingDetailsRequest.address}</p>
              </div>

              <div className="space-y-1 bg-slate-950/20 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono text-slate-500 block">INCIDENT SPECIFICATION</span>
                <p className="text-slate-300 italic">"{viewingDetailsRequest.description}"</p>
              </div>

              {viewingDetailsRequest.driverName && (
                <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 block">ASSIGNED SANITATION UNIT</span>
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-white block text-xs">{viewingDetailsRequest.driverName}</strong>
                      <span className="text-[10px] font-mono text-slate-400">Truck No: {viewingDetailsRequest.vehicleNo}</span>
                    </div>
                    <a 
                      href={`tel:${viewingDetailsRequest.driverPhone}`}
                      className="bg-emerald-500 text-slate-950 font-bold p-1.5 rounded-lg text-[10px] flex items-center gap-1 hover:bg-emerald-400 cursor-pointer"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call Driver
                    </a>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-white/5 flex gap-2">
                <button
                  onClick={() => setViewingDetailsRequest(null)}
                  className="w-full bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Dismiss Ledger
                </button>
                {viewingDetailsRequest.status !== 'Completed' && (
                  <button
                    onClick={() => {
                      setTrackingRequest(viewingDetailsRequest);
                      setViewingDetailsRequest(null);
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Navigation className="h-3 w-3" />
                    Track Route
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL: LIVE TELEMETRY VEHICLE TRACKER */}
      {trackingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-emerald-400 animate-pulse" />
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Live Sanitation Telemetry</h3>
                  <p className="text-[10px] text-slate-500">Route Code ID: {trackingRequest.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setTrackingRequest(null)}
                className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Simulated Live GPS Map Animation */}
            <div className="relative w-full h-48 rounded-xl bg-slate-950 border border-white/15 overflow-hidden flex flex-col items-center justify-center">
              
              {/* Decorative grid representing streets */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-10 pointer-events-none">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className="border border-white" />
                ))}
              </div>

              {/* Schematic Map Graphics (SVG lines) */}
              <svg className="absolute inset-0 w-full h-full text-emerald-500/20" xmlns="http://www.w3.org/2000/svg">
                {/* Simulated streets */}
                <path d="M 10 90 L 400 90" stroke="currentColor" strokeWidth="2" strokeDasharray="3,3" />
                <path d="M 80 10 L 80 190" stroke="currentColor" strokeWidth="2" strokeDasharray="3,3" />
                <path d="M 280 10 L 280 190" stroke="currentColor" strokeWidth="2" strokeDasharray="3,3" />
                <path d="M 10 140 L 400 140" stroke="currentColor" strokeWidth="2" />
                
                {/* Active path route line */}
                <path d="M 80 140 L 280 140 L 280 90" stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" className="animate-pulse" />
              </svg>

              {/* Live moving vehicle icon along the path */}
              <motion.div 
                className="absolute text-emerald-400 z-10 flex flex-col items-center"
                animate={{ 
                  x: [ -120, 80, 80 ], 
                  y: [ 45, 45, -5 ] 
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="bg-emerald-500 text-slate-950 font-bold p-1.5 rounded-full shadow-lg border border-emerald-400 flex items-center justify-center animate-bounce">
                  <Truck className="h-4 w-4" />
                </div>
                <span className="text-[8px] font-mono bg-slate-900 text-emerald-400 px-1 py-0.2 rounded border border-emerald-500/30 mt-1 uppercase font-bold">
                  {trackingRequest.vehicleNo}
                </span>
              </motion.div>

              {/* Destination Point Marker */}
              <div className="absolute right-24 top-16 z-0 flex flex-col items-center">
                <div className="h-3 w-3 bg-rose-500 rounded-full animate-ping absolute" />
                <div className="h-3.5 w-3.5 bg-rose-500 rounded-full border border-white flex items-center justify-center text-white text-[8px] font-bold">
                  📍
                </div>
                <span className="text-[8px] font-mono bg-slate-900 text-rose-400 px-1 py-0.2 rounded border border-rose-500/30 mt-1 uppercase">
                  Destination
                </span>
              </div>

              {/* Status HUD overlays */}
              <div className="absolute top-2 left-2 p-2 rounded bg-slate-900/90 border border-white/5 text-[9px] font-mono space-y-0.5">
                <span className="text-slate-500 block">SATELLITE STATUS</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" />
                  ONLINE: GPS LOCK
                </span>
              </div>

              <div className="absolute bottom-2 right-2 p-2 rounded bg-slate-900/90 border border-white/5 text-[9px] font-mono space-y-0.5">
                <span className="text-slate-500 block">ESTIMATED ETA</span>
                <span className="text-amber-400 font-bold">14 MINUTES AWAY</span>
              </div>
            </div>

            {/* Crew Details HUD */}
            <div className="space-y-3 font-sans text-xs">
              
              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5 space-y-3">
                <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-wider">Assigned Driver / Sanitation Specialist</span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 bg-emerald-500/10 border border-emerald-500/25 rounded-full flex items-center justify-center text-emerald-400 font-bold font-mono">
                      {trackingRequest.driverName ? trackingRequest.driverName[0] : 'S'}
                    </div>
                    <div>
                      <strong className="text-white text-xs block">{trackingRequest.driverName || 'Saravanan K.'}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">Mobile Contact: {trackingRequest.driverPhone || '+91 98455 99112'}</span>
                    </div>
                  </div>

                  <a 
                    href={`tel:${trackingRequest.driverPhone || '+919845599112'}`}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 px-3.5 rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-md"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call crew
                  </a>
                </div>
              </div>

              {/* Status logs */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-wider">Telemetry Routing Status Logs</span>
                <div className="space-y-1 text-[11px] font-mono">
                  <div className="flex items-start gap-2 text-emerald-400">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>[11:05 AM] Crew departed Anna Nagar Sanitation Depot block-v</span>
                  </div>
                  <div className="flex items-start gap-2 text-emerald-400">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>[11:12 AM] Segment weigh-in approved by Depot auditing terminal</span>
                  </div>
                  <div className="flex items-start gap-2 text-amber-400 animate-pulse">
                    <span className="text-amber-500 font-bold">●</span>
                    <span>[11:15 AM] In Transit: Navigating Poonamallee High Road loop</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5">
                <button
                  onClick={() => setTrackingRequest(null)}
                  className="w-full bg-white/5 hover:bg-white/10 text-slate-300 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Close Live Feed
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
