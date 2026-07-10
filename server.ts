import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createHttpServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI client lazy-loaded to prevent startup crashes
let ai: any = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Successfully initialized GoogleGenAI client!");
  } else {
    console.log("GEMINI_API_KEY not found in environment. Chatbot will run in offline intelligent-mock mode.");
  }
} catch (e) {
  console.error("Error initializing GoogleGenAI client:", e);
}

// Low-fidelity file database for state persistence across server reloads
const DB_FILE_PATH = path.join(process.cwd(), "server_db.json");

// Helper to load database
// Helper to load database
function loadDb() {
  const seedProducts = [
    {
      id: 'crop-mock-1',
      farmerId: 'f-1',
      farmerName: 'Murugan Ramasamy',
      farmerPhone: '+91 94443 11223',
      name: 'Ooty Organic Carrots',
      category: 'Vegetables',
      price: 45,
      quantity: 500,
      description: 'Crisp and sweet carrots harvested from the high-altitude terraced fields of Ooty. 100% chemical-free and organically grown with organic manure.',
      image: 'https://images.unsplash.com/photo-1590865507245-5118f57c55b7?auto=format&fit=crop&w=600&q=80',
      recommendedPrice: 48,
      purchaseUrl: 'https://www.amazon.in/dp/example1',
      contactInfo: {
        phone: '+91 94443 11223',
        whatsapp: '+91 94443 11223',
        email: 'murugan@ootyfarm.example.com'
      }
    },
    {
      id: 'crop-mock-2',
      farmerId: 'f-2',
      farmerName: 'Ranganathan Pillai',
      farmerPhone: '+91 97501 23456',
      name: 'Salem Country Tomatoes',
      category: 'Vegetables',
      price: 25,
      quantity: 350,
      description: 'Bright red, juicy native tomatoes perfect for sambar and rasam. Hand-picked at optimal ripeness from Salem plains.',
      image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80',
      recommendedPrice: 28,
      marketPrice: 24,
      demandScore: 'High',
      freshnessStatus: 'Harvested Today',
      location: 'Salem Rural, Tamil Nadu',
      farmingMethod: 'Panchagavya Organic Feed',
      soilMoisture: '58%',
      harvestDate: '2026-07-08',
      certification: 'Certified Organic (TNOFA)'
    },
    {
      id: 'crop-mock-3',
      farmerId: 'f-3',
      farmerName: 'Selvakumar K.',
      farmerPhone: '+91 98402 55443',
      name: 'Krishnagiri Alphonso Mangoes',
      category: 'Fruits',
      price: 120,
      quantity: 200,
      description: 'Pristine naturally ripened Alphonso mangoes, selected for supreme aroma and sugar content. Sourced directly from our Krishnagiri orchards.',
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
      recommendedPrice: 130,
      marketPrice: 115,
      demandScore: 'High',
      freshnessStatus: 'Freshly Picked',
      location: 'Krishnagiri Orchard Hub',
      farmingMethod: 'Natural Ripening, No Carbide used',
      soilMoisture: '50%',
      harvestDate: '2026-07-07',
      certification: 'Agmark Certified Grade A'
    },
    {
      id: 'crop-mock-4',
      farmerId: 'f-4',
      farmerName: 'Chinnasamy G.',
      farmerPhone: '+91 91500 88221',
      name: 'Red Lady Papaya',
      category: 'Fruits',
      price: 40,
      quantity: 300,
      description: 'Succulent Red Lady papayas with thick, deep orange flesh. Sweet, high nutritional index, harvested directly in Erode.',
      image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=600&q=80',
      recommendedPrice: 42,
      marketPrice: 38,
      demandScore: 'Moderate',
      freshnessStatus: 'Harvested Yesterday',
      location: 'Erode Valley',
      farmingMethod: 'Traditional Organic Manure',
      soilMoisture: '55%',
      harvestDate: '2026-07-08',
      certification: 'Local Co-op Verified'
    },
    {
      id: 'crop-mock-5',
      farmerId: 'f-5',
      farmerName: 'Ramasamy Iyer',
      farmerPhone: '+91 93451 99887',
      name: 'Organic Ponni Paddy Rice',
      category: 'Grains',
      price: 52,
      quantity: 1200,
      description: 'Aged Ponni paddy crop harvested from the highly fertile Thanjavur delta. Fine grains, processed using chemical-free traditional methods.',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      recommendedPrice: 55,
      marketPrice: 50,
      demandScore: 'High',
      freshnessStatus: 'Well Aged (1 Year)',
      location: 'Thanjavur Delta',
      farmingMethod: 'Cauvery River-fed Bio-Farming',
      soilMoisture: '12%',
      harvestDate: '2026-06-15',
      certification: 'Organic India Certified'
    },
    {
      id: 'crop-mock-6',
      farmerId: 'f-6',
      farmerName: 'Palanisamy G.',
      farmerPhone: '+91 95400 33441',
      name: 'Pure Salem Millets (Kambu)',
      category: 'Grains',
      price: 65,
      quantity: 800,
      description: 'High-fiber, gluten-free traditional Salem pearl millets (Kambu). Highly drought-resistant crop grown on chemical-free plots.',
      image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80',
      recommendedPrice: 68,
      marketPrice: 62,
      demandScore: 'Moderate',
      freshnessStatus: 'Premium Dry Grain',
      location: 'Salem Semi-arid Plains',
      farmingMethod: 'Dry-land rainfed organic crop',
      soilMoisture: '10%',
      harvestDate: '2026-07-05',
      certification: 'TNOFA Natural Certified'
    },
    {
      id: 'crop-mock-7',
      farmerId: 'f-7',
      farmerName: 'Subramanian Sundar',
      farmerPhone: '+91 98422 11002',
      name: 'Erode Organic Turmeric Powder',
      category: 'Spices',
      price: 180,
      quantity: 400,
      description: 'Pure high-curcumin turmeric grown in Erode. Boiled, sun-dried, and stone-ground into a fine aromatic spice with zero additives.',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
      recommendedPrice: 195,
      marketPrice: 175,
      demandScore: 'High',
      freshnessStatus: 'Sun-Dried Grade A',
      location: 'Erode Spice Hub',
      farmingMethod: '100% Organic, High Curcumin strain',
      soilMoisture: '8%',
      harvestDate: '2026-07-02',
      certification: 'Sovereign Lab Tested 6.2% Curcumin'
    },
    {
      id: 'crop-mock-8',
      farmerId: 'f-8',
      farmerName: 'Velumani Swamy',
      farmerPhone: '+91 97511 88990',
      name: 'Fresh Farm Cow Milk',
      category: 'Dairy',
      price: 60,
      quantity: 150,
      description: 'A2 rich farm-fresh cow milk. Hygienically milked from grass-fed native Gir cows, kept in chilled containers. No preservatives added.',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
      recommendedPrice: 64,
      marketPrice: 58,
      demandScore: 'High',
      freshnessStatus: 'Milked Today 05:00 AM',
      location: 'Salem Dairy Co-op',
      farmingMethod: 'Grass-fed, chemical-free dairy',
      soilMoisture: 'N/A',
      harvestDate: '2026-07-09',
      certification: 'Cooperative Quality Checked A2'
    },
    {
      id: 'crop-mock-9',
      farmerId: 'f-9',
      farmerName: 'Shanmugam Pillai',
      farmerPhone: '+91 99402 77881',
      name: 'Premium Buffalo Ghee',
      category: 'Dairy',
      price: 650,
      quantity: 80,
      description: 'Aromatic granular buffalo ghee churned traditionally using the wooden bilona method. High-quality healthy fats with delightful aroma.',
      image: 'https://images.unsplash.com/photo-1589733901241-5e53429e1dbf?auto=format&fit=crop&w=600&q=80',
      recommendedPrice: 670,
      marketPrice: 640,
      demandScore: 'Moderate',
      freshnessStatus: 'Freshly Churned',
      location: 'Kangayam Farms',
      farmingMethod: 'Traditional Bilona Churning',
      soilMoisture: 'N/A',
      harvestDate: '2026-07-01',
      certification: 'Handcrafted Small Batch'
    },
    {
      id: 'crop-mock-10',
      farmerId: 'f-10',
      farmerName: 'Arumugam Chettiar',
      farmerPhone: '+91 94860 33221',
      name: 'Madurai Golden Marigolds',
      category: 'Flowers',
      price: 80,
      quantity: 250,
      description: 'Fresh, vibrant golden yellow marigold flowers, perfect for festivals and temple garlands. Freshly plucked before dawn.',
      image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=600&q=80',
      recommendedPrice: 90,
      marketPrice: 75,
      demandScore: 'High',
      freshnessStatus: 'Plucked Today 04:00 AM',
      location: 'Madurai Flower Market',
      farmingMethod: 'Natural Floriculture',
      soilMoisture: '45%',
      harvestDate: '2026-07-09',
      certification: 'Premium Grade Garland Class'
    },
    {
      id: 'crop-mock-11',
      farmerId: 'f-11',
      farmerName: 'Meenakshi Ammal',
      farmerPhone: '+91 95441 22334',
      name: 'Scented Madurai Jasmine (Malli)',
      category: 'Flowers',
      price: 250,
      quantity: 120,
      description: 'World-famous Madurai Gundu Malli (Jasmine). Thick buds with an exceptionally sweet fragrance, plucked freshly at sunrise.',
      image: 'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?auto=format&fit=crop&w=600&q=80',
      recommendedPrice: 270,
      marketPrice: 240,
      demandScore: 'High',
      freshnessStatus: 'Plucked Today 04:00 AM',
      location: 'Madurai Rural Belt',
      farmingMethod: 'Natural Organic Floriculture',
      soilMoisture: '48%',
      harvestDate: '2026-07-09',
      certification: 'GI Tagged Madurai Malli'
    }
  ];

  if (!fs.existsSync(DB_FILE_PATH)) {
    // Return empty defaults
    const defaultDb = {
      users: [
        { id: 'user-cit', name: 'Santhosh Kumar', email: 'santhosh@example.com', role: 'citizen', phone: '+91 94441 55667', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150' },
        { id: 'user-gov', name: 'Officer Selvam', email: 'selvam@gov.in', role: 'government', phone: '+91 95001 00223' },
        { id: 'user-farm', name: 'Ranganathan Pillai', email: 'ranga@farmer.org', role: 'farmer', phone: '+91 97501 23456' },
        { id: 'user-ngo', name: 'Dr. Priya Mani', email: 'priya@cause.org', role: 'ngo', phone: '+91 98222 33344' },
        { id: 'user-vol', name: 'Dinesh Karthik', email: 'dinesh@serve.org', role: 'volunteer', phone: '+91 98111 22233' }
      ],
      appointments: [
        {
          id: 'appt-1',
          citizenId: 'user-cit',
          citizenName: 'Santhosh Kumar',
          doctorId: 'doc-1',
          doctorName: 'Dr. Arul Prasad',
          hospitalName: 'Metro General Hospital & Trauma Centre',
          date: '2026-07-10',
          time: '10:30 AM',
          reason: 'Monthly cardiovascular checkup and ECG reading.',
          status: 'Approved'
        }
      ],
      emergencies: [
        {
          id: 'sos-1',
          citizenName: 'Aravind Swamy',
          phone: '+91 91101 22334',
          type: 'Ambulance',
          description: 'Severe chest pain and sudden sweating reported for an elderly patient (72 M). Need critical cardiac ICU vehicle immediately.',
          lat: 13.0441,
          lng: 80.2504,
          address: 'Block-D, Metro Apartments, Cathedral Road, Chennai',
          status: 'Dispatched',
          priority: 'Critical',
          timestamp: '2026-07-08T10:15:00'
        },
        {
          id: 'sos-2',
          citizenName: 'Meenakshi Sundaram',
          phone: '+91 91102 33445',
          type: 'Disaster',
          description: 'Heavy water logging and power cable snapped on metal railing. Entire street blocked, high risk of electrocution.',
          lat: 13.0602,
          lng: 80.2514,
          address: 'Giri Road, T-Nagar, Chennai',
          status: 'Requested',
          priority: 'High',
          timestamp: '2026-07-08T10:28:00'
        }
      ],
      donors: [
        { id: 'donor-1', name: 'Suresh Kumar', bloodGroup: 'O+', age: 29, phone: '+91 99401 11223', address: 'Adyar, Chennai', lat: 13.0064, lng: 80.2577, lastDonationDate: '2026-03-15', status: 'Available' },
        { id: 'donor-2', name: 'Anjali Sharma', bloodGroup: 'A-', age: 24, phone: '+91 99402 22334', address: 'Nungambakkam, Chennai', lat: 13.0608, lng: 80.2378, lastDonationDate: '2025-12-01', status: 'Available' },
        { id: 'donor-3', name: 'Vikas Patel', bloodGroup: 'B+', age: 33, phone: '+91 99403 33445', address: 'Velachery, Chennai', lat: 12.9801, lng: 80.2228, lastDonationDate: '2026-05-10', status: 'Available' }
      ],
      bloodRequests: [
        { id: 'breq-1', hospitalName: 'Metro General Hospital', bloodGroup: 'O-', units: 3, requiredBy: 'Immediate / Bypass Surgery', contactName: 'Staff Nurse Mercy', phone: '+91 44 2811 0002', status: 'Emergency' },
        { id: 'breq-2', hospitalName: 'Apollo Speciality Hospital', bloodGroup: 'B+', units: 2, requiredBy: 'Within 24 Hours / Leukemia Therapy', contactName: 'Ramesh (Relation)', phone: '+91 98409 99887', status: 'Pending' }
      ],
      bloodBanks: [
        { id: 'bank-1', name: 'Government General Hospital Blood Center', city: 'Chennai', distance: '1.2 km', phone: '+91 44 2530 1111', stock: { 'O+': 32, 'O-': 6, 'A+': 18, 'B+': 24, 'AB+': 8, 'AB-': 2 } },
        { id: 'bank-2', name: 'Adyar Community Blood Bank', city: 'Chennai', distance: '0.8 km', phone: '+91 44 2441 9988', stock: { 'O+': 15, 'O-': 2, 'A+': 10, 'B+': 12, 'AB+': 4, 'AB-': 1 } },
        { id: 'bank-3', name: 'Coimbatore Red Cross Blood Bank', city: 'Coimbatore', distance: '3.5 km', phone: '+91 422 230 0556', stock: { 'O+': 28, 'O-': 4, 'A+': 15, 'B+': 19, 'AB+': 6, 'AB-': 1 } }
      ],
      foodDonations: [
        { id: 'food-1', restaurantName: 'Sangeetha Vegetarian Restaurant', foodType: 'Meals (Sambar Rice, Curd Rice)', quantity: '30 Servings', expiryTime: 'Within 3 Hours', address: 'Alwarpet, Chennai', status: 'Available', qrCode: 'QR_FOOD_1001', timestamp: '2026-07-08T11:30:00' },
        { id: 'food-2', restaurantName: 'Thalappakatti Biryani', foodType: 'Chicken Biryani & Raitha', quantity: '50 Servings', expiryTime: 'Within 4 Hours', address: 'T-Nagar, Chennai', status: 'Assigned', volunteerName: 'Dinesh Karthik', volunteerPhone: '+91 98111 22233', qrCode: 'QR_FOOD_1002', timestamp: '2026-07-08T12:00:00' }
      ],
      foodRequests: [],
      farmProducts: seedProducts,
      farmOrders: [],
      schemeApplications: [
        { id: 'appl-1', schemeId: 'scheme-1', schemeTitle: 'Amma Comprehensive Health Insurance Scheme', citizenId: 'user-cit', citizenName: 'Santhosh Kumar', appliedDate: '2026-07-08', status: 'Under Review', trackingNumber: 'LC-AMMA-9921' }
      ],
      waterComplaints: [
        { id: 'water-1', citizenName: 'Ramachandran N.', phone: '+91 94441 55667', type: 'Leakage', description: 'Main underground pipe ruptured near Metro water pump, huge amount of drinking water wasted on road.', address: '4th Avenue, Shanti Colony, Anna Nagar, Chennai', lat: 13.0850, lng: 80.2101, status: 'In Progress', priority: 'High', date: '2026-07-07' },
        { id: 'water-2', citizenName: 'Deepa Rajan', phone: '+91 94442 66778', type: 'Contaminated Water', description: 'Sewage water odor and dark yellowish color detected in public tap lines. Unfit for household use.', address: 'Kamaraj Salai, Triplicane, Chennai', lat: 13.0520, lng: 80.2780, status: 'Registered', priority: 'High', date: '2026-07-08' }
      ],
      waterResources: [
        { id: 'res-1', name: 'Anna Nagar West Overhead Reservoir', type: 'Overhead Tank', level: 78, capacity: '500,000 Liters', location: 'Anna Nagar', status: 'Optimal', quality: { pH: 7.2, turbidity: 1.2, chlorine: 0.5, tds: 240, temp: 26 }, lastInspection: '2026-07-05', servedPopulation: '45,000 Residents' },
        { id: 'res-2', name: 'Chembarambakkam Lake Main Gateway', type: 'Lake Reservoir', level: 62, capacity: '1,980,000 Liters', location: 'Poonamallee', status: 'Optimal', quality: { pH: 7.4, turbidity: 2.1, chlorine: 0.4, tds: 310, temp: 28 }, lastInspection: '2026-07-06', servedPopulation: '180,000 Residents' }
      ],
      supplyCenters: [
        { id: 'center-1', name: 'Anna Nagar Metro Water Depot', location: 'Block II, Anna Nagar East', activeTankers: 6, costRate: '₹600 for 6,000L', contact: '+91 94440 12345', status: 'Active', distance: '1.2 km' },
        { id: 'center-2', name: 'Adyar Regional Distribution Center', location: 'Canal Bank Road, Adyar', activeTankers: 4, costRate: '₹800 for 9,000L', contact: '+91 94440 23456', status: 'Active', distance: '2.5 km' }
      ],
      wasteComplaints: [
        { id: 'waste-1', citizenName: 'Karthik Raja', phone: '+91 95001 88990', type: 'Garbage Accumulation', description: 'Municipal trash bins overflowing on the main street for 3 days. Foul smell and stray dogs surrounding it.', address: 'South Usman Road, T-Nagar, Chennai', lat: 13.0312, lng: 80.2335, status: 'In Progress', priority: 'Medium', date: '2026-07-07' },
        { id: 'waste-2', citizenName: 'Srimathi S.', phone: '+91 95002 99001', type: 'Illegal Dumping', description: 'Construction debris and plastic sacks dumped illegally during midnight near public park.', address: '1st Cross Road, Besant Nagar, Chennai', lat: 13.0012, lng: 80.2685, status: 'Registered', priority: 'High', date: '2026-07-08' }
      ],
      wasteRequests: [
        { id: 'W-9041', type: 'Electronic Waste (E-Waste)', address: 'Plot 48, 5th Cross Street, Anna Nagar, Chennai', citizenName: 'Santhosh Kumar', phone: '+91 94441 55667', date: '2026-07-08', timeSlot: '10:00 AM - 01:00 PM', status: 'Dispatched', priority: 'Medium', vehicleNo: 'TN-01-EQ-9852', driverName: 'Saravanan K.', description: 'Old desktop computer monitor, damaged lithium battery pack.', weightEst: '12 kg', purpose: 'Residential', ecoImpactPoints: 120 },
      ],
      transportServices: [
        { id: 'S-101', type: 'Bus', routeNumber: 'MTC-21G', vehicleName: 'MTC Deluxe Coach 21G', source: 'Tambaram', destination: 'Broadway', departureTime: '11:30 AM', arrivalTime: '12:45 PM', duration: '1h 15m', fare: 28, status: 'On Time', availability: 'Available', seatCount: 22, stops: ['Tambaram', 'Chromepet', 'Pallavaram', 'Guindy', 'Saidapet', 'Nandanam', 'T-Nagar', 'Gemini', 'Spencers', 'Broadway'], driverName: 'Saravanan K.', driverPhone: '+91 94451 10022', rating: 4.6, operator: 'Metropolitan Transport Corporation (MTC)', amenities: ['CCTV Security', 'Digital Stop Display', 'Charging Ports'], safetyInfo: ['Emergency Exit', 'Panic Button Alarm', 'First Aid Kit'] },
        { id: 'S-201', type: 'Metro', routeNumber: 'Blue Line', vehicleName: 'CMRL Metro Coach Train-B3', source: 'Wimco Nagar', destination: 'Airport', departureTime: '11:24 AM', arrivalTime: '12:12 PM', duration: '48m', fare: 50, status: 'Operational', availability: 'Available', seatCount: 145, stops: ['Wimco Nagar', 'Tollgate', 'Washermanpet', 'Chennai Central', 'LIC', 'Thousand Lights', 'Teynampet', 'Nandanam', 'Guindy', 'Airport'], driverName: 'Automated Train Control (ATC)', driverPhone: 'CMRL Control Desk', rating: 4.9, operator: 'Chennai Metro Rail Limited (CMRL)', amenities: ['Air Conditioned', 'Free Station Wi-Fi', 'USB Charging', 'Announcements Screen'], safetyInfo: ['Continuous Surveillance CCTV', 'Direct Control Desk Intercom', 'Fire Suppression Tubes'] }
      ],
      notifications: [
        { id: 'notif-1', title: 'Vaccination Alert', message: 'Booster Dose reminder: Please complete scheduled immunization at nearest clinic.', type: 'info', timestamp: '2026-07-08T09:00:00' },
        { id: 'notif-2', title: 'Ambulance SOS Dispatched', message: 'Cardiac responder ambulance has been dispatched for Aravind Swamy.', type: 'danger', timestamp: '2026-07-08T10:16:00' }
      ]
    };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(defaultDb, null, 2));
    return defaultDb;
  }
  try {
    const data = JSON.parse(fs.readFileSync(DB_FILE_PATH, "utf-8"));
    
    // Migration: ensure farmProducts is populated and has all mock items dynamically if it only has 2 items
    if (!data.farmProducts || data.farmProducts.length <= 2) {
      data.farmProducts = seedProducts;
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2));
    }
    if (!data.farmOrders) {
      data.farmOrders = [];
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2));
    }
    return data;
  } catch (e) {
    console.error("Database reading error, returning empty", e);
    return {};
  }
}

