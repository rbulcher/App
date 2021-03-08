const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const mongoose = require('mongoose')
const port = process.env.PORT || 1337;

require('dotenv').config();

const middlewares = require('./middlewares');
const logs = require('./api/logs');

const app = express();
const path = require('path')

mongoose.connect(process.env.DATABASE_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(morgan('common'));
app.use(cors());
app.use(express.json());
app.use(express.static("express"));


app.use('/api/logs', logs);

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

app.listen(port);

