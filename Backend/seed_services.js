require('dotenv').config();
const pool = require('./src/db/db');

// ─── Category name → DB category value mapping ────────────────────────────────
// DB uses: 'electrician', 'technician' (AC/RO/WM/Fridge/Microwave), 'painter', 'plumber'
const CATEGORY_MAP = {
  'Electrician': 'electrician',
  'AC Technician': 'technician',
  'RO Technician': 'technician',
  'Refrigerator Technician': 'technician',
  'Washing machine': 'technician',
  'Microwave Technician': 'technician',
  'Chimney': 'technician',
  'Painting': 'painter',
};

// ─── Image path mapping by keyword ───────────────────────────────────────────
const getImage = (category, subCategory, sku) => {
  const cat = (category || '').toLowerCase();
  const sub = (subCategory || '').toLowerCase();
  const title = (sku || '').toLowerCase();

  if (cat.includes('ac') || title.includes('ac') || title.includes('air cond')) return '/services/AC Technician.png';
  if (cat.includes('ro') || title.includes('water purif') || title.includes('ro')) return '/services/RO Technician.png';
  if (cat.includes('washing') || title.includes('washing')) return '/services/Washing Machine Technician.png';
  if (cat.includes('refrigerator') || title.includes('refrigerator') || title.includes('fridge')) return '/services/Appliance Technician.png';
  if (cat.includes('microwave') || title.includes('microwave')) return '/services/Appliance Technician.png';
  if (cat.includes('chimney') || title.includes('chimney')) return '/services/Appliance Technician.png';
  if (cat.includes('painting') || cat.includes('paint')) return '/services/House Painter.png';

  // Electrician subcategories
  if (sub.includes('fan') || title.includes('fan')) return '/services/Electrician.png';
  if (sub.includes('geyser') || title.includes('geyser')) return '/services/Electrician.png';
  if (sub.includes('switch') || sub.includes('switchbox')) return '/services/Control Panel Electrician.png';
  if (sub.includes('light') || title.includes('light') || title.includes('bulb')) return '/services/Electrician.png';
  return '/services/Electrician.png';
};

// ─── Build description from Include/Exclude text ─────────────────────────────
const buildDescription = (sku, sortBy, include, exclude) => {
  let desc = `${sku} — ${sortBy} service.`;
  if (include) desc += ` ${include.replace(/\n/g, ' ').trim()}`;
  return desc.substring(0, 500);
};

