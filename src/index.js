const { Command } = require('commander');
const { version } = require('../package.json');
const logger = require('./utils/logger');

// Create the program
const program = new Command();

// Set basic program information
program
  .name('cli-bot')
  .description('A customizable command line interface bot')
  .version(version);

// Load commands
require('./commands/help')(program);
require('./commands/greet')(program);

// Load ML commands
require('./commands/train')(program);
require('./commands/predict')(program);
require('./commands/classify')(program);
require('./commands/cluster')(program);
require('./commands/analyze')(program);
require('./commands/visualize')(program);
require('./commands/preprocess')(program);
require('./commands/evaluate')(program);
require('./commands/export')(program);
require('./commands/import')(program);
require('./commands/summarize')(program);
require('./commands/extract')(program);
require('./commands/transform')(program);
require('./commands/recommend')(program);
require('./commands/search')(program);
require('./commands/optimize')(program);
require('./commands/detect')(program);
require('./commands/generate')(program);
require('./commands/compare')(program);
require('./commands/deploy')(program);

// Error handling
program.on('command:*', () => {
  logger.error(`Invalid command: ${program.args.join(' ')}\nSee --help for a list of available commands.`);
  process.exit(1);
});

module.exports = { program, logger };
