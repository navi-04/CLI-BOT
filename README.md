# CLI-BOT (Minimal Version)

A simplified command line interface bot with zero dependencies.

## Installation

No installation needed! Just clone the repository and run the CLI directly.

```bash
# Clone the repository
git clone https://github.com/yourusername/CLI-BOT.git
cd CLI-BOT
```

## Usage

```bash
# Run with npm
npm start -- help

# Or run directly with node
node src/minimal-cli.js help
```

## Available Commands

- `help`: Show help information
- `greet [name]`: Greet a user
- `create-data`: Create sample data files
- `list-data`: List files in the data directory
- `sentiment <text>`: Simple sentiment analysis
- `version`: Show version information

## Examples

```bash
# Greet a user
node src/minimal-cli.js greet John

# Create sample data files
node src/minimal-cli.js create-data

# Perform sentiment analysis
node src/minimal-cli.js sentiment I love this CLI tool it's amazing
```

## Adding New Commands

To add new commands, edit the `src/minimal-cli.js` file and add a new function to the `commands` object.

## Future Enhancements

For more advanced ML features, you'll need to install additional dependencies. Please ensure you have the appropriate build tools if you want to use packages with native dependencies.
