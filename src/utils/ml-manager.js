const tf = require('@tensorflow/tfjs-node');
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
    
    // TF Classifier
    this.classifier = null;
    
    // Brain.js network
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
  
  async loadModel(name, type = 'tf') {
    try {
      if (type === 'brain') {
        const modelPath = path.join(this.modelsDir, `${name}.json`);
        const modelData = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
        this.network = new brain.NeuralNetwork();
        this.network.fromJSON(modelData);
        return this.network;
      } else {
        const modelPath = `file://${path.join(this.modelsDir, name)}`;
        this.classifier = await tf.loadLayersModel(modelPath);
        return this.classifier;
      }
    } catch (err) {
      logger.error(`Failed to load model: ${err.message}`);
      return null;
    }
  }
  
  createSimpleModel() {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 100, activation: 'relu', inputShape: [10] }));
    model.add(tf.layers.dense({ units: 50, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 2, activation: 'softmax' }));
    
    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    
    return model;
  }
  
  preprocessData(data, features, target) {
    // Simple preprocessing for numerical data
    const X = data.map(item => features.map(f => parseFloat(item[f])));
    const y = data.map(item => parseInt(item[target]));
    
    return {
      X: tf.tensor2d(X),
      y: tf.oneHot(tf.tensor1d(y, 'int32'), 2)
    };
  }
  
  async trainSimpleModel(data, features, target, epochs = 50) {
    const { X, y } = this.preprocessData(data, features, target);
    const model = this.createSimpleModel();
    
    await model.fit(X, y, {
      epochs,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          logger.info(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
        }
      }
    });
    
    return model;
  }
  
  async predict(model, input, type = 'tf') {
    if (type === 'brain') {
      return model.run(input);
    } else {
      const tensor = tf.tensor2d([input]);
      const prediction = await model.predict(tensor);
      return Array.from(prediction.dataSync());
    }
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
  
  // K-means clustering with TensorFlow.js
  async performClustering(data, numClusters = 3, iterations = 20) {
    const points = tf.tensor2d(data);
    
    // Randomly initialize centroids
    const centroids = tf.randomUniform([numClusters, data[0].length]);
    
    for (let i = 0; i < iterations; i++) {
      // Assignment step: assign each point to nearest centroid
      const expandedPoints = points.expandDims(1);
      const expandedCentroids = centroids.expandDims(0);
      
      // Calculate squared distance
      const distances = tf.sum(tf.square(tf.sub(expandedPoints, expandedCentroids)), 2);
      const assignments = tf.argMin(distances, 1);
      
      // Update step: move centroids to average of assigned points
      const newCentroids = [];
      
      for (let j = 0; j < numClusters; j++) {
        const mask = tf.equal(assignments, tf.scalar(j, 'int32'));
        const maskFloat = tf.cast(mask, 'float32');
        const sum = tf.sum(tf.mul(points, maskFloat.expandDims(1)), 0);
        const count = tf.sum(maskFloat);
        const centroid = tf.div(sum, count);
        newCentroids.push(centroid);
      }
      
      const newCentroidsTensor = tf.stack(newCentroids);
      centroids.assign(newCentroidsTensor);
    }
    
    // Assign final clusters
    const expandedPoints = points.expandDims(1);
    const expandedCentroids = centroids.expandDims(0);
    
    const distances = tf.sum(tf.square(tf.sub(expandedPoints, expandedCentroids)), 2);
    const assignments = tf.argMin(distances, 1);
    
    return {
      clusters: Array.from(assignments.dataSync()),
      centroids: Array.from(centroids.dataSync())
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
