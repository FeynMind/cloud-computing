import express from 'express';
import fileController from '../controllers/fileController.js';
import verifyToken  from '../middleware/verifyToken.js'; 

const router = express.Router();

// Endpoint untuk upload PDF dengan verifikasi token
router.post('/upload', verifyToken, fileController.uploadPdf);



export default router;
