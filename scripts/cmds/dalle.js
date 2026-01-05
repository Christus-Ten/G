const A = require("axios");
const B = require("fs-extra");
const C = require("path");

const JSN = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

module.exports = {
  config: {
    name: "dalle",
    version: "0.0.1",
    author: "ArYAN",
    countDown: 10,
    role: 0,
    category: "image"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID: t, messageID: m } = event;
    let p = args.join(" ");
    let r = "1:1";

    if (!p) return api.sendMessage("❌ Please provide a prompt.", t, m);

    const i = args.indexOf("--ar");
    if (i !== -1 && args[i + 1]) {
      r = args[i + 1];
      p = args.slice(0, i).join(" ");
    }

    api.setMessageReaction("⏳", m, () => {}, true);
    const W = await api.sendMessage("⏳ Generating your Dall-E image...", t, m);

    const G = C.join(__dirname, "cache", `flx_${Date.now()}.png`);

    try {
      const D = await A.get(JSN);
      const E = D.data.api;

      const J = await A.get(`${E}/dall-e?prompt=${encodeURIComponent(p)}`, {
        responseType: "arraybuffer"
      });

      await B.ensureDir(C.dirname(G));
      B.writeFileSync(G, Buffer.from(J.data));

      api.setMessageReaction("✅", m, () => {}, true);

      await api.sendMessage({
        body: `✅ Dall-E Image Generated\n\n📐 Prompt: ${p}`,
        attachment: B.createReadStream(G)
      }, t, () => {
        B.unlinkSync(G);
        api.unsendMessage(W.messageID);
      }, m);

    } catch (e) {
      api.setMessageReaction("❌", m, () => {}, true);
      api.unsendMessage(W.messageID);
      return api.sendMessage("❌ Error generating image.", t, m);
    }
  }
};