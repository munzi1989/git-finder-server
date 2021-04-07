const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { check, validationResult } = require('express-validator');
const config = require('config');
const jwt = require('jsonwebtoken');

// @route   POST    api/users
// @description Register user to DB
// @access  public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'A valid email is requried').isEmail(),
    check(
      'password',
      'Password is required with more than 6 characters'
    ).isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    // if errors exist in errors variable
    if (!errors.isEmpty()) {
      // return errors
      return res.status(400).json({ erros: errors.array() });
    } else {
      const { name, email, password } = req.body;

      try {
        // check if email exists already
        let user = await User.findOne({ email });
        if (user) {
          console.log('User already exists');
          return res.status(400).json({ msg: 'User already exists' });
        } else {
          user = new User({
            name,
            email,
            password,
          });
          // generate salt for password
          const salt = await bcrypt.genSalt(10);
          // hash password w/ salt
          user.password = await bcrypt.hash(password, salt);
          // save to DB
          await user.save();
          console.log('SUCCESS! User registered to DB');
          //   after registering user, send user data back to client to use
          // sign json token below before sending user data back to client
          const payload = {
            user: {
              // user.id === string version of mongoDB _id
              id: user.id,
              name: user.name,
            },
          };

          //   sign token, send back to use in header for auth
          jwt.sign(
            payload,
            config.get('jwtSecret'),
            {
              expiresIn: 360000,
            },
            (err, token) => {
              if (err) throw err;
              //   return token
              res.json({ token });
            }
          );
        }
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
      }
    }
  }
);

module.exports = router;
