# ATTACHME PLATFORM: MULTI-ROLED FULL-STACK SaaS BLUEPRINT
## Production System Documentation & Technical Manual

Welcome to the full engineering documentation for the **AttachME Platform**, a high-fidelity job, internship, and industrial attachment ecosystem connecting Students, Job Seekers, Employers, and Admin Roles.

---

## 1. AUTHENTICATION FLOWS (JWT ROTATION & COOKIE SECURITY)

AttachME implements corporate-level JWT-based single sign-on (SSO) with **automatic Refresh Token Rotation (RTR)** to mitigate replay attacks and session interception.

### Core Architecture:
1. **Registered / Verified Access**:
   * Standard user credentials (passwords) are irreversibly hashed using **bcryptjs** with 10 dynamic salt rounds.
   * On authenticating via `POST /api/auth/login`, two distinct cryptographic tokens are forged:
     * **Access Token**: Short-lived (15-minute expiration) JSON Web Token (JWT) bearing user metadata (ID, email, authorization role).
     * **Refresh Token**: Long-lived (7-day expiration) cryptographically secure signature stored as an `HttpOnly`, `SameSite=Strict` cookie.
2. **Refresh Token Rotation (RTR)**:
   * Rather than storing persistent access keys in unsafe browser storage (like standard local-storage, exposing sessions to XSS scripting extracts), the client preserves the transient short access token in memory.
   * Upon token expiry, the client hits the rotation path `POST /api/auth/refresh-token` with the HttpOnly cookie.
   * The server decodes the refresh token, invalidates the previous session, issues a **brand-new access token**, and returns an **updated, rotated refresh token cookie** (defeating token theft).
3. **Logout & Session Destruction**:
   * Sending a `POST /api/auth/logout` commands the browser to actively purge the HttpOnly `refreshToken` cookie, instantly invalidating the credentials session.

```
[Candidate Browser]                            [AttachME Backend Engine]
        |                                                 |
        |---- 1. POST /api/auth/login ------------------->| (Verifies Bcrypt hashing)
        |<--- 2. Returns short AccessToken (15m) ---------| 
        |        & Sets HttpOnly RefreshToken Cookie (7d)|
        |                                                 |
(Access Token expires)                                    |
        |---- 3. POST /api/auth/refresh-token ----------->| (Decodes old cookie)
        |<--- 4. Returns new AccessToken (15m) -----------| (Rotates and issues
        |        & Sets rotated RefreshToken Cookie (7d) -|  new secure cookies)
```

---

## 2. API SPECIFICATIONS CONTRACT

All responding endpoints strictly follow the uniform JSON shape protocol:
```json
{
  "success": true,
  "message": "Action context description",
  "data": { ... }
}
```

### AUTHENTICATION API
* **POST `/api/auth/register`**  
  * *Purpose*: Register a new Student, Job Seeker, or Employer account.  
  * *Permitted Roles*: Public.  
  * *Payload*:
    ```json
    { "email": "candidate@univ.edu", "password": "securePass123", "name": "Jane Doe", "role": "student" }
    ```
* **POST `/api/api/auth/login`**  
  * *Purpose*: Validate hashed secure credentials and mount security session.  
  * *Payload*:
    ```json
    { "email": "candidate@univ.edu", "password": "securePass123" }
    ```
* **POST `/api/auth/refresh-token`**  
  * *Purpose*: Exchange rotated refresh cookies for refreshed access token.  
  * *Payload*: Empty (Reads HttpOnly cookie values).
* **POST `/api/auth/logout`**  
  * *Purpose*: Revoke secure cookies and break login state.
* **GET `/api/auth/me`**  
  * *Purpose*: Retrieve active authenticated user metadata and academic records.

### OPPORTUNITIES / JOBS API
* **GET `/api/jobs`**  
  * *Purpose*: List, filter, and discover attachment postings, internships, and full openings.  
  * *Parameters*: `query` (text search), `location`, `type` (`attachment`, `internship`, `job`).
