// lib/pair.js
const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config/settings');

class PairingSystem {
    constructor() {
        this.sessions = new Map();
        this.sessionDir = path.join(__dirname, '../sessions');
        this.ensureSessionDir();
    }

    ensureSessionDir() {
        if (!fs.existsSync(this.sessionDir)) {
            fs.mkdirSync(this.sessionDir, { recursive: true });
        }
    }

    // Generate random 8-digit code
    generatePairCode() {
        return crypto.randomInt(10000000, 99999999).toString();
    }

    // Create new pairing session
    createSession(phoneNumber) {
        const pairCode = this.generatePairCode();
        const sessionId = crypto.randomBytes(16).toString('hex');
        
        const session = {
            id: sessionId,
            phoneNumber: phoneNumber,
            pairCode: pairCode,
            createdAt: Date.now(),
            expiresAt: Date.now() + config.sessionExpiry,
            status: 'pending',
            sessionData: null
        };

        this.sessions.set(pairCode, session);
        
        // Save to file
        this.saveSession(session);
        
        return {
            pairCode,
            sessionId,
            expiresAt: session.expiresAt
        };
    }

    // Verify pair code
    verifyPairCode(pairCode) {
        const session = this.sessions.get(pairCode);
        
        if (!session) {
            return { valid: false, reason: 'Invalid code' };
        }

        if (Date.now() > session.expiresAt) {
            this.sessions.delete(pairCode);
            return { valid: false, reason: 'Code expired' };
        }

        return { valid: true, session };
    }

    // Store session data after successful pairing
    storeSessionData(pairCode, sessionData) {
        const session = this.sessions.get(pairCode);
        if (session) {
            session.status = 'paired';
            session.sessionData = sessionData;
            session.pairedAt = Date.now();
            
            // Save to file
            this.saveSession(session);
            
            // Also save as auth file for bot deployment
            const authPath = path.join(this.sessionDir, `auth_${session.phoneNumber}`);
            fs.writeJsonSync(authPath, sessionData, { spaces: 2 });
            
            return true;
        }
        return false;
    }

    // Get session by phone number
    getSessionByPhone(phoneNumber) {
        for (let [code, session] of this.sessions) {
            if (session.phoneNumber === phoneNumber) {
                return session;
            }
        }
        return null;
    }

    // Save session to file
    saveSession(session) {
        const filePath = path.join(this.sessionDir, `session_${session.pairCode}.json`);
        fs.writeJsonSync(filePath, session, { spaces: 2 });
    }

    // Load sessions from file
    loadSessions() {
        const files = fs.readdirSync(this.sessionDir).filter(f => f.startsWith('session_'));
        files.forEach(file => {
            try {
                const session = fs.readJsonSync(path.join(this.sessionDir, file));
                this.sessions.set(session.pairCode, session);
            } catch (e) {
                console.error('Error loading session:', e);
            }
        });
    }

    // Clean expired sessions
    cleanExpiredSessions() {
        const now = Date.now();
        for (let [code, session] of this.sessions) {
            if (now > session.expiresAt) {
                this.sessions.delete(code);
                // Delete session file
                const filePath = path.join(this.sessionDir, `session_${code}.json`);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }
    }

    // Generate pairing URL for website
    getPairingUrl(pairCode) {
        return `${config.pairSite}/pair?code=${pairCode}`;
    }
}

module.exports = new PairingSystem();
