import * as Koa from 'koa';
import { ListParams } from '../models/listReply';
import { ErrCode } from './apiCodes';
import * as CompanyService from '../services/company';
import * as ProjectService from '../services/project';
import * as CocosService from '../services/cocos';
import * as MarketingService from '../externalService/marketing';
import * as NCSService from '../services/NCSService';
import { config } from '../config';
import { createProjectSignkeyMD5, generateUUID } from '../utils/encryptTool';
import { updateAttr } from '../externalService/eloquaService';
import * as whiteBoardTokenService from '../externalService/whiteBoardToken';
import { Logger } from 'log4js';
import { createrRes, getPermissionByRole, getResPermission, getRoleByUser } from '../services/permission';
import { ENTITYMEMBER, RESPROJECT } from '../models/permission';
import { doveProxyForSession } from '../externalService/DoveProxy';
import { FPAService } from '../externalService/fpaService';
import { KTVService } from '../externalService/KTVService';
import { VENDORSTOP, VENDORVALID } from '../models/vendorInfo';
import * as UsageService from '../services/usage';
import { CloudTypeMap } from '../dataModel/uapModel';
import { AbleService } from '../externalService/AbleService';
import { archerProxyForSession } from '../externalService/archerService';
import { cloudProxyForSession } from '../externalService/CloudProxy';
import { ncsProxyForSession } from '../externalService/NCSProxy';
import { donsoleProxyForSession } from '../externalService/DonsoleProxy';
import { moderationProxyForSession } from '../externalService/ModerationProxy';
import { iotProxyForSession } from '../externalService/IotProxy';
import { ExtensionEvents, generateExtensionLog, ProductLogEnum } from '../services/extensionLog';
import { ProjectCreatorStatus } from '../dataModel/projectModel';
import { CompanyField } from '../models/company';

const enum APaasState {
  ENABLED = 1,
  DISALBELD = 0
}

enum CertificateBackupStatus {
  ENABLED = 1,
  DISABLED = 2
}

export const getVendorGroupByCompanyId = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  try {
    const reply = await ProjectService.getVendorGroupByCompanyId(companyId);
    ctx.status = 200;
    ctx.body = reply;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_GET_VENDORGROUP };
  }
};

export const getProjectsByCompany = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  const { limit, page, key, sortProp, sortOrder, fetchAll, admin, status, stage, marketplaceStatus, serviceName } = ctx.request.query;
  const user = ctx.state.user;
  const userId = ctx.state.user.id;
  let filter = false;
  let roleId;
  if (user.isMember) {
    const permissions = await getResPermission(ENTITYMEMBER, user.id, RESPROJECT);
    const getRole = await getRoleByUser(user.id, ENTITYMEMBER);
    const projectList = permissions.project ? permissions.project.map(permission => permission.resId) : [];
    filter = ctx.state.user.isMember && !projectList.includes('0');
    roleId = getRole.roleId;
  }

  const listParams = new ListParams(limit, page, { companyId, key, sortProp, sortOrder, fetchAll, filter, roleId, admin, status, stage, marketplaceStatus, serviceName, userId });
  try {
    let reply;
    if (ctx.session.thirdParty && ctx.session.thirdParty.isCocos) {
      const corporationId = ctx.session.thirdParty.corporation_id;
      const uid = ctx.session.thirdParty.uid;
      const cocosListParams = new ListParams(limit, page, { companyId, corporationId, uid, key, sortProp, sortOrder, fetchAll, filter, roleId, admin, status, stage });
      reply = await CocosService.getProjectsByCompany(cocosListParams);
    } else {
      reply = await ProjectService.getProjectsByCompany(listParams);
    }
    const projectCount = await ProjectService.getProjectCount(companyId);
    reply.projectCount = projectCount;
    // 获取项目创建者
    const companyField = await CompanyField.findOne({ companyId: companyId });
    if (companyField && companyField.showVendorCreator && reply.items.length > 0) {
      const vendorIds = reply.items.map(item => item.id);
      const projectRelationList = await ProjectService.getProjectRelationList(vendorIds);
      reply.items.forEach(item => {
        const projectRelation = projectRelationList.find(project => project.vendorId === item.id);
        if (projectRelation && projectRelation.creator) {
          item.creator = projectRelation.creator === ProjectCreatorStatus.MainAccount ? ProjectCreatorStatus.MainAccount : projectRelation.email ? projectRelation.email : ProjectCreatorStatus.AccountDeleted;
        } else {
          item.creator = ProjectCreatorStatus.NoRecord;
        }
      });
    }
    ctx.body = reply;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e.message);
    ctx.body = { code: ErrCode.FAILED_GET_PROJECTS };
  }
};

