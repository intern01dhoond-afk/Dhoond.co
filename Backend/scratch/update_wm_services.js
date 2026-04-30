require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const wmServices = [
  { 
    title: 'Washing Machine Inspection (All Types)', 
    category: 'technician', op: 500, dp: 349, tag: '30.20% OFF', 
    desc: 'Comprehensive check-up of semi-automatic and fully-automatic (top/front load) machines.', 
    img: '/services/washing_machine_inspection_semi_automatic_.png' 
  },
  { 
    title: "Washing Machine Installation 'Semi-automatic'", 
    category: 'technician', op: 750, dp: 449, tag: '40.13% OFF', 
    desc: 'Professional setup and connection for semi-automatic washing machines.', 
    img: '/services/semi_automatic_washing_machine_install_uninstall.png' 
  },
  { 
    title: "Washing Machine Installation 'Fully-automatic top load'", 
    category: 'technician', op: 850, dp: 499, tag: '41.29% OFF', 
    desc: 'Expert installation of fully-automatic top loading washing machines.', 
    img: '/services/washing_machine_install_uninstall_fully_automatic.png' 
  },
  { 
    title: "Washing Machine Installation 'Fully-automatic front load'", 
    category: 'technician', op: 950, dp: 549, tag: '42.21% OFF', 
    desc: 'Expert installation of fully-automatic front loading washing machines.', 
    img: '/services/washing_machine_install_uninstall_fully_automatic.png' 
  },
  { 
    title: 'Washing Machine Uninstallation', 
    category: 'technician', op: 600, dp: 349, tag: '41.83% OFF', 
    desc: 'Safe uninstallation for semi-automatic, top load, and front load machines.', 
    img: '/services/washing_machine_uninstall_semi_automatic_front_.png' 
  },
];

async function updateWMServices() {
  try {
    // Delete existing Washing Machine services
    const deleteRes = await pool.query(
      "DELETE FROM services WHERE category = 'technician' AND title ILIKE '%Washing Machine%'"
    );
    console.log(`Deleted ${deleteRes.rowCount} old Washing Machine services.`);

    for (const s of wmServices) {
      await pool.query(
        'INSERT INTO services (title, category, original_price, discount_price, discount_tag, description, image) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [s.title, s.category, s.op, s.dp, s.tag, s.desc, s.img]
      );
      console.log(`Inserted: ${s.title}`);
    }
    console.log('Washing Machine services updated successfully!');
  } catch (err) {
    console.error('Error updating WM services:', err);
  } finally {
    await pool.end();
  }
}

updateWMServices();
