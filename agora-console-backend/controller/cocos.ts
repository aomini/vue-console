import * as Koa from 'koa';
import { ErrCode } from './apiCodes';
import { getAccount, apiAuth, syncRemoteCocosProject } from '../services/cocos';

/**
 * @description cocos开启关闭项目接口
 * @param ctx
 * @document https://www.cocos.com/docs/services/service-switch/#_3
 */
export const switchService = async(ctx: Koa.Context) => {
  const uid = ctx.query.uid;
  const startTime = new Date().getTime();
  try {
    const authStatus = apiAuth(ctx.query);
    console.error('swicith service apiAuth:', new Date().getTime() - startTime);
    if (!authStatus) {
      ctx.status = 400;
      ctx.body = { code: 40001, message: 'parameter check failed' };
      return;
    } else {
      ctx.status = 200;
      ctx.body = { code: 200, message: 'success' };
      // 这里的body的code状态码200是cocos要求的
    }
    // 更新关联表(project_cocos)数据
    const account = await getAccount(uid);
    console.error('swicith service getAccount:', new Date().getTime() - startTime);
    if (account) {
      syncRemoteCocosProject(uid, account.userProfile.companyId).then(res => {
        console.log('sync cocos project success');
      }).catch(err => {
        console.log('sync cocos project fail:', err);
      });
      return;
    }
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e);
    ctx.body = { code: ErrCode.FAILED_GET_MEMBERS };
  }
};
