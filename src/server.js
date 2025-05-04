import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import docs from './middleware/docs.js';
import jwt from 'jsonwebtoken'
import authRouter from './routes/auth.js';
import userRouter from './routes/users.js';
import weatherRouter from './routes/weather.js';
import dotenv from 'dotenv';

dotenv.config(); // Initialize environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// app.use(cors({
//     origin: true,
// }))

app.use(cors({
  origin: ['http://localhost:8080', 'https://connect.tafeqld.edu.au', 'https://www.google.com.au'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

// Middleware
app.use(bodyParser.json());

const SECRET_KEY = 'mySecretKey'

// Routes
app.use(docs);
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/weather', weatherRouter);

// Error Handling Middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    status: err.status,
    message: err.message,
    errors: err.errors,
  });
});

app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});

app.listen(PORT, () => console.log(`Express started on http://localhost:${PORT}`));
