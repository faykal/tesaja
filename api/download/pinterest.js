const axios = require("axios")

async function pinterestDownloader(url) {
  try {
    const { data } = await axios.get(
      `https://www.savepin.app/download.php?url=${encodeURIComponent(url)}&lang=en&type=redirect`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Referer': 'https://www.savepin.app/'
        }
      }
    )

    const $ = cheerio.load(data)
    const results = []

    const table = $('table').has('tr:contains("Quality"), tr:contains("480p")').first()

    table.find('tr').each((_, el) => {
      const quality = $(el).find('.video-quality').text().trim()
      const format = $(el).find('td:nth-child(2)').text().trim()
      const link = $(el).find('a').attr('href')
      if (quality && link) {
        results.push({
          quality,
          format,
          media: link.startsWith('http') ? link : 'https://www.savepin.app' + (link.startsWith('/') ? link : '/' + link)
        })
      }
    })

    return results.length
      ? { status: true, result: results }
      : { status: false, message: 'Tidak ada media yang bisa diunduh.' }

  } catch (error) {
    return { status: false, message: error.message }
  }
}

module.exports = {
    name: 'Pinterest',
    desc: 'Download video/image on pinterest',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        try {
            const { url } = req.query;
            if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
            const fay = await pinterestDownloader(url)
            res.status(200).json({
                status: true,
                data: fay
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
