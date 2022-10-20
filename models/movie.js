const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const movieSchema = new Schema({
  name: String,
  genre: String,
  rate: Number,
  year: Number,
  imgSrc: String,
  trailerId: String,
  description: String,
  directorId: String,
});

module.exports = mongoose.model('Movie', movieSchema);
