export interface Agency {
  id: string
  name: string
  email: string
  phone: string
  address: string
  contactPerson: string
  commissionRate: number
  status: "active" | "inactive"
  createdAt: string
  userId?: string
  username?: string
  totalApplications?: number
  totalRevenue?: number
  applications?: Application[]
  payments?: Payment[]
}

export interface College {
  id: string
  name: string
  location: string
  type: string
  ranking: number
  description: string
  email: string
  phone: string
  facilities: string[]
  courses: Course[]
  status: "active" | "inactive"
  createdAt: string
  establishedYear: number
}

export interface Course {
  id: string
  name: string
  level: string
  duration: string
  fee: number
  currency: string
  requirements: string
  sessions: string[]
  courseType?: string
  streams?: string[]
  status: string
  collegeId: string
}

export interface Application {
  id: string
  _id?: string
  applicationId?: string
  studentName: string
  email: string
  phone: string
  agencyId: string
  agencyName: string
  collegeId: string
  collegeName: string
  courseId: string
  courseName: string
  courseType?: string
  stream?: string
  status: "pending" | "approved" | "rejected" | "processing"
  submittedAt: string
  fees: number
  documents: string[]
  pendingDocuments?: string[]
  abcId?: string
  debId?: string
  academicRecords?: {
    level: string
    board: string
    year: string
    obtainedMarks: string
    percentage: string
    marksheetUrl?: string
  }[]
  studentDetails?: {
    dateOfBirth?: string
    nationality?: string
    address?: string
    personalStatement?: string
    workExperience?: string
    previousEducation?: string
    gpa?: string
    englishProficiency?: string
    fatherName?: string
    motherName?: string
    religion?: string
    caste?: string
    maritalStatus?: string
    aadharPassportNumber?: string
  }
  pdfGenerated?: boolean
  lastUpdated?: string
}

export interface Payment {
  id: string
  applicationId: string
  studentName: string
  agencyId: string
  agencyName: string
  amount: number
  commission: number
  status: "pending" | "paid" | "failed"
  paymentDate: string
  dueDate: string
}

interface User {
  id: string
  username: string
  email: string
  password?: string
  name?: string
  role: "Admin" | "Agency"
  agencyId?: string
  agencyName?: string
  status: "active" | "inactive"
  createdAt: string
  lastLogin?: string
}

interface EscalationMatrix {
  id: string
  level: number
  position: string
  name: string
  mobile: string
  email: string
  createdAt: string
  updatedAt: string
}

interface BankingDetails {
  id: string
  bankName: string
  accountNumber: string
  ifscCode: string
  accountHolderName: string
  branchName: string
  updatedAt: string
}

interface PaymentSettings {
  id: string
  universalPaymentLink: string
  isActive: boolean
  updatedAt: string
}

interface DocumentRequest {
  id: string
  applicationId: string
  documentType: string
  status: "pending" | "uploaded" | "approved" | "rejected"
  requestedAt: string
  uploadedAt?: string
  adminNotes?: string
}

import fs from 'fs';
import path from 'path';

// Simulated database with relationships
class DataStore {
  private dataFilePath = path.join(process.cwd(), 'data', 'agencies.json');
  private applicationsFilePath = path.join(process.cwd(), 'data', 'applications.json');
  private usersFilePath = path.join(process.cwd(), 'data', 'users.json');
  private initialized = false;
  private courses: Course[] = [
    {
      id: "1",
      name: "Computer Science and Engineering",
      level: "Bachelor's",
      duration: "4 years",
      fee: 75000,
      currency: "USD",
      requirements: "High school diploma with strong math and science background",
      sessions: ["Fall 2024", "Spring 2025"],
      courseType: "Engineering",
      streams: ["Computer Science", "Software Engineering"],
      status: "active",
      collegeId: "1"
    },
    {
      id: "2",
      name: "Master of Business Administration",
      level: "Master's",
      duration: "2 years",
      fee: 85000,
      currency: "USD",
      requirements: "Bachelor's degree with minimum 3.0 GPA, GMAT score of 650+",
      sessions: ["Fall 2024", "Spring 2025"],
      courseType: "Business",
      streams: ["Finance", "Marketing", "Operations"],
      status: "active",
      collegeId: "2"
    },
    {
      id: "3",
      name: "Master of Science in Data Science",
      level: "Master's",
      duration: "1.5 years",
      fee: 65000,
      currency: "GBP",
      requirements: "Bachelor's in Computer Science, Statistics, or related field",
      sessions: ["Fall 2024", "Winter 2025"],
      courseType: "Science",
      streams: ["Data Analytics", "Machine Learning"],
      status: "active",
      collegeId: "3"
    }
  ];
  private agencies: Agency[] = [
    {
      id: "1",
      name: "Global Edu Corp",
      email: "contact@globaledu.com",
      phone: "+1 (555) 123-4567",
      address: "123 Education Street, Learning City, LC 12345",
      contactPerson: "Shaggy Sen",
      commissionRate: 77,
      status: "active",
      createdAt: "2024-01-15",
      userId: "user_1",
      username: "globaledu",
    },
    {
      id: "5",
      name: "GrindX Edutech",
      email: "agency@grindx.io",
      phone: "+91 98765 54321",
      address: "GrindX Office, Tech Park, Bangalore, Karnataka 560001",
      contactPerson: "GrindX Agency",
      commissionRate: 22,
      status: "active",
      createdAt: "2024-01-15",
      userId: "agency_1",
      username: "agency",
    },
    {
      id: "2",
      name: "Study Abroad Consultants",
      email: "info@studyabroad.com",
      phone: "+91 87654 32109",
      address: "Connaught Place, New Delhi, Delhi 110001",
      contactPerson: "Priya Sharma",
      commissionRate: 12,
      status: "active",
      createdAt: "2024-01-20",
      userId: "user_2",
      username: "studyabroad",
    },
    {
      id: "3",
      name: "Dream University Consultants",
      email: "hello@dreamuniversity.com",
      phone: "+91 98765 12345",
      address: "Bandra West, Mumbai, Maharashtra 400050",
      contactPerson: "Arjun Mehta",
      commissionRate: 18,
      status: "active",
      createdAt: "2024-01-10",
      userId: "user_3",
      username: "dreamuni",
    },
    {
      id: "4",
      name: "Elite Education Services",
      email: "contact@eliteedu.com",
      phone: "+91 99887 76543",
      address: "Koramangala, Bangalore, Karnataka 560034",
      contactPerson: "Sneha Reddy",
      commissionRate: 14,
      status: "active",
      createdAt: "2024-01-25",
      userId: "user_4",
      username: "eliteedu",
    },
  ]

