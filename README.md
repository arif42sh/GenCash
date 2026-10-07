# GenCash — AI-Powered Intelligent Digital Financial Services (MFS) Platform

> **AI DEV FEST 2026 — AI Hackathon (From Idea to Working AI Solution)**  
> **Organized by:** DIU Computer and Programming Club (DIU-CPC), Dept. of CSE, Daffodil International University  
> **Architecture Paradigm:** *INPUT → INTELLIGENCE → ACTION*

---

## 1. 📌 Project Overview

### Problem Statement
Traditional Mobile Financial Services (MFS) in emerging markets operate primarily as passive transactional utilities (send, cash out, bill pay). Users struggle to understand where their money goes, often experiencing micro-spending leakages and lacking actionable financial health insights. Simultaneously, MFS operators broadcast static, non-personalized promotional campaigns that result in high marketing burn rates, campaign fatigue, and sub-optimal conversion.

### Proposed Solution: GenCash
**GenCash** transforms digital financial services by embedding a dual-directional Artificial Intelligence engine into the core transactional workflow:
1. **Consumer-Facing AI Financial Assistant (PFM):** Real-time Cashflow Balance Sheet (Inflow vs. Outflow), date-wise financial intelligence, category-wise spending breakdowns (Mobile Recharge, Merchant Payments, Send Money, Utility Bills), spending anomaly warnings, predictive utility cycle reminders, and natural-language "Ask AI" queries.
2. **Operator-Facing Next-Best-Offer (NBO) & Uplift Engine:** Machine Learning propensity models with transparent Explainable AI (XAI) in both Bengali and English, coupled with an interactive Campaign Simulator that optimizes marketing budgets and predicts conversion uplifts before broadcasting.

---

## 2. ⚡ Features & How AI Components Are Used

### 📱 Customer Mobile App (React Native / Expo)
* **Full-Spectrum MFS Transactions:**
  * **Send Money (P2P):** Atomic wallet debit/credit with recipient existence validation and PIN security.
  * **Mobile Recharge:** Seamless airtime recharge for all 5 national operators (Grameenphone, Robi, Banglalink, Airtel, Teletalk) with prepaid/postpaid options.
  * **Merchant QR & Outlet Payment:** Dynamic merchant directory lookup (DESCO, DPDC, Polli Bidyut, Shwapno, Chillox, Star Tech) with real-time cashier notes.
  * **Cash Out:** Agent point withdrawals with real-time 1.85% fee computation.
  * **Add Money:** Simulated bank transfer and card deposits with instant wallet credit.
  * **Digital Passbook & Transaction Ledger:** Paginated ledger with search, direction tags (+/-), and digital receipt modals.
* **AI Cashflow & Spending Tracker (Personal Finance Manager):**
  * **Date-Wise Timeframe Filtering:** Instant aggregation across *Today*, *This Week*, *This Month*, *Last Month*, or *All Time*.
  * **Inflow vs. Outflow Hero Card:** Live calculation of total money in, total money out, net savings surplus/deficit, and split visual ratio bar.
  * **Category-wise Spending Breakdown:** Live percentage share, total amount, and transaction counts across Mobile Recharge, Merchant Shopping, Send Money, Utility Bills, and Cash Out.
  * **Dynamic AI Spending Assessment:** AI evaluates top expense drivers, daily burn rate, and provides personalized money-saving advice.
  * **Natural Language "Ask AI" Queries:** Search input and quick chips (*"এই মাসে রিচার্জ কত?"*, *"এই সপ্তাহে কত ঢুকলো?"*, *"মার্চেন্ট পেমেন্ট ও শপিং"*) that instantly isolate data and output an explainable summary.
* **AI Health Score & Predictive Utilities:**
  * **Financial Health Score Card:** Dynamic score (88/100), savings unlocked, budget control, and risk indicators.
  * **Spending Anomaly Alert:** Flags unusual spending spikes with explainable reasoning (XAI).
  * **Predictive Utility Reminders:** Anticipates recurring utility bills (DESCO) and SIM recharge expirations with 1-tap payment actions.
  * **Hyper-Personalized Next-Best-Offers:** Displays ML-ranked offers with affinity match percentage and transparent justification in Bengali & English.
* **Bilingual Experience:** Instant toggle between **বাংলা (Bengali)** and **English** with Bengali numerals support.

### 🧠 Backend AI & Machine Learning Pipeline (FastAPI + Scikit-Learn)
* **Gradient Boosting Propensity Classifier:** Evaluates customer transaction recency, frequency, monetary value (RFM), and category preferences to predict conversion likelihood.
* **Uplift Modeling (Four-Quadrant Segmentation):** Segments customers into *Persuadables*, *Sure Things*, *Lost Causes*, and *Sleeping Dogs* to eliminate wasted marketing spend.
* **Explainable AI (XAI) Generation:** Automatically synthesizes human-readable rationales in Bengali and English explaining *why* an offer or budget alert was generated.
* **Interactive Campaign Simulator (`/simulator`):** Web-based dashboard enabling marketing managers to simulate target segment sizes, expected response rates, and return on campaign investment (ROCI).

