const db = require('../config/db');

// POST /api/emergencies
exports.createEmergencyRequest = (req, res) => {
  const { emergency_type_id, latitude, longitude, message } = req.body;
  const user_id = req.user.id;

  if (!emergency_type_id || !latitude || !longitude) {
    return res.status(400).json({
      message: 'emergency_type_id, latitude et longitude sont obligatoires'
    });
  }

  const insertRequestSql = `
    INSERT INTO emergency_requests 
    (user_id, emergency_type_id, status, latitude, longitude, message)
    VALUES (?, ?, 'ENVOYEE', ?, ?, ?)
  `;

  db.query(insertRequestSql, [user_id, emergency_type_id, latitude, longitude, message || null], (err, result) => {
    if (err) return res.status(500).json({ message: 'Erreur création alerte', error: err.message });

    const emergencyRequestId = result.insertId;

    const insertUpdateSql = `
      INSERT INTO request_updates (emergency_request_id, update_message, new_status, updated_by)
      VALUES (?, 'Demande envoyée', 'ENVOYEE', 'SYSTEM')
    `;

    db.query(insertUpdateSql, [emergencyRequestId], (updateErr) => {
      if (updateErr) return res.status(500).json({ message: 'Alerte créée mais erreur historique', error: updateErr.message });

      res.status(201).json({
        message: 'Alerte SOS créée avec succès',
        emergency_request_id: emergencyRequestId
      });
    });
  });
};

// GET /api/emergencies
exports.getAllEmergencies = (req, res) => {
  const { status, type_id } = req.query;

  let sql = `
    SELECT 
      er.id, u.full_name AS user_name, et.label AS emergency_type,
      er.status, er.latitude, er.longitude, er.message,
      er.assigned_agent, er.created_at, er.updated_at
    FROM emergency_requests er
    JOIN users u ON er.user_id = u.id
    JOIN emergency_types et ON er.emergency_type_id = et.id
    WHERE 1=1
  `;
  const params = [];

  if (status) { sql += ` AND er.status = ?`; params.push(status); }
  if (type_id) { sql += ` AND er.emergency_type_id = ?`; params.push(type_id); }

  sql += ` ORDER BY er.created_at DESC`;

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur récupération alertes', error: err.message });
    res.json(results);
  });
};

// GET /api/emergencies/mine
exports.getMyEmergencies = (req, res) => {
  const sql = `
    SELECT 
      er.id, et.label AS emergency_type,
      er.status, er.latitude, er.longitude, er.message,
      er.created_at, er.updated_at
    FROM emergency_requests er
    JOIN emergency_types et ON er.emergency_type_id = et.id
    WHERE er.user_id = ?
    ORDER BY er.created_at DESC
  `;

  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// GET /api/emergencies/:id
exports.getEmergencyById = (req, res) => {
  const { id } = req.params;

  const requestSql = `
    SELECT 
      er.id, u.full_name AS user_name, et.label AS emergency_type,
      er.status, er.latitude, er.longitude, er.message,
      er.assigned_agent, er.created_at, er.updated_at
    FROM emergency_requests er
    JOIN users u ON er.user_id = u.id
    JOIN emergency_types et ON er.emergency_type_id = et.id
    WHERE er.id = ?
  `;

  db.query(requestSql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Alerte non trouvée' });

    const updatesSql = `
      SELECT id, update_message, new_status, updated_by, created_at
      FROM request_updates
      WHERE emergency_request_id = ?
      ORDER BY created_at ASC
    `;

    db.query(updatesSql, [id], (updateErr, updates) => {
      if (updateErr) return res.status(500).json({ error: updateErr.message });
      res.json({ ...results[0], updates });
    });
  });
};

