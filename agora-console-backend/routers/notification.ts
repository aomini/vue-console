import * as Router from 'koa-router';
import * as NotificationCtrl from '../controller/notification';
import { authUser } from '../controller/auth';
import { checkSudoPermission } from '../controller/checkPermission';

const router = new Router({ prefix: '/api/v2' });

router.use(authUser);

router.get('/notifications', NotificationCtrl.getNotifications);
router.post('/notifications/setting', checkSudoPermission(), NotificationCtrl.setNotificationSetting);

export { router };
