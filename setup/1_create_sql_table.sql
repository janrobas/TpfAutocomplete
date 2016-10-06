CREATE TABLE `trojcek` (
  `idtrojcek` int(11) NOT NULL AUTO_INCREMENT,
  `s` varchar(255) NOT NULL,
  `p` varchar(255) NOT NULL,
  `o` varchar(255) NOT NULL,
  `s_del` varchar(255) DEFAULT NULL,
  `p_del` varchar(255) DEFAULT NULL,
  `o_del` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idtrojcek`),
  KEY `idx_trojcek_s` (`s`),
  KEY `idx_trojcek_p` (`p`),
  KEY `idx_trojcek_o` (`o`),
  KEY `idx_trojcek_s_del` (`s_del`),
  KEY `idx_trojcek_p_del` (`p_del`),
  KEY `idx_trojcek_o_del` (`o_del`),
  KEY `idx_trojcek_s_p_o` (`s`,`p`,`o`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
