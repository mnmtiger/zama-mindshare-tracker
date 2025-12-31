import axios from 'axios';

export default async function handler(req, res) {
    const { handle } = req.query;
    if (!handle) return res.status(400).json({ error: 'No handle' });

    const BEARER_TOKEN = AAAAAAAAAAAAAAAAAAAAAMia6gEAAAAAZeH1%2FjyWYfqrx%2BUNrQ6RtACNkKI%3DWGXr79cKVlUfYP0v6cUfSikXr1w3hAFzpLHxYUL59Jtw62tzjG

    try {
        const now = new Date().toISOString();
        const yesterday = new Date(Date.now() - 86400000).toISOString();
        const weekAgo = new Date(Date.now() - 604800000).toISOString();

        const [resp24, resp7d] = await Promise.all([
            axios.get('https://api.twitter.com/2/tweets/search/recent', {
                params: { query: `from:${handle} since:${yesterday}`, max_results: 100 },
                headers: { Authorization: `Bearer ${BEARER_TOKEN}` }
            }),
            axios.get('https://api.twitter.com/2/tweets/search/recent', {
                params: { query: `from:${handle} since:${weekAgo}`, max_results: 100 },
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
        res.status(500).json({ error: 'API error' });
    }
}

export const config = { api: { bodyParser: false } };
