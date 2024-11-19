import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));


// routes
app.use('/api/v1/auth', authRoutes);
app.use(cors());

const port = process.env.PORT || 9000;

//run
app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});

export default app;
