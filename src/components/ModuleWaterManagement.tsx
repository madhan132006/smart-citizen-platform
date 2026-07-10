import React, { useState, useMemo, useEffect } from 'react';
import { 
  Droplet, Plus, CheckCircle2, Search, MapPin, 
  Activity, ShieldAlert, Clock, BarChart3, Filter,
  Navigation, Eye, Phone, RefreshCw, AlertTriangle,
  FileText, Truck, ShieldCheck, Heart, User, Sparkles,
  ChevronRight, Calendar, Info, X, Check, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WaterComplaint } from '../types';

interface WaterProps {
  db: any;
  onPostComplaint: (type: 'Leakage' | 'Low Pressure' | 'Contaminated Water' | 'Pipeline Block', address: string, description: string) => void;
  language: 'en' | 'ta' | 'hi';
}

// Local Interfaces
interface WaterResource {
  id: string;
  name: string;
  type: 'Lake Reservoir' | 'Overhead Tank' | 'Groundwater Borewell' | 'Desalination Plant';
  level: number; // percentage
  capacity: string; // in liters
  location: string; // Zone/Area
  status: 'Optimal' | 'Low Level' | 'Critical' | 'Maintenance';
  quality: {
    pH: number;
    turbidity: number; // NTU
    chlorine: number; // mg/L
    tds: number; // ppm
    temp: number; // Celsius
  };
  lastInspection: string;
  servedPopulation: string;
}

interface WaterSupplyRequest {
  id: string;
  citizenName: string;
  phone: string;
  address: string;
  tankerSize: '6,000 Liters' | '9,000 Liters' | '12,000 Liters' | '15,000 Liters';
  cost: number;
  deliveryDate: string;
  deliveryTime: string;
  status: 'Pending' | 'Dispatched' | 'Delivered' | 'Cancelled';
  eta?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNo?: string;
  purpose: 'Domestic' | 'Commercial' | 'Community' | 'Emergency';
}

interface SupplyCenter {
  id: string;
  name: string;
  location: string;
  activeTankers: number;
  costRate: string;
  contact: string;
  status: 'Active' | 'Busy' | 'Maintenance';
  distance: string;
}

