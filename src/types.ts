export interface TransportService {
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

export interface TransitStation {
  id: string;
  name: string;
  type: 'Bus' | 'Metro' | 'Train';
  distance: string;
  location: string;
  nextArrivals: { route: string; eta: string }[];
}

export interface TravelBooking {
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

export interface ServiceAlert {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'critical';
  serviceAffected: string;
}

export interface HealthMetric {
  value: number | string;
  unit: string;
  timestamp: string;
}

export interface HealthData {
  bloodPressure: { systolic: number | string; diastolic: number | string };
  sugar: number | string;
  heartRate: number | string;
  sleep: number | string; // hours
  exercise: number | string; // minutes
  weight: number | string;
  oxygen: number | string; // percentage
  temperature: number | string; // Celsius
  water: number | string; // glasses
  smoking: boolean;
  lastUpdated: string;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  time: string; // HH:MM
  taken: boolean;
}

export interface AIAnalysis {
  healthScore: number | string;
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendations: string[];
}

export interface User { id: string; name: string; email: string; role: UserRole; avatar?: string; }
export type UserRole = 'admin' | 'citizen' | 'farmer' | 'ngo' | 'volunteer';
export interface WaterComplaint { id: string; status: string; citizenName: string; type: string; description: string; address: string; phone: string; lat: number | string; lng: number | string; }
export interface WasteComplaint { id: string; status: string; citizenName: string; type: string; description: string; address: string; phone: string; lat: number | string; lng: number | string; }
export interface EmergencyRequest {
    id: string;
    citizenName: string;
    phone: string;
    type: 'Police' | 'Fire' | 'Ambulance' | 'Disaster';
    description: string;
    lat: number | string;
    lng: number | string;
    address: string;
    status: 'Requested' | 'Dispatched' | 'Resolved';
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    timestamp: string;
}
export interface FoodDonation { 
    id: string; 
    status: 'Available' | 'Assigned' | 'Delivered'; 
    restaurantName: string; 
    quantity: number | string; 
    foodType: string;
    expiryTime: string;
    address: string;
    donorName: string;
    contactPhone: string;
    description: string;
    pickupTime: string;
    dietType: string;
    packaging: string;
    preparationTime: string;
    timestamp: string;
}

export interface FoodRequest {
    id: string;
    organizationName: string;
    contactPerson: string;
    phone: string;
    foodNeeded: string;
    quantityNeeded: string | number;
    location: string;
    urgency: string;
    status: 'Pending' | 'Assigned' | 'Completed';
    description: string;
}
export interface PurchaseOption {
    name: string;
    url: string;
}

export interface FarmProduct { 
    id: string; 
    name: string; 
    quantity: number | string; 
    category: string; 
    farmerName: string; 
    price: number | string; 
    farmerId: string; 
    farmerPhone: string; 
    description: string; 
    recommendedPrice: number | string;
    purchaseUrl?: string;
    contactInfo?: {
        phone?: string;
        whatsapp?: string;
        email?: string;
    };
}
export interface Appointment {
    id: string;
    doctorName: string;
    hospitalName: string;
    department: string;
    date: string;
    time: string;
    status: 'Booked' | 'Completed' | 'Approved';
    citizenId?: string;
    citizenName?: string;
    doctorId?: string;
}
export interface Hospital { id: string; name: string; address: string; phone: string; lat: number | string; lng: number | string; }
export interface Doctor { id: string; name: string; specialty: string; hospitalId: string; hospitalName: string; rating: number | string; }
export interface GovtScheme { id: string; name: string; title: string; category: string; description: string; eligibility: string; }
export interface BusRoute { id: string; routeNumber: string; start: string; end: string; fare: number | string; }
export interface BloodDonor { id: string; name: string; bloodGroup: string; age: number | string; phone: string; address: string; }
export interface BloodRequest { id: string; hospitalName: string; bloodGroup: string; units: number | string; requiredBy: string; }
export interface SchemeApplication { id: string; }

export interface DashboardStats {
  totalCitizens: number;
  activeUsersToday: number;
  totalGovtRequests: number;
  healthcareAppointments: number;
  emergencySos: number;
  bloodDonors: number;
  foodDonations: number;
  farmerOrders: number;
  waterComplaints: number;
  wasteComplaints: number;
  transportBookings: number;
  aiConversations: number;
}
