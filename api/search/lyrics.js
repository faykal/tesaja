const axios = require("axios")
const cheerio = require("cheerio");
 
const GENIUS_API_URL = 'https://api.genius.com';
const GENIUS_ACCESS_TOKEN = 'L0BY-i4ZVi0wQ53vlvm2zucqjHTuLbHv--YgjxJoN0spnEIhb5swTr_mWlQ6Ye-F';
 
const headers = {
  'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}`,
  'User-Agent': 'apitester.org Android/7.5(641)'
};
 
const logs = (message, code) => {
  const error = new Error(message);
  error.code = code;
  return error;
};
 
const genius = {
  async searchSong(query) {
    const url = new URL('/search', GENIUS_API_URL);
    url.searchParams.append('q', query);
    try {
      const response = await axios.get(url.toString(), { headers });
      return response.data.response.hits;
    } catch (error) {
      if (error.response) {
        throw logs(`❌ Error: ${error.response.status}`, error.response.status);
      }
      throw logs(`❌ Error: ${error.message}`, 'NETWORK_ERROR');
    }
  },
  
  async getLyrics(songUrl) {
    try {
      const response = await axios.get(songUrl);
      const $ = cheerio.load(response.data);
      let lyrics = '';
      $('[class^="Lyrics__Container-"]').each((index, element) => {
        $(element).find('br').replaceWith('\n');
        lyrics += $(element).html()
          .replace(/<(?!\/?i>|\/?b>)[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          + '\n';
      });
      lyrics = lyrics
        .split('\n')
        .map(line => line.trim())
        .filter(line => line !== '')
        .join('\n');
      lyrics = lyrics.replace(/\[/g, '\n\n[');
      lyrics = lyrics.replace(/\]\n/g, ']\n');
      lyrics = lyrics.replace(/\n{3,}/g, '\n\n');
      return lyrics.trim();
    } catch (error) {
      throw logs('❌ Error', 'LYRICS_ERROR');
    }
  },
  
  async getSongLyrics(query) {
    try {
      const searchResults = await this.searchSong(query);
      if (searchResults.length === 0) {
        return { error: "Lirik nya gak ada 🌝" };
      }
      const song = searchResults[0].result;
      const lyrics = await this.getLyrics(song.url);
      return {
        title: song.title,
        artist: song.primary_artist.name,
        lyrics: lyrics,
        url: song.url,
        thumbnailUrl: song.song_art_image_thumbnail_url
      };
    } catch (error) {
      return { error: error.message };
    }
  },
  
  async *batchGetLyrics(queries) {
    for await (const query of queries) {
      try {
        yield await this.getSongLyrics(query);
      } catch (error) {
        yield { error: error.message, query };
      }
    }
  }
};

module.exports = {
    name: 'Lyrics',
    desc: 'Search lyrics on song',
    category: 'Search',
    params: ['q'],
    async run(req, res) {
            try {
                const { q } = req.query;
                if (!q) return res.status(400).json({ status: false, error: 'Query is required' });
                const fay = await genius.getSongLyrics(q)
                res.status(200).json({
                    status: true,
                    result: fay
                });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}
