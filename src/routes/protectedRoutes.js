import express from 'express';
import verifyToken from '../middleware/verifyToken.js'; 
import { protectedRouteHandler } from '../controllers/protectedController.js'; 

const protectedRoutes = express.Router();

// Protected route by middleware
protectedRoutes.get('/protected-route', verifyToken, protectedRouteHandler);

export default protectedRoutes;
