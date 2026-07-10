import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import DashboardHome from './components/DashboardHome';
import ModuleHealthcare from './components/ModuleHealthcare';
import ModuleEmergency from './components/ModuleEmergency';
import ModuleBloodDonor from './components/ModuleBloodDonor';
import ModuleFoodDonation from './components/ModuleFoodDonation';
import ModuleFarmerMarket from './components/ModuleFarmerMarket';
import ModuleGovtServices from './components/ModuleGovtServices';
import ModuleWaterManagement from './components/ModuleWaterManagement';
import ModuleWasteManagement from './components/ModuleWasteManagement';
import ModulePublicTransport from './components/ModulePublicTransport';
import ModuleAiAssistant from './components/ModuleAiAssistant';
import AdminDashboard from './components/AdminDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AuthPage from './components/AuthPage';
import { User, UserRole } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('lifeconnect_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [currentModule, setCurrentModule] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('lifeconnect_user');
      return saved ? 'dashboard' : 'landing';
    } catch {
      return 'landing';
    }
  });
  const [language, setLanguage] = useState<'en' | 'ta' | 'hi'>('en');
  const [db, setDb] = useState<any>({
    hospitals: [],
    doctors: [],
    appointments: [],
    emergencies: [],
    donors: [],
    bloodRequests: [],
    foodDonations: [],
    farmProducts: [],
    govtSchemes: [],
    schemeApplications: [],
    waterComplaints: [],
    wasteComplaints: [],
    busRoutes: []
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDark, setIsDark] = useState(true);

  // Synchronize state with real Express full stack database endpoints
  const fetchDatabase = async () => {
    try {
      const response = await fetch('/api/data');
      if (response.ok) {
        const data = await response.json();
        setDb(data);
      }
    } catch (e) {
      console.error("Error communicating with local server db: ", e);
    }
  };

  useEffect(() => {
    fetchDatabase();
    // Pre-populate some notifications
    setNotifications([
      {
        id: 'notif-1',
        title: '🔴 Critical SOS Dispatch',
        message: 'Ambulance dispatch Unit 4 is on route to Adyar Canal Road.',
        timestamp: new Date().getTime() - 60000,
        type: 'danger'
      },
      {
        id: 'notif-2',
        title: '🌱 New Government Welfare',
        message: 'Moovalur Pudhumaipenn scholarship registries are now active.',
        timestamp: new Date().getTime() - 120000,
        type: 'default'
      }
    ]);
  }, []);

  useEffect(() => {
    if (user && (currentModule === 'auth' || currentModule === 'landing')) {
      setCurrentModule('dashboard');
    }
  }, [user, currentModule]);

  const handleRoleSimulation = (role: UserRole) => {
    if (!user) return;
    setUser({ ...user, role });
    // Add systemic notification
    addNotification(`Profile Simulated: ${role.toUpperCase()}`, `You have switched context authorization tier.`, 'success');
  };

  const addNotification = (title: string, message: string, type: 'default' | 'danger' | 'success' = 'default') => {
    const newNotif = {
      id: `notif-${Math.random()}`,
      title,
      message,
      timestamp: new Date().getTime(),
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleClearNotif = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('lifeconnect_user');
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setCurrentModule('landing');
  };

  const handleLoginSuccess = (signedInUser: any) => {
    try {
      localStorage.setItem('lifeconnect_user', JSON.stringify(signedInUser));
    } catch (e) {
      console.error(e);
    }
    setUser(signedInUser);
    setCurrentModule('dashboard');
    addNotification('Sovereign Authentication Handshake', `Welcome back, ${signedInUser.name}! Secure JWT token established.`, 'success');
  };

  // Full-Stack API calls
  const handleTriggerSOS = async (type: 'Police' | 'Fire' | 'Ambulance' | 'Disaster', description: string) => {
    try {
      const response = await fetch('/api/emergencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenName: user?.name || 'Citizen User',
          phone: user?.phone || '+91 94440 12345',
          type,
          description,
          address: 'Chennai Metropolitan Coordinates',
          priority: 'Critical'
        })
      });
      if (response.ok) {
        addNotification('🚨 RESCUE DISPATCHED', `${type} squad is routing with sirens active.`, 'danger');
        fetchDatabase();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBookAppointment = async (doctorId: string, doctorName: string, hospitalName: string, date: string, time: string, reason: string) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenName: user?.name || 'Patient',
          doctorName,
          hospitalName,
          date,
          time,
          reason
        })
      });
      if (response.ok) {
        addNotification('🏥 APPOINTMENT SECURED', `Slot on ${date} at ${time} with ${doctorName} is confirmed.`, 'success');
        fetchDatabase();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegisterDonor = async (name: string, bloodGroup: string, age: number, phone: string, address: string) => {
    try {
      const response = await fetch('/api/blood/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bloodGroup, age, phone, address })
      });
      if (response.ok) {
        addNotification('🩸 DONOR REGISTRY LOGGED', 'You are listed as an active blood donor. Thank you.', 'success');
        fetchDatabase();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostRequest = async (hospitalName: string, bloodGroup: string, units: number, requiredBy: string, contactName: string, phone: string) => {
    try {
      const response = await fetch('/api/blood/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalName, bloodGroup, units, requiredBy, contactName, phone })
      });
      if (response.ok) {
        addNotification('🔴 EMERGENCY BLOOD DRIVE', `Urgent search for group ${bloodGroup} published across Chennai nodes.`, 'danger');
        fetchDatabase();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostFoodRequest = async (organizationName: string, contactPerson: string, phone: string, foodNeeded: string, quantityNeeded: string, location: string, urgency: string, description: string) => {
    try {
      const response = await fetch('/api/food/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationName, contactPerson, phone, foodNeeded, quantityNeeded, location, urgency, description })
      });
      if (response.ok) {
        addNotification('🔴 FOOD REQUEST BROADCASTED', `Community food request for ${quantityNeeded} of ${foodNeeded} published.`, 'default');
        fetchDatabase();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostDonation = async (restaurantName: string, foodType: string, quantity: string, expiryTime: string, address: string) => {
    try {
      const response = await fetch('/api/food/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantName, foodType, quantity, expiryTime, address })
      });
      if (response.ok) {
        addNotification('🎁 SURPLUS FOOD REGISTERED', `Surplus parcels listed on the ledger. Volunteers notified.`, 'success');
        fetchDatabase();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClaimDonation = async (id: string, name: string, phone: string) => {
    try {
      const response = await fetch('/api/food/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, phone })
      });
      if (response.ok) {
        addNotification('🚲 PICKUP CLAIIMED', `You are assigned for transport. Bring security QR to restaurant.`, 'success');
        fetchDatabase();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeliverDonation = async (id: string) => {
    try {
      const response = await fetch('/api/food/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (response.ok) {
        addNotification('✅ FOOD DELIVERED', `QR verified. Portions logged at welfare shelter catalog.`, 'success');
        fetchDatabase();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostProduct = async (
    name: string, 
    category: 'Vegetables' | 'Fruits' | 'Grains' | 'Spices' | 'Dairy' | 'Flowers', 
    price: number, 
    quantity: number, 
    description: string, 
    recommendedPrice: number, 
    marketPrice: number, 
    demandScore: 'High' | 'Moderate' | 'Low',
    freshnessStatus?: string,
    location?: string,
    farmingMethod?: string,
    harvestDate?: string,
    certification?: string,
    image?: string
  ) => {
    try {
      const response = await fetch('/api/farmer/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: user?.id || 'f-anon',
          farmerName: user?.name || 'Organic Farmer',
          farmerPhone: user?.phone || '+91 95400 44221',
          name,
          category,
          price,
          quantity,
          description,
          recommendedPrice,
          marketPrice,
          demandScore,
          freshnessStatus: freshnessStatus || 'Harvested Today',
          location: location || 'Salem Rural, Tamil Nadu',
          farmingMethod: farmingMethod || 'Zero Budget Natural Farming (ZBNF)',
          harvestDate: harvestDate || new Date().toISOString().split('T')[0],
          certification: certification || 'Certified Organic (TNOFA)',
          image: image || ''
        })
      });
      if (response.ok) {
        addNotification('🌾 CROP LISTED', `Crop harvest listed successfully at dynamic marketplace catalog.`, 'success');
        fetchDatabase();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyScheme = async (schemeId: string, schemeTitle: string) => {
    try {
      const response = await fetch('/api/govt/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citizenName: user?.name || 'Citizen', schemeId, schemeTitle })
      });
      if (response.ok) {
        addNotification('🏛️ APPLICATION SUBMITTED', `Track eligibility live. Registration code logged.`, 'success');
        fetchDatabase();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostWaterComplaint = async (type: string, address: string, description: string) => {
    try {
      const response = await fetch('/api/water/complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, address, description })
      });
      if (response.ok) {
        addNotification('🚰 LEAK GRIEVANCE REGISTERED', `Water maintenance supervisor has been auto-assigned.`, 'default');
        fetchDatabase();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostWasteComplaint = async (type: string, address: string, description: string) => {
    try {
      const response = await fetch('/api/waste/complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, address, description })
      });
      if (response.ok) {
        addNotification('🗑️ SANITATION GRIEVANCE LOGGED', `Overflowing bins reported. Commactor truck assigned.`, 'default');
        fetchDatabase();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateWaterStatus = async (id: string, status: 'Pending' | 'In Progress' | 'Resolved') => {
    try {
      const response = await fetch('/api/water/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (response.ok) {
        addNotification('🔧 COMPLAINT STATUS MODIFIED', `Water pipeline complaint REF: ${id} modified to ${status}.`, 'success');
        fetchDatabase();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateWasteStatus = async (id: string, status: 'Pending' | 'Dispatched' | 'Resolved') => {
    try {
      const response = await fetch('/api/waste/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (response.ok) {
        addNotification('🚛 COMPLAINT STATUS UPDATED', `Garbage sanitation complaint REF: ${id} updated to ${status}.`, 'success');
        fetchDatabase();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateEmergencyStatus = async (id: string, status: 'Requested' | 'Dispatched' | 'Resolved') => {
    try {
      const response = await fetch('/api/emergencies/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (response.ok) {
        addNotification('🚑 RESCUE TEAM DISPATCH STATE', `SOS reference: ${id} shifted dispatcher coordinates: ${status}.`, 'danger');
        fetchDatabase();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Rendering switch boards
  const renderModule = () => {
    switch (currentModule) {
      case 'landing':
        return (
          <LandingPage 
            onGetStarted={(role) => setCurrentModule('auth')} 
            language={language} 
            db={db}
          />
        );
      
      case 'auth':
        return (
          <AuthPage 
            onLoginSuccess={handleLoginSuccess} 
            language={language} 
          />
        );

      case 'dashboard':
        return (
          <DashboardHome 
            user={user} 
            language={language} 
            db={db} 
            onNavigateToModule={(mod) => setCurrentModule(mod)} 
            onRefresh={fetchDatabase}
            searchTerm={searchTerm}
          />
        );

      case 'healthcare':
        return (
          <ModuleHealthcare 
            db={db} 
            user={user}
            onBookAppointment={handleBookAppointment} 
            language={language} 
            onNavigateToModule={(mod) => setCurrentModule(mod)}
          />
        );

      case 'emergency':
        return (
          <ModuleEmergency 
            db={db} 
            onUpdateStatus={handleUpdateEmergencyStatus} 
            language={language} 
          />
        );

      case 'blood':
        return (
          <ModuleBloodDonor 
            db={db} 
            onRegisterDonor={handleRegisterDonor} 
            onPostRequest={handlePostRequest} 
            language={language} 
          />
        );

      case 'food':
        return (
          <ModuleFoodDonation 
            db={db} 
            user={user} 
            onPostDonation={handlePostDonation} 
            onPostFoodRequest={handlePostFoodRequest}
            onClaimDonation={handleClaimDonation} 
            onDeliverDonation={handleDeliverDonation} 
            language={language} 
          />
        );

      case 'farmer':
        return (
          <ModuleFarmerMarket 
            db={db} 
            user={user} 
            onPostProduct={handlePostProduct} 
            language={language} 
            onRefresh={fetchDatabase}
          />
        );

      case 'govt':
        return (
          <ModuleGovtServices 
            db={db} 
            user={user} 
            onApplyScheme={handleApplyScheme} 
            language={language} 
          />
        );

      case 'water':
        return (
          <ModuleWaterManagement 
            db={db} 
            onPostComplaint={handlePostWaterComplaint} 
            language={language} 
          />
        );

      case 'waste':
        return (
          <ModuleWasteManagement 
            db={db} 
            onPostComplaint={handlePostWasteComplaint} 
            language={language} 
          />
        );

      case 'transport':
        return (
          <ModulePublicTransport 
            db={db} 
            language={language} 
          />
        );

      case 'ai-chat':
        return (
          <ModuleAiAssistant 
            user={user} 
            language={language} 
            db={db}
            onNavigateToModule={(mod) => setCurrentModule(mod)}
          />
        );

      case 'admin':
        return (
          <AdminDashboard 
            db={db} 
            onUpdateWaterStatus={handleUpdateWaterStatus} 
            onUpdateWasteStatus={handleUpdateWasteStatus} 
            onUpdateEmergencyStatus={handleUpdateEmergencyStatus} 
            language={language} 
          />
        );

      case 'analytics':
        return (
          <AnalyticsDashboard 
            db={db} 
            language={language} 
          />
        );

      default:
        return (
          <DashboardHome 
            user={user} 
            language={language} 
            db={db} 
            onNavigateToModule={(mod) => setCurrentModule(mod)} 
            searchTerm={searchTerm}
          />
        );
    }
  };

  const isFullScrenModule = ['landing', 'auth'].includes(currentModule);

  return (
    <div className={`min-h-screen font-sans antialiased text-white ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* If current module is a full page landing/auth layout, bypass layout drawers */}
      {isFullScrenModule ? (
        <main className="w-full min-h-screen">
          {/* Quick sovereign brand toggle for landing pages */}
          <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
            <button
              onClick={() => {
                const nextLang = language === 'en' ? 'ta' : language === 'ta' ? 'hi' : 'en';
                setLanguage(nextLang);
              }}
              className="px-2.5 py-1 text-xs font-bold border border-white/10 rounded-xl bg-slate-900/60 text-slate-300 uppercase font-mono"
            >
              🌐 {language}
            </button>
            {currentModule === 'auth' && (
              <button
                onClick={() => setCurrentModule('landing')}
                className="px-2.5 py-1 text-xs font-bold border border-white/10 rounded-xl bg-slate-900/60 text-slate-300"
              >
                Back
              </button>
            )}
          </div>
          {renderModule()}
        </main>
      ) : (
        <div className="flex flex-col h-screen overflow-hidden">
          {/* Global top navigation banner */}
          <Navbar 
            user={user} 
            onLogout={handleLogout} 
            language={language} 
            onLanguageChange={(lang) => setLanguage(lang)} 
            notifications={notifications} 
            onClearNotification={handleClearNotif} 
            searchTerm={searchTerm} 
            onSearchChange={(val) => setSearchTerm(val)} 
            isDark={isDark} 
            onToggleTheme={() => setIsDark(!isDark)} 
          />

          <div className="flex flex-1 overflow-hidden">
            {/* Navigation drawers */}
            <Sidebar 
              activeModule={currentModule} 
              setActiveModule={(mod) => setCurrentModule(mod)} 
              user={user} 
              onSelectRole={handleRoleSimulation} 
              language={language} 
              onTriggerSOS={handleTriggerSOS} 
            />

            {/* Principal module dynamic view area */}
            <main className="flex-1 overflow-y-auto bg-slate-950 custom-scrollbar">
              {renderModule()}
            </main>
          </div>
        </div>
      )}

    </div>
  );
}
