import * as Router from 'koa-router';
import * as ProjectCtrl from '../controller/project';
import * as TokenCtrl from '../controller/token';

const router = new Router({ prefix: '/api/v2' });

router.get('/app-decrypt', TokenCtrl.decryptAppToken);

router.get('/sign-decrypt', TokenCtrl.decryptSignToken);

router.get('/project/token-record/:signId', TokenCtrl.getUrlSignRecord);

router.put('/project/:projectId/enableCertificate', ProjectCtrl.enableCertificate);

export { router };
