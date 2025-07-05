

import type { LoginSuccessResponse, SkillCategory, JobCategory, PaginatedApiResponse, Pagination, GetAllParams, Skill, GetMeResponse, AuthUser, Business, University, Country, State, City, Employer, Jobseeker, Faq } from '@/lib/types';

async function authedFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers = new Headers(options.headers);
  // Do not set Content-Type if body is FormData, browser will do it
  if (!(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    if (!response.ok) {
        throw new Error(response.statusText || 'An error occurred with no content.');
    }
    return null;
  }
  
  const data = await response.json().catch(() => {
    if (!response.ok) {
        throw new Error(response.statusText || 'An unknown error occurred.');
    }
    return { message: 'Failed to parse JSON response.' };
  });

  if (!response.ok) {
    const error: any = new Error(data.message || 'An error occurred.');
    error.data = data;
    throw error;
  }
  
  return data;
}

async function publicFetch(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    if (!response.ok) {
        throw new Error(response.statusText || 'An error occurred with no content.');
    }
    return null;
  }
  
  const data = await response.json().catch(() => {
    if (!response.ok) {
        throw new Error(response.statusText || 'An unknown error occurred.');
    }
    return { message: 'Failed to parse JSON response.' };
  });

  if (!response.ok) {
    const error: any = new Error(data.message || 'An error occurred.');
    error.data = data;
    throw error;
  }
  
  return data;
}


export function buildQueryString(params: GetAllParams = {}): string {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());
  if (params.sort) query.set('sort', params.sort);
  if (params.fields) query.set('fields', params.fields);
  if (params.filters) {
    for (const key in params.filters) {
      const value = params.filters[key];
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, value.toString());
      }
    }
  }
  return query.toString();
}

function mapItem(item: any) {
  if (item && item._id) {
    item.id = item._id;
    delete item._id;
  }
  return item;
}

