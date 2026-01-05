const axios = require("axios");
const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "cache", `edit_${Date.now()}.png`);

const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

module.exports = {
  config: {
    name: "edit",
    aliases: ["nano", "banana"],
    version: "0.0.1",
    author: "ArYAN",
    countDown: 10,
    role: 0,
    category: "Image"
  },

  onStart: async function ({ api, event, args, message }) {
    let imageUrl = null;

    if (
      event.type === "message_reply" &&
      event.messageReply?.attachments?.length
    ) {
      const img = event.messageReply.attachments[0];
      if (img.type === "photo" || img.type === "image") {
        imageUrl = img.url;
      }
    }

    if (!imageUrl) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply("🧘 Please reply to an image");
    }

    const T = args.join(" ");
    if (!T) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply("🧘 Prompt required");
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const ok = await axios.get(nix);
      const nc = ok.data.api;

      const res = await axios.get(
        `${nc}/nano-banana?prompt=${encodeURIComponent(T)}&imageUrl=${encodeURIComponent(imageUrl)}&apikey=nc`,
        { responseType: "arraybuffer" }
      );

      await fs.ensureDir(path.dirname(filePath));
      fs.writeFileSync(filePath, Buffer.from(res.data));

      await message.reply({
        body: `✅ Nano Banana Successfully\n📐 ${T}`,
        attachment: fs.createReadStream(filePath)
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);
    } catch (e) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply("🤼 nano banana issue");
    } finally {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }
};