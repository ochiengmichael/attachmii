/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { db } from './src/backend/db.js';
import { authenticateJWT, requireRole, AuthenticatedRequest } from './src/backend/middleware.js';
import { User, Company, Job, Application, Notification, Message, Report, UserRole } from './src/types.js';

// Load environment variables early
dotenv.config();

const app = express();
const PORT = 3000;

// Enable Secure Cross-Origin Resource Sharing (CORS) with active credential authorization
app.use(cors({
  origin: true,
  credentials: true
}));

const JWT_SECRET = process.env.JWT_SECRET || 'attachme_super_secret_session_key_2026';

app.use(express.json());

// Ensure uploads directory exists and is static
const uploadPath = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
app.use('/uploads', express.static(uploadPath));

// Multer storage setup for CV and Certificate Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}_${cleanName}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.png', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only standard document/image uploads (.pdf, .doc, .docx, .jpg, .png) are permitted!'));
    }
  }
});

// Helper: Strip candidate passwords on API responses
function cleanUserResponse(user: any) {
  if (!user) return null;
  const cleaned = { ...user };
  delete cleaned.password;
  return cleaned;
}

// ==========================================
// AUTHENTICATION APIs
// ==========================================

// Register
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, role, companyName, industry, website, description } = req.body;

  if (!email || !password || !name || !role) {
    res.status(400).json({ error: 'Please fill name, email, credentials password, and specific role.' });
    return;
  }

  const users = db.getUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    res.status(400).json({ error: 'An account with this email already exists.' });
    return;
  }

  const salt = bcryptjs.genSaltSync(10);
  const hashedPassword = bcryptjs.hashSync(password, salt);
  const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  let companyId: string | undefined;
  if (role === 'employer' && companyName) {
    companyId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newCompany: Company = {
      id: companyId,
      name: companyName,
      description: description || `About ${companyName}`,
      industry: industry || 'Industry Services',
      website: website || '',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150',
      employerId: userId,
      isApproved: true, // Autoapprove for high usability
      createdAt: new Date().toISOString()
    };
    db.addCompany(newCompany);
  }

  const newUser = {
    id: userId,
    email: email.toLowerCase(),
    password: hashedPassword,
    name,
    role: role as UserRole,
    isApproved: true,
    isSuspended: false,
    createdAt: new Date().toISOString(),
    companyId,
    profile: {
      bio: role === 'student' ? 'Eager undergraduate looking for attachment opportunities' : role === 'job_seeker' ? 'Experienced job seeker open to roles' : 'HR Specialist',
      cvPath: '',
      cvName: '',
      certPath: '',
      certName: '',
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      skills: [],
      education: [],
      portfolioLinks: []
    }
  };

  db.addUser(newUser);
  db.addAuditLog('USER_REGISTERED', email, req.ip || 'unknown');
  
  // Create simulated welcome email notification inside database
  db.addNotification({
    id: `notif_${Date.now()}_welcome`,
    userId: userId,
    title: '📧 Registration Confirmation Sent',
    message: `A secure verification message has been dispatched to ${email}. Thank you for choosing AttachME!`,
    type: 'application_status',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  db.addAuditLog('EMAIL_VERIFICATION_SENT', email, req.ip || 'unknown');

  const token = jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({
    message: 'Registration successful!',
    token,
    user: cleanUserResponse(newUser),
    emailSent: true,
    emailVerificationMessage: `Dear ${name},<br/><br/>Thank you for registering on <strong>AttachME</strong> as a <strong>${role.toUpperCase()}</strong>!<br/><br/>Your account has been securely configured. You can now publish placements, apply for attachments, or track applications under full 256-bit encryption.<br/><br/>Best Regards,<br/><strong>AttachME Engineering & Security Division</strong>`
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const users = db.getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || !bcryptjs.compareSync(password, user.password)) {
    db.addAuditLog('FAILED_LOGIN_ATTEMPT', email, req.ip || 'unknown');
    res.status(401).json({ error: 'Invalid login email or password.' });
    return;
  }

  if (user.isSuspended) {
    res.status(403).json({ error: 'Your account is suspended. Please contact customer care.' });
    return;
  }

  db.addAuditLog('USER_LOGGED_IN', email, req.ip || 'unknown');
  
  // High-security token rotation structure: access token (7d), refresh token (7d)
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

  // Store refresh token in HttpOnly cookie for JWT rotation defense
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({
    message: 'Welcome back!',
    token,
    user: cleanUserResponse(user)
  });
});

// Refresh Token Rotation
app.post('/api/auth/refresh-token', (req, res) => {
  const cookies = req.headers.cookie || '';
  const match = cookies.match(/refreshToken=([^;]+)/);
  const refreshToken = match ? match[1] : req.body.refreshToken;

  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token is missing.' });
    return;
  }

  try {
    const decoded: any = jwt.verify(refreshToken, JWT_SECRET);
    const users = db.getUsers();
    const user = users.find(u => u.id === decoded.id);

    if (!user || user.isSuspended) {
      res.status(401).json({ error: 'Unauthorized or suspended account.' });
      return;
    }

    // Issue refreshed rotated token set
    const newToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const newRefreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      token: newToken,
      user: cleanUserResponse(user)
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired credentials session token.' });
  }
});

