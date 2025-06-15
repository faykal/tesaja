const fetch = require("node-fetch")

async function getWeatherInfo(location) {
    try {
        let res = await fetch(API('https://api.openweathermap.org', '/data/2.5/weather', {
                q: location,
                units: 'metric',
                appid: '060a6bcfa19809c2cd4d97a212b19273'
            }))

        if (!res) {
            console.log('Data cuaca tidak tersedia');
            return;
        }
    
    } catch (error) {
        console.error('[❗] Terjadi kesalahan saat mengambil data cuaca:', error);
    }
}
module.exports = {
    name: 'Cuaca',
    desc: 'Search info cuaca',
    category: 'Search',
    params: ['q'],
    async run(req, res) {
        try {
            const { q } = req.query;
            if (!q) return res.status(400).json({ status: false, error: 'Query is required' });
            const fay = await getWeatherInfo(q)
            res.status(200).json({
                status: true,
                data: fay
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
