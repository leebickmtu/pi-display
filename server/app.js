'use strict';

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const multer = require('multer');
const exec = require('child_process').exec;
const fs = require('fs');

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function(req, file, cb) {
    cb(null, 'signage.ppt');
  }
});
var upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
    if (['ppt'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
      return cb(new Error('Wrong file type. File must be .ppt type.'));
    }
    cb(null, true);
  }
}).single('file');

var app = express();

//app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

var server = app.listen(5000, function () {
  console.log('Server started on port: ' + server.address().port);
});

app.post('/api/upload', function(req, res) {
  console.log("upload");
  var cmd = 'pkill soffice';
  exec(cmd, function(error, stdout, stderr) {
    fs.unlink(path.join(__dirname, '../uploads/signage.ppt'), function() {
      upload(req, res, function(err) {
        res.status(200).send();
      });
    });
  });
});

app.get('/api/file', function(req, res) {
  console.log("download");
  fs.stat(path.join(__dirname, '../uploads/signage.ppt'), function(err, stat) {
    if(err == null) {
      res.setHeader('Content-disposition', 'attachment; filename=signage.ppt');
      res.sendFile('signage.ppt', {root: path.join(__dirname, '../uploads')});
    }
    else {
      res.status(500).send();
    }
  });
});

app.get('/api/runIt', function(req, res) {
  console.log("run");
  fs.stat(path.join(__dirname, '../uploads/signage.ppt'), function(err, stat) {
    if(err == null) {
      var cmd = 'soffice --norestore --show ' + path.join(__dirname, '../uploads/signage.ppt');
      exec(cmd);
      res.status(200).send();
    }
    else {
      res.status(500).send();
    }
  });
});

app.get('/api/stopIt', function(req, res) {
  console.log("stop");
  var cmd = 'pkill soffice';
  exec(cmd, function(error, stdout, stderr) {
    res.status(200).send();
  });
});
