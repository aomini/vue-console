
import * as Router from 'koa-router';
import { authUser } from '../controller/auth';
import * as FinanceCtrl from '../controller/finance';
import {
  checkReadPermission,
  checkSudoPermission,
  checkAuthenticationPermission,
  checkTwoStepVerificationPermission
} from '../controller/checkPermission';

const router = new Router({ prefix: '/api/v2/finance' });

router.use(authUser);
const MODULE_NAME = 'FinanceCenter';
router.use(checkReadPermission(MODULE_NAME));
router.use(checkSudoPermission());

router.get('/cashInfo', FinanceCtrl.getCashInfo);
router.get('/transactions', FinanceCtrl.getTransactions);
router.get('/transactions/export', FinanceCtrl.exportTransactions);
router.get('/billings', FinanceCtrl.getBillings);
router.get('/once-bills', FinanceCtrl.getOnceBills);
router.get('/extension/once-bills', FinanceCtrl.getExtensionOnceBills);
router.get('/billings/export', FinanceCtrl.exportBillings);
router.get('/billings/:billId/download', FinanceCtrl.downloadBilling);
router.get('/billings/once-bills/:billId/download', FinanceCtrl.downloadOnceBills);
router.get('/billings/:billId/download/reconciliation', FinanceCtrl.downloadBillingReconciliation);
router.get('/receipt/billings', FinanceCtrl.getBillingForReceipt);
router.get('/pricing', FinanceCtrl.getCompanyPricing);
router.post('/billings/once-bill', checkAuthenticationPermission(), FinanceCtrl.balancePayThenCreateOnceBill);
router.post('/billings/package/once-bill', checkAuthenticationPermission(), FinanceCtrl.balancePayMinPackage);
router.post('/billings/marketplace-package/once-bill', checkAuthenticationPermission(), FinanceCtrl.balancePayMarketplacePackage);
router.post('/billings/package/purchase', checkAuthenticationPermission(), FinanceCtrl.balancePayMinPackageByToken);
router.post('/billings/marketplace-package/purchase', checkAuthenticationPermission(), FinanceCtrl.balancePayMarketplacePackageByToken);
router.put('/billings/package/ali-notify', FinanceCtrl.aliDepositNotify);

router.get('/creditCard/cards', FinanceCtrl.getCardList);
router.post('/creditCard/cards', FinanceCtrl.addCard);
router.post('/creditCard/charge', checkTwoStepVerificationPermission(), FinanceCtrl.cardCharge);
router.post('/creditCard/charge/createOnceBill', FinanceCtrl.cardChargeThenCreateOnceBill);
router.post('/creditCard/package/charge/createOnceBill', FinanceCtrl.cardChargeThenCreateMinOnceBill);
router.put('/creditCard/cards/:cardId/default', FinanceCtrl.setCardDefault);
router.delete('/creditCard/cards/:cardId', FinanceCtrl.deleteCard);

router.get('/refunds', FinanceCtrl.getCompanyRefunds);
router.post('/refunds', checkTwoStepVerificationPermission(), FinanceCtrl.postRefunds);
router.post('/refunds/preview', FinanceCtrl.getRefundsPreview);
router.get('/setting', FinanceCtrl.getCompanyFinanceSetting);

router.get('/sg-company', FinanceCtrl.checkSGCompany);
export { router };
