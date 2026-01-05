const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");

const baseApi = "https://nix-random-api.vercel.app";

module.exports.config = {
  name: "rndm",
  version: "0.0.1",
  role: 0,
  author: "ArYAN",
  description: "Send a random video by name",
  category: "user",
  noPrefix: true,
  cooldowns: 5
};

module.exports.onStart = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args.length) {
    return api.sendMessage("[⚜️]➜ Please provide a name.", threadID, messageID);
  }

  const name = args.join(" ");
  const query = encodeURIComponent(name);
  const apiUrl = `${baseApi}/api/random?name=${query}`;

  try {
    const res = await axios.get(apiUrl);
    const data = res.data;

    if (!data || !data.data || !data.data.url) {
      return api.sendMessage("[⚜️]➜ An error occurred while processing your request.", threadID, messageID);
    }

    const { url: videoUrl, name: authorName, cp, length: ln } = data.data;

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const filePath = path.join(cacheDir, `video_${Date.now()}.mp4`);
    const file = fs.createWriteStream(filePath);

    const downloadPromise = new Promise((resolve, reject) => {
      https.get(videoUrl, (response) => {
        if (response.statusCode !== 200) {
          file.end();
          fs.unlink(filePath, () => {});
          return reject(new Error(`Download failed with status code ${response.statusCode}`));
        }
        response.pipe(file);
        file.on("finish", () => resolve());
      }).on("error", (err) => {
        file.end();
        fs.unlink(filePath, () => {});
        reject(err);
      });
    });

    await downloadPromise;

    api.sendMessage({
      body: `${cp}\n\n𝐓𝐨𝐭𝐚𝐥 𝐕𝐢𝐝𝐞𝐨𝐬: [${ln}]\n𝐀𝐝𝐝𝐞𝐝 𝐓𝐡𝐢𝐬 𝐕𝐢𝐝𝐞𝐨 𝐓𝐨 𝐓𝐡𝐞 𝐀𝐩𝐢 𝐁𝐲 [${name}]`,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => {
      fs.unlinkSync(filePath);
    }, messageID);

  } catch (err) {
    console.error("An unexpected error occurred:", err);
    return api.sendMessage("[⚜️]➜ An error occurred while processing your request.", threadID, messageID);
  }
};