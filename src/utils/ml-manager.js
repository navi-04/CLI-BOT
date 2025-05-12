const brain = require('brain.js');
const fs = require('fs-extra');
const path = require('path');
const natural = require('natural');
const csv = require('csv-parser');
const logger = require('./logger');

class MLManager {
  constructor() {
    this.modelsDir = path.join(process.cwd(), 'models');
    this.dataDir = path.join(process.cwd(), 'data');
    this.ensureDirectories();
    
    // Tokenizer for text processing
    this.tokenizer = new natural.WordTokenizer();
    
    // Brain.js network - using this instead of TensorFlow to avoid native dependencies
    this.network = null;
  }
  
  ensureDirectories() {
    fs.ensureDirSync(this.modelsDir);
    fs.ensureDirSync(this.dataDir);
  }
  
  async loadCSV(filepath) {
    const results = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filepath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    });
  }

  async saveModel(model, name) {
    const modelPath = path.join(this.modelsDir, `${name}.json`);
    
    if (model.toJSON) {
      // Brain.js model
      fs.writeFileSync(modelPath, JSON.stringify(model.toJSON()));
    } else {
      // TensorFlow model
      await model.save(`file://${path.join(this.modelsDir, name)}`);
    }
    
    logger.success(`Model saved as ${name}`);
  }
  
  async loadModel(name, type = 'brain') {
    try {
      const modelPath = path.join(this.modelsDir, `${name}.json`);
      if (!fs.existsSync(modelPath)) {
        logger.error(`Model file not found: ${modelPath}`);
        return null;
      }
      
      const modelData = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
      
      if (type === 'bayes') {
        return natural.BayesClassifier.restore(modelData);
      } else {
        this.network = new brain.NeuralNetwork();
        this.network.fromJSON(modelData);
        return this.network;
      }
    } catch (err) {
      logger.error(`Failed to load model: ${err.message}`);
      return null;
    }
  }
  
  createSimpleModel(inputSize = 10, hiddenSize = 20, outputSize = 2) {
    const network = new brain.NeuralNetwork({
      hiddenLayers: [hiddenSize],
      activation: 'sigmoid'
    });
    
    return network;
  }
  
  preprocessData(data, features, target) {
    // Simple preprocessing for numerical data
    const processedData = [];
    
    data.forEach(item => {
      const input = {};
      features.forEach(f => {
        input[f] = parseFloat(item[f]) / 100; // Simple normalization
      });
      
      const output = {};
      output[item[target]] = 1;
      
      processedData.push({
        input,
        output
      });
    });
    
    return processedData;
  }
  
  async trainSimpleModel(data, features, target, epochs = 50) {
    const processedData = this.preprocessData(data, features, target);
    const network = this.createSimpleModel(features.length);
    
    logger.info(`Training model with ${processedData.length} examples...`);
    
    const result = await network.trainAsync(processedData, {
      iterations: epochs,
      errorThresh: 0.005,
      log: true,
      logPeriod: 10,
      learningRate: 0.3
    });
    
    logger.info(`Training completed in ${result.iterations} iterations with error: ${result.error}`);
    return network;
  }
  
  async predict(model, input) {
    // Convert input array to object for brain.js
    const inputObj = {};
    if (Array.isArray(input)) {
      input.forEach((val, i) => {
        inputObj[`input${i}`] = val / 100; // Simple normalization
      });
    } else {
      Object.assign(inputObj, input);
    }
    
    const result = model.run(inputObj);
    return result;
  }
  
  // Text classification with Natural.js
  createTextClassifier() {
    return new natural.BayesClassifier();
  }
  
  trainTextClassifier(classifier, data) {
    data.forEach(item => {
      classifier.addDocument(item.text, item.category);
    });
    
    classifier.train();
    return classifier;
  }
  
  // K-means clustering simplified implementation
  performClustering(data, numClusters = 3, iterations = 20) {
    // Simple k-means implementation in pure JS
    // Initialize centroids randomly
    const centroids = [];
    const dimensions = data[0].length;
    
    for (let i = 0; i < numClusters; i++) {
      centroids.push(Array.from({ length: dimensions }, () => Math.random()));
    }
    
    // Helper function to calculate Euclidean distance
    const distance = (a, b) => {
      return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
    };
    
    // Run k-means iterations
    const clusters = new Array(data.length);
    
    for (let iter = 0; iter < iterations; iter++) {
      // Assign each point to nearest centroid
      for (let i = 0; i < data.length; i++) {
        let minDist = Infinity;
        let clusterId = 0;
        
        for (let j = 0; j < centroids.length; j++) {
          const dist = distance(data[i], centroids[j]);
          if (dist < minDist) {
            minDist = dist;
            clusterId = j;
          }
        }
        
        clusters[i] = clusterId;
      }
      
      // Update centroids
      const newCentroids = Array.from({ length: numClusters }, () => 
        Array.from({ length: dimensions }, () => 0)
      );
      
      const counts = Array(numClusters).fill(0);
      
      for (let i = 0; i < data.length; i++) {
        const clusterId = clusters[i];
        counts[clusterId]++;
        
        for (let d = 0; d < dimensions; d++) {
          newCentroids[clusterId][d] += data[i][d];
        }
      }
      
      for (let j = 0; j < numClusters; j++) {
        if (counts[j] > 0) {
          for (let d = 0; d < dimensions; d++) {
            newCentroids[j][d] /= counts[j];
          }
        }
      }
      
      centroids.splice(0, centroids.length, ...newCentroids);
    }
    
    return {
      clusters,
      centroids
    };
  }
  
  // Sentiment analysis
  analyzeSentiment(text) {
    const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    const tokens = this.tokenizer.tokenize(text);
    return analyzer.getSentiment(tokens);
  }
}

module.exports = new MLManager();