export const getProjectDetail = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.session.companyId;
  try {
    const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
    if (!projectInfo) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
      return;
    }
    const projectUsage = await ProjectService.getProjectUsage(projectInfo.id);
    const usage7d = projectUsage && projectUsage.usage7d ? projectUsage.usage7d : 0;
    const relation = await donsoleProxyForSession(ctx.logger).getProjectRelation(projectInfo.id);
    ctx.status = 200;
    ctx.body = {
      ...projectInfo,
      usage7d: usage7d,
      productTypeId: relation?.productTypeId,
      platformId: relation?.platformId
    };
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e.message);
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
  }
};

export const getProjectExtensionSetting = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.session.companyId;
  try {
    const project = await ProjectService.getVendorInfo(projectId, companyId);
    if (!project) {
      ctx.status = 404;
      return;
    }
    const settings = await UsageService.getUapAllSettings(project.id, companyId);
    const result = {};
    for (const cloudTypeMapKey in CloudTypeMap) {
      const isValueProperty = parseInt(cloudTypeMapKey, 10) >= 0;
      if (!isValueProperty) {
        result[cloudTypeMapKey] = false;
      }
    }
    settings.forEach(setting => {
      result[CloudTypeMap[setting.typeId]] = !!setting.status;
    });
    ctx.status = 200;
    ctx.body = result;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e.message);
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
  }
};

export const getProjectsWithUsage = async (ctx: Koa.Context) => {
  const user = ctx.state.user;
  const companyId = user.companyId;
  try {
    const { limit = 5 } = ctx.request.query;
    let roleId;
    let filter = false;
    if (user.isMember) {
      const permissions = await getResPermission(ENTITYMEMBER, user.id, RESPROJECT);
      const getRole = await getRoleByUser(user.id, ENTITYMEMBER);
      const projectList = permissions.project ? permissions.project.map(permission => permission.resId) : [];
      filter = !projectList.includes('0');
      roleId = getRole.roleId;
    }
    const reply = await ProjectService.getProjectsWithUsage(companyId, roleId, filter, limit);
    ctx.status = 200;
    ctx.body = reply;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e.message);
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
  }
};

export const checkAppLimit = async (ctx: Koa.Context) => {
  const appLimit = ctx.state.user.company.appLimit;
  const companyId = ctx.session.companyId;
  try {
    const checkLimit = await ProjectService.checkAppLimit(companyId, appLimit);
    ctx.status = 200;
    ctx.body = checkLimit;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e.message);
    ctx.body = { code: ErrCode.FAILED_GET_APP_LIMIT };
  }
};

export const checkProjectPermission = async (ctx: Koa.Context, next: () => Promise<any>) => {
  const projectId = ctx.params.projectId;
  const thirdParty = ctx.session.thirdParty;
  const companyId = ctx.session.companyId;
  const project = await ProjectService.getVendorInfo(projectId, companyId, thirdParty);
  if (!project) {
    ctx.status = 404;
    return;
  }
  await next();
};

export const checkIfAllProjectsPermission = async (ctx: Koa.Context) => {
  const user = ctx.state.user;
  try {
    if (user.isMember) {
      const permissions = await getResPermission(ENTITYMEMBER, user.id, RESPROJECT);
      const projectList = permissions.project ? permissions.project.map(permission => permission.resId) : [];
      ctx.body = { 'permission': projectList.includes('0') };
    } else {
      ctx.body = { 'permission': true };
    }
    ctx.status = 200;
  } catch (e) {
    ctx.body = { 'permission': false };
    ctx.logger.error(e.message);
    ctx.status = 500;
  }
};

const updateProjectHasCreatedToEloqua = async (log: Logger, companyId: number, projectAmount: number) => {
  try {
    // const count = await ProjectService.getProjectCount(companyId);
    const ret = await updateAttr(log, companyId, { CN_Has_created_project__c: true, Project_amount__c: projectAmount });
    console.log(ret.data);
  } catch (e) {
    log.error(e);
  }
};

