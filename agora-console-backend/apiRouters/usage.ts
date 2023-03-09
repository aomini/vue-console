import * as Router from 'koa-router';
import * as UsageCtrl from '../apiController/usage';

const router = new Router({ prefix: '/api/v2' });

router.get('/usage/vendors', UsageCtrl.getVendorList);
router.get('/service/group-vid', UsageCtrl.getVendorGroups);
router.get('/usage/project-info', UsageCtrl.getProjectsByVids);

export { router };
