import * as Koa from 'koa';
import { AgoraChatService } from '../externalService/AgoraChatService';
import * as ProjectService from '../services/project';
import { ErrCode } from './apiCodes';
import { ssoProxyForSession } from '../externalService/SSOProxy';
import { ExtensionEvents, generateExtensionLog, ProductLogEnum } from '../services/extensionLog';

export const getCompanySubscription = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const area = ctx.state.user.company.area;
  const res = await new AgoraChatService(ctx.logger).getCompanySubscription(companyId, area);
  ctx.status = 200;
  ctx.body = res;
};

export const setCompanySubscription = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const area = ctx.state.user.company.area;
  const { plan_name } = ctx.request.body;
  const res = await new AgoraChatService(ctx.logger).setCompanySubscription(companyId, plan_name, area);
  ctx.status = 200;
  ctx.body = res;
  await generateExtensionLog({
    companyId: companyId,
    vendorId: 0,
    product: ProductLogEnum.Chat,
    extension: 'Chat',
    result: ctx.status,
    event: ExtensionEvents.Subscribe,
    payload: JSON.stringify({ plan_name: plan_name })
  });
};

export const deleteCompanySubscription = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const area = ctx.state.user.company.area;
  const data = ctx.request.body;
  const res = await new AgoraChatService(ctx.logger).deleteCompanySubscription(companyId, area);
  ctx.status = 200;
  ctx.body = res;
  await generateExtensionLog({
    companyId: companyId,
    vendorId: 0,
    product: ProductLogEnum.Chat,
    extension: 'Chat',
    result: ctx.status,
    event: ExtensionEvents.Unsubscribe,
    payload: JSON.stringify({ unsubscribeReason: data.unsubscribeReason, otherReason: data.otherReason, switchVendors: data.switchVendors })
  });
};

export const getProjectChatInfo = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const projectId = ctx.params.projectId;
  const area = ctx.state.user.company.area;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }
  const res = await new AgoraChatService(ctx.logger).getInstanceByVid(companyId, projectInfo.id, area);
  ctx.status = 200;
  ctx.body = res;
};

export const enableProjectChat = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const projectId = ctx.params.projectId;
  const companyName = ctx.state.user.company.name;
  const area = ctx.state.user.company.area;
  const { dataCenter } = ctx.request.body;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }
  const permission = await new AgoraChatService(ctx.logger).checkEnableService(companyId, area, dataCenter);
  if (!permission) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.NO_Permission };
    return;
  }
  const res = await new AgoraChatService(ctx.logger).enableInstanceByVid(companyId, projectInfo.id, companyName, projectInfo.name, dataCenter, area);
  ctx.status = 200;
  if (res.appkey) {
    const cooCid = res.appkey.split('#')[0];
    const cooVid = res.appkey.split('#')[1];
    const companyLinkInfo = await ssoProxyForSession(ctx.logger).getCompanyPartnerLinkInfo(companyId);
    if (!companyLinkInfo) {
      // 创建coo_company
      await ssoProxyForSession(ctx.logger).putCompanyPartnerLink(companyId, cooCid);
    }
    // 创建coo_project
    await ssoProxyForSession(ctx.logger).putProjectPartnerLink(companyId, projectInfo.id, cooVid);
  }
  await generateExtensionLog({
    companyId: companyId,
    vendorId: projectInfo.id,
    product: ProductLogEnum.Chat,
    extension: 'Chat',
    result: ctx.status,
    event: ExtensionEvents.Enable,
    payload: JSON.stringify({ dataCenter })
  });
};

export const activeProjectChat = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const projectId = ctx.params.projectId;
  const area = ctx.state.user.company.area;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }
  if (!await new AgoraChatService(ctx.logger).checkCompanySubscription(companyId, area)) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.NO_SUBSCRIPTION };
    return;
  }
  await new AgoraChatService(ctx.logger).ActiveInstanceByVid(companyId, projectInfo.id, area);
  ctx.status = 200;
};

export const disactiveProjectChat = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const projectId = ctx.params.projectId;
  const area = ctx.state.user.company.area;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }
  await new AgoraChatService(ctx.logger).InactiveInstanceByVid(companyId, projectInfo.id, area);
  ctx.status = 200;
};

