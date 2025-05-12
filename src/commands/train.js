const inquirer = require('inquirer');
const path = require('path');
const mlManager = require('../utils/ml-manager');
const logger = require('../utils/logger');

module.exports = (program) => {
  program
    .command('train')
    .description('Train a machine learning model')
    .option('-d, --data <path>', 'path to training data (CSV)')
    .option('-f, --features <list>', 'comma-separated list of feature columns')
    .option('-t, --target <column>', 'target column to predict')
    .option('-m, --model <name>', 'name for the saved model')
    .option('-e, --epochs <number>', 'number of training epochs', '50')
    .action(async (options) => {
      try {
        // If options are incomplete, prompt the user
        if (!options.data || !options.features || !options.target || !options.model) {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'data',
              message: 'Path to your training data (CSV):',
              when: !options.data,
              default: 'data/sample.csv'
            },
            {
              type: 'input',
              name: 'features',
              message: 'Feature columns (comma-separated):',
              when: !options.features,
            },
            {
              type: 'input',
              name: 'target',
              message: 'Target column to predict:',
              when: !options.target,
            },
            {
              type: 'input',
              name: 'model',
              message: 'Name for your model:',
              when: !options.model,
              default: 'my-model'
            }
          ]);
          
          // Merge answers with options
          options = { ...options, ...answers };
        }
        
        const dataPath = path.resolve(options.data);
        const features = options.features.split(',').map(f => f.trim());
        const { target, model, epochs } = options;
        
        logger.info('Loading data...');
        const data = await mlManager.loadCSV(dataPath);
        
        logger.info(`Training model with ${features.length} features to predict "${target}"`);
        const trainedModel = await mlManager.trainSimpleModel(data, features, target, parseInt(epochs));
        
        logger.info('Saving model...');
        await mlManager.saveModel(trainedModel, model);
        
        logger.success(`Model "${model}" trained and saved successfully!`);
        
      } catch (err) {
        logger.error(`Training failed: ${err.message}`);
      }
    });
};
