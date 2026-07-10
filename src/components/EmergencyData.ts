import { EmergencyRequest } from '../types';

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
  ambulanceCount: number;
  activeAmbulances: number;
}

export interface Ambulance {
  id: string;
  type: 'ALS' | 'BLS' | 'Neonatal';
  hospitalName: string;
  driverName: string;
  phone: string;
  status: 'In Route' | 'At Hospital' | 'Available' | 'Maintenance';
  fuel: number;
  lat: number;
  lng: number;
  activeIncidentId: string | null;
  eta: number;
  progress: number;
}

export interface PoliceTeam {
  id: string;
  precinct: string;
  status: 'On Patrol' | 'Responding' | 'At Scene' | 'Off Duty';
  location: string;
  officersCount: number;
  vehicle: string;
  radioChannel: string;
  activeIncidentId: string | null;
}

export interface FireStation {
  id: string;
  name: string;
  address: string;
  trucks: number;
  crewSize: number;
  waterCapacity: number; // in Liters
  status: 'Ready' | 'Active Deployment';
  phone: string;
}

export interface DisasterTeam {
  id: string;
  name: string;
  region: string;
  specialization: string;
  active: boolean;
  size: number;
  phone: string;
}

export interface BloodBank {
  id: string;
  name: string;
  address: string;
  phone: string;
  inventory: Record<string, number>;
  totalUnits: number;
}

export interface VolunteerTeam {
  id: string;
  name: string;
  location: string;
  volunteersCount: number;
  assignment: string;
  phone: string;
}

export interface EmergencyNotification {
  id: string;
  title: string;
  message: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  read: boolean;
  timestamp: string;
  location?: string;
}

export interface HistoryRecord {
  id: string;
  type: string;
  location: string;
  date: string;
  dispatcher: string;
  outcome: string;
  notes: string;
}

export interface Shelter {
  id: string;
  name: string;
  address: string;
  capacity: number;
  occupancy: number;
  resources: string;
  distance: string;
}

export const INITIAL_EMERGENCIES: EmergencyRequest[] = [
  { id: 'SOS-001', citizenName: 'Srinivasan Raman', phone: '+91 94440 21201', type: 'Ambulance', description: 'Acute myocardial infarction (Cardiac Arrest) reported at block 4 office lobby.', lat: 12.9649, lng: 80.2452, address: 'Block 4, RMZ Millenia IT Park, Kandanchavadi', status: 'Requested', priority: 'Critical', timestamp: '2026-07-08T10:15:00Z' },
  { id: 'SOS-002', citizenName: 'Anjali Sharma', phone: '+91 98402 33412', type: 'Fire', description: 'Electrical transformer blowout with heavy sparks spreading to dry canopy.', lat: 13.0063, lng: 80.2206, address: '32 Gandhi Nagar Main Road, Adyar', status: 'Dispatched', priority: 'Critical', timestamp: '2026-07-08T09:58:00Z' },
  { id: 'SOS-003', citizenName: 'Karthik Raja', phone: '+91 95400 11982', type: 'Police', description: 'Armed store trespass and burglary attempt with structural security alarm lock down.', lat: 13.0405, lng: 80.2337, address: '104 Pondy Bazaar Market Street, T-Nagar', status: 'Requested', priority: 'High', timestamp: '2026-07-08T10:24:00Z' },
  { id: 'SOS-004', citizenName: 'Meera Nair', phone: '+91 81220 55678', type: 'Disaster', description: 'Severe coastal water logging with 3 feet water trapping 12 families inside ground floors.', lat: 13.0911, lng: 80.2904, address: 'Royapuram Fishing Harbour Colony, North Chennai', status: 'Dispatched', priority: 'High', timestamp: '2026-07-08T09:30:00Z' },
  { id: 'SOS-005', citizenName: 'Ramesh Kumar', phone: '+91 90031 44521', type: 'Ambulance', description: 'Severe trauma head injury following high-speed scooter skid on slippery flyover.', lat: 12.9815, lng: 80.2578, address: 'Tidel Park Junction Flyover, OMR Highway', status: 'Resolved', priority: 'Critical', timestamp: '2026-07-08T08:15:00Z' },
  { id: 'SOS-006', citizenName: 'Deepak Krishnan', phone: '+91 94451 22345', type: 'Fire', description: 'Kitchen cylinder gas regulator leakage and fire flare-up with massive toxic smoke.', lat: 13.0284, lng: 80.2455, address: 'Siddharth Castle Apartments, Mylapore', status: 'Resolved', priority: 'High', timestamp: '2026-07-08T07:45:00Z' },
  { id: 'SOS-007', citizenName: 'Priya Sundaram', phone: '+91 91760 88990', type: 'Police', description: 'Residential perimeter breach with backyard sensor warning showing armed intruder.', lat: 12.9234, lng: 80.1402, address: '55 Rajaji Nagar, Tambaram West', status: 'Resolved', priority: 'Medium', timestamp: '2026-07-08T06:12:00Z' },
  { id: 'SOS-008', citizenName: 'Selvaraj M', phone: '+91 96001 55662', type: 'Disaster', description: 'Chemical container leak at logistics park causing strong gas inhalation symptoms.', lat: 13.1421, lng: 80.1805, address: 'Ambattur Industrial Estate Phase II', status: 'Dispatched', priority: 'Critical', timestamp: '2026-07-08T10:05:00Z' },
  { id: 'SOS-009', citizenName: 'Leela Prasad', phone: '+91 89391 77881', type: 'Ambulance', description: 'High-risk maternity labor complication with heavy contractions and severe bleeding.', lat: 13.0645, lng: 80.2001, address: '23 Veeranam Street, Koyambedu', status: 'Requested', priority: 'High', timestamp: '2026-07-08T10:26:00Z' },
  { id: 'SOS-010', citizenName: 'Vignesh Kumar', phone: '+91 94444 33221', type: 'Fire', description: 'Garbage dumpster arson and dry grass burning spreading dangerously near power sub-station.', lat: 12.8911, lng: 80.2289, address: 'Sholinganallur Junction, OMR Highway', status: 'Requested', priority: 'Low', timestamp: '2026-07-08T10:20:00Z' },
  { id: 'SOS-011', citizenName: 'Arun Mozhi', phone: '+91 91500 66778', type: 'Police', description: 'Traffic clash escalating into physical assault and vehicle destruction blocking highway.', lat: 13.0722, lng: 80.2588, address: 'Egmore High Road, Near Railway Station', status: 'Dispatched', priority: 'Medium', timestamp: '2026-07-08T10:10:00Z' },
  { id: 'SOS-012', citizenName: 'Stella Mary', phone: '+91 98409 11223', type: 'Disaster', description: 'Storm tree collapse crushing major distribution pole and entrapment of active delivery rider.', lat: 13.0112, lng: 80.2015, address: 'Guindy National Park West Avenue', status: 'Dispatched', priority: 'High', timestamp: '2026-07-08T09:40:00Z' },
  { id: 'SOS-013', citizenName: 'Ganesh Hegde', phone: '+91 90040 12349', type: 'Ambulance', description: 'Accidental drowning in private swimming club, victim unconscious, manual CPR on progress.', lat: 12.9556, lng: 80.2441, address: 'Kottivakkam Beach Road Villas', status: 'Resolved', priority: 'Critical', timestamp: '2026-07-08T05:30:00Z' },
  { id: 'SOS-014', citizenName: 'Shanthi Ramesh', phone: '+91 91711 22334', type: 'Fire', description: 'IT server basement air conditioning burst with thick battery insulation fire.', lat: 13.0301, lng: 80.2115, address: 'DLF IT Park Block-3, Ramapuram', status: 'Dispatched', priority: 'Critical', timestamp: '2026-07-08T10:02:00Z' },
  { id: 'SOS-015', citizenName: 'Abishek R', phone: '+91 94441 55667', type: 'Police', description: 'Reckless trucker hitting multiple parked vehicles and escaping towards highway entry.', lat: 13.1115, lng: 80.1255, address: 'Madhavaram Bypass Flyover Junction', status: 'Requested', priority: 'Medium', timestamp: '2026-07-08T10:23:00Z' },
  { id: 'SOS-016', citizenName: 'Fatima Bi', phone: '+91 98411 55443', type: 'Disaster', description: 'Severe sewage line backup and water flooding inside ground floor of pediatric clinic.', lat: 13.0015, lng: 80.2522, address: 'Kotturpuram Canal Bank Road', status: 'Requested', priority: 'High', timestamp: '2026-07-08T10:18:00Z' },
  { id: 'SOS-017', citizenName: 'Suresh Raina', phone: '+91 94450 99887', type: 'Ambulance', description: 'Senior citizen diabetic shock with severe respiratory distress and blood oxygen dropping.', lat: 12.9112, lng: 80.1802, address: '67 Chromepet G.S.T. Road Corner', status: 'Requested', priority: 'High', timestamp: '2026-07-08T10:25:00Z' },
  { id: 'SOS-018', citizenName: 'John Devanand', phone: '+91 95000 33445', type: 'Fire', description: 'Spontaneous combustion in lumber yard logistics shed with no fire extinguishers nearby.', lat: 13.1812, lng: 80.2912, address: 'Ennore Port Cargo Holding Area', status: 'Resolved', priority: 'Low', timestamp: '2026-07-08T03:15:00Z' },
  { id: 'SOS-019', citizenName: 'Hema Malini', phone: '+91 98844 11221', type: 'Police', description: 'Commercial sector robbery suspect fleeing on sports motorcycle towards suburban exit.', lat: 13.0815, lng: 80.2112, address: 'Anna Nagar Tower Park Commercial Strip', status: 'Resolved', priority: 'Medium', timestamp: '2026-07-08T02:00:00Z' },
  { id: 'SOS-020', citizenName: 'Nithya Sri', phone: '+91 91501 22339', type: 'Disaster', description: 'Underground residential pipeline rupture with minor toxic fumes venting on basement floors.', lat: 13.0556, lng: 80.2644, address: 'Triplicane High Road Area, Near Mosque', status: 'Dispatched', priority: 'High', timestamp: '2026-07-08T09:48:00Z' }
];

