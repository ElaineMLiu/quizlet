let mongoose = require('mongoose');

//User Schema
// gives some structure to the fields in the table/collection
let userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  class_title: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
});

let User = module.exports = mongoose.model('User', userSchema);
