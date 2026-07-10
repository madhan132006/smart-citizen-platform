import { 
  Hospital, Doctor, GovtScheme, BusRoute, BloodDonor, 
  BloodRequest, FoodDonation, FarmProduct, WaterComplaint, 
  WasteComplaint, EmergencyRequest, Appointment 
} from '../types';

export const mockHospitals: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'Metro General Hospital & Trauma Centre',
    address: '12, Cathedral Road, Chennai, Tamil Nadu',
    phone: '+91 44 2811 0000',
    lat: 13.0441,
    lng: 80.2504,
    beds: 142,
    ventilators: 35,
    icuAvailable: true,
  },
  {
    id: 'hosp-2',
    name: 'Apollo Speciality Hospital',
    address: '21, Greams Lane, Thousand Lights, Chennai',
    phone: '+91 44 2829 0200',
    lat: 13.0602,
    lng: 80.2514,
    beds: 85,
    ventilators: 18,
    icuAvailable: true,
  },
  {
    id: 'hosp-3',
    name: 'Fortis Malar Hospital',
    address: '52, First Main Road, Gandhi Nagar, Adyar, Chennai',
    phone: '+91 44 4242 4242',
    lat: 13.0064,
    lng: 80.2577,
    beds: 60,
    ventilators: 8,
    icuAvailable: false,
  },
  {
    id: 'hosp-4',
    name: 'Government General Hospital (RGGGH)',
    address: 'EVR Periyar Salai, Park Town, Chennai',
    phone: '+91 44 2530 5000',
    lat: 13.0818,
    lng: 80.2748,
    beds: 550,
    ventilators: 120,
    icuAvailable: true,
  }
];

export const mockDoctors: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Arul Prasad',
    specialty: 'Cardiologist',
    hospitalId: 'hosp-1',
    hospitalName: 'Metro General Hospital',
    rating: 4.9,
    availability: ['Mon', 'Wed', 'Fri'],
    phone: '+91 98401 23456',
    fee: 600,
  },
  {
    id: 'doc-2',
    name: 'Dr. Meera Krishnan',
    specialty: 'Pediatrician',
    hospitalId: 'hosp-2',
    hospitalName: 'Apollo Speciality Hospital',
    rating: 4.8,
    availability: ['Mon', 'Tue', 'Thu', 'Sat'],
    phone: '+91 98402 34567',
    fee: 500,
  },
  {
    id: 'doc-3',
    name: 'Dr. Rajesh Khanna',
    specialty: 'General Physician',
    hospitalId: 'hosp-1',
    hospitalName: 'Metro General Hospital',
    rating: 4.7,
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    phone: '+91 98403 45678',
    fee: 400,
  },
  {
    id: 'doc-4',
    name: 'Dr. Sarah Mathews',
    specialty: 'Dermatologist',
    hospitalId: 'hosp-3',
    hospitalName: 'Fortis Malar Hospital',
    rating: 4.6,
    availability: ['Tue', 'Thu'],
    phone: '+91 98404 56789',
    fee: 700,
  },
  {
    id: 'doc-5',
    name: 'Dr. Vignesh Kumar',
    specialty: 'Orthopedician',
    hospitalId: 'hosp-4',
    hospitalName: 'Government General Hospital (RGGGH)',
    rating: 4.8,
    availability: ['Wed', 'Thu', 'Fri'],
    phone: '+91 98405 67890',
    fee: 0, // Free Govt service
  }
];

