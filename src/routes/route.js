const express = require('express')
const router = express.Router();
const { readFileSync, writeFileSync } = require('fs');

router.get('/bot/status', (req, res) => {
  if (global.conn) return res.json({ isConnected: true });
  else return res.json({ isConnected: false });
});

router.post('/bot/group/join', async (req, res) => {
  try {
    const code = req.body.inviteCode;
    const join = await conn.groupAcceptInvite(code);
    return res.json(join);
  } catch (e) {
    return res.status(500).json({ status: false, msg: 'Failed to join group' });
  }
});

router.post('/bot/group/check', async (req, res) => {
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

router.post('/bot/config', async (req, res) => {
  const newConfig = req.body;
  const config = require('../config/config.json');
  const configProps = Object.keys(newConfig);
  const configVal = Object.values(newConfig);
  for (let i = 0; i < configProps.length; i++) {
    config[configProps[i]] = configVal[i];
  }
  await writeFileSync('./src/config/config.json', JSON.stringify(config, null, 2));
  return res.json({
    status: true,
    msg: 'Config updated'
  });
});
router.get('/bot/config', async (Req, res) => {
  const config = require('../config/config.json');
  return res.json(config);
});

router.get('/bot/commands', async (req, res) => {
  const config = require('../config/config.json');
  return res.json({ commands: Object.values(config.commands) });
})
module.exports = router;