// PATCH /api/emergencies/:id/status
exports.updateStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updated_by = req.user.full_name || req.user.email;

  const validStatuses = ['ENVOYEE', 'PRISE_EN_CHARGE', 'EN_INTERVENTION', 'CLOTUREE'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Statut invalide' });
  }

  db.query(`SELECT status FROM emergency_requests WHERE id = ?`, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Alerte non trouvée' });
    if (results[0].status === 'CLOTUREE') return res.status(403).json({ message: 'Alerte déjà clôturée' });

    db.query(`UPDATE emergency_requests SET status = ? WHERE id = ?`, [status, id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });

      db.query(
        `INSERT INTO request_updates (emergency_request_id, update_message, new_status, updated_by) VALUES (?, ?, ?, ?)`,
        [id, `Statut changé en ${status}`, status, updated_by],
        (err3) => {
          if (err3) return res.status(500).json({ error: err3.message });
          res.json({ message: 'Statut mis à jour avec succès' });
        }
      );
    });
  });
};

// PUT /api/emergencies/:id/assign
exports.assignAgent = (req, res) => {
  const { id } = req.params;
  const { agent_name } = req.body;

  if (!agent_name) return res.status(400).json({ message: 'agent_name obligatoire' });

  db.query(`SELECT status FROM emergency_requests WHERE id = ?`, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Alerte non trouvée' });
    if (results[0].status === 'CLOTUREE') return res.status(403).json({ message: 'Alerte déjà clôturée' });

    db.query(`UPDATE emergency_requests SET assigned_agent = ? WHERE id = ?`, [agent_name, id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: 'Agent affecté avec succès' });
    });
  });
};

// POST /api/emergencies/:id/updates
exports.addUpdate = (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const updated_by = req.user.full_name || req.user.email;

  if (!message) return res.status(400).json({ message: 'message obligatoire' });

  db.query(`SELECT status FROM emergency_requests WHERE id = ?`, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Alerte non trouvée' });
    if (results[0].status === 'CLOTUREE') return res.status(403).json({ message: 'Alerte déjà clôturée' });

    db.query(
      `INSERT INTO request_updates (emergency_request_id, update_message, updated_by) VALUES (?, ?, ?)`,
      [id, message, updated_by],
      (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json({ message: 'Mise à jour ajoutée' });
      }
    );
  });
};

// PUT /api/emergencies/:id/close
exports.closeEmergency = (req, res) => {
  const { id } = req.params;
  const updated_by = req.user.full_name || req.user.email;

  db.query(`SELECT status FROM emergency_requests WHERE id = ?`, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Alerte non trouvée' });
    if (results[0].status === 'CLOTUREE') return res.status(400).json({ message: 'Alerte déjà clôturée' });

    db.query(`UPDATE emergency_requests SET status = 'CLOTUREE' WHERE id = ?`, [id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });

      db.query(
        `INSERT INTO request_updates (emergency_request_id, update_message, new_status, updated_by) VALUES (?, 'Demande clôturée', 'CLOTUREE', ?)`,
        [id, updated_by],
        (err3) => {
          if (err3) return res.status(500).json({ error: err3.message });
          res.json({ message: 'Alerte clôturée avec succès' });
        }
      );
    });
  });
};

// DELETE /api/emergencies/:id
exports.deleteEmergency = (req, res) => {
  const { id } = req.params;

  db.query(`DELETE FROM request_updates WHERE emergency_request_id = ?`, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query(`DELETE FROM emergency_requests WHERE id = ?`, [id], (err2, result) => {
      if (err2) return res.status(500).json({ error: err2.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Alerte non trouvée' });
      res.json({ message: 'Alerte supprimée avec succès' });
    });
  });
};
exports.getAssignedEmergencies = (req, res) => {
  const agentName = req.user.full_name;

  const sql = `
    SELECT 
      er.id, u.full_name AS user_name, et.label AS emergency_type,
      er.status, er.latitude, er.longitude, er.message,
      er.assigned_agent, er.created_at
    FROM emergency_requests er
    JOIN users u ON er.user_id = u.id
    JOIN emergency_types et ON er.emergency_type_id = et.id
    WHERE er.assigned_agent = ?
    ORDER BY er.created_at DESC
  `;

  db.query(sql, [agentName], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
