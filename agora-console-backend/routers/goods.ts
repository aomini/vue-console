import * as Router from 'koa-router';
import { authUser } from '../controller/auth';
import * as GoodsCtrl from '../controller/goods';
import { checkSudoPermission } from '../controller/checkPermission';

const router = new Router({ prefix: '/api/v2' });
router.use(authUser);

router.get('/goods/fpa', GoodsCtrl.getFPAGoodsInfo);
router.get('/goods/chat', GoodsCtrl.getChatGoodsInfo);
router.get('/goods/tag/:mutexTag', GoodsCtrl.getGoodsByMutexTag);
router.get('/goods/:goodsId', GoodsCtrl.getGoodsInfo);
router.post('/goods/order', checkSudoPermission(), GoodsCtrl.postGoodsOrderByBalance);
router.get('/goods/company/order', GoodsCtrl.getCompanyOrder);
router.put('/goods/company/subscription/:uid/cancel', checkSudoPermission(), GoodsCtrl.cancelSubscription);
router.post('/goods/company/subscription', checkSudoPermission(), GoodsCtrl.doSubscription);
router.post('/goods/order/prepay', checkSudoPermission(), GoodsCtrl.postGoodsOrderByAliPay);
router.post('/goods/order/alipay', checkSudoPermission(), GoodsCtrl.payAlipayOrderByToken);
router.post('/goods/order/creditCard', checkSudoPermission(), GoodsCtrl.postGoodsOrderByCard);
router.get('/goods/order/currentMonth/check', GoodsCtrl.checkCurrentMonthOrder);

router.get('/goods/company/order/all', GoodsCtrl.getCompanyActiveOrder);
router.get('/goods/company/subscription/all', GoodsCtrl.getCompanyActiveSubscription);
router.get('/goods/order/status', GoodsCtrl.checkOrderStatusByTransationId);
router.post('/goods/order/free', checkSudoPermission(), GoodsCtrl.postFreeOrderAndPay);

export { router };
