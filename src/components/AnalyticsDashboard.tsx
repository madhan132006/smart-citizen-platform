import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, Activity, BarChart3, ShieldCheck, 
  Sparkles, Layers, RefreshCw, Users, CheckCircle2, 
  Clock, Heart, Calendar, MapPin, Filter, Download, 
  FileSpreadsheet, Eye, Bell, ChevronRight, ArrowUpRight, 
  Search, AlertCircle, ThumbsUp, Check, ExternalLink, 
  FileText, X, AlertTriangle, Shield
} from 'lucide-react';
import { DashboardStats } from '../types';

interface AnalyticsProps {
  db: any;
  language: 'en' | 'ta' | 'hi';
}
// Interfaces for our dynamic dashboard
interface TelemetryRecord {
  id: string;
  module: string;
  serviceType: string;
  citizenName: string;
  location: string;
  date: string;
  status: 'Completed' | 'In Progress' | 'Pending' | 'Critical';
  value: string;
  lat: number;
  lng: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
}

export default function AnalyticsDashboard({ db, language }: AnalyticsProps) {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch('/api/analytics/dashboard')
      .then(res => res.json())
      .then(data => setDashboardStats(data));
  }, []);
  // --- States ---
  const [dateFilter, setDateFilter] = useState<'7' | '30' | '90' | 'all'>('30');
  const [moduleFilter, setModuleFilter] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof TelemetryRecord>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Hover & Detail Modal States
  const [hoveredChartPoint, setHoveredChartPoint] = useState<{chart: string; index: number; x: number; y: number; val: string; label: string} | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<TelemetryRecord | null>(null);
  const [toasts, setToasts] = useState<any[]>([]);

  // List of all 9 modules for filter and data mapping
  const ALL_MODULES = [
    { id: 'healthcare', name: 'Smart Healthcare', color: '#f43f5e', textClass: 'text-rose-400' },
    { id: 'emergency', name: 'Emergency Response', color: '#ef4444', textClass: 'text-red-400' },
    { id: 'blood', name: 'Blood Donor Network', color: '#e11d48', textClass: 'text-rose-500' },
    { id: 'food', name: 'Food Donation', color: '#10b981', textClass: 'text-emerald-400' },
    { id: 'farmer', name: 'Farmer Marketplace', color: '#f59e0b', textClass: 'text-amber-400' },
    { id: 'govt', name: 'Government Services', color: '#8b5cf6', textClass: 'text-violet-400' },
    { id: 'water', name: 'Water Management', color: '#06b6d4', textClass: 'text-cyan-400' },
    { id: 'waste', name: 'Waste Management', color: '#64748b', textClass: 'text-slate-400' },
    { id: 'transport', name: 'Public Transport', color: '#6366f1', textClass: 'text-indigo-400' }
  ];

  const LOCATIONS = ['Chennai Central', 'Egmore', 'Adyar', 'T-Nagar', 'Salem', 'Tambaram'];

  // Toast notifier
  const triggerToast = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // --- Mock Telemetry Data Generator ---
  const telemetryData = useMemo(() => {
    // We generate a deterministic set of data but allow refreshTrigger to slightly randomize
    const list: TelemetryRecord[] = [];
    const citizenNames = [
      'Santhosh Kumar', 'Aravind Swamy', 'Meera Krishnan', 'Priya Nathan', 
      'Rajesh Pillai', 'Vikram Rathore', 'Karthik Raja', 'Sunita Rao', 
      'Ramesh Nathan', 'Divya Balan', 'Arun Kumar', 'Deepa Selvi', 
      'Ganesh Murthy', 'Lakshmi Narayanan', 'Vijay Chandran', 'Nalini Devi'
    ];

    const serviceMap: Record<string, string[]> = {
      'Smart Healthcare': ['Cardiology booking', 'Symptom Consultation', 'Pediatric appointment', 'General Health Assessment'],
      'Emergency Response': ['CPR First-Aid dispatch', 'Road Accident Response', 'Fire SOS beacon', 'Cardiac ICU Telemetry'],
      'Blood Donor Network': ['O+ Blood matching', 'A- Platelets alert', 'B+ emergency matching', 'Donor registration check'],
      'Food Donation': ['Catering surplus salvage', 'Wedding food delivery', 'Bakery leftover ledger', 'Community shelter dispatch'],
      'Farmer Marketplace': ['Tomato price forecast', 'Paddy crop advisor', 'Organic fertilizer query', 'Millet harvest auction'],
      'Government Services': ['Pudhumaipenn application', 'Amma Health Insurance validation', 'Kisan Samman verification', 'Higher Ed stipend'],
      'Water Management': ['Pipeline leak check', 'Low pressure telemetry', 'Contamination complaint', 'Main valve override'],
      'Waste Management': ['Dumpster overflow check', 'Compactor dispatch', 'Hazardous litter remediation', 'E-waste schedule'],
      'Public Transport': ['MTC Bus 21G schedule', 'CMRL Metro frequency check', 'Suburban line delays', 'Smartcard recharge sync']
    };

    const statusList: TelemetryRecord['status'][] = ['Completed', 'In Progress', 'Pending', 'Critical'];

    // Generate 120 records spanning the last 90 days
    for (let i = 0; i < 120; i++) {
      const seed = i + refreshTrigger * 7;
      const modObj = ALL_MODULES[seed % ALL_MODULES.length];
      const services = serviceMap[modObj.name];
      const service = services[seed % services.length];
      const citizen = citizenNames[seed % citizenNames.length];
      const loc = LOCATIONS[seed % LOCATIONS.length];
      
      // Compute dates backward from today
      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() - (seed % 90));
      const dateString = dateObj.toISOString().split('T')[0];

      // Assign Status with logical distribution
      let status: TelemetryRecord['status'] = statusList[seed % statusList.length];
      if (modObj.id === 'emergency') {
        status = seed % 3 === 0 ? 'Critical' : seed % 3 === 1 ? 'Completed' : 'In Progress';
      } else if (status === 'Critical') {
        status = 'In Progress'; // Only emergencies get true critical usually
      }

      const priority: TelemetryRecord['priority'] = status === 'Critical' ? 'Critical' : (seed % 3 === 0 ? 'High' : seed % 3 === 1 ? 'Medium' : 'Low');

      // Coordinate grids centered around Chennai/Salem
      const isSalem = loc === 'Salem';
      const lat = isSalem ? 11.6643 + (seed % 10) * 0.005 : 13.0827 + (seed % 10) * 0.005;
      const lng = isSalem ? 78.1460 + (seed % 10) * 0.005 : 80.2707 + (seed % 10) * 0.005;

      const valueString = modObj.id === 'healthcare' ? 'Dr. Prasad slots'
        : modObj.id === 'emergency' ? `Response window: ${10 + (seed % 10)}m`
        : modObj.id === 'blood' ? '3 Units verified matching'
        : modObj.id === 'food' ? `${50 + (seed % 20) * 5} portions distributed`
        : modObj.id === 'farmer' ? `Salem Tomato index ₹${30 + (seed % 5)}`
        : modObj.id === 'govt' ? 'Moovalur Grant ₹1,000'
        : modObj.id === 'water' ? 'Pipeline stable 2.4 Bar'
        : modObj.id === 'waste' ? 'Compactor truck ETA 22m'
        : 'Transit card code synced';

      list.push({
        id: `LC-${modObj.id.substring(0,2).toUpperCase()}-${1000 + i}`,
        module: modObj.name,
        serviceType: service,
        citizenName: citizen,
        location: loc,
        date: dateString,
        status,
        value: valueString,
        lat,
        lng,
        priority
      });
    }

    return list;
  }, [refreshTrigger]);

  // --- Filtering & Sorting Operations ---
  const filteredData = useMemo(() => {
    return telemetryData.filter(item => {
      // Date filter
      if (dateFilter !== 'all') {
        const limitDays = parseInt(dateFilter);
        const recordDate = new Date(item.date);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - limitDays);
        if (recordDate < cutoffDate) return false;
      }

      // Module filter
      if (moduleFilter !== 'All' && item.module !== moduleFilter) return false;

      // Location filter
      if (locationFilter !== 'All' && item.location !== locationFilter) return false;

      // Search bar filter
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesQuery = 
          item.id.toLowerCase().includes(query) ||
          item.citizenName.toLowerCase().includes(query) ||
          item.serviceType.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query) ||
          item.value.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [telemetryData, dateFilter, moduleFilter, locationFilter, searchTerm]);

  // Sorting
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return sortDirection === 'asc' 
          ? (valA as number) - (valB as number) 
          : (valB as number) - (valA as number);
      }
    });
    return sorted;
  }, [filteredData, sortField, sortDirection]);

  // Pagination bounds
  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedData, currentPage]);

  // --- Aggregated Analytics Cards Calculations ---
  const computedStats = useMemo(() => {
    // Base ratios that we dynamically adjust based on current filters to represent realistic aggregate values
    const countMultiplier = filteredData.length / telemetryData.length;
    
    const totalUsers = Math.round(24580 * (0.8 + 0.2 * countMultiplier));
    const activeUsers = Math.round(18924 * (0.75 + 0.25 * countMultiplier));
    const totalRequests = filteredData.length;
    const completedRequests = filteredData.filter(r => r.status === 'Completed').length;
    const pendingRequests = filteredData.filter(r => r.status === 'Pending' || r.status === 'In Progress').length;
    const emergencyCases = filteredData.filter(r => r.module === 'Emergency Response').length;
    
    // Calculate donations (food portions + blood donor requests)
    let donations = 0;
    filteredData.forEach(r => {
      if (r.module === 'Food Donation') {
        const match = r.value.match(/\d+/);
        if (match) donations += parseInt(match[0]);
      } else if (r.module === 'Blood Donor Network' && r.status === 'Completed') {
        donations += 3; // 3 units standard
      }
    });
    if (donations === 0) donations = Math.round(485 * countMultiplier);

    const systemUptime = countMultiplier === 0 ? '100.00%' : (99.85 + (refreshTrigger % 10) * 0.01).toFixed(2) + '%';

    return {
      totalUsers,
      activeUsers,
      totalRequests,
      completedRequests,
      pendingRequests,
      emergencyCases,
      donations,
      systemUptime
    };
  }, [filteredData, telemetryData, refreshTrigger]);

  // --- Dynamic Chart Data Generations ---
  // 1. Daily Active Users (past 7 days or matching range)
  const chartDailyActiveUsers = useMemo(() => {
    const numDays = dateFilter === '7' ? 7 : dateFilter === '90' ? 14 : dateFilter === 'all' ? 15 : 10;
    const labels: string[] = [];
    const values: number[] = [];
    
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * (dateFilter === 'all' ? 6 : dateFilter === '90' ? 6 : 2));
      labels.push(d.toLocaleDateString([], { month: 'short', day: 'numeric' }));
      
      // Calculate active users matching this period
      const seed = i + refreshTrigger + (moduleFilter === 'All' ? 12 : moduleFilter.length);
      const base = computedStats.activeUsers / numDays;
      const fluctuation = Math.sin(i * 1.5) * (base * 0.15) + (seed % 10) * 50;
      values.push(Math.round(base + fluctuation));
    }

    const maxVal = Math.max(...values) * 1.1 || 100;
    return { labels, values, maxVal };
  }, [computedStats.activeUsers, dateFilter, moduleFilter, refreshTrigger]);

  // 2. User Growth (cumulative over 30 days or filtered dates)
  const chartUserGrowth = useMemo(() => {
    const labels: string[] = [];
    const values: number[] = [];
    let currentTotal = Math.round(computedStats.totalUsers * 0.85);
    const step = Math.round((computedStats.totalUsers - currentTotal) / 9);

    for (let i = 0; i < 10; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (10 - i) * 3);
      labels.push(d.toLocaleDateString([], { month: 'short', day: 'numeric' }));
      currentTotal += step + (i === 9 ? computedStats.totalUsers - currentTotal : Math.round(Math.sin(i) * 150));
      values.push(currentTotal);
    }
    const maxVal = Math.max(...values) * 1.05 || 100;
    return { labels, values, maxVal };
  }, [computedStats.totalUsers]);

  // 3. Emergency Trends (Police, Ambulance, Fire, Disaster over past months)
  const chartEmergencyTrends = useMemo(() => {
    const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const ambulance = [24, 38, 29, computedStats.emergencyCases + 5];
    const police = [18, 22, 15, Math.max(5, Math.round(computedStats.emergencyCases * 0.6))];
    const fire = [5, 12, 4, Math.max(2, Math.round(computedStats.emergencyCases * 0.2))];
    const disaster = [0, 2, 8, Math.max(0, Math.round(computedStats.emergencyCases * 0.1))];

    const allValues = [...ambulance, ...police, ...fire, ...disaster];
    const maxVal = Math.max(...allValues) * 1.15 || 50;

    return { labels, ambulance, police, fire, disaster, maxVal };
  }, [computedStats.emergencyCases]);

  // 4. Monthly Service Usage (by Module)
  const chartServiceUsage = useMemo(() => {
    return ALL_MODULES.map(mod => {
      const count = filteredData.filter(r => r.module === mod.name).length;
      // Add a realistic floor value so it doesn't look empty when filtered
      const baseCount = moduleFilter === 'All' || moduleFilter === mod.name 
        ? count + 2 
        : Math.max(1, count);
      return {
        name: mod.name,
        id: mod.id,
        count: baseCount,
        color: mod.color
      };
    });
  }, [filteredData, moduleFilter]);

  // 5. Recent System Activities and Audited Notifications
  const recentActivities = useMemo(() => {
    return filteredData.slice(0, 6).map((item, idx) => {
      const d = new Date(item.date);
      const timeStr = `${d.toLocaleDateString([], {month:'short', day:'numeric'})} ${10 + (idx % 12)}:${15 + (idx * 7) % 45} ${idx % 2 === 0 ? 'AM':'PM'}`;
      
      let badgeColor = 'bg-slate-500/15 text-slate-400 border-slate-500/20';
      const matchedMod = ALL_MODULES.find(m => m.name === item.module);
      if (matchedMod) {
        if (matchedMod.id === 'healthcare') badgeColor = 'bg-rose-500/15 text-rose-400 border-rose-500/20';
        else if (matchedMod.id === 'emergency') badgeColor = 'bg-red-500/15 text-red-400 border-red-500/20';
        else if (matchedMod.id === 'blood') badgeColor = 'bg-rose-600/15 text-rose-500 border-rose-600/20';
        else if (matchedMod.id === 'food') badgeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
        else if (matchedMod.id === 'farmer') badgeColor = 'bg-amber-500/15 text-amber-400 border-amber-500/20';
        else if (matchedMod.id === 'govt') badgeColor = 'bg-violet-500/15 text-violet-400 border-violet-500/20';
        else if (matchedMod.id === 'water') badgeColor = 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20';
        else if (matchedMod.id === 'waste') badgeColor = 'bg-slate-500/15 text-slate-400 border-slate-500/20';
        else if (matchedMod.id === 'transport') badgeColor = 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20';
      }

      return {
        id: item.id,
        time: timeStr,
        module: item.module,
        msg: `${item.citizenName} initiated ${item.serviceType.toLowerCase()} - logged in ${item.location}.`,
        status: item.status,
        badgeColor,
        raw: item
      };
    });
  }, [filteredData]);

  // --- Interaction Event Handlers ---
  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRefreshTrigger(prev => prev + 1);
      setIsRefreshing(false);
      setCurrentPage(1);
      triggerToast('📊 Analytics Grid Synced', 'Real-time metropolitan telemetry tables refreshed successfully.', 'success');
    }, 800);
  };

  const handleExportCSV = () => {
    // Generate CSV content
    const headers = ['Ticket ID', 'Module', 'Service Type', 'Citizen Name', 'Location', 'Date', 'Status', 'Priority', 'Telemetry Value'];
    const rows = filteredData.map(r => [
      r.id,
      r.module,
      `"${r.serviceType}"`,
      `"${r.citizenName}"`,
      r.location,
      r.date,
      r.status,
      r.priority,
      `"${r.value}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lifeconnect_saas_analytics_${moduleFilter.replace(/\s+/g, '_')}_${locationFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast('📋 CSV Generated', `Successfully compiled and downloaded report for ${filteredData.length} records.`, 'success');
  };

  const handleDownloadAnalytics = () => {
    // Generates a summary text/markdown file
    const summary = `# LifeConnect AI Sovereign Command Center Telemetry
Generated at: ${new Date().toLocaleString()}
Filters:
- Timeframe: Last ${dateFilter} Days (or all time)
- Selected Module: ${moduleFilter}
- Selected Location: ${locationFilter}

============================================
CORE PERFORMANCE METRICS:
- Total Registered Citizens: ${computedStats.totalUsers}
- Active Core Citizens: ${computedStats.activeUsers}
- Combined Service Operations: ${computedStats.totalRequests}
- Completed & Cleared Tasks: ${computedStats.completedRequests}
- In-flight/Pending Workloads: ${computedStats.pendingRequests}
- Critical First-Aid Responders dispatched: ${computedStats.emergencyCases}
- Food portions / Blood matches salvaged: ${computedStats.donations}
- Grid Operational Uptime: ${computedStats.systemUptime}

============================================
RECENT TELEMETRY STREAM LOGS:
${filteredData.slice(0, 15).map(r => `[${r.date}] ${r.id} | ${r.module} | ${r.citizenName} | ${r.location} | Status: ${r.status}`).join('\n')}

============================================
END OF SECURE TELEMETRY REPORT
`;

    const blob = new Blob([summary], { type: 'text/plain' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `lifeconnect_sovereign_summary_${dateFilter}d.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast('📥 Summary Downloaded', 'Sovereign markdown executive summary successfully generated.', 'success');
  };

  // SVG Helper
  const getSvgPoints = (values: number[], width: number, height: number, maxVal: number) => {
    if (values.length === 0) return { line: '', area: '' };
    const stepX = width / (values.length - 1 || 1);
    const coords = values.map((val, i) => {
      const x = i * stepX;
      const y = height - (val / (maxVal || 1)) * height;
      return { x, y };
    });

    const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
    const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

    return { line: linePath, area: areaPath, coords };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100 font-sans" id="analytics-panel-root">
      
      {/* Toast Notification Mount */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl border shadow-2xl flex items-start gap-3 pointer-events-auto bg-slate-900/95 transition-all ${
              toast.type === 'success' 
                ? 'border-emerald-500/30' 
                : toast.type === 'warning' 
                  ? 'border-amber-500/30' 
                  : 'border-cyan-500/30'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${
              toast.type === 'success' 
                ? 'bg-emerald-500/15 text-emerald-400' 
                : toast.type === 'warning' 
                  ? 'bg-amber-500/15 text-amber-400' 
                  : 'bg-cyan-500/15 text-cyan-400'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : toast.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
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
          </div>
        ))}
      </div>

      {/* --- Unified Command Header --- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/5 pb-5 gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="h-11 w-11 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 border border-cyan-500/25">
            <Activity className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold uppercase tracking-wider font-mono flex items-center gap-2">
              Sovereign Command Telemetry Analytics
              <span className="px-2 py-0.5 text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">SaaS Hub</span>
            </h2>
            <p className="text-xs text-slate-400">Live multi-agency municipal performance, carbon offsets, and citizen engagement grids.</p>
          </div>
        </div>

        {/* Global Control Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-mono font-bold flex items-center gap-2 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-mono font-bold flex items-center gap-2 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            Export CSV
          </button>

          <button
            onClick={handleDownloadAnalytics}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 text-xs font-mono font-bold flex items-center gap-2 border border-cyan-500/30 transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-cyan-300" />
            Download Summary
          </button>
        </div>
      </div>

      {/* --- Filter Console Bar --- */}
      <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Filter className="h-3.5 w-3.5 text-cyan-400" />
            Grid Filters:
          </div>

          {/* Timeframe Filter */}
          <div className="flex rounded-lg bg-slate-950 p-0.5 border border-white/5">
            {[
              { id: '7', label: '7 Days' },
              { id: '30', label: '30 Days' },
              { id: '90', label: '90 Days' },
              { id: 'all', label: 'All Time' }
            ].map(tf => (
              <button
                key={tf.id}
                onClick={() => {
                  setDateFilter(tf.id as any);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded cursor-pointer transition-colors ${
                  dateFilter === tf.id 
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Module Filter */}
          <select
            value={moduleFilter}
            onChange={(e) => {
              setModuleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-950 text-slate-300 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-white/5 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            <option value="All">All Modules (9 Grid Services)</option>
            {ALL_MODULES.map(m => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-950 text-slate-300 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-white/5 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            <option value="All">All Locations (Chennai/Salem)</option>
            {LOCATIONS.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search telemetry registry..."
            className="w-full lg:w-64 bg-slate-950 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 placeholder-slate-500"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* --- Performance Metrics Grid Cards --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Users */}
        <div className="rounded-2xl border border-white/5 bg-slate-900 p-4 space-y-2 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total Citizens</span>
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-black font-mono tracking-tight text-white">{dashboardStats ? dashboardStats.totalCitizens.toLocaleString() : '...'}</h3>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5 mt-0.5">
              <span className="text-[8px]">▲</span> +4.8% this week
            </span>
          </div>
        </div>

        {/* Card 2: Active Users */}
        <div className="rounded-2xl border border-white/5 bg-slate-900 p-4 space-y-2 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/5 rounded-full blur-xl" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Active Citizens</span>
            <Activity className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <h3 className="text-xl font-black font-mono tracking-tight text-white">{dashboardStats ? dashboardStats.activeUsersToday.toLocaleString() : '...'}</h3>
            <span className="text-[10px] text-violet-300 font-mono flex items-center gap-0.5 mt-0.5">
              {dashboardStats && dashboardStats.totalCitizens ? Math.round((dashboardStats.activeUsersToday / dashboardStats.totalCitizens) * 100) : 0}% engagement rate
            </span>
          </div>
        </div>

        {/* Card 3: Combined Service Requests */}
        <div className="rounded-2xl border border-white/5 bg-slate-900 p-4 space-y-2 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total Service Requests</span>
            <BarChart3 className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-black font-mono tracking-tight text-white">{computedStats.totalRequests}</h3>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
              Filtered telemetry rows
            </span>
          </div>
        </div>

        {/* Card 4: Completed Requests */}
        <div className="rounded-2xl border border-white/5 bg-slate-900 p-4 space-y-2 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/5 rounded-full blur-xl" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Completed Requests</span>
            <CheckCircle2 className="h-4 w-4 text-teal-400" />
          </div>
          <div>
            <h3 className="text-xl font-black font-mono tracking-tight text-emerald-400">{computedStats.completedRequests}</h3>
            <span className="text-[10px] text-emerald-400/80 font-mono flex items-center gap-0.5 mt-0.5">
              {computedStats.totalRequests > 0 ? Math.round((computedStats.completedRequests / computedStats.totalRequests) * 100) : 100}% dispatch success
            </span>
          </div>
        </div>

        {/* Card 5: Pending Requests */}
        <div className="rounded-2xl border border-white/5 bg-slate-900 p-4 space-y-2 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Pending Workloads</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-black font-mono tracking-tight text-amber-400">{computedStats.pendingRequests}</h3>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
              In-progress state queues
            </span>
          </div>
        </div>

        {/* Card 6: Emergency Responders Dispatched */}
        <div className="rounded-2xl border border-white/5 bg-slate-900 p-4 space-y-2 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Emergency Incidents</span>
            <Shield className="h-4 w-4 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-black font-mono tracking-tight text-red-400">{computedStats.emergencyCases}</h3>
            <span className="text-[10px] text-rose-300 font-mono flex items-center gap-0.5 mt-0.5">
              Avg dispatch window 12m
            </span>
          </div>
        </div>

        {/* Card 7: Total Community Donations */}
        <div className="rounded-2xl border border-white/5 bg-slate-900 p-4 space-y-2 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-xl" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Donations & Salvages</span>
            <Heart className="h-4 w-4 text-rose-500" />
          </div>
          <div>
            <h3 className="text-xl font-black font-mono tracking-tight text-rose-400">{computedStats.donations.toLocaleString()}</h3>
            <span className="text-[10px] text-rose-300/80 font-mono mt-0.5 block">
              Food packets & Blood units
            </span>
          </div>
        </div>

        {/* Card 8: System Grid Uptime */}
        <div className="rounded-2xl border border-white/5 bg-slate-900 p-4 space-y-2 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Telemetry Integrity</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-black font-mono tracking-tight text-emerald-400">{computedStats.systemUptime}</h3>
            <span className="text-[10px] text-emerald-400/80 font-mono flex items-center gap-1 mt-0.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              All 9 grids healthy
            </span>
          </div>
        </div>

      </div>

      {/* --- Principal Charts Grid Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        
        {/* Chart 1: Daily Active Users (Col Span 3) */}
        <div className="lg:col-span-3 rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[9px] uppercase font-mono text-cyan-400 block font-bold tracking-wider">Telemetry Waveform</span>
              <h3 className="text-xs font-bold text-slate-200">Daily Active Citizens (DAU)</h3>
            </div>
            <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20 text-[9px] font-mono font-bold">
              Mean: {Math.round(chartDailyActiveUsers.values.reduce((a, b) => a + b, 0) / chartDailyActiveUsers.values.length)}/day
            </span>
          </div>

          <div className="relative h-56 w-full pt-4">
            {/* SVG line and area layout */}
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="dau-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => (
                <line
                  key={idx}
                  x1="0"
                  y1={180 * p}
                  x2="500"
                  y2={180 * p}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}

              {(() => {
                const { line, area, coords } = getSvgPoints(chartDailyActiveUsers.values, 500, 180, chartDailyActiveUsers.maxVal);
                return (
                  <>
                    {/* Shaded Area */}
                    <path d={area} fill="url(#dau-gradient)" />
                    {/* Thick spline line */}
                    <path d={line} fill="none" stroke="#06b6d4" strokeWidth="2.5" />
                    
                    {/* Hover nodes */}
                    {coords.map((c, idx) => {
                      const isHovered = hoveredChartPoint?.chart === 'dau' && hoveredChartPoint.index === idx;
                      return (
                        <g key={idx} className="cursor-pointer">
                          <circle
                            cx={c.x}
                            cy={c.y}
                            r={isHovered ? 6 : 4}
                            fill={isHovered ? '#fff' : '#06b6d4'}
                            stroke="#1e293b"
                            strokeWidth="1.5"
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredChartPoint({
                                chart: 'dau',
                                index: idx,
                                x: rect.left - rect.width,
                                y: rect.top - 85,
                                val: `${chartDailyActiveUsers.values[idx].toLocaleString()} citizens`,
                                label: chartDailyActiveUsers.labels[idx]
                              });
                            }}
                            onMouseLeave={() => setHoveredChartPoint(null)}
                          />
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>

            {/* X Axis Labels */}
            <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-3 px-1">
              {chartDailyActiveUsers.labels.map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: Cumulative User Growth (Col Span 3) */}
        <div className="lg:col-span-3 rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[9px] uppercase font-mono text-violet-400 block font-bold tracking-wider">Citizen Curve</span>
              <h3 className="text-xs font-bold text-slate-200">Sovereign Cumulative Signups</h3>
            </div>
            <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded-full border border-violet-500/20 text-[9px] font-mono font-bold">
              Cumulative Growth
            </span>
          </div>

          <div className="relative h-56 w-full pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="growth-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => (
                <line
                  key={idx}
                  x1="0"
                  y1={180 * p}
                  x2="500"
                  y2={180 * p}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}

              {(() => {
                const { line, area, coords } = getSvgPoints(chartUserGrowth.values, 500, 180, chartUserGrowth.maxVal);
                return (
                  <>
                    <path d={area} fill="url(#growth-gradient)" />
                    <path d={line} fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
                    
                    {coords.map((c, idx) => {
                      const isHovered = hoveredChartPoint?.chart === 'growth' && hoveredChartPoint.index === idx;
                      return (
                        <g key={idx} className="cursor-pointer">
                          <circle
                            cx={c.x}
                            cy={c.y}
                            r={isHovered ? 6 : 4}
                            fill={isHovered ? '#fff' : '#8b5cf6'}
                            stroke="#1e293b"
                            strokeWidth="1.5"
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredChartPoint({
                                chart: 'growth',
                                index: idx,
                                x: rect.left - rect.width,
                                y: rect.top - 85,
                                val: `${chartUserGrowth.values[idx].toLocaleString()} total`,
                                label: `Timeline: ${chartUserGrowth.labels[idx]}`
                              });
                            }}
                            onMouseLeave={() => setHoveredChartPoint(null)}
                          />
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>

            <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-3 px-1">
              {chartUserGrowth.labels.map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 3: Monthly Service Usage (Col Span 4) */}
        <div className="lg:col-span-4 rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[9px] uppercase font-mono text-emerald-400 block font-bold tracking-wider">Multi-Grid Loads</span>
              <h3 className="text-xs font-bold text-slate-200">Load Factor by Service Module</h3>
            </div>
            <span className="text-[9px] font-mono text-slate-500">
              Active queues under observation
            </span>
          </div>

          {/* Interactive Bar Chart */}
          <div className="relative h-60 w-full pt-4">
            <div className="flex items-end justify-between h-48 px-1">
              {chartServiceUsage.map((item, idx) => {
                const maxVal = Math.max(...chartServiceUsage.map(c => c.count)) || 1;
                const pctHeight = (item.count / maxVal) * 100;
                const isHovered = hoveredChartPoint?.chart === 'usage' && hoveredChartPoint.index === idx;

                return (
                  <div key={idx} className="flex flex-col items-center flex-1 group relative">
                    {/* Exact Value tooltip inside */}
                    <span className="absolute -top-6 text-[9px] text-cyan-300 font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-950 px-1.5 py-0.5 rounded border border-white/10 z-10">
                      {item.count} items
                    </span>

                    {/* Bar Pillar */}
                    <div 
                      className="w-8 rounded-t-md cursor-pointer transition-all duration-300 relative overflow-hidden"
                      style={{ 
                        height: `${Math.max(4, pctHeight)}%`,
                        backgroundColor: isHovered ? '#fff' : item.color,
                        opacity: isHovered ? 1 : 0.85,
                        boxShadow: `0 0 12px ${item.color}20`
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredChartPoint({
                          chart: 'usage',
                          index: idx,
                          x: rect.left - 50,
                          y: rect.top - 80,
                          val: `${item.count} operations`,
                          label: item.name
                        });
                      }}
                      onMouseLeave={() => setHoveredChartPoint(null)}
                    >
                      {/* Top reflective cap */}
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/40" />
                    </div>

                    {/* Sub text label */}
                    <span 
                      className="text-[9px] text-slate-500 font-mono mt-2 text-center line-clamp-1 w-full"
                      title={item.name}
                    >
                      {item.name.replace('Network', '').replace('Services', '').replace('Marketplace', '')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart 4: Stacked Emergency Trends & Donations Rings (Col Span 2) */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[9px] uppercase font-mono text-rose-400 block font-bold tracking-wider">Contribution Matrix</span>
            <h3 className="text-xs font-bold text-slate-200">Emergency & Community Metrics</h3>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            
            {/* SOS Types */}
            <div className="space-y-2.5">
              <span className="text-[10px] text-slate-400 font-mono block">Emergency Responder Sub-systems:</span>
              
              {/* Emergency Progress bar 1: Ambulance */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-red-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> Ambulance Units
                  </span>
                  <span className="text-slate-300 font-bold">{chartEmergencyTrends.ambulance[3]} active</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${(chartEmergencyTrends.ambulance[3]/chartEmergencyTrends.maxVal)*100}%` }} />
                </div>
              </div>

              {/* Emergency Progress bar 2: Police */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-indigo-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> Law Patrols
                  </span>
                  <span className="text-slate-300 font-bold">{chartEmergencyTrends.police[3]} active</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(chartEmergencyTrends.police[3]/chartEmergencyTrends.maxVal)*100}%` }} />
                </div>
              </div>

              {/* Emergency Progress bar 3: Fire */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-amber-500 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Fire Engines
                  </span>
                  <span className="text-slate-300 font-bold">{chartEmergencyTrends.fire[3]} active</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(chartEmergencyTrends.fire[3]/chartEmergencyTrends.maxVal)*100}%` }} />
                </div>
              </div>

              {/* Emergency Progress bar 4: Disaster */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-cyan-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Disaster Rescue
                  </span>
                  <span className="text-slate-300 font-bold">{chartEmergencyTrends.disaster[3]} ready</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${(chartEmergencyTrends.disaster[3]/chartEmergencyTrends.maxVal)*100}%` }} />
                </div>
              </div>
            </div>

            {/* Donation Radial progress indicators representation */}
            <div className="pt-3 border-t border-white/5 flex items-center gap-4 justify-around">
              <div className="text-center">
                <span className="text-[9px] text-slate-500 uppercase font-mono block">Food Target</span>
                <span className="text-xs font-bold text-emerald-400">92% Met</span>
              </div>
              <div className="text-center">
                <span className="text-[9px] text-slate-500 uppercase font-mono block">Blood Match</span>
                <span className="text-xs font-bold text-rose-400">85% Met</span>
              </div>
              <div className="text-center">
                <span className="text-[9px] text-slate-500 uppercase font-mono block">Welfare Quota</span>
                <span className="text-xs font-bold text-violet-400">98% Met</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Floating Hover Tooltip Card */}
      {hoveredChartPoint && (
        <div 
          className="fixed pointer-events-none z-50 bg-slate-950 border border-white/10 p-2 rounded-lg shadow-2xl font-mono text-[10px] space-y-0.5"
          style={{ left: hoveredChartPoint.x, top: hoveredChartPoint.y }}
        >
          <div className="text-slate-400 font-bold">{hoveredChartPoint.label}</div>
          <div className="text-cyan-300 font-black">{hoveredChartPoint.val}</div>
        </div>
      )}

      {/* --- Recent Telemetry Activities & System Alerts --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Live Operations Feed (Col Span 2) */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[9px] uppercase font-mono text-cyan-400 block font-bold tracking-wider">Operations Log</span>
              <h3 className="text-xs font-bold text-slate-200">Live Telemetry Ledger</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Showing last {recentActivities.length} logs
            </span>
          </div>

          <div className="space-y-3">
            {recentActivities.map((act) => (
              <div 
                key={act.id} 
                className="p-3 bg-slate-950/40 rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Status Indicator circle */}
                  <span className={`h-2 w-2 rounded-full shrink-0 ${
                    act.status === 'Completed' ? 'bg-emerald-400' 
                      : act.status === 'In Progress' ? 'bg-indigo-400'
                        : act.status === 'Critical' ? 'bg-red-400 animate-ping'
                          : 'bg-amber-400'
                  }`} />
                  
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] font-bold text-white bg-white/5 px-1.5 py-0.2 rounded border border-white/10">
                        {act.id}
                      </span>
                      <span className={`text-[9px] px-1.5 rounded-full border ${act.badgeColor} shrink-0`}>
                        {act.module}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">{act.time}</span>
                    </div>
                    <p className="text-slate-300 mt-1 truncate max-w-lg">{act.msg}</p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedRecord(act.raw)}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 border border-white/5 hover:border-cyan-500/20 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Eye className="h-3 w-3" />
                  Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Sovereign Grid Alerts & Offset Feed */}
        <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <span className="text-[9px] uppercase font-mono text-violet-400 block font-bold tracking-wider">Audit Alert Engine</span>
              <h3 className="text-xs font-bold text-slate-200">Sovereign Grid Alerts</h3>
            </div>

            <div className="space-y-3">
              {/* Alert 1 */}
              <div className="p-3 bg-red-950/10 border border-red-500/20 rounded-xl flex gap-2.5 items-start">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <h4 className="font-bold text-slate-200">Emergency Dispatches active near Egmore</h4>
                  <p className="text-[10px] text-slate-400 leading-snug">Emergency response units routed. Ambulances responding to acute telemetry triggers. High traffic density logged near Egmore central grid.</p>
                  <span className="text-[8px] font-mono text-slate-500 block pt-1">Logged 5m ago</span>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="p-3 bg-amber-950/10 border border-amber-500/20 rounded-xl flex gap-2.5 items-start">
                <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <h4 className="font-bold text-slate-200">Water leak registered near Adyar node</h4>
                  <p className="text-[10px] text-slate-400 leading-snug">Municipal team dispatched to remediate a 2.4 Bar secondary pipeline joint leakage. Average ETA 40m.</p>
                  <span className="text-[8px] font-mono text-slate-500 block pt-1">Logged 25m ago</span>
                </div>
              </div>

              {/* Alert 3 */}
              <div className="p-3 bg-emerald-950/10 border border-emerald-500/20 rounded-xl flex gap-2.5 items-start">
                <ThumbsUp className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <h4 className="font-bold text-slate-200">Zero-Waste Food salvaged successfully</h4>
                  <p className="text-[10px] text-slate-400 leading-snug">120 surplus biryani packets claimed by voluntary riders for Egmore shelter coordination.</p>
                  <span className="text-[8px] font-mono text-slate-500 block pt-1">Logged 1h ago</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-white/5 space-y-1 mt-4">
            <span className="text-[8px] font-bold text-violet-400 font-mono uppercase tracking-wider block">AI COGNITIVE SYNC STATUS</span>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-500">Latency to regional node:</span>
              <span className="text-emerald-400 font-bold">12ms</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-500">Gateway state vector:</span>
              <span className="text-cyan-400 font-bold">Encrypted</span>
            </div>
          </div>
        </div>

      </div>

      {/* --- Detailed Telemetry Registry Data Table --- */}
      <div className="rounded-2xl border border-white/5 bg-slate-900 overflow-hidden shadow-xl" id="detailed-data-table-section">
        
        {/* Table Header Controls */}
        <div className="p-5 border-b border-white/5 bg-slate-950/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-[9px] uppercase font-mono text-cyan-400 block font-bold tracking-wider">Registry Archive</span>
            <h3 className="text-sm font-bold text-white">Grid Telemetry Registry Logs</h3>
            <p className="text-xs text-slate-400 mt-0.5">Full audit details for the filtered {sortedData.length} sovereign items.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Sort by:</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="bg-slate-950 text-slate-300 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-white/5 focus:outline-none"
            >
              <option value="date">Date</option>
              <option value="id">Ticket ID</option>
              <option value="citizenName">Citizen</option>
              <option value="location">Location</option>
              <option value="status">Status</option>
              <option value="priority">Priority</option>
            </select>

            <button
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 bg-slate-950 text-slate-400 hover:text-white rounded-lg border border-white/5 font-mono text-xs font-bold"
              title="Toggle Sort Direction"
            >
              {sortDirection.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-slate-950/10 text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Service Module</th>
                <th className="py-3 px-4">Task Specification</th>
                <th className="py-3 px-4">Requesting Citizen</th>
                <th className="py-3 px-4">Municipal Location</th>
                <th className="py-3 px-4">Logging Date</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Operational Status</th>
                <th className="py-3 px-4 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 italic font-mono">
                    Zero records matched the specified telemetry filters. Try clearing search keywords.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  let statusColor = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                  if (item.status === 'Completed') statusColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                  else if (item.status === 'In Progress') statusColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
                  else if (item.status === 'Pending') statusColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                  else if (item.status === 'Critical') statusColor = 'bg-red-500/10 text-red-400 border-red-500/20';

                  let prioColor = 'text-slate-400';
                  if (item.priority === 'Critical') prioColor = 'text-red-400 font-bold';
                  else if (item.priority === 'High') prioColor = 'text-amber-400';
                  else if (item.priority === 'Medium') prioColor = 'text-cyan-400';

                  return (
                    <tr key={item.id} className="hover:bg-slate-950/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-400">{item.id}</td>
                      <td className="py-3 px-4 font-medium text-slate-200">{item.module}</td>
                      <td className="py-3 px-4 text-slate-300">{item.serviceType}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{item.citizenName}</td>
                      <td className="py-3 px-4 text-slate-300">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                          {item.location}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono">{item.date}</td>
                      <td className={`py-3 px-4 font-mono text-[10px] uppercase ${prioColor}`}>{item.priority}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${statusColor}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedRecord(item)}
                          className="px-2.5 py-1 rounded bg-white/5 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 border border-white/5 hover:border-cyan-500/20 text-[10px] font-mono font-bold flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Tray */}
        <div className="p-4 border-t border-white/5 bg-slate-950/20 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">
            Showing <strong className="text-slate-300">{Math.min(sortedData.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}</strong> - <strong className="text-slate-300">{Math.min(sortedData.length, currentPage * ITEMS_PER_PAGE)}</strong> of <strong className="text-slate-300">{sortedData.length}</strong> entries
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded bg-slate-950 text-slate-400 hover:text-white border border-white/5 disabled:opacity-30 disabled:hover:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <span className="px-3 text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 rounded bg-slate-950 text-slate-400 hover:text-white border border-white/5 disabled:opacity-30 disabled:hover:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {/* --- Details Inspection Modal Overlay --- */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden font-sans">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-white/5 bg-slate-950/40 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                <h3 className="text-xs font-bold font-mono text-white">TELEMETRY INSPECTOR: {selectedRecord.id}</h3>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg hover:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 text-xs">
              
              {/* Top summary row */}
              <div className="grid grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-white/5">
                <div>
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">Sovereign Service Node</span>
                  <span className="font-bold text-white text-sm">{selectedRecord.module}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">Logging Coordinates</span>
                  <span className="font-mono text-slate-300 text-xs">
                    {selectedRecord.lat.toFixed(4)}° N, {selectedRecord.lng.toFixed(4)}° E
                  </span>
                </div>
              </div>

              {/* Data specifications list */}
              <div className="space-y-2.5">
                
                {/* Specific 1: Service details */}
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400">Task Classification:</span>
                  <span className="text-white font-medium">{selectedRecord.serviceType}</span>
                </div>

                {/* Specific 2: Requestor name */}
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400">Citizen Requestor:</span>
                  <span className="text-white font-mono">{selectedRecord.citizenName}</span>
                </div>

                {/* Specific 3: Date */}
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400">Authorized Date Stamp:</span>
                  <span className="text-white font-mono">{selectedRecord.date}</span>
                </div>

                {/* Specific 4: Location */}
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400">Regional District Zone:</span>
                  <span className="text-slate-200">{selectedRecord.location}</span>
                </div>

                {/* Specific 5: Priority */}
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400">System Priority Index:</span>
                  <span className={`font-mono text-[10px] uppercase font-bold ${
                    selectedRecord.priority === 'Critical' ? 'text-red-400' 
                      : selectedRecord.priority === 'High' ? 'text-amber-400' 
                        : 'text-cyan-400'
                  }`}>
                    {selectedRecord.priority}
                  </span>
                </div>

                {/* Specific 6: Value parameters */}
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400">Telemetry Register Status:</span>
                  <span className="text-cyan-300 font-mono font-bold text-right">{selectedRecord.value}</span>
                </div>

                {/* Specific 7: Status badge */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Active Operational Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
                    selectedRecord.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : selectedRecord.status === 'In Progress' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        : selectedRecord.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {selectedRecord.status}
                  </span>
                </div>

              </div>

              {/* Audit progress timeline logs representation */}
              <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                <span className="text-[9px] uppercase font-mono text-slate-500 block">Sovereign Audit Log Trace:</span>
                
                <div className="bg-slate-950 p-3 rounded-lg border border-white/5 font-mono text-[9px] text-slate-400 space-y-1">
                  <div>[11:24:02] Initial handshake initialized by client device.</div>
                  <div>[11:24:05] Spatial coordinates verified successfully in {selectedRecord.location}.</div>
                  <div>
                    {selectedRecord.status === 'Completed' 
                      ? '[12:05:14] Supervisor closed transaction token. State: APPROVED_COMPLETED.'
                      : '[11:25:00] Pipeline queued in municipal dispatch systems. State: IN_PROGRESS.'}
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/5 bg-slate-950/40 flex justify-end gap-2.5">
              <button
                onClick={() => {
                  triggerToast('🎫 Telemetry Synced', `Handshake verified for ticket ${selectedRecord.id}.`, 'info');
                  setSelectedRecord(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer font-mono"
              >
                Close Trace
              </button>
              
              <button
                onClick={() => {
                  triggerToast('🚀 Service Pinged', `Manual ping telemetry vector sent to ${selectedRecord.citizenName}.`, 'success');
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-xs text-cyan-300 hover:bg-cyan-500/30 transition-colors font-mono cursor-pointer"
              >
                Sync Node Telemetry
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
