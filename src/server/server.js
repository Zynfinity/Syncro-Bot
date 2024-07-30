const { Server } = require('socket.io');
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const startServer = async (connectToWhatsApp) => {
  const io = new Server(server, {
    cors: {
      origin: "https://syncro-bot-web.vercel.app",
      methods: ["GET", "POST"]
    }
  });
  // Server
  app.use(express.json());
  app.use(cors({
    origin: '*', // or '*' to allow all origins
  }));
  app.use('/socket.io', express.static(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist')));

  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
  });
  app.post('/bot/start', (req, res) => {
    if (global.conn) return res.status(500).json({ status: false });
    connectToWhatsApp(io);
    return res.json({
      status: true
    })
  });
  app.post('/bot/status', (req, res) => {
    if (global.conn) return res.json({ isConnected: true });
    else return res.json({ isConnected: false });
  });
  app.post('/bot/group/join', async (req, res) => {
    try {
      const code = req.body.inviteCode;
      const join = await conn.groupAcceptInvite(code);
      console.log(join);
      return res.json(join)
    } catch (e) {

    }
  })
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
      return res.status(500).json({ status: false, msg: 'group not found' });
    }
  })
  // io.on("connection", (socket) => {
  //   console.log("connected");
  //   socket.on("disconnect", () => {
  //     console.log("Disconnect");
  //   })
  // });
  try {
    server.listen(3001, () => {
      console.log("Server started on port 3000");
    });
  } catch (e) {
    console.log("Server started on port 3000");
  }
};


module.exports = startServer;
