import express from 'express';
import healthzRoute from './routes/healthzRoute.js';
import dataRoute from './routes/dataRoute.js';
import cors from 'cors';
import sequelize from './config/sequelize.js';

const app = express();

app.use(express.json());

app.use(cors());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); 
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); 
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'); 

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.get("/", (req, res) => {
    res.send("Welcome to Data Insight");
});

app.use(healthzRoute);

// (async () => {
//     try {
//         await sequelize.sync({ force: true });
//         console.log('Database bootstrapped successfully');
//     } catch (error) {
//         console.error('Database bootstrapping error:', error);
//     }
// })();

app.use(dataRoute);

export default app;
