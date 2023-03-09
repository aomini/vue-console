import * as Router from 'koa-router';
import * as MessageCtrl from '../controller/message';
import { authUser } from '../controller/auth';
import { checkSudoPermission } from '../controller/checkPermission';

const router = new Router({ prefix: '/api/v2' });

router.use(authUser);

router.get('/message/site-messages', MessageCtrl.getMessages);
router.get('/message/site-message-count', MessageCtrl.getMessageCount);

router.put('/message/read', checkSudoPermission(), MessageCtrl.readMessage);
router.post('/verifyEmail/sendEmail', checkSudoPermission(), MessageCtrl.sendVerifyEmail);

export { router };
