import * as Router from 'koa-router';
import * as restfulApiCtrl from '../controller/restfulApi';
import { authUser } from '../controller/auth';
import { checkSudoPermission, checkAuthenticationPermission } from '../controller/checkPermission';

const router = new Router({ prefix: '/api/v2' });
router.use(authUser);

router.get('/restful-api/keys/own', checkSudoPermission(), restfulApiCtrl.getRestfulKeysByCompany);

router.get('/restful-api/keys-limit', checkSudoPermission(), restfulApiCtrl.getRestfulKeyLimitByCompany);

router.get('/restful-api/keys/download/:key', checkSudoPermission(), restfulApiCtrl.downloadRestfulKey);

router.post('/restful-api/keys', checkAuthenticationPermission(), checkSudoPermission(), restfulApiCtrl.createRestfulKey);

router.delete('/restful-api/keys/:key', checkSudoPermission(), restfulApiCtrl.deleteRestfulKey);

export { router };
