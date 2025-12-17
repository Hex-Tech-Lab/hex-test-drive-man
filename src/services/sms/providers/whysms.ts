const WHYSMS_BASE_URL = 'https://bulk.whysms.com/api/v3';
const WHYSMS_TOKEN = process.env.WHYSMS_API_TOKEN!;

export async function sendSms(to: string, message: string): Promise<boolean> {
  const startTime = Date.now();
  
  try {
    const payload = {
      recipient: to,
      sender_id: "ORDER",
      message: message,
    };

    console.log(`[WhySMS] Sending to ${to} at ${new Date().toISOString()}`);

    const res = await fetch(`${WHYSMS_BASE_URL}/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${WHYSMS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    const apiLatency = Date.now() - startTime;

    console.log(`[WhySMS] Response (${apiLatency}ms):`, JSON.stringify(data));
    
    if (!res.ok) {
      console.error('[WhySMS] Failed:', res.status, data);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`[WhySMS] Error:`, error);
    return false;
  }
}
