import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  const { hwid } = req.query;

  if (!hwid) {
    return res.status(400).json({ error: 'HWID не указан' });
  }

  try {
    const isBanned = await redis.sismember('banned_hwids', hwid);
    return res.status(200).json({ banned: isBanned === 1 });
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
}
