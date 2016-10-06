#!/bin/bash

# skripta je kompatibilna s strežnikom v repozitoriju: https://github.com/janrobas/TriplePatternFragmentsJan

touch sql_fragment.sql
> sql_fragment.sql

NAJDEN=1
PAGE=0

# to je potrebno spremeniti glede na pot do strežnika
cd ../Server.js-master
# to je potrebno spremeniti glede na pot do konfiguracijske datoteke od strežnika
node bin/ldf-server config-example.json &
pid=$!

sleep 4

while [  $NAJDEN -eq 1 ]; do
    let PAGE=PAGE+1

    curl -v -H "Accept: application/sql" http://localhost:3000/testhdt?page=$PAGE > sql_fragment.sql

    echo stran $PAGE

    if grep -q INSERT sql_fragment.sql; then
	# to je potrebno spremeniti glede na podatke za dostop do baze
        mysql --user=janrobas --password=janrobas testna_baza < sql_fragment.sql

        let NAJDEN=1
    else
        let NAJDEN=0
    fi
done


sudo kill -SIGINT $pid