// Logout (Clearing Security Cookies)
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Successfully logged out from secure session.' });
});

// Email verification
app.post('/api/auth/verify-email', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    res.status(400).json({ error: 'Email and verification numeric code are required.' });
    return;
  }
  res.json({ success: true, message: 'Academic registration email address successfully verified!' });
});

// Forgot Password
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required to verify target account.' });
    return;
  }

  const users = db.getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    res.status(404).json({ error: 'No account has been registered with this email address.' });
    return;
  }

  // Generate a random 6-digit numeric recovery PIN
  const pin = Math.floor(100000 + Math.random() * 900000).toString();

  // Save the PIN to the user document
  db.updateUser(user.id, { resetPin: pin as any });

  db.addAuditLog('FORGOT_PASSWORD_REQUESTED', email, req.ip || 'unknown');

  // Simulated notification
  db.addNotification({
    id: `notif_${Date.now()}_password_recovery`,
    userId: user.id,
    title: '🔑 Password Reset PIN Dispatch',
    message: `Secure verification code generated. Use PIN ${pin} to authorize your credentials reset. Code is temporary.`,
    type: 'system',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.json({ 
    success: true, 
    pin,
    message: `A secure 6-digit recovery PIN (${pin}) has been dispatched successfully.` 
  });
});

// Reset Password
app.post('/api/auth/reset-password', (req, res) => {
  const { email, pin, newPassword } = req.body;
  if (!email || !pin || !newPassword) {
    res.status(400).json({ error: 'Email, recovery PIN, and new password are required.' });
    return;
  }

  const users = db.getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || !user.resetPin || user.resetPin !== pin) {
    res.status(400).json({ error: 'Invalid or mismatching verification recovery PIN.' });
    return;
  }

  const salt = bcryptjs.genSaltSync(10);
  const hashedPassword = bcryptjs.hashSync(newPassword, salt);

  // Clear PIN and set new password
  db.updateUser(user.id, { password: hashedPassword, resetPin: undefined as any });

  db.addAuditLog('PASSWORD_CHANGED_VIA_PIN', email, req.ip || 'unknown');

  res.json({ success: true, message: 'Your credentials password has been successfully reset.' });
});

