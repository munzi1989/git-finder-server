const express = require('express');
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
// const User = require('../models/User');
const Repo = require('../models/Repos');

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

      const newRepo = new Repo({
        owner,
        url,
        user: req.user.id,
      });

      const repo = await newRepo.save();
      res.status(200).send(`Success, added ${newRepo} to database`);
      console.log(`Repo ${newRepo} added to database`);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

router.delete('/:id', auth, async (req, res) => {
  try {
    let repo = await Repo.findById(req.params.id);
    if (!repo) return res.status(404).json('Repo not found');
    if (repo.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Repo.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Contact removed' });

    console.log('Successfully deleted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
