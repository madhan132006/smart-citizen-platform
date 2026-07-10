import React, { useState } from 'react';
import { 
  Search, Bell, Shield, Sun, Moon, 
  Languages, User as UserIcon, Signal, HelpCircle 
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  language: 'en' | 'ta' | 'hi';
  onLanguageChange: (lang: 'en' | 'ta' | 'hi') => void;
  notifications: any[];
  onClearNotification: (id: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function Navbar({
  user,
  onLogout,
  language,
  onLanguageChange,
  notifications,
  onClearNotification,
  searchTerm,
  onSearchChange,
  isDark,
  onToggleTheme
}: NavbarProps) {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Translations dictionary for dynamic language changes
  const t = {
    en: {
      search: 'Search public services, schemes, emergency...',
      online: 'Platform Live',
      role: 'Role',
      notifTitle: 'Public Service Alerts',
      emptyNotif: 'No new alerts',
      logout: 'Sign Out',
      settings: 'Profile Settings',
      tamil: 'தமிழ் (Tamil)',
      hindi: 'हिंदी (Hindi)',
      english: 'English',
      citizen: 'Citizen',
      farmer: 'Farmer',
      government: 'Government Officer',
      ngo: 'NGO Administrator',
      volunteer: 'Rescue Volunteer',
      admin: 'Super Admin',
      hospital: 'Hospital Authority',
      transport: 'Transport Officer'
    },
    ta: {
      search: 'பொது சேவைகள், திட்டங்கள், அவசர உதவிகளைத் தேடுக...',
      online: 'செயலில் உள்ளது',
      role: 'பங்கு',
      notifTitle: 'பொது சேவை அறிவிப்புகள்',
      emptyNotif: 'புதிய அறிவிப்புகள் இல்லை',
      logout: 'வெளியேறு',
      settings: 'சுயவிவர அமைப்புகள்',
      tamil: 'தமிழ் (Tamil)',
      hindi: 'हिंदी (Hindi)',
      english: 'English',
      citizen: 'குடிமகன்',
      farmer: 'விவசாயி',
      government: 'அரசு அதிகாரி',
      ngo: 'அறக்கட்டளை நிர்வாகி',
      volunteer: 'தன்னார்வலர்',
      admin: 'சூப்பர் அட்மின்',
      hospital: 'மருத்துவமனை அதிகாரி',
      transport: 'போக்குவரத்து அதிகாரி'
    },
    hi: {
      search: 'सार्वजनिक सेवाओं, योजनाओं, आपातकालीन खोजें...',
      online: 'प्लेटफ़ॉर्म लाइव',
      role: 'भूमिका',
      notifTitle: 'सार्वजनिक सेवा सूचनाएं',
      emptyNotif: 'कोई नई सूचना नहीं',
      logout: 'साइन आउट',
      settings: 'प्रोफ़ाइल सेटिंग्स',
      tamil: 'தமிழ் (Tamil)',
      hindi: 'हिंदी (Hindi)',
      english: 'English',
      citizen: 'नागरिक',
      farmer: 'किसान',
      government: 'सरकारी अधिकारी',
      ngo: 'एनजीओ प्रशासक',
      volunteer: 'बचाव स्वयंसेवक',
      admin: 'सुपर एडमिन',
      hospital: 'अस्पताल प्राधिकरण',
      transport: 'परिवहन अधिकारी'
    }
  };

  const currentT = t[language];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Side: Brand with Glass Design */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-md shadow-emerald-500/20">
            <span className="font-sans text-xl font-bold text-slate-950">LC</span>
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-lg font-bold tracking-tight text-transparent">
              LifeConnect AI
            </h1>
            <p className="text-[10px] tracking-wider text-cyan-400 uppercase font-mono">
              Smart Citizen Platform
            </p>
          </div>
        </div>

        {/* Middle: Integrated Smart Search Bar */}
        <div className="hidden max-w-md flex-1 px-12 md:block">
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-400 transition-colors">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder={currentT.search}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl bg-white/5 py-2 pl-10 pr-4 text-xs text-white placeholder-slate-400 border border-white/5 focus:border-emerald-500/50 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
            />
          </div>
        </div>

        {/* Right Side: Quick Action Utilities */}
        <div className="flex items-center space-x-4">
          
          {/* Active Network Status indicator */}
          <div className="hidden items-center space-x-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400 md:flex border border-emerald-500/20">
            <Signal className="h-3 w-3 animate-pulse" />
            <span>{currentT.online}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all border border-white/5"
            title="Toggle theme mode"
          >
            {isDark ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center space-x-1 rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all border border-white/5 text-xs font-mono"
            >
              <Languages className="h-4 w-4" />
              <span className="uppercase">{language}</span>
            </button>
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-40 rounded-xl bg-slate-900 border border-white/10 p-1.5 shadow-xl">
                <button
                  onClick={() => { onLanguageChange('en'); setShowLangMenu(false); }}
                  className={`w-full rounded-lg px-3 py-1.5 text-left text-xs ${language === 'en' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-300 hover:bg-white/5'}`}
                >
                  {currentT.english}
                </button>
                <button
                  onClick={() => { onLanguageChange('ta'); setShowLangMenu(false); }}
                  className={`w-full rounded-lg px-3 py-1.5 text-left text-xs ${language === 'ta' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-300 hover:bg-white/5'}`}
                >
                  {currentT.tamil}
                </button>
                <button
                  onClick={() => { onLanguageChange('hi'); setShowLangMenu(false); }}
                  className={`w-full rounded-lg px-3 py-1.5 text-left text-xs ${language === 'hi' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-300 hover:bg-white/5'}`}
                >
                  {currentT.hindi}
                </button>
              </div>
            )}
          </div>

          {/* Notifications Alert Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifMenu(!showNotifMenu); setShowUserMenu(false); }}
              className="relative rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all border border-white/5"
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white animate-bounce">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-white/10 shadow-2xl p-4 text-slate-200 z-50">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                  <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Bell className="h-3.5 w-3.5 text-emerald-400" />
                    {currentT.notifTitle}
                  </h3>
                  <span className="text-[10px] text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded font-mono">
                    {notifications.length} Alerts
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500 italic">
                      {currentT.emptyNotif}
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-2.5 rounded-lg border text-xs transition-colors relative group ${
                          n.type === 'danger' ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' :
                          n.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
                          'bg-white/5 border-white/5 text-slate-300'
                        }`}
                      >
                        <div className="font-bold flex items-center justify-between mb-0.5">
                          <span>{n.title}</span>
                          <button 
                            onClick={() => onClearNotification(n.id)}
                            className="text-[10px] text-slate-400 hover:text-white hidden group-hover:block transition-all"
                          >
                            Dismiss
                          </button>
                        </div>
                        <p className="text-[11px] leading-relaxed opacity-90">{n.message}</p>
                        <span className="text-[9px] block text-right mt-1 opacity-60">
                          {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Action Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifMenu(false); }}
                className="flex items-center space-x-2 rounded-xl bg-white/5 p-1.5 pl-2.5 pr-2.5 hover:bg-white/10 transition-all border border-white/5 focus:outline-none"
              >
                <div className="text-right">
                  <p className="text-xs font-semibold text-white leading-none mb-0.5">{user.name}</p>
                  <p className="text-[9px] text-emerald-400 leading-none uppercase tracking-wider font-mono font-bold">
                    {currentT[user.role] || user.role}
                  </p>
                </div>
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150'}
                  alt={user.name}
                  className="h-8 w-8 rounded-lg object-cover ring-1 ring-emerald-500/30"
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-white/10 shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-white/5">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-xs font-semibold text-white truncate">{user.email}</p>
                  </div>
                  <div className="p-1 space-y-0.5">
                    <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] text-cyan-400 uppercase font-mono flex items-center justify-between">
                      <span>Authority Tier</span>
                      <Shield className="h-3 w-3 text-cyan-400" />
                    </div>
                    <button
                      onClick={() => { onLogout(); setShowUserMenu(false); }}
                      className="w-full rounded-lg px-3 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors flex items-center space-x-2"
                    >
                      <UserIcon className="h-3.5 w-3.5" />
                      <span>{currentT.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
