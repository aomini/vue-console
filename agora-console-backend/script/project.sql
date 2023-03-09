CREATE TABLE `certificate_backup_info` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `project_id` varchar(128) COLLATE utf8mb4_general_ci NOT NULL,
  `status` int NOT NULL COMMENT '1:启用 2:禁止',
  `sign_key_backup` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '证书',
  `company_id` int NOT NULL COMMENT 'cid',
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
   updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  PRIMARY KEY (`project_id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
