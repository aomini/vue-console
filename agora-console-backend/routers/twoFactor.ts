import * as Router from 'koa-router';
import * as TwoFactorCtrl from '../controller/twoFactor';

import { authUser } from '../controller/auth';

const router = new Router({ prefix: '/api/v2' });
router.use(authUser);

router.post('/account/check-creator-email', TwoFactorCtrl.checkCreatorEmail);

export { router };
