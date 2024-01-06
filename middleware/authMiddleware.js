const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');

async function authorizeAdmin(req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const payload = jwt.verify(token, 'secretkey');
    const user = await User.findOne({ _id: payload.userId });

    if (!user || user.role !== 'admin') {
      return res.status(403).send({ error: 'Unauthorized access' });
    }

    next();
  } catch (error) {
    console.error('Authorization Error:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
}

module.exports = {
  authorizeAdmin,
};
