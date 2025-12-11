import fetch from 'node-fetch';

const WHYSMS_BASE_URL = 'https://bulk.whysms.com/api/v3';
const WHYSMS_TOKEN = process.env.WHYSMS_API_TOKEN!;

export interface WhySMSResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

export async function sendWhySMS(to: string, body: string): Promise<WhySMSResponse> {
  const payload = {
    to,
    text: body,
    // add other required fields: sender_id, lang, etc. when you paste full API spec
  };

  const res = await fetch(`${WHYSMS_BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHYSMS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return { success: false, message: `HTTP ${res.status}` };
  }

  const json = (await res.json()) as any;
  // Adjust success detection when we have exact response shape
  const success = json?.success === true || json?.status === 'success';
  return {
    success,
    message: json?.message ?? undefined,
    data: json,
  };
}
