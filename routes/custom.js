var express = require('express');
var router = express.Router();
var config = require('../config');
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('custom', { title: 'Iskalnik', contents: "" });
});

module.exports = router;
