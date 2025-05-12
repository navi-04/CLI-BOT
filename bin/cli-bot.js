#!/usr/bin/env node

const { program } = require('../src/index');

// Execute the CLI program
program.parse(process.argv);

// Show help if no command is provided
if (program.args.length === 0) {
  program.help();
}
