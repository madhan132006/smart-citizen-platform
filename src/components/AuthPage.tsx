import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ArrowRight, Lock, Mail, AlertCircle,
  Eye, EyeOff, CheckCircle2, Heart, Activity, Shield, Sparkles, Check, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthProps {
  onLoginSuccess: (user: any) => void;
  language: 'en' | 'ta' | 'hi';
}

export default function AuthPage({ onLoginSuccess, language }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Translations dictionary for healthcare context
  const t = {
    en: {
      title: "LifeConnect AI",
      subtitle: "Smart Citizen Assistance Platform",
      welcomeMsg: "Connecting citizens, public officials, farmers, NGOs, and emergency services on a single unified platform. Experience real-time public service coordination, automated rescue SOS routing, and seamless community assistance.",
      signInTitle: "Access Command Center",
      signInSub: "Sign in with your secure citizen or administrator ID.",
      emailLabel: "Secure Email ID",
      passwordLabel: "Security Password",
      showPass: "Show Password",
      hidePass: "Hide Password",
      rememberMe: "Remember me on this device",
      forgotPass: "Forgot Password?",
      loginBtn: "Authenticate & Enter",
      demoTitle: "Demo Sandbox Account",
      demoDesc: "Gain instant access to the dynamic citizen and service management dashboard with verified test credentials.",
      useDemoBtn: "Use Demo Credentials",
      vitalsCheck: "Real-time Public Services",
      sosCheck: "Smart Autonomous SOS Rescue",
      collabCheck: "Integrated Citizen Networks"
    },
    ta: {
      title: "லைஃப்கனெக்ட் AI",
      subtitle: "ஸ்மார்ட் குடிமகன் உதவி தளம்",
      welcomeMsg: "பொதுமக்கள், அரசு அதிகாரிகள், விவசாயிகள், தன்னார்வலர்கள் மற்றும் அவசர மீட்பு சேவைகளை ஒரே ஒருங்கிணைந்த ஸ்மார்ட் தளத்தில் இணைக்கிறது. நிகழ்நேர பொதுச் சேவை மேலாண்மை மற்றும் தானியங்கி அவசர SOS மீட்புகளை அனுபவியுங்கள்.",
      signInTitle: "கட்டளை மையத்தை அணுகவும்",
      signInSub: "உங்கள் குடிமகன் அல்லது நிர்வாகி ஐடி மூலம் உள்நுழைக.",
      emailLabel: "பாதுகாப்பான மின்னஞ்சல் ஐடி",
      passwordLabel: "பாதுகாப்பு கடவுச்சொல்",
      showPass: "கடவுச்சொல்லைக் காட்டு",
      hidePass: "கடவுச்சொல்லை மறை",
      rememberMe: "இந்தச் சாதனத்தில் என்னை நினைவில் கொள்க",
      forgotPass: "கடவுச்சொல் மறந்துவிட்டதா?",
      loginBtn: "அங்கீகரித்து உள்ளே நுழைக",
      demoTitle: "டெமோ சாண்ட்பாக்ஸ் கணக்கு",
      demoDesc: "சரிபார்க்கப்பட்ட சோதனை நற்சான்றுகளுடன் குடிமகன் மற்றும் பொதுச்சேவை கட்டுப்பாட்டுப் பலகைக்கு உடனடி அணுகலைப் பெறுங்கள்.",
      useDemoBtn: "டெமோ சான்றுகளைப் பயன்படுத்தவும்",
      vitalsCheck: "நிகழ்நேர பொதுச் சேவைகள்",
      sosCheck: "அதிவேக அவசரகால SOS",
      collabCheck: "ஒருங்கிணைந்த சமூக நெட்வொர்க்"
    },
    hi: {
      title: "लाइफकनेक्ट AI",
      subtitle: "स्मार्ट नागरिक सहायता मंच",
      welcomeMsg: "नागरिकों, सार्वजनिक अधिकारियों, किसानों, गैर सरकारी संगठनों और आपातकालीन बचाव सेवाओं को एक ही बुद्धिमान सहायता मंच पर जोड़ना। वास्तविक समय में सार्वजनिक सेवाओं, स्वचालित आपातकालीन बचाव और निर्बाध समन्वय का अनुभव करें।",
      signInTitle: "कमांड सेंटर तक पहुंचें",
      signInSub: "अपने सुरक्षित नागरिक या प्रशासक आईडी से साइन इन करें।",
      emailLabel: "सुरक्षित ईमेल आईडी",
      passwordLabel: "सुरक्षा पासवर्ड",
      showPass: "पासवर्ड दिखाएं",
      hidePass: "पासवर्ड छुपाएं",
      rememberMe: "इस डिवाइस पर मुझे याद रखें",
      forgotPass: "पासवर्ड भूल गए?",
      loginBtn: "प्रमाणित करें और प्रवेश करें",
      demoTitle: "डेमो सैंडबॉक्स खाता",
      demoDesc: "सत्यापित परीक्षण क्रेडेंशियल्स के साथ नागरिक और सेवा प्रबंधन डैशबोर्ड तक तुरंत पहुंच प्राप्त करें।",
      useDemoBtn: "डेमो क्रेडेंशियल का उपयोग करें",
      vitalsCheck: "वास्तविक समय सार्वजनिक सेवाएं",
      sosCheck: "स्मार्ट स्वायत्त आपातकालीन SOS",
      collabCheck: "एकीकृत नागरिक नेटवर्क"
    }
  };

  const currentT = t[language] || t.en;

  // Load remembered email if present
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('lifeconnect_remembered_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch (e) {
      console.error('Error loading remembered email:', e);
    }
  }, []);

  // Use demo credentials helper
  const handleUseDemo = () => {
    setEmail('demo@lifeconnectai.com');
    setPassword('Demo@123');
    setError('');
    setSuccess('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);

    // Simulate login network latency
    setTimeout(() => {
      const normEmail = email.trim().toLowerCase();
      const isDemo = normEmail === 'demo@lifeconnectai.com' && password === 'Demo@123';
      const isTestUser = normEmail.includes('@') && password.length >= 6;

      if (isDemo || isTestUser) {
        // Save email if remember me checked
        try {
          if (rememberMe) {
            localStorage.setItem('lifeconnect_remembered_email', email);
          } else {
            localStorage.removeItem('lifeconnect_remembered_email');
          }
        } catch (e) {
          console.error(e);
        }

        setSuccess('Authentication approved! Synchronizing public service databases & entering Command Center...');
        setLoading(false);

        // Notify parent on success
        setTimeout(() => {
          onLoginSuccess({
            id: isDemo ? 'user-demo' : `user-custom-${Math.floor(Math.random() * 1000)}`,
            name: isDemo ? 'Selvam Officer' : email.split('@')[0],
            email: normEmail,
            phone: '+91 94440 12345',
            role: isDemo ? 'admin' : 'citizen',
            isVerified: true
          });
        }, 1200);
      } else {
        setLoading(false);
        setError('Access Denied. Invalid email or password. Please use the Demo Credentials.');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col lg:flex-row relative overflow-hidden select-none" id="auth-container">
      {/* BACKGROUND DECORATIVE GLOWS */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-cyan-600/5 blur-[100px] pointer-events-none" />

      {/* LEFT SIDE (60% ON DESKTOP): BRANDING & VISUAL ILLUSTRATION */}
      <div className="w-full lg:w-[60%] flex flex-col justify-between p-6 md:p-12 lg:p-16 relative z-10 border-b lg:border-b-0 lg:border-r border-white/5 bg-slate-900/20 backdrop-blur-sm">
        {/* Upper Brand Badge */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-400 p-[1px]">
            <div className="h-full w-full bg-slate-950 rounded-xl flex items-center justify-center text-cyan-400">
              <ShieldCheck className="h-5 w-5 animate-pulse" />
            </div>
          </div>
          <div>
            <span className="text-sm font-extrabold font-mono tracking-wider bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              LIFECONNECT SOVEREIGN PLATFORM
            </span>
            <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold uppercase tracking-widest">
              v2.8
            </span>
          </div>
        </div>

        {/* Core Presentation Content */}
        <div className="my-10 lg:my-auto max-w-2xl space-y-8">
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight font-sans"
            >
              {currentT.title}: <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent font-extrabold">{currentT.subtitle}</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-sm text-slate-400 leading-relaxed font-sans max-w-xl"
            >
              {currentT.welcomeMsg}
            </motion.p>
          </div>

          {/* Premium Floated Bezel with generated Smart City Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(6,182,212,0.15)] bg-slate-950 p-2 group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-emerald-500/10 opacity-60 pointer-events-none rounded-2xl" />
            <img 
              src="/src/assets/images/life_connect_hero_1783589703052.jpg" 
              alt="LifeConnect AI Smart Citizen Dashboard" 
              className="w-full h-auto max-h-[320px] object-cover rounded-xl grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            {/* Overlay Glass Pills */}
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-mono text-cyan-400">
              <Activity className="h-3 w-3 animate-pulse text-emerald-400" />
              <span>LIVE CITIZEN PORTAL LINKED</span>
            </div>
          </motion.div>

          {/* Checklist Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <Activity className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-white">{currentT.vitalsCheck}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Continuous automated welfare eligibility monitoring.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <Shield className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-white">{currentT.sosCheck}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Automatic emergency coordinate priority routing.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-white">{currentT.collabCheck}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Secure municipal service lines and NGO connections.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lower copyright metadata */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-6 border-t border-white/5">
          <span>LIFECONNECT AI SOVEREIGN SECURITY LOG</span>
          <span>AES-256 E2E PROTOCOLS</span>
        </div>
      </div>

      {/* RIGHT SIDE (40% ON DESKTOP): PORTAL ACCESS CONTROL PANEL */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center p-6 md:p-12 lg:p-16 relative z-10 bg-slate-950">
        
        {/* Main Content Area */}
        <div className="max-w-md w-full mx-auto space-y-6">
          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-2xl font-black text-white tracking-tight">{currentT.signInTitle}</h2>
            <p className="text-xs text-slate-400">{currentT.signInSub}</p>
          </div>

          {/* Elegant Login Alert Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-start gap-2.5"
                id="login-error-msg"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-start gap-2.5"
                id="login-success-msg"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 animate-bounce" />
                <span className="leading-relaxed">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right Side Glass Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Accent Glowing Border Top */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-500" />

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                  {currentT.emailLabel}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    id="email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. demo@lifeconnectai.com"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                  {currentT.passwordLabel}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    id="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                    title={showPassword ? currentT.hidePass : currentT.showPass}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me and Forgot Password bar */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-400 hover:text-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="remember-me-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-white/10 bg-slate-950/60 text-blue-600 focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer"
                  />
                  <span>{currentT.rememberMe}</span>
                </label>
                <a 
                  href="#forgot-security-token" 
                  onClick={(e) => {
                    e.preventDefault();
                    setError('Password reset protocols require contacting system administrator tier at admin@lifeconnectai.com.');
                  }}
                  className="text-blue-400 hover:text-blue-300 hover:underline font-medium transition-colors"
                >
                  {currentT.forgotPass}
                </a>
              </div>

              {/* Login Action Button */}
              <button
                type="submit"
                id="login-submit-btn"
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 py-3 text-xs font-bold text-white hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.99] transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer mt-4"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Authenticating Handshake...</span>
                  </>
                ) : (
                  <>
                    <span>{currentT.loginBtn}</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* DEMO CREDENTIALS SECTION */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-slate-900/40 border border-dashed border-white/10 rounded-2xl p-5 space-y-3 relative"
            id="demo-credentials-card"
          >
            <div className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Info className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">{currentT.demoTitle}</h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {currentT.demoDesc}
                </p>
              </div>
            </div>

            {/* Simulated Credentials Details Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-white/5 text-[11px] font-mono">
              <div className="text-slate-400">
                <span className="text-slate-500 select-none block text-[9px] uppercase tracking-wider">Email</span>
                <span className="text-white">demo@lifeconnectai.com</span>
              </div>
              <div className="text-slate-400">
                <span className="text-slate-500 select-none block text-[9px] uppercase tracking-wider">Password</span>
                <span className="text-white">Demo@123</span>
              </div>
            </div>

            {/* Fill Credentials Button */}
            <button
              type="button"
              id="use-demo-credentials-btn"
              onClick={handleUseDemo}
              className="w-full py-2 border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/10 text-cyan-400 rounded-xl text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="h-3 w-3" /> {currentT.useDemoBtn}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