  private colleges: College[] = [
    {
      id: "1",
      name: "Massachusetts Institute of Technology",
      location: "Cambridge, Massachusetts, USA",
      type: "Private",
      ranking: 1,
      description: "World-renowned institute for technology and innovation",
      email: "admissions@mit.edu",
      phone: "+1 617 253 1000",
      facilities: ["Research Labs", "Library", "Student Housing", "Sports Complex", "Innovation Centers"],
      courses: [],
      status: "active",
      createdAt: "2024-01-10",
      establishedYear: 1861,
    },
    {
      id: "2",
      name: "Stanford University",
      location: "Stanford, California, USA",
      type: "Private",
      ranking: 2,
      description: "Leading research university in Silicon Valley",
      email: "admission@stanford.edu",
      phone: "+1 650 723 2300",
      facilities: ["Research Centers", "Libraries", "Dormitories", "Athletic Facilities", "Medical Center"],
      courses: [],
      status: "active",
      createdAt: "2024-01-12",
      establishedYear: 1885,
    },
    {
      id: "3",
      name: "University of Oxford",
      location: "Oxford, England, UK",
      type: "Public",
      ranking: 3,
      description: "One of the oldest and most prestigious universities in the world",
      email: "admissions@ox.ac.uk",
      phone: "+44 1865 270000",
      facilities: ["Historic Libraries", "Colleges", "Research Institutes", "Museums", "Sports Facilities"],
      courses: [],
      status: "active",
      createdAt: "2024-01-08",
      establishedYear: 1096,
    },
    {
      id: "4",
      name: "University of Toronto",
      location: "Toronto, Ontario, Canada",
      type: "Public",
      ranking: 4,
      description: "Canada's leading research university",
      email: "admissions@utoronto.ca",
      phone: "+1 416 978 2011",
      facilities: ["Research Libraries", "Student Residences", "Athletic Centers", "Medical Facilities"],
      courses: [],
      status: "active",
      createdAt: "2024-01-14",
      establishedYear: 1827,
    },
    {
      id: "5",
      name: "Indian Institute of Technology Delhi",
      location: "New Delhi, Delhi, India",
      type: "Public",
      ranking: 5,
      description: "Premier engineering institute in India",
      email: "admissions@iitd.ac.in",
      phone: "+91 11 2659 1000",
      facilities: ["Engineering Labs", "Central Library", "Hostels", "Sports Complex", "Research Centers"],
      courses: [],
      status: "active",
      createdAt: "2024-01-16",
      establishedYear: 1961,
    },
  ]