// Helper to save database
function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Database writing error", e);
  }
}

// Initialize database
let db = loadDb();

// API REST routes
app.get("/api/data", (req: Request, res: Response) => {
  db = loadDb();
  res.json(db);
});

// Healthcare Dynamic Records Routes
app.get("/api/health-record/:userId", (req: Request, res: Response) => {
  const { userId } = req.params;
  db = loadDb();
  if (!db.healthRecords) {
    db.healthRecords = {};
  }
  
  if (!db.healthRecords[userId]) {
    // Initialize a default yet fully mutable health profile for the specific user
    db.healthRecords[userId] = {
      systolic: 120,
      diastolic: 80,
      sugar: 95,
      heightCm: 170,
      weightKg: 70,
      exerciseMins: 30,
      smoking: "no",
      sleepHours: 7.5,
      stressLevel: 3,
      heartRate: 72,
      waterCups: 6,
      steps: 6500,
      oxygenSat: 98,
      reminders: [
        { id: 1, name: "Metformin (Sugar)", morning: true, afternoon: false, night: true, beforeFood: false, taken: false },
        { id: 2, name: "Atorvastatin (Cholesterol)", morning: false, afternoon: false, night: true, beforeFood: false, taken: true },
        { id: 3, name: "Multivitamin", morning: true, afternoon: false, night: false, beforeFood: true, taken: false }
      ],
      history: [
        { date: "Mon", score: 82, systolic: 122, diastolic: 81, sugar: 98, sleep: 7.0, exercise: 25, water: 6, medsAdherence: 66 },
        { date: "Tue", score: 85, systolic: 120, diastolic: 80, sugar: 95, sleep: 7.5, exercise: 30, water: 7, medsAdherence: 100 },
        { date: "Wed", score: 84, systolic: 124, diastolic: 82, sugar: 102, sleep: 6.8, exercise: 20, water: 5, medsAdherence: 33 },
        { date: "Thu", score: 88, systolic: 118, diastolic: 78, sugar: 92, sleep: 8.0, exercise: 35, water: 8, medsAdherence: 100 },
        { date: "Fri", score: 90, systolic: 118, diastolic: 78, sugar: 90, sleep: 8.2, exercise: 40, water: 8, medsAdherence: 100 },
        { date: "Sat", score: 92, systolic: 120, diastolic: 80, sugar: 95, sleep: 7.5, exercise: 30, water: 6, medsAdherence: 100 },
        { date: "Sun", score: 93, systolic: 120, diastolic: 80, sugar: 95, sleep: 7.5, exercise: 30, water: 6, medsAdherence: 66 }
      ]
    };
    saveDb(db);
  }
  
  res.json(db.healthRecords[userId]);
});

