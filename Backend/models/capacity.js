import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Capacity = sequelize.define('User', {
    cycle_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    capacity: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
  
});

export default Capacity;