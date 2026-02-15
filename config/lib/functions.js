// lib/functions.js
const axios = require('axios');
const config = require('../config/settings');
const fs = require('fs-extra');
const path = require('path');

class BotFunctions {
    constructor() {
        this.config = config;
        this.commandStatus = config.commandStatus;
        this.currentPrefix = config.prefix;
        this.lastWelcome = 0;
    }

    // ===== PREFIX MANAGEMENT =====
    getPrefix() {
        return this.currentPrefix;
    }

    setPrefix(newPrefix) {
        if (this.config.isValidPrefix(newPrefix)) {
            this.currentPrefix = newPrefix;
            return true;
        }
        return false;
    }

    // ===== WELCOME MESSAGE (Every 5 hours) =====
    async shouldSendWelcome() {
        const now = Date.now();
        if (now - this.lastWelcome >= this.config.autoFeatures.welcomeInterval) {
            this.lastWelcome = now;
            return true;
        }
        return false;
    }

    getWelcomeMessage() {
        return `╭══〘〘 *${this.config.botName}* 〙〙═⊷
┃❍ *Status:* Active ✅
┃❍ *Mode:* ${this.config.mode}
┃❍ *Time:* ${this.config.getTime()}
┃❍ *Date:* ${this.config.getDate()}
┃❍ *Uptime:* ${this.config.getUptime()}
┃❍ *Users:* ${this.config.totalUsers}
╰═════════════════════⊷

*Bot is online and ready to serve!* 🚀

${this.config.footer}`;
    }

    // ===== TOGGLE SYSTEM =====
    isCommandEnabled(command, sender) {
        const owner = this.config.ownerNumber.split('@')[0];
        if (sender.includes(owner)) return true;
        return this.commandStatus[command] !== false;
    }

    async toggleCommand(command, status) {
        if (this.commandStatus.hasOwnProperty(command)) {
            this.commandStatus[command] = status;
            return true;
        }
        return false;
    }

    getEnabledCommands() {
        const enabled = [];
        const disabled = [];
        for (let [cmd, status] of Object.entries(this.commandStatus)) {
            if (status) enabled.push(cmd);
            else disabled.push(cmd);
        }
        return { enabled, disabled };
    }

    // ===== GET RANDOM MENU IMAGE =====
    getRandomMenuImage() {
        const images = [
            path.join(__dirname, '../media/menu1.jpg'),
            path.join(__dirname, '../media/menu2.jpg'),
            path.join(__dirname, '../media/menu3.jpg'),
            path.join(__dirname, '../media/menu4.jpg')
        ];
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    }

    // ===== API CALLS =====
    async fetchAPI(url) {
        try {
            const res = await axios.get(url);
            return res.data;
        } catch (e) {
            console.error('API Error:', e.message);
            return { error: 'Failed to fetch' };
        }
    }

    // AI Chat
    async aiChat(model, query) {
        const models = {
            gpt: `https://api.giftedtech.co.ke/api/ai/gpt4o?apikey=gifted&q=${encodeURIComponent(query)}`,
            gemini: `https://api.giftedtech.co.ke/api/ai/gemini?apikey=gifted&q=${encodeURIComponent(query)}`,
            blackbox: `https://api.giftedtech.co.ke/api/ai/ai?apikey=gifted&q=${encodeURIComponent(query)}`,
            deepseek: `https://api.giftedtech.co.ke/api/ai/deepseek?apikey=gifted&q=${encodeURIComponent(query)}`
        };
        const url = models[model] || models.gpt;
        const res = await this.fetchAPI(url);
        return res.result || res.message || res.response || 'No response';
    }

    // Downloaders
    async download(platform, url) {
        const endpoints = {
            ytmp3: `https://api.giftedtech.co.ke/api/download/ytmp3?apikey=gifted&url=${encodeURIComponent(url)}`,
            ytmp4: `https://api.giftedtech.co.ke/api/download/ytmp4?apikey=gifted&url=${encodeURIComponent(url)}`,
            fb: `https://api.giftedtech.co.ke/api/download/facebook?apikey=gifted&url=${encodeURIComponent(url)}`,
            ig: `https://api.giftedtech.co.ke/api/download/instadl?apikey=gifted&url=${encodeURIComponent(url)}`,
            tiktok: `https://api.giftedtech.co.ke/api/download/tiktok?apikey=gifted&url=${encodeURIComponent(url)}`
        };
        const apiUrl = endpoints[platform] || endpoints.ytmp3;
        return await this.fetchAPI(apiUrl);
    }

    // Search
    async search(type, query) {
        const endpoints = {
            google: `https://api.giftedtech.co.ke/api/search/google?apikey=gifted&query=${encodeURIComponent(query)}`,
            lyrics: `https://api.giftedtech.co.ke/api/search/lyrics?apikey=gifted&query=${encodeURIComponent(query)}`,
            weather: `https://api.giftedtech.co.ke/api/search/weather?apikey=gifted&location=${encodeURIComponent(query)}`
        };
        const apiUrl = endpoints[type] || endpoints.google;
        return await this.fetchAPI(apiUrl);
    }

    // Tools
    async getJoke() {
        const res = await this.fetchAPI('https://api.giftedtech.co.ke/api/fun/jokes?apikey=gifted');
        return res.joke || res.message || 'No joke found';
    }

    async getQuote() {
        const res = await this.fetchAPI('https://api.giftedtech.co.ke/api/fun/quotes?apikey=gifted');
        return res.quote || res.message || 'No quote found';
    }

    // ===== UTILITIES =====
    async downloadMedia(msg, type = 'image') {
        const stream = await require('@whiskeysockets/baileys').downloadContentFromMessage(msg, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    }

    async makeSticker(buffer) {
        const sharp = require('sharp');
        return await sharp(buffer)
            .resize(512, 512, { fit: 'contain' })
            .webp()
            .toBuffer();
    }

    // ===== READ IMAGE FILE =====
    async readImage(filePath) {
        try {
            return await fs.readFile(filePath);
        } catch (error) {
            console.error('Error reading image:', error);
            return null;
        }
    }
}

module.exports = BotFunctions;