export const INITIAL_HOSPITALS: Hospital[] = [
  { id: 'HOSP-001', name: 'Apollo Greams Road Emergency', address: '21 Greams Lane, Thousand Lights, Chennai', phone: '+91 44 2829 0200', lat: 13.0605, lng: 80.2515, beds: 24, ventilators: 8, icuAvailable: true, ambulanceCount: 5, activeAmbulances: 3 },
  { id: 'HOSP-002', name: 'Fortis Malar Trauma Center', address: '52 First Main Rd, Gandhi Nagar, Adyar', phone: '+91 44 4242 4242', lat: 13.0064, lng: 80.2577, beds: 18, ventilators: 4, icuAvailable: true, ambulanceCount: 3, activeAmbulances: 2 },
  { id: 'HOSP-003', name: 'Gleneagles Global Health City', address: '439 Cheran Nagar, Perumbakkam', phone: '+91 44 2277 8100', lat: 12.9115, lng: 80.2105, beds: 42, ventilators: 12, icuAvailable: true, ambulanceCount: 6, activeAmbulances: 4 },
  { id: 'HOSP-004', name: 'MIOT International Trauma', address: '125 Mount Poonamallee Rd, Manapakkam', phone: '+91 44 4200 2288', lat: 13.0215, lng: 80.1802, beds: 35, ventilators: 10, icuAvailable: true, ambulanceCount: 5, activeAmbulances: 2 },
  { id: 'HOSP-005', name: 'SRMC Medical Command Center', address: 'Porur Campus, Chennai', phone: '+91 44 2476 8027', lat: 13.0375, lng: 80.1425, beds: 30, ventilators: 9, icuAvailable: true, ambulanceCount: 4, activeAmbulances: 3 },
  { id: 'HOSP-006', name: 'Kauvery Hospital Emergency', address: '199 Luz Church Rd, Mylapore', phone: '+91 44 4000 6000', lat: 13.0285, lng: 80.2605, beds: 15, ventilators: 3, icuAvailable: false, ambulanceCount: 2, activeAmbulances: 1 },
  { id: 'HOSP-007', name: 'SIMS Hospital Vadapalani', address: '1 Jawaharlal Nehru Rd, Vadapalani', phone: '+91 44 2000 3000', lat: 13.0505, lng: 80.2102, beds: 28, ventilators: 7, icuAvailable: true, ambulanceCount: 4, activeAmbulances: 2 },
  { id: 'HOSP-008', name: 'MGM Healthcare Trauma Hub', address: '72 Nelson Manickam Rd, Aminjikarai', phone: '+91 44 4524 2424', lat: 13.0725, lng: 80.2315, beds: 20, ventilators: 6, icuAvailable: true, ambulanceCount: 3, activeAmbulances: 1 },
  { id: 'HOSP-009', name: 'Tamil Nadu Govt General Hospital', address: 'RGGGH, EVR Periyar Salai, Park Town', phone: '+91 44 2530 5000', lat: 13.0815, lng: 80.2785, beds: 120, ventilators: 35, icuAvailable: true, ambulanceCount: 12, activeAmbulances: 8 },
  { id: 'HOSP-010', name: 'Stanley Medical College Hub', address: 'Stanley Hospital, Old Jail Rd, Royapuram', phone: '+91 44 2528 1351', lat: 13.1112, lng: 80.2915, beds: 80, ventilators: 20, icuAvailable: true, ambulanceCount: 8, activeAmbulances: 5 }
];

