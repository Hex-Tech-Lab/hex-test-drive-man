const WHYSMS_BASE_URL = 'https://bulk.whysms.com/api/v3';
const WHYSMS_TOKEN = process.env.WHYSMS_API_TOKEN!;

interface WhySmsResponse {
  status: 'success' | 'error';
  data?: any;
  message?: string;
}

export async function sendSms(to: string, message: string): Promise<{ success: boolean; status?: string; message?: string; data?: any }> {
  const startTime = Date.now();

  try {
    // Ensure E.164 format with + prefix (trim whitespace first)
    const cleanPhone = to.trim();
    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;

    const payload = {
      recipient: formattedPhone,
      sender_id: "Order",
      type: "otp",
      message: message,
    };

    console.log(`[WhySMS] DEBUG REQUEST:`, JSON.stringify({ ...payload, message: 'REDACTED' }));

    const res = await fetch(`${WHYSMS_BASE_URL}/sms/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHYSMS_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const rawText = await res.text();
    console.log(`[WhySMS] DEBUG RESPONSE STATUS: ${res.status}`);
    console.log(`[WhySMS] DEBUG RESPONSE BODY: ${rawText}`);

    let data: WhySmsResponse;
    try {
        data = JSON.parse(rawText);
    } catch (e) {
        console.error('[WhySMS] Failed to parse JSON response', e);
        return { success: false, message: 'Invalid JSON response from provider' };
    }

    const apiLatency = Date.now() - startTime;

    console.log(`[WhySMS] Response (${apiLatency}ms):`, JSON.stringify(data));

    if (!res.ok || data.status !== 'success') {
      return {
        success: false,
        status: data.status || 'error',
        message: data.message || `HTTP ${res.status}`,
      };
    }

    return {
      success: true,
      status: data.status,
      data: data.data,
    };
  } catch (error) {
    const apiLatency = Date.now() - startTime;
    console.error(`[WhySMS] Error after ${apiLatency}ms:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