export const createNewProject = async (ctx: Koa.Context) => {
  const { projectName, enableCertificate, useCaseId } = ctx.request.body;
  const companyId = ctx.session.companyId;
  const user = ctx.state.user;
  const appLimit = user.company.appLimit;
  // const thirdParty = ctx.session.thirdParty;
  try {
    const checkLimit = await ProjectService.checkAppLimit(companyId, appLimit);
    if (!checkLimit) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.FAILED_CREATE_PROJECT };
      return;
    }

    const checkProjectName = await ProjectService.checkProjectName(companyId, projectName, '');
    if (checkProjectName) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.PROJECT_NAME_EXIST };
      return;
    }

    const companyStatus = await CompanyService.getCompanyById(companyId);
    if (companyStatus.status === 2 || companyStatus.status === 3 || companyStatus.status === 4) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.ACCOUNT_BLOCKED };
      return;
    }
    const project = await ProjectService.createNewProject(projectName, companyId, true, useCaseId);
    if (enableCertificate) {
      await ProjectService.enableCertificate(project.projectId);
    }
    if (user.isMember) {
      const getRole = await getRoleByUser(user.id, ENTITYMEMBER);
      const roleId = getRole.roleId;
      const res = await getPermissionByRole(roleId, companyId);
      if (res && res.project && (res.project.length > 1 || (res.project.length === 1 && res.project[0].resId !== '0'))) {
        const projects = [];
        projects.push({ resId: project.projectId });
        await createrRes([], projects, roleId);
      }
    }
    // 同步创建cocos的游戏项目
    // if (thirdParty && thirdParty.isCocos) {
    //   const createStatus = await CocosService.createRemoteCocosProject(projectName, thirdParty.corporation_id, thirdParty.uid, companyId, project);
    //   if (!createStatus) {
    //     ctx.status = 400;
    //     ctx.body = { code: ErrCode.FAILED_CREATE_PROJECT };
    //     return;
    //   }
    // }
    ctx.status = 200;
    ctx.body = project;
    const projectAmount = await ProjectService.getProjectCount(companyId);
    updateProjectHasCreatedToEloqua(ctx.logger, companyId, projectAmount).catch((e) => console.log(e));
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e.message);
    ctx.body = { code: ErrCode.FAILED_CREATE_PROJECT };
  }
};

export const createOnboardingProject = async(ctx: Koa.Context) => {
  const projectName = ctx.request.body.projectName;
  const useCaseId = ctx.request.body.useCaseId;
  const { internalIndustryMetadataNameEn, useCaseNameEn, internalIndustry, productTypeNameEn } = ctx.request.body;
  const companyId = ctx.state.user.companyId;
  const area = ctx.state.user.company.area;
  const projectAmount = await ProjectService.getProjectCount(companyId);
  if (projectAmount > 0) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.ONBOARDING_PROJECT_CREATED };
    return;
  }
  try {
    await ProjectService.createNewSecureProject('onboarding', config.assetCompanyID);
  } catch (e) {
    ctx.logger.error('Failed to create onboarding project', e);
  }
  try {
    const project = await ProjectService.createOnboardingProject(projectName, useCaseId, internalIndustry, companyId);
    ctx.body = project;
    ctx.status = 200;
    const projectAmount = 1;
    updateProjectHasCreatedToEloqua(ctx.logger, companyId, projectAmount).catch((e) => console.log(e));
    MarketingService.updateAttr(companyId, {
      First_project_use_case__c: area === 'CN' ? productTypeNameEn : useCaseNameEn,
      Internal_industry__c: internalIndustryMetadataNameEn
    }).catch(err => console.error(err));
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_CREATE_PROJECT };
  }
};

export const updateProject = async (ctx: Koa.Context) => {
  const { name, tokenSwitch, projectStage, useCaseId } = ctx.request.body;
  const projectId = ctx.params.projectId;
  const companyId = ctx.session.companyId;
  try {
    const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
    if (!projectInfo) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
      return;
    }
    const checkProjectName = await ProjectService.checkProjectName(companyId, name, projectId);
    if (checkProjectName) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.PROJECT_NAME_EXIST };
      return;
    }
    const companyStatus = await CompanyService.getCompanyById(companyId);
    if (companyStatus.status === 2 || companyStatus.status === 3 || companyStatus.status === 4) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.ACCOUNT_BLOCKED };
      return;
    }
    const project = await ProjectService.updateProject(projectId, name, projectStage, tokenSwitch, useCaseId);
    ctx.status = 200;
    ctx.body = project;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_UPDATE_PROJECT };
  }
};

export const updateProjectName = async (ctx: Koa.Context) => {
  const { name } = ctx.request.body;
  const projectId = ctx.params.projectId;
  const companyId = ctx.session.companyId;
  try {
    const checkProjectName = await ProjectService.checkProjectName(companyId, name, projectId);
    if (checkProjectName) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.PROJECT_NAME_EXIST };
      return;
    }

    const companyStatus = await CompanyService.getCompanyById(companyId);
    if (companyStatus.status === 2 || companyStatus.status === 3 || companyStatus.status === 4) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.ACCOUNT_BLOCKED };
      return;
    }
    const project = await ProjectService.updateProject(projectId, name);
    ctx.status = 200;
    ctx.body = project;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_UPDATE_PROJECT };
  }
};

export const updateProjectStatus = async (ctx: Koa.Context) => {
  const { projectStatus } = ctx.request.body;
  const projectId = ctx.params.projectId;
  const companyId = ctx.session.companyId;
  const thirdParty = ctx.session.thirdParty;
  try {
    const companyStatus = await CompanyService.getCompanyById(companyId);
    if (companyStatus.status === 2 || companyStatus.status === 3 || companyStatus.status === 4) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.ACCOUNT_BLOCKED };
      return;
    }
    // 同步cocos项目状态信息
    if (thirdParty && thirdParty.isCocos) {
      const updateStatus = await CocosService.updateRemoteCocosProject(thirdParty.uid, projectId, projectStatus);
      if (!updateStatus) {
        ctx.status = 400;
        ctx.body = { code: ErrCode.FAILED_CREATE_PROJECT };
        return;
      }
    } else {
      const isVerified = ctx.session.verified;
      if (!isVerified) {
        ctx.status = 403;
        return;
      }
      ctx.session.verified = false;
    }
    await archerProxyForSession(ctx.logger).updateVendorStatus(companyId, projectId, projectStatus ? VENDORVALID : VENDORSTOP);
    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_UPDATE_PROJECT };
  }
};