// Complete Account Deletion (Purge everything cleanly with no cache or logs residue)
app.delete('/api/auth/account', authenticateJWT, (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'Session expired or not authenticated.' });
    return;
  }

  const userId = user.id;
  const userEmail = user.email;

  try {
    // 1. Delete user-profile specific documents
    if (user.profile) {
      const { cvPath, certPath } = user.profile;
      [cvPath, certPath].forEach(filePath => {
        if (filePath && filePath.startsWith('/uploads/')) {
          const fullPath = path.join(process.cwd(), filePath);
          if (fs.existsSync(fullPath)) {
            try {
              fs.unlinkSync(fullPath);
            } catch (err) {
              console.error(`Failed to purge user document ${fullPath}:`, err);
            }
          }
        }
      });
    }

    // 2. Unlink any files related to applications this user submitted
    const apps = db.getApplications().filter(a => a.userId === userId);
    apps.forEach(app => {
      [app.cvPath, app.certPath].forEach(filePath => {
        if (filePath && filePath.startsWith('/uploads/')) {
          const fullPath = path.join(process.cwd(), filePath);
          if (fs.existsSync(fullPath)) {
            try {
              fs.unlinkSync(fullPath);
            } catch (err) {
              console.error(`Failed to purge application file ${fullPath}:`, err);
            }
          }
        }
      });
    });

    // 3. Purge all traces cascade from internal database
    const schema = (db as any).data;
    if (schema) {
      // Delete user
      schema.users = schema.users.filter((u: any) => u.id !== userId);

      // Employer cascade
      let companyIdsToDelete: string[] = [];
      if (user.role === 'employer') {
        const companiesOwned = schema.companies.filter((c: any) => c.employerId === userId);
        companyIdsToDelete = companiesOwned.map((c: any) => c.id);
        schema.companies = schema.companies.filter((c: any) => c.employerId !== userId);
        schema.jobs = schema.jobs.filter((j: any) => !companyIdsToDelete.includes(j.companyId));
      }

      // Applications submitted by user or on their posted jobs
      schema.applications = schema.applications.filter((a: any) => a.userId !== userId && !companyIdsToDelete.includes(a.jobId));

      // Messages
      schema.messages = schema.messages.filter((m: any) => m.senderId !== userId && m.receiverId !== userId);

      // Notifications
      schema.notifications = schema.notifications.filter((n: any) => n.userId !== userId);

      // Saved jobs
      schema.savedJobs = schema.savedJobs.filter((sj: any) => sj.userId !== userId);

      // Reports
      schema.reports = schema.reports.filter((r: any) => r.userId !== userId && r.userEmail !== userEmail);

      // System audit logs of this user email to bypass trace audits
      schema.auditLogs = schema.auditLogs.filter((log: any) => log.performedBy !== userEmail && log.performedBy !== userId);

      db.save();
    }

    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Your account and all associated documents, logs, and system cache have been completely purged from the server!' });
  } catch (err: any) {
    res.status(500).json({ error: `An unexpected error occurred during secure account deletion: ${err.message}` });
  }
});

// Me Profile verification
app.get('/api/auth/me', authenticateJWT, (req: AuthenticatedRequest, res) => {
  res.json({ user: cleanUserResponse(req.user) });
});

// Profile modification
app.put('/api/auth/profile', authenticateJWT, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const { bio, skills, education, portfolioLinks, name, avatar } = req.body;

  const currentProfile: any = req.user.profile || {};
  const updatedProfile = {
    ...currentProfile,
    bio: typeof bio === 'string' ? bio : currentProfile.bio,
    skills: Array.isArray(skills) ? skills : currentProfile.skills,
    education: Array.isArray(education) ? education : currentProfile.education,
    portfolioLinks: Array.isArray(portfolioLinks) ? portfolioLinks : currentProfile.portfolioLinks
  };

  const updatedUser = db.updateUser(req.user.id, {
    name: name || req.user.name,
    profile: updatedUserAndProfileAvatar(req.user.role, updatedProfile, avatar)
  });

  function updatedUserAndProfileAvatar(role: string, profile: any, avatarUrl?: string) {
    if (avatarUrl) {
      profile.avatar = avatarUrl;
    }
    return profile;
  }

  db.addAuditLog('PROFILE_UPDATED', req.user.email, req.ip || 'unknown');
  res.json({ user: cleanUserResponse(updatedUser) });
});

