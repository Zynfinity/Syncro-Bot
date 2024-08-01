const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();

const startServer = async (connectToWhatsApp) => {
  // Server
  app.use(express.json());
  app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

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

module.exports = startServer;
