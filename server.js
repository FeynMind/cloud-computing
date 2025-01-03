import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';
import protectedRoutes from './src/routes/protectedRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';

const app = express();
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.error('Error: JWT_SECRET is not defined in environment variables');
  process.exit(1); // Menghentikan aplikasi jika JWT_SECRET tidak ada
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.get('/api/v1/', (req, res) => {
  res.json({
    appName: 'FeynMind',
    apiVersion: 'v1',
  });
});

// Public routes
app.use('/api/v1/auth', authRoutes);
// Protected routes (with token verification)
app.use('/api/v1/protected', protectedRoutes);

// Route untuk upload PDF (memerlukan verifikasi token)
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1', protectedRoutes);


const port = process.env.PORT || 9000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;
