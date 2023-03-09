import * as Router from 'koa-router';
import * as AccountVerify from '../controller/accountVerify';
import { authUser } from '../controller/auth';

import { checkSudoPermission } from '../controller/checkPermission';

const router = new Router({ prefix: '/api/v2' });

router.use(authUser);

router.get('/verify/sms', checkSudoPermission(), AccountVerify.getSMSCode);
router.post('/verify/phone', checkSudoPermission(), AccountVerify.verifyPhone);

export { router };