// ─── Services data from the spreadsheet ──────────────────────────────────────
const SERVICES = [
  // ── Electrician / Fan ──────────────────────────────────────────────────────
  { cat: 'Electrician', sub: 'Fan', sku: 'Ceiling fan installation',    sortBy: 'Installation',    rating: 4.5, actualPrice: 111,  discPct: 20, discPrice: 89,    time: '30 mins' },
  { cat: 'Electrician', sub: 'Fan', sku: 'Wall fan installation',       sortBy: 'Installation',    rating: 4.5, actualPrice: 111,  discPct: 20, discPrice: 89,    time: '30 mins' },
  { cat: 'Electrician', sub: 'Fan', sku: 'Ceiling fan repair',          sortBy: 'Repair',          rating: 4.5, actualPrice: 136,  discPct: 20, discPrice: 109,   time: '30 mins' },
  { cat: 'Electrician', sub: 'Fan', sku: 'Wall fan repair',             sortBy: 'Repair',          rating: 4.5, actualPrice: 136,  discPct: 20, discPrice: 109,   time: '30 mins' },
  { cat: 'Electrician', sub: 'Fan', sku: 'Ceiling fan uninstallation',  sortBy: 'Uninstallation',  rating: 5,   actualPrice: 86,   discPct: 20, discPrice: 69,    time: '30 mins' },
  { cat: 'Electrician', sub: 'Fan', sku: 'Wall fan uninstallation',     sortBy: 'Uninstallation',  rating: 5,   actualPrice: 86,   discPct: 20, discPrice: 69,    time: '30 mins' },
  { cat: 'Electrician', sub: 'Fan', sku: 'Ceiling fan replacement',     sortBy: 'Maintenance',     rating: 4.5, actualPrice: 186,  discPct: 20, discPrice: 149,   time: '30 mins' },
  { cat: 'Electrician', sub: 'Fan', sku: 'Wall fan replacement',        sortBy: 'Maintenance',     rating: 4.5, actualPrice: 186,  discPct: 20, discPrice: 149,   time: '30 mins' },

  // ── Electrician / Switchbox ────────────────────────────────────────────────
  { cat: 'Electrician', sub: 'Switchbox/Switchboard', sku: 'Switchbox installation',     sortBy: 'Installation', rating: 4.5, actualPrice: 299, discPct: 20, discPrice: 239, time: '30 mins' },
  { cat: 'Electrician', sub: 'Switchbox/Switchboard', sku: 'AC switchbox installation',  sortBy: 'Installation', rating: 4.5, actualPrice: 311, discPct: 20, discPrice: 249, time: '30 mins' },
  { cat: 'Electrician', sub: 'Switchbox/Switchboard', sku: 'Switchboard installation',   sortBy: 'Installation', rating: 4.5, actualPrice: 149, discPct: 20, discPrice: 119, time: '30 mins' },

  // ── Electrician / Wall/ceiling light ──────────────────────────────────────
  { cat: 'Electrician', sub: 'Wall/ceiling light', sku: 'Bulb/tubelight holder installation', sortBy: 'Installation', rating: 5,   actualPrice: 86,  discPct: 20, discPrice: 69,  time: '20 mins' },
  { cat: 'Electrician', sub: 'Wall/ceiling light', sku: 'Bulb/tubelight installation',        sortBy: 'Installation', rating: 5,   actualPrice: 86,  discPct: 20, discPrice: 69,  time: '20 mins' },
  { cat: 'Electrician', sub: 'Wall/ceiling light', sku: 'Ceiling light installation',          sortBy: 'Installation', rating: 4.5, actualPrice: 111, discPct: 20, discPrice: 89,  time: '20 mins' },
  { cat: 'Electrician', sub: 'Wall/ceiling light', sku: 'Decorative/spotlight installation',   sortBy: 'Installation', rating: 4.5, actualPrice: 136, discPct: 20, discPrice: 109, time: '30 mins' },
  { cat: 'Electrician', sub: 'Wall/ceiling light', sku: 'Wall light installation',             sortBy: 'Installation', rating: 4.5, actualPrice: 111, discPct: 20, discPrice: 89,  time: '30 mins' },

  // ── Electrician / Geyser ──────────────────────────────────────────────────
  { cat: 'Electrician', sub: 'Geyser', sku: 'Geyser installation',   sortBy: 'Installation',   rating: 4.5, actualPrice: 311, discPct: 20, discPrice: 249, time: '60 mins' },
  { cat: 'Electrician', sub: 'Geyser', sku: 'Geyser uninstallation', sortBy: 'Uninstallation', rating: 4.5, actualPrice: 161, discPct: 20, discPrice: 129, time: '30 mins' },
  { cat: 'Electrician', sub: 'Geyser', sku: 'Geyser repair',         sortBy: 'Repair',         rating: 4.5, actualPrice: 136, discPct: 20, discPrice: 109, time: '30 mins' },
  { cat: 'Electrician', sub: 'Geyser', sku: 'Geyser not heating / low heating', sortBy: 'Repair', rating: 4.5, actualPrice: 136, discPct: 20, discPrice: 109, time: '30 mins' },
  { cat: 'Electrician', sub: 'Geyser', sku: 'Geyser water leakage',  sortBy: 'Repair',         rating: 4.5, actualPrice: 136, discPct: 20, discPrice: 109, time: '30 mins' },

  // ── AC Technician ─────────────────────────────────────────────────────────
  { cat: 'AC Technician', sub: 'Split AC',   sku: 'AC installation — Split AC',    sortBy: 'Installation',   rating: 5,   actualPrice: 999,  discPct: 20, discPrice: 799, time: '1 hr 30 mins' },
  { cat: 'AC Technician', sub: 'Window AC',  sku: 'AC installation — Window AC',   sortBy: 'Installation',   rating: 5,   actualPrice: 2124, discPct: 20, discPrice: 1699, time: '1 hr 30 mins' },
  { cat: 'AC Technician', sub: 'Split AC',   sku: 'AC uninstallation — Split AC',  sortBy: 'Uninstallation', rating: 4.5, actualPrice: 249,  discPct: 20, discPrice: 199, time: '30 mins' },
  { cat: 'AC Technician', sub: 'Window AC',  sku: 'AC uninstallation — Window AC', sortBy: 'Uninstallation', rating: 4.5, actualPrice: 149,  discPct: 20, discPrice: 119, time: '30 mins' },
  { cat: 'AC Technician', sub: '',           sku: 'AC less/no cooling',             sortBy: 'Repair',         rating: 5,   actualPrice: 124,  discPct: 20, discPrice: 99,  time: '45 mins' },

  // ── RO Technician ─────────────────────────────────────────────────────────
  { cat: 'RO Technician', sub: '', sku: 'Water purifier installation',   sortBy: 'Installation',   rating: 4.5, actualPrice: 624, discPct: 20, discPrice: 499, time: '60 mins' },
  { cat: 'RO Technician', sub: '', sku: 'Water purifier uninstallation', sortBy: 'Uninstallation', rating: 4.5, actualPrice: 249, discPct: 20, discPrice: 199, time: '30 mins' },
  { cat: 'RO Technician', sub: '', sku: 'Water purifier — water leakage', sortBy: 'Repair',        rating: 4.5, actualPrice: 124, discPct: 20, discPrice: 99,  time: '30 mins' },
  { cat: 'RO Technician', sub: '', sku: 'Water purifier — low water flow', sortBy: 'Repair',       rating: 4.5, actualPrice: 124, discPct: 20, discPrice: 99,  time: '30 mins' },

  // ── Refrigerator Technician ───────────────────────────────────────────────
  { cat: 'Refrigerator Technician', sub: 'Single door', sku: 'Refrigerator excess cooling (frost) — Single door', sortBy: 'Repair', rating: 5,   actualPrice: 124, discPct: 20, discPrice: 99,  time: '40 mins' },
  { cat: 'Refrigerator Technician', sub: 'Double door', sku: 'Refrigerator excess cooling (frost) — Double door', sortBy: 'Repair', rating: 5,   actualPrice: 124, discPct: 20, discPrice: 99,  time: '40 mins' },
  { cat: 'Refrigerator Technician', sub: 'Single door', sku: 'Refrigerator not cooling — Single door',            sortBy: 'Repair', rating: 5,   actualPrice: 124, discPct: 20, discPrice: 99,  time: '40 mins' },
  { cat: 'Refrigerator Technician', sub: 'Double door', sku: 'Refrigerator not cooling — Double door',            sortBy: 'Repair', rating: 5,   actualPrice: 124, discPct: 20, discPrice: 99,  time: '40 mins' },
  { cat: 'Refrigerator Technician', sub: '',            sku: 'Refrigerator noise issue',                          sortBy: 'Repair', rating: 4.5, actualPrice: 263, discPct: 20, discPrice: 210, time: '60 mins' },

  // ── Washing Machine ───────────────────────────────────────────────────────
  { cat: 'Washing machine', sub: 'Fully automatic top load',  sku: 'Washing machine installation — Top load',       sortBy: 'Installation', rating: 4.5, actualPrice: 499, discPct: 20, discPrice: 399, time: '60 mins' },
  { cat: 'Washing machine', sub: 'Fully automatic front load', sku: 'Washing machine installation — Front load',    sortBy: 'Installation', rating: 4,   actualPrice: 499, discPct: 20, discPrice: 399, time: '60 mins' },
  { cat: 'Washing machine', sub: 'Fully automatic front load', sku: 'Washing machine not spinning/washing',         sortBy: 'Repair',       rating: 5,   actualPrice: 124, discPct: 20, discPrice: 99,  time: '45 mins' },
  { cat: 'Washing machine', sub: 'Fully automatic front load', sku: 'Washing machine draining issue',               sortBy: 'Repair',       rating: 5,   actualPrice: 124, discPct: 20, discPrice: 99,  time: '45 mins' },
  { cat: 'Washing machine', sub: 'Fully automatic front load', sku: 'Washing machine noise issue',                  sortBy: 'Repair',       rating: 5,   actualPrice: 124, discPct: 20, discPrice: 99,  time: '45 mins' },
  { cat: 'Washing machine', sub: 'Semi-automatic',             sku: 'Washing machine not spinning — Semi-auto',     sortBy: 'Repair',       rating: 5,   actualPrice: 124, discPct: 20, discPrice: 99,  time: '45 mins' },
  { cat: 'Washing machine', sub: 'Semi-automatic',             sku: 'Washing machine draining issue — Semi-auto',   sortBy: 'Repair',       rating: 5,   actualPrice: 124, discPct: 20, discPrice: 99,  time: '45 mins' },
  { cat: 'Washing machine', sub: 'Semi-automatic',             sku: 'Washing machine noise issue — Semi-auto',      sortBy: 'Repair',       rating: 5,   actualPrice: 124, discPct: 20, discPrice: 99,  time: '45 mins' },

  // ── Microwave Technician ──────────────────────────────────────────────────
  { cat: 'Microwave Technician', sub: 'Convection',  sku: 'Microwave installation — Convection',         sortBy: 'Installation', rating: 4,   actualPrice: 311, discPct: 20, discPrice: 249, time: '30 mins' },
  { cat: 'Microwave Technician', sub: 'Convection',  sku: 'Microwave not heating — Convection',          sortBy: 'Repair',       rating: 4.5, actualPrice: 124, discPct: 20, discPrice: 99,  time: '45 mins' },
  { cat: 'Microwave Technician', sub: 'Convection',  sku: 'Microwave plate not turning — Convection',    sortBy: 'Repair',       rating: 4.5, actualPrice: 124, discPct: 20, discPrice: 99,  time: '45 mins' },
  { cat: 'Microwave Technician', sub: 'Convection',  sku: 'Microwave buttons not working — Convection',  sortBy: 'Repair',       rating: 4.5, actualPrice: 124, discPct: 20, discPrice: 99,  time: '45 mins' },
  { cat: 'Microwave Technician', sub: 'Solo/Grill',  sku: 'Microwave installation — Solo/Grill',         sortBy: 'Installation', rating: 4,   actualPrice: 249, discPct: 20, discPrice: 199, time: '30 mins' },
  { cat: 'Microwave Technician', sub: 'Solo/Grill',  sku: 'Microwave not heating — Solo/Grill',          sortBy: 'Repair',       rating: 4.5, actualPrice: 124, discPct: 20, discPrice: 99,  time: '45 mins' },
  { cat: 'Microwave Technician', sub: 'Solo/Grill',  sku: 'Microwave plate not turning — Solo/Grill',    sortBy: 'Repair',       rating: 4.5, actualPrice: 124, discPct: 20, discPrice: 99,  time: '45 mins' },
  { cat: 'Microwave Technician', sub: 'Solo/Grill',  sku: 'Microwave buttons not working — Solo/Grill',  sortBy: 'Repair',       rating: 4.5, actualPrice: 124, discPct: 20, discPrice: 99,  time: '45 mins' },

  // ── Chimney ───────────────────────────────────────────────────────────────
  { cat: 'Chimney', sub: '', sku: 'Chimney installation',   sortBy: 'Installation',   rating: 4,   actualPrice: 499, discPct: 20, discPrice: 399, time: '60 mins' },
  { cat: 'Chimney', sub: '', sku: 'Chimney uninstallation', sortBy: 'Uninstallation', rating: 4.5, actualPrice: 249, discPct: 20, discPrice: 199, time: '30 mins' },
  { cat: 'Chimney', sub: '', sku: 'Chimney basic cleaning',  sortBy: 'Repair',        rating: 5,   actualPrice: 499, discPct: 20, discPrice: 399, time: '45 mins' },
  { cat: 'Chimney', sub: '', sku: 'Chimney deep cleaning',   sortBy: 'Repair',        rating: 5,   actualPrice: 999, discPct: 20, discPrice: 799, time: '90 mins' },
  { cat: 'Chimney', sub: '', sku: 'Chimney noise issue',     sortBy: 'Repair',        rating: 5,   actualPrice: 124, discPct: 20, discPrice: 99,  time: '45 mins' },
];

