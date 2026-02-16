const express = require('express');
const app = express();
const cors = require('cors');
const userRoute = require('../src/Routes/user.route')
const adminRoute = require('../src/Routes/admin.route')

app.use(express.json());

app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}));

app.use('/api/auth', userRoute);
app.use('/api/auth', adminRoute);


module.exports = app;