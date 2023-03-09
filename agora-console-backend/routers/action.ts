import * as Router from 'koa-router';
import { authUser } from '../controller/auth';
import * as FinanceCtrl from '../controller/finance';
import * as AccountCtrl from '../controller/account';
import * as GoodsCtrl from '../controller/goods';

const router = new Router({ prefix: '/action' });

router.get('/signout', AccountCtrl.exit);
router.get('/recharge', authUser, FinanceCtrl.accountRecharge);
router.get('/package/recharge', authUser, FinanceCtrl.packageRecharge);
router.get('/marketplace/recharge', authUser, FinanceCtrl.marketplacePackageRecharge);
router.get('/goods/order/recharge', authUser, GoodsCtrl.OrderRecharge);

export { router };