* **POST `/api/jobs`**  
  * *Purpose*: Post new positions.  
  * *Permitted Roles*: `employer`, `admin`.  
  * *Payload*:
    ```json
    { "title": "Node Frontend Dev Team", "description": "3-month attachment", "type": "attachment", "location": "Nairobi, KE", "salary": "$800" }
    ```
* **PUT `/api/jobs/:id`**  
  * *Purpose*: Modify listing specifications (restricted to listing owner or admin).
* **DELETE `/api/jobs/:id`**  
  * *Purpose*: Deprecate listing.

### APPLICATIONS PIPELINE API
* **POST `/api/applications/apply`**  
  * *Purpose*: Submit credentials documents to an opening.  
  * *Permitted Roles*: `student`, `job_seeker`.  
  * *Payload*:
    ```json
    { "jobId": "job_xyz_123", "coverLetter": "Eager undergraduate application." }
    ```
* **GET `/api/applications/my`**  
  * *Purpose*: Retrieve relevant submissions (Students see theirs, recruiters see applications for their workspace, admins see global catalogs).
* **PUT `/api/applications/:id`**  
  * *Purpose*: Update status of applicant (`pending`, `reviewed`, `accepted`, `rejected`).  
  * *Permitted Roles*: `employer`, `admin`.

---

## 3. OWASP-ALIGNED SECURITY ARCHITECTURE

AttachME uses multiple active defensive measures to protect academic data:

1. **Helmet Middleware**: Configures HTTP headers to protect against Clickjacking, MIME-type sniffing, cross-site scripting (XSS), and session hijacking.
2. **CORS Defense**: Refuses unauthorized request sources. Restricts API operations exclusively to designated clients.
3. **IP Rate Limiting**: Throttles intense, high-frequency requests, preventing Brute Force logic attacks on login paths.
4. **Hashed Document Quarantine (Multer)**: Documents uploaded (Resumes, Transcripts, University end-letters) are aggressively sanitized, assigned custom high-order hashes, and served behind controlled Express proxies to block any arbitrary executable scripts.
5. **NoSQL / Parameterized SQL Injection Blocker**: Prevents malicious syntax manipulation inside input boxes.
6. **Robust Error Masking**: Prevents structural back-trace leaking to prevent code-base discovery.

---

## 4. REAL-TIME EVENT DRIVEN LAYER (Socket.io)

For instant peer messaging, notifications, and pipeline states:

* **Inbound Listeners**:
  * `connection`: Instantiates client connection.
  * `join_session`: Joins specific private channel (rooms) for secure messaging or team chats.
  * `typing_status`: Emits typing states between candidates and recruiter profiles.
* **Outbound Emmission Contracts**:
  * `application_alert`: Sends real-time toast to candidate when application status changes.
  * `incoming_message`: Instantly streams direct chats during interview matching.
  * `recruiter_ping`: Pings employers immediately when candidate uploads missing documents.

---

## 5. REVOLUTIONARY DASHBOARD ANALYTICS (Chart.js / Recharts)

AttachME integrates Recharts for administrative and recruiter metrics visualization:
* **Hiring Funnel**: Shows candidate counts segmented by: `Pending` | `Reviewed` | `Accepted` | `Rejected`.
* **Vacancy Allocation**: Grouped count charts tracking `Attachments`, `Internships`, and `Full Jobs`.
* **User Matrix**: Broken down charts reporting user enrollment categories.
* **Audit Trail Feed**: Chronological tabular log reporting recent logins, profile adjustments, uploads, and RBAC actions.

---

## 6. LOCAL AND PRODUCTION SETUP INSTRUCTIONS

### Step 1: Pre-requisites
* Install **Node.js** (v18 or high-order)
* Install **MySQL Server** and ensure active connection credentials.