export const enableCertificate = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const { requestSign, expiredTs, companyId } = ctx.request.body;

  if (!requestSign || !expiredTs) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.MORE_PARAMETER_ERROR };
    return;
  }
  if (Date.now() >= expiredTs) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.EXPIRED_ERROR };
    return;
  }

  if (!projectId) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.PROJECT_ID_ERROR };
    return;
  }

  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }

  const sign = createProjectSignkeyMD5(companyId, projectId, true, expiredTs);
  if (sign !== requestSign) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.SIGN_MISMATCH };
    return;
  }

  try {
    const reply = await ProjectService.enableCertificate(projectId);
    ctx.status = 200;
    ctx.body = reply;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_ENABLE_CERTIFICATE };
  }
};

export const sendCertificateEmail = async (ctx: Koa.Context) => {
  const { projectId } = ctx.request.body;
  const { email, language, companyId } = ctx.state.user;
  const lang = language === 'chinese' ? 'cn' : 'en';
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }

  const minutes = 30;
  const tplId = config.dove.getCertificateActiveTplId(lang);
  const expiredTs = Date.now() + minutes * 60 * 1000;
  const requestSign = createProjectSignkeyMD5(companyId, projectId, true, expiredTs);
  const params = {
    receiverList: [email],
    templateId: tplId,
    templateParams: {
      enableCertificateLink: `${ctx.request.host.indexOf('http') === -1 ? `http://${ctx.request.host}` : ctx.request.host}/enableAppCertificate?projectId=${projectId}&companyId=${companyId}&expirdTs=${expiredTs}&sign=${requestSign}&projectName=${projectInfo.name}`

    }
  };
  try {
    await doveProxyForSession(ctx.logger).sendEmail(params);
    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_SEND_EMAIL };
  }
};

export const enablePrimaryCert = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }

  try {
    await ProjectService.enablePrimaryCert(projectInfo.projectId, projectInfo.companyId);
    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_ENABLE_PRIMARY_CERT };
  }
};

export const enableBackupCert = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }

  try {
    await ProjectService.enableBackupCert(projectInfo.projectId, projectInfo.companyId);
    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_ENABLE_SECONDARY_CERT };
  }
};

export const switchToPrimaryCert = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }

  try {
    await ProjectService.switchToPrimaryCert(projectInfo.projectId, projectInfo.companyId);
    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_SWITCH_PRIMARY_CERT };
  }
};

export const getBackupCert = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }

  try {
    ctx.body = await ProjectService.getBackupCert(projectInfo.projectId, projectInfo.companyId);
    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_GET_SECONDARY_CERT };
  }
};

export const updateBackupCert = async (ctx: Koa.Context) => {
  const isVerified = ctx.session.verified;
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const { status } = ctx.request.body;
  if (status === CertificateBackupStatus.DISABLED && !isVerified) {
    ctx.status = 403;
    return;
  }
  ctx.session.verified = false;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }

  try {
    await ProjectService.updateBackupCert(projectInfo.projectId, projectInfo.companyId, status);
    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_DELETE_SECONDARY_CERT };
  }
};

export const deleteBackupCert = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }

  try {
    await ProjectService.deleteBackupCert(projectInfo.projectId, projectInfo.companyId);
    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_DELETE_SECONDARY_CERT };
  }
};

export const deleteNoCert = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }

  try {
    await ProjectService.deleteNoCert(projectInfo.projectId, projectInfo.companyId);
    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_DELETE_NO_CERT };
  }
};

export const getWhiteBoardToken = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }

  try {
    const whiteBoardToken = await whiteBoardTokenService.getWhiteBoardToken(ctx.logger, projectInfo.key);
    ctx.status = 200;
    ctx.body = whiteBoardToken.data.herewhiteToken || '';
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_GET_WHITEBOARD_TOKEN };
  }
};

export const updateWhiteBoardToken = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const token = ctx.request.body.token;
  const name = ctx.state.user.company.name;
  const apiInfo = await CompanyService.getCompanyRestfulKeys(companyId);
  if (!apiInfo || apiInfo.length === 0) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_RESTFUL_KEYS };
    return;
  }
  const { key, secret } = apiInfo[0];
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }

  try {
    const updateToken = await whiteBoardTokenService.updateWhiteBoardToken(ctx.logger, projectInfo.key, token, key, secret, name);
    ctx.status = 200;
    ctx.body = updateToken;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_UPDATE_WHITEBOARD_TOKEN };
  }
};

