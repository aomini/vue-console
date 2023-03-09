import { Logger } from 'log4js';
import { ServiceProxy } from '../utils/ServiceProxy';
import { RequestFollower } from '../utils/RequestFollower';
import { config } from '../config';
import { axiosBuilder, CommonAPI } from '@fangcha/app-request';
import { ConsoleRequestFollower } from '../utils/ConsoleRequestFollower';

enum HookEvent {
  // 用于测试连通性
  Ping = 'Ping',
  // 申请提现提交时调用此方法
  WithdrawalSubmitted = 'WithdrawalSubmitted',
  // 企业实名认证提交时调用此方法
  EnterpriseAuthSubmitted = 'EnterpriseAuthSubmitted',
  // 绑定信用卡时调用此方法
  CreditCardBinded = 'CreditCardBinded'
}

interface SuspendSettingModel {
  companyId: number;
  balanceSafeThreshold: number;
  toleranceDays: number;
  financialStatus: number;
  paymentDeadline: string | null;
}

export interface ArcherConfig {
  baseURL: string;
  username: string;
  password: string;
}

const APIData = {
  ProjectStatusUpdate: {
    method: 'PUT',
    route: '/api/v2/company/:companyId/project/:projectId/status',
    description: '修改停机状态'
  },
  CompanySuspendSettingGet: {
    method: 'GET',
    route: '/api/v2/dashboard/company/:companyId/suspend-setting',
    description: '获取停机策略'
  },
  CompanyEventNotify: {
    method: 'POST',
    route: '/api/v2/dashboard/hook/company/:companyId/event/:event',
    description: '公司相关事件通知'
  },
  CompanyDestroyApply: {
    method: 'POST',
    route: '/api/v2/dashboard/company/:companyId/apply-to-destroy',
    description: '删除账号申请'
  }
};

// api-docs: http://archer-open.staging.agoralab.co/api-docs/v1/open-api
export class ArcherProxy extends ServiceProxy<ArcherConfig> {
  private readonly _authorization: string;

  constructor(config: ArcherConfig, observerClass?: { new (requestId?: string): RequestFollower }) {
    super(config, observerClass);
    this._authorization = Buffer.from(`${config.username}:${config.password}`).toString('base64');
  }

  protected makeRequest(commonApi: CommonAPI, params = {}) {
    const request = axiosBuilder()
      .setBaseURL(this._config.baseURL)
      .addHeader('Authorization', this._authorization)
      .setApiOptions(commonApi)
      .setTimeout(15000)
      .setBodyData(params);
    this.onRequestMade(request);
    return request;
  }

  protected async _request(commonAPI: CommonAPI, params = {}) {
    const request = this.makeRequest(commonAPI, params);
    return request.quickSend();
  }

  public async updateVendorStatus(companyId: number, projectId: string, status: number) {
    const commonApi = new CommonAPI(APIData.ProjectStatusUpdate, companyId, projectId);
    return (this._request(commonApi, { status: status }));
  }

  public async getCompanySuspendSetting(companyId: number) {
    const commonApi = new CommonAPI(APIData.CompanySuspendSettingGet, companyId);
    const data = await this._request(commonApi) as SuspendSettingModel;
    // 兼容当前应用中使用的 allowableArrears 字段，做到平滑过渡，上线一段时间后可删除下方代码
    data['allowableArrears'] = data.balanceSafeThreshold;
    return data;
  }

  public async notifyArcherOnPing(companyId: number) {
    const commonApi = new CommonAPI(APIData.CompanyEventNotify, companyId, HookEvent.Ping);
    return this._request(commonApi);
  }

  public async notifyArcherOnCompanyWithdrawalSubmitted(companyId: number) {
    const commonApi = new CommonAPI(APIData.CompanyEventNotify, companyId, HookEvent.WithdrawalSubmitted);
    return this._request(commonApi);
  }

  public async notifyArcherOnEnterpriseAuthSubmitted(companyId: number) {
    const commonApi = new CommonAPI(APIData.CompanyEventNotify, companyId, HookEvent.EnterpriseAuthSubmitted);
    return this._request(commonApi);
  }

  public async notifyArcherOnCreditCardBinded(companyId: number) {
    const commonApi = new CommonAPI(APIData.CompanyEventNotify, companyId, HookEvent.CreditCardBinded);
    return this._request(commonApi);
  }

  public async submitAccountDelete(companyId: number, reason: string) {
    const commonApi = new CommonAPI(APIData.CompanyDestroyApply, companyId);
    return this._request(commonApi, { reason: reason });
  }
}

export const archerProxy = new ArcherProxy(config.archerApi, ConsoleRequestFollower);

export const archerProxyForSession = (log: Logger) => {
  return archerProxy.proxyForSession((log as any).context['reqid'], (log as any).context['user']);
};
