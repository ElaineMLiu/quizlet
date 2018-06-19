let mongoose = require('mongoose');

//Score Schema
// gives some structure to the fields in the table/collection
let scoreSchema = mongoose.Schema({
  class: {
    type: String,
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  quiz_title: {
    type: String,
    required: false
  },
  score: {
    type: Number,
    required: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  details: {
    type: Array,
    required: false
  }
});

let Score = module.exports = mongoose.model('Score', scoreSchema);
