export type Role = "Admin" | "Editor" | "Viewer";

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: Role;
  status: "Active" | "Disabled";
  createdAt: string;
};

export type JobPosting = {
  id: string;
  title: string;
  companyName: string;
  location: string;
  description: string;
  tags: string[];
  status: "Pending" | "Approved" | "Rejected";
  submittedAt: string;
};

export type Translation = {
  key: string;
  value: string;
};

export type Locale = {
  name: string;
  code: string;
  translations: Translation[];
};
