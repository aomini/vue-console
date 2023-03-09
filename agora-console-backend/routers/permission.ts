import * as Router from 'koa-router';
import * as PermissionCtrl from '../controller/permission';
import { authUser } from '../controller/auth';

import { checkWritePermission, checkSudoPermission, checkReadPermission } from '../controller/checkPermission';

const router = new Router({ prefix: '/api/v2' });

router.use(authUser);
const MODULE_NAME = 'Member&RoleManagement';

router.get('/permission/getRoles', checkReadPermission(MODULE_NAME), PermissionCtrl.getRolesByCompany);
router.get('/permission/getRolePermissions', checkReadPermission(MODULE_NAME), PermissionCtrl.getRolesPermissionByCompany);
router.put('/permission/updateRole', checkWritePermission(MODULE_NAME), checkSudoPermission(), PermissionCtrl.updateRole);

router.post('/permission/createRole', checkWritePermission(MODULE_NAME), checkSudoPermission(), PermissionCtrl.createRole);

router.delete('/permission/deleteRole', checkWritePermission(MODULE_NAME), checkSudoPermission(), PermissionCtrl.deleteRole);

export { router };
