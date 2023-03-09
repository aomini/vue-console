import * as Router from 'koa-router';
import * as AccountCtrl from '../controller/account';

import { authUser } from '../controller/auth';

import {
  checkSudoPermission,
  checkTwoStepVerificationPermission
} from '../controller/checkPermission';

const router = new Router({ prefix: '/api/v2' });
router.use(authUser);

router.post('/account/exit', AccountCtrl.exit);
router.put('/account/info', checkSudoPermission(), AccountCtrl.updateCompanyName);
router.put('/account/language', checkSudoPermission(), AccountCtrl.updateAccountLanguage);
router.get('/account/auth', checkSudoPermission(), AccountCtrl.getAccountAuth);
router.put('/account/auth', checkSudoPermission(), checkTwoStepVerificationPermission(), AccountCtrl.updateAccountAuth);

router.get('/account/permissions', AccountCtrl.getAccountAAPermission);
router.get('/company/field', AccountCtrl.getCompanyFieldInfo);
router.post('/company/field', AccountCtrl.setCompanyFieldInfo);
router.post('/account/submit-delete', AccountCtrl.submitDelete);
router.post('/account/submit-delete-check', AccountCtrl.submitDeleteCheck);

router.get('/account/console-operation-allowance', AccountCtrl.getConsoleOperationAllowance);
router.put('/account/console-operation-allowance', AccountCtrl.updateConsoleOperationAllowance);
router.get('/account/layout/setting', AccountCtrl.getAccountLayoutSetting);
router.post('/account/layout/setting', AccountCtrl.updateAccountLayoutSetting);

export { router };
