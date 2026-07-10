import React, { useState } from 'react';
import { 
  ShieldCheck, Activity, Users, FileText, AlertTriangle, 
  Droplet, Trash2, Sprout, Check, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { WaterComplaint, WasteComplaint, EmergencyRequest, FoodDonation, FarmProduct, User } from '../types';

interface AdminProps {
  db: any;
  onUpdateWaterStatus: (id: string, status: 'Pending' | 'In Progress' | 'Resolved') => void;
  onUpdateWasteStatus: (id: string, status: 'Pending' | 'Dispatched' | 'Resolved') => void;
  onUpdateEmergencyStatus: (id: string, status: 'Requested' | 'Dispatched' | 'Resolved') => void;
  language: 'en' | 'ta' | 'hi';
}

export default function AdminDashboard({ 
  db, onUpdateWaterStatus, onUpdateWasteStatus, onUpdateEmergencyStatus, language 
}: AdminProps) {
  const [activeTab, setActiveTab] = useState<'grievances' | 'emergencies' | 'agriculture' | 'users'>('grievances');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-100 font-sans">
      
      {/* Title */}
      <div className="flex items-center space-x-3.5 border-b border-white/5 pb-4">
        <div className="h-11 w-11 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 border border-cyan-500/25">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wider font-mono">Central Administrative Grid</h2>
          <p className="text-xs text-slate-400">Manage public dispatch routes, resolve citizen complaints, and monitor state resource ledgers.</p>
        </div>
      </div>

      {/* Main summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Unresolved Complaints', val: ((db.waterComplaints?.filter((c:any)=>c.status!=='Resolved').length || 0) + (db.wasteComplaints?.filter((c:any)=>c.status!=='Resolved').length || 0)), color: 'from-amber-400 to-amber-500' },
          { label: 'Active SOS Dispatches', val: (db.emergencies?.filter((e:any)=>e.status!=='Resolved').length || 0), color: 'from-rose-500 to-red-600' },
          { label: 'Food Donations Pending', val: (db.foodDonations?.filter((f:any)=>f.status==='Available').length || 0), color: 'from-emerald-400 to-cyan-500' },
          { label: 'Registered System Users', val: 5, color: 'from-violet-400 to-indigo-500' }
        ].map((item, idx) => (
          <div key={idx} className="rounded-2xl bg-white/5 border border-white/5 p-4.5 text-center shadow-md">
            <span className="text-[9px] uppercase font-mono text-slate-400 block font-bold leading-tight mb-1">{item.label}</span>
            <p className={`text-2xl font-extrabold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>{item.val}</p>
          </div>
        ))}
      </div>

      {/* Segment Selector Tabs */}
      <div className="flex border-b border-white/5 gap-2 text-xs font-mono font-bold">
        {[
          { id: 'grievances', label: '🚰 PUBLIC COMPLAINTS LOGS' },
          { id: 'emergencies', label: '🚨 SOS RESCUE GRID' },
          { id: 'agriculture', label: '🌾 FARMER & FOOD LEDGER' },
          { id: 'users', label: '👤 SYSTEM USERS' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 border-b-2 transition-all ${
              activeTab === tab.id 
                ? 'border-cyan-400 text-cyan-300' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="space-y-4">
        
        {/* Tab 1: Water & waste Grievances */}
        {activeTab === 'grievances' && (
          <div className="space-y-6">
            
            {/* Water leaks resolving */}
            <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Droplet className="h-4 w-4 text-sky-400 animate-pulse" />
                Water Pipeline Grievances
              </h3>

              <div className="space-y-3">
                {db.waterComplaints?.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-3 text-center">No complaints filed.</p>
                ) : (
                  db.waterComplaints?.map((c: WaterComplaint) => (
                    <div key={c.id} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">{c.type}</span>
                          <span className="text-[9px] font-mono text-slate-500">REF: {c.id}</span>
                        </div>
                        <p className="text-xs text-slate-300">"{c.description}"</p>
                        <p className="text-[10px] text-slate-400">📍 {c.address}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                          c.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400 animate-pulse'
                        }`}>
                          {c.status}
                        </span>
                        
                        {c.status !== 'Resolved' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => onUpdateWaterStatus(c.id, 'In Progress')}
                              className="rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-mono px-2 py-1 border border-cyan-500/30"
                            >
                              Dispatch Worker
                            </button>
                            <button
                              onClick={() => onUpdateWaterStatus(c.id, 'Resolved')}
                              className="rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-mono px-2 py-1 border border-emerald-500/30"
                            >
                              Resolve
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Waste sanitation complaints */}
            <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Trash2 className="h-4 w-4 text-teal-400 animate-pulse" />
                Sanitation Garbage Grievances
              </h3>

              <div className="space-y-3">
                {db.wasteComplaints?.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-3 text-center">No grievances filed.</p>
                ) : (
                  db.wasteComplaints?.map((c: WasteComplaint) => (
                    <div key={c.id} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">{c.type}</span>
                          <span className="text-[9px] font-mono text-slate-500">REF: {c.id}</span>
                        </div>
                        <p className="text-xs text-slate-300">"{c.description}"</p>
                        <p className="text-[10px] text-slate-400">📍 {c.address}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                          c.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400 animate-pulse'
                        }`}>
                          {c.status}
                        </span>
                        
                        {c.status !== 'Resolved' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => onUpdateWasteStatus(c.id, 'Dispatched')}
                              className="rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-mono px-2 py-1 border border-cyan-500/30"
                            >
                              Dispatch Truck
                            </button>
                            <button
                              onClick={() => onUpdateWasteStatus(c.id, 'Resolved')}
                              className="rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-mono px-2 py-1 border border-emerald-500/30"
                            >
                              Resolve
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: SOS Emergency dispatchers */}
        {activeTab === 'emergencies' && (
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-rose-500 animate-pulse" />
              SOS Live Emergency dispatch list
            </h3>

            <div className="space-y-3">
              {db.emergencies?.map((e: EmergencyRequest) => (
                <div key={e.id} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white uppercase font-mono">{e.type} Emergency</span>
                      <span className="text-[9px] bg-rose-500/10 text-rose-400 font-bold px-1.5 rounded">{e.priority} Priority</span>
                    </div>
                    <p className="text-xs text-slate-300">"{e.description}"</p>
                    <p className="text-[10px] text-slate-400">📍 Address: {e.address} ({e.citizenName})</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                      e.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {e.status}
                    </span>

                    {e.status !== 'Resolved' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => onUpdateEmergencyStatus(e.id, 'Dispatched')}
                          className="rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-mono px-2 py-1 border border-cyan-500/30"
                        >
                          Dispatch Paramedic
                        </button>
                        <button
                          onClick={() => onUpdateEmergencyStatus(e.id, 'Resolved')}
                          className="rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-mono px-2 py-1 border border-emerald-500/30"
                        >
                          Resolve SOS
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Agricultural Crop/Food listings */}
        {activeTab === 'agriculture' && (
          <div className="space-y-6">
            
            {/* Food donations */}
            <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-emerald-400" />
                Surplus Food Donation Registries
              </h3>

              <div className="space-y-2.5">
                {db.foodDonations?.map((f: FoodDonation) => (
                  <div key={f.id} className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 flex justify-between text-xs items-center">
                    <div>
                      <p className="font-bold text-white">{f.restaurantName} ({f.quantity})</p>
                      <p className="text-[10px] text-slate-400">Items: {f.foodType}</p>
                    </div>
                    <span className="text-[10px] font-mono bg-white/5 border border-white/5 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-cyan-400">
                      {f.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Farm products */}
            <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sprout className="h-4 w-4 text-lime-400" />
                Farmer Yield Registries
              </h3>

              <div className="space-y-2.5">
                {db.farmProducts?.map((p: FarmProduct) => (
                  <div key={p.id} className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 flex justify-between text-xs items-center">
                    <div>
                      <p className="font-bold text-white">{p.name} ({p.quantity} kg)</p>
                      <p className="text-[10px] text-slate-400">Category: {p.category} | Seller: {p.farmerName}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ₹{p.price}/kg
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 4: System User databases */}
        {activeTab === 'users' && (
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Users className="h-4 w-4 text-violet-400" />
              Sovereign Citizen Security Registry
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {[
                { name: 'Dr. Keerthana R.', role: 'doctor', spec: 'Senior Cardiologist • General Hospital' },
                { name: 'Dinesh Karthik', role: 'volunteer', spec: 'Regional NGO Pickup Coordinator' },
                { name: 'Arumugam P.', role: 'farmer', spec: 'Organic Agronomist • Salem Cooperatives' },
                { name: 'Sujatha Sundar', role: 'citizen', spec: 'Standard public clearance citizen profile' }
              ].map((userItem, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-white text-xs">{userItem.name}</p>
                    <span className="text-[9px] uppercase font-mono bg-violet-500/10 text-violet-300 px-1.5 py-0.5 rounded font-bold border border-violet-500/20">
                      {userItem.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">{userItem.spec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
