import * as Router from 'koa-router';
import * as CredentialsController from '../controller/authenticationCredentials';
import { authUser } from '../controller/auth';

const router = new Router({ prefix: '/api/v2' });

router.use(authUser);
router.get('/credentials', CredentialsController.getCredentials);
router.post('/credential', CredentialsController.createCredential);
router.get('/credential/:key/download', CredentialsController.downloadCredential);
router.delete('/credential/:key', CredentialsController.deleteCredential);

export { router };
