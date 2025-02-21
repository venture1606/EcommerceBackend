const app = require('./app')
const dotenv = require('dotenv');
const connectDatabase = require('./config/database')

process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.message}`);
    console.log('Shutting down due to uncaught exception')
    process.exit(1)
})

// setting up config file
dotenv.config({path: './config/config.env'});

// connecting database
connectDatabase();

const PORT = process.env.PORT || 3008;
const server = app.listen(PORT, () => {
    console.log(`Server is started in ${PORT} in ${process.env.NODE_ENV} mode.`)
})

process.on('unhandledRejection', err => {
    console.log(`ERROR: ${err.message}`);
    console.log('Shutting down the server due to Unhandled Promise rejection')
    server.close(() => {
        process.exit(1)
    })
})

