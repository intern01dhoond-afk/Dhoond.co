require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const services = [
  // FAN
  { title: 'Ceiling Fan Installation', category: 'electrician', op: 299, dp: 199, tag: 'Standard', desc: 'Professional installation of ceiling fan with secure mounting.', sub: 'Fan' },
  { title: 'Ceiling Fan Only Uninstallation', category: 'electrician', op: 149, dp: 99, tag: 'Standard', desc: 'Safe removal of existing ceiling fan.', sub: 'Fan' },
  { title: 'Ceiling Fan Reinstallation', category: 'electrician', op: 349, dp: 249, tag: 'Standard', desc: 'Removal and re-mounting of ceiling fan in same or new spot.', sub: 'Fan' },
  { title: 'Ceiling Fan Replacement', category: 'electrician', op: 399, dp: 299, tag: 'Standard', desc: 'Removing old fan and installing a new one.', sub: 'Fan' },
  { title: 'Wall Fan Installation', category: 'electrician', op: 249, dp: 179, tag: 'Standard', desc: 'Mounting and connection of wall-mounted fan.', sub: 'Fan' },
  { title: 'Wall Fan Unistallation', category: 'electrician', op: 149, dp: 99, tag: 'Standard', desc: 'Safe removal of wall fan.', sub: 'Fan' },
  { title: 'Exhaust Fan Installation', category: 'electrician', op: 299, dp: 219, tag: 'Standard', desc: 'Kitchen or bathroom exhaust fan mounting.', sub: 'Fan' },
  { title: 'Exhaust Fan Uninstallation', category: 'electrician', op: 149, dp: 99, tag: 'Standard', desc: 'Safe removal of exhaust fan.', sub: 'Fan' },

  // SWITCH
  { title: 'Switch Replacement', category: 'electrician', op: 99, dp: 49, tag: 'Basic', desc: 'Single switch replacement in existing board.', sub: 'Switch' },
  { title: 'Socket Replacement', category: 'electrician', op: 129, dp: 69, tag: 'Basic', desc: 'Replacing damaged power socket.', sub: 'Switch' },
  { title: 'Holder Replacement', category: 'electrician', op: 89, dp: 49, tag: 'Basic', desc: 'Replacing bulb or tube light holder.', sub: 'Switch' },
  { title: 'Switchbox Installation (3 point)', category: 'electrician', op: 399, dp: 299, tag: 'Standard', desc: 'Installation of a 3-point switch box.', sub: 'Switch' },
  { title: 'AC Switchbox Installation', category: 'electrician', op: 599, dp: 449, tag: 'Standard', desc: 'Heavy-duty switchbox installation for AC.', sub: 'Switch' },
  { title: 'Switchboard Installation (6 points)', category: 'electrician', op: 699, dp: 549, tag: 'Premium', desc: 'Full installation of 6-point modular switchboard.', sub: 'Switch' },
  { title: 'Switchboard Repair (Only Switchboard inspection)', category: 'electrician', op: 199, dp: 149, tag: 'Repair', desc: 'Thorough inspection and minor repair of switchboard.', sub: 'Switch' },

  // WIRING
  { title: 'New external wiring with casing (upto 5m)', category: 'electrician', op: 799, dp: 599, tag: 'Wiring', desc: 'Safe external wiring with PVC casing pipe.', sub: 'Wiring' },
  { title: 'Wiring without casing (upto 5m)', category: 'electrician', op: 599, dp: 449, tag: 'Wiring', desc: 'External wiring without casing pipe.', sub: 'Wiring' },
  { title: 'New internal wiring (upto 5m)', category: 'electrician', op: 999, dp: 749, tag: 'Wiring', desc: 'Concealed internal wiring for a neat finish.', sub: 'Wiring' },

  // DOORBELL
  { title: 'Doorbell installation', category: 'electrician', op: 199, dp: 149, tag: 'Standard', desc: 'Wired or wireless doorbell mounting and setup.', sub: 'Doorbell' },
  { title: 'Doorbell replacement', category: 'electrician', op: 149, dp: 99, tag: 'Standard', desc: 'Replacing old doorbell with a new unit.', sub: 'Doorbell' },

  // OTHER
  { title: 'Submeter installation', category: 'electrician', op: 899, dp: 699, tag: 'Heavy', desc: 'Installation of secondary electric sub-meter.', sub: 'Other' },
  { title: 'Geyser installation', category: 'electrician', op: 799, dp: 599, tag: 'Heavy', desc: 'Secure mounting and connection of water heater.', sub: 'Other' },

  // COMMON (will add these to all groups in frontend logic, but inserting once for the category)
  { title: 'Electrician Visit', category: 'electrician', op: 299, dp: 299, tag: 'Essential', desc: 'Expert electrician visit for diagnosis and minor fixes.', sub: 'All' },
  { title: 'Free Consultation On Call', category: 'electrician', op: 0, dp: 0, tag: 'Free', desc: 'Talk to our expert electrician over a call for advice.', sub: 'All' },
];

async function insertServices() {
  try {
    for (const s of services) {
      // We'll include the subcategory in the description for easy filtering later if needed
      const fullDesc = `[${s.sub}] ${s.desc}`;
      await pool.query(
        'INSERT INTO services (title, category, original_price, discount_price, discount_tag, description, image) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [s.title, s.category, s.op, s.dp, s.tag, fullDesc, `/services/electrician_${s.sub.toLowerCase()}.png`]
      );
      console.log(`Inserted: ${s.title}`);
    }
    console.log('All electrician services inserted successfully!');
  } catch (err) {
    console.error('Error inserting services:', err);
  } finally {
    await pool.end();
  }
}

insertServices();
