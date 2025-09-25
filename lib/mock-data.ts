// Shared mock data store for the application

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "agency"
  agencyId?: string
  agencyName?: string
  password?: string
  phone?: string
  address?: string
  description?: string
  contactPerson?: string
  website?: string
  socialMedia?: {
    facebook?: string
    twitter?: string
    linkedin?: string
    instagram?: string
  }
}

// Mock users for demonstration (replace with database queries)
export const mockUsers: User[] = [
  {
    id: "admin_1",
    email: "admin@education.com",
    name: "System Administrator",
    role: "admin",
    password: "$2a$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqQqQqQqQqQqQq", // password123
    phone: "+1 (555) 987-6543",
    address: "456 Admin Avenue, Control City, CC 67890",
    description: "System administrator with full access privileges",
    contactPerson: "Jane Doe",
    website: "https://admin.edu-system.com"
  },
  {
    id: "admin_2",
    email: "admin@grindx.io",
    name: "GrindX Administrator",
    role: "admin",
    password: "$2a$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqQqQqQqQqQqQq", // admin123
    phone: "+1 (555) 987-6543",
    address: "456 Admin Avenue, Control City, CC 67890",
    description: "GrindX system administrator with full access privileges",
    contactPerson: "GrindX Admin",
    website: "https://grindx.io"
  },
  {
    id: "user_1",
    email: "contact@globaledu.com",
    name: "Global Education Partners",
    role: "agency",
    agencyId: "agency-1",
    password: "$2a$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqQqQqQqQqQqQq", // password123
    phone: "+1 (555) 123-4567",
    address: "123 Education Street, Learning City, LC 12345",
    description: "Leading education consultancy specializing in international student placements",
    contactPerson: "John Smith",
    website: "https://globaleducation.com",
    socialMedia: {
      facebook: "https://facebook.com/globaleducation",
      twitter: "https://twitter.com/globaledu",
      linkedin: "https://linkedin.com/company/global-education-partners",
      instagram: "https://instagram.com/globaleducation"
    }
  },
  {
    id: "user_2",
    email: "info@studyabroad.com",
    name: "Study Abroad Consultants",
    role: "agency",
    agencyId: "agency-2",
    password: "$2a$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqQqQqQqQqQqQq", // password123
    phone: "+91 87654 32109",
    address: "Connaught Place, New Delhi, Delhi 110001",
    description: "Specialized in UK and US university admissions with 15+ years experience",
    contactPerson: "Priya Sharma",
    website: "https://studyabroad.com",
    socialMedia: {
      facebook: "https://facebook.com/studyabroadconsultants",
      linkedin: "https://linkedin.com/company/study-abroad-consultants"
    }
  },
  {
    id: "user_3",
    email: "hello@dreamuniversity.com",
    name: "Dream University Consultants",
    role: "agency",
    agencyId: "agency-3",
    password: "$2a$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqQqQqQqQqQqQq", // password123
    phone: "+91 98765 12345",
    address: "Bandra West, Mumbai, Maharashtra 400050",
    description: "Premium education consultancy focusing on top-tier universities worldwide",
    contactPerson: "Arjun Mehta",
    website: "https://dreamuniversity.com",
    socialMedia: {
      facebook: "https://facebook.com/dreamuniversityconsultants",
      twitter: "https://twitter.com/dreamuni",
      linkedin: "https://linkedin.com/company/dream-university-consultants",
      instagram: "https://instagram.com/dreamuniversity"
    }
  },
  {
    id: "user_4",
    email: "agency@grindx.io",
    name: "GrindX Education Services",
    role: "agency",
    agencyId: "agency-4",
    password: "$2a$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqQqQqQqQqQqQq", // agency123
    phone: "+91 98765 54321",
    address: "GrindX Office, Tech Park, Bangalore, Karnataka 560001",
    description: "GrindX Education Services - Specialized in international education consulting",
    contactPerson: "GrindX Agency",
    website: "https://agency.grindx.io",
    socialMedia: {
      facebook: "https://facebook.com/grindxeducation",
      twitter: "https://twitter.com/grindxedu",
      linkedin: "https://linkedin.com/company/grindx-education",
      instagram: "https://instagram.com/grindxeducation"
    }
  }
];

// Function to update a user in the mock database
export function updateUser(userId: string, userData: Partial<User>): User | null {
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return null;
  }
  
  mockUsers[userIndex] = {
    ...mockUsers[userIndex],
    ...userData
  };
  
  return mockUsers[userIndex];
}

// Function to get a user by ID
export function getUserById(userId: string): User | null {
  const user = mockUsers.find(u => u.id === userId);
  return user || null;
}

// Function to get a user by email
export function getUserByEmail(email: string): User | null {
  const user = mockUsers.find(u => u.email === email);
  return user || null;
}