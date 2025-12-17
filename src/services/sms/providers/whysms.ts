const WHYSMS_BASE_URL = 'https://bulk.whysms.com/api/v3';
const WHYSMS_TOKEN = process.env.WHYSMS_API_TOKEN!;

export async function sendSms(to: string, message: string): Promise<boolean> {
  try {
    // WhySMS expects EXACT parameter names (capitalized with spaces)
    const payload = {
      "To": to,                    // Capitalized
      "Message": message,           // Capitalized
      "Sender ID": "ORDER"         // With space! Value from your account
    };

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
    console.log('WhySMS API response:', JSON.stringify(data));
    
    if (!res.ok) {
      console.error('WhySMS API error:', res.status, data);
      return false;
    }

    return true;
  } catch (error) {
    console.error('WhySMS send error:', error);
    return false;
  }
}
