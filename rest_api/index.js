require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const passport = require('passport');

// setup mongo connection
const uri = process.env.MONGO_CONNECTION_URL;
const mongoConfig = {
  useNewUrlParser: true,
  useCreateIndex: true,
}

if (process.env.MONGO_USER_NAME && process.env.MONGO_PASSWORD) {
  mongoConfig.auth = { authSource: 'admin' };
  mongoConfig.user = process.env.MONGO_USER_NAME;
  mongoConfig.pass = process.env.MONGO_PASSWORD;
}

mongoose.connect(uri, mongoConfig);

mongoose.connection.on('error', (error) => {
  console.log(error);
  process.exit(1);
});
mongoose.set('useFindAndModify', false);


const routes = require('./routes/main');
const passwordRoutes = require('./routes/password');
const secureRoutes = require('./routes/secure');


const app = express();
const port = process.env.PORT || 3000;

// * update express settings
app.use(bodyParser.urlencoded({ extended: false })); //pass applcation/x-www-form-urlencoded data;
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: process.env.CORS_ORIGIN }))

// * require passport auth
require('./auth/auth');

// * setup routes
app.use('/', routes);
app.use('/', passwordRoutes);
app.use('/', passport.authenticate('jwt', { session: false }), secureRoutes);

// * catch all other routes
app.use((req, res) => {
  res.status(404).json({ message: '404 - not found', status: 404 })
})

// * handle errors
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({ error: error.message, status: 500 })
})

mongoose.connection.on('connected', () => {
  console.log('connceted to mongo');
  app.listen(port, () => {
    console.log(`server is running on port: ${port}`);
  })
});