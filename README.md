# StadiumIQ — Smart Stadium & Tournament Operations

StadiumIQ is a highly secure, accessible, real-time Smart Stadium Operations and Analytics platform built for the **FIFA World Cup 2026™**. It supports tournament coordinators, stadium managers, safety officers, and concessions teams in running operations smoothly across all 16 host venues in the United States, Canada, and Mexico.

---

## 📋 Problem Statement Alignment

The FIFA World Cup 2026 presents an unprecedented operational challenge: 48 teams, 104 matches, and millions of spectators spread across three nations. StadiumIQ solves this smart stadium brief by addressing three core operational pillars:

1. **Crowd Safety & Dynamic Density Tracking**:
   Instead of static reports, StadiumIQ simulates real-time crowd density across stadium zones A through F. By tracking when zones exceed critical thresholds (60% and 80%), operations staff receive instant color-coded visual cues (Green/Yellow/Red) and automatic alerts to prevent overcrowding.
2. **Predictive & Intelligent Staff Allocation**:
   A custom matching algorithm calculates real-time staff gaps. As crowd density increases, the system dynamically changes recommended staff ratios (e.g., from 1:80 up to 1:40 in critical states), comparing it to assigned staff to identify safety gaps and dispatch personnel before incidents escalate.
3. **Natural Language Assistant for Rapid Incident & Telemetry Lookup**:
   Using the Google Gemini 1.5 Flash API, tournament directors can query complex operational states in natural language (in 6 languages). Staff can ask "What is the status of Zone A?" or "Are there any high-severity incidents?" and receive context-rich answers synthesized from live database logs.

---

## 🏗️ System Architecture

The following ASCII diagram illustrates the request lifecycle, security boundary, and context flow between the frontend client, the Express server, and the Google Gemini generative model:

```text
+---------------------------------------------------------------------------------+
|                                 CLIENT PORTAL                                   |
|  - Glassmorphic UI Dashboard (HTML5 / Vanilla CSS / JavaScript)                 |
|  - Real-Time Crowd Gauges, Staffing Gaps, & Incident Management Form            |
|  - Accessible interface (WCAG 2.1 AA Compliant, Screen Reader & Tab Navigation) |
+---------------------------------------------------------------------------------+
                                      │  ▲
                     HTTP (JSON) /    │  │ CORS-Whitelisted origin &
                     REST API Calls   │  │ Helmet-CSP Sanitized Responses
                                      ▼  │
+-------------------------------------+-------------------------------------------+
|                                EXPRESS SERVER                                   |
|                                                                                 |
|   [1] Security Gateways (Rate Limiters, CORS whitelist, Size limits)            |
|   [2] Input Sanitization (XSS blocklists, ASCII-scoped HTML entity encoder)     |
|   [3] Request Logger & JSON Content-Type Enforcement                            |
|                                                                                 |
|         │                                        ▲                              |
|         ▼ Route Controllers                      │ JSON                         |
|   ┌───────────────┐ ┌───────────────┐ ┌──────────────┐ ┌────────────────────┐   |
|   │ /api/stadiums │ │/api/analytics │ │  /api/chat   │ │    /api/health     │   |
|   └───────┬───────┘ └───────┬───────┘ └──────┬───────┘ └────────────────────┘   |
|           │                 │                │                                  |
|           ▼                 ▼                ▼ context injection                |
|   ┌─────────────────────────────────┐ ┌─────────────────────────────────────┐   |
|   │         LOCAL DATA STORE        │ │           GEMINI SERVICE            │   |
|   │  - data/stadiums.js             │ │  - services/geminiService.js        │   |
|   │  - data/matches.js              │ │  - Formulates tournament context  │   |
|   │  - data/vendors.js              │ │  - Feeds context & prompt to API  │   |
|   └─────────────────────────────────┘ └──────────────────┬──────────────────┘   |
+----------------------------------------------------------│----------------------+
                                                           │  ▲
                                            Secure API Key │  │ Generated
                                             JSON Payload  │  │ Reply
                                                           ▼  │
                                    +-------------------------+-------------------+
                                    |          GOOGLE GEMINI 1.5 FLASH API        |
                                    |  Generates concise operational responses    |
                                    |  in English, Spanish, French, Portuguese,    |
                                    |  Arabic (RTL), and German.                  |
                                    +---------------------------------------------+
```

---

## 🔒 Security Measures Implemented

StadiumIQ follows a comprehensive defense-in-depth model:

