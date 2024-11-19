import express from 'express';
import AuthController from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', AuthController.signup);

export default router;
