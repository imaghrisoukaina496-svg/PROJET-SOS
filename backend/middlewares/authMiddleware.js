const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou invalide' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token expiré ou invalide' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Accès réservé aux admins' });
  }
  next();
};

const agentOrAdmin = (req, res, next) => {
  if (req.user.role === 'USER') {
    return res.status(403).json({ message: 'Accès réservé aux agents et admins' });
  }
  next();
};

module.exports = { authMiddleware, adminOnly, agentOrAdmin };
