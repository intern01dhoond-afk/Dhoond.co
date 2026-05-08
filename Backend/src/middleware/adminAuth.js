const pool = require('../db/db.js');

/**
 * Admin authentication middleware.
 * Verifies that the requesting user exists and has role = 'admin'.
 * 
 * NOTE: This currently uses x-user-id header. Migrate to JWT for production.
 * When you add JWT: extract userId from verified token instead of the header.
 */
const adminAuth = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: no user ID provided' });
    }

    // Bypass for Super Admin AMEC01
    if (userId && userId.toUpperCase() === 'AMEC01') {
      req.adminUser = { id: 'AMEC01', role: 'admin', name: 'Super Admin' };
      return next();
    }

    const result = await pool.query(
      'SELECT id, role FROM users WHERE id = $1',
      [userId]
    );

    if (!result.rows[0]) {
      return res.status(401).json({ error: 'Unauthorized: user not found' });
    }

    if (result.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: admin access required' });
    }

    // Attach verified user to request for downstream use
    req.adminUser = result.rows[0];
    next();
  } catch (err) {
    console.error('[AdminAuth] Error:', err.message);
    res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports = adminAuth;
