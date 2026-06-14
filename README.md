# NayePankh Foundation - Volunteer Portal

A professional Full-Stack Volunteer Registration & Management System built for the non-profit organization **NayePankh Foundation**.

This portal enables seamless volunteer onboarding, JWT-based secure authorization, event discovery and signup, real-time check-in/out via digital QR badge scans, hours tracking, rank-up badge tiers, automatic Landscape A4 PDF certificate generation, and dashboard statistics export (Excel-friendly CSV and formatted PDFs).

---

## 🚀 Key Features

### 1. Volunteer Dashboard
* **Dynamic Profiles**: Editable profile parameters, automated emergency contacts, and custom skills list.
* **Event Finder**: Browse and register for upcoming NGO campaigns (Literacy drives, clean-ups, checkup camps).
* **QR Badge Pass**: Unique digital QR pass dynamically rendered from volunteer profile details.
* **Rank Tiers**: Level up automatically based on cumulative hours worked (Bronze $\rightarrow$ Silver $\rightarrow$ Gold $\rightarrow$ Platinum).
* **Certificate Vault**: View and download personalized Landscape A4 completion certificates instantly.

### 2. Admin Control Center
* **Metrics & Analytics**: Interactive charts displaying monthly registration growth, volunteer coverage, and average statistics.
* **Volunteer Manager**: Review, search, filter (by skill/location/status), and approve/reject/delete applications.
* **Event Planner**: Full CRUD controls to launch, edit, and close volunteer events.
* **Attendance Scan Panel**: Scan volunteer QR passes to check them in or check them out (crediting volunteering hours dynamically).
* **Reports Dispatcher**: Export full system records to formatted PDF spreadsheets and CSV rosters.

---

## 🛠️ Technology Stack

* **Frontend**: React.js (Vite), Tailwind CSS, Lucide Icons, Recharts, Socket.io-client.
* **Backend**: Node.js, Express.js, Socket.io, PDFKit, Nodemailer.
* **Database**: MongoDB (Atlas) / File-System JSON DB Fallback.
* **Authentication**: JWT, bcryptjs password hashing.

---

## ⚙️ Setup & Installation

### Prerequisite: Database Setup
The application is equipped with an **intelligent Database Shim**.
* **MongoDB (Production)**: Configure `MONGODB_URI` inside `backend/.env`.
* **Mock Database Fallback (Dev/Offline)**: If no MongoDB connection is found, the system **automatically falls back to a mock file-system database** saving to `backend/data/*.json`. It performs query matching, password hashing, and populate relationships transparently without requiring local MongoDB configuration!

---

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Kairamnaik/NayePankh-Foundation-Volunteer-Portal.git
cd NayePankh-Foundation-Volunteer-Portal

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install --legacy-peer-deps
```

*Note: The `--legacy-peer-deps` flag is recommended on the frontend to support React 19 libraries smoothly.*

---

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend/` folder:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_signing_key_here
EMAIL_USER=your_smtp_email_address_here
EMAIL_PASS=your_smtp_app_password_here
```

*Note: If `EMAIL_USER` is set to the default mock email or left empty, the server enters **Email Simulator (Dev Mode)** and prints all system emails directly to the backend terminal log.*

---

### Step 3: Seed Default Data (Required for clean launch)

Run the seeder script in the `backend/` directory to create default admin/volunteer test logins and populate initial events:

```bash
cd backend
node seed.js
```

---

### Step 4: Run the Application

Start the backend server:
```bash
cd backend
npm run dev
```
*(Runs on `http://localhost:5001`)*

Start the frontend development server:
```bash
cd ../frontend
npm run dev
```
*(Runs on `http://localhost:5173`)*

---

## 🔑 Test Credentials

Once the database has been seeded, use these accounts to explore the system:

### 1. Administrator Account
* **Email**: `admin@gmail.com`
* **Password**: `admin123`

### 2. Volunteer Account (Pre-approved)
* **Email**: `volunteer@gmail.com`
* **Password**: `volunteerpassword123`
*(Contains 25.5 completed volunteer hours and a Silver Badge)*

### 3. Volunteer Account (Pending Approval)
* **Email**: `priya@gmail.com`
* **Password**: `priyapassword123`

---

## 🛡️ License

© 2026 NayePankh Foundation. All rights reserved.
Developed for non-profit community coordination.
