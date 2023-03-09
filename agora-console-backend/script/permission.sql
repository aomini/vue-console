# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 127.0.0.1 (MySQL 5.6.42)
# Database: vendors
# Generation Time: 2019-05-07 08:21:43 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table company_role
# ------------------------------------------------------------

DROP TABLE IF EXISTS `company_role`;

CREATE TABLE `company_role` (
  `id` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `company_id` bigint(20) DEFAULT NULL,
  `auto` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `company_role` WRITE;
/*!40000 ALTER TABLE `company_role` DISABLE KEYS */;

INSERT INTO `company_role` (`id`, `name`, `company_id`, `auto`)
VALUES
	(1,'管理员',0,0),
	(2,'产品、运营',0,0),
	(3,'客服、技术支持',0,0),
	(4,'工程师',0,0),
	(5,'财务',0,0),
	(6,'CNOwner', 0, 1),
	(7, 'ENOwner', 0, 1),
	(8, 'Cocos', 0, 1);

/*!40000 ALTER TABLE `company_role` ENABLE KEYS */;
UNLOCK TABLES;


DROP TABLE IF EXISTS `res_permission`;

CREATE TABLE `res_permission` (
  `id` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `res_id` varchar(255) NOT NULL DEFAULT '',
  `res_type` varchar(255) NOT NULL,
  `permission` int(2) DEFAULT '0',
  `role_id` int(20) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `res_permission` WRITE;
/*!40000 ALTER TABLE `res_permission` DISABLE KEYS */;

INSERT INTO `res_permission` (`id`, `res_id`, `res_type`, `permission`, `role_id`)
VALUES
	(1,'1','module',1,1),
	(2,'2','module',1,1),
	(3,'3','module',1,1),
	(4,'4','module',2,1),
	(5,'5','module',2,1),
	(6,'0','project',0,1),
	(7,'1','module',1,2),
	(8,'2','module',0,2),
	(9,'3','module',0,2),
	(10,'4','module',0,2),
	(11,'5','module',0,2),
	(12,'0','project',0,2),
	(13,'1','module',0,3),
	(14,'2','module',1,3),
	(15,'3','module',0,3),
	(16,'4','module',0,3),
	(17,'5','module',0,3),
	(18,'0','project',0,3),
	(19,'1','module',0,4),
	(20,'2','module',1,4),
	(21,'3','module',0,4),
	(22,'4','module',0,4),
	(23,'5','module',2,4),
	(24,'0','project',0,4),
	(25,'1','module',0,5),
	(26,'2','module',0,5),
	(27,'3','module',1,5),
	(28,'4','module',0,5),
	(29,'5','module',0,5),
	(30,'0','project',0,5),
	
	# CN
	(31,'1','module',1,6),
	(32,'2','module',1,6),
	(33,'3','module',1,6),
	(34,'4','module',2,6),
	(35,'5','module',2,6),
	(36,'0','project',0,6),
	
	# EN
	(37,'1','module',1,7),
	(38,'2','module',1,7),
	(39,'3','module',0,7),
	(40,'4','module',2,7),
	(41,'5','module',2,7),
	(42,'0','project',0,7),

	# Cocos
	(43,'1','module',1,8),
	(44,'2','module',1,8),
	(45,'3','module',0,8),
	(46,'4','module',0,8),
	(47,'5','module',2,8),
	(48,'0','project',0,8);

/*!40000 ALTER TABLE `res_permission` ENABLE KEYS */;
UNLOCK TABLES;


DROP TABLE IF EXISTS `entity_role`;

CREATE TABLE `entity_role` (
  `id` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `entity_id` varchar(255) NOT NULL DEFAULT '',
  `entity_type` varchar(255) NOT NULL DEFAULT 'account',
  `permission` int(2) DEFAULT '0',
  `role_id` int(20) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `entity_role` (`id`, `entity_id`, `entity_type`, `permission`, `role_id`)
VALUES
	(1,'0','CNAccount',0,6),
	(2,'0','ENAccount',0,7),
	(3,'0','Cocos',0,8);

DROP TABLE IF EXISTS `res_module`;

CREATE TABLE `res_module` (
  `id` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL DEFAULT '',
  `parent_id` int(20) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `res_module` WRITE;
/*!40000 ALTER TABLE `res_module` DISABLE KEYS */;

INSERT INTO `res_module` (`id`, `key`, `parent_id`)
VALUES
	(1,'Usage',0),
	(2,'AgoraAnalytics',0),
	(3,'FinanceCenter',0),
	(4,'Member&RoleManagement',0),
	(5,'ProjectManagement',0),
	(6,'AnalyticsLab',0),
	(7,'Duration',1),
	(8,'Bandwidth',1),
	(9,'Transcoding',1),
	(10,'MiniApp',1),
	(11,'RecordingSDK',1),
	(12,'CloudRecording',1),
	(13,'CallResearch',2),
	(14,'LiveCommunication',2),
	(15,'LiveBroadcast',2),
	(16,'UsageAnalytics',2),
	(17,'CustomiseAnalytics',2),
	(18,'QualityStatistics',2),
	(19,'ALiPay',3),
	(20,'BankTransfer',3),
	(21,'Transactions',3),
	(22,'Billing',3),
	(23,'Member',4),
	(24,'Role',4);

/*!40000 ALTER TABLE `res_module` ENABLE KEYS */;
UNLOCK TABLES;


COMMIT;


/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