  private applications: Application[] = [
    {
      id: "1",
      studentName: "Amit Patel",
      email: "amit.patel@email.com",
      phone: "+91 98765 43210",
      agencyId: "1",
      agencyName: "Global Education Partners",
      collegeId: "1",
      collegeName: "Massachusetts Institute of Technology",
      courseId: "1",
      courseName: "Computer Science and Engineering",
      status: "approved",
      submittedAt: "2024-01-25",
      fees: 75000,
      documents: ["passport.pdf", "transcript.pdf", "recommendation_letter.pdf", "sop.pdf"],
      pendingDocuments: ["Updated Transcript", "IELTS Certificate"],
      studentDetails: {
        dateOfBirth: "1995-03-15",
        nationality: "Indian",
        address: "123 Tech Street, Mumbai, Maharashtra, India",
        previousEducation: "Bachelor of Technology in Computer Science from IIT Bombay",
        gpa: "8.5/10",
        englishProficiency: "IELTS 7.5",
        personalStatement: "Passionate about artificial intelligence and machine learning with 3 years of industry experience.",
        workExperience: "Software Engineer at TCS (2018-2021), Senior Developer at Infosys (2021-2023)"
      },
      pdfGenerated: true,
      lastUpdated: "2024-02-10"
    },
    {
      id: "2",
      studentName: "Priya Sharma",
      email: "priya.sharma@email.com",
      phone: "+91 87654 32109",
      agencyId: "2",
      agencyName: "Study Abroad Consultants",
      collegeId: "2",
      collegeName: "Stanford University",
      courseId: "2",
      courseName: "Master of Business Administration",
      status: "processing",
      submittedAt: "2024-01-28",
      fees: 85000,
      documents: ["passport.pdf", "transcript.pdf", "gmat_scores.pdf", "work_experience.pdf"],
      pendingDocuments: ["Recommendation Letter", "Financial Documents"],
      studentDetails: {
        dateOfBirth: "1994-07-22",
        nationality: "Indian",
        address: "456 Business Avenue, Delhi, India",
        previousEducation: "Bachelor of Commerce from Delhi University, MBA from XLRI",
        gpa: "9.2/10",
        englishProficiency: "TOEFL 110",
        personalStatement: "Experienced business analyst seeking to advance leadership skills in technology management.",
        workExperience: "Business Analyst at McKinsey (2019-2022), Senior Consultant at Deloitte (2022-2024)"
      },
      pdfGenerated: false,
      lastUpdated: "2024-02-08"
    },
    {
      id: "3",
      studentName: "Rahul Kumar",
      email: "rahul.kumar@email.com",
      phone: "+91 99887 76543",
      agencyId: "3",
      agencyName: "Dream University Consultants",
      collegeId: "3",
      collegeName: "University of Oxford",
      courseId: "3",
      courseName: "Master of Science in Data Science",
      status: "pending",
      submittedAt: "2024-02-01",
      fees: 65000,
      documents: ["passport.pdf", "transcript.pdf", "ielts_scores.pdf", "research_proposal.pdf"],
      pendingDocuments: ["Police Clearance", "Medical Certificate", "Updated Transcript"],
      studentDetails: {
        dateOfBirth: "1996-11-08",
        nationality: "Indian",
        address: "789 Data Lane, Bangalore, Karnataka, India",
        previousEducation: "Bachelor of Engineering in Information Technology from VIT University",
        gpa: "8.8/10",
        englishProficiency: "IELTS 8.0",
        personalStatement: "Data science enthusiast with strong background in machine learning and statistical analysis.",
        workExperience: "Data Analyst at Flipkart (2020-2022), ML Engineer at Zomato (2022-2024)"
      },
      pdfGenerated: true,
      lastUpdated: "2024-02-12"
    },
    {
      id: "4",
      studentName: "Sneha Reddy",
      email: "sneha.reddy@email.com",
      phone: "+91 98765 12345",
      agencyId: "1",
      agencyName: "Global Education Partners",
      collegeId: "4",
      collegeName: "University of Toronto",
      courseId: "4",
      courseName: "Master of Engineering in Electrical Engineering",
      status: "approved",
      submittedAt: "2024-01-30",
      fees: 55000,
      documents: ["passport.pdf", "transcript.pdf", "toefl_scores.pdf", "portfolio.pdf"],
    },
    {
      id: "5",
      studentName: "Arjun Mehta",
      email: "arjun.mehta@email.com",
      phone: "+91 87654 98765",
      agencyId: "2",
      agencyName: "Study Abroad Consultants",
      collegeId: "5",
      collegeName: "Indian Institute of Technology Delhi",
      courseId: "5",
      courseName: "Master of Technology in Computer Science",
      status: "rejected",
      submittedAt: "2024-01-20",
      fees: 25000,
      documents: ["transcript.pdf", "gate_scores.pdf", "sop.pdf"],
    },
    {
      id: "6",
      studentName: "Kavya Singh",
      email: "kavya.singh@email.com",
      phone: "+91 99887 65432",
      agencyId: "4",
      agencyName: "Elite Education Services",
      collegeId: "1",
      collegeName: "Massachusetts Institute of Technology",
      courseId: "6",
      courseName: "Master of Science in Artificial Intelligence",
      status: "processing",
      submittedAt: "2024-02-05",
      fees: 80000,
      documents: ["passport.pdf", "transcript.pdf", "gre_scores.pdf", "research_papers.pdf"],
    },
  ]

  private payments: Payment[] = [
    {
      id: "1",
      applicationId: "1",
      studentName: "Amit Patel",
      agencyId: "1",
      agencyName: "Global Education Partners",
      amount: 75000,
      commission: 11250,
      status: "paid",
      paymentDate: "2024-02-01",
      dueDate: "2024-02-15",
    },
    {
      id: "2",
      applicationId: "2",
      studentName: "Priya Sharma",
      agencyId: "2",
      agencyName: "Study Abroad Consultants",
      amount: 85000,
      commission: 10200,
      status: "pending",
      paymentDate: "2024-02-05",
      dueDate: "2024-02-20",
    },
    {
      id: "3",
      applicationId: "3",
      studentName: "Rahul Kumar",
      agencyId: "3",
      agencyName: "Dream University Consultants",
      amount: 65000,
      commission: 11700,
      status: "pending",
      paymentDate: "2024-02-08",
      dueDate: "2024-02-25",
    },
    {
      id: "4",
      applicationId: "4",
      studentName: "Sneha Reddy",
      agencyId: "1",
      agencyName: "Global Education Partners",
      amount: 55000,
      commission: 8250,
      status: "paid",
      paymentDate: "2024-02-03",
      dueDate: "2024-02-18",
    },
    {
      id: "5",
      applicationId: "6",
      studentName: "Kavya Singh",
      agencyId: "4",
      agencyName: "Elite Education Services",
      amount: 80000,
      commission: 11200,
      status: "pending",
      paymentDate: "2024-02-10",
      dueDate: "2024-02-28",
    },
    {
      id: "6",
      applicationId: "1",
      studentName: "Amit Patel",
      agencyId: "1",
      agencyName: "Global Education Partners",
      amount: 25000,
      commission: 3750,
      status: "paid",
      paymentDate: "2024-01-15",
      dueDate: "2024-01-30",
    },
  ]

