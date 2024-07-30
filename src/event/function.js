async function _function(conn, m) {
  m.key.isGroup = m.key.remoteJid && m.key.remoteJid.endsWith('@g.us') ? true : false;
  m.reply = async (text) => {
    await conn.sendMessage(m.key.remoteJid, { text }, { quoted: m })
  }
}
module.exports = _function;
