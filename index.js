// index.js
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const config = require('./config/settings');
const AutoFeatures = require('./lib/auto');
const handleCommands = require('./commands/all');
const BotFunctions = require('./lib/functions');
const pairSystem = require('./lib/pair');

const funcs = new BotFunctions();

console.log('╔══════════════════════════════╗');
console.log('║     QUEEN BELLA V1           ║');
console.log('║     Powered by Rodgers       ║');
console.log('╚══════════════════════════════╝');

// Load existing sessions
pairSystem.loadSessions();

// Clean expired sessions every hour
setInterval(() => {
    pairSystem.cleanExpiredSessions();
}, 60 * 60 * 1000);

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        generateHighQualityLink: true
    });

    const auto = new AutoFeatures(sock);
    
    // Keep online
    auto.keepOnline();

    // Handle messages
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        // Auto features
        await auto.handleStatus(msg);
        await auto.autoRead(msg);

        // Ignore own messages
        if (msg.key.fromMe) return;

        const body = msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || 
                     msg.message.imageMessage?.caption || '';

        const sender = msg.key.remoteJid;
        const pushname = msg.pushName || 'User';
        
        const prefix = funcs.getPrefix();
        
        if (!body.startsWith(prefix)) return;

        const command = body.slice(1).split(' ')[0].toLowerCase();
        const args = body.slice(prefix.length + command.length).trim().split(' ');

        console.log(`[${new Date().toLocaleTimeString()}] ${command} from ${pushname}`);

        try {
            await handleCommands(sock, msg, command, args, sender, pushname);
        } catch (error) {
            console.error('Command error:', error);
            await sock.sendMessage(sender, { text: '❌ Error executing command' });
        }
    });

    // Handle connection updates
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            console.log('Connection closed, reconnecting...');
            startBot();
        } else if (connection === 'open') {
            console.log('✅ QUEEN BELLA V1 connected!');
            
            // Send welcome to owner
            sock.sendMessage(config.ownerNumber + '@s.whatsapp.net', {
                text: `✅ *${config.botName}* is now online!\nTime: ${config.getTime()}\nDate: ${config.getDate()}`
            });
        }
    });

    // Save credentials
    sock.ev.on('creds.update', saveCreds);
}

// Start bot
startBot().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
