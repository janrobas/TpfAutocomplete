# Autocomplete

To je izvorna koda grafičnega vmesnika za sestavljanje in izvajanje poizvedb SPARQL.

Vmesnik potrebuje podatkovno bazo MariaDB ali MySQL in različico strežnika TPF, ki je v repozitoriju: https://github.com/janrobas/TriplePatternFragmentsJan.

Navodila za namestitev:
1. V podatkovni bazi je potrebno kreirati tabelo z SQL kodo v datoteki setup/1_create_sql_table.sql.
2. Potrebno je prenesti in nastaviti TPF strežnik: https://github.com/janrobas/TriplePatternFragmentsJan.
3. Potrebno je nastaviti parametre (pot do strežnika, podatke za dostop do podatkovne baze) v datoteki setup/2_sql_pretvorba.sh in jo pognati. Skripta je bila testirana v sistemu Ubuntu z odjemalcem MySQL. Če se namešča na drug operacijski sistem, je potrebno drugače poskrbeti za prenos trojčkov v podatkovno bazo.
4. Potrebno je pognati SQL kodo v datoteki 3_run_after_data_import.sql, da se napolnijo polja z deli URIjev.
5. Potrebno je nastaviti parametre v datoteki config.js (podatki za dostop do podatkovne baze in URL do vstopnega delca TPF).
