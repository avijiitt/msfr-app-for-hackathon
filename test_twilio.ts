import dotenv from 'dotenv';
dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

async function checkTwilio() {
  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}.json`, {
      headers: { Authorization: `Basic ${auth}` }
    });
    const data = await res.json();
    console.log("Account status:", data.status, data.type);
    
    // Check verified caller IDs
    const outgoingRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/OutgoingCallerIds.json`, {
      headers: { Authorization: `Basic ${auth}` }
    });
    const outgoingData = await outgoingRes.json();
    console.log("Verified Caller IDs:");
    outgoingData.outgoing_caller_ids?.forEach((id: any) => console.log(id.phone_number));
  } catch (e) {
    console.error(e);
  }
}

checkTwilio();
