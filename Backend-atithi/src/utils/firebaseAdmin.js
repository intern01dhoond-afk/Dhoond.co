const admin = require('firebase-admin');

// Service Account can be passed via environment variables for security
// Ensure FIREBASE_PRIVATE_KEY handles newlines correctly: .replace(/\\n/g, '\n')
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    };

if (serviceAccount.projectId) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('[Firebase Admin] Initialized for project:', serviceAccount.projectId);
} else {
  console.warn('[Firebase Admin] Missing credentials! Custom tokens will not work.');
}

const generateCustomToken = async (uid, additionalClaims = {}) => {
  try {
    return await admin.auth().createCustomToken(uid, additionalClaims);
  } catch (error) {
    console.error('[Firebase Admin] Error creating custom token:', error.message);
    throw error;
  }
};

module.exports = { admin, generateCustomToken };
