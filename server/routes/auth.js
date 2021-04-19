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
    // get user data from decoded jwt(req.user) from middleware/auth but minus included password
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
    // validate email, password is entered
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
      //   find user by provided email which is unique
      let user = await User.findOne({ email });
      // if no user email, user is not yet registered, reject request
      if (!user) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }
      // boolean to match entered password w/ registered password
      const isMatch = await bcrypt.compare(password, user.password);
      // if not a match, send json error
      if (!isMatch) {
        res.status(400).json({ msg: 'Invalid Credentials' });
        console.error('Invalid credentials');
      }
      // get user id from above user variable found with Mongoose
      const payload = {
        user: {
          id: user.id,
        },
      };

      // sign jwt with data = user id and secret, set to expire in a day
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {
          expiresIn: 86400000,
        },
        (err, token) => {
          if (err) throw err;
          // set token in cookies to be used in http requests only, cant be read w/ js == more secure
          res.cookie('token', token, {
            expires: new Date(Date.now() + 86400000),
            httpOnly: true,
          });
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(`The following ERROR occurred: ${err}`);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
