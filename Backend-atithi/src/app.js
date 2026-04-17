// Restart trigger
const express = require("express");
const cors    = require("cors");
const app     = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
// In production set ALLOWED_ORIGINS in your hosting env vars to your real domain
// e.g. ALLOWED_ORIGINS=https://dhoond.co,https://www.dhoond.co
const rawOrigins  = process.env.ALLOWED_ORIGINS || '';
const allowedList = rawOrigins
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);

    // Always allow any Vercel deployment (covers preview + production URLs)
    if (origin.endsWith('.vercel.app')) return callback(null, true);

    // Allow explicit origins from ALLOWED_ORIGINS env var
    if (allowedList.length > 0 && allowedList.includes(origin)) return callback(null, true);

    // In development (no ALLOWED_ORIGINS set) allow localhost variants
    if (allowedList.length === 0) {
      const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      return callback(null, isLocal);
    }

    callback(new Error(`CORS: origin '${origin}' is not allowed`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
const userRoutes    = require("./routes/user.route");
const partnerRoutes = require("./routes/partner.route");
const orderRoutes   = require("./routes/order.route");
const paymentRoutes = require("./routes/payment.route");
const serviceRoutes = require('./routes/service.route');
const authRoutes    = require('./routes/auth.route');
const adminRoutes   = require('./routes/admin.route');

app.use("/api/V1/users",    userRoutes);
app.use("/api/user",        userRoutes);
app.use("/api/V1/partners", partnerRoutes);
app.use("/api/V1/orders",   orderRoutes);
app.use("/api/V1/payments", paymentRoutes);
app.use('/api/V1/services', serviceRoutes);
app.use('/api/V1/auth',     authRoutes);

// Admin + helper aliases
app.use('/api/admin',          adminRoutes);
app.use('/api/admin/services', serviceRoutes);
app.use('/api/admin/partners', partnerRoutes);
app.use('/api/services',       serviceRoutes);
app.use('/api/auth',           authRoutes);

module.exports = app;
