-- dashboard.okta_user_id definition

CREATE TABLE `okta_user_id` (
  `user_id` int(11) DEFAULT NULL,
  `okta_user_id` varchar(40) DEFAULT NULL,
  UNIQUE KEY `index` (`user_id`,`okta_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
