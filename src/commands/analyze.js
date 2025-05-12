const inquirer = require('inquirer');
const path = require('path');
const mlManager = require('../utils/ml-manager');
const logger = require('../utils/logger');

module.exports = (program) => {
  program
    .command('analyze')
    .description('Analyze data or text')
    .option('-t, --type <type>', 'type of analysis: data, text, sentiment', 'data')
    .option('-d, --data <path>', 'path to data file (CSV for data analysis)')
    .option('-i, --input <text>', 'text to analyze (for text/sentiment analysis)')
    .action(async (options) => {
      try {
        // If options are incomplete, prompt the user
        if (!options.type || (!options.data && !options.input)) {
          const answers = await inquirer.prompt([
            {
              type: 'list',
              name: 'type',
              message: 'Type of analysis:',
              when: !options.type,
              choices: ['data', 'text', 'sentiment'],
              default: 'data'
            },
            {
              type: 'input',
              name: 'data',
              message: 'Path to data file:',
              when: (answers) => (!options.data && answers.type === 'data')
            },
            {
              type: 'input',
              name: 'input',
              message: 'Text to analyze:',
              when: (answers) => (!options.input && (answers.type === 'text' || answers.type === 'sentiment'))
            }
          ]);
          
          // Merge answers with options
          options = { ...options, ...answers };
        }
        
        const { type, data, input } = options;
        
        if (type === 'data') {
          logger.info('Loading data for analysis...');
          const dataPath = path.resolve(data);
          const dataset = await mlManager.loadCSV(dataPath);
          
          logger.info('Analyzing data...');
          // Display basic statistics
          const columns = Object.keys(dataset[0] || {});
          const rowCount = dataset.length;
          
          logger.success('Data Analysis Results:');
          console.log(`Rows: ${rowCount}`);
          console.log(`Columns: ${columns.length}`);
          console.log('Column Names:', columns);
          
          // Summary for numeric columns
          columns.forEach(col => {
            try {
              const values = dataset.map(row => parseFloat(row[col])).filter(val => !isNaN(val));
              if (values.length > 0) {
                const sum = values.reduce((a, b) => a + b, 0);
                const mean = sum / values.length;
                const min = Math.min(...values);
                const max = Math.max(...values);
                console.log(`\n${col} (numeric): min=${min}, max=${max}, mean=${mean.toFixed(2)}`);
              } else {
                console.log(`\n${col}: non-numeric or empty`);
              }
            } catch (err) {
              console.log(`\n${col}: error analyzing column`);
            }
          });
        } else if (type === 'sentiment') {
          logger.info('Analyzing sentiment...');
          const sentiment = mlManager.analyzeSentiment(input);
          logger.success(`Sentiment score: ${sentiment.toFixed(4)}`);
          
          if (sentiment > 0.2) {
            console.log('😄 Positive sentiment detected');
          } else if (sentiment < -0.2) {
            console.log('😞 Negative sentiment detected');
          } else {
            console.log('😐 Neutral sentiment detected');
          }
        } else { // text
          logger.info('Analyzing text...');
          const tokens = mlManager.tokenizer.tokenize(input);
          const wordCount = tokens.length;
          
          // Get frequency distribution
          const freqDist = {};
          tokens.forEach(word => {
            freqDist[word] = (freqDist[word] || 0) + 1;
          });
          
          const sortedWords = Object.entries(freqDist)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
          
          logger.success('Text Analysis Results:');
          console.log(`Word count: ${wordCount}`);
          console.log('Top 10 most frequent words:');
          sortedWords.forEach(([word, count], index) => {
            console.log(`${index + 1}. ${word}: ${count} occurrences`);
          });
        }
      } catch (err) {
        logger.error(`Analysis failed: ${err.message}`);
      }
    });
};
