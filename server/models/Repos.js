const mongoose = require('mongoose');

const ReposSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  owner: {
    type: String,
  },
  url: {
    type: String,
  },
  notes: {
    type: String,
  },
  date: {
    //   date created
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('repos', ReposSchema);
