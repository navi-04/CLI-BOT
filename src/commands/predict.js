const inquirer = require('inquirer');
const mlManager = require('../utils/ml-manager');
const logger = require('../utils/logger');

module.exports = (program) => {
  program
    .command('predict')
    .description('Make predictions with a trained model')
    .option('-m, --model <name>', 'name of the model to use')
    .option('-i, --input <values>', 'comma-separated input values')
    .option('-t, --type <engine>', 'model type: tf or brain', 'tf')
    .action(async (options) => {
      try {
        // If options are incomplete, prompt the user
        if (!options.model || !options.input) {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'model',
              message: 'Model name:',
              when: !options.model,
              default: 'my-model'
            },
            {
              type: 'input',
              name: 'input',
              message: 'Input values (comma-separated):',
              when: !options.input
            },
            {
              type: 'list',
              name: 'type',
              message: 'Model type:',
              when: !options.type,
              choices: ['tf', 'brain'],
              default: 'tf'
            }
          ]);
          
          // Merge answers with options
          options = { ...options, ...answers };
        }
        
        const { model, input, type } = options;
        
        logger.info(`Loading model "${model}"...`);
        const loadedModel = await mlManager.loadModel(model, type);
        
        if (!loadedModel) {
          logger.error('Failed to load model');
          return;
        }
        
        // Parse input values
        const inputValues = input.split(',').map(val => parseFloat(val.trim()));
        
        logger.info('Making prediction...');
        const prediction = await mlManager.predict(loadedModel, inputValues, type);
        
        logger.success('Prediction result:');
        console.log(prediction);
        
      } catch (err) {
        logger.error(`Prediction failed: ${err.message}`);
      }
    });
};