app.post("/api/health-record/:userId", (req: Request, res: Response) => {
  const { userId } = req.params;
  db = loadDb();
  if (!db.healthRecords) {
    db.healthRecords = {};
  }
  
  db.healthRecords[userId] = {
    ...db.healthRecords[userId],
    ...req.body
  };
  
  saveDb(db);
  res.json({ success: true, data: db.healthRecords[userId] });
});

// Authentication Routes
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  db = loadDb();
  
  // Find or create user
  let user = db.users.find((u: any) => u.email === email && u.role === role);
  if (!user) {
    // Generate new mock user
    const name = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
    user = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      phone: "+91 99999 88888",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150"
    };
    db.users.push(user);
    saveDb(db);
  }
  
  res.json({ success: true, token: "mock-jwt-token-for-platform", user });
});

app.post("/api/auth/register", (req: Request, res: Response) => {
  const { name, email, role, phone } = req.body;
  db = loadDb();
  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    role,
    phone,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150"
  };
  db.users.push(newUser);
  saveDb(db);
  res.json({ success: true, user: newUser });
});

// Modules Post Endpoints
app.post("/api/appointments", (req: Request, res: Response) => {
  db = loadDb();
  const appointment = {
    id: `appt-${Date.now()}`,
    ...req.body,
    status: 'Approved' // auto-approve for high responsiveness
  };
  db.appointments.unshift(appointment);
  
  // Add notification
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    title: 'Appointment Confirmed',
    message: `Your appointment with ${appointment.doctorName} is confirmed for ${appointment.date} at ${appointment.time}.`,
    type: 'success',
    timestamp: new Date().toISOString()
  });
  
  saveDb(db);
  res.json({ success: true, appointment });
});

