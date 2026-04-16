require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function test() {
  const { BULKSMS_AUTH_KEY, BULKSMS_SENDER, BULKSMS_ROUTE, BULKSMS_DLT_TE_ID } = process.env;
  const digits = '7204948579'; 
  const otp = '9999';
  
  // Trying Fast2SMS endpoint as a guess based on the key format
  const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${BULKSMS_AUTH_KEY}&route=otp&variables_values=${otp}&numbers=${digits}`;
  
  console.log(`\nTesting Fast2SMS Endpoint: ${url}`);
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