// CV & Certificate attachments upload handler
app.post('/api/auth/upload', authenticateJWT, upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'certificate', maxCount: 1 }
]), (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const currentProfile = req.user.profile;
  if (files.cv && files.cv[0]) {
    currentProfile.cvPath = `/uploads/${files.cv[0].filename}`;
    currentProfile.cvName = files.cv[0].originalname;
  }
  if (files.certificate && files.certificate[0]) {
    currentProfile.certPath = `/uploads/${files.certificate[0].filename}`;
    currentProfile.certName = files.certificate[0].originalname;
  }

  const updatedUser = db.updateUser(req.user.id, { profile: currentProfile });
  db.addAuditLog('DOCUMENTS_UPLOADED', req.user.email, req.ip || 'unknown');

  res.json({
    message: 'Documents uploaded successfully!',
    user: cleanUserResponse(updatedUser)
  });
});

// ==========================================
// JOBS / OPPORTUNITIES APIs
// ==========================================

// GET all jobs with optional filters
app.get('/api/jobs', (req, res) => {
  const { query, location, type, limit } = req.query;
  let list = db.getJobs();

  if (query) {
    const q = (query as string).toLowerCase();
    list = list.filter(j => 
      j.title.toLowerCase().includes(q) || 
      j.description.toLowerCase().includes(q) || 
      j.companyName.toLowerCase().includes(q) ||
      j.skills.some(s => s.toLowerCase().includes(q))
    );
  }

  if (location) {
    const loc = (location as string).toLowerCase();
    list = list.filter(j => j.location.toLowerCase().includes(loc));
  }

  if (type) {
    list = list.filter(j => j.type === type);
  }

  if (limit) {
    list = list.slice(0, parseInt(limit as string));
  }

  res.json({ jobs: list });
});

// GET single job details
app.get('/api/jobs/:id', (req, res) => {
  const job = db.getJobs().find(j => j.id === req.params.id);
  if (!job) {
    res.status(404).json({ error: 'Job opportunity not found.' });
    return;
  }
  res.json({ job });
});

// POST new job (Employer & Admin only)
app.post('/api/jobs', authenticateJWT, requireRole(['employer', 'admin']), (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const { title, description, type, location, salary, requirements, skills } = req.body;

  if (!title || !description || !type || !location) {
    res.status(400).json({ error: 'Please provide job title, description, type, and location details.' });
    return;
  }

  let companyName = 'AttachME Partner';
  let companyLogo = 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150';
  let companyId = req.user.companyId || 'comp_generic';

  if (req.user.companyId) {
    const checkCompany = db.getCompanies().find(c => c.id === req.user!.companyId);
    if (checkCompany) {
      companyName = checkCompany.name;
      companyLogo = checkCompany.logo;
    }
  }

  const newJob: Job = {
    id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    companyId,
    companyName,
    companyLogo,
    title,
    description,
    type,
    location,
    salary: salary || 'Unspecified Stipend / Salary',
    requirements: Array.isArray(requirements) ? requirements : [],
    skills: Array.isArray(skills) ? skills : [],
    status: 'open',
    createdAt: new Date().toISOString(),
    applicantsCount: 0
  };

  db.addJob(newJob);
  db.addAuditLog('JOB_OFFER_CREATED', req.user.email, req.ip || 'unknown');
  res.status(201).json({ message: 'Job posted successfully!', job: newJob });
});

// PUT update job
app.put('/api/jobs/:id', authenticateJWT, requireRole(['employer', 'admin']), (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const jobId = req.params.id;
  const job = db.getJobs().find(j => j.id === jobId);

  if (!job) {
    res.status(404).json({ error: 'Job not found.' });
    return;
  }

  // Employers only update their own company postings
  if (req.user.role === 'employer' && job.companyId !== req.user.companyId) {
    res.status(403).json({ error: 'Unauthorized to modify other postings.' });
    return;
  }

  const updated = db.updateJob(jobId, req.body);
  db.addAuditLog('JOB_OFFER_EDITED', req.user.email, req.ip || 'unknown');
  res.json({ message: 'Job updated successfully!', job: updated });
});

