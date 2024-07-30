const fs = require('fs');
const path = require('path');

const loadCommands = () => {
  global.commands = {};
  const files = fs.readdirSync('./src/commands');
  files.forEach(file => {
    if (file.endsWith('.js')) {
      const commandPath = '../commands/' + file;
      const command = require(commandPath);
      commands[command.name] = command;
    }
  });

  return commands;
};

const executeCommand = (commandName, { m, conn }) => {
  if (commands[commandName]) {
    commands[commandName].execute({ m, conn });
  }
  // else {
  //   m.reply('Command not found.');
  // }
};

module.exports = {
  loadCommands,
  executeCommand
};
