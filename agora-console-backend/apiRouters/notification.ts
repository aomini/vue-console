import * as Router from 'koa-router';
import * as NotificationCtrl from '../apiController/notification';

const router = new Router({ prefix: '/api/v2/notification' });

router.get('/setting', NotificationCtrl.getMessageSetting);
router.get(`/setting/:companyId`, NotificationCtrl.getCompanySettings);

export { router };
