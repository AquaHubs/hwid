import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
    // Разрешаем запросы с любых сайтов (CORS)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        let body = req.body;
        if (typeof body === 'string') {
            body = JSON.parse(body);
        }

        const { hwid, adminKey } = body || {};

        if (adminKey !== process.env.ADMIN_KEY) {
            return res.status(403).json({ error: 'Неверный Admin Key' });
        }

        if (!hwid) {
            return res.status(400).json({ error: 'HWID не указан' });
        }

        await redis.set(`ban:${hwid}`, true);

        return res.status(200).json({ success: true, message: `HWID ${hwid} успешно забанен` });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
