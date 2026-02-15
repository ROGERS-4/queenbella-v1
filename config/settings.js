// config/settings.js
const fs = require('fs-extra');
const moment = require('moment-timezone');

module.exports = {
    // ===== BOT OWNER DETAILS =====
    botName: "𝐐𝐔𝐄𝐄𝐍 𝐁𝐄𝐋𝐋𝐀 -𝐕𝟏",
    ownerName: "𝐑𝐨𝐝𝐠𝐞𝐫𝐬",
    ownerNumber: "254755660053", // Your number
    author: "𝐑𝐨𝐝𝐠𝐞𝐫𝐬",
    
    // ===== PREFIX SETTINGS =====
    prefix: ".",
    allowedPrefixes: [".", "!", "¡", "?"],
    
    // ===== MODE SETTINGS =====
    mode: "public",
    timezone: "Africa/Nairobi",
    
    // ===== CHANNEL DETAILS =====
    channelName: "𝐒𝐄𝟕𝐄𝐍𝐒 𝐒𝐈𝐓𝐘",
    channelLink: "https://whatsapp.com/channel/0029VbBR3ib3LdQQlEG3vd1x",
    
    // ===== FOOTER =====
    footer: "𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐑𝐨𝐝𝐠𝐞𝐫𝐬",
    
    // ===== AUTO FEATURES =====
    autoFeatures: {
        viewStatus: true,
        reactStatus: true,
        alwaysOnline: true,
        readMessages: true,
        reactionEmoji: "💚",
        welcomeMessage: true,
        welcomeInterval: 5 * 60 * 60 * 1000 // 5 hours in milliseconds
    },
    
    // ===== PAIRING SYSTEM =====
    pairSite: "https://your-pairing-site.com", // Replace with your site
    sessionExpiry: 24 * 60 * 60 * 1000, // 24 hours
    
    // ===== STATS =====
    totalUsers: 4066,
    
    // ===== COMMAND STATUS =====
    commandStatus: {
        gpt: true, gemini: true, blackbox: true, deepseek: true,
        sticker: true, toimg: true, tomp3: true,
        ytmp3: true, ytmp4: true, fb: true, ig: true, tiktok: true,
        google: true, lyrics: true, weather: true,
        ping: true, menu: true, channel: true, pair: true,
        setprefix: true, enable: true, disable: true, listcmds: true
    },
    
    // ===== FUNCTIONS =====
    getUptime: function() {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime % 86400 / 3600);
        const minutes = Math.floor(uptime % 3600 / 60);
        const seconds = Math.floor(uptime % 60);
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    },
    
    getTime: function() {
        return moment().tz(this.timezone).format('HH:mm:ss');
    },
    
    getDate: function() {
        return moment().tz(this.timezone).format('DD/MM/YYYY');
    },
    
    getRam: function() {
        const used = process.memoryUsage().rss / 1024 / 1024;
        return `${used.toFixed(2)} MB`;
    },
    
    isValidPrefix: function(p) {
        return this.allowedPrefixes.includes(p);
    }
};
