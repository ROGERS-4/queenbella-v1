// commands/all.js
const config = require('../config/settings');
const BotFunctions = require('../lib/functions');
const pairSystem = require('../lib/pair');
const funcs = new BotFunctions();
const fs = require('fs-extra');

module.exports = async (sock, msg, command, args, sender, pushname) => {
    
    const currentPrefix = funcs.getPrefix();
    const owner = config.ownerNumber.split('@')[0];
    const isOwner = sender.includes(owner);

    // Check if command is enabled
    if (!isOwner && !funcs.isCommandEnabled(command, sender)) {
        return await sock.sendMessage(sender, { 
            text: `❌ Command "${currentPrefix}${command}" is currently disabled.` 
        });
    }

    // ===== WELCOME MESSAGE (Auto-send every 5 hours) =====
    if (await funcs.shouldSendWelcome()) {
        const welcomeMsg = funcs.getWelcomeMessage();
        await sock.sendMessage(sender, { text: welcomeMsg });
    }

    // ===== MENU COMMAND WITH IMAGE =====
    if (command === 'menu') {
        const menuText = `╭══〘〘 *${config.botName}* 〙〙═⊷
┃❍ *Mode:* ${config.mode}
┃❍ *Prefix:* [ ${currentPrefix} ]
┃❍ *User:* ${pushname}
┃❍ *Plugins:* 200+
┃❍ *Version:* 5.0.0
┃❍ *Uptime:* ${config.getUptime()}
┃❍ *Time Now:* ${config.getTime()}
┃❍ *Date Today:* ${config.getDate()}
┃❍ *Time Zone:* ${config.timezone}
┃❍ *Server Ram:* ${config.getRam()}
╰═════════════════════⊷

╭━━━━❮ *AI* ❯━⊷ 
┃◇ ${currentPrefix}gpt [question]
┃◇ ${currentPrefix}gemini [question]
┃◇ ${currentPrefix}blackbox [question]
╰━━━━━━━━━━━━━━━━━⊷

╭━━━━❮ *CONVERTER* ❯━⊷ 
┃◇ ${currentPrefix}sticker
┃◇ ${currentPrefix}toimg
┃◇ ${currentPrefix}tomp3
╰━━━━━━━━━━━━━━━━━⊷

╭━━━━❮ *DOWNLOADER* ❯━⊷ 
┃◇ ${currentPrefix}ytmp3 [url]
┃◇ ${currentPrefix}ytmp4 [url]
┃◇ ${currentPrefix}fb [url]
┃◇ ${currentPrefix}ig [url]
┃◇ ${currentPrefix}tiktok [url]
╰━━━━━━━━━━━━━━━━━⊷

╭━━━━❮ *SEARCH* ❯━⊷ 
┃◇ ${currentPrefix}google [query]
┃◇ ${currentPrefix}lyrics [song]
┃◇ ${currentPrefix}weather [city]
╰━━━━━━━━━━━━━━━━━⊷

╭━━━━❮ *TOOLS* ❯━⊷ 
┃◇ ${currentPrefix}ping
┃◇ ${currentPrefix}channel
┃◇ ${currentPrefix}pair [number]
┃◇ ${currentPrefix}joke
┃◇ ${currentPrefix}quote
╰━━━━━━━━━━━━━━━━━⊷

╭━━━━❮ *OWNER* ❯━⊷ 
┃◇ ${currentPrefix}setprefix [new prefix]
┃◇ ${currentPrefix}enable [command]
┃◇ ${currentPrefix}disable [command]
┃◇ ${currentPrefix}listcmds
╰━━━━━━━━━━━━━━━━━⊷

${config.footer}`;

        // Get random menu image
        const imagePath = funcs.getRandomMenuImage();
        
        try {
            if (await fs.pathExists(imagePath)) {
                const imageBuffer = await fs.readFile(imagePath);
                await sock.sendMessage(sender, {
                    image: imageBuffer,
                    caption: menuText
                });
            } else {
                // Fallback to text if image not found
                await sock.sendMessage(sender, { text: menuText });
            }
        } catch (error) {
            console.error('Error sending menu image:', error);
            await sock.sendMessage(sender, { text: menuText });
        }
    }

    // ===== PING COMMAND =====
    else if (command === 'ping') {
        const start = Date.now();
        const pingMsg = `🚀 *BWM-XMD PING*\n\n` +
            `Bot: ${config.botName}\n` +
            `Status: Online\n` +
            `Mode: ${config.mode}\n\n` +
            `*BWM-XMD is blazing fast! 🚀*`;
        
        await sock.sendMessage(sender, { text: pingMsg });
        const end = Date.now();
        const speed = ((end - start) / 1000).toFixed(4);
        
        await sock.sendMessage(sender, { 
            text: `*Speed:* ${speed} ms` 
        });
    }

    // ===== PAIR COMMAND =====
    else if (command === 'pair') {
        if (!args[0]) {
            return await sock.sendMessage(sender, {
                text: `❌ Please provide your phone number.\nExample: ${currentPrefix}pair 254755660053`
            });
        }

        let phoneNumber = args[0].replace(/[^0-9]/g, '');
        
        // Validate phone number
        if (phoneNumber.length < 10) {
            return await sock.sendMessage(sender, {
                text: '❌ Invalid phone number. Use format: 254XXXXXXXXX'
            });
        }

        // Generate pair code
        const session = pairSystem.createSession(phoneNumber);
        
        const pairMsg = `🔐 *WhatsApp Pairing Code*\n\n` +
            `Your 8-digit code: *${session.pairCode}*\n\n` +
            `📱 Phone: ${phoneNumber}\n` +
            `⏰ Expires: ${new Date(session.expiresAt).toLocaleString()}\n\n` +
            `Visit: ${config.pairSite}\n` +
            `Enter the code to get your session file.\n\n` +
            `${config.footer}`;

        await sock.sendMessage(sender, { text: pairMsg });
        
        // Notify owner
        if (!isOwner) {
            await sock.sendMessage(owner + '@s.whatsapp.net', {
                text: `🔐 New pairing request\nPhone: ${phoneNumber}\nCode: ${session.pairCode}`
            });
        }
    }

    // ===== CHANNEL COMMAND =====
    else if (command === 'channel') {
        const channelMsg = `📢 *Join Our Channel*\n\n` +
            `${config.channelName}\n\n` +
            `🔗 ${config.channelLink}\n\n` +
            `${config.footer}`;
        
        await sock.sendMessage(sender, { text: channelMsg });
    }

    // ===== SET PREFIX COMMAND =====
    else if (command === 'setprefix' && isOwner) {
        if (!args[0]) {
            return await sock.sendMessage(sender, { 
                text: `Current prefix: ${currentPrefix}\nAllowed: ${config.allowedPrefixes.join(', ')}` 
            });
        }
        
        const newPrefix = args[0];
        if (funcs.setPrefix(newPrefix)) {
            await sock.sendMessage(sender, { 
                text: `✅ Prefix changed to "${newPrefix}"` 
            });
        } else {
            await sock.sendMessage(sender, { 
                text: `❌ Invalid prefix! Allowed: ${config.allowedPrefixes.join(', ')}` 
            });
        }
    }

    // ===== ENABLE/DISABLE COMMANDS =====
    else if ((command === 'enable' || command === 'disable') && isOwner) {
        if (!args[0]) {
            return await sock.sendMessage(sender, { 
                text: `Example: ${currentPrefix}${command} gpt` 
            });
        }
        
        const targetCmd = args[0];
        const status = command === 'enable';
        
        if (await funcs.toggleCommand(targetCmd, status)) {
            await sock.sendMessage(sender, { 
                text: `✅ Command "${targetCmd}" ${status ? 'enabled' : 'disabled'}` 
            });
        } else {
            await sock.sendMessage(sender, { 
                text: `❌ Command "${targetCmd}" not found!` 
            });
        }
    }

    // ===== LIST COMMANDS =====
    else if (command === 'listcmds' && isOwner) {
        const { enabled, disabled } = funcs.getEnabledCommands();
        
        const listMsg = `📋 *Command Status*\n\n` +
            `*Enabled (${enabled.length}):*\n${enabled.join(', ')}\n\n` +
            `*Disabled (${disabled.length}):*\n${disabled.join(', ')}\n\n` +
            `${config.footer}`;
        
        await sock.sendMessage(sender, { text: listMsg });
    }

    // ===== AI COMMANDS =====
    else if (['gpt', 'gemini', 'blackbox', 'deepseek'].includes(command)) {
        if (!args[0]) {
            return await sock.sendMessage(sender, { 
                text: `Example: ${currentPrefix}${command} What is love?` 
            });
        }
        await sock.sendMessage(sender, { text: '🤔 Thinking...' });
        const res = await funcs.aiChat(command, args.join(' '));
        await sock.sendMessage(sender, { text: res });
    }

    // ===== STICKER =====
    else if (command === 'sticker') {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted || (!quoted.imageMessage && !quoted.videoMessage)) {
            return await sock.sendMessage(sender, { 
                text: `Reply to an image/video with ${currentPrefix}sticker` 
            });
        }
        await sock.sendMessage(sender, { text: '🔄 Creating sticker...' });
        const media = quoted.imageMessage || quoted.videoMessage;
        const buffer = await funcs.downloadMedia(media, media === quoted.imageMessage ? 'image' : 'video');
        const sticker = await funcs.makeSticker(buffer);
        await sock.sendMessage(sender, { sticker: sticker });
    }

    // ===== YTMP3 =====
    else if (command === 'ytmp3') {
        if (!args[0]) {
            return await sock.sendMessage(sender, { 
                text: `Example: ${currentPrefix}ytmp3 https://youtu.be/xxx` 
            });
        }
        await sock.sendMessage(sender, { text: '⬇️ Downloading audio...' });
        const res = await funcs.download('ytmp3', args[0]);
        if (res?.result?.download_url) {
            await sock.sendMessage(sender, { 
                audio: { url: res.result.download_url },
                mimetype: 'audio/mp4'
            });
        } else {
            await sock.sendMessage(sender, { text: '❌ Download failed' });
        }
    }

    // ===== YTMP4 =====
    else if (command === 'ytmp4') {
        if (!args[0]) {
            return await sock.sendMessage(sender, { 
                text: `Example: ${currentPrefix}ytmp4 https://youtu.be/xxx` 
            });
        }
        await sock.sendMessage(sender, { text: '⬇️ Downloading video...' });
        const res = await funcs.download('ytmp4', args[0]);
        if (res?.result?.download_url) {
            await sock.sendMessage(sender, { 
                video: { url: res.result.download_url }
            });
        } else {
            await sock.sendMessage(sender, { text: '❌ Download failed' });
        }
    }

    // ===== FACEBOOK =====
    else if (command === 'fb') {
        if (!args[0]) {
            return await sock.sendMessage(sender, { 
                text: `Example: ${currentPrefix}fb https://fb.com/xxx` 
            });
        }
        await sock.sendMessage(sender, { text: '⬇️ Downloading Facebook video...' });
        const res = await funcs.download('fb', args[0]);
        if (res?.result?.download_url) {
            await sock.sendMessage(sender, { 
                video: { url: res.result.download_url }
            });
        } else {
            await sock.sendMessage(sender, { text: '❌ Download failed' });
        }
    }

    // ===== INSTAGRAM =====
    else if (command === 'ig') {
        if (!args[0]) {
            return await sock.sendMessage(sender, { 
                text: `Example: ${currentPrefix}ig https://instagram.com/p/xxx` 
            });
        }
        await sock.sendMessage(sender, { text: '⬇️ Downloading Instagram video...' });
        const res = await funcs.download('ig', args[0]);
        if (res?.result?.download_url) {
            await sock.sendMessage(sender, { 
                video: { url: res.result.download_url }
            });
        } else {
            await sock.sendMessage(sender, { text: '❌ Download failed' });
        }
    }

    // ===== TIKTOK =====
    else if (command === 'tiktok') {
        if (!args[0]) {
            return await sock.sendMessage(sender, { 
                text: `Example: ${currentPrefix}tiktok https://tiktok.com/xxx` 
            });
        }
        await sock.sendMessage(sender, { text: '⬇️ Downloading TikTok video...' });
        const res = await funcs.download('tiktok', args[0]);
        if (res?.result?.download_url) {
            await sock.sendMessage(sender, { 
                video: { url: res.result.download_url }
            });
        } else {
            await sock.sendMessage(sender, { text: '❌ Download failed' });
        }
    }

    // ===== GOOGLE SEARCH =====
    else if (command === 'google') {
        if (!args[0]) {
            return await sock.sendMessage(sender, { 
                text: `Example: ${currentPrefix}google What is AI` 
            });
        }
        await sock.sendMessage(sender, { text: '🔍 Searching Google...' });
        const res = await funcs.search('google', args.join(' '));
        let reply = '';
        if (res?.result && res.result.length > 0) {
            res.result.slice(0, 3).forEach((item, i) => {
                reply += `${i+1}. *${item.title}*\n${item.link}\n${item.snippet}\n\n`;
            });
        } else {
            reply = 'No results found';
        }
        await sock.sendMessage(sender, { text: reply });
    }

    // ===== LYRICS =====
    else if (command === 'lyrics') {
        if (!args[0]) {
            return await sock.sendMessage(sender, { 
                text: `Example: ${currentPrefix}lyrics Faded` 
            });
        }
        await sock.sendMessage(sender, { text: '🔍 Searching lyrics...' });
        const res = await funcs.search('lyrics', args.join(' '));
        if (res?.result?.lyrics) {
            await sock.sendMessage(sender, { 
                text: `*${res.result.title}*\n\n${res.result.lyrics}` 
            });
        } else {
            await sock.sendMessage(sender, { text: 'Lyrics not found' });
        }
    }

    // ===== WEATHER =====
    else if (command === 'weather') {
        if (!args[0]) {
            return await sock.sendMessage(sender, { 
                text: `Example: ${currentPrefix}weather Nairobi` 
            });
        }
        await sock.sendMessage(sender, { text: '🌤️ Checking weather...' });
        const res = await funcs.search('weather', args.join(' '));
        if (res?.result) {
            await sock.sendMessage(sender, { text: 
                `*Weather in ${res.result.location}*\n` +
                `🌡️ Temperature: ${res.result.temperature}\n` +
                `💧 Humidity: ${res.result.humidity}\n` +
                `💨 Wind: ${res.result.wind}\n` +
                `☁️ Condition: ${res.result.condition}`
            });
        } else {
            await sock.sendMessage(sender, { text: 'Weather not found' });
        }
    }

    // ===== JOKE =====
    else if (command === 'joke') {
        const joke = await funcs.getJoke();
        await sock.sendMessage(sender, { text: joke });
    }

    // ===== QUOTE =====
    else if (command === 'quote') {
        const quote = await funcs.getQuote();
        await sock.sendMessage(sender, { text: quote });
    }
};
