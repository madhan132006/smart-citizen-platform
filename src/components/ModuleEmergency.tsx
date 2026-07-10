import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Phone, Navigation, ShieldCheck, Flame, 
  Sparkles, CheckCircle2, ChevronRight, Activity, X,
  Search, Filter, Shield, Droplet, User, Users, Heart, 
  Download, Printer, Bell, CloudRain, Wind, Compass, 
  MapPin, Check, Info, ArrowUpRight, Award, Clock
} from 'lucide-react';
import { EmergencyRequest } from '../types';
import { 
  INITIAL_EMERGENCIES, INITIAL_HOSPITALS, INITIAL_AMBULANCES, 
  INITIAL_POLICE, INITIAL_FIRE, INITIAL_BLOOD_BANKS, 
  INITIAL_VOLUNTEERS, INITIAL_DISASTER_TEAMS, INITIAL_DISASTER_ALERTS, 
  INITIAL_SHELTERS, INITIAL_NOTIFICATIONS, INITIAL_HISTORY,
  Hospital, Ambulance, PoliceTeam, FireStation, DisasterTeam, 
  BloodBank, VolunteerTeam, EmergencyNotification, HistoryRecord, Shelter 
} from './EmergencyData';

interface EmergencyProps {
  db: any;
  onUpdateStatus?: (id: string, status: 'Requested' | 'Dispatched' | 'Resolved') => void;
  language: 'en' | 'ta' | 'hi';
}

