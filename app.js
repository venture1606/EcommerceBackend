const express = require('express')
const app = express();
const cors = require('cors')
const cookieParser = require('cookie-parser')
const errorMiddleWare = require('./Middleware/errors');

// Use CORS middleware
app.use(cors({
    origin: ['https://scrap-basic-pattern.web.app', 'https://e-commerce-one-bay-30.vercel.app/', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3008'], // Add all your frontend URLs
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Preflight request handling
app.options('*', cors());

app.use(express.json());
app.use(cookieParser())

const products = require('./routes/product');
const auth = require('./routes/auth');
const order = require('./routes/order');
const category = require('./routes/category');

// print hello for the url
app.get('/', (req, res) => {
    res.send('Hello from express')
})

app.use('/api/v1', products)
app.use('/api/v1', auth)
app.use('/api/v1', order)
app.use('/api/v1', category)

app.use(errorMiddleWare)

module.exports = app
