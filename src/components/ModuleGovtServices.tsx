import React, { useState, useMemo } from 'react';
import { 
  Award, Search, HelpCircle, CheckCircle, Clock, 
  Sparkles, ShieldCheck, ClipboardCheck, ArrowRight, Loader,
  FileText, Download, Layers, Bell, X, Check, AlertCircle, 
  Filter, Info, Building2, Eye, TrendingUp, User, PlusCircle, 
  Phone, Shield, Calendar, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GovtScheme, SchemeApplication } from '../types';

interface GovtProps {
  db: any;
  user: any;
  onApplyScheme: (schemeId: string, schemeTitle: string) => void;
  language: 'en' | 'ta' | 'hi';
}

// Full specifications of the 10 requested government services
interface GovtService {
  id: string;
  name: string;
  department: string;
  category: 'Identity' | 'Certificates' | 'Travel & Transport' | 'Welfare & Schemes';
  description: string;
  processingTime: string;
  status: 'Active' | 'Maintenance';
  eligibility: string;
  requiredDocuments: string[];
  fee: string;
  steps: string[];
  applyLink: string;
  statusLink: string;
  formLink: string;
}

const GOVT_SERVICES: GovtService[] = [
  {
    id: "srv-aadhaar",
    name: "Aadhaar Card Services",
    department: "Unique Identification Authority of India (UIDAI)",
    category: "Identity",
    description: "Update biometric registers, demographic data, address entries, or initiate new biometric enrollment.",
    processingTime: "5 - 7 Working Days",
    status: "Active",
    eligibility: "All residents of India (including minors and infants) who have resided in India for 182 days or more.",
    requiredDocuments: ["Proof of Identity (Aadhaar/PAN/Voter)", "Proof of Address (Utility bill/Ration)", "Date of Birth Proof"],
    fee: "Free of charge for first-time registration and mandatory biometrics. ₹50 for demographic updates.",
    steps: [
      "Select specific Aadhaar service (Biometric/Address/Phone Update)",
      "Upload supporting proofs such as Utility bills or Class 10 certificates",
      "Generate e-Sevai Appointment booking for biometric enrollment if required",
      "Verify live tracking status with UIDAI Registry update portal"
    ],
    applyLink: "https://myaadhaar.uidai.gov.in/",
    statusLink: "https://myaadhaar.uidai.gov.in/CheckAadhaarStatus",
    formLink: "https://uidai.gov.in/en/my-aadhaar/downloads/aadhaar-enrolment.html"
  },
  {
    id: "srv-pan",
    name: "PAN Card Registration & Update",
    department: "Income Tax Department, Govt of India",
    category: "Identity",
    description: "Apply for a new Permanent Account Number (PAN) card or submit corrections to existing PAN details.",
    processingTime: "10 - 15 Working Days",
    status: "Active",
    eligibility: "Any individual, company, trust or firm possessing taxable income stream in India.",
    requiredDocuments: ["Aadhaar Card as principal POI/POA", "Recent passport-sized photo", "Bank Statement"],
    fee: "₹107 for dispatch of physical card within India. ₹72 for paperless e-PAN card dispatch.",
    steps: [
      "Select form type (Form 49A for Residents, Form 49AA for foreign citizens)",
      "Fill demographic details and verify via e-KYC (using Aadhaar OTP)",
      "Upload self-attested copies of address and identification sheets",
      "Pay card processing fee and download instant digitized e-PAN acknowledgement"
    ],
    applyLink: "https://www.pan.utiitsl.com/PAN/new.do",
    statusLink: "https://www.pan.utiitsl.com/PAN/trackStatus.do",
    formLink: "https://www.pan.utiitsl.com/PAN/downloadForms.do"
  },
  {
    id: "srv-voter",
    name: "Voter ID Card (EPIC) Enrollment",
    department: "Election Commission of India (ECI)",
    category: "Identity",
    description: "Register as a new voter, transfer constituency, correct card entries, or apply for duplicate EPIC card.",
    processingTime: "15 - 20 Working Days",
    status: "Active",
    eligibility: "Indian citizen aged 18 years or above on the qualifying date of the electoral roll.",
    requiredDocuments: ["Age Certificate (Birth Cert/SSC/Driving License)", "Address Verification Paper"],
    fee: "Completely Free of Cost",
    steps: [
      "Complete Form 6 online on National Voters Service Portal (NVSP)",
      "Upload age proof, passport photo, and constituency residence sheets",
      "Verification visit by assigned Booth Level Officer (BLO) to physical residence",
      "EPIC number assigned, printed, and delivered via secure postal speed post"
    ],
    applyLink: "https://voters.eci.gov.in/",
    statusLink: "https://voters.eci.gov.in/track-application-status",
    formLink: "https://voters.eci.gov.in/forms"
  },
  {
    id: "srv-dl",
    name: "Driving License Services",
    department: "State Transport Department (RTO)",
    category: "Travel & Transport",
    description: "Apply for Learner's License, permanent Driving License, renewal, or international driving permit.",
    processingTime: "30 Working Days",
    status: "Active",
    eligibility: "Aged 18 or above for geared vehicles. Learner's license holder for at least 30 days.",
    requiredDocuments: ["Learner's License ID", "RTO physical fitness form (Form 1A)", "Address Proof", "Identity Proof"],
    fee: "₹150 for Learners, ₹700 for permanent Driving License, test charges and physical smart card dispatch.",
    steps: [
      "Apply for Learner's License and clear RTO computer-based traffic rules test",
      "After 30 days, schedule permanent Driving License track test slot",
      "Drive vehicle in front of checking RTO Motor Vehicle Inspector",
      "Upon clearance, capture biometrics and receive smart card within 30 days"
    ],
    applyLink: "https://parivahan.gov.in/parivahan/en/content/driving-licence",
    statusLink: "https://parivahan.gov.in/parivahan/en/content/driving-licence-status",
    formLink: "https://parivahan.gov.in/parivahan/en/content/all-forms"
  },
  {
    id: "srv-passport",
    name: "Passport Issuance Portal",
    department: "Ministry of External Affairs, Govt of India",
    category: "Travel & Transport",
    description: "Apply for a fresh passport, passport renewal under normal or Tatkaal scheme, or Police Clearance Certificate.",
    processingTime: "20 - 25 Working Days",
    status: "Active",
    eligibility: "Citizen of India by birth, descent, registration, or naturalization.",
    requiredDocuments: ["Birth Certificate or Matriculation Marksheet", "Aadhaar Card", "Ration Card or Bank Passbook"],
    fee: "₹1,500 for normal scheme (36-page booklet). ₹3,500 for urgent Tatkaal processing.",
    steps: [
      "Register on Passport Seva Online Portal and pay processing fee online",
      "Schedule physical appointment slot at regional Passport Seva Kendra (PSK)",
      "Attend verification desk at PSK with original documents and get photos captured",
      "Local Police station completes background review and clears file for printing"
    ],
    applyLink: "https://www.passportindia.gov.in/",
    statusLink: "https://www.passportindia.gov.in/AppExternalProject/status/trackStatusInpNew",
    formLink: "https://www.passportindia.gov.in/AppExternalProject/online/formsDownload"
  },
  {
    id: "srv-birth",
    name: "Birth Certificate Registration",
    department: "Municipal Corporation / Local Administration",
    category: "Certificates",
    description: "Obtain an official birth certificate or register child birth occurred within municipal limits.",
    processingTime: "3 - 5 Working Days",
    status: "Active",
    eligibility: "Parents of the child. The birth event must have occurred within regional administrative limits.",
    requiredDocuments: ["Hospital Birth Discharge Summary", "Aadhaar cards of Mother and Father", "Marriage Certificate (optional)"],
    fee: "Free if registered within 21 days of birth. Nominal late-registry fee applies thereafter.",
    steps: [
      "Hospital logs the birth details on local government municipal portal directly",
      "Parents complete application reference requesting copy of Birth Certificate",
      "Sanitary Inspector or Municipal Registrar verifies Hospital discharge summary",
      "Digitally signed Birth Certificate is generated for PDF download"
    ],
    applyLink: "https://crsorgi.gov.in/",
    statusLink: "https://crsorgi.gov.in/",
    formLink: "https://crsorgi.gov.in/"
  },
  {
    id: "srv-income",
    name: "Income Certificate Issuance",
    department: "Revenue Department, Govt of Tamil Nadu",
    category: "Certificates",
    description: "Official certificate validating the cumulative annual household income of a citizen's family.",
    processingTime: "7 - 10 Working Days",
    status: "Active",
    eligibility: "Tamil Nadu resident possessing active Smart Ration Card with family income stream.",
    requiredDocuments: ["Smart Ration Card", "Income Tax returns or Employer Salary slips", "Self-declaration affidavit"],
    fee: "₹60 (e-Sevai Portal administrative fee)",
    steps: [
      "Submit ration details and annual earnings of all family members online",
      "File routed to Village Administrative Officer (VAO) for village enquiries",
      "Revenue Inspector (RI) validates and files recommendation report",
      "Tahsildar signs with cryptographic signature, triggering SMS download link"
    ],
    applyLink: "https://www.tnesevai.tn.gov.in/",
    statusLink: "https://www.tnesevai.tn.gov.in/",
    formLink: "https://www.tnesevai.tn.gov.in/"
  },
  {
    id: "srv-community",
    name: "Community & Caste Certificate",
    department: "Revenue Department, Govt of Tamil Nadu",
    category: "Certificates",
    description: "Official document specifying community categorization (BC, MBC, SC, ST) for reservation advantages.",
    processingTime: "10 - 15 Working Days",
    status: "Active",
    eligibility: "Indian citizen residing in Tamil Nadu, belonging to communities listed under state reservation laws.",
    requiredDocuments: ["Ration Card", "Applicant school Transfer Certificate (TC)", "Caste Certificate of parents"],
    fee: "₹60 (e-Sevai charges)",
    steps: [
      "Fill online caste declaration form specifying native taluk roots",
      "Upload school mark sheets reflecting community classifications",
      "VAO executes local verification on family community roots",
      "Zonal Deputy Tahsildar validates files and issues permanent caste record"
    ],
    applyLink: "https://www.tnesevai.tn.gov.in/",
    statusLink: "https://www.tnesevai.tn.gov.in/",
    formLink: "https://www.tnesevai.tn.gov.in/"
  },
  {
    id: "srv-pension",
    name: "Old Age & Social Security Pension",
    department: "Social Welfare & Women Empowerment Department",
    category: "Welfare & Schemes",
    description: "Welfare monthly pension scheme for senior citizens (OAP), destitute widows, and differently-abled individuals.",
    processingTime: "45 Working Days",
    status: "Active",
    eligibility: "Senior citizens aged 60+ (OAP), destitute widows, or disabled individuals with family income < ₹1.5 Lakhs.",
    requiredDocuments: ["Aadhaar Card", "Age Proof Certificate", "Bank Account Passbook (with IFSC code)", "Destitute certificate"],
    fee: "Completely Free of Cost",
    steps: [
      "Fill Social Welfare Pension Application form with bank ledger details",
      "Submit declaration affirming applicant does not have adult sons capable of supporting",
      "Revenue Inspector performs inspection of domestic and financial situation",
      "Collectorate approves enrollment, scheduling ₹1,200/month Direct Benefit Transfer"
    ],
    applyLink: "https://www.tn.gov.in/",
    statusLink: "https://www.tn.gov.in/",
    formLink: "https://www.tn.gov.in/"
  },
  {
    id: "srv-health",
    name: "Chief Minister's Comprehensive Health Scheme",
    department: "Health & Family Welfare Department, Tamil Nadu",
    category: "Welfare & Schemes",
    description: "Cashless healthcare scheme covering up to ₹5 Lakhs/year for major medical treatments and surgeries in listed hospitals.",
    processingTime: "15 Working Days",
    status: "Active",
    eligibility: "Resident family in Tamil Nadu with annual household income less than ₹1,20,000.",
    requiredDocuments: ["Smart Ration Card", "Income Certificate", "Aadhaar cards of all family members"],
    fee: "Completely Free of Cost",
    steps: [
      "Register family details with active Income Certificate",
      "Visit District Collectorate verification camp for biometrics and iris scans",
      "Issuance of CMCHIS Health Card containing unique family ID",
      "Present health card at any government or empaneled private hospital desk"
    ],
    applyLink: "https://www.cmchistn.com/",
    statusLink: "https://www.cmchistn.com/",
    formLink: "https://www.cmchistn.com/"
  }
];

