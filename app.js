const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const usersRoutes = require('./routes/users');
require('dotenv').config();
const app = express();


app.use(bodyParser.json());
app.use(express.json());

app.use(cors({
  origin: ['https://localhost', 'https://www.google.com', 'https://www.facebook.com','*'],
}));


app.use('/users', usersRoutes);

app.listen(5000, () => {
  console.log('Server started on port 5000');
});