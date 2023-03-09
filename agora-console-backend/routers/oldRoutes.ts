import * as Router from 'koa-router';
import * as SSOCtrl from '../controller/user';

const router = new Router();

router.get('/sso/userinfo', SSOCtrl.authAgoraToken, SSOCtrl.ssoUserInfo);

router.get('/sudo/su', SSOCtrl.sudoUserInfo);

export { router };
