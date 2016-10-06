var express = require('express');
var router = express.Router();
var config = require('../config');
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  var contents = "";

  if(req.query.load) {
    contents = fs.readFileSync("testqueries_po_datotekah/" + req.query.load, 'utf8');
  }
      
  res.render('bm', { title: 'Iskalnik', contents: contents });
});

module.exports = router;
