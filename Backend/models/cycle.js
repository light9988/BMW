import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Cycle = sequelize.define('Cycle', {
    cycle_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    time: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    current: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    voltage: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
});

export default Cycle;