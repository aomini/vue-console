import * as Router from 'koa-router';
import { authUser } from '../controller/auth';
import * as SearchCtrl from '../controller/search';

const router = new Router({ prefix: '/api/v2' });
router.use(authUser);

router.post('/test/search', SearchCtrl.consoleSearch);

export { router };
