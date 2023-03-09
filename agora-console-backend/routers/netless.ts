import * as Router from 'koa-router';
import * as NetlessCtrl from '../controller/netless';
import { authUser } from '../controller/auth';
import { checkReadPermission, checkWritePermission, checkSudoPermission } from '../controller/checkPermission';

const router = new Router({ prefix: '/api/v2' });

router.use(authUser);
const MODULE_NAME = 'ProjectManagement';

router.get('/project/:vendorId/netless', checkReadPermission(MODULE_NAME), NetlessCtrl.getProjectNetlessInfo);
router.get('/project/:vendorId/netless/storage', checkReadPermission(MODULE_NAME), NetlessCtrl.listStorages);
router.get('/project/:vendorId/netless/check', checkReadPermission(MODULE_NAME), NetlessCtrl.checkProjectNetless);
router.post('/project/:vendorId/netless', checkWritePermission(MODULE_NAME), checkSudoPermission(), NetlessCtrl.enableProjectNetless);
router.post('/project/:vendorId/netless/service', checkWritePermission(MODULE_NAME), checkSudoPermission(), NetlessCtrl.updateProjectServices);
router.post('/project/:vendorId/netless/storage', checkWritePermission(MODULE_NAME), checkSudoPermission(), NetlessCtrl.saveStorage);
router.post('/project/:vendorId/netless/token', checkReadPermission(MODULE_NAME), NetlessCtrl.generateNetlessDKToken);
router.get('/company/netless/exist', checkReadPermission(MODULE_NAME), checkSudoPermission(), NetlessCtrl.checkNetlessCompanyExist);
router.post('/company/netless/migrate', checkWritePermission(MODULE_NAME), checkSudoPermission(), NetlessCtrl.migrateNetlessProjects);

export { router };
