# AttachME — Modern Placement & Recruitment Platform

AttachME is a modern full-stack web application that facilitates industrial attachments, professional internships, and recruitment placements. It securely connects **Students**, **General Job Seekers**, **Recruiter Employers**, and **System Administrators**.

---

## 1. Project Directory Structure

```
/attachme
│
├── data/                            # Persistent local JSON database storage
│   └── db.json                      # Seed records & live user data
│
├── uploads/                         # Secure disk file uploading directory (CVs & Dean Letters)
│
├── src/
│   ├── types.ts                     # System-wide Shared TypeScript Interfaces
│   ├── api.ts                       # Axios/Fetch client integration mappings
│   ├── main.tsx                     # Vite Frontend Entry point
│   ├── index.css                    # Tailwind CSS Configuration Imports
│   ├── App.tsx                      # SPA Layout Router
│   │
│   ├── components/                  # Client-side Modular React Components
│   │   ├── Navbar.tsx               # Transparent responsive header containing interactive notification badge
│   │   ├── Footer.tsx               # Footer copyright & support channels links
│   │   ├── Home.tsx                 # Hero landing, category streams, & query forms
│   │   ├── JobsList.tsx             # Browse openings, filter sidebars, & application popups
│   │   ├── AuthPage.tsx             # Register & login panel with responsive employer fields
│   │   ├── StaticPages.tsx          # About, FAQ Accordion, Contact Form, Terms, & Privacy
│   │   └── Dashboards.tsx           # Role portals (Student/Seeker/Employer/Admin) + Recharts KPIs
│   │
│   └── backend/                     # Modular Node + Express backend logic
│       ├── db.ts                    # Thread-safe database emulation and JSON sync
│       └── middleware.ts            # Active JWT Authentication & RBAC role guards
│
├── server.ts                        # Main Express App, Multer uploads configuration, REST API endpoints, & Vite gateway
├── package.json                     # Lifecycle scripts, active compilers, and package imports
└── README.md                        # Platfrom blueprint, database schema, & setup manuals
```

---

## 2. Complete MySQL Database Schema

For traditional production environments, utilize the following MySQL blueprint (configured with secure relationships, indexes, standard cascading triggers, and keys):