  private escalationMatrix: EscalationMatrix[] = [
    {
      id: "1",
      level: 1,
      position: "Customer Support Representative",
      name: "John Smith",
      mobile: "+1 (555) 123-4567",
      email: "john.smith@education.com",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01"
    },
    {
      id: "2",
      level: 2,
      position: "Senior Support Manager",
      name: "Sarah Johnson",
      mobile: "+1 (555) 234-5678",
      email: "sarah.johnson@education.com",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01"
    },
    {
      id: "3",
      level: 3,
      position: "Director of Student Services",
      name: "Michael Brown",
      mobile: "+1 (555) 345-6789",
      email: "michael.brown@education.com",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01"
    }
  ]

  private bankingDetails: BankingDetails[] = [
    {
      id: "1",
      bankName: "State Bank of India",
      accountNumber: "1234567890123456",
      ifscCode: "SBIN0001234",
      accountHolderName: "Education Management System",
      branchName: "Main Branch, New Delhi",
      updatedAt: "2024-01-01"
    }
  ]

  private paymentSettings: PaymentSettings[] = [
    {
      id: "1",
      universalPaymentLink: "https://payments.education.com/pay",
      isActive: true,
      updatedAt: "2024-01-01"
    }
  ]

  private documentRequests: DocumentRequest[] = [
    {
      id: "1",
      applicationId: "1",
      documentType: "Updated Transcript",
      status: "pending",
      requestedAt: "2024-02-01",
      adminNotes: "Please provide updated academic transcript"
    },
    {
      id: "2",
      applicationId: "2",
      documentType: "IELTS Certificate",
      status: "uploaded",
      requestedAt: "2024-01-28",
      uploadedAt: "2024-02-02"
    }
  ]