export const INITIAL_AMBULANCES: Ambulance[] = [
  { id: 'AMB-001', type: 'ALS', hospitalName: 'Apollo Greams Road Emergency', driverName: 'Rajesh Gowda', phone: '+91 94441 12301', status: 'In Route', fuel: 92, lat: 12.9649, lng: 80.2452, activeIncidentId: 'SOS-001', eta: 5, progress: 65 },
  { id: 'AMB-002', type: 'BLS', hospitalName: 'Fortis Malar Trauma Center', driverName: 'Karan Singh', phone: '+91 94441 12302', status: 'In Route', fuel: 78, lat: 13.0063, lng: 80.2206, activeIncidentId: 'SOS-002', eta: 8, progress: 45 },
  { id: 'AMB-003', type: 'Neonatal', hospitalName: 'Gleneagles Global Health City', driverName: 'Siva Kumar', phone: '+91 94441 12303', status: 'Available', fuel: 98, lat: 12.9112, lng: 80.1802, activeIncidentId: null, eta: 0, progress: 0 },
  { id: 'AMB-004', type: 'ALS', hospitalName: 'MIOT International Trauma', driverName: 'Ramanan M', phone: '+91 94441 12304', status: 'In Route', fuel: 64, lat: 12.9815, lng: 80.2578, activeIncidentId: 'SOS-005', eta: 3, progress: 85 },
  { id: 'AMB-005', type: 'BLS', hospitalName: 'SRMC Medical Command Center', driverName: 'Vijay Dev', phone: '+91 94441 12305', status: 'Available', fuel: 85, lat: 13.0301, lng: 80.2115, activeIncidentId: null, eta: 0, progress: 0 },
  { id: 'AMB-006', type: 'ALS', hospitalName: 'Kauvery Hospital Emergency', driverName: 'Amir Basha', phone: '+91 94441 12306', status: 'At Hospital', fuel: 55, lat: 13.0284, lng: 80.2455, activeIncidentId: null, eta: 0, progress: 0 },
  { id: 'AMB-007', type: 'BLS', hospitalName: 'SIMS Hospital Vadapalani', driverName: 'Dhanush R', phone: '+91 94441 12307', status: 'Available', fuel: 72, lat: 13.0645, lng: 80.2001, activeIncidentId: null, eta: 0, progress: 0 },
  { id: 'AMB-008', type: 'ALS', hospitalName: 'MGM Healthcare Trauma Hub', driverName: 'Vasanth K', phone: '+91 94441 12308', status: 'Maintenance', fuel: 12, lat: 13.0722, lng: 80.2588, activeIncidentId: null, eta: 0, progress: 0 },
  { id: 'AMB-009', type: 'ALS', hospitalName: 'Tamil Nadu Govt General Hospital', driverName: 'Nagarajan S', phone: '+91 94441 12309', status: 'In Route', fuel: 80, lat: 13.0911, lng: 80.2904, activeIncidentId: 'SOS-004', eta: 12, progress: 30 },
  { id: 'AMB-010', type: 'BLS', hospitalName: 'Stanley Medical College Hub', driverName: 'Hasan Ali', phone: '+91 94441 12310', status: 'Available', fuel: 90, lat: 13.1421, lng: 80.1805, activeIncidentId: null, eta: 0, progress: 0 },
  { id: 'AMB-011', type: 'ALS', hospitalName: 'Apollo Greams Road Emergency', driverName: 'Venkatesh S', phone: '+91 94441 12311', status: 'Available', fuel: 91, lat: 13.0645, lng: 80.2001, activeIncidentId: null, eta: 0, progress: 0 },
  { id: 'AMB-012', type: 'ALS', hospitalName: 'Fortis Malar Trauma Center', driverName: 'Saravanan T', phone: '+91 94441 12312', status: 'Available', fuel: 83, lat: 13.0063, lng: 80.2206, activeIncidentId: null, eta: 0, progress: 0 },
  { id: 'AMB-013', type: 'BLS', hospitalName: 'Gleneagles Global Health City', driverName: 'Moorthy G', phone: '+91 94441 12313', status: 'Available', fuel: 76, lat: 12.9112, lng: 80.1802, activeIncidentId: null, eta: 0, progress: 0 },
  { id: 'AMB-014', type: 'ALS', hospitalName: 'MIOT International Trauma', driverName: 'Ganesh Kumar', phone: '+91 94441 12314', status: 'Available', fuel: 88, lat: 12.9815, lng: 80.2578, activeIncidentId: null, eta: 0, progress: 0 },
  { id: 'AMB-015', type: 'Neonatal', hospitalName: 'Tamil Nadu Govt General Hospital', driverName: 'Kuberan P', phone: '+91 94441 12315', status: 'Available', fuel: 95, lat: 13.0911, lng: 80.2904, activeIncidentId: null, eta: 0, progress: 0 }
];

