const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const urlSchema = new Schema({
  original_url: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  short_url: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
});

const Url = mongoose.model('url', urlSchema);

module.exports = Url;
