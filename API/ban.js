import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const { hwid } = req.query;

    if (!hwid) {
        return res.status(400).json({ error: 'HWID is required' });
    }

    try {
        const isBanned = await redis.get(`ban:${hwid}`);
        return res.status(200).json({ banned: !!isBanned });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
