import axios from 'axios';

export default async function handler(req, res) {
    const { handle } = req.query;
    if (!handle) return res.status(400).json({ error: 'Handle required' });

    const BEARER_TOKEN = process.env.BEARER_TOKEN;
    if (!BEARER_TOKEN) return res.status(500).json({ error: 'Token not set' });

    try {
        const now = new Date();
        const yesterday = new Date(now - 24 * 60 * 60 * 1000).toISOString();
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

        const [resp24, resp7d] = await Promise.all([
            axios.get('https://api.twitter.com/2/tweets/search/recent', {
                params: { query: `from:${handle} since:${yesterday.slice(0,10)}`, max_results: 100 },
                headers: { Authorization: `Bearer ${BEARER_TOKEN}` }
            }),
            axios.get('https://api.twitter.com/2/tweets/search/recent', {
                params: { query: `from:${handle} since:${weekAgo.slice(0,10)}`, max_results: 100 },
                headers: { Authorization: `Bearer ${BEARER_TOKEN}` }
            })
        ]);

        const count24 = resp24.data.meta.result_count || 0;
        const count7d = resp7d.data.meta.result_count || 0;

        const mindshare24 = (count24 / 1000).toFixed(6);
        const mindshare7d = (count7d / 7000).toFixed(6);

        res.status(200).json({
            '24h': { mindshare: mindshare24, change: '0%' },
            '7d': { mindshare: mindshare7d, change: '0%' }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
}
