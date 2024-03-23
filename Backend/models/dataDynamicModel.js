import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const generateAttributes = (columnNames) => {
    const attributes = {};
    for (const columnName of columnNames) {
        attributes[columnName] = { type: DataTypes.STRING };
    }
    return attributes;
};

const dataDynamicModel = (modelName, columnNames) => {
    const attributes = generateAttributes(columnNames);
    return sequelize.define(modelName, attributes);
};

export default dataDynamicModel;
