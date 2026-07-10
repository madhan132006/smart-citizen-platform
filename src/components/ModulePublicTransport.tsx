import React, { useState, useMemo, useEffect } from 'react';
import { 
  Bus, Train, Car, Ticket, MapPin, Search, Navigation, 
  Activity, Clock, ArrowRight, ChevronRight, X, Check, 
  CheckCircle2, AlertTriangle, Info, Phone, Map, User, 
  Calendar, ShieldCheck, CreditCard, AlertCircle, Filter, 
  Sparkles, RefreshCw, SlidersHorizontal, Eye, Users, 
  QrCode, Compass, Wifi, Award, Volume2, Landmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TransitProps {
  db: any;
  language: 'en' | 'ta' | 'hi';
}

// Local Interface Types
interface TransportService {
  id: string;
  type: 'Bus' | 'Metro' | 'Train' | 'Taxi';
  routeNumber: string;
  vehicleName: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  fare: number;
  status: 'On Time' | 'Delayed' | 'Operational' | 'Standby' | 'Available' | 'Busy';
  availability: 'Available' | 'Seats Full' | 'Booking Closed' | 'Limited Seats';
  seatCount: number;
  stops: string[];
  driverName?: string;
  driverPhone?: string;
  rating?: number;
  operator: string;
  amenities: string[];
  safetyInfo: string[];
}

interface TransitStation {
  id: string;
  name: string;
  type: 'Bus' | 'Metro' | 'Train';
  distance: string;
  location: string;
  nextArrivals: { route: string; eta: string }[];
}

interface TravelBooking {
  id: string;
  serviceId: string;
  routeNumber: string;
  vehicleName: string;
  type: 'Bus' | 'Metro' | 'Train' | 'Taxi';
  date: string;
  time: string;
  source: string;
  destination: string;
  fare: number;
  passengerName: string;
  passengers: number;
  seatPreference: string;
  ticketCode: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
}

interface ServiceAlert {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'critical';
  serviceAffected: string;
}

export default function ModulePublicTransport({ db, language }: TransitProps) {
  // --- Local Notification / Toast System ---
  const [toasts, setToasts] = useState<any[]>([]);
  const triggerToast = (title: string, message: string, type: 'success' | 'warning' | 'info' | 'error' = 'success') => {
    const newToast = { id: `toast-${Date.now()}-${Math.random()}`, title, message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4000);
  };

  // --- Realtime Clock State for SCADA telemetry vibe ---
  const [currentTime, setCurrentTime] = useState<string>('11:19:00 AM');
  useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date();
      setCurrentTime(date.toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Automatic Realistic Mock Data ---
  const MOCK_SERVICES: TransportService[] = [
    {
      id: 'S-101',
      type: 'Bus',
      routeNumber: 'MTC-21G',
      vehicleName: 'MTC Deluxe Coach 21G',
      source: 'Tambaram',
      destination: 'Broadway',
      departureTime: '11:30 AM',
      arrivalTime: '12:45 PM',
      duration: '1h 15m',
      fare: 28,
      status: 'On Time',
      availability: 'Available',
      seatCount: 22,
      stops: ['Tambaram', 'Chromepet', 'Pallavaram', 'Guindy', 'Saidapet', 'Nandanam', 'T-Nagar', 'Gemini', 'Spencers', 'Broadway'],
      driverName: 'Saravanan K.',
      driverPhone: '+91 94451 10022',
      rating: 4.6,
      operator: 'Metropolitan Transport Corporation (MTC)',
      amenities: ['CCTV Security', 'Digital Stop Display', 'Charging Ports'],
      safetyInfo: ['Emergency Exit', 'Panic Button Alarm', 'First Aid Kit']
    },
    {
      id: 'S-102',
      type: 'Bus',
      routeNumber: 'MTC-11A',
      vehicleName: 'MTC Ordinary green 11A',
      source: 'T-Nagar',
      destination: 'Velachery',
      departureTime: '11:45 AM',
      arrivalTime: '12:20 PM',
      duration: '35m',
      fare: 15,
      status: 'Delayed',
      availability: 'Limited Seats',
      seatCount: 4,
      stops: ['T-Nagar', 'Nandanam', 'Saidapet', 'Little Mount', 'Guindy Estate', 'Velachery Bypass', 'Velachery Station'],
      driverName: 'Ramesh Babu',
      driverPhone: '+91 94452 20133',
      rating: 4.1,
      operator: 'Metropolitan Transport Corporation (MTC)',
      amenities: ['Digital Stop Display', 'Low Floor Access'],
      safetyInfo: ['Emergency Exit', 'Driver Compartment Barrier']
    },
    {
      id: 'S-201',
      type: 'Metro',
      routeNumber: 'Blue Line',
      vehicleName: 'CMRL Metro Coach Train-B3',
      source: 'Wimco Nagar',
      destination: 'Airport',
      departureTime: '11:24 AM',
      arrivalTime: '12:12 PM',
      duration: '48m',
      fare: 50,
      status: 'Operational',
      availability: 'Available',
      seatCount: 145,
      stops: ['Wimco Nagar', 'Tollgate', 'Washermanpet', 'Chennai Central', 'LIC', 'Thousand Lights', 'Teynampet', 'Nandanam', 'Guindy', 'Airport'],
      driverName: 'Automated Train Control (ATC)',
      driverPhone: 'CMRL Control Desk',
      rating: 4.9,
      operator: 'Chennai Metro Rail Limited (CMRL)',
      amenities: ['Air Conditioned', 'Free Station Wi-Fi', 'USB Charging', 'Announcements Screen'],
      safetyInfo: ['Continuous Surveillance CCTV', 'Direct Control Desk Intercom', 'Fire Suppression Tubes']
    },
    {
      id: 'S-202',
      type: 'Metro',
      routeNumber: 'Green Line',
      vehicleName: 'CMRL Metro Coach Train-G5',
      source: 'Chennai Central',
      destination: 'St. Thomas Mount',
      departureTime: '11:32 AM',
      arrivalTime: '12:08 PM',
      duration: '36m',
      fare: 40,
      status: 'Operational',
      availability: 'Available',
      seatCount: 180,
      stops: ['Chennai Central', 'Egmore', 'Kilpauk', 'Shenoy Nagar', 'Anna Nagar East', 'Koyambedu', 'Arumbakkam', 'Vadapalani', 'Ashok Nagar', 'St. Thomas Mount'],
      driverName: 'Automated Train Control (ATC)',
      driverPhone: 'CMRL Control Desk',
      rating: 4.8,
      operator: 'Chennai Metro Rail Limited (CMRL)',
      amenities: ['Air Conditioned', 'Full Accessibility Ramp', 'USB Ports', 'Regenerative Braking Status'],
      safetyInfo: ['Platform Screen Doors', 'Emergency Door Pull Release', 'First Aid Station']
    },
    {
      id: 'S-301',
      type: 'Train',
      routeNumber: 'SR-Suburban',
      vehicleName: 'Southern Railways Local Train',
      source: 'Tambaram',
      destination: 'Chennai Beach',
      departureTime: '11:20 AM',
      arrivalTime: '12:15 PM',
      duration: '55m',
      fare: 10,
      status: 'On Time',
      availability: 'Available',
      seatCount: 320,
      stops: ['Tambaram', 'Tambaram Sanatorium', 'Chromepet', 'Pallavaram', 'Tirusulam (Airport)', 'Meenambakkam', 'Guindy', 'Mambalam', 'Nungambakkam', 'Egmore', 'Chennai Fort', 'Chennai Beach'],
      driverName: 'Somasundaram M.',
      driverPhone: 'Southern Railways Control',
      rating: 4.3,
      operator: 'Indian Railways (Southern Railway Division)',
      amenities: ['Luggage Overhead Racks', 'First Class Compartments', 'Women-Only Coaches'],
      safetyInfo: ['Railway Protection Force (RPF) Patrol', 'Chain Pull Emergency Brake']
    },
    {
      id: 'S-302',
      type: 'Train',
      routeNumber: 'MAS-SBC',
      vehicleName: 'Shatabdi Express Superfast',
      source: 'Chennai Central',
      destination: 'Velachery', // Simplified destination for routing consistency
      departureTime: '11:50 AM',
      arrivalTime: '12:45 PM',
      duration: '55m',
      fare: 180,
      status: 'On Time',
      availability: 'Limited Seats',
      seatCount: 12,
      stops: ['Chennai Central', 'Egmore', 'Guindy', 'Velachery'],
      driverName: 'Krishnan G.',
      driverPhone: 'SR Locopilot Dispatch',
      rating: 4.7,
      operator: 'Indian Railways',
      amenities: ['Meal Served at Seat', 'Air Conditioned', 'Power Outlets', 'Premium Comfort Seats'],
      safetyInfo: ['Electronic Fire Sensors', 'RPF Security Guards', 'Integrity Monitored Latch']
    },
    {
      id: 'S-401',
      type: 'Taxi',
      routeNumber: 'FT-CAB',
      vehicleName: 'FastTrack Premium Cab (Sedan)',
      source: 'Adyar',
      destination: 'Airport',
      departureTime: 'Immediate Delivery',
      arrivalTime: 'Flexible',
      duration: '25m',
      fare: 240,
      status: 'Available',
      availability: 'Available',
      seatCount: 4,
      stops: ['Direct Point-to-Point routing (Adyar ➔ Guindy ➔ Airport)'],
      driverName: 'Murugan P.',
      driverPhone: '+91 98455 88990',
      rating: 4.8,
      operator: 'FastTrack Cabs Cooperative',
      amenities: ['Air Conditioned', 'Aux Music Connector', 'Trunk Luggage Space'],
      safetyInfo: ['Driver Background Verified', 'Sovereign GPS Tracking Guard', 'Emergency SOS Button']
    },
    {
      id: 'S-402',
      type: 'Taxi',
      routeNumber: 'N-AUTO',
      vehicleName: 'Smart Electric Auto-Rickshaw',
      source: 'Mylapore',
      destination: 'Broadway',
      departureTime: 'Immediate Delivery',
      arrivalTime: 'Flexible',
      duration: '20m',
      fare: 65,
      status: 'Available',
      availability: 'Available',
      seatCount: 3,
      stops: ['Mylapore ➔ Royapettah ➔ Triplicane ➔ Broadway'],
      driverName: 'Elango S.',
      driverPhone: '+91 91500 22311',
      rating: 4.5,
      operator: 'Chennai Eco-Auto Federation',
      amenities: ['100% Zero Emission Electric', 'Transparent Digital Meter'],
      safetyInfo: ['Reinforced Roll Canopy', 'GPS Realtime Speed Watch']
    }
  ];

  const MOCK_STATIONS: TransitStation[] = [
    {
      id: 'STN-1',
      name: 'Anna Nagar West Central Bus Terminus',
      type: 'Bus',
      distance: '350m (Walk: 4 mins)',
      location: 'Inner Ring Road, Anna Nagar',
      nextArrivals: [
        { route: 'MTC-21G', eta: '5 mins' },
        { route: 'MTC-11A', eta: '12 mins' }
      ]
    },
    {
      id: 'STN-2',
      name: 'Guindy Smart Metro Intercept',
      type: 'Metro',
      distance: '1.2 km (Transit: 6 mins)',
      location: 'Mount Road Junction, Guindy',
      nextArrivals: [
        { route: 'Blue Line', eta: '3 mins' },
        { route: 'Green Line', eta: '7 mins' }
      ]
    },
    {
      id: 'STN-3',
      name: 'Mylapore Suburban Railway Depot',
      type: 'Train',
      distance: '850m (Walk: 10 mins)',
      location: 'Kutchery Road, Mylapore',
      nextArrivals: [
        { route: 'SR-Suburban', eta: '8 mins' },
        { route: 'MAS-SBC', eta: '35 mins' }
      ]
    }
  ];

  const MOCK_ALERTS: ServiceAlert[] = [
    {
      id: 'ALT-1',
      title: 'Heavy Traffic Congestion Alert',
      message: 'Severe congestion along Anna Salai near Teynampet. MTC buses route 21G may face delays of up to 15 minutes.',
      time: '15 mins ago',
      type: 'warning',
      serviceAffected: 'Bus (MTC-21G)'
    },
    {
      id: 'ALT-2',
      title: 'Scheduled Signalling Upgrade',
      message: 'CMRL Metro signalling system upgrade tonight between 11:30 PM and 04:00 AM. Minor frequency variations possible on Blue Line.',
      time: '1 hour ago',
      type: 'info',
      serviceAffected: 'Metro (Blue Line)'
    },
    {
      id: 'ALT-3',
      title: 'Suburban Track Maintenance',
      message: 'Track maintenance near Pallavaram. Local trains from Tambaram to Beach delayed by 8-10 minutes on slow lines.',
      time: '2 hours ago',
      type: 'critical',
      serviceAffected: 'Train (SR-Suburban)'
    }
  ];

  const INITIAL_BOOKINGS: TravelBooking[] = [
    {
      id: 'TKT-99120',
      serviceId: 'S-201',
      routeNumber: 'Blue Line',
      vehicleName: 'CMRL Metro Coach Train-B3',
      type: 'Metro',
      date: '2026-07-07',
      time: '04:15 PM',
      source: 'Chennai Central',
      destination: 'Airport',
      fare: 50,
      passengerName: 'Santhosh Kumar',
      passengers: 1,
      seatPreference: 'Window Coach',
      ticketCode: 'QR-MET-884021',
      status: 'Completed'
    },
    {
      id: 'TKT-99054',
      serviceId: 'S-101',
      routeNumber: 'MTC-21G',
      vehicleName: 'MTC Deluxe Coach 21G',
      type: 'Bus',
      date: '2026-07-06',
      time: '08:30 AM',
      source: 'Tambaram',
      destination: 'Broadway',
      fare: 28,
      passengerName: 'Santhosh Kumar',
      passengers: 1,
      seatPreference: 'General',
      ticketCode: 'QR-BUS-331049',
      status: 'Completed'
    }
  ];

  // --- Core React States ---
  const [services, setServices] = useState<TransportService[]>([]);
  const [bookings, setBookings] = useState<TravelBooking[]>([]);
  const [alerts, setAlerts] = useState<ServiceAlert[]>(MOCK_ALERTS);
  
  useEffect(() => {
    fetch('/api/transport/services').then(res => res.json()).then(setServices);
    fetch('/api/transport/bookings').then(res => res.json()).then(setBookings);
  }, []);
  
  // Filter and search variables
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedDest, setSelectedDest] = useState<string>('All');
  const [selectedAvail, setSelectedAvail] = useState<string>('All');

  // Interactive Modal Trigger States
  const [bookingWizard, setBookingWizard] = useState<{
    isOpen: boolean;
    step: 1 | 2 | 3 | 4;
    service?: TransportService;
    source?: string;
    destination?: string;
    travelDate?: string;
    passengers?: number;
    passengerName?: string;
    passengerPhone?: string;
    seatNumber?: string;
    status?: 'Pending' | 'Confirmed' | 'Redirecting';
  } | null>(null);

  const [trackingService, setTrackingService] = useState<TransportService | null>(null);
  const [viewingRouteService, setViewingRouteService] = useState<TransportService | null>(null);
  const [viewingDetailsService, setViewingDetailsService] = useState<TransportService | null>(null);

  // Booking Form Fields
  const [formPassengerName, setFormPassengerName] = useState('Santhosh Kumar');
  const [formPassengerPhone, setFormPassengerPhone] = useState('+91 94441 55667');
  const [formPassengersCount, setFormPassengersCount] = useState(1);
  const [formSeatPref, setFormSeatPref] = useState('Window Seat');
  const [formPaymentMethod, setFormPaymentMethod] = useState('Sovereign Wallet balance');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Live Telemetry Tracker State (Simulating GPS movement)
  const [trackProgress, setTrackProgress] = useState(35);
  const [trackCurrentStop, setTrackCurrentStop] = useState(1);
  const [trackSpeed, setTrackSpeed] = useState(48);
  const [trackEta, setTrackEta] = useState(9);
  const [isAutoTracking, setIsAutoTracking] = useState(true);

  // Live tracking effects
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (trackingService && isAutoTracking) {
      interval = setInterval(() => {
        setTrackProgress(prev => {
          let next = prev + (Math.random() * 3 + 1);
          if (next >= 100) {
            next = 0;
            triggerToast('🔄 Route Restarted', `Vehicle ${trackingService.routeNumber} started fresh round-trip loop.`, 'info');
          }
          return next;
        });

        setTrackSpeed(() => Math.floor(Math.random() * 20) + 35);
        setTrackEta(prev => {
          if (prev <= 1) return 12;
          return Math.random() > 0.7 ? prev - 1 : prev;
        });
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [trackingService, isAutoTracking]);

  // Syncing trackCurrentStop with progress value logically
  useEffect(() => {
    if (trackingService) {
      const stopCount = trackingService.stops.length;
      const calculatedStopIndex = Math.floor((trackProgress / 100) * stopCount);
      setTrackCurrentStop(calculatedStopIndex);
    }
  }, [trackProgress, trackingService]);

  // --- Dynamic Dashboard Metrics ---
  const counts = useMemo(() => {
    const activeBuses = services.filter(s => s.type === 'Bus' && s.status !== 'Standby').length;
    const activeMetro = services.filter(s => s.type === 'Metro' && s.status === 'Operational').length;
    const activeTrains = services.filter(s => s.type === 'Train' && s.status === 'On Time').length;
    const ticketsToday = bookings.length; 
    return { activeBuses, activeMetro, activeTrains, ticketsToday };
  }, [services, bookings]);

  // --- Distinct Destination Dropdown Options ---
  const destinationOptions = useMemo(() => {
    const dests = new Set<string>();
    services.forEach(s => dests.add(s.destination));
    return ['All', ...Array.from(dests)];
  }, [services]);

  // --- Advanced Search & Filters Engine ---
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = searchQuery === '' || 
        service.routeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.destination.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'All' || service.type === selectedType;
      const matchesDest = selectedDest === 'All' || service.destination === selectedDest;
      
      let matchesAvail = true;
      if (selectedAvail === 'Available') {
        matchesAvail = service.availability === 'Available' || service.availability === 'Limited Seats';
      } else if (selectedAvail === 'Limited Seats') {
        matchesAvail = service.availability === 'Limited Seats';
      }

      return matchesSearch && matchesType && matchesDest && matchesAvail;
    });
  }, [services, searchQuery, selectedType, selectedDest, selectedAvail]);

  // --- Handlers ---
  const handleOpenBooking = (service: TransportService) => {
    if (service.availability === 'Seats Full' || service.availability === 'Booking Closed') {
      triggerToast('Service Unavailable', 'This service is currently fully occupied or booking is closed.', 'warning');
      return;
    }
    setBookingWizard({ isOpen: true, step: 3, service, passengers: 1, status: 'Pending' });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingFormService) return;

    if (!formPassengerName.trim() || !formPassengerPhone.trim()) {
      triggerToast('Validation Error', 'Please supply a passenger name and contact number.', 'warning');
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const response = await fetch('/api/transport/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: bookingFormService.id,
          routeNumber: bookingFormService.routeNumber,
          vehicleName: bookingFormService.vehicleName,
          type: bookingFormService.type,
          source: bookingFormService.source,
          destination: bookingFormService.destination,
          fare: bookingFormService.fare * formPassengersCount,
          passengerName: formPassengerName,
          passengers: formPassengersCount,
          seatPreference: formSeatPref,
          ticketCode: `QR-${bookingFormService.type.toUpperCase().slice(0,3)}-${Math.floor(100000 + Math.random() * 900000)}`
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setBookings(prev => [data.booking, ...prev]);
        
        // Deduct seats count logically locally
        setServices(prev => prev.map(s => {
          if (s.id === bookingFormService.id) {
            const remaining = Math.max(0, s.seatCount - formPassengersCount);
            return {
              ...s,
              seatCount: remaining,
              availability: remaining === 0 ? 'Seats Full' : remaining < 5 ? 'Limited Seats' : 'Available'
            };
          }
          return s;
        }));

        setIsSubmittingBooking(false);
        setBookingFormService(null);

        triggerToast(
          '🎟️ Ticket Confirmed',
          `Successfully booked ${formPassengersCount} seat(s) for ${bookingFormService.vehicleName}. Ticket ID: ${data.booking.id}`,
          'success'
        );
      } else {
        triggerToast('Error', 'Failed to book ticket.', 'warning');
      }
    } catch (err) {
      triggerToast('Error', 'Server error.', 'warning');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleOpenLiveTracking = (service: TransportService) => {
    setTrackingService(service);
    setTrackProgress(Math.floor(Math.random() * 40) + 15);
    setTrackSpeed(Math.floor(Math.random() * 20) + 40);
    setTrackEta(Math.floor(Math.random() * 10) + 3);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-100 font-sans">
      
      {/* Toast Alert System Container */}
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
                    : 'border-indigo-500/30'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${
                toast.type === 'success' 
                  ? 'bg-emerald-500/15 text-emerald-400' 
                  : toast.type === 'warning' 
                    ? 'bg-amber-500/15 text-amber-400' 
                    : 'bg-indigo-500/15 text-indigo-400'
              }`}>
                {toast.type === 'success' ? <Check className="h-4 w-4" /> : toast.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
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
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header Banner Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/5 pb-5 gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="h-11 w-11 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 border border-amber-500/25">
            <Bus className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold uppercase tracking-wider font-mono flex items-center gap-2">
              Sovereign Transit & Mobility Grid
              <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">RT-SCADA GPS Hub</span>
            </h2>
            <p className="text-xs text-slate-400">Secure booking for Metropolitan Buses, CMRL Metro Coaches, Southern suburban railways, and verified city taxi cooperatives.</p>
          </div>
        </div>

        {/* Real-time telemetry clock */}
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-right">
            <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-wider">Telemetry UTC sync</span>
            <span className="text-xs font-mono font-bold text-emerald-400">{currentTime}</span>
          </div>
          
          <button 
            onClick={() => {
              triggerToast('🔄 Re-aligning Telemetry', 'Updating GPS satellites orbital signals and timetables...', 'info');
              // Minor state updates simulation
              setServices(prev => prev.map(s => {
                if (s.status === 'On Time' && Math.random() > 0.8) {
                  return { ...s, status: 'Delayed' };
                } else if (s.status === 'Delayed' && Math.random() > 0.6) {
                  return { ...s, status: 'On Time' };
                }
                return s;
              }));
            }}
            className="px-3.5 py-3 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 text-xs border border-white/5 transition-all flex items-center gap-2 cursor-pointer font-bold font-mono"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sync Systems
          </button>
        </div>
      </div>

      {/* Dashboard Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="transit-dashboard-stats">
        
        {/* Active MTC Buses */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Active Buses</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{counts.activeBuses} Units</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Bus className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">Direct metropolitan routes</p>
        </div>

        {/* CMRL Metro Services */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Metro Services</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">Green/Blue</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Compass className="h-5 w-5 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
          </div>
          <p className="text-[10px] text-emerald-400 mt-2 font-mono flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Operational frequency 4.5m
          </p>
        </div>

        {/* Suburban Train Services */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Train Services</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">On Schedule</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
              <Train className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">Southern rail lines active</p>
        </div>

        {/* Tickets Booked Today */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Tickets Booked</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{counts.ticketsToday} Tickets</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Ticket className="h-5 w-5" />
            </div>
          </div>
          {/* Progress bar mapping */}
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2.5">
            <div 
              className="bg-emerald-400 h-full rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(100, (counts.ticketsToday / 15) * 100)}%` }} 
            />
          </div>
        </div>

      </div>

      {/* Main Grid Layout splitter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (2 cols): Transport search & directory registry */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Search, Filter Toolbar & Services list */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-5" id="transit-services-ledger">
            
            {/* Header controls toolbar */}
            <div className="space-y-4 border-b border-white/5 pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Activity className="h-4.5 w-4.5 text-amber-400" />
                  Primary Transit Availability Registry
                </h3>
                <span className="text-[10px] font-mono text-slate-500">
                  {filteredServices.length} matches detected in metropolitan grids
                </span>
              </div>

              {/* Multi-dimensional filters board */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                
                {/* Search input field */}
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search routes, stations, vehicles, etc..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-white">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Destination Point */}
                <div className="relative">
                  <select
                    value={selectedDest}
                    onChange={(e) => setSelectedDest(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                  >
                    <option value="All">All Destinations</option>
                    {destinationOptions.filter(d => d !== 'All').map(dest => (
                      <option key={dest} value={dest}>{dest}</option>
                    ))}
                  </select>
                </div>

                {/* Filter seat availability */}
                <div className="relative">
                  <select
                    value={selectedAvail}
                    onChange={(e) => setSelectedAvail(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                  >
                    <option value="All">Any Availability</option>
                    <option value="Available">Has Available Seats</option>
                    <option value="Limited Seats">Limited Seats Only</option>
                  </select>
                </div>

              </div>

              {/* Transport mode selectors */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider mr-1 flex items-center gap-1">
                  <SlidersHorizontal className="h-3 w-3" />
                  Transport Mode:
                </span>
                
                {(['All', 'Bus', 'Metro', 'Train', 'Taxi'] as const).map(type => {
                  const isActive = selectedType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-3 py-1 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive 
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' 
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {type === 'Bus' && <Bus className="h-3 w-3" />}
                      {type === 'Metro' && <Compass className="h-3 w-3" />}
                      {type === 'Train' && <Train className="h-3 w-3" />}
                      {type === 'Taxi' && <Car className="h-3 w-3" />}
                      {type}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* List panel scrollable */}
            <div className="space-y-3.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredServices.length === 0 ? (
                <div className="py-20 text-center text-xs text-slate-500 border border-dashed border-white/5 rounded-2xl italic space-y-2">
                  <p>No transit services match your search queries.</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setSelectedType('All'); setSelectedDest('All'); setSelectedAvail('All'); }}
                    className="text-amber-400 font-mono text-[10px] underline cursor-pointer"
                  >
                    Reset Search Parameters
                  </button>
                </div>
              ) : (
                filteredServices.map(service => {
                  const isBus = service.type === 'Bus';
                  const isMetro = service.type === 'Metro';
                  const isTrain = service.type === 'Train';
                  const isTaxi = service.type === 'Taxi';

                  const isSeatsFull = service.availability === 'Seats Full' || service.availability === 'Booking Closed';
                  const isLimited = service.availability === 'Limited Seats';

                  return (
                    <div 
                      key={service.id} 
                      className="p-4.5 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden group"
                    >
                      {/* Left Side: Type Badge, Route No, Vehicle, Departure Info */}
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                            isBus ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            isMetro ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                            isTrain ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {isBus && <Bus className="h-2.5 w-2.5" />}
                            {isMetro && <Compass className="h-2.5 w-2.5" />}
                            {isTrain && <Train className="h-2.5 w-2.5" />}
                            {isTaxi && <Car className="h-2.5 w-2.5" />}
                            {service.type}
                          </span>
                          
                          <span className="text-xs font-bold text-white font-mono tracking-wide">{service.routeNumber}</span>
                          <span className="text-[10px] text-slate-400 font-mono font-normal">({service.vehicleName})</span>
                          
                          {/* Availability tag */}
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ml-auto md:ml-0 ${
                            isSeatsFull ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            isLimited ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 animate-pulse' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {service.availability} {service.seatCount > 0 && `(${service.seatCount} left)`}
                          </span>
                        </div>

                        {/* Node timeline representation */}
                        <div className="flex items-center gap-4 text-xs">
                          <div className="space-y-0.5 min-w-[100px]">
                            <p className="text-[8.5px] text-slate-500 font-mono uppercase tracking-wider">Source Point</p>
                            <p className="font-bold text-white tracking-tight">📍 {service.source}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{service.departureTime}</span>
                          </div>
                          
                          <div className="flex flex-col items-center flex-1 max-w-[80px] text-center">
                            <span className="text-[9px] font-mono text-slate-500">{service.duration}</span>
                            <div className="w-full h-0.5 bg-white/10 relative flex items-center justify-center my-1.5">
                              <ArrowRight className="h-3 w-3 text-slate-500 absolute" />
                            </div>
                            <span className="text-[8px] font-mono text-slate-500 bg-slate-900 border border-white/5 px-1.5 py-0.2 rounded">Direct</span>
                          </div>

                          <div className="space-y-0.5 text-right min-w-[100px]">
                            <p className="text-[8.5px] text-slate-500 font-mono uppercase tracking-wider">Destination</p>
                            <p className="font-bold text-white tracking-tight">📍 {service.destination}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{service.arrivalTime}</span>
                          </div>
                        </div>

                        {/* Stops peek */}
                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-lg">
                          🗺️ <strong className="text-slate-300">Route Map Stops:</strong> {service.stops.join(' ➔ ')}
                        </p>

                      </div>

                      {/* Right Side: Fare Pricing and Action Keys */}
                      <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                        
                        <div className="text-left sm:text-center md:text-right">
                          <span className="text-[8.5px] uppercase font-mono text-slate-500 block tracking-wider">Transit Fare</span>
                          <span className="text-base font-extrabold text-white font-mono">₹{service.fare}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                          
                          {/* Action Button: Book Ticket */}
                          <button
                            onClick={() => handleOpenBooking(service)}
                            disabled={isSeatsFull}
                            className={`px-3 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                              isSeatsFull 
                                ? 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400'
                            }`}
                          >
                            <Ticket className="h-3.5 w-3.5" />
                            Book Ticket
                          </button>

                          {/* Secondary buttons dropdown equivalent */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenLiveTracking(service)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 hover:border-white/15 transition-all cursor-pointer"
                              title="Live Track GPS"
                            >
                              <Navigation className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                            </button>
                            
                            <button
                              onClick={() => setViewingRouteService(service)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 hover:border-white/15 transition-all cursor-pointer"
                              title="View Stop-by-Stop Stops"
                            >
                              <Map className="h-3.5 w-3.5 text-indigo-400" />
                            </button>

                            <button
                              onClick={() => setViewingDetailsService(service)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 hover:border-white/15 transition-all cursor-pointer"
                              title="View Complete Information"
                            >
                              <Eye className="h-3.5 w-3.5 text-cyan-400" />
                            </button>
                          </div>

                        </div>

                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Nearby Transport Stops & Arrivals */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Landmark className="h-4.5 w-4.5 text-indigo-400" />
              Nearby Transit Infrastructure Nodes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MOCK_STATIONS.map(station => {
                const isBus = station.type === 'Bus';
                const isMetro = station.type === 'Metro';
                const isTrain = station.type === 'Train';

                return (
                  <div key={station.id} className="p-4 bg-slate-950/45 border border-white/5 rounded-2xl hover:border-white/10 transition-colors flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`p-1 rounded-lg ${
                          isBus ? 'bg-amber-500/10 text-amber-400' :
                          isMetro ? 'bg-indigo-500/10 text-indigo-400' :
                          'bg-cyan-500/10 text-cyan-400'
                        }`}>
                          {isBus ? <Bus className="h-3.5 w-3.5" /> : isMetro ? <Compass className="h-3.5 w-3.5" /> : <Train className="h-3.5 w-3.5" />}
                        </span>
                        <h4 className="text-xs font-extrabold text-white leading-tight truncate">{station.name}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400">📍 {station.location}</p>
                      <p className="text-[9px] text-slate-500 font-mono italic">Distance: {station.distance}</p>
                    </div>

                    <div className="pt-2 border-t border-white/5 space-y-1.5">
                      <span className="text-[8.5px] uppercase font-mono text-slate-500 font-bold block">Live Upcoming Arrivals</span>
                      {station.nextArrivals.map((arr, index) => (
                        <div key={index} className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-slate-300 font-bold">{arr.route}</span>
                          <span className="text-emerald-400 bg-emerald-500/5 px-1 rounded border border-emerald-500/10 text-[9.5px]">{arr.eta}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column (1 col): Recent bookings, Travel History & Service alerts */}
        <div className="space-y-6">
          
          {/* Quick Smart Fare Calculator Integrated */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-amber-400" />
              Sovereign Transit Wallet Pass
            </h3>

            <div className="p-4 bg-gradient-to-br from-indigo-900/60 to-slate-950 rounded-2xl border border-indigo-500/20 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Compass className="h-20 w-20 animate-spin" style={{ animationDuration: '20s' }} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-mono text-indigo-300 uppercase tracking-wider block">NFC Transit Pass</span>
                  <p className="text-xs font-bold text-white font-mono">Santhosh Kumar</p>
                </div>
                <Award className="h-5 w-5 text-amber-400" />
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Available Sovereign Balance</span>
                <p className="text-xl font-black text-white font-mono">₹1,240.50</p>
              </div>

              <div className="flex items-center justify-between text-[9.5px] font-mono text-indigo-200">
                <span>ID: SC-TRANSIT-4491</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  Active Telemetry Guard
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 text-[10px] text-slate-400 leading-normal flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Deductions for tickets are handled instantly from your sovereign balance wallet when submitting bookings.</span>
            </div>
          </div>

          {/* Travel History & Recent Bookings */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Ticket className="h-4.5 w-4.5 text-amber-400" />
              Your Sovereign Tickets & Travel History
            </h3>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {bookings.length === 0 ? (
                <div className="py-10 text-center text-[11px] text-slate-500 italic">No tickets booked yet today. Use "Book Ticket" actions.</div>
              ) : (
                bookings.map(book => {
                  const isMetro = book.type === 'Metro';
                  const isBus = book.type === 'Bus';
                  const isTrain = book.type === 'Train';
                  const isTaxi = book.type === 'Taxi';

                  return (
                    <div key={book.id} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white font-mono flex items-center gap-1">
                          <span className={`h-1.5 w-1.5 rounded-full ${book.status === 'Confirmed' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                          {book.routeNumber} ({book.type})
                        </span>
                        <span className={`text-[8px] font-mono font-bold px-1.5 rounded border uppercase ${
                          book.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-slate-400 border-white/10'
                        }`}>
                          {book.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9.5px] font-mono text-slate-400">
                        <div>
                          <span className="text-slate-500 block">Ticket Code</span>
                          <span className="text-slate-200 font-bold">{book.ticketCode.slice(0, 10)}...</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 block">Passenger / Seat</span>
                          <span className="text-slate-200 truncate block">{book.passengerName} ({book.seatPreference})</span>
                        </div>
                        <div className="pt-1">
                          <span className="text-slate-500 block">Stops</span>
                          <span className="text-slate-300 font-medium">{book.source} ➔ {book.destination}</span>
                        </div>
                        <div className="text-right pt-1">
                          <span className="text-slate-500 block">Total Fare</span>
                          <span className="text-emerald-400 font-bold">₹{book.fare}</span>
                        </div>
                      </div>

                      {book.status === 'Confirmed' && (
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[8.5px] text-slate-500 font-mono">Date: {book.date}</span>
                          <button
                            onClick={() => {
                              // Open details containing QR Code directly
                              const matchedService = services.find(s => s.id === book.serviceId) || services[0];
                              setViewingDetailsService(matchedService);
                              triggerToast('🎫 QR Code Displayed', `Sovereign digital ticket QR shown on detail panel.`, 'info');
                            }}
                            className="text-[9px] text-amber-400 hover:underline font-mono flex items-center gap-1 cursor-pointer"
                          >
                            <QrCode className="h-3 w-3" />
                            Display Ticket QR
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Real-time Service Alerts & Notices */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-400" />
              Sovereign Transit Advisory Alerts
            </h3>

            <div className="space-y-3">
              {alerts.map(alert => (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-xl border flex gap-3 text-xs ${
                    alert.type === 'critical' 
                      ? 'bg-rose-500/5 border-rose-500/20' 
                      : alert.type === 'warning' 
                        ? 'bg-amber-500/5 border-amber-500/20' 
                        : 'bg-indigo-500/5 border-indigo-500/20'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 h-fit ${
                    alert.type === 'critical' 
                      ? 'bg-rose-500/10 text-rose-400' 
                      : alert.type === 'warning' 
                        ? 'bg-amber-500/10 text-amber-400' 
                        : 'bg-indigo-500/10 text-indigo-400'
                  }`}>
                    {alert.type === 'critical' ? <AlertCircle className="h-3.5 w-3.5" /> : alert.type === 'warning' ? <AlertTriangle className="h-3.5 w-3.5" /> : <Info className="h-3.5 w-3.5" />}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white leading-tight">{alert.title}</span>
                      <span className="text-[8px] font-mono text-slate-500 shrink-0">{alert.time}</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 leading-normal">{alert.message}</p>
                    <span className="text-[9px] font-mono text-slate-500 block pt-1">Affected: {alert.serviceAffected}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Modal: Smart Booking Workflow Wizard */}
      {bookingWizard?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative my-8 space-y-4"
          >
            {/* Wizard Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Ticket className="h-4.5 w-4.5 text-amber-400" />
                {bookingWizard.step === 1 ? 'Search Routes' :
                 bookingWizard.step === 2 ? 'Select Transport' :
                 bookingWizard.step === 3 ? 'Passenger Details' : 'Booking Summary'}
              </h3>
              <button onClick={() => setBookingWizard(null)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Step Content */}
            <div className="min-h-[300px]">
              {bookingWizard.step === 1 && (
                <div className="space-y-4">
                  <input type="text" placeholder="Source City" className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white" />
                  <input type="text" placeholder="Destination City" className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white" />
                  <input type="date" className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white" />
                  <button onClick={() => setBookingWizard(prev => prev ? ({...prev, step: 2}) : null)} className="w-full bg-amber-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs">Search Routes</button>
                </div>
              )}
              {bookingWizard.step === 2 && (
                <div className="space-y-3">
                  {filteredServices.slice(0, 3).map(service => (
                    <button key={service.id} onClick={() => setBookingWizard(prev => prev ? ({...prev, step: 3, service}) : null)} className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-left hover:border-amber-500/50">
                      <div className="text-white font-bold">{service.vehicleName}</div>
                      <div className="text-xs text-slate-400">{service.departureTime} ➔ {service.arrivalTime} | ₹{service.fare}</div>
                    </button>
                  ))}
                </div>
              )}
              {bookingWizard.step === 3 && bookingWizard.service && (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setBookingWizard(prev => prev ? ({ ...prev, step: 4 }) : null); }}>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Passenger Name</label>
                    <input type="text" className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white" placeholder="Enter Full Name" required />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Seat Preference</label>
                    <select className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white">
                      <option>Window</option>
                      <option>Aisle</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-amber-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs">Proceed to Summary</button>
                </form>
              )}
              {bookingWizard.step === 4 && bookingWizard.service && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400"><span>Route:</span><span>{bookingWizard.service.source} → {bookingWizard.service.destination}</span></div>
                    <div className="flex justify-between text-white font-bold"><span>Total Amount Payable:</span><span className="text-amber-400">₹{bookingWizard.service.fare}</span></div>
                  </div>
                  <button 
                    onClick={() => {
                      const url = bookingWizard.service?.type === 'Bus' ? 'https://www.tnstc.in' : 'https://www.irctc.co.in';
                      window.open(url, '_blank');
                      setBookingWizard(prev => prev ? ({ ...prev, status: 'Redirecting' }) : null);
                    }}
                    className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs"
                  >
                    Proceed to Official Booking Website
                  </button>
                  {bookingWizard.status === 'Redirecting' && (
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => {
                          const newBooking: TravelBooking = {
                            id: `TKT-${Date.now()}`,
                            serviceId: bookingWizard.service!.id,
                            routeNumber: bookingWizard.service!.routeNumber,
                            vehicleName: bookingWizard.service!.vehicleName,
                            type: bookingWizard.service!.type,
                            date: new Date().toISOString().split('T')[0],
                            time: bookingWizard.service!.departureTime,
                            source: bookingWizard.service!.source,
                            destination: bookingWizard.service!.destination,
                            fare: bookingWizard.service!.fare,
                            passengerName: 'User',
                            passengers: 1,
                            seatPreference: 'Window',
                            ticketCode: `QR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
                            status: 'Confirmed'
                          };
                          setBookings(prev => [newBooking, ...prev]);
                          setBookingWizard(null);
                          triggerToast('Booking Confirmed', 'Booking has been successfully recorded in history.', 'success');
                      }} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold">Booking Completed</button>
                      <button onClick={() => setBookingWizard(null)} className="flex-1 bg-rose-600 text-white py-2 rounded-lg text-xs font-bold">Booking Cancelled</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: Live Track GPS Telemetry Map */}
      {trackingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4" id="tracking-modal">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Navigation className="h-4 w-4 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Live GPS SCADA Tracking Network</h3>
                  <p className="text-[10px] text-slate-400">Metropolitan transits active telemetry signals synchronized directly.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Auto telemetry toggle */}
                <button 
                  onClick={() => setIsAutoTracking(!isAutoTracking)}
                  className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold border transition-colors cursor-pointer ${
                    isAutoTracking 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-white/5 text-slate-500 border-white/5'
                  }`}
                >
                  {isAutoTracking ? '● AUTO GPS STREAMING' : '○ STREAM PAUSED'}
                </button>

                <button 
                  onClick={() => setTrackingService(null)}
                  className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Simulated Live Map Tracking Component (Aesthetic SVG Path & nodes) */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 space-y-4">
              
              <div className="flex items-center justify-between text-[10px] font-mono bg-slate-900 p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Bus className="h-3.5 w-3.5 text-amber-400" />
                  <span>Route: <strong>{trackingService.routeNumber}</strong> ({trackingService.vehicleName})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Clock className="h-3 w-3" /> ETA: {trackEta} mins
                  </span>
                  <span className="text-indigo-400">Speed: {trackSpeed} km/h</span>
                </div>
              </div>

              {/* Dynamic SVG Map Path Visual */}
              <div className="relative h-44 border border-white/5 rounded-xl bg-slate-950 overflow-hidden flex flex-col justify-between p-4">
                
                {/* Map Grid lines (Aesthetic SCADA background) */}
                <div className="absolute inset-0 grid grid-cols-8 grid-rows-4 opacity-5 pointer-events-none">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div key={i} className="border border-white" />
                  ))}
                </div>

                {/* Satellite overlay indicator */}
                <span className="text-[8px] font-mono text-slate-600 uppercase absolute top-2 left-2 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  GPS SAT: IN-CH-99E SIGNAL STRONG
                </span>

                {/* Nodes with custom names and line */}
                <div className="relative w-full h-full flex flex-col justify-center">
                  
                  {/* SVG Route Line */}
                  <svg className="absolute w-full h-2 pointer-events-none overflow-visible" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                    {/* Background line */}
                    <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="rgba(255,255,255,0.08)" strokeWidth="6" strokeLinecap="round" />
                    {/* Past active line */}
                    <line x1="5%" y1="50%" x2={`${trackProgress}%`} y2="50%" stroke="#eab308" strokeWidth="4" strokeLinecap="round" />
                    
                    {/* Blinking vehicle GPS node dot */}
                    <circle cx={`${trackProgress}%`} cy="50%" r="8" fill="#eab308" className="animate-pulse" />
                    <circle cx={`${trackProgress}%`} cy="50%" r="14" fill="none" stroke="#eab308" strokeWidth="2" className="animate-ping" style={{ animationDuration: '2s' }} />
                  </svg>

                  {/* Node stations placement */}
                  <div className="flex justify-between items-center w-full relative z-10 font-mono text-[9px] text-slate-500 pt-6">
                    
                    <div className="text-left w-1/4">
                      <div className="h-2 w-2 rounded-full bg-amber-400 border border-slate-900 mx-0 mt-[-20px] mb-2" />
                      <span className="text-slate-300 font-bold block truncate">1. {trackingService.stops[0]}</span>
                      <span className="text-slate-500 text-[8.5px]">Passed</span>
                    </div>

                    <div className="text-center w-1/2 flex flex-col items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-indigo-400 border border-slate-900 mt-[-20px] mb-2" />
                      <span className="text-white font-bold block truncate max-w-[150px]">
                        📍 {trackingService.stops[trackCurrentStop] || trackingService.stops[1]}
                      </span>
                      <span className="text-amber-400 text-[8.5px] animate-pulse font-bold uppercase tracking-wider">Approaching Node</span>
                    </div>

                    <div className="text-right w-1/4 flex flex-col items-end">
                      <div className="h-2 w-2 rounded-full bg-slate-700 border border-slate-900 mr-0 mt-[-20px] mb-2" />
                      <span className="text-slate-400 block truncate max-w-[100px]">
                        End: {trackingService.stops[trackingService.stops.length - 1]}
                      </span>
                      <span className="text-slate-500 text-[8.5px]">Terminal</span>
                    </div>

                  </div>

                </div>

                {/* Progress bar info footer */}
                <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-2 border-t border-white/5">
                  <span>Progress on route path: <strong>{Math.round(trackProgress)}%</strong></span>
                  <span>Estimated distance left: <strong>{( (100 - trackProgress) / 8 ).toFixed(1)} km</strong></span>
                </div>

              </div>

            </div>

            {/* Crew Details telemetry panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-1.5">
                <span className="text-[8.5px] text-slate-500 uppercase block font-bold tracking-wider">Assigned Driver Guard</span>
                <p className="text-white font-bold">{trackingService.driverName || 'Automated Systems Controller'}</p>
                {trackingService.driverPhone && (
                  <p className="text-emerald-400 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {trackingService.driverPhone}
                  </p>
                )}
                <p className="text-slate-400">Federation Rating: <strong className="text-amber-400">★ {trackingService.rating || '4.9'}</strong></p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-2">
                <span className="text-[8.5px] text-slate-500 uppercase block font-bold tracking-wider">Manual GPS Simulation Debug</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setTrackProgress(prev => {
                        let next = prev + 12;
                        if (next >= 100) next = 0;
                        return next;
                      });
                      setTrackEta(prev => Math.max(1, prev - 2));
                      triggerToast('Simulation Tick', 'Manual vehicle GPS telemetry marker advanced.', 'info');
                    }}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-1.5 rounded-lg border border-white/10 text-[10px] cursor-pointer text-center"
                  >
                    Simulate Next Stop
                  </button>
                  
                  <button 
                    onClick={() => {
                      setTrackProgress(10);
                      setTrackEta(14);
                      triggerToast('GPS Reset', 'Vehicle telemetry position reset to start node.', 'info');
                    }}
                    className="bg-white/5 hover:bg-white/10 text-slate-400 py-1.5 px-3 rounded-lg border border-white/10 text-[10px] cursor-pointer"
                  >
                    Reset Loop
                  </button>
                </div>
                <p className="text-[8px] text-slate-600 leading-none">For evaluation in mock environments. Simulate movement of node marker manually.</p>
              </div>
            </div>

            {/* Close footer buttons */}
            <div className="flex items-center justify-end pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setTrackingService(null)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold hover:from-amber-300 hover:to-amber-400 transition-all cursor-pointer text-xs"
              >
                Close Tracking Console
              </button>
            </div>

          </motion.div>
        </div>
      )}

      {/* MODAL 3: View Route stop timeline */}
      {viewingRouteService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4" id="route-modal">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Map className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Stop-by-Stop Route Timetable</h3>
                  <p className="text-[10px] text-slate-400">Sequential checkpoints registered for {viewingRouteService.routeNumber}.</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingRouteService(null)}
                className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Vertical timeline representation */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              
              <div className="p-3 bg-slate-950 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[8px] text-slate-500 block uppercase font-mono">Service Number</span>
                  <span className="text-white font-bold">{viewingRouteService.vehicleName}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[8px] text-slate-500 block uppercase">Total Stops</span>
                  <span className="text-indigo-400 font-bold">{viewingRouteService.stops.length} Checkpoints</span>
                </div>
              </div>

              <div className="relative pl-6 space-y-4">
                {/* Timeline vertical bar */}
                <div className="absolute left-2.5 top-1.5 bottom-1.5 w-0.5 bg-slate-800" />

                {viewingRouteService.stops.map((stop, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === viewingRouteService.stops.length - 1;

                  return (
                    <div key={idx} className="relative flex items-start gap-3.5 group">
                      
                      {/* Timeline dot */}
                      <div className={`absolute left-[-18.5px] h-3.5 w-3.5 rounded-full border-2 border-slate-900 flex items-center justify-center transition-all ${
                        isFirst ? 'bg-amber-400' :
                        isLast ? 'bg-rose-400' :
                        'bg-indigo-400'
                      }`} />

                      <div className="flex-1 space-y-0.5 text-xs">
                        <div className="flex items-center justify-between">
                          <p className={`font-bold tracking-tight ${isFirst || isLast ? 'text-white text-xs' : 'text-slate-200'}`}>
                            {stop}
                          </p>
                          {isFirst && (
                            <span className="text-[8px] font-mono text-amber-400 uppercase bg-amber-500/5 px-1 rounded border border-amber-500/10">Departure Node</span>
                          )}
                          {isLast && (
                            <span className="text-[8px] font-mono text-rose-400 uppercase bg-rose-500/5 px-1 rounded border border-rose-500/10">Final Terminal</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Estimated Transit Checkpoint #{idx + 1}
                        </p>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

            <div className="flex items-center justify-end pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setViewingRouteService(null)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold hover:from-amber-300 hover:to-amber-400 transition-all cursor-pointer text-xs font-mono"
              >
                Close Route
              </button>
            </div>

          </motion.div>
        </div>
      )}

      {/* MODAL 4: View Details panel */}
      {viewingDetailsService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4" id="details-modal">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Transit Deep-Dive Directory</h3>
                  <p className="text-[10px] text-slate-400">Complete legal compliance and operations diagnostics log.</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingDetailsService(null)}
                className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Operator details block */}
              <div className="p-4 bg-slate-950 rounded-xl border border-white/5 space-y-2">
                <span className="text-[8.5px] text-slate-500 uppercase block font-bold tracking-wider font-mono">Government Operations Registry</span>
                <h4 className="text-white font-extrabold text-sm">{viewingDetailsService.vehicleName}</h4>
                <p className="text-slate-400 font-sans leading-normal">
                  Managed and dispatched under direct authorization of the <strong className="text-slate-200">{viewingDetailsService.operator}</strong>. Continuous GPS telemetry streaming and speed-governors are active on this transit coach line.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-[10.5px] border-t border-white/5 text-slate-400">
                  <span>Authorized ID: <strong className="text-white">{viewingDetailsService.id}</strong></span>
                  <span className="text-right">Route Node Index: <strong className="text-white">{viewingDetailsService.routeNumber}</strong></span>
                </div>
              </div>

              {/* Grid split for amenities & safety indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Amenities list */}
                <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-2">
                  <span className="text-[8.5px] text-indigo-400 uppercase block font-bold tracking-wider font-mono flex items-center gap-1">
                    <Wifi className="h-3 w-3" /> Coach Amenities
                  </span>
                  <ul className="space-y-1.5 font-mono text-[10px] text-slate-300">
                    {viewingDetailsService.amenities.map((amen, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        {amen}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Safety compliance */}
                <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-2">
                  <span className="text-[8.5px] text-rose-400 uppercase block font-bold tracking-wider font-mono flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Safety Compliance
                  </span>
                  <ul className="space-y-1.5 font-mono text-[10px] text-slate-300">
                    {viewingDetailsService.safetyInfo.map((saf, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-rose-400" />
                        {saf}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Sovereign QR Verification Code for Digital boarding */}
              <div className="p-4 bg-slate-950 rounded-xl border border-white/5 flex flex-col items-center text-center space-y-2.5">
                <span className="text-[8.5px] text-slate-500 uppercase font-bold tracking-wider font-mono">SC-TRANSIT Sovereign Verification QR</span>
                
                <div className="p-2.5 bg-white rounded-xl shadow-inner flex items-center justify-center">
                  <QrCode className="h-28 w-28 text-slate-950" />
                </div>
                
                <p className="text-[10px] text-slate-400 max-w-xs font-mono leading-relaxed">
                  Present this QR to MTC digital conductor nodes or CMRL entry turnstiles for fast-track automatic boarding authorization.
                </p>
              </div>

            </div>

            <div className="flex items-center justify-end pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setViewingDetailsService(null)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold hover:from-amber-300 hover:to-amber-400 transition-all cursor-pointer text-xs font-mono"
              >
                Close Diagnostics
              </button>
            </div>

          </motion.div>
        </div>
      )}

    </div>
  );
}
