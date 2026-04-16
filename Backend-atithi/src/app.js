const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
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

// Helper endpoints to accommodate the frontend admin dashboard requests
app.use('/api/admin', adminRoutes);
app.use('/api/admin/services', serviceRoutes);
app.use('/api/admin/partners', partnerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/auth', authRoutes); 

module.exports = app;
