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
});

module.exports = mongoose.model('repos', ReposSchema);