export const getApaasConfig = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }
  try {
    const apaasConfig = await whiteBoardTokenService.getApaasConfig(ctx.logger, projectInfo.key);
    ctx.status = 200;
    ctx.body = apaasConfig.data || {};
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_GET_WHITEBOARD_TOKEN };
  }
};

export const updateApaasConfig = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const name = ctx.state.user.company.name;
  const { netlessJson, cloudRecordingJson, IMJson, fusionCDNJson } = ctx.request.body;
  const params = {};
  try {
    netlessJson && (params['netless'] = JSON.parse(netlessJson));
    cloudRecordingJson && (params['cloudRecording'] = JSON.parse(cloudRecordingJson));
    IMJson && (params['im'] = JSON.parse(IMJson));
    fusionCDNJson && (params['fusionCDN'] = JSON.parse(fusionCDNJson));
  } catch (e) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_UPDATE_WHITEBOARD_TOKEN };
    return;
  }
  const apiInfo = await CompanyService.getCompanyRestfulKeys(companyId);
  if (!apiInfo || apiInfo.length === 0) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_RESTFUL_KEYS };
    return;
  }
  const { key, secret } = apiInfo[0];
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }

  try {
    const updateToken = await whiteBoardTokenService.updateApaasConfig(ctx.logger, projectInfo.key, projectInfo.signkey, projectInfo.id, '', APaasState.ENABLED, key, secret, name, params);
    ctx.status = 200;
    ctx.body = updateToken;
  } catch (e) {
    ctx.status = 400;
    ctx.logger.error(e);
    if (e.response && e.response.data && e.response.data.msg) {
      ctx.body = { code: e.response.data.code, msg: e.response.data.msg };
    } else {
      ctx.body = { code: ErrCode.FAILED_UPDATE_WHITEBOARD_TOKEN, msg: '' };
    }
  }
  await generateExtensionLog({
    companyId: companyId,
    vendorId: projectInfo.id,
    product: ProductLogEnum.APaaS,
    extension: 'APaaS',
    result: ctx.status,
    event: params['netless']?.token ? ExtensionEvents.Config : ExtensionEvents.Enable
  });
};

export const getProjectUsecaseList = async (ctx: Koa.Context) => {
  const area = ctx.state.user.company.area;
  const industries = await ProjectService.getInternalIndustryList(area);
  for (const industry of industries) {
    let sectors = [];
    if (area === 'CN') {
      sectors = await ProjectService.getSectorByInternalId(industry.internalIndustryId);
      sectors.sort((item1, item2) => {
        return item1.weight - item2.weight;
      });
    }
    if (sectors.length === 0) {
      const useCases = await ProjectService.getUseCaseByInternalId(industry.internalIndustryId, area);
      useCases.sort((item1, item2) => {
        return item1.weight - item2.weight;
      });
      industry['children'] = useCases;
      industry['hasSector'] = 0;
    } else {
      industry['children'] = sectors;
      industry['hasSector'] = 1;
      for (const sector of sectors) {
        if (sector.sectorId) {
          sector['children'] = await ProjectService.getUseCaseBySectorId(sector.sectorId, area);
        }
      }
    }
  }
  ctx.status = 200;
  ctx.body = industries;
};

export const updateCoHostToken = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }

  if (!projectInfo.signkey) {
    ctx.status = 400;
    return;
  }

  await ProjectService.openCoHostAuth(projectId, companyId);
  ctx.status = 200;
  await generateExtensionLog({
    companyId: companyId,
    vendorId: projectInfo.id,
    product: ProductLogEnum.RTC,
    extension: 'CoHost',
    result: ctx.status,
    event: ExtensionEvents.Enable
  });
};

export const getProjectUpstreams = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const condition = ctx.query;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }
  const res = await new FPAService(ctx.logger).getUpstreamsByVendorId(projectInfo.id, condition.page, condition.limit, condition.upstream_name);
  ctx.status = 200;
  ctx.body = res;
};

export const deleteProjectUpstreams = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const upstreamId = ctx.params.upstreamId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }
  const res = await new FPAService(ctx.logger).deleteUpstreams(projectInfo.id, upstreamId);
  ctx.status = 200;
  ctx.body = res;
};

export const getProjectChains = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const condition = ctx.query;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }
  const res = await new FPAService(ctx.logger).getChainsByVendorId(projectInfo.id, condition.page, condition.limit, condition.chain_name, condition.ip);
  ctx.status = 200;
  ctx.body = res;
};

export const deleteProjectChains = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const chainsId = ctx.params.chainsId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }
  const res = await new FPAService(ctx.logger).deleteChains(projectInfo.id, chainsId);
  ctx.status = 200;
  ctx.body = res;
};

export const getProjectSDKChains = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const condition = ctx.query;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }
  const res = await new FPAService(ctx.logger).getSDKChainsByVendorId(projectInfo.id, condition.page, condition.limit, condition.chain_name, condition.ip);
  ctx.status = 200;
  ctx.body = res;
};

