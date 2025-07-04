
export interface AuthUser {
  id: string;
  name: string;
  email: string;
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
  userType: "Admin" | "Jobseeker" | "Employer" | "University" | "Business" | "Recruiter";
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
}

export interface GetMeResponse {
    status: string;
    data: {
        user: ProfileUser;
    }
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


export interface GetAllParams {
    page?: number;
    limit?: number;
    sort?: string;
    filters?: Record<string, any>;
    fields?: string;
}
