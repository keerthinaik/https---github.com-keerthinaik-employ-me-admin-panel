import type { LoginSuccessResponse, SkillCategory, JobCategory, PaginatedApiResponse, Pagination, GetAllParams, Skill, GetMeResponse, AuthUser } from '@/lib/types';

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
  
  const data = response.data.map(item => ({
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
