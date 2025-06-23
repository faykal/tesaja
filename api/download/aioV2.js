const axios = require('axios');
const FormData = require('form-data');
const cheerio = require('cheerio');
const ytsr = require("@distube/ytsr");

/**
 * Ekstrak ID video dari URL YouTube (shorts, watch, youtu.be)
 * @param {string} url 
 * @returns {string|null} videoId
 */
function extractYouTubeID(url) {
  const regex = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Ambil info video dari ID YouTube
 * @param {string} videoId 
 * @returns {Promise<object>}
 */
async function getVideoInfo(videoId) {
  const result = await ytsr(videoId);
  const video = result.items.find(v => v.type === "video");
  if (!video) throw new Error("Video tidak ditemukan");

  return {
    title: video.name,
    duration: video.duration,
    views: video.views,
    thumbnail: video.thumbnail,
    url: video.url
  };
}

/**
 * Ambil link download dari videoindir
 * @param {string} url 
 * @returns {Promise<object>}
 */
async function getDownloadLink(url) {
  const form = new FormData();
  form.append("action", "vd_get_video_info");
  form.append("url", url);

  const { data } = await axios.post(
    "https://www.videoindir.com/wp-admin/admin-ajax.php",
    form,
    { headers: form.getHeaders() }
  );

  const $ = cheerio.load(data);
  const videoUrl = $('input[name="url"]').attr("value");
  const filename = $('input[name="filename"]').attr("value");

  if (!videoUrl || !filename) throw new Error("Gagal ambil link download.");

  return {
    videoUrl,
    filename
  };
}

/**
 * Fungsi utama: ambil info dan link download dari URL YouTube
 * @param {string} youtubeUrl 
 * @returns {Promise<object>}
 */
async function videoIndir(youtubeUrl) {
  const videoId = extractYouTubeID(youtubeUrl);
  if (!videoId) throw new Error("ID YouTube tidak valid.");

  const info = await getVideoInfo(videoId);
  const download = await getDownloadLink(info.url);

  return {
    ...info,
    download
  };
}

module.exports = {
    name: 'Aio V2',
    desc: 'All In One Downloader',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
            if (!url) {
                return res.status(400).json({ status: false, error: 'Url is required' });
            }
        try {
            const results = await videoIndir(url);
            res.status(200).json({
                status: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}