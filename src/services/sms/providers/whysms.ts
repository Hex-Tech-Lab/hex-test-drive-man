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

    // Enhanced logging for debugging
    console.log(`[WhySMS] === SMS SEND REQUEST ===`);
    console.log(`[WhySMS] Timestamp: ${new Date().toISOString()}`);
    console.log(`[WhySMS] Recipient: ${formattedPhone}`);
    console.log(`[WhySMS] Payload:`, JSON.stringify(payload, null, 2));
    console.log(`[WhySMS] Token configured: ${WHYSMS_TOKEN ? 'YES' : 'NO'}`);
    console.log(`[WhySMS] Token length: ${WHYSMS_TOKEN?.length || 0}`);

    const res = await fetch(`${WHYSMS_BASE_URL}/sms/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHYSMS_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data: WhySmsResponse = await res.json();
    const apiLatency = Date.now() - startTime;

    console.log(`[WhySMS] === SMS SEND RESPONSE ===`);
    console.log(`[WhySMS] Latency: ${apiLatency}ms`);
    console.log(`[WhySMS] HTTP Status: ${res.status}`);
    console.log(`[WhySMS] Response Body:`, JSON.stringify(data, null, 2));

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
    console.error(`[WhySMS] === SMS SEND ERROR ===`);
    console.error(`[WhySMS] Latency: ${apiLatency}ms`);
    console.error(`[WhySMS] Error Type: ${error instanceof Error ? error.constructor.name : typeof error}`);
    console.error(`[WhySMS] Error Message:`, error instanceof Error ? error.message : String(error));
    console.error(`[WhySMS] Error Stack:`, error instanceof Error ? error.stack : 'N/A');
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
