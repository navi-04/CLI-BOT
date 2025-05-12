# CLI-BOT

A customizable command line interface bot that helps you automate tasks.

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/CLI-BOT.git
cd CLI-BOT

# Install dependencies
npm install

# Link for global use
npm link
```

## Usage

```bash
# Show help
cli-bot help

# Show version
cli-bot --version

# Run the greet command
cli-bot greet

# Run the greet command with a name
cli-bot greet --name John
```

## Extending

You can add new commands by creating files in the `src/commands` directory. Each command file should export a function that takes the program instance as an argument.

Example:

```javascript
// src/commands/mycommand.js
module.exports = (program) => {
  program
    .command('mycommand')
    .description('Description of my command')
    .action(() => {
      console.log('My command was executed!');
    });
};
```

Then import your command in `src/index.js`:

```javascript
require('./commands/mycommand')(program);
```

## License

MIT
