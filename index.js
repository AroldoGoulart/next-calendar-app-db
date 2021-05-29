const express = require('express');
const fs = require('fs');
const https = require('https')
const cors = require('cors');
const app = express();
const port = process.env.port || 5353;
const connection = require("./src/connection");
app.use(express.json());
app.use(cors())

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/app.nonsolograndine.it/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/app.nonsolograndine.it/fullchain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
};

app.get('/', function (req, res) {
  res.send('hello world')
})

https.createServer(credentials, app)
.listen(3000, function () {
  console.log('Example app listening on port 3000! Go to https://localhost:3000/')
})

