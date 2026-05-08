require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const acServices = [
  { title: 'AC Inspection (Visit)', category: 'technician', op: 500, dp: 299, tag: '40.20% OFF', desc: 'Professional diagnostic visit to identify AC issues.', img: '/services/ac_inspection.png' },
  { title: 'Normal AC Service + Cleaning', category: 'technician', op: 500, dp: 349, tag: '30.20% OFF', desc: 'Standard filter cleaning and cooling coil check.', img: '/services/split_ac_service.png' },
  { title: 'AC Service (Jet + Water)', category: 'technician', op: 650, dp: 569, tag: '12.46% OFF', desc: 'Deep cleaning using high-pressure jet pump.', img: '/services/jet_pump_ac_service.png' },
  { title: 'AC Service (Jet + Foam)', category: 'technician', op: 800, dp: 669, tag: '16.38% OFF', desc: 'Premium deep cleaning with specialized foam and jet wash.', img: '/services/jet_pump_ac_service.png' },
  { title: 'AC Gas Top-up', category: 'technician', op: 1800, dp: 1499, tag: '16.72% OFF', desc: 'Refilling refrigerant gas to optimal levels.', img: '/services/ac_gas_filling.png' },
  { title: 'AC Gas Refill', category: 'technician', op: 3500, dp: 2799, tag: '20.03% OFF', desc: 'Complete evacuation and refilling of refrigerant gas.', img: '/services/ac_gas_filling.png' },
  { title: 'Split AC Installation', category: 'technician', op: 1800, dp: 1409, tag: '21.72% OFF', desc: 'Expert mounting and connection of split AC units.', img: '/services/ac_installation_split.png' },
  { title: 'Window AC Installation', category: 'technician', op: 1500, dp: 1299, tag: '13.40% OFF', desc: 'Professional installation of window AC units.', img: '/services/ac_installation_window.png' },
  { title: 'Split AC Uninstallation', category: 'technician', op: 800, dp: 559, tag: '30.13% OFF', desc: 'Safe removal and packing of split AC units.', img: '/services/ac_installation_split.png' },
  { title: 'Window AC Uninstallation', category: 'technician', op: 800, dp: 559, tag: '30.13% OFF', desc: 'Safe removal of window AC units.', img: '/services/ac_uninstallation_window.png' },
  { title: 'AC Re-installation', category: 'technician', op: 3000, dp: 1869, tag: '37.70% OFF', desc: 'Relocation and re-setup of your existing AC unit.', img: '/services/ac_installation_split.png' },
  { title: 'AC Outdoor Unit Re-Installation', category: 'technician', op: 2500, dp: 1449, tag: '42.04% OFF', desc: 'Specific re-installation of the AC condenser unit.', img: '/services/ac_installation_split.png' },
];

async function updateACServices() {
  try {
    // Delete existing AC services
    const deleteRes = await pool.query(
      "DELETE FROM services WHERE category = 'technician' AND (title ILIKE '%AC%' OR title ILIKE '%Air Cond%')"
    );
    console.log(`Deleted ${deleteRes.rowCount} old AC services.`);

    for (const s of acServices) {
      await pool.query(
        'INSERT INTO services (title, category, original_price, discount_price, discount_tag, description, image) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [s.title, s.category, s.op, s.dp, s.tag, s.desc, s.img]
      );
      console.log(`Inserted: ${s.title}`);
    }
    console.log('AC services updated successfully!');
  } catch (err) {
    console.error('Error updating AC services:', err);
  } finally {
    await pool.end();
  }
}

updateACServices();
