import * as Router from 'koa-router';
import { authUser } from '../controller/auth';
import { searchArticle } from '../controller/Article';

const router = new Router({ prefix: '/api/v2' });
router.use(authUser);

router.post('/article/search', searchArticle);

export { router };
