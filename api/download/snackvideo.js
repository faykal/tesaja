module.exports = {
    name: 'Snackvideo',
    desc: 'Download video on snackvideo',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        
        try {
            const result = await scrape.snackvideo.download(url);
            res.status(200).json({
                status: true,
                result
            });
        } catch (error) {
            res.status(500).json({ status: false, error: 'Sedang Maintance' });
        }
    }
}
