const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs-extra');
const mlManager = require('../utils/ml-manager');
const logger = require('../utils/logger');
const natural = require('natural');

module.exports = (program) => {
  program
    .command('classify')
    .description('Classify text using natural language processing')
    .option('-t, --train <path>', 'path to training data (JSON file with text and category)')
    .option('-i, --input <text>', 'text to classify')
    .option('-m, --model <name>', 'model name to save or load', 'text-classifier')
    .option('-s, --save', 'save the trained classifier', false)
    .option('-l, --load', 'load a pre-trained classifier', false)
    .action(async (options) => {
      try {
        // If options are incomplete, prompt the user
        if ((!options.train && !options.load) || !options.input) {
          const answers = await inquirer.prompt([
            {
              type: 'list',
              name: 'mode',
              message: 'What do you want to do?',
              choices: ['Train new classifier', 'Load existing classifier'],
              when: !options.train && !options.load
            },
            {
              type: 'input',
              name: 'train',
              message: 'Path to training data (JSON):',
              when: (answers) => answers.mode === 'Train new classifier' && !options.train
            },
            {
              type: 'confirm',
              name: 'save',
              message: 'Save the trained classifier?',
              default: true,
              when: (answers) => answers.mode === 'Train new classifier' && !options.save
            },
            {
              type: 'input',
              name: 'model',
              message: 'Model name:',
              default: 'text-classifier',
              when: (answers) => (answers.mode === 'Train new classifier' && answers.save) || 
                     answers.mode === 'Load existing classifier'
            },
            {
              type: 'input',
              name: 'input',
              message: 'Text to classify:',
              when: !options.input
            }
          ]);
          
          if (answers.mode === 'Train new classifier') {
            options.train = answers.train;
            options.save = answers.save;
          } else if (answers.mode === 'Load existing classifier') {
            options.load = true;
          }
          
          // Merge answers with options
          options = { ...options, ...answers };
        }
        
        let classifier;
        
        if (options.load) {
          logger.info(`Loading classifier "${options.model}"...`);
          const modelPath = path.join(mlManager.modelsDir, `${options.model}.json`);
          
          if (!fs.existsSync(modelPath)) {
            logger.error(`Model file not found: ${modelPath}`);
            return;
          }
          
          classifier = natural.BayesClassifier.restore(
            JSON.parse(fs.readFileSync(modelPath, 'utf8'))
          );
          logger.info('Classifier loaded successfully');
        } else {
          logger.info('Creating new classifier');
          classifier = new natural.BayesClassifier();
          
          // Load training data
          const trainingDataPath = path.resolve(options.train);
          const trainingData = JSON.parse(fs.readFileSync(trainingDataPath, 'utf8'));
          
          logger.info(`Training classifier with ${trainingData.length} examples...`);
          trainingData.forEach(item => {
            classifier.addDocument(item.text, item.category);
          });
          
          classifier.train();
          logger.info('Classifier training complete');
          
          // Save if requested
          if (options.save) {
            const modelPath = path.join(mlManager.modelsDir, `${options.model}.json`);
            fs.writeFileSync(modelPath, JSON.stringify(classifier));
            logger.info(`Classifier saved as "${options.model}"`);
          }
        }
        
        // Classify the input text
        const { input } = options;
        const classification = classifier.classify(input);
        const classifications = classifier.getClassifications(input);
        
        logger.success(`Classification result: ${classification}`);
        logger.info('Confidence scores:');
        classifications.forEach(c => {
          console.log(`${c.label}: ${(c.value * 100).toFixed(2)}%`);
        });
        
      } catch (err) {
        logger.error(`Classification failed: ${err.message}`);
      }
    });
};
