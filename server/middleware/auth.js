const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
  // get token from cookies
  const token = req.cookies.token;
  const CSRFtoken = req.cookies._csrf;

  if (!token || !CSRFtoken) {
    return res
      .status(401)
      .json({ msg: 'No token found. Authorization denied' });
  }

  try {
    // decode data from token found in cookie to use user data in req.user variable
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
    console.log(err.msg);
  }
};