export const mockGovtSchemes: GovtScheme[] = [
  {
    id: 'scheme-1',
    title: 'Amma Comprehensive Health Insurance Scheme',
    category: 'Healthcare',
    description: 'Provides cashless healthcare protection of up to ₹5 Lakhs per family per year for designated treatments and surgeries in enrolled public/private hospitals.',
    eligibility: 'Resident of Tamil Nadu, annual income less than ₹1,20,000.',
    benefit: 'Cashless treatment up to ₹5,00,000 per annum.',
    status: 'Active',
    appliedCount: 1420
  },
  {
    id: 'scheme-2',
    title: 'PM Kisan Samman Nidhi',
    category: 'Agriculture',
    description: 'An initiative by the government of India that guarantees all small and marginal farmers an income support of ₹6,000 per year in three installments.',
    eligibility: 'All land-holding small and marginal farmer families across the country.',
    benefit: '₹6,000 cash transfer directly to bank account annually.',
    status: 'Active',
    appliedCount: 890
  },
  {
    id: 'scheme-3',
    title: 'Moovalur Ramamirtham Ammaiyar Higher Education Assurance Scheme',
    category: 'Education',
    description: 'Pudhumaipenn Scheme provides financial assistance of ₹1,000 per month for girls who studied in government schools from Classes 6 to 12 to pursue higher education.',
    eligibility: 'Female students who completed schooling in Govt schools and enrolled in higher degree/diploma courses.',
    benefit: '₹1,000 per month directly deposited to bank account until course completion.',
    status: 'Active',
    appliedCount: 2310
  },
  {
    id: 'scheme-4',
    title: 'Indira Gandhi National Old Age Pension Scheme',
    category: 'Pension',
    description: 'Provides monthly social security pension to senior citizens belonging to below-poverty-line (BPL) households.',
    eligibility: 'Citizens aged 60 years and above belonging to BPL households.',
    benefit: '₹1,000 to ₹1,500 per month depending on age.',
    status: 'Active',
    appliedCount: 650
  },
  {
    id: 'scheme-5',
    title: 'Pradhan Mantri Awas Yojana (Gramin)',
    category: 'Housing',
    description: 'Financial assistance is provided to homeless households and households living in dilapidated houses to construct a pucca house with basic amenities.',
    eligibility: 'Homeless, households living in zero, one or two-room houses with kucha walls/roof.',
    benefit: 'Assistance of ₹1.2 Lakh in plains and ₹1.3 Lakh in hilly areas plus toilet construction support.',
    status: 'Active',
    appliedCount: 310
  }
];

export const mockBusRoutes: BusRoute[] = [
  {
    id: 'bus-1',
    routeNumber: '102X',
    start: 'Broadway',
    end: 'Kelambakkam',
    fare: 45,
    stops: ['Broadway', 'Central Station', 'Adyar', 'Sholinganallur', 'Kelambakkam'],
    timing: '5:00 AM - 10:30 PM (Every 15 mins)',
    activeBuses: 12
  },
  {
    id: 'bus-2',
    routeNumber: '21G',
    start: 'Broadway',
    end: 'Tambaram',
    fare: 35,
    stops: ['Broadway', 'Mylapore', 'Guindy', 'Chromepet', 'Tambaram'],
    timing: '4:30 AM - 11:00 PM (Every 10 mins)',
    activeBuses: 18
  },
  {
    id: 'bus-3',
    routeNumber: '570',
    start: 'CMBT (Koyambedu)',
    end: 'Siruseri IT Park',
    fare: 50,
    stops: ['Koyambedu', 'Vadapalani', 'Guindy', 'Velachery', 'Siruseri'],
    timing: '6:00 AM - 10:00 PM (Every 20 mins)',
    activeBuses: 8
  },
  {
    id: 'bus-4',
    routeNumber: 'A1',
    start: 'Central Railway Station',
    end: 'Thiruvanmiyur',
    fare: 25,
    stops: ['Central', 'Marina Beach', 'Mylapore', 'Besant Nagar', 'Thiruvanmiyur'],
    timing: '24 Hours (Night service every 40 mins)',
    activeBuses: 6
  }
];

export const mockBloodDonors: BloodDonor[] = [
  {
    id: 'donor-1',
    name: 'Suresh Kumar',
    bloodGroup: 'O+',
    age: 29,
    phone: '+91 99401 11223',
    address: 'Adyar, Chennai',
    lat: 13.0064,
    lng: 80.2577,
    lastDonationDate: '2026-03-15',
    status: 'Available'
  },
  {
    id: 'donor-2',
    name: 'Anjali Sharma',
    bloodGroup: 'A-',
    age: 24,
    phone: '+91 99402 22334',
    address: 'Nungambakkam, Chennai',
    lat: 13.0608,
    lng: 80.2378,
    lastDonationDate: '2025-12-01',
    status: 'Available'
  },
  {
    id: 'donor-3',
    name: 'Vikas Patel',
    bloodGroup: 'B+',
    age: 33,
    phone: '+91 99403 33445',
    address: 'Velachery, Chennai',
    lat: 12.9801,
    lng: 80.2228,
    lastDonationDate: '2026-05-10',
    status: 'Available'
  },
  {
    id: 'donor-4',
    name: 'Mohamed Rizwan',
    bloodGroup: 'AB+',
    age: 28,
    phone: '+91 99404 44556',
    address: 'Triplicane, Chennai',
    lat: 13.0587,
    lng: 80.2753,
    lastDonationDate: '2026-01-20',
    status: 'Available'
  },
  {
    id: 'donor-5',
    name: 'Sneha Reddy',
    bloodGroup: 'O-',
    age: 26,
    phone: '+91 99405 55667',
    address: 'T-Nagar, Chennai',
    lat: 13.0418,
    lng: 80.2341,
    lastDonationDate: undefined,
    status: 'Available'
  }
];