export const INITIAL_POLICE: PoliceTeam[] = [
  { id: 'POL-001', precinct: 'J-3 Guindy Precinct', status: 'Responding', location: 'Guindy Overpass Road', officersCount: 6, vehicle: 'SUV Cruiser', radioChannel: 'GRID-12', activeIncidentId: 'SOS-012' },
  { id: 'POL-002', precinct: 'E-1 Mylapore Division', status: 'Responding', location: 'Siddharth Castle Apts', officersCount: 4, vehicle: 'Sedan Cruiser', radioChannel: 'AIR-COM-09', activeIncidentId: 'SOS-006' },
  { id: 'POL-003', precinct: 'G-2 Anna Nagar Division', status: 'On Patrol', location: 'Anna Nagar Tower Park Area', officersCount: 4, vehicle: 'Interceptor', radioChannel: 'GRID-04', activeIncidentId: null },
  { id: 'POL-004', precinct: 'K-4 Koyambedu Traffic Control', status: 'At Scene', location: 'Koyambedu Bus Terminus', officersCount: 8, vehicle: 'SUV Tactical', radioChannel: 'GRID-15', activeIncidentId: 'SOS-009' },
  { id: 'POL-005', precinct: 'D-6 Triplicane Precinct', status: 'On Patrol', location: 'Marina Beach Promenade Road', officersCount: 5, vehicle: 'Sedan Cruiser', radioChannel: 'GRID-18', activeIncidentId: null },
  { id: 'POL-006', precinct: 'H-4 Royapuram Division', status: 'Responding', location: 'Royapuram Fishing Harbour', officersCount: 6, vehicle: 'SUV Cruiser', radioChannel: 'AIR-COM-22', activeIncidentId: 'SOS-004' },
  { id: 'POL-007', precinct: 'F-3 Nungambakkam Station', status: 'On Patrol', location: 'Khader Nawaz Khan Rd', officersCount: 4, vehicle: 'Sedan Cruiser', radioChannel: 'GRID-08', activeIncidentId: null },
  { id: 'POL-008', precinct: 'S-15 Tambaram Division', status: 'On Patrol', location: 'Tambaram West Main Road', officersCount: 4, vehicle: 'Interceptor', radioChannel: 'GRID-31', activeIncidentId: null },
  { id: 'POL-009', precinct: 'M-2 Adyar Precinct', status: 'At Scene', location: 'Adyar Canal Road Hub', officersCount: 8, vehicle: 'SUV Tactical', radioChannel: 'AIR-COM-10', activeIncidentId: 'SOS-002' },
  { id: 'POL-010', precinct: 'V-5 T-Nagar Division', status: 'Responding', location: 'Pondy Bazaar Market', officersCount: 6, vehicle: 'SUV Cruiser', radioChannel: 'GRID-14', activeIncidentId: 'SOS-003' }
];

export const INITIAL_FIRE: FireStation[] = [
  { id: 'FIRE-001', name: 'Guindy Central Fire Station', address: '12 Mount Road, Guindy, Chennai', trucks: 5, crewSize: 24, waterCapacity: 15000, status: 'Ready', phone: '+91 44 2235 0101' },
  { id: 'FIRE-002', name: 'Mylapore Heritage Fire Response', address: '3 Kutchery Road, Mylapore, Chennai', trucks: 3, crewSize: 16, waterCapacity: 12000, status: 'Active Deployment', phone: '+91 44 2464 0101' },
  { id: 'FIRE-003', name: 'Ambattur Industrial Fire Hub', address: 'M-4 Industrial Estate, Ambattur, Chennai', trucks: 6, crewSize: 32, waterCapacity: 20000, status: 'Ready', phone: '+91 44 2625 0101' },
  { id: 'FIRE-004', name: 'T-Nagar High-Rise Command', address: '8 Venkatnarayana Rd, T-Nagar, Chennai', trucks: 4, crewSize: 20, waterCapacity: 15000, status: 'Ready', phone: '+91 44 2434 0101' },
  { id: 'FIRE-005', name: 'Egmore North Fire Command', address: '34 Gandhi Irwin Rd, Egmore, Chennai', trucks: 4, crewSize: 18, waterCapacity: 12000, status: 'Ready', phone: '+91 44 2819 0101' },
  { id: 'FIRE-006', name: 'Tambaram Suburban Fire Station', address: 'Velachery Main Rd, Tambaram East, Chennai', trucks: 3, crewSize: 14, waterCapacity: 10000, status: 'Ready', phone: '+91 44 2239 0101' },
  { id: 'FIRE-007', name: 'Madhavaram North Fire Depot', address: 'Grand Northern Trunk Rd, Madhavaram, Chennai', trucks: 3, crewSize: 15, waterCapacity: 12000, status: 'Ready', phone: '+91 44 2551 0101' },
  { id: 'FIRE-008', name: 'Royapuram Harbour Fire Division', address: 'Royapuram Beach Rd, Chennai', trucks: 4, crewSize: 22, waterCapacity: 18000, status: 'Active Deployment', phone: '+91 44 2595 0101' }
];

export const INITIAL_BLOOD_BANKS: BloodBank[] = [
  { id: 'BB-001', name: 'Red Cross Central Blood Bank', address: '50 Montieth Rd, Egmore, Chennai', phone: '+91 44 2855 4425', inventory: { 'O+': 45, 'A+': 32, 'B+': 55, 'AB+': 18, 'O-': 12, 'A-': 8, 'B-': 10, 'AB-': 5 }, totalUnits: 185 },
  { id: 'BB-002', name: 'Tamil Nadu Govt Rotary Blood Center', address: 'RGGGH Campus, Park Town, Chennai', phone: '+91 44 2530 5112', inventory: { 'O+': 80, 'A+': 65, 'B+': 90, 'AB+': 35, 'O-': 25, 'A-': 15, 'B-': 20, 'AB-': 10 }, totalUnits: 340 },
  { id: 'BB-003', name: 'Apollo Emergency Blood Hub', address: '21 Greams Rd, Thousand Lights, Chennai', phone: '+91 44 2829 4321', inventory: { 'O+': 35, 'A+': 28, 'B+': 40, 'AB+': 15, 'O-': 8, 'A-': 6, 'B-': 7, 'AB-': 3 }, totalUnits: 142 },
  { id: 'BB-004', name: 'Kauvery Blood Transfusion Clinic', address: 'Luz Church Road, Mylapore, Chennai', phone: '+91 44 4000 6120', inventory: { 'O+': 18, 'A+': 14, 'B+': 22, 'AB+': 8, 'O-': 4, 'A-': 3, 'B-': 4, 'AB-': 2 }, totalUnits: 75 },
  { id: 'BB-005', name: 'Jeevan Stem Cell & Blood Foundation', address: 'Ph Road, Kilpauk, Chennai', phone: '+91 44 2641 2235', inventory: { 'O+': 30, 'A+': 24, 'B+': 36, 'AB+': 12, 'O-': 10, 'A-': 5, 'B-': 8, 'AB-': 4 }, totalUnits: 129 },
  { id: 'BB-006', name: 'Lions Club Trauma Blood Center', address: 'Haddows Road, Nungambakkam, Chennai', phone: '+91 44 2827 5566', inventory: { 'O+': 25, 'A+': 20, 'B+': 28, 'AB+': 10, 'O-': 6, 'A-': 4, 'B-': 5, 'AB-': 2 }, totalUnits: 100 },
  { id: 'BB-007', name: 'Malar Emergency Blood Bank', address: 'Adyar Circle, Chennai', phone: '+91 44 4242 4110', inventory: { 'O+': 16, 'A+': 12, 'B+': 18, 'AB+': 6, 'O-': 3, 'A-': 2, 'B-': 2, 'AB-': 1 }, totalUnits: 60 },
  { id: 'BB-008', name: 'SRMC Blood Bank Command', address: 'Porur Health Hub, Chennai', phone: '+91 44 2476 8033', inventory: { 'O+': 50, 'A+': 40, 'B+': 60, 'AB+': 24, 'O-': 15, 'A-': 10, 'B-': 12, 'AB-': 6 }, totalUnits: 217 },
  { id: 'BB-009', name: 'Stanley Medical Triage Blood Center', address: 'Royapuram Circle, Chennai', phone: '+91 44 2528 1359', inventory: { 'O+': 60, 'A+': 48, 'B+': 72, 'AB+': 30, 'O-': 18, 'A-': 12, 'B-': 14, 'AB-': 8 }, totalUnits: 262 },
  { id: 'BB-010', name: 'SIMS Lifesaver Blood Command', address: 'Vadapalani Station Road, Chennai', phone: '+91 44 2000 3110', inventory: { 'O+': 22, 'A+': 18, 'B+': 25, 'AB+': 9, 'O-': 5, 'A-': 4, 'B-': 4, 'AB-': 2 }, totalUnits: 89 }
];

