import * as Router from 'koa-router';
import * as CocosCtrl from '../controller/cocos';

const router = new Router({ prefix: '/api/v2' });

router.get('/cocos/service/switch', CocosCtrl.switchService);

export { router };
