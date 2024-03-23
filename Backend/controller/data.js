
import fs from 'fs';
import Capacity from '../models/capacity.js';
import Cycle from '../models/cycle.js';
import dataDynamicModel from '../models/dataDynamicModel.js';

export const uploadData = async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const data = fs.readFileSync(file.path, 'utf-8');
        const jsonData = JSON.parse(data);

        await dataDynamicModel.bulkCreate(jsonData);

        // let Model;
      
        // const containsCapacity = columnNames.some(name => name.toLowerCase().includes('capacity'));
        // const containsCurrent = columnNames.some(name => name.toLowerCase().includes('current'));
        // const containsVoltage = columnNames.some(name => name.toLowerCase().includes('voltage'));
    
        // if (containsCapacity) {
        //     Model = Capacity;
        // } else if (containsCurrent && containsVoltage) {
        //     Model = Cycle;
        // } else {
        //     Model = dataDynamicModel;
        // } 
    

        // if (Model) {
        //     await Model.bulkCreate(jsonData);
        // } else {
        //     return res.status(400).json({ error: 'Failed to determine the appropriate model for saving data' });
        // }

        fs.unlinkSync(file.path);

        return res.status(200).json({ message: 'File uploaded and processed successfully' });
    } catch (error) {
        console.error('Failed to process the uploaded file:', error);
        return res.status(500).json({ error: 'Failed to process the uploaded file' });
    }
};
