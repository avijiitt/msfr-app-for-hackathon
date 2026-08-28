/**
 * Musafir Real-Time Indian SMS OTP Delivery Service (Fast2SMS API Integration)
 */

export interface SendOtpResult {
  success: boolean;
  otp: string;
  realSmsSent: boolean;
  provider: string;
  message: string;
}

const FAST2SMS_API_KEY =
  (import.meta as any).env?.VITE_FAST2SMS_API_KEY ||
  'd8DXNCKBsuvb5TU6GHoLFE049hnVzrZpYgiIyS2RqjMAtlJw3Or5w1y8kGZNatABz0vSjQY2HDeKImRl';

/**
 * Sends a real SMS OTP directly via Fast2SMS Indian SMS Gateway API.
 */
export async function sendFast2SMSOTP(userPhoneNumber: string, otpCode: string): Promise<boolean> {
  const cleanPhone = userPhoneNumber.replace(/\D/g, '').slice(-10);

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: FAST2SMS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        variables_values: otpCode, // 6-digit OTP code
        route: 'otp',              // Fast2SMS OTP high-priority delivery route
        numbers: cleanPhone,       // 10-digit Indian mobile number
      }),
    });

    const data = await response.json();

    if (data.return === true || data.status_code === 200 || data.message?.includes?.('SMS sent')) {
      console.log(`✅ [Fast2SMS Direct] Real SMS OTP ${otpCode} delivered to +91 ${cleanPhone}!`);
      return true;
    } else {
      console.warn('Fast2SMS Gateway response notice:', data.message);
      // Fallback try with Quick Route if OTP route returned message
      try {
        const qRes = await fetch(
          `https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_API_KEY}&route=q&message=Your MSFR verification OTP is ${otpCode}. Valid for 5 minutes.&language=english&flash=0&numbers=${cleanPhone}`
        );
        const qData = await qRes.json();
        return qData.return === true || qData.status_code === 200;
      } catch {
        return false;
      }
    }
  } catch (error) {
    console.error('Network error sending Fast2SMS:', error);
    return false;
  }
}

/**
 * High-level OTP Dispatcher:
 * 1. Tries local backend endpoint (http://localhost:5000/api/auth/send-sms-otp) which also logs into database
 * 2. Falls back to direct client-side Fast2SMS call with high reliability
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
        provider: data.smsProvider || 'Fast2SMS Gateway',
        message: data.message || `OTP dispatched to +91 ${cleanPhone}`,
      };
    }
  } catch (backendErr) {
    console.log('Backend API not responding, using direct Fast2SMS integration:', backendErr);
  }

  // Direct Fast2SMS Client Fallback
  const smsSent = await sendFast2SMSOTP(cleanPhone, generatedOtp);

  return {
    success: true,
    otp: generatedOtp,
    realSmsSent: smsSent,
    provider: smsSent ? 'Fast2SMS Indian Gateway (Live)' : 'Fast2SMS Simulation Channel',
    message: smsSent
      ? `Real SMS dispatched to +91 ${cleanPhone} via Fast2SMS.`
      : `OTP generated for +91 ${cleanPhone}: ${generatedOtp}`,
  };
}
