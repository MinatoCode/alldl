const { fbdown, ttdl, igdl } = require('btch-downloader');
const axios = require('axios');

module.exports = async (req, res) => {
  const url = req.query.url;

  // Root path → API info
  if (req.url === '/' || req.url.startsWith('/?')) {
    res.status(200).json({
      success: true,
      author: "MinatoCode",
      message: "Unified Video Downloader API",
      endpoints: {
        download: "/api/download?url={VIDEO_URL}"
      },
      platforms: ["YouTube", "Facebook", "TikTok", "Instagram"],
      response_format: {
        success: "boolean",
        author: "string",
        platform: "string",
        download_url: "string"
      },
      usage_example: [
        "/api/download?url=https://youtube.com/watch?v=C8mJ8943X80",
        "/api/download?url=https://www.facebook.com/watch/?v=1393572814172251",
        "/api/download?url=https://www.tiktok.com/@user/video/123456789",
        "/api/download?url=https://www.instagram.com/p/ABCDEFG/"
      ]
    });
    return;
  }

  // /api/download endpoint
  if (!url) {
    res.status(400).json({ success: false, error: "Missing url parameter" });
    return;
  }

  const DEFAULT_AUTHOR = "MinatoCode";

  try {
    let platform = '';
    let downloadUrl = '';

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      platform = 'YouTube';
      // Use external API
      const apiRes = await axios.get(`https://min-ytdl.vercel.app/api/download?url=${encodeURIComponent(url)}`);
      const data = apiRes.data;

      if (data.success) {
        downloadUrl = data.download_url || data.alternative_urls?.[0]?.url;
      }
    } 
    else if (url.includes('facebook.com') || url.includes('fb.watch')) {
      platform = 'Facebook';
      const data = await fbdown(url);
      downloadUrl = data.HD;
    } 
    else if (url.includes('tiktok.com')) {
      platform = 'TikTok';
      const data = await ttdl(url);
      if (Array.isArray(data.video)) downloadUrl = data.video[0];
      else downloadUrl = data.video;
    } 
    else if (url.includes('instagram.com')) {
      platform = 'Instagram';
      const data = await igdl(url);
      downloadUrl = data.result?.[0]?.url;
    } 
    else {
      res.status(400).json({ success: false, error: "Unsupported platform" });
      return;
    }

    if (!downloadUrl) {
      res.status(500).json({ success: false, error: "Download URL not found" });
      return;
    }

    res.status(200).json({
      success: true,
      author: DEFAULT_AUTHOR,
      platform,
      download_url: downloadUrl
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      author: DEFAULT_AUTHOR,
      error: err.message
    });
  }
};
        
