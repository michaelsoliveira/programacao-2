import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

export default app;