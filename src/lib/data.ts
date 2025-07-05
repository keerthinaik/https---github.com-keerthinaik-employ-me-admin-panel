

import type { JobCategory as JobCategoryType, SkillCategory as SkillCategoryType, University as UniversityType, Business as BusinessType, Experience, Education, Project, Faq as FaqType, Job as JobType } from "./types";

export type Question = {
    question: string;
    type: "boolean" | "single-choice" | "multi-choice" | "text";
    options?: string[];
}

export type Application = {
    id: string;
    jobId: string;
    jobTitle: string;
    jobseekerId: string;
    applicantName: string;
    applicantAvatar: string;
    status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Hired' | 'Rejected' | 'Withdrawn';
    appliedAt: Date;
    updatedAt: Date;
    resumeUsed: string;
    coverLetter?: string;
    answers?: {
        question: string;
        answer: string | string[] | boolean;
    }[];
    feedback?: string; // from employer
    whyShouldWeHireYou?: string; // from applicant

    // For compatibility with old data structure, will be removed later
    videoResume?: string;
    interviewScheduled: boolean;
    interviewDateTime?: Date;
    recruiterNotes?: string;
    score: number;
    testResults?: {
        testName: string;
        score: number;
        feedback: string;
    };
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: 'Admin' | 'SubAdmin' | 'Recruiter' | 'Member';
  status: 'Active' | 'Inactive';
  joinedAt: Date;
  updatedAt: Date;
  phoneNumber?: string;
  permissions?: string[];
  employerId?: string;
  employerName?: string;
};

export const availablePermissions = [
    'manageUsers',
    'manageJobs',
    'approveCompanies',
    'viewReports',
    'manageSettings',
    'assignRoles'
];

export const permissionableModels = [
  { id: 'jobs', name: 'Jobs' },
  { id: 'jobCategories', name: 'Job Categories' },
  { id: 'applications', name: 'Applications' },
  { id: 'jobseekers', name: 'Jobseekers' },
  { id: 'employers', name: 'Employers' },
  { id: 'universities', name: 'Universities' },
  { id: 'businesses', name: 'Businesses' },
  { id: 'recruiters', name: 'Recruiters' },
  { id: 'employees', name: 'Employees' },
  { id: 'skills', name: 'Skills' },
  { id: 'skillCategories', name: 'Skill Categories' },
  { id: 'faqs', name: 'FAQs' },
];

export const crudOperations = ['create', 'read', 'update', 'delete'] as const;

export type Jobseeker = {
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
};

export type Skill = {
    id: string;
    name: string;
    categoryId: string;
    categoryName: string;
    createdAt: Date;
    updatedAt: Date;
}

