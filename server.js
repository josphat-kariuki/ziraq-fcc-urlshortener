'use strict';

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Basic Configuration 
require('dotenv').config();
const port = process.env.PORT || 3000;
const mongoUrl = process.env.MONGO_URI;
// Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// constants
const Url = require('./model/urlModel.js');

// MongoDB connection
mongoose.connect(mongoUrl,  { useCreateIndex: true, useNewUrlParser: true });
const connection = mongoose.connection;
connection.on('error', (err) => console.log(err.message));
connection.once('open', () => {
  console.log('MongoDB connection establishes successfully.');
});

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl/new', (req, res) => {
  const regexTester = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
  const newUrl = req.body.url;
  if (!regexTester.test(newUrl)) {
    res.status(400).json({error: "invalid URL"});
  } else {
    const findExistingEntry = Url.findOne(
        { original_url: newUrl },
        { original_url: 1, short_url: 1}
    ).then(function(data) {
      if (data) {
        return res.send({original_url: data.original_url, short_url: data.short_url});
      } else {
        const documentCount= Url.find().countDocuments().then((data)=>{
          //generate random number 1-100
          const newId=Math.floor((Math.random() * 100) + 1);
          //append doc number to end of newId
          newId=parseInt(""+newId+data);

          const urlToShorten = new Url({
            original_url: newUrl, 
            short_url:newId
          });
          //save the new object
          urlToShorten.save((err, response) => {
            if (err) {
              return res.json({ success: false, error: err });
            }
            return res.send(response);
          });
        });
      }
    });
  }
});

//Return all saved original urls and short urls
app.get("/geturls", (req, res) => {
  Url.find({}, (err, docs) => {
    if (err)  res.status(400).json({ error: 'could not load urls' });
    res.json(docs)
  })
});

// Redirect if a correct short_url is given as a param
app.get('/api/shorturl/:short_url', function(req, res, next) {
    if( !req.params.short_url ) res.status(400).json({ error: 'Short code required' });
  
    Url.findOne({ short_url: Number(req.params.short_url) }, (err, doc) => {
      if(err) res.status(400).json({ error: 'short_url id not present' });
      res.redirect( doc.original_url );
    });
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});