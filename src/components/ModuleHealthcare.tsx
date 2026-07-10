import React, { useState, useEffect } from 'react';
import { getSocket } from "../lib/socket";
import { 
  Heart, Search, Clock, Calendar, Check, AlertCircle, Sparkles, Stethoscope, 
  BedDouble, ShieldAlert, Thermometer, User, Upload, ArrowRight, Activity, 
  Plus, Minus, Trash2, Pill, ChevronRight, FileText, Smartphone, RefreshCw, 
  Eye, Star, Map, Phone, AlertTriangle, MessageSquare, Info, Zap, Smile, 
  Baby, Accessibility, ShieldCheck, HeartPulse, Brain, Waves, Play, Pause, 
  ChevronDown, CheckCircle2, Lock, Database, Send, Radio, MapPin,
  Video, VideoOff, Mic, MicOff, Volume2, VolumeX, PhoneOff
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface HealthcareProps {
  db: any;
  user?: any;
  onBookAppointment: (doctorId: string, doctorName: string, hospitalName: string, date: string, time: string, reason: string) => void;
  language: 'en' | 'ta' | 'hi';
  onNavigateToModule?: (mod: string) => void;
}

export default function ModuleHealthcare({ db, user, onBookAppointment, language, onNavigateToModule }: HealthcareProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'symptoms' | 'appointments' | 'resources' | 'records' | 'specialized' | 'schemes'>('dashboard');
  
  // Real-time calculated AI Health Score States (Module 6)
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [sugar, setSugar] = useState<number>(95);
  const [heightCm, setHeightCm] = useState<number>(170);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [exerciseMins, setExerciseMins] = useState<number>(30);
  const [smoking, setSmoking] = useState<'no' | 'yes'>('no');
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [stressLevel, setStressLevel] = useState<number>(3); // 1-10
  const [heartRate, setHeartRate] = useState<number>(72);
  const [waterCups, setWaterCups] = useState<number>(6);
  const [steps, setSteps] = useState<number>(6500);
  const [oxygenSat, setOxygenSat] = useState<number>(98);
  const [history, setHistory] = useState<any[]>([]);
  
  // Dynamic Reminders States (Module 7)
  const [reminders, setReminders] = useState<any[]>([]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState({ morning: true, afternoon: false, night: false });
  const [newMedFood, setNewMedFood] = useState<boolean>(false);

  const [loadingRecord, setLoadingRecord] = useState<boolean>(true);
  const [savingRecord, setSavingRecord] = useState<boolean>(false);

  const currentUserId = user?.id || 'user-cit';

  // Signaling listeners
  useEffect(() => {
    const socket = getSocket(currentUserId);
    
    socket.on("incoming-call", (data: any) => {
      setActiveCall({
        id: `CALL-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'voice',
        name: data.name,
        role: 'Caller',
        status: 'ringing',
        duration: 0,
        micMuted: false,
        videoMuted: false,
        speakerActive: true,
        permissionState: 'granted',
        errorMessage: ''
      });
    });

    return () => {
      socket.off("incoming-call");
    };
  }, [currentUserId]);

  // Load health record from full-stack backend and run background synchronization
  useEffect(() => {
    let isMounted = true;
    const fetchHealthRecord = async () => {
      try {
        setLoadingRecord(true);
        const res = await fetch(`/api/health-record/${currentUserId}`);
        const data = await res.json();
        if (isMounted && data) {
          setSystolic(data.systolic ?? 120);
          setDiastolic(data.diastolic ?? 80);
          setSugar(data.sugar ?? 95);
          setHeightCm(data.heightCm ?? 170);
          setWeightKg(data.weightKg ?? 70);
          setExerciseMins(data.exerciseMins ?? 30);
          setSmoking(data.smoking ?? 'no');
          setSleepHours(data.sleepHours ?? 7.5);
          setStressLevel(data.stressLevel ?? 3);
          setHeartRate(data.heartRate ?? 72);
          setWaterCups(data.waterCups ?? 6);
          setSteps(data.steps ?? 6500);
          setOxygenSat(data.oxygenSat ?? 98);
          setReminders(data.reminders ?? []);
          if (data.history) setHistory(data.history);
        }
      } catch (err) {
        console.error("Failed to load health record:", err);
      } finally {
        if (isMounted) setLoadingRecord(false);
      }
    };

    fetchHealthRecord();

    // Background sync poller
    const poller = setInterval(async () => {
      try {
        const res = await fetch(`/api/health-record/${currentUserId}`);
        const data = await res.json();
        if (isMounted && data) {
          setSystolic(prev => prev !== data.systolic ? data.systolic : prev);
          setDiastolic(prev => prev !== data.diastolic ? data.diastolic : prev);
          setSugar(prev => prev !== data.sugar ? data.sugar : prev);
          setHeightCm(prev => prev !== data.heightCm ? data.heightCm : prev);
          setWeightKg(prev => prev !== data.weightKg ? data.weightKg : prev);
          setExerciseMins(prev => prev !== data.exerciseMins ? data.exerciseMins : prev);
          setSmoking(prev => prev !== data.smoking ? data.smoking : prev);
          setSleepHours(prev => prev !== data.sleepHours ? data.sleepHours : prev);
          setStressLevel(prev => prev !== data.stressLevel ? data.stressLevel : prev);
          setHeartRate(prev => prev !== data.heartRate ? data.heartRate : prev);
          setWaterCups(prev => prev !== data.waterCups ? data.waterCups : prev);
          setSteps(prev => prev !== data.steps ? data.steps : prev);
          setOxygenSat(prev => prev !== data.oxygenSat ? data.oxygenSat : prev);
          setReminders(prev => JSON.stringify(prev) !== JSON.stringify(data.reminders) ? data.reminders : prev);
          if (data.history) setHistory(data.history);
        }
      } catch (e) {
        console.warn("Background sync failed:", e);
      }
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(poller);
    };
  }, [currentUserId]);

  // Save changes to backend
  const updateRecord = async (updatedFields: any) => {
    try {
      setSavingRecord(true);
      const res = await fetch(`/api/health-record/${currentUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (data && data.success && data.data) {
        if (data.data.history) setHistory(data.data.history);
      }
    } catch (err) {
      console.error("Failed to save health record update:", err);
      showToast("Sync Error: Failed to save health changes.", "danger");
    } finally {
      setSavingRecord(false);
    }
  };

  // Synchronized state setters for zero-latency backend storage
  const changeSystolic = (val: number) => {
    setSystolic(val);
    updateRecord({ systolic: val });
  };
  const changeDiastolic = (val: number) => {
    setDiastolic(val);
    updateRecord({ diastolic: val });
  };
  const changeSugar = (val: number) => {
    setSugar(val);
    updateRecord({ sugar: val });
  };
  const changeSleepHours = (val: number) => {
    setSleepHours(val);
    updateRecord({ sleepHours: val });
  };
  const changeExerciseMins = (val: number) => {
    setExerciseMins(val);
    updateRecord({ exerciseMins: val });
  };
  const changeSmoking = (val: 'no' | 'yes') => {
    setSmoking(val);
    updateRecord({ smoking: val });
  };
  const changeWaterCups = (val: number) => {
    setWaterCups(val);
    updateRecord({ waterCups: val });
  };
  const changeSteps = (val: number) => {
    setSteps(val);
    updateRecord({ steps: val });
  };
  const changeHeartRate = (val: number) => {
    setHeartRate(val);
    updateRecord({ heartRate: val });
  };
  const changeOxygenSat = (val: number) => {
    setOxygenSat(val);
    updateRecord({ oxygenSat: val });
  };

  // Active Interactive Calling System States (Module 2, 10, 11, 16)
  const [activeCall, setActiveCall] = useState<{
    id: string;
    type: 'video' | 'voice' | 'emergency';
    name: string;
    role: string;
    status: 'dialing' | 'connecting' | 'ringing' | 'connected' | 'ended' | 'failed';
    duration: number;
    micMuted: boolean;
    videoMuted: boolean;
    speakerActive: boolean;
    permissionState: 'prompt' | 'granted' | 'denied' | 'checking';
    errorMessage: string;
  } | null>(null);

  // Call Duration Counter
  useEffect(() => {
    let timer: any = null;
    if (activeCall && activeCall.status === 'connected') {
      timer = setInterval(() => {
        setActiveCall(prev => {
          if (prev && prev.status === 'connected') {
            return { ...prev, duration: prev.duration + 1 };
          }
          return prev;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeCall?.status]);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = async (type: 'video' | 'voice' | 'emergency', name: string, role: string) => {
    const socket = getSocket(currentUserId);
    socket.emit("call-user", {
      userToCall: name, // Using name as target ID for this prototype
      signalData: {},
      from: currentUserId,
      name: name
    });

    setActiveCall({
      id: `CALL-${Math.floor(1000 + Math.random() * 9000)}`,
      type,
      name,
      role,
      status: 'dialing',
      duration: 0,
      micMuted: false,
      videoMuted: false,
      speakerActive: true,
      permissionState: 'checking',
      errorMessage: ''
    });

    showToast(`Initializing secure ${type} channel to ${name}...`, "info");

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints: MediaStreamConstraints = {
          audio: true,
          video: type === 'video'
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        stream.getTracks().forEach(track => track.stop());
        
        setActiveCall(prev => prev ? { ...prev, permissionState: 'granted', status: 'connecting' } : null);
      } else {
        setActiveCall(prev => prev ? { ...prev, permissionState: 'granted', status: 'connecting' } : null);
      }
    } catch (err: any) {
      console.warn("Hardware media access not granted or unavailable:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setActiveCall(prev => prev ? { 
          ...prev, 
          permissionState: 'denied', 
          status: 'failed',
          errorMessage: 'Microphone/Camera permission denied. Please allow browser access to continue.' 
        } : null);
        showToast("Call Failed: Media permissions denied.", "danger");
        return;
      } else {
        setActiveCall(prev => prev ? { ...prev, permissionState: 'granted', status: 'connecting' } : null);
      }
    }

    setTimeout(() => {
      setActiveCall(prev => {
        if (!prev || prev.status === 'failed') return prev;
        return { ...prev, status: 'ringing' };
      });
    }, 1500);

    setTimeout(() => {
      setActiveCall(prev => {
        if (!prev || prev.status === 'failed') return prev;
        showToast(`Secure VoIP Call Connected with ${name}`, "success");
        return { ...prev, status: 'connected' };
      });
      setAuditLogs(l => [
        { 
          time: new Date().toLocaleTimeString(), 
          action: `📞 Secure interactive ${type} call established with ${name} (${role})`, 
          actor: 'Santhosh (Citizen)', 
          ip: '192.168.1.104' 
        }, 
        ...l
      ]);
    }, 3500);
  };

  const endCall = () => {
    if (!activeCall) return;
    const finalDuration = activeCall.duration;
    setActiveCall(prev => prev ? { ...prev, status: 'ended' } : null);
    showToast(`Call with ${activeCall.name} ended. Duration: ${formatDuration(finalDuration)}`, "info");
    
    setTimeout(() => {
      setActiveCall(null);
    }, 1500);
  };

  // Symptom Analyzer States (Module 1, 8, 20)
  const [symptomInput, setSymptomInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [diagResult, setDiagResult] = useState<any | null>(null);

  // Multilingual FAQ Chatbot States (Module 12)
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState([
    { sender: 'bot', text: 'Hello! I am your 24/7 LifeConnect Healthcare Assistant. Tell me how you feel today.' }
  ]);
  const [isListening, setIsListening] = useState(false);

  // Smart Appointments Queue States (Module 3)
  const [apptDate, setApptDate] = useState('2026-07-10');
  const [apptTime, setApptTime] = useState('11:00 AM');
  const [apptReason, setApptReason] = useState('');
  const [apptType, setApptType] = useState<'In-Person' | 'Video Consultation' | 'Home Visit'>('In-Person');
  const [activeDoctor, setActiveDoctor] = useState<any | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [appointmentHistory, setAppointmentHistory] = useState([
    { id: 'APT-9041', doctor: 'Dr. Prasad', specialty: 'General Physician', date: '2026-07-01', time: '10:00 AM', status: 'Completed', type: 'In-Person', waitTime: '15 mins', token: 'T-12' },
    { id: 'APT-3142', doctor: 'Dr. Meera', specialty: 'Cardiologist', date: '2026-07-10', time: '11:00 AM', status: 'Confirmed', type: 'Video Consultation', waitTime: '8 mins', token: 'T-04' }
  ]);

  // Ambulance Live GPS Tracking Simulator (Module 10)
  const [ambulanceActive, setAmbulanceActive] = useState(false);
  const [ambulanceProgress, setAmbulanceProgress] = useState(0);
  const [ambulanceEta, setAmbulanceEta] = useState(12);

  // Mental Health States (Module 13)
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Idle'>('Idle');
  const [breathCount, setBreathCount] = useState(4);
  const [mood, setMood] = useState('Neutral');
  const [moodNotes, setMoodNotes] = useState('');
  const [moodHistory, setMoodHistory] = useState([
    { date: 'Mon', score: 3 },
    { date: 'Tue', score: 4 },
    { date: 'Wed', score: 5 },
    { date: 'Thu', score: 4 },
    { date: 'Fri', score: 3 }
  ]);

  // Digital Health Vault state (Module 5)
  const [reports, setReports] = useState([
    { id: 1, name: 'CBC Blood Count.pdf', type: 'Lab Report', date: '2026-06-15', size: '1.2 MB', encrypted: true },
    { id: 2, name: 'Chest X-Ray.jpg', type: 'Imaging', date: '2026-06-20', size: '4.5 MB', encrypted: true },
    { id: 3, name: 'Cardio ECG Chart.pdf', type: 'Electrocardiogram', date: '2026-07-02', size: '890 KB', encrypted: true }
  ]);
  const [decryptedReportId, setDecryptedReportId] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Security Audit Log (Module 23)
  const [auditLogs, setAuditLogs] = useState([
    { time: '09:30:12', action: 'Handshake token generated', actor: 'Citizen client', ip: '192.168.1.104' },
    { time: '09:31:05', action: 'Health Record #1 Encrypted using JWT-AES', actor: 'Vault Manager', ip: '10.0.8.2' },
    { time: '09:44:18', action: 'Vitals data updated', actor: 'Santhosh (Citizen)', ip: '192.168.1.104' }
  ]);

  // Government Welfare Application simulation state (Module 19)
  const [schemeStatus, setSchemeStatus] = useState<{[key: string]: 'Apply' | 'Applied' | 'Approved'}>({
    'Ayushman Bharat (PM-JAY)': 'Apply',
    'Amma Comprehensive Health Insurance': 'Apply',
    'Senior Citizen Medical Program': 'Apply'
  });

  // Admin Controls (Module 21)
  const [adminBedsFree, setAdminBedsFree] = useState(14);
  const [adminVentilatorsFree, setAdminVentilatorsFree] = useState(3);
  const [adminEmergencyActive, setAdminEmergencyActive] = useState(false);

  // Simulated live counters
  const [liveAmbulancesFree, setLiveAmbulancesFree] = useState(5);

  // Pregnancy state (Module 14)
  const [pregWeek, setPregWeek] = useState(24);
  // Child growth state (Module 15)
  const [childAge, setChildAge] = useState(2); // years
  const [childWeight, setChildWeight] = useState(12.5); // kg

  // Search state for doctors, hospitals, and specialties
  const [dashSearch, setDashSearch] = useState('');

  // Lab test booking states
  const [showLabModal, setShowLabModal] = useState(false);
  const [selectedLabTest, setSelectedLabTest] = useState('Complete Blood Count (CBC)');
  const [labBookingDate, setLabBookingDate] = useState('2026-07-09');
  const [labBookingTime, setLabBookingTime] = useState('10:00 AM');
  const [bookedLabTests, setBookedLabTests] = useState<any[]>([
    { id: 'LAB-921', testName: 'Fasting Blood Glucose', date: '2026-06-15', time: '08:00 AM', status: 'Completed', hospital: 'Chennai Central Metro General' }
  ]);

  // Toast notification state to replace iframe-unsafe window.alert
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'danger' | null }>({ message: '', type: null });
  const showToast = (message: string, type: 'success' | 'info' | 'danger' = 'success') => {
    setToast({ message, type });
    setAuditLogs(l => [
      { time: new Date().toLocaleTimeString(), action: `📢 [${type.toUpperCase()}] ${message}`, actor: 'System Alert', ip: '127.0.0.1' },
      ...l
    ]);
    setTimeout(() => {
      setToast({ message: '', type: null });
    }, 4000);
  };

  // Dynamic calculations based on user profile (BMI, Risk scores)
  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? Number((weightKg / (heightM * heightM)).toFixed(1)) : 0;
  
  let bmiCategory = 'Normal';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi >= 25 && bmi < 30) bmiCategory = 'Overweight';
  else if (bmi >= 30) bmiCategory = 'Obese';

  // Dynamic Medication Adherence calculation
  const medAdherence = reminders.length > 0 ? Math.round((reminders.filter(r => r.taken).length / reminders.length) * 100) : 100;

  // AI Health Score Formula (Module 6)
  const calculateHealthScore = () => {
    let score = 100;
    
    // 1. Blood Pressure Penalty
    if (systolic > 140 || systolic < 90) score -= 12;
    else if (systolic > 120) score -= 5;
    
    if (diastolic > 90 || diastolic < 60) score -= 12;
    else if (diastolic > 80) score -= 5;
    
    // 2. Blood Sugar Penalty
    if (sugar > 125 || sugar < 70) score -= 15;
    else if (sugar > 100) score -= 8;
    
    // 3. BMI Penalty
    if (bmiCategory === 'Obese') score -= 15;
    else if (bmiCategory === 'Overweight') score -= 7;
    else if (bmiCategory === 'Underweight') score -= 5;
    
    // 4. Smoking Status
    if (smoking === 'yes') score -= 20;
    
    // 5. Exercise Minutes Penalty
    if (exerciseMins < 15) score -= 12;
    else if (exerciseMins < 30) score -= 6;
    
    // 6. Sleep Duration Penalty
    if (sleepHours < 6 || sleepHours > 9) score -= 10;
    else if (sleepHours < 7) score -= 5;
    
    // 7. Stress Level Penalty
    if (stressLevel > 6) score -= 10;
    
    // 8. Water Intake Penalty
    if (waterCups < 4) score -= 10;
    else if (waterCups < 8) score -= 5;
    
    // 9. Medication Adherence Penalty
    if (medAdherence < 40) score -= 15;
    else if (medAdherence < 70) score -= 8;
    else if (medAdherence < 100) score -= 4;
    
    // 10. Heart Rate Penalty
    if (heartRate < 60 || heartRate > 100) score -= 8;
    else if (heartRate >= 90) score -= 3;
    
    // 11. Oxygen Saturation Penalty
    if (oxygenSat < 90) score -= 20;
    else if (oxygenSat < 95) score -= 10;

    return Math.max(0, Math.min(100, score));
  };

  const healthScore = calculateHealthScore();

  // Dynamic recommendations based on metrics
  const getHealthRecommendations = () => {
    const recs = [];
    if (sleepHours < 7) {
      recs.push({ text: "Increase sleep by 1 hour.", desc: "Your sleep is below the 7-8 hours physiological baseline, raising stress biomarkers.", type: "sleep", color: "text-violet-400" });
    }
    if (sugar > 100) {
      recs.push({ text: "Reduce sugar intake.", desc: "Fasting glycemia exceeds 100 mg/dL. Cut complex carbs and refined syrups immediately.", type: "diet", color: "text-amber-400" });
    }
    if (systolic > 120 || diastolic > 80) {
      recs.push({ text: "Reduce sodium and monitor blood pressure.", desc: "Elevated BP detected. Avoid fast food and log vitals twice daily.", type: "bp", color: "text-cyan-400" });
    }
    if (exerciseMins < 30) {
      recs.push({ text: "Add 15 minutes of walking.", desc: "Daily physical fitness is below 30 mins. Active circulation is vital.", type: "exercise", color: "text-lime-400" });
    }
    if (smoking === 'yes') {
      recs.push({ text: "Smoking is reducing your health score.", desc: "Nicotine use constricts vascular flow and increases resting blood pressure.", type: "smoking", color: "text-rose-400" });
    }
    if (waterCups < 8) {
      recs.push({ text: "Hydrate more: Drink at least 8 cups.", desc: "Optimal hydration flushes micro-toxins and supports blood volume stability.", type: "water", color: "text-cyan-300" });
    }
    if (oxygenSat < 95) {
      recs.push({ text: "Low blood oxygen: Practice deep breathing.", desc: "Oxygen saturation level is below 95%. Try pranayama or consult a practitioner.", type: "oxygen", color: "text-rose-500" });
    }
    if (medAdherence < 100) {
      recs.push({ text: "Adhere to your medication schedule.", desc: "Missing key scheduled pharmacy doses lowers preventative recovery ratings.", type: "meds", color: "text-rose-400" });
    }
    
    if (recs.length === 0) {
      recs.push({ text: "All physiological vitals optimal!", desc: "Excellent discipline. Your clinical telemetry is perfect. Keep doing what you do!", type: "perfect", color: "text-emerald-400" });
    }
    return recs;
  };

  const healthRecommendations = getHealthRecommendations();

  // Render history data dynamically updated on vital changes
  const chartData = (history && history.length > 0) ? history.map(item => ({
    name: item.date || item.timestamp || 'Today',
    score: item.score ?? 75,
    bp: item.systolic ?? 120,
    sugar: item.sugar ?? 95,
  })) : [
    { name: 'Mon', score: 72, bp: 125, sugar: 105 },
    { name: 'Tue', score: 75, bp: 122, sugar: 100 },
    { name: 'Wed', score: 78, bp: 120, sugar: 95 },
    { name: 'Thu', score: 82, bp: 118, sugar: 92 },
    { name: 'Fri', score: 85, bp: 115, sugar: 90 },
    { name: 'Sat', score: 88, bp: 116, sugar: 88 },
    { name: 'Sun', score: healthScore, bp: systolic, sugar: sugar },
  ];

  // AI Predictive Risk Engine (Module 20)
  const predictRisk = (type: 'heart' | 'diabetes' | 'stroke' | 'hypertension' | 'obesity') => {
    let base = 10;
    if (type === 'heart') {
      if (systolic > 135) base += 30;
      if (smoking === 'yes') base += 25;
      if (stressLevel > 6) base += 15;
      if (heartRate > 80) base += 10;
    } else if (type === 'diabetes') {
      if (sugar > 110) base += 45;
      if (bmi > 26) base += 25;
      if (exerciseMins < 20) base += 15;
    } else if (type === 'stroke') {
      if (systolic > 140) base += 35;
      if (smoking === 'yes') base += 20;
      if (diastolic > 90) base += 15;
    } else if (type === 'hypertension') {
      if (systolic > 130) base += 40;
      if (stressLevel > 5) base += 20;
      if (bmi > 25) base += 15;
    } else if (type === 'obesity') {
      if (bmi > 28) base += 50;
      if (exerciseMins < 25) base += 20;
    }
    return Math.min(95, base);
  };

  // Live map simulator intervals
  useEffect(() => {
    let interval: any;
    if (ambulanceActive) {
      interval = setInterval(() => {
        setAmbulanceProgress(prev => {
          if (prev >= 100) {
            setAmbulanceActive(false);
            setLiveAmbulancesFree(p => p + 1);
            return 0;
          }
          const nextVal = prev + 5;
          setAmbulanceEta(Math.max(1, Math.ceil((100 - nextVal) * 0.15)));
          return nextVal;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [ambulanceActive]);

  // Breathing Guide Interval (Module 13)
  useEffect(() => {
    let timer: any;
    if (breathingPhase !== 'Idle') {
      timer = setInterval(() => {
        setBreathCount(prev => {
          if (prev <= 1) {
            // Shift phase
            setBreathingPhase(curr => {
              if (curr === 'Inhale') { setBreathCount(4); return 'Hold'; }
              if (curr === 'Hold') { setBreathCount(4); return 'Exhale'; }
              if (curr === 'Exhale') { setBreathCount(4); return 'Inhale'; }
              return 'Idle';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [breathingPhase]);

  // Handle clinical evaluation with natural language (Module 1)
  const handleClinicalCheck = async () => {
    if (!symptomInput.trim()) return;
    setAnalyzing(true);
    setDiagResult(null);

    // Call real full-stack AI endpoint
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: symptomInput,
          modelType: 'symptom-check'
        })
      });
      const data = await response.json();
      
      // Parse or mock structured findings based on keyword matching
      const text = (symptomInput + " " + data.text).toLowerCase();
      let detectedSpecialist = "General Physician";
      let urgencyLevel = "Moderate";
      let severityColor = "yellow";
      let diseases = [
        { name: "Viral Fever", prob: 65 },
        { name: "Allergy", prob: 20 },
        { name: "COVID-19", prob: 10 },
        { name: "Others", prob: 5 }
      ];

      if (text.includes('chest') || text.includes('heart') || text.includes('breath') || text.includes('cardio')) {
        detectedSpecialist = "Cardiologist";
        urgencyLevel = "High Urgency";
        severityColor = "red";
        diseases = [
          { name: "Cardiovascular Fatigue", prob: 55 },
          { name: "Hypertension crisis", prob: 25 },
          { name: "Angina Spec", prob: 15 },
          { name: "Others", prob: 5 }
        ];
      } else if (text.includes('skin') || text.includes('rash') || text.includes('itch')) {
        detectedSpecialist = "Dermatologist";
        urgencyLevel = "Low Urgency";
        severityColor = "green";
        diseases = [
          { name: "Contact Dermatitis", prob: 60 },
          { name: "Fungal Allergy", prob: 25 },
          { name: "Eczema Flare", prob: 10 },
          { name: "Others", prob: 5 }
        ];
      } else if (text.includes('child') || text.includes('pediatric') || text.includes('baby')) {
        detectedSpecialist = "Pediatrician";
        urgencyLevel = "Moderate";
        severityColor = "yellow";
        diseases = [
          { name: "Seasonal Pediatric Flu", prob: 70 },
          { name: "Tonsillitis", prob: 15 },
          { name: "Viral Croup", prob: 10 },
          { name: "Others", prob: 5 }
        ];
      }

      setDiagResult({
        aiExplanation: data.text || "Diagnostic model suggests rest, proper hydration, and tracking of vital metrics. If symptoms aggravate, schedule immediate specialist consult.",
        symptomsDetected: Array.from(new Set(symptomInput.split(/[\s,.]+/).filter(w => w.length > 3).slice(0, 4))),
        severity: severityColor,
        urgency: urgencyLevel,
        specialist: detectedSpecialist,
        otcSuggestions: "Paracetamol 500mg, Antihistamines (OTC)",
        precautions: "Maintain hydration, avoid sudden temperature shifts, isolate if respiratory.",
        scheme: "Eligible for Ayushman Bharat Cashless cover",
        diseases
      });
    } catch (e) {
      console.error("Fetch failed, falling back to local diagnostics:", e);
      const text = symptomInput.toLowerCase();
      let detectedSpecialist = "General Physician";
      let urgencyLevel = "Moderate";
      let severityColor = "yellow";
      let diseases = [
        { name: "Viral Fever", prob: 65 },
        { name: "Allergy", prob: 20 },
        { name: "COVID-19", prob: 10 },
        { name: "Others", prob: 5 }
      ];

      if (text.includes('chest') || text.includes('heart') || text.includes('breath') || text.includes('cardio') || text.includes('chest pain')) {
        detectedSpecialist = "Cardiologist";
        urgencyLevel = "High Urgency";
        severityColor = "red";
        diseases = [
          { name: "Cardiovascular Fatigue", prob: 55 },
          { name: "Hypertension crisis", prob: 25 },
          { name: "Angina Spec", prob: 15 },
          { name: "Others", prob: 5 }
        ];
      } else if (text.includes('skin') || text.includes('rash') || text.includes('itch')) {
        detectedSpecialist = "Dermatologist";
        urgencyLevel = "Low Urgency";
        severityColor = "green";
        diseases = [
          { name: "Contact Dermatitis", prob: 60 },
          { name: "Fungal Allergy", prob: 25 },
          { name: "Eczema Flare", prob: 10 },
          { name: "Others", prob: 5 }
        ];
      } else if (text.includes('child') || text.includes('pediatric') || text.includes('baby') || text.includes('cough')) {
        detectedSpecialist = "Pediatrician";
        urgencyLevel = "Moderate";
        severityColor = "yellow";
        diseases = [
          { name: "Seasonal Pediatric Flu", prob: 70 },
          { name: "Tonsillitis", prob: 15 },
          { name: "Viral Croup", prob: 10 },
          { name: "Others", prob: 5 }
        ];
      }

      setDiagResult({
        aiExplanation: "Local backup clinical node evaluation suggests: Seasonal flu/allergies. Stay well hydrated, log vitals daily, and consult an expert if symptoms persist.",
        symptomsDetected: Array.from(new Set(symptomInput.split(/[\s,.]+/).filter(w => w.length > 3).slice(0, 4))),
        severity: severityColor,
        urgency: urgencyLevel,
        specialist: detectedSpecialist,
        otcSuggestions: "Paracetamol 500mg, Antihistamines (OTC)",
        precautions: "Maintain hydration, avoid sudden temperature shifts, isolate if respiratory.",
        scheme: "Eligible for Ayushman Bharat Cashless cover",
        diseases
      });
      showToast("Offline local diagnostic model generated findings", "info");
    } finally {
      setAnalyzing(false);
    }
  };

  // Multilingual Voice/FAQ Chatbot Input (Module 12)
  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatLog(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    setTimeout(() => {
      let reply = "I've recorded your query. Based on LifeConnect clinical FAQ database: Please keep track of your daily water levels and vitals. You can consult Dr. Prasad tomorrow at 10:30 AM.";
      const low = userMsg.toLowerCase();
      if (low.includes('tamil') || low.includes('தமிழ்')) {
        reply = "நிச்சயமாக! லைஃப்கனெக்ட் AI 24/7 செயல்படுகிறது. உங்கள் மருத்துவ தகவல்களை பதிவிடவும்.";
      } else if (low.includes('hindi') || low.includes('नमस्ते')) {
        reply = "नमस्ते! मैं आपकी सहायता के लिए तैयार हूँ। क्या आपको कोई शारीरिक तकलीफ है?";
      } else if (low.includes('scheme') || low.includes('government')) {
        reply = "Ayushman Bharat scheme provides ₹5 Lakhs of free medical coverage. You can apply on our Government Schemes tab.";
      } else if (low.includes('emergency') || low.includes('accident')) {
        reply = "🚨 Emergency alert detected! Please use our red SOS button to dispatch an ambulance grid coordinates.";
      }
      setChatLog(prev => [...prev, { sender: 'bot', text: reply }]);
      
      // Voice Output synthesis mockup (Module 12)
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(reply.replace(/[#*`_]/g, ''));
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    }, 600);
  };

  const startVoiceInputMock = () => {
    setIsListening(true);
    setTimeout(() => {
      setChatInput("I have acute headache and slight fever since yesterday.");
      setIsListening(false);
    }, 2000);
  };

  // Medicine Reminder state handlers (Module 7)
  const handleAddMed = () => {
    if (!newMedName.trim()) return;
    const nextReminders = [
      ...reminders,
      {
        id: Date.now(),
        name: newMedName,
        morning: newMedTime.morning,
        afternoon: newMedTime.afternoon,
        night: newMedTime.night,
        beforeFood: newMedFood,
        taken: false
      }
    ];
    setReminders(nextReminders);
    updateRecord({ reminders: nextReminders });
    
    const addedMedName = newMedName;
    setNewMedName('');
    setNewMedTime({ morning: true, afternoon: false, night: false });
    setNewMedFood(false);
    
    // Notification push trigger (Module 22)
    showToast(`Success: Medicine reminder for "${addedMedName}" created. Push alerts activated.`, "success");
  };

  const toggleReminderTaken = (id: number) => {
    const nextReminders = reminders.map(r => r.id === id ? { ...r, taken: !r.taken } : r);
    setReminders(nextReminders);
    updateRecord({ reminders: nextReminders });
  };

  const deleteReminder = (id: number) => {
    const nextReminders = reminders.filter(r => r.id !== id);
    setReminders(nextReminders);
    updateRecord({ reminders: nextReminders });
  };

  // Hospital Beds registry fallback data
  const hospitals = db.hospitals || [
    { id: 'h1', name: 'Chennai Central Metro General', address: 'Poonamallee High Rd, Chennai', beds: adminBedsFree, ventilators: adminVentilatorsFree, icuAvailable: true, bloodReserve: 'O+, A+, B+, AB+', waitTime: '12 mins', rating: 4.8 },
    { id: 'h2', name: 'Adyar Smart Multispeciality', address: 'Sardar Patel Road, Adyar', beds: 24, ventilators: 1, icuAvailable: false, bloodReserve: 'O-, B-, A+', waitTime: '25 mins', rating: 4.6 },
    { id: 'h3', name: 'Tambaram Citizens Hospital', address: 'GST Road, Tambaram', beds: 8, ventilators: 0, icuAvailable: true, bloodReserve: 'B+, AB-', waitTime: '18 mins', rating: 4.2 }
  ];

  // Doctors database fallback data
  const doctors = [
    { id: 'd1', name: 'Dr. R. Prasad', specialty: 'General Physician', rating: 4.9, fee: 350, hospitalName: 'Chennai Central Metro General', availability: ['Mon', 'Wed', 'Fri'], language: 'Tamil, English, Hindi', experience: '15 Yrs', distance: '1.5 km' },
    { id: 'd2', name: 'Dr. Meera Alagiri', specialty: 'Cardiologist', rating: 4.8, fee: 600, hospitalName: 'Adyar Smart Multispeciality', availability: ['Tue', 'Thu'], language: 'Tamil, English', experience: '12 Yrs', distance: '3.1 km' },
    { id: 'd3', name: 'Dr. Selvam Sundar', specialty: 'Pediatrician', rating: 4.7, fee: 400, hospitalName: 'Chennai Central Metro General', availability: ['Mon', 'Tue', 'Thu'], language: 'Tamil, English', experience: '10 Yrs', distance: '1.5 km' },
    { id: 'd4', name: 'Dr. Anjali Sen', specialty: 'Dermatologist', rating: 4.9, fee: 500, hospitalName: 'Tambaram Citizens Hospital', availability: ['Wed', 'Fri'], language: 'English, Hindi', experience: '8 Yrs', distance: '8.4 km' },
    { id: 'd5', name: 'Dr. Amit Shah', specialty: 'Neurologist', rating: 4.8, fee: 800, hospitalName: 'Adyar Smart Multispeciality', availability: ['Mon', 'Wed'], language: 'English, Hindi', experience: '14 Yrs', distance: '3.2 km' },
    { id: 'd6', name: 'Dr. K. Raghavan', specialty: 'General Physician', rating: 4.5, fee: 300, hospitalName: 'Tambaram Citizens Hospital', availability: ['Sat', 'Sun'], language: 'Tamil, English', experience: '18 Yrs', distance: '7.8 km' }
  ];

  const filteredDoctors = selectedSpecialty === 'All' 
    ? doctors 
    : doctors.filter(d => d.specialty === selectedSpecialty);

  const matchedDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(dashSearch.toLowerCase()) ||
    doc.specialty.toLowerCase().includes(dashSearch.toLowerCase()) ||
    doc.hospitalName.toLowerCase().includes(dashSearch.toLowerCase())
  );

  const matchedHospitals = hospitals.filter(h => 
    h.name.toLowerCase().includes(dashSearch.toLowerCase()) ||
    h.address.toLowerCase().includes(dashSearch.toLowerCase())
  );

  const matchedSpecialties = Array.from(new Set(doctors.map(d => d.specialty))).filter(spec => 
    spec.toLowerCase().includes(dashSearch.toLowerCase())
  );

  // Digital Record uploads simulation
  const handleUploadClick = () => {
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev !== null && prev >= 100) {
          clearInterval(interval);
          setReports(r => [
            ...r,
            {
              id: Date.now(),
              name: 'Prescription_Output_' + Math.floor(Math.random() * 900) + '.pdf',
              type: 'Prescription Scan',
              date: new Date().toISOString().split('T')[0],
              size: '410 KB',
              encrypted: true
            }
          ]);
          setAuditLogs(l => [
            { time: new Date().toLocaleTimeString(), action: 'Uploaded OCR document & auto-encrypted with AES', actor: 'Santhosh (Citizen)', ip: '192.168.1.104' },
            ...l
          ]);
          return null;
        }
        return prev !== null ? prev + 30 : null;
      });
    }, 400);
  };

  const triggerSOSAmbulance = () => {
    setAmbulanceActive(true);
    setAmbulanceProgress(0);
    setAmbulanceEta(12);
    setLiveAmbulancesFree(prev => Math.max(0, prev - 1));
    showToast("CRITICAL ALARM: GPS location shared with dispatch hub. Ambulance #4 launched.", "danger");
  };

  const getPregnancyDetails = (week: number) => {
    if (week <= 8) return { size: "Size of a Raspberry", weight: "1g", advice: "Ensure adequate folic acid intake. Focus on rich hydration and early blood panel screenings." };
    if (week <= 16) return { size: "Size of an Avocado", weight: "100g", advice: "Calcium and vitamin D reserves are crucial. Schedule secondary trimester blood and ultrasound evaluations." };
    if (week <= 24) return { size: "Size of a Cantaloupe Melon", weight: "600g", advice: "Track blood pressure (SYS & DIA) daily. Perform light pelvic stretches and prenatal yoga." };
    if (week <= 32) return { size: "Size of a Pineapple", weight: "1.5kg", advice: "Rest with leg elevation. Monitor closely for signs of preeclampsia, sudden ankle swellings, or high sugars." };
    return { size: "Size of a Watermelon", weight: "3.2kg", advice: "Prepare hospitalization kit. Finalize maternity insurance claims and establish priority ambulance contact." };
  };

  const handleDownloadReport = () => {
    // Simple PDF simulator
    const reportContent = `
============================================================
           LIFECONNECT AI SMART HEALTHCARE REPORT           
============================================================
Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
Patient Name: Santhosh Kumar (Citizen)
Language: English (Sovereign Localized)

------------------------------------------------------------
AI HEALTH ASSESSMENT & OVERALL PROFILE:
- Overall AI Health Score: ${healthScore} / 100
- Health Status: ${healthScore >= 80 ? 'Optimal (Excellent Condition)' : healthScore >= 60 ? 'Moderate Alert (Changes Recommended)' : 'High Pathological Risk (Consult Specialist)'}
- Computed BMI: ${bmi} kg/m² (${bmiCategory})

------------------------------------------------------------
PHYSIOLOGICAL VITALS SUMMARY:
- Blood Pressure: ${systolic} / ${diastolic} mmHg
- Fasting Blood Sugar: ${sugar} mg/dL
- Resting Heart Rate: ${heartRate} BPM
- Daily Step Count: ${steps} / 10,000 steps
- Liquid Hydration: ${waterCups} / 10 cups
- Rest Sleep Duration: ${sleepHours} Hours
- Physical Active Period: ${exerciseMins} Minutes/day
- Tobacco Use: ${smoking.toUpperCase()}

------------------------------------------------------------
PREDICTED DISEASE RISK ENGINE PROFILE:
- Cardiovascular Disease: ${predictRisk('heart')}% Risk
- Type-II Diabetes: ${predictRisk('diabetes')}% Risk
- Ischemic Stroke: ${predictRisk('stroke')}% Risk
- Arterial Hypertension: ${predictRisk('hypertension')}% Risk

------------------------------------------------------------
ACTIVE PHARMACEUTICAL COMPLIANCE SCHEDULES:
${reminders.map(r => `- ${r.name}: ${r.morning ? 'Morning ' : ''}${r.afternoon ? 'Noon ' : ''}${r.night ? 'Night' : ''} (${r.taken ? 'Taken' : 'Pending'})`).join('\n')}

============================================================
  This report was generated using certified on-device 
  telemetry metrics. Please consult with a general practitioner 
  or specialized cardiologist to verify medical actions.
============================================================
    `;
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LifeConnect_AI_Health_Report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Health Report generated & downloaded successfully!", "success");
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 text-slate-100 font-sans">
      
      {/* Platform Branding & Global Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5 gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-600 flex items-center justify-center text-white border border-rose-400/20 shadow-lg shadow-rose-500/10">
            <Heart className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Smart Healthcare Center 
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">AI Clinical Node</span>
            </h2>
            <p className="text-xs text-slate-400">Integrated telemetry, predictive wellness algorithms, multi-specialist telemedicine registries, and zero-latency emergency networks.</p>
          </div>
        </div>

        {/* Global Stats bar */}
        <div className="flex flex-wrap gap-3 font-mono">
          <div className="bg-slate-900 border border-white/5 px-3 py-1.5 rounded-lg text-center">
            <span className="text-[9px] text-slate-500 uppercase">Emergency SOS</span>
            <p className={`text-xs font-bold ${adminEmergencyActive ? 'text-rose-500 animate-ping' : 'text-emerald-400'}`}>
              {adminEmergencyActive ? '🚨 TRIGGERED' : '● ACTIVE'}
            </p>
          </div>
          <div className="bg-slate-900 border border-white/5 px-3 py-1.5 rounded-lg text-center">
            <span className="text-[9px] text-slate-500 uppercase">Hospital Beds</span>
            <p className="text-xs font-bold text-cyan-400">{hospitals.reduce((acc, h) => acc + h.beds, 0)} Free</p>
          </div>
          <div className="bg-slate-900 border border-white/5 px-3 py-1.5 rounded-lg text-center">
            <span className="text-[9px] text-slate-500 uppercase">Ambulance Grid</span>
            <p className="text-xs font-bold text-emerald-400">{liveAmbulancesFree} Standby</p>
          </div>
        </div>
      </div>

      {/* Modern Horizontal Navigation Drawer (Glassmorphism Tabs) */}
      <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar border-b border-white/5">
        {[
          { id: 'dashboard', label: 'AI Health Dashboard', icon: Activity, color: 'text-rose-400' },
          { id: 'symptoms', label: 'AI Diagnostic & Bot', icon: Sparkles, color: 'text-violet-400' },
          { id: 'appointments', label: 'Doctors & Queue', icon: Stethoscope, color: 'text-emerald-400' },
          { id: 'resources', label: 'Registry & Ambulance', icon: BedDouble, color: 'text-cyan-400' },
          { id: 'specialized', label: 'Sovereign Demographic Care', icon: Smile, color: 'text-amber-400' },
          { id: 'records', label: 'Health Vault', icon: Lock, color: 'text-teal-400' },
          { id: 'schemes', label: 'Government Welfare', icon: Info, color: 'text-blue-400' }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                isSelected 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
                  : 'bg-slate-900/60 hover:bg-slate-900 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 ${isSelected ? tab.color : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Dynamic Panel Viewports */}
      <div className="grid grid-cols-1 gap-6">

        {/* TAB 1: AI HEALTH DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">

            {/* SEARCH SECTION FOR DOCTORS, HOSPITALS, SPECIALTIES */}
            <div className="bg-slate-900 border border-white/5 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-rose-500" />
                  <h3 className="text-sm font-bold text-white">Universal Healthcare Search Registry</h3>
                </div>
                <span className="text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold animate-pulse">Live Matcher</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={dashSearch}
                  onChange={(e) => setDashSearch(e.target.value)}
                  placeholder="Search doctors by name or specialty (e.g. Cardiologist), hospitals, or medical facilities..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all"
                />
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                {dashSearch && (
                  <button 
                    onClick={() => setDashSearch('')}
                    className="absolute right-4 top-3 text-xs text-slate-500 hover:text-white font-mono bg-white/5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* SEARCH RESULTS (IF SEARCHING) */}
              {dashSearch && (
                <div className="bg-slate-950/80 p-4 rounded-xl border border-white/10 space-y-4 animate-fade-in">
                  <h4 className="text-xs font-bold text-rose-400 font-mono uppercase tracking-wider">Search Results for "{dashSearch}"</h4>
                  
                  {/* Matched Specialties */}
                  {matchedSpecialties.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 uppercase font-mono block font-bold">Specialties Match</span>
                      <div className="flex flex-wrap gap-1.5">
                        {matchedSpecialties.map(spec => (
                          <button
                            key={spec}
                            onClick={() => {
                              setSelectedSpecialty(spec);
                              setActiveTab('appointments');
                              setDashSearch('');
                              showToast(`Filtered Doctor Registry for ${spec}`, 'success');
                            }}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-all cursor-pointer"
                          >
                            🔍 {spec}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matched Doctors */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block font-bold">Doctors Match ({matchedDoctors.length})</span>
                    {matchedDoctors.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {matchedDoctors.map(doc => (
                          <div key={doc.id} className="p-3 rounded-lg bg-slate-900 border border-white/5 flex justify-between items-center">
                            <div>
                              <p className="text-xs font-bold text-white">{doc.name}</p>
                              <p className="text-[10px] text-emerald-400 font-semibold">{doc.specialty}</p>
                              <p className="text-[9px] text-slate-400">{doc.hospitalName} • Exp: {doc.experience}</p>
                            </div>
                            <button
                              onClick={() => {
                                setActiveDoctor(doc);
                                setActiveTab('appointments');
                                setDashSearch('');
                                showToast(`Selected ${doc.name} for booking!`, 'success');
                              }}
                              className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-lg text-[10px] transition-colors cursor-pointer"
                            >
                              Book
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No doctors found matching "{dashSearch}"</p>
                    )}
                  </div>

                  {/* Matched Hospitals */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block font-bold">Hospitals Match ({matchedHospitals.length})</span>
                    {matchedHospitals.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {matchedHospitals.map(h => (
                          <div key={h.id} className="p-3 rounded-lg bg-slate-900 border border-white/5 flex justify-between items-center">
                            <div>
                              <p className="text-xs font-bold text-white">{h.name}</p>
                              <p className="text-[10px] text-slate-400">📍 {h.address}</p>
                              <p className="text-[9px] text-cyan-400 font-mono">Beds Available: {h.beds} Free</p>
                            </div>
                            <button
                              onClick={() => {
                                setActiveTab('resources');
                                setDashSearch('');
                                showToast(`Navigating to bed capacity of ${h.name}`, 'info');
                              }}
                              className="px-2.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-lg text-[10px] transition-colors cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No hospitals found matching "{dashSearch}"</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* DASHBOARD STATISTICS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-left">
              <div className="bg-slate-900 border border-white/5 p-4 rounded-xl text-left space-y-1 relative overflow-hidden group">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Total Doctors</span>
                <p className="text-2xl font-extrabold text-emerald-400 font-mono">6</p>
                <div className="text-[9px] text-slate-500 font-semibold">On Active Registry</div>
              </div>

              <div className="bg-slate-900 border border-white/5 p-4 rounded-xl text-left space-y-1 relative overflow-hidden group">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Hospitals Available</span>
                <p className="text-2xl font-extrabold text-cyan-400 font-mono">3</p>
                <div className="text-[9px] text-slate-500 font-semibold">With Real-Time Beds</div>
              </div>

              <div className="bg-slate-900 border border-white/5 p-4 rounded-xl text-left space-y-1 relative overflow-hidden group">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Appointments Today</span>
                <p className="text-2xl font-extrabold text-indigo-400 font-mono">{appointmentHistory.length}</p>
                <div className="text-[9px] text-slate-500 font-semibold">Scheduled slots</div>
              </div>

              <div className="bg-slate-900 border border-white/5 p-4 rounded-xl text-left space-y-1 relative overflow-hidden group">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Emergency Cases</span>
                <p className="text-2xl font-extrabold text-rose-500 font-mono">2</p>
                <div className="text-[9px] text-slate-500 font-semibold">Active dispatches</div>
              </div>

              <div className="bg-slate-900 border border-white/5 p-4 rounded-xl text-left space-y-1 relative overflow-hidden group">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Ambulances Standby</span>
                <p className="text-2xl font-extrabold text-teal-400 font-mono">{liveAmbulancesFree}</p>
                <div className="text-[9px] text-slate-500 font-semibold">Ready in municipal grid</div>
              </div>

              <div className="bg-slate-900 border border-white/5 p-4 rounded-xl text-left space-y-1 relative overflow-hidden group">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Blood Donors</span>
                <p className="text-2xl font-extrabold text-rose-400 font-mono">18</p>
                <div className="text-[9px] text-slate-500 font-semibold">Listed matches</div>
              </div>
            </div>

            {/* 10 HEALTHCARE QUICK ACTION CARDS */}
            <div className="space-y-4 text-left">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-rose-500 animate-pulse" />
                Healthcare Center Core Modules & Actions
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* 1. AI Symptom Checker */}
                <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-3 group hover:border-violet-500/30 transition-all text-left">
                  <div className="space-y-1">
                    <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white">AI Symptom Checker</h4>
                    <p className="text-[10px] text-slate-400 leading-normal">Analyze symptoms instantly using advanced clinical AI models.</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('symptoms');
                      showToast("AI Symptom Checker opened. Enter symptoms below.", "info");
                    }}
                    className="w-full py-1.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Check Symptoms
                  </button>
                </div>

                {/* 2. Find Doctors */}
                <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-3 group hover:border-emerald-500/30 transition-all text-left">
                  <div className="space-y-1">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white">Find Doctors</h4>
                    <p className="text-[10px] text-slate-400 leading-normal">Search and locate qualified, rated clinical specialists near you.</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSpecialty('All');
                      setActiveTab('appointments');
                      showToast("Doctors Registry loaded.", "info");
                    }}
                    className="w-full py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Find Doctor
                  </button>
                </div>

                {/* 3. Book Appointment */}
                <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-3 group hover:border-amber-500/30 transition-all text-left">
                  <div className="space-y-1">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white">Book Appointment</h4>
                    <p className="text-[10px] text-slate-400 leading-normal">Reserve dynamic, live-tracked consultation slots instantly.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (doctors.length > 0) {
                        setActiveDoctor(doctors[0]);
                      }
                      setActiveTab('appointments');
                      showToast("Booking Panel activated.", "info");
                    }}
                    className="w-full py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Book Appointment
                  </button>
                </div>

                {/* 4. Digital Health Records */}
                <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-3 group hover:border-teal-500/30 transition-all text-left">
                  <div className="space-y-1">
                    <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white">Digital Records</h4>
                    <p className="text-[10px] text-slate-400 leading-normal">Access secure, decentralized clinical health vault documents.</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('records');
                      showToast("Health records vault opened.", "info");
                    }}
                    className="w-full py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                  >
                    View Medical Records
                  </button>
                </div>

                {/* 5. Medicine Reminder */}
                <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-3 group hover:border-rose-500/30 transition-all text-left">
                  <div className="space-y-1">
                    <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                      <Pill className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white">Medicine Reminder</h4>
                    <p className="text-[10px] text-slate-400 leading-normal">Never miss a dose. Log medications and get automatic notifications.</p>
                  </div>
                  <button
                    onClick={() => {
                      const el = document.getElementById('med-reminder-widget');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        showToast("Manage reminders below in the quick widget.", "info");
                      }
                    }}
                    className="w-full py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Medicine Reminder
                  </button>
                </div>

                {/* 6. Lab Test Booking */}
                <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-3 group hover:border-cyan-500/30 transition-all text-left">
                  <div className="space-y-1">
                    <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                      <Activity className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white">Lab Test Booking</h4>
                    <p className="text-[10px] text-slate-400 leading-normal">Schedule certified pathology, biochemistry, and blood tests.</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowLabModal(true);
                    }}
                    className="w-full py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Book Lab Test
                  </button>
                </div>

                {/* 7. Nearby Hospitals */}
                <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-3 group hover:border-cyan-400/30 transition-all text-left">
                  <div className="space-y-1">
                    <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-300">
                      <BedDouble className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white">Nearby Hospitals</h4>
                    <p className="text-[10px] text-slate-400 leading-normal">Check real-time hospital bed availability and contact numbers.</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('resources');
                      showToast("Sovereign Health Bed Registry loaded.", "info");
                    }}
                    className="w-full py-1.5 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-300 border border-cyan-400/20 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Find Hospital
                  </button>
                </div>

                {/* 8. Emergency Ambulance */}
                <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-3 group hover:border-rose-600/30 transition-all text-left">
                  <div className="space-y-1">
                    <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white">Emergency Ambulance</h4>
                    <p className="text-[10px] text-slate-400 leading-normal">Launch direct GPS ambulance dispatch and monitor in real-time.</p>
                  </div>
                  <button
                    onClick={() => {
                      triggerSOSAmbulance();
                      setActiveTab('resources');
                    }}
                    className="w-full py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 rounded-xl text-[10px] font-bold transition-all cursor-pointer animate-pulse"
                  >
                    Request Ambulance
                  </button>
                </div>

                {/* 9. Blood Donor Network */}
                <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-3 group hover:border-rose-400/30 transition-all text-left">
                  <div className="space-y-1">
                    <div className="h-8 w-8 rounded-lg bg-rose-400/10 flex items-center justify-center text-rose-400">
                      <HeartPulse className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white">Blood Donor Network</h4>
                    <p className="text-[10px] text-slate-400 leading-normal">Connect with active blood donors across various groups near you.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (onNavigateToModule) {
                        onNavigateToModule('blood');
                        showToast("Navigating to Blood Donor Network...", "success");
                      } else {
                        setActiveTab('resources');
                        showToast("Blood Donor database loaded inside resources.", "info");
                      }
                    }}
                    className="w-full py-1.5 bg-rose-400/10 hover:bg-rose-400/20 text-rose-400 border border-rose-400/20 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Find Blood Donor
                  </button>
                </div>

                {/* 10. Health Analytics */}
                <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-3 group hover:border-blue-500/30 transition-all text-left">
                  <div className="space-y-1">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white">Health Analytics</h4>
                    <p className="text-[10px] text-slate-400 leading-normal">Generate and download standard medical compliance reports instantly.</p>
                  </div>
                  <button
                    onClick={handleDownloadReport}
                    className="w-full py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Download Report
                  </button>
                </div>
              </div>
            </div>

            {/* MULTI-SECTION SECTION: RECENT APPOINTMENTS, HEALTH NOTIFICATIONS & AI HEALTH TIPS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
              
              {/* RECENT APPOINTMENTS */}
              <div className="bg-slate-900 border border-white/5 p-5 rounded-2xl space-y-3.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                  Recent Appointments History
                </h4>
                <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                  {appointmentHistory.map((apt) => (
                    <div key={apt.id} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex justify-between items-center text-xs">
                      <div className="space-y-1 flex-1">
                        <p className="font-bold text-white">{apt.doctor}</p>
                        <p className="text-[10px] text-slate-400">{apt.specialty} • {apt.type}</p>
                        <p className="text-[10px] text-slate-500">{apt.date} at {apt.time}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
                        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-extrabold uppercase">{apt.status}</span>
                        {apt.type === 'Video Consultation' && apt.status === 'Confirmed' && (
                          <button
                            onClick={() => startCall('video', apt.doctor, `${apt.specialty} Telemedicine Consultant`)}
                            className="px-2 py-1 bg-violet-600 hover:bg-violet-500 text-white font-mono font-bold text-[9px] rounded-lg transition-all flex items-center gap-1 animate-pulse"
                          >
                            <Video className="h-3 w-3" /> JOIN VIDEO
                          </button>
                        )}
                        <p className="text-[9px] text-slate-400 font-mono">Token: {apt.token}</p>
                      </div>
                    </div>
                  ))}

                  {/* Booked Lab Tests list */}
                  {bookedLabTests.map((lab) => (
                    <div key={lab.id} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex justify-between items-center text-xs border-l-2 border-cyan-500/40">
                      <div className="space-y-1">
                        <p className="font-bold text-cyan-400">🧪 {lab.testName}</p>
                        <p className="text-[10px] text-slate-400">Lab Diagnostic • Home Sample</p>
                        <p className="text-[10px] text-slate-500">{lab.date} at {lab.time}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-extrabold uppercase">{lab.status}</span>
                        <p className="text-[9px] text-slate-400 mt-1 font-mono">Ref: {lab.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* HEALTH NOTIFICATIONS */}
              <div className="bg-slate-900 border border-white/5 p-5 rounded-2xl space-y-3.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-cyan-400" />
                  Live Health Notifications
                </h4>
                <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-cyan-400">🚨 Smart Vitals Alert</span>
                      <span className="text-[9px] font-mono text-slate-500">Just now</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-normal">Fasting glucose levels calibrated at 95 mg/dL. Stable glycemia trajectory maintained.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-rose-400">💊 Dose Schedule Alarm</span>
                      <span className="text-[9px] font-mono text-slate-500">10 mins ago</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-normal font-sans">Your morning dose of Multivitamin is pending confirmation. Tap Taken to log.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-lime-400">🏃 Activity Target Alert</span>
                      <span className="text-[9px] font-mono text-slate-500">1 hour ago</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-normal">Excellent! You completed a 30-minute cardio fitness routine today.</p>
                  </div>
                </div>
              </div>

              {/* AI HEALTH TIPS - DYNAMIC RECOMMENDATIONS */}
              <div className="bg-slate-900 border border-white/5 p-5 rounded-2xl space-y-3.5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5 mb-3">
                    <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
                    Dynamic AI Health Recommendations
                  </h4>
                  <div className="space-y-3 max-h-[190px] overflow-y-auto custom-scrollbar pr-1 text-left">
                    {healthRecommendations.map((rec, index) => (
                      <div key={index} className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-lime-400 shrink-0" />
                          <span className={`text-xs font-bold ${rec.color}`}>{rec.text}</span>
                        </div>
                        <p className="text-[10.5px] leading-relaxed text-slate-400 font-sans pl-5">{rec.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-[9.5px] text-slate-500 font-mono italic mt-1 border-t border-white/5 pt-2 text-left">
                  * Clinical models computed recommendations locally
                </div>
              </div>

            </div>

            {/* Bento Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Circular AI Health score widget (Module 6) */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl" />
                <div className="w-full flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-rose-500" />
                    AI Health Score Engine
                  </h4>
                  <span className="text-[10px] bg-rose-500/15 text-rose-400 font-mono font-bold px-2 py-0.5 rounded uppercase">Vitals Live</span>
                </div>

                <div className="relative flex items-center justify-center my-4">
                  {/* Custom animated SVG Circular Progress Gauge */}
                  <svg className="w-36 h-36 transform -rotate-90">
                    <circle cx="72" cy="72" r="58" className="stroke-slate-950 fill-none" strokeWidth="10" />
                    <circle 
                      cx="72" cy="72" r="58" 
                      className="stroke-rose-500 fill-none transition-all duration-1000" 
                      strokeWidth="10" 
                      strokeDasharray={364}
                      strokeDashoffset={364 - (364 * healthScore) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-4xl font-extrabold font-mono tracking-tight text-white">{healthScore}</span>
                    <p className="text-[9px] uppercase text-slate-500 font-bold font-mono tracking-wider">Scale /100</p>
                  </div>
                </div>

                <div className="w-full text-center space-y-2 pt-2 border-t border-white/5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Biological Risk level</span>
                    <span className={`font-bold uppercase font-mono ${healthScore >= 80 ? 'text-emerald-400' : healthScore >= 60 ? 'text-amber-400' : 'text-rose-500'}`}>
                      {healthScore >= 80 ? 'Optimal (Low)' : healthScore >= 60 ? 'Moderate Alert' : 'High Pathological Risk'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 italic text-left">
                    "Weekly goal: Add 15 mins of cardiovascular exercise and maintain stable water metrics to boost score."
                  </p>
                </div>
              </div>

              {/* Interactive Vitals Logger Controls */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <HeartPulse className="h-4 w-4 text-emerald-400" />
                  Live Wearable Devices / Vitals Sync
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/50 border border-white/5 p-3 rounded-xl space-y-2 col-span-2">
                    <div className="flex justify-between items-center border-b border-white/5 pb-1">
                      <label className="text-[9px] text-slate-500 uppercase font-mono block">Blood Pressure (SYS / DIA)</label>
                      <span className="text-xs font-bold font-mono text-cyan-400">{systolic} / {diastolic} mmHg</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">SYS:</span>
                        <div className="flex gap-1">
                          <button onClick={() => changeSystolic(Math.max(80, systolic - 5))} className="p-1 rounded bg-white/5 hover:bg-white/10 text-xs">-5</button>
                          <button onClick={() => changeSystolic(Math.min(190, systolic + 5))} className="p-1 rounded bg-white/5 hover:bg-white/10 text-xs">+5</button>
                        </div>
                      </div>
                      <div className="flex-1 flex items-center justify-between border-l border-white/5 pl-4">
                        <span className="text-[10px] text-slate-400">DIA:</span>
                        <div className="flex gap-1">
                          <button onClick={() => changeDiastolic(Math.max(50, diastolic - 5))} className="p-1 rounded bg-white/5 hover:bg-white/10 text-xs">-5</button>
                          <button onClick={() => changeDiastolic(Math.min(120, diastolic + 5))} className="p-1 rounded bg-white/5 hover:bg-white/10 text-xs">+5</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 border border-white/5 p-3 rounded-xl space-y-1">
                    <label className="text-[9px] text-slate-500 uppercase font-mono block">Sugar (Glucose)</label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold font-mono text-amber-400">{sugar} mg/dL</span>
                      <div className="flex gap-1">
                        <button onClick={() => changeSugar(Math.max(50, sugar - 5))} className="p-1 rounded bg-white/5 hover:bg-white/10 text-xs">-</button>
                        <button onClick={() => changeSugar(Math.min(300, sugar + 5))} className="p-1 rounded bg-white/5 hover:bg-white/10 text-xs">+</button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 border border-white/5 p-3 rounded-xl space-y-1">
                    <label className="text-[9px] text-slate-500 uppercase font-mono block">Sleep Duration</label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold font-mono text-violet-400">{sleepHours} Hrs</span>
                      <div className="flex gap-1">
                        <button onClick={() => changeSleepHours(Number(Math.max(3, sleepHours - 0.5).toFixed(1)))} className="p-1 rounded bg-white/5 hover:bg-white/10 text-xs">-</button>
                        <button onClick={() => changeSleepHours(Number(Math.min(12, sleepHours + 0.5).toFixed(1)))} className="p-1 rounded bg-white/5 hover:bg-white/10 text-xs">+</button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 border border-white/5 p-3 rounded-xl space-y-1">
                    <label className="text-[9px] text-slate-500 uppercase font-mono block">Physical Exercise</label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold font-mono text-lime-400">{exerciseMins} Mins/d</span>
                      <div className="flex gap-1">
                        <button onClick={() => changeExerciseMins(Math.max(0, exerciseMins - 5))} className="p-1 rounded bg-white/5 hover:bg-white/10 text-xs">-</button>
                        <button onClick={() => changeExerciseMins(Math.min(180, exerciseMins + 5))} className="p-1 rounded bg-white/5 hover:bg-white/10 text-xs">+</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-mono">Smoking Status</span>
                    <div className="flex border border-white/10 rounded-lg overflow-hidden">
                      <button onClick={() => changeSmoking('no')} className={`px-2.5 py-1 text-[10px] font-bold ${smoking === 'no' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 hover:bg-white/5'}`}>NON</button>
                      <button onClick={() => changeSmoking('yes')} className={`px-2.5 py-1 text-[10px] font-bold ${smoking === 'yes' ? 'bg-rose-600 text-white' : 'bg-slate-950 hover:bg-white/5'}`}>SMOKER</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Reminders List & Active Medicine compliance (Module 7 & 22) */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Pill className="h-4 w-4 text-rose-400" />
                      Dynamic Medicine Reminders
                    </span>
                    <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-amber-300">Missed Alert: Enabled</span>
                  </h4>

                  <div className="space-y-2.5 max-h-[170px] overflow-y-auto custom-scrollbar">
                    {reminders.map(rem => (
                      <div key={rem.id} className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${rem.taken ? 'bg-emerald-500/10 border-emerald-500/20 opacity-70' : 'bg-slate-950/50 border-white/5'}`}>
                        <div className="space-y-0.5">
                          <p className="font-bold text-xs text-white">{rem.name}</p>
                          <div className="flex gap-2 text-[9px] font-mono text-slate-400">
                            <span>🕒 {rem.morning ? 'Morning ' : ''}{rem.afternoon ? 'Noon ' : ''}{rem.night ? 'Night' : ''}</span>
                            <span>• {rem.beforeFood ? 'Before' : 'After'} food</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => toggleReminderTaken(rem.id)}
                            className={`p-1.5 rounded-lg text-[10px] font-bold ${rem.taken ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 hover:bg-white/10 text-slate-400'}`}
                          >
                            {rem.taken ? 'Taken' : 'Mark'}
                          </button>
                          <button onClick={() => deleteReminder(rem.id)} className="p-1 hover:bg-red-500/20 rounded text-red-400">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 space-y-3">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      placeholder="New pill name..." 
                      className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                    <button onClick={handleAddMed} className="rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-extrabold text-xs px-4 py-1.5 transition-all">Add</button>
                  </div>
                  
                  {/* Expanded Med Schedule options */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-mono font-bold uppercase text-[8.5px]">Timing:</span>
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                        <input type="checkbox" checked={newMedTime.morning} onChange={(e) => setNewMedTime(prev => ({ ...prev, morning: e.target.checked }))} className="rounded border-white/10 bg-slate-950 accent-rose-500 h-3.5 w-3.5" />
                        <span>Morn</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                        <input type="checkbox" checked={newMedTime.afternoon} onChange={(e) => setNewMedTime(prev => ({ ...prev, afternoon: e.target.checked }))} className="rounded border-white/10 bg-slate-950 accent-rose-500 h-3.5 w-3.5" />
                        <span>Noon</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                        <input type="checkbox" checked={newMedTime.night} onChange={(e) => setNewMedTime(prev => ({ ...prev, night: e.target.checked }))} className="rounded border-white/10 bg-slate-950 accent-rose-500 h-3.5 w-3.5" />
                        <span>Night</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-1.5 border-l border-white/5 pl-3">
                      <span className="text-slate-500 font-mono font-bold uppercase text-[8.5px]">Food:</span>
                      <button 
                        onClick={() => setNewMedFood(p => !p)} 
                        className={`px-2 py-0.5 rounded font-extrabold text-[8.5px] border uppercase transition-colors ${
                          newMedFood ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-950 border-white/10 text-slate-400'
                        }`}
                      >
                        {newMedFood ? 'Before Food' : 'After Food'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Multi-metrics Trackers (Water, steps, heart rate) (Module 17, 28) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              <div className="bg-slate-900 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Smart Step Counter</span>
                  <p className="text-xl font-extrabold text-lime-400 font-mono">{steps.toLocaleString()} /10,000</p>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => changeSteps(Math.max(0, steps - 1000))} className="px-1.5 py-0.5 text-[9px] bg-white/5 rounded hover:bg-white/10 font-bold">-1k</button>
                    <button onClick={() => changeSteps(steps + 1000)} className="px-1.5 py-0.5 text-[9px] bg-white/5 rounded hover:bg-white/10 font-bold">+1k</button>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-400">
                  <Activity className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-slate-900 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Water Intake Tracker</span>
                  <p className="text-xl font-extrabold text-cyan-400 font-mono">{waterCups} / 10 Cups</p>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => changeWaterCups(Math.max(0, waterCups - 1))} className="px-1.5 py-0.5 text-[9px] bg-white/5 rounded hover:bg-white/10 font-bold">-1</button>
                    <button onClick={() => changeWaterCups(waterCups + 1)} className="px-1.5 py-0.5 text-[9px] bg-white/5 rounded hover:bg-white/10 font-bold">+1</button>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <Waves className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-slate-900 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Vitals: Heart Rate</span>
                  <p className="text-xl font-extrabold text-rose-500 font-mono">{heartRate} BPM</p>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => changeHeartRate(Math.max(40, heartRate - 5))} className="px-1.5 py-0.5 text-[9px] bg-white/5 rounded hover:bg-white/10 font-bold">-5</button>
                    <button onClick={() => changeHeartRate(Math.min(200, heartRate + 5))} className="px-1.5 py-0.5 text-[9px] bg-white/5 rounded hover:bg-white/10 font-bold">+5</button>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                  <Heart className="h-5 w-5 animate-pulse" />
                </div>
              </div>

              <div className="bg-slate-900 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Patient BMI Calculator</span>
                  <p className="text-xl font-extrabold text-amber-400 font-mono">{bmi} BMI</p>
                  <span className="text-[10px] text-slate-400">Category: {bmiCategory}</span>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Accessibility className="h-5 w-5" />
                </div>
              </div>

            </div>

            {/* AI Predictive Analytics & SVG Chart Analytics (Module 18, 20) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* AI Predictive Analytics Risks */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  AI Clinical Predictive Risks
                </h4>

                <div className="space-y-3.5">
                  {[
                    { name: 'Heart Disease Risk', code: 'heart', color: 'bg-rose-500', text: 'Minimize smoking and reduce stress level parameter.' },
                    { name: 'Diabetes (Type-II) Risk', code: 'diabetes', color: 'bg-amber-500', text: 'Optimize diet sugar levels and enhance daily steps.' },
                    { name: 'Stroke Risk', code: 'stroke', color: 'bg-indigo-500', text: 'Strict arterial BP control needed.' },
                    { name: 'Hypertension Risk', code: 'hypertension', color: 'bg-cyan-500', text: 'Normal, maintain physical fitness indicators.' }
                  ].map((risk, index) => {
                    const value = predictRisk(risk.code as any);
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">{risk.name}</span>
                          <span className="font-mono text-white">{value}% Probability</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                          <div className={`h-full ${risk.color} transition-all duration-1000`} style={{ width: `${value}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-500 italic">{risk.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Recharts Progress Analytics Chart (Module 18) */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    Interactive Physiological Trends
                  </h4>
                  <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Synced
                  </span>
                </div>

                <div className="h-48 w-full bg-slate-950/40 rounded-xl border border-white/5 p-2 relative flex flex-col justify-between">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: 9, fontFamily: 'monospace' }} />
                      <YAxis stroke="#64748b" style={{ fontSize: 9, fontFamily: 'monospace' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#090d16', borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12 }} 
                        itemStyle={{ fontSize: 11, color: '#f8fafc' }}
                        labelStyle={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}
                      />
                      <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" name="AI Health Score" />
                      <Line type="monotone" dataKey="bp" stroke="#06b6d4" strokeWidth={1.5} dot={{ r: 2 }} name="Sys BP" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>Legend: 🟢 AI Health Score (0-100)</span>
                  <span>🔵 Systolic BP (mmHg)</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: AI CLINICAL DIAGNOSTIC & FAQ VOICE BOT */}
        {activeTab === 'symptoms' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Column 1: Diagnostic Symptom evaluator (Module 1, 8, 27) */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 animate-pulse" />
                AI Symptom Evaluator
              </h3>

              <p className="text-xs text-slate-400">
                Type your active symptoms in natural language. The AI clinical node parses severity levels, predicts pathology, suggests Lab Tests (Module 8), and flags local medical specialists.
              </p>

              <div className="space-y-3">
                <textarea
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  placeholder="e.g., I have fever, sore throat, and a dry cough since Monday morning..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 min-h-[90px]"
                />

                <div className="flex justify-between items-center gap-2">
                  <span className="text-[10px] text-slate-500 italic">Optimized Gemini Clinical Prompt active</span>
                  <button
                    onClick={handleClinicalCheck}
                    disabled={analyzing || !symptomInput}
                    className="rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold text-xs px-5 py-2.5 hover:from-violet-400 hover:to-indigo-400 transition-all flex items-center space-x-1"
                  >
                    {analyzing ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Running Diagnostic Models...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Evaluate Symptoms</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {diagResult && (
                <div className="p-4 bg-slate-950 rounded-xl border border-violet-500/20 space-y-3 animate-fade-in text-xs leading-relaxed text-slate-300">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="font-bold text-white uppercase font-mono tracking-wider text-[10px]">Diagnostic Synthesis</span>
                    <span className={`px-2 py-0.5 rounded uppercase font-mono text-[9px] font-extrabold ${diagResult.severity === 'red' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : diagResult.severity === 'yellow' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                      {diagResult.urgency}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-[10px] uppercase text-violet-400 font-mono">Diseases Probability</p>
                    <div className="space-y-1.5 pt-1">
                      {diagResult.diseases.map((dis: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-slate-400 text-[11px]">{dis.name}</span>
                          <div className="flex items-center gap-2 w-32">
                            <div className="flex-1 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                              <div className="h-full bg-violet-400" style={{ width: `${dis.prob}%` }} />
                            </div>
                            <span className="font-mono text-[10px] w-6 text-right">{dis.prob}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-white/5 p-2 rounded-lg">
                      <span className="text-[9px] uppercase text-slate-500 font-mono block">Recommended Specialist</span>
                      <p className="font-bold text-emerald-400 text-[11px]">{diagResult.specialist}</p>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg">
                      <span className="text-[9px] uppercase text-slate-500 font-mono block">OTC Medication sugered</span>
                      <p className="font-bold text-white text-[11px]">{diagResult.otcSuggestions}</p>
                    </div>
                  </div>

                  <div className="bg-violet-950/20 border border-violet-500/15 p-2.5 rounded-lg space-y-1 text-[11px]">
                    <span className="text-[9px] uppercase text-violet-400 font-mono font-bold block">AI Explanation</span>
                    <p className="italic text-slate-400">"{diagResult.aiExplanation}"</p>
                  </div>

                  {/* AI Lab Test Suggestion (Module 8) */}
                  <div className="border border-cyan-500/20 bg-cyan-500/5 p-3 rounded-xl space-y-1.5">
                    <span className="text-[10px] uppercase text-cyan-400 font-mono font-bold flex items-center gap-1">
                      <HeartPulse className="h-3.5 w-3.5 animate-pulse" />
                      Suggested Lab Tests (AI Recommendation)
                    </span>
                    <div className="flex justify-between items-center text-[11px]">
                      <div>
                        <p className="font-bold text-slate-200">Complete Blood Count (CBC) & Sugar Test</p>
                        <p className="text-[10px] text-slate-500">Reason: To rule out bacterial pathogens and track insulin reserves</p>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-emerald-400">₹450 Est.</span>
                        <p className="text-[9px] text-amber-400 font-extrabold uppercase">High Priority</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Column 2: 24/7 Multilingual AI Healthcare Chatbot with Voice Mockup (Module 12) */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-[450px]">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4" />
                    24/7 Clinical Assistant Grid
                  </h3>
                  <div className="flex gap-1.5">
                    <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Eng</span>
                    <span className="text-[9px] bg-white/5 text-slate-500 px-1.5 py-0.5 rounded">தமிழ்</span>
                    <span className="text-[9px] bg-white/5 text-slate-500 px-1.5 py-0.5 rounded">हिंदी</span>
                  </div>
                </div>

                {/* Message Log */}
                <div className="space-y-3 max-h-[290px] overflow-y-auto custom-scrollbar pr-1 pt-1">
                  {chatLog.map((log, idx) => (
                    <div key={idx} className={`flex ${log.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-2xl max-w-sm text-xs leading-relaxed ${log.sender === 'user' ? 'bg-cyan-500 text-slate-950 font-bold rounded-tr-none' : 'bg-slate-950 border border-white/5 text-slate-300 rounded-tl-none'}`}>
                        {log.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat controllers */}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                    placeholder="Type symptom FAQs, drug queries..."
                    className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button onClick={handleChatSend} className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs px-4">Send</button>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>Press mic to test vocal diagnosis</span>
                  <button 
                    onClick={startVoiceInputMock} 
                    className={`flex items-center gap-1.5 font-bold font-mono px-3 py-1 rounded-lg border ${isListening ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse' : 'bg-white/5 border-transparent hover:text-white'}`}
                  >
                    <Radio className="h-3 w-3" />
                    <span>{isListening ? 'Microphone active...' : 'Voice Input (Mock)'}</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: DOCTOR APPOINTMENTS & REAL-TIME QUEUE (Module 2, 3) */}
        {activeTab === 'appointments' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col (2 cols): Specialist Recommendation (Module 2) */}
            <div className="lg:col-span-2 bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-3 gap-3">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Stethoscope className="h-4 w-4" />
                  Sovereign Specialists Recommendation Registry
                </h3>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-1">
                  {['All', 'General Physician', 'Cardiologist', 'Pediatrician', 'Dermatologist', 'Neurologist'].map(spec => (
                    <button
                      key={spec}
                      onClick={() => setSelectedSpecialty(spec)}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-mono transition-all ${
                        selectedSpecialty === spec 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold' 
                          : 'bg-white/5 text-slate-500 hover:text-white border border-transparent'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ranked Doctor Cards (Module 2) */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                {filteredDoctors.map((doc, idx) => (
                  <div key={doc.id} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 font-mono text-sm shrink-0">
                        {doc.name.split('. ').pop()?.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-xs">{doc.name}</h4>
                          <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 rounded uppercase tracking-wider">{doc.specialty}</span>
                        </div>
                        <p className="text-[10px] text-slate-400">🏥 {doc.hospitalName} • Exp: {doc.experience} • Dist: {doc.distance}</p>
                        <p className="text-[10px] text-slate-500 font-medium">🗣️ Languages: {doc.language}</p>
                        <div className="flex items-center gap-3 text-[10px] text-emerald-400 font-semibold pt-0.5">
                          <span>★ {doc.rating} Rating</span>
                          <span>• Fee: ₹{doc.fee}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                      <span className="text-[9px] text-slate-400 font-mono">Slots: {doc.availability.join(', ')}</span>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => startCall('video', doc.name, `${doc.specialty} Telemedicine Consultant`)}
                          className="flex-1 sm:flex-none rounded-xl bg-violet-600/10 hover:bg-violet-600 border border-violet-500/20 hover:text-white text-violet-400 text-xs font-bold px-3 py-1.5 transition-all flex items-center justify-center gap-1 shrink-0"
                          title="Instant Video Consultation"
                        >
                          <Video className="h-3.5 w-3.5" /> Call Doctor
                        </button>
                        <button
                          onClick={() => setActiveDoctor(doc)}
                          className="flex-1 sm:flex-none rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold px-4 py-1.5 transition-colors shrink-0"
                        >
                          Book Appt
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col (1 col): Smart Booking System & Token Queue Pass (Module 3) */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                  Dynamic Appointment Queues
                </h3>

                <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 space-y-2.5">
                  <span className="text-[9px] uppercase text-cyan-400 font-mono font-bold block">Live Token Pass Queue status</span>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-extrabold text-white text-xs">Current Token: T-03</p>
                      <p className="text-[10px] text-slate-400">Assigned doctor: Dr. Meera</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold font-mono text-amber-400">Est. Wait: 8 mins</p>
                      <span className="text-[9px] bg-cyan-400/10 text-cyan-400 px-1.5 py-0.5 rounded font-mono">Token Queue active</span>
                    </div>
                  </div>

                  {/* QR Code Pass display mockup */}
                  <div className="flex items-center justify-center p-3 bg-white rounded-lg max-w-[120px] mx-auto border border-white/10">
                    <svg className="w-16 h-16 text-slate-950" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 3h6v6H3V3zm12 0h6v6h-6V3zM3 15h6v6H3v-6zm14 0h4v4h-4v-4z M7 7V5H5v2h2zm12-2h-2v2h2V5zm-2 12h-2v2h2v-2zm-6-2h-2v2h2v-2zm2 2h-2v2h2v-2z" />
                    </svg>
                  </div>
                  <p className="text-[9px] text-slate-500 text-center font-mono uppercase">Appointment QR Key: CONF_T04_2026</p>
                </div>
              </div>

              {/* Form submit confirmation */}
              {activeDoctor ? (
                <div className="bg-slate-950 border border-emerald-500/30 p-4 rounded-xl space-y-3 animate-fade-in">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-emerald-400 font-bold uppercase font-mono">Submit Consultation request</p>
                      <p className="font-bold text-xs text-white">{activeDoctor.name}</p>
                    </div>
                    <button onClick={() => setActiveDoctor(null)} className="text-[9px] text-slate-500 hover:text-white">Close</button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[8px] text-slate-500 uppercase block">Select date</label>
                        <input type="date" value={apptDate} onChange={(e) => setApptDate(e.target.value)} className="w-full bg-slate-900 border border-white/10 text-xs px-2 py-1 rounded text-white" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[8px] text-slate-500 uppercase block">Select Slot</label>
                        <select value={apptTime} onChange={(e) => setApptTime(e.target.value)} className="w-full bg-slate-900 border border-white/10 text-xs px-2 py-1 rounded text-white">
                          <option value="09:00 AM">09:00 AM</option>
                          <option value="11:00 AM">11:00 AM</option>
                          <option value="03:00 PM">03:00 PM</option>
                          <option value="04:30 PM">04:30 PM</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[8px] text-slate-500 uppercase block">Consultation Type</label>
                      <div className="grid grid-cols-3 gap-1 pt-0.5">
                        {['In-Person', 'Video Consultation', 'Home Visit'].map(type => (
                          <button key={type} onClick={() => setApptType(type as any)} className={`px-1 py-1 text-[8.5px] rounded border font-semibold ${apptType === type ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-white/5 text-slate-400'}`}>{type}</button>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        onBookAppointment(activeDoctor.id, activeDoctor.name, activeDoctor.hospitalName, apptDate, apptTime, apptReason || "General Consult");
                        setAppointmentHistory(prev => [
                          { id: `APT-${Math.floor(1000 + Math.random() * 9000)}`, doctor: activeDoctor.name, specialty: activeDoctor.specialty, date: apptDate, time: apptTime, status: 'Confirmed', type: apptType, waitTime: '10 mins', token: `T-0${Math.floor(Math.random() * 9 + 1)}` },
                          ...prev
                        ]);
                        setActiveDoctor(null);
                      }}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs"
                    >
                      Confirm Grid Booking
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 text-center text-xs text-slate-500 italic">
                  Choose a doctor from specialist recommendation registry to trigger instant queue slot reservation.
                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 4: RESOURCES REGISTRY, BLOOD DONOR & LIVE AMBULANCE (Module 4, 9, 10, 11) */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            
            {/* Live Hospital Bed registry + Blood matching (Module 4, 9) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Live Resource Beds Grid */}
              <div className="lg:col-span-2 bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <BedDouble className="h-4 w-4 text-cyan-400" />
                  Sovereign Health Bed Registry & Sensoring
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hospitals.map(h => (
                    <div key={h.id} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-3 relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-xs">{h.name}</h4>
                          <p className="text-[10px] text-slate-400">📍 {h.address}</p>
                        </div>
                        <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded font-bold ${h.icuAvailable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {h.icuAvailable ? 'ICU Slots Free' : 'ICU Saturated'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5">
                          <span className="text-[9px] text-slate-500 uppercase block font-mono">Available Beds</span>
                          <span className="text-sm font-extrabold text-cyan-400">{h.beds} Free</span>
                          <div className="w-full bg-slate-950 h-1 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-cyan-400" style={{ width: `${(h.beds/35)*100}%` }} />
                          </div>
                        </div>

                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5">
                          <span className="text-[9px] text-slate-500 uppercase block font-mono">Ventilators</span>
                          <span className="text-sm font-extrabold text-rose-500">{h.ventilators} Active</span>
                          <div className="w-full bg-slate-950 h-1 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-rose-500" style={{ width: `${(h.ventilators/5)*100}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-white/5">
                        <span>👥 Wait list: {h.waitTime}</span>
                        <span className="text-emerald-400">🩸 Group reserves: {h.bloodReserve}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blood Donor Matching Engine (Module 9) */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <HeartPulse className="h-4 w-4" />
                    Blood Donor Registry
                  </h3>
                  <span className="text-[9px] bg-rose-500/15 text-rose-400 font-mono px-2 py-0.5 rounded font-extrabold uppercase">Match Engine</span>
                </div>

                <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-2">
                  <span className="text-[9px] uppercase text-slate-500 font-mono block">Urgent blood drive requests</span>
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-200">A- Negative Required</p>
                      <p className="text-[10px] text-slate-400">Chennai Central Hospital (Ref: BL-124)</p>
                    </div>
                    <span className="text-[9px] bg-rose-500/10 text-rose-400 font-mono font-bold px-1.5 py-0.5 rounded uppercase">Urgent</span>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[170px] overflow-y-auto custom-scrollbar">
                  {[
                    { name: 'Suresh Kumar', group: 'O+', distance: '1.2 km', available: 'Yes' },
                    { name: 'Dr. Priya Sundaram', group: 'AB-', distance: '2.4 km', available: 'Yes' },
                    { name: 'Dinesh Karthik', group: 'B+', distance: '4.8 km', available: 'No (In relief dispatch)' }
                  ].map((donor, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-300">{donor.name}</p>
                        <p className="text-[10px] text-slate-500">Distance: {donor.distance} • Status: {donor.available}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center font-bold font-mono text-rose-400">{donor.group}</span>
                        <button 
                          onClick={() => startCall('voice', donor.name, `Voluntary Blood Donor (${donor.group})`)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:text-slate-950 text-rose-400 rounded-lg transition-all"
                          title={`Voice call donor ${donor.name}`}
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Live GPS Ambulance Tracker & Critical SOS button (Module 10, 11) */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-3 gap-3">
                <div>
                  <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Radio className="h-4 w-4 animate-ping" />
                    Emergency Dispatch Center & Live GPS Ambulance Tracker
                  </h3>
                  <p className="text-[10px] text-slate-400 font-sans">Click the critical red SOS button to instantly share medical history summaries with municipal dispatch algorithms.</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={triggerSOSAmbulance}
                    className="rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs px-5 py-2.5 shadow-lg shadow-red-600/30 flex items-center space-x-1.5 animate-pulse"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>EMERGENCY SOS DISPATCH</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                {/* Simulated GPS City Map using CSS-SVG */}
                <div className="lg:col-span-2 bg-slate-950/60 border border-white/5 h-56 rounded-xl p-4 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
                  
                  {/* Grid Lines mockup of Chennai Map */}
                  <svg className="absolute inset-0 w-full h-full text-slate-800" stroke="currentColor" strokeWidth="0.8">
                    <line x1="0" y1="40" x2="600" y2="40" />
                    <line x1="0" y1="120" x2="600" y2="120" />
                    <line x1="140" y1="0" x2="140" y2="300" />
                    <line x1="320" y1="0" x2="320" y2="300" />
                    
                    {/* Trajectory path */}
                    <path 
                      d="M 40 180 Q 140 120, 240 160 T 440 60" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="2.5" 
                      strokeDasharray="4"
                    />

                    {/* Ambulance live position indicator node */}
                    {ambulanceActive && (
                      <circle 
                        cx={40 + (ambulanceProgress * 4.0)} 
                        cy={180 - (ambulanceProgress * 1.2)} 
                        r="6" 
                        fill="#ef4444" 
                        className="animate-ping"
                      />
                    )}
                  </svg>

                  <div className="z-10 flex justify-between items-start">
                    <span className="text-[9px] bg-slate-900 border border-white/5 text-slate-400 font-mono px-2 py-0.5 rounded">GPS Map Nodes: active</span>
                    <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded font-extrabold uppercase">Sensors Calibrated</span>
                  </div>

                  <div className="z-10 flex justify-between items-end">
                    <div className="bg-slate-900/90 border border-white/5 p-2 rounded-lg text-[10px] font-mono">
                      <p className="text-slate-400">Target Hospital: Chennai Central</p>
                      <p className="text-slate-500">Live coordinates: 13.0827° N, 80.2707° E</p>
                    </div>

                    <div className="bg-slate-900/90 border border-white/5 p-2 rounded-lg text-[10px] font-mono text-right">
                      <p className="text-slate-400">Ambulance ETA: {ambulanceActive ? `${ambulanceEta} Mins` : 'Standby'}</p>
                      <div className="w-24 bg-slate-950 h-1 rounded overflow-hidden mt-1">
                        <div className="h-full bg-emerald-500" style={{ width: `${ambulanceProgress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Driver Detail Card */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[9px] uppercase text-rose-400 font-mono font-bold block">Assigned Logistics Responder</span>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center font-bold font-mono text-rose-400">SK</div>
                      <div>
                        <p className="font-bold text-xs text-white">Senthil Kumar (Ambulance #4)</p>
                        <p className="text-[10px] text-slate-400">Sovereign Dispatch Certificate 0x90A</p>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 text-[11px] font-mono text-slate-400 space-y-1.5">
                      <p>🗣️ Languages: Tamil, English</p>
                      <div className="flex items-center justify-between">
                        <p>📞 Phone: +91 94440 98124</p>
                        <button
                          onClick={() => startCall('emergency', 'Senthil Kumar', 'Ambulance Responder Driver')}
                          className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-600 border border-rose-500/30 hover:text-white text-rose-400 text-[10px] font-mono font-bold transition-all flex items-center gap-1 shrink-0"
                        >
                          <Phone className="h-3 w-3" /> Call Driver
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 text-center">
                    <p className="text-[10px] text-slate-500 italic">"Security protocol: Patient medical history summaries (BMI, Blood group, allergies) were auto-synchronized securely."</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: SOVEREIGN DEMOGRAPHIC CARE (Module 13, 14, 15, 16) */}
        {activeTab === 'specialized' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Mental Health Compass with breathing exercise guide (Module 13) */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Brain className="h-4 w-4" />
                    Mental Health Support Compass
                  </h3>
                  <span className="text-[9px] bg-violet-500/10 text-violet-300 font-mono px-2 py-0.5 rounded uppercase">Relax Engine</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dynamic Interactive Stress Screening test */}
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 space-y-3">
                    <span className="text-[9px] uppercase text-slate-500 font-mono block">Stress Screening Test</span>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-300">How would you score your cognitive stress today?</p>
                      <div className="flex gap-1 pt-1">
                        {[1,2,3,4,5,6,7,8,9,10].map(s => (
                          <button 
                            key={s} 
                            onClick={() => setStressLevel(s)}
                            className={`flex-1 py-1 rounded text-[10px] font-mono font-bold ${stressLevel === s ? 'bg-violet-500 text-slate-950' : 'bg-white/5 hover:bg-white/10'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      AI advice: {stressLevel > 7 ? 'High Stress detected. Take a 5-minute breathing break.' : 'Stress parameters normal.'}
                    </p>
                  </div>

                  {/* Mood tracking logs */}
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 space-y-2">
                    <span className="text-[9px] uppercase text-slate-500 font-mono block">Mood Tracker</span>
                    <div className="flex justify-between gap-1 pt-1">
                      {['😊 Happy', '😐 Neutral', '😔 Exhausted', '😡 Stressed'].map(m => (
                        <button 
                          key={m} 
                          onClick={() => setMood(m)}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold flex-1 ${mood === m ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300' : 'bg-white/5 hover:bg-white/10'}`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <input 
                      type="text" 
                      value={moodNotes} 
                      onChange={(e) => setMoodNotes(e.target.value)}
                      placeholder="Optional notes..." 
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-[11px]"
                    />
                  </div>
                </div>

                {/* Animated Breathing exercise bubble (Module 13) */}
                <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="font-bold text-xs text-white">Interactive Pranayama Breathing Exercise</p>
                    <p className="text-[10px] text-slate-400">Synchronize inhaling loops with the expanding circular indicator bubble below.</p>
                    <div className="flex gap-2 pt-1.5 justify-center sm:justify-start">
                      <button 
                        onClick={() => { setBreathingPhase('Inhale'); setBreathCount(4); }}
                        className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-slate-950 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Play className="h-3 w-3" /> Start Loop
                      </button>
                      <button 
                        onClick={() => setBreathingPhase('Idle')}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Pause className="h-3 w-3" /> Stop
                      </button>
                    </div>
                  </div>

                  {/* Animated Visual Bubble expanding / shrinking */}
                  <div className="flex items-center gap-4">
                    <div className="relative flex items-center justify-center h-20 w-20">
                      {/* Bubble with responsive size based on phase */}
                      <div className={`absolute rounded-full transition-all duration-1000 bg-violet-500/10 border border-violet-500/30 flex items-center justify-center ${
                        breathingPhase === 'Inhale' ? 'h-20 w-20 scale-100' : 
                        breathingPhase === 'Hold' ? 'h-20 w-20 scale-100 bg-violet-500/20' : 
                        breathingPhase === 'Exhale' ? 'h-10 w-10 scale-50' : 'h-14 w-14 scale-75'
                      }`} />
                      <div className="z-10 text-center font-mono text-xs font-bold text-violet-300">
                        <p>{breathingPhase === 'Idle' ? 'Idle' : breathingPhase}</p>
                        <p className="text-[9px] text-slate-500">{breathCount}s</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pregnancy Care Week tracker (Module 14) */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Baby className="h-4 w-4" />
                    Maternal Pregnancy Care Center
                  </h3>
                  <span className="text-[9px] bg-amber-500/10 text-amber-300 font-mono px-2 py-0.5 rounded uppercase font-bold">Week {pregWeek} Active</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 space-y-2">
                    <span className="text-[9px] text-slate-500 uppercase block font-mono">Pregnancy Week Tracker</span>
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold text-white font-mono">Week {pregWeek} of 40</p>
                      <div className="flex gap-1">
                        <button onClick={() => setPregWeek(p => Math.max(1, p - 1))} className="px-1.5 py-0.5 bg-white/5 hover:bg-white/10 text-xs rounded transition-all">-</button>
                        <button onClick={() => setPregWeek(p => Math.min(40, p + 1))} className="px-1.5 py-0.5 bg-white/5 hover:bg-white/10 text-xs rounded transition-all">+</button>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Baby growth equivalent: <strong className="text-amber-300">{getPregnancyDetails(pregWeek).size}</strong> (approx. {getPregnancyDetails(pregWeek).weight})
                    </p>
                  </div>

                  <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 space-y-2">
                    <span className="text-[9px] text-slate-500 uppercase block font-mono">Upcoming Immunization</span>
                    <p className="font-bold text-xs text-white">
                      {pregWeek <= 20 ? "Anatomy Scan & Iron reserves" : "TDAP Booster Vaccine"}
                    </p>
                    <p className="text-[10px] text-amber-400">
                      {pregWeek <= 20 ? "Schedule: Clear before Week 22" : "Schedule: Recommended between Week 27 and 36"}
                    </p>
                  </div>
                </div>

                <div className="bg-amber-950/20 border border-amber-500/15 p-3 rounded-xl text-xs space-y-1">
                  <span className="text-[9px] uppercase font-bold text-amber-400 font-mono">AI Recommended Diet & Doctor Calendar</span>
                  <p className="italic text-slate-300">"{getPregnancyDetails(pregWeek).advice}"</p>
                </div>
              </div>

            </div>

            {/* Child Care & Elderly Fall Alert Simulator (Module 15, 16) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Pediatric Immunization (Module 15) */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Baby className="h-4 w-4" />
                  Pediatric Care & Immunization Scheduler
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                    <span className="text-[9px] text-slate-500 uppercase block font-mono">Growth Chart Logger</span>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-extrabold text-white text-xs">Age: {childAge} Yrs</p>
                          <div className="flex gap-1">
                            <button onClick={() => setChildAge(p => Math.max(0, p - 1))} className="px-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono font-bold">-1</button>
                            <button onClick={() => setChildAge(p => Math.min(15, p + 1))} className="px-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono font-bold">+1</button>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400">Weight: {childWeight} kg</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => setChildWeight(p => Math.max(1, Number((p - 0.5).toFixed(1))))} className="px-1 py-0.5 bg-white/5 text-[10px] rounded hover:bg-white/10 font-mono">-0.5</button>
                        <button onClick={() => setChildWeight(p => Math.min(100, Number((p + 0.5).toFixed(1))))} className="px-1 py-0.5 bg-white/5 text-[10px] rounded hover:bg-white/10 font-mono">+0.5</button>
                      </div>
                    </div>
                    <span className="text-[9px] text-emerald-400 font-mono block">★ 50th percentile (Normal growth)</span>
                  </div>

                  <div className="bg-slate-950/50 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase block font-mono">Child Diet & Pediatric schedules</span>
                    <p className="text-xs font-semibold text-slate-300">Upcoming Vaccination</p>
                    {(() => {
                      if (childAge < 1) return <p className="text-[10px] text-rose-400 font-mono font-bold">Rotavirus Booster (Due in 2 weeks)</p>;
                      if (childAge === 1 || childAge === 2) return <p className="text-[10px] text-rose-400 font-mono font-bold">MMR Vaccine Booster (Due in 3 weeks)</p>;
                      if (childAge >= 3 && childAge <= 5) return <p className="text-[10px] text-rose-400 font-mono font-bold">DPT Vaccine Booster (Due in 1 month)</p>;
                      return <p className="text-[10px] text-emerald-400 font-mono font-bold">HPV & Tdap Vaccine (Recommended)</p>;
                    })()}
                  </div>
                </div>
              </div>

              {/* Elderly Fall Alert & Priority queues (Module 16) */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Accessibility className="h-4 w-4" />
                    Geriatric Elderly Care Hub
                  </h3>
                  <span className="text-[9px] bg-red-600/10 text-rose-400 border border-red-500/20 font-mono px-2 py-0.5 rounded font-extrabold uppercase">Fall Sensor Enabled</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5 flex flex-col justify-between h-[110px]">
                    <div>
                      <p className="font-bold text-xs text-white">Fall Alert Simulator</p>
                      <p className="text-[9.5px] text-slate-400 leading-normal">Simulate fall-alert wearable sensors alerting primary family contacts.</p>
                    </div>
                    <button 
                      onClick={() => {
                        showToast("⚠️ FALL TRIGGERED: Dispatching priority ambulance #1 and alerting primary family contacts immediately.", "danger");
                        setAuditLogs(l => [{ time: new Date().toLocaleTimeString(), action: '⚠️ Fall detected by smart wearable device - Emergency Dispatch auto-allocated', actor: 'Elderly wear-device', ip: '192.168.1.189' }, ...l]);
                      }}
                      className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[10px] transition-all shadow-lg shadow-rose-600/10"
                    >
                      Simulate Fall
                    </button>
                  </div>

                  <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5 flex flex-col justify-between h-[110px]">
                    <div>
                      <p className="font-bold text-xs text-white">Elderly Care Hotline</p>
                      <p className="text-[9.5px] text-slate-400 leading-normal">Direct low-latency emergency voice connection to dedicated geriatric nurses.</p>
                    </div>
                    <button 
                      onClick={() => startCall('voice', 'Geriatric Care Hub Operator', 'Elderly Care Dedicated Hotline')}
                      className="w-full py-1.5 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:text-slate-950 text-emerald-400 font-bold rounded-lg text-[10px] transition-all flex items-center justify-center gap-1"
                    >
                      <Phone className="h-3.5 w-3.5" /> Call Hotline
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 6: DIGITAL HEALTH VAULT & SECURITY LOGS (Module 5, 23) */}
        {activeTab === 'records' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Health Vault & Document lists (Module 5) */}
            <div className="lg:col-span-2 bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Lock className="h-4 w-4" />
                  Encrypted Digital Health Records (JWT AES-256)
                </h3>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleUploadClick}
                    disabled={uploadProgress !== null}
                    className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-[10px] rounded-lg flex items-center gap-1 shrink-0"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{uploadProgress !== null ? `Uploading ${uploadProgress}%` : 'Upload Health Report'}</span>
                  </button>
                </div>
              </div>

              {/* Reports list with Decrypt simulation (Module 23) */}
              <div className="space-y-2.5">
                {reports.map(rep => (
                  <div key={rep.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-teal-400" />
                        <span className="font-bold text-white text-[11px]">{rep.name}</span>
                        <span className="text-[9px] bg-white/5 text-slate-400 px-1.5 rounded">{rep.type}</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Uploaded: {rep.date} • File size: {rep.size}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        AES Encrypted
                      </span>
                      <button 
                        onClick={() => setDecryptedReportId(decryptedReportId === rep.id ? null : rep.id)}
                        className="px-2.5 py-1 text-[10px] font-mono font-bold bg-white/5 hover:bg-white/10 rounded-lg text-slate-300"
                      >
                        {decryptedReportId === rep.id ? 'Hide Data' : 'Decrypt View'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {decryptedReportId && (
                <div className="p-3.5 bg-slate-950 rounded-xl border border-teal-500/25 space-y-2 text-xs leading-relaxed text-slate-300 animate-fade-in">
                  <span className="text-[9px] uppercase text-teal-400 font-mono font-bold block">Decrypted Clinical report view (Token Verified)</span>
                  <p className="font-semibold text-white">Report Reference: CBC Diagnostic Scan</p>
                  <p className="text-[11px] text-slate-400">
                    - Hemoglobin: **14.2 g/dL** (Normal range 13.5-17.5)<br />
                    - White Blood Cell: **6,800 /mcL** (Normal range 4,500-11,000)<br />
                    - Blood Sugar Fasting: **95 mg/dL**<br />
                    - Recommendation: Clinically healthy profile. Maintain water balances.
                  </p>
                </div>
              )}

              {/* Dynamic Health Timeline */}
              <div className="pt-4 border-t border-white/5">
                <span className="text-[9px] uppercase text-slate-500 font-mono font-bold block mb-3">Chronological Patient Health Timeline</span>
                <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-4 text-xs">
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-teal-500 border-4 border-slate-900" />
                    <p className="font-bold text-white text-[11px]">July 2, 2026</p>
                    <p className="text-slate-400">CBC lab reports generated. Telemedicine consultation completed with Dr. Prasad.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-slate-700 border-4 border-slate-900" />
                    <p className="font-bold text-white text-[11px]">June 15, 2026</p>
                    <p className="text-slate-400">Vaccination booster administered: Hepatitis-B booster dose cleared at Tambaram hub.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Col: Cyber Authentication Security Audit Logs (Module 23) */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-rose-500" />
                  Compliance Security Auditor
                </h3>
                <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-mono px-2 py-0.5 rounded font-extrabold uppercase">ISO 27001</span>
              </div>

              <div className="space-y-3 font-mono text-[9px] text-slate-400">
                <div className="bg-slate-950 p-3 rounded-lg space-y-1 text-slate-300">
                  <p className="font-bold text-cyan-400">JWT Authentication Session token</p>
                  <p className="break-all text-[8.5px] opacity-75">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik1lZGl... (AES Encrypted)</p>
                  <span className="text-[8.5px] text-emerald-400 font-bold block pt-1">● Role Level: CITIZEN AUTHORIZED</span>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Grid Security Audit Trail</span>
                  <div className="space-y-1.5 max-h-[170px] overflow-y-auto custom-scrollbar">
                    {auditLogs.map((log, idx) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded border border-white/5 space-y-0.5 text-[8.5px]">
                        <div className="flex justify-between text-slate-500">
                          <span>{log.time}</span>
                          <span>{log.ip}</span>
                        </div>
                        <p className="text-slate-300 font-semibold">{log.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 7: GOVERNMENT SCHEMES & WELFARE ELIGIBILITY (Module 19) */}
        {activeTab === 'schemes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Government Schemes Details (Module 19) */}
            <div className="lg:col-span-2 bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Info className="h-4 w-4" />
                Integrated Government Health Schemes Eligibility Hub
              </h3>

              <div className="space-y-4">
                {[
                  { name: 'Ayushman Bharat (PM-JAY)', eligibility: 'Household income < ₹1.2 Lakhs/year or rural catalog listing.', benefits: 'Cashless health insurance coverage up to ₹5 Lakhs per family per year for secondary/tertiary hospitalizations.', doc: 'Aadhaar Card, Ration Card, Income Certificate' },
                  { name: 'Amma Comprehensive Health Insurance', eligibility: 'Tamil Nadu residency with annual income limit < ₹1.2 Lakhs.', benefits: 'Provides full coverage for 1,027 medical/surgical procedures at public/private networks.', doc: 'Ration Card, Self Declaration, Income Slip' },
                  { name: 'Senior Citizen Medical Program', eligibility: 'Citizens aged 60+ regardless of bracket.', benefits: 'Free geriatric screenings, priority beds reservation, and highly discounted medicine distribution lines.', doc: 'Age Proof, Aadhaar Card' }
                ].map((scheme, index) => {
                  const status = schemeStatus[scheme.name] || 'Apply';
                  return (
                    <div key={index} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h4 className="font-bold text-white text-xs md:text-sm">{scheme.name}</h4>
                        <button 
                          onClick={() => {
                            setSchemeStatus(prev => ({ ...prev, [scheme.name]: 'Applied' }));
                            setTimeout(() => {
                              setSchemeStatus(prev => ({ ...prev, [scheme.name]: 'Approved' }));
                              showToast(`Congratulation: Eligibility application for "${scheme.name}" is approved.`, "success");
                            }, 2000);
                          }}
                          className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                            status === 'Apply' ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950' : 
                            status === 'Applied' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {status === 'Apply' ? 'Apply Scheme' : status === 'Applied' ? 'Under Review' : 'Scheme Approved'}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-[9px] uppercase text-slate-500 font-mono block">Eligibility criteria</span>
                          <p className="text-slate-300 font-medium">{scheme.eligibility}</p>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase text-slate-500 font-mono block">Documents required</span>
                          <p className="text-slate-300 font-medium">{scheme.doc}</p>
                        </div>
                      </div>

                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 text-[11px]">
                        <span className="text-[9px] uppercase text-cyan-400 font-mono font-bold block">Cashless benefits</span>
                        <p className="text-slate-400 mt-0.5">{scheme.benefits}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Developer/System Architecture Details (Module 21, 24, 25, 27) */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4 font-mono text-[10px]">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider">Developer & System Architecture</span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">FastAPI Schema</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="font-bold text-cyan-400">FastAPI Route Endpoint Catalog</p>
                  <ul className="space-y-1 list-disc list-inside text-slate-400">
                    <li><span className="text-white">POST</span> `/api/auth/jwt`</li>
                    <li><span className="text-white">POST</span> `/api/appointments/book`</li>
                    <li><span className="text-white">GET</span> `/api/telemetry/hospitals`</li>
                    <li><span className="text-white">POST</span> `/api/records/aes_encrypt`</li>
                    <li><span className="text-white">GET</span> `/api/vitals/health_score`</li>
                  </ul>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-cyan-400">MongoDB Database Models</p>
                  <pre className="bg-slate-950 p-2.5 rounded text-[8.5px] text-slate-400 border border-white/5 max-h-36 overflow-y-auto custom-scrollbar leading-tight font-mono whitespace-pre">
{`PatientSchema = {
  "id": "pat_9021",
  "vitals": {
    "bp": [120, 80],
    "sugar": 95,
    "bmi": 24.2
  },
  "records": ["ref_890a"],
  "compliance": 0.94
}`}
                  </pre>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-cyan-400">AI Prompt System instructions</p>
                  <pre className="bg-slate-950 p-2.5 rounded text-[8.5px] text-slate-400 border border-white/5 max-h-36 overflow-y-auto custom-scrollbar leading-tight font-mono whitespace-pre-wrap">
{`"You are an AI Clinical Diagnostic Specialist. Evaluate the following natural language query. Return symptom extraction, risk factors percentage, recommended clinical specialist, and a medical disclaimer."`}
                  </pre>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* LAB TEST BOOKING DIALOG/MODAL */}
      {showLabModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl relative animate-fade-in text-left">
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <Activity className="h-5 w-5 text-cyan-400" />
              Sovereign Lab Test Booking
            </h3>
            <p className="text-xs text-slate-400">Schedule a secure certified clinical test. Results will be auto-encrypted and delivered directly to your Digital Health Vault.</p>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Select Lab Diagnostic Test</label>
                <select 
                  value={selectedLabTest} 
                  onChange={(e) => setSelectedLabTest(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC) - ₹299</option>
                  <option value="Fasting Blood Glucose">Fasting Blood Glucose - ₹149</option>
                  <option value="Lipid Profile (Cholesterol)">Lipid Profile (Cholesterol) - ₹399</option>
                  <option value="Kidney Function Panel (KFT)">Kidney Function Panel (KFT) - ₹499</option>
                  <option value="Liver Function Panel (LFT)">Liver Function Panel (LFT) - ₹499</option>
                  <option value="Thyroid Profile (T3, T4, TSH)">Thyroid Profile (T3, T4, TSH) - ₹599</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Choose Date</label>
                  <input 
                    type="date" 
                    value={labBookingDate} 
                    onChange={(e) => setLabBookingDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Select Time Slot</label>
                  <select 
                    value={labBookingTime} 
                    onChange={(e) => setLabBookingTime(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="07:30 AM">07:30 AM (Fasting)</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="bg-cyan-500/5 border border-cyan-500/20 p-3 rounded-xl text-[11px] text-slate-300 space-y-1">
                <p className="font-bold text-cyan-400">Home Sample Collection: Active</p>
                <p className="text-slate-400 font-sans">A certified phlebotomist will arrive at your home registered address during your chosen slot. Zero additional travel required.</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowLabModal(false)}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setBookedLabTests(prev => [
                    { id: `LAB-${Math.floor(100 + Math.random() * 900)}`, testName: selectedLabTest, date: labBookingDate, time: labBookingTime, status: 'Confirmed', hospital: 'Chennai Central Metro General' },
                    ...prev
                  ]);
                  setShowLabModal(false);
                  showToast(`Lab Test "${selectedLabTest}" booked successfully for ${labBookingDate}!`, 'success');
                }}
                className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL TELEMEDICINE & EMERGENCY CALLING DIALOG OVERLAY */}
      {activeCall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in" id="call-overlay">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
            
            {/* Call Header */}
            <div className="p-5 flex items-center justify-between border-b border-white/5 bg-slate-950/40">
              <div className="flex items-center space-x-2">
                <span className={`h-2.5 w-2.5 rounded-full ${
                  activeCall.status === 'connected' ? 'bg-emerald-500 animate-pulse' :
                  activeCall.status === 'ringing' ? 'bg-amber-500 animate-bounce' :
                  activeCall.status === 'failed' ? 'bg-rose-500' : 'bg-cyan-500'
                }`} />
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  {activeCall.status === 'dialing' && 'Initializing WebRTC...'}
                  {activeCall.status === 'connecting' && 'Resolving Secure SIP...'}
                  {activeCall.status === 'ringing' && 'Ringing...'}
                  {activeCall.status === 'connected' && `LIVE CALL • ${formatDuration(activeCall.duration)}`}
                  {activeCall.status === 'ended' && 'Call Terminated'}
                  {activeCall.status === 'failed' && 'Call Failed'}
                </span>
              </div>
              <span className="text-[9px] font-mono text-slate-500 font-bold bg-white/5 px-2 py-0.5 rounded">
                AES-256 SECURE
              </span>
            </div>

            {/* Main Interactive Call Panel */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[260px] text-center space-y-4">
              
              {/* VIDEO CALL SCREEN / AVATAR AREA */}
              {activeCall.type === 'video' && activeCall.status === 'connected' && !activeCall.videoMuted ? (
                <div className="w-full aspect-video rounded-2xl bg-slate-950 border border-white/5 relative overflow-hidden flex items-center justify-center shadow-inner group">
                  {/* Doctor Video Stream Simulation */}
                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/10">
                    {/* Simulated pulse wave */}
                    <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M0,50 Q25,20 50,50 T100,50" fill="none" stroke="#10b981" strokeWidth="0.5" className="animate-pulse" />
                    </svg>
                    <div className="text-center z-10 space-y-2">
                      <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-xl text-emerald-400 mx-auto">
                        {activeCall.name.split('. ').pop()?.charAt(0) || 'D'}
                      </div>
                      <p className="text-xs font-bold text-white font-mono">{activeCall.name}</p>
                      <p className="text-[9px] text-emerald-400 uppercase tracking-wider font-semibold font-mono">Camera Stream Online</p>
                    </div>
                  </div>

                  {/* Citizen Selfie Cam PiP */}
                  <div className="absolute bottom-3 right-3 w-28 aspect-video rounded-xl bg-slate-900 border border-white/10 overflow-hidden shadow-lg flex items-center justify-center">
                    <div className="text-[8px] font-mono text-slate-500 text-center">
                      <span className="block font-bold text-slate-400">Your Camera</span>
                      <span className="text-[7px]">Simulated Feed</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* VOICE / EMERGENCY / MUTED AVATAR AREA */
                <div className="relative flex items-center justify-center">
                  {(activeCall.status === 'ringing' || activeCall.status === 'connected') && (
                    <>
                      <div className="absolute h-32 w-32 rounded-full border border-teal-500/10 animate-ping opacity-20" />
                      <div className="absolute h-24 w-24 rounded-full border border-teal-500/20 animate-pulse opacity-40" />
                    </>
                  )}
                  <div className={`h-20 w-20 rounded-full flex items-center justify-center border-2 shadow-lg transition-colors duration-300 ${
                    activeCall.type === 'emergency' 
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400 font-extrabold' 
                      : 'bg-teal-500/20 border-teal-500 text-teal-400'
                  }`}>
                    {activeCall.type === 'emergency' ? (
                      <AlertTriangle className="h-8 w-8 animate-pulse" />
                    ) : (
                      <Phone className="h-8 w-8" />
                    )}
                  </div>
                </div>
              )}

              {/* Call Info Labels */}
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-white font-mono">{activeCall.name}</h4>
                <p className="text-xs text-slate-400 font-medium">{activeCall.role}</p>
                {activeCall.errorMessage ? (
                  <p className="text-[10px] text-rose-400 font-semibold max-w-xs mx-auto bg-rose-500/10 p-2 rounded-xl mt-2">{activeCall.errorMessage}</p>
                ) : (
                  <p className="text-[10px] text-slate-500 font-mono">
                    {activeCall.status === 'dialing' && 'Rerouting packet stream...'}
                    {activeCall.status === 'connecting' && 'Performing ICE candidates exchange...'}
                    {activeCall.status === 'ringing' && 'Awaiting response...'}
                    {activeCall.status === 'connected' && 'Latency: 12ms • Codec: OPUS Fullband'}
                    {activeCall.status === 'ended' && 'Finalizing connection metrics...'}
                  </p>
                )}
              </div>

              {/* Live Audio Visualizer Waveform */}
              {activeCall.status === 'connected' && (
                <div className="flex items-center justify-center gap-1.5 h-6 pt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1].map((bar, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-teal-400 rounded-full transition-all duration-150"
                      style={{ 
                        height: activeCall.micMuted ? '2px' : `${Math.max(2, Math.sin((Date.now() + i * 200) / 150) * 12 + 12)}px`,
                        opacity: activeCall.micMuted ? 0.3 : 1
                      }} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Call Controls */}
            <div className="p-6 bg-slate-950/60 border-t border-white/5 flex justify-center items-center gap-4">
              
              {/* Mic Mute Toggle */}
              <button 
                onClick={() => {
                  if (activeCall.status === 'connected') {
                    setActiveCall(prev => prev ? { ...prev, micMuted: !prev.micMuted } : null);
                    showToast(activeCall.micMuted ? "Microphone Unmuted" : "Microphone Muted", "info");
                  }
                }}
                disabled={activeCall.status !== 'connected'}
                className={`p-3.5 rounded-full border transition-all ${
                  activeCall.micMuted 
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' 
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-40'
                }`}
                title={activeCall.micMuted ? "Unmute" : "Mute"}
              >
                {activeCall.micMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              {/* End Call Button */}
              <button 
                onClick={endCall}
                className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
                title="End Call"
              >
                <PhoneOff className="h-6 w-6" />
              </button>

              {/* Speaker / Camera Toggle */}
              {activeCall.type === 'video' ? (
                <button 
                  onClick={() => {
                    if (activeCall.status === 'connected') {
                      setActiveCall(prev => prev ? { ...prev, videoMuted: !prev.videoMuted } : null);
                      showToast(activeCall.videoMuted ? "Camera stream enabled" : "Camera stream disabled", "info");
                    }
                  }}
                  disabled={activeCall.status !== 'connected'}
                  className={`p-3.5 rounded-full border transition-all ${
                    activeCall.videoMuted 
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' 
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-40'
                  }`}
                  title={activeCall.videoMuted ? "Start Video" : "Stop Video"}
                >
                  {activeCall.videoMuted ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </button>
              ) : (
                <button 
                  onClick={() => {
                    if (activeCall.status === 'connected') {
                      setActiveCall(prev => prev ? { ...prev, speakerActive: !prev.speakerActive } : null);
                      showToast(activeCall.speakerActive ? "Speakerphone disabled" : "Speakerphone enabled", "info");
                    }
                  }}
                  disabled={activeCall.status !== 'connected'}
                  className={`p-3.5 rounded-full border transition-all ${
                    !activeCall.speakerActive 
                      ? 'bg-slate-800 border-white/5 text-slate-500' 
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-40'
                  }`}
                  title="Speakerphone"
                >
                  {activeCall.speakerActive ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </button>
              )}
            </div>

            {/* Help / Informational block */}
            <div className="bg-slate-950 p-3.5 text-[10px] text-slate-500 text-center font-mono border-t border-white/5">
              💡 Call uses client-side WebRTC mock framework combined with platform media validation.
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification HUD */}
      {toast.message && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm rounded-2xl border bg-slate-950/90 p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 duration-300 flex items-start gap-3 border-white/10">
          <div className={`mt-0.5 rounded-full p-1.5 ${
            toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
            toast.type === 'danger' ? 'bg-rose-500/10 text-rose-400 font-extrabold animate-pulse' :
            'bg-cyan-500/10 text-cyan-400'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> :
             toast.type === 'danger' ? <AlertTriangle className="h-5 w-5" /> :
             <Info className="h-5 w-5" />}
          </div>
          <div className="flex-1 space-y-0.5">
            <h4 className="font-extrabold text-[11px] text-white uppercase tracking-wider font-mono">
              {toast.type === 'success' ? 'System Success' :
               toast.type === 'danger' ? 'Critical Alert' :
               'System Information'}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{toast.message}</p>
          </div>
        </div>
      )}

    </div>
  );
}
