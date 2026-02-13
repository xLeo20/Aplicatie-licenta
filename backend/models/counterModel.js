const mongoose = require('mongoose');

const counterSchema = mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    default: 1000
  }
});

module.exports = mongoose.model('Counter', counterSchema);