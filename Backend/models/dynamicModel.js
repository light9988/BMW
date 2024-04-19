import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const generateAttributes = (columnNames) => {
    const attributes = {};
    for (const columnName of columnNames) {
        attributes[columnName] = { type: DataTypes.STRING };
        
        if (columnName.toLowerCase().includes('number')) {
            attributes[columnName] = { type: DataTypes.INTEGER };
        } else if (columnName.toLowerCase().includes('float')) {
            attributes[columnName] = { type: DataTypes.FLOAT };
        }
    }
    return attributes;
};


const dynamicModel = (modelName, columnNames) => {
    const attributes = generateAttributes(columnNames);
    return sequelize.define(modelName, attributes);
};

export default dynamicModel;
