import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Capacity = sequelize.define('Capacity', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: true,
    },
    cycle_number: {
        type: DataTypes.INTEGER,
        // allowNull: false,
    },
    capacity: {
        type: DataTypes.FLOAT,
        // allowNull: false,
    },
}, {
    timestamps: true, 
});

export default Capacity;