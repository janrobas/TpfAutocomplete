var config = {};

config.dbSettings = {
   "host": "localhost",
   "user": "janrobas",
   "db": "testna_baza",
   "password": "janrobas",
   "tabela": "trojcek",

   "tpfname": "jamendo",
   "tpfurl": "http://127.0.0.1:3000/jamendo"
};

// host, user, db, password, tabela so podatki za dostop do podatkov v MariaDB / MySQL bazi.

// tpfname je tu samo informativno
// tpfurl je pot do vstopnega delčka TPF

module.exports = config;