export type Employer = {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  about?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  website?: string;
  profilePhoto?: string;
  taxNumber?: string;
  registrationNumber?: string;
  taxCertificate?: string;
  registrationCertificate?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type University = UniversityType;
export type Business = BusinessType;

export type SubscriptionPlan = {
  id: string;
  name: string;
  description?: string;
  features: string[];
  durationInDays: number;
  prices: {
    country: string;
    currency: string;
    amount: number;
  }[];
  userTypes: ('JobSeeker' | 'Employer' | 'University' | 'Business')[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Coupon = {
  id: string;
  code: string;
  description?: string;
  discountType: 'flat' | 'percentage';
  value: number;
  expiresAt?: Date;
  maxUsage?: number;
  usedCount: number;
  userTypes?: ('Admin' | 'JobSeeker' | 'Employer' | 'University' | 'Business')[];
  applicableCountries?: string[];
  applicablePlans?: string[]; // Array of SubscriptionPlan IDs
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UserSubscription = {
  id: string;
  userId: string;
  userName: string; // denormalized for easy display
  planId: string;
  planName: string; // denormalized
  couponUsed?: string; // Coupon ID
  transactionId?: string;
  amountPaid: number;
  currency: string;
  country: string;
  userType: 'Admin' | 'JobSeeker' | 'Employer' | 'University' | 'Business';
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
};

export type TestSkill = {
  id: string;
  name: string;
  subSkills: {
    id: string;
    name: string;
  }[];
};

export type SkillCategory = SkillCategoryType;
export type JobCategory = JobCategoryType;
export type Job = JobType;
export type Faq = FaqType;

export const skillCategories: SkillCategory[] = [];
export const jobCategories: JobCategory[] = [];

export const jobseekers: Jobseeker[] = [
    {
        id: 'JS001',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phoneNumber: '+1-202-555-0104',
        isVerified: true,
        isActive: true,
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zipCode: '94107',
        profilePhoto: 'https://placehold.co/100x100.png',
        bannerImage: 'https://placehold.co/800x200.png',
        resume: 'https://example.com/resume.pdf',
        certifications: [
            'https://example.com/cert1.pdf',
            'https://example.com/cert2.pdf',
        ],
        headline: 'Senior Software Engineer | React, Node.js, TypeScript',
        summary: 'Experienced software engineer with a passion for building scalable web applications and a strong background in front-end technologies.',
        about: "I'm a dedicated and passionate software engineer with over 5 years of experience in the tech industry. My journey in software development started with a fascination for how things work, which led me to pursue a degree in Computer Science. Since then, I've had the opportunity to work on a variety of projects, from small-scale mobile apps to large, distributed systems.\n\nMy expertise lies in full-stack development, with a particular focus on JavaScript technologies like React and Node.js. I enjoy the challenge of solving complex problems and am always eager to learn new things. I believe in writing clean, maintainable, and efficient code, and I'm a strong advocate for best practices like TDD and CI/CD.",
        dateOfBirth: new Date('1990-05-15'),
        gender: 'male',
        passportNumber: 'A12345678',
        fieldOfStudy: 'Computer Science',
        businessAssociationId: 'BIZ001',
        linkedInProfile: 'https://linkedin.com/in/johndoe',
        githubProfile: 'https://github.com/johndoe',
        portfolio: 'https://johndoe.dev',
        skills: ['SKL003', 'SKL004', 'SKL011', 'SKL001', 'SKL009', 'SKL007', 'SKL008'],
        experience: [
            { 
                jobTitle: 'Senior Software Engineer', 
                companyName: 'Tech Solutions Inc.', 
                startDate: new Date('2020-01-15'), 
                isCurrent: true,
                responsibilities: [
                    'Lead the development of a new microservices-based architecture.',
                    'Mentor junior engineers and conduct code reviews.',
                    'Collaborate with product managers to define feature requirements.'
                ],
                achievements: [
                    'Improved application performance by 30% by optimizing database queries.',
                    'Successfully launched a new feature that increased user engagement by 15%.'
                ]
            },
            { 
                jobTitle: 'Software Engineer', 
                companyName: 'Innovate LLC', 
                startDate: new Date('2018-06-01'), 
                endDate: new Date('2020-01-14'), 
                isCurrent: false 
            },
        ],
        education: [
            { 
                institution: 'State University', 
                degree: 'B.S.', 
                fieldOfStudy: 'Computer Science', 
                cgpa: '3.8',
                startDate: new Date('2014-09-01'), 
                endDate: new Date('2018-05-20') 
            },
        ],
        projects: [
            {
                title: 'E-commerce Platform',
                description: 'A full-featured e-commerce website built with the MERN stack.',
                url: 'https://github.com/johndoe/e-commerce'
            }
        ],
        createdAt: new Date('2023-01-10'),
        updatedAt: new Date('2023-10-25'),
    },
    {
        id: 'JS002',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phoneNumber: '+44-20-7946-0958',
        isVerified: false,
        isActive: true,
        city: 'London',
        country: 'UK',
        profilePhoto: 'https://placehold.co/100x100.png',
        headline: 'Product Manager | Agile, Scrum, JIRA',
        summary: 'Dynamic Product Manager with over 5 years of experience in managing product lifecycles from conception to launch.',
        experience: [
            { jobTitle: 'Product Manager', companyName: 'Global Innovations', startDate: new Date('2019-03-01'), isCurrent: true },
        ],
        education: [
             { institution: 'University of London', degree: 'MBA', fieldOfStudy: 'Business Administration', startDate: new Date('2016-09-01'), endDate: new Date('2018-06-30') },
        ],
        createdAt: new Date('2023-02-15'),
        updatedAt: new Date('2023-11-01'),
        skills: ['SKL007', 'SKL008', 'SKL013'],
    },
     {
        id: 'JS003',
        name: 'Peter Jones',
        email: 'peter.jones@example.com',
        phoneNumber: '+1-310-555-0184',
        profilePhoto: 'https://placehold.co/100x100.png',
        headline: 'UX/UI Designer | Figma, Sketch, Adobe XD',
        summary: 'Creative and detail-oriented UX/UI designer with a strong portfolio of user-centered designs.',
        city: 'Los Angeles', 
        state: 'CA', 
        country: 'USA',
        linkedInProfile: 'https://linkedin.com/in/peterjones',
        githubProfile: 'https://github.com/peterjones',
        portfolio: 'https://peterjones.design',
        isVerified: true,
        isActive: false,
        skills: ['SKL005', 'SKL006'],
        experience: [
            { jobTitle: 'Lead UX Designer', companyName: 'Design Co.', startDate: new Date('2021-02-01'), isCurrent: true },
            { jobTitle: 'UI Designer', companyName: 'Creative Apps', startDate: new Date('2019-07-01'), endDate: new Date('2021-01-31'), isCurrent: false },
        ],
        education: [
            { institution: 'Art Center College of Design', degree: 'B.F.A', fieldOfStudy: 'Graphic Design', startDate: new Date('2015-09-01'), endDate: new Date('2019-05-15') },
        ],
        createdAt: new Date('2023-03-20'),
        updatedAt: new Date('2023-09-30'),
    },
];

export const skills: Skill[] = [
    { id: "SKL001", name: "JavaScript", categoryId: "SCAT001", categoryName: "Programming Languages", createdAt: new Date(), updatedAt: new Date() },
    { id: "SKL002", name: "Python", categoryId: "SCAT001", categoryName: "Programming Languages", createdAt: new Date(), updatedAt: new Date() },
    { id: "SKL003", name: "React", categoryId: "SCAT002", categoryName: "Frameworks & Libraries", createdAt: new Date(), updatedAt: new Date() },
    { id: "SKL004", name: "Node.js", categoryId: "SCAT002", categoryName: "Frameworks & Libraries", createdAt: new Date(), updatedAt: new Date() },
    { id: "SKL005", name: "Figma", categoryId: "SCAT003", categoryName: "Design Tools", createdAt: new Date(), updatedAt: new Date() },
    { id: "SKL006", name: "Sketch", categoryId: "SCAT003", categoryName: "Design Tools", createdAt: new Date(), updatedAt: new Date() },
    { id: "SKL007", name: "Communication", categoryId: "SCAT004", categoryName: "Soft Skills", createdAt: new Date(), updatedAt: new Date() },
    { id: "SKL008", name: "Teamwork", categoryId: "SCAT004", categoryName: "Soft Skills", createdAt: new Date(), updatedAt: new Date() },
    { id: "SKL009", name: "AWS", categoryId: "SCAT005", categoryName: "Cloud Platforms", createdAt: new Date(), updatedAt: new Date() },
    { id: "SKL010", name: "Google Cloud", categoryId: "SCAT005", categoryName: "Cloud Platforms", createdAt: new Date(), updatedAt: new Date() },
    { id: "SKL011", name: "TypeScript", categoryId: "SCAT001", categoryName: "Programming Languages", createdAt: new Date(), updatedAt: new Date() },
    { id: "SKL012", name: "Vue.js", categoryId: "SCAT002", categoryName: "Frameworks & Libraries", createdAt: new Date(), updatedAt: new Date() },
    { id: "SKL013", name: "Problem Solving", categoryId: "SCAT004", categoryName: "Soft Skills", createdAt: new Date(), updatedAt: new Date() },
];


export const businesses: Business[] = [
    {
        id: "BIZ001",
        name: "Talent Finders Co.",
        email: "contact@talentfinders.com",
        phoneNumber: "+1-212-555-0150",
        profilePhoto: "https://placehold.co/100x100.png",
        about: "Specialized recruitment agency for the tech industry.",
        city: "New York", state: "NY", country: "USA",
        website: "https://talentfinders.com",
        isVerified: true,
        isActive: true,
        createdAt: new Date("2021-06-01"),
        updatedAt: new Date("2023-10-28"),
    },
    {
        id: "BIZ002",
        name: "Global Recruiters",
        email: "info@globalrecruit.net",
        phoneNumber: "+44-20-7946-0200",
        profilePhoto: "https://placehold.co/100x100.png",
        about: "Connecting top talent with international opportunities.",
        city: "London", country: "UK",
        website: "https://globalrecruit.net",
        isVerified: false,
        isActive: true,
        createdAt: new Date("2020-11-10"),
        updatedAt: new Date("2023-09-20"),
    },
    {
        id: "BIZ003",
        name: "HR Solutions Ltd.",
        email: "support@hrsolutions.io",
        phoneNumber: "+65-6555-0110",
        profilePhoto: "https://placehold.co/100x100.png",
        about: "Comprehensive HR and payroll outsourcing services.",
        city: "Singapore", country: "Singapore",
        website: "https://hrsolutions.io",
        isVerified: true,
        isActive: false,
        createdAt: new Date("2022-03-20"),
        updatedAt: new Date("2023-10-15"),
    },
];

export const universities: University[] = [
    {
        id: "UNI001",
        name: "Stanford University",
        email: "admissions@stanford.edu",
        phoneNumber: "+1-650-723-2300",
        profilePhoto: "https://placehold.co/100x100.png",
        about: "A place of learning, discovery, innovation, expression, and discourse.",
        city: "Stanford", state: "CA", country: "USA",
        type: "Research University",
        isVerified: true,
        isActive: true,
        createdAt: new Date("2020-01-10"),
        updatedAt: new Date("2023-10-25"),
    },
    {
        id: "UNI002",
        name: "University of Cambridge",
        email: "info@cam.ac.uk",
        phoneNumber: "+44-1223-337733",
        profilePhoto: "https://placehold.co/100x100.png",
        about: "A world-leading university, known for its academic excellence and traditional collegiate system.",
        city: "Cambridge", country: "UK",
        type: "Public",
        isVerified: true,
        isActive: true,
        createdAt: new Date("2019-05-20"),
        updatedAt: new Date("2023-10-22"),
    },
    {
        id: "UNI003",
        name: "National University of Singapore",
        email: "contact@nus.edu.sg",
        phoneNumber: "+65-6516-6666",
        profilePhoto: "https://placehold.co/100x100.png",
        about: "Singapore's flagship university, offering a global approach to education and research.",
        city: "Singapore", country: "Singapore",
        type: "Public",
        isVerified: false,
        isActive: false,
        createdAt: new Date("2021-08-15"),
        updatedAt: new Date("2023-09-30"),
    },
    {
        id: "UNI004",
        name: "University of Toronto",
        email: "help.desk@utoronto.ca",
        phoneNumber: "+1-416-978-2011",
        profilePhoto: "https://placehold.co/100x100.png",
        about: "Canada's leading institution of learning, discovery and knowledge creation.",
        city: "Toronto", state: "ON", country: "Canada",
        type: "Public",
        isVerified: true,
        isActive: true,
        createdAt: new Date("2020-03-01"),
        updatedAt: new Date("2023-10-15"),
    },
    {
        id: "UNI005",
        name: "The University of Tokyo",
        email: "contact.adm@gs.mail.u-tokyo.ac.jp",
        phoneNumber: "+81-3-5841-2591",
        profilePhoto: "https://placehold.co/100x100.png",
        about: "A leading research university in Japan, with a rich history and a commitment to academic freedom.",
        city: "Tokyo", country: "Japan",
        type: "Research University",
        isVerified: false,
        isActive: true,
        createdAt: new Date("2022-02-12"),
        updatedAt: new Date("2023-10-28"),
    }
];


export const employers: Employer[] = [
  {
    id: "EMP001",
    name: "Innovate Inc.",
    email: "contact@innovate.com",
    phoneNumber: "+1-555-0101",
    about: "Driving innovation through cutting-edge software solutions.",
    address: "1 Tech Way",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    zipCode: "94107",
    website: "https://innovate.com",
    profilePhoto: "https://placehold.co/100x100.png",
    taxNumber: "12-3456789",
    registrationNumber: "987654321",
    taxCertificate: "https://example.com/tax_cert.pdf",
    registrationCertificate: "https://example.com/reg_cert.pdf",
    isVerified: true,
    isActive: true,
    createdAt: new Date("2022-01-15"),
    updatedAt: new Date("2023-10-28"),
  },
  {
    id: "EMP002",
    name: "Creative Minds Agency",
    email: "hello@creativeminds.com",
    phoneNumber: "+44-20-7946-0102",
    about: "A full-service digital marketing agency.",
    address: "2 Creative St",
    city: "London",
    country: "UK",
    website: "https://creativeminds.com",
    profilePhoto: "https://placehold.co/100x100.png",
    isVerified: false,
    isActive: true,
    createdAt: new Date("2022-03-10"),
    updatedAt: new Date("2023-09-15"),
  },
  {
    id: "EMP003",
    name: "HealthWell Solutions",
    email: "info@healthwell.com",
    phoneNumber: "+1-555-0103",
    about: "Providing comprehensive healthcare services and technology.",
    address: "3 Wellness Blvd",
    city: "Boston", state: "MA", country: "USA",
    website: "https://healthwell.com",
    profilePhoto: "https://placehold.co/100x100.png",
    isVerified: true,
    isActive: false,
    createdAt: new Date("2021-11-20"),
    updatedAt: new Date("2023-10-20"),
  },
];

export const applications: Application[] = [
  {
    id: 'APP001',
    jobId: 'JOB001',
    jobTitle: 'Senior Frontend Developer',
    jobseekerId: 'JS001',
    applicantName: 'John Doe',
    applicantAvatar: 'https://placehold.co/40x40.png',
    status: 'Shortlisted',
    appliedAt: new Date('2023-10-02'),
    updatedAt: new Date('2023-10-15'),
    resumeUsed: 'https://example.com/resume/johndoe_v2.pdf',
    interviewScheduled: true,
    interviewDateTime: new Date('2023-10-20T14:00:00Z'),
    recruiterNotes: 'Strong candidate with excellent React skills. Good communication.',
    score: 92,
    coverLetter: "I am very interested in the Senior Frontend Developer position. My experience with React and modern web technologies aligns perfectly with your requirements. I am confident I can contribute significantly to your team.",
    answers: [
        { question: 'Are you authorized to work in the USA?', answer: true },
        { question: 'What is your expected salary range?', answer: '140k-150k USD per year' }
    ],
    feedback: "A strong technical candidate. Communication skills are excellent. Proceeding to the next round.",
    whyShouldWeHireYou: "My proven track record in building scalable and performant user interfaces, combined with my passion for user-centric design, makes me an ideal candidate to help drive your product forward."
  },
  {
    id: 'APP002',
    jobId: 'JOB002',
    jobTitle: 'Product Manager',
    jobseekerId: 'JS003',
    applicantName: 'Peter Jones',
    applicantAvatar: 'https://placehold.co/40x40.png',
    status: 'Shortlisted',
    appliedAt: new Date('2023-09-18'),
    updatedAt: new Date('2023-09-25'),
    resumeUsed: 'https://example.com/resume/peterjones_pm.pdf',
    interviewScheduled: false,
    recruiterNotes: 'Experienced PM, but looking for more direct B2C experience.',
    score: 85,
  },
  {
    id: 'APP003',
    jobId: 'JOB004',
    jobTitle: 'Data Scientist',
    jobseekerId: 'JS001',
    applicantName: 'Carlos Hernandez',
    applicantAvatar: 'https://placehold.co/40x40.png',
    status: 'Hired',
    appliedAt: new Date('2023-08-22'),
    updatedAt: new Date('2023-09-10'),
    resumeUsed: 'https://example.com/resume/carloshernandez_ds.pdf',
    videoResume: 'https://example.com/video/carlos_intro.mp4',
    interviewScheduled: true,
    interviewDateTime: new Date('2023-09-05T10:00:00Z'),
    recruiterNotes: 'Perfect fit for the team. Accepted offer.',
    score: 98,
  },
  {
    id: 'APP004',
    jobId: 'JOB001',
    jobTitle: 'Senior Frontend Developer',
    jobseekerId: 'JS002',
    applicantName: 'Jane Smith',
    applicantAvatar: 'https://placehold.co/40x40.png',
    status: 'Applied',
    appliedAt: new Date('2023-10-04'),
    updatedAt: new Date('2023-10-04'),
    resumeUsed: 'https://example.com/resume/janesmith_fe.pdf',
    interviewScheduled: false,
    score: 78,
  },
  {
    id: 'APP005',
    jobId: 'JOB004',
    jobTitle: 'Data Scientist',
    jobseekerId: 'JS002',
    applicantName: 'Sofia Petrov',
    applicantAvatar: 'https://placehold.co/40x40.png',
    status: 'Withdrawn',
    appliedAt: new Date('2023-09-01'),
    updatedAt: new Date('2023-09-05'),
    resumeUsed: 'https://example.com/resume/sofiapetrov_cv.pdf',
    interviewScheduled: false,
    recruiterNotes: 'Candidate accepted another offer before the interview stage.',
    score: 88,
  },
   {
    id: 'APP006',
    jobId: 'JOB002',
    jobTitle: 'Product Manager',
    jobseekerId: 'JS003',
    applicantName: 'Chloe Dubois',
    applicantAvatar: 'https://placehold.co/40x40.png',
    status: 'Rejected',
    appliedAt: new Date('2023-09-20'),
    updatedAt: new Date('2023-09-28'),
    resumeUsed: 'https://example.com/resume/chloedubois_cv.pdf',
    interviewScheduled: true,
    interviewDateTime: new Date('2023-09-26T11:00:00Z'),
    recruiterNotes: 'Good experience, but not a strong culture fit during the interview.',
    score: 75,
  }
];

export const applicationsByDay = [
    { date: 'Oct 22', applications: 12 },
    { date: 'Oct 23', applications: 18 },
    { date: 'Oct 24', applications: 25 },
    { date: 'Oct 25', applications: 22 },
    { date: 'Oct 26', applications: 30 },
    { date: 'Oct 27', applications: 28 },
    { date: 'Oct 28', applications: 35 },
];


export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'PLAN_EMP_01',
    name: 'Employer Basic',
    description: 'Get started with posting jobs.',
    features: ['5 Job Posts', 'Access to Candidate Database', 'Basic Analytics'],
    durationInDays: 30,
    prices: [{ country: 'USA', currency: 'USD', amount: 99 }],
    userTypes: ['Employer'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'PLAN_EMP_02',
    name: 'Employer Pro',
    description: 'For growing teams.',
    features: ['Unlimited Job Posts', 'Advanced Candidate Search', 'Premium Analytics', 'Company Branding'],
    durationInDays: 30,
    prices: [{ country: 'USA', currency: 'USD', amount: 299 }],
    userTypes: ['Employer'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'PLAN_JS_01',
    name: 'Jobseeker Premium',
    description: 'Stand out to employers.',
    features: ['Profile Highlighting', 'Application Priority', 'Salary Insights'],
    durationInDays: 365,
    prices: [{ country: 'USA', currency: 'USD', amount: 49 }],
    userTypes: ['JobSeeker'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'PLAN_BIZ_01',
    name: 'Business Partner',
    description: 'For recruitment agencies.',
    features: ['Bulk Job Posting', 'Client Management Tools', 'API Access'],
    durationInDays: 365,
    prices: [{ country: 'USA', currency: 'USD', amount: 999 }],
    userTypes: ['Business'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
   {
    id: 'PLAN_UNI_01',
    name: 'University Connect',
    description: 'Connect your students with opportunities.',
    features: ['Student Profile Management', 'Direct Employer Connection', 'Campus Recruitment Event Posting'],
    durationInDays: 365,
    prices: [{ country: 'USA', currency: 'USD', amount: 499 }],
    userTypes: ['University'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const coupons: Coupon[] = [
  {
    id: 'COUP001',
    code: 'WELCOME25',
    description: '25% off for new employers on their first monthly plan.',
    discountType: 'percentage',
    value: 25,
    maxUsage: 100,
    usedCount: 12,
    expiresAt: new Date('2024-12-31'),
    userTypes: ['Employer'],
    applicablePlans: ['PLAN_EMP_01', 'PLAN_EMP_02'],
    isActive: true,
    createdAt: new Date('2023-11-01'),
    updatedAt: new Date('2023-11-10'),
  },
  {
    id: 'COUP002',
    code: 'FLAT50',
    description: '$50 off any annual plan for any user.',
    discountType: 'flat',
    value: 50,
    usedCount: 5,
    maxUsage: 200,
    isActive: true,
    createdAt: new Date('2023-10-15'),
    updatedAt: new Date('2023-11-05'),
  },
   {
    id: 'COUP003',
    code: 'STUDENTPASS',
    description: '10% off for JobSeeker premium plans.',
    discountType: 'percentage',
    value: 10,
    usedCount: 30,
    userTypes: ['JobSeeker'],
    applicablePlans: ['PLAN_JS_01'],
    isActive: false,
    createdAt: new Date('2023-09-01'),
    updatedAt: new Date('2023-09-01'),
  },
];

export const userSubscriptions: UserSubscription[] = [
  {
    id: 'USUB001',
    userId: 'EMP001',
    userName: 'Innovate Inc.',
    planId: 'PLAN_EMP_02',
    planName: 'Employer Pro',
    amountPaid: 299,
    currency: 'USD',
    country: 'USA',
    userType: 'Employer',
    startDate: new Date('2023-10-01'),
    endDate: new Date('2023-11-01'),
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'USUB002',
    userId: 'JS001',
    userName: 'John Doe',
    planId: 'PLAN_JS_01',
    planName: 'Jobseeker Premium',
    amountPaid: 49,
    currency: 'USD',
    country: 'USA',
    userType: 'JobSeeker',
    startDate: new Date('2023-05-15'),
    endDate: new Date('2024-05-15'),
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
    {
    id: 'USUB003',
    userId: 'EMP003',
    userName: 'HealthWell Solutions',
    planId: 'PLAN_EMP_01',
    planName: 'Employer Basic',
    amountPaid: 99,
    currency: 'USD',
    country: 'USA',
    userType: 'Employer',
    startDate: new Date('2023-08-01'),
    endDate: new Date('2023-09-01'),
    status: 'expired',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];
