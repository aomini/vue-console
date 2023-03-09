import * as Router from 'koa-router';
import * as XLACtrl from '../controller/XLA';
import { authUser } from '../controller/auth';
import { checkReadPermission } from '../controller/checkPermission';

const router = new Router({ prefix: '/api/v2/xla' });

router.use(authUser);
const MODULE_NAME = 'XLA';

router.get('/contract/list', checkReadPermission(MODULE_NAME), XLACtrl.getContractList);

export { router };
