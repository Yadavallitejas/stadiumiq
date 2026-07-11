/**
 * @fileoverview Concession and service vendor data for stadiums.
 * Used for operational queue analytics and crowd management.
 */

/**
 * @typedef {Object} Vendor
 * @property {string} id - Unique identifier for the vendor.
 * @property {string} name - Display name of the vendor.
 * @property {string} type - Vendor category ('food', 'beverage', 'merchandise', 'restroom', 'medical').
 * @property {string} stadiumId - Associated stadium ID (matching stadiums.js).
 * @property {string} section - Location within the stadium.
 * @property {string} status - Operational status ('open', 'busy', 'closed').
 * @property {number} queueTimeMinutes - Current estimated wait time in minutes.
 * @property {number} popularityScore - Rating score out of 5.
 * @property {string[]} items - Featured products or services.
 */

/**
 * List of stadium vendors.
 * @type {Vendor[]}
 */
const vendors = [
  // MetLife Stadium
  {
    id: "metlife-food-01",
    name: "NY Deli Classics",
    type: "food",
    stadiumId: "metlife-stadium",
    section: "Section 114",
    status: "open",
    queueTimeMinutes: 8,
    popularityScore: 4.5,
    items: ["Pastrami On Rye", "Hot Dogs", "Pretzels"]
  },
  {
    id: "metlife-merch-01",
    name: "FIFA Fan Shop - North",
    type: "merchandise",
    stadiumId: "metlife-stadium",
    section: "Section 102",
    status: "busy",
    queueTimeMinutes: 18,
    popularityScore: 4.8,
    items: ["Official Jerseys", "Match Scarves", "Trophy Replicas"]
  },
  {
    id: "metlife-wc-01",
    name: "Restroom Block A",
    type: "restroom",
    stadiumId: "metlife-stadium",
    section: "Section 120",
    status: "busy",
    queueTimeMinutes: 5,
    popularityScore: 3.2,
    items: ["Mens", "Womens", "Accessible"]
  },

  // Estadio Azteca
  {
    id: "azteca-food-01",
    name: "Tacos El Capi",
    type: "food",
    stadiumId: "estadio-azteca",
    section: "Lower Level Sec 8",
    status: "busy",
    queueTimeMinutes: 22,
    popularityScore: 4.9,
    items: ["Al Pastor Tacos", "Quesadillas", "Horchata"]
  },
  {
    id: "azteca-bev-01",
    name: "Corona Cantina",
    type: "beverage",
    stadiumId: "estadio-azteca",
    section: "Upper Level Sec 214",
    status: "open",
    queueTimeMinutes: 6,
    popularityScore: 4.3,
    items: ["Cold Cerveza", "Soft Drinks", "Mineral Water"]
  },

  // SoFi Stadium
  {
    id: "sofi-food-01",
    name: "LA Fusion Grill",
    type: "food",
    stadiumId: "sofi-stadium",
    section: "Concourse Level 2",
    status: "open",
    queueTimeMinutes: 12,
    popularityScore: 4.6,
    items: ["Korean BBQ Tacos", "Avocado Fries", "Craft Beer"]
  },
  {
    id: "sofi-wc-01",
    name: "Restroom Concourse East",
    type: "restroom",
    stadiumId: "sofi-stadium",
    section: "Section 230",
    status: "open",
    queueTimeMinutes: 2,
    popularityScore: 4.0,
    items: ["Mens", "Womens", "Family Assisted"]
  },

  // AT&T Stadium
  {
    id: "att-food-01",
    name: "Texas Size BBQ",
    type: "food",
    stadiumId: "att-stadium",
    section: "Plaza Level Sec 12",
    status: "busy",
    queueTimeMinutes: 25,
    popularityScore: 4.7,
    items: ["Beef Brisket", "Smoked Ribs", "Pulled Pork Sandwich"]
  },
  {
    id: "att-med-01",
    name: "First Aid Station West",
    type: "medical",
    stadiumId: "att-stadium",
    section: "Main Concourse Sec 115",
    status: "open",
    queueTimeMinutes: 0,
    popularityScore: 5.0,
    items: ["Basic First Aid", "Dehydration Support", "Triage"]
  },

  // BMO Field
  {
    id: "bmo-food-01",
    name: "Maple Leaf Grill",
    type: "food",
    stadiumId: "bmo-field",
    section: "East Stand Sec 109",
    status: "open",
    queueTimeMinutes: 10,
    popularityScore: 4.4,
    items: ["Poutine", "Peameal Bacon Buns", "Canadian Cider"]
  },

  // BC Place
  {
    id: "bc-food-01",
    name: "Pacific Salmon Co.",
    type: "food",
    stadiumId: "bc-place",
    section: "Level 1 Sec 142",
    status: "open",
    queueTimeMinutes: 11,
    popularityScore: 4.5,
    items: ["Salmon Burgers", "Fish and Chips", "Local IPA"]
  }
];

module.exports = vendors;
