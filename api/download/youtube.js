const axios = require("axios")
const qs = require("qs")
 
async function JHVidDowns(url) {
  const payload = qs.stringify({ url });

  const jantung = {
    'content-type': 'application/x-www-form-urlencoded',
    origin: 'https://www.videodowns.com'
  };

  try {
    const { data } = await axios.post(
      'https://www.videodowns.com/youtube-video-downloader.php?action=get_info',
      payload,
      { headers: jantung }
    );

    const i = data.info || {};
    const f = data.formats || {};
    const link = (x) =>
      f[x]?.ext
        ? `https://www.videodowns.com/youtube-video-downloader.php?download=1&url=${encodeURIComponent(url)}&format=${x}`
        : null;

    return JSON.stringify({
      title: i.title || null,
      channel: i.channel || i.author || null,
      views: i.view_count || null,
      thumbnail: data.thumbnail || null,
      sanitized: data.sanitized || null,
      best_quality: link('best'),
      medium_quality: link('medium'),
      low_quality: link('low'),
      audio_only: link('audio')
    }, null, 2);
  } catch (e) {
    const err = e?.response?.data || e?.message || e;
    return 'error: ' + JSON.stringify(err, null, 2);
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
            const fay = await JHVidDowns(url)
            res.status(200).json({
                status: true,
                data: fay
            });
        } catch (error) {
            res.status(500).json({ 
                status: false,
                error: error.message });
        }
    }
}
