const fetch = require('node-fetch')

const fbvdl = async (fbVideoUrl) => {
 
    const headers = {
        "sec-fetch-site": "same-origin",
    }
 
    // redirect
    const fr = await fetch(fbVideoUrl, {
        headers,
        method: "head"
    })
    if (!fr.ok) throw Error(`gagal fetch redirect ${fr.status} ${fr.statusText}\n${await fr.text() || null}`)
 
    const videoId = fr.headers.get("link")?.match(/\/(\d+)\/>;/)?.[1]
    if (!videoId) throw Error(`tidak bisa menemukan id video.. mungkin private share.. atau salah link.\ntips: pastiin link nya bisa buka video tanpa login.. all redirect is fine`)
 
    // actual api hit
    let body_obj = {
        "caller": "TAHOE",
        "entityNumber": 5,
        "feedbackSource": 41,
        "feedLocation": "TAHOE",
        "focusCommentID": null,
        "isCrawler": false,
        "isLoggedOut": true,
        "privacySelectorRenderLocation": "COMET_STREAM",
        "renderLocation": "video_home",
        "scale": 1,
        "useDefaultActor": false,
        "videoID": videoId,
        "videoIDStr": videoId,
        "__relay_internal__pv__CometUFIShareActionMigrationrelayprovider": true,
        "__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider": false,
        "__relay_internal__pv__IsWorkUserrelayprovider": false
    }
 
    const body = new URLSearchParams({
        "variables": JSON.stringify(body_obj),
        "doc_id": "23880857301547365"
    })
 
    const res = await fetch("https://www.facebook.com/api/graphql/", {
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0",
            ...headers
        },
        body,
        "method": "POST",
 
    })
 
    const text = await res.text()
    const firstJsonString = text.split("\n")[0]
    const json = JSON.parse(firstJsonString)
 
    const media = json.data.video.story.attachments[0].media
    const result = {
        sdUrl: media.videoDeliveryLegacyFields.browser_native_sd_url,
        hdUrl: media.videoDeliveryLegacyFields.browser_native_hd_url,
        audioUrl: json.extensions.all_video_dash_prefetch_representations[0].representations[2].base_url,
        thumbnailUrl: media.preferred_thumbnail.image.uri,
        sprites : media?.video_player_scrubber_preview_renderer?.video?.scrubber_preview_thumbnail_information?.sprite_uris || null,
        permalinkUrl: media.permalink_url,
        publishTime: media.publish_time,
        durationInMs: media.playable_duration_in_ms
    }
 
    //return JSON.stringify(json)
    return result
}

module.exports = {
    name: 'Facebook V3',
    desc: 'Download on facebook',
    category: 'Downloader',
    params: ['url'],
    async run(req, res) {
        const { url } = req.query;
            if (!url) {
                return res.status(400).json({ status: false, error: 'Url is required' });
            }
        try {
            const results = await fbvdl(url);
            res.status(200).json({
                status: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
}