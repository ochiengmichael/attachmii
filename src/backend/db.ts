/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import bcryptjs from 'bcryptjs';
import { User, Company, Job, Application, Notification, SavedJob, Message, Report, AuditLog } from '../types.js';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

interface Schema {
  users: User[];
  companies: Company[];
  jobs: Job[];
  applications: Application[];
  notifications: Notification[];
  savedJobs: SavedJob[];
  messages: Message[];
  reports: Report[];
  auditLogs: AuditLog[];
}

// Initial seed helper
function generateSeedData(): Schema {
  const salt = bcryptjs.genSaltSync(10);
  
  const adminPassword = bcryptjs.hashSync('admin123', salt);
  const userPassword = bcryptjs.hashSync('password123', salt);

  const users: User[] = [
    {
      id: 'usr_admin',
      email: 'admin@attachme.com',
      name: 'Koudakouami',
      role: 'admin',
      isApproved: true,
      isSuspended: false,
      createdAt: new Date().toISOString(),
      profile: {
        bio: 'Platform Chief Administrator',
        cvPath: '',
        cvName: '',
        certPath: '',
        certName: '',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Koudakouami',
        skills: ['Governance', 'Cybersecurity', 'Database Management'],
        education: [],
        portfolioLinks: []
      }
    },
    {
      id: 'usr_employer_ms',
      email: 'recruiter@microsoft.com',
      name: 'Alistair Vance',
      role: 'employer',
      isApproved: true,
      isSuspended: false,
      createdAt: new Date().toISOString(),
      companyId: 'comp_ms',
      profile: {
        bio: 'Lead Talent Acquisition Partner at Microsoft',
        cvPath: '',
        cvName: '',
        certPath: '',
        certName: '',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        skills: ['Talent Sourcing', 'Technical Recruiting', 'Strategic Staffing'],
        education: [],
        portfolioLinks: []
      }
    },
    {
      id: 'usr_student_edu',
      email: 'student@harvard.edu',
      name: 'Alex Rivera',
      role: 'student',
      isApproved: true,
      isSuspended: false,
      createdAt: new Date().toISOString(),
      profile: {
        bio: 'Computer Science sophomore passionate about web development, open source, and fullstack cloud services.',
        cvPath: '/uploads/cv_alex_rivera.pdf',
        cvName: 'cv_alex_rivera.pdf',
        certPath: '/uploads/transcript_alex.pdf',
        certName: 'transcripts_alex.pdf',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        skills: ['React', 'TypeScript', 'Node.js', 'TailwindCSS', 'Python'],
        education: [
          {
            institution: 'Harvard University',
            course: 'B.Sc. in Computer Science',
            startYear: '2024',
            endYear: '2028'
          }
        ],
        portfolioLinks: ['https://github.com/alexrivera', 'https://alexrivera.dev']
      }
    },
    {
      id: 'usr_seeker_pro',
      email: 'jobseeker@gmail.com',
      name: 'Elena Rostova',
      role: 'job_seeker',
      isApproved: true,
      isSuspended: false,
      createdAt: new Date().toISOString(),
      profile: {
        bio: 'Experienced frontend developer and UI/UX designer with 3+ years of professional experience building SaaS portals.',
        cvPath: '/uploads/cv_elena.pdf',
        cvName: 'elena_resume_frontend.pdf',
        certPath: '',
        certName: '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        skills: ['HTML5', 'CSS3', 'Figma', 'React', 'TypeScript', 'Next.js', 'Chart.js'],
        education: [
          {
            institution: 'MIT',
            course: 'M.Sc. in Software Engineering',
            startYear: '2020',
            endYear: '2022'
          }
        ],
        portfolioLinks: ['https://dribbble.com/elena_design', 'https://linkedin.com/in/elena-rostova']
      }
    }
  ];

  // We write passwords in a private memory-only or separate store if we want, or attach to users in memory
  // For safety, let's keep a password lookup table in seeds or just load it.
  // To avoid altering types, we will save password field directly inside user object when writing to file,
  // but strip it when sending users across API.
  // Let's add password fields to DB records implicitly.
  const dbUsers = users.map(u => {
    let pwd = userPassword;
    if (u.id === 'usr_admin') pwd = adminPassword;
    return { ...u, password: pwd };
  });

  const companies: Company[] = [
    {
      id: 'comp_ms',
      name: 'Microsoft',
      description: 'At Microsoft, our mission is to empower every person and every organization on the planet to achieve more.',
      industry: 'Technology & Cloud Solutions',
      website: 'https://microsoft.com',
      logo: 'https://images.unsplash.com/photo-1625014020731-10c2132338ff?w=150',
      employerId: 'usr_employer_ms',
      isApproved: true,
      createdAt: new Date().toISOString()
    }
  ];

  const jobs: Job[] = [
    {
      id: 'job_ms_intern',
      companyId: 'comp_ms',
      companyName: 'Microsoft',
      companyLogo: 'https://images.unsplash.com/photo-1625014020731-10c2132338ff?w=150',
      title: 'Cloud Engineering Intern (Azure Core)',
      description: 'Join the Azure Core Compute team to build next-generation distributed systems, optimize host virtualization pipelines, and work with hyper-scale orchestration networks.',
      type: 'internship',
      location: 'Redmond, WA (Hybrid)',
      salary: '$6,500 / mo',
      requirements: [
        'Currently enrolled in computer science major',
        'Strong knowledge of C++ or Go lang',
        'Basic understanding of container technology and Docker services'
      ],
      skills: ['Go', 'C++', 'Docker', 'Azure', 'Linux'],
      status: 'open',
      createdAt: new Date().toISOString(),
      applicantsCount: 1
    },
    {
      id: 'job_ms_attach',
      companyId: 'comp_ms',
      companyName: 'Microsoft',
      companyLogo: 'https://images.unsplash.com/photo-1625014020731-10c2132338ff?w=150',
      title: 'Undergraduate Attachment - Frontend Engineering',
      description: 'Excellent open attachment for undergraduate students seeking 3-6 months training. Work closely with the Office Web UI squad supporting Fluent Design development.',
      type: 'attachment',
      location: 'Nairobi, Kenya',
      salary: '$800 / mo Stipend',
      requirements: [
        'Endorsement letter from university for attachment / industrial training',
        'Familiar with HTML, CSS, JavaScript, and React basics',
        'Eager learner with solid problem solving mindset'
      ],
      skills: ['React', 'CSS3', 'JavaScript', 'TailwindCSS'],
      status: 'open',
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      applicantsCount: 0
    },
    {
      id: 'job_stripe_dev',
      companyId: 'comp_stripe',
      companyName: 'Stripe',
      companyLogo: 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=150',
      title: 'Senior Product Engineer (SaaS Billing UI)',
      description: 'Stripe is looking for a senior frontend product engineer to design the next generation subscription manager dashboard used by millions of merchants worldwide.',
      type: 'job',
      location: 'San Francisco, CA (Remote)',
      salary: '$145,000 - $180,000 / yr',
      requirements: [
        '3+ years architecture or engineering complex web applications with React & TS',
        'Demonstrated sense for outstanding typography, layout density, and animation flows',
        'Excellent backend fundamentals proxies, API rate limits, and caching strategies'
      ],
      skills: ['React', 'TypeScript', 'Recharts', 'Web Design'],
      status: 'open',
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      applicantsCount: 2
    }
  ];

  const applications: Application[] = [
    {
      id: 'app_seed_1',
      jobId: 'job_ms_intern',
      jobTitle: 'Cloud Engineering Intern (Azure Core)',
      jobType: 'internship',
      companyName: 'Microsoft',
      userId: 'usr_student_edu',
      applicantName: 'Alex Rivera',
      applicantRole: 'student',
      applicantEmail: 'student@harvard.edu',
      status: 'pending',
      coverLetter: 'I am incredibly excited about the prospect of working at Microsoft azure team. Distributed systems is my absolute passion.',
      cvPath: '/uploads/cv_alex_rivera.pdf',
      cvName: 'cv_alex_rivera.pdf',
      certPath: '/uploads/transcript_alex.pdf',
      certName: 'transcripts_alex.pdf',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const notifications: Notification[] = [
    {
      id: 'notif_1',
      userId: 'usr_student_edu',
      title: 'Application Received',
      message: 'Your application for Cloud Engineering Intern at Microsoft was successfully submitted.',
      type: 'application_status',
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ];

  const savedJobs: SavedJob[] = [
    {
      id: 'sj_1',
      userId: 'usr_student_edu',
      jobId: 'job_stripe_dev',
      createdAt: new Date().toISOString()
    }
  ];

  const messages: Message[] = [
    {
      id: 'msg_1',
      senderId: 'usr_employer_ms',
      senderName: 'Alistair Vance',
      receiverId: 'usr_student_edu',
      receiverName: 'Alex Rivera',
      content: 'Hi Alex! Thanks for submitting your resume. We noticed your impressive React background and will review your cloud engineering profile shortly.',
      createdAt: new Date().toISOString()
    }
  ];

  const reports: Report[] = [
    {
      id: 'rep_1',
      userId: 'usr_student_edu',
      userName: 'Alex Rivera',
      userEmail: 'student@harvard.edu',
      subject: 'Inquiry on Certificate Field upload size',
      description: 'I would like to upload a full transcript, is a 5MB PDF supported by AttachME?',
      status: 'open',
      createdAt: new Date().toISOString()
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'aud_1',
      action: 'SYSTEM_BOOT',
      performedBy: 'system',
      ip: '127.0.0.1',
      timestamp: new Date().toISOString()
    },
    {
      id: 'aud_2',
      action: 'DATABASE_SEED',
      performedBy: 'admin@attachme.com',
      ip: '127.0.0.1',
      timestamp: new Date().toISOString()
    }
  ];

  return {
    users: dbUsers as any,
    companies,
    jobs,
    applications,
    notifications,
    savedJobs,
    messages,
    reports,
    auditLogs
  };
}

export class Database {
  private data: Schema;

  constructor() {
    this.data = {
      users: [],
      companies: [],
      jobs: [],
      applications: [],
      notifications: [],
      savedJobs: [],
      messages: [],
      reports: [],
      auditLogs: []
    };
    this.init();
  }

  private init() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const rawJson = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(rawJson);
      } catch (err) {
        console.error('Error parsing database. Restoring with seeds.', err);
        this.data = generateSeedData();
        this.save();
      }
    } else {
      this.data = generateSeedData();
      this.save();
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to database file:', err);
    }
  }

  // Users Handlers
  public getUsers(): any[] {
    return this.data.users;
  }

  public addUser(user: any) {
    this.data.users.push(user);
    this.save();
  }

  public updateUser(id: string, updates: Partial<User>) {
    const userIndex = this.data.users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      this.data.users[userIndex] = { ...this.data.users[userIndex], ...updates };
      this.save();
      return this.data.users[userIndex];
    }
    return null;
  }

  // Companies Handlers
  public getCompanies(): Company[] {
    return this.data.companies;
  }

  public addCompany(company: Company) {
    this.data.companies.push(company);
    this.save();
  }

  public updateCompany(id: string, updates: Partial<Company>) {
    const idx = this.data.companies.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.companies[idx] = { ...this.data.companies[idx], ...updates };
      this.save();
      return this.data.companies[idx];
    }
    return null;
  }

  // Jobs Handlers
  public getJobs(): Job[] {
    return this.data.jobs;
  }

  public addJob(job: Job) {
    this.data.jobs.push(job);
    this.save();
  }

  public updateJob(id: string, updates: Partial<Job>) {
    const idx = this.data.jobs.findIndex(j => j.id === id);
    if (idx !== -1) {
      this.data.jobs[idx] = { ...this.data.jobs[idx], ...updates };
      this.save();
      return this.data.jobs[idx];
    }
    return null;
  }

  public deleteJob(id: string) {
    this.data.jobs = this.data.jobs.filter(j => j.id !== id);
    this.save();
  }

  // Applications Handlers
  public getApplications(): Application[] {
    return this.data.applications;
  }

  public addApplication(app: Application) {
    this.data.applications.push(app);
    // Increment job applications count
    const job = this.data.jobs.find(j => j.id === app.jobId);
    if (job) {
      job.applicantsCount = (job.applicantsCount || 0) + 1;
    }
    this.save();
  }

  public updateApplication(id: string, updates: Partial<Application>) {
    const idx = this.data.applications.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.data.applications[idx] = { ...this.data.applications[idx], ...updates, updatedAt: new Date().toISOString() };
      this.save();
      return this.data.applications[idx];
    }
    return null;
  }

  // Notifications Handlers
  public getNotifications(): Notification[] {
    return this.data.notifications;
  }

  public addNotification(notif: Notification) {
    this.data.notifications.unshift(notif); // Prepend so latest shows first
    this.save();
  }

  public markNotificationsRead(userId: string) {
    this.data.notifications.forEach(n => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });
    this.save();
  }

  // Saved Jobs Handlers
  public getSavedJobs(): SavedJob[] {
    return this.data.savedJobs;
  }

  public toggleSavedJob(userId: string, jobId: string): boolean {
    const idx = this.data.savedJobs.findIndex(sj => sj.userId === userId && sj.jobId === jobId);
    if (idx !== -1) {
      this.data.savedJobs.splice(idx, 1);
      this.save();
      return false; // Removed
    } else {
      this.data.savedJobs.push({
        id: `sj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        userId,
        jobId,
        createdAt: new Date().toISOString()
      });
      this.save();
      return true; // Added
    }
  }

  // Messages Handlers
  public getMessages(): Message[] {
    return this.data.messages;
  }

  public addMessage(msg: Message) {
    this.data.messages.push(msg);
    this.save();
  }

  // Reports/Support Handlers
  public getReports(): Report[] {
    return this.data.reports || [];
  }

  public addReport(rep: Report) {
    if (!this.data.reports) this.data.reports = [];
    this.data.reports.push(rep);
    this.save();
  }

  public updateReport(id: string, updates: Partial<Report>) {
    if (!this.data.reports) this.data.reports = [];
    const idx = this.data.reports.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.data.reports[idx] = { ...this.data.reports[idx], ...updates };
      this.save();
      return this.data.reports[idx];
    }
    return null;
  }

  // Audit Logs Handlers
  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  public addAuditLog(action: string, performedBy: string, ip: string) {
    this.data.auditLogs.unshift({
      id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      action,
      performedBy,
      ip,
      timestamp: new Date().toISOString()
    });
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs.pop(); // Keep log size tidy
    }
    this.save();
  }
}

export const db = new Database();
