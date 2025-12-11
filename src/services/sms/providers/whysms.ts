import fetch from 'node-fetch';

const WHYSMS_BASE_URL = 'https://bulk.whysms.com/api/v3';
const WHYSMS_TOKEN = process.env.WHYSMS_API_TOKEN!;
const WHYSMS_SENDER_ID = process.env.WHYSMS_SENDER_ID || 'HexTestDrv';

export interface WhySMSResponse {
  success: boolean;
  status?: string;
  message?: string;
  data?: unknown;
}

export async function sendWhySMS(recipient: string, message: string): Promise<WhySMSResponse> {
  const payload = {
    recipient,            // single or comma-separated numbers
    sender_id: WHYSMS_SENDER_ID,
    type: 'plain',        // per docs: plain for text SMS
    message,
  };

  const res = await fetch(`${WHYSMS_BASE_URL}/sms/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHYSMS_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    return {
      success: false,
      status: `http_${res.status}`,
      message: 'Non-JSON response from WhySMS API',
    };
  }

  const status = json?.status as string | undefined;
  const isSuccess = res.ok && status === 'success';

  return {
    success: isSuccess,
    status,
    message: json?.message ?? undefined,
    data: json?.data,
  };
}