export const mockBloodRequests: BloodRequest[] = [
  {
    id: 'breq-1',
    hospitalName: 'Metro General Hospital',
    bloodGroup: 'O-',
    units: 3,
    requiredBy: 'Immediate / Bypass Surgery',
    contactName: 'Staff Nurse Mercy',
    phone: '+91 44 2811 0002',
    status: 'Emergency'
  },
  {
    id: 'breq-2',
    hospitalName: 'Apollo Speciality Hospital',
    bloodGroup: 'B+',
    units: 2,
    requiredBy: 'Within 24 Hours / Leukemia Therapy',
    contactName: 'Ramesh (Relation)',
    phone: '+91 98409 99887',
    status: 'Pending'
  },
  {
    id: 'breq-3',
    hospitalName: 'Fortis Malar Hospital',
    bloodGroup: 'AB-',
    units: 1,
    requiredBy: '2026-07-10',
    contactName: 'Dr. Subramanian',
    phone: '+91 44 4242 4255',
    status: 'Fulfilled'
  }
];

export const mockFoodDonations: FoodDonation[] = [
  {
    id: 'food-1',
    restaurantName: 'Sangeetha Vegetarian Restaurant',
    foodType: 'Meals (Sambar Rice, Curd Rice)',
    quantity: '30 Servings',
    expiryTime: 'Within 3 Hours',
    address: 'Adyar Gate Road, Alwarpet, Chennai',
    status: 'Available',
    qrCode: 'QR_FOOD_1001',
    timestamp: '2026-07-08T11:30:00'
  },
  {
    id: 'food-2',
    restaurantName: 'Thalappakatti Biryani',
    foodType: 'Chicken Biryani & Raitha',
    quantity: '50 Servings',
    expiryTime: 'Within 4 Hours',
    address: 'G.N. Chetty Road, T-Nagar, Chennai',
    status: 'Assigned',
    volunteerName: 'Dinesh Karthik',
    volunteerPhone: '+91 98111 22233',
    qrCode: 'QR_FOOD_1002',
    timestamp: '2026-07-08T12:00:00'
  },
  {
    id: 'food-3',
    restaurantName: 'A2B - Adyar Ananda Bhavan',
    foodType: 'Mixed Idli & Pongal Packets',
    quantity: '25 Servings',
    expiryTime: 'Within 2 Hours',
    address: 'Mylapore, Chennai',
    status: 'Delivered',
    volunteerName: 'Priya Mani',
    volunteerPhone: '+91 98222 33344',
    qrCode: 'QR_FOOD_1003',
    timestamp: '2026-07-08T09:00:00'
  }
];

