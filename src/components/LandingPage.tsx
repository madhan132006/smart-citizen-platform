import React, { useState } from 'react';
import { 
  ShieldCheck, ArrowRight, HeartPulse, Sparkles, 
  HelpCircle, Send, CheckCircle2, Stethoscope, Activity, ShieldAlert, Heart,
  Sprout, Award
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: (role: string) => void;
  language: 'en' | 'ta' | 'hi';
  db?: {
    users?: any[];
    emergencies?: any[];
    foodDonations?: any[];
    schemeApplications?: any[];
    [key: string]: any;
  };
}

export default function LandingPage({ onGetStarted, language, db }: LandingPageProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const t = {
    en: {
      heroTitle: 'LifeConnect AI',
      heroSubtitle: 'Smart Citizen Assistance Platform',
      heroDesc: 'An AI-powered platform that connects citizens with essential public services, emergency assistance, healthcare, government services, and real-time support through a single intelligent dashboard.',
      getStarted: 'Go to Dashboard',
      exploreFeatures: 'Explore Features',
      featuresTitle: 'Smart Citizen Ecosystem',
      contactTitle: 'Request Public Agency Integration',
      contactDesc: 'Are you a municipal commissioner, hospital administrator, or NGO director? Partner with LifeConnect AI to integrate your agency registry lines immediately.',
      submit: 'Submit Request',
      success: 'Thank you! Our regional systems administrator will contact your agency shortly.',
      faqTitle: 'Frequently Asked Questions',
      stat1: 'Registered Citizens',
      stat2: 'Emergency Dispatches',
      stat3: 'NGO Meals Distributed',
      stat4: 'Welfare Schemes Tracked'
    },
    ta: {
      heroTitle: 'லைஃப்கனெக்ட் AI',
      heroSubtitle: 'ஸ்மார்ட் குடிமகன் உதவி தளம்',
      heroDesc: 'உடல்நலக் கண்காணிப்பு, அவசர உதவி, அரசு நலத்திட்டங்கள் மற்றும் நிகழ்நேர பொதுச் சேவைகளை ஒரே ஒருங்கிணைந்த ஸ்மார்ட் கட்டுப்பாட்டுப் பலகத்தில் இணைக்கும் எலக்ட்ரானிக் தளம்.',
      getStarted: 'கட்டுப்பாட்டுப் பலகைக்குச் செல்லவும்',
      exploreFeatures: 'அம்சங்களை ஆராயுங்கள்',
      featuresTitle: 'நுண்ணறிவு பொது சேவை சுற்றுச்சூழல் அமைப்பு',
      contactTitle: 'பொதுத் துறை முகமை கூட்டாண்மை கோரிக்கை',
      contactDesc: 'நீங்கள் ஒரு நகராட்சி அதிகாரி, மருத்துவமனை நிர்வாகி அல்லது தன்னார்வலர் அமைப்பின் இயக்குநரா? உங்கள் சேவைகளை ஒருங்கிணைக்க லைஃப்கனெக்ட் AI உடன் இணையுங்கள்.',
      submit: 'கோரிக்கையைச் சமர்ப்பிக்கவும்',
      success: 'நன்றி! எங்கள் வட்டார நிர்வாகி விரைவில் உங்களைத் தொடர்புகொள்வார்.',
      faqTitle: 'அடிக்கडी கேட்கப்படும் கேள்விகள்',
      stat1: 'பதிவுசெய்யப்பட்ட குடிமக்கள்',
      stat2: 'அவசரகால மீட்புகள்',
      stat3: 'உணவுப் பொட்டலங்கள் விநியோகம்',
      stat4: 'நலத்திட்டங்கள்'
    },
    hi: {
      heroTitle: 'लाइफकनेक्ट AI',
      heroSubtitle: 'स्मार्ट नागरिक सहायता मंच',
      heroDesc: 'एक एआई-संचालित मंच जो नागरिकों को एक ही बुद्धिमान डैशबोर्ड के माध्यम से आवश्यक सार्वजनिक सेवाओं, आपातकालीन सहायता, स्वास्थ्य सेवा और वास्तविक समय की सहायता से जोड़ता है।',
      getStarted: 'डैशबोर्ड पर जाएं',
      exploreFeatures: 'सुविधाओं का अन्वेषण करें',
      featuresTitle: 'बुद्धिमान सार्वजनिक सेवा पारिस्थितिकी तंत्र',
      contactTitle: 'सार्वजनिक भागीदारी का अनुरोध करें',
      contactDesc: 'क्या आप एक नगर आयुक्त, अस्पताल प्रशासक या एनजीओ निदेशक हैं? अपनी सेवाओं को एकीकृत करने के लिए लाइफकनेक्ट एआई के साथ भागीदार बनें।',
      submit: 'अनुरोध भेजें',
      success: 'धन्यवाद! हमारे क्षेत्रीय प्रशासक जल्द ही आपसे संपर्क करेंगे।',
      faqTitle: 'अक्सर पूछे जाने वाले प्रश्न',
      stat1: 'पंजीकृत नागरिक',
      stat2: 'आपातकालीन प्रेषण',
      stat3: 'वितरित भोजन',
      stat4: 'ट्रैक की गई योजनाएं'
    }
  };

  const currentT = t[language] || t.en;

  const citizenCount = db?.users?.length !== undefined ? db.users.length.toString() : "0";
  const emergencyCount = db?.emergencies?.length !== undefined ? db.emergencies.length.toString() : "0";
  
  const totalMeals = db?.foodDonations?.reduce((sum: number, donation: any) => {
    if (!donation.quantity) return sum;
    const match = donation.quantity.toString().match(/(\d+)/);
    const qty = match ? parseInt(match[1], 10) : 0;
    return sum + qty;
  }, 0) ?? 0;
  
  const mealsCount = totalMeals > 0 ? totalMeals.toString() : "0";
  const schemesCount = db?.schemeApplications?.length !== undefined ? db.schemeApplications.length.toString() : "0";

  const stats = [
    { label: currentT.stat1, value: citizenCount, color: 'from-emerald-400 to-cyan-400' },
    { label: currentT.stat2, value: emergencyCount, color: 'from-rose-500 to-amber-500' },
    { label: currentT.stat3, value: mealsCount, color: 'from-teal-400 to-emerald-500' },
    { label: currentT.stat4, value: schemesCount, color: 'from-violet-400 to-indigo-500' }
  ];

  const benefits = [
    {
      role: 'Citizens & Patients',
      desc: 'Seamless doctor appointments, real-time emergency SOS coordination, and instant government scheme eligibility tracking.',
      icon: HeartPulse,
      gradient: 'from-rose-500 to-red-500'
    },
    {
      role: 'Farmers & Producers',
      desc: 'Smart pricing predictions based on real-time market indices, weather forecasts, and agricultural yield analytics.',
      icon: Sprout,
      gradient: 'from-lime-500 to-emerald-500'
    },
    {
      role: 'NGOs & Volunteers',
      desc: 'Coordinate excess food distribution, active rescue efforts, and register local blood donations securely.',
      icon: Sparkles,
      gradient: 'from-violet-500 to-indigo-500'
    },
    {
      role: 'Public Administrators',
      desc: 'Unified governance dashboard to monitor public complaints, emergency dispatches, and public transport status.',
      icon: Award,
      gradient: 'from-cyan-500 to-blue-500'
    }
  ];

  const faqs = [
    {
      q: 'How does the Emergency Response (SOS) button operate?',
      a: 'When triggered, the SOS system automatically captures your location and triggers instant alerts to nearby paramedics, police, or rescue volunteers. Status and ETAs are tracked dynamically on our integrated dashboard.'
    },
    {
      q: 'Is my personal citizen data secure?',
      a: 'Yes, LifeConnect AI complies with high privacy standards. Access is secured using state-of-the-art authentication tokens and roles, ensuring medical records, farmer transactions, and complaint details are accessible only by authorized authorities.'
    },
    {
      q: 'How do the Public Service applications work?',
      a: 'Citizens can apply for social welfare schemes, submit sanitation complaints, or check real-time bus transit times directly through our centralized and automated API service layers.'
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden" id="landing-root">
      
      {/* Immersive Glassmorphic Hero Banner */}
      <section className="relative overflow-hidden px-6 pt-24 pb-16 md:pt-32 md:pb-24 border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(6,182,212,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(16,185,129,0.08),transparent_50%)]" />
        
        {/* Decorative Glowing Grid Background backdrop */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent pointer-events-none" />

        <div className="mx-auto max-w-5xl text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 rounded-full bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20 animate-pulse">
            <ShieldCheck className="h-4 w-4" />
            <span>ISO 27001 SECURED CITIZEN SOVEREIGN PORTAL</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 max-w-4xl mx-auto leading-tight" id="hero-title">
            {currentT.heroTitle}
          </h1>

          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent max-w-3xl mx-auto">
            {currentT.heroSubtitle}
          </h2>

          <p className="mx-auto max-w-2xl text-sm md:text-base text-slate-400 font-medium leading-relaxed" id="hero-desc">
            {currentT.heroDesc}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onGetStarted('citizen')}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 px-6 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:from-cyan-400 hover:to-emerald-300 transition-all active:scale-95 cursor-pointer"
              id="get-started-btn"
            >
              <span>{currentT.getStarted}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#features-section"
              className="flex items-center space-x-2 rounded-xl bg-white/5 px-6 py-3 text-xs font-bold text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              id="explore-features-btn"
            >
              <Activity className="h-4 w-4 text-cyan-400" />
              <span>{currentT.exploreFeatures}</span>
            </a>
          </div>

          {/* Centered Premium Mockup of the Dashboard using our generated image */}
          <div className="pt-8 max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(6,182,212,0.15)] bg-slate-950 p-2 group">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-emerald-500/10 opacity-60 pointer-events-none rounded-2xl" />
              <img 
                src="/src/assets/images/life_connect_hero_1783589703052.jpg" 
                alt="LifeConnect AI Intelligent Smart City & Citizen Command Center" 
                className="w-full h-auto max-h-[400px] object-cover rounded-xl grayscale-[15%] group-hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-mono text-cyan-400">
                <Activity className="h-3 w-3 animate-pulse text-emerald-400" />
                <span>DYNAMIC INTEGRATED CITIZEN GRID LINKED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern High-contrast Medical Impact Statistics Grid */}
      <section className="mx-auto max-w-5xl px-6 py-12" id="stats-section">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className="rounded-2xl bg-white/5 border border-white/5 p-5 text-center shadow-xl hover:border-white/10 transition-all group"
            >
              <div className={`bg-gradient-to-r ${stat.color} bg-clip-text text-3xl font-extrabold text-transparent mb-1 group-hover:scale-105 transition-transform`}>
                {stat.value}
              </div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold leading-tight">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Role Benefits & Dynamic Cards Section */}
      <section id="features-section" className="mx-auto max-w-5xl px-6 py-16 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {currentT.featuresTitle}
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            Specialized workflows engineered to keep citizens, farmers, volunteers, and public officials synchronized in real time.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div 
                key={i} 
                className="relative group overflow-hidden rounded-2xl bg-slate-900 border border-white/5 p-6 hover:border-white/10 transition-all shadow-xl"
              >
                <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${b.gradient} rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className="flex items-center space-x-3.5 mb-3">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${b.gradient} flex items-center justify-center text-slate-950 shadow-md`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">
                    {b.role}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Beautiful Accordion FAQs Section */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-16 space-y-8">
        <h2 className="text-2xl font-bold tracking-tight text-center text-white">
          {currentT.faqTitle}
        </h2>
        
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="rounded-xl border border-white/5 bg-slate-900 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs md:text-sm text-slate-100 hover:bg-white/5 transition-all focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <span className={`text-cyan-400 text-lg transition-transform ${isOpen ? 'rotate-45' : ''}`}>+</span>
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 border-t border-white/5 text-xs text-slate-400 leading-relaxed animate-slide-down">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Clean Partner request footer */}
      <section className="mx-auto max-w-3xl px-6 py-16 border-t border-white/5" id="partner-section">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 border border-cyan-500/10 p-8 text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-3xl" />
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">
              {currentT.contactTitle}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {currentT.contactDesc}
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter official agency email..."
              required
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
            <button
              type="submit"
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold px-5 py-2.5 transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer"
            >
              <span>{currentT.submit}</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

          {submitted && (
            <div className="inline-flex items-center space-x-2 text-xs text-cyan-400 bg-cyan-400/10 px-3.5 py-1.5 rounded-full border border-cyan-500/20 animate-fade-in">
              <CheckCircle2 className="h-4 w-4" />
              <span>{currentT.success}</span>
            </div>
          )}
        </div>
      </section>

      {/* Simple, Humble Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-[11px] text-slate-500 font-mono">
        <p>© 2026 LifeConnect AI Platform. Built with secure sovereign AI technology.</p>
        <p className="mt-1">Chennai Public Grid Integration System</p>
      </footer>

    </div>
  );
}
