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
            const link = vid.url
            const response = await fetch(`https://ytdlpyton.nvlgroup.my.id/download/audio/?url=${link}&mode=url`)
            const fay = response.download_url
            res.status(200).json({
                status: true,
                data: fay
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
