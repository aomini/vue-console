import * as Router from 'koa-router';
import * as ReceiptCtrl from '../apiController/receipt';

const router = new Router({ prefix: '/api/v2' });

router.post('/external/receipt/apply', ReceiptCtrl.applyReceipt);

export { router };
