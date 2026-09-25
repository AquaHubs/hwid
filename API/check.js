import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
    // Разрешаем CORS-запросы из браузера
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { hwid, adminKey } = body || {};

        if (adminKey !== process.env.ADMIN_KEY) {
            return res.status(403).json({ error: 'Invalid admin key' });
        }

        if (!hwid) {
            return res.status(400).json({ error: 'HWID is required' });
        }

        // Записываем забаненный HWID в Redis
        await redis.set(`ban:${hwid}`, true);

        return res.status(200).json({ success: true, message: `HWID ${hwid} banned successfully` });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
