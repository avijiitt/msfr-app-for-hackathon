# 🚌 Musafir (मुसाफ़िर / ମୁସାଫିର)
### Next-Gen Smart Multi-Modal Urban Mobility & Transit Ecosystem

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet_Maps-Realtime-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

---

## 🌟 Overview

**Musafir** is a unified, intelligent, multi-modal urban transit application engineered for smart cities. Built primarily around the comprehensive **CRUT (Capital Region Urban Transport)** network covering Bhubaneswar, Cuttack, and Puri, Musafir seamlessly connects **Mo Bus**, **Mo E-Ride / Auto-Rickshaws**, **Suburban Local Trains**, **Shared Cabs**, and **Bike Taxis** into one cohesive passenger experience.

---

## ✨ Core Features & Modules

### 1. 🗺️ Real-Time Map & GPS Fleet Tracking
- **Interactive GPS Fleet Simulator:** Live animated buses and e-rickshaws with dynamic real-time speeds, occupancy levels, and next-stop ETAs.
- **Dedicated Live Radar HUD:** 1-tap **Live Fleet Tracking [ON / OFF]** switch that pauses or resumes live simulation without refreshing the app.
- **Auto-Zoom Lock:** Smart viewport control ensuring manual zoom levels (in/out) remain 100% preserved during vehicle movement ticks.

### 2. 🧮 Smart Fare Calculator & Dynamic Distance Engine
- **Auto-Calculated Road Distance:** Select any of the 30+ verified urban localities (Master Canteen, KIIT, Infocity, Baramunda ISBT, Airport, etc.) or type custom places — road distance is calculated automatically using Great-Circle geospatial geometry.
- **Multi-Modal Fare Comparison:** Compares official ticket prices across Mo Bus AC Electric, Mo Bus Ordinary, Auto/E-Rickshaw, Cabs, Bike Taxi, and Local Trains with student/senior concession rates.
- **Manual Distance Override:** Fine-tune distance using an interactive slider.

### 3. 🛡️ Women & Passenger Safety Hub
- **Instant Emergency SOS:** 1-tap SOS trigger broadcasting GPS coordinates to police (112), Women Helpline (1091), and emergency contacts with audible siren alarm.
- **Live Family Location Sharing:** Generates secure real-time tracking links with route progress and vehicle ID.
- **Digital Medical ID:** Critical health data (blood group, allergies, emergency contacts) accessible on lock screen.

### 4. 🎟️ TransitPay, Passes & Digital Trip History
- **Digital E-Tickets & QR Receipts:** Verified ticket records with unique booking references (`#MSFR-...`), route details, duration, fare paid, and carbon offset (`kg CO₂ saved`).
- **Student & Senior Transit Passes:** Integrated pass application and concession verification.
- **1-Tap Re-Book:** Instant re-routing from past journey activity.

### 5. 📦 Smart Transit-Assisted Parcel Delivery
- **Crowdsourced Intra-City Logistics:** Send lightweight parcels via existing transit corridors with automated locker/station hub selection and live tracking.

### 6. 🤖 Musafir AI (Multilingual Voice & Chat Assistant)
- **Natural Language Transit Planner:** Understands complex transit queries in **English, Hindi, Odia (ଓଡ଼ିଆ), Bengali, Telugu, Tamil, and Marathi**.
- **Action Execution:** Automatically triggers route searches, fare calculations, wallet top-ups, and SOS actions directly from natural conversations.

### 7. 🏪 500m Hyperlocal Amenities Discovery
- **Corridor-Aware Verified Stores:** Dynamically discovers 24x7 pharmacies, grocery stores, food hubs, and clinics strictly within 500 meters of the chosen origin or destination stop.

---

## 🛠️ Architecture & Tech Stack

```
musafir/
├── src/
│   ├── components/
│   │   ├── ai/            # Multilingual AI Assistant (Musafir AI)
│   │   ├── amenities/     # 500m Verified Hyperlocal Stores Drawer
│   │   ├── auth/          # Supabase Email OTP & Profile Login Modal
│   │   ├── fare/          # Real-time Multi-modal Fare Calculator Modal
│   │   ├── journey/       # Multi-Stop Journey & Transit Details Panel
│   │   ├── layout/        # Sidebar, Header, Mobile Bottom Nav & Drawers
│   │   ├── map/           # Leaflet GPS Map, Live Radar HUD & Vehicle Markers
│   │   ├── parcel/        # Smart Intra-City Parcel Booking & Tracking
│   │   ├── planner/       # Best Routes Carousel (6 Smart Optimization Modes)
│   │   ├── safety/        # SOS Emergency Hub, Family Share & Medical ID
│   │   ├── student/       # Concession Pass Management Hub
│   │   ├── trips/         # Verified Trip History, Receipts & Re-Booking Modal
│   │   └── wallet/        # Musafir TransitPay Wallet & Bonus Crediting
│   ├── data/
│   │   ├── amenities.ts   # Hyperlocal 500m Store Generators
│   │   └── cities/        # Bhubaneswar 82+ Mo Bus Routes, Stops & Localities
│   ├── services/
│   │   ├── fareMatrixService.ts   # Real-world Fare & Distance Calculation
│   │   ├── olaRoutingService.ts   # Routing, Waypoints & Directions Engine
│   │   ├── supabaseClient.ts      # Supabase Auth, Profiles & Data Persistence
│   │   ├── transitSimulator.ts    # Real-time Multi-Vehicle GPS Simulator
│   │   └── tripService.ts         # User Journey Records & Cloud Sync
│   └── types/             # Strict TypeScript Models (Transit, Route, Safety, i18n)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** or **pnpm**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/avijiitt/msfr-app-for-hackathon.git
   cd msfr-app-for-hackathon
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional):**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 👥 Hackathon Team & Contribution

Developed with ❤️ for urban mobility, carbon reduction, and passenger safety.
- **Live Demo:** [Vercel Deployment](https://msfr-app-for-hackathon.vercel.app/)
- **Repository:** [GitHub: avijiitt/msfr-app-for-hackathon](https://github.com/avijiitt/msfr-app-for-hackathon)