  private users: User[] = [
    {
      id: "user_1",
      username: "globaledu",
      email: "contact@globaledu.com",
      name: "Global Edu Corp",
      role: "Agency",
      agencyId: "1",
      agencyName: "Global Edu Corp",
      status: "active",
      createdAt: "2024-01-15",
      lastLogin: "2024-02-10",
    },
    {
      id: "user_2",
      username: "studyabroad",
      email: "info@studyabroad.com",
      name: "Study Abroad Consultants",
      role: "Agency",
      agencyId: "2",
      agencyName: "Study Abroad Consultants",
      status: "active",
      createdAt: "2024-01-20",
      lastLogin: "2024-02-08",
    },
    {
      id: "user_3",
      username: "dreamuni",
      email: "hello@dreamuniversity.com",
      name: "Dream University Consultants",
      role: "Agency",
      agencyId: "3",
      agencyName: "Dream University Consultants",
      status: "active",
      createdAt: "2024-01-10",
      lastLogin: "2024-02-09",
    },
    {
      id: "user_4",
      username: "eliteedu",
      email: "contact@eliteedu.com",
      name: "Elite Education Services",
      role: "Agency",
      agencyId: "4",
      agencyName: "Elite Education Services",
      status: "active",
      createdAt: "2024-01-25",
      lastLogin: "2024-02-11",
    },
    {
      id: "admin_1",
      username: "admin",
      email: "admin@education.com",
      name: "System Administrator",
      role: "Admin",
      status: "active",
      createdAt: "2024-01-01",
      lastLogin: "2024-02-11",
    },
    {
      id: "admin_2",
      username: "admin",
      email: "admin@grindx.io",
      name: "GrindX Administrator",
      role: "Admin",
      status: "active",
      createdAt: "2024-01-01",
      lastLogin: "2024-02-11",
    },
    {
      id: "agency_1",
      username: "agency",
      email: "agency@grindx.io",
      name: "GrindX Agency",
      role: "Agency",
      agencyId: "5",
      agencyName: "GrindX Edutech",
      status: "active",
      createdAt: "2024-01-01",
      lastLogin: "2024-02-11",
    },
  ]

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage() {
    if (this.initialized) return;
    
    try {
      // Create data directory if it doesn't exist
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // Always load agencies from file if it exists to ensure data consistency
      if (fs.existsSync(this.dataFilePath)) {
        const data = fs.readFileSync(this.dataFilePath, 'utf8');
        const savedAgencies = JSON.parse(data);
        if (Array.isArray(savedAgencies) && savedAgencies.length > 0) {
          this.agencies = savedAgencies;
          console.log('Loaded agencies from file:', this.agencies.length);
          // Clear cache to force fresh data
          this.agenciesCache = null;
          this.agencyCache.clear();
        }
      } else {
        // Save initial agencies to file
        this.saveAgencies();
      }

      // Load applications from file if it exists
      if (fs.existsSync(this.applicationsFilePath)) {
        const data = fs.readFileSync(this.applicationsFilePath, 'utf8');
        const savedApplications = JSON.parse(data);
        if (Array.isArray(savedApplications) && savedApplications.length > 0) {
          this.applications = savedApplications;
          console.log('Loaded applications from file:', this.applications.length);
        }
      } else {
        // Save initial applications to file
        this.saveApplications();
      }

      // Load users from file if it exists
      if (fs.existsSync(this.usersFilePath)) {
        const data = fs.readFileSync(this.usersFilePath, 'utf8');
        const savedUsers = JSON.parse(data);
        if (Array.isArray(savedUsers) && savedUsers.length > 0) {
          this.users = savedUsers;
          console.log('Loaded users from file:', this.users.length);
        }
      } else {
        // Save initial users to file
        this.saveUsers();
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing data storage:', error);
    }
  }

  private saveAgencies() {
    try {
      fs.writeFileSync(this.dataFilePath, JSON.stringify(this.agencies, null, 2), 'utf8');
      console.log('Saved agencies to file');
      
      // Invalidate agencies cache after saving to ensure data consistency
      this.agenciesCache = null;
    } catch (error) {
      console.error('Error saving agencies to file:', error);
    }
  }

  private saveApplications() {
    try {
      fs.writeFileSync(this.applicationsFilePath, JSON.stringify(this.applications, null, 2), 'utf8');
      console.log('Saved applications to file');
    } catch (error) {
      console.error('Error saving applications to file:', error);
    }
  }

  private saveUsers() {
    try {
      fs.writeFileSync(this.usersFilePath, JSON.stringify(this.users, null, 2), 'utf8');
      console.log('Saved users to file');
    } catch (error) {
      console.error('Error saving users to file:', error);
    }
  }

  // Agency operations
  // Optimized getAgencies with caching
  private agenciesCache: {agencies: Agency[], timestamp: number} | null = null
  private AGENCIES_CACHE_TTL = 60 * 1000 // 1 minute cache TTL
  
  async getAgencies(): Promise<Agency[]> {
    // Check cache first
    const now = Date.now()
    
    if (this.agenciesCache && (now - this.agenciesCache.timestamp) < this.AGENCIES_CACHE_TTL) {
      return this.agenciesCache.agencies
    }
    
    // Cache miss, update cache
    this.agenciesCache = {
      agencies: [...this.agencies],
      timestamp: now
    }
    
    return this.agenciesCache.agencies
  }

  // Optimized getAgency with tiered caching strategy and performance improvements
  private agencyCache = new Map<string, {agency: Agency, timestamp: number, applications?: Application[], payments?: Payment[]}>();
  private AGENCY_CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache TTL (increased)
  private AGENCY_CACHE_STALE_TTL = 30 * 60 * 1000; // 30 minutes stale cache TTL (increased)
  
  async getAgency(id: string, includeStats: boolean = false): Promise<Agency | undefined> {
    // Validate ID first
    if (!id) {
      console.error('Invalid agency ID:', id);
      return undefined;
    }
    
    // Check cache first
    const cached = this.agencyCache.get(id);
    const now = Date.now();
    
    // Return fresh cache if available
    if (cached && (now - cached.timestamp) < this.AGENCY_CACHE_TTL) {
      // If we need stats and they're already cached, return the full object
      if (includeStats && cached.applications && cached.payments) {
        const agency = {...cached.agency};
        agency.totalApplications = cached.applications.length;
        agency.totalRevenue = cached.payments
          .filter(p => p.status.toLowerCase() === 'paid')
          .reduce((sum, p) => sum + p.amount, 0);
        return agency;
      }
      // Otherwise just return the agency
      return cached.agency;
    }
    
    // Return stale cache if available (within stale TTL)
    if (cached && (now - cached.timestamp) < this.AGENCY_CACHE_STALE_TTL) {
      // Schedule background refresh without blocking
      // Use a microtask to avoid blocking the main thread
      queueMicrotask(() => {
        this.refreshAgencyCache(id, includeStats)
          .catch(err => console.error('Background refresh error:', err));
      });
      
      // Return stale data immediately
      if (includeStats && cached.applications && cached.payments) {
        const agency = {...cached.agency};
        agency.totalApplications = cached.applications.length;
        agency.totalRevenue = cached.payments
          .filter(p => p.status.toLowerCase() === 'paid')
          .reduce((sum, p) => sum + p.amount, 0);
        return agency;
      }
      return cached.agency;
    }
    
    // Cache miss or stale, fetch fresh data
    return await this.refreshAgencyCache(id, includeStats);
  }
  
  // Helper method to refresh agency cache - now async for better performance
  private async refreshAgencyCache(id: string, includeStats: boolean = false): Promise<Agency | undefined> {
    try {
      // Log the refresh attempt
      console.log(`Refreshing agency cache for ID: ${id}, includeStats: ${includeStats}`);
      
      // Validate ID
      if (!id) {
        console.error('Invalid agency ID for refresh:', id);
        return undefined;
      }
      
      // Fetch from data with minimal blocking - try both id and userId
      let agency = this.agencies.find((a) => a.id === id);
      
      // If not found by id, try to find by userId
      if (!agency) {
        agency = this.agencies.find((a) => a.userId === id);
      }
      
      if (!agency) {
        console.log(`Agency not found with ID or userId: ${id}`);
        return undefined;
      }
      
      // Update cache if agency found
      const cacheEntry: {
        agency: Agency;
        timestamp: number;
        applications?: Application[];
        payments?: Payment[];
      } = {
        agency: {...agency},
        timestamp: Date.now()
      };
      
      // If stats are requested, include applications and payments
      if (includeStats) {
        try {
          // Use Promise.all to fetch data in parallel with timeout
          const [applications, payments] = await Promise.all([
            Promise.resolve(this.getApplicationsByAgencyId(id)),
            Promise.resolve(this.getPaymentsByAgencyId(id))
          ]);
          
          cacheEntry.applications = applications;
          cacheEntry.payments = payments;
          
          // Add stats to returned agency object
          agency.totalApplications = applications.length;
          agency.totalRevenue = payments
            .filter(p => p.status.toLowerCase() === 'paid')
            .reduce((sum, p) => sum + p.amount, 0);
        } catch (statsError) {
          console.error('Error fetching agency stats:', statsError);
          // Continue with basic agency data even if stats fail
        }
      }
      
      this.agencyCache.set(id, cacheEntry);
      return agency;
    } catch (error) {
      console.error('Error in refreshAgencyCache:', error);
      throw error;
    }
  }

  createAgency(agency: Omit<Agency, "id" | "createdAt">): Agency {
    const newAgency: Agency = {
      ...agency,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
    }
    this.agencies.push(newAgency)
    
    // Invalidate agencies cache
    this.agenciesCache = null;
    
    // Save changes to file
    this.saveAgencies();
    
    // Broadcast event for real-time updates with enhanced targeting
    import("../app/api/events/route").then(({ broadcastEvent }) => {
      broadcastEvent({
        type: "agency",
        action: "create",
        data: newAgency,
        version: 1,
        modifiedBy: 'system',
        timestamp: new Date().toISOString(),
        targetRoles: ['admin', 'agency'],
        targetAgencyIds: [newAgency.id]
      })
    }).catch(err => console.error('Error broadcasting agency creation:', err))
    
    return newAgency
  }

  updateAgency(id: string, updates: Partial<Agency>): Agency | null {
    const index = this.agencies.findIndex((a) => a.id === id)
    
    if (index === -1) {
      return null
    }
    
    // Store previous status if it's being updated
    const previousStatus = updates.status && this.agencies[index].status !== updates.status 
      ? this.agencies[index].status 
      : undefined
    
    // Update the agency
    this.agencies[index] = { ...this.agencies[index], ...updates }
    
    // Invalidate caches
    this.agencyCache.delete(id)
    this.agenciesCache = null
    
    // Save changes to file
    this.saveAgencies();
    
    // Broadcast event for real-time updates
    import("../app/api/events/route").then(({ broadcastEvent }) => {
      broadcastEvent({
        type: "agency",
        action: "update",
        data: {
          ...this.agencies[index],
          _previousStatus: previousStatus // Include previous status for tracking changes
        },
      })
    }).catch(err => console.error('Error broadcasting agency update:', err))
    
    return this.agencies[index]
  }

  deleteAgency(id: string): boolean {
    const index = this.agencies.findIndex((a) => a.id === id)
    if (index === -1) return false
    this.agencies.splice(index, 1)
    
    // Invalidate caches
    this.agencyCache.delete(id)
    this.agenciesCache = null
    
    // Save changes to file
    this.saveAgencies();
    
    return true
  }
  
  getApplicationsByAgencyId(agencyId: string): Application[] {
    return this.applications.filter(app => app.agencyId === agencyId)
  }
  
  getPaymentsByAgencyId(agencyId: string): Payment[] {
    return this.payments.filter(payment => payment.agencyId === agencyId)
  }

  // College operations
  getColleges(): College[] {
    return this.colleges
  }

  async getCollege(id: string): Promise<College | undefined> {
    return this.colleges.find((c) => c.id === id)
  }

  createCollege(college: Omit<College, "id" | "createdAt" | "courses">): College {
    const newCollege: College = {
      ...college,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
      courses: [],
    }
    this.colleges.push(newCollege)
    return newCollege
  }

  updateCollege(id: string, updates: Partial<College>): College | null {
    const index = this.colleges.findIndex((c) => c.id === id)
    if (index === -1) return null
    this.colleges[index] = { ...this.colleges[index], ...updates }
    return this.colleges[index]
  }

  deleteCollege(id: string): boolean {
    const index = this.colleges.findIndex((c) => c.id === id)
    if (index === -1) return false
    this.colleges.splice(index, 1)
    return true
  }

  // Application operations
  getApplications(): Application[] {
    return this.applications;
  }

  getApplicationsByAgency(agencyId: string): Application[] {
    return this.applications.filter(app => app.agencyId === agencyId)
  }

  // Get applications for a specific user (agency users only see their own)
  getApplicationsByUser(userId: string): Application[] {
    const user = this.getUser(userId)
    if (!user) return []
    
    if (user.role === "Admin") {
      return this.applications // Admin sees all applications
    } else if (user.role === "Agency" && user.agencyId) {
      return this.applications.filter(app => app.agencyId === user.agencyId)
    }
    
    return []
  }

  async getApplication(id: string): Promise<Application | undefined> {
    return this.applications.find((a) => a.id === id)
  }

  async createApplication(application: Omit<Application, "id" | "submittedAt">): Promise<Application> {
    const agency = await this.getAgency(application.agencyId)
    const college = await this.getCollege(application.collegeId)

    const newApplication: Application = {
      ...application,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString().split("T")[0],
      agencyName: agency?.name ?? "Unknown Agency",
      collegeName: college?.name ?? "Unknown College",
    }
    this.applications.push(newApplication)

    // Save applications to file
    this.saveApplications();

    // Create corresponding payment record
    this.createPayment({
      applicationId: newApplication.id,
      studentName: newApplication.studentName,
      agencyId: newApplication.agencyId,
      agencyName: newApplication.agencyName,
      amount: newApplication.fees,
      commission: (newApplication.fees * (agency?.commissionRate ?? 10)) / 100,
      status: "pending",
      paymentDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    })

    // Broadcast event for real-time updates
    import("../app/api/events/route").then(({ broadcastEvent }) => {
      broadcastEvent({
        type: "application",
        action: "create",
        data: newApplication,
      })
    }).catch(err => console.error('Error broadcasting application create:', err))

    return newApplication
  }

  updateApplication(id: string, updates: Partial<Application>): Application | null {
    const index = this.applications.findIndex((a) => a.id === id)
    if (index === -1) return null
    this.applications[index] = { ...this.applications[index], ...updates }
    
    // Save applications to file
    this.saveApplications();

    // Broadcast event for real-time updates
    import("../app/api/events/route").then(({ broadcastEvent }) => {
      broadcastEvent({
        type: "application",
        action: "update",
        data: this.applications[index],
      })
    }).catch(err => console.error('Error broadcasting application update:', err))

    return this.applications[index]
  }

  deleteApplication(id: string): Application | null {
    const index = this.applications.findIndex((a) => a.id === id)
    if (index === -1) return null
    const deletedApplication = this.applications[index]
    this.applications.splice(index, 1)
    
    // Save applications to file
    this.saveApplications();

    // Broadcast event for real-time updates
    import("../app/api/events/route").then(({ broadcastEvent }) => {
      broadcastEvent({
        type: "application",
        action: "delete",
        data: deletedApplication,
      })
    }).catch(err => console.error('Error broadcasting application delete:', err))

    return deletedApplication
  }

  // Payment operations
  getPayments(): Payment[] {
    return this.payments
  }

  getPaymentsByAgency(agencyId: string): Payment[] {
    return this.payments.filter((p) => p.agencyId === agencyId)
  }

  createPayment(payment: Omit<Payment, "id">): Payment {
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
    }
    this.payments.push(newPayment)
    return newPayment
  }

