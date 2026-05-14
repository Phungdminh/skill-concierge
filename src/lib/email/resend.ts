import 'server-only';

function getResendApiKey() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');
  return apiKey;
}

function getFromEmail() {
  const from = process.env.ADMIN_MFA_FROM_EMAIL;
  if (!from) throw new Error('Missing ADMIN_MFA_FROM_EMAIL');
  return from;
}

export async function sendAdminLoginCodeEmail({
  to,
  code,
}: {
  to: string;
  code: string;
}) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getResendApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: getFromEmail(),
      to,
      subject: 'Mã xác nhận đăng nhập admin SkillForge VN',
      text: `Mã xác nhận đăng nhập admin của bạn là: ${code}\n\nMã này hết hạn sau 10 phút. Nếu bạn không đăng nhập, hãy bỏ qua email này.`,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Không gửi được email xác nhận.');
  }
}
