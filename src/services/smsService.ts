/**
 * Musafir Real-Time SMS OTP Delivery Service (Twilio SMS Gateway Integration)
 */

export interface SendOtpResult {
  success: boolean;
  otp: string;
  realSmsSent: boolean;
  provider: string;
  message: string;
}

const TWILIO_ACCOUNT_SID =
  (import.meta as any).env?.VITE_TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN =
  (import.meta as any).env?.VITE_TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE_NUMBER =
  (import.meta as any).env?.VITE_TWILIO_PHONE_NUMBER || '';

/**
 * Sends a real SMS OTP directly via Twilio SMS Gateway REST API.
 */
export async function sendTwilioSMSOTP(userPhoneNumber: string, otpCode: string): Promise<boolean> {
  const cleanPhone = userPhoneNumber.replace(/\D/g, '').slice(-10);
  const toNumber = '+91' + cleanPhone;

  try {
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    const bodyParams = new URLSearchParams();
    bodyParams.append('To', toNumber);
    bodyParams.append('From', TWILIO_PHONE_NUMBER);
    bodyParams.append(
      'Body',
      `Your Musafir verification code is: ${otpCode}. Valid for 5 minutes. Do not share this code.`
    );

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
      }
    );

    const data = await response.json();

    if (response.ok && (data.sid || data.status === 'queued' || data.status === 'sent')) {
      console.log(`✅ [Twilio Direct] Real SMS OTP ${otpCode} delivered to ${toNumber} via Twilio! SID: ${data.sid}`);
      return true;
    } else {
      console.warn('Twilio Gateway delivery notice:', data.message || data);
      return false;
    }
  } catch (error) {
    console.error('Network error sending Twilio SMS:', error);
    return false;
  }
}

/**
 * High-level OTP Dispatcher:
 * 1. Tries local backend endpoint (http://localhost:5000/api/auth/send-sms-otp) with Twilio integration
 * 2. Falls back to direct client-side Twilio REST call with high reliability
 */
export async function dispatchMobileOTP(phoneNumber: string): Promise<SendOtpResult> {
  const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10);
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

  // Try backend first (for database logging in otp_logs.json)
  try {
    const res = await fetch('http://localhost:5000/api/auth/send-sms-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        otp: data.otp || generatedOtp,
        realSmsSent: Boolean(data.realSmsSent),
        provider: data.smsProvider || 'Twilio SMS Gateway',
        message: data.message || `OTP dispatched to +91 ${cleanPhone}`,
      };
    }
  } catch (backendErr) {
    console.log('Backend API not responding, using direct Twilio integration:', backendErr);
  }

  // Direct Twilio Client Call
  const smsSent = await sendTwilioSMSOTP(cleanPhone, generatedOtp);

  return {
    success: true,
    otp: generatedOtp,
    realSmsSent: smsSent,
    provider: smsSent ? 'Twilio SMS Gateway (Live)' : 'Twilio SMS Channel',
    message: smsSent
      ? `Real SMS dispatched to +91 ${cleanPhone} via Twilio.`
      : `OTP generated for +91 ${cleanPhone}: ${generatedOtp}`,
  };
}
