import express from 'express';
import healthzRoute from './routes/healthzRoute.js';
import dataRoute from './routes/dataRoute.js';

const app = express();

app.use(healthzRoute);
app.use(dataRoute);

export default app;
