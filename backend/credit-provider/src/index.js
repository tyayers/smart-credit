const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');
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
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan('combined'));

// defining an endpoint to return all ads
app.post('/credit/calculate-rate', (req, res) => {

  // First check if there is an image to analyze
  if (req.body.images != undefined) {
    axios.post('https://airport-security-onv7eg4pxq-ew.a.run.app/security/cloudvision', req.body.images)
    .then(function (response) {
      // console.log(response);
      var objectName = "";
      for (i=0; i < 4; i++) {
        if (i < response.data.responses[0]["labelAnnotations"].length) {
          var label = response.data.responses[0]["labelAnnotations"][i];
          objectName += label.description + ", ";
        }
      }

      req.body.objectKeywords = objectName;

      calculate(req, res);
    })
    .catch(function (error) {
      console.log(error);
    });    
  }
  else {
    calculate(req, res);
  }
});

function calculate(req, res) {
  var result = {
    "objectId": req.body.objectId,
    "objectValue": req.body.objectValue,
    "objectKeywords": req.body.objectKeywords,
    "currencyCode": req.body.currencyCode,
    "customerId": req.body.currencyId,
    "months": req.body.months,
    "addOns": []
  };

  if (req.body.objectKeywords.toLowerCase().includes("kitchen")) {
    result.objectType = "kitchen";
    if (!req.body.objectValue) result.objectValue = 12000;
  }
  else if (req.body.objectKeywords.toLowerCase().includes("pool")) {
    result.objectType = "pool";
    if (!req.body.objectValue) result.objectValue = 15000;
  }
  else if (req.body.objectKeywords.toLowerCase().includes("car")) {
    result.objectType = "car";
    if (!req.body.objectValue) result.objectValue = 25000;
  }
  else {
    result.objectType = "unknown";
    if (!req.body.objectValue) result.objectValue = 10000;
  }

  result.rate = (((result.objectValue * 1.0401) / result.months)).toFixed(2);
  result.effectiveInterestRate = 4.01;

  var promises = [];
  let insuranceRef = db.collection('insurance-providers');
  let allProviders = insuranceRef.get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        promises.push(axios.post(doc.data()["service-url"], result).then(function (response) {
          var data = response.data;
          data.objectType = result.objectType;
          data.website = doc.data().website;
          data.providerName = doc.data().providerName;
          data.confirmationUrl = doc.data()["service-url"] + "/89fd98sf8d9sf8ds998fds989fe/confirm";
          return data;
        }).catch(function (error) {
          console.log(error);
        }))
      });
    })
    .catch(err => {
      console.log('Error getting documents', err);
    }).finally( function() {
      Promise.all(promises).then(function(values) {
        result.addOns = values;
        res.send(result);
      });
    });
}

// starting the server
app.listen(8080, () => {
  console.log('listening on port 8080');
});
