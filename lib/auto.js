// lib/auto.js
const config = require('../config/settings');

class AutoFeatures {
    constructor(sock) {
        this.sock = sock;
        this.config = config.autoFeatures;
    }

    // Auto view & react to status
    async handleStatus(msg) {
        if (msg.key?.remoteJid === 'status@broadcast') {
            if (this.config.viewStatus) {
                await this.sock.readMessages([msg.key]);
            }
            if (this.config.reactStatus) {
                await this.sock.sendMessage(msg.key.remoteJid, {
                    react: {
                        text: this.config.reactionEmoji,
                        key: msg.key
                    }
                });
            }
        }
    }

    // Always online
    async keepOnline() {
        if (this.config.alwaysOnline) {
            setInterval(async () => {
                await this.sock.sendPresenceUpdate('available');
            }, 60000);
        }
    }

    // Auto read messages
    async autoRead(msg) {
        if (this.config.readMessages && msg.key?.remoteJid !== 'status@broadcast') {
            await this.sock.readMessages([msg.key]);
        }
    }
}

module.exports = AutoFeatures;
