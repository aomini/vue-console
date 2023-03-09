import * as Router from 'koa-router';
import * as IdentityCtrl from '../controller/identity';
import { checkReadPermission, checkSudoPermission } from '../controller/checkPermission';

import { authUser } from '../controller/auth';

const router = new Router({ prefix: '/api/v2' });
router.use(authUser);
const MODULE_NAME = 'FinanceCenter';

router.get('/identity/info', IdentityCtrl.getUserIdentity);
router.get('/identity/full-info', IdentityCtrl.getCompanyFullIdentityInfo);
router.get('/identity/member-role', IdentityCtrl.getMemberRole);
router.post('/identity/prepareAttachment', checkReadPermission(MODULE_NAME), checkSudoPermission(), IdentityCtrl.prepareAttachment);
router.post('/identity/publishAttachment', checkReadPermission(MODULE_NAME), checkSudoPermission(), IdentityCtrl.publishAttachment);
router.post('/identity/person', checkReadPermission(MODULE_NAME), checkSudoPermission(), IdentityCtrl.postPersonIdentity);
router.post('/identity/enterprise', checkReadPermission(MODULE_NAME), checkSudoPermission(), IdentityCtrl.postEnterpriseIdentity);
router.delete('/identity/deleteAttachment', checkReadPermission(MODULE_NAME), checkSudoPermission(), IdentityCtrl.deleteAttachment);
router.post('/identity/person/result', checkReadPermission(MODULE_NAME), checkSudoPermission(), IdentityCtrl.postPersonIdentityResult);

export { router };
