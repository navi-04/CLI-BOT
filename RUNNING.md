# Running CLI-BOT

Since you're experiencing issues with PowerShell execution policy and native module compilation, here are alternative ways to run CLI-BOT:

## Installation

```bash
# Clean install with only JavaScript dependencies
npm ci
```

## Running Commands Directly with Node.js

Instead of using the `cli-bot-cmd` command, use Node.js directly:

```bash
# Show help
node bin/cli-bot.js help

# Train a model
node bin/cli-bot.js train

# Make predictions
node bin/cli-bot.js predict

# Analyze text
node bin/cli-bot.js analyze -t text -i "This is a sample text"
```

## Using NPM Start

```bash
# Show help
npm start -- help

# Train a model
npm start -- train
```

## Creating Sample Data Files

If you don't have data files yet, create them like this:

```bash
# Create data directory
mkdir -p data

# Sample CSV for training
echo "feature1,feature2,target
10,20,0
30,40,1
50,60,0
70,80,1" > data/sample.csv

# Sample text data
echo '[
  {"text": "I love this product", "category": "positive"},
  {"text": "This works great", "category": "positive"},
  {"text": "I hate this", "category": "negative"},
  {"text": "Terrible experience", "category": "negative"}
]' > data/text-data.json
```

Try these alternatives and avoid any commands that require native module compilation or PowerShell execution.
