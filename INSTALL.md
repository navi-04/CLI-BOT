# CLI-BOT Installation Guide

## Quick Setup (Core functionality only)

If you're experiencing issues with complex dependencies, use this simplified installation approach:

```bash
# Install only core modules needed for the CLI to function
npm run setup
```

## Full Installation

For a complete installation with ML capabilities:

```bash
# Install all dependencies
npm install
```

## Troubleshooting

If you encounter errors with native modules that require compilation:

1. First install Visual Studio with "Desktop development with C++" workload
   - Download from: https://visualstudio.microsoft.com/downloads/

2. Or use the minimal installation for basic CLI functionality only:
   ```bash
   npm install commander chalk inquirer
   ```

## Running the CLI

Once dependencies are installed, you can run CLI-BOT using:

```bash
# Via npm start
npm start -- help

# Or directly with node
node ./bin/cli-bot.js help
```