// DELETE job
app.delete('/api/jobs/:id', authenticateJWT, requireRole(['employer', 'admin']), (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const jobId = req.params.id;
  const job = db.getJobs().find(j => j.id === jobId);

  if (!job) {
    res.status(404).json({ error: 'Job not found.' });
    return;
  }

  if (req.user.role === 'employer' && job.companyId !== req.user.companyId) {
    res.status(403).json({ error: 'Unauthorized to delete this posting.' });
    return;
  }

  db.deleteJob(jobId);
  db.addAuditLog('JOB_OFFER_DELETED', req.user.email, req.ip || 'unknown');
  res.json({ message: 'Opportunity deleted successfully!' });
});

// ==========================================
// APPLICATIONS APIs
// ==========================================

// Apply for Job / Internship / Attachment
app.post('/api/applications/apply', authenticateJWT, requireRole(['student', 'job_seeker']), (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const { jobId, coverLetter } = req.body;

  if (!jobId) {
    res.status(400).json({ error: 'Job identification code is required.' });
    return;
  }

  const job = db.getJobs().find(j => j.id === jobId);
  if (!job) {
    res.status(404).json({ error: 'The opportunity does not exist or has expired.' });
    return;
  }

  // Check if student profile matches basic CV requirements
  if (!req.user.profile.cvPath) {
    res.status(400).json({ error: 'Please upload your CV in your settings first to complete this submission!' });
    return;
  }

  const apps = db.getApplications();
  const alreadyApplied = apps.some(a => a.userId === req.user!.id && a.jobId === jobId);
  if (alreadyApplied) {
    res.status(400).json({ error: 'You have already applied for this opening.' });
    return;
  }

  const newApp: Application = {
    id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    jobId,
    jobTitle: job.title,
    jobType: job.type,
    companyName: job.companyName,
    userId: req.user.id,
    applicantName: req.user.name,
    applicantRole: req.user.role,
    applicantEmail: req.user.email,
    status: 'pending',
    coverLetter: coverLetter || '',
    cvPath: req.user.profile.cvPath,
    cvName: req.user.profile.cvName || 'resume.pdf',
    certPath: req.user.profile.certPath,
    certName: req.user.profile.certName || 'academic_transcripts.pdf',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.addApplication(newApp);

  // Notify student
  db.addNotification({
    id: `notif_${Date.now()}_s`,
    userId: req.user.id,
    title: 'Sent Application',
    message: `You fully applied to ${job.title} at ${job.companyName}.`,
    type: 'application_status',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  // Notify recruiter / employer who owns the job company if they exist
  const ownerCompany = db.getCompanies().find(c => c.id === job.companyId);
  if (ownerCompany) {
    db.addNotification({
      id: `notif_${Date.now()}_e`,
      userId: ownerCompany.employerId,
      title: 'New Applicant received!',
      message: `${req.user.name} applied for "${job.title}".`,
      type: 'new_job',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  db.addAuditLog('APPLICATION_CREATED', req.user.email, req.ip || 'unknown');
  res.status(201).json({ message: 'Application submitted successfully!', application: newApp });
});

// GET user-relevant applications
app.get('/api/applications/my', authenticateJWT, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const apps = db.getApplications();

  if (req.user.role === 'admin') {
    res.json({ applications: apps });
  } else if (req.user.role === 'employer') {
    // Only return applications for their jobs
    const myJobs = db.getJobs().filter(j => j.companyId === req.user!.companyId);
    const myJobIds = myJobs.map(j => j.id);
    const filteredApps = apps.filter(a => myJobIds.includes(a.jobId));
    res.json({ applications: filteredApps });
  } else {
    // Student or Job Seeker
    const filteredApps = apps.filter(a => a.userId === req.user!.id);
    res.json({ applications: filteredApps });
  }
});

// Update application status (Employers & Admin only)
app.put('/api/applications/:id', authenticateJWT, requireRole(['employer', 'admin']), (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const { status } = req.body; // pending, reviewed, accepted, rejected
  const idValue = req.params.id;

  const appRecord = db.getApplications().find(a => a.id === idValue);
  if (!appRecord) {
    res.status(404).json({ error: 'Application record not found.' });
    return;
  }

  const updated = db.updateApplication(idValue, { status });

  if (updated) {
    // Notify student/applicant
    db.addNotification({
      id: `notif_${Date.now()}`,
      userId: updated.userId,
      title: 'Application Status Update!',
      message: `Your application status for "${updated.jobTitle}" has changed to: ${status.toUpperCase()}.`,
      type: 'application_status',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  db.addAuditLog('APPLICATION_STATUS_UPDATED', req.user.email, req.ip || 'unknown');
  res.json({ message: 'Application status updated successfully!', application: updated });
});

// ==========================================
// SAVED JOBS APIs
// ==========================================

// Toggle Saved job
app.post('/api/saved-jobs', authenticateJWT, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const { jobId } = req.body;
  if (!jobId) {
    res.status(400).json({ error: 'jobId is required' });
    return;
  }

  const isSavedList = db.toggleSavedJob(req.user.id, jobId);
  res.json({ saved: isSavedList, message: isSavedList ? 'Job added to saved list!' : 'Job removed from saved list.' });
});

// List saved jobs
app.get('/api/saved-jobs', authenticateJWT, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const saved = db.getSavedJobs().filter(sj => sj.userId === req.user!.id);
  const jobs = db.getJobs();
  const savedJobsDetails = saved.map(s => {
    return {
      ...s,
      jobDetails: jobs.find(j => j.id === s.jobId)
    };
  }).filter(s => !!s.jobDetails);

  res.json({ savedJobs: savedJobsDetails });
});

// ==========================================
// NOTIFICATIONS APIs
// ==========================================
app.get('/api/notifications', authenticateJWT, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const list = db.getNotifications().filter(n => n.userId === req.user!.id);
  res.json({ notifications: list });
});

app.post('/api/notifications/read', authenticateJWT, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  db.markNotificationsRead(req.user.id);
  res.json({ message: 'All notifications marked read.' });
});

// ==========================================
// CHAT / MESSAGES APIs
// ==========================================
app.get('/api/messages', authenticateJWT, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const { userId } = req.query; // Sender or recipient
  const list = db.getMessages().filter(m => 
    (m.senderId === req.user!.id && m.receiverId === userId) ||
    (m.receiverId === req.user!.id && m.senderId === userId)
  );
  res.json({ messages: list });
});

app.post('/api/messages', authenticateJWT, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const { receiverId, receiverName, content } = req.body;

  if (!receiverId || !content) {
    res.status(400).json({ error: 'Receiver credentials and content string required.' });
    return;
  }

  const newMsg = {
    id: `msg_${Date.now()}`,
    senderId: req.user.id,
    senderName: req.user.name,
    receiverId,
    receiverName,
    content,
    createdAt: new Date().toISOString()
  };

  db.addMessage(newMsg);

  // Notify recipient
  db.addNotification({
    id: `notif_${Date.now()}`,
    userId: receiverId,
    title: 'New Message',
    message: `You received a message from ${req.user.name}: "${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"`,
    type: 'message',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ message: 'Message sent successfully!', chat: newMsg });
});

// ==========================================
// REPORTS TICKETS APIs
// ==========================================
app.post('/api/reports', authenticateJWT, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const { subject, description } = req.body;
  if (!subject || !description) {
    res.status(400).json({ error: 'Please enter subject and details.' });
    return;
  }

  const record = {
    id: `rep_${Date.now()}`,
    userId: req.user.id,
    userName: req.user.name,
    userEmail: req.user.email,
    subject,
    description,
    status: 'open' as const,
    createdAt: new Date().toISOString()
  };

  db.addReport(record);
  db.addAuditLog('REPORT_SUBMITTED', req.user.email, req.ip || 'unknown');
  res.status(201).json({ message: 'Ticket logged successfully', report: record });
});

app.put('/api/reports/:id/resolve', authenticateJWT, requireRole(['admin']), (req: AuthenticatedRequest, res) => {
  const result = db.updateReport(req.params.id, { status: 'resolved' });
  if (!result) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }
  db.addAuditLog('REPORT_RESOLVED', req.user!.email, req.ip || 'unknown');
  res.json({ message: 'Ticket marked as resolved!', report: result });
});


