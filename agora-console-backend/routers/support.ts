import * as Router from 'koa-router';
import * as SupportCtrl from '../controller/support';
import { authUser } from '../controller/auth';
import { checkSudoPermission } from '../controller/checkPermission';

const router = new Router({ prefix: '/api/v2' });

router.use(authUser);

router.get('/support/url', checkSudoPermission(), SupportCtrl.getUrl);

router.get('/support/package/company', checkSudoPermission(), SupportCtrl.getSupportPackageByCompany);

router.get('/support/package/:packageId/info', checkSudoPermission(), SupportCtrl.getSupportPackageInfo);

router.get('/support/package/list', checkSudoPermission(), SupportCtrl.getSupportPackageList);

export { router };