1. **Helmet Security Headers**: Strict Content Security Policy (CSP) blocking external script execution (no `unsafe-eval`), `X-Frame-Options` (DENY) against click-jacking, `X-Content-Type-Options: nosniff`, and removing `X-Powered-By` server fingerprints.
2. **CORS Origin Whitelisting**: Restricts API access exclusively to trusted origins (`http://localhost:3000`, `http://localhost:5000`, and the production GitHub Pages domain). All other origins are rejected.
3. **Strict Payload Limits**: Restricts incoming JSON request bodies to `10kb` to protect the server from large payload Denial of Service (DoS) attacks.
4. **HTTP Parameter Pollution (HPP)**: Sanitizes query strings, stripping out duplicate parameters to prevent parameter pollution exploits (whitelisting only `status` and `country`).
5. **NoSQL Injection Prevention**: Using `express-mongo-sanitize` to strip characters like `$` or `.` from keys in requests to prevent NoSQL syntax injection.
6. **Double-Layer Input Sanitization**:
   - **Rejection Blocklist**: Preemptively rejects requests containing suspicious strings (e.g. `<script>`, `onclick=`, `UNION SELECT`, `DROP TABLE`).
   - **XSS Escaping**: Automatically sanitizes HTML characters (`<`, `>`, `&`, `"`, `'`) for all string inputs using an ASCII-scoped filter that keeps multi-language Unicode (Arabic, Spanish, etc.) completely intact.
7. **Rate Limiting**:
   - `/api/chat` (AI chatbot): Strict limit of **15 requests per minute** per IP.
   - All other API endpoints: General limit of **100 requests per 15 minutes** per IP.
8. **Secure Production Error Handling**: Internal server errors are logged securely with full stacks. Clients receive clean generic status codes and safe messages without stack traces.

---

## 💻 How to Run Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Step-by-Step Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Yadavallitejas/stadiumiq.git
   cd stadiumiq
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_key
   NODE_ENV=development
   PORT=3000
   ALLOWED_ORIGIN=http://localhost:3000
   ```
   *Note: If `GEMINI_API_KEY` is not provided or is set to `MOCK_API_KEY`, the application automatically runs in Mock Mode, returning pre-programmed intelligence responses in 6 languages for easy testing.*

4. **Start the Server**:
   For development (auto-reloads on file changes):
   ```bash
   npm run dev
   ```
   For production:
   ```bash
   npm start
   ```
   The server will start on [http://localhost:3000](http://localhost:3000).

---

## 🚀 How to Deploy to Render.com

StadiumIQ is fully configured for deployment on the Render.com free tier using the included `render.yaml` blueprint.

### Deployment Steps

1. **Push your code** to GitHub.
2. **Log into Render** and click **New > Blueprint**.
3. **Connect your GitHub Repository**. Render will automatically detect the `render.yaml` configuration.
4. **Configure Environment Variables**:
   In the Render dashboard under service settings, input the following environment variables:
   - `GEMINI_API_KEY`: Your Google Gemini API key.
   - `NODE_ENV`: `production`
   - `ALLOWED_ORIGIN`: Your GitHub Pages hosting domain (e.g. `https://yourusername.github.io`).
5. **Deploy**: Render will build the project using `npm install` and run it via `node server/server.js`. The blueprint has auto-deploy enabled so any push to `main` will trigger a clean release.

---

## 📖 API Documentation

### 1. Health Probe
- **Endpoint**: `GET /api/health`
- **Description**: Returns server liveness, version, and ISO timestamp.
- **Example Response**:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-07-11T12:20:00.000Z",
    "version": "1.0.0"
  }
  ```

### 2. Get All Stadiums
- **Endpoint**: `GET /api/stadiums`
- **Query Parameters**:
  - `country` (optional): Filter by `USA`, `Canada`, or `Mexico` (case-insensitive).
- **Example Response**:
  ```json
  {
    "status": "success",
    "results": 1,
    "timestamp": "2026-07-11T12:20:00.000Z",
    "data": [
      {
        "id": "metlife-stadium",
        "name": "MetLife Stadium",
        "city": "New York/New Jersey",
        "country": "USA",
        "capacity": 82500,
        "coordinates": { "lat": 40.8135, "lng": -74.0745 },
        "features": ["Natural Grass", "Retractable seating features"]
      }
    ]
  }
  ```

### 3. Get Stadium by ID
- **Endpoint**: `GET /api/stadiums/:id`
- **Example Request**: `GET /api/stadiums/metlife-stadium`
- **Example Response**:
  ```json
  {
    "status": "success",
    "data": {
      "id": "metlife-stadium",
      "name": "MetLife Stadium",
      "city": "New York/New Jersey",
      "country": "USA",
      "capacity": 82500,
      "coordinates": { "lat": 40.8135, "lng": -74.0745 },
      "features": ["Natural Grass"]
    }
  }
  ```

### 4. Find Nearest Stadium
- **Endpoint**: `GET /api/stadiums/nearest`
- **Query Parameters**:
  - `lat` (required): Latitude coordinate (-90 to 90).
  - `lng` (required): Longitude coordinate (-180 to 180).
- **Example Request**: `GET /api/stadiums/nearest?lat=40.8&lng=-74.0`
- **Example Response**:
  ```json
  {
    "status": "success",
    "data": {
      "stadium": {
        "id": "metlife-stadium",
        "name": "MetLife Stadium",
        "city": "New York/New Jersey"
      },
      "distanceKm": 1.54
    }
  }
  ```

### 5. Gemini Chat Assistant
- **Endpoint**: `POST /api/chat`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "message": "Which stadium has the largest capacity?",
    "lang": "en"
  }
  ```
