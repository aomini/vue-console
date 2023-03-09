import * as Router from 'koa-router';
import * as AccountCtrl from '../apiController/account';

const router = new Router({ prefix: '/api/v2' });

router.post('/external/verify/sendEmail', AccountCtrl.sendVerifyEmail);
router.post('/external/verify/checkEmail', AccountCtrl.checkVerifyEmail);

export { router };
