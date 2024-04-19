
import fs from 'fs';
import Capacity from '../models/capacity.js';
import Cycle from '../models/cycle.js';
import dynamicModel from '../models/dynamicModel.js';
import Papa from 'papaparse';
import sequelize from '../config/sequelize.js';


export const uploadData = async (req, res) => {
    await sequelize.sync();
    const file = req.file;
    console.log('Uploaded file:', req.file);
    // const csvResults = req.body;
    console.log('Uploaded file data:', req.body);

    if (!file) {
        return res.status(400).json({ error: 'No file received' });
    }

    // const fileContent = fs.readFile(file.path, 'utf-8');
    fs.readFile(file.path, 'utf-8', async (err, fileContent) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Failed to read the uploaded file' });
        }
        console.log("fileCotent in uploadData:", fileContent);
        const csvResults = Papa.parse(fileContent);
        console.log("csvResults in uploadtata:", csvResults);
        const columnNames = csvResults.data[0];
        console.log("columnNames in uploadtata:", columnNames);
        const jsonData = csvResults.data.slice(1);
        console.log("jsonData in uploadtata:", jsonData);

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
                    if (entry.hasOwnProperty('id') && entry['id'] !== undefined) {
                        mappedEntry['id'] = entry['id'];
                    }
                    columnNames.forEach((columnName, index) => {
                        mappedEntry[columnName] = entry[index] !== '' ? entry[index] : null;
                    });
                    return mappedEntry;
                });
                console.log('mappedData:', mappedData);
  
                //   await Model.create(mappedData);
                for (let entry of mappedData) {
                    await Model.create(entry);
                }

                fs.unlinkSync(file.path);

                // // Output to terminal
                // const headerRow = Object.keys(Model.rawAttributes);
                // const formattedData = [headerRow, ...mappedData];

                // // Output to terminal
                // formattedData.forEach(entry => {
                //     const formattedEntry = headerRow.map(attribute => entry[attribute]);
                //     console.log(formattedEntry.join(', '));
                // });

                const port = 8000;
                const responseData = {
                    success: 1,
                    file_url: `http://127.0.0.1:${port}/file/${req.file.filename}`,
                    columnNames: columnNames,
                    data: jsonData
                };

                return res.status(200).json({ message: 'Data uploaded and processed successfully', responseData });
            } else {
                return res.status(400).json({ error: 'Failed to determine the appropriate model for saving data' });
            }
        } catch (error) {
            console.error('Failed to process the uploaded data:', error);
            return res.status(500).json({ error: 'Failed to process the uploaded data' });
        }
    });
}
