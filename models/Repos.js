const mongoose = require('mongoose');

const RepoSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  url: {
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('repo', RepoSchema);
