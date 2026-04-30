const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authMiddleware, agentOrAdmin } = require('../middlewares/authMiddleware');

router.get('/summary', authMiddleware, agentOrAdmin, statsController.getSummary);
router.get('/by-type', authMiddleware, agentOrAdmin, statsController.getByType);
router.get('/response-time', authMiddleware, agentOrAdmin, statsController.getResponseTime);

module.exports = router;