export const INITIAL_VOLUNTEERS: VolunteerTeam[] = [
  { id: 'VOL-001', name: 'OMR Citizen Rescue Volunteers', location: 'OMR IT Highway Corridor', volunteersCount: 124, assignment: 'Ration packet distribution and flood logistics', phone: '+91 95000 11201' },
  { id: 'VOL-002', name: 'Marina Coastal Patrol Volunteers', location: 'Marina Beach Promenade', volunteersCount: 85, assignment: 'High tide warning and shoreline crowd control', phone: '+91 95000 11202' },
  { id: 'VOL-003', name: 'Mylapore Heritage Aid Group', location: 'Mylapore Temple Area', volunteersCount: 60, assignment: 'Senior citizen emergency medical logistics', phone: '+91 95000 11203' },
  { id: 'VOL-004', name: 'Adyar Riverbed Safety Corps', location: 'Adyar Canal Basin', volunteersCount: 110, assignment: 'Sandbag fortification and water level tracking', phone: '+91 95000 11204' },
  { id: 'VOL-005', name: 'Tambaram Suburban Relief Network', location: 'Tambaram Lake Areas', volunteersCount: 95, assignment: 'Water supply tanker coordination for shelters', phone: '+91 95000 11205' },
  { id: 'VOL-006', name: 'Velachery Flooding Action Corps', location: 'Velachery Low-lying Sectors', volunteersCount: 150, assignment: 'Inflatable boat pilot aid and safety ropes', phone: '+91 95000 11206' },
  { id: 'VOL-007', name: 'Guindy Industrial Relief Wing', location: 'Guindy Industrial Estate', volunteersCount: 45, assignment: 'Bio-chemical spill buffer team support', phone: '+91 95000 11207' },
  { id: 'VOL-008', name: 'Koyambedu Logistics Relief Wing', location: 'Koyambedu Markets Hub', volunteersCount: 210, assignment: 'Bulk vegetables & grocery packaging for shelters', phone: '+91 95000 11208' },
  { id: 'VOL-009', name: 'RGGGH Medical Escort Volunteers', location: 'Park Town Hospital Area', volunteersCount: 75, assignment: 'Emergency patient coordination and path clearance', phone: '+91 95000 11209' },
  { id: 'VOL-010', name: 'Egmore Railway Station Helpdesk', location: 'Egmore Train Terminus', volunteersCount: 50, assignment: 'Information guidance for stranded long route commuters', phone: '+91 95000 11210' }
];

export const INITIAL_DISASTER_TEAMS: DisasterTeam[] = [
  { id: 'DIS-001', name: 'NDRF Battalion 04 - Chennai Unit', region: 'Coastal North Chennai', specialization: 'Flood Water Extraction & Boats', active: true, size: 40, phone: '+91 94450 15401' },
  { id: 'DIS-002', name: 'SDRF Cyclone Relief Force - Alpha', region: 'Kotturpuram River Basin', specialization: 'High-Rise Rooftop Rope Recovery', active: true, size: 25, phone: '+91 94450 15402' },
  { id: 'DIS-003', name: 'Coast Guard Shallow-Water Triage', region: 'Marina Beach Front', specialization: 'Medical Triage & Beach Evacuation', active: false, size: 30, phone: '+91 94450 15403' },
  { id: 'DIS-004', name: 'Hazmat Bio-Chemical Containment Crew', region: 'Ambattur Chemical Parks', specialization: 'Gas Leak Buffer & Polymer Neutralization', active: true, size: 15, phone: '+91 94450 15404' },
  { id: 'DIS-005', name: 'TN Civil Defence Rescue - Zone A', region: 'Royapuram Harbour Sectors', specialization: 'Emergency Logistics & Rations Dispatch', active: true, size: 50, phone: '+91 94450 15405' },
  { id: 'DIS-006', name: 'Red Cross Rapid Trauma Medicals', region: 'T-Nagar Central Square', specialization: 'Emergency Surgical Intervention Onsite', active: false, size: 20, phone: '+91 94450 15406' },
  { id: 'DIS-007', name: 'Sovereign Air Relief Coordination', region: 'Meenambakkam Airport Base', specialization: 'Chopper Air drop Logistics', active: false, size: 12, phone: '+91 94450 15407' },
  { id: 'DIS-008', name: 'SDRF Landslide & Rubble Force', region: 'Pallavaram Hill Sectors', specialization: 'Heavy Rubble Clearance & Cranes', active: false, size: 30, phone: '+91 94450 15408' },
  { id: 'DIS-009', name: 'Kotturpuram Rescue Boat Team', region: 'Kotturpuram Basin Canal', specialization: 'Deep Canal Evacuation & Rafting', active: false, size: 18, phone: '+91 94450 15409' },
  { id: 'DIS-010', name: 'Chennai Volunteers Relief Corps', region: 'Adyar River Banks', specialization: 'Temporary Sand Piling & Barrier Support', active: false, size: 60, phone: '+91 94450 15410' }
];

export const INITIAL_DISASTER_ALERTS: string[] = [
  'Red Alert: Cyclone warning active. High winds and storm surge expected in coastal areas.',
  'Flash Flood Warning: Heavy water logs reported along Adyar River embankments.',
  'Extreme Heat Alert: Heatwave warning, temperatures to touch 42 degrees Celsius.',
  'Chemical Safety Advisory: Toxic gas release isolated at Ambattur industrial buffer.',
  'Storm Damage Alert: Uprooted trees blocking major intersections of GST road.',
  'High Tide Ingress Risk: Sea waves breaching boundaries near Royapuram harbour.',
  'Grid Failure Precautionary Shut-down: Substation shutdown active in flood-prone blocks.',
  'Water Level Advisory: Chembarambakkam outflow raised to 8,000 cusecs.',
  'Air Quality Advisory: Severe industrial haze reported around North Chennai.',
  'Advisory: Train services temporarily regulated at Beach-Tambaram sector.'
];

