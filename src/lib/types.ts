

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  userType: "Admin" | "SubAdmin" | "Jobseeker" | "Employer" | "University" | "Business";
}

export interface LoginSuccessResponse {
  status: 'success';
  token: string;
  data: {
    user: AuthUser;
  };
}

export interface ProfileUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  isActive: boolean;
  userType: "Admin" | "SubAdmin" | "Jobseeker" | "Employer" | "University" | "Business";
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  profilePhoto?: string;
  phoneNumber?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  headline?: string;
}

export interface GetMeResponse {
    status: string;
    data: ProfileUser;
}

export interface LoginErrorResponse {
  message: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
}

export interface PaginatedApiResponse<T> {
  status: string;
  results: number;
  total: number;
  page: number;
  limit: number;
  data: T[];
}

export const applicationStatuses = [
  "Applied", "Withdrawn", "Viewed", "Under Review", "Shortlisted", "Rejected",
  "Interview Scheduled", "Interview Completed", "Second Round Interview",
  "Technical Round", "HR Round", "Assessment Sent", "Assessment Completed",
  "Waiting for Feedback", "Offered", "Offer Accepted", "Offer Declined",
  "Offer Withdrawn", "Hired", "On Hold", "Withdrawn by Candidate",
  "Auto Rejected", "Disqualified"
] as const;

export type ApplicationStatus = typeof applicationStatuses[number];

export interface ApplicationAnswer {
  _id?: string;
  question: string;
  answer: string | string[] | boolean;
}

export interface Application {
  id: string;
  _id?: string;
  jobSeeker: Jobseeker;
  job: Job;
  resume: string;
  coverLetter?: string;
  answers?: ApplicationAnswer[];
  status: ApplicationStatus;
  appliedAt: Date;
  feedback?: string;
  whyShouldWeHireYou?: string;
  createdAt: Date;
  updatedAt: Date;
}


export interface Question {
  question: string;
  type: "boolean" | "single-choice" | "multi-choice" | "text";
  options?: string[];
  _id?: string;
}

export interface Job {
  id: string;
  _id?: string;
  title: string;
  slug?: string;
  description: string;
  minExperience: number;
  maxExperience: number;
  numberOfPosts?: number;
  type: "full-time" | "part-time" | "contract";
  payrollType: "contract" | "direct";
  contractDuration?: number;
  contractDurationUnit?: "days" | "months" | "years";
  expectedMinHoursPerWeek?: number;
  expectedMaxHoursPerWeek?: number;
  shiftType: "morning" | "evening" | "regular" | "night" | "flexible" | "weekend" | "us" | "uk" | "other";
  otherShiftType?: string;
  ctcCurrency: string;
  ctcMinAmount?: number;
  ctcMaxAmount?: number;
  ctcFrequency: "weeks" | "yearly" | "monthly";
  supplementalPayments?: string[];
  otherSupplementalPaymentType?: string;
  jobCategory: string | JobCategory; // ObjectId as string
  employer: string | Employer; // ObjectId as string
  workMode: ("hybrid" | "remote" | "onsite" | "wfo" | "wfh" | "other")[];
  otherWorkModeType?: string;
  expectedStartDate?: Date;
  postingDate: Date;
  skills: string[]; // Array of skill ObjectIds
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  isActive: boolean;
  languagesRequired?: string[];
  benefits?: string[];
  questions?: Question[];
  createdAt: Date;
  updatedAt: Date;
}


export interface SkillCategory {
    id: string;
    _id?: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}

export interface JobCategory {
    id: string;
    _id?: string;
    name: string;
    slug?: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}

export interface Skill {
    id: string;
    _id?: string;
    name: string;
    description?: string;
    skillCategory: {
        id: string;
        _id?: string;
        name: string;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Business {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  country?: string; // This will now be ISO code
  state?: string;   // This will now be ISO code
  city?: string;    // This will be name
  zipCode?: string;
  profilePhoto?: string;
  about?: string;
  website?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface University {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  profilePhoto?: string;
  about?: string;
  type: "Public" | "Private" | "Community College" | "Technical Institute" | "Research University" | "Liberal Arts College" | "Online University" | "Vocational School" | "Other";
  otherType?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employer {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;

  profilePhoto?: string;
  about?: string;
  website?: string;
  
  taxNumber?: string;
  taxCertificate?: string;
  registrationNumber?: string;
  registrationCertificate?: string;

  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Experience {
    jobTitle: string;
    companyName: string;
    startDate: Date;
    endDate?: Date;
    isCurrent: boolean;
    responsibilities?: string[];
    achievements?: string[];
}

export interface Education {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    cgpa?: string;
    startDate: Date;
    endDate: Date;
}

export interface Project {
  title: string;
  description?: string;
  url?: string;
}

export interface Jobseeker {
    id: string;
    // Basic User Info
    name: string;
    email: string;
    password?: string; // Not usually stored/retrieved on client
    phoneNumber?: string;
    isVerified: boolean;
    isActive: boolean;
    
    // Location Info
    address?: string;
    country?: string;
    state?: string;
    city?: string;
    zipCode?: string;
    
    // Profile Images & Media
    profilePhoto?: string;
    bannerImage?: string;
    resume?: string;
    certifications?: string[];
    
    // Personal & Social Details
    headline?: string;
    summary?: string;
    about?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    passportNumber?: string;
    linkedInProfile?: string;
    githubProfile?: string;
    portfolio?: string;
    fieldOfStudy?: string;

    // Associations
    businessAssociationId?: string;
    universityAssociationId?: string;
    
    skills?: string[];

    // Nested Schemas
    experience?: Experience[];
    education?: Education[];
    projects?: Project[];
    
    createdAt: Date;
    updatedAt: Date;
}

export interface Faq {
  id: string;
  _id?: string;
  question: string;
  answer: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}


export interface GetAllParams {
    page?: number;
    limit?: number;
    sort?: string;
    filters?: Record<string, any>;
    fields?: string;
}

export interface Country {
    name: string;
    isoCode: string;
    flag: string;
}

export interface State {
    name: string;
    isoCode: string;
    countryCode: string;
}

export interface City {
    name: string;
    countryCode: string;
    stateCode: string;
}

export interface LocationApiResponse<T> {
  status: string;
  data: T[];
}
