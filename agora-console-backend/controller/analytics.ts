import * as Koa from 'koa';
import * as moment from 'moment';
import { ListParams } from '../models/listReply';
import { getProjectsByCompany } from '../services/project';
import { ErrCode } from './apiCodes';
import { Logger } from 'log4js';
import * as Client from '../utils/gw-request';

import { config } from '../config';

const dataBizUrl = config.dataBizUrl;

const API = {
  callSessions: `${dataBizUrl}/aa-call-search-service/web/call-sessions`
};

interface ResearchParams {
  from: Number;
  size: Number;
  vids: Array<String>;
  cname: String;
  uids?: Array<Number>;
  fromTs: Number;
  toTs: Number;
}

const fetchCallSession = async (log: Logger, p: ResearchParams) => {
  const client = Client.gw_create(log, { timeout: 60 * 1000 });
  const ret = await client.post(API.callSessions, p);
  const data = ret.data;
  if (!data.callSessions) {
    data.callSessions = [];
  }
  return data;
};

export const research = async (ctx: Koa.Context) => {
  const { cname, fromUid, toUid } = ctx.query;
  if (!cname) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.PARAMS_MISSING };
    return;
  }
  try {
    const companyId = ctx.state.user.companyId;
    const projectList = new ListParams(100, 1, { companyId: companyId });
    let uids;
    if (fromUid && toUid) {
      uids = [fromUid, toUid];
    }

    const result = await getProjectsByCompany(projectList);
    const map = {};
    if (result.total > 0 && result.items) {
      const vids = [];
      for (let i = 0; i < result.items.length; i++) {
        const item = result.items[i];
        map[item.id] = item.projectId;
        vids.push(item.id);
      }
      const options: ResearchParams = {
        from: 0,
        size: 100,
        vids: vids,
        cname: cname,
        fromTs: moment().subtract(14, 'days').subtract(60, 'minutes').unix(),
        toTs: moment().unix()
      };
      const ret = await fetchCallSession(ctx.logger, options);
      if (ret.callSessions.length > 0) {
        const call = ret.callSessions[0];
        if (map[call.vid]) {
          if (uids) {
            ctx.redirect(`/analytics/call/e2e?id=${call.callId}&projectId=${map[call.vid]}&fromUid=${fromUid}&toUid=${toUid}&rangeFromTs=${call.createdTs}&rangeToTs=${call.destroyedTs || moment().unix()}`);
          } else {
            ctx.redirect(`/analytics/calls/${call.callId}/qoe?projectId=${map[call.vid]}`);
          }
        }
      } else {
        ctx.redirect(`/analytics/call/search?cname=${cname}`);
      }
    }
  } catch (e) {
    ctx.logger.error(e);
    ctx.logger.error(`重定向到水晶球失败 cname: ${cname}, fromUid: ${fromUid}, toUid: ${toUid}`);
  }
};
