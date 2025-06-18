const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs');

let numbers = [];

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "Emon" }),
  puppeteer: { headless: true }
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log("📱 Scan this QR code to login Emon Bot...");
});

client.on('ready', () => {
  console.log("✅ Emon WhatsApp Bot is now running!");
});

client.on('message', async msg => {
  const number = msg.from.split('@')[0];
  if (!numbers.includes(number)) {
    numbers.push(number);
    fs.writeFileSync('number.js', `module.exports = ${JSON.stringify(numbers, null, 2)};`);
  }

  const body = msg.body?.toLowerCase();

  // 🌐 YouTube Video Downloader
  if (body.includes('youtube.com') || body.includes('youtu.be')) {
    msg.reply('📥 Downloading your video, please wait...');
    try {
      const api = `https://api.vevioz.com/api/button/mp4?url=${encodeURIComponent(body)}`;
      const res = await axios.get(api);
      const match = res.data.match(/href="([^"]+\.mp4.*?)"/);
      if (match && match[1]) {
        const video = await MessageMedia.fromUrl(match[1]);
        client.sendMessage(msg.from, video, { caption: "🎬 Here's your video from Emon Bot!" });
      } else {
        msg.reply("⚠️ Failed to fetch video link.");
      }
    } catch (e) {
      msg.reply("❌ Error downloading video.");
      console.error(e);
    }
    return;
  }

  // 🤖 Google AI Chat (Gemini)
  try {
    const aiReply = await axios.post("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDfj1K8t3p9ObXnz1wxjVFSvm3nxDSz8W8", {
      contents: [{ parts: [{ text: msg.body }] }]
    }, {
      headers: { "Content-Type": "application/json" }
    });

    const reply = aiReply.data.candidates?.[0]?.content?.parts?.[0]?.text || "🤖 Sorry, no response!";
    msg.reply(`💬 ${reply}`);
  } catch (err) {
    msg.reply("⚠️ Emon AI is facing issues. Try again later!");
    console.error(err);
  }
});

client.initialize();
