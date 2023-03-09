import * as Router from 'koa-router';
import * as ToExternalCtrl from '../controller/toExternal';

const router = new Router({ prefix: '/api/v2' });

router.post('/external/receipt/apply', ToExternalCtrl.applyReceipt);
router.post('/external/verify/sendEmail', ToExternalCtrl.sendVerifyEmail);
router.post('/external/verify/checkEmail', ToExternalCtrl.checkVerifyEmail);
router.get('/external/notification/setting', ToExternalCtrl.getMessageSetting);

router.get('/service/group-vid', ToExternalCtrl.getVendorGroups);

export { router };
