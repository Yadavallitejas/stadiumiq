/**
 * @fileoverview Matches data for FIFA World Cup 2026.
 * Contains fixture data for Group Stage (Groups A-L) and Knockout Stages (Round of 32, Round of 16, Quarter-finals, Semi-finals, Third Place, Final).
 */

/**
 * @typedef {Object} Score
 * @property {number} [home] - Goals scored by the home team.
 * @property {number} [away] - Goals scored by the away team.
 */

/**
 * @typedef {Object} Match
 * @property {string} id - Unique identifier for the match (e.g., M1, M2).
 * @property {string} stage - Tournament stage (Group Stage, Round of 32, etc.).
 * @property {string} [group] - Group name if applicable (Group A - Group L).
 * @property {string} date - Date of the match (YYYY-MM-DD).
 * @property {string} time - Kick-off time in UTC (HH:MM).
 * @property {string} stadiumId - ID of the stadium (linking to stadiums.js).
 * @property {string} homeTeam - Home team country name (or placeholder for knockouts).
 * @property {string} awayTeam - Away team country name (or placeholder for knockouts).
 * @property {string} status - Match status ('scheduled', 'live', 'completed').
 * @property {Score} [score] - Final or current score.
 * @property {number} [attendance] - Attendance figure.
 */

/**
 * List of FIFA World Cup 2026 fixtures.
 * @type {Match[]}
 */
