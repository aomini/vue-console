# 增加过期时间
ALTER TABLE package_management ADD expire_date TIMESTAMP NULL

# 增加金额
ALTER TABLE package_management ADD amount VARCHAR(255) NOT NULL DEFAULT "-"

# 已存在的数据，初始化过期时间
UPDATE package_management
LEFT JOIN support_package ON package_management.package_id = support_package.id
SET expire_date = DATE_ADD( package_management.effective_date, INTERVAL support_package.duration MONTH )

# 修改默认包信息-cn
UPDATE support_package
SET NAME = "开发者",
DESCRIPTION = "工单/邮件支持<br><hr>
在线文档和知识库<br><hr>
演示应用<br>
水晶球 - 通话调查"
WHERE
	package_type = 1

# 修改默认包信息-en
UPDATE support_package
SET NAME = "Developer",
DESCRIPTION = "Tickets/Emails Support<br><hr>
Online Documentation and KB Access<br><hr>
Reference Apps Access<br><hr>
Agora Analytics:<br>
Call search"
WHERE
	package_type = 2


# ============================================================================================
# 2020-02-20
# package_management_assignee增加role种类
ALTER TABLE package_management_assignee MODIFY COLUMN role TINYINT ( 1 ) NOT NULL COMMENT '1-solution architect, 2-technical account manager, 3-customer support, 4-owner, 5-backup'

# 修改description的长度
ALTER TABLE support_package MODIFY COLUMN description VARCHAR ( 3000 ) DEFAULT NULL

# 修改默认包信息-cn
UPDATE support_package
SET NAME = "开发者",
DESCRIPTION = "工单/邮件支持<br><hr>
在线文档和知识库<br><hr>
演示应用<br>
水晶球 - 通话调查"
WHERE
	package_type = 1

# 修改默认包信息-en
UPDATE support_package
SET NAME = "Developer",
DESCRIPTION = "Tickets/Emails Support<br><hr>
Online Documentation and KB Access<br><hr>
Reference Apps Access<br><hr>
Agora Analytics:<br>
Call search"
WHERE
	package_type = 2
# ============================================================================================

# ============================================================================================
# 2020-03-02
# package_management增加is_renew字段，是否自动续费
ALTER TABLE package_management ADD COLUMN is_renew TINYINT ( 1 ) DEFAULT 1 COMMENT '是否自动续 1-false,2-true'
# ============================================================================================
