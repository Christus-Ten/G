const axios = require("axios");

const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

module.exports = {
  config: {
    name: "imgbb",
    version: "1.0.0",
    author: "ArYAN",
    countDown: 0,
    role: 0,
    shortDescription: "Upload an image/video to ImgBB",
    longDescription: "Reply to an image or provide a URL to upload it to ImgBB.",
    category: "utility",
    guide: "{pn} reply to an image or provide a URL"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;
    
    let e;
    try {
      const configRes = await axios.get(nix);
      e = configRes.data && configRes.data.api;
      if (!e) throw new Error("Configuration Error: Missing API in GitHub JSON.");
    } catch (error) {
      return api.sendMessage("❌ Failed to fetch API configuration from GitHub.", threadID, messageID);
    }

    let mediaUrl = "";

    if (messageReply && messageReply.attachments.length > 0) {
      mediaUrl = messageReply.attachments[0].url;
    } else if (args.length > 0) {
      mediaUrl = args.join(" ");
    }

    if (!mediaUrl) {
      return api.sendMessage("❌ Please reply to an image or provide a URL!", threadID, messageID);
    }

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);

      const res = await axios.get(`${e}/imgbb?url=${encodeURIComponent(mediaUrl)}`);
      const imgbbLink = res.data.link;

      if (!imgbbLink) {
        api.setMessageReaction("", messageID, () => {}, true);
        return api.sendMessage("❌ Failed to upload to ImgBB.", threadID, messageID);
      }

      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage(`${imgbbLink}`, threadID, messageID);

    } catch (err) {
      console.error("ImgBB upload error:", err);
      api.setMessageReaction("", messageID, () => {}, true);
      return api.sendMessage("⚠️ An error occurred while uploading.", threadID, messageID);
    }
  }
};
