
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('express-jwt');
const jwtScope = require('express-jwt-scope');
const jwksRsa = require('jwks-rsa');
const authConfig = require('./auth_config_prod.json');  
const axios = require("axios");
const bodyParser = require('body-parser');

const app = express();

if (
  !authConfig.domain ||
  !authConfig.audience ||
  authConfig.audience === "YOUR_API_IDENTIFIER"
) {
  console.log(
    "Exiting: Please make sure that auth_config.json is in place and populated with valid domain and audience values"
  );

  process.exit();
}

app.use(morgan('dev'));
app.use(helmet());
app.use(
  cors({
    origin: authConfig.appUri,
  })
);




var ManagementClient = require('auth0').ManagementClient;
var auth0 = new ManagementClient({
  domain: 'dev-aam3gkbf.us.auth0.com',
  clientId: 'fXq3Zr77II2Tg3KeknMJd1hovp2F2wIn',
  clientSecret: '_P3ej96-1WBS7Zpo21JDxnmqzsE1K3rN-l2T-hsk5s1Fx6yVXjzswWcEmABLlPF_',
  scope: 'read:users update:users',
});





// var options = { method: 'POST',
// url: 'https://dev-aam3gkbf.us.auth0.com/oauth/token',
// headers: { 'content-type': 'application/json' },
// body: '{"client_id":"fXq3Zr77II2Tg3KeknMJd1hovp2F2wIn","client_secret":"_P3ej96-1WBS7Zpo21JDxnmqzsE1K3rN-l2T-hsk5s1Fx6yVXjzswWcEmABLlPF_","audience":"https://dev-aam3gkbf.us.auth0.com/api/v2/","grant_type":"client_credentials"}' };
// app.use(express.json());
// request(options, function (error, response, body) {
//   if (error) throw new Error(error);
//   const mgmtToken = response.body.access_token;
//   console.log(response.body.access_token);
//   console.log(mgmtToken);
// });



const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ['RS256'],
});

app.get('/api/external', checkJwt, (req, res) => {
  res.send({
    msg: 'Your access token was successfully validated!',
  });
});

app.get('/api/pizza', checkJwt, (req, res) => {
  res.send({
    pizzas: [
      {
        type: 'Cheese',
        price: 5
      },
      {
        type: 'Pepperoni',
        price: 5
      },
      {
        type: 'Sausage',
        price: 6
      },
      {
        type: 'Supreme',
        price: 6
      }
    ]
  });
});


app.use(express.json());
app.post('/api/order', checkJwt, jwtScope('write:orders'), (req, res) => {
  let objWithId = {
    id: req.body.user_id
  }
  let orders = {
    orders: req.body.orders
  }

  auth0.updateUserMetadata(objWithId, orders)
  .then(response => {
    res.send(response.data);
  })
  .catch(err => {
    res.status(400).send(err);
  })

      // var optionsUpdate = {
      //   method: 'PATCH',
      //   url: `https://dev-aam3gkbf.us.auth0.com/api/v2/users/${req.body.user_id}`,
      //   headers: {authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtHVHc2UXF1c2JNYmlYQWdEVndvMCJ9.eyJpc3MiOiJodHRwczovL2Rldi1hYW0zZ2tiZi51cy5hdXRoMC5jb20vIiwic3ViIjoiZlhxM1pyNzdJSTJUZzNLZWtuTUpkMWhvdnAyRjJ3SW5AY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vZGV2LWFhbTNna2JmLnVzLmF1dGgwLmNvbS9hcGkvdjIvIiwiaWF0IjoxNjQ1NTEyOTM1LCJleHAiOjE2NDU1OTkzMzUsImF6cCI6ImZYcTNacjc3SUkyVGczS2Vrbk1KZDFob3ZwMkYyd0luIiwic2NvcGUiOiJyZWFkOnVzZXJzIHVwZGF0ZTp1c2VycyIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyJ9.uVYkUJupMBht7b01NUci-b2-1fKEQA-qjuqP4QzYNTPEagsBs_R-cIEqlD62cHyGddh3v5SmLO38gWw2cGzRJUQ_mRWGQUrxsqNxhnPrDj1nln76rhcEAa2dIX8JbzFCTM9O_fzbPlunUD4i1BNwSn00ogBm6gfqNC4PyJle4bub2snMO4pHE0E2ARua0nCTO7drQrGKiFHRFkv7KjWAfX-njtfCeRTTOl2iAOFWRgYNF-9Kea3fMBD_XoTJ_hjaVeEb0qY5_QhqG6oHRjvhILbVGZmHxy0s7RApOfKf44Z2R8AKdeMuUDOnGvKWwCgGOWCHH5DzYgEEksx8Qt14nQ', 'content-type': 'application/json'},
      //   data: {user_metadata: {orders: req.body.orders}}
      // };

      // axios.request(optionsUpdate).then(function (response) {
      //   console.log("pacthed", response);
      //   res.send(response.data);
      // }).catch(function (error) {
      //   console.error(error);
      //   res.status(400).send(error);
      // });
});

app.use(express.json());
app.post('/api/verification-email', checkJwt, (req, res) => {

      var options = {
        method: 'POST',
        url: `https://dev-aam3gkbf.us.auth0.com/api/v2/jobs/verification-email`,
        headers: {authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtHVHc2UXF1c2JNYmlYQWdEVndvMCJ9.eyJpc3MiOiJodHRwczovL2Rldi1hYW0zZ2tiZi51cy5hdXRoMC5jb20vIiwic3ViIjoiZlhxM1pyNzdJSTJUZzNLZWtuTUpkMWhvdnAyRjJ3SW5AY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vZGV2LWFhbTNna2JmLnVzLmF1dGgwLmNvbS9hcGkvdjIvIiwiaWF0IjoxNjQ1NTE0MzU3LCJleHAiOjE2NDU2MDA3NTcsImF6cCI6ImZYcTNacjc3SUkyVGczS2Vrbk1KZDFob3ZwMkYyd0luIiwic2NvcGUiOiJyZWFkOnVzZXJzIHVwZGF0ZTp1c2VycyBjcmVhdGU6dXNlcl90aWNrZXRzIiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIn0.K7jh4eSIRCmXjXKwX7nsWHPzOX1Rhom1ybbKjeTCZfsGJqXQN1C4jcJTVGnwPfvj8j_Z0I21zMw3kcJgYzs7DzrIK1POcWwoLp9kALD6M_dKDSiDp-dPMD2eFDkhyXHwHDe8Jbh1vwI8PKvQIJbpdrWuoO5lFYxeJGFeItaQyC2LvRH4_mCTl_ur_F33BkWx_ws_uSp3YM4dUSa8U3X9SDpAgDxuNhsTMvBZoQJ_4HPmlde7eAM_NyVPJeEj8jrYP0OMaHcoIZryQaLeI937w-av1yZYV24WlDba1SOJ8-yMU5-UHoJ6QwKuhdORIICSZGV1bG8x00lZM6UOO1Witg`, 'content-type': 'application/json'},
        data: {user_id: req.body.user_id, client_id: 'kup0idWFmiwEAFeNbUtReI7kblEVLjzs'}
      };

      axios.request(options).then(function (response) {
        console.log("sent email", response);
        res.send(response.data);
      }).catch(function (error) {
        console.error(error);
        res.status(400).send(error);
      });
});


const port = process.env.API_SERVER_PORT || 3001;

app.listen(port, () => console.log(`Api started on port ${port}`));
