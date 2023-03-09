import * as Router from 'koa-router';
import * as ReceiptCtrl from '../controller/receipt';
import { checkReadPermission, checkSudoPermission } from '../controller/checkPermission';

import { authUser } from '../controller/auth';

const router = new Router({ prefix: '/api/v2' });
router.use(authUser);
const MODULE_NAME = 'FinanceCenter';
router.use(checkReadPermission(MODULE_NAME));

router.get('/receipt/setting', ReceiptCtrl.getReceiptSetting);
router.get('/receipt/info', ReceiptCtrl.getReceiptInfo);
router.get('/receipts', ReceiptCtrl.getReceiptList);
router.post('/receipt/setting/person', checkSudoPermission(), ReceiptCtrl.setPersonSetting);
router.post('/receipt/setting/enterprise', checkSudoPermission(), ReceiptCtrl.setEnterpriseSetting);
router.post('/receipt/apply', checkSudoPermission(), ReceiptCtrl.applyReceipt);

export { router };