const matches = [
  // --- GROUP STAGE ---
  // Group A (Mexico, USA, Canada are seeded)
  {
    id: "match-01",
    stage: "Group Stage",
    group: "Group A",
    date: "2026-06-11",
    time: "17:00",
    stadiumId: "estadio-azteca",
    homeTeam: "Mexico",
    awayTeam: "New Zealand",
    status: "completed",
    score: { home: 3, away: 0 },
    attendance: 87523
  },
  {
    id: "match-02",
    stage: "Group Stage",
    group: "Group A",
    date: "2026-06-12",
    time: "15:00",
    stadiumId: "bmo-field",
    homeTeam: "Canada",
    awayTeam: "Sweden",
    status: "completed",
    score: { home: 1, away: 1 },
    attendance: 44850
  },
  // Group B
  {
    id: "match-03",
    stage: "Group Stage",
    group: "Group B",
    date: "2026-06-12",
    time: "19:00",
    stadiumId: "sofi-stadium",
    homeTeam: "USA",
    awayTeam: "Australia",
    status: "completed",
    score: { home: 2, away: 1 },
    attendance: 70150
  },
  {
    id: "match-04",
    stage: "Group Stage",
    group: "Group B",
    date: "2026-06-13",
    time: "14:00",
    stadiumId: "lumen-field",
    homeTeam: "Japan",
    awayTeam: "Morocco",
    status: "completed",
    score: { home: 0, away: 2 },
    attendance: 65400
  },
  // Group C
  {
    id: "match-05",
    stage: "Group Stage",
    group: "Group C",
    date: "2026-06-13",
    time: "18:00",
    stadiumId: "estadio-akron",
    homeTeam: "Argentina",
    awayTeam: "Cameroon",
    status: "completed",
    score: { home: 3, away: 1 },
    attendance: 46200
  },
  {
    id: "match-06",
    stage: "Group Stage",
    group: "Group C",
    date: "2026-06-14",
    time: "15:00",
    stadiumId: "hard-rock-stadium",
    homeTeam: "Poland",
    awayTeam: "Saudi Arabia",
    status: "completed",
    score: { home: 1, away: 2 },
    attendance: 61300
  },
  // Group D
  {
    id: "match-07",
    stage: "Group Stage",
    group: "Group D",
    date: "2026-06-14",
    time: "20:00",
    stadiumId: "att-stadium",
    homeTeam: "France",
    awayTeam: "Costa Rica",
    status: "completed",
    score: { home: 4, away: 0 },
    attendance: 78900
  },
  {
    id: "match-08",
    stage: "Group Stage",
    group: "Group D",
    date: "2026-06-15",
    time: "13:00",
    stadiumId: "nrg-stadium",
    homeTeam: "Senegal",
    awayTeam: "South Korea",
    status: "completed",
    score: { home: 1, away: 1 },
    attendance: 68500
  },
  // Group E
  {
    id: "match-09",
    stage: "Group Stage",
    group: "Group E",
    date: "2026-06-15",
    time: "17:00",
    stadiumId: "mercedes-benz-stadium",
    homeTeam: "Brazil",
    awayTeam: "Switzerland",
    status: "completed",
    score: { home: 2, away: 0 },
    attendance: 70800
  },
  {
    id: "match-10",
    stage: "Group Stage",
    group: "Group E",
    date: "2026-06-16",
    time: "15:00",
    stadiumId: "lincoln-financial-field",
    homeTeam: "Ecuador",
    awayTeam: "Ukraine",
    status: "completed",
    score: { home: 0, away: 1 },
    attendance: 66320
  },
  // Group F
  {
    id: "match-11",
    stage: "Group Stage",
    group: "Group F",
    date: "2026-06-16",
    time: "19:00",
    stadiumId: "bc-place",
    homeTeam: "England",
    awayTeam: "Ghana",
    status: "completed",
    score: { home: 2, away: 1 },
    attendance: 52100
  },
  {
    id: "match-12",
    stage: "Group Stage",
    group: "Group F",
    date: "2026-06-17",
    time: "12:00",
    stadiumId: "levis-stadium",
    homeTeam: "Peru",
    awayTeam: "Norway",
    status: "completed",
    score: { home: 1, away: 3 },
    attendance: 64900
  },
  // Group G
  {
    id: "match-13",
    stage: "Group Stage",
    group: "Group G",
    date: "2026-06-17",
    time: "16:00",
    stadiumId: "arrowhead-stadium",
    homeTeam: "Spain",
    awayTeam: "Tunisia",
    status: "completed",
    score: { home: 3, away: 1 },
    attendance: 72100
  },
  {
    id: "match-14",
    stage: "Group Stage",
    group: "Group G",
    date: "2026-06-18",
    time: "15:00",
    stadiumId: "gillette-stadium",
    homeTeam: "Iran",
    awayTeam: "Denmark",
    status: "completed",
    score: { home: 0, away: 2 },
    attendance: 60200
  },
  // Group H
  {
    id: "match-15",
    stage: "Group Stage",
    group: "Group H",
    date: "2026-06-18",
    time: "19:00",
    stadiumId: "estadio-bbva",
    homeTeam: "Portugal",
    awayTeam: "Chile",
    status: "completed",
    score: { home: 2, away: 2 },
    attendance: 51900
  },
  {
    id: "match-16",
    stage: "Group Stage",
    group: "Group H",
    date: "2026-06-19",
    time: "13:00",
    stadiumId: "metlife-stadium",
    homeTeam: "Nigeria",
    awayTeam: "Austria",
    status: "completed",
    score: { home: 1, away: 0 },
    attendance: 79200
  },
  // Group I
  {
    id: "match-17",
    stage: "Group Stage",
    group: "Group I",
    date: "2026-06-19",
    time: "18:00",
    stadiumId: "sofi-stadium",
    homeTeam: "Belgium",
    awayTeam: "Honduras",
    status: "completed",
    score: { home: 4, away: 1 },
    attendance: 68100
  },
  {
    id: "match-18",
    stage: "Group Stage",
    group: "Group I",
    date: "2026-06-20",
    time: "14:00",
    stadiumId: "bmo-field",
    homeTeam: "Egypt",
    awayTeam: "Turkey",
    status: "completed",
    score: { home: 2, away: 2 },
    attendance: 43900
  },
  // Group J
  {
    id: "match-19",
    stage: "Group Stage",
    group: "Group J",
    date: "2026-06-20",
    time: "19:00",
    stadiumId: "estadio-azteca",
    homeTeam: "Italy",
    awayTeam: "Algeria",
    status: "completed",
    score: { home: 2, away: 0 },
    attendance: 85200
  },
  {
    id: "match-20",
    stage: "Group Stage",
    group: "Group J",
    date: "2026-06-21",
    time: "13:00",
    stadiumId: "nrg-stadium",
    homeTeam: "Uruguay",
    awayTeam: "Japan",
    status: "completed",
    score: { home: 1, away: 0 },
    attendance: 69200
  },
  // Group K
  {
    id: "match-21",
    stage: "Group Stage",
    group: "Group K",
    date: "2026-06-21",
    time: "17:00",
    stadiumId: "att-stadium",
    homeTeam: "Germany",
    awayTeam: "Canada",
    status: "completed",
    score: { home: 2, away: 1 },
    attendance: 79800
  },
  {
    id: "match-22",
    stage: "Group Stage",
    group: "Group K",
    date: "2026-06-22",
    time: "15:00",
    stadiumId: "levis-stadium",
    homeTeam: "Colombia",
    awayTeam: "Scotland",
    status: "completed",
    score: { home: 3, away: 0 },
    attendance: 66800
  },
  // Group L
  {
    id: "match-23",
    stage: "Group Stage",
    group: "Group L",
    date: "2026-06-22",
    time: "20:00",
    stadiumId: "mercedes-benz-stadium",
    homeTeam: "Netherlands",
    awayTeam: "Panama",
    status: "completed",
    score: { home: 3, away: 1 },
    attendance: 69900
  },
  {
    id: "match-24",
    stage: "Group Stage",
    group: "Group L",
    date: "2026-06-23",
    time: "14:00",
    stadiumId: "hard-rock-stadium",
    homeTeam: "Croatia",
    awayTeam: "Mali",
    status: "completed",
    score: { home: 1, away: 0 },
    attendance: 62900
  },

  // LIVE MATCHES (Matches happening today)
  {
    id: "match-live-01",
    stage: "Group Stage",
    group: "Group A",
    date: "2026-07-11", // Matches the mock current local time
    time: "13:00",
    stadiumId: "estadio-azteca",
    homeTeam: "Mexico",
    awayTeam: "Canada",
    status: "live",
    score: { home: 2, away: 1 },
    attendance: 87523
  },
  {
    id: "match-live-02",
    stage: "Group Stage",
    group: "Group B",
    date: "2026-07-11", // Matches the mock current local time
    time: "16:00",
    stadiumId: "sofi-stadium",
    homeTeam: "USA",
    awayTeam: "Japan",
    status: "live",
    score: { home: 0, away: 0 },
    attendance: 70240
  },
  {
    id: "match-live-03",
    stage: "Group Stage",
    group: "Group C",
    date: "2026-07-11", // Matches the mock current local time
    time: "20:00",
    stadiumId: "att-stadium",
    homeTeam: "Argentina",
    awayTeam: "Saudi Arabia",
    status: "scheduled",
    score: { home: 0, away: 0 },
    attendance: 0
  },

  // --- KNOCKOUT STAGES (Upcoming) ---
  // Round of 32
  {
    id: "match-r32-01",
    stage: "Round of 32",
    date: "2026-07-12",
    time: "12:00",
    stadiumId: "metlife-stadium",
    homeTeam: "Winner Group A",
    awayTeam: "Third Place Group C/D/E",
    status: "scheduled"
  },
  {
    id: "match-r32-02",
    stage: "Round of 32",
    date: "2026-07-12",
    time: "16:00",
    stadiumId: "bc-place",
    homeTeam: "Winner Group B",
    awayTeam: "Third Place Group F/G/H",
    status: "scheduled"
  },
  {
    id: "match-r32-03",
    stage: "Round of 32",
    date: "2026-07-13",
    time: "14:00",
    stadiumId: "nrg-stadium",
    homeTeam: "Runner-up Group A",
    awayTeam: "Runner-up Group B",
    status: "scheduled"
  },
  {
    id: "match-r32-04",
    stage: "Round of 32",
    date: "2026-07-13",
    time: "19:00",
    stadiumId: "lumen-field",
    homeTeam: "Winner Group C",
    awayTeam: "Third Place Group A/B/I",
    status: "scheduled"
  },

  // Round of 16
  {
    id: "match-r16-01",
    stage: "Round of 16",
    date: "2026-07-15",
    time: "13:00",
    stadiumId: "mercedes-benz-stadium",
    homeTeam: "Winner R32 Match 1",
    awayTeam: "Winner R32 Match 2",
    status: "scheduled"
  },
  {
    id: "match-r16-02",
    stage: "Round of 16",
    date: "2026-07-15",
    time: "18:00",
    stadiumId: "lincoln-financial-field",
    homeTeam: "Winner R32 Match 3",
    awayTeam: "Winner R32 Match 4",
    status: "scheduled"
  },

  // Quarter-finals
  {
    id: "match-qf-01",
    stage: "Quarter-finals",
    date: "2026-07-17",
    time: "15:00",
    stadiumId: "arrowhead-stadium",
    homeTeam: "Winner R16 Match 1",
    awayTeam: "Winner R16 Match 2",
    status: "scheduled"
  },
  {
    id: "match-qf-02",
    stage: "Quarter-finals",
    date: "2026-07-18",
    time: "19:00",
    stadiumId: "gillette-stadium",
    homeTeam: "Winner R16 Match 3",
    awayTeam: "Winner R16 Match 4",
    status: "scheduled"
  },

  // Semi-finals
  {
    id: "match-sf-01",
    stage: "Semi-finals",
    date: "2026-07-21",
    time: "19:30",
    stadiumId: "sofi-stadium",
    homeTeam: "Winner QF Match 1",
    awayTeam: "Winner QF Match 2",
    status: "scheduled"
  },
  {
    id: "match-sf-02",
    stage: "Semi-finals",
    date: "2026-07-22",
    time: "19:30",
    stadiumId: "att-stadium",
    homeTeam: "Winner QF Match 3",
    awayTeam: "Winner QF Match 4",
    status: "scheduled"
  },

  // Third Place Play-off
  {
    id: "match-third-place",
    stage: "Third Place",
    date: "2026-07-25",
    time: "15:00",
    stadiumId: "hard-rock-stadium",
    homeTeam: "Loser SF Match 1",
    awayTeam: "Loser SF Match 2",
    status: "scheduled"
  },

  // Final
  {
    id: "match-final",
    stage: "Final",
    date: "2026-07-26",
    time: "16:00",
    stadiumId: "metlife-stadium",
    homeTeam: "Winner SF Match 1",
    awayTeam: "Winner SF Match 2",
    status: "scheduled"
  }
];

module.exports = matches;
