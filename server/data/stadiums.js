/**
 * @fileoverview Stadiums data for FIFA World Cup 2026.
 * Contains information about the 16 official venues across the USA, Canada, and Mexico.
 */

/**
 * @typedef {Object} Coordinates
 * @property {number} lat - Latitude coordinates.
 * @property {number} lng - Longitude coordinates.
 */

/**
 * @typedef {Object} Stadium
 * @property {string} id - Unique identifier for the stadium.
 * @property {string} name - Official name of the stadium.
 * @property {string} city - Host city name.
 * @property {string} country - Host country (USA, Canada, Mexico).
 * @property {number} capacity - Seating capacity of the venue.
 * @property {Coordinates} coordinates - Latitude and longitude coordinates.
 * @property {string} timezone - Local timezone.
 * @property {string[]} features - Smart stadium features or amenities.
 */

/**
 * List of the 16 FIFA World Cup 2026 stadiums.
 * @type {Stadium[]}
 */
const stadiums = [
  {
    id: "estadio-azteca",
    name: "Estadio Azteca",
    city: "Mexico City",
    country: "Mexico",
    capacity: 87523,
    coordinates: { lat: 19.3029, lng: -99.1505 },
    timezone: "America/Mexico_City",
    features: ["Historic Venue", "High Altitude", "Hybrid Grass", "Retractable Roof (Partial)"]
  },
  {
    id: "estadio-akron",
    name: "Estadio Akron",
    city: "Guadalajara",
    country: "Mexico",
    capacity: 48071,
    coordinates: { lat: 20.6818, lng: -103.4627 },
    timezone: "America/Mexico_City",
    features: ["Eco-friendly Design", "Grass Berm", "360-degree LED screen"]
  },
  {
    id: "estadio-bbva",
    name: "Estadio BBVA",
    city: "Monterrey",
    country: "Mexico",
    capacity: 53500,
    coordinates: { lat: 25.6690, lng: -100.2445 },
    timezone: "America/Monterrey",
    features: ["Mountain Views", "LEED Silver Certified", "Advanced Drainage System"]
  },
  {
    id: "bc-place",
    name: "BC Place",
    city: "Vancouver",
    country: "Canada",
    capacity: 54500,
    coordinates: { lat: 49.2768, lng: -123.1120 },
    timezone: "America/Vancouver",
    features: ["Retractable Roof", "Secondary Support Arch", "Giant Scoreboard"]
  },
  {
    id: "bmo-field",
    name: "BMO Field",
    city: "Toronto",
    country: "Canada",
    capacity: 45000,
    coordinates: { lat: 43.6328, lng: -79.4186 },
    timezone: "America/Toronto",
    features: ["Natural Grass", "Lake Ontario Breeze", "Expanded Seating"]
  },
  {
    id: "metlife-stadium",
    name: "MetLife Stadium",
    city: "New York/New Jersey",
    country: "USA",
    capacity: 82500,
    coordinates: { lat: 40.8135, lng: -74.0745 },
    timezone: "America/New_York",
    features: ["Giant LED Pylons", "Outer Skin Illumination", "Mass Transit Connected"]
  },
  {
    id: "sofi-stadium",
    name: "SoFi Stadium",
    city: "Los Angeles",
    country: "USA",
    capacity: 70240,
    coordinates: { lat: 33.9534, lng: -118.3390 },
    timezone: "America/Los_Angeles",
    features: ["Double-sided Infinity Screen", "Translucent Roof Canopy", "Indoor-Outdoor Flow"]
  },
  {
    id: "att-stadium",
    name: "AT&T Stadium",
    city: "Dallas",
    country: "USA",
    capacity: 80000,
    coordinates: { lat: 32.7473, lng: -97.0945 },
    timezone: "America/Chicago",
    features: ["Retractable Roof", "Giant Center-hung Video Board", "Retractable Glass Doors"]
  },
  {
    id: "arrowhead-stadium",
    name: "Arrowhead Stadium",
    city: "Kansas City",
    country: "USA",
    capacity: 76416,
    coordinates: { lat: 39.0489, lng: -94.4839 },
    timezone: "America/Chicago",
    features: ["Loudest Stadium Record", "Open-air Design", "State-of-the-art Sound System"]
  },
  {
    id: "mercedes-benz-stadium",
    name: "Mercedes-Benz Stadium",
    city: "Atlanta",
    country: "USA",
    capacity: 71000,
    coordinates: { lat: 33.7573, lng: -84.4008 },
    timezone: "America/New_York",
    features: ["Pinwheel Retractable Roof", "Halo Video Board", "Solar Panels Grid"]
  },
  {
    id: "lincoln-financial-field",
    name: "Lincoln Financial Field",
    city: "Philadelphia",
    country: "USA",
    capacity: 69796,
    coordinates: { lat: 39.9012, lng: -75.1675 },
    timezone: "America/New_York",
    features: ["Wind Turbines & Solar Power", "Open-air Design", "Excellent Sightlines"]
  },
  {
    id: "lumen-field",
    name: "Lumen Field",
    city: "Seattle",
    country: "USA",
    capacity: 69000,
    coordinates: { lat: 47.5952, lng: -122.3316 },
    timezone: "America/Los_Angeles",
    features: ["Cantilever Roofs", "Vertical View of Seattle Skyline", "Acoustic Reflection Design"]
  },
  {
    id: "levis-stadium",
    name: "Levi's Stadium",
    city: "San Francisco Bay Area",
    country: "USA",
    capacity: 68500,
    coordinates: { lat: 37.4033, lng: -121.9698 },
    timezone: "America/Los_Angeles",
    features: ["Green Roof", "Solar Terraces", "Public Transit Access"]
  },
  {
    id: "gillette-stadium",
    name: "Gillette Stadium",
    city: "Boston",
    country: "USA",
    capacity: 65878,
    coordinates: { lat: 42.0909, lng: -71.2643 },
    timezone: "America/New_York",
    features: ["Lighthouse & Bridge Landmark", "HD Video Board", "Patriot Place Connection"]
  },
  {
    id: "nrg-stadium",
    name: "NRG Stadium",
    city: "Houston",
    country: "USA",
    capacity: 72220,
    coordinates: { lat: 29.6847, lng: -95.4107 },
    timezone: "America/Chicago",
    features: ["Retractable Roof fabric", "Flexible Seating Configurations", "Large Parking Lots"]
  },
  {
    id: "hard-rock-stadium",
    name: "Hard Rock Stadium",
    city: "Miami",
    country: "USA",
    capacity: 64767,
    coordinates: { lat: 25.9580, lng: -80.2389 },
    timezone: "America/New_York",
    features: ["Open-air Canopy Roof", "Modern Art Murals", "F1 Track Integration"]
  }
];

module.exports = stadiums;
