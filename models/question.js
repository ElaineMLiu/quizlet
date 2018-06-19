let mongoose = require('mongoose');

//Question Schema
// gives some structure to the fields in the table/collection
let questionSchema = mongoose.Schema({
  quiz_id: {
    type: mongoose.Schema.Types.ObjectId,  //id of quiz it belongs to
    required: true
  },
  order: {
    type: Number,
    required: false
  },
  question: {
    type: String,
    required: true
  },
  choiceA: {
    type: String,
    required: true
  },
  choiceB: {
    type: String,
    required: true
  },
  choiceC: {
    type: String,
    required: true
  },
  choiceD: {
    type: String,
    required: true
  },
  choiceCorrect: {
    type: String,
    required: true
  },
  author: {
    type:String,
    required: true
  },
  included: {
    type: Boolean,
    default: false
  },
});

let Question = module.exports = mongoose.model('Question', questionSchema);