const MOCK_NOTIFICATIONS = [
  {
    id: 'n-1',
    title: 'Aadhaar Dispatch Successful',
    text: 'Your updated biometrics card has been posted via Speed-Post (Tracking: EM391855210IN).',
    time: '2 hours ago',
    unread: true,
    type: 'success' as const
  },
  {
    id: 'n-2',
    title: 'Income Certificate Approved',
    text: 'Tahsildar Salem has digitally signed your Income Certificate (Ref: TN-INC-2026-9815).',
    time: '1 day ago',
    unread: false,
    type: 'success' as const
  },
  {
    id: 'n-3',
    title: 'National Pension KYC Reminder',
    text: 'Annual life certificate verification is due by 31st August for pension continuance.',
    time: '3 days ago',
    unread: false,
    type: 'warning' as const
  }
];

export default function ModuleGovtServices({ db, user, onApplyScheme, language }: GovtProps) {
  // Local notification toasts
  const [toasts, setToasts] = useState<any[]>([]);

  const triggerToast = (title: string, message: string, type: 'success' | 'danger' | 'info' = 'success') => {
    const newToast = { id: `toast-${Date.now()}-${Math.random()}`, title, message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4500);
  };

  // State to track session applied services
  const [localApplications, setLocalApplications] = useState<any[]>([
    {
      id: 'appl-pre-1',
      schemeId: 'srv-aadhaar',
      schemeTitle: 'Aadhaar Card Services',
      citizenId: user?.id || 'user-cit',
      citizenName: user?.name || 'Santhosh Kumar',
      appliedDate: '2026-06-25',
      status: 'Approved',
      trackingNumber: 'LC-AADH-4819'
    },
    {
      id: 'appl-pre-2',
      schemeId: 'srv-income',
      schemeTitle: 'Income Certificate Issuance',
      citizenId: user?.id || 'user-cit',
      citizenName: user?.name || 'Santhosh Kumar',
      appliedDate: '2026-07-02',
      status: 'Approved',
      trackingNumber: 'LC-INCO-2093'
    },
    {
      id: 'appl-pre-3',
      schemeId: 'srv-pan',
      schemeTitle: 'PAN Card Registration & Update',
      citizenId: user?.id || 'user-cit',
      citizenName: user?.name || 'Santhosh Kumar',
      appliedDate: '2026-07-06',
      status: 'Under Review',
      trackingNumber: 'LC-PANC-7711'
    }
  ]);

  // Combine global db schemeApplications with session local applications
  const allApplications = useMemo(() => {
    const map = new Map();
    
    // Seed preloaded applications
    localApplications.forEach(a => map.set(a.id, a));

    // Seed server applications
    (db.schemeApplications || []).forEach((a: any) => {
      map.set(a.id, {
        id: a.id,
        schemeId: a.schemeId || 'srv-health',
        schemeTitle: a.schemeTitle,
        citizenId: a.citizenId || 'user-cit',
        citizenName: a.citizenName || user?.name || 'Citizen',
        appliedDate: a.appliedDate || new Date().toISOString().split('T')[0],
        status: a.status || 'Under Review',
        trackingNumber: a.trackingNumber || `LC-REG-${Math.floor(1000 + Math.random() * 9000)}`
      });
    });

    return Array.from(map.values());
  }, [db.schemeApplications, localApplications, user]);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Identity' | 'Certificates' | 'Travel & Transport' | 'Welfare & Schemes'>('All');

  // Modals & Drawers States
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState<GovtService | null>(null);
  const [selectedServiceForApply, setSelectedServiceForApply] = useState<GovtService | null>(null);
  const [selectedServiceForStatus, setSelectedServiceForStatus] = useState<GovtService | null>(null);

  // Apply Form Inputs State
  const [applicantName, setApplicantName] = useState(user?.name || '');
  const [applicantPhone, setApplicantPhone] = useState(user?.phone || '+91 94441 55667');
  const [applicantEmail, setApplicantEmail] = useState(user?.email || 'santhosh@example.com');
  const [attachedFiles, setAttachedFiles] = useState<{name: string, size: string}[]>([]);
  const [declaredChecked, setDeclaredChecked] = useState(false);
  const [submittingApply, setSubmittingApply] = useState(false);

  // AI Eligibility Checker State
  const [income, setIncome] = useState('110000');
  const [age, setAge] = useState('24');
  const [details, setDetails] = useState('');
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState('');

  // Sourcing filter match
  const filteredServices = useMemo(() => {
    return GOVT_SERVICES.filter(srv => {
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const nMatch = srv.name.toLowerCase().includes(query);
        const dMatch = srv.department.toLowerCase().includes(query);
        const descMatch = srv.description.toLowerCase().includes(query);
        if (!nMatch && !dMatch && !descMatch) return false;
      }
      if (selectedCategory !== 'All' && srv.category !== selectedCategory) return false;
      return true;
    });
  }, [searchQuery, selectedCategory]);

  // Summary Metrics calculations
  const totalServicesCount = GOVT_SERVICES.length;
  const submittedCount = allApplications.length;
  const approvedCount = allApplications.filter(a => a.status === 'Approved').length;
  const pendingCount = allApplications.filter(a => a.status === 'Under Review' || a.status === 'Pending').length;

  // Simulate PDF Download
  const handleDownloadForm = (serviceName: string) => {
    const safeName = serviceName.toLowerCase().replace(/\s+/g, '_');
    const templateContent = `%PDF-1.4
%--------------------------------------------------
% GOVERNMENT OF INDIA - DEPT REGISTRY DIGITAL PORTAL
% FORM CODE: LC-GOV-${Math.floor(10000 + Math.random() * 90000)}
% SERVICE TYPE: ${serviceName.toUpperCase()}
%--------------------------------------------------
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [ 3 0 R ] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [ 0 0 595 842 ] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 200 >>
stream
BT
/F1 12 Tf
72 750 Td (${serviceName} official application draft) Tj
72 730 Td (Sovereign LifeConnect Node certified form template.) Tj
72 700 Td (Applicant signature field: _______________________) Tj
72 680 Td (Issued date: ${new Date().toISOString().split('T')[0]}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000056 00000 n
0000000111 00000 n
0000000196 00000 n
trailer << /Root 1 0 R /Size 5 >>
%%EOF`;

    const blob = new Blob([templateContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form_${safeName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('📄 Form Downloaded', `Official application draft form for "${serviceName}" downloaded successfully.`, 'success');
  };

  // Trigger real backend submission + local state tracking update
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceForApply) return;
    if (!declaredChecked) {
      triggerToast('Verification Error', 'Please verify and check the legal declaration box to proceed.', 'danger');
      return;
    }

    setSubmittingApply(true);
    
    // Emulate slight processing delay
    setTimeout(() => {
      // Trigger prop back to App.tsx to hit server endpoint /api/govt/apply
      onApplyScheme(selectedServiceForApply.id, selectedServiceForApply.name);

      // Instantly push to local state to reflect UI changes on stats cards and lists
      const localId = `appl-local-${Date.now()}`;
      const newAppl = {
        id: localId,
        schemeId: selectedServiceForApply.id,
        schemeTitle: selectedServiceForApply.name,
        citizenId: user?.id || 'user-cit',
        citizenName: applicantName || user?.name || 'Citizen',
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'Under Review' as const,
        trackingNumber: `LC-${selectedServiceForApply.name.slice(0, 4).toUpperCase().replace(/\s+/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
      };

      setLocalApplications(prev => [newAppl, ...prev]);
      setSubmittingApply(false);
      setSelectedServiceForApply(null);
      setAttachedFiles([]);
      setDeclaredChecked(false);
      triggerToast('🏛️ Application Submitted', `Application for "${selectedServiceForApply.name}" submitted successfully. Secure Tracking Code generated.`, 'success');
    }, 1000);
  };

  // Mock document drag and drop attachment addition
  const handleAttachMockFile = () => {
    const fileOptions = [
      { name: 'Income_Certificate_SelfDeclaration.pdf', size: '240 KB' },
      { name: 'Identity_Aadhaar_FrontBack_Copy.png', size: '1.2 MB' },
      { name: 'Smart_RationCard_FamilySheet.pdf', size: '720 KB' },
      { name: 'Address_Verification_ElectricityBill.pdf', size: '430 KB' },
      { name: 'Marksheet_Class_10_Matriculation.pdf', size: '610 KB' }
    ];
    // Select one random to attach
    const randomFile = fileOptions[Math.floor(Math.random() * fileOptions.length)];
    if (attachedFiles.some(f => f.name === randomFile.name)) {
      triggerToast('File Info', 'Document is already attached to this form.', 'info');
      return;
    }
    setAttachedFiles(prev => [...prev, randomFile]);
    triggerToast('📎 Document Attached', `"${randomFile.name}" attached successfully.`, 'success');
  };

  // AI Eligibility Advice Handler
  const checkEligibility = async () => {
    setCheckingEligibility(true);
    setEligibilityResult('');
    try {
      const prompt = `Evaluate eligibility for welfare schemes with the following profile details: Annual Income: ₹${income}, Age: ${age}, Additional profile: ${details || 'Citizen resident'}. Specify matching welfare programs. Let me know whether I am eligible for the Chief Minister Health Scheme or Pension Services.`;
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: prompt, 
          modelType: 'scheme-eligibility' 
        })
      });
      const data = await response.json();
      setEligibilityResult(data.text);
    } catch (e) {
      setEligibilityResult("Error executing eligibility matrix. Please check connection.");
    } finally {
      setCheckingEligibility(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-100 font-sans">
      
      {/* Dynamic Toast Alerts Container */}
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
                  : toast.type === 'danger' 
                    ? 'border-rose-500/30' 
                    : 'border-cyan-500/30'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${
                toast.type === 'success' 
                  ? 'bg-emerald-500/15 text-emerald-400' 
                  : toast.type === 'danger' 
                    ? 'bg-rose-500/15 text-rose-400' 
                    : 'bg-cyan-500/15 text-cyan-400'
              }`}>
                {toast.type === 'success' ? <Check className="h-4 w-4" /> : toast.type === 'danger' ? <AlertCircle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
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

      {/* Title Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/5 pb-5 gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="h-11 w-11 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 border border-cyan-500/25">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold uppercase tracking-wider font-mono flex items-center gap-2">
              Government Services Registry
              <span className="px-2 py-0.5 text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">Secure Node Active</span>
            </h2>
            <p className="text-xs text-slate-400">Apply for official identification, revenue certificates, state travel papers, and welfare programs on a single digital node.</p>
          </div>
        </div>
      </div>

      {/* Interactive Stats Dashboard Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Services */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total Services</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{totalServicesCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">Catalogued digital gateways</p>
        </div>

        {/* Applications Submitted */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Submitted Applications</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{submittedCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <ClipboardCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-indigo-400 mt-2 font-mono flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Active registry tracking entries
          </p>
        </div>

        {/* Approved Applications */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Approved Certificates</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{approvedCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">Digitally signed and dispatched</p>
        </div>

        {/* Pending Applications */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Under Review</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">{pendingCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">VAO and Tahsildar check queues</p>
        </div>
      </div>

      {/* Main Split Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Service Catalog Matrix */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Services Card */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-5">
            
            {/* Header filters */}
            <div className="space-y-4 border-b border-white/5 pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <ClipboardCheck className="h-4.5 w-4.5 text-cyan-400" />
                  National & State Service Directory
                </h3>
                <span className="text-[10px] font-mono text-slate-500">
                  {filteredServices.length} standard registers listed
                </span>
              </div>

              {/* Filtering Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Search query input */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search registers (e.g. Aadhaar, PAN, Voter)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Categories filtering options */}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e: any) => setSelectedCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
                  >
                    <option value="All">All Registration Sectors</option>
                    <option value="Identity">Identity & Demographics</option>
                    <option value="Certificates">Revenue & Municipal Certificates</option>
                    <option value="Travel & Transport">RTO & Travel Documents</option>
                    <option value="Welfare & Schemes">State Welfare & Pension Programs</option>
                  </select>
                </div>
              </div>

              {/* Horizontal pills shortcut category selectors */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider mr-1">Quick Sector:</span>
                {(['All', 'Identity', 'Certificates', 'Travel & Transport', 'Welfare & Schemes'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      selectedCategory === cat 
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' 
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat === 'All' ? 'All Sectors' : cat}
                  </button>
                ))}
              </div>

            </div>

            {/* List of Filtered Services */}
            <div className="space-y-4 max-h-[850px] overflow-y-auto pr-1">
              {filteredServices.length === 0 ? (
                <div className="py-20 text-center text-xs text-slate-500 border border-dashed border-white/5 rounded-2xl italic space-y-1">
                  <p>No government services found matching your search term.</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} 
                    className="text-cyan-400 font-mono text-[10px] hover:underline"
                  >
                    Clear Filter
                  </button>
                </div>
              ) : (
                filteredServices.map(srv => {
                  // Determine status styling
                  const catColors = {
                    'Identity': 'bg-violet-500/10 text-violet-300 border-violet-500/20',
                    'Certificates': 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
                    'Travel & Transport': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
                    'Welfare & Schemes': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  };

                  return (
                    <div 
                      key={srv.id}
                      className="p-4.5 rounded-xl bg-slate-950/45 border border-white/5 hover:border-white/10 transition-colors space-y-3 relative group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                        <div className="space-y-1">
                          <h4 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">{srv.name}</h4>
                          <span className="text-[10px] text-slate-400 block">🏛️ Dept: <strong className="text-slate-300">{srv.department}</strong></span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 self-start">
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${catColors[srv.category]}`}>
                            {srv.category}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1 shrink-0">
                            <Clock className="h-3 w-3 text-cyan-400" />
                            {srv.processingTime}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-normal font-sans">
                        {srv.description}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2.5 border-t border-white/5">
                        <button
                          onClick={() => window.open(srv.applyLink, '_blank')}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-1.5 px-2 rounded-xl text-[11px] transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                        >
                          <PlusCircle className="h-3.5 w-3.5 shrink-0" />
                          Apply Now
                        </button>

                        <button
                          onClick={() => window.open(srv.statusLink, '_blank')}
                          className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 font-bold py-1.5 px-2 rounded-xl text-[11px] transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                        >
                          <Clock className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                          Check Status
                        </button>

                        <button
                          onClick={() => window.open(srv.formLink, '_blank')}
                          className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 font-bold py-1.5 px-2 rounded-xl text-[11px] transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                        >
                          <Download className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          Download Form
                        </button>

                        <button
                          onClick={() => setSelectedServiceForDetails(srv)}
                          className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 font-mono text-[10px] py-1.5 px-2 rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center gap-1 col-span-2 md:col-span-1"
                        >
                          <Eye className="h-3.5 w-3.5 shrink-0" />
                          View Details
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Certificate Application Tracker History */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-cyan-400 animate-pulse" />
              Sovereign Registry Transaction Ledger
            </h3>

            <div className="space-y-2.5">
              {allApplications.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500 border border-dashed border-white/5 rounded-xl italic">
                  No active registrations detected in this session's ledger.
                </div>
              ) : (
                allApplications.map((appl: any) => {
                  const matchingSrv = GOVT_SERVICES.find(s => s.id === appl.schemeId);
                  return (
                    <div 
                      key={appl.id} 
                      className="p-3.5 bg-slate-950/40 border border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-white/10 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white leading-none">{appl.schemeTitle}</span>
                          <span className="text-[9px] bg-slate-900 text-slate-400 font-mono border border-white/5 px-1.5 py-0.2 rounded">
                            {matchingSrv?.category || 'Scheme'}
                          </span>
                        </div>
                        <p className="text-[9px] text-cyan-400 font-mono uppercase tracking-wider">TRACKING ID: {appl.trackingNumber}</p>
                        <p className="text-[9px] text-slate-500 font-mono">Date Filed: {appl.appliedDate} | Registry: {matchingSrv?.department.slice(0, 45) || 'State Office'}...</p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          appl.status === 'Approved' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                        }`}>
                          {appl.status}
                        </span>

                        <button
                          onClick={() => {
                            const matchedSrv = GOVT_SERVICES.find(s => s.id === appl.schemeId) || {
                              id: appl.schemeId,
                              name: appl.schemeTitle,
                              department: "Social Welfare Department",
                              category: "Welfare & Schemes" as const,
                              description: "State welfare support registry.",
                              processingTime: "15 Days",
                              status: "Active" as const,
                              eligibility: "Identified low-income resident criteria.",
                              requiredDocuments: ["Smart Card", "Aadhaar"],
                              fee: "Free",
                              steps: ["Enroll", "VAO Sign", "Signed approval"]
                            };
                            setSelectedServiceForStatus(matchedSrv);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 font-mono text-[9px] uppercase border border-cyan-500/20 bg-cyan-500/5 px-2 py-0.5 rounded cursor-pointer"
                        >
                          Timeline
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Column - AI Eligibility matrix & Registry System Notifications */}
        <div className="space-y-6">
          
          {/* AI Eligibility Advisor Module */}
          <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/15 via-slate-900 to-slate-900 p-5 space-y-4 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl" />
            
            <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
              AI Eligibility Advisor
            </h3>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Input income and demographic metrics to let the AI agent match your profile against state-wide welfare schemes (e.g. Chief Minister Health Scheme or Social Pension).
            </p>

            <div className="space-y-3 font-sans">
              <div>
                <label className="text-[9px] text-slate-400 font-bold uppercase font-mono tracking-wider block mb-1">Annual Income (₹)</label>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-violet-500/50"
                  required
                />
              </div>

              <div>
                <label className="text-[9px] text-slate-400 font-bold uppercase font-mono tracking-wider block mb-1">Applicant Age (Years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-violet-500/50"
                  required
                />
              </div>

              <div>
                <label className="text-[9px] text-slate-400 font-bold uppercase font-mono tracking-wider block mb-1">Additional Criteria details</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="e.g. Destitute widow, small agricultural landholder, female student studied in state public schools..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 min-h-[65px]"
                />
              </div>

              <button
                onClick={checkEligibility}
                disabled={checkingEligibility}
                className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold text-xs py-2.5 transition-all flex items-center justify-center space-x-1.5 hover:from-violet-400 hover:to-indigo-400 cursor-pointer"
              >
                {checkingEligibility && <Loader className="h-3.5 w-3.5 animate-spin" />}
                <span>{checkingEligibility ? 'Consulting Welfare database...' : 'Check Welfare Compatibility'}</span>
              </button>
            </div>

            {eligibilityResult && (
              <div className="p-3.5 bg-slate-950/85 rounded-xl border border-violet-500/30 text-xs text-slate-300 leading-relaxed max-h-72 overflow-y-auto custom-scrollbar font-sans space-y-2">
                <div className="flex items-center space-x-1.5 text-violet-400 font-bold uppercase tracking-wider text-[9px] font-mono">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>AI Welfare Advice Ledger</span>
                </div>
                <div className="whitespace-pre-wrap">{eligibilityResult}</div>
              </div>
            )}
          </div>

          {/* Registry Notifications Box */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Bell className="h-4.5 w-4.5 text-amber-400" />
              Registry Alerts & Circulars
            </h3>

            <div className="space-y-3">
              {MOCK_NOTIFICATIONS.map(n => (
                <div key={n.id} className="p-3 bg-slate-950/50 border border-white/5 rounded-xl space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />}
                      {n.title}
                    </h4>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider shrink-0">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{n.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* MODAL 1: VIEW DETAILS MODAL */}
      <AnimatePresence>
        {selectedServiceForDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setSelectedServiceForDetails(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-4">
                <div className="border-b border-white/10 pb-3">
                  <span className="text-[9px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 px-2 py-0.5 rounded uppercase font-bold">
                    {selectedServiceForDetails.category}
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-1.5">{selectedServiceForDetails.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">🏛️ {selectedServiceForDetails.department}</p>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold mb-1">Description</h4>
                    <p className="text-slate-200">"{selectedServiceForDetails.description}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-white/5 font-mono text-[10px]">
                    <div>
                      <span className="text-slate-500 block">Processing Time:</span>
                      <strong className="text-cyan-300">{selectedServiceForDetails.processingTime}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Registry Fee:</span>
                      <strong className="text-emerald-400">{selectedServiceForDetails.fee}</strong>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold mb-1">Citizen Eligibility Criteria</h4>
                    <div className="p-3 bg-slate-950 rounded-xl border border-white/5 text-slate-300 flex items-start gap-2">
                      <Shield className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{selectedServiceForDetails.eligibility}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold mb-1.5">Required Document Checklist</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedServiceForDetails.requiredDocuments.map((doc, idx) => (
                        <span key={idx} className="bg-white/5 border border-white/10 text-slate-300 text-[10px] px-2.5 py-1 rounded-lg font-sans flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold mb-1.5">Registry Application Roadmap</h4>
                    <div className="space-y-2">
                      {selectedServiceForDetails.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-[11px] text-slate-300">
                          <span className="h-5 w-5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="pt-0.5">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-4 border-t border-white/10 mt-2">
                  <button
                    onClick={() => {
                      window.open(selectedServiceForDetails.applyLink, '_blank');
                      setSelectedServiceForDetails(null);
                    }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer text-center"
                  >
                    Apply Now
                  </button>
                  <button
                    onClick={() => window.open(selectedServiceForDetails.formLink, '_blank')}
                    className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Download Form PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: APPLICATION ENROLLMENT FORM MODAL */}
      <AnimatePresence>
        {selectedServiceForApply && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            >
              <button 
                onClick={() => {
                  setSelectedServiceForApply(null);
                  setAttachedFiles([]);
                  setDeclaredChecked(false);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                    Secure Form Submission
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-1">Enrollment Application Form</h3>
                  <p className="text-[11px] text-cyan-400 font-mono tracking-wide">{selectedServiceForApply.name}</p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-3.5">
                  <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5 text-[11px] text-slate-400 leading-normal flex items-start gap-2">
                    <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Your profile details will be matched securely with the municipal database. Document attachments will be cryptographically hashed.</span>
                  </div>

                  {/* Pre-filled fields */}
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Applicant Legal Name</label>
                    <input
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                      placeholder="e.g. Santhosh Kumar"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                        placeholder="+91 XXXXX XXXXX"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                        placeholder="santhosh@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Interactive simulated document attachments */}
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                      Required Attachments ({selectedServiceForApply.requiredDocuments.length} files suggested)
                    </label>
                    
                    <div className="space-y-1.5">
                      {attachedFiles.map((file, idx) => (
                        <div key={idx} className="p-2 bg-slate-950 rounded-xl border border-white/5 flex items-center justify-between text-[11px]">
                          <span className="text-slate-300 flex items-center gap-1.5 truncate">
                            <FileText className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                            {file.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">{file.size}</span>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAttachMockFile}
                        className="w-full bg-slate-950 hover:bg-slate-950/80 border border-dashed border-white/15 hover:border-cyan-500/20 text-slate-400 hover:text-white p-3 rounded-xl text-center flex flex-col items-center justify-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="h-5 w-5 text-cyan-400" />
                        <span className="text-[11px] font-bold">Simulate Document Drag & Drop Attachment</span>
                        <span className="text-[9px] text-slate-500 font-mono">Accepts certified PDFs or high-resolution PNG scans</span>
                      </button>
                    </div>
                  </div>

                  {/* Declaration terms and submission */}
                  <div className="p-2.5 bg-slate-950/40 rounded-xl border border-white/5 flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="declare"
                      checked={declaredChecked}
                      onChange={(e) => setDeclaredChecked(e.target.checked)}
                      className="mt-1 h-3.5 w-3.5 rounded border-white/25 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="declare" className="text-[10px] text-slate-400 leading-normal cursor-pointer select-none">
                      I solemnly declare that the facts listed in this form are correct to my absolute knowledge, and I authorize LifeConnect secure validation credentials handshake with Tamil Nadu state servers.
                    </label>
                  </div>

                  <div className="flex gap-2.5 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedServiceForApply(null);
                        setAttachedFiles([]);
                        setDeclaredChecked(false);
                      }}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-xl text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingApply}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-extrabold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {submittingApply ? (
                        <>
                          <Loader className="h-3.5 w-3.5 animate-spin text-slate-950" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: CHECK STATUS TIMELINE MODAL */}
      <AnimatePresence>
        {selectedServiceForStatus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedServiceForStatus(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {(() => {
                // Find if an active application exists in history
                const appMatch = allApplications.find(a => a.schemeId === selectedServiceForStatus.id);
                
                return (
                  <div className="space-y-5">
                    <div>
                      <span className="text-[9px] font-mono uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded font-bold">
                        Registry Tracking Node
                      </span>
                      <h3 className="text-base font-extrabold text-white mt-1">Application Registry Status</h3>
                      <p className="text-[11px] text-slate-400 font-mono">{selectedServiceForStatus.name}</p>
                    </div>

                    {appMatch ? (
                      <div className="space-y-4">
                        {/* Meta summary */}
                        <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-1.5 font-mono text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Tracking Code:</span>
                            <span className="text-cyan-400 font-bold">{appMatch.trackingNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Date Filed:</span>
                            <span className="text-slate-300">{appMatch.appliedDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Current Status:</span>
                            <span className={`font-bold uppercase ${appMatch.status === 'Approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {appMatch.status}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Timeline steps */}
                        <div className="relative pl-6 space-y-5 py-1">
                          {/* Timeline vertical bar */}
                          <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-slate-800" />

                          {/* Step 1: Done */}
                          <div className="relative">
                            <div className="absolute -left-[23px] top-0.5 h-4.5 w-4.5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-mono text-[9px] font-bold border border-emerald-400/25">
                              <Check className="h-2.5 w-2.5" />
                            </div>
                            <div className="space-y-0.5">
                              <h4 className="text-[11px] font-bold text-white">Digital Submission Handshake</h4>
                              <p className="text-[10px] text-slate-500 font-mono">Timestamped on {appMatch.appliedDate}</p>
                              <p className="text-[10.5px] text-slate-400 leading-normal">Form and supporting credentials securely uploaded via LifeConnect Gateway.</p>
                            </div>
                          </div>

                          {/* Step 2: VAO checks */}
                          <div className="relative">
                            <div className={`absolute -left-[23px] top-0.5 h-4.5 w-4.5 rounded-full flex items-center justify-center font-mono text-[9px] font-bold border ${
                              appMatch.status === 'Approved' 
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400/25' 
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                            }`}>
                              {appMatch.status === 'Approved' ? <Check className="h-2.5 w-2.5" /> : '2'}
                            </div>
                            <div className="space-y-0.5">
                              <h4 className="text-[11px] font-bold text-white">VAO Registry Audit</h4>
                              <p className="text-[10px] text-slate-500 font-mono">
                                {appMatch.status === 'Approved' ? 'Completed Verification' : 'In Progress Queue'}
                              </p>
                              <p className="text-[10.5px] text-slate-400 leading-normal">
                                Village Administrative Officer validates smart card database links and self-declarations.
                              </p>
                            </div>
                          </div>

                          {/* Step 3: RI Checks */}
                          <div className="relative">
                            <div className={`absolute -left-[23px] top-0.5 h-4.5 w-4.5 rounded-full flex items-center justify-center font-mono text-[9px] font-bold border ${
                              appMatch.status === 'Approved' 
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400/25' 
                                : 'bg-slate-950 text-slate-600 border-white/5'
                            }`}>
                              {appMatch.status === 'Approved' ? <Check className="h-2.5 w-2.5" /> : '3'}
                            </div>
                            <div className="space-y-0.5">
                              <h4 className="text-[11px] font-bold text-white">Revenue Inspector Review</h4>
                              <p className="text-[10px] text-slate-500 font-mono">
                                {appMatch.status === 'Approved' ? 'Completed Verification' : 'Awaiting Signatures'}
                              </p>
                              <p className="text-[10.5px] text-slate-400 leading-normal">
                                Field validation audit completed certifying native community roots or demographic criteria.
                              </p>
                            </div>
                          </div>

                          {/* Step 4: Dispatch */}
                          <div className="relative">
                            <div className={`absolute -left-[23px] top-0.5 h-4.5 w-4.5 rounded-full flex items-center justify-center font-mono text-[9px] font-bold border ${
                              appMatch.status === 'Approved' 
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400/25' 
                                : 'bg-slate-950 text-slate-600 border-white/5'
                            }`}>
                              {appMatch.status === 'Approved' ? <Check className="h-2.5 w-2.5" /> : '4'}
                            </div>
                            <div className="space-y-0.5">
                              <h4 className="text-[11px] font-bold text-white">Digitally Signed & Dispatched</h4>
                              <p className="text-[10px] text-slate-500 font-mono">
                                {appMatch.status === 'Approved' ? 'Issued' : 'Pending Tahsildar approval'}
                              </p>
                              <p className="text-[10.5px] text-slate-400 leading-normal">
                                {appMatch.status === 'Approved' 
                                  ? "Cryptography signature sealed. Official digital certificate dispatched and dispatched for print."
                                  : "Certificate awaits cryptographically sealed Tahsildar signature."}
                              </p>
                            </div>
                          </div>
                        </div>

                        {appMatch.status === 'Approved' && (
                          <div className="pt-2">
                            <button
                              onClick={() => {
                                handleDownloadForm(selectedServiceForStatus.name);
                                setSelectedServiceForStatus(null);
                              }}
                              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Download className="h-4 w-4 text-slate-950" />
                              Download Signed Certificate (PDF)
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 py-3">
                        <div className="p-4 bg-slate-950/60 rounded-xl border border-dashed border-white/10 text-center space-y-2">
                          <AlertCircle className="h-8 w-8 text-amber-400 mx-auto" />
                          <p className="text-xs text-slate-300">No active application logs found matching this service.</p>
                          <p className="text-[10.5px] text-slate-500">You must first submit an eligibility application to track status updates.</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedServiceForStatus(null)}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-xl text-xs cursor-pointer"
                          >
                            Close
                          </button>
                          <button
                            onClick={() => {
                              setSelectedServiceForApply(selectedServiceForStatus);
                              setSelectedServiceForStatus(null);
                            }}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-xs cursor-pointer"
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