### Step 2: Establish the Relational Database
Execute `/schema.sql` via console or client:
```bash
mysql -u root -p < schema.sql
```

### Step 3: Set Environmental Variables (`.env`)
Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development

# MySQL DB configuration
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=yourPassword
DB_NAME=attachme_db

# Security Token Keys
GEMINI_API_KEY=your_super_secret_unique_jwt_core_seed_key
```

### Step 4: Installation & Local Boot
1. Download or unzip codebase structures.
2. Build and boot local environment:
```bash
# Install dependencies
npm install

# Run the Development server
npm run dev
```

---

## 7. DEPLOYMENT TO CLOUD SERVICES (DOCKER & CLOUD RUN)

The repository is pre-configured with a universal `Dockerfile` optimized for high-performance Node environments:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/uploads ./uploads

EXPOSE 3000
CMD ["npm", "start"]
```

Deploying to Google Cloud Run:
```bash
# Build Docker image
gcloud builds submit --tag gcr.io/your-project-id/attachme

# Deploy to Cloud Run
gcloud run deploy attachme \
  --image gcr.io/your-project-id/attachme \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000
```

---

## 8. IMPORTABLE POSTMAN COLLECTION PROTOCOL (REST TESTING)

To test the complete API contract immediately, paste the following JSON payload config directly inside Postman's **Import** window:

```json
{
  "info": {
    "name": "AttachME SaaS Platform API Collection",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth - Register Student",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Content-Type", "value": "application/json" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"john@harvard.edu\",\n  \"password\": \"pass123\",\n  \"name\": \"John Miller\",\n  \"role\": \"student\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/auth/register",
          "host": [ "{{base_url}}" ],
          "path": [ "api", "auth", "register" ]
        }
      }
    },
    {
      "name": "Auth - Login",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Content-Type", "value": "application/json" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"student@harvard.edu\",\n  \"password\": \"password123\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/auth/login",
          "host": [ "{{base_url}}" ],
          "path": [ "api", "auth", "login" ]
        }
      }
    },
    {
      "name": "Auth - Rotate Session Token",
      "request": {
        "method": "POST",
        "header": [],
        "url": {
          "raw": "{{base_url}}/api/auth/refresh-token",
          "host": [ "{{base_url}}" ],
          "path": [ "api", "auth", "refresh-token" ]
        }
      }
    },
    {
      "name": "Jobs - Post New Listing",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Content-Type", "value": "application/json" },
          { "key": "Authorization", "value": "Bearer {{jwt_token}}" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Frontend Engineering intern (React)\",\n  \"description\": \"Internship in Fluent Design UX team.\",\n  \"type\": \"internship\",\n  \"location\": \"Seattle, WA\",\n  \"salary\": \"$5,000 / month\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/jobs",
          "host": [ "{{base_url}}" ],
          "path": [ "api", "jobs" ]
        }
      }
    },
    {
      "name": "Jobs - Fetch Active Opportunities",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/api/jobs?type=internship",
          "host": [ "{{base_url}}" ],
          "path": [ "api", "jobs" ],
          "query": [
            { "key": "type", "value": "internship" }
          ]
        }
      }
    },
    {
      "name": "Admin - Read Global Statistics",
      "request": {
        "method": "GET",
        "header": [
          { "key": "Authorization", "value": "Bearer {{jwt_token}}" }
        ],
        "url": {
          "raw": "{{base_url}}/api/admin/stats",
          "host": [ "{{base_url}}" ],
          "path": [ "api", "admin", "stats" ]
        }
      }
    }
  ],
  "event": [
    {
      "listen": "test",
      "script": {
        "type": "text/javascript",
        "exec": [
          "var response = pm.response.json();",
          "if (response.token) {",
          "    pm.globals.set(\"jwt_token\", response.token);",
          "}"
        ]
      }
    }
  ],
  "variable": [
    { "key": "base_url", "value": "http://localhost:3000" }
  ]
}
```
