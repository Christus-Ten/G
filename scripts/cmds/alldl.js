const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "alldl",
    version: "1.0.0",
    author: "ArYAN",
    countDown: 5,
    role: 0,
    shortDescription: "High-speed multi-platform downloader",
    category: "media"
  },

  onStart: async function ({ api, event }) {
    return api.sendMessage("🚀 High-Speed AutoLink is active. Just paste any link!", event.threadID);
  },

  onChat: async function ({ api, event }) {
    const { threadID, body, messageID } = event;
    if (!body) return;

    const match = body.match(/(https?:\/\/[^\s]+)/);
    if (!match) return;

    const url = match[0];
    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, `dl_${Date.now()}.mp4`);

    try {
      const apiUrl = `https://aryan-autodl.vercel.app/alldl?url=${encodeURIComponent(url)}`;
      
      const response = await axios.get(apiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
          "Accept": "application/json",
          "Referer": "https://www.google.com/"
        },
        timeout: 15000
      });

      const resData = response.data;
      if (resData.status && resData.downloadUrl) {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);

        const videoStream = await axios({
          method: 'get',
          url: resData.downloadUrl,
          responseType: 'stream',
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
            "Accept": "*/*",
            "Connection": "keep-alive"
          }
        });

        const writer = fs.createWriteStream(filePath);
        videoStream.data.pipe(writer);

        writer.on("finish", async () => {
          api.setMessageReaction("✅", messageID, () => {}, true);
          
          let platform = "Social Media";
          if (/facebook\.com|fb\.watch/i.test(url)) platform = "Facebook";
          else if (/tiktok\.com/i.test(url)) platform = "TikTok";
          else if (/instagram\.com/i.test(url)) platform = "Instagram";
          else if (/youtube\.com|youtu\.be/i.test(url)) platform = "YouTube";
          else if (/twitter\.com|x\.com/i.test(url)) platform = "Twitter/X";

          await api.sendMessage({
            body: `• Title: ${resData.title || "No Title"}\n• Platform: ${platform}`,
            attachment: fs.createReadStream(filePath)
          }, threadID);

          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });

        writer.on("error", (err) => {
          console.error("Stream Error:", err);
          api.setMessageReaction("❌", messageID, () => {}, true);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      }
    } catch (err) {
      console.error("Download Error:", err);
    }
  }
};