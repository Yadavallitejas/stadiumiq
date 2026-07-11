# StadiumIQ - Smart Stadium Operations Platform

StadiumIQ is a secure, high-fidelity, and accessible Operations Control dashboard and AI Assistant built for the **FIFA World Cup 2026™**. It supports tournament management across all 16 host venues in the USA, Canada, and Mexico.

## Features

- **Venue Operations Map/List**: Filter and inspect details, capacities, timezones, and coordinates for all 16 stadiums.
- **Geolocation Matcher**: Dynamically calculates and returns the closest stadium based on input coordinates using the Haversine formula.
- **Match Fixtures Timeline**: Monitor completed, live, and upcoming fixtures across all stages (Group Stage up to the Final).
- **Operations Control Room**: Real-time aggregations calculating total seating capacity, active matches, average concession queue times, and warning thresholds.
- **Gemini 1.5 Flash AI Assistant**: Context-aware operations chatbot that answers queries about stadiums, schedules, or queuing queues.
- **6-Language Localisation**: Responsive translation including Right-to-Left (RTL) Arabic layout rendering:
  - English (EN)
  - Spanish (ES)
  - French (FR)
  - Portuguese (PT)
  - Arabic (AR)
  - German (DE)
- **Accessibility Compliance**: Built with WCAG AA accessibility, keyboard tabbable selectors, standard header hierarchy, and screen-reader ARIA landmarks.
- **Security Protections**: Rate limiters (strict 15 req/min on chat), input sanitisation (HTML escaping), and secure error handling.

---

## Folder Structure

```text
stadiumiq/
├── server/
│   ├── app.js                 # Express server configuration
│   ├── server.js              # HTTP server listener entry point
│   ├── config/index.js        # Environment config manager
│   ├── routes/
│   │   ├── chat.js            # Gemini assistant chat router
│   │   ├── stadiums.js        # Stadiums and geolocation router
│   │   ├── matches.js         # Fixtures query router
│   │   └── analytics.js       # Control room aggregations router
│   ├── middleware/
│   │   ├── rateLimiter.js     # IP rate limit configurations
│   │   ├── validateInput.js   # Request validations using express-validator
│   │   └── errorHandler.js    # Centralised global error boundary handler
│   ├── services/
│   │   └── geminiService.js   # Gemini 1.5 Flash integration service
│   └── data/
│       ├── stadiums.js        # 16 official venues data
│       ├── matches.js         # Group stage & knockout fixtures data
│       └── vendors.js         # concession wait time telemetry data
├── client/
│   ├── index.html             # WCAG AA accessible dashboard template
│   ├── styles.css             # Glassmorphic World Cup themes (Dark & Light)
│   └── app.js                 # Localisation, state, and UI binding engine
├── tests/
│   ├── chat.test.js           # Jest/supertest chat suite
│   ├── stadiums.test.js       # Jest/supertest stadiums suite
│   └── analytics.test.js      # Jest/supertest analytics suite
├── .env.example               # Environment variables template
├── .gitignore                 # Files excluded from git
├── package.json               # Node script and dependency manager
├── render.yaml                # Render.com deployment manifest
└── README.md                  # System documentation
```

---

## Installation & Setup

1. **Clone the repository and navigate into it**:
   ```bash
   cd stadiumiq
   ```

2. **Install all dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and insert your Google Gemini API Key:
   ```env
   PORT=5000
   NODE_ENV=development
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```
   *Note: If no API key is specified, the server runs in fallback Mock Mode so you can still use the chat features locally.*

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The platform will be available at [http://localhost:5000](http://localhost:5000).

5. **Run in Production Mode**:
   ```bash
   npm start
   ```

---

## Running Automated Tests

StadiumIQ features a testing suite containing **25+ tests** spanning stadiums filters, analytics calculations, input sanitisation, and chat languages.

Run the test suite using:
```bash
npm test
```

---

## Deployment to Render.com

This repository includes a `render.yaml` specification for one-click deployment.
1. Connect your repository to Render.
2. Render will automatically detect `render.yaml` and provision a Web Service.
3. Configure the `GEMINI_API_KEY` environment variable in the Render Dashboard settings for your service.