export default function ModuleWaterManagement({ db, onPostComplaint, language }: WaterProps) {
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
  const INITIAL_RESOURCES: WaterResource[] = [
    {
      id: 'res-1',
      name: 'Anna Nagar West Overhead Reservoir',
      type: 'Overhead Tank',
      level: 78,
      capacity: '500,000 Liters',
      location: 'Anna Nagar',
      status: 'Optimal',
      quality: { pH: 7.2, turbidity: 1.2, chlorine: 0.5, tds: 240, temp: 26 },
      lastInspection: '2026-07-05',
      servedPopulation: '45,000 Residents'
    },
    {
      id: 'res-2',
      name: 'Chembarambakkam Lake Main Gateway',
      type: 'Lake Reservoir',
      level: 62,
      capacity: '1,980,000 Liters',
      location: 'Poonamallee',
      status: 'Optimal',
      quality: { pH: 7.4, turbidity: 2.1, chlorine: 0.4, tds: 310, temp: 28 },
      lastInspection: '2026-07-06',
      servedPopulation: '180,000 Residents'
    },
    {
      id: 'res-3',
      name: 'Adyar Sector-3 Distribution Storage',
      type: 'Overhead Tank',
      level: 34,
      capacity: '350,000 Liters',
      location: 'Adyar',
      status: 'Low Level',
      quality: { pH: 6.9, turbidity: 1.8, chlorine: 0.6, tds: 290, temp: 25 },
      lastInspection: '2026-07-02',
      servedPopulation: '32,000 Residents'
    },
    {
      id: 'res-4',
      name: 'Poondi Reservoir Central Pump',
      type: 'Lake Reservoir',
      level: 88,
      capacity: '2,500,000 Liters',
      location: 'Tiruvallur',
      status: 'Optimal',
      quality: { pH: 7.3, turbidity: 1.1, chlorine: 0.5, tds: 220, temp: 27 },
      lastInspection: '2026-07-07',
      servedPopulation: '250,000 Residents'
    },
    {
      id: 'res-5',
      name: 'Velachery Housing Colony Tank',
      type: 'Overhead Tank',
      level: 15,
      capacity: '200,000 Liters',
      location: 'Velachery',
      status: 'Critical',
      quality: { pH: 6.5, turbidity: 3.4, chlorine: 0.2, tds: 420, temp: 26 },
      lastInspection: '2026-06-29',
      servedPopulation: '18,000 Residents'
    },
    {
      id: 'res-6',
      name: 'T. Nagar Commercial Deep Borewell',
      type: 'Groundwater Borewell',
      level: 55,
      capacity: '150,000 Liters',
      location: 'T. Nagar',
      status: 'Optimal',
      quality: { pH: 7.1, turbidity: 1.5, chlorine: 0.3, tds: 380, temp: 24 },
      lastInspection: '2026-07-01',
      servedPopulation: '12,000 Residents'
    },
    {
      id: 'res-7',
      name: 'Minjur Sea Water Desalination Plant',
      type: 'Desalination Plant',
      level: 91,
      capacity: '800,000 Liters',
      location: 'Royapettah',
      status: 'Optimal',
      quality: { pH: 7.0, turbidity: 0.8, chlorine: 0.7, tds: 150, temp: 25 },
      lastInspection: '2026-07-04',
      servedPopulation: '60,000 Residents'
    },
    {
      id: 'res-8',
      name: 'Tambaram East Intermediate Storage',
      type: 'Overhead Tank',
      level: 50,
      capacity: '400,000 Liters',
      location: 'Tambaram',
      status: 'Maintenance',
      quality: { pH: 7.0, turbidity: 1.4, chlorine: 0.0, tds: 270, temp: 27 },
      lastInspection: '2026-07-08',
      servedPopulation: '35,000 Residents'
    }
  ];

  const INITIAL_CENTERS: SupplyCenter[] = [
    {
      id: 'center-1',
      name: 'Anna Nagar Metro Water Depot',
      location: 'Block II, Anna Nagar East',
      activeTankers: 6,
      costRate: '₹600 for 6,000L',
      contact: '+91 94440 12345',
      status: 'Active',
      distance: '1.2 km'
    },
    {
      id: 'center-2',
      name: 'Adyar Regional Distribution Center',
      location: 'Canal Bank Road, Adyar',
      activeTankers: 4,
      costRate: '₹800 for 9,000L',
      contact: '+91 94440 23456',
      status: 'Active',
      distance: '2.5 km'
    },
    {
      id: 'center-3',
      name: 'Central Chennai Desalination Depot',
      location: 'Royapettah High Road',
      activeTankers: 8,
      costRate: '₹1,100 for 12,000L',
      contact: '+91 94440 34567',
      status: 'Busy',
      distance: '3.8 km'
    },
    {
      id: 'center-4',
      name: 'Tambaram Groundwater Supply Hub',
      location: 'Velachery Main Road, East Tambaram',
      activeTankers: 3,
      costRate: '₹500 for 6,000L',
      contact: '+91 94440 45678',
      status: 'Active',
      distance: '5.1 km'
    }
  ];

  const INITIAL_REQUESTS: WaterSupplyRequest[] = [
    {
      id: 'req-1',
      citizenName: 'Santhosh Kumar',
      phone: '+91 94441 55667',
      address: 'Plot 48, 5th Cross Street, Anna Nagar, Chennai',
      tankerSize: '6,000 Liters',
      cost: 600,
      deliveryDate: '2026-07-08',
      deliveryTime: '02:00 PM',
      status: 'Dispatched',
      eta: '14 Mins',
      driverName: 'Ramesh Babu',
      driverPhone: '+91 98450 11223',
      vehicleNo: 'TN-01-AX-4829',
      purpose: 'Domestic'
    },
    {
      id: 'req-2',
      citizenName: 'Santhosh Kumar',
      phone: '+91 94441 55667',
      address: 'Plot 48, 5th Cross Street, Anna Nagar, Chennai',
      tankerSize: '12,000 Liters',
      cost: 1100,
      deliveryDate: '2026-07-09',
      deliveryTime: '10:00 AM',
      status: 'Pending',
      purpose: 'Community'
    },
    {
      id: 'req-3',
      citizenName: 'Santhosh Kumar',
      phone: '+91 94441 55667',
      address: 'Plot 12, Adyar Enclave, Chennai',
      tankerSize: '9,000 Liters',
      cost: 800,
      deliveryDate: '2026-07-06',
      deliveryTime: '11:30 AM',
      status: 'Delivered',
      driverName: 'Karthik Raja',
      driverPhone: '+91 98450 22334',
      vehicleNo: 'TN-07-BY-1102',
      purpose: 'Domestic'
    }
  ];

  const WATER_NOTIFICATIONS = [
    {
      id: 'notif-1',
      title: 'Water Supply Scheduled',
      message: 'Anna Nagar block distribution starts at 06:00 AM tomorrow. Regular pressure expected.',
      time: '1 hour ago',
      type: 'info'
    },
    {
      id: 'notif-2',
      title: 'Velachery Reservoir Alert',
      message: 'Water level below 15% at Velachery Overhead tank. Auxiliary supplies initiated.',
      time: '4 hours ago',
      type: 'warning'
    },
    {
      id: 'notif-3',
      title: 'Water Quality Signoff',
      message: 'All chemical parameters approved for Poondi lake feed. Potability score 98/100.',
      time: '1 day ago',
      type: 'success'
    }
  ];

  // --- Component State ---
  const [resources, setResources] = useState<WaterResource[]>([]);
  const [centers, setCenters] = useState<SupplyCenter[]>([]);
  const [supplyRequests, setSupplyRequests] = useState<WaterSupplyRequest[]>(INITIAL_REQUESTS);
  const [localComplaints, setLocalComplaints] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/water/resources').then(res => res.json()).then(setResources);
    fetch('/api/water/centers').then(res => res.json()).then(setCenters);
  }, []);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Modals state
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [selectedResourceForDetails, setSelectedResourceForDetails] = useState<WaterResource | null>(null);
  const [trackingRequest, setTrackingRequest] = useState<WaterSupplyRequest | null>(null);

  // Form inputs state - Issue Complaint
  const [complaintType, setComplaintType] = useState<'Leakage' | 'Low Pressure' | 'Contaminated Water' | 'Pipeline Block'>('Leakage');
  const [complaintAddress, setComplaintAddress] = useState('');
  const [complaintPhone, setComplaintPhone] = useState('+91 94441 55667');
  const [complaintPriority, setComplaintPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  // Form inputs state - Supply Request
  const [reqAddress, setReqAddress] = useState('');
  const [reqPhone, setReqPhone] = useState('+91 94441 55667');
  const [reqSize, setReqSize] = useState<'6,000 Liters' | '9,000 Liters' | '12,000 Liters' | '15,000 Liters'>('6,000 Liters');
  const [reqPurpose, setReqPurpose] = useState<'Domestic' | 'Commercial' | 'Community' | 'Emergency'>('Domestic');
  const [reqDate, setReqDate] = useState('2026-07-09');
  const [reqTime, setReqTime] = useState('09:00 AM');
  const [submittingSupply, setSubmittingSupply] = useState(false);

  // --- Combine database complaints with local session complaints ---
  const allComplaints = useMemo(() => {
    const list = [...localComplaints];
    
    // Add server database complaints
    (db.waterComplaints || []).forEach((c: any) => {
      // Avoid duplication
      if (!list.some(item => item.id === c.id)) {
        list.push({
          id: c.id,
          citizenName: c.citizenName || 'Santhosh Kumar',
          phone: c.phone || '+91 94441 55667',
          type: c.type || 'Leakage',
          description: c.description || 'Pipeline water leakage',
          address: c.address || 'Chennai City Center',
          status: c.status || 'Registered',
          priority: c.priority || 'Medium',
          date: c.date || new Date().toISOString().split('T')[0]
        });
      }
    });

    // If both empty, supply some default complaints so UI is never empty
    if (list.length === 0) {
      list.push(
        {
          id: 'wc-pre-1',
          citizenName: 'Santhosh Kumar',
          phone: '+91 94441 55667',
          type: 'Leakage',
          description: 'Substantial leakage near junction box on 5th Street.',
          address: 'Block-2, Anna Nagar West, Chennai',
          status: 'In Progress',
          priority: 'High',
          date: '2026-07-07'
        },
        {
          id: 'wc-pre-2',
          citizenName: 'Santhosh Kumar',
          phone: '+91 94441 55667',
          type: 'Contaminated Water',
          description: 'Tap water appears muddy with slight chemical odour.',
          address: 'Sector-3 Housing Lines, Adyar',
          status: 'Registered',
          priority: 'High',
          date: '2026-07-08'
        }
      );
    }

    return list;
  }, [db.waterComplaints, localComplaints]);

  // --- Filtering & Searching logic ---
  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const matchesSearch = searchQuery === '' || 
        res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesArea = selectedArea === 'All' || res.location === selectedArea;
      const matchesType = selectedType === 'All' || res.type === selectedType;
      const matchesStatus = selectedStatus === 'All' || res.status === selectedStatus;

      return matchesSearch && matchesArea && matchesType && matchesStatus;
    });
  }, [resources, searchQuery, selectedArea, selectedType, selectedStatus]);

  // --- Dynamic Dashboard Metrics ---
  const totalWaterTanks = resources.length;
  const activeComplaintsCount = allComplaints.filter(c => c.status !== 'Resolved').length;
  const waterAvailableAverage = useMemo(() => {
    const sum = resources.reduce((acc, curr) => acc + curr.level, 0);
    return Math.round(sum / resources.length);
  }, [resources]);
  const waterTankersAvailableCount = INITIAL_CENTERS.reduce((acc, curr) => acc + curr.activeTankers, 0);

  // --- Actions handlers ---
  const handleReportIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingComplaint(true);
    
    setTimeout(() => {
      // Trigger parent integration prop
      onPostComplaint(complaintType, complaintAddress || 'Anna Nagar West, Chennai', complaintDesc || 'Pipe issue logged via Portal.');

      // Instantly log in local list
      const mockId = `wc-local-${Date.now()}`;
      const newComplaint = {
        id: mockId,
        citizenName: 'Santhosh Kumar',
        phone: complaintPhone,
        type: complaintType,
        description: complaintDesc,
        address: complaintAddress,
        status: 'Registered',
        priority: complaintPriority,
        date: new Date().toISOString().split('T')[0]
      };

      setLocalComplaints(prev => [newComplaint, ...prev]);
      setSubmittingComplaint(false);
      setShowIssueModal(false);
      
      // Clear fields
      setComplaintAddress('');
      setComplaintDesc('');
      
      triggerToast(
        '🚰 Complaint Filed',
        `A "${complaintType}" report was registered at "${complaintAddress}". Reference ID: ${mockId}.`,
        'success'
      );
    }, 1200);
  };

  const handleRequestSupplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqAddress.trim()) {
      triggerToast('Validation Alert', 'Please specify a delivery address.', 'warning');
      return;
    }

    setSubmittingSupply(true);
    try {
      const response = await fetch('/api/water/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenName: 'Santhosh Kumar',
          phone: reqPhone,
          address: reqAddress,
          tankerSize: reqSize,
          cost: 600, // Dummy
          deliveryDate: reqDate,
          deliveryTime: reqTime,
          purpose: reqPurpose
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setSupplyRequests(prev => [data.request, ...prev]);
        setShowSupplyModal(false);
        triggerToast('🚚 Supply Request Logged', `Request received. ID: ${data.request.id}`, 'success');
      } else {
        triggerToast('Error', 'Failed to log request.', 'warning');
      }
    } catch (err) {
      triggerToast('Error', 'Server error.', 'warning');
    } finally {
      setSubmittingSupply(false);
    }
  };

  const triggerDirectCenterRequest = (center: SupplyCenter) => {
    // Autopopulate values matching that center and launch supply request form
    const size = center.costRate.includes('12,000L') ? '12,000 Liters' : '6,000 Liters';
    setReqSize(size as any);
    setReqAddress(`Near ${center.name}, Chennai`);
    setShowSupplyModal(true);
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
                  ? 'border-sky-500/30' 
                  : toast.type === 'warning' 
                    ? 'border-amber-500/30' 
                    : 'border-cyan-500/30'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${
                toast.type === 'success' 
                  ? 'bg-sky-500/15 text-sky-400' 
                  : toast.type === 'warning' 
                    ? 'bg-amber-500/15 text-amber-400' 
                    : 'bg-cyan-500/15 text-cyan-400'
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
          <div className="h-11 w-11 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-400 border border-sky-500/25">
            <Droplet className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold uppercase tracking-wider font-mono flex items-center gap-2">
              Metro Water Utility Board
              <span className="px-2 py-0.5 text-[9px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full">Sovereign SCADA Node</span>
            </h2>
            <p className="text-xs text-slate-400">Real-time telemetry networks, automated distribution pipelines, and municipal emergency supply tankers.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => {
              // Simulated reload of telemetry
              triggerToast('🔄 Refreshing Telemetry', 'Fetching latest data points from telemetry sensors...', 'info');
              // Randomly mutate levels slightly to look realistic
              setResources(prev => prev.map(res => ({
                ...res,
                level: Math.max(10, Math.min(100, res.level + Math.floor(Math.random() * 5) - 2))
              })));
            }}
            className="px-3.5 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 text-xs border border-white/5 transition-all flex items-center gap-2 cursor-pointer font-bold font-mono"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sync Telemetry
          </button>
        </div>
      </div>

      {/* Interactive Dashboard Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Water Tanks */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total Water Tanks</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{totalWaterTanks}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">Sensors active in telemetry network</p>
        </div>

        {/* Average Water Available */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Water Available</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{waterAvailableAverage}%</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Droplet className="h-5 w-5" />
            </div>
          </div>
          {/* Visual level progress indicator */}
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2.5">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${waterAvailableAverage}%` }} />
          </div>
        </div>

        {/* Active Pipeline Complaints */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Active Complaints</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{activeComplaintsCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-rose-400 mt-2 font-mono flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
            Urgent maintenance queues
          </p>
        </div>

        {/* Water Tankers Available */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Tankers Available</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{waterTankersAvailableCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-indigo-300 mt-2 font-mono">Dispatched and standing-by</p>
        </div>
      </div>

      {/* Main Grid Content Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (2 cols): Water Resources Catalog & Supply Hubs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Primary Water Tanks Ledger with Search and Filters */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-5">
            
            {/* Header / Filter Toolbar */}
            <div className="space-y-4 border-b border-white/5 pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <BarChart3 className="h-4.5 w-4.5 text-sky-400" />
                  Primary Water Resources Telemetry
                </h3>
                <span className="text-[10px] font-mono text-slate-500">
                  {filteredResources.length} matching sources monitored
                </span>
              </div>

              {/* Advanced Controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Search query field */}
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search reservoirs (e.g. Anna Nagar West, Poondi)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-white">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Area */}
                <div className="relative">
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500/50 appearance-none cursor-pointer"
                  >
                    <option value="All">All Areas</option>
                    <option value="Anna Nagar">Anna Nagar</option>
                    <option value="Adyar">Adyar</option>
                    <option value="Velachery">Velachery</option>
                    <option value="T. Nagar">T. Nagar</option>
                    <option value="Royapettah">Royapettah</option>
                    <option value="Tambaram">Tambaram</option>
                    <option value="Poonamallee">Poonamallee</option>
                    <option value="Tiruvallur">Tiruvallur</option>
                  </select>
                </div>

                {/* Filter Source Type */}
                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500/50 appearance-none cursor-pointer"
                  >
                    <option value="All">All Sources</option>
                    <option value="Overhead Tank">Overhead Tank</option>
                    <option value="Lake Reservoir">Lake Reservoir</option>
                    <option value="Groundwater Borewell">Groundwater Borewell</option>
                    <option value="Desalination Plant">Desalination Plant</option>
                  </select>
                </div>
              </div>

              {/* Filtering shortcuts */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider mr-1">Status Filter:</span>
                {(['All', 'Optimal', 'Low Level', 'Critical', 'Maintenance'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      selectedStatus === st 
                        ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30' 
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

            </div>

            {/* List grid of Water Resources */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
              {filteredResources.length === 0 ? (
                <div className="col-span-2 py-16 text-center text-xs text-slate-500 border border-dashed border-white/5 rounded-2xl italic space-y-2">
                  <p>No water resources matched your chosen criteria.</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setSelectedArea('All'); setSelectedType('All'); setSelectedStatus('All'); }}
                    className="text-sky-400 font-mono text-[10px] underline"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredResources.map(res => {
                  // Quality Index evaluation
                  const pHStatus = res.quality.pH >= 6.8 && res.quality.pH <= 7.6 ? 'Safe' : 'Watch';
                  const isLow = res.level <= 35;
                  const isCritical = res.level <= 15;

                  const statusColors = {
                    'Optimal': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    'Low Level': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    'Critical': 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse',
                    'Maintenance': 'bg-slate-500/15 text-slate-400 border-white/10'
                  };

                  return (
                    <div 
                      key={res.id} 
                      className="p-4 rounded-xl bg-slate-950/45 border border-white/5 hover:border-white/10 transition-colors space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">{res.type}</span>
                            <h4 className="font-bold text-white text-xs leading-snug">{res.name}</h4>
                          </div>
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${statusColors[res.status]}`}>
                            {res.status}
                          </span>
                        </div>

                        {/* Capacity Level bar */}
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-400 font-mono">Current Water Level</span>
                            <span className={`font-mono font-bold ${isCritical ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {res.level}%
                            </span>
                          </div>
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isCritical ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-sky-500'
                              }`} 
                              style={{ width: `${res.level}%` }} 
                            />
                          </div>
                          <span className="text-[9px] text-slate-500 font-mono block">Max Capacity: {res.capacity}</span>
                        </div>

                        {/* Location and PH */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-sky-400" />
                            {res.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${pHStatus === 'Safe' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            pH {res.quality.pH} ({pHStatus})
                          </span>
                        </div>
                      </div>

                      {/* Interactive Triggers per source */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => setSelectedResourceForDetails(res)}
                          className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 py-1.5 px-2 rounded-lg text-[10px] font-mono transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Eye className="h-3 w-3 text-sky-400" />
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            // Find nearest tanker center or build fake tracker
                            const dummyReq: WaterSupplyRequest = {
                              id: `track-${res.id}`,
                              citizenName: 'Santhosh Kumar',
                              phone: '+91 94441 55667',
                              address: `${res.name} Feedlines, Chennai`,
                              tankerSize: '9,000 Liters',
                              cost: 800,
                              deliveryDate: new Date().toISOString().split('T')[0],
                              deliveryTime: '04:00 PM',
                              status: 'Dispatched',
                              eta: '18 Mins',
                              driverName: 'Suresh Kumar',
                              driverPhone: '+91 98450 33445',
                              vehicleNo: 'TN-02-CZ-5591',
                              purpose: 'Domestic'
                            };
                            setTrackingRequest(dummyReq);
                          }}
                          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-1.5 px-2 rounded-lg text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Navigation className="h-3 w-3" />
                          Track Tank
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Nearby Water Supply Centers & Tanker Services */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Truck className="h-4.5 w-4.5 text-sky-400" />
              Water Supply Depots & Emergency Tankers
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {centers.map(center => (
                <div 
                  key={center.id} 
                  className="p-3.5 bg-slate-950/45 border border-white/5 rounded-xl hover:border-white/10 transition-colors flex flex-col justify-between space-y-2.5"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{center.name}</h4>
                      <span className="text-[9px] font-mono text-slate-500">{center.distance}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">📍 {center.location}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Active Tankers: <strong className="text-slate-300">{center.activeTankers} Vehicles</strong> | Rates: <strong className="text-sky-300">{center.costRate}</strong>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <a 
                      href={`tel:${center.contact}`}
                      className="text-[10px] font-mono text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <Phone className="h-3 w-3" />
                      {center.contact}
                    </a>

                    <button
                      onClick={() => triggerDirectCenterRequest(center)}
                      className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 px-2.5 py-1 rounded-lg text-[10px] transition-colors cursor-pointer"
                    >
                      Request Supply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Request History, Complaints, and System Announcements */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Activity className="h-4.5 w-4.5 text-indigo-400" />
              Sovereign Utilities Transaction & Grievance ledger
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Supply Request History */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Recent Tanker Bookings</span>
                <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                  {supplyRequests.map(req => (
                    <div key={req.id} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[9px] bg-sky-500/10 text-sky-400 px-1.5 py-0.2 rounded font-mono border border-sky-500/20 mr-1.5">{req.tankerSize}</span>
                          <span className="text-[10px] font-bold text-white font-sans">{req.purpose} Delivery</span>
                        </div>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${
                          req.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          req.status === 'Dispatched' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20 animate-pulse' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">📍 {req.address}</p>
                      
                      <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1.5 border-t border-white/5">
                        <span>Sched: {req.deliveryDate}</span>
                        {req.status === 'Dispatched' && (
                          <button 
                            onClick={() => setTrackingRequest(req)}
                            className="text-sky-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                          >
                            Live Map <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pipeline Grievance Logs */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Grievance / Pipeline Complaints</span>
                <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                  {allComplaints.map(comp => (
                    <div key={comp.id} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-1.5">
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-bold text-white font-sans">{comp.type}</span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${
                          comp.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          comp.status === 'In Progress' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {comp.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 italic">"{comp.description}"</p>
                      <p className="text-[9px] text-slate-500 font-mono">📍 Address: {comp.address}</p>
                      <span className="text-[9px] text-slate-500 font-mono block">Filed: {comp.date}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column (1 col): Utility Controls & Quality/Consumption Metrics */}
        <div className="space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <ShieldCheck className="h-4.5 w-4.5 text-sky-400" />
              Board Command Center
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => setShowSupplyModal(true)}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-sky-500 text-slate-950 font-bold text-xs py-3.5 transition-all shadow-lg hover:from-emerald-300 hover:to-sky-400 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Truck className="h-4 w-4" />
                Request Water Supply Tanker
              </button>

              <button
                onClick={() => setShowIssueModal(true)}
                className="w-full rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 font-bold text-xs py-3.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                Report Pipeline Water Issue
              </button>
            </div>
          </div>

          {/* Daily Water Quality Monitoring Metrics */}
          <div className="rounded-2xl border border-sky-500/10 bg-slate-900 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Activity className="h-4.5 w-4.5 text-sky-400 animate-pulse" />
              Water Quality Index Monitoring
            </h3>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Automated multi-spectral sensor probes located at key reservoir gateways report real-time biological and mineral scores.
            </p>

            <div className="space-y-3 pt-1">
              {/* Biological score parameters */}
              <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Total Dissolved Solids (TDS)</span>
                  <span className="font-bold text-emerald-400 font-mono">240 ppm (Safe)</span>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Chlorine Level</span>
                  <span className="font-bold text-emerald-400 font-mono">0.5 mg/L (Safe)</span>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '60%' }} />
                </div>
              </div>

              <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Water Turbidity</span>
                  <span className="font-bold text-emerald-400 font-mono">1.2 NTU (Clear)</span>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-sky-500/5 border border-sky-500/20 p-3 rounded-xl text-[11px] text-slate-300">
              <Info className="h-4.5 w-4.5 text-sky-400 shrink-0" />
              <span>WHO Potability Standard verified. Chemical treatment lines are working optimally.</span>
            </div>
          </div>

          {/* Water Consumption Progress */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Clock className="h-4.5 w-4.5 text-indigo-400" />
              Daily Water Consumption Rate
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Chennai Grid Today</span>
                  <span className="text-white font-bold">812 MLD / 850 MLD Limit</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-sky-400 h-full rounded-full" style={{ width: '95.5%' }} />
                </div>
                <span className="text-[9px] text-slate-500 font-mono block">Peak demand recorded: 10:00 AM - 12:30 PM</span>
              </div>

              {/* Regional Timetables */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider block mb-1">Local Supply Schedules</span>
                {[
                  { zone: 'Anna Nagar Block-2', time: '06:00 AM - 08:30 AM', pressure: 'Optimal' },
                  { zone: 'Adyar Canal Block-C', time: '07:30 AM - 09:45 AM', pressure: 'Optimal' },
                  { zone: 'Velachery Housing Lines', time: '05:00 PM - 07:00 PM', pressure: 'Low Pressure' }
                ].map((sched, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-950/40 rounded-lg border border-white/5 flex items-center justify-between text-[11px]">
                    <div className="space-y-0.5">
                      <span className="font-bold text-white block">{sched.zone}</span>
                      <span className="text-slate-500 text-[10px]">Pressure: <strong className={sched.pressure === 'Optimal' ? 'text-emerald-400' : 'text-amber-400'}>{sched.pressure}</strong></span>
                    </div>
                    <span className="text-sky-400 font-mono text-[10px] font-bold">{sched.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Regional Alerts Container */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Info className="h-4.5 w-4.5 text-amber-400" />
              Circulars & Official Advisories
            </h3>

            <div className="space-y-3">
              {WATER_NOTIFICATIONS.map(notif => (
                <div key={notif.id} className="p-3 bg-slate-950/50 border border-white/5 rounded-xl space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                        notif.type === 'warning' ? 'bg-amber-400' : notif.type === 'success' ? 'bg-emerald-400' : 'bg-sky-400'
                      }`} />
                      {notif.title}
                    </h4>
                    <span className="text-[9px] font-mono text-slate-500 shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{notif.message}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* --- MODAL 1: REPORT WATER ISSUE COMPLAINT FORM --- */}
      <AnimatePresence>
        {showIssueModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowIssueModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="border-b border-white/5 pb-3 mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-rose-500" />
                  Report Water Utility Pipeline Grievance
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Submit leakage or pressure reports directly to municipal water maintenance desk.</p>
              </div>

              <form onSubmit={handleReportIssueSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Issue Type</label>
                    <select
                      value={complaintType}
                      onChange={(e) => setComplaintType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50 cursor-pointer"
                    >
                      <option value="Leakage" className="bg-slate-900 text-white">Pipeline Leakage / Burst</option>
                      <option value="No Supply" className="bg-slate-900 text-white">Complete No Water Supply</option>
                      <option value="Contaminated Water" className="bg-slate-900 text-white">Dirty / Muddy Contaminated Water</option>
                      <option value="Low Pressure" className="bg-slate-900 text-white">Extremely Low Tap Water Pressure</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Emergency Urgency</label>
                    <select
                      value={complaintPriority}
                      onChange={(e) => setComplaintPriority(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50 cursor-pointer"
                    >
                      <option value="High">High - Outflowing Water / Flood</option>
                      <option value="Medium">Medium - Regular pressure decline</option>
                      <option value="Low">Low - Minor dripping</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Incident Address Location</label>
                  <input
                    type="text"
                    value={complaintAddress}
                    onChange={(e) => setComplaintAddress(e.target.value)}
                    placeholder="e.g. Near Apollo Pharmacy, 5th Cross Road, Anna Nagar East, Chennai"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Your Registered Contact Number</label>
                  <input
                    type="text"
                    value={complaintPhone}
                    onChange={(e) => setComplaintPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Incident Description Details</label>
                  <textarea
                    value={complaintDesc}
                    onChange={(e) => setComplaintDesc(e.target.value)}
                    placeholder="Provide details about size of water burst, smell, duration of supply shortage..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50 min-h-[90px]"
                    required
                  />
                </div>

                {/* Simulated file attachments drag-drop */}
                <div className="border border-dashed border-white/10 rounded-xl p-4 text-center space-y-1.5 bg-slate-950/20">
                  <span className="text-[11px] text-slate-300 block">Attach Image of pipeline leakage (Optional)</span>
                  <p className="text-[9px] text-slate-500 font-mono">Drag and drop JPG, PNG or PDF up to 4MB</p>
                  <button 
                    type="button" 
                    onClick={() => triggerToast('📎 Photo Attached', 'Pipeline leakage reference photo attached to draft.', 'success')}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] rounded border border-white/5 cursor-pointer"
                  >
                    Select Photo
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowIssueModal(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel Draft
                  </button>
                  <button
                    type="submit"
                    disabled={submittingComplaint}
                    className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-extrabold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {submittingComplaint ? (
                      <>
                        <span className="h-3 w-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        Logging on blockchain...
                      </>
                    ) : 'Submit Grievance Report'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL 2: REQUEST WATER SUPPLY TANKER FORM --- */}
      <AnimatePresence>
        {showSupplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowSupplyModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="border-b border-white/5 pb-3 mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Truck className="h-5 w-5 text-sky-400" />
                  Order Emergency Water Tanker Supply
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Dispatches heavy duty water tanker truck directly to your residential or commercial location.</p>
              </div>

              <form onSubmit={handleRequestSupplySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Required Tanker Volume</label>
                    <select
                      value={reqSize}
                      onChange={(e) => setReqSize(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50 cursor-pointer"
                    >
                      <option value="6,000 Liters">6,000 Liters (Est. ₹600)</option>
                      <option value="9,000 Liters">9,000 Liters (Est. ₹800)</option>
                      <option value="12,000 Liters">12,000 Liters (Est. ₹1,100)</option>
                      <option value="15,000 Liters">15,000 Liters (Est. ₹1,400)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Delivery Purpose</label>
                    <select
                      value={reqPurpose}
                      onChange={(e) => setReqPurpose(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50 cursor-pointer"
                    >
                      <option value="Domestic">Domestic Household Use</option>
                      <option value="Commercial">Commercial / Business Use</option>
                      <option value="Community">Community / Apartments Tank</option>
                      <option value="Emergency">Emergency Hospital Relief</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Precise Delivery Address Destination</label>
                  <input
                    type="text"
                    value={reqAddress}
                    onChange={(e) => setReqAddress(e.target.value)}
                    placeholder="e.g. Block II, Sector C, 5th Cross Road, Anna Nagar, Chennai"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Delivery Date</label>
                    <input
                      type="date"
                      value={reqDate}
                      onChange={(e) => setReqDate(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Delivery Preferred Slot</label>
                    <select
                      value={reqTime}
                      onChange={(e) => setReqTime(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50 cursor-pointer"
                    >
                      <option value="08:00 AM">Morning Slot (08:00 AM - 11:00 AM)</option>
                      <option value="12:00 PM">Noon Slot (12:00 PM - 03:00 PM)</option>
                      <option value="04:00 PM">Evening Slot (04:00 PM - 07:00 PM)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Contact Phone Number</label>
                  <input
                    type="text"
                    value={reqPhone}
                    onChange={(e) => setReqPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500/50"
                    required
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between items-center text-white font-bold font-mono">
                    <span>Estimated Cost:</span>
                    <span className="text-emerald-400">
                      {reqSize === '6,000 Liters' ? '₹600' : 
                       reqSize === '9,000 Liters' ? '₹800' : 
                       reqSize === '12,000 Liters' ? '₹1,100' : '₹1,400'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">Includes dispatch charge, road cess, and full chlorination verification ledger cost.</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSupplyModal(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel Request
                  </button>
                  <button
                    type="submit"
                    disabled={submittingSupply}
                    className="flex-1 bg-gradient-to-r from-emerald-400 to-sky-500 hover:from-emerald-300 hover:to-sky-400 text-slate-950 font-extrabold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {submittingSupply ? (
                      <>
                        <span className="h-3 w-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        Routing dispatcher...
                      </>
                    ) : 'Confirm Supply Order'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL 3: VIEW COMPREHENSIVE WATER SOURCE DETAILS --- */}
      <AnimatePresence>
        {selectedResourceForDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setSelectedResourceForDetails(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="border-b border-white/5 pb-3.5 mb-4">
                <span className="px-2.5 py-0.5 bg-sky-500/10 text-sky-400 text-[9px] font-bold font-mono border border-sky-500/20 rounded-full uppercase">
                  {selectedResourceForDetails.type}
                </span>
                <h3 className="text-base font-extrabold text-white mt-1.5">{selectedResourceForDetails.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-sky-400" /> {selectedResourceForDetails.location} | Active Zone Grid
                </p>
              </div>

              <div className="space-y-4 text-xs font-sans">
                
                {/* Visual storage progress card */}
                <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5 space-y-2">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">SCADA Sensor Level Status</span>
                    <span className="font-bold text-white">{selectedResourceForDetails.level}% Capacity Available</span>
                  </div>
                  <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        selectedResourceForDetails.level <= 15 ? 'bg-rose-500' : selectedResourceForDetails.level <= 35 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} 
                      style={{ width: `${selectedResourceForDetails.level}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
                    <span>Absolute volume: {selectedResourceForDetails.capacity}</span>
                    <span>Last updated: just now</span>
                  </div>
                </div>

                {/* Spectral water quality diagnostics */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Gateway Chemistry Telemetry</span>
                  <div className="grid grid-cols-2 gap-3">
                    
                    {/* pH */}
                    <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-1">
                      <span className="text-[9px] text-slate-500 font-mono block">BIOLOGICAL pH SCORE</span>
                      <p className="text-sm font-bold text-white font-mono">{selectedResourceForDetails.quality.pH}</p>
                      <span className="text-[9px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Safe Potable Limit
                      </span>
                    </div>

                    {/* Turbidity */}
                    <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-1">
                      <span className="text-[9px] text-slate-500 font-mono block">TURBIDITY CLARITY</span>
                      <p className="text-sm font-bold text-white font-mono">{selectedResourceForDetails.quality.turbidity} NTU</p>
                      <span className="text-[9px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Suspended Solids Safe
                      </span>
                    </div>

                    {/* Chlorine */}
                    <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-1">
                      <span className="text-[9px] text-slate-500 font-mono block">CHLORINE INFUSION</span>
                      <p className="text-sm font-bold text-white font-mono">{selectedResourceForDetails.quality.chlorine} mg/L</p>
                      <span className="text-[9px] text-sky-400 font-mono font-bold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Sterilization Active
                      </span>
                    </div>

                    {/* TDS */}
                    <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-1">
                      <span className="text-[9px] text-slate-500 font-mono block">TOTAL SOLIDS (TDS)</span>
                      <p className="text-sm font-bold text-white font-mono">{selectedResourceForDetails.quality.tds} ppm</p>
                      <span className="text-[9px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Mineral Score Optimal
                      </span>
                    </div>

                  </div>
                </div>

                {/* Additional infrastructure attributes */}
                <div className="p-3.5 bg-slate-950/30 border border-white/5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                    <span className="text-slate-400">Domestic Population Served:</span>
                    <strong className="text-white font-mono">{selectedResourceForDetails.servedPopulation}</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                    <span className="text-slate-400">Last Engineering Inspection:</span>
                    <strong className="text-white font-mono">{selectedResourceForDetails.lastInspection}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Telemetry Sensor Status:</span>
                    <strong className="text-emerald-400 font-mono flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ACTIVE (99.8% Liveness)
                    </strong>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      // Trigger supply request form matching this tank location
                      setReqAddress(`${selectedResourceForDetails.name}, ${selectedResourceForDetails.location}`);
                      setSelectedResourceForDetails(null);
                      setShowSupplyModal(true);
                    }}
                    className="flex-1 bg-gradient-to-r from-emerald-400 to-sky-500 hover:from-emerald-300 hover:to-sky-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer text-center"
                  >
                    Request Supply From This Source
                  </button>
                  <button
                    onClick={() => setSelectedResourceForDetails(null)}
                    className="px-5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer text-center border border-white/5"
                  >
                    Dismiss Details
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL 4: VIRTUAL LIVE WATER TANKER GPS TRACKING PAGE --- */}
      <AnimatePresence>
        {trackingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative max-h-[95vh] overflow-y-auto"
            >
              <button 
                onClick={() => setTrackingRequest(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="border-b border-white/5 pb-3 mb-4">
                <span className="px-2.5 py-0.5 bg-sky-500/10 text-sky-400 text-[9px] font-bold font-mono border border-sky-500/20 rounded-full uppercase tracking-wider">
                  Live Utility Dispatch
                </span>
                <h3 className="text-base font-extrabold text-white mt-1.5">Water Tanker GPS Tracking Page</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Tracking ID: {trackingRequest.id} | Vehicle No: {trackingRequest.vehicleNo || 'TN-01-AX-4829'}</p>
              </div>

              {/* Dynamic Simulated Map / Radar Screen */}
              <div className="relative h-64 w-full bg-slate-950 rounded-xl border border-sky-500/20 overflow-hidden flex items-center justify-center">
                
                {/* Vector grids simulating high tech radar map */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
                
                {/* Pulsing circles around user center */}
                <div className="absolute h-44 w-44 rounded-full border border-sky-500/5 animate-pulse" />
                <div className="absolute h-24 w-24 rounded-full border border-sky-500/10" />

                {/* SVG Route Line animation */}
                <svg className="absolute inset-0 h-full w-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  {/* Dashed route line */}
                  <path 
                    d="M 50 180 Q 150 50 300 120 T 400 60" 
                    fill="none" 
                    stroke="rgba(14, 165, 233, 0.2)" 
                    strokeWidth="3" 
                    strokeDasharray="6, 4" 
                  />
                  {/* Completed path line */}
                  <path 
                    d="M 50 180 Q 150 50 300 120" 
                    fill="none" 
                    stroke="rgb(14, 165, 233)" 
                    strokeWidth="3.5" 
                  />
                </svg>

                {/* Origin Marker */}
                <div className="absolute left-[36px] bottom-[50px] flex flex-col items-center">
                  <div className="h-6 w-6 rounded-full bg-indigo-500/20 border border-indigo-400 flex items-center justify-center text-[10px] font-bold text-indigo-300">A</div>
                  <span className="text-[8px] text-slate-500 font-mono mt-1">Water Depot</span>
                </div>

                {/* Destination Marker */}
                <div className="absolute right-[85px] top-[40px] flex flex-col items-center">
                  <div className="h-6 w-6 rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center text-[10px] font-bold text-sky-300 animate-bounce">📍</div>
                  <span className="text-[8px] text-slate-300 font-mono mt-1 font-bold">Your Location</span>
                </div>

                {/* Active Tanker Moving Icon */}
                <motion.div 
                  initial={{ x: -100, y: 10 }}
                  animate={{ 
                    x: [ -100, -20, 40, 60, 40 ], 
                    y: [ 40, -40, 10, -10, 10 ] 
                  }}
                  transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                  className="absolute z-10 flex flex-col items-center"
                >
                  <div className="bg-sky-500 text-slate-950 p-1.5 rounded-lg border-2 border-white shadow-xl">
                    <Truck className="h-4.5 w-4.5" />
                  </div>
                  <div className="bg-slate-900/90 text-[8px] px-1 py-0.2 rounded border border-sky-500/40 text-sky-400 font-mono font-bold mt-1 shadow-lg flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-ping" />
                    TANKER MOVING
                  </div>
                </motion.div>

                {/* Compass HUD */}
                <div className="absolute bottom-3 right-3 bg-slate-900/80 p-2 rounded border border-white/5 font-mono text-[8px] text-slate-400 space-y-0.5">
                  <div>LAT: 13.0827° N</div>
                  <div>LNG: 80.2707° E</div>
                  <div className="text-sky-400">GPS SIGNAL: EXCELLENT</div>
                </div>

              </div>

              {/* Driver Details & Delivery ETA */}
              <div className="space-y-4 pt-4 text-xs font-sans">
                
                {/* Live timer metrics */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] text-slate-500 font-mono block">ESTIMATED ETA</span>
                    <p className="text-base font-extrabold text-sky-400 font-mono">{trackingRequest.eta || '14 Mins'}</p>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] text-slate-500 font-mono block">CURRENT SPEED</span>
                    <p className="text-base font-extrabold text-white font-mono">34 km/h</p>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] text-slate-500 font-mono block">WATER LEVEL</span>
                    <p className="text-base font-extrabold text-emerald-400 font-mono">100% Full</p>
                  </div>
                </div>

                {/* Driver information sheet */}
                <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 font-bold text-xs uppercase">
                      {trackingRequest.driverName ? trackingRequest.driverName.split(' ').map(n=>n[0]).join('') : 'RB'}
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono uppercase block">Assigned Utility Driver</span>
                      <h4 className="font-bold text-white text-xs">{trackingRequest.driverName || 'Ramesh Babu'}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">ID: METRO-DRV-908</p>
                    </div>
                  </div>

                  <a 
                    href={`tel:${trackingRequest.driverPhone || '+91 98450 11223'}`}
                    className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-all flex items-center gap-1.5 cursor-pointer font-bold"
                  >
                    <Phone className="h-4 w-4" />
                    Call Driver
                  </a>
                </div>

                <div className="flex items-center gap-2.5 bg-sky-500/5 border border-sky-500/20 p-3.5 rounded-xl text-[11px] text-slate-300">
                  <ShieldCheck className="h-5 w-5 text-sky-400 shrink-0" />
                  <span>Secure distribution pin verification will be requested by driver upon arrival to authorize unloading.</span>
                </div>

                <button
                  onClick={() => setTrackingRequest(null)}
                  className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-2.5 rounded-xl transition-all cursor-pointer border border-white/5"
                >
                  Close Tracker View
                </button>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
