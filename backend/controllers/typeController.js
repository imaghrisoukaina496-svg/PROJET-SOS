const db = require('../config/db');

// GET /api/emergency-types
exports.getAll = (req, res) => {
  db.query(`SELECT * FROM emergency_types ORDER BY label ASC`, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// GET /api/emergency-types/:id
exports.getById = (req, res) => {
  db.query(`SELECT * FROM emergency_types WHERE id = ?`, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Type non trouvé' });
    res.json(results[0]);
  });
};

// POST /api/emergency-types
exports.create = (req, res) => {
  const { label, icon } = req.body;

  if (!label) return res.status(400).json({ message: 'label obligatoire' });

  db.query(
    `INSERT INTO emergency_types (label, icon) VALUES (?, ?)`,
    [label, icon || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Type créé', id: result.insertId });
    }
  );
};

// PUT /api/emergency-types/:id
exports.update = (req, res) => {
  const { label, icon } = req.body;
  const { id } = req.params;

  if (!label) return res.status(400).json({ message: 'label obligatoire' });

  db.query(
    `UPDATE emergency_types SET label = ?, icon = ? WHERE id = ?`,
    [label, icon || null, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Type non trouvé' });
      res.json({ message: 'Type mis à jour' });
    }
  );
};

// DELETE /api/emergency-types/:id
exports.remove = (req, res) => {
  db.query(`DELETE FROM emergency_types WHERE id = ?`, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Type non trouvé' });
    res.json({ message: 'Type supprimé' });
  });
};
