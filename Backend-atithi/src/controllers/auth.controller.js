const authModel = require("../models/auth.model");
const { generateCustomToken } = require("../utils/firebaseAdmin");

const sendOtpController = async (req, res) => {
  const digits = String(req.body.phone || '').replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return res.status(400).json({ error: 'Valid 10-digit mobile required.' });
  
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore.set(digits, { otp, expiry: Date.now() + 10*60*1000, attempts: 0 });
  
  // [SECURITY] OTP is NOT logged to prevent exposure in server logs

  // Real BulkSMS Integration (yourbulksms.com)
  const { BULKSMS_AUTH_KEY, BULKSMS_SENDER, BULKSMS_ROUTE, BULKSMS_DLT_TE_ID } = process.env;
  
  if (BULKSMS_AUTH_KEY) {
    try {
      // DLT Approved Template Match
      const message = `${otp} is your One Time Password (OTP) for login/signup at DHOOND. This OTP will only be valid for 10 minutes. Do not share with anyone`;
      
      // Prepending '91' for Indian mobile numbers
      const mobileWithPrefix = `91${digits}`;
      
      // Verified Endpoint using the user's provided control subdomain
      const url = `http://control.yourbulksms.com/api/sendhttp.php?authkey=${BULKSMS_AUTH_KEY}&mobiles=${mobileWithPrefix}&message=${encodeURIComponent(message)}&sender=${BULKSMS_SENDER}&route=${BULKSMS_ROUTE || 2}&country=0&DLT_TE_ID=${BULKSMS_DLT_TE_ID}`;
      
      const response = await fetch(url);
      const result = await response.text();
      console.log(`[BulkSMS] Sent to ${mobileWithPrefix} — HTTP ${response.status}`);
    } catch (error) {
      console.error('[BulkSMS Error]', error.message);
    }
  } else {
    console.log(`[OTP Dev] OTP dispatched to ${digits} (mock — no BulkSMS key)`);
  }
  
  res.json({ success: true, message: `OTP sent to +91 ${digits}` });
};

const verifyOtpController = async (req, res) => {
  const { phone, otp, name } = req.body;
  const digits = String(phone || '').replace(/\D/g, '').slice(-10);
  
  // Use database to verify
  const isMatch = await authModel.verifyAndDeleteOtp(digits, otp);

  if (!isMatch) {
    return res.status(400).json({ error: "Incorrect or expired OTP." });
  }
  
  try {
    const user = await authModel.upsertUser(digits, name);
    
    // Generate Firebase Custom Token using the user's phone/id as UID
    let firebaseToken = null;
    try {
      firebaseToken = await generateCustomToken(`user_${user.id}`, { 
        mobile: user.phone,
        role: user.role 
      });
    } catch (e) {
      console.warn('[Auth] Firebase token generation skipped (likely missing config).');
    }

    res.json({ 
      success: true, 
      user: { id: user.id, name: user.name, mobile: user.phone, role: user.role },
      token: firebaseToken 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { sendOtpController, verifyOtpController };
