import * as Koa from 'koa';
import { config } from '../config';
import * as Client from '../utils/gw-request';
import * as ProjectService from '../services/project';
import { User } from '../models/user';

const XLAUrl = `${config.dataBizUrl}/xla-core/xla`;

const API = {
  contractList: `${XLAUrl}/contract/list`
};

const gwOptions = {
  timeout: 60 * 1000,
  headers: {
    'agora-service-key': config.serviceKey
  }
};

export const getContractList = async (ctx: Koa.Context) => {
  const user: User = ctx.state.user;
  const companyId = user.companyId;

  try {
    const client = Client.gw_create(ctx.logger, gwOptions);
    const params = { cid: companyId };
    const result = await client.get(`${API.contractList}`, { params });
    const list = (result && result.data) ? result.data.data : [];

    for (let i = 0; i < (list || []).length; i++) {
      const vid = list[ i ].vid;
      const project = await ProjectService.getVendorInfoById(vid, companyId);
      if (project) {
        list[ i ]['projectId'] = project.projectId;
        list[ i ]['vid'] = undefined;
      }
    }

    ctx.status = 200;
    ctx.body = result.data;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = e;
  }
};
