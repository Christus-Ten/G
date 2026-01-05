const axios = require("axios");

const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

const getImgurApiUrl = async () => {
    try {
        const configRes = await axios.get(nix);
        const baseUrl = configRes.data?.api;
        
        if (!baseUrl) {
            throw new Error("Missing 'api' base URL in GitHub JSON.");
        }
        
        return `${baseUrl}/imgur`; 
    } catch (error) {
        throw new Error(`Failed to load Imgur API configuration from JSON: ${error.message}`);
    }
};

module.exports = {
  config: {
    name: "imgur",
    version: "0.0.1",
    author: "ArYAN",
    countDown: 0,
    role: 0,
    shortDescription: "Upload an image/video to Imgur",
    longDescription: "Reply to an image/video or provide a URL to upload it to Imgur.",
    category: "utility",
    guide: "{pn} reply to an image/video or provide a URL"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;
    let mediaUrl = "";
    let imgurApi;
    
    try {
        imgurApi = await getImgurApiUrl();
    } catch (apiError) {
        return api.sendMessage(`❌ API Load Error: ${apiError.message}`, threadID, messageID);
    }


    if (messageReply && messageReply.attachments.length > 0) {
      mediaUrl = messageReply.attachments[0].url;
    } else if (args.length > 0) {
      mediaUrl = args.join(" ");
    }

    if (!mediaUrl) {
      return api.sendMessage("❌ Please reply to an image/video or provide a URL!", threadID, messageID);
    }

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);

      const res = await axios.get(`${imgurApi}?url=${encodeURIComponent(mediaUrl)}`);
      const imgurLink = res.data.imgur;

      if (!imgurLink) {
        api.setMessageReaction("", messageID, () => {}, true);
        return api.sendMessage("❌ Failed to upload to Imgur.", threadID, messageID);
      }

      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage(`${imgurLink}`, threadID, messageID);

    } catch (err) {
      api.setMessageReaction("", messageID, () => {}, true);
      return api.sendMessage("⚠️ An error occurred while uploading.", threadID, messageID);
    }
  }
};
