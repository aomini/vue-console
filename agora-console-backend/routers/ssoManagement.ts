import * as Router from 'koa-router';
import { SsoManagement } from '../controller/ssoManagement';
import { authUser } from '../controller/auth';
import { checkReadPermission, checkSudoPermission, checkWritePermission } from '../controller/checkPermission';

const router = new Router({ prefix: '/api/v2/sso' });

router.use(authUser);
const MODULE_NAME = 'Member&RoleManagement';

router.get('/scim/basic-auth', checkReadPermission(MODULE_NAME), SsoManagement.getSCIMBasicAuthData);
router.post('/scim/basic-auth', checkWritePermission(MODULE_NAME), checkSudoPermission(), SsoManagement.renewSCIMBasicAuthData);
router.get('/saml/configuration', checkReadPermission(MODULE_NAME), SsoManagement.getSAMLData);
router.post('/saml/configuration', checkReadPermission(MODULE_NAME), checkSudoPermission(), SsoManagement.updateSAMLData);
router.delete('/saml/configuration', checkReadPermission(MODULE_NAME), checkSudoPermission(), SsoManagement.removeSAMLData);

export { router };