export const deleteProjectSDKChains = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const chainsId = ctx.params.chainsId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }
  const res = await new FPAService(ctx.logger).deleteSDKChains(projectInfo.id, chainsId);
  ctx.status = 200;
  ctx.body = res;
};

export const getProjectKTVInfo = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }
  const res = await new KTVService(ctx.logger).getCustomerInfo(companyId, projectInfo.id);
  ctx.status = 200;
  ctx.body = res;
};

export const postProjectKTVInfo = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const { companyName, status, ip } = ctx.request.body;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }
  const res = await new KTVService(ctx.logger).postCustomerInfo(companyId, projectInfo.id, companyName, ip, status);
  ctx.status = 200;
  ctx.body = res;
  await generateExtensionLog({
    companyId: companyId,
    vendorId: projectInfo.id,
    product: ProductLogEnum.RTC,
    extension: 'ContentCenter',
    result: res.code === 0 ? 200 : 400,
    event: status === 1 ? ExtensionEvents.Enable : ExtensionEvents.Disable
  });
};

export const createFPAService = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const data = ctx.request.body;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }
  data.name = projectInfo.name;
  const fpaService = new FPAService(ctx.logger);
  if (!fpaService.checkCreateChainsParams(data)) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.INVALID_PARAMS };
    return;
  }
  const upstreamsParams = fpaService.gernerateUpstreamsParams(data);
  try {
    const upstreamInfo = await fpaService.createUpstreams(projectInfo.id, upstreamsParams);
    data['upstream_id'] = upstreamInfo.id;
    if (data.chainsType === 'ipa') {
      const chainsParams = fpaService.gernerateChainsParams(data);
      if (data.ipaType === 'default' && !data.use_domain_name) {
        await fpaService.createChains(projectInfo.id, chainsParams);
      } else {
        chainsParams['vendor'] = projectInfo.id;
        await new AbleService(ctx.logger).createOperation(chainsParams);
      }
    } else if (data.chainsType === 'sdk') {
      const chainsParams = fpaService.gernerateSDKChainsParams(data);
      await fpaService.createSDKChains(projectInfo.id, chainsParams);
    }
    ctx.body = upstreamInfo;
    ctx.status = 200;
  } catch (e) {
    ctx.status = 400;
    ctx.logger.error(e);
    if (e.response && e.response.data) {
      ctx.body = { code: e.response.data.code, msg: e.response.data.message };
    } else {
      ctx.body = { code: ErrCode.FAILED_CREATE_SERVICE, msg: '' };
    }
  }
};

export const createFPAServiceNew = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const data = ctx.request.body;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }
  data.name = projectInfo.name;
  let upstreamInfo: any = {};
  const fpaService = new FPAService(ctx.logger);
  try {
    if (data.upstreamId) {
      const upstreams = await fpaService.getUpstreamsByVendorId(projectInfo.id, 1, 1000);
      if (upstreams && upstreams.upstreams.length > 0) {
        upstreamInfo = upstreams.upstreams.find((item: any) => item.id === data.upstreamId);
        if (!upstreamInfo) {
          ctx.status = 400;
          return;
        }
      }
      data['upstream_id'] = data.upstreamId;
    } else {
      // 创建源站
      if (!fpaService.checkCreateChainsParams(data)) {
        ctx.status = 400;
        ctx.body = { code: ErrCode.INVALID_PARAMS };
        return;
      }
      const upstreamsParams = fpaService.gernerateUpstreamsParams(data);
      upstreamInfo = await fpaService.createUpstreams(projectInfo.id, upstreamsParams);
      data['upstream_id'] = upstreamInfo.id;
    }
    if (data.chainsType === 'ipa') {
      const chainsParams = fpaService.gernerateChainsParams(data);
      if (data.ipaType === 'default' && !data.use_domain_name) {
        await fpaService.createChains(projectInfo.id, chainsParams);
      } else {
        chainsParams['vendor'] = projectInfo.id;
        await new AbleService(ctx.logger).createOperation(chainsParams);
      }
    } else if (data.chainsType === 'sdk') {
      const chainsParams = fpaService.gernerateSDKChainsParams(data);
      await fpaService.createSDKChains(projectInfo.id, chainsParams);
    }
    ctx.body = upstreamInfo;
    ctx.status = 200;
  } catch (e) {
    ctx.status = 400;
    ctx.logger.error(e);
    if (e.response && e.response.data) {
      ctx.body = { code: e.response.data.code, msg: e.response.data.message };
    } else {
      ctx.body = { code: ErrCode.FAILED_CREATE_SERVICE, msg: '' };
    }
  }
  await generateExtensionLog({
    companyId: companyId,
    vendorId: projectInfo.id,
    product: ProductLogEnum.FPA,
    extension: 'FPA',
    result: ctx.status,
    event: ExtensionEvents.Config
  });
};