  updatePayment(id: string, updates: Partial<Payment>): Payment | null {
    const index = this.payments.findIndex((p) => p.id === id)
    if (index === -1) return null
    this.payments[index] = { ...this.payments[index], ...updates }
    return this.payments[index]
  }

  // User operations
  getUsers(): User[] {
    return this.users
  }

  getUser(id: string): User | undefined {
    return this.users.find((u) => u.id === id)
  }

  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id)
  }

  getUserByUsername(username: string): User | undefined {
    return this.users.find((u) => u.username === username)
  }

  createUser(user: Omit<User, "id" | "createdAt">): User {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
    }
    
    // If creating an agency user, automatically create or link to agency record
    if (user.role === "Agency" && user.agencyName) {
      // Check if agency already exists
      let existingAgency = this.agencies.find(agency => 
        agency.name === user.agencyName || agency.email === user.email
      )
      
      if (!existingAgency) {
        // Create new agency record
        const newAgency: Agency = {
          id: `agency_${Date.now()}`,
          name: user.agencyName,
          email: user.email,
          phone: "",
          address: "",
          contactPerson: user.name || user.username,
          commissionRate: 15, // Default commission rate
          status: "active",
          createdAt: new Date().toISOString().split("T")[0],
          userId: newUser.id,
          username: user.username
        }
        this.agencies.push(newAgency)
        newUser.agencyId = newAgency.id
      } else {
        // Link to existing agency
        newUser.agencyId = existingAgency.id
        // Update agency with user info if not already set
        if (!existingAgency.userId) {
          existingAgency.userId = newUser.id
          existingAgency.username = user.username
        }
      }
    }
    
    this.users.push(newUser)
    
    // Save users to file
    this.saveUsers();
    
    return newUser
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const index = this.users.findIndex((u) => u.id === id)
    if (index === -1) return null
    
    // Store previous status if it's being updated
    const previousStatus = updates.status && this.users[index].status !== updates.status 
      ? this.users[index].status 
      : undefined
    
    this.users[index] = { ...this.users[index], ...updates }
    
    // Save users to file
    this.saveUsers();
    
    // Broadcast event for real-time updates
    import("../app/api/events/route").then(({ broadcastEvent }) => {
      broadcastEvent({
        type: "user",
        action: "update",
        data: {
          ...this.users[index],
          _previousStatus: previousStatus // Include previous status for tracking changes
        },
      })
    }).catch(err => console.error('Error broadcasting user update:', err))
    
    return this.users[index]
  }

  deleteUser(id: string): User | null {
    const index = this.users.findIndex((u) => u.id === id)
    if (index === -1) return null
    const deletedUser = this.users[index]
    this.users.splice(index, 1)
    
    // Save users to file
    this.saveUsers();
    
    return deletedUser
  }

  resetUserPassword(id: string, newPassword: string): User | null {
    const index = this.users.findIndex((u) => u.id === id)
    if (index === -1) return null
    // In a real app, you would hash the password with bcrypt
    // For now, storing plain text for demo purposes
    this.users[index] = { 
      ...this.users[index], 
      password: newPassword,
      lastLogin: new Date().toISOString() 
    }
    
    // Save users to file
    this.saveUsers();
    
    return this.users[index]
  }

  // Escalation Matrix operations
  getEscalationMatrix(): EscalationMatrix[] {
    return this.escalationMatrix.sort((a, b) => a.level - b.level)
  }

  createEscalationEntry(entry: Omit<EscalationMatrix, "id" | "createdAt" | "updatedAt">): EscalationMatrix {
    const newEntry: EscalationMatrix = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.escalationMatrix.push(newEntry)
    return newEntry
  }

  updateEscalationEntry(id: string, updates: Partial<EscalationMatrix>): EscalationMatrix | null {
    const index = this.escalationMatrix.findIndex((e) => e.id === id)
    if (index === -1) return null
    this.escalationMatrix[index] = {
      ...this.escalationMatrix[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    return this.escalationMatrix[index]
  }

  deleteEscalationEntry(id: string): boolean {
    const index = this.escalationMatrix.findIndex((e) => e.id === id)
    if (index === -1) return false
    this.escalationMatrix.splice(index, 1)
    return true
  }

  // Banking Details operations
  getBankingDetails(): BankingDetails | null {
    return this.bankingDetails[0] || null
  }

  updateBankingDetails(updates: Partial<BankingDetails>): BankingDetails {
    if (this.bankingDetails.length === 0) {
      const newDetails: BankingDetails = {
        id: "1",
        bankName: updates.bankName || "",
        accountNumber: updates.accountNumber || "",
        ifscCode: updates.ifscCode || "",
        accountHolderName: updates.accountHolderName || "",
        branchName: updates.branchName || "",
        updatedAt: new Date().toISOString()
      }
      this.bankingDetails.push(newDetails)
      return newDetails
    }
    
    this.bankingDetails[0] = {
      ...this.bankingDetails[0],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    return this.bankingDetails[0]
  }

  // Payment Settings operations
  getPaymentSettings(): PaymentSettings | null {
    return this.paymentSettings[0] || null
  }

  updatePaymentSettings(updates: Partial<PaymentSettings>): PaymentSettings {
    if (this.paymentSettings.length === 0) {
      const newSettings: PaymentSettings = {
        id: "1",
        universalPaymentLink: updates.universalPaymentLink || "",
        isActive: updates.isActive || false,
        updatedAt: new Date().toISOString()
      }
      this.paymentSettings.push(newSettings)
      return newSettings
    }
    
    this.paymentSettings[0] = {
      ...this.paymentSettings[0],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    return this.paymentSettings[0]
  }

  // Document Request operations
  getDocumentRequests(): DocumentRequest[] {
    return this.documentRequests
  }

  getDocumentRequestsByApplication(applicationId: string): DocumentRequest[] {
    return this.documentRequests.filter(req => req.applicationId === applicationId)
  }

  createDocumentRequest(request: Omit<DocumentRequest, "id" | "requestedAt">): DocumentRequest {
    const newRequest: DocumentRequest = {
      ...request,
      id: Date.now().toString(),
      requestedAt: new Date().toISOString()
    }
    this.documentRequests.push(newRequest)
    return newRequest
  }

  updateDocumentRequest(id: string, updates: Partial<DocumentRequest>): DocumentRequest | null {
    const index = this.documentRequests.findIndex((req) => req.id === id)
    if (index === -1) return null
    this.documentRequests[index] = {
      ...this.documentRequests[index],
      ...updates
    }
    return this.documentRequests[index]
  }

  // Analytics
  getStats() {
    return {
      totalAgencies: this.users.filter((u) => u.role === "Agency").length,
      activeAgencies: this.users.filter((u) => u.role === "Agency" && u.status === "active").length,
      totalColleges: this.colleges.length,
      activeColleges: this.colleges.filter((c) => c.status === "active").length,
      totalApplications: this.applications.length,
      pendingApplications: this.applications.filter((a) => a.status === "pending").length,
      approvedApplications: this.applications.filter((a) => a.status === "approved").length,
      totalPayments: this.payments.reduce((sum, p) => sum + p.amount, 0),
      pendingPayments: this.payments.filter((p) => p.status === "pending").length,
      totalCommissions: this.payments.reduce((sum, p) => sum + p.commission, 0),
    }
  }
  // Course operations
  getCoursesByCollegeId(collegeId: string): Course[] {
    // Initialize courses array if it's not already initialized
    if (!this.courses) {
      this.courses = [];
    }
    return this.courses.filter(course => course.collegeId === collegeId)
  }

  getCoursesByCollege(collegeId: string): Course[] {
    return this.getCoursesByCollegeId(collegeId)
  }
  
  getCourse(id: string): Course | undefined {
    return this.courses.find(course => course.id === id)
  }

  createCourse(course: Omit<Course, "id">): Course {
    const newCourse: Course = {
      ...course,
      id: Date.now().toString(),
    }
    this.courses.push(newCourse)

    // Broadcast event for real-time updates
    import("../app/api/events/route").then(({ broadcastEvent }) => {
      broadcastEvent({
        type: "course",
        action: "create",
        data: newCourse,
        collegeId: newCourse.collegeId
      })
    }).catch(err => console.error('Error broadcasting course creation:', err))

    return newCourse
  }

  updateCourse(id: string, updates: Partial<Course>): Course | null {
    const index = this.courses.findIndex(course => course.id === id)
    if (index === -1) return null

    this.courses[index] = { ...this.courses[index], ...updates }

    // Broadcast event for real-time updates
    import("../app/api/events/route").then(({ broadcastEvent }) => {
      broadcastEvent({
        type: "course",
        action: "update",
        data: this.courses[index],
        collegeId: this.courses[index].collegeId
      })
    }).catch(err => console.error('Error broadcasting course update:', err))

    return this.courses[index]
  }

  deleteCourse(id: string): boolean {
    const index = this.courses.findIndex(course => course.id === id)
    if (index === -1) return false

    const deletedCourse = this.courses[index]
    this.courses.splice(index, 1)

    // Broadcast event for real-time updates
    import("../app/api/events/route").then(({ broadcastEvent }) => {
      broadcastEvent({
        type: "course",
        action: "delete",
        data: { id },
        collegeId: deletedCourse.collegeId
      })
    }).catch(err => console.error('Error broadcasting course deletion:', err))

    return true
  }
}

export const dataStore = new DataStore()
export { DataStore }
export type { User, EscalationMatrix, BankingDetails, PaymentSettings, DocumentRequest }
