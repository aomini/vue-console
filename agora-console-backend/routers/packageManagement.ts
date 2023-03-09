import * as Router from 'koa-router';
import * as PackageManagementCtrl from '../controller/packageManagement';
import { authUser } from '../controller/auth';
import { checkReadPermission } from '../controller/checkPermission';

const router = new Router({ prefix: '/api/v2/package-management' });

router.use(authUser);

const MODULE_NAME = 'FinanceCenter';
router.use(checkReadPermission(MODULE_NAME));

router.get('/list', PackageManagementCtrl.getPackageManagementList);
router.get('/bill/:billId/download', PackageManagementCtrl.packageManagementBillDownload);
router.get('/export', PackageManagementCtrl.packageManagementBillExport);

router.post('/min', PackageManagementCtrl.createMinPackageManagement);

router.post('/marketplace', PackageManagementCtrl.createMarketplacePackageManagement);
router.get('/marketplace/payment/status', PackageManagementCtrl.checkPaymentByTransationId);
export { router };
