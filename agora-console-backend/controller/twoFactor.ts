import * as Koa from 'koa';
import { getMainAccountByCompanyId } from '../services/account';
import { ErrCode } from './apiCodes';

export const checkCreatorEmail = async (ctx: Koa.Context) => {
  const { creatorEmail } = ctx.request.body;
  const companyId = ctx.state.user.companyId;
  try {
    const mainAccount = await getMainAccountByCompanyId(companyId);
    const checkCreatorEmail = creatorEmail === mainAccount.email;
    ctx.status = 200;
    ctx.body = checkCreatorEmail;
  } catch (e) {
    ctx.status = 500;
    ctx.body = { code: ErrCode.ACCOUNT_EMAIL_MISMATCH };
  }
};
