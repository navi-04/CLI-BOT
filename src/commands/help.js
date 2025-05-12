const logger = require('../utils/logger');

module.exports = (program) => {
  // Help command is automatically provided by commander
  // This file is here for consistency and potential customization
  
  // Override the built-in help command if needed
  /*
  program
    .command('help [command]')
    .description('Display help for a specific command')
    .action((command) => {
      if (command) {
        // Display help for specific command
        const cmd = program.commands.find(c => c.name() === command);
        if (cmd) {
          cmd.help();
        } else {
          logger.error(`Unknown command: ${command}`);
        }
      } else {
        // Display general help
        program.help();
      }
    });
  */
};
