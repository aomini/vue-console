import * as Router from 'koa-router';
import * as AnalyticsCtrl from '../controller/analytics';
import { authUser } from '../controller/auth';
import { checkReadPermission } from '../controller/checkPermission';

const router = new Router({ prefix: '/api/analytics' });

router.use(authUser);
router.use(checkReadPermission('AgoraAnalytics'));

router.get('/research', AnalyticsCtrl.research);

export { router };
