/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'student' | 'job_seeker' | 'employer' | 'admin';

export interface UserProfile {
  bio: string;
  cvPath: string;
  cvName: string;
  certPath: string;
  certName: string;
  avatar: string;
  skills: string[];
  education: {
    institution: string;
    course: string;
    startYear: string;
    endYear: string;
  }[];
  portfolioLinks: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isApproved: boolean;
  isSuspended: boolean;
  createdAt: string;
  companyId?: string; // Links employer to their company
  profile: UserProfile;
}

export interface Company {
  id: string;
  name: string;
  description: string;
  industry: string;
  website: string;
  logo: string;
  employerId: string; // User ID who owns the company
  isApproved: boolean;
  createdAt: string;
}

export type JobType = 'job' | 'internship' | 'attachment';

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  title: string;
  description: string;
  type: JobType;
  location: string;
  salary: string; // e.g., "$3,000 / mo" or " unpaid / stipend"
  requirements: string[];
  skills: string[];
  status: 'open' | 'closed';
  createdAt: string;
  applicantsCount: number;
}

export type ApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected';

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  jobType: JobType;
  companyName: string;
  userId: string;
  applicantName: string;
  applicantRole: UserRole;
  applicantEmail: string;
  status: ApplicationStatus;
  coverLetter: string;
  cvPath: string;
  cvName: string;
  certPath: string;
  certName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'application_status' | 'new_job' | 'message' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  createdAt: string;
}

export interface Report {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string; // Email or "system"
  ip: string;
  timestamp: string;
}
