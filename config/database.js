const mongoose = require('mongoose');

const connectDatabase = () => {
    console.log('Connecting');
    const uri = process.env.DB_LOCAL_URI;
    mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true, family: 4})
    .then(con => {
        console.log(`mongoDB Database connected with Host: ${con.connection.host}`)
    })
}

module.exports = connectDatabase;