const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendResetEmail } = require('../config/emailService');
require('dotenv').config();
 
// POST /api/auth/register
exports.register = (req, res) => {
  const { full_name, email, password, role } = req.body;
 
  if (!full_name || !email || !password) {
    return res.status(400).json({ message: 'full_name, email et password sont obligatoires' });
  }
 
  const checkSql = `SELECT id FROM users WHERE email = ?`;
  db.query(checkSql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
 
    if (results.length > 0) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }
 
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userRole = role && ['USER', 'AGENT', 'ADMIN'].includes(role) ? role : 'USER';
 
    const insertSql = `
      INSERT INTO users (full_name, email, password, role)
      VALUES (?, ?, ?, ?)
    `;
 
    db.query(insertSql, [full_name, email, hashedPassword, userRole], (err2, result) => {
      if (err2) return res.status(500).json({ error: err2.message });
 
      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        user_id: result.insertId
      });
    });
  });
};
 
// POST /api/auth/login
exports.login = (req, res) => {
  const { email, password } = req.body;
 
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et password obligatoires' });
  }
 
  const sql = `SELECT * FROM users WHERE email = ?`;
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
 
    if (results.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
 
    const user = results[0];
    const isValid = bcrypt.compareSync(password, user.password);
 
    if (!isValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
 
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
 
    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  });
};
 
// GET /api/auth/me
exports.me = (req, res) => {
  const sql = `SELECT id, full_name, email, role, created_at FROM users WHERE id = ?`;
  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
 
    if (results.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
 
    res.json(results[0]);
  });
};
 
// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email obligatoire' });
 
  db.query(`SELECT id FROM users WHERE email = ?`, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
 
    if (results.length === 0)
      return res.json({ message: 'Si cet email existe, un lien a été envoyé.' });
 
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000);
 
    db.query(
      `UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?`,
      [resetToken, expiry, results[0].id],
      async (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        try {
          await sendResetEmail(email, resetToken);
          res.json({ message: 'Si cet email existe, un lien a été envoyé.' });
        } catch (mailErr) {
          console.error('Erreur email:', mailErr.message);
          res.status(500).json({ message: "Erreur lors de l'envoi de l'email" });
        }
      }
    );
  });
};
 
// POST /api/auth/reset-password
exports.resetPassword = (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword)
    return res.status(400).json({ message: 'Token et nouveau mot de passe obligatoires' });
  if (newPassword.length < 6)
    return res.status(400).json({ message: 'Mot de passe trop court (6 caractères min)' });
 
  db.query(
    `SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()`,
    [token],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0)
        return res.status(400).json({ message: 'Token invalide ou expiré' });
 
      const hashed = bcrypt.hashSync(newPassword, 10);
      db.query(
        `UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?`,
        [hashed, results[0].id],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ message: 'Mot de passe réinitialisé avec succès' });
        }
      );
    }
  );
};
exports.getAgents = (req, res) => {
  db.query(
    `SELECT id, full_name, email FROM users WHERE role = 'AGENT'`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};