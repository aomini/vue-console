import * as Router from 'koa-router';
import { authUser } from '../controller/auth';
import { ssoProxyForSession } from '../externalService/SSOProxy';
import { destroySession } from '../utils/session';
const router = new Router({ prefix: '/api/v2' });

const formatSensitiveInfo = (infoText: string) => {
  const hidePart = infoText.slice(4, -4);
  return infoText.replace(hidePart, '*'.repeat(hidePart.length));
};

router.get('/userInfo', authUser, (ctx) => {
  const user = ctx.state.user;
  const phoneNumber = formatSensitiveInfo(user.phoneNumber || '');
  const email = formatSensitiveInfo(user.email || '');
  const verifyPhone = formatSensitiveInfo(user.verifyPhone || '');
  ctx.status = 200;
  ctx.body = Object.assign({}, user, { password: undefined, salt: undefined }, { phoneNumber, email, verifyPhone });
});

router.post('/check-login', async (ctx) => {
  const res = await ssoProxyForSession(ctx.logger).checkLoginIdValid(ctx.session.loginId);
  if (!res || !res.isValid) {
    ctx.status = 401;
    destroySession(ctx);
    return;
  }
  ctx.status = 200;
});

export { router };
