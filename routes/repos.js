const express = require('express');
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
// const User = require('../models/User');
const Repo = require('../models/Repos');
const { find } = require('../models/Repos');

const router = express.Router();

// @route   GET    api/repos
// @desc    Get all favorited repos
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // find repos for favorited by owner based on the user ID
    // obtained in auth middleware
    const repos = await Repo.find({ user: req.user.id }).sort({
      date: -1,
    });
    res.json(repos);
    console.log('Repos retrieved from database');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST    api/repos
// @desc    Add new repo
// @access  Private
router.post(
  '/',
  [
    auth,
    [check('url', 'URL is required').not().isEmpty()],
    [check('owner', 'Owner is required').not().isEmpty()],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { url, owner } = req.body;
      console.log(req.body);
      const match = Repo.find({url: url, owner: owner})
      if(match === req.body){
        throw new Error('Already saved to repos')
      }
      const newRepo = new Repo({
        owner,
        url,
        user: req.user.id,
      });

      const repo = await newRepo.save();
      res.status(200).send('Success').json(newRepo)
      console.log(`Repo ${repo} added to database`);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);


router.delete('/', (req,res) => {

  try {
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error')
  }

})

module.exports = router;