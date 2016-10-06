var express = require('express');
var router = express.Router();
var config = require('../config');
var mysql = require('mysql');
var pageLen = 10;

var connection = mysql.createPool({
    host     : config.dbSettings.host,
    user     : config.dbSettings.user,
    password : config.dbSettings.password,
    database : config.dbSettings.db,
    connectionLimit: 50
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: "Iskalnik", tpfname: config.dbSettings.tpfname, tpfurl: config.dbSettings.tpfurl });
});

router.get('/autocomplete', function(req, res, next) {
  var searchQuery = (req.query.q || "").trim();
  var s=true,p=true,o=true;

  if(searchQuery.toLowerCase().startsWith("s:")) {
    p=false; o=false;
    searchQuery = searchQuery.substring(2).trim();
  } else if(searchQuery.toLowerCase().startsWith("p:")) {
    s=false; o=false;
    searchQuery = searchQuery.substring(2).trim();
  } else if(searchQuery.toLowerCase().startsWith("o:")) {
    p=false; s=false;
    searchQuery = searchQuery.substring(2).trim();
  }

  var queries = new Array();

  var from = " FROM " + config.dbSettings.db + "." + config.dbSettings.tabela;
  var sConditions = new Array(), pConditions = new Array(), oConditions = new Array();
  if(searchQuery) {
    sConditions.push("s_del LIKE " + mysql.escape(searchQuery+"%"));
    pConditions.push("p_del LIKE " + mysql.escape(searchQuery+"%"));
    oConditions.push("o_del LIKE " + mysql.escape(searchQuery+"%"));
  }
  var page = req.query.p || 1;  // TODO: Ni problem v tem, ampak v CURL - če je & v ", potem je o.k. -- itak
  var offset = (page-1)*pageLen;
  limit = " LIMIT " + offset + ", " + (offset + pageLen + 1);

  s = s && !(req.query.selected || []).some(x => x.split("|")[1] == "s");
  p = p && !(req.query.selected || []).some(x => x.split("|")[1] == "p");
  o = o && !(req.query.selected || []).some(x => x.split("|")[1] == "o");

  var conditionsMap = (function(s) {
    var sArr = s.split("|");

    if(sArr[2].trim().startsWith("?"))
        return false;

    switch(sArr[1]) {
      case "s":
        return "s = '" + sArr[2] + "'";
      case "p":
        return "p = '" + sArr[2] + "'";
      case "o":
        return "o = '" + sArr[2] + "'";
    }
  });

  var conditions = (req.query.selected || []).map(conditionsMap).filter(x => x);

  if(s) {
    sConditions = sConditions.concat(conditions);
    var where="";
    if(sConditions.length != 0) {
      where = " WHERE " + sConditions.join(" AND ");
    }
    queries.push({ type:"s", query:"SELECT DISTINCT s AS u, s_del AS u_del" + from + where + limit});
  }

  if(p) {
    pConditions = pConditions.concat(conditions);
    var where="";
    if(pConditions.length != 0) {
      where = " WHERE " + pConditions.join(" AND ");
    }
    queries.push({ type:"p", query:"SELECT DISTINCT p AS u, p_del AS u_del" + from + where + limit});
  }

  if(o) {
    oConditions = oConditions.concat(conditions);
    var where="";
    if(oConditions.length != 0) {
      where = " WHERE " + oConditions.join(" AND ");
    }
    queries.push({ type:"o", query:"SELECT DISTINCT o AS u, o_del AS u_del" + from + where + limit});
  }

  var items=new Array();

  if(page == 1 && searchQuery[0] == '?') {
    if(searchQuery.length > 1) {
      if(s==true) items.push({ "id":"1|s|"+searchQuery, "text": "s: " + searchQuery });
      if(p==true) items.push({ "id":"2|p|"+searchQuery, "text": "p: " + searchQuery });
      if(o==true) items.push({ "id":"3|o|"+searchQuery, "text": "o: " + searchQuery });
    }

    if(req.query.spremenljivke) {
      for(var i=0; i<req.query.spremenljivke.length; i++) {
        var spr = req.query.spremenljivke[i];
        if(s==true) items.push({ "id":"1|s|"+spr, "text": "s: " + spr });
        if(p==true) items.push({ "id":"2|p|"+spr, "text": "p: " + spr });
        if(o==true) items.push({ "id":"3|o|"+spr, "text": "o: " + spr });
      }
    }
  }

  var finishedQueries=0;
  var sqlRows=0;
  for(var i in queries) {
    connection.query(queries[i].query, (function(type, err, rows, fields) {
      if (err) throw err;

      var num;
      switch(String(type)) {
        case "s":
          num=1;
          break;
        case "p":
          num=2;
          break;
        case "o":
          num=3;
          break;
      }

      for(var r in rows) {
        items.push({ "id":(num + "|" + type + "|" + rows[r].u), "text": type + ": " + (rows[r].u_del || rows[r].u), url: rows[r].u, del: rows[r].u_del });
        sqlRows++;
      }

      finishedQueries++;
      if(finishedQueries == queries.length) {
        var more = (items.length > pageLen);
        items.splice(pageLen, sqlRows - pageLen);
        res.send(JSON.stringify({ more, items, page }));
      }
    }).bind(this, queries[i].type));
  }
});

module.exports = router;