export const INITIAL_SHELTERS: Shelter[] = [
  { id: 'SHE-001', name: 'Guindy Community Welfare Hall', address: '12 Mount Road, Guindy, Chennai', capacity: 500, occupancy: 120, resources: 'Food Rations, Doctors, Bedding, Solar Power', distance: '1.2 km' },
  { id: 'SHE-002', name: 'Mylapore Girls Higher Sec School', address: '3 Kutchery Road, Mylapore, Chennai', capacity: 400, occupancy: 80, resources: 'First Aid Kit, Dry Foods, Milk, Sleeping Mats', distance: '2.5 km' },
  { id: 'SHE-003', name: 'Besant Nagar Community Hall', address: 'Besant Avenue Road, Chennai', capacity: 300, occupancy: 45, resources: 'Water Purifier, Generator, Triage Medic, Cooked Meals', distance: '3.1 km' },
  { id: 'SHE-004', name: 'T-Nagar Corporation Indoor Stadium', address: '8 Venkatnarayana Rd, T-Nagar', capacity: 800, occupancy: 340, resources: 'High-Capacity Beds, Sanitization Hub, Ambulance Parking', distance: '0.8 km' },
  { id: 'SHE-005', name: 'Koyambedu Wholesale Market Shelter', address: 'Koyambedu Bus Stand Road, Chennai', capacity: 600, occupancy: 210, resources: 'Rations Supply Depot, Drinking Water, Medical Camp', distance: '4.2 km' },
  { id: 'SHE-006', name: 'Velachery Low-lying Welfare Shelter', address: 'Velachery Lake Main Road, Chennai', capacity: 450, occupancy: 310, resources: 'Inflatable Boats, Life Jackets, Emergency Lights', distance: '1.5 km' },
  { id: 'SHE-007', name: 'Tambaram Central School Building', address: 'Tambaram East Station Road, Chennai', capacity: 250, occupancy: 60, resources: 'Dry Foods, Milk Powder, Primary First Aid, Water Tanks', distance: '5.8 km' },
  { id: 'SHE-008', name: 'Royapuram Harbour Rescue Fort', address: 'Harbour Main Gate Road, Chennai', capacity: 700, occupancy: 410, resources: 'Life Jackets, Coast Guard Wireless, Blankets, Surgical Bed', distance: '6.4 km' },
  { id: 'SHE-009', name: 'Ambattur Industrial School Area', address: 'Industrial Zone Phase-I, Chennai', capacity: 350, occupancy: 110, resources: 'Emergency Generator, Clean Water, Cooked Meal Counter', distance: '4.9 km' },
  { id: 'SHE-010', name: 'Anna Nagar West Public Depot', address: '4th Avenue, Shanti Colony, Chennai', capacity: 500, occupancy: 150, resources: 'Heavy Blankets, Solar Lighting, Dry Rations, Pediatric First-Aid', distance: '2.1 km' }
];

export const INITIAL_NOTIFICATIONS: EmergencyNotification[] = [
  { id: 'NTF-001', title: '🚨 SOS Critical: Cardiac Emergency', message: 'Ambulance AMB-001 dispatched for Srinivasan Raman at RMZ Millenia IT Park.', type: 'danger', read: false, timestamp: '10:16 AM' },
  { id: 'NTF-002', title: '⚠️ Alert: Coastal Flooding Risk', message: 'Royapuram sector water levels rose by 6 inches. High tide alert active.', type: 'danger', read: false, timestamp: '10:10 AM' },
  { id: 'NTF-003', title: '🔥 Fire Unit Assigned: Adyar Road', message: 'Mylapore Heritage Fire Response dispatched 1 pumper truck for Gandhi Nagar transformer blowout.', type: 'warning', read: false, timestamp: '10:01 AM' },
  { id: 'NTF-004', title: '📢 Safety Update: Chemical Leak Contained', message: 'Ambattur industrial cluster polymer containment has successfully sealed the primary valve.', type: 'success', read: false, timestamp: '10:22 AM' },
  { id: 'NTF-005', title: '🚨 SOS Triggered: T-Nagar Retail Break-in', message: 'Police vehicle POL-010 responding to active alarm at Pondy Bazaar Market.', type: 'warning', read: false, timestamp: '10:25 AM' },
  { id: 'NTF-006', title: '🔴 Emergency blood request: O- Blood', message: 'Tamil Nadu Govt General Hospital requires 3 units of O- blood immediately for urgent coronary bypass.', type: 'danger', read: false, timestamp: '09:45 AM' },
  { id: 'NTF-007', title: '⚡ Power Substation Shut-down', message: 'Egmore substation precautionary shutdown completed to avoid residential transformer fire.', type: 'info', read: true, timestamp: '09:30 AM' },
  { id: 'NTF-008', title: '🚑 Rescue Complete: Tidel Park Flyover', message: 'Ramesh Kumar (SOS-005) safely moved to Fortis Malar ICU ward. Team clearing road barricades.', type: 'success', read: true, timestamp: '08:45 AM' },
  { id: 'NTF-009', title: '🌧️ Heavy Rainfall Update: Red Alert', message: 'Chennai Metro weather station records 45mm rainfall in past 2 hours. Severe waterlogging warning.', type: 'danger', read: true, timestamp: '08:30 AM' },
  { id: 'NTF-010', title: '🏡 Shelter Active: Guindy Center', message: 'Guindy Community Welfare Hall opened and checked in first batch of low-lying basin evacuees.', type: 'info', read: true, timestamp: '08:15 AM' },
  { id: 'NTF-011', title: '📢 Safety: Chembarambakkam Outflow', message: 'Chembarambakkam dam discharge rates raised to 5,000 cusecs. Riverbank warning published.', type: 'warning', read: true, timestamp: '08:00 AM' },
  { id: 'NTF-012', title: '🔥 Incident Resolved: Mylapore Cylinder', message: 'Mylapore apartment LPG gas flaring completely extinguished. Occupants evacuated with no casualties.', type: 'success', read: true, timestamp: '08:05 AM' },
  { id: 'NTF-013', title: '🚨 SOS Resolved: Tambaram West Intruder', message: 'Police patrol POL-008 captured the suspect at রাজাজি নগর, Tambaram. Sovereign security safe.', type: 'success', read: true, timestamp: '06:40 AM' },
  { id: 'NTF-014', title: '⚠️ Traffic Advisory: GST Road Block', message: 'Large urooted tree blocking inner ring road. Traffic diverted to bypass lanes.', type: 'warning', read: true, timestamp: '06:15 AM' },
  { id: 'NTF-015', title: '📢 Volunteer Allocation: Velachery Rafts', location: 'Velachery Basin', message: '12 volunteers from Velachery Action Corps reporting to help medical boats.', type: 'info', read: true, timestamp: '05:50 AM' },
  { id: 'NTF-016', title: '🔴 Emergency Blood fulfilled: B+ Blood', message: 'Apollo Emergency Blood Hub fulfilled the requested 2 units of B+ Blood for leukemia therapy.', type: 'success', read: true, timestamp: '05:30 AM' },
  { id: 'NTF-017', title: '🚑 Pediatric Triage Success: Beach Villas', message: 'Drowning victim (SOS-013) restored to normal cardiac rhythm. Admitted for overnight observation.', type: 'success', read: true, timestamp: '05:45 AM' },
  { id: 'NTF-018', title: '⚠️ High Winds warning', message: 'Coastal weather nodes record wind speed reaching 55 km/h. Sea water entry warning near Ennore.', type: 'warning', read: true, timestamp: '04:00 AM' },
  { id: 'NTF-019', title: '🔥 Logistics Yard Fire Extinguished', message: 'Ennore Port cargo logistics fire fully put out. Incident logged. Estimated asset damage: Low.', type: 'success', read: true, timestamp: '03:45 AM' },
  { id: 'NTF-020', title: '🚨 SOS Resolved: Anna Nagar Purse Snatcher', message: 'Police Interceptor POL-003 successfully intercepted and cornered the black motorcycle suspect.', type: 'success', read: true, timestamp: '02:30 AM' },
  { id: 'NTF-021', title: '📢 Weather Warning: Deep Depression', message: 'IMD issues primary warnings. Cyclonic storm Expected to touch South Coast inside next 36 hours.', type: 'danger', read: true, timestamp: '01:00 AM' },
  { id: 'NTF-022', title: '🚒 Fire Unit Dispatched: DLF Server Room', message: 'Guindy Fire Station heavy pumper truck assigned to Ramapuram DLF server basement flare.', type: 'danger', read: true, timestamp: '10:04 AM' },
  { id: 'NTF-023', title: '📢 Medical Aid Volunteers at RGGGH', message: '75 volunteers checking in to help support flood triage beds.', type: 'info', read: true, timestamp: '10:05 AM' },
  { id: 'NTF-024', title: '🚨 SOS Triggered: Chromepet Diabetic Collapse', message: 'Suresh Raina collapsed with sudden dyspnea. Ambulance AMB-003 rerouting.', type: 'danger', read: true, timestamp: '10:25 AM' },
  { id: 'NTF-025', title: '⚠️ Toxic Gas warning: Triplicane Sewer', message: 'Triplicane area underground methane gas level spikes. Precautionary warning issued.', type: 'warning', read: true, timestamp: '09:50 AM' }
];

