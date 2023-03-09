export const ErrCode = {
  'OAUTH_CALLBACK_ERROR': 5001,
  'APP_LIMIT_REACHED': 6001,
  'More_Parameter_Error': 6002,
  'Expired_Error': 6003,
  'Project_ID_Error': 6004,
  'ACCOUNT_BLOCKED': 6006,
  'ACCOUNT_EMAIL_MISMATCH': 6007,
  'PARAMETER_ERROR': 6008,

  'Without_Permission': 4003,

  // finance errors start with 4300
  'CASH_INFO_ERROR': 4301,
  'RECHARGE_MONEY_ERROR': 4302,
  'RECHARGE_REQUEST_ERROR': 4303,
  'TRANSACTION_ERROR': 4304,
  'GET_UAP_ERROR': 4305,
  'REFOUND_ERROR': 4306,
  'MONEY_CHECK_ERROR': 4307,
  'USAGEPACKAGE_ERROR': 4308,
  'GET_PRICING_ERROR': 4309,
  'FAILED_UPDATE_TRANSACTION': 4310,
  'GET_FINANCE_SETTING_ERROR': 4311,
  'CREATE_BILL_FAIL': 4312,

  // AA errors codes
  'PARAMS_MISSING': 4401,

  // usage error
  'FAILED_GET_USAGE': 4501,
  'FAILED_SET_USAGE_SETTING': 4502,

  'FAILED_SEND_EMAIL': 5002,

  'FAILED_GET_APP_LIMIT': 6001,
  'MORE_PARAMETER_ERROR': 6002,
  'EXPIRED_ERROR': 6003,
  'PROJECT_ID_ERROR': 6004,
  'SIGN_MISMATCH': 6005,
  'FAILED_GET_PROJECTS': 6106,
  'FAILED_GET_PROJECT': 6107,
  'FAILED_CREATE_PROJECT': 6108,
  'ONBOARDING_PROJECT_CREATED': 6109,
  'FAILED_UPDATE_PROJECT': 6009,
  'FAILED_ENABLE_CERTIFICATE': 6010,
  'PROJECT_NAME_EXIST': 6011,
  'FAILED_GET_VENDORGROUP': 6012,
  'FAILED_GET_TOKEN': 6013,
  'NO_CHANNEL_NAME': 6014,
  'INVALID_CHANNEL_NAME': 6015,
  'FAILED_GET_VENDORGROUPS': 6016,
  'FAILED_GET_VENDORINFO': 6017,
  'FAILED_GET_VENDORLISTS': 6018,
  'FAILED_GET_SLA_SETTING': 6019,
  'FAILED_SET_SLA_SETTING': 6020,
  'FAILED_GET_WHITEBOARD_TOKEN': 6021,
  'FAILED_UPDATE_WHITEBOARD_TOKEN': 6022,
  'FAILED_ENABLE_PRIMARY_CERT': 6023,
  'FAILED_ENABLE_SECONDARY_CERT': 6024,
  'FAILED_REMOVE_SECONDARY_CERT': 6025,
  'FAILED_SWITCH_PRIMARY_CERT': 6026,
  'FAILED_DELETE_SECONDARY_CERT': 6027,
  'FAILED_DELETE_NO_CERT': 6028,
  'FAILED_GET_APAAS_CONFIG': 6029,
  'FAILED_GET_SECONDARY_CERT': 6030,
  'FAILED_UPDATE_SECONDARY_CERT': 6031,

  'FAILED_CREATE_MEMBER': 7000,
  'FAILED_UPDATE_MEMBER': 7001,
  'FAILED_DELETE_MEMBER': 7002,
  'EMAIL_EXIST': 7003,
  'NOT_REGISTERED': 7004,
  'NO_EMAIL': 7005,
  'NO_TOKEN': 7006,
  'INVALID_TOKEN': 7007,
  'MEMBER_LIMIT_REACHED': 7008,
  'FAILED_GET_MEMBERS': 7009,
  'FAILED_GET_MEMBER': 7010,
  'FAILED_GET_ROLES': 7011,
  'FAILED_GET_PRIVILEGES': 7012,
  'FAILED_GET_ROLEPRIVILEGES': 7013,
  'FAILED_CREATE_ROLE': 7014,
  'FAILED_RESET_PASSWORD': 7015,
  'MEMBER_LINKED_ROLE': 7016,
  'ACCOUNT_EMAIL_EXIST': 7017,
  'MEMBER_EMAIL_EXIST': 7018,
  'MEMBER_NOT_EXIST': 7019,
  'FAILED_GET_MEMBER_ROLE': 7020,

  'ACCOUNT_NOT_EXIST': 8001,
  'NO_LASTNAME': 8002,
  'INVALID_COMPANYNAME': 8003,
  'FAILED_UPDATE_USER_INFO': 8004,
  'FAILED_UPDATE_PREFERENCE_INFO': 8005,
  'WRONG_PASSWORD': 8006,
  'FAILED_UPDATE_JIRA_LANG': 8007,
  'FAILED_GET_ACCOUNT_BLOCK_RULE': 8008,
  'GET_MESSAGE_ERROR': 8009,
  'READ_MESSAGE_ERROR': 8010,
  'FAILED_EMAIL': 8011,
  'EXIST_EMAIL': 8012,
  'PASSWORD_LENGTH_MISMATCH': 8013,
  'PASSWORD_NEED_UPPERCASE': 8014,
  'PASSWORD_NEED_LOWERCASE': 8015,
  'PASSWORD_NEED_NUMBER': 8016,
  'PASSWORD_NEED_SPECIAL_CHAR': 8017,
  'PASSWORD_AVOID_USERNAME': 8018,

  'ROLE_NAME_EXIST': 9001,
  'ROLE_NOT_EXIST': 9002,
  'ROLE_NAME_EMPTY': 9003,

  'FAILED_GET_IDENTITY': 9004,
  'IDNUMBER_EXIST': 9007,
  'COMPANY_NUMBER_EXIST': 9008,
  'FAILED_UPDATE_IDENTITY': 9009,
  'FAILED_GET_ATTACHMENT': 9010,

  'FAILED_GET_RECEIPT_SETTING': 9011,
  'FAILED_SET_RECEIPT_SETTING': 9012,
  'FAILED_GET_RECEIPT_INFO': 9013,
  'FAILED_SET_RECEIPT_INFO': 9014,
  'RECEIPT_SETTING_NOT_MATCH': 9015,
  'RECEIPT_ALLREADY_EXIST': 9016,
  'BANK_ACCOUNT_EXIST': 9017,
  'ENTERPRISE_NAME_EXIST': 9018,

  'GET_ISSUE_ERROR': 10000,
  'GET_ISSUES_ERROR': 10001,
  'GET_TYPE_ERROR': 10002,
  'GET_ISSUE_COUNT_ERROR': 10003,
  'GET_METADATA_ERROR': 10004,
  'PREPARE_ISSUE_ERROR': 10005,
  'PREPARE_ATTACHMENT_ERROR': 10006,
  'PUBLISH_ATTACHMENT_ERROR': 10007,
  'GET_COMMENT_ERROR': 10008,
  'POST_COMMENT_ERROR': 10009,
  'RESOLVE_ISSUE_ERROR': 100010,
  'CANCEL_ISSUE_ERROR': 100011,
  'GET_ATTACHMENT_ERROR': 100012,
  'DELETE_ATTACHMENT_ERROR': 100013,
  'SUPPORT_RATE_ERROR': 100014,

  'SEND_EMAIL_ERROR': 110000,
  'CHECK_EMAIL_TOKEN_ERROR': 110001,
  'PHONE_EXIST': 110002,
  'PHONE_MSG_TIME_LIMIT': 110003,
  'PHONE_UPDATE_ERROR': 110004,
  'PHONE_MSG_EXPIRED': 110005,
  'PHONE_VERIFY_FAILED': 110006,

  // XLA error codes
  'XLA_GET_PRODUCT_TYPE_ERROR': 12200,
  'XLA_GET_CONTRACT_LIST_ERROR': 12200,

    // Verification error codes
  'VERIFICATION_TIME_LIMIT': 13003,
  'VERIFICATION_FAILED_SEND': 13004,
  'VERIFICATION_NOT_VERIFIED': 13005,
  'VERIFICATION_WRONG_CODE': 13006,
  'VERIFICATION_CODE_EXPIRED': 13007,
  'VERIFICATION_ATTEMPT_LIMIT': 13008,

  // restful api keys error codes
  'FAILED_GET_RESTFUL_KEYS': 15000,
  'RESTFUL_KEYS_EXIST': 15001,
  'RESTFUL_KEYS_NOT_EXIST': 15002,
  'FAILED_CREATE_RESTFUL_KEY': 15003,
  'FAILED_DELETE_RESTFUL_KEY': 15004,
  'KEY_OUT_OF_LIMIT': 15005,
  'FAILED_GET_RESTFUL_KEY_LIMIT': 15006,
  'ALREADY_DOWNLOADED': 15007,
  'ONLY_ONE_KEY': 15008,

  // Package error codes
  'VOUCHER_INVALID_ERROR': 15000,
  'VOUCHER_PERIOD_ERROR': 15001,
  'VOUCHER_AREA_ERROR': 15002,
  'VOUCHER_CURRENCY_ERROR': 15003,
  'VOUCHER_PACKAGE_ERROR': 15004,
  'VOUCHER_AUTHENTICATION_ERROR': 15005,
  'VOUCHER_USAGE_ERROR': 15006,
  'VOUCHER_REQUEST_ERROR': 15007,
  'FAILED_GET_MARKETPLACE_PACKAGE': 15008,
  'PACKAGE_EXCEED_MAX_QUANTITY': 15009,

  'FAILED_GET_OPERATION_ALLOWANCE_OPERATION': 16001,
  'FAILED_UPDATE_OPERATION_ALLOWANCE_OPERATION': 16002,
  'FAILED_GET_LAYOUT_SETTING': 16003,
  'FAILED_UPDATE_LAYOUT_SETTING': 16004,

  'DELETE_ACCOUNT_SUBMIT_NOT_ALLOWED': 17001,
  'FAILED_DELETE_ACCOUNT_SUBMIT': 17002,
  'FAILED_SUBMIT_DELETE_IS_MEMBER': 17003,
  'FAILED_SUBMIT_DELETE_IS_COCOS': 17004,
  'FAILED_SUBMIT_DELETE_ACTIVE_PROJECTS': 17005,
  'FAILED_SUBMIT_DELETE_BALANCE': 17006,
  'FAILED_SUBMIT_DELETE_PACKAGES': 17007,
  'FAILED_SUBMIT_DELETE_BILLS': 17008,
  'FAILED_SUBMIT_DELETE_MEMBERS': 17009,
  'FAILED_SUBMIT_DELETE_USAGE': 17010,

  // Marketplace error codes
  'VENDOR_NOT_FOUND': 19001,

  // Netless error codes
  'FAILED_GET_PROJECT_NETLESS': 20000,
  'FAILED_ENABLE_PROJECT_NETLESS': 20001,
  'FAILED_UPDATE_PROJECT_NETLESS': 20002,
  'FAILED_GENERATE_NETLESS_TOKEN': 20003,
  'FAILED_MIGRATE_NETLESS_PROJECTS': 20004,
  'WHITEBOARD_STORAGE_EXIST': 20005,

  // AA Package
  'GET_GOODS_ERROR': 21000,
  'GET_GOODS_PARAMS_ERROR': 21001,
  'INVALID_GOODS_ID': 21002,
  'FAILED_GET_GOODS_INFO': 21003,
  'FAILED_TO_POST_ORDER': 21004,
  'FAILED_CANCEL_SUBSCRIPTION': 21005,
  'INVALID_FREE_GOODS_ID': 21006,

  // Agora Chat
  'NO_SUBSCRIPTION': 22000,
  'NO_Permission': 22001,
  'FAILED_USER_ID': 22003,

  // FPA
  'FAILED_CREATE_SERVICE': 22001,
  'INVALID_PARAMS': 22002,

  // License
  'FAILED_GET_LICENSE_USAGE': 23000,
  'FAILED_GET_LICENSE_ORDER': 23001
};