export const getProjectPushInfo = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const projectId = ctx.params.projectId;
  const area = ctx.state.user.company.area;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }
  const res = await new AgoraChatService(ctx.logger).getProjectPushInfo(companyId, projectInfo.id, area);
  ctx.status = 200;
  ctx.body = res;
};

export const createProjectPushCertificate = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const projectId = ctx.params.projectId;
  const area = ctx.state.user.company.area;
  const params = ctx.request.body;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }
  if (!await new AgoraChatService(ctx.logger).checkCompanySubscription(companyId, area)) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.NO_SUBSCRIPTION };
    return;
  }
  const res = await new AgoraChatService(ctx.logger).createProjectPush(companyId, projectInfo.id, params, area);
  ctx.status = 200;
  ctx.body = res;
};

export const deleteProjectPushInfo = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const projectId = ctx.params.projectId;
  const certificate_id = ctx.params.certificate_id;
  const area = ctx.state.user.company.area;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }
  await new AgoraChatService(ctx.logger).deleteProjectPushInfo(companyId, projectInfo.id, certificate_id, area);
  ctx.status = 200;
};

export const getProjectCallbackInfo = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const projectId = ctx.params.projectId;
  const area = ctx.state.user.company.area;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }
  const res = await new AgoraChatService(ctx.logger).getProjectCallbackInfo(companyId, projectInfo.id, area);
  ctx.status = 200;
  ctx.body = res;
};

export const deleteProjectCallback = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const projectId = ctx.params.projectId;
  const rule_id = ctx.params.rule_id;
  const rule_type = ctx.request.query.rule_type;
  const area = ctx.state.user.company.area;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }
  if (rule_type === 'pre-send') {
    await new AgoraChatService(ctx.logger).deletePreCallback(companyId, projectInfo.id, rule_id, area);
  } else if (rule_type === 'post-send') {
    await new AgoraChatService(ctx.logger).deletePostCallback(companyId, projectInfo.id, rule_id, area);
  }
  ctx.status = 200;
};

export const createPreCallbackRule = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const projectId = ctx.params.projectId;
  const params = ctx.request.body;
  const area = ctx.state.user.company.area;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }
  const permission = await new AgoraChatService(ctx.logger).checkCallBackPermission(companyId, area);
  if (!permission) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.NO_Permission };
    return;
  }
  const res = await new AgoraChatService(ctx.logger).createPreCallback(companyId, projectInfo.id, params, area);
  ctx.status = 200;
  ctx.body = res;
};

export const createPostCallbackRule = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const projectId = ctx.params.projectId;
  const params = ctx.request.body;
  const area = ctx.state.user.company.area;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }
  const permission = await new AgoraChatService(ctx.logger).checkCallBackPermission(companyId, area);
  if (!permission) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.NO_Permission };
    return;
  }
  const res = await new AgoraChatService(ctx.logger).createPostCallback(companyId, projectInfo.id, params, area);
  ctx.status = 200;
  ctx.body = res;
};

export const updatePreCallbackRule = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const projectId = ctx.params.projectId;
  const rule_id = ctx.params.rule_id;
  const params = ctx.request.body;
  const area = ctx.state.user.company.area;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }
  const res = await new AgoraChatService(ctx.logger).updatePreCallback(companyId, projectInfo.id, rule_id, params, area);
  ctx.status = 200;
  ctx.body = res;
};

export const updatePostCallbackRule = async (ctx: Koa.Context) => {
  const companyId = ctx.state.user.companyId;
  const projectId = ctx.params.projectId;
  const params = ctx.request.body;
  const rule_id = ctx.params.rule_id;
  const area = ctx.state.user.company.area;
  const projectInfo = await ProjectService.getProjectDetail(projectId, companyId);
  if (!projectInfo) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECT };
    return;
  }
  const res = await new AgoraChatService(ctx.logger).updatePostCallback(companyId, projectInfo.id, rule_id, params, area);
  ctx.status = 200;
  ctx.body = res;
};

export const getChatFunction = async (ctx: Koa.Context) => {
  const area = ctx.state.user.company.area;
  const res = await new AgoraChatService(ctx.logger).getChatFunction(area);
  ctx.status = 200;
  ctx.body = res;
};
