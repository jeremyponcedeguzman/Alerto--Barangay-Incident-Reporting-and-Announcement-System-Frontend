# 🚨 Alerto: Barangay Incident Reporting and Emergency Announcement System

> **Course:** Advanced Web Programming (CTADWEBL) — Major Examination (Final Project)  
> **Institution:** School of Architecture, Technology, and Computing — Computer Science and Information Technology Department, NU Clark  
> **Academic Year:** 2026–2027  

---

## 👥 Group Members
- **Jeremy Ponce S. De Guzman**
- **Bryne T. Magat**
- **Daniel Carl P. Pillado**
- **Wendell Angelo P. Sambile**
- **Christian Luis Santos**

---

## 📌 Project Concept & Domain

In community disaster risk reduction and management (DRRM), rapid communication, geographic precision, and verified on-the-scene information save lives. In many local barangays, emergency reporting and public announcements still rely on fragmented messaging threads, unverified social media posts, or physical blotter walk-ins at the Barangay Hall. These methods create severe communication bottlenecks during natural calamities (such as monsoon flash floods along the MacArthur Highway corridor, typhoon inundation, or residential fires) and peace-and-order incidents.

**Alerto** is a community-focused emergency notification, incident reporting, and public safety management platform engineered specifically for **Barangay Anupul, Bamban, Tarlac**. It establishes a verified, two-way digital communication link between community residents and barangay emergency responders:

- **Citizens & Residents:** Report real-time emergencies directly from their mobile phones or desktop browsers with live GPS coordinates, authentic WebRTC camera evidence, and verified resident credentials.
- **Barangay Operations Center & Officials:** Monitor incoming incidents on an interactive GIS map and density heatmap, triage dispatches to specialized response units (Bureau of Fire Protection, DRRMO Rescue, BHERT Medics, and Barangay Tanods), verify resident clearance credentials via an interactive lightbox inspector, and broadcast high-priority safety bulletins across constituent Sitios (*Baguingit, Binitagan, Centro, Manga, Mape, Pag-asa, Priority, San Joseph, San Roque, and MacArthur Highway*).

---

## ⚙️ What the Application Does & What Data It Processes

Beyond static record display, Alerto performs real-time spatial calculations, document verification, demographic vulnerability filtering, and responsive business logic:

### 1. Data Aggregations & Status Pipeline
Computes real-time distribution and progression of reported emergency incidents across structured lifecycle stages:
$$\text{Pending Review} \longrightarrow \text{Under Investigation} \longrightarrow \text{Dispatched} \longrightarrow \text{Resolved} \text{ (or Dismissed)}$$

Evaluates distribution across emergency classifications (`fire`, `flood`, `medical`, `police`, `accident`, `hazard`) and urgency severity levels (`low`, `medium`, `high`, `critical`) to guide dispatch resource allocation.

### 2. Demographic Risk Profiling & Evacuation Prioritization
Evaluates resident directories aggregated by Purok and Sitio to prioritize emergency rescue and evacuation routes for vulnerable populations:
$$\text{Vulnerability Ratio} = \frac{\text{Senior Citizens} + \text{Persons with Disabilities (PWD)}}{\text{Total Registered Residents}}$$

### 3. Spatial Density & Heatmap Clustering Rules
- Computes incident concentration per geographic coordinate cluster.
- When reported emergencies within a category exceed the spatial density threshold ($N \ge 3$ incidents within adjacent radius), the system dynamically renders elevated heatmap intensities and cluster indicators on the GIS map.

### 4. Dynamic Elapsed Time Computations
- Evaluates real-time elapsed durations against ISO timestamps (`createdAt`).
- Computes human-readable relative ages (e.g., *"Just now"*, *"14 minutes ago"*, *"3 hours ago"*) synchronized across client polling intervals.

### 5. Multi-Criteria Query Filtering & Sorting
- Dynamic client and server-side filtering across overlapping criteria: incident category slugs, urgency severity, dispatch status, Sitio/Purok territory, and regex full-text search across titles, descriptions, and reporter names.

### 6. Processed Data Entities Matrix

