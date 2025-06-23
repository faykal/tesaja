const axios = require("axios");
const crypto = require('crypto');
const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegStatic.path);

async function saveTube(ytUrl, targetFormat) {
  try {
    const jantung = { 'content-type': 'application/json', 'referer': 'https://yt.savetube.me/', 'origin': 'https://yt.savetube.me' };
    const formats = ['144', '240', '360', '480', '720', '1080', 'mp3'];

    if (!ytUrl) throw new Error('URL kosong');
    if (!formats.includes(targetFormat)) throw new Error(`Format tidak didukung. Format yang didukung: ${formats.join(', ')}`);

    const videoId = getVideoId(ytUrl);
    if (!videoId) throw new Error('Gagal ambil ID video');

    const node = (await axios.get('https://media.savetube.me/api/random-cdn')).data.cdn;
    const meta = await axios.post(`https://${node}/v2/info`, { url: `https://www.youtube.com/watch?v=${videoId}` }, { headers: jantung });
    const data = await decrypt(meta.data.data);
    const unduh = await axios.post(`https://${node}/download`, { id: videoId, downloadType: targetFormat === 'mp3' ? 'audio' : 'video', quality: targetFormat === 'mp3' ? '128' : targetFormat, key: data.key }, { headers: jantung });

    const hasil = {
      id: videoId,
      title: data.title || 'Tanpa Judul',
      format: targetFormat,
      type: targetFormat === 'mp3' ? 'audio' : 'video',
      thumbnail: data.thumbnail || `https://i.ytimg.com/vi/${videoId}/0.jpg`,
      duration: data.duration,
      quality: targetFormat === 'mp3' ? '128' : targetFormat,
      url: unduh.data.data.downloadUrl,
    };

    if (targetFormat === 'mp3') {
      const outputUrl = `output_${videoId}.mp3`;
      await convertToMp3(hasil.url, outputUrl);
      hasil.url = outputUrl;
    }

    return hasil;
  } catch (e) {
    throw e;
  }
}

function getVideoId(url) {
  const pola = [
    /v=([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
    /\/v\/([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const p of pola) {
    const hasil = url.match(p);
    if (hasil) return hasil[1];
  }

  return null;
}

async function decrypt(base64) {
  const kunci = Buffer.from('C5D58EF67A7584E4A29F6C35BBC4EB12', 'hex');
  const isi = Buffer.from(base64, 'base64');
  const iv = isi.slice(0, 16);
  const enkrip = isi.slice(16);
  const alat = crypto.createDecipheriv('aes-128-cbc', kunci, iv);
  const hasil = Buffer.concat([alat.update(enkrip), alat.final()]);
  return JSON.parse(hasil.toString());
}

function convertToMp3(inputUrl, outputUrl) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputUrl)
      .format('mp3')
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .save(outputUrl);
  });
}

module.exports = {
    name: 'YouTube',
    desc: 'Format: 144, 240, 360, 480, 720, 1080, mp3',
    category: 'Downloader',
    params: ['url','format'],
    async run(req, res) {
        const { url, format } = req.query;
        if (!url || !format) return res.status(400).json({ status: false, error: 'Url is required' });
        try {
            const fay = await saveTube(url, format)
            res.status(200).json({
                status: true,
                data: fay
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
