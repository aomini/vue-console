import * as Koa from 'koa';
import * as ProjectService from '../services/project';
import { ErrCode } from '../controller/apiCodes';

export const getVendorList = async (ctx: Koa.Context) => {
  const { pagesize = 10000, minVendorId, minUpdateTimestamp } = ctx.request.query;
  if (!minVendorId) {
    ctx.status = 400;
    ctx.body = { code: ErrCode.PARAMS_MISSING, errorMessage: 'params missing' };
    return;
  }

  try {
    const ret = await ProjectService.getCompanyVendors(minVendorId, minUpdateTimestamp, pagesize);
    ctx.status = 200;
    ctx.body = ret;
  } catch (e) {
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_GET_VENDORLISTS };
    ctx.logger.error(e.message);
  }
};

export const getVendorGroups = async (ctx: Koa.Context) => {
  try {
    const groupVids = await ProjectService.getVendorGroups();
    const group = [];
    for (const groupVid of groupVids) {
      if (!groupVid.vendorsId) {
        continue;
      }
      const vids = [];
      groupVid.vendorsId.split(',').forEach((element) => {
        vids.push(parseInt(element, 10));
      });
      group.push({
        'groupVid' : groupVid.id,
        'vidList' : vids
      });
    }
    ctx.status = 200;
    ctx.body = group;
  } catch (e) {
    let errorMessage = 'fail to get vendor groups';
    if (e.response && e.response.data && e.response.data.errorMessage) {
      errorMessage = e.response.data.errorMessage;
    }
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_GET_VENDORGROUPS, errorMessage: errorMessage };
    ctx.logger.error(e);
  }
};

export const getProjectsByVids = async (ctx: Koa.Context) => {
  const { vids } = ctx.request.query;
  const ret = {
    code: 0,
    items: []
  };
  let projects = [];
  if (!vids) {
    ctx.status = 200;
    ctx.body = ret;
    return;
  }
  try {
    const vendorIds = vids.split(',');
    if (vendorIds.length > 100) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.FAILED_GET_PROJECTS, errorMessage: 'max vid num 100 limit' };
      return;
    }
    projects = await ProjectService.getProjectInfoByVids(vendorIds);
    ret.items = projects;
    ctx.status = 200;
    ctx.body = ret;
  } catch (e) {
    let errorMessage = 'fail get project info';
    if (e.response && e.response.data && e.response.data.errorMessage) {
      errorMessage = e.response.data.errorMessage;
    }
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_GET_PROJECTS, errorMessage: errorMessage };
    ctx.logger.error(e.message);
  }
};
