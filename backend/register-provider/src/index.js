// importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

var admin = require("firebase-admin");
var serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://smart-credit-cfc36.firebaseio.com"
});

const db = admin.firestore();

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
app.put('/insurance/provider', (req, res) => {
  // req.body.param1
  // process.env.PORT
  let docRef = db.collection('insurance-providers').doc();

  let providerObject = docRef.set({
    "providerName": req.body.providerName,
    "website": req.body.website,
    "service-url": req.body["service-url"],
    "verified": false
  });
  
  res.send();
});

// starting the server
app.listen(8080, () => {
  console.log('listening on port 8080');
});
