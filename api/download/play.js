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
            const res = await yts(q)
            const vid = res.videos[0]
            const response = await fetch(`https://ytdlpyton.nvlgroup.my.id/download/audio/?url=${vid.url}&mode=url`)
            const fay = response.data
            res.status(200).json({
                status: true,
                data: fay
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
