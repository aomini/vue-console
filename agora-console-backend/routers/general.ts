import * as Router from 'koa-router';
import { authUser } from '../controller/auth';
import * as FinanceCtrl from '../controller/finance';

const router = new Router({ prefix: '/api/v2' });

router.use(authUser);

router.get('/finance/life-cycle', FinanceCtrl.getLifeCycle);
router.get('/finance/life-cycle-config', FinanceCtrl.getLifeCycleConfig);
export { router };
