const OSSHelper = require('@fangcha/ali-oss').OSSHelper
const config = require('../config')

const remoteRootDir = 'uploads'
const downloadRootDir = `${__dirname}/../run.local/downloads`

OSSHelper.initUploader(config.config.aliyunUploader, remoteRootDir)
OSSHelper.initSignatureOptions(config.config.signature)
OSSHelper.initDownloader(config.config.visitor, downloadRootDir)

module.exports = OSSHelper
