import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';
// import chatbotRoutes from './src/routes/chatbotRoutes.js';
import protectedRoutes from './src/routes/protectedRoutes.js';
import historyRoutes from './src/routes/historyRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.get('/api/v1/', (req, res,) => {
  res.json({
    appName: 'FeynMind',
    apiVersion: 'v1',
  });
});


app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/history', historyRoutes);
// app.use('/api/v1/chatbot', chatbotRoutes);
app.use('/api/v1', protectedRoutes);

const port = process.env.PORT || 9000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;


