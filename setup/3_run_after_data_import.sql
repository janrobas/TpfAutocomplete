DELETE FROM trojcek WHERE LENGTH(s) = 255;
DELETE FROM trojcek WHERE LENGTH(p) = 255;
DELETE FROM trojcek WHERE LENGTH(o) = 255;


-- https://mariadb.com/kb/en/mariadb/substring_index/
UPDATE trojcek SET s_del = SUBSTRING_INDEX(s, '/', -1);

UPDATE trojcek SET p_del = SUBSTRING_INDEX(p, '/', -1);

UPDATE trojcek SET o_del = SUBSTRING_INDEX(o, '/', -1);
