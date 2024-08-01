
const { owner } = require("../config/config");
const { executeCommand } = require("../libs/commandsController");
const _function = require("./function");



/**
 * @description Fungsi handler untuk menghandle pesan.
 * Fungsi ini mengambil pesan dari WhatsApp, mengekstrak informasi penting, dan menjalankan command yang sesuai.
 * @param {Object} options - Opsi yang dikirim ke handler.
 * @param {Array} options.messages - Array yang berisi pesan-pesan yang diterima.
 */
const handler = async ({ messages }) => {
  global.config = require('../config/config.json');
  // Destrukturisasi properti penting dari pesan pertama dalam array messages
  const { key: { remoteJid: from, fromMe }, message } = messages[0];
  const m = messages[0];

  // Memanggil fungsi custom untuk menambahkan metode tambahan ke objek pesan
  _function(conn, m);

  // Jika pesan dikirim oleh bot sendiri, hentikan eksekusi
  if (fromMe && (config.public ? true : !owner.includes(from))) return;

  // Menentukan isi pesan
  const body = message ? (message.extendedTextMessage ? message.extendedTextMessage.text : (message.conversation ? message.conversation : '')) : '';

  // Memisahkan isi pesan menjadi command dan argumen
  const args = body.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Menjalankan command yang sesuai dengan nama command yang diambil dari pesan
  executeCommand(commandName, { m, conn, body });
};


module.exports = handler;
