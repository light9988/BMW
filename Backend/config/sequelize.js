import Sequelize from 'sequelize';
// import dotenv from 'dotenv';
// dotenv.config();

// Use local database
const sequelize = new Sequelize('db', 'demo', 'password', {
    dialect: "mysql",
    host: "127.0.0.1",
    database: "db",
    username: "demo",
    password: "password",
});

// const {
//     DATABASE_HOSTNAME,
//     DATABASE_NAME,
//     DATABASE_USERNAME,
//     DATABASE_PASSWORD,
//     DATABASE_DIALECT
// } = process.env;

// const sequelize = new Sequelize(DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD, {
//     dialect: DATABASE_DIALECT,
//     host: DATABASE_HOSTNAME,
// });

sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});

export default sequelize;