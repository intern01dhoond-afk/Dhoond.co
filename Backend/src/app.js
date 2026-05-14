// Restart trigger for live payments
const express = require("express");
const cors = require("cors");
const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
// In production set ALLOWED_ORIGINS in your hosting env vars to your real domain
// e.g. ALLOWED_ORIGINS=https://dhoond.co,https://www.dhoond.co
const rawOrigins = process.env.ALLOWED_ORIGINS || '';
const allowedList = rawOrigins
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);

    // Always allow any dhoond.co or Vercel deployment, and allow null origin (local files)
    if (!origin || origin === 'null' || origin.endsWith('.dhoond.co') || origin.endsWith('.vercel.app') || origin === 'https://dhoond.co') return callback(null, true);

    // Allow explicit origins from ALLOWED_ORIGINS env var
    if (allowedList.length > 0 && allowedList.includes(origin)) return callback(null, true);

    // In development (no ALLOWED_ORIGINS set) allow localhost variants or any origin for local testing
    if (allowedList.length === 0) {
      return callback(null, true);
    }

    callback(new Error(`CORS: origin '${origin}' is not allowed`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[Backend] ${req.method} ${req.url}`);
  next();
});

// ─── Routes ──────────────────────────────────────────────────────────────────
const userRoutes = require("./routes/user.route");
const partnerRoutes = require("./routes/partner.route");
const orderRoutes = require("./routes/order.route");
const paymentRoutes = require("./routes/payment.route");
const serviceRoutes = require('./routes/service.route');
const authRoutes = require('./routes/auth.route');
const adminRoutes = require('./routes/admin.route');

app.use("/api/V1/users", userRoutes);
app.use("/api/user", userRoutes);
app.use("/api/V1/partners", partnerRoutes);
app.use("/api/V1/orders", orderRoutes);
app.use("/api/V1/payments", paymentRoutes);
app.use('/api/V1/services', serviceRoutes);
app.use('/api/V1/auth', authRoutes);

// Admin + helper aliases
app.use('/api/admin', adminRoutes);
app.use('/api/admin/services', serviceRoutes);
app.use('/api/admin/partners', partnerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/auth', authRoutes);

// ─── IP Location Proxy (for Meta browser fallback) ──────────────────────────
app.get('/api/ip-location', async (req, res) => {
  try {
    // Extract real client IP from proxy headers
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.headers['x-real-ip']
      || req.socket?.remoteAddress
      || '';

    const cleanIP = clientIP.replace('::ffff:', ''); // Strip IPv6-mapped prefix
    const apiUrl = cleanIP && cleanIP !== '127.0.0.1' && cleanIP !== '::1'
      ? `http://ip-api.com/json/${cleanIP}?fields=city,regionName,lat,lon,status`
      : `http://ip-api.com/json/?fields=city,regionName,lat,lon,status`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === 'success') {
      res.json({
        city: data.city,
        region: data.regionName,
        latitude: data.lat,
        longitude: data.lon
      });
    } else {
      res.status(404).json({ error: 'Could not determine location' });
    }
  } catch (err) {
    console.error('[IP Location] Error:', err.message);
    res.status(500).json({ error: 'IP location failed' });
  }
});

module.exports = app;
