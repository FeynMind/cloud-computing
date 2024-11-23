import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRouter from './src/routes/authRoutes.js';

const app = express();

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

// Mount authRoutes di /api/v1/auth
app.use('/api/v1/auth', authRouter);

export default app;

const port = process.env.PORT || 9000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
