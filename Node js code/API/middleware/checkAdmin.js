module.exports = (req, res, next) => {
  if (req.userData && req.userData.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Admins only' });
};
