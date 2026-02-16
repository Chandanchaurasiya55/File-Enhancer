const dotenv = require('dotenv');
dotenv.config();
const app = require('./src/app');
const port = process.env.PORT || 3000;

const connectDB = require('./src/DB/db');
connectDB();



app.get('/', (req, res) => {
    res.send(`Hii, Your app is running`);
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})