-- dashboard.okta_basic_auth definition

CREATE TABLE `okta_basic_auth` (
  `company_id` int(11) DEFAULT NULL,
  `username` varchar(40) DEFAULT NULL,
  `password` varchar(40) DEFAULT NULL,
  `enable` tinyint(1) NOT NULL DEFAULT '0',
  UNIQUE KEY `idx_username` (`username`),
  UNIQUE KEY `idx_company_id` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
