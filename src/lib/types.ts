


export interface AuthUser {
  id: string;
  name: string;
  email: string;
  userType: "Admin" | "Jobseeker" | "Employer" | "University" | "Business" | "Recruiter" | "SubAdmin";
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
  userType: "Admin" | "Jobseeker" | "Employer" | "University" | "Business" | "Recruiter" | "SubAdmin";
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
  name: string; // Contact Person
  email: string;
  phoneNumber?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;

  companyName: string;
  profilePhoto?: string; // Replaces logo
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