- **Example Response**:
  ```json
  {
    "status": "success",
    "timestamp": "2026-07-11T12:20:01.000Z",
    "data": {
      "response": "The largest stadium for the FIFA World Cup 2026 is Estadio Azteca in Mexico City, with a seating capacity of 87,523."
    }
  }
  ```

### 6. Control Room KPI Summary
- **Endpoint**: `GET /api/analytics`
- **Description**: Compiles stadium capacity totals, fixture timelines, active queue telemetry, and system warnings.
- **Example Response**:
  ```json
  {
    "status": "success",
    "timestamp": "2026-07-11T12:20:00.000Z",
    "data": {
      "stadiums": {
        "totalVenues": 16,
        "totalCapacity": 1078911,
        "averageCapacity": 67432,
        "byCountry": { "USA": 11, "Mexico": 3, "Canada": 2 }
      },
      "matches": { "totalMatches": 104, "live": 2, "completed": 10, "scheduled": 92 },
      "vendors": {
        "averageWaitTimeMinutes": 12.5,
        "busiestVendor": { "name": "Texas Size BBQ", "queueTimeMinutes": 25 }
      },
      "alerts": [
        {
          "id": "alert-bbq",
          "category": "concessions",
          "level": "warning",
          "message": "Texas Size BBQ has high wait time (25m)."
        }
      ]
    }
  }
  ```

### 7. Get Live Crowd Densities
- **Endpoint**: `GET /api/analytics/crowd`
- **Description**: Returns occupancy ratios and safety statuses (normal/elevated/critical) for zones A–F.
- **Example Response**:
  ```json
  {
    "status": "success",
    "timestamp": "2026-07-11T12:20:00.000Z",
    "data": [
      {
        "zone": "A",
        "label": "Zone A — Lower Bowl, Pitch Side",
        "density": 45,
        "status": "normal"
      },
      {
        "zone": "C",
        "label": "Zone C — Mid-Tier, Main Stand",
        "density": 85,
        "status": "critical"
      }
    ]
  }
  ```

### 8. Get Staff Deployment Recommendations
- **Endpoint**: `GET /api/analytics/staff`
- **Description**: Compiles occupancy metrics, assigned staff, recommended staff ratios, and gaps.
- **Example Response**:
  ```json
  {
    "status": "success",
    "timestamp": "2026-07-11T12:20:00.000Z",
    "data": [
      {
        "zone": "C",
        "occupancy": 15000,
        "assigned": 300,
        "recommended": 375,
        "gap": 75,
        "status": "critical"
      }
    ]
  }
  ```

### 9. Get Active Incident Log
- **Endpoint**: `GET /api/analytics/incidents`
- **Example Response**:
  ```json
  {
    "status": "success",
    "results": 1,
    "data": [
      {
        "id": "inc-1092837",
        "zone": "C",
        "type": "Medical",
        "severity": "medium",
        "description": "Fainting spell in Row 12.",
        "reportedAt": "2026-07-11T12:20:00.000Z",
        "status": "active"
      }
    ]
  }
  ```

### 10. Report New Incident
- **Endpoint**: `POST /api/analytics/incident`
- **Request Body**:
  ```json
  {
    "zone": "A",
    "type": "Security",
    "severity": "high",
    "description": "Unauthorized spectator attempting to enter pitch."
  }
  ```
- **Example Response**:
  ```json
  {
    "status": "success",
    "data": {
      "id": "inc-98273645",
      "zone": "A",
      "type": "Security",
      "severity": "high",
      "description": "Unauthorized spectator attempting to enter pitch.",
      "reportedAt": "2026-07-11T12:21:05.100Z",
      "status": "active"
    }
  }
  ```

---

## 🧪 Testing

The codebase has a comprehensive suite containing **143 tests** validating routing contracts, security filters, rate limits, geolocation math, and crowd analytics calculations.

### Run tests in verbose mode
```bash
npm test
```

---

## ♿ Accessibility Compliance (WCAG 2.1 AA)

StadiumIQ is built to ensure a fully accessible experience for all users:

- **Landmark Landmarks**: Employs structural elements like `<main role="main">`, `<nav role="navigation">`, `<header role="banner">`, and `<footer role="contentinfo">`.
- **Keyboard Navigation**: Clean tab ordering on all elements, custom focus rings for visible navigation, and skip-to-content links at the top of the viewport.
- **Screen Reader Announcements**: Chat displays and alerts use `aria-live="polite"` and `role="status"` to read updates as they happen.
- **Label Associations**: Every input (stadium geolocation coordinates, incident reporting form, and language pickers) has explicit `<label>` attachments.
- **Accessible Color Contrasts**: Text colors have a minimum contrast ratio of 4.5:1 against their backgrounds in both light and dark modes.
- **Dynamic Orientation Support**: Swapping to Arabic automatically sets `dir="rtl"` and `lang="ar"` on the document tree.

---

## 📊 Data Sources

- **Stadiums Data**: Gathered from official host city profiles for the 2026 FIFA World Cup, utilizing coordinates, capacity numbers, and turf characteristics.
- **Matches & Fixtures**: Based on the official 104-match match schedule distributed by FIFA for the 2026 tournament.
- **Vendor Queuing Telemetry**: Simulated based on stadium food service crowd wait time profiles.