export const getFPARecommendedFilter = async (ctx: Koa.Context) => {
  const { machineIps } = ctx.request.body;
  const res = await new FPAService(ctx.logger).getRecommendedFilter(machineIps);
  ctx.status = 200;
  ctx.body = res;
};

export const getChainsManualRecords = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }
  const res = await new AbleService(ctx.logger).getOperationList(projectInfo.id);
  ctx.status = 200;
  ctx.body = res;
};

export const updateUpstreams = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const upstreamId = ctx.params.upstreamId;
  const companyId = ctx.state.user.companyId;
  const data = ctx.request.body;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }
  const fpaService = new FPAService(ctx.logger);
  const params = fpaService.gernerateUpstreamsUpdateParams(data);
  await fpaService.updateUpstreams(projectInfo.id, upstreamId, params);
  ctx.status = 200;
};

export const updateChains = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const chainsId = ctx.params.chainsId;
  const companyId = ctx.state.user.companyId;
  const data = ctx.request.body;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }
  const fpaService = new FPAService(ctx.logger);
  const params = fpaService.gernerateChainsUpdateParams(data);
  await fpaService.updateChains(projectInfo.id, chainsId, params);
  ctx.status = 200;
};

export const updateSDKChains = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const chainsId = ctx.params.chainsId;
  const companyId = ctx.state.user.companyId;
  const data = ctx.request.body;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }
  const fpaService = new FPAService(ctx.logger);
  const params = fpaService.gernerateSDKChainsUpdateParams(data);
  await fpaService.updateSDKChains(projectInfo.id, chainsId, params);
  ctx.status = 200;
};

export const getFPAMachineData = async (ctx: Koa.Context) => {
  const machines = await new FPAService(ctx.logger).getMachineData();
  ctx.status = 200;
  ctx.body = machines;
};

export const getProjectModeration = async (ctx: Koa.Context) => {
  const { projectId } = ctx.params;
  const companyId = ctx.state.user.companyId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }
  const res = await moderationProxyForSession(ctx.logger).getProjectConfig(projectInfo.id);
  ctx.status = 200;
  ctx.body = res;
};

export const setProjectModeration = async (ctx: Koa.Context) => {
  const projectId = ctx.params.projectId;
  const companyId = ctx.state.user.companyId;
  const { content } = ctx.request.body;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }
  const res = await moderationProxyForSession(ctx.logger).setProjectConfig(projectInfo.id, content);
  ctx.status = 200;
  ctx.body = res;
  await generateExtensionLog({
    companyId: companyId,
    vendorId: projectInfo.id,
    product: ProductLogEnum.RTC,
    extension: 'ContentModeration',
    result: ctx.status,
    event: ExtensionEvents.Config
  });
};

export const updateProjectRelation = async (ctx: Koa.Context) => {
  const { projectId } = ctx.params;
  const companyId = ctx.state.user.companyId;
  const creator = ctx.state.user.isMember ? ctx.state.user.id : '0';
  const { productTypeId, platformId } = ctx.request.body;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }
  await ProjectService.updateProjectRelation({
    vendorId: projectInfo.id,
    productTypeId: productTypeId,
    platformId: platformId,
    creator: creator || ''
  });
  ctx.status = 200;
  ctx.body = true;
};

export const getCloudProxyStatus = async (ctx: Koa.Context) => {
  const { projectId } = ctx.params;
  const companyId = ctx.state.user.companyId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }

  const result = {
    enabled: false,
    pcu_limit: 0
  };
  try {
    const status = await cloudProxyForSession(ctx.logger).getCloudProxyStatus(projectInfo.id);
    const pcuLimit = await cloudProxyForSession(ctx.logger).getCloudProxyPCULimit(projectInfo.id);
    result.enabled = status.data.enabled;
    result.pcu_limit = pcuLimit.data.pcu_limit;
    ctx.body = result;
    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
  }
};

export const getCloudProxyPCULimit = async (ctx: Koa.Context) => {
  const { projectId } = ctx.params;
  const companyId = ctx.state.user.companyId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }
  const res = await cloudProxyForSession(ctx.logger).getCloudProxyPCULimit(projectInfo.id);
  ctx.body = res.data;
  ctx.status = 200;
};

export const updateCloudProxyStatus = async (ctx: Koa.Context) => {
  const { projectId } = ctx.params;
  const { enabled } = ctx.request.body;
  const companyId = ctx.state.user.companyId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }
  ctx.body = await cloudProxyForSession(ctx.logger).updateCloudProxyStatus(projectInfo.id, enabled);
  ctx.status = 200;
  await generateExtensionLog({
    companyId: companyId,
    vendorId: projectInfo.id,
    product: ProductLogEnum.RTC,
    extension: 'CloudProxy',
    result: ctx.status,
    event: enabled ? ExtensionEvents.Enable : ExtensionEvents.Disable
  });
};

