const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Expect header: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Auth failed: No token provided' });
    }

    const token = authHeader.split(" ")[1]; // grab <token> part
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userData = decoded; // { userId, email, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Auth failed: Invalid token' });
  }
};
