import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { hwid } = req.query;

    if (!hwid) {
        return res.status(400).json({ error: 'HWID не указан' });
    }

    try {
        const isBanned = await redis.get(`ban:${hwid}`);
        return res.status(200).json({ banned: !!isBanned });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