---

## 3. 🛠️ Technology Stack

| Layer | Technologies & Frameworks | Description |
| :--- | :--- | :--- |
| **Mobile Frontend** | **React Native (v0.86)**, **Expo SDK (v57)**, **Expo Router / Metro** | Cross-platform native mobile app (Android, iOS, Web) |
| **Styling & Icons** | **Expo Linear Gradient**, **Vector Icons (Ionicons, MaterialCommunityIcons)** | Premium Dark Emerald & Slate design system |
| **Backend Core** | **Python 3.10+**, **FastAPI (v0.110)**, **Uvicorn** | High-performance async REST API with auto-generated Swagger UI |
| **ORM & Database** | **SQLAlchemy 2.0**, **PyMySQL**, **MySQL 8.0+** (with SQLite auto-fallback) | Relational ACID-compliant transaction ledger |
| **AI / Machine Learning** | **Scikit-Learn (v1.4)**, **Pandas (v2.2)**, **NumPy** | Propensity classification, Uplift modeling, RFM clustering |
| **Security & Auth** | **JWT (python-jose)**, **Bcrypt (passlib)**, **Pydantic v2** | Stateless token auth, PIN hashing, strict payload validation |
| **Web Simulator** | **HTML5, Vanilla CSS3, Modern JavaScript (ES6+)** | Zero-dependency responsive campaign simulator dashboard |

---

## 4. 💻 Requirements & Prerequisites

### Software Requirements
* **Node.js:** v18.0.0 or higher (v20+ recommended)
* **npm:** v9.0.0 or higher
* **Python:** v3.10, v3.11, or v3.12
* **Database:** MySQL Server (e.g., via XAMPP or standalone MySQL 8.0+) OR built-in SQLite (zero-config fallback)
* **Git:** v2.30+
* **Mobile Testing:** Expo Go app (Android/iOS) or modern web browser (Chrome, Edge, Firefox)

### Hardware Requirements
* **RAM:** 8 GB minimum (16 GB recommended for running simulator, backend, and emulator concurrently)
* **Storage:** 2 GB free disk space
* **Network:** Active internet connection (or local Wi-Fi / hotspot for Expo mobile debugging)

---

## 5. 🚀 Installation and Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/arif42sh/GenCash.git
cd GenCash
```

### Step 2: Backend Setup
```bash
cd backend

# 1. Create and activate a Python virtual environment
python -m venv venv

# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# 2. Install backend dependencies
pip install -r requirements.txt

# 3. Create .env configuration file (copy from sample or see Section 6)
# If MySQL is running in XAMPP, ensure MySQL service is started.
```

### Step 3: Frontend (Mobile App) Setup
```bash
# Open a new terminal and navigate to the mobile folder
cd mobile

# Install dependencies
npm install
```

---

## 6. 🔐 Environment Variables

Create a `.env` file inside the `backend/` directory.

### Backend `.env` Specification

| Variable Name | Required | Default Value | Purpose / Description |
| :--- | :---: | :--- | :--- |
| `PROJECT_NAME` | No | `GenCash` | Name of the platform |
| `SECRET_KEY` | **Yes** | *None (Zero Fallback)* | **Mandatory 256-bit cryptographic secret** (>= 32 chars). Server terminates if omitted. |
| `ALGORITHM` | No | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `1440` | Token expiration time in minutes (24 hours) |
| `DB_HOST` | No | `127.0.0.1` | MySQL host address |
| `DB_PORT` | No | `3306` | MySQL port |
| `DB_USER` | No | `root` | MySQL username |
| `DB_PASSWORD` | No | `""` | MySQL password |
| `DB_NAME` | No | `gencash_db` | MySQL database name |
| `USE_SQLITE_FALLBACK` | No | `True` | Automatically falls back to SQLite if MySQL is unreachable |
| `RATE_LIMIT_AUTH_PER_MINUTE` | No | `5/minute` | SlowAPI rate limit on authentication endpoints |
| `DEFAULT_FEE_SEND_MONEY` | No | `5.00` | Flat transaction fee for P2P Send Money (BDT) |
| `DEFAULT_FEE_CASH_OUT_PERCENT`| No | `1.85` | Agent cash-out service fee percentage |

```env
# Copy from .env.example
cp .env.example backend/.env
# Edit backend/.env and insert your secure 256-bit SECRET_KEY
```

---

## 7. 🏃 Run and Build Commands

### Start the Backend Server
```bash
cd backend
python run.py
```
* **API Documentation (Swagger UI):** `http://127.0.0.1:8000/docs`
* **Alternative API Docs (ReDoc):** `http://127.0.0.1:8000/redoc`
* **Interactive Campaign Simulator:** `http://127.0.0.1:8000/simulator`