app.get("/api/emergencies", (req: Request, res: Response) => {
  db = loadDb();
  res.json(db.emergencies || []);
});

app.post("/api/emergency", (req: Request, res: Response) => {
  db = loadDb();
  const request = {
    id: `sos-${Date.now()}`,
    ...req.body,
    status: 'Requested',
    timestamp: new Date().toISOString()
  };
  db.emergencies.unshift(request);
  
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    title: `Emergency ${request.type} Triggered`,
    message: `SOS alert registered at ${request.address || "Current GPS coordinate"}. Team dispatched.`,
    type: 'danger',
    timestamp: new Date().toISOString()
  });
  
  saveDb(db);
  res.json({ success: true, request });
});

// Support plural route called by frontend
app.post("/api/emergencies", (req: Request, res: Response) => {
  db = loadDb();
  const request = {
    id: `sos-${Date.now()}`,
    ...req.body,
    status: 'Requested',
    timestamp: new Date().toISOString()
  };
  db.emergencies.unshift(request);
  
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    title: `Emergency ${request.type} Triggered`,
    message: `SOS alert registered at ${request.address || "Current GPS coordinate"}. Team dispatched.`,
    type: 'danger',
    timestamp: new Date().toISOString()
  });
  
  saveDb(db);
  res.json({ success: true, request });
});

