/**
 * Minimal CLI Bot - No dependencies version
 */

const fs = require('fs');
const path = require('path');

// Simple colored console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  yellow: '\x1b[33m'
};

// Simple logger
const logger = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✖${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

// Create directories for models and data
const dataDir = path.join(process.cwd(), 'data');
const modelsDir = path.join(process.cwd(), 'models');

// Ensure directories exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

// Simple command handler
const commands = {
  help: function() {
    console.log(`
${colors.bright}CLI-BOT - Minimal Version${colors.reset}

Available Commands:
  help                      Show this help message
  greet [name]              Greet a user
  create-data               Create sample data files
  create-folder <name> [parent]  Create a new folder (default in data dir)
  list-data                 List files in the data directory
  sentiment <text>          Simple sentiment analysis (positive/negative)
  version                   Show version
    `);
  },
  
  greet: function(args) {
    const name = args[0] || 'User';
    logger.success(`Hello, ${name}! Welcome to the minimal CLI-BOT.`);
  },
  
  'create-data': function() {
    // Create a simple CSV file
    const csvContent = 'name,age,score\nAlice,25,95\nBob,30,85\nCharlie,22,90\nDiana,28,88\n';
    fs.writeFileSync(path.join(dataDir, 'sample.csv'), csvContent);
    
    // Create a simple JSON file
    const jsonContent = JSON.stringify([
      { text: 'I love this product', sentiment: 'positive' },
      { text: 'This is great', sentiment: 'positive' },
      { text: 'Not very good', sentiment: 'negative' },
      { text: 'Terrible experience', sentiment: 'negative' }
    ], null, 2);
    fs.writeFileSync(path.join(dataDir, 'sentiments.json'), jsonContent);
    
    logger.success('Sample data files created in the data directory');
  },
  
  'list-data': function() {
    try {
      const files = fs.readdirSync(dataDir);
      if (files.length === 0) {
        logger.warning('No files found in the data directory');
        return;
      }
      
      console.log(`\n${colors.bright}Files in the data directory:${colors.reset}`);
      files.forEach(file => {
        const stats = fs.statSync(path.join(dataDir, file));
        console.log(`- ${file} (${stats.size} bytes)`);
      });
    } catch (error) {
      logger.error(`Error listing files: ${error.message}`);
    }
  },
  
  'create-folder': function(args) {
    if (!args[0]) {
      logger.error('Please provide a folder name');
      return;
    }
    
    const folderName = args[0];
    const parentDir = args[1] || dataDir;  // Default to data directory if not specified
    const newFolderPath = path.join(parentDir, folderName);
    
    try {
      if (fs.existsSync(newFolderPath)) {
        logger.warning(`Folder "${folderName}" already exists in ${parentDir}`);
      } else {
        fs.mkdirSync(newFolderPath, { recursive: true });
        logger.success(`Created folder: ${newFolderPath}`);
      }
    } catch (error) {
      logger.error(`Failed to create folder: ${error.message}`);
    }
  },
  
  'sentiment': function(args) {
    if (!args[0]) {
      logger.error('Please provide text for sentiment analysis');
      return;
    }
    
    const text = args.join(' ').toLowerCase();
    
    // Very basic sentiment analysis with predefined word lists
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'like', 'happy', 'best', 'favorite'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'poor', 'worst', 'horrible'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    const words = text.split(/\s+/);
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) {
      logger.success(`Sentiment: Positive (score: ${positiveCount - negativeCount})`);
    } else if (negativeCount > positiveCount) {
      logger.error(`Sentiment: Negative (score: ${negativeCount - positiveCount})`);
    } else {
      logger.info('Sentiment: Neutral');
    }
  },
  
  'version': function() {
    const pkg = require('../package.json');
    logger.info(`CLI-BOT version: ${pkg.version}`);
  }
};

// Process command line arguments
const [,, cmd, ...args] = process.argv;

// Execute the command or show help
if (!cmd || cmd === 'help') {
  commands.help();
} else if (commands[cmd]) {
  commands[cmd](args);
} else {
  logger.error(`Unknown command: ${cmd}`);
  logger.info('Use "help" to see available commands');
}
