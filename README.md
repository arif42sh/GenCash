# GenCash — AI-Powered Intelligent Digital Financial Services (MFS) Platform

**AI Hackathon 2026 — DIU CPC × upay**  
*Architecture Paradigm: INPUT → INTELLIGENCE → ACTION*

---

## 🚀 Overview
**GenCash** is a next-generation, AI-driven Mobile Financial Services (MFS) platform prototype built for the *AI Hackathon 2026 (DIU CPC × upay)*. It simulates real-world MFS workflows (Send Money, Mobile Recharge, Cash Out, Merchant Payments, Add Money) while embedding a modular, explainable Machine Learning Intelligence layer.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│             CUSTOMER MOBILE APPLICATION                │
│             (React Native / Expo / Android)            │
└───────────────────────────┬────────────────────────────┘
                            │ REST API + JWT Bearer
                            ▼
┌────────────────────────────────────────────────────────┐
│             FASTAPI BACKEND CORE ENGINE                │
│    (Authentication, Wallets, Transactions, Security)   │
└──────────────┬────────────────────────────┬────────────┘
               │                            │
               ▼                            ▼
┌──────────────────────────────┐ ┌───────────────────────┐
│     MySQL DATABASE           │ │  AI INTELLIGENCE HUB  │
│  - users & wallets           │ │  - Spending Anomaly   │
│  - transactions & merchants  │ │  - Budget Forecast    │
│  - marketing & campaigns     │ │  - Next-Best Offer    │
│  - ai_insights & logs        │ │  - Feedback Loop Hook │
└──────────────────────────────┘ └───────────────────────┘
```

---

## 🗄️ Database Entities (MySQL Schema)

- **`users`**: Customer credentials, mobile number (UNIQUE), status, created timestamps.
- **`wallets`**: Linked 1:1 with user, initial simulated balance (৳5,000), currency (`BDT`), status.
- **`transactions`**: High-throughput transaction records with unique `TXN-SM-...`, `TXN-RC-...` codes, sender/receiver foreign keys, amounts, fees, and timestamps.
- **`merchants` & `merchant_categories`**: Merchant directory (Shwapno, Chillox, Star Tech, etc.).
- **`offers` & `campaigns`**: Marketing and promotional cashbacks/discounts.
- **`campaign_responses`**: Behavioral tracking for AI conversion models.
- **`ai_insights`**: Decoupled explainable AI predictions (prediction, confidence rating, explanation reason).
- **`notifications`**: Transaction alerts & system notices.
- **`admin_users` & `audit_logs`**: Administrative governance and oversight.

---

## 🔑 Pre-Configured Demo Accounts

| Name | Role / Persona | Mobile Number | PIN / Password | Initial Balance |
| :--- | :--- | :--- | :--- | :--- |
| **Tanvir Ahmed** | Primary Customer | `01711111111` | `123456` | ৳ 12,500.00 |
| **Sadia Rahman** | P2P Recipient / Merchant | `01822222222` | `123456` | ৳ 8,200.00 |
| **Rafiqul Islam** | Student Persona | `01933333333` | `123456` | ৳ 4,500.00 |
| **Demo Cash Agent** | Cash-Out Agent Point | `01799999999` | `123456` | ৳ 50,000.00 |
| **Platform Admin** | Super Admin | `admin@gencash.com` | `admin123456` | N/A |

---

## 🛠️ Quick Start Guide

### 1. Backend Service (FastAPI + MySQL)
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start backend server (Auto-creates MySQL tables and seeds initial data)
python run.py
```
- **API Documentation (Swagger UI)**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`

### 2. Customer Mobile App (React Native / Expo)
```bash
cd mobile

# Start Expo development server
npm run start

# Or test in Web Browser
npm run web

# Or run on Android Emulator / Physical Device
npm run android
```

---

## 📡 Core API Specification

| Module | Method & Endpoint | Description |
| :--- | :--- | :--- |
| **Auth** | `POST /api/auth/register` | Register new user + auto-credit ৳5,000 demo wallet |
| **Auth** | `POST /api/auth/login` | Authenticate with mobile & PIN, returns JWT token |
| **User** | `GET /api/users/me` | Fetch authenticated user profile |
| **Wallet** | `GET /api/users/me/wallet` | Fetch balance, currency, and account status |
| **Transactions** | `POST /api/transactions/send` | Atomic P2P Send Money with fee validation |
| **Transactions** | `POST /api/transactions/recharge` | Mobile Recharge (GP, Robi, BL, Airtel, Teletalk) |
| **Transactions** | `POST /api/transactions/cashout` | Agent withdrawal with 1.85% fee computation |
| **Transactions** | `POST /api/transactions/payment` | Merchant QR and till payments |
| **Transactions** | `POST /api/transactions/add-money` | Bank transfer / Card deposit simulation |
| **Transactions** | `GET /api/transactions` | Full user transaction history with type filtering |
| **AI Intelligence**| `GET /api/ai/recommendations` | Explainable AI insights, spending forecasts |
| **AI Intelligence**| `POST /api/ai/feedback` | User feedback loop on recommendation |
| **Admin** | `GET /api/admin/dashboard` | Administrative overview of platform metrics |

---

## 👥 Hackathon Team Notes
- Phase 1 delivers complete core platform capabilities, transaction mechanics, and modular scaffolding.
- Phase 2 will plug machine learning models directly into `backend/app/services/ai_service.py` to train dynamic recommendation algorithms on user and transaction datasets.
>>>>>>> d598cd1 (Initial commit: GenCash AI-Powered MFS platform with FastAPI backend and React Native mobile app)