app.post("/api/emergency/resolve", (req: Request, res: Response) => {
  const { id, status } = req.body;
  db = loadDb();
  db.emergencies = db.emergencies.map((e: any) => e.id === id ? { ...e, status } : e);
  saveDb(db);
  res.json({ success: true });
});

app.post("/api/emergencies/status", (req: Request, res: Response) => {
  const { id, status } = req.body;
  db = loadDb();
  db.emergencies = db.emergencies.map((e: any) => e.id === id ? { ...e, status } : e);
  saveDb(db);
  res.json({ success: true });
});

app.post("/api/blood/register", (req: Request, res: Response) => {
  db = loadDb();
  const donor = {
    id: `donor-${Date.now()}`,
    ...req.body,
    lat: 13.0827 + (Math.random() - 0.5) * 0.05,
    lng: 80.2707 + (Math.random() - 0.5) * 0.05,
    status: 'Available'
  };
  db.donors.unshift(donor);
  saveDb(db);
  res.json({ success: true, donor });
});

app.post("/api/blood/request", (req: Request, res: Response) => {
  db = loadDb();
  const request = {
    id: `breq-${Date.now()}`,
    ...req.body,
    status: 'Pending'
  };
  db.bloodRequests.unshift(request);
  
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    title: 'New Blood Request',
    message: `Emergency blood request for group ${request.bloodGroup} at ${request.hospitalName}.`,
    type: 'info',
    timestamp: new Date().toISOString()
  });
  
  saveDb(db);
  res.json({ success: true, request });
});