// ─── Seeder ───────────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Starting service seeder...\n');
  let inserted = 0;
  let skipped = 0;

  for (const svc of SERVICES) {
    const dbCategory = CATEGORY_MAP[svc.cat];
    if (!dbCategory) {
      console.warn(`⚠️  Unknown category "${svc.cat}" — skipping "${svc.sku}"`);
      skipped++;
      continue;
    }

    const title = svc.sku;
    const discountTag = `${svc.discPct}% OFF`;
    const description = `${title} — ${svc.sortBy}. Estimated time: ${svc.time}.`;
    const image = getImage(svc.cat, svc.sub, svc.sku);
    const originalPrice = svc.actualPrice;
    const discountPrice = svc.discPrice;

    // Check if already exists
    const existing = await pool.query(
      'SELECT id FROM services WHERE title = $1 AND category = $2',
      [title, dbCategory]
    );
    if (existing.rows.length > 0) {
      console.log(`  ⏭  Already exists: "${title}"`);
      skipped++;
      continue;
    }

    await pool.query(
      'INSERT INTO services (title, category, original_price, discount_price, discount_tag, description, image) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [title, dbCategory, originalPrice, discountPrice, discountTag, description, image]
    );
    console.log(`  ✅  Inserted: [${dbCategory}] "${title}" — ₹${discountPrice}`);
    inserted++;
  }

  console.log(`\n🎉 Done! Inserted: ${inserted}, Skipped: ${skipped}`);
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeder failed:', err);
  process.exit(1);
});
