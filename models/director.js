const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const directorSchema = new Schema({
  name: String,
  age: Number,
  imgSrc: String,
  born: String,
  bornPlace: String,
  career: String,
  genres: String,
  height: Number,
  imdbSrc: String,
  moviesCount: Number,
  moviesYears: String,
});

module.exports = mongoose.model('Director', directorSchema);
