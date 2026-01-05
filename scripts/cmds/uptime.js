const os = require('os');
const pkg = require('../../package.json');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up"],
    version: "0.0.1",
    author: "ArYAN",
    countDown: 5,
    role: 0,
    nixPrefix: true,
    shortDescription: "Check bot and system status with image",
    category: "info"
  },

  onStart: async function ({ api, event }) {
    const startTime = process.uptime();
    const sysUptime = os.uptime();
    
    const botUptime = formatUptime(startTime);
    const systemUptimeFormatted = formatUptime(sysUptime);
    
    const cpuInfo = os.cpus()[0];
    const totalMemory = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
    const freeMemory = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
    const usedMemory = (totalMemory - freeMemory).toFixed(2);
    
    const ping = Date.now() - event.timestamp;
    const version = pkg.version;

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `uptime_${Date.now()}.png`);

    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext('2d');

    
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    
    ctx.strokeStyle = '#FF8C00'; 
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

    
    ctx.fillStyle = '#FF8C00';
    ctx.font = 'bold 45px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BOT SYSTEM STATUS', 400, 80);

    
    ctx.textAlign = 'left';
    ctx.font = '30px Arial';
    ctx.fillStyle = '#ffffff';

    const startX = 80;
    const startY = 160;
    const lineSpacing = 50;

    const stats = [
      `Uptime: ${botUptime}`,
      `System Uptime: ${systemUptimeFormatted}`,
      `CPU: ${cpuInfo.model.split(' ')[0]} ${cpuInfo.model.split(' ')[1]}`,
      `RAM: ${usedMemory}GB / ${totalMemory}GB`,
      `Memory: ${((usedMemory / totalMemory) * 100).toFixed(2)}%`,
      `Version: ${version}`,
      `Ping: ${ping}ms`
    ];

    stats.forEach((stat, index) => {
      ctx.fillStyle = '#FF8C00';
      ctx.fillText('•', startX - 30, startY + (index * lineSpacing));
      ctx.fillStyle = '#ffffff';
      ctx.fillText(stat, startX, startY + (index * lineSpacing));
    });

    
    ctx.fillStyle = 'rgba(255, 140, 0, 0.1)';
    ctx.fillRect(startX - 20, 100, 680, 5);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(imgPath, buffer);

    const bodyMsg = `Uptime: ${botUptime}\nSystem Uptime: ${systemUptimeFormatted}\nCPU: ${cpuInfo.model.split(' ')[0]} ${cpuInfo.model.split(' ')[1]}\nRAM: ${usedMemory}GB / ${totalMemory}GB\nMemory: ${((usedMemory / totalMemory) * 100).toFixed(2)}%\nVersion: ${version}\nPing: ${ping}ms`;

    return api.sendMessage({
      body: bodyMsg,
      attachment: fs.createReadStream(imgPath)
    }, event.threadID, () => {
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }, event.messageID);
  }
};

function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  return `${d}d ${h}h ${m}m ${s}s`;
}
