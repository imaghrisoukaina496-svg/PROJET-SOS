const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { authMiddleware, agentOrAdmin, adminOnly } = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, emergencyController.createEmergencyRequest);
router.get('/mine', authMiddleware, emergencyController.getMyEmergencies);
router.get('/assigned', authMiddleware, emergencyController.getAssignedEmergencies);
router.get('/', authMiddleware, agentOrAdmin, emergencyController.getAllEmergencies);
router.get('/:id', authMiddleware, emergencyController.getEmergencyById);

router.patch('/:id/status', authMiddleware, agentOrAdmin, emergencyController.updateStatus);
router.put('/:id/assign', authMiddleware, agentOrAdmin, emergencyController.assignAgent);
router.post('/:id/updates', authMiddleware, agentOrAdmin, emergencyController.addUpdate);
router.put('/:id/close', authMiddleware, agentOrAdmin, emergencyController.closeEmergency);
router.delete('/:id', authMiddleware, adminOnly, emergencyController.deleteEmergency);

module.exports = router;