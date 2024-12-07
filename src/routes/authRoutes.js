import express from 'express';
import AuthController from '../controllers/authController.js';  

const router = express.Router();

router.post('/signup', AuthController.signup); 
router.post('/login', AuthController.login);
router.post('/google-login', AuthController.googleLogin);
router.post('/logout', AuthController.logout);


export default router;
