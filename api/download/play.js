const yts = require('yt-search');
const fetch = require('node-fetch')

module.exports = {
    name: 'YouTube Play',
    desc: 'Play song on youtube',
    category: 'Downloader',
    params: ['q'],
    async run(req, res) {
        const { q } = req.query;
        if (!q) return res.status(400).json({ status: false, error: 'Url is required' });
        try {
            const lagu = await yts(q)
            const vid = lagu.videos[0]
            res.status(200).json({
                status: true,
                data: vid
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
