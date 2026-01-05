const os = require('os');
const pkg = require('../../package.json');

module.exports = {
  config: {
    name: "uptime",
    version: "0.0.1",
    author: "ArYAN",
    countDown: 5,
    role: 0,
    shortDescription: "Check bot and system status",
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

    const msg = `━━━━━━━━━━━━━━━━━━
BOT STATUS
━━━━━━━━━━━━━━━━━━
Uptime: ${botUptime}
System Uptime: ${systemUptimeFormatted}
CPU: ${cpuInfo.model}
RAM: ${usedMemory}GB / ${totalMemory}GB
Memory: ${((usedMemory / totalMemory) * 100).toFixed(2)}%
Version: ${version}
Ping: ${ping}ms
━━━━━━━━━━━━━━━━━━`;

    return api.sendMessage(msg, event.threadID, event.messageID);
  }
};

function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  return `${d}d ${h}h ${m}m ${s}s`;
}