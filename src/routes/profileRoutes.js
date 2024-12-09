import express from 'express';
import ProfileController from '../controllers/profileController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

router.put('/edit-profile', verifyToken, ProfileController.editProfile);
router.delete('/delete-profile', verifyToken, ProfileController.deleteAccount);

export default router;