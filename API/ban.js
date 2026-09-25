import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
    // Полное разрешение CORS для любых источников
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Получаем параметры из POST или GET
        let hwid, adminKey;

        if (req.method === 'POST') {
            let body = req.body;
            if (typeof body === 'string') {
                try { body = JSON.parse(body); } catch(e) {}
            }
            hwid = body?.hwid || req.query?.hwid;
            adminKey = body?.adminKey || req.query?.adminKey;
        } else {
            hwid = req.query?.hwid;
            adminKey = req.query?.adminKey;
        }

        if (adminKey !== process.env.ADMIN_KEY) {
            return res.status(403).json({ error: 'Неверный Admin Key' });
        }

        if (!hwid) {
            return res.status(400).json({ error: 'HWID не указан' });
        }

        await redis.set(`ban:${hwid}`, true);

        return res.status(200).json({ success: true, message: `HWID ${hwid} забанен` });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
