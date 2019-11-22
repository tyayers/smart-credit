// importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

// defining the Express app
const app = express();

// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan('combined'));

// defining an endpoint to return all ads
app.post('/insurance/calculate-rate', (req, res) => {

  var rate = process.env.RATE;

  var result = {
    objectId: req.body.objectId,
    objectValue: req.body.objectValue,
    objectKeywords: req.body.objectKeywords,
    currencyCode: req.body.currencyCode,
    customerId: req.body.customerId,
    months: req.body.months,
    rate: ((req.body.objectValue / req.body.months) * rate).toFixed(2)
  };

  res.send(result);
});

// starting the server
app.listen(8080, () => {
  console.log('listening on port 8080');
});
