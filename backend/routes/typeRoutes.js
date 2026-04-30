const express = require('express');
const router = express.Router();
const typeController = require('../controllers/typeController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, typeController.getAll);
router.get('/:id', authMiddleware, typeController.getById);
router.post('/', authMiddleware, adminOnly, typeController.create);
router.put('/:id', authMiddleware, adminOnly, typeController.update);
router.delete('/:id', authMiddleware, adminOnly, typeController.remove);

module.exports = router;