```sql
-- Create Database
CREATE DATABASE IF NOT EXISTS attachme_db;
USE attachme_db;

-- 1. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    website VARCHAR(255),
    logo VARCHAR(255),
    employer_id VARCHAR(50) NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_company_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    role ENUM('student', 'job_seeker', 'employer', 'admin') NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    is_suspended BOOLEAN DEFAULT FALSE,
    company_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. PROFILES TABLES (Relates 1-to-1 to users)
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id VARCHAR(50) PRIMARY KEY,
    bio TEXT,
    cv_path VARCHAR(255),
    cv_name VARCHAR(150),
    cert_path VARCHAR(255),
    cert_name VARCHAR(150),
    avatar VARCHAR(255),
    skills JSON,                -- Array of skills strings
    education JSON,             -- Array of school credentials structures
    portfolio_links JSON,       -- Social URLs
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. JOBS TABLE
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(50) PRIMARY KEY,
    company_id VARCHAR(50) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    company_logo VARCHAR(255),
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    type ENUM('job', 'internship', 'attachment') NOT NULL,
    location VARCHAR(150) NOT NULL,
    salary VARCHAR(100) DEFAULT 'Unspecified stipend',
    requirements JSON,          -- Bullet points requirements
    skills JSON,                -- Desired skills keywords
    status ENUM('open', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_job_type(type),
    INDEX idx_job_location(location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(50) PRIMARY KEY,
    job_id VARCHAR(50) NOT NULL,
    job_title VARCHAR(150) NOT NULL,
    job_type ENUM('job', 'internship', 'attachment') NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    applicant_name VARCHAR(150) NOT NULL,
    applicant_role ENUM('student', 'job_seeker') NOT NULL,
    applicant_email VARCHAR(150) NOT NULL,
    status ENUM('pending', 'reviewed', 'accepted', 'rejected') DEFAULT 'pending',
    cover_letter TEXT,
    cv_path VARCHAR(255),
    cv_name VARCHAR(150),
    cert_path VARCHAR(255),
    cert_name VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_job (user_id, job_id)  -- Prevents multiple duplicate submissions from same candidate
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. SAVED JOBS TABLE
CREATE TABLE IF NOT EXISTS saved_jobs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    job_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(50) PRIMARY KEY,
    sender_id VARCHAR(50) NOT NULL,
    sender_name VARCHAR(150) NOT NULL,
    receiver_id VARCHAR(50) NOT NULL,
    receiver_name VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(150) NOT NULL,
    user_email VARCHAR(150) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('open', 'resolved') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. AUDIT LOGS TABLE (ADMIN EXCLUSIVE)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    performed_by VARCHAR(150) NOT NULL,
    ip VARCHAR(45) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 3. Modular API Routing Scheme

All APIs reside behind `/api/*` proxies keeping authentication credentials wholly isolated from the browser.

| Namespace | Path | Method | Access Guard | Details |
|---|---|---|---|---|
| **AUTH** | `/api/auth/register` | POST | Public | Registers a user. Generates Company record together if role is employer. Returns JWT. |
| **AUTH** | `/api/auth/login` | POST | Public | Validates login credentials. Emits JWT authorization. |
| **AUTH** | `/api/auth/me` | GET | `JWT Verified` | Decodes JWT, verifying that the member account is valid. |
| **AUTH** | `/api/auth/profile` | PUT | `JWT Verified` | Updates biography description, skills counters, and academics. |
| **AUTH** | `/api/auth/upload` | POST | `JWT Verified` | Handles Multipart upload streams (Multer) for CV Resumes and transcript papers. |
| **JOBS** | `/api/jobs` | GET | Public | Displays openings listings with query search, location, and placement filters. |
| **JOBS** | `/api/jobs/:id` | GET | Public | Renders full description, stipend details, and academic requirements. |
| **JOBS** | `/api/jobs` | POST | `Employer/Admin` | Publishes a vacant opening attached to the employer's company profile. |
| **JOBS** | `/api/jobs/:id` | DELETE | `Employer/Admin` | Deletes or closes an active placement directory. |
| **APPLY** | `/api/applications/apply` | POST | `Student/Seeker` | Applies for a vacancy. Validates that the profile has an uploaded resume. |
| **APPLY** | `/api/applications/my` | GET | `JWT Verified` | Dynamic list. Returns sent applications for seekers, company applicants for employers, or all for admin. |
| **APPLY** | `/api/applications/:id` | PUT | `Employer/Admin` | Updates status milestone (Accept, Reject, Review) and logs notification. |
| **CHATS** | `/api/messages` | GET | `JWT Verified` | Gathers secure direct chat logs between two candidate/recruiter partners. |
| **CHATS** | `/api/messages` | POST | `JWT Verified` | Logs direct message entries. Sends real-time notification alert to peer. |
| **SUPPORT**| `/api/reports` | POST | `JWT Verified` | Submits support tickets. |
| **ADMIN** | `/api/admin/stats` | GET | `Admin Only` | Aggregates user counts, distributions, active tickets, and lists safety audit logs. |
| **ADMIN** | `/api/admin/users` | GET | `Admin Only` | Lists every account card. |
| **ADMIN** | `/api/admin/users/:id/suspend` | PUT | `Admin Only` | Toggles account suspension (cancels session access). |
| **ADMIN** | `/api/admin/users/:id/approve` | PUT | `Admin Only` | Unlocks/Approves pending recruiter accounts. |

---

## 4. Cybersecurity Defense & Compliance

AttachME implements corporate SaaS security controls:
1. **Password Bcrypt Salting**: Uses high rounds cryptographic hashing (using `bcryptjs` node modules to avoid binary compilation drops) defending password databases against rainbow table lookups.
2. **Access Token Invalidation**: Emits cryptographic JSON Web Tokens valid for 7 days. Verifies headers on each backend API route. Immediate blacklist cleanup occurs on logout.
3. **Role-Based Access Control (RBAC)**: Distinct controllers require explicit roles. A client-side Student is block-forbidden from ever accessing Admin stats or approving/rejecting candidate records.
4. **Duplicate Prevention Constraints**: Database unique keys (`user_id` + `job_id`) block malicious candidates from flooding recruiters with duplicate submissions.
5. **Security Audit Trails**: Gathers critical actions (e.g. FAILED_LOGIN, RECRUITER_APPROVED, USER_SUSPENDED, RECORD_UPLOAD) detailing the performer email, IP coordinates, and system timestamps.

---

## 5. Standard Postman Integration Collection

Import the following specification file directly into your Postman client to test workspace compliance:

```json
{
  "info": {
    "name": "AttachME PLACEMENT portal API Collection",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "AUTH Register student",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"student@harvard.edu\",\n  \"password\": \"password123\",\n  \"name\": \"Alex Rivera\",\n  \"role\": \"student\"\n}"
        },
        "url": { "raw": "{{APP_URL}}/api/auth/register" }
      }
    },
    {
      "name": "AUTH Login recruiter",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"recruiter@microsoft.com\",\n  \"password\": \"password123\"\n}"
        },
        "url": { "raw": "{{APP_URL}}/api/auth/login" }
      }
    },
    {
      "name": "Get Open Placements list",
      "request": {
        "method": "GET",
        "url": { "raw": "{{APP_URL}}/api/jobs?query=Azure&location=Redmond" }
      }
    }
  ]
}
```

---

## 6. Local Setup and Deployment Guide

### First-Time Workspace Setup:
Ensure node is installed on your local computer.

1. **Install Base Packages**:
   ```bash
   npm install
   ```

2. **Run Dev Environment**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

3. **Deploying Cloud Run Containers (Production)**:
   Ensure you have Docker and GCP SDK configured:
   ```bash
   # Compile production distribution bundle
   npm run build

   # Create cloud production start script
   npm run start
   ```
   *Your server will bundle server-side scripts via esbuild to `dist/server.cjs` and start cleanly!*
