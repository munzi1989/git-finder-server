const express = require('express');
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Repo = require('../models/Repos');
const router = express.Router();

// @route   GET    api/repos
// @desc    Get all favorited repos
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // find repos favorited by owner based on the  owner/user ID when created
    // req.user is now decoded from jwt,obtained in auth middleware
    const repos = await Repo.find({ user: req.user.id }).sort({
      // date: -1 will sort most recent to the top
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
    // be sure req.data is a url and owner and is not empty
    [check('url', 'URL is required').not().isEmpty()],
    [check('owner', 'Owner is required').not().isEmpty()],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    // if errors variable is not empty
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { url, owner, notes } = req.body;
      console.log(req.body.data);
      // create new instance of Repo model w/ req.body data
      const newRepo = new Repo({
        owner,
        url,
        notes,
        user: req.user.id,
      });
      // save to DB
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
    // find repo by URL params == the ID
    let repo = await Repo.findById(req.params.id);
    if (!repo) return res.status(404).json('Repo not found');
    // if user ID doens't match repo user ID, not allowed to delete
    if (repo.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    await Repo.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Repo removed' });
    console.log('Successfully deleted');
  } catch (err) {
    console.error(`The following ERROR occurred: ${err}`);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