export const mockFarmProducts: FarmProduct[] = [
  {
    id: 'farm-1',
    farmerId: 'farm-user-1',
    farmerName: 'Ranganathan Pillai',
    farmerPhone: '+91 97501 23456',
    name: 'Organic Ponni Paddy Rice',
    category: 'Grains',
    price: 52,
    quantity: 1200,
    description: 'Premium quality organic Ponni paddy, harvested using bio-fertilizers. Fine grains, aged for 1 year.',
    recommendedPrice: 54,
    marketPrice: 50,
    demandScore: 'High',
    timestamp: '2026-07-07T14:30:00'
  },
  {
    id: 'farm-2',
    farmerId: 'farm-user-1',
    farmerName: 'Ranganathan Pillai',
    farmerPhone: '+91 97501 23456',
    name: 'Fresh Native Tomatoes',
    category: 'Vegetables',
    price: 28,
    quantity: 350,
    description: 'Farm-fresh native country tomatoes, juicy and rich in flavor. Directly plucked from fields in Salem.',
    recommendedPrice: 32,
    marketPrice: 30,
    demandScore: 'High',
    timestamp: '2026-07-08T06:00:00'
  },
  {
    id: 'farm-3',
    farmerId: 'farm-user-2',
    farmerName: 'Balasubramaniam M.',
    farmerPhone: '+91 97502 34567',
    name: 'Alphonso Mangoes (Export Quality)',
    category: 'Fruits',
    price: 180,
    quantity: 150,
    description: 'Sweet and aromatic organic Alphonso mangoes from local orchards. Chemical-free ripening process.',
    recommendedPrice: 195,
    marketPrice: 175,
    demandScore: 'Moderate',
    timestamp: '2026-07-08T08:15:00'
  },
  {
    id: 'farm-4',
    farmerId: 'farm-user-3',
    farmerName: 'Selvi Karuppasamy',
    farmerPhone: '+91 97503 45678',
    name: 'Pure Hill Turmeric Powder',
    category: 'Spices',
    price: 240,
    quantity: 80,
    description: 'Grown on hill slopes of Kolli Hills. High curcumin content, hand-pounded and double-sieved.',
    recommendedPrice: 260,
    marketPrice: 250,
    demandScore: 'Moderate',
    timestamp: '2026-07-06T11:00:00'
  }
];

export const mockWaterComplaints: WaterComplaint[] = [
  {
    id: 'water-1',
    citizenName: 'Ramachandran N.',
    phone: '+91 94441 55667',
    type: 'Leakage',
    description: 'Main underground pipe ruptured near Metro water pump, huge amount of drinking water wasted on road.',
    address: '4th Avenue, Shanti Colony, Anna Nagar, Chennai',
    lat: 13.0850,
    lng: 80.2101,
    status: 'In Progress',
    priority: 'High',
    date: '2026-07-07'
  },
  {
    id: 'water-2',
    citizenName: 'Deepa Rajan',
    phone: '+91 94442 66778',
    type: 'Contaminated Water',
    description: 'Sewage water odor and dark yellowish color detected in public tap lines. Unfit for household use.',
    address: 'Kamaraj Salai, Triplicane, Chennai',
    lat: 13.0520,
    lng: 80.2780,
    status: 'Registered',
    priority: 'High',
    date: '2026-07-08'
  },
  {
    id: 'water-3',
    citizenName: 'Vinoth Kumar',
    phone: '+91 94443 77889',
    type: 'No Supply',
    description: 'No supply of water for the last 4 consecutive days. Requesting immediate water tanker assistance.',
    address: '2nd Street, Velachery, Chennai',
    lat: 12.9789,
    lng: 80.2215,
    status: 'Resolved',
    priority: 'Medium',
    date: '2026-07-05'
  }
];

export const mockWasteComplaints: WasteComplaint[] = [
  {
    id: 'waste-1',
    citizenName: 'Karthik Raja',
    phone: '+91 95001 88990',
    type: 'Garbage Accumulation',
    description: 'Municipal trash bins overflowing on the main street for 3 days. Foul smell and stray dogs surrounding it.',
    address: 'South Usman Road, T-Nagar, Chennai',
    lat: 13.0312,
    lng: 80.2335,
    status: 'In Progress',
    priority: 'Medium',
    date: '2026-07-07'
  },
  {
    id: 'waste-2',
    citizenName: 'Srimathi S.',
    phone: '+91 95002 99001',
    type: 'Illegal Dumping',
    description: 'Construction debris and plastic sacks dumped illegally during midnight by commercial contractors near public park.',
    address: '1st Cross Road, Besant Nagar, Chennai',
    lat: 13.0012,
    lng: 80.2685,
    status: 'Registered',
    priority: 'High',
    date: '2026-07-08'
  }
];

export const mockEmergencyRequests: EmergencyRequest[] = [
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
];

export const mockAppointments: Appointment[] = [
  {
    id: 'appt-1',
    citizenId: 'cit-101',
    citizenName: 'Santhosh Kumar',
    doctorId: 'doc-1',
    doctorName: 'Dr. Arul Prasad',
    hospitalName: 'Metro General Hospital & Trauma Centre',
    date: '2026-07-10',
    time: '10:30 AM',
    reason: 'Monthly cardiovascular checkup and ECG reading.',
    status: 'Approved'
  }
];
