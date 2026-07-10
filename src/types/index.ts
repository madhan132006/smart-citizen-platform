export type UserRole = 'citizen' | 'hospital' | 'government' | 'farmer' | 'ngo' | 'volunteer' | 'transport' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  tamilSelected?: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospitalId: string;
  hospitalName: string;
  rating: number;
  availability: string[];
  phone: string;
  fee: number;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  beds: number;
  ventilators: number;
  icuAvailable: boolean;
}

export interface Appointment {
  id: string;
  citizenId: string;
  citizenName: string;
  doctorId: string;
  doctorName: string;
  hospitalName: string;
  date: string;
  time: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Cancelled';
}

export interface EmergencyRequest {
  id: string;
  citizenName: string;
  phone: string;
  type: 'Police' | 'Fire' | 'Ambulance' | 'Disaster';
  description: string;
  lat: number;
  lng: number;
  address: string;
  status: 'Requested' | 'Dispatched' | 'Resolved';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  timestamp: string;
}

export interface BloodDonor {
  id: string;
  name: string;
  bloodGroup: string;
  age: number;
  phone: string;
  address: string;
  lat: number;
  lng: number;
  lastDonationDate?: string;
  status: 'Available' | 'Unavailable';
}

export interface BloodRequest {
  id: string;
  hospitalName: string;
  bloodGroup: string;
  units: number;
  requiredBy: string;
  contactName: string;
  phone: string;
  status: 'Pending' | 'Fulfilled' | 'Emergency';
}

export interface FoodDonation {
  id: string;
  restaurantName: string;
  foodType: string;
  quantity: string;
  expiryTime: string;
  address: string;
  status: 'Available' | 'Assigned' | 'Picked Up' | 'Delivered';
  volunteerName?: string;
  volunteerPhone?: string;
  qrCode?: string;
  timestamp: string;
}

export interface FarmProduct {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  name: string;
  category: 'Vegetables' | 'Fruits' | 'Grains' | 'Spices' | 'Dairy' | 'Flowers';
  price: number; // per kg
  quantity: number; // in kg
  description: string;
  image?: string;
  recommendedPrice: number;
  marketPrice: number;
  demandScore: 'High' | 'Moderate' | 'Low';
  timestamp: string;
}

export interface GovtScheme {
  id: string;
  title: string;
  category: 'Healthcare' | 'Agriculture' | 'Education' | 'Pension' | 'Housing';
  description: string;
  eligibility: string;
  benefit: string;
  status: 'Active' | 'Closed';
  appliedCount: number;
}

export interface SchemeApplication {
  id: string;
  schemeId: string;
  schemeTitle: string;
  citizenId: string;
  citizenName: string;
  appliedDate: string;
  status: 'Under Review' | 'Approved' | 'Rejected';
  trackingNumber: string;
}

export interface WaterComplaint {
  id: string;
  citizenName: string;
  phone: string;
  type: 'Leakage' | 'No Supply' | 'Contaminated Water' | 'Low Pressure';
  description: string;
  address: string;
  lat: number;
  lng: number;
  status: 'Registered' | 'In Progress' | 'Resolved';
  priority: 'High' | 'Medium' | 'Low';
  date: string;
}

export interface WasteComplaint {
  id: string;
  citizenName: string;
  phone: string;
  type: 'Garbage Accumulation' | 'Illegal Dumping' | 'Missed Collection';
  description: string;
  address: string;
  lat: number;
  lng: number;
  status: 'Registered' | 'In Progress' | 'Resolved';
  priority: 'High' | 'Medium' | 'Low';
  date: string;
}

export interface BusRoute {
  id: string;
  routeNumber: string;
  start: string;
  end: string;
  fare: number;
  stops: string[];
  timing: string;
  activeBuses: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
