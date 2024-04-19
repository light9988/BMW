// app.js
import express from 'express';
import { uploadData } from './controller/data.js';
import { createLogger, format, transports } from 'winston';
import fs from 'fs';
import Papa from 'papaparse';
import { DataTypes } from 'sequelize';
import Sequelize from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();
import multer from "multer";
import path from 'path';
import cors from 'cors';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: './logs/app.log' }),
    new transports.Console()
  ]
});

const {
    DATABASE_HOSTNAME,
    DATABASE_NAME,
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    DATABASE_DIALECT
} = process.env;

const sequelize = new Sequelize(DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD, {
    dialect: DATABASE_DIALECT,
    host: DATABASE_HOSTNAME,
});

sequelize.authenticate().then(() => {
    console.log('Connected to database.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});

const Capacity = sequelize.define('Capacity', {
    // id: {
    //     type: DataTypes.UUID,
    //     defaultValue: DataTypes.UUIDV4,
    //     primaryKey: true,
    //     allowNull: true,
    // },
    cycle_number: {
        type: DataTypes.INTEGER,
        // allowNull: false,
    },
    capacity: {
        type: DataTypes.FLOAT,
        // allowNull: false,
    },
}, {
    timestamps: false, 
});

const Cycle = sequelize.define('Cycle', {
    // id: {
    //     type: DataTypes.UUID,
    //     defaultValue: DataTypes.UUIDV4,
    //     primaryKey: true,
    //     allowNull: true,
    // },
    cycle_number: {
        type: DataTypes.INTEGER,
        // allowNull: false,
    },
    time: {
        type: DataTypes.INTEGER,
        // allowNull: false,
    },
    current: {
        type: DataTypes.FLOAT,
        // allowNull: false,
    },
    voltage: {
        type: DataTypes.FLOAT,
        // allowNull: false,
    },
}, {
    timestamps: false, 
});

const generateAttributes = (columnNames) => {
    const attributes = {};
    for (const columnName of columnNames) {
        attributes[columnName] = { type: DataTypes.STRING };
    }
    return attributes;
};

const dynamicModel = (modelName, columnNames) => {
    const attributes = generateAttributes(columnNames);
    return sequelize.define(modelName, attributes);
};

export const uploadData = async (req, res) => {
    await sequelize.sync();
    const file = req.file;
    console.log('Uploaded file:', req.file);
    // const csvResults = req.body;
    console.log('Uploaded file data:', req.body);

    const fileContent = fs.readFileSync(file.path, 'utf-8');
    console.log("fileCotent in uploadData:", fileContent);
    const csvResults = Papa.parse(fileContent);
    console.log("csvResults in uploadtata:", csvResults);
    const columnNames = csvResults.data[0];
    console.log("columnNames in uploadtata:", columnNames);
    const jsonData = csvResults.data.slice(1);
    console.log("jsonData in uploadtata:", jsonData);

    if (!file) {
        return res.status(400).json({ error: 'No file received' });
    }

    try {
        let Model;

        const containsCapacity = columnNames.some(name => name.toLowerCase().includes('capacity'));
        const containsCurrent = columnNames.some(name => name.toLowerCase().includes('current'));
        const containsVoltage = columnNames.some(name => name.toLowerCase().includes('voltage'));

        if (containsCapacity) {
            Model = Capacity;
        } else if (containsCurrent && containsVoltage) {
            Model = Cycle;
        } else {
            Model = dynamicModel('DynamicModel', columnNames);
        }

        if (Model) {
            const mappedData = jsonData.map(entry => {
                const mappedEntry = {};
                // if (entry.hasOwnProperty('id') && entry['id'] !== undefined) {
                //     mappedEntry['id'] = entry['id'];
                // }
                columnNames.forEach((columnName, index) => {
                    mappedEntry[columnName] = entry[index] !== '' ? entry[index] : null;
                });
                return Object.values(mappedEntry); 
            //     return mappedEntry;
            });

            // Create records using bulkCreate
            await Model.bulkCreate(mappedData);

            fs.unlinkSync(file.path);

            const port = 8000;
            const responseData = {
                success: 1,
                file_url: `http://127.0.0.1:${port}/file/${req.file.filename}`,
                columnNames: columnNames,
                data: mappedData
            };

            return res.status(200).json({ message: 'Data uploaded and processed successfully', responseData });
        } else {
            return res.status(400).json({ error: 'Failed to determine the appropriate model for saving data' });
        }
    } catch (error) {
        console.error('Failed to process the uploaded data:', error);
        return res.status(500).json({ error: 'Failed to process the uploaded data' });
    }
}; 

const port = 8000;
const dataRoute = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
});
  
  const upload = multer({ storage: storage });
  
  dataRoute.post('/upload', upload.single('file'), uploadData);

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
    res.send("Welcome to DashBoard");
});

app.use(dataRoute);

const PORT = 8000;
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});
