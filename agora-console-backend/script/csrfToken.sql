CREATE TABLE `csrf_token` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `token` varchar(255) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL COMMENT '创建时间-UTC',
  `expire_at` datetime NOT NULL COMMENT '过期时间-UTC',
  PRIMARY KEY (`id`),
  KEY `token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