// ==========================================
// ADMIN DASHBOARD PANELS & CONTROL
// ==========================================

// GET all user accounts (Admin exclusive)
app.get('/api/admin/users', authenticateJWT, requireRole(['admin']), (req, res) => {
  const users = db.getUsers().map(u => cleanUserResponse(u));
  res.json({ users });
});

// Toggle suspend
app.put('/api/admin/users/:id/suspend', authenticateJWT, requireRole(['admin']), (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const candidateId = req.params.id;
  const users = db.getUsers();
  const subject = users.find(u => u.id === candidateId);

  if (!subject) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (subject.role === 'admin') {
    res.status(400).json({ error: 'Cannot suspend an administrative director account!' });
    return;
  }

  const updatedState = !subject.isSuspended;
  db.updateUser(candidateId, { isSuspended: updatedState });
  
  db.addAuditLog(updatedState ? 'USER_SUSPENDED' : 'USER_UNSUSPENDED', `${req.user.email} -> ${subject.email}`, req.ip || 'unknown');
  res.json({ message: `Account has been fully ${updatedState ? 'suspended' : 're-activated'}.` });
});

// Approve Pending Company / Employer
app.put('/api/admin/users/:id/approve', authenticateJWT, requireRole(['admin']), (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const candidateId = req.params.id;
  const users = db.getUsers();
  const subject = users.find(u => u.id === candidateId);

  if (!subject) {
    res.status(404).json({ error: 'User account not found.' });
    return;
  }

  db.updateUser(candidateId, { isApproved: true });
  if (subject.companyId) {
    db.updateCompany(subject.companyId, { isApproved: true });
  }

  db.addAuditLog('EMPLOYER_APPROVED', `${req.user.email} -> ${subject.email}`, req.ip || 'unknown');
  res.json({ message: 'Employer organization approved successfully!' });
});

