export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, message } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone required' });
  }

  const tgToken = process.env.TG_BOT_TOKEN;
  const chatIds = [process.env.TG_CHAT_ID, process.env.TG_CHAT_ID_2].filter(Boolean);

  if (!tgToken || chatIds.length === 0) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const text = `📩 Новая заявка с сайта!\n\n👤 Имя: ${name}\n📱 Телефон: ${phone}${message ? `\n💬 Сообщение: ${message}` : ''}`;

  try {
    await Promise.all(chatIds.map(chatId =>
      fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      })
    ));

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(502).json({ error: 'Failed to send message' });
  }
}