export const updateCloudProxyPCULimit = async (ctx: Koa.Context) => {
  const { projectId } = ctx.params;
  const { is_enabled, pcu_limit } = ctx.request.body;
  const companyId = ctx.state.user.companyId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }
  ctx.body = await cloudProxyForSession(ctx.logger).updateCloudProxyPCULimit(projectInfo.id, is_enabled, pcu_limit);
  ctx.status = 200;
};

export const getProjectNCS = async (ctx: Koa.Context) => {
  const { projectId } = ctx.params;
  const companyId = ctx.state.user.companyId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }
  ctx.status = 200;
  ctx.body = await NCSService.getProjectNCSConfig(projectId);
};

export const getNCSEvents = async (ctx: Koa.Context) => {
  ctx.body = await NCSService.getProductEvents();
  ctx.status = 200;
};

export const NCSHealthCheck = async (ctx: Koa.Context) => {
  const { projectId } = ctx.params;
  const companyId = ctx.state.user.companyId;
  const data = ctx.request.body;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }
  const params = {
    url: Buffer.from(data.url).toString('base64'),
    appId: Buffer.from(projectInfo.key).toString('base64'),
    secret: Buffer.from(data.secret).toString('base64'),
    noticeId: generateUUID(),
    productId: data.productId,
    eventType: data.eventType,
    payload: Buffer.from(data.payload).toString('base64')
  };
  const res = await ncsProxyForSession(ctx.logger).healthCheck(params, data.urlRegion);
  ctx.status = 200;
  ctx.body = res;
};

export const closeNCS = async (ctx: Koa.Context) => {
  const { projectId, configId } = ctx.params;
  const companyId = ctx.state.user.companyId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }
  const configInfo = await NCSService.getProjectNCSConfig(projectId);
  if (configInfo.id !== Number(configId)) {
    ctx.status = 400;
    return;
  }
  try {
    ctx.status = 200;
    ctx.body = await NCSService.closeNCS(ctx.logger, projectInfo.id, configId);
  } catch (e) {
    console.error(e);
    ctx.status = 500;
  }
  await generateExtensionLog({
    companyId: companyId,
    vendorId: projectInfo.id,
    product: ProductLogEnum.RTC,
    extension: 'NCS',
    result: ctx.status,
    event: ExtensionEvents.Disable
  });
};

export const SubmitNCSConfigAudit = async (ctx: Koa.Context) => {
  const { projectId } = ctx.params;
  const companyId = ctx.state.user.companyId;
  const data = ctx.request.body;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }
  const formData = {
    config_id: data.configId,
    cid: companyId,
    vid: projectInfo.id,
    event: data.eventIds,
    url: data.url,
    url_region: data.urlRegion,
    secret: data.secret,
    use_ip_whitelist: Number(data.useIpWhitelist),
    product_id: 1
  };
  if (formData.config_id) {
    const configInfo = await NCSService.getProjectNCSConfig(projectId);
    if (configInfo.id !== Number(formData.config_id)) {
      ctx.status = 400;
      return;
    }
  }
  const res = await NCSService.submitNCSAuditForm(ctx.logger, projectInfo.id, formData);
  ctx.status = 200;
  ctx.body = res;
};

export const getNCSConfigAudit = async (ctx: Koa.Context) => {
  const { projectId } = ctx.params;
  const companyId = ctx.state.user.companyId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }
  const res = await donsoleProxyForSession(ctx.logger).getAuditForm(projectInfo.id);
  ctx.status = 200;
  if (res && res.hasForm) {
    ctx.body = res.auditForm.formData;
  }
};

export const getIotStatus = async (ctx: Koa.Context) => {
  const { projectId } = ctx.params;
  const companyId = ctx.state.user.companyId;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }
  try {
    const result = await iotProxyForSession(ctx.logger).getIotStatus(projectInfo.key);
    ctx.body = {
      enabled: result?.data ? result.data : false
    };
    ctx.status = 200;
  } catch (e) {
    if (e.statusCode === 404) {
      ctx.body = {
        enabled: false
      };
      ctx.status = 200;
      return;
    }
    ctx.status = 500;
  }
};

export const updateIotStatus = async (ctx: Koa.Context) => {
  const { projectId } = ctx.params;
  const { datacenter } = ctx.request.body;
  const companyId = ctx.state.user.companyId;
  const companyName = ctx.state.user.company.name;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    return;
  }
  try {
    const result = await iotProxyForSession(ctx.logger).updateIotStatus(projectInfo.key, companyName, datacenter, projectInfo.name, projectInfo.id, companyId);
    ctx.body = {
      success: result?.success
    };
    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
  }
  await generateExtensionLog({
    companyId: companyId,
    vendorId: projectInfo.id,
    product: ProductLogEnum.APaaS,
    extension: 'iot',
    result: ctx.status,
    event: ExtensionEvents.Enable
  });
};