export async function loginUser(credentials: { email: string; password: string }): Promise<LoginSuccessResponse> {
  const response = await fetch(`/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred during login.');
  }

  return data;
}

export async function getMe(): Promise<GetMeResponse> {
  return authedFetch(`/api/v1/auth/me`);
}

export async function updateAdminUser(id: string, userData: FormData): Promise<AuthUser> {
  const response = await authedFetch(`/api/v1/admin-users/${id}`, {
    method: 'PUT',
    body: userData,
  });
  return response.data.user;
}


// Skill Categories
export async function getSkillCategories(params: GetAllParams = {}): Promise<{ data: SkillCategory[], pagination: Pagination }> {
  const queryString = buildQueryString(params);
  const response: PaginatedApiResponse<any> = await authedFetch(`/api/v1/skill-categories?${queryString}`);
  
  const data = response.data.map(mapItem).map((item: any) => ({
    ...item,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  }));

  const pagination: Pagination = {
    currentPage: response.page,
    limit: response.limit,
    totalRecords: response.total,
    totalPages: Math.ceil(response.total / response.limit),
  };

  return { data, pagination };
}

export async function getSkillCategory(id: string): Promise<SkillCategory> {
    const response = await authedFetch(`/api/v1/skill-categories/${id}`);
    const item = response.data;
    if (!item) {
        throw new Error("Skill category not found in API response.");
    }
    return {
        ...mapItem(item),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
    };
}

export async function createSkillCategory(categoryData: Partial<Omit<SkillCategory, 'id'>>): Promise<SkillCategory> {
  const response = await authedFetch(`/api/v1/skill-categories`, {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
  const item = response.data;
  if (!item) {
    throw new Error("Created category data not found in API response.");
  }
  return {
    ...mapItem(item),
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

export async function updateSkillCategory(id: string, categoryData: Partial<Omit<SkillCategory, 'id'>>): Promise<SkillCategory> {
  const response = await authedFetch(`/api/v1/skill-categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  });
  const item = response.data;
  if (!item) {
    throw new Error("Updated category data not found in API response.");
  }
  return {
    ...mapItem(item),
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

export async function deleteSkillCategory(id: string): Promise<null> {
  return authedFetch(`/api/v1/skill-categories/${id}`, {
    method: 'DELETE',
  });
}

// Job Categories
export async function getJobCategories(params: GetAllParams = {}): Promise<{ data: JobCategory[], pagination: Pagination }> {
  const queryString = buildQueryString(params);
  const response: PaginatedApiResponse<any> = await authedFetch(`/api/v1/job-categories?${queryString}`);
  
  const data = response.data.map(mapItem).map((item: any) => ({
    ...item,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  }));

  const pagination: Pagination = {
    currentPage: response.page,
    limit: response.limit,
    totalRecords: response.total,
    totalPages: Math.ceil(response.total / response.limit),
  };

  return { data, pagination };
}

export async function getJobCategory(id: string): Promise<JobCategory> {
    const response = await authedFetch(`/api/v1/job-categories/${id}`);
    const item = response.data;
    if (!item) {
        throw new Error("Job category not found in API response.");
    }
    return {
        ...mapItem(item),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
    };
}

export async function createJobCategory(categoryData: Partial<Omit<JobCategory, 'id'>>): Promise<JobCategory> {
  const response = await authedFetch(`/api/v1/job-categories`, {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
  const item = response.data;
  if (!item) {
    throw new Error("Created job category data not found in API response.");
  }
  return {
    ...mapItem(item),
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

export async function updateJobCategory(id: string, categoryData: Partial<Omit<JobCategory, 'id'>>): Promise<JobCategory> {
  const response = await authedFetch(`/api/v1/job-categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  });
  const item = response.data;
  if (!item) {
    throw new Error("Updated job category data not found in API response.");
  }
  return {
    ...mapItem(item),
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

export async function deleteJobCategory(id: string): Promise<null> {
  return authedFetch(`/api/v1/job-categories/${id}`, {
    method: 'DELETE',
  });
}

// Skills
export async function getSkills(params: GetAllParams = {}): Promise<{ data: Skill[], pagination: Pagination }> {
  const queryString = buildQueryString(params);
  const response: PaginatedApiResponse<any> = await authedFetch(`/api/v1/skills?${queryString}`);
  
  const data = response.data.map((item:any) => ({
    ...mapItem(item),
    skillCategory: item.skillCategory ? mapItem(item.skillCategory) : undefined,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  }));

  const pagination: Pagination = {
    currentPage: response.page,
    limit: response.limit,
    totalRecords: response.total,
    totalPages: Math.ceil(response.total / response.limit),
  };

  return { data, pagination };
}

export async function getSkill(id: string): Promise<Skill> {
    const response = await authedFetch(`/api/v1/skills/${id}`);
    const item = response.data;
    if (!item) {
        throw new Error("Skill not found in API response.");
    }
    return {
        ...mapItem(item),
        skillCategory: item.skillCategory ? mapItem(item.skillCategory) : undefined,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
    };
}

export async function createSkill(skillData: Partial<Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Skill> {
  const response = await authedFetch(`/api/v1/skills`, {
    method: 'POST',
    body: JSON.stringify(skillData),
  });
  const item = response.data;
  if (!item) {
    throw new Error("Created skill data not found in API response.");
  }
  return {
    ...mapItem(item),
    skillCategory: item.skillCategory ? mapItem(item.skillCategory) : undefined,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

export async function updateSkill(id: string, skillData: Partial<Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Skill> {
  const response = await authedFetch(`/api/v1/skills/${id}`, {
    method: 'PUT',
    body: JSON.stringify(skillData),
  });
  const item = response.data;
  if (!item) {
    throw new Error("Updated skill data not found in API response.");
  }
  return {
    ...mapItem(item),
    skillCategory: item.skillCategory ? mapItem(item.skillCategory) : undefined,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

export async function deleteSkill(id: string): Promise<null> {
  return await authedFetch(`/api/v1/skills/${id}`, {
    method: 'DELETE',
  });
}

// Businesses
export async function getBusinesses(params: GetAllParams = {}): Promise<{ data: Business[], pagination: Pagination }> {
  const queryString = buildQueryString(params);
  const response = await authedFetch(`/api/v1/businesses?${queryString}`);
  
  const data = response.data.map((item: any) => ({
    ...mapItem(item),
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  }));

  const pagination: Pagination = {
    currentPage: response.page,
    limit: response.limit,
    totalRecords: response.total,
    totalPages: Math.ceil(response.total / response.limit),
  };

  return { data, pagination };
}

export async function getBusiness(id: string): Promise<Business> {
    const response = await authedFetch(`/api/v1/businesses/${id}`);
    const item = response.data;
    if (!item) {
        throw new Error("Business not found in API response.");
    }
    return {
        ...mapItem(item),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
    };
}

export async function createBusiness(businessData: FormData): Promise<Business> {
  const response = await authedFetch(`/api/v1/businesses`, {
    method: 'POST',
    body: businessData,
  });
  const item = response.data;
  if (!item) {
    throw new Error("Created business data not found in API response.");
  }
  return {
    ...mapItem(item),
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

export async function updateBusiness(id: string, businessData: FormData): Promise<Business> {
  const response = await authedFetch(`/api/v1/businesses/${id}`, {
    method: 'PUT',
    body: businessData,
  });
  const item = response.data;
  if (!item) {
    throw new Error("Updated business data not found in API response.");
  }
  return {
    ...mapItem(item),
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

export async function deleteBusiness(id: string): Promise<null> {
  return authedFetch(`/api/v1/businesses/${id}`, {
    method: 'DELETE',
  });
}

// Universities
export async function getUniversities(params: GetAllParams = {}): Promise<{ data: University[], pagination: Pagination }> {
  const queryString = buildQueryString(params);
  const response = await authedFetch(`/api/v1/universities?${queryString}`);
  
  const data = response.data.map((item: any) => ({
    ...mapItem(item),
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  }));

  const pagination: Pagination = {
    currentPage: response.page,
    limit: response.limit,
    totalRecords: response.total,
    totalPages: Math.ceil(response.total / response.limit),
  };

  return { data, pagination };
}

export async function getUniversity(id: string): Promise<University> {
    const response = await authedFetch(`/api/v1/universities/${id}`);
    const item = response.data;
    if (!item) {
        throw new Error("University not found in API response.");
    }
    return {
        ...mapItem(item),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
    };
}

export async function createUniversity(universityData: FormData): Promise<University> {
  const response = await authedFetch(`/api/v1/universities`, {
    method: 'POST',
    body: universityData,
  });
  const item = response.data;
  if (!item) {
    throw new Error("Created university data not found in API response.");
  }
  return {
    ...mapItem(item),
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

export async function updateUniversity(id: string, universityData: FormData): Promise<University> {
  const response = await authedFetch(`/api/v1/universities/${id}`, {
    method: 'PUT',
    body: universityData,
  });
  const item = response.data;
  if (!item) {
    throw new Error("Updated university data not found in API response.");
  }
  return {
    ...mapItem(item),
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

export async function deleteUniversity(id: string): Promise<null> {
  return authedFetch(`/api/v1/universities/${id}`, {
    method: 'DELETE',
  });
}

// Employers
export async function getEmployers(params: GetAllParams = {}): Promise<{ data: Employer[], pagination: Pagination }> {
  const queryString = buildQueryString(params);
  const response = await authedFetch(`/api/v1/employers?${queryString}`);
  
  const data = response.data.map((item: any) => ({
    ...mapItem(item),
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  }));

  const pagination: Pagination = {
    currentPage: response.page,
    limit: response.limit,
    totalRecords: response.total,
    totalPages: Math.ceil(response.total / response.limit),
  };

  return { data, pagination };
}

export async function getEmployer(id: string): Promise<Employer> {
    const response = await authedFetch(`/api/v1/employers/${id}`);
    const item = response.data;
    if (!item) {
        throw new Error("Employer not found in API response.");
    }
    return {
        ...mapItem(item),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
    };
}

export async function createEmployer(employerData: FormData): Promise<Employer> {
  const response = await authedFetch(`/api/v1/employers`, {
    method: 'POST',
    body: employerData,
  });
  const item = response.data;
  if (!item) {
    throw new Error("Created employer data not found in API response.");
  }
  return {
    ...mapItem(item),
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

export async function updateEmployer(id: string, employerData: FormData): Promise<Employer> {
  const response = await authedFetch(`/api/v1/employers/${id}`, {
    method: 'PUT',
    body: employerData,
  });
  const item = response.data;
  if (!item) {
    throw new Error("Updated employer data not found in API response.");
  }
  return {
    ...mapItem(item),
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

export async function deleteEmployer(id: string): Promise<null> {
  return authedFetch(`/api/v1/employers/${id}`, {
    method: 'DELETE',
  });
}

// Jobseekers
export async function getJobseekers(params: GetAllParams = {}): Promise<{ data: Jobseeker[], pagination: Pagination }> {
  const queryString = buildQueryString(params);
  const response: PaginatedApiResponse<any> = await authedFetch(`/api/v1/jobseekers?${queryString}`);
  
  const data = response.data.map((item: any) => ({
    ...mapItem(item),
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  }));

  const pagination: Pagination = {
    currentPage: response.page,
    limit: response.limit,
    totalRecords: response.total,
    totalPages: Math.ceil(response.total / response.limit),
  };

  return { data, pagination };
}

export async function getJobseeker(id: string): Promise<Jobseeker> {
    const response = await authedFetch(`/api/v1/jobseekers/${id}`);
    const item = response.data;
    if (!item) {
        throw new Error("Jobseeker not found in API response.");
    }
    return {
        ...mapItem(item),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth) : undefined,
        experience: item.experience?.map((exp: any) => ({ ...exp, startDate: new Date(exp.startDate), endDate: exp.endDate ? new Date(exp.endDate) : undefined })) || [],
        education: item.education?.map((edu: any) => ({ ...edu, startDate: new Date(edu.startDate), endDate: new Date(edu.endDate) })) || [],
        skills: Array.isArray(item.skills) ? item.skills.map((skill: any) => typeof skill === 'object' ? skill?._id || skill?.id : skill) : [],
    };
}

export async function createJobseeker(jobseekerData: FormData): Promise<Jobseeker> {
  const response = await authedFetch(`/api/v1/jobseekers`, {
    method: 'POST',
    body: jobseekerData,
  });
  const item = response.data;
  if (!item) {
    throw new Error("Created jobseeker data not found in API response.");
  }
  return { ...mapItem(item) };
}

export async function updateJobseeker(id: string, jobseekerData: FormData): Promise<Jobseeker> {
  const response = await authedFetch(`/api/v1/jobseekers/${id}`, {
    method: 'PUT',
    body: jobseekerData,
  });
  const item = response.data;
  if (!item) {
    throw new Error("Updated jobseeker data not found in API response.");
  }
  return { ...mapItem(item) };
}

export async function deleteJobseeker(id: string): Promise<null> {
  return authedFetch(`/api/v1/jobseekers/${id}`, {
    method: 'DELETE',
  });
}

// FAQs
export async function getFaqs(params: GetAllParams = {}): Promise<{ data: Faq[], pagination: Pagination }> {
  const queryString = buildQueryString(params);
  const response: PaginatedApiResponse<any> = await authedFetch(`/api/v1/faqas?${queryString}`);
  
  const data = response.data.map(mapItem).map((item: any) => ({
    ...item,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  }));

  const pagination: Pagination = {
    currentPage: response.page,
    limit: response.limit,
    totalRecords: response.total,
    totalPages: Math.ceil(response.total / response.limit),
  };

  return { data, pagination };
}

export async function getFaq(id: string): Promise<Faq> {
    const response = await authedFetch(`/api/v1/faqas/${id}`);
    const item = response.data;
    if (!item) {
        throw new Error("FAQ not found in API response.");
    }
    return {
        ...mapItem(item),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
    };
}

export async function createFaq(faqData: Partial<Omit<Faq, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Faq> {
  const response = await authedFetch(`/api/v1/faqas`, {
    method: 'POST',
    body: JSON.stringify(faqData),
  });
  const item = response.data;
  if (!item) {
    throw new Error("Created FAQ data not found in API response.");
  }
  return {
    ...mapItem(item),
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

export async function updateFaq(id: string, faqData: Partial<Omit<Faq, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Faq> {
  const response = await authedFetch(`/api/v1/faqas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(faqData),
  });
  const item = response.data;
  if (!item) {
    throw new Error("Updated FAQ data not found in API response.");
  }
  return {
    ...mapItem(item),
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

export async function deleteFaq(id: string): Promise<null> {
  return authedFetch(`/api/v1/faqas/${id}`, {
    method: 'DELETE',
  });
}


// Location APIs
export async function getCountries(): Promise<Country[]> {
  const response = await publicFetch(`/api/location/countries`);
  return response.data;
}

export async function getStates(countryCode: string): Promise<State[]> {
  if (!countryCode) return [];
  const response = await publicFetch(`/api/location/states/${countryCode}`);
  return response.data;
}

export async function getCities(countryCode: string, stateCode: string): Promise<City[]> {
  if (!countryCode || !stateCode) return [];
  const response = await publicFetch(`/api/location/cities/${countryCode}/${stateCode}`);
  return response.data;
}
