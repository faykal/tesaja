const axios = require("axios")
const FormData = require("form-data")
 
async function ytdl(url, reqFormat = 'best') {
  try {
    const form = new FormData()
    form.append('url', url)
 
    const headers = {
      ...form.getHeaders(),
      origin: 'https://www.videodowns.com',
      referer: 'https://www.videodowns.com/youtube.php',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
    }
 
    const { data } = await axios.post(
      'https://www.videodowns.com/youtube.php?action=get_info',
      form,
      { headers }
    )
 
    if (!data.success || !data.formats)
      throw '❌ Gagal mengambil data video.'
 
    const formats = data.formats
    const formatMap = {
      best: 'best',
      '720p': 'medium',
      '480p': 'low',
      mp3: 'audio'
    }
 
    const selectedKey = formatMap[reqFormat.toLowerCase()] || 'best'
    const selected = formats[selectedKey]
 
    if (!selected || !selected.ext)
      throw `❌ Format "${reqFormat}" tidak tersedia.`
 
    const info = data.info
    const title = info.title || 'Video'
    const downloadURL = `https://www.videodowns.com/youtube.php?download=1&url=${encodeURIComponent(url)}&format=${selectedKey}`
 
    return {
      title,
      thumbnail: data.thumbnail,
      sanitized: data.sanitized,
      format: selectedKey,
      ext: selected.ext || 'mp4',
      url: downloadURL,
      allFormats: formats,
      channel: info.channel || info.author || 'Tidak diketahui',
      views: info.view_count || 0
    }
  } catch (err) {
    throw err?.message || err
  }
}

module.exports = {
    name: 'YouTube',
    desc: 'Download from youtube',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        try {
            const fay = await ytdl(url, 'best')
            res.status(200).json({
                status: true,
                data: fay
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}