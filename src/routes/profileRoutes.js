import express from 'express';
import ProfileController from '../controllers/profileController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

router.put('/edit', verifyToken, ProfileController.editProfile);
router.delete('/delete', verifyToken, ProfileController.deleteAccount);

export default router;