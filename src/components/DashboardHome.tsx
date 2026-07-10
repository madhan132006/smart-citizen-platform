import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Heart, AlertTriangle, Droplet, Sprout, 
  MapPin, Clock, Plus, Zap, CheckCircle2, 
  TrendingUp, Activity, HelpCircle, Sparkles, Navigation, Layers, Waves,
  ShieldAlert, Gift, Award, GlassWater, Trash2, Bus, MessageSquare, 
  ShieldCheck, HeartPulse, Brain, BarChart3, Users, Landmark, ArrowRight,
  Globe, Search, CloudSun, Calendar, Shield, Cpu, RotateCcw, Compass,
  Eye, Radio, ChevronRight
} from 'lucide-react';
import MapOSM from './MapOSM';
import { User, GovtScheme, FarmProduct, EmergencyRequest, Appointment, HealthData, Medicine, AIAnalysis } from '../types';
import { analyzeHealth } from '../lib/healthAnalysis';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DashboardHomeProps {
  user: User | null;
  language: 'en' | 'ta' | 'hi';
  db: any;
  onNavigateToModule: (module: string) => void;
  onRefresh?: () => Promise<void>;
  searchTerm?: string;
}

// 1. COUNT-UP ANIMATION COMPONENT FOR METRICS
function AnimatedCounter({ value, duration = 1200 }: { value: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const target = parseInt(value, 10);

  useEffect(() => {
    if (isNaN(target)) return;
    let start = 0;
    const end = target;
    if (start === end) {
      setCount(end);
      return;
    }
    const step = Math.ceil(end / (duration / 25));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 25);

    return () => clearInterval(timer);
  }, [value, target, duration]);

  if (isNaN(target)) {
    return <span>{value}</span>;
  }
  return <span>{count.toLocaleString()}</span>;
}

// 2. LIVE CLOCK, DATE, WEATHER, AND TELEMETRY WIDGETS
function LiveTelemetryWidget({ language }: { language: 'en' | 'ta' | 'hi' }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatOptions: Intl.DateTimeFormatOptions = { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  };

  const formattedTime = time.toLocaleTimeString(language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-US', formatOptions);
  
  const formattedDate = time.toLocaleDateString(language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const weatherText = {
    en: "Chennai Metro • 31°C Overcast • AQI 34",
    ta: "சென்னை மெட்ரோ • 31°C மேகமூட்டம் • AQI 34",
    hi: "चेन्नई मेट्रो • 31°C मेघयुक्त • एक्यूआई 34"
  }[language] || "Chennai Metro • 31°C Overcast • AQI 34";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-cyan-500/10 rounded-2xl p-4 backdrop-blur-md text-xs font-mono select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <Clock className="h-4 w-4 animate-pulse" />
          <span className="font-bold tracking-widest">{formattedTime}</span>
        </div>
        <div className="text-slate-700">|</div>
        <div className="flex items-center gap-2 text-slate-300">
          <Calendar className="h-4 w-4" />
          <span>{formattedDate}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <CloudSun className="h-4 w-4" />
          <span>{weatherText}</span>
        </div>
        <div className="hidden lg:block text-slate-700">|</div>
        <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
          <Navigation className="h-3.5 w-3.5 text-cyan-500 animate-ping" />
          <span>Sovereign Coordinates: 13.0827° N, 80.2707° E</span>
        </div>
      </div>
    </div>
  );
}

// 3. ANNOUNCEMENTS TICKER BAR
function AnnouncementsTicker({ language }: { language: 'en' | 'ta' | 'hi' }) {
  const announcements = useMemo(() => {
    return {
      en: [
        "🚨 MUNICIPAL ALERT: Coastal water grid pressure regulation in Chennai scheduled today.",
        "🌾 FARMER INTELLIGENCE: Direct crop subsidies released - verify in Farmer Marketplace.",
        "💉 METRO BLOOD DIRECTORY: Urgent need for O-negative blood donors at General Hospital Chennai.",
        "🚌 SMART PUBLIC TRANSIT: 5 new electric high-speed transit buses added to the central fleet.",
        "🩺 HEALTH ADVISORY: Free multi-specialty wellness camp at Adyar Urban Clinic starts tomorrow."
      ],
      ta: [
        "🚨 நகராட்சி அறிவிப்பு: இன்று சென்னையில் கடலோர நீர் கட்டமைப்பு சீரமைப்பு பணிகள் நடைபெறும்.",
        "🌾 விவசாய அறிவுறுத்தல்: நேரடி பயிர் மானியம் வழங்கப்பட்டுள்ளது - விவசாய சந்தையில் சரிபார்க்கவும்.",
        "💉 இரத்த தான நெட்வொர்க்: சென்னை பொது மருத்துவமனையில் O-நெகட்டிவ் இரத்தம் அவசரமாக தேவைப்படுகிறது.",
        "🚌 ஸ்மார்ட் பொது போக்குவரத்து: மத்திய பேருந்து கடற்படையில் 5 புதிய அதிவேக மின்சார பேருந்துகள் சேர்ப்பு.",
        "🩺 சுகாதார ஆலோசனை: அடையாறு நகர்ப்புற கிளினிக்கில் நாளை இலவச சிறப்பு மருத்துவ முகாம் தொடக்கம்."
      ],
      hi: [
        "🚨 नगर पालिका चेतावनी: चेन्नई में आज तटीय जल ग्रिड दबाव नियंत्रण कार्य निर्धारित है।",
        "🌾 किसान मूल्य सलाह: प्रत्यक्ष फसल सब्सिडी जारी - किसान बाजार मॉड्यूल में विवरण देखें।",
        "💉 रक्तदाता नेटवर्क: चेन्नई सामान्य अस्पताल में ओ-नेगेटिव रक्त की तत्काल आवश्यकता है।",
        "🚌 सार्वजनिक परिवहन: केंद्रीय बेड़े में 5 नई इलेक्ट्रिक हाई-स्पीड ट्रांजिट बसें जोड़ी गईं।",
        "🩺 स्वास्थ्य परामर्श: अडयार शहरी क्लिनिक में कल से मुफ्त बहु-विशेषज्ञता कल्याण शिविर शुरू होगा।"
      ]
    }[language] || [];
  }, [language]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % announcements.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [announcements]);

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-red-500/10 via-slate-900/80 to-cyan-500/10 border-y border-white/5 py-2.5 px-4 backdrop-blur-sm select-none">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <span className="flex h-2 w-2 relative shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
        </span>
        <span className="text-[10px] font-mono font-extrabold tracking-wider text-rose-400 uppercase shrink-0">
          {language === 'ta' ? 'அறிவிப்பு' : language === 'hi' ? 'घोषणा' : 'ANNOUNCEMENT'}
        </span>
        <div className="h-4 w-[1px] bg-white/10 shrink-0" />
        <div className="flex-1 overflow-hidden relative h-5">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xs text-slate-300 font-mono truncate"
            >
              {announcements[index]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// 4. LIVE COGNITIVE AI OPERATOR WITH TYPEWRITER EFFECT & SUGGESTIONS
function AIAssistantHologram({ language, onClick }: { language: 'en' | 'ta' | 'hi'; onClick: () => void }) {
  const greetings = useMemo(() => {
    return {
      en: [
        "Sovereign AI Operator online.",
        "How can I help you today?",
        "Ask me about medical beds, emergency rescue, or welfare scheme eligibility...",
        "I can optimize food donation routes and predict regional crop prices."
      ],
      ta: [
        "AI ஆபரேட்டர் ஆன்லைனில் உள்ளது.",
        "இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
        "மருத்துவ படுக்கைகள், அவசரகால மீட்பு அல்லது தகுதி பற்றி என்னிடம் கேளுங்கள்...",
        "உணவு தானப் பாதைகளை மேம்படுத்தி விவசாய சந்தை விலையை என்னால் கணிக்க முடியும்."
      ],
      hi: [
        "एआई ऑपरेटर ऑनलाइन है।",
        "आज मैं आपकी क्या सहायता कर सकता हूँ?",
        "चिकित्सा बिस्तरों, आपातकालीन बचाव या योजनाओं के बारे में मुझसे पूछें...",
        "मैं भोजन वितरण मार्ग को अनुकूलित और फसल मूल्य की भविष्यवाणी कर सकता हूँ।"
      ]
    }[language] || [];
  }, [language]);

  const [currentText, setCurrentText] = useState('');
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const text = greetings[greetingIndex];
    let timer: any;

    if (isDeleting) {
      timer = setTimeout(() => {
        setCurrentText(text.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
      }, 15);
    } else {
      timer = setTimeout(() => {
        setCurrentText(text.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
      }, 40);
    }

    if (!isDeleting && charIndex === text.length) {
      timer = setTimeout(() => setIsDeleting(true), 3500);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setGreetingIndex(prev => (prev + 1) % greetings.length);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, greetingIndex, greetings]);

  return (
    <div 
      onClick={onClick}
      className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/20 via-slate-900/80 to-indigo-950/20 p-6 shadow-2xl hover:border-violet-500/40 transition-all cursor-pointer group flex flex-col justify-between h-56"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/10 via-transparent to-cyan-500/10 opacity-60 group-hover:scale-105 transition-transform duration-700 pointer-events-none" />
      
      <div className="absolute -right-16 -top-16 w-32 h-32 bg-violet-500/15 rounded-full blur-2xl group-hover:bg-violet-500/25 transition-all pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Sparkles className="h-4.5 w-4.5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-violet-400 font-mono tracking-widest uppercase">
                {language === 'ta' ? 'லைஃப் கனெக்ட் AI' : language === 'hi' ? 'लाइफकनेक्ट एआई' : 'LIFECONNECT COGNITIVE OPERATOR'}
              </h4>
              <p className="text-[9px] text-slate-500 font-mono">MODEL: GEMINI-3.5-FLASH-COGNITIVE</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full text-[9px] font-mono text-violet-300 font-bold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-ping" />
            <span>Active</span>
          </div>
        </div>

        {/* Animated Soundwave lines */}
        <div className="flex items-center gap-1.5 h-6">
          {[4, 12, 18, 10, 24, 14, 8, 20, 15, 6, 12, 4].map((h, i) => (
            <motion.div
              key={i}
              animate={{ 
                height: [h, h * 0.4, h * 1.5, h]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.08,
                ease: "easeInOut"
              }}
              className="w-1 rounded-full bg-gradient-to-t from-violet-500 to-cyan-400 opacity-80"
            />
          ))}
        </div>

        {/* Auto typing text area */}
        <div className="h-12 flex items-start">
          <p className="text-xs font-semibold text-slate-200 font-sans leading-relaxed">
            {currentText}
            <span className="inline-block w-1.5 h-4 bg-violet-400 ml-1 animate-pulse" />
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-violet-400 pt-2 border-t border-white/5">
        <span>{language === 'ta' ? 'அரட்டையைத் தொடங்கவும்' : language === 'hi' ? 'चैट शुरू करें' : 'INITIALIZE FULL CHAT FEED'}</span>
        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1.5 transition-transform" />
      </div>
    </div>
  );
}

// 5. INTERACTIVE SOVEREIGN INDIA GIS NETWORK MAP
// 6. MAIN HIGH-FIDELITY DASHBOARD COMPONENT
export default function DashboardHome({
  user,
  language,
  db,
  onNavigateToModule,
  onRefresh,
  searchTerm = ''
}: DashboardHomeProps) {
  const [mapFilter, setMapFilter] = useState<'all' | 'hospital' | 'blood' | 'utility' | 'emergency'>('all');
  const [selectedMapPin, setSelectedMapPin] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const triggerSync = async () => {
      if (onRefresh) {
        setLoading(true);
        setError(null);
        try {
          await onRefresh();
        } catch (err: any) {
          if (isMounted) {
            setError(err.message || "Failed to synchronize platform databases.");
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };
    triggerSync();
    return () => {
      isMounted = false;
    };
  }, [onRefresh]);

  const formatMetricValue = (collection: any[] | undefined, filterFn?: (item: any) => boolean) => {
    if (loading) return 'LOADING';
    if (collection === undefined || collection === null) return 'No Data Available';
    const items = filterFn ? collection.filter(filterFn) : collection;
    if (items.length === 0) return '0';
    return items.length.toString();
  };

  const activeServicesCount = (
    (db.emergencies?.filter((e: any) => e.status !== 'Resolved').length || 0) +
    (db.appointments?.filter((a: any) => a.status !== 'Completed' && a.status !== 'Cancelled').length || 0) +
    (db.foodDonations?.filter((f: any) => f.status === 'Available' || f.status === 'Assigned').length || 0) +
    (db.schemeApplications?.filter((s: any) => s.status !== 'Approved' && s.status !== 'Rejected').length || 0) +
    (db.waterComplaints?.filter((w: any) => w.status !== 'Resolved').length || 0) +
    (db.wasteComplaints?.filter((w: any) => w.status !== 'Resolved').length || 0)
  );

  const getResolutionPct = (list: any[]) => {
    if (!list || list.length === 0) return 0;
    const resolved = list.filter(item => item.status === 'Resolved' || item.status === 'Resolved/Delivered' || item.status === 'Approved' || item.status === 'Delivered').length;
    return Math.round((resolved / list.length) * 100);
  };

  const healthcarePct = getResolutionPct(db.appointments || []);
  const waterPct = getResolutionPct(db.waterComplaints || []);
  const wastePct = getResolutionPct(db.wasteComplaints || []);
  const emergencyPct = getResolutionPct(db.emergencies || []);

  const t = {
    en: {
      heroTitle: "LifeConnect AI",
      heroSubtitle: "Smart Citizen Assistance Platform",
      heroTagline: "One Platform for Smart Healthcare, Emergency Response, Public Services, and Community Welfare.",
      heroDesc: "Empowering smart cities through an AI-driven, citizen-centric operating system. Seamlessly connect with emergency services, healthcare networks, regional agriculture, municipal resources, and welfare systems with zero friction.",
      exploreServices: "Explore Services",
      aiAssistantBtn: "AI Assistant",
      statsTitle: "Platform Dashboard Metrics",
      statCitizens: "Total Citizens",
      statActive: "Active Services",
      statEmergency: "Emergency Cases Today",
      statDonors: "Blood Donors",
      statFood: "Food Donations",
      statFarmers: "Farmers Registered",
      diagTitle: "Civic Grid Telemetry Diagnostics",
      diagWater: "Pending Water Leaks",
      diagWaste: "Sanitation Backlog",
      diagBloodDrives: "Active Blood Drives",
      diagCrops: "Listed Market Crops",
      diagAppts: "Booked Medical Slots",
      liveControl: "Live GIS Control Center",
      liveControlDesc: "Real-time municipal telemetry, emergency alerts, and regional diagnostic sensors.",
      whyTitle: "Why Choose LifeConnect AI?",
      whySubtitle: "Empowering the public grid with secure, automated, real-time intelligence operations.",
      whyAiTitle: "AI Powered",
      whyAiDesc: "Smart automatic triage, symptoms diagnostic advisor, and optimized food donation routing.",
      whyFastTitle: "Fast Response",
      whyFastDesc: "Real-time SOS emergency panic broadcasting with instant paramedics dispatch.",
      whySecureTitle: "Secure Platform",
      whySecureDesc: "Role-based cryptographic identity handshakes and secure data isolation.",
      whyRtTitle: "Real-Time Updates",
      whyRtDesc: "Instant live updates of water leak reports, bed availabilities, and transit logs.",
      whyAnalyticsTitle: "Smart Analytics",
      whyAnalyticsDesc: "Detailed regional demand prediction curves, resolution tracking, and audits.",
      whyCitizenTitle: "Citizen-Centric Services",
      whyCitizenDesc: "Accessible, humble, and responsive UI supporting English, Tamil, and Hindi.",
      recentTitle: "Recent Live Activities",
      recentSubtitle: "Live audit trail of community actions, marketplace deals, and resolution logs.",
      openModule: "Open Module",
      mapLabel: "Chennai Smart GIS Grid",
      mapSub: "Click any active coordinate node to track sensor data streams.",
      appointmentsTitle: "Upcoming Hospital Slots",
      noAppointments: "No medical slots scheduled today.",
      emergencyTitle: "Active Dispatch Missions",
      noEmergencies: "All emergency nodes currently cleared.",
      resolutionTitle: "Regional Resolution Efficiency",
      footerText: "© 2026 LifeConnect AI – Smart Citizen Assistance Platform | Empowering Smart Cities Through AI",
      aiRec: "AI Sovereign Recommendation Engine"
    },
    ta: {
      heroTitle: "லைஃப்கனெக்ட் AI",
      heroSubtitle: "ஸ்மார்ட் குடிமக்கள் உதவித் தளம்",
      heroTagline: "ஸ்மார்ட் சுகாதாரம், அவசரகால உதவி, பொதுச் சேவைகள் மற்றும் சமூக நலனுக்கான ஒரே தளம்.",
      heroDesc: "செயற்கை நுண்ணறிவு மூலம் ஸ்மார்ட் நகரங்களை மேம்படுத்துகிறது. அவசரச் சேவைகள், சுகாதார நெட்வொர்க்குகள், விவசாயம் மற்றும் நகராட்சி ஆதாரங்களுடன் தடையின்றி இணையுங்கள்.",
      exploreServices: "சேவைகளை ஆராய்க",
      aiAssistantBtn: "AI உதவியாளர்",
      statsTitle: "தளத்தின் கட்டுப்பாட்டு அளவீடுகள்",
      statCitizens: "மொத்த குடிமக்கள்",
      statActive: "செயலில் உள்ள சேவைகள்",
      statEmergency: "இன்றைய அவசர வழக்குகள்",
      statDonors: "இரத்தக் கொடையாளர்கள்",
      statFood: "உணவு நன்கொடைகள்",
      statFarmers: "பதிவுசெய்த விவசாயிகள்",
      diagTitle: "நகராட்சி பொதுக் கட்டமைப்பு அளவீடுகள்",
      diagWater: "நீர் கசிவுப் புகார்கள்",
      diagWaste: "கழிவு மேலாண்மைப் புகார்கள்",
      diagBloodDrives: "இரத்த தானத் தேவைகள்",
      diagCrops: "பட்டியலிடப்பட்ட பயிர்கள்",
      diagAppts: "பதிவுசெய்யப்பட்ட மருத்துவ இடங்கள்",
      liveControl: "நேரடி GIS கட்டுப்பாட்டு மையம்",
      liveControlDesc: "நகராட்சித் தரவுகள், அவசரகால எச்சரிக்கைகள் மற்றும் பிராந்திய உணரி நெட்வொர்க்.",
      whyTitle: "ஏன் லைஃப்கனெக்ட் AI-ஐ தேர்வு செய்ய வேண்டும்?",
      whySubtitle: "பாதுகாப்பான, தானியங்கி மற்றும் நேரடிப் புதுப்பிப்புகள் மூலம் பொதுச் சேவைகளை மேம்படுத்துதல்.",
      whyAiTitle: "AI இன் ஆற்றல்",
      whyAiDesc: "தானியங்கி அவசரத் தேர்வு, நோயறிதல் ஆலோசனைகள் மற்றும் உகந்த உணவு விநியோகப் பாதைகள்.",
      whyFastTitle: "விரைவான பதிலளிப்பு",
      whyFastDesc: "உடனடி ஆம்புலன்ஸ் மற்றும் மீட்புக் குழுக்களுக்கான நேரடி அவசரகால SOS எச்சரிக்கை அமைப்பு.",
      whySecureTitle: "பாதுகாப்பான தளம்",
      whySecureDesc: "பயனர் சுயவிவரங்களுக்கான பாதுகாப்பான குறியாக்கவியல் அடையாளங்கள் மற்றும் தரவு பாதுகாப்பு.",
      whyRtTitle: "நேரடி அறிவிப்புகள்",
      whyRtDesc: "குடிநீர் கசிவு, படுக்கை இருப்பு மற்றும் பொதுப் போக்குவரத்து குறித்த நேரடிப் புதுப்பிப்புகள்.",
      whyAnalyticsTitle: "ஸ்மார்ட் பகுப்பாய்வு",
      whyAnalyticsDesc: "பிராந்தியத் தேவைகள், தீர்வு கண்காணிப்பு மற்றும் தணிக்கைகளுக்கான விரிவான தரவு நுண்ணறிவு.",
      whyCitizenTitle: "குடிமக்கள்-மைய சேவைகள்",
      whyCitizenDesc: "ஆங்கிலம், தமிழ் மற்றும் இந்தி மொழிகளை ஆதரிக்கும் எளிமையான மற்றும் பொறுப்பான பயனர் இடைமுகம்.",
      recentTitle: "சமீபத்திய நேரடி நடவடிக்கைகள்",
      recentSubtitle: "சமூக நடவடிக்கைகள், சந்தைப் பரிவர்த்தனைகள் மற்றும் தீர்வுப் பதிவுகள்.",
      openModule: "தொகுதியைத் திற",
      mapLabel: "சென்னை ஸ்மார்ட் GIS வரைபடம்",
      mapSub: "உணரித் தரவைக் கண்டறிய வரைபடத்தில் உள்ள புள்ளிகளை சொடுக்கவும்.",
      appointmentsTitle: "வரவிருக்கும் மருத்துவ சந்திப்புகள்",
      noAppointments: "இன்று மருத்துவ சந்திப்புகள் எதுவும் இல்லை.",
      emergencyTitle: "செயலில் உள்ள மீட்புப் பணிகள்",
      noEmergencies: "அனைத்து அவசரக் கோரிக்கைகளும் தீர்க்கப்பட்டன.",
      resolutionTitle: "பிராந்தியத் தீர்வுத் திறன்",
      footerText: "© 2026 லைஃப்கனெக்ட் AI – ஸ்மார்ட் குடிமக்கள் உதவித் தளம் | AI மூலம் ஸ்மார்ட் நகரங்களை மேம்படுத்துதல்",
      aiRec: "AI பரிந்துரை இயந்திரம்"
    },
    hi: {
      heroTitle: "लाइफकनेक्ट AI",
      heroSubtitle: "स्मार्ट नागरिक सहायता मंच",
      heroTagline: "स्मार्ट स्वास्थ्य सेवा, आपातकालीन प्रतिक्रिया, सार्वजनिक सेवाओं और सामुदायिक कल्याण के लिए एक मंच।",
      heroDesc: "एआई-संचालित नागरिक सेवा प्रणाली के माध्यम से स्मार्ट शहरों को सशक्त बनाना। आपातकालीन सेवाओं, स्वास्थ्य नेटवर्क, कृषि और नगर निगम संसाधनों से आसानी से जुड़ें।",
      exploreServices: "सेवाएं देखें",
      aiAssistantBtn: "एआई सहायक",
      statsTitle: "प्लेटफॉर्म डैशबोर्ड मेट्रिक्स",
      statCitizens: "कुल नागरिक",
      statActive: "सक्रिय सेवाएं",
      statEmergency: "आज के आपातकालीन मामले",
      statDonors: "रक्तदाता",
      statFood: "अन्न दान योजना",
      statFarmers: "पंजीकृत किसान",
      diagTitle: "नगर पालिका ग्रिड टेलीमेट्री मेट्रिक्स",
      diagWater: "लंबित पानी रिसाव",
      diagWaste: "कचरा प्रबंधन शिकायतें",
      diagBloodDrives: "सक्रिय रक्त मांगें",
      diagCrops: "सूचीबद्ध फसलें",
      diagAppts: "आरक्षित चिकित्सा स्लॉट",
      liveControl: "लाइव जीआईएस नियंत्रण केंद्र",
      liveControlDesc: "वास्तविक समय नगर निगम डेटा, आपातकालीन चेतावनी और नैदानिक सेंसर ग्रिड।",
      whyTitle: "लाइफकनेक्ट AI क्यों चुनें?",
      whySubtitle: "सुरक्षित, स्वचालित और वास्तविक समय खुफिया संचालन के साथ सार्वजनिक ग्रिड को मजबूत करना।",
      whyAiTitle: "एआई संचालित",
      whyAiDesc: "स्मार्ट स्वचालित आपातकालीन वर्गीकरण, चिकित्सा निदान और भोजन दान मार्ग का अनुकूलन।",
      whyFastTitle: "त्वरित प्रतिक्रिया",
      whyFastDesc: "तत्काल प्रतिक्रिया और राहत के लिए वास्तविक समय एसओएस आपातकालीन अलार्म प्रसारण।",
      whySecureTitle: "सुरक्षित मंच",
      whySecureDesc: "भूमिका आधारित सुरक्षित पहचान प्रणाली और सुदृढ़ सुरक्षा डेटा अलगाव।",
      whyRtTitle: "लाइव अपडेट",
      whyRtDesc: "जल रिसाव, अस्पताल बिस्तर उपलब्धता और सार्वजनिक परिवहन पर तुरंत अपडेट प्राप्त करें।",
      whyAnalyticsTitle: "स्मार्ट विश्लेषण",
      whyAnalyticsDesc: "विस्तृत क्षेत्रीय मांग चार्ट, समाधान प्रगति ट्रैकिंग और सटीक ऑडिट लॉग।",
      whyCitizenTitle: "नागरिक केंद्रित सेवाएं",
      whyCitizenDesc: "अंग्रेजी, तमिल और हिंदी भाषा का समर्थन करने वाला अत्यंत सुलभ और संवेदनशील इंटरफ़ेस।",
      recentTitle: "हालिया लाइव गतिविधियां",
      recentSubtitle: "नगर निगम सहायता नेटवर्क से लाइव गतिविधियों और समाधानों की वास्तविक जानकारी।",
      openModule: "मॉड्यूल खोलें",
      mapLabel: "चेन्नई स्मार्ट जीआईएस ग्रिड",
      mapSub: "सक्रिय नोड्स की जानकारी और सेंसर डेटा देखने के लिए मानचित्र पर क्लिक करें।",
      appointmentsTitle: "आगामी अस्पताल स्लॉट",
      noAppointments: "आज कोई स्लॉट निर्धारित नहीं है।",
      emergencyTitle: "सक्रिय बचाव मिशन",
      noEmergencies: "सभी आपातकालीन नोड्स वर्तमान में सुरक्षित हैं।",
      resolutionTitle: "क्षेत्रीय समाधान दक्षता",
      footerText: "© 2026 लाइफकनेक्ट AI – स्मार्ट नागरिक सहायता मंच | एआई के माध्यम से स्मार्ट शहरों का सशक्तिकरण",
      aiRec: "एआई संप्रभु सिफारिश इंजन"
    }
  };

  const currentT = t[language] || t['en'];

  // Unified 10 modular smart service cards metadata mapping
  const servicesData = [
    {
      id: 'healthcare',
      title: language === 'ta' ? 'ஸ்மார்ட் சுகாதாரம்' : language === 'hi' ? 'स्मार्ट स्वास्थ्य सेवा' : 'Smart Healthcare',
      desc: language === 'ta' ? 'மருத்துவர் சந்திப்புகளை முன்பதிவு செய்யவும், படுக்கைகளைக் கண்காணிக்கவும், AI ஆலோசனையைப் பெறவும்.' : language === 'hi' ? 'चिकित्सक स्लॉट बुक करें, बिस्तरों की स्थिति देखें, और एआई लक्षण निदान से बात करें।' : 'Book priority doctor appointments, trace available hospital beds, and consult symptom diagnostic AI.',
      icon: HeartPulse,
      color: 'from-rose-500/10 to-rose-500/5 hover:border-rose-500/30 text-rose-400 border-rose-500/10 hover:shadow-rose-500/10',
      iconBg: 'bg-rose-500/10 text-rose-400'
    },
    {
      id: 'emergency',
      title: language === 'ta' ? 'அவசரகால உதவி' : language === 'hi' ? 'आपातकालीन प्रतिक्रिया' : 'Emergency Response',
      desc: language === 'ta' ? 'உடனடி SOS அலாரங்கள். அருகில் உள்ள ஆம்புலன்ஸ், தீயணைப்பு, காவல்துறை மீட்புக் குழுக்களுக்குத் தொடர்பு.' : language === 'hi' ? 'त्वरित एसओएस पैनिक रूटिंग। पास के एम्बुलेंस, दमकल और पुलिस को तत्काल सूचित करें।' : 'Instant SOS panic routing. Direct GPS telemetry to nearby ambulance, fire, police, and disaster squads.',
      icon: ShieldAlert,
      color: 'from-red-500/10 to-red-500/5 hover:border-red-500/30 text-red-400 border-red-500/10 hover:shadow-red-500/10',
      iconBg: 'bg-red-500/10 text-red-400'
    },
    {
      id: 'blood',
      title: language === 'ta' ? 'இரத்த தான நெட்வொர்க்' : language === 'hi' ? 'रक्तदाता नेटवर्क' : 'Blood Donor Network',
      desc: language === 'ta' ? 'கொடையாளராகப் பதிவுசெய்யவும், அவசர இரத்தத் தேவைகளைப் பதிவிடவும், அருகில் கொடையாளர்களைக் காணவும்.' : language === 'hi' ? 'रक्तदाता के रूप में पंजीकरण करें, आपातकालीन रक्त मांगें पोस्ट करें और दाताओं को खोजें।' : 'Register as a donor, post emergency blood requirements, and view active compatible donors in your area.',
      icon: Droplet,
      color: 'from-rose-600/10 to-rose-600/5 hover:border-rose-600/30 text-rose-500 border-rose-600/10 hover:shadow-rose-600/10',
      iconBg: 'bg-rose-600/10 text-rose-500'
    },
    {
      id: 'food',
      title: language === 'ta' ? 'உணவு தானம்' : language === 'hi' ? 'अन्न दान योजना' : 'Food Donation',
      desc: language === 'ta' ? 'உணவகங்களின் உபரி உணவுகளைப் பட்டியலிடவும், தன்னார்வலர்கள் மூலம் விநியோகிக்கவும்.' : language === 'hi' ? 'रेस्तरां के अधिशेष भोजन को पंजीकृत करें, स्वयंसेवकों को खोजें और वितरण देखें।' : 'List surplus restaurant food parcels, claim transport dispatches, and track real-time shelter deliveries.',
      icon: Gift,
      color: 'from-emerald-500/10 to-emerald-500/5 hover:border-emerald-500/30 text-emerald-400 border-emerald-500/10 hover:shadow-emerald-500/10',
      iconBg: 'bg-emerald-500/10 text-emerald-400'
    },
    {
      id: 'farmer',
      title: language === 'ta' ? 'விவசாய சந்தை' : language === 'hi' ? 'किसान बाजार' : 'Farmer Marketplace',
      desc: language === 'ta' ? 'விவசாயிகளுக்கான நேரடிச் சந்தை, விலை முன்னறிவிப்புகள் மற்றும் பயிர் தேவை பகுப்பாய்வுகள்.' : language === 'hi' ? 'कृषि मूल्य सलाह, मिट्टी स्वास्थ्य विश्लेषण और फसल मांग ट्रैकिंग के साथ किसान बाजार।' : 'Dynamic organic marketplace with agronomist pricing advice, soil analytics, and crop demand tracking.',
      icon: Sprout,
      color: 'from-lime-500/10 to-lime-500/5 hover:border-lime-500/30 text-lime-400 border-lime-500/10 hover:shadow-lime-500/10',
      iconBg: 'bg-lime-500/10 text-lime-400'
    },
    {
      id: 'govt',
      title: language === 'ta' ? 'அரசு சேவைகள்' : language === 'hi' ? 'सरकारी योजनाएं' : 'Government Services',
      desc: language === 'ta' ? 'அரசு நலத்திட்டங்களைக் கண்டறிந்து விண்ணப்பிக்கவும், தகுதி நிலைமைகளைச் சரிபார்க்கவும்.' : language === 'hi' ? 'क्षेत्रीय कल्याण योजनाओं का पता लगाएं, पात्रता जांचें और आवेदन की स्थिति देखें।' : 'Explore and apply for regional welfare schemes, trace eligibility criteria, and check application status.',
      icon: Award,
      color: 'from-cyan-500/10 to-cyan-500/5 hover:border-cyan-500/30 text-cyan-400 border-cyan-500/10 hover:shadow-cyan-500/10',
      iconBg: 'bg-cyan-500/10 text-cyan-400'
    },
    {
      id: 'water',
      title: language === 'ta' ? 'நீர் மேலாண்மை' : language === 'hi' ? 'जल प्रबंधन' : 'Water Management',
      desc: language === 'ta' ? 'குடிநீர் குழாய் கசிவுகளைப் புகாரளிக்கவும், நகராட்சிப் பராமரிப்புப் பணிகளைக் கண்காணிக்கவும்.' : language === 'hi' ? 'पानी के पाइप लीक होने की रिपोर्ट करें, मरम्मत की स्थिति और स्थानीय आपूर्ति समय देखें।' : 'Report water pipeline leakages, monitor civic repair tasks, and check local consumption levels.',
      icon: GlassWater,
      color: 'from-sky-500/10 to-sky-500/5 hover:border-sky-500/30 text-sky-400 border-sky-500/10 hover:shadow-sky-500/10',
      iconBg: 'bg-sky-500/10 text-sky-400'
    },
    {
      id: 'waste',
      title: language === 'ta' ? 'கழிவு மேலாண்மை' : language === 'hi' ? 'कचरा प्रबंधन' : 'Waste Management',
      desc: language === 'ta' ? 'குப்பைக் கழிவுகள் மற்றும் அசுத்தமான பகுதிகள் குறித்துப் புகாரளிக்கவும், வண்டிகளைக் கண்காணிக்கவும்.' : language === 'hi' ? 'कचरा और स्वच्छता संबंधी शिकायतें दर्ज करें, संग्रहण वाहनों और कार्यक्रम को ट्रैक करें।' : 'File sanitation and overflowing waste container complaints, track garbage compactors, and view schedules.',
      icon: Trash2,
      color: 'from-teal-500/10 to-teal-500/5 hover:border-teal-500/30 text-teal-400 border-teal-500/10 hover:shadow-teal-500/10',
      iconBg: 'bg-teal-500/10 text-teal-400'
    },
    {
      id: 'transport',
      title: language === 'ta' ? 'பொது போக்குவரத்து' : language === 'hi' ? 'सार्वजनिक परिवहन' : 'Public Transport',
      desc: language === 'ta' ? 'பேருந்துகளின் நேரடி இருப்பிடங்களைக் கண்டறியவும், பேருந்து நேர அட்டவணையை அறியவும்.' : language === 'hi' ? 'बसों के लाइव मार्ग, आगमन समय और स्थानीय बस स्टॉप की समय सारिणी देखें।' : 'Trace live bus routes, view regional transport tables, and find estimated arrivals at your local stops.',
      icon: Bus,
      color: 'from-blue-500/10 to-blue-500/5 hover:border-blue-500/30 text-blue-400 border-blue-500/10 hover:shadow-blue-500/10',
      iconBg: 'bg-blue-500/10 text-blue-400'
    },
    {
      id: 'ai-chat',
      title: language === 'ta' ? 'AI ஒருங்கிணைந்த அரட்டை' : language === 'hi' ? 'एआई एकीकृत चैट' : 'AI Unified Assistant',
      desc: language === 'ta' ? 'நகராட்சிப் பிரச்சினைகள், அரசுத் திட்டங்கள் பற்றி விளக்கம் பெற எங்களின் AI-உடன் அரட்டையடிக்கவும்.' : language === 'hi' ? 'नागरिक मुद्दों को हल करने और विभिन्न सरकारी योजनाओं को स्पष्ट करने के लिए एआई से बात करें।' : 'Chat with our LLM-powered virtual assistant to solve civic problems, clarify schemes, and get quick advice.',
      icon: Sparkles,
      color: 'from-violet-500/10 to-violet-500/5 hover:border-violet-500/30 text-violet-400 border-violet-500/10 hover:shadow-violet-500/10',
      iconBg: 'bg-violet-500/10 text-violet-400'
    }
  ];

  const filteredServices = useMemo(() => {
    if (!searchTerm) return servicesData;
    const term = searchTerm.toLowerCase();
    return servicesData.filter(
      s => s.title.toLowerCase().includes(term) || s.desc.toLowerCase().includes(term)
    );
  }, [servicesData, searchTerm]);

  // Dynamic AI Recommendations based on current user role
  const getAiRecommendations = () => {
    if (user?.role === 'farmer') {
      return {
        title: language === 'ta' ? '🌾 விவசாய ஆலோசனைக் குழு: நெற்பயிர் நீர்ப்பாசனம்' : '🌾 Agronomist Advisory: Paddy Irrigation & Salem Tomatoes',
        rec: language === 'ta' ? 'அடுத்த 48 மணிநேரத்திற்கு வானம் மேகமூட்டத்துடன் காணப்படும் என்பதால் நீர்ப்பாசனத்தைக் கட்டுப்படுத்தவும். தக்காளிச் சந்தை விலை சேலத்தில் சிறப்பாக உள்ளது.' : 'Due to overcast weather predicted over the next 48 hours, limit overhead sprinklers. Tomato market demand is High at Salem center (₹32/kg). Secure harvesting by tomorrow morning to avoid fungal rust.'
      };
    } else if (user?.role === 'ngo' || user?.role === 'volunteer') {
      return {
        title: language === 'ta' ? '🎁 உபரி உணவு விநியோக உகந்த பரிந்துரை' : '🎁 Surplus Food Optimization Advisory',
        rec: language === 'ta' ? 'சங்கீதா உணவகத்தில் 30 சைவ உணவுப் பொட்டலங்கள் தயாராக உள்ளன. தன்னார்வலர் தினேஷ் கார்த்திக் உடனடியாக விநியோகிக்க அறிவுறுத்தப்படுகிறார்.' : 'Sangeetha Restaurant has 30 excess vegetarian meals expiring in 2 hours. Volunteer Dinesh Karthik is nearby. Dispatch immediate pickup for distributing at Adyar shelter block 3.'
      };
    } else if (user?.role === 'admin' || user?.role === 'government') {
      return {
        title: language === 'ta' ? '📊 நகராட்சி நிர்வாக வள விநியோக உகந்த பரிந்துரை' : '📊 Administrative Resource Advisory',
        rec: language === 'ta' ? 'அண்ணா நகரில் மெட்ரோ குடிநீர் கசிவுப் புகார் முக்கியமானதாகக் குறிக்கப்பட்டுள்ளது. உடனடியாகப் பழுதுபார்க்கும் பிரிவை அனுப்பவும்.' : 'Metro water pipe leak complaint at Anna Nagar (ID: water-1) is flagged critical priority. Dispatch repair unit immediately. Blood bank group O- is running low in Metro General Hospital.'
      };
    } else {
      return {
        title: language === 'ta' ? '🏛️ அரசு நலத்திட்டத் தகுதி: புதுமைப்பெண் திட்டம்' : '🏛️ Welfare eligibility: Pudhumaipenn & Old Age Pension',
        rec: language === 'ta' ? 'உங்கள் சுயவிவரத்தின்படி, நீங்கள் அம்மா விரிவான காப்பீட்டுத் திட்டத்திற்குத் தகுதியானவர். ₹5 லட்சம் ரொக்கமில்லாப் பாதுகாப்பிற்கு விண்ணப்பிக்கவும்.' : 'Based on your profile, you are eligible for the Amma Comprehensive Health Insurance Scheme. We recommend pre-applying to unlock ₹5 Lakhs cashless protection.'
      };
    }
  };

  const aiAdvice = getAiRecommendations();

  const handleScrollToServices = () => {
    const el = document.getElementById('services-grid-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Compile realistic live system logs and activities
  const getRecentActivities = () => {
    const list: any[] = [];
    
    // Process real database emergencies
    db.emergencies?.forEach((e: any) => {
      list.push({
        id: `sos-${e.id}`,
        title: `${e.type} Rescue Dispatch`,
        desc: `SOS reported: "${e.description}" at ${e.address || 'Chennai Metropolitan'}.`,
        time: e.timestamp ? new Date(e.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just Now',
        status: e.status,
        color: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      });
    });

    // Process real database water complaints
    db.waterComplaints?.forEach((c: any) => {
      list.push({
        id: `water-${c.id}`,
        title: `Water Utility Grievance`,
        desc: `Reported pipeline leak: "${c.type}" at ${c.address || 'Chennai'}.`,
        time: c.date || 'Today',
        status: c.status,
        color: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
      });
    });

    // Process real database waste complaints
    db.wasteComplaints?.forEach((c: any) => {
      list.push({
        id: `waste-${c.id}`,
        title: `Sanitation Grievance`,
        desc: `Reported waste collection issue: "${c.type}" at ${c.address || 'Chennai'}.`,
        time: c.date || 'Today',
        status: c.status,
        color: 'bg-teal-500/10 text-teal-400 border-teal-500/20'
      });
    });

    // Process real database donors registered
    db.donors?.forEach((d: any) => {
      list.push({
        id: `donor-${d.id}`,
        title: `Blood Donor Joined`,
        desc: `Donor ${d.name} (${d.bloodGroup}) registered in directory.`,
        time: 'Recently',
        status: d.status || 'Available',
        color: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
      });
    });

    // Process food donations
    db.foodDonations?.forEach((f: any) => {
      list.push({
        id: `food-${f.id}`,
        title: `Food Surplus Registered`,
        desc: `${f.restaurantName} shared ${f.quantity} of ${f.foodType}.`,
        time: f.timestamp ? new Date(f.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Recently',
        status: f.status,
        color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      });
    });

    // Process scheme applications
    db.schemeApplications?.forEach((s: any) => {
      list.push({
        id: `scheme-${s.id}`,
        title: `Welfare Scheme Applied`,
        desc: `${s.citizenName} applied for ${s.schemeTitle}.`,
        time: s.appliedDate || 'Recently',
        status: s.status,
        color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
      });
    });

    // Process appointments
    db.appointments?.forEach((a: any) => {
      list.push({
        id: `appt-${a.id}`,
        title: `Hospital Slot Booked`,
        desc: `${a.citizenName} booked slot with ${a.doctorName} at ${a.hospitalName}.`,
        time: `${a.date} ${a.time}`,
        status: a.status,
        color: 'bg-violet-500/10 text-violet-400 border-violet-500/20'
      });
    });

    // Process farm products
    db.farmProducts?.forEach((p: any) => {
      list.push({
        id: `farm-${p.id}`,
        title: `Market Crop Listed`,
        desc: `Farmer ${p.farmerName} listed ${p.quantity}kg of ${p.name}.`,
        time: 'Recently',
        status: 'Listed',
        color: 'bg-lime-500/10 text-lime-400 border-lime-500/20'
      });
    });

    return list;
  };

  const recentActivities = getRecentActivities().slice(0, 6);

  // Floating particles generator for immersive background
  const floatingParticles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      size: Math.random() * 5 + 2,
      left: `${Math.random() * 90}%`,
      top: `${Math.random() * 90}%`,
      delay: Math.random() * 4,
      duration: Math.random() * 12 + 10
    }));
  }, []);

  const analyticsData = [
    { time: '00:00', load: 42, sos: 1 },
    { time: '04:00', load: 28, sos: 2 },
    { time: '08:00', load: 60, sos: 5 },
    { time: '12:00', load: 85, sos: 8 },
    { time: '16:00', load: 74, sos: 4 },
    { time: '20:00', load: 92, sos: 10 },
    { time: '24:00', load: 48, sos: 2 }
  ];

  return (
    <div className="bg-[#050816] min-h-screen text-slate-100 relative overflow-x-hidden">
      
      {/* BACKGROUND FLOATING PARTICLES & GLOWS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {floatingParticles.map((p) => (
          <motion.div
            key={p.id}
            animate={{
              y: [0, -40, 0],
              x: [0, 20, 0],
              opacity: [0.1, 0.4, 0.1]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut"
            }}
            style={{
              position: 'absolute',
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              backgroundColor: '#06b6d4',
              boxShadow: '0 0 12px #06b6d4',
              left: p.left,
              top: p.top
            }}
          />
        ))}

        {/* Ambient Blurred Vector Blobs */}
        <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[-100px] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-[20%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 p-6 space-y-8 max-w-7xl mx-auto">

        {/* ANNOUNCEMENTS TICKER */}
        <AnnouncementsTicker language={language} />

        {/* TELEMETRY WIDGETS */}
        <LiveTelemetryWidget language={language} />

        {/* SECTION 1: HIGH-FIDELITY COGNITIVE HERO BANNER */}
        <motion.div 
          id="hero-banner"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-md p-8 md:p-12 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-8 items-center"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 opacity-50 pointer-events-none" />
          
          <div className="lg:col-span-2 space-y-6 text-left">
            {/* Sovereign Badge */}
            <div className="inline-flex items-center space-x-2 rounded-full bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20 shadow-inner">
              <ShieldCheck className="h-4 w-4 animate-pulse" />
              <span className="font-mono uppercase tracking-wider text-[9px]">Sovereign Operating System Active</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                {currentT.heroTitle}
              </h1>
              <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
                {currentT.heroSubtitle}
              </p>
              <div className="h-[2px] w-24 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full" />
              <p className="text-sm text-slate-300 leading-relaxed font-semibold">
                "{currentT.heroTagline}"
              </p>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-2xl font-medium">
                {currentT.heroDesc}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="hero-explore-btn"
                onClick={handleScrollToServices}
                className="group flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/30 transition-all active:scale-95 cursor-pointer"
              >
                <span>{currentT.exploreServices}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                id="hero-ai-btn"
                onClick={() => onNavigateToModule('ai-chat')}
                className="flex items-center space-x-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white px-6 py-3.5 text-xs font-bold border border-white/10 hover:border-white/20 transition-all active:scale-95 shadow-md cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
                <span>{currentT.aiAssistantBtn}</span>
              </button>
            </div>
          </div>

          {/* AI assistant waveform and typing interaction card */}
          <div className="lg:col-span-1">
            <AIAssistantHologram language={language} onClick={() => onNavigateToModule('ai-chat')} />
          </div>
        </motion.div>

        {/* SECTION 1.5: SYNC ERRORS */}
        {error && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-950/20 p-4 text-center space-y-3 shadow-lg">
            <div className="flex items-center justify-center gap-2 text-rose-400 font-semibold">
              <AlertTriangle className="h-5 w-5 animate-bounce" />
              <span>Database Sync Error: {error}</span>
            </div>
            <button
              onClick={async () => {
                if (onRefresh) {
                  setLoading(true);
                  setError(null);
                  try {
                    await onRefresh();
                  } catch (err: any) {
                    setError(err.message || "Failed to synchronize platform databases.");
                  } finally {
                    setLoading(false);
                  }
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 transition-colors cursor-pointer"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* SECTION 2: HIGH-FIDELITY BENTO STATISTICS WIDGETS */}
        <div id="statistics-panel" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-cyan-400 animate-pulse" />
              {currentT.statsTitle}
            </h3>
            <span className="text-[9px] font-mono text-slate-500">MUNICIPAL SENSOR CORRELATIONS</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: currentT.statCitizens, value: formatMetricValue(db.users), color: 'border-cyan-500/30 text-cyan-400', glow: 'shadow-cyan-500/5', icon: Users },
              { label: currentT.statActive, value: loading ? 'LOADING' : activeServicesCount.toString(), color: 'border-emerald-500/30 text-emerald-400', glow: 'shadow-emerald-500/5', icon: Layers },
              { label: currentT.statEmergency, value: formatMetricValue(db.emergencies, (e: any) => e.status !== 'Resolved'), color: 'border-red-500/30 text-red-400', glow: 'shadow-red-500/5', icon: AlertTriangle },
              { label: currentT.statDonors, value: formatMetricValue(db.donors), color: 'border-rose-500/30 text-rose-400', glow: 'shadow-rose-500/5', icon: Droplet },
              { label: currentT.statFood, value: formatMetricValue(db.foodDonations), color: 'border-teal-500/30 text-teal-400', glow: 'shadow-teal-500/5', icon: Gift },
              { label: currentT.statFarmers, value: formatMetricValue(db.users, (u: any) => u.role === 'farmer'), color: 'border-lime-500/30 text-lime-400', glow: 'shadow-lime-500/5', icon: Sprout }
            ].map((stat, i) => {
              const IconComponent = stat.icon;
              return (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className={`rounded-2xl bg-slate-900/60 border ${stat.color} p-4 text-center shadow-lg hover:shadow-xl hover:bg-slate-900/80 transition-all flex flex-col justify-between group ${stat.glow} hover:scale-105`}
                >
                  <div className="flex justify-center mb-2">
                    <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-white/10 group-hover:text-white transition-colors">
                      <IconComponent className="h-4.5 w-4.5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black tracking-tight font-mono">
                      {stat.value === 'LOADING' ? (
                        <div className="flex items-center justify-center space-x-1 py-1">
                          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                          <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-widest">Syncing</span>
                        </div>
                      ) : stat.value === 'No Data Available' || stat.value === 'No Records Found' ? (
                        <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block py-0.5">No Records</span>
                      ) : (
                        <AnimatedCounter value={stat.value} />
                      )}
                    </div>
                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold leading-tight mt-1.5">
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Civic Diagnostics grid */}
          <div className="space-y-2.5 pt-2">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1.5 pl-1">
              <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              {currentT.diagTitle}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { label: currentT.diagWater, value: formatMetricValue(db.waterComplaints, (w: any) => w.status !== 'Resolved'), valColor: 'text-cyan-400 border-cyan-500/10', icon: Waves },
                { label: currentT.diagWaste, value: formatMetricValue(db.wasteComplaints, (w: any) => w.status !== 'Resolved'), valColor: 'text-amber-400 border-amber-500/10', icon: Trash2 },
                { label: currentT.diagBloodDrives, value: formatMetricValue(db.bloodRequests, (r: any) => r.status === 'Emergency' || r.status === 'Pending'), valColor: 'text-rose-400 border-rose-500/10', icon: HeartPulse },
                { label: currentT.diagCrops, value: formatMetricValue(db.farmProducts), valColor: 'text-lime-400 border-lime-500/10', icon: Sprout },
                { label: currentT.diagAppts, value: formatMetricValue(db.appointments, (a: any) => a.status === 'Approved'), valColor: 'text-emerald-400 border-emerald-500/10', icon: Clock }
              ].map((diag, i) => {
                const IconComponent = diag.icon;
                return (
                  <div 
                    key={i} 
                    className={`rounded-xl bg-slate-900/30 border ${diag.valColor} p-3 hover:border-white/10 transition-all flex items-center justify-between group`}
                  >
                    <div className="space-y-0.5 text-left">
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 font-mono leading-none font-semibold">
                        {diag.label}
                      </p>
                      <div className="text-base font-extrabold tracking-tight font-mono">
                        {diag.value === 'LOADING' ? (
                          <span className="text-[8px] font-mono text-emerald-400 animate-pulse">SYNC...</span>
                        ) : diag.value === 'No Data Available' || diag.value === 'No Records Found' ? (
                          <span className="text-[8px] font-mono text-slate-500 font-bold uppercase">No Data</span>
                        ) : (
                          <AnimatedCounter value={diag.value} />
                        )}
                      </div>
                    </div>
                    <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-white/10 group-hover:text-slate-300 transition-colors shrink-0 ml-1">
                      <IconComponent className="h-3.5 w-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 3: INTERACTIVE GIS NETWORK CONTROL GRID & ANALYTICS AreaChart */}
        <div id="live-control-center" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MapOSM />
          </div>

          <div className="space-y-6">
            
            {/* Upcoming Hospital Appointments */}
            <div className="rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-md p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-cyan-400" />
                {currentT.appointmentsTitle}
              </h3>
              <div className="space-y-3">
                {loading ? (
                  <div className="space-y-2 py-2">
                    <div className="h-14 bg-white/5 rounded-xl animate-pulse" />
                    <div className="h-14 bg-white/5 rounded-xl animate-pulse" />
                  </div>
                ) : db.appointments?.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 italic text-xs space-y-2">
                    <Calendar className="h-6 w-6 mx-auto opacity-50" />
                    <p>{currentT.noAppointments}</p>
                  </div>
                ) : (
                  db.appointments?.slice(0, 3).map((appt: Appointment) => (
                    <div key={appt.id} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2 hover:border-cyan-500/30 transition-all group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-400">{appt.doctorName}</span>
                        <span className={`text-[8px] uppercase font-mono font-bold px-1.5 py-0.5 rounded ${appt.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                          {appt.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">{appt.hospitalName}</p>
                      <div className="flex items-center justify-between text-[10px] text-cyan-400 font-mono">
                        <span>📅 {appt.date}</span>
                        <span>⏰ {appt.time}</span>
                      </div>
                      <button className="w-full mt-2 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-[10px] font-bold text-cyan-400 border border-cyan-500/20">
                        Book Appointment
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Active Emergencies SOS Dispatch panel */}
            <div className="rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-md p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                {currentT.emergencyTitle}
              </h3>
              <div className="space-y-3">
                {loading ? (
                  <div className="space-y-2 py-2">
                    <div className="h-14 bg-red-500/5 rounded-xl animate-pulse" />
                    <div className="h-14 bg-red-500/5 rounded-xl animate-pulse" />
                  </div>
                ) : db.emergencies?.filter((e: any) => e.status !== 'Resolved').length === 0 ? (
                  <div className="text-center py-8 text-slate-500 italic text-xs space-y-2">
                    <ShieldCheck className="h-6 w-6 mx-auto opacity-50" />
                    <p>{currentT.noEmergencies}</p>
                  </div>
                ) : (
                  db.emergencies?.filter((e: any) => e.status !== 'Resolved').slice(0, 2).map((sos: EmergencyRequest) => (
                    <div key={sos.id} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 space-y-2 group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-300 uppercase font-mono tracking-wider">{sos.type} Unit</span>
                        <span className="text-[8px] uppercase font-mono font-extrabold bg-red-600 text-white px-1.5 py-0.5 rounded">
                          {sos.priority}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-200 font-medium">"{sos.description}"</p>
                      <div className="w-full h-1 bg-red-900/50 rounded-full overflow-hidden">
                         <div className="h-full bg-red-500 animate-pulse" style={{ width: '60%' }} />
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                        <span className="truncate max-w-[100px]">📍 {sos.address}</span>
                        <span className="text-red-400 font-bold">{sos.status}</span>
                      </div>
                      <button className="w-full py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-[10px] font-bold text-red-400 border border-red-500/20">
                        View Details
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI Sovereign Advice */}
            <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-950/15 via-slate-900/40 to-slate-900/40 p-5 relative overflow-hidden shadow-lg">
              <div className="absolute -right-12 -top-12 w-24 h-24 bg-violet-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start space-x-3.5">
                <div className="h-9 w-9 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400 shrink-0 border border-violet-500/20">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div className="space-y-1.5 flex-1 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-bold text-violet-400 font-mono uppercase tracking-widest">{currentT.aiRec}</span>
                    <span className="text-[8px] bg-violet-500/20 px-1.5 py-0.5 rounded font-bold text-violet-300">Handshake</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-white">{aiAdvice.title}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{aiAdvice.rec}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* MUNICIPAL PERFORMANCE GRADING LINE CHART */}
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-purple-500/5 opacity-50 pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1 text-left">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
                {currentT.resolutionTitle || 'MUNICIPAL PERFORMANCE & LOAD TELEMETRY'}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">REAL-TIME GRID MONITORING</p>
            </div>
            <div className="flex gap-4 text-[9px] font-mono">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span>Grid Server Load (%)</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                <span>Active SOS Dispatches</span>
              </div>
            </div>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                <XAxis dataKey="time" stroke="#ffffff20" fontSize={9} fontClassName="font-mono" />
                <YAxis stroke="#ffffff20" fontSize={9} fontClassName="font-mono" />
                <Tooltip contentStyle={{ backgroundColor: '#090d22', borderColor: '#ffffff10', borderRadius: '12px', fontSize: '11px', fontFamily: 'monospace' }} />
                <Area type="monotone" dataKey="load" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorLoad)" name="Grid Load" />
                <Area type="monotone" dataKey="sos" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorSos)" name="Active SOS" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SECTION 4: UNIFIED PLATFORM FEATURE CARDS GRID */}
        <div id="services-grid-section" className="space-y-6 pt-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
              <Layers className="h-6 w-6 text-cyan-400 animate-pulse" />
              {language === 'ta' ? 'அனைத்து ஸ்மார்ட் சேவைகள்' : language === 'hi' ? 'सभी स्मार्ट सेवाएं' : 'Unified Sovereign Smart Services'}
            </h2>
            <p className="text-xs text-slate-400 max-w-xl font-medium">
              {language === 'ta' 
                ? 'குடிமக்கள் தேவைகள் அனைத்தையும் ஒரே இடத்தில் பூர்த்தி செய்யும் 10 பிரத்யேக தொகுதிகள்.'
                : language === 'hi'
                ? 'नागरिकों की आवश्यकताओं को पूरा करने के लिए एआई-संचालित 10 विशेष मॉड्यूल।'
                : 'Empowering smart cities with custom operational channels for healthcare, transport, agriculture, and municipal grids.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {filteredServices.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 italic text-xs border border-dashed border-white/10 rounded-2xl">
                No services match your search query. Try searching for other terms like "healthcare", "emergency", "food", "farmer", etc.
              </div>
            ) : (
              filteredServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.div 
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.04, duration: 0.5 }}
                    id={`card-${service.id}`}
                    onClick={() => onNavigateToModule(service.id)}
                    className={`relative group overflow-hidden rounded-2xl border bg-slate-900/40 p-5 hover:bg-slate-900 transition-all flex flex-col justify-between shadow-lg hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer border-white/5 ${service.color}`}
                  >
                    {/* Glowing Accent */}
                    <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors pointer-events-none" />
                    
                    <div className="space-y-3.5 text-left">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${service.iconBg} shadow-inner`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors leading-tight">
                          {service.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                          {service.desc}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-auto">
                      <button
                        onClick={(e) => { e.stopPropagation(); onNavigateToModule(service.id); }}
                        className="w-full flex items-center justify-between rounded-xl bg-white/5 px-3.5 py-2.5 text-[10px] font-bold text-slate-300 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all active:scale-95 border border-white/5 group-hover:border-transparent cursor-pointer"
                      >
                        <span>{currentT.openModule}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* SECTION 5: BENEFITS SECTION */}
        <div id="benefits-section" className="space-y-6 pt-6 border-t border-white/5">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              {currentT.whyTitle}
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mx-auto font-medium">
              {currentT.whySubtitle}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: currentT.whyAiTitle, desc: currentT.whyAiDesc, icon: Brain, gradient: 'from-violet-500/10 to-violet-500/5 hover:border-violet-500/30 text-violet-400 border-violet-500/10' },
              { title: currentT.whyFastTitle, desc: currentT.whyFastDesc, icon: Zap, gradient: 'from-amber-500/10 to-amber-500/5 hover:border-amber-500/30 text-amber-400 border-amber-500/10' },
              { title: currentT.whySecureTitle, desc: currentT.whySecureDesc, icon: ShieldCheck, gradient: 'from-cyan-500/10 to-cyan-500/5 hover:border-cyan-500/30 text-cyan-400 border-cyan-500/10' },
              { title: currentT.whyRtTitle, desc: currentT.whyRtDesc, icon: Clock, gradient: 'from-emerald-500/10 to-emerald-500/5 hover:border-emerald-500/30 text-emerald-400 border-emerald-500/10' },
              { title: currentT.whyAnalyticsTitle, desc: currentT.whyAnalyticsDesc, icon: BarChart3, gradient: 'from-indigo-500/10 to-indigo-500/5 hover:border-indigo-500/30 text-indigo-400 border-indigo-500/10' },
              { title: currentT.whyCitizenTitle, desc: currentT.whyCitizenDesc, icon: Users, gradient: 'from-rose-500/10 to-rose-500/5 hover:border-rose-500/30 text-rose-400 border-rose-500/10' }
            ].map((item, idx) => {
              const BenefitIcon = item.icon;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  className={`relative group overflow-hidden rounded-2xl border bg-slate-900/40 p-6 transition-all hover:shadow-xl hover:bg-slate-900 flex flex-col justify-between text-left ${item.gradient}`}
                >
                  <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-white/5 rounded-full blur-lg pointer-events-none" />
                  <div>
                    <div className="flex items-center space-x-3.5 mb-3">
                      <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center">
                        <BenefitIcon className="h-5 w-5" />
                      </div>
                      <h3 className="font-bold text-white text-sm">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* SECTION 6: RECENT ACTIVITIES AUDIT LEDGER */}
        <div id="activities-timeline" className="rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-md p-6 shadow-xl space-y-6">
          <div className="space-y-1 text-left">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-400 animate-pulse" />
              {currentT.recentTitle}
            </h3>
            <p className="text-xs text-slate-400 font-medium">{currentT.recentSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-2 space-y-3">
                <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
                <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-slate-500 border border-dashed border-white/10 rounded-2xl italic text-xs">
                No Data Available
              </div>
            ) : (
              recentActivities.map((act, idx) => (
                <motion.div 
                  key={act.id} 
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -15 : 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all bg-slate-950/40 hover:bg-slate-950/80 border-white/5 ${act.color}`}
                >
                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white tracking-tight">{act.title}</span>
                      <span className="text-[8px] uppercase font-mono font-bold bg-white/5 border border-white/5 px-2 py-0.5 rounded text-cyan-400">
                        {act.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">"{act.desc}"</p>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mt-1 pt-1.5 border-t border-white/5">
                    <span>Ref: {act.id}</span>
                    <span className="text-slate-500 font-bold">{act.time}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* SECTION 7: SOVEREIGN FOOTER */}
        <footer className="py-8 border-t border-white/5 text-center text-xs text-slate-500 font-mono space-y-2 mt-8">
          <p className="font-semibold text-slate-400">
            {currentT.footerText}
          </p>
          <p className="text-[10px]">
            Sovereign Civic Integration Center • India Municipal Smart Grid System v3.0.0
          </p>
        </footer>

      </div>
    </div>
  );
}
