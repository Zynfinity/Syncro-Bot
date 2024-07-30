
const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const QRCode = require('qrcode');

const { default: pino } = require('pino');
const startServer = require('./src/server/server.js');
require('dotenv').config();
const handler = require('./src/event/message');
const { loadCommands } = require('./src/libs/commandsController.js');
const Reminders = require("./src/commands/_reminder");
const path = require('path');
// const supabase = require('./src/libs/supabaseClient.js');
// Start Bot
const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

const deleteSession = async () => {
  const sessionPath = path.resolve('auth_info_baileys');
  if (fs.existsSync(sessionPath)) {
    fs.rmdirSync(sessionPath, { recursive: true });
    console.log('Session directory deleted');
  } else {
    console.log('Session directory does not exist');
  }
}

const connectToWhatsApp = async (app) => {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
  global.conn = makeWASocket({
    qrTimeout: 40000,
    auth: state,
    printQRInTerminal: true
  });
  conn.ev.on("creds.update", saveCreds);
  conn.ev.on('connection.update', async (update) => {
    if (update.qr) {
      const base64QR = await QRCode.toDataURL(update.qr);
      app.get('/bot/qr', (req, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        setInterval(() => {
          res.write(`data: ${JSON.stringify({ qr: base64QR })}\n\n`);
        }, 10000); // Send data every second
      });
    }
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error instanceof Boom)
        ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
        : false;
      console.log('connection closed due to', lastDisconnect.error, ', reconnecting', shouldReconnect);
      // reconnect if not logged out
      if (shouldReconnect) {
        startServer(connectToWhatsApp);
      } else {
        // Perform cleanup on logout
        console.log('Logged out, deleting session');
        deleteSession();
        startServer(connectToWhatsApp);
      }
    } else if (connection === 'open') {
      console.log('opened connection');
      loadCommands();
      Reminders(conn);
    }
  });

  conn.ev.on('messages.upsert', async (m) => {
    handler(m);
  });
}

startServer(connectToWhatsApp);