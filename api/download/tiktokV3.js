const axios = require("axios")
const cheerio = require('cheerio');

const baseUrl = 'https://id.tikmate.app/';
const apiUrl = 'https://api.tikmate.app/api/lookup';
const tiktokUrl = 'https://vt.tiktok.com/ZShDSsGQT/';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Content-Type': 'application/x-www-form-urlencoded'
};

async function TikMate() {
  try {
    const response = await axios.get(baseUrl, { headers });
    const html = response.data;
    const $ = cheerio.load(html);

    const formAction = $('form').attr('action') || apiUrl;
    const formInputName = $('form input[name="url"]').attr('name') || 'url';

    const postData = new URLSearchParams({ [formInputName]: tiktokUrl });
    const postResponse = await axios.post(apiUrl, postData, { headers });
    const { data } = postResponse;

    if (data.success) {
      console.log('Hasil:', {
        metadata: {
          title: data.desc,
          id: data.id,
          author: {
            id: data.author_id,
            avatar: data.cover
          }
        },
        download: {
          original: `${baseUrl}download/${data.token}/${data.id}.mp4`,
          hd: `${baseUrl}download/${data.token}/${data.id}.mp4?hd=1`
        }
      });
    } else {
      console.log('Gagal Proses URL:', data.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

module.exports = {
    name: 'TikTok V3',
    desc: 'Download video/image on tiktok',
    category: 'Downloader',
    async run(req, res) {
        try {
            const results = await TikMate();
            res.status(200).json({
                status: true,
                result: results.data
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