export const INITIAL_HISTORY: HistoryRecord[] = [
  { id: 'HIS-001', type: 'Ambulance', location: 'Tidel Park Junction, OMR Highway', date: '2026-07-08', dispatcher: 'Officer Rajesh', outcome: 'Success / Admitted', notes: 'Severe scooter skid injury, victim Ramesh Kumar stabilized with IV saline and neck brace. Admitted to Fortis Malar ICU.' },
  { id: 'HIS-002', type: 'Fire', location: 'Siddharth Castle Apartments, Mylapore', date: '2026-07-08', dispatcher: 'Officer Selvam', outcome: 'Success / Controlled', notes: 'LPG gas line blowout. Mylapore Fire squad controlled fire within 20 mins. Kitchen damaged, block evacuated safely.' },
  { id: 'HIS-003', type: 'Police', location: '55 Rajaji Nagar, Tambaram West', date: '2026-07-08', dispatcher: 'Officer Selvam', outcome: 'Success / Suspect Apprehended', notes: 'Intruder alarm active. POL-008 intercepted suspect in backyard. Handover to Tambaram local precinct.' },
  { id: 'HIS-004', type: 'Ambulance', location: 'Kottivakkam Beach Road Villas', date: '2026-07-08', dispatcher: 'Officer Rajesh', outcome: 'Success / Revived', notes: 'Accidental swimming pool drowning of 8yr child. CPR administered by lifesaver, specialized ALS AMB-004 stabilized oxygen.' },
  { id: 'HIS-005', type: 'Fire', location: 'Ennore Port Cargo Holding Area', date: '2026-07-08', dispatcher: 'Officer Selvam', outcome: 'Success / Extinguished', notes: 'Dry lumber spark fire. Ennore port team and 2 fire pumpers successfully suppressed fire inside warehouse.' },
  { id: 'HIS-006', type: 'Police', location: 'Anna Nagar Tower Park Promenade', date: '2026-07-08', dispatcher: 'Officer Selvam', outcome: 'Success / Asset Recovered', notes: 'Gold chain snatcher fleeing on black bike cornered by patrol POL-003 near park exit. Sovereign asset recovered.' },
  { id: 'HIS-007', type: 'Disaster', location: 'Kotturpuram Canal Slum Block', date: '2026-07-07', dispatcher: 'Officer Selvam', outcome: 'Success / Evacuated', notes: 'Water level rose rapidly. SDRF boat squad evacuated 18 stranded senior citizens to Guindy Community Shelter.' },
  { id: 'HIS-008', type: 'Ambulance', location: 'Velachery Main Road Market', date: '2026-07-07', dispatcher: 'Officer Rajesh', outcome: 'Success / Stabilized', notes: 'Pregnant citizen experiencing acute abdominal spasm. Transported via high-clearance BLS vehicle to Stanley Maternity.' },
  { id: 'HIS-009', type: 'Fire', location: 'Guindy Industrial Area Block C', date: '2026-07-07', dispatcher: 'Officer Selvam', outcome: 'Success / Extinguished', notes: 'Cardboard packaging depot fire. Sprinkler systems held fire until Guindy Central heavy trucks arrived.' },
  { id: 'HIS-010', type: 'Police', location: 'Koyambedu Wholesale Market Gate', date: '2026-07-07', dispatcher: 'Officer Selvam', outcome: 'Success / Crowd Cleared', notes: 'Assault on wholesale vendor. POL-004 traffic patrol arrested the active instigator. Traffic gridlock cleared.' },
  { id: 'HIS-011', type: 'Disaster', location: 'Egmore Train Station Outer Track', date: '2026-07-06', dispatcher: 'Officer Selvam', outcome: 'Success / Cleared', notes: 'Uprooted palm tree blocking train signals. SDRF chainsaw unit cleared blockage within 45 minutes.' },
  { id: 'HIS-012', type: 'Ambulance', location: 'Chromepet Bus Stand Terminal', date: '2026-07-06', dispatcher: 'Officer Rajesh', outcome: 'Success / Admitted', notes: 'Asthma crisis on city bus. Patient administered nebulizer and moved to Chromepet general hospital.' },
  { id: 'HIS-013', type: 'Fire', location: 'Nungambakkam Commercial Plaza', date: '2026-07-06', dispatcher: 'Officer Selvam', outcome: 'Success / Smoke Ventilated', notes: 'Bakery chimney oil grease catch fire. Stationed extinguisher suppressed flames. Extensive exhaust smoke ventilated.' },
  { id: 'HIS-014', type: 'Police', location: 'Besant Nagar Beach Promenade', date: '2026-07-05', dispatcher: 'Officer Selvam', outcome: 'Success / Restored', notes: 'Late night public nuisance and vehicle racing. Interceptor squads POL-003 and POL-005 impounded 4 fast bikes.' },
  { id: 'HIS-015', type: 'Disaster', location: 'Royapuram Coastal Fishing Wharf', date: '2026-07-05', dispatcher: 'Officer Selvam', outcome: 'Success / Secured', notes: 'High tide boat collision damage. Emergency wooden dock fortification by NDRF team prevented structural sinking.' },
  { id: 'HIS-016', type: 'Ambulance', location: 'Adyar Circle Bus Terminal', date: '2026-07-05', dispatcher: 'Officer Rajesh', outcome: 'Success / Checked', notes: 'Senior citizen heat stroke. Hydration fluids administered on-scene. Patient did not require hospital bed.' },
  { id: 'HIS-017', type: 'Fire', location: 'Tambaram Railway Yard Store', date: '2026-07-04', dispatcher: 'Officer Selvam', outcome: 'Success / Extinguished', notes: 'Rubbish dry leaf pile fire near signal cabin. Tambaram pumper trucks fully suppressed fire in 10 minutes.' },
  { id: 'HIS-018', type: 'Police', location: 'T-Nagar Usman Road Flyover', date: '2026-07-04', dispatcher: 'Officer Selvam', outcome: 'Success / Vehicle Moved', notes: 'Drunk driving crash blocking flyover lane. POL-009 traffic squad arrested driver and towed damaged vehicle.' },
  { id: 'HIS-019', type: 'Disaster', location: 'Madhavaram Industrial Belt', date: '2026-07-03', dispatcher: 'Officer Selvam', outcome: 'Success / Contained', notes: 'Small lubricant warehouse wall collapse. TN civil defence volunteers helped rescue 3 workers. No fatalities.' },
  { id: 'HIS-020', type: 'Ambulance', location: 'Porur Junction Signal Corner', date: '2026-07-03', dispatcher: 'Officer Rajesh', outcome: 'Success / Stabilized', notes: 'Pedestrian diabetic collapse on sidewalk. Gluco-gel administered. Patient stabilized and escorted home safely.' },
  { id: 'HIS-021', type: 'Fire', location: 'Kilpauk Medical College Hostel', date: '2026-07-02', dispatcher: 'Officer Selvam', outcome: 'Success / Controlled', notes: 'Electrical server panel spark in hostel basement. Egmore Fire team isolated main breaker and suppressed sparks.' },
  { id: 'HIS-022', type: 'Police', location: 'Egmore Station Parking Zone', date: '2026-07-02', dispatcher: 'Officer Selvam', outcome: 'Success / Thief Arrested', notes: 'Active car stereo thief caught by on-patrol officer. Stolen goods recovered and handed back to owner.' },
  { id: 'HIS-023', type: 'Disaster', location: 'Chromepet Underpass Subway', date: '2026-07-01', dispatcher: 'Officer Selvam', outcome: 'Success / Drained', notes: 'Subway water logging trapped a mini-truck. Inflatable boat team assisted, municipal heavy pump drained subway.' },
  { id: 'HIS-024', type: 'Ambulance', location: 'Besant Nagar Church Walkway', date: '2026-07-01', dispatcher: 'Officer Rajesh', outcome: 'Success / Stabilized', notes: 'Sprained ankle with minor fracture in senior citizen. Leg immobilizer applied, moved to Fortis Malar.' },
  { id: 'HIS-025', type: 'Fire', location: 'Sholinganallur IT Park Tower B', date: '2026-06-30', dispatcher: 'Officer Selvam', outcome: 'Success / Drills Complete', notes: 'Planned high rise fire simulation and water hose testing. Total 250 employees safely evacuated in 8 minutes.' },
  { id: 'HIS-026', type: 'Police', location: 'Kotturpuram River Road Crossing', date: '2026-06-30', dispatcher: 'Officer Selvam', outcome: 'Success / Restored', notes: 'Illegal waste dumping altercation. Patrol POL-009 detained dump truck operator, environmental fine logged.' },
  { id: 'HIS-027', type: 'Disaster', location: 'Ambattur High School Grounds', date: '2026-06-29', dispatcher: 'Officer Selvam', outcome: 'Success / Shelter Prepared', notes: 'Mock disaster community setup drill. Shelter capacity tested with water tanks and solar panels. Active.' },
  { id: 'HIS-028', type: 'Ambulance', location: 'Mylapore Luz Corner Crossing', date: '2026-06-29', dispatcher: 'Officer Rajesh', outcome: 'Success / Admitted', notes: 'Asthmatic child breathing distress. Administered high-flow oxygen, admitted to pediatric emergency ward.' },
  { id: 'HIS-029', type: 'Fire', location: 'Royapuram Old Timber Yard', date: '2026-06-28', dispatcher: 'Officer Selvam', outcome: 'Success / Extinguished', notes: 'Arson fire in dry sawdust bins. Royapuram and Harbour fire engines suppressed massive flames inside 45 minutes.' },
  { id: 'HIS-030', type: 'Police', location: 'Tambaram G.S.T Flyover Entry', date: '2026-06-28', dispatcher: 'Officer Selvam', outcome: 'Success / Cleared', notes: 'Fallen cargo crate blocking central lane on flyover. Police interceptor crew safely shifted load to shoulder.' }
];
