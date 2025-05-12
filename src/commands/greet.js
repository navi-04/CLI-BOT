const inquirer = require('inquirer');
const logger = require('../utils/logger');

module.exports = (program) => {
  program
    .command('greet')
    .description('Greet the user')
    .option('-n, --name <name>', 'name to greet')
    .action(async (options) => {
      let name = options.name;
      
      // If no name provided, ask for it
      if (!name) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'What is your name?',
            default: 'User'
          }
        ]);
        name = answers.name;
      }
      
      logger.success(`Hello, ${name}! I'm CLI-BOT, at your service.`);
    });
};
