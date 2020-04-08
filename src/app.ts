import express from 'express';
import botRouter from './routers/bot-router';

const app = express();

app.use(express.json());
app.use('/bot', botRouter);

export default app;