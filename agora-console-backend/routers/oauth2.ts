import * as Router from 'koa-router';

import { oauth2Callback } from '../controller/auth';

const router = new Router({ prefix: '/api/v2' });

router.get(`/oauth`, oauth2Callback);

export { router };
