import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes.js';
<<<<<<< HEAD
import fileRoutes from './src/routes/fileRoutes.js';
=======
import profileRoutes from './src/routes/profileRoutes.js';
// import chatbotRoutes from './src/routes/chatbotRoutes.js';
>>>>>>> 513434731d06da405e6080df9b85463578647bf6
import protectedRoutes from './src/routes/protectedRoutes.js';
import historyRoutes from './src/routes/historyRoutes.js';



const app = express();
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.error('Error: JWT_SECRET is not defined in environment variables');
  process.exit(1); // Menghentikan aplikasi jika JWT_SECRET tidak ada
}

console.log('JWT Secret:', jwtSecret);

console.log('JWT Secret:', process.env.JWT_SECRET);

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
<<<<<<< HEAD

// Protected routes (with token verification)
app.use('/api/v1/protected', protectedRoutes);

// Route untuk upload PDF (memerlukan verifikasi token)
app.use('/api/v1/pdf', fileRoutes);
=======
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/history', historyRoutes);
// app.use('/api/v1/chatbot', chatbotRoutes);
app.use('/api/v1', protectedRoutes);
>>>>>>> 513434731d06da405e6080df9b85463578647bf6

const port = process.env.PORT || 9000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;
