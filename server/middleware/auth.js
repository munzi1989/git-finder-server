const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
  // get token from header
  const token = req.header('x-auth-token');

  if (!token) {
    return res
      .status(401)
      .json({ msg: 'No token found. Authorization denied' });
  }

  try {
    // decode data from token vs app-jwt to get user info
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;
    next();
    
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
    console.log(err.msg);
  }
};
