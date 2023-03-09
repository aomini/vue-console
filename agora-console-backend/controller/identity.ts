import * as Koa from 'koa';
import { getConnection } from 'typeorm';
import { ErrCode } from './apiCodes';
import * as IdentityService from '../services/identity';
import * as AccountService from '../services/account';
import { generateOSSKey } from '../utils/deprecatedEncry';
import * as MyOSSHelper from '../externalService/myOSSHelper';
import { generateUUID } from '../utils/encryptTool';
import { getRoleByUser } from '../services/permission';
import { ENTITYMEMBER } from '../models/permission';
import * as ReceiptService from '../services/receipt';

import * as MarketingService from '../externalService/marketing';
import * as FinanceService from '../externalService/finance';
import * as moment from 'moment';

import { processError } from '../utils/error';
import AlipaySdk from 'alipay-sdk';
import AlipayFormData from 'alipay-sdk/lib/form';
import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid/v4';
import { User } from '../models/user';
import { IdentityStatus } from '../models/aliIdentity';
// tslint:disable-next-line:no-duplicate-imports
import { UserProfile } from '../models/user';

import * as NotificationHelper from '../apiController/notification';
import { config } from '../config';
import { SiteMailParamsBase, doveProxyForSession } from '../externalService/DoveProxy';

export const getVisitUrl = async (ossKey: string) => {
  return MyOSSHelper.signatureURL(ossKey);
};

export const getUserIdentity = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  try {
    const identity = await IdentityService.getCompanyAuthentication(companyId);
    if (identity && identity.identity['licensePhotoKey']) {
      identity.identity['licensePhotoUrl'] = await getVisitUrl(identity.identity['licensePhotoKey']);
    }
    ctx.status = 200;
    ctx.body = identity;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e.message);
    ctx.body = { code: ErrCode.FAILED_GET_IDENTITY };
  }
};

export const getCompanyFullIdentityInfo = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  try {
    const identity = await IdentityService.getCompanyFullIdentityInfo(companyId);
    console.log(identity);
    if (identity && identity.companyInfo && identity.companyInfo['licensePhotoKey']) {
      identity.companyInfo['licensePhotoUrl'] = await getVisitUrl(identity.companyInfo['licensePhotoKey']);
    }
    if (identity && identity.personalInfo && identity.personalInfo['licensePhotoKey']) {
      identity.personalInfo['licensePhotoUrl'] = await getVisitUrl(identity.personalInfo['licensePhotoKey']);
    }
    ctx.status = 200;
    ctx.body = identity;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e.message);
    ctx.body = { code: ErrCode.FAILED_GET_IDENTITY };
  }
};

/**
 * 接入链接：https://opensupport.alipay.com/support/helpcenter/170/201602482986
 * @param ctx 上下文
 */
export const postPersonIdentity = async (ctx: Koa.Context) => {
  const { name, IdNumber, certType } = ctx.request.body;
  const user: User = ctx.state.user;
  const companyId = user.companyId;

  let certifyId = '';
  const alipaySdk = new AlipaySdk({
    appId: '2021001169690068',
    privateKey: fs.readFileSync(path.resolve(__dirname, '../../private-key.pem'), 'ascii')
  });

  // 调用身份认证初始化服务，传入需要认证的用户信息参数，拿到certifyId
  const initializeRes: any = await alipaySdk.exec('alipay.user.certify.open.initialize', {
    bizContent: {
      outer_order_no: `AGORA${moment().format('YYYYMMDDHHmmss')}${uuid().replace('-', '').slice(0, 6)}`,
      biz_code: 'FACE',
      identity_param: { 'identity_type': 'CERT_INFO', 'cert_type': certType, 'cert_name': name, 'cert_no': IdNumber },
      merchant_config: { 'return_url': 'https://www.agora.io' }
    }
  });

  if (initializeRes.code === '10000') {
    certifyId = initializeRes.certifyId;

    const identity = await IdentityService.getIdentityByCompanyId(companyId);
    if (!identity) {
      await IdentityService.createIdentity(companyId, certifyId);
    } else {
      await IdentityService.setIdentityCertifyIdByCompanyId(companyId, certifyId);
    }

    const formData = new AlipayFormData();
    // 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url
    formData.setMethod('get');
    formData.addField('bizContent', { certify_id: certifyId });

    // 调用身份认证开始认证，拿到认证URL，再将认证的url生成二维码在pc端页面展示，用户支付宝App扫码
    const certifyRes: any = await alipaySdk.exec('alipay.user.certify.open.certify',
      {},
      {
        formData: formData
      }
    );

    ctx.body = certifyRes;
    return;
  }
};

export const postPersonIdentityResult = async(ctx) => {
  const { name } = ctx.request.body;
  const user: User = ctx.state.user;
  const companyId = user.companyId;
  const identity = await IdentityService.getIdentityByCompanyId(companyId);

  if (identity.certifyId) {
    const alipaySdk = new AlipaySdk({
      appId: '2021001169690068',
      privateKey: fs.readFileSync(path.resolve(__dirname, '../../private-key.pem'), 'ascii')
    });
    const queryRes: any = await alipaySdk.exec('alipay.user.certify.open.query',
      {
        bizContent: {
          certify_id: identity.certifyId
        }
      }
    );
    if (queryRes.code === '10000') {
      if (queryRes.passed === 'T') {
        await IdentityService.setIdentityStatusByCompanyId(companyId, IdentityStatus.Pass);
        await getConnection()
        .createQueryBuilder()
        .update(UserProfile)
        .set({ lastName: name })
        .where('companyId = :companyId', { companyId: companyId })
        .execute();

        ctx.body = {
          code: 0
        };
      } else {
        await IdentityService.setIdentityStatusByCompanyId(companyId, IdentityStatus.Reject);
        ctx.body = {
          code: 1000
        };
      }
      return;
    }
  }
  ctx.body = {
    code: 1000
  };
};

