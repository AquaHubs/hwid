import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const ADMIN_KEY = process.env.ADMIN_KEY || "SUPER_SECRET_KEY";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  const { hwid, adminKey } = req.body;

  if (adminKey !== ADMIN_KEY) {
    return res.status(403).json({ error: 'Неверный админ-ключ' });
  }

  if (!hwid) {
    return res.status(400).json({ error: 'HWID не указан' });
  }

  try {
    await redis.sadd('banned_hwids', hwid);
    return res.status(200).json({ success: true, message: `HWID ${hwid} заблокирован` });
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
}