app.post("/api/food", (req: Request, res: Response) => {
  db = loadDb();
  const donation = {
    id: `food-${Date.now()}`,
    ...req.body,
    status: 'Available',
    qrCode: `QR_FOOD_${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString()
  };
  db.foodDonations.unshift(donation);
  saveDb(db);
  res.json({ success: true, donation });
});

app.post("/api/food/donate", (req: Request, res: Response) => {
  db = loadDb();
  const donation = {
    id: `food-${Date.now()}`,
    ...req.body,
    status: 'Available',
    qrCode: `QR_FOOD_${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString()
  };
  db.foodDonations.unshift(donation);
  saveDb(db);
  res.json({ success: true, donation });
});

app.post("/api/food/request", (req: Request, res: Response) => {
  db = loadDb();
  if (!db.foodRequests) {
    db.foodRequests = [];
  }
  const request = {
    id: `req-${Date.now()}`,
    ...req.body,
    status: 'Pending',
    timestamp: new Date().toISOString()
  };
  db.foodRequests.unshift(request);
  saveDb(db);
  res.json({ success: true, request });
});

app.post("/api/food/volunteer", (req: Request, res: Response) => {
  const { id, volunteerName, volunteerPhone } = req.body;
  db = loadDb();
  db.foodDonations = db.foodDonations.map((food: any) => {
    if (food.id === id) {
      return { 
        ...food, 
        status: 'Assigned', 
        volunteerName, 
        volunteerPhone 
      };
    }
    return food;
  });
  saveDb(db);
  res.json({ success: true });
});

app.post("/api/food/claim", (req: Request, res: Response) => {
  const { id, name, phone } = req.body;
  db = loadDb();
  db.foodDonations = db.foodDonations.map((food: any) => {
    if (food.id === id) {
      return { 
        ...food, 
        status: 'Assigned', 
        volunteerName: name, 
        volunteerPhone: phone 
      };
    }
    return food;
  });
  saveDb(db);
  res.json({ success: true });
});

app.post("/api/food/deliver", (req: Request, res: Response) => {
  const { id } = req.body;
  db = loadDb();
  db.foodDonations = db.foodDonations.map((food: any) => food.id === id ? { ...food, status: 'Delivered' } : food);
  saveDb(db);
  res.json({ success: true });
});

app.post("/api/farmer/product", (req: Request, res: Response) => {
  db = loadDb();
  const product = {
    id: `farm-${Date.now()}`,
    ...req.body,
    harvestDate: req.body.harvestDate || new Date().toISOString().split('T')[0],
    certification: req.body.certification || "Fresh Organic Quality",
    image: req.body.image || "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80",
    timestamp: new Date().toISOString()
  };
  db.farmProducts.unshift(product);
  saveDb(db);
  res.json({ success: true, product });
});

app.post("/api/farmer/product/edit", (req: Request, res: Response) => {
  const { id, name, category, price, quantity, description, recommendedPrice, marketPrice, demandScore, freshnessStatus, location, farmingMethod, harvestDate, certification, image } = req.body;
  db = loadDb();
  db.farmProducts = db.farmProducts.map((p: any) => p.id === id ? {
    ...p,
    name,
    category,
    price,
    quantity,
    description,
    recommendedPrice,
    marketPrice,
    demandScore,
    freshnessStatus,
    location,
    farmingMethod,
    harvestDate,
    certification,
    image
  } : p);
  saveDb(db);
  res.json({ success: true });
});

app.post("/api/farmer/product/delete", (req: Request, res: Response) => {
  const { id } = req.body;
  db = loadDb();
  db.farmProducts = db.farmProducts.filter((p: any) => p.id !== id);
  saveDb(db);
  res.json({ success: true });
});

app.post("/api/farmer/order", (req: Request, res: Response) => {
  db = loadDb();
  if (!db.farmOrders) {
    db.farmOrders = [];
  }
  const order = {
    id: `forder-${Date.now()}`,
    ...req.body,
    status: 'Pending',
    timestamp: new Date().toISOString()
  };
  db.farmOrders.unshift(order);
  
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    title: 'New Crop Order Request',
    message: `${order.buyerName} requested ${order.quantity || 1} units of ${order.productName}.`,
    type: 'success',
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true, order });
});

