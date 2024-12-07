import express from 'express';
import HistoryContoller from '../controllers/historyController.js';  

const router = express.Router();

router.get('/get-history', HistoryContoller.getHistory); 

export default router;