### Start the Mobile Application
```bash
cd mobile

# Start Expo interactive development server
npm run start

# Option A: Run in Web Browser
npm run web

# Option B: Run on Android Emulator or Physical Device
npm run android

# Option C: Run over Cloud Tunnel (for remote testing with physical device)
npm run tunnel
```

---

## 8. 🌐 Live Deployment & Access URLs

* **Public GitHub Repository:** [https://github.com/arif42sh/GenCash](https://github.com/arif42sh/GenCash)
* **Local Backend API & Swagger Docs:** `http://127.0.0.1:8000/docs`
* **Marketing Campaign & Uplift Simulator:** `http://127.0.0.1:8000/simulator`
* **Mobile Web Client (when running `npm run web`):** `http://localhost:8081`

---

## 9. 🧪 Testing Instructions

### Seeded Sandbox Personas (Local Development)
The database seeds realistic accounts with bcrypt-hashed credentials on first boot:

| Name | Role / Persona | Mobile Number | Credentials Status | Initial Balance |
| :--- | :--- | :--- | :--- | :--- |
| **Tanvir Ahmed** | Primary Customer | `01711111111` | Bcrypt-hashed (Standard Seed) | ৳ 12,500.00 |
| **Sadia Rahman** | P2P Recipient / Merchant | `01822222222` | Bcrypt-hashed (Standard Seed) | ৳ 8,200.00 |
| **Rafiqul Islam** | Student Persona | `01933333333` | Bcrypt-hashed (Standard Seed) | ৳ 4,500.00 |
| **Demo Cash Agent** | Cash-Out Agent Point | `01799999999` | Bcrypt-hashed (Standard Seed) | ৳ 50,000.00 |
| **Platform Admin** | Super Administrator | `admin@gencash.com` | RBAC Protected | N/A |

> **Security Note:** In production, all initial credentials are provisioned via secure out-of-band activation (SMS OTP / E-KYC). Plaintext default passwords have been removed from documentation.

### Verification Steps
1. **Authentication Test:**
   * Launch mobile app, log in using `01711111111` and PIN `123456`.
   * Verify wallet balance loads properly without hardcoded fallbacks.
2. **Core Transaction Tests:**
   * **Send Money:** Tap *Send Money*, enter `01822222222`, amount `500`, note `Family`, enter PIN `123456`. Confirm ৳5 fee is deducted and recipient balance updates.
   * **Mobile Recharge:** Tap *Mobile Recharge*, select operator *Grameenphone*, amount `399`, enter PIN. Verify successful completion.
   * **Merchant Payment:** Tap *Payment*, select *DESCO* or *Shwapno* from live directory, enter amount `1200`, enter PIN.
   * **Cash Out:** Tap *Cash Out*, enter agent number `01799999999`, amount `1000`, confirm 1.85% (৳18.50) fee.
3. **AI Cashflow & Expense Intelligence Tests:**
   * Tap bottom navigation **AI Hub** (✨ sparkles icon) or tap the header banner in *Transactions*.
   * Switch between **This Month**, **This Week**, and **Today** filters. Verify Money In vs. Money Out updates dynamically.
   * Tap the **Mobile Recharge** card to filter all recharge records and view the AI recharge analysis.
   * Test natural language prompts: Click *"এই মাসে রিচার্জ কত?"* or *"এই সপ্তাহে কত ঢুকলো?"* and verify instant explainable answers.
4. **AI Campaign Simulator Tests:**
   * Open `http://127.0.0.1:8000/simulator` in your web browser.
   * Adjust customer target segment sliders, choose campaign type, and click **Simulate Campaign**. Verify uplift predictions and estimated ROI calculation.

---

## 10. ⚙️ Other Configuration & Architecture Notes

### Database Migration & Auto-Seeding
GenCash features an automated bootstrapping mechanism. Upon running `python run.py`:
1. It verifies connectivity to MySQL. If MySQL is unavailable, it gracefully initializes a localized SQLite database (`gencash.db`).
2. Creates all tables (`users`, `wallets`, `transactions`, `merchants`, `campaigns`, `ai_insights`, `notifications`, `audit_logs`).
3. Seeds default demo users, wallets, merchants (DESCO, DPDC, Polli Bidyut, WASA, Titas, Carnival, Shwapno, Chillox, Star Tech), and active promotional campaigns.

### Continuous Development History
This repository maintains a continuous, step-by-step Git commit log documenting feature additions, bug fixes, PIN verification hardening, and AI PFM integrations as mandated by the AI Hackathon evaluation criteria.

---

### 👥 Team & Acknowledgments
* **Competition:** AI DEV FEST 2026 — AI Hackathon
* **Venue:** Daffodil International University (DIU)
* **Organized by:** DIU Computer and Programming Club (DIU-CPC)