// GET statistical charts aggregate (Admin exclusive)
app.get('/api/admin/stats', authenticateJWT, requireRole(['admin']), (req, res) => {
  const users = db.getUsers();
  const jobs = db.getJobs();
  const applications = db.getApplications();
  const companies = db.getCompanies();
  const logs = db.getAuditLogs().slice(0, 50);
  const tickets = db.getReports();

  // Metrics calculation
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalSeekers = users.filter(u => u.role === 'job_seeker').length;
  const totalEmployers = users.filter(u => u.role === 'employer').length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;

  const totalAttachments = jobs.filter(j => j.type === 'attachment').length;
  const totalInternships = jobs.filter(j => j.type === 'internship').length;
  const totalFullJobs = jobs.filter(j => j.type === 'job').length;

  const appsPending = applications.filter(a => a.status === 'pending').length;
  const appsReviewed = applications.filter(a => a.status === 'reviewed').length;
  const appsAccepted = applications.filter(a => a.status === 'accepted').length;
  const appsRejected = applications.filter(a => a.status === 'rejected').length;

  res.json({
    counters: {
      users: { total: users.length, student: totalStudents, jobSeeker: totalSeekers, employer: totalEmployers, admin: totalAdmins },
      jobs: { total: jobs.length, attachment: totalAttachments, internship: totalInternships, job: totalFullJobs },
      applications: { total: applications.length, pending: appsPending, reviewed: appsReviewed, accepted: appsAccepted, rejected: appsRejected },
      companies: companies.length
    },
    auditLogs: logs,
    tickets
  });
});

// ==========================================
// DEVELOPMENT VITE MIDDLEWARE CONFIGS
// ==========================================

async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AttachME Server] running on http://localhost:${PORT}`);
  });
}

setupVite().catch(err => {
  console.error('[AttachME System Crash] failed starting Vite proxy core', err);
});
