require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function test() {
  const { BULKSMS_AUTH_KEY, BULKSMS_SENDER, BULKSMS_ROUTE, BULKSMS_DLT_TE_ID } = process.env;
  const digits = '7204948579'; 
  const otp = '9999';
  const message = `${otp} is your One Time Password (OTP) for login/signup at DHOOND. This OTP will only be valid for 10 minutes. Do not share with anyone`;
  
  // Notice NO UNDERSCORE in sendhttp.php
  const url = `http://www.yourbulksms.com/api/sendhttp.php?authkey=${BULKSMS_AUTH_KEY}&mobiles=91${digits}&message=${encodeURIComponent(message)}&sender=${BULKSMS_SENDER}&route=${BULKSMS_ROUTE || 2}&unicode=0&DLT_TE_ID=${BULKSMS_DLT_TE_ID}`;
  
  console.log(`\nTesting: ${url}`);
  try {
    const resp = await fetch(url);
    console.log(`Status: ${resp.status} ${resp.statusText}`);
    const text = await resp.text();
    console.log(`Response: ${text.substring(0, 500)}`);
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

test();
