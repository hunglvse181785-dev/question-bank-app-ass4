const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

const certificate = fs.readFileSync(
  path.join(__dirname, '../certs/localhost-cert.pem')
);

const apiClient = axios.create({
  baseURL: process.env.API_BASE_URL,
  timeout: 10000,
  httpsAgent: new https.Agent({
    ca: certificate
  })
});

module.exports = apiClient;