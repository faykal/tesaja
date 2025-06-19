const axios = require("axios")

async function pinterestDL(url) {
  try {
    return await new Promise(async (resolve, reject) => {
      if (!url) throw "missing url!";

      axios.get(`https://pinterestdownloader.io/frontendService/DownloaderService?url=` + url, {
        headers: {
          "Accept": "*/*",
          "Content-Type": "application/json",
          "Origin": "https://pinterestdownloader.io",
          "Referer": "https://pinterestdownloader.io/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
        }
      }).then(raw => {
        const data = raw.data;
        if (!data?.medias) throw "failed fetching media!";

        const originalsSet = new Set();
        const mediaList = [];

        for (const media of data.medias) {
          mediaList.push(media);

          if (
            media.extension === "jpg" &&
            media.url.includes("i.pinimg.com/")
          ) {
            const originalUrl = media.url.replace(/\/\d+x\//, "/originals/");
            if (!originalsSet.has(originalUrl)) {
              originalsSet.add(originalUrl);
              mediaList.push({
                ...media,
                url: originalUrl,
                quality: "original"
              });
            }
          }
        }

        return resolve({
          success: true,
          media: mediaList.sort((a, b) => (b.size || 0) - (a.size || 0))
        });
      }).catch(reject);
    });
  } catch (e) {
    return {
      errors: e
    };
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
            const fay = await pinterestDL(url)
            res.status(200).json({
                status: true,
                data: fay
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
