const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const QRCode = require('qrcode');
const { default: pino } = require('pino');
require('dotenv').config();
const handler = require('./src/event/message');
const { loadCommands } = require('./src/libs/commandsController.js');
const Reminders = require("./src/commands/_reminder");
const route = require('./src/routes/route.js');

const app = express();
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
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
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
        }, 1000);
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
        connectToWhatsApp(app);
      } else {
        // Perform cleanup on logout
        console.log('Logged out, deleting session');
        deleteSession();
        connectToWhatsApp(app);
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
};

const startServer = async () => {
  app.use(express.json());
  app.use(cors({
    origin: 'https://syncro-bot-web.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
  app.use(route);

  app.post('/bot/start', (req, res) => {
    if (global.conn) return res.status(500).json({ status: false });
    connectToWhatsApp(app);
    return res.json({ status: true });
  });

  const server = app.listen(3001, (err) => {
    if (err) {
      console.error("Error starting server:", err);
    } else {
      console.log("Server started on port 3001");
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use.`);
    } else {
      console.error("Server error:", err);
    }
  });
  connectToWhatsApp(app);
};

startServer();