| Data Entity | Fields Processed | Storage & Handling |
| :--- | :--- | :--- |
| **Incident Reports** | Title, category (`flood`, `fire`, `medical`, `police`, `accident`, `hazard`), severity (`low`, `medium`, `high`, `critical`), description, coordinates (`lat`, `lng`), location name, sitio tag, photo evidence URL, reporter ID/name, assigned responder, dispatch status, investigation notes, timestamp | MongoDB Atlas (`incidents` collection) + LocalStorage offline sync cache |
| **Resident Directory** | Full name, email address (*unique*), mobile contact number, Sitio address, residency status (`pending`, `approved`, `rejected`), proof of residency document URL & filename, submission timestamp | MongoDB Atlas (`residents` collection) + Cloudinary CDN / SVG Certificate |
| **Officials & Tanods** | Full name, official email (*unique*), hashed password (bcrypt), administrative role (`Admin`, `Barangay Official`, `Staff`), designated position (*Barangay Captain, Tanod Desk Officer*), contact number | MongoDB Atlas (`users` collection) + JWT authentication token |
| **Emergency Advisories** | Alert title, category, severity level, message body, target Sitios, expiration date, active status flag, issuing official | MongoDB Atlas (`alerts` collection) |
| **Duty Roster** | Staff name, role, contact number, shift type (*Morning, Afternoon, Night, Standby*), assigned patrol sector, duty status | MongoDB Atlas (`staff` collection) |
| **Security Audit Logs** | Action taken, actor, target entity ID, details, timestamp, severity flag (`info`, `notice`, `warning`, `critical`) | MongoDB Atlas (`auditlogs` collection) |

---

## 🖼️ Application Architecture & Component Diagram

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                 React 19 Frontend Application               │
│  - Vite Build Engine & Single Page Application (SPA)        │
│  - React Router DOM (Dynamic Route Guards & Auth Context)   │
│  - Leaflet & React-Leaflet GIS Tile Mapping + Heatmaps      │
│  - WebRTC Camera Hardware Snapshot Interface                │
│  - Document Lightbox with Interactive Zoom & Inspection     │
│  - React Hook Form + Zod Client-Side Schema Validation      │
└─────────────────────────────────────────────────────────────┘
                               │
                               │ HTTPS REST API Requests (Axios Client)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express REST API Backend                  │
│  - Modular Express Controllers & Service Architecture       │
│  - JWT Bearer Authentication & Role Authorization Guards   │
│  - Cross-Collection Duplicate Email Verification            │
│  - Morgan HTTP Request Logger & Centralized Error Handler   │
└─────────────────────────────────────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│   MongoDB Atlas Database    │ │    Cloudinary Media CDN     │
│  - Resident Directory       │ │  - Camera Photo Snapshots   │
│  - Incident Reports         │ │  - Proof of Residency Files │
│  - Emergency Advisories     │ │  - Secure Global Delivery   │
│  - Mongoose ODM Schemas     │ │  - Auto Image Compression   │
└─────────────────────────────┘ └─────────────────────────────┘
```

---

## 🛠️ Setup Instructions & Prerequisites

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher (or **yarn**)
- **Backend API:** Running instance of the Alerto Express API (default: `http://localhost:5000/api`)
- **Modern Web Browser:** Chrome, Edge, Firefox, or Safari with WebRTC camera and Geolocation support

---

### Step-by-Step Installation

1. **Clone the Frontend repository:**
   ```bash
   git clone https://github.com/jeremyponcedeguzman/Alerto--Barangay-Incident-Reporting-and-Announcement-System-Frontend.git
   cd Alerto--Barangay-Incident-Reporting-and-Announcement-System-Frontend
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the project root:
   ```bash
   # Windows PowerShell:
   Copy-Item .env.example .env
   # Or create directly:
   echo "VITE_API_URL=http://localhost:5000/api" > .env
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   *The application will launch on `http://localhost:5173`.*

5. **Build for production:**
   ```bash
   npm run build
   ```
   *Optimized static assets will be compiled into the `dist/` directory.*

---

## 🔐 Environment Variables

The frontend application requires the following environment variable configured in `.env`:

| Variable | Required | Description | Example / Default |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | **Yes** | Root URL pointing to the active Express backend REST API | `http://localhost:5000/api` |

---

## 🔑 Default Test Accounts

| Portal | Email / Identifier | Password | Access Level & Role |
| :--- | :--- | :--- | :--- |
| **Official Admin Portal** (`/admin/login`) | `admin@anupul.gov` | `admin123` | Full Administrative & Dispatch Operations Desk |
| **Resident Citizen Portal** (`/login`) | `resident@gmail.com` | `resident123` | Verified Bonafide Resident Citizen |
| **Pending Resident** | `maria.santos@gmail.com` | `password123` | Awaiting Document Verification in Admin Queue |

---

## 📡 Complete REST API Documentation Table

All client operations interact with standard HTTP methods, JSON request/response structures, and standard status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Server Error`).

| Method | Endpoint | Purpose | Access | Sample Request Payload | Sample Response Payload | Status |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| `GET` | `/` | Root API health status & version info | Public | *None* | `{"message": "Barangay Emergency Notification System API is running", "version": "1.0.0", "cloudinaryEnabled": true}` | `200` |
| `GET` | `/api/health` | Diagnostics & Cloudinary connection check | Public | *None* | `{"status": "healthy", "uptime": 45.1, "cloudinaryConfigured": true}` | `200` |
| `POST` | `/api/auth/register` | Register new official or administrator | Public | `{"fullName": "Pedro Penduko", "email": "pedro@anupul.gov", "password": "password123", "role": "Barangay Official", "position": "Tanod Desk Officer", "contactNumber": "0917-111-2222"}` | `{"success": true, "message": "Account registered successfully", "token": "eyJhbGciOi...", "user": {"id": "67...", "email": "pedro@anupul.gov", "role": "Barangay Official"}}` | `201` |
| `POST` | `/api/auth/login` | Authenticate official / admin and issue JWT token | Public | `{"email": "admin@anupul.gov", "password": "admin123"}` | `{"success": true, "token": "eyJhbGciOi...", "user": {"id": "67...", "fullName": "Barangay Official", "role": "Admin"}}` | `200` |
| `GET` | `/api/auth/me` | Retrieve profile of authenticated official | Private | *Headers: `Authorization: Bearer <token>`* | `{"success": true, "data": {"fullName": "Barangay Official", "role": "Admin", "email": "admin@anupul.gov"}}` | `200` |
| `GET` | `/api/auth/officials` | Retrieve directory of all registered barangay officials | Private | *Headers: `Authorization: Bearer <token>`* | `{"success": true, "count": 2, "data": [{"fullName": "Hon. Roberto Santos", "position": "Barangay Captain"}]}` | `200` |
| `POST` | `/api/incidents` | Submit emergency incident report with live photo evidence | Public | `{"title": "Creek Overflow Near Bridge", "category": "flood", "severity": "high", "locationName": "Bridge, Sitio Mape", "lat": 15.2891, "lng": 120.5712, "description": "Rapid water level rise threatening houses.", "reportedBy": "Juan Dela Cruz", "imageEvidence": "data:image/jpeg;base64,..."}` | `{"success": true, "message": "Incident report logged successfully", "data": {"_id": "67...", "title": "Creek Overflow Near Bridge", "imageEvidence": "https://res.cloudinary.com/...", "status": "Pending"}}` | `201` |
| `GET` | `/api/incidents` | List incidents with category, severity, and Sitio filters | Public | *Query: `?status=Pending&purok=Sitio+Centro`* | `{"success": true, "count": 12, "data": [{"_id": "67...", "title": "MacArthur Flash Flood", "severity": "high", "status": "Pending"}]}` | `200` |
| `GET` | `/api/incidents/:id` | Fetch single incident report by ID | Public | *None* | `{"success": true, "data": {"_id": "67...", "title": "Structure Fire", "responder": "BFP Firefighters 🚒"}}` | `200` |
| `PATCH` | `/api/incidents/:id` | Update dispatch status or assigned responder | Private (Official/Admin) | `{"status": "Dispatched", "responder": "BFP Unit 1"}` | `{"success": true, "message": "Incident status updated successfully", "data": {"status": "Dispatched"}}` | `200` |
| `PATCH` | `/api/incidents/:id/status` | Update incident status and response action notes | Private (Official/Admin) | `{"status": "Resolved", "actionTakenNotes": "Fire extinguished by BFP team."}` | `{"success": true, "message": "Incident status updated successfully", "data": {"status": "Resolved"}}` | `200` |
| `DELETE` | `/api/incidents/:id` | Delete incident record | Private (Admin) | *None* | `{"success": true, "message": "Incident report deleted successfully"}` | `200` |
| `GET` | `/api/incidents/stats/overview` | Compute aggregate incident counts by status and severity | Public | *None* | `{"success": true, "total": 24, "byStatus": {"Pending": 4, "Resolved": 15, "Dispatched": 5}, "bySeverity": {"critical": 3, "high": 8, "medium": 10, "low": 3}}` | `200` |
| `GET` | `/api/alerts` | Get all barangay emergency bulletins and advisories | Public | *Query: `?severity=critical`* | `{"success": true, "count": 4, "data": [{"title": "Typhoon Warning Signal #2", "urgency": "critical", "affectedPuroks": ["All Sitios"]}]}` | `200` |
| `GET` | `/api/alerts/active` | Retrieve top active advisories for marquee banner | Public | *None* | `{"success": true, "count": 2, "data": [{"title": "Flash Flood Advisory", "urgency": "high"}]}` | `200` |
| `GET` | `/api/alerts/:id` | Fetch single advisory by ID | Public | *None* | `{"success": true, "data": {"title": "Typhoon Warning", "message": "Move to designated evacuation centers."}}` | `200` |
| `POST` | `/api/alerts` | Broadcast emergency alert to community | Private (Official/Admin) | `{"title": "Flash Flood Advisory", "category": "weather", "urgency": "high", "message": "Heavy monsoon rains expected. Evacuate low-lying river areas.", "affectedPuroks": ["Sitio Mape", "Sitio San Roque"], "issuedBy": "BDRRMC Anupul"}` | `{"success": true, "message": "Emergency alert broadcasted successfully", "data": {"_id": "67...", "title": "Flash Flood Advisory"}}` | `201` |
| `PUT` | `/api/alerts/:id` | Update broadcast advisory content or status | Private (Official/Admin) | `{"status": "Resolved", "instructions": "Residents may safely return home."}` | `{"success": true, "message": "Emergency alert updated successfully"}` | `200` |
| `DELETE` | `/api/alerts/:id` | Delete advisory bulletin | Private (Admin) | *None* | `{"success": true, "message": "Emergency alert deleted successfully"}` | `200` |
| `POST` | `/api/residents/register` | Public resident self-registration *(duplicate email check)* | Public | `{"fullName": "Maria Santos", "email": "maria.santos@gmail.com", "contactNumber": "0918-222-3333", "purok": "Sitio Mape", "address": "Block 2, Sitio Mape", "proofOfResidencyName": "clearance.png", "proofOfResidencyUrl": "https://res.cloudinary.com/..."}` | `{"success": true, "message": "Resident registered to emergency notification directory", "data": {"_id": "67...", "fullName": "Maria Santos", "verificationStatus": "pending"}}` | `201` |
| `GET` | `/api/residents` | Retrieve resident directory with vulnerability filters | Private (Official/Admin) | *Query: `?vulnerable=true&purok=Sitio+Centro`* | `{"success": true, "count": 45, "data": [{"fullName": "Ben Perez", "isSeniorCitizen": true}]}` | `200` |
| `GET` | `/api/residents/stats/demographics` | Compute vulnerable population breakdown per Sitio | Private (Official/Admin) | *None* | `{"success": true, "data": {"totalResidents": 45, "seniorCitizens": 12, "pwds": 4, "purokBreakdown": [{"_id": "Sitio Centro", "total": 20, "seniors": 6, "pwds": 2}]}}` | `200` |
| `GET` | `/api/residents/:id` | Retrieve single resident directory profile | Private (Official/Admin) | *None* | `{"success": true, "data": {"fullName": "Ben Perez", "emergencyContactPerson": "Ana Perez"}}` | `200` |
| `POST` | `/api/residents` | Official manually adds resident with priority tagging | Private (Official/Admin) | `{"fullName": "Rosa Diaz", "contactNumber": "09192223333", "purok": "Sitio Pag-asa", "isSeniorCitizen": true}` | `{"success": true, "message": "Resident registered to emergency notification directory"}` | `201` |
| `PUT` | `/api/residents/:id` | Update resident contact, address, or verification status | Private (Official/Admin) | `{"verificationStatus": "approved"}` | `{"success": true, "message": "Resident record updated successfully"}` | `200` |
| `DELETE` | `/api/residents/:id` | Remove resident record from directory | Private (Admin) | *None* | `{"success": true, "message": "Resident removed from emergency directory"}` | `200` |
| `POST` | `/api/upload` | Upload camera snapshot or ID document to Cloudinary | Public | `{"image": "data:image/jpeg;base64,...", "folder": "barangay-emergency/evidence"}` | `{"success": true, "url": "https://res.cloudinary.com/oaxdxwvz/image/upload/v1/...jpg"}` | `200` |
| `GET` | `/api/staff` | Retrieve Tanod patrol roster and active duty shifts | Public | *None* | `{"success": true, "data": [{"fullName": "Officer Roberto Diaz", "shift": "Night", "assignedZone": "Sitio Centro"}]}` | `200` |
| `GET` | `/api/audit-logs` | Retrieve chronological security & operations audit trail | Private (Admin) | *Headers: `Authorization: Bearer <token>`* | `{"success": true, "data": [{"action": "Resident Verification Approved", "actor": "Barangay Official", "timestamp": "..."}]}` | `200` |

---

## ✨ Core Features & Known Limitations

### Core Features
- **Accurate Sitio Geolocation:** Interactive markers rendered on Leaflet with dynamic category iconography, tuned to the geographic boundaries of Barangay Anupul, Bamban, Tarlac.
- **Hardware Camera Anti-Tamper Capture:** Streams device camera video directly (`navigator.mediaDevices.getUserMedia`) to capture authentic on-the-scene evidence, preventing fabricated gallery submissions.
- **Automated Dispatch Routing:** Automatically matches emergency categories to specialized barangay and municipal response units:
  - `fire` $\to$ Bureau of Fire Protection (BFP) 🚒
  - `flood` $\to$ Disaster Risk Reduction & Management Office (DRRMO) 🌊
  - `medical` $\to$ Barangay Health Emergency Response Team (BHERT) 🚑
  - `police` $\to$ Barangay Tanod & PNP 👮
  - `accident` $\to$ Traffic Enforcement & Tanod ⚠️
  - `hazard` $\to$ Barangay Engineering & Electric Cooperative ⚡
- **Residency Document Lightbox Inspector:** Official document inspection modal featuring interactive zoom controls (`50%` to `250%`), pan navigation, dry seal verification, and direct Approve/Reject actions.
- **Live SVG Clearance Generator:** Generates authentic SVG Barangay Residency Clearance documents complete with Philippine dry seals, control serials, and specimen signatures for offline resilience and demonstration.
- **Strict Duplicate Email Protection:** Cross-verifies email uniqueness across both Resident and Official directories on both frontend form validation and backend database layers.
- **Cloudinary CDN Integration:** Offloads high-resolution camera evidence and clearance documents to Cloudinary, ensuring optimal performance and fast load times.
- **Tanod Duty Roster:** Manages four shifts (*Morning, Afternoon, Night, Standby*) with active duty indicators and quick emergency contact dialers.

### Known Limitations
- **Cellular SMS Gateway:** In the current version, emergency advisories broadcast instantaneously through web banners and active incident feeds. Direct mobile carrier SMS push requires an active Philippine commercial SMS gateway subscription (e.g., Semaphore, Twilio PH, or iTexMo).
- **WebRTC Camera Hardware Permissions:** Live photo capture requires HTTPS (or `localhost`) and user permission to access the device's camera. Devices without webcam hardware fall back to GPS pin placement and file attachments.
- **Client-Side Geolocation Accuracy:** GPS coordinates rely on the client device's browser Geolocation API (`navigator.geolocation`). In indoor desktop environments, position accuracy may default to nearby cellular/ISP towers or the central Barangay Operations Center coordinates.
- **Offline Background Sync:** While the system falls back gracefully to `localStorage` when network connectivity drops, automatic background queue synchronization is limited if the browser tab is closed prior to reconnection.