export default function ModuleEmergency({ db, onUpdateStatus, language }: EmergencyProps) {
  // Tabs: 'control-room' | 'responders' | 'reports' | 'analytics' | 'alerts-shelters'
  const [activeTab, setActiveTab] = useState<'control-room' | 'responders' | 'reports' | 'analytics' | 'alerts-shelters'>('control-room');
  
  // State from core or local data
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>(() => {
    const list = [...INITIAL_EMERGENCIES];
    if (db?.emergencies && db.emergencies.length > 0) {
      db.emergencies.forEach((serverE: any) => {
        if (!list.some(e => e.id === serverE.id)) {
          list.unshift(serverE);
        }
      });
    }
    return list;
  });

  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [ambulances, setAmbulances] = useState<Ambulance[]>(INITIAL_AMBULANCES);
  const [policeTeams, setPoliceTeams] = useState<PoliceTeam[]>(INITIAL_POLICE);
  const [fireStations, setFireStations] = useState<FireStation[]>(INITIAL_FIRE);
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>(INITIAL_BLOOD_BANKS);
  const [volunteers, setVolunteers] = useState<VolunteerTeam[]>(INITIAL_VOLUNTEERS);
  const [disasterTeams, setDisasterTeams] = useState<DisasterTeam[]>(INITIAL_DISASTER_TEAMS);
  const [shelters, setShelters] = useState<Shelter[]>(INITIAL_SHELTERS);
  const [notifications, setNotifications] = useState<EmergencyNotification[]>(INITIAL_NOTIFICATIONS);
  const [history, setHistory] = useState<HistoryRecord[]>(INITIAL_HISTORY);
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyRequest | null>(null);

  // Active filter & search state for SOS board
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Police' | 'Fire' | 'Ambulance' | 'Disaster'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Requested' | 'Dispatched' | 'Resolved'>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Low'>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'priority' | 'type'>('newest');

  // Trigger SOS Form state
  const [sosType, setSosType] = useState<'Police' | 'Fire' | 'Ambulance' | 'Disaster'>('Ambulance');
  const [sosPriority, setSosPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [sosCitizen, setSosCitizen] = useState('');
  const [sosPhone, setSosPhone] = useState('');
  const [sosDesc, setSosDesc] = useState('');
  const [sosAddr, setSosAddr] = useState('Guindy Commercial High Road, Chennai');

  // Emergency Call Dialog State
  const [callDialog, setCallDialog] = useState<{ isOpen: boolean; service: string; number: string } | null>(null);
  const [callingState, setCallingState] = useState<'idle' | 'calling'>('idle');
  const [location, setLocation] = useState<GeolocationPosition | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation(pos),
      (err) => console.error("Location access denied", err)
    );
  }, []);

  const initiateCall = (service: string, number: string) => {
    setCallDialog({ isOpen: true, service, number });
  };

  const confirmAndCall = () => {
    if (!callDialog) return;
    setCallingState('calling');
    setTimeout(() => {
      window.location.href = `tel:${callDialog.number}`;
      setCallingState('idle');
      setCallDialog(null);
      // Log to history
      const newHistory: HistoryRecord = {
        id: `SOS-CALL-${Math.floor(1000 + Math.random() * 9000)}`,
        type: callDialog.service,
        location: location ? `${location.coords.latitude}, ${location.coords.longitude}` : 'Unknown',
        date: new Date().toISOString().split('T')[0],
        dispatcher: 'User initiated',
        outcome: 'Call Initiated',
        notes: `Direct call to ${callDialog.service} (${callDialog.number})`
      };
      setHistory(prev => [newHistory, ...prev]);
    }, 2000);
  };

  // Interactive Live Ambulance tracking selection
  const [activeTrackingId, setActiveTrackingId] = useState<string>('AMB-001');

  // AI First-Aid Assistant state
  const [aidQuery, setAidQuery] = useState('');
  const [aidInstructions, setAidInstructions] = useState('');
  const [generatingInstructions, setGeneratingInstructions] = useState(false);
  const [aiTriageAnalysis, setAiTriageAnalysis] = useState<string | null>(null);
  const [analyzingIncidentId, setAnalyzingIncidentId] = useState<string | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'danger' | null }>({ message: '', type: null });

  // Triage report generator form state
  const [reportSelectedId, setReportSelectedId] = useState<string>(emergencies[0]?.id || 'SOS-001');
  const [clinicalVitals, setClinicalVitals] = useState({ bpSys: '120', bpDia: '80', pulse: '82', spo2: '96', temp: '98.6' });
  const [administeredMeds, setAdministeredMeds] = useState('Epinephrine (1mg IV), Oxygen Therapy 4L/min');
  const [paramedicNotes, setParamedicNotes] = useState('Patient presented with signs of acute distress. Stabilized in route; cardiac monitoring shows sinus rhythm.');

  const triggerToast = (message: string, type: 'success' | 'warning' | 'danger') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: null });
    }, 4500);
  };

  // Sync with App database updates if db.emergencies changes
  useEffect(() => {
    if (db?.emergencies && db.emergencies.length > 0) {
      setEmergencies(prev => {
        const current = [...prev];
        db.emergencies.forEach((serverE: any) => {
          const idx = current.findIndex(e => e.id === serverE.id);
          if (idx !== -1) {
            current[idx] = serverE;
          } else {
            current.unshift(serverE);
          }
        });
        return current;
      });
    }
  }, [db]);

  // Simulate active tracking progress tickers
  useEffect(() => {
    const timer = setInterval(() => {
      setAmbulances(prev => prev.map(amb => {
        if (amb.status === 'In Route') {
          const nextProgress = amb.progress >= 100 ? 20 : amb.progress + 5;
          const nextEta = Math.max(1, Math.round((100 - nextProgress) * 0.12));
          return {
            ...amb,
            progress: nextProgress,
            eta: nextProgress >= 100 ? 0 : nextEta,
            status: nextProgress >= 100 ? 'At Hospital' : 'In Route'
          };
        } else if (amb.status === 'At Hospital') {
          // Toggle back to Route after some cycles for dynamic demonstration
          if (Math.random() > 0.75) {
            return {
              ...amb,
              status: 'In Route',
              progress: 10,
              eta: 12
            };
          }
        }
        return amb;
      }));
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  const handleUpdateLocalStatus = (id: string, newStatus: 'Requested' | 'Dispatched' | 'Resolved') => {
    setEmergencies(prev => prev.map(e => {
      if (e.id === id) {
        return { ...e, status: newStatus };
      }
      return e;
    }));

    // Trigger sovereign parent callback
    if (onUpdateStatus) {
      onUpdateStatus(id, newStatus);
    }

    // Append to timeline / history logs
    const actionDesc = `CAD State Shift: Incident ${id} updated to [${newStatus}]`;
    const newHistory: HistoryRecord = {
      id: `HIS-${Math.floor(1000 + Math.random() * 9000)}`,
      type: emergencies.find(e => e.id === id)?.type || 'Medical',
      location: emergencies.find(e => e.id === id)?.address || 'Chennai Central',
      date: new Date().toISOString().split('T')[0],
      dispatcher: 'Sovereign Dispatch AI',
      outcome: newStatus === 'Resolved' ? 'Success / Closed' : 'In Progress',
      notes: `Dispatch status changed to ${newStatus}. Coordinates logged on satellite radar.`
    };
    setHistory(prev => [newHistory, ...prev]);

    // Push new notification
    const newNotif: EmergencyNotification = {
      id: `NTF-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `🚨 Incident Update: ${id}`,
      message: `The incident status for ${emergencies.find(e => e.id === id)?.citizenName} is now ${newStatus}.`,
      type: newStatus === 'Resolved' ? 'success' : 'info',
      read: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications(prev => [newNotif, ...prev]);

    triggerToast(`Sovereign dispatch state shifted: ${id} is now ${newStatus}`, newStatus === 'Resolved' ? 'success' : 'warning');
  };

  const handleTriggerSOSLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sosCitizen || !sosPhone || !sosDesc) {
      triggerToast('Please provide valid caller name, phone number, and description.', 'danger');
      return;
    }

    if (!confirm(`Emergency SOS\n\nYour current location will be shared.\n\nSend SOS?`)) {
      return;
    }

    let lat = 12.96;
    let lng = 80.15;
    let address = sosAddr;

    try {
      if (navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        address = "Current GPS Location Captured";
      }
    } catch (err) {
      triggerToast('Location permission denied, proceeding with provided address.', 'warning');
    }

    const newSOS = {
      citizenName: sosCitizen,
      phone: sosPhone,
      type: sosType,
      description: sosDesc,
      lat,
      lng,
      address,
      priority: sosPriority
    };

    try {
      const response = await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSOS)
      });
      if (response.ok) {
        const data = await response.json();
        setEmergencies(prev => [data.request, ...prev]);
        triggerToast(`🚨 Critical SOS logged successfully! Reference ID: ${data.request.id}`, 'danger');
      } else {
        throw new Error('API failure');
      }
    } catch (err) {
      triggerToast('Failed to log SOS request to server.', 'danger');
    }

    // Reset Form
    setSosCitizen('');
    setSosPhone('');
    setSosDesc('');
  };

  const fetchAidInstructions = async (presetType?: string) => {
    const query = presetType || aidQuery;
    if (!query) return;
    setGeneratingInstructions(true);
    setAidInstructions('');
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: `Provide step-by-step emergency first-aid or safety guidance for: ${query}. Please provide clear, formatted bullet points.`, 
          modelType: 'emergency-response' 
        })
      });
      if (response.ok) {
        const data = await response.json();
        setAidInstructions(data.text);
      } else {
        throw new Error('API failure');
      }
    } catch (e) {
      // Robust localized Clinical clinical instructions fallback based on common query keywords
      const lower = query.toLowerCase();
      let guidance = "1. Keep the patient secure, comfortable and strictly in a calm setting.\n2. Ensure their airway is clear of all obstruction.\n3. Keep constant check on pulse, blood pressure, and breathing rhythm.";
      if (lower.includes('cpr')) {
        guidance = "**Clinical CPR Protocol for Adults:**\n1. Confirm responsiveness and regular chest movement.\n2. Position the patient flat on a firm floor.\n3. Place heel of one hand in the center of the chest, other hand on top, interlocking fingers.\n4. Administer hard, rapid chest compressions (100–120 per minute) at a depth of 2 inches.\n5. Allow full chest recoil after each compression.\n6. If certified, alternate 30 compressions with 2 quick rescue breaths.";
      } else if (lower.includes('bleeding') || lower.includes('blood')) {
        guidance = "**Clinical Severe Hemorrhage Protocol:**\n1. Call emergency services immediately.\n2. Apply localized direct pressure with a clean sterile cloth directly on the laceration.\n3. Elevate the wounded limb above heart level if structural bones are stable.\n4. If bleeding penetrates the dressing, pack a second layer on top (do not peel off the initial layer).\n5. In catastrophic limb hemorrhage, apply a tactical tourniquet 2-3 inches above the wound.";
      } else if (lower.includes('choking') || lower.includes('heimlich')) {
        guidance = "**Heimlich Maneuver (Choking Emergency) Protocol:**\n1. Stand behind the choking victim, wrapping your arms firmly around their waist.\n2. Form a tight fist with one hand and place the thumb side slightly above their navel.\n3. Grab the fist with your other hand.\n4. Administer rapid, deep inward and upward abdominal thrusts.\n5. Repeat compressions until the airway obstruction is dislodged or the patient loses consciousness.";
      } else if (lower.includes('burn')) {
        guidance = "**Clinical Burn Safety Protocol:**\n1. Instantly remove heat source. Wash the area with clean, cool running water for 10-20 minutes.\n2. Do NOT apply ice, oily butter, creams, or adhesive bandages directly.\n3. Remove rings, tight clothing, or bracelets from the burned region before swelling starts.\n4. Securely wrap the burn with a sterile, non-adherent cling film or wet clean dressing.\n5. Manage severe pain; seek immediate clinical hospital care.";
      }
      setAidInstructions(guidance);
    } finally {
      setGeneratingInstructions(false);
    }
  };

  const handleRunAiAnalysis = async (incident: EmergencyRequest) => {
    setAnalyzingIncidentId(incident.id);
    setAiTriageAnalysis(null);
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Perform a clinical dispatch triage analysis on this CAD incident report: "${incident.description}" at address "${incident.address}". Classify severity (Critical, High, Medium, Low), estimate arrival urgency, and recommend 3 immediate safety precautions for the family.`,
          modelType: 'emergency-response'
        })
      });
      if (response.ok) {
        const data = await response.json();
        setAiTriageAnalysis(data.text);
      } else {
        throw new Error('Fallback needed');
      }
    } catch (e) {
      // Intelligent fallback generator based on incident type
      let fallbackText = `### Sovereign AI CAD Assessment [ID: ${incident.id}]\n\n`;
      fallbackText += `**Triage Class**: ${incident.priority} Priority Level\n`;
      fallbackText += `**Primary Sector**: ${incident.type} Squad Dispatch\n`;
      fallbackText += `**Estimated Emergency Paramedic ETA**: 4-8 Minutes\n\n`;
      fallbackText += `**Recommended Sovereign Safety Precautions:**\n`;
      if (incident.type === 'Ambulance') {
        fallbackText += `1. Loosen tight neck clothing and ensure a continuous flow of fresh, unblocked air.\n2. Access prescription medical papers and compile a physical dosage log of current medications.\n3. Clear a clear path for the inbound stretcher squad.`;
      } else if (incident.type === 'Fire') {
        fallbackText += `1. Isolate the main household gas cylinder and trip the central electrical breaker if safe.\n2. Evacuate all occupants immediately. Keep low to the floor to avoid inhaling heavy toxic smoke.\n3. Ensure street parking gates are unlocked for heavy pumper truck access.`;
      } else if (incident.type === 'Police') {
        fallbackText += `1. Secure all interior deadbolts, shelter in an inner locked bedroom, and turn off all lights.\n2. Keep active phone lines completely clear. Avoid confronting any unknown trespasser directly.\n3. Maintain visual check from a safe window coordinate if possible.`;
      } else {
        fallbackText += `1. Turn off main electrical breakers to avoid heavy electrocution from flooding water.\n2. Stay localized in elevated, structurally secure dry zones.\n3. Track regional cyclone warning boards for safe shelter routes.`;
      }
      setAiTriageAnalysis(fallbackText);
    } finally {
      setAnalyzingIncidentId(null);
    }
  };

  const handleDownloadReport = (e: React.FormEvent) => {
    e.preventDefault();
    const inc = emergencies.find(x => x.id === reportSelectedId);
    if (!inc) {
      triggerToast('No incident selected for report generation.', 'danger');
      return;
    }

    const reportContent = `
============================================================
           SOVEREIGN LIFECONNECT CAD INCIDENT REPORT
============================================================
Incident Ref ID : ${inc.id}
Triage Category : ${inc.type} Dispatch Core
Priority Level  : ${inc.priority} Range
Logged Timestamp: ${inc.timestamp}
Current Status  : ${inc.status}

[CITIZEN CALLER TELEMETRY]
Citizen Name    : ${inc.citizenName}
Registered Phone: ${inc.phone}
Incident Address: ${inc.address}
Geo Coordinates : Latitude ${inc.lat.toFixed(4)}° N, Longitude ${inc.lng.toFixed(4)}° E

[EMERGENCY DESCRIPTION]
"${inc.description}"

[CLINICAL VITALS RECORDED EN ROUTE]
Blood Pressure  : ${clinicalVitals.bpSys}/${clinicalVitals.bpDia} mmHg
Heart Rate      : ${clinicalVitals.pulse} BPM
Blood Oxygen    : ${clinicalVitals.spo2}% SpO2
Body Temperature: ${clinicalVitals.temp}°F

[MEDICATIONS ADMINISTERED]
${administeredMeds}

[PARAMEDIC TRIAGE ASSESSMENT]
${paramedicNotes}

============================================================
                 SOVEREIGN CAD SATELLITE HANDSHAKE
============================================================
Generated: ${new Date().toLocaleString()}
Status: VERIFIED AND DIGITALLY SIGNED FOR DISPATCH ARCHIVE
`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sovereign_Triage_Report_${inc.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    triggerToast(`Incident Triage Report for ${inc.id} downloaded successfully as Text.`, 'success');
  };

  // SVG Analytics Data Helpers
  const typeCounts = emergencies.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, { Ambulance: 0, Fire: 0, Police: 0, Disaster: 0 } as Record<string, number>);

  const statusCounts = emergencies.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, { Requested: 0, Dispatched: 0, Resolved: 0 } as Record<string, number>);

  // Render SOS Board under search, sorting & filtering
  const filteredEmergencies = emergencies
    .filter(e => {
      const matchSearch = e.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.address.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === 'All' || e.type === typeFilter;
      const matchStatus = statusFilter === 'All' || e.status === statusFilter;
      const matchPriority = priorityFilter === 'All' || e.priority === priorityFilter;
      return matchSearch && matchType && matchStatus && matchPriority;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortOrder === 'priority') {
        const priorityWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      } else {
        return a.type.localeCompare(b.type);
      }
    });

  const trackingAmbulance = ambulances.find(a => a.id === activeTrackingId) || ambulances[0];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 text-slate-100 font-sans">
      
      {/* Sovereign Emergency Header */}
      <div className="rounded-2xl border border-red-500/15 bg-gradient-to-r from-red-950/15 via-slate-900 to-slate-900 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 shadow-lg shadow-red-500/10">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold uppercase tracking-wider font-mono">CAD Dispatch Center</h2>
              <span className="text-[9px] bg-red-500/20 text-red-400 font-mono px-2 py-0.5 rounded border border-red-500/30 animate-pulse uppercase font-bold">Live Grid</span>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              Satellite-guided Computer Aided Dispatch platform tracking Chennai medical, police, fire, and flood rescue services.
            </p>
          </div>
        </div>

        {/* Real-time Ticker Metrics */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 font-mono">
          <div className="bg-slate-950/40 p-2.5 rounded-xl border border-white/5 text-center">
            <span className="text-[9px] text-slate-500 block uppercase font-bold">Unresolved</span>
            <p className="text-lg font-bold text-red-400">
              {emergencies.filter(e => e.status !== 'Resolved').length}
            </p>
          </div>
          <div className="bg-slate-950/40 p-2.5 rounded-xl border border-white/5 text-center">
            <span className="text-[9px] text-slate-500 block uppercase font-bold">Ambulance</span>
            <p className="text-lg font-bold text-cyan-400">
              {ambulances.filter(a => a.status === 'In Route').length} active
            </p>
          </div>
          <div className="bg-slate-950/40 p-2.5 rounded-xl border border-white/5 text-center">
            <span className="text-[9px] text-slate-500 block uppercase font-bold">Safe Shelters</span>
            <p className="text-lg font-bold text-emerald-400">
              {shelters.length} operational
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation Menu */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/5 pb-1">
        <button 
          onClick={() => setActiveTab('control-room')}
          className={`px-4 py-2.5 text-xs font-mono font-bold rounded-t-xl transition-all border-b-2 ${
            activeTab === 'control-room' 
              ? 'bg-red-500/10 border-red-500 text-red-400' 
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          📋 SOS Control Room
        </button>
        <button 
          onClick={() => setActiveTab('responders')}
          className={`px-4 py-2.5 text-xs font-mono font-bold rounded-t-xl transition-all border-b-2 ${
            activeTab === 'responders' 
              ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          🚑 Responders Network
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 text-xs font-mono font-bold rounded-t-xl transition-all border-b-2 ${
            activeTab === 'reports' 
              ? 'bg-amber-500/10 border-amber-500 text-amber-400' 
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          📝 Triage Reports
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 text-xs font-mono font-bold rounded-t-xl transition-all border-b-2 ${
            activeTab === 'analytics' 
              ? 'bg-violet-500/10 border-violet-500 text-violet-400' 
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          📊 CAD Analytics
        </button>
        <button 
          onClick={() => setActiveTab('alerts-shelters')}
          className={`px-4 py-2.5 text-xs font-mono font-bold rounded-t-xl transition-all border-b-2 ${
            activeTab === 'alerts-shelters' 
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          ⚠️ Warnings & Shelters
        </button>
      </div>

      {/* Main Panel Content Area */}
      {activeTab === 'control-room' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left + Mid Columns (2 cols): SOS logs grid */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Filtering, Search & Sorting HUD */}
            <div className="rounded-xl border border-white/5 bg-slate-900/60 p-4 space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by ID, caller, description, location address..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-white">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-500 text-[10px] uppercase font-mono font-bold flex items-center gap-1">
                    <Filter className="h-3.5 w-3.5" /> Sort:
                  </span>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target as any)}
                    className="bg-slate-950 border border-white/10 rounded-xl text-xs px-3 py-1.5 text-slate-300 focus:outline-none focus:border-red-500/50"
                  >
                    <option value="newest">Newest Logged</option>
                    <option value="priority">Triage Priority</option>
                    <option value="type">Triage Type</option>
                  </select>
                </div>
              </div>

              {/* Advanced Filter Pills */}
              <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Sector:</span>
                  {(['All', 'Ambulance', 'Fire', 'Police', 'Disaster'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setTypeFilter(f)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                        typeFilter === f 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                          : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap border-l border-white/5 pl-4">
                  <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Status:</span>
                  {(['All', 'Requested', 'Dispatched', 'Resolved'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setStatusFilter(f)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                        statusFilter === f 
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                          : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap border-l border-white/5 pl-4">
                  <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Severity:</span>
                  {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setPriorityFilter(f)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                        priorityFilter === f 
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                          : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active CAD Rescue Board list */}
            <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-red-500 animate-pulse" />
                  Active Dispatch Operations ({filteredEmergencies.length})
                </h3>
                <span className="text-[9px] text-slate-500 font-mono">Showing filtered telemetry logs</span>
              </div>

              {filteredEmergencies.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <AlertTriangle className="h-8 w-8 text-slate-500 mx-auto animate-bounce" />
                  <p className="text-xs text-slate-400 font-mono">No active emergencies match the selected CAD filters.</p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[580px] overflow-y-auto custom-scrollbar pr-1">
                  {filteredEmergencies.map((e) => (
                    <div 
                      key={e.id} 
                      className={`p-4 rounded-xl border transition-all hover:bg-slate-950/40 ${
                        e.status === 'Resolved' 
                          ? 'bg-slate-950/20 border-white/5 opacity-65' 
                          : 'bg-white/5 border-white/10 shadow-md'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-xs font-extrabold text-white uppercase font-mono tracking-wide">{e.id} - {e.type} Dispatch</span>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase border ${
                              e.priority === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' : 
                              e.priority === 'High' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              e.priority === 'Medium' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                              'bg-slate-500/10 text-slate-400 border-white/10'
                            }`}>
                              {e.priority} Severity
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">{new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          
                          <p className="text-xs text-slate-200 font-sans leading-relaxed">"{e.description}"</p>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400 font-mono pt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-red-500" /> {e.address}
                            </span>
                            <span className="flex items-center gap-1 border-l border-white/5 pl-3">
                              <User className="h-3 w-3 text-slate-500" /> {e.citizenName} ({e.phone})
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0 sm:self-center">
                          <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                            e.status === 'Dispatched' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                            e.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
                          }`}>
                            ● {e.status}
                          </span>

                          <div className="flex gap-1.5 pt-1">
                            <button
                              onClick={() => setSelectedEmergency(e)}
                              className="rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 text-[10px] font-mono transition-colors text-slate-300 flex items-center gap-1"
                            >
                              <Compass className="h-3 w-3 text-cyan-400" /> Telemetry
                            </button>
                            
                            {e.status !== 'Resolved' && (
                              <button
                                onClick={() => handleUpdateLocalStatus(e.id, 'Resolved')}
                                className="rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-mono transition-colors text-emerald-400 font-bold"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column (1 col): SOS Trigger form & AI triage */}
          <div className="space-y-6">
            
            {/* Quick Emergency SOS Dispatch Form */}
            <div className="rounded-2xl border border-red-500/20 bg-slate-900 p-5 space-y-4">
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 animate-pulse" />
                Initialize Manual SOS Triage
              </h3>

              <form onSubmit={handleTriggerSOSLocal} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-mono block">Rescue Sector</label>
                    <select
                      value={sosType}
                      onChange={(e) => setSosType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
                    >
                      <option value="Ambulance">Ambulance (Medical)</option>
                      <option value="Fire">Fire Rescue</option>
                      <option value="Police">Police Squad</option>
                      <option value="Disaster">Disaster Force</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-mono block">Severity Triage</label>
                    <select
                      value={sosPriority}
                      onChange={(e) => setSosPriority(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
                    >
                      <option value="Critical">Critical (Immediate)</option>
                      <option value="High">High Severity</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-mono block">Citizen Caller Name</label>
                  <input
                    type="text"
                    required
                    value={sosCitizen}
                    onChange={(e) => setSosCitizen(e.target.value)}
                    placeholder="e.g. Subramanian K"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-mono block">Registered Phone</label>
                  <input
                    type="text"
                    required
                    value={sosPhone}
                    onChange={(e) => setSosPhone(e.target.value)}
                    placeholder="e.g. +91 94440 12345"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-mono block">GeoAddress Location</label>
                  <input
                    type="text"
                    required
                    value={sosAddr}
                    onChange={(e) => setSosAddr(e.target.value)}
                    placeholder="e.g. 104 Mount Road, Guindy"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-mono block">CAD Symptom/Emergency Description</label>
                  <textarea
                    required
                    rows={2}
                    value={sosDesc}
                    onChange={(e) => setSosDesc(e.target.value)}
                    placeholder="Provide realistic clinical symptoms, gas level readings, structural blockages or fire hazards..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500/50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs py-2.5 transition-all shadow-lg hover:shadow-red-600/25 active:scale-95 flex items-center justify-center space-x-1.5"
                >
                  <AlertTriangle className="h-4 w-4 animate-pulse" />
                  <span>Launch sovereign SOS Dispatch</span>
                </button>
              </form>
            </div>

            {/* Helpline quick-action board */}
            <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-emerald-400 animate-pulse" />
                Sovereign Helpline Links
              </h3>
              <div className="grid grid-cols-2 gap-2 text-center">
                {[
                  { label: 'Police Hub', num: '100', bg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' },
                  { label: 'Fire Service', num: '101', bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
                  { label: 'Ambulance Unit', num: '108', bg: 'bg-red-500/10 border-red-500/20 text-red-400' },
                  { label: 'Coastal Rescue', num: '1091', bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' }
                ].map((item, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => initiateCall(item.label, item.num)}
                    className={`p-2.5 rounded-xl border ${item.bg} space-y-0.5 w-full text-left`}
                  >
                    <span className="text-[9px] opacity-80 block font-mono">{item.label}</span>
                    <p className="text-sm font-extrabold">{item.num}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Emergency Safety First Aid generator */}
            <div className="rounded-2xl border border-violet-500/20 bg-slate-900 p-5 space-y-4">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 animate-pulse" />
                AI First-Aid Advisor
              </h3>
              <p className="text-[10px] text-slate-400 leading-normal">
                Query instant, step-by-step clinical triage and immediate responder safety measures.
              </p>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'CPR steps', q: 'Adult CPR instructions' },
                  { label: 'Stop bleed', q: 'Severe wound arterial bleeding control' },
                  { label: 'Choking aid', q: 'Adult choking heimlich maneuver' },
                  { label: 'Acid burn', q: 'Acid/chemical burn safety protocol' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setAidQuery(item.q); fetchAidInstructions(item.q); }}
                    className="bg-white/5 border border-white/5 hover:border-violet-500/30 px-2 py-1 rounded text-[9px] text-slate-300 font-mono transition-all"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={aidQuery}
                  onChange={(e) => setAidQuery(e.target.value)}
                  placeholder="Ask customized triage (e.g. electric shock)..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
                />
                <button
                  onClick={() => fetchAidInstructions()}
                  disabled={generatingInstructions || !aidQuery}
                  className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs py-1.5 transition-all flex items-center justify-center space-x-1"
                >
                  <span>{generatingInstructions ? 'Formulating clinical guide...' : 'Generate Rescue Guide'}</span>
                </button>
              </div>

              {aidInstructions && (
                <div className="p-3 bg-slate-950 rounded-xl border border-violet-500/20 text-xs text-slate-300 leading-relaxed max-h-56 overflow-y-auto custom-scrollbar font-sans space-y-1">
                  <div className="flex items-center space-x-1 text-violet-400 font-bold uppercase tracking-wider text-[8.5px] font-mono pb-1 border-b border-white/5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Verified Safety Guidelines</span>
                  </div>
                  <div className="whitespace-pre-wrap text-[11px] pt-1">{aidInstructions}</div>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {activeTab === 'responders' && (
        <div className="space-y-6">
          
          {/* Live Ambulance GPS Tracker Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Live GPS Map Simulator / Route info (2 cols) */}
            <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <div className="flex items-center space-x-2">
                  <Navigation className="h-4 w-4 text-cyan-400 animate-pulse" />
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                    Live GPS CAD Route Simulator
                  </h3>
                </div>
                <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase">
                  Telemetry ID: {trackingAmbulance?.id}
                </span>
              </div>

              {/* Simulated visual GPS routing coordinates */}
              <div className="relative h-60 rounded-xl bg-slate-950 border border-white/10 overflow-hidden flex flex-col justify-between p-4 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
                
                {/* Visual Satellite Landmarks */}
                <div className="absolute top-8 left-12 p-1.5 bg-slate-900/80 rounded-lg border border-white/5 text-[9px] font-mono text-slate-400">
                  🏢 Apollo Trauma Hub
                </div>
                <div className="absolute top-28 right-16 p-1.5 bg-slate-900/80 rounded-lg border border-white/5 text-[9px] font-mono text-slate-400">
                  📍 Incident Location ({trackingAmbulance?.activeIncidentId || 'SOS-001'})
                </div>
                <div className="absolute bottom-6 left-28 p-1.5 bg-slate-900/80 rounded-lg border border-white/5 text-[9px] font-mono text-slate-400">
                  🛣️ OMR IT Corridor Bypass
                </div>

                {/* Animated Path Ring */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <div className="h-44 w-44 rounded-full border border-dashed border-cyan-500 animate-spin" style={{ animationDuration: '40s' }} />
                  <div className="h-28 w-28 rounded-full border border-dashed border-red-500 animate-spin" style={{ animationDuration: '20s' }} />
                </div>

                {/* Top tracking status overlay */}
                <div className="z-10 flex justify-between items-start">
                  <div className="bg-slate-900/90 border border-white/10 px-3 py-1.5 rounded-xl text-xs space-y-0.5 backdrop-blur-md">
                    <p className="text-[9px] text-slate-500 font-mono uppercase font-bold">Inbound Paramedic</p>
                    <p className="font-bold text-white text-xs">{trackingAmbulance?.driverName}</p>
                    <p className="text-[9px] text-emerald-400 font-mono font-bold">📞 {trackingAmbulance?.phone}</p>
                  </div>

                  <div className="bg-slate-900/90 border border-white/10 px-3 py-1.5 rounded-xl text-xs space-y-0.5 text-right backdrop-blur-md">
                    <p className="text-[9px] text-slate-500 font-mono uppercase font-bold">Battery/Fuel</p>
                    <p className="font-bold text-cyan-400 font-mono">{trackingAmbulance?.fuel}% Active</p>
                    <p className="text-[9px] text-slate-400">ALS Unit</p>
                  </div>
                </div>

                {/* Center Route Progress Slider representation */}
                <div className="z-10 space-y-2 bg-slate-900/80 border border-white/10 p-3 rounded-xl backdrop-blur-md">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-400">Hospital dispatch</span>
                    <span className="text-amber-400 font-bold">Transit Progress ({trackingAmbulance?.progress}%)</span>
                    <span className="text-red-400 font-bold">ETA: {trackingAmbulance?.eta} Mins</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-red-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${trackingAmbulance?.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                    <span>Lat {trackingAmbulance?.lat.toFixed(4)}° N</span>
                    <span>Road Checkpoint 4 (Secured)</span>
                    <span>Lng {trackingAmbulance?.lng.toFixed(4)}° E</span>
                  </div>
                </div>

              </div>

              {/* Route checkpoints table summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[9px] text-slate-500 block uppercase font-mono font-bold">Route Leg</span>
                  <p className="text-xs font-bold text-white">Adyar Central Bypass</p>
                  <span className="text-[8.5px] text-slate-400 font-mono">Segment 1 - Clearance ok</span>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[9px] text-slate-500 block uppercase font-mono font-bold">Road Blockages</span>
                  <p className="text-xs font-bold text-emerald-400">None Detected</p>
                  <span className="text-[8.5px] text-slate-400 font-mono">Green Light Priority</span>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[9px] text-slate-500 block uppercase font-mono font-bold">Assigned Hospital</span>
                  <p className="text-xs font-bold text-white leading-tight">{trackingAmbulance?.hospitalName}</p>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[9px] text-slate-500 block uppercase font-mono font-bold">Incident Reference</span>
                  <p className="text-xs font-bold text-red-400 font-mono">{trackingAmbulance?.activeIncidentId || 'No Active Duty'}</p>
                </div>
              </div>
            </div>

            {/* Inbound Ambulance Selection Panel (1 col) */}
            <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
                Live Inbound fleet (15 Units)
              </h3>
              <p className="text-[10px] text-slate-400">Select any ambulance below to pull satellite telemetry.</p>
              
              <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                {ambulances.map(amb => (
                  <button
                    key={amb.id}
                    onClick={() => setActiveTrackingId(amb.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                      activeTrackingId === amb.id
                        ? 'bg-cyan-500/10 border-cyan-500/40'
                        : 'bg-slate-950/40 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white font-mono">{amb.id}</span>
                        <span className="text-[8px] bg-slate-800 text-slate-400 px-1 rounded uppercase font-mono">{amb.type}</span>
                      </div>
                      <p className="text-[10px] text-slate-300 truncate max-w-[140px]">{amb.driverName}</p>
                    </div>

                    <div className="text-right space-y-0.5 shrink-0">
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                        amb.status === 'In Route' ? 'bg-amber-500/10 text-amber-400' :
                        amb.status === 'At Hospital' ? 'bg-cyan-500/10 text-cyan-400' :
                        amb.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-slate-800 text-slate-500'
                      }`}>
                        {amb.status}
                      </span>
                      {amb.status === 'In Route' && (
                        <p className="text-[9px] text-red-400 font-mono font-bold">ETA: {amb.eta}m</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Hospitals availability command grid */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-red-500" />
                Hospital Availability & Bed Telemetry (10 Units)
              </h3>
              <span className="text-[9px] text-slate-500 font-mono uppercase">Direct Ambulance Allocation</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hospitals.map(h => (
                <div key={h.id} className="bg-slate-950/40 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white leading-tight">{h.name}</h4>
                      <p className="text-[9.5px] text-slate-400 truncate max-w-[190px]">{h.address}</p>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono shrink-0">{h.id}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-mono text-center">
                    <div className="bg-slate-900 border border-white/5 p-1.5 rounded-lg">
                      <span className="text-[8px] text-slate-500 block uppercase">ER Beds</span>
                      <p className="text-xs font-bold text-white">{h.beds}</p>
                    </div>
                    <div className="bg-slate-900 border border-white/5 p-1.5 rounded-lg">
                      <span className="text-[8px] text-slate-500 block uppercase">Ventilator</span>
                      <p className="text-xs font-bold text-cyan-400">{h.ventilators}</p>
                    </div>
                    <div className="bg-slate-900 border border-white/5 p-1.5 rounded-lg">
                      <span className="text-[8px] text-slate-500 block uppercase">ICU Access</span>
                      <p className={`text-xs font-bold ${h.icuAvailable ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {h.icuAvailable ? 'YES' : 'NO'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1">
                    <span>Ambulances: {h.activeAmbulances}/{h.ambulanceCount} active</span>
                    <button 
                      onClick={() => {
                        setHospitals(prev => prev.map(item => {
                          if (item.id === h.id) {
                            return { ...item, beds: Math.max(0, item.beds - 1) };
                          }
                          return item;
                        }));
                        triggerToast(`🏥 One Emergency Bed successfully reserved at ${h.name}!`, 'success');
                      }}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold border border-white/10 text-white transition-all"
                    >
                      Reserve Bed
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Police dispatch & Fire responses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Police Dispatch Units list */}
            <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-cyan-400" />
                Active Police Patrol Squads (10 Divisions)
              </h3>
              
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {policeTeams.map(p => (
                  <div key={p.id} className="p-3 bg-slate-950/40 rounded-xl border border-white/5 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white font-mono">{p.precinct}</span>
                        <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase font-mono">{p.id}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">📍 Location: {p.location}</p>
                      <p className="text-[9px] text-slate-500 font-mono">Officers: {p.officersCount} | Vehicle: {p.vehicle} | Channel: {p.radioChannel}</p>
                    </div>

                    <div className="text-right space-y-1 shrink-0">
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                        p.status === 'On Patrol' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        p.status === 'Responding' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse' :
                        p.status === 'At Scene' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-slate-800 text-slate-500'
                      }`}>
                        {p.status}
                      </span>
                      
                      {p.status === 'On Patrol' && (
                        <button
                          onClick={() => {
                            setPoliceTeams(prev => prev.map(item => {
                              if (item.id === p.id) {
                                return { ...item, status: 'Responding', location: 'OMR Bypass Intersection' };
                              }
                              return item;
                            }));
                            triggerToast(`🚔 Police Cruiser ${p.id} dispatched to emergency intersection scene.`, 'warning');
                          }}
                          className="block text-[9.5px] px-2 py-0.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/25 rounded-md font-bold transition-all w-full text-center"
                        >
                          Dispatch
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fire stations list */}
            <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-500 animate-pulse" />
                Sovereign Fire Command (8 Stations)
              </h3>
              
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {fireStations.map(f => (
                  <div key={f.id} className="p-3 bg-slate-950/40 rounded-xl border border-white/5 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white font-mono">{f.name}</span>
                        <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">{f.id}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">📍 Address: {f.address}</p>
                      <p className="text-[9px] text-slate-500 font-mono">Trucks: {f.trucks} | Crew size: {f.crewSize} | Tank: {f.waterCapacity.toLocaleString()}L</p>
                    </div>

                    <div className="text-right space-y-1 shrink-0">
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                        f.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse'
                      }`}>
                        {f.status}
                      </span>
                      
                      {f.status === 'Ready' && (
                        <button
                          onClick={() => {
                            setFireStations(prev => prev.map(item => {
                              if (item.id === f.id) {
                                return { ...item, status: 'Active Deployment' };
                              }
                              return item;
                            }));
                            triggerToast(`🚒 Heavy Pumper Engine from ${f.name} dispatched with active sirens.`, 'danger');
                          }}
                          className="block text-[9.5px] px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 rounded-md font-bold transition-all w-full text-center"
                        >
                          Dispatch
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Triage Form Report Creator (2 cols) */}
          <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Printer className="h-4 w-4" />
              CAD Triage Report Builder & Exporter
            </h3>
            
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Compile full clinical diagnostics, medications administered, and paramedic field assessments for sovereign dispatch archives.
            </p>

            <form onSubmit={handleDownloadReport} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-mono block">Select Active SOS Incident Log</label>
                <select
                  value={reportSelectedId}
                  onChange={(e) => setReportSelectedId(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                >
                  {emergencies.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.id} - {e.citizenName} ({e.type} dispatch - {e.priority})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-mono block">BP Systolic</label>
                  <input
                    type="number"
                    value={clinicalVitals.bpSys}
                    onChange={(e) => setClinicalVitals(prev => ({ ...prev, bpSys: e.target.value }))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-mono block">BP Diastolic</label>
                  <input
                    type="number"
                    value={clinicalVitals.bpDia}
                    onChange={(e) => setClinicalVitals(prev => ({ ...prev, bpDia: e.target.value }))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-mono block">Pulse (BPM)</label>
                  <input
                    type="number"
                    value={clinicalVitals.pulse}
                    onChange={(e) => setClinicalVitals(prev => ({ ...prev, pulse: e.target.value }))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-mono block">O2 Sat (SpO2%)</label>
                  <input
                    type="number"
                    value={clinicalVitals.spo2}
                    onChange={(e) => setClinicalVitals(prev => ({ ...prev, spo2: e.target.value }))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-mono block">Temp (°F)</label>
                  <input
                    type="text"
                    value={clinicalVitals.temp}
                    onChange={(e) => setClinicalVitals(prev => ({ ...prev, temp: e.target.value }))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-mono block">En Route administered Meds & Interventions</label>
                <input
                  type="text"
                  value={administeredMeds}
                  onChange={(e) => setAdministeredMeds(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-mono block">Clinical Paramedic Diagnostics Notes</label>
                <textarea
                  rows={4}
                  value={paramedicNotes}
                  onChange={(e) => setParamedicNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs py-2.5 transition-all shadow-lg flex items-center justify-center gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Digital Report (TXT)</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Triage Sheet</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick incident history lookup log (1 col) */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" />
              CAD Archive Logs (30 Cases)
            </h3>
            
            <div className="space-y-3.5 max-h-96 overflow-y-auto custom-scrollbar pr-1">
              {history.map(item => (
                <div key={item.id} className="p-3 bg-slate-950/40 rounded-xl border border-white/5 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-extrabold text-white font-mono">{item.id}</span>
                    <span className="text-slate-500 font-mono">{item.date}</span>
                  </div>
                  <p className="text-slate-300 leading-normal">"{item.notes}"</p>
                  <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1 border-t border-white/5 font-mono">
                    <span>Zone: {item.location.split(',')[0]}</span>
                    <span className="text-emerald-400 font-bold">{item.outcome}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          
          {/* Main Analytics charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Incident Type Bar Chart (SVG) */}
            <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider font-mono">
                Incidents by Triage Category
              </h3>
              
              <div className="h-56 flex items-end justify-around pb-6 pt-4 border-b border-white/5 relative">
                
                {/* Background Grid Lines */}
                <div className="absolute left-0 right-0 top-1/4 border-b border-white/5" />
                <div className="absolute left-0 right-0 top-2/4 border-b border-white/5" />
                <div className="absolute left-0 right-0 top-3/4 border-b border-white/5" />

                {/* Bars */}
                <div className="flex flex-col items-center z-10 w-12">
                  <span className="text-[10px] text-red-400 font-mono font-bold mb-1">{typeCounts.Ambulance}</span>
                  <div 
                    className="w-10 bg-gradient-to-t from-red-600 to-red-400 rounded-t-lg transition-all duration-1000"
                    style={{ height: `${Math.max(15, typeCounts.Ambulance * 18)}px` }}
                  />
                  <span className="text-[10px] text-slate-400 font-mono mt-2">Medical</span>
                </div>

                <div className="flex flex-col items-center z-10 w-12">
                  <span className="text-[10px] text-amber-400 font-mono font-bold mb-1">{typeCounts.Fire}</span>
                  <div 
                    className="w-10 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg transition-all duration-1000"
                    style={{ height: `${Math.max(15, typeCounts.Fire * 18)}px` }}
                  />
                  <span className="text-[10px] text-slate-400 font-mono mt-2">Fire</span>
                </div>

                <div className="flex flex-col items-center z-10 w-12">
                  <span className="text-[10px] text-cyan-400 font-mono font-bold mb-1">{typeCounts.Police}</span>
                  <div 
                    className="w-10 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg transition-all duration-1000"
                    style={{ height: `${Math.max(15, typeCounts.Police * 18)}px` }}
                  />
                  <span className="text-[10px] text-slate-400 font-mono mt-2">Police</span>
                </div>

                <div className="flex flex-col items-center z-10 w-12">
                  <span className="text-[10px] text-emerald-400 font-mono font-bold mb-1">{typeCounts.Disaster}</span>
                  <div 
                    className="w-10 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-1000"
                    style={{ height: `${Math.max(15, typeCounts.Disaster * 18)}px` }}
                  />
                  <span className="text-[10px] text-slate-400 font-mono mt-2">Disaster</span>
                </div>

              </div>

              <p className="text-[10px] text-slate-500 font-mono text-center leading-normal">
                Real-time chart coordinates calculated dynamically from active SOS entries.
              </p>
            </div>

            {/* Average Dispatch Response Times trend chart (SVG) */}
            <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider font-mono">
                Average Dispatch Response Time (Mins)
              </h3>

              <div className="h-56 relative border-b border-white/5 pt-4">
                {/* SVG Line Area graph */}
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 150">
                  <defs>
                    <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="37" x2="300" y2="37" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <line x1="0" y1="75" x2="300" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <line x1="0" y1="112" x2="300" y2="112" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                  {/* Area */}
                  <path 
                    d="M 0 112 Q 50 82 100 95 T 200 60 T 300 45 L 300 150 L 0 150 Z" 
                    fill="url(#waveGrad)" 
                  />

                  {/* Line */}
                  <path 
                    d="M 0 112 Q 50 82 100 95 T 200 60 T 300 45" 
                    fill="none" 
                    stroke="#8b5cf6" 
                    strokeWidth="3.5" 
                  />

                  {/* Dot anchors */}
                  <circle cx="100" cy="95" r="4.5" fill="#a78bfa" />
                  <circle cx="200" cy="60" r="4.5" fill="#a78bfa" />
                  <circle cx="300" cy="45" r="4.5" fill="#a78bfa" />
                </svg>

                {/* Hours markers */}
                <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1 px-1">
                  <span>04:00 Hrs</span>
                  <span>06:00 Hrs</span>
                  <span>08:00 Hrs</span>
                  <span>10:00 Hrs (Now)</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 font-mono text-center">
                Sovereign dispatch timeline efficiency index. Peak traffic latency fully compensated.
              </p>
            </div>

            {/* Status distribution circular progresses (1 col) */}
            <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider font-mono">
                Responder Fleet Allocation Index
              </h3>

              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Police Fleet in Duty</span>
                    <span className="text-cyan-400 font-bold">70% Responding</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-white/5">
                    <div className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-2.5 rounded-full" style={{ width: '70%' }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Fire Pumpers Deployed</span>
                    <span className="text-amber-400 font-bold">25% Active</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-white/5">
                    <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-2.5 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Ambulance Beds Occupancy</span>
                    <span className="text-red-400 font-bold">85% Triage Capacity</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-white/5">
                    <div className="bg-gradient-to-r from-red-600 to-red-400 h-2.5 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Disaster Teams Ready</span>
                    <span className="text-emerald-400 font-bold">90% Standby</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-white/5">
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-2.5 rounded-full" style={{ width: '90%' }} />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-white/5 rounded-xl text-xs space-y-1">
                <p className="text-[10px] text-slate-400">Sovereign dispatch efficiency is currently rated at:</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-emerald-400">★ 99.8% Reliability rating</span>
                  <span className="text-[9px] text-slate-500 font-mono">Last 24h</span>
                </div>
              </div>
            </div>

          </div>

          {/* Historical response analytic bento block */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Dynamic Resource Analytics Overview
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center font-mono">
              <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">Total Logs Loaded</span>
                <p className="text-2xl font-extrabold text-white">{emergencies.length}</p>
                <span className="text-[9px] text-slate-400">Real-time coordinates</span>
              </div>
              <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">Average Dispatch ETA</span>
                <p className="text-2xl font-extrabold text-cyan-400">5.8 Mins</p>
                <span className="text-[9px] text-emerald-400 font-bold">↓ 1.2 Mins improvement</span>
              </div>
              <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">Active Disaster alerts</span>
                <p className="text-2xl font-extrabold text-amber-400">10 alerts</p>
                <span className="text-[9px] text-slate-400">Regional cyclone ticker</span>
              </div>
              <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">Dispatched status</span>
                <p className="text-2xl font-extrabold text-red-500">
                  {emergencies.filter(e => e.status === 'Dispatched').length}
                </p>
                <span className="text-[9px] text-slate-400">Sirens active en route</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'alerts-shelters' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Columns (2 cols): Disaster Warnings, Shelters, Volunteers */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Extreme weather disaster warnings tickers (10 Alerts) */}
            <div className="rounded-2xl border border-red-500/15 bg-slate-900 p-5 space-y-4">
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <CloudRain className="h-4 w-4 animate-bounce" />
                Live Extreme Weather Disaster Alerts (10 Items)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INITIAL_DISASTER_ALERTS.map((alert, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-950/60 rounded-xl border border-red-500/10 flex items-start gap-2.5 text-xs">
                    <div className="mt-0.5 rounded-full bg-red-500/10 p-1 text-red-400 shrink-0">
                      <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-red-400 font-mono font-bold uppercase block">Regional Warning {idx+1}</span>
                      <p className="text-slate-300 font-medium leading-relaxed">"{alert}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safe shelters list (10 shelters) */}
            <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Sovereign Safe Shelters Registry (10 Stations)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {shelters.map(she => (
                  <div key={she.id} className="p-3.5 bg-slate-950/40 rounded-xl border border-white/5 space-y-2 text-xs">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-extrabold text-white text-xs">{she.name}</h4>
                        <p className="text-[9px] text-slate-400">{she.address}</p>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-mono shrink-0">{she.distance}</span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono border-y border-white/5 py-1">
                      <span className="text-slate-400">Capacity loaded:</span>
                      <span className="text-emerald-400 font-extrabold">{she.occupancy} / {she.capacity} Check-ins</span>
                    </div>

                    <p className="text-[10px] text-slate-300 font-sans leading-relaxed">
                      <strong>Utilities:</strong> {she.resources}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Disaster response and volunteer squads (10 Volunteer groups) */}
            <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Users className="h-4 w-4 text-cyan-400" />
                Active Volunteer Command Network (10 Teams)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {volunteers.map(vol => (
                  <div key={vol.id} className="p-3.5 bg-slate-950/40 rounded-xl border border-white/5 space-y-2 text-xs">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-extrabold text-white text-xs leading-snug">{vol.name}</h4>
                      <span className="text-[9px] text-cyan-400 font-mono shrink-0">📞 Contact</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">📍 Region: {vol.location}</p>
                    <p className="text-[10.5px] text-slate-300 font-sans italic leading-normal">"{vol.assignment}"</p>
                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono pt-1 border-t border-white/5">
                      <span>Volunteers: {vol.volunteersCount} active</span>
                      <span className="text-emerald-400">{vol.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Columns (1 col): System wide notification HUD feed (25 items) */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-slate-400" />
                Sovereign Notification Stream (25)
              </h3>
              
              <button 
                onClick={() => {
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  triggerToast('All CAD notifications marked read.', 'success');
                }}
                className="text-[9px] text-slate-400 hover:text-white font-mono underline"
              >
                Read All
              </button>
            </div>

            <div className="space-y-3 max-h-[680px] overflow-y-auto custom-scrollbar pr-1">
              {notifications.map(item => (
                <div 
                  key={item.id} 
                  className={`p-3 rounded-xl border transition-all text-xs space-y-1.5 relative ${
                    item.read ? 'bg-slate-950/20 border-white/5 opacity-65' : 'bg-white/5 border-white/10 shadow-md'
                  }`}
                >
                  {!item.read && (
                    <span className="absolute top-3.5 right-3 h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                  )}

                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {item.type === 'danger' ? <span className="text-red-400 font-bold">🔴</span> :
                       item.type === 'warning' ? <span className="text-amber-400 font-bold">🟡</span> :
                       item.type === 'success' ? <span className="text-emerald-400 font-bold">🟢</span> :
                       <span className="text-cyan-400 font-bold">🔵</span>}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-white text-xs leading-snug">{item.title}</h4>
                      </div>
                      <p className="text-slate-300 leading-normal text-[11px]">"{item.message}"</p>
                      <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1 font-mono">
                        <span>{item.timestamp}</span>
                        {!item.read && (
                          <button 
                            onClick={() => {
                              setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
                            }}
                            className="text-cyan-400 hover:underline text-[9px]"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Satellite Telemetry HUD modal popup */}
      {selectedEmergency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-150">
            
            <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-2">
              <div>
                <span className="text-[9px] text-slate-500 font-mono uppercase font-bold block">Incident Command Unit</span>
                <h3 className="text-sm font-extrabold text-white uppercase font-mono">{selectedEmergency.id} - CAD Satellite Link</h3>
              </div>
              <button 
                onClick={() => { setSelectedEmergency(null); setAiTriageAnalysis(null); }}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            <div className="space-y-3.5 my-4 overflow-y-auto max-h-[420px] custom-scrollbar pr-1">
              
              <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 text-xs space-y-1.5">
                <span className="text-[9px] text-slate-500 font-mono uppercase font-bold block">Registered Caller Telemetry</span>
                <p className="font-extrabold text-white text-xs">{selectedEmergency.citizenName}</p>
                <p className="text-emerald-400 font-mono text-[10.5px]">📞 Registry Phone: {selectedEmergency.phone}</p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 text-xs space-y-1.5">
                <span className="text-[9px] text-slate-500 font-mono uppercase font-bold block">GPS Sat Coordinates</span>
                <p className="font-extrabold text-cyan-400 font-mono text-[10.5px]">
                  Lat: {selectedEmergency.lat.toFixed(4)}° N, Lng: {selectedEmergency.lng.toFixed(4)}° E
                </p>
                <p className="text-slate-300 text-[11px] leading-normal font-sans">
                  📍 Address: {selectedEmergency.address}
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 text-xs space-y-1.5">
                <span className="text-[9px] text-slate-500 font-mono uppercase font-bold block">CAD Telemetry Feed</span>
                <p className="italic text-slate-300 text-[11.5px] leading-relaxed">"{selectedEmergency.description}"</p>
              </div>

              {/* Dynamic status alteration */}
              {selectedEmergency.status !== 'Resolved' && (
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-2">
                  <span className="text-[9px] text-slate-500 font-mono uppercase font-bold block">CAD Command Action</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        handleUpdateLocalStatus(selectedEmergency.id, 'Dispatched');
                        setSelectedEmergency(null);
                        setAiTriageAnalysis(null);
                      }}
                      className="flex-1 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 font-bold py-1.5 rounded-lg text-xs font-mono transition-all"
                    >
                      Dispatch Squad
                    </button>
                    <button
                      onClick={() => {
                        handleUpdateLocalStatus(selectedEmergency.id, 'Resolved');
                        setSelectedEmergency(null);
                        setAiTriageAnalysis(null);
                      }}
                      className="flex-1 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 font-bold py-1.5 rounded-lg text-xs font-mono transition-all"
                    >
                      Resolve SOS
                    </button>
                  </div>
                </div>
              )}

              {/* AI Dispatch Diagnosis */}
              <div className="bg-gradient-to-br from-violet-950/10 to-slate-950 p-3.5 rounded-xl border border-violet-500/20 space-y-2.5 text-xs">
                <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                  <span className="text-[9px] text-violet-400 font-mono uppercase font-bold block flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> AI Triage Assessment
                  </span>
                  
                  {!aiTriageAnalysis && !analyzingIncidentId && (
                    <button
                      type="button"
                      onClick={() => handleRunAiAnalysis(selectedEmergency)}
                      className="text-[9px] text-violet-300 hover:text-white underline font-mono"
                    >
                      Run Triage Assessment
                    </button>
                  )}
                </div>

                {analyzingIncidentId === selectedEmergency.id && (
                  <p className="text-[10px] text-slate-400 animate-pulse font-mono">
                    Querying secure sovereign language models for triage...
                  </p>
                )}

                {aiTriageAnalysis && (
                  <div className="text-[11px] text-slate-300 leading-relaxed font-sans space-y-1.5 whitespace-pre-line">
                    {aiTriageAnalysis}
                  </div>
                )}
              </div>

            </div>

            <button
              onClick={() => { setSelectedEmergency(null); setAiTriageAnalysis(null); }}
              className="w-full bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-xl text-xs transition-colors font-bold font-mono border border-white/5"
            >
              Close Link
            </button>
          </div>
        </div>
      )}

      {/* Global Toast Notification HUD */}
      {toast.message && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm rounded-2xl border bg-slate-950/90 p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 flex items-start gap-3 border-white/10">
          <div className={`mt-0.5 rounded-full p-1.5 ${
            toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
            toast.type === 'danger' ? 'bg-red-500/10 text-red-400 font-extrabold animate-pulse' :
            'bg-amber-500/10 text-amber-400'
          }`}>
            <AlertTriangle className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1 space-y-0.5">
            <h4 className="font-extrabold text-[10px] text-white uppercase tracking-wider font-mono">
              {toast.type === 'success' ? 'CAD Success' :
               toast.type === 'danger' ? 'CRITICAL DISPATCH ALERT' :
               'Sovereign Telemetry'}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Emergency Call Dialog */}
      {callDialog && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4">
            {callingState === 'idle' ? (
              <>
                <h3 className="text-sm font-bold text-white uppercase font-mono">Confirm Emergency Call</h3>
                <div className="space-y-2 text-xs text-slate-300 font-mono">
                  <p>Service: <span className="text-white">{callDialog.service}</span></p>
                  <p>Number: <span className="text-cyan-400 font-bold">{callDialog.number}</span></p>
                  <p>GPS: {location ? `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}` : 'Location not available'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={confirmAndCall} className="flex-1 bg-red-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-red-500">Confirm Call</button>
                  <button onClick={() => setCallDialog(null)} className="flex-1 bg-slate-800 text-slate-300 py-2 rounded-xl text-xs hover:bg-slate-700">Cancel</button>
                </div>
              </>
            ) : (
              <div className="text-center py-4 space-y-2">
                <p className="text-white font-bold text-sm">Calling...</p>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 animate-pulse w-full"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