app.post("/api/govt/apply", (req: Request, res: Response) => {
  db = loadDb();
  const application = {
    id: `appl-${Date.now()}`,
    ...req.body,
    appliedDate: new Date().toISOString().split('T')[0],
    status: 'Under Review',
    trackingNumber: `LC-${req.body.schemeTitle.slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
  };
  db.schemeApplications.unshift(application);
  saveDb(db);
  res.json({ success: true, application });
});

app.post("/api/water", (req: Request, res: Response) => {
  db = loadDb();
  const complaint = {
    id: `water-${Date.now()}`,
    ...req.body,
    status: 'Registered',
    date: new Date().toISOString().split('T')[0],
    lat: 13.0827 + (Math.random() - 0.5) * 0.05,
    lng: 80.2707 + (Math.random() - 0.5) * 0.05,
  };
  db.waterComplaints.unshift(complaint);
  saveDb(db);
  res.json({ success: true, complaint });
});

app.post("/api/water/complaint", (req: Request, res: Response) => {
  db = loadDb();
  const complaint = {
    id: `water-${Date.now()}`,
    ...req.body,
    status: 'Registered',
    date: new Date().toISOString().split('T')[0],
    lat: 13.0827 + (Math.random() - 0.5) * 0.05,
    lng: 80.2707 + (Math.random() - 0.5) * 0.05,
  };
  db.waterComplaints.unshift(complaint);
  saveDb(db);
  res.json({ success: true, complaint });
});

app.get("/api/water/resources", (req: Request, res: Response) => {
  db = loadDb();
  res.json(db.waterResources || []);
});

app.get("/api/water/centers", (req: Request, res: Response) => {
  db = loadDb();
  res.json(db.supplyCenters || []);
});

app.post("/api/water/request", (req: Request, res: Response) => {
  db = loadDb();
  const request = {
    id: `req-${Date.now()}`,
    ...req.body,
    status: 'Pending',
    timestamp: new Date().toISOString()
  };
  if (!db.waterSupplyRequests) db.waterSupplyRequests = [];
  db.waterSupplyRequests.unshift(request);
  saveDb(db);
  res.json({ success: true, request });
});

app.get("/api/transport/services", (req: Request, res: Response) => {
  db = loadDb();
  res.json(db.transportServices || []);
});

app.get("/api/transport/bookings", (req: Request, res: Response) => {
  db = loadDb();
  res.json(db.transportBookings || []);
});

app.get("/api/analytics/dashboard", (req: Request, res: Response) => {
  db = loadDb();
  res.json({
    totalCitizens: db.users.length,
    activeUsersToday: Math.round(db.users.length * 0.7), // Mocked for now
    totalGovtRequests: db.schemeApplications.length,
    healthcareAppointments: db.appointments.length,
    emergencySos: db.emergencies.length,
    bloodDonors: db.donors.length,
    foodDonations: db.foodDonations.length,
    farmerOrders: (db.farmOrders || []).length,
    waterComplaints: db.waterComplaints.length,
    wasteComplaints: db.wasteComplaints.length,
    transportBookings: (db.transportBookings || []).length,
    aiConversations: 0,
    systemUptime: "99.98%"
  });
});

app.post("/api/transport/book", (req: Request, res: Response) => {
  db = loadDb();
  const booking = {
    id: `TKT-${Date.now()}`,
    ...req.body,
    status: 'Confirmed',
    date: new Date().toISOString().split('T')[0],
  };
  if (!db.transportBookings) db.transportBookings = [];
  db.transportBookings.unshift(booking);
  saveDb(db);
  res.json({ success: true, booking });
});

app.get("/api/waste/requests", (req: Request, res: Response) => {
  db = loadDb();
  res.json(db.wasteRequests || []);
});

app.post("/api/waste/requests", (req: Request, res: Response) => {
  db = loadDb();
  const request = {
    id: `W-${Date.now()}`,
    ...req.body,
    status: 'Pending',
    date: new Date().toISOString().split('T')[0],
  };
  if (!db.wasteRequests) db.wasteRequests = [];
  db.wasteRequests.unshift(request);
  saveDb(db);
  res.json({ success: true, request });
});

app.get("/api/waste/complaints", (req: Request, res: Response) => {
  db = loadDb();
  res.json(db.wasteComplaints || []);
});

app.post("/api/waste", (req: Request, res: Response) => {
  db = loadDb();
  const complaint = {
    id: `waste-${Date.now()}`,
    ...req.body,
    status: 'Registered',
    date: new Date().toISOString().split('T')[0],
    lat: 13.0827 + (Math.random() - 0.5) * 0.05,
    lng: 80.2707 + (Math.random() - 0.5) * 0.05,
  };
  db.wasteComplaints.unshift(complaint);
  saveDb(db);
  res.json({ success: true, complaint });
});

app.post("/api/waste/complaint", (req: Request, res: Response) => {
  db = loadDb();
  const complaint = {
    id: `waste-${Date.now()}`,
    ...req.body,
    status: 'Registered',
    date: new Date().toISOString().split('T')[0],
    lat: 13.0827 + (Math.random() - 0.5) * 0.05,
    lng: 80.2707 + (Math.random() - 0.5) * 0.05,
  };
  db.wasteComplaints.unshift(complaint);
  saveDb(db);
  res.json({ success: true, complaint });
});

app.post("/api/water/status", (req: Request, res: Response) => {
  const { id, status } = req.body;
  db = loadDb();
  db.waterComplaints = db.waterComplaints.map((c: any) => c.id === id ? { ...c, status } : c);
  saveDb(db);
  res.json({ success: true });
});

app.post("/api/waste/status", (req: Request, res: Response) => {
  const { id, status } = req.body;
  db = loadDb();
  db.wasteComplaints = db.wasteComplaints.map((c: any) => c.id === id ? { ...c, status } : c);
  saveDb(db);
  res.json({ success: true });
});

// Admin management routes
app.post("/api/admin/complaint/status", (req: Request, res: Response) => {
  const { id, type, status } = req.body;
  db = loadDb();
  if (type === 'water') {
    db.waterComplaints = db.waterComplaints.map((c: any) => c.id === id ? { ...c, status } : c);
  } else if (type === 'waste') {
    db.wasteComplaints = db.wasteComplaints.map((c: any) => c.id === id ? { ...c, status } : c);
  }
  saveDb(db);
  res.json({ success: true });
});

// Gemini AI Platform Chat Integration Endpoint
app.post("/api/ai/chat", async (req: Request, res: Response) => {
  const { message, context, modelType } = req.body;
  
  if (!message) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  // Pre-configured system instructions tailored to roles and requirements
  let systemInstruction = "You are the LifeConnect AI Assistant - a unified, premium digital assistance chatbot for the smart citizen platform. Respond professionally, with warm guidance. Keep formatting clean with standard Markdown.";
  
  if (modelType === 'crop-analytics') {
    systemInstruction = "You are an AI Agronomist and Crop Price Advisor. Provide smart weather-based agricultural recommendations, crop analysis, soil quality tips, and crop price estimations. Tell the user what prices are high in the market currently and what selection is optimal.";
  } else if (modelType === 'scheme-eligibility') {
    systemInstruction = "You are a Government Schemes Expert. Answer the citizen's query in English, Tamil or Hindi depending on what language they use. Recommend the exact schemes they might qualify for, explaining the benefits and criteria simply.";
  } else if (modelType === 'symptom-check') {
    systemInstruction = "You are an AI Health Counselor. Evaluate symptoms and recommend possible medical categories, specialties, or doctor visits. ALWAYS add a clear disclaimer: 'Not medical advice. Please consult Dr. Prasad or Dr. Meera at our Healthcare center for proper diagnosis.'";
  } else if (modelType === 'emergency-response') {
    systemInstruction = "You are an Emergency First-Aid Response Advisor. Under stressful situations, provide brief, high-impact, actionable instructions (e.g., CPR steps, fire containment, flood safety) while waiting for paramedics.";
  }

  // If Gemini client is active, perform a real query
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `${context ? `[Context Info: ${JSON.stringify(context)}] ` : ""}${message}`,
        config: {
          systemInstruction,
          temperature: 0.8,
        }
      });
      
      const responseText = response.text || "I was unable to construct a response. Please rephrase your query.";
      res.json({ text: responseText, success: true });
      return;
    } catch (e: any) {
      console.error("Gemini API error, falling back to mock agent:", e);
    }
  }

  // Smart Offline Intelligent Mock replies if API is absent or fails
  let mockReply = "";
  const lowercaseMsg = message.toLowerCase();

  if (modelType === 'crop-analytics' || lowercaseMsg.includes('farmer') || lowercaseMsg.includes('crop') || lowercaseMsg.includes('tomato') || lowercaseMsg.includes('rice')) {
    mockReply = `🌾 **LifeConnect AI Agronomist Report**

Based on our smart agriculture models:
- **Ponni Paddy Rice**: Current market price is stable at **₹50-52/kg**. Our model recommends listing above **₹54/kg** due to a projected 5% demand surge in city centres next week.
- **Native Country Tomatoes**: Demand is currently **High**. Due to light showers predicted in the Salem orchard belt over the next 3 days, harvesting should be completed by tomorrow morning to avoid rot. Sell now to leverage the peak price of **₹32/kg**.
- **Crop Health Tip**: For turmeric cultivation, maintain soil pH between 5.5 and 6.5. Ensure adequate organic mulch coverage.

*Note: Add your Gemini API key in the Secrets Panel to get live, real-time localized weather intelligence and AI-powered dynamic crop yield diagnostics!*`;
  } else if (modelType === 'scheme-eligibility' || lowercaseMsg.includes('scheme') || lowercaseMsg.includes('apply') || lowercaseMsg.includes('benefit') || lowercaseMsg.includes('pension')) {
    mockReply = `🏛️ **Government Welfare Advisor**

Here are the best matching schemes for you based on our smart classification engine:
1. **Amma Comprehensive Health Insurance Scheme**: Provides cashless coverage of up to **₹5 Lakhs/year** for major treatments. 
   - *Eligibility*: TN Resident with annual household income < ₹1,20,000.
2. **PM Kisan Samman Nidhi**: Income guarantee of **₹6,000/year** paid in 3 equal installments.
   - *Eligibility*: Small and marginal landholder families.
3. **Moovalur Ramamirtham Ammaiyar Pudhumaipenn Scheme**: Higher education monthly incentive of **₹1,000** for girl students studying in public colleges.

Would you like me to pre-fill the eligibility application form for you?`;
  } else if (modelType === 'symptom-check' || lowercaseMsg.includes('doctor') || lowercaseMsg.includes('cough') || lowercaseMsg.includes('pain') || lowercaseMsg.includes('fever')) {
    mockReply = `🩺 **Smart AI Health Evaluator**

Thank you for reporting your health query. Based on your description:
- **Potential Category**: Mild Respiratory infection or seasonal allergy.
- **Recommended Specialist**: General Physician or Pulmonologist.
- **Recommended Doctor**: We recommend booking a slot with **Dr. Rajesh Khanna** (General Physician, Rating 4.7) at Metro General Hospital on Monday or Wednesday.

**🚨 CRITICAL MEDICAL DISCLAIMER**: This assessment is automatically generated by our model for educational context. It is **NOT** a clinical diagnosis. For symptoms including chest pain, severe breathlessness, or persistent high fever, please immediately hit the red **SOS Button** on our sidebar or proceed directly to Metro General Hospital.`;
  } else if (lowercaseMsg.includes('emergency') || lowercaseMsg.includes('sos') || lowercaseMsg.includes('fire') || lowercaseMsg.includes('accident')) {
    mockReply = `🚨 **LifeConnect Emergency Coordinator**

Your emergency has been detected. 
1. **SOS Dispatch Status**: Police/Ambulance vehicles are being tracked in real-time.
2. **First-Aid Recommendation**:
   - Keep the patient calm and lying flat.
   - Do not offer food or water if surgery is anticipated.
   - Ensure a clean pathway for paramedics to enter.

Rescue teams have been alerted with your current GPS coordinates. Stay on the line.`;
  } else if (lowercaseMsg.includes('blood') || lowercaseMsg.includes('donor')) {
    mockReply = `🩸 **Blood Network AI Matching**

We detected a search for blood donors.
- **O+ Group**: 2 active donors matched in Adyar (Suresh Kumar, Distance: 1.2 km).
- **A- Group**: 1 active donor matched in Nungambakkam (Anjali Sharma, Distance: 4.5 km).
- **B+ Group**: 1 active donor matched in Velachery (Vikas Patel, Distance: 6.0 km).

You can instantly launch a public SOS alert broadcast to all matching donors via the **Blood Donor Network** tab on our platform. Let me know if you would like to initiate this broadcast.`;
  } else if (lowercaseMsg.includes('tamil') || lowercaseMsg.includes('தமிழ்')) {
    mockReply = `வணக்கம்! நான் லைஃப்கனெக்ட் AI உதவியாளர். 
அரசு திட்டங்கள், அவசர உதவிகள், மருத்துவ சந்திப்புகள் மற்றும் விவசாய விளைபொருட்களின் சந்தை நிலவரங்களை நீங்கள் இங்கு எளிதாக அறிந்து கொள்ளலாம். உங்களுக்கு என்ன உதவி தேவை?`;
  } else if (lowercaseMsg.includes('hindi') || lowercaseMsg.includes('नमस्ते')) {
    mockReply = `नमस्ते! मैं लाइफकनेक्ट एआई सहायक हूँ। 
मैं सरकारी योजनाओं, आपातकालीन सेवाओं, डॉक्टर नियुक्तियों और कृषि बाजारों के बारे में जानकारी प्रदान कर सकता हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?`;
  } else {
    mockReply = `👋 **Welcome to LifeConnect AI!**

I am your unified Citizen Assistance Platform Assistant. I have full cross-module context. Here is what I can help you with today:
1. 🩺 **Smart Healthcare**: Diagnose symptoms, suggest doctors, or review scheduled appointments.
2. 🌾 **Farmer Market**: Estimate crop market prices and query ideal crop rotation schedules.
3. 🏛️ **Government Services**: Check scheme eligibilities and track welfare certificate numbers.
4. 💧 **City Utility**: File water leakage complaints or trace trash collection routines.
5. 🚨 **Emergency**: Give quick life-saving instructions during emergency dispatcher delays.

*Pro-Tip: When you add your Google Gemini API key to the AI Studio Secrets panel, my intelligence will be fully powered by live Gemini 3.5 models!*`;
  }

  // Artificial slight delay for organic conversational feel
  setTimeout(() => {
    res.json({ text: mockReply, success: true });
  }, 600);
});

// Serve Vite dev server or static build
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const httpServer = createHttpServer(app);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    
    socket.on("join", (userId) => {
      socket.join(userId);
    });

    socket.on("call-user", (data) => {
      socket.to(data.userToCall).emit("incoming-call", {
        signal: data.signalData,
        from: data.from,
        name: data.name
      });
    });

    socket.on("answer-call", (data) => {
      socket.to(data.to).emit("call-accepted", data.signal);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[LifeConnect Server] Running full-stack on http://0.0.0.0:${PORT}`);
  });
}

startServer();
