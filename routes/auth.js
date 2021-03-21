const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middleware/auth');
const router = express.Router();

// @route    GET    api/auth
// @description Get logged in user data
// @access  private
router.get('/', auth, async (req, res) => {
  try {
    // get user data form decoded jwt from middleware/auth minus password
    const user = await User.findById(req.user.id).select('-password');
    // return user data
    res.json(user);
  } catch (err) {
    console.error(err, err.msg);
    res.status(500).send('Server Error');
  }
});

// @route   POST    api/auth
// @desc    Auth user and get token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Please include valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // if errors, return array of errors
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
      //   find user by provided email
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(400).json({ msg: 'Invalid Credentials' });
        console.error('Invalid credentials');
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      // sign jwt
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token});
        }
      );
    } catch (err) {
      console.log(err.msg);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
