DROP TABLE IF EXISTS `project_settings`;

CREATE TABLE `project_settings` (
  `project_id` varchar(64) NOT NULL,
  `setting_id` int(11)  NOT NULL,
  `company_id` int(11) NOT NULL,
  UNIQUE KEY `project_settings` (`project_id`, `setting_id`, `company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `settings`;

CREATE TABLE `settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `type_id` int(11) NOT NULL,
  `value` varchar(255)  NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

# Duration
INSERT INTO `settings` VALUES (1, 1, 'All');
INSERT INTO `settings` VALUES (2, 1, 'Host');
INSERT INTO `settings` VALUES (3, 1, 'Audience');

INSERT INTO `settings` VALUES (4, 1, 'Separate SD');

# Bandwidth
INSERT INTO `settings` VALUES (5, 2, 'All');
INSERT INTO `settings` VALUES (6, 2, 'Host');
INSERT INTO `settings` VALUES (7, 2, 'Audience');


# Transcoding
INSERT INTO `settings` VALUES (8, 3, 'H264 Duration');
INSERT INTO `settings` VALUES (9, 3, 'H264 Max Total Concurrent channels');
INSERT INTO `settings` VALUES (10, 3, 'H264 Max Total Host-in Concurrent channels');
INSERT INTO `settings` VALUES (11, 3, 'H264 Max Host-in Concurrent channels');
INSERT INTO `settings` VALUES (12, 3, 'H265 Duration');
INSERT INTO `settings` VALUES (13, 3, 'H265 Max Concurrent channels');

# SDK Recording
INSERT INTO `settings` VALUES (14, 4, 'Duration');
INSERT INTO `settings` VALUES (15, 4, 'Max Bandwidth');
INSERT INTO `settings` VALUES(16, 4, 'Separate SD');
COMMIT;

DROP TABLE IF EXISTS `settings_type`;

CREATE TABLE `settings_type` (
  `type_id` int(11) unsigned NOT NULL,
  `value` varchar(255)  NOT NULL,
  PRIMARY KEY (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `settings_type` VALUES (1, 'Duration');
INSERT INTO `settings_type` VALUES (2, 'Bandwidth');
INSERT INTO `settings_type` VALUES (3, 'Transcoding');
INSERT INTO `settings_type` VALUES (4, 'Recording SDK');
COMMIT;
