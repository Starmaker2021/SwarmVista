const path = require('path');

module.exports = {

  entry: {
    Boids: './src/Boids.js',
    Fishes: './src/Boids.js',
    FireFly: './src/fa_firefly.js',
    Predators: './src/Predators.js',
    EnergyBirds: './src/EnergyBirds.js',
    FruitFlys: './src/FruitFlys.js',
  },
  devtool: 'source-map',
  watch: true,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  }
};