export const postEnterpriseIdentity = async (ctx: Koa.Context) => {
  const { name, creditCode, licensePhoto, licensePhotoKey, bankName, bankBranch, bankAccount } = ctx.request.body;
  const companyId = ctx.session.companyId;
  try {
    const checkIdNumber = await IdentityService.checkCompanyCreditCode(creditCode, companyId);
    if (checkIdNumber) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.COMPANY_NUMBER_EXIST };
      return;
    }
    const checkBankAccount = await IdentityService.checkBankAccount(bankAccount);
    await FinanceService.precheckBankAccount(ctx.logger, bankAccount);
    if (checkBankAccount) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.BANK_ACCOUNT_EXIST };
      return;
    }
    const checkCompanyName = await IdentityService.checkCompanyName(name);
    if (checkCompanyName) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.ENTERPRISE_NAME_EXIST };
      return;
    }
    const identity = await IdentityService.createOrUpdateEnterpriseIdentity(companyId, name, creditCode, licensePhoto, licensePhotoKey, bankName, bankBranch, bankAccount);
    await AccountService.updateCompanyName(companyId, name);
    const setting = await ReceiptService.getReceiptSetting(companyId);
    if (setting && setting.receiptType === 0) {
      await ReceiptService.deleteSetting(companyId);
    }

    MarketingService.updateAttr(companyId, { Company: name, Authentication_Status__c: 'submitted', Authentication_status_last_updated_time__c: moment().format('YYYY-MM-DD HH:mm:ss') }).catch(err => console.error(err));

    ctx.status = 200;
    ctx.body = identity;

    const notificationSetting = await NotificationHelper.getCompanySettingsByType(companyId, 'finance');
    const emailList = [];
    notificationSetting.email.forEach(item => {
      if (item.email) {
        emailList.push(item.email);
      }
    });
    const tplId = config.dove.getEnterpriseAuthCompleteTplId();
    if (emailList && emailList.length > 0) {
      const params = {
        receiverList: emailList,
        templateId: tplId,
        templateParams: {
          enterprise_name: name
        }
      };
      await doveProxyForSession(ctx.logger).sendEmail(params);
    }
    // 站内信
    const siteMailParams: SiteMailParamsBase = {
      customUid: generateUUID(),
      category: 'account',
      templateId: Number(tplId),
      templateParams: {
        enterprise_name: name
      },
      companyIdList: [companyId]
    };

    await doveProxyForSession(ctx.logger).sendSiteMail(siteMailParams);
  } catch (e) {
    if (e.response && e.response.data && e.response.data.errorCode === '2050001') {
      ctx.status = 400;
      ctx.body = { code: ErrCode.BANK_ACCOUNT_EXIST };
      return;
    }
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_UPDATE_IDENTITY };
    ctx.logger.error(e);
  }
};

export const prepareAttachment = async (ctx: Koa.Context) => {
  try {
    const companyId = ctx.state.user.companyId;
    const { file_hash, mime_type, file_ext, file_size } = ctx.request.body.fileObject;
    const basename = file_hash.substr(0, 8);
    const filename = file_ext ? `${basename}.${file_ext}` : basename;
    const remotePath = generateOSSKey(companyId, filename);
    const metadata = await MyOSSHelper.generateUploadMetadata(remotePath, file_size);
    const attachmentId = generateUUID();
    const ossKey = metadata.params.key;

    await IdentityService.createOssResource(attachmentId, mime_type, file_size, ossKey);
    ctx.status = 200;
    ctx.body = {
      oss_metadata: metadata,
      attachment_id: attachmentId
    };
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_GET_ATTACHMENT };
  }
};

export const publishAttachment = async (ctx: Koa.Context) => {
  try {
    const { attachmentId } = ctx.request.body;
    const OssResource = await IdentityService.getOssById(attachmentId);
    const url = await getVisitUrl(OssResource.ossKey);
    const ret = await IdentityService.publishAttachment(attachmentId);
    ctx.status = 200;
    ctx.body = {
      url: url,
      data: ret
    };
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { code: ErrCode.PUBLISH_ATTACHMENT_ERROR };
  }
};

export const deleteAttachment = async (ctx: Koa.Context) => {
  try {
    const { attachmentId } = ctx.request.query;
    const ret = await IdentityService.deleteAttachment(attachmentId);
    ctx.status = 200;
    ctx.body = ret;
  } catch (e) {
    ctx.logger.error(processError(e));
    ctx.status = 500;
    ctx.body = { code: ErrCode.DELETE_ATTACHMENT_ERROR };
  }
};

export const getMemberRole = async (ctx: Koa.Context) => {
  const user = ctx.state.user;
  try {
    const getRole = await getRoleByUser(user.id, ENTITYMEMBER);
    ctx.status = 200;
    ctx.body = getRole;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_GET_MEMBER_ROLE };
  }
};
