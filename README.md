# RESQ — Comprehensive Disaster Management & Emergency Response Platform

> A resilient, closed-loop disaster management system with dedicated interfaces for **Citizens**, **Emergency Authorities (EOC)**, and **Multi-Agency Administrators**.

---

## 📌 Interfaces Overview

### 1. Citizen Interface (Personal & Family Safety Hub)
- **Distress SOS Beacon**: 1-click distress trigger with GPS telemetry, audible dual-tone siren beacon, and full-screen rescue strobe.
- **Family Safety Circle**: Live location sync, battery level indicators, and 1-tap "I'm Safe" push/SMS broadcasting.
- **Explainable AI Risk Breakdown**: Multi-factor vulnerability engine answering *"Why am I at risk?"* with rainfall runoff, elevation, and landslide slope indicators.
- **Safe Places & Navigation**: Interactive lower-risk routing to nearest open shelters, hospitals, and blood banks.
- **Climate-Health Advisories**: Actionable prevention guides for waterborne pathogens and storm-induced risks.
- **3-Phase Actionable Guidance**: Structured safety protocols for Pre-Disaster, During-Disaster, and Post-Disaster phases.
- **Citizen Scout Field Reporting**: Geo-tagged hazard submission with photo and category tagging.

### 2. Authority Interface (EOC Tactical Command & Dispatch)
- **Closed-Loop Lifecycle Console**: 6-phase disaster progression (`PREDICT` → `EXPLAIN` → `ALERT` → `REPORT` → `RESPOND` → `RECOVER`) with phase-specific SOP checklists.
- **EOC Tactical Radar Map**: Live tactical grid displaying Zone 4 inundation perimeters, active rescue unit vectors, roadblock barricades, and SOS distress points.
- **Active Field Fleet Tracker**: Real-time telemetry of deployed crews (NDRF Swiftwater Boats, EMS Mobile ICUs, Fire Pumpers, SDRF Recon Helo) with VHF radio channels (`156.8 MHz Ch 16`), crew headcounts, and equipment loadouts.
- **Priority SOS Triage Queue**: Real-time distress queue with occupant counts and 1-click dispatch for NDRF boats and trauma ambulances.
- **IoT Sensor Telemetry**: Ultrasonic river crest monitors, hillside inclinometers, and soil saturation gauges with real-time trend tracking.
- **Multilingual EAS Transmitter**: Emergency Civil Alert broadcaster with sector selection and automated translation across English, Hindi, and Marathi.
- **AI Field Report Verification**: Automated confidence validation queue to approve citizen hazard reports to the official map.

### 3. Admin & Multi-Organization Interface
- **Data-Assisted Damage Assessment & Relief Optimizer**: Interactive inundation depth simulator estimating displaced populations, required shelter beds, and aerial UAV survey flight corridors.
- **Multi-Organization Resource Matrix**: Cross-agency matching between Authorities, Hospitals, NGOs (Red Cross, Khalsa Aid), and Food/Water Logistics with 1-click redeployment.
- **Master Facility & Blood Bank Registry**: Live inline editing for bed capacities, backup generators, clean water, and interactive Blood & Plasma Inventory Controls (O+, O-, A+, B+, AB+ units) with an urgent donor call trigger.
- **Critical Infrastructure Interlocks**: Supervisory controls for harbor stormwater pumps, tidal flood gates, and electrical grid isolation.
- **Agency RBAC & Radio Matrix**: Clearance tiers (Level 1/2), mTLS encryption tokens, and VHF/HF frequency assignments.
- **Platform Resiliency Telemetry**: Offline sync queue monitoring and cellular SMS fallback gateway health.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion
- **Backend & Auth**: Supabase (`@supabase/supabase-js` Auth, PostgreSQL, Row-Level Security, Realtime, RPCs)
- **Architecture**: Modular IT developer-grade layout, light theme, high-contrast typography
- **Multilingual Support**: English (`en`), Hindi (`hi`), Marathi (`mr`)
- **Emergency Hardware Emulation**: Web Audio API oscillator siren, Fullscreen Strobe overlay

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or bun
- A [Supabase](https://supabase.com/) project (optional — runs in Local Demo Mode if `.env` is not configured)

### Installation

```bash
# Clone the repository
git clone https://github.com/avdhootb2007/RESQ.git

# Navigate to project directory
cd RESQ

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Start development server
npm run dev
```

### Supabase Database Setup
1. Open your **Supabase Dashboard → SQL Editor → New query**.
2. Paste and run the contents of `supabase/schema.sql` to create tables (`profiles`, `facilities`, `incidents`, `sos_beacons`, `alerts`, `resources`), triggers, RLS policies, and the `set_user_role` RPC.
3. After signing up your first user, promote them to `admin` by running in the SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'your-email@example.com';
   ```

Open `http://localhost:3000` to view the application.

---

## 📄 License
Apache-2.0
