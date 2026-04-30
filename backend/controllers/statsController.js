const db = require('../config/db');

// GET /api/stats/summary
exports.getSummary = (req, res) => {
  const sql = `
    SELECT
      COUNT(*) AS total,
      SUM(status = 'ENVOYEE') AS envoyees,
      SUM(status = 'PRISE_EN_CHARGE') AS prises_en_charge,
      SUM(status = 'EN_INTERVENTION') AS en_intervention,
      SUM(status = 'CLOTUREE') AS cloturees,
      SUM(DATE(created_at) = CURDATE()) AS aujourd_hui
    FROM emergency_requests
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
};

// GET /api/stats/by-type
exports.getByType = (req, res) => {
  const sql = `
    SELECT 
      et.label AS type,
      COUNT(er.id) AS total
    FROM emergency_types et
    LEFT JOIN emergency_requests er ON er.emergency_type_id = et.id
    GROUP BY et.id, et.label
    ORDER BY total DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// GET /api/stats/response-time
exports.getResponseTime = (req, res) => {
  const sql = `
    SELECT 
      AVG(TIMESTAMPDIFF(MINUTE, er.created_at, ru.created_at)) AS avg_minutes
    FROM emergency_requests er
    JOIN request_updates ru ON ru.emergency_request_id = er.id
    WHERE ru.new_status = 'PRISE_EN_CHARGE'
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      avg_response_minutes: results[0].avg_minutes
        ? parseFloat(results[0].avg_minutes).toFixed(1)
        : null
    });
  });
};
