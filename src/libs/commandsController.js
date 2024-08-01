const fs = require('fs');
const path = require('path');
const { completions } = require('./ai');

const loadCommands = () => {
  const config = require('../config/config.json');
  const { commands: cmds } = config;
  console.log('Loading commands...');
  global.commands = {};
  const files = fs.readdirSync('./src/commands');
  files.forEach(file => {
    if (!file.startsWith('_') && file.endsWith('.js')) {
      console.log(file);
      const commandPath = '../commands/' + file;
      const command = require(commandPath);
      commands[command.name] = command;
      cmds[command.name] = command;
      fs.writeFileSync('./src/config/config.json', JSON.stringify(config, null, 2));
    }
  });

  return commands;
};

const executeCommand = async (commandName, { m, conn, body }) => {
  if (commands[commandName]) {
    commands[commandName].execute({ m, conn });
  }
  else {
    if (config.aiResponse) {
      try {
        const aiReply = await completions(body);
        const resmsg = aiReply.choices[0].message.content;
        m.reply(resmsg);
      } catch (e) {
        console.log(e)
      }
    }
  }
};

module.exports = {
  loadCommands,
  executeCommand
};
