const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const downloader = require('nayan-videos-downloaders');
const got = require('got');
const { botNumber } = require('./number');

// 🔑 Google AI API Key (Hardcoded)
const GOOGLE_API_KEY = 'AIzaSyDfj1K8t3p9ObXnz1wxjVFSvm3nxDSz8W8';

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'emon-bot' }),
  puppeteer: { headless: true }
});

client.on('qr', qr => qrcode.generate(qr, { small: true }));
client.on('ready', () => console.log('✅ Emon Bot is Ready to Use!'));

client.on('message', async msg => {
  const text = msg.body.trim();
  const sender = msg.from;

  // Ignore bot's own messages
  if (sender.includes(botNumber)) return;

  // 🎥 Video Downloader (Any Link)
  if (text.startsWith('http://') || text.startsWith('https://')) {
    try {
      await msg.reply('📥 Downloading your video...');
      const result = await downloader.download({ url: text, format: 'mp4' });
      for (const file of result.files) {
        await msg.reply(MessageMedia.fromFilePath(file.path));
      }
    } catch (e) {
      console.error(e);
      msg.reply('❌ Could not download this video.');
    }
    return;
  }

  // 🤖 AI Chat if message includes the word "Emon"
  if (text.toLowerCase().includes('emon')) {
    await msg.reply('🤖 Thinking...');
    try {
      const res = await got.post('https://generativelanguage.googleapis.com/v1beta2/models/chat-bison-001:generateMessage', {
        searchParams: { key: GOOGLE_API_KEY },
        json: { prompt: { text }, temperature: 0.8 },
        responseType: 'json'
      });

      const reply = res.body?.candidates?.[0]?.content;
      msg.reply(reply || "Sorry, Emon didn't understand that.");
    } catch (err) {
      console.error(err);
      msg.reply('❌ Error while talking to Emon.');
    }
  }
});

client.initialize();
