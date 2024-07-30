const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const startServer = async (connectToWhatsApp) => {
  // Server
  app.use(express.json());
  app.use(cors({
    origin: 'https://syncro-bot-web.vercel.app',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  }));
  // app.all('/', function (req, res, next) {
  //   res.header("Access-Control-Allow-Origin", "*");
  //   res.header("Access-Control-Allow-Headers", "X-Requested-With");
  //   next();
  // });

  app.post('/bot/start', (req, res) => {
    if (global.conn) return res.status(500).json({ status: false });
    connectToWhatsApp(app);
    return res.json({
      status: true
    });
  });

  app.post('/bot/status', (req, res) => {
    if (global.conn) return res.json({ isConnected: true });
    else return res.json({ isConnected: false });
  });

  app.post('/bot/group/join', async (req, res) => {
    try {
      const code = req.body.inviteCode;
      const join = await conn.groupAcceptInvite(code);
      return res.json(join);
    } catch (e) {
      return res.status(500).json({ status: false, msg: 'Failed to join group' });
    }
  });

  app.post('/bot/group/check', async (req, res) => {
    try {
      const code = req.body.inviteCode;
      const join = await conn.groupGetInviteInfo(code);
      const date = new Date(join.creation * 1000);
      return res.json({
        group_id: join.id,
        group_name: join.subject,
        group_owner: join.owner.split('@')[0],
        group_creation: date.toLocaleString()
      });
    } catch (e) {
      return res.status(500).json({ status: false, msg: 'Group not found' });
    }
  });

  try {
    server.listen(3001, () => {
      console.log("Server started on port 3000");
    });
  } catch (e) {
    console.log("Error starting server:", e);
  }
  connectToWhatsApp(app)
};

module.exports = startServer;
