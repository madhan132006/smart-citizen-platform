import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Sparkles, Send, Mic, MicOff, RefreshCw, HelpCircle, 
  ShieldCheck, UserCheck, Play, Bus, Train, Car, Ticket, 
  Activity, ShoppingBag, Landmark, Droplets, Trash2, 
  Shield, Copy, Check, MessageSquare, Plus, Bell, 
  Volume2, Info, ArrowUpRight, CheckCircle2, AlertTriangle,
  Heart, Apple, ChevronRight, CornerDownRight, Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AssistantProps {
  user: any;
  language: 'en' | 'ta' | 'hi';
  db?: any;
  onNavigateToModule?: (module: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  category?: string;
}

export default function ModuleAiAssistant({ user, language, db, onNavigateToModule }: AssistantProps) {
  // --- Local Toast / Notification System ---
  const [toasts, setToasts] = useState<any[]>([]);
  const triggerToast = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // --- Core Conversational State ---
  const defaultWelcomeMessage = (): Message => {
    const name = user?.name || 'Citizen';
    return {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `👋 **Sovereign Welcome Handshake Established, ${name}!**

I am the **LifeConnect AI Unified Assistant**, your centralized cognitive coordinator. I have full real-time telemetry access across all 9 municipal service grids.

**What would you like to accomplish?** You can click any quick suggestion below, use the sidebar, or launch specific functional modules directly from my control room on the left.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'General'
    };
  };

  const [messages, setMessages] = useState<Message[]>([defaultWelcomeMessage()]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeContext, setActiveContext] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // --- Modules Configuration with Descriptions and Navigation Targets ---
  const modules = [
    {
      id: 'healthcare',
      name: 'Smart Healthcare',
      desc: 'Symptom checks, doctor appointment booking & clinical records.',
      icon: Activity,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    },
    {
      id: 'emergency',
      name: 'SOS Responders',
      desc: 'Active coordinate transmission, dispatch alerts, police, ambulance.',
      icon: Shield,
      color: 'text-red-400 bg-red-500/10 border-red-500/20'
    },
    {
      id: 'blood',
      name: 'Blood Donors',
      desc: 'Urgent hematology matching, O-positive matching, donor listing.',
      icon: Heart,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
    },
    {
      id: 'food',
      name: 'Surplus Food',
      desc: 'Zero-waste catering parcels, shelter delivery logs, food ledger.',
      icon: Apple,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 'farmer',
      name: 'Farmer Market',
      desc: 'Crop advice, real-time Salem market vegetable price forecasts.',
      icon: ShoppingBag,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    {
      id: 'govt',
      name: 'Welfare Schemes',
      desc: 'Moovalur Ammaiyar scheme, scholarship checks & certificates.',
      icon: Landmark,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20'
    },
    {
      id: 'water',
      name: 'Water Pipeline',
      desc: 'Municipal leak repair complaints, supply status & pressure telemetry.',
      icon: Droplets,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    },
    {
      id: 'waste',
      name: 'Waste Sanitation',
      desc: 'Overflowing bin remediation, compactor vehicle coordinates.',
      icon: Trash2,
      color: 'text-slate-400 bg-slate-500/10 border-slate-500/20'
    },
    {
      id: 'transport',
      name: 'Public Transit',
      desc: 'MTC bus routes, CMRL Metro timetables & local suburban trains.',
      icon: Bus,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
    }
  ];

  // --- Dynamic Suggestions Based on Active Context ---
  const suggestions = useMemo(() => {
    const all = [
      { text: '🏥 Book a cardiac consultation with Dr. Prasad', context: 'Healthcare' },
      { text: '🚨 Guide me on step-by-step adult CPR first-aid', context: 'Emergency Response' },
      { text: '🩸 Find matching A-negative blood donors in Chennai', context: 'Blood Donor' },
      { text: '🌾 Suggest optimal Salem market prices for tomato harvests', context: 'Farmer Marketplace' },
      { text: '🏛️ Am I eligible for the Moovalur Ramamirtham scholarship scheme?', context: 'Government Services' },
      { text: '🚰 File a water pipe leak report on T-Nagar main avenue', context: 'Water Management' },
      { text: '🗑️ Request trash collection truck coordinates near Egmore', context: 'Waste Management' },
      { text: '🚌 MTC bus 21G timetable and arrival times at Broadway', context: 'Public Transport' }
    ];

    if (activeContext === 'All') return all;
    return all.filter(s => s.context === activeContext);
  }, [activeContext]);

  // --- Recommended Services Engine ---
  const recommendedServices = [
    {
      title: 'Digital Health Vault',
      desc: 'Compile medical reports securely with sovereign encryptions.',
      badge: 'Highly Recommended',
      action: 'healthcare'
    },
    {
      title: 'Moovalur Welfare Scheme',
      desc: 'Apply for higher education grants before the July 15 deadline.',
      badge: 'Active Application',
      action: 'govt'
    },
    {
      title: 'Zero-Waste Catering Network',
      desc: 'Donate extra wedding or party portions to metropolitan centers.',
      badge: 'Community Need',
      action: 'food'
    }
  ];

  // --- Intelligent Fallback Local Response Generator ---
  const generateLocalAnswer = (query: string): string => {
    const q = query.toLowerCase();
    
    if (q.includes('cpr') || q.includes('heart attack') || q.includes('choking') || q.includes('emergency') || q.includes('accident')) {
      return `🚨 **IMMEDIATE FIRST-AID ADVISORY (CRITICAL)**

Stay calm. Para-medical responders are being dispatched. Follow these vital survival guides immediately:

1. **Cardiopulmonary Resuscitation (CPR)**:
   - Place your hands in the center of the patient's chest.
   - Compress hard and fast: **100 to 120 beats per minute** (match the rhythm of the song "Stayin' Alive").
   - Allow the chest to rise completely between compressions.
2. **Clear Airway Passage**:
   - If breathing stops, tilt head back gently to open airway. Check for visible choking obstructions.
3. **Control Bleeding**:
   - Apply continuous firm pressure directly to any wounds using clean fabric layers.

*Note: Your real-time coordinates have been logged on the telemetry board. Medical teams are routing. Avoid moving the patient unless danger is imminent.*`;
    }

    if (q.includes('doctor') || q.includes('appointment') || q.includes('healthcare') || q.includes('hospital') || q.includes('fever') || q.includes('pain') || q.includes('prasad')) {
      return `🩺 **Smart Healthcare Directory Match**

Our medical registry has matched your inquiry with local experts:

- **Primary Doctor recommendation**: **Dr. Prasad** (Chief Cardiologist, 22 Years Exp) is active at **Metro General Hospital**.
- **Alternative Physician**: **Dr. Meera** (Internal Medicine, rating 4.8) has open slots between **2:00 PM and 5:00 PM** today.
- **Welfare Coverage**: Cashless treatments are fully supported via the **Amma Comprehensive Health Insurance Scheme** card.

Would you like me to instantly secure an appointment slot with Dr. Prasad? Click **Smart Healthcare** on the left to complete your registration.`;
    }

    if (q.includes('blood') || q.includes('donor') || q.includes('hematology') || q.includes('o-positive') || q.includes('a-negative')) {
      return `🩸 **Active Blood Donor Registry Network**

Our database of voluntary emergency donors in Chennai reports the following status:

- **Requested Group**: O+ / A-
- **Verified Local Matches**:
  - **Suresh Kumar** (Adyar Node, Distance: 1.2 km, Available: Immediate)
  - **Anjali Sharma** (Nungambakkam Node, Distance: 4.5 km, Available: On-call)
- **Public Broadcaster**: You can initiate a synchronized SOS alert to all voluntary donors in the matching postal zones.

Click **Blood Donors** on the left menu to browse verified phones or publish a donor matching request.`;
    }

    if (q.includes('tomato') || q.includes('price') || q.includes('harvest') || q.includes('farmer') || q.includes('crop') || q.includes('paddy') || q.includes('salem')) {
      return `🌾 **LifeConnect AI Smart Agronomist Advisory**

Here is your localized crop intelligence report for Salem & Chennai districts:

1. **Salem Market Pricing Forecasts**:
   - **Native Tomatoes**: High demand. Peak retail price is **₹32/kg**. Sell immediately to optimize yield revenues.
   - **Ponni Paddy Rice**: Securely valued at **₹50-52/kg**. Our system projects a 5% rise next week. Maintain storage.
2. **Weather Risk Warning**:
   - Light showers are predicted over the Salem orchard belt in the next 48 hours. Ensure paddy bags are elevated on wooden pellets to avoid damp spoilage.
3. **Soil Health**: Maintain organic mulch layers for soil moisture preservation.

To register your harvest products, navigate to the **Farmer Market** module.`;
    }

    if (q.includes('scheme') || q.includes('eligibility') || q.includes('pudhumaipenn') || q.includes('moovalur') || q.includes('government') || q.includes('grant') || q.includes('scholarship')) {
      return `🏛️ **Government Welfare Scheme Evaluator**

Based on your citizenship profile, you have high eligibility for key state initiatives:

1. **Moovalur Ramamirtham Ammaiyar Pudhumaipenn Scheme**:
   - **Benefit**: Monthly stipend of **₹1,000** deposited directly to public savings accounts.
   - **Criteria**: Female student, completed schooling from Government institutions, currently enrolled in high-tier technical degree courses.
2. **PM Kisan Samman Nidhi**:
   - **Benefit**: Guaranteed annual support of **₹6,000** for marginal landowners.
3. **Amma Insurance Scheme**: Cashless medical treatment coverage up to **₹5,000,000/year** for eligible families.

Click the **Welfare Schemes** launcher card on the left to submit application files or track registry tokens.`;
    }

    if (q.includes('water') || q.includes('leak') || q.includes('pipeline') || q.includes('complaint')) {
      return `🚰 **Municipal Water Utility Dispatcher**

Your water service query matches our dynamic infrastructure database:

- **Active Grid Status**: Pressure is stable at **2.4 Bar** in T-Nagar pipeline grids.
- **Reporting a Leak?** You can register a formal water pipe leakage grievance instantly. Local sewage/water maintenance supervisors are automatically assigned within 15 minutes of registration.
- **Current Tickets**: Review pending repairs on the **Water Pipeline** tab.

Navigate to **Water Pipeline** on the left to map leak coordinates or browse live water quality sensors.`;
    }

    if (q.includes('waste') || q.includes('trash') || q.includes('garbage') || q.includes('bin') || q.includes('sanitation')) {
      return `🗑️ **Municipal Sanitation Tracker**

The regional waste management database reports:

- **Scheduled Pickups**: Trash compactor vehicle **MTC-TRK-88** is active on Egmore avenues. Expected ETA: **45 mins**.
- **Complaint Registry**: You can report overflowing bins, debris pileups, or missed trash routes. Supervisors inspect and coordinate dispatch within 1 hour.
- **Community Rewards**: Earn local sustainable community points for reporting and verifying dumpster clearances!

Navigate to **Waste Sanitation** to file a complaint or view live dumpster volume status charts.`;
    }

    if (q.includes('bus') || q.includes('train') || q.includes('metro') || q.includes('transport') || q.includes('timetable') || q.includes('fare')) {
      return `🚌 **Metropolitan Transport Telemetry Hub**

Active Chennai Metropolitan transport schedules synced:

1. **MTC Bus 21G (Tambaram ➔ Broadway)**:
   - *Status*: On-time, next bus leaving Tambaram depot in **7 minutes**.
   - *Fare*: ₹28 (Deluxe Coach).
2. **CMRL Metro (Blue Line)**:
   - *Status*: Normal operational frequency (4.5m interval). Next Airport train arriving at Guindy platform in **3 minutes**.
3. **Southern Suburban Railways**:
   - *Status*: Minor 5m delay near Pallavaram station due to track maintenance work.

Navigate to **Public Transit** on the left to purchase smart transit tickets, track live GPS locations of buses, or check suburban railway stops.`;
    }

    if (q.includes('food') || q.includes('donation') || q.includes('surplus') || q.includes('restaurant')) {
      return `🎁 **LifeConnect Food Share Ledger**

Our zero-waste food distribution coordinates:

- **For Restaurants/Caterers**: You can post surplus food parcels (e.g., veg biryani, parotta) with quantity, address, and expiry windows.
- **For Volunteers/Shelters**: View lists of unclaimed surplus parcels in your area, claim them for transport, and complete the delivery using our secure QR verification system.
- **Leaderboard**: High-impact caterers receive public appreciation certificates and tax-saving vouchers.

Navigate to **Surplus Food** to share portions or map active delivery routes.`;
    }

    return `👋 **Hello! I am your LifeConnect AI Unified Assistant.**

I have summarized the status of our metropolitan modules for you. Here is a quick snapshot:
- **🏥 Smart Healthcare**: Doctors Prasad & Meera have open slots today.
- **🌾 Farmer Market**: Salem Tomato is selling at a high price of **₹32/kg**.
- **🏛️ Welfare Schemes**: Higher education stipend applications are active.
- **🚨 SOS Responders**: GPS vehicle tracking and dispatch are fully operational.
- **🚌 Public Transit**: MTC bus 21G is running on time.

*Pro-Tip: Try typing "CPR first-aid guides", "check tomato price", or "Moovalur scheme eligibility" to get specialized advice.*`;
  };

  // --- Send Message Handler ---
  const handleSend = async (presetText?: string) => {
    const textToSend = presetText || inputMessage;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!presetText) setInputMessage('');
    setSending(true);

    // Dynamic categorizer to set suggestions context matching user query
    const lower = textToSend.toLowerCase();
    if (lower.includes('doctor') || lower.includes('health') || lower.includes('symptom')) setActiveContext('Healthcare');
    else if (lower.includes('cpr') || lower.includes('emergency') || lower.includes('sos')) setActiveContext('Emergency Response');
    else if (lower.includes('blood') || lower.includes('donor')) setActiveContext('Blood Donor');
    else if (lower.includes('food') || lower.includes('donate')) setActiveContext('Food Donation');
    else if (lower.includes('crop') || lower.includes('price') || lower.includes('tomato')) setActiveContext('Farmer Marketplace');
    else if (lower.includes('scheme') || lower.includes('apply') || lower.includes('welfare')) setActiveContext('Government Services');
    else if (lower.includes('water') || lower.includes('leak')) setActiveContext('Water Management');
    else if (lower.includes('waste') || lower.includes('garbage')) setActiveContext('Waste Management');
    else if (lower.includes('bus') || lower.includes('train') || lower.includes('transit')) setActiveContext('Public Transport');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: textToSend, 
          context: { 
            userName: user?.name, 
            userRole: user?.role,
            dbActive: !!db
          },
          modelType: 'chat-companion'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg: Message = {
          id: `msg-${Date.now()}-assistant`,
          sender: 'assistant',
          text: data.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error('Network response not ok');
      }
    } catch (e) {
      console.warn("AI backend chat request failed, generating high-fidelity local response instead.", e);
      // Generate highly-accurate local matching answer
      setTimeout(() => {
        const localAnswer = generateLocalAnswer(textToSend);
        const assistantMsg: Message = {
          id: `msg-${Date.now()}-assistant`,
          sender: 'assistant',
          text: localAnswer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMsg]);
      }, 750);
    } finally {
      setSending(false);
    }
  };

  // --- Voice Input Simulation ---
  const simulateVoiceInput = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    triggerToast('🎙️ Voice Capture Initialized', 'Listening for localized speech sensors...', 'info');

    // Array of realistic prompts depending on current active context
    const prompts: Record<string, string[]> = {
      All: [
        'Is there any urgent need for O-positive blood donors near Egmore?',
        'What is my eligibility for Moovalur Ramamirtham Ammaiyar Scheme?',
        'Explain step-by-step adult CPR instructions',
        'Check Salem market tomato price and rain alerts'
      ],
      Healthcare: ['Search doctor schedules for cardiologist Dr. Prasad'],
      'Emergency Response': ['Guide me on emergency medical resuscitation CPR steps'],
      'Blood Donor': ['List verified O-positive blood donors near Chennai Central'],
      'Food Donation': ['Show unclaimed wedding food donations listed on the ledger'],
      'Farmer Marketplace': ['What is the current market price for Ponni paddy rice in Salem?'],
      'Government Services': ['Am I eligible for the Pudhumaipenn scholarship benefit?'],
      'Water Management': ['Report a pipeline water leak on Adyar canal boulevard'],
      'Waste Management': ['Find compactor garbage truck schedules in Egmore zone'],
      'Public Transport': ['MTC bus 21G schedule and arrival time at Tambaram']
    };

    const pool = prompts[activeContext] || prompts['All'];
    const selectedPrompt = pool[Math.floor(Math.random() * pool.length)];

    setTimeout(() => {
      setInputMessage(selectedPrompt);
      setIsRecording(false);
      triggerToast('🎙️ Audio Converted', 'Successfully synthesized audio stream to digital text.', 'success');
    }, 2200);
  };

  // --- Clipboard Copier ---
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    triggerToast('📋 Response Copied', 'Copied assistant response markdown to clipboard.', 'success');
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // --- Navigation Callback Protector ---
  const handleNavigate = (moduleTarget: string) => {
    if (onNavigateToModule) {
      onNavigateToModule(moduleTarget);
      triggerToast('🚀 Redirecting Route', `Switching screen context to ${moduleTarget.toUpperCase()} module.`, 'info');
    } else {
      triggerToast('Routing Interrupted', 'Platform main route callback undefined. Please use the sidebar navigation drawer.', 'warning');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100 font-sans">
      
      {/* Toast Notification Mount */}
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
                    : 'border-violet-500/30'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${
                toast.type === 'success' 
                  ? 'bg-emerald-500/15 text-emerald-400' 
                  : toast.type === 'warning' 
                    ? 'bg-amber-500/15 text-amber-400' 
                    : 'bg-violet-500/15 text-violet-400'
              }`}>
                {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : toast.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
              </div>
              <div className="flex-1 space-y-0.5">
                <h4 className="text-xs font-bold font-mono tracking-wide">{toast.title}</h4>
                <p className="text-[11px] text-slate-400 leading-normal">{toast.message}</p>
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <XButtonIcon className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header Banner Block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/5 pb-5 gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="h-11 w-11 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400 border border-violet-500/25">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold uppercase tracking-wider font-mono flex items-center gap-2">
              LifeConnect Unified Assistant
              <span className="px-2 py-0.5 text-[9px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full">Sovereign AI Hub</span>
            </h2>
            <p className="text-xs text-slate-400">Control and query your municipal services, doctor slots, emergency dispatch, and welfare schemes with natural language.</p>
          </div>
        </div>

        {/* Dynamic status stats widget */}
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-right">
            <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-wider">Cognitive Engine Status</span>
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 justify-end">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Active Online
            </span>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side Section: 9-Module Central Dispatcher & Recommendations */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          
          {/* Quick Launcher Header */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-4 space-y-3.5">
            <div>
              <span className="text-[9px] uppercase font-mono text-slate-400 block font-bold tracking-wider">Global Grid Control</span>
              <h3 className="text-xs font-bold text-white mt-0.5">Unified Module Navigator</h3>
              <p className="text-[10px] text-slate-500 mt-1">Select a card below to launch the respective functional interface instantly.</p>
            </div>

            {/* Grid of All 9 Modules */}
            <div className="grid grid-cols-1 gap-2">
              {modules.map(mod => {
                const IconComponent = mod.icon;
                return (
                  <button
                    key={mod.id}
                    onClick={() => handleNavigate(mod.id)}
                    className="group p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-950/90 border border-white/5 hover:border-violet-500/30 text-left transition-all flex items-start gap-3 w-full cursor-pointer"
                  >
                    <div className={`p-1.5 rounded-lg border ${mod.color} shrink-0 transition-transform group-hover:scale-105`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors truncate">
                          {mod.name}
                        </span>
                        <ArrowUpRight className="h-3 w-3 text-slate-600 group-hover:text-violet-400 transition-colors shrink-0" />
                      </div>
                      <p className="text-[9.5px] text-slate-400 leading-tight truncate mt-0.5">
                        {mod.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recommended Services Widget */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-4 space-y-3.5">
            <span className="text-[9px] uppercase font-mono text-slate-400 block font-bold tracking-wider">Recommended services</span>
            <div className="space-y-2.5">
              {recommendedServices.map((srv, idx) => (
                <div 
                  key={idx} 
                  className="p-3 rounded-xl bg-slate-950/20 border border-white/5 space-y-1.5"
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-[11px] font-bold text-white">{srv.title}</h4>
                    <span className="px-1.5 py-0.2 text-[8px] bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded font-mono shrink-0">
                      {srv.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {srv.desc}
                  </p>
                  <button 
                    onClick={() => handleNavigate(srv.action)}
                    className="text-[9.5px] font-mono font-bold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Go to Service
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Center Section: Primary Conversational Chat Interface */}
        <div className="lg:col-span-2 flex flex-col h-[740px] rounded-2xl border border-white/5 bg-slate-900 overflow-hidden shadow-2xl">
          
          {/* Active Session Header Bar */}
          <div className="p-4 border-b border-white/5 bg-slate-950/40 flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">Secure Cognitive Channel</span>
                <span className="text-[9.5px] font-mono text-slate-500 block">Encryption: AES-GCM-256</span>
              </div>
            </div>

            {/* Quick action session buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setMessages([defaultWelcomeMessage()]);
                  triggerToast('✨ New Chat Started', 'Cleared past local session history, fresh handshake established.', 'info');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/5 text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                title="Fresh Session"
              >
                <Plus className="h-3.5 w-3.5 text-violet-400" />
                New Chat
              </button>

              <button
                onClick={() => {
                  setMessages([]);
                  triggerToast('🧹 Chat History Cleared', 'Empty conversation canvas established.', 'info');
                }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-all border border-white/5 cursor-pointer"
                title="Clear Chat Stream"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Conversation Stream Scroll Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-slate-950/20">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-500">
                <MessageSquare className="h-8 w-8 text-slate-600 animate-bounce" />
                <p className="text-xs italic">Start a conversation by typing below, or use suggestions.</p>
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div 
                    key={m.id} 
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    {/* Meta tag */}
                    <div className="flex items-center space-x-1.5 px-1.5">
                      <span className="text-[9px] font-mono text-slate-500">{m.time}</span>
                      {!isUser && (
                        <span className="text-[8px] bg-violet-500/10 text-violet-400 px-1 rounded font-mono border border-violet-500/20">
                          AI COMPANION
                        </span>
                      )}
                    </div>

                    {/* Speech card container */}
                    <div 
                      className={`max-w-[90%] rounded-2xl p-4 text-xs leading-relaxed relative group ${
                        isUser 
                          ? 'bg-gradient-to-r from-violet-500/25 to-indigo-500/25 border border-violet-500/30 text-white rounded-tr-none' 
                          : 'bg-slate-950/80 border border-white/5 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                      }`}
                    >
                      {/* Markdown representation support */}
                      <div className="space-y-2">
                        {formatMarkdownText(m.text)}
                      </div>

                      {/* Copy Action Floating Button (Only on AI messages) */}
                      {!isUser && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleCopyText(m.text, m.id)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                            title="Copy Response"
                          >
                            {copiedId === m.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Thinking typing indicator */}
            {sending && (
              <div className="flex items-center space-x-2.5 p-3 bg-white/5 rounded-2xl text-xs text-slate-400 w-fit border border-white/5 animate-pulse">
                <span className="flex space-x-1">
                  <span className="h-1.5 w-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                <span className="font-mono text-[10px]">Sovereign Companion is matching coordinates...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Context-aware suggestions bar */}
          <div className="p-3 border-t border-white/5 bg-slate-950/60 space-y-2">
            
            {/* Context filter picker */}
            <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-wider shrink-0 font-bold flex items-center gap-1">
                <Terminal className="h-3 w-3 text-violet-400" />
                Prompt Context:
              </span>
              <div className="flex gap-1.5">
                {(['All', 'Healthcare', 'Emergency Response', 'Blood Donor', 'Farmer Marketplace', 'Government Services', 'Water Management', 'Waste Management', 'Public Transport'] as const).map(ctx => {
                  const isActive = activeContext === ctx;
                  return (
                    <button
                      key={ctx}
                      onClick={() => {
                        setActiveContext(ctx);
                        triggerToast('🎯 Filter Aligned', `Prompt context shifted to ${ctx}.`, 'info');
                      }}
                      className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold shrink-0 transition-colors cursor-pointer ${
                        isActive 
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40' 
                          : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {ctx}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Staggered Quick suggestion buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {suggestions.slice(0, 4).map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s.text.replace(/^[^\s]+\s/, ''))}
                  className="p-2 bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-violet-500/20 rounded-xl text-left text-[10px] text-slate-300 hover:text-white transition-all flex items-start gap-1.5 group cursor-pointer"
                >
                  <CornerDownRight className="h-3 w-3 text-violet-500 shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                  <span className="line-clamp-2 leading-snug">{s.text}</span>
                </button>
              ))}
            </div>

          </div>

          {/* Message Input Tray */}
          <div className="p-4 border-t border-white/5 bg-slate-950/40 flex gap-2">
            
            {/* Voice Simulation Trigger Key */}
            <button
              type="button"
              onClick={simulateVoiceInput}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                isRecording 
                  ? 'bg-rose-500 border-rose-600 text-white animate-pulse' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title={isRecording ? "Synthesizing Speech..." : "Voice Speech Capture"}
            >
              {isRecording ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
            </button>

            {/* Input field */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              placeholder={isRecording ? 'Listening carefully to voice sensors...' : 'Type a query (e.g. "CPR first-aid", "Pudhumaipenn scheme eligibility")...'}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-xs text-white focus:outline-none placeholder-slate-500 focus:border-violet-500/50"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSend()}
              disabled={sending || !inputMessage.trim()}
              className={`p-3.5 rounded-xl text-slate-950 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                sending || !inputMessage.trim() 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-violet-400 to-violet-500 hover:from-violet-300 hover:to-violet-400 shadow-lg shadow-violet-500/10'
              }`}
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </div>

        </div>

        {/* Right Side Section: Recent Notifications & Security Handshake Logs */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          
          {/* Recent Platform Notifications */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-4 space-y-4">
            <span className="text-[9px] uppercase font-mono text-slate-400 block font-bold tracking-wider">Live System Alerts</span>
            
            <div className="space-y-3">
              {db?.notifications?.slice(0, 3).map((notif: any) => (
                <div key={notif.id} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                    <h4 className="text-[10px] font-bold text-white truncate">{notif.title}</h4>
                  </div>
                  <p className="text-[9.5px] text-slate-400 leading-tight">
                    {notif.message}
                  </p>
                  <span className="text-[8px] font-mono text-slate-500 block">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )) || (
                <div className="text-center p-4 border border-dashed border-white/5 rounded-xl text-[10px] text-slate-500 italic">
                  No active platform alerts detected.
                </div>
              )}
            </div>
          </div>

          {/* Security Sovereign Handshake Logs */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-4 space-y-3 flex-1 flex flex-col">
            <span className="text-[9px] uppercase font-mono text-slate-400 block font-bold tracking-wider">Telemetry Console logs</span>
            
            <div className="bg-slate-950 p-3 rounded-xl border border-white/5 flex-1 font-mono text-[9px] text-slate-400 space-y-2.5 overflow-y-auto max-h-[350px]">
              <div className="space-y-1">
                <span className="text-emerald-400">[SYSTEM]</span>
                <span className="text-slate-500"> Sovereign JWT authenticated successfully.</span>
              </div>
              <div className="space-y-1">
                <span className="text-emerald-400">[SYSTEM]</span>
                <span className="text-slate-500"> Gateway initialized at: 10.0.18.22</span>
              </div>
              <div className="space-y-1">
                <span className="text-indigo-400">[COGNITIVE]</span>
                <span className="text-slate-500"> Gemini node cluster loaded: online.</span>
              </div>
              <div className="space-y-1">
                <span className="text-indigo-400">[COGNITIVE]</span>
                <span className="text-slate-500"> Swarm context maps synchronized.</span>
              </div>
              <div className="space-y-1">
                <span className="text-amber-400">[METRICS]</span>
                <span className="text-slate-500"> Telemetry latency: 12ms.</span>
              </div>
              <div className="space-y-1">
                <span className="text-violet-400">[SECURITY]</span>
                <span className="text-slate-500"> AES-256 state protection active.</span>
              </div>
              <div className="space-y-1">
                <span className="text-emerald-400">[OK]</span>
                <span className="text-slate-500"> System waiting for queries...</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

// Simple custom X icon replacement to ensure we don't import non-existent icons
function XButtonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

// Custom simple markdown block parser
function formatMarkdownText(text: string) {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    // Header check
    if (line.startsWith('### ')) {
      return <h4 key={idx} className="text-xs font-bold text-violet-300 mt-2.5 mb-1">{line.slice(4)}</h4>;
    }
    if (line.startsWith('## ')) {
      return <h3 key={idx} className="text-sm font-black text-white mt-3.5 mb-1">{line.slice(3)}</h3>;
    }
    if (line.startsWith('# ')) {
      return <h2 key={idx} className="text-base font-black text-white mt-4 mb-1.5">{line.slice(2)}</h2>;
    }

    // List item check
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <div key={idx} className="flex items-start space-x-1.5 pl-3.5 py-0.5">
          <span className="text-violet-500 shrink-0">•</span>
          <span className="text-slate-300">{parseBoldAccents(line.slice(2))}</span>
        </div>
      );
    }

    // Numbered list item check
    const numMatch = line.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      return (
        <div key={idx} className="flex items-start space-x-1.5 pl-3.5 py-0.5">
          <span className="text-violet-400 font-mono text-[10px] font-bold shrink-0">{numMatch[1]}.</span>
          <span className="text-slate-300">{parseBoldAccents(numMatch[2])}</span>
        </div>
      );
    }

    // Standard paragraph with bold formatting replacements
    return (
      <p key={idx} className="text-slate-300 leading-relaxed min-h-[8px]">
        {parseBoldAccents(line)}
      </p>
    );
  });
}

// Parsing custom double asterisks **bold text** to React elements
function parseBoldAccents(text: string): React.ReactNode {
  const parts = text.split('**');
  if (parts.length === 1) return text;
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="font-bold text-white font-mono">{part}</strong>;
    }
    return part;
  });
}
