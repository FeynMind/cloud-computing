import express from 'express';
import ChatController from '../controllers/chatController.js'; 
import verifyToken  from '../middleware/verifyToken.js';  

const router = express.Router();

router.post('/uploadPDF', verifyToken, ChatController.inputPDF);
router.post('/inputTeks', verifyToken, ChatController.inputTeks);
router.get('/classes', verifyToken, ChatController.getClasses);
router.get('/topics', verifyToken, ChatController.getTopics);
router.get('/history', verifyToken, ChatController.getChatHistory);
router.post('/create-session', verifyToken, ChatController.createNewSession);
router.post('/topic-preference', verifyToken, ChatController.setTopicPreference);

export default router;