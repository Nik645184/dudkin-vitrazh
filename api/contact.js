export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, message } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone required' });
  }

  const tgToken = process.env.TG_BOT_TOKEN;
  const tgChat = process.env.TG_CHAT_ID;

  if (!tgToken || !tgChat) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const text = `📩 Новая заявка с сайта!\n\n👤 Имя: ${name}\n📱 Телефон: ${phone}${message ? `\n💬 Сообщение: ${message}` : ''}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: tgChat, text, parse_mode: 'HTML' }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(502).json({ error: 'Telegram API error', details: err });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(502).json({ error: 'Failed to send message' });
  }
}
