var express = require('express');

var app = express();
// app.use(express.bodyParser());
app.use(express.json());
console.log(express.json.regexp);
console.log(JSON.parse('false'));
app.use(express.urlencoded());
// app.use(express.multipart());

app.get('/users', function(req, res) {
  res.send('user#index');
});

app.post('/users', function(req, res) {
  console.log(req.body);
  res.send('user#create');
});

module.exports = app
