import * as Router from 'koa-router';
import * as PackageCtrl from '../controller/packages';
import * as FinanceCtrl from '../controller/finance';
import { authUser } from '../controller/auth';
import { checkSudoPermission } from '../controller/checkPermission';

const router = new Router({ prefix: '/api/v2' });

router.use(authUser);

router.get('/package/minPackage/company', PackageCtrl.getMinPackageByCompany);
router.get('/package/minPackage/list', PackageCtrl.getMinPackageList);
router.get('/package/usagePackage', FinanceCtrl.getCompanyUsagePackages);
router.get('/package/minPackage/voucher/check', PackageCtrl.checkVoucher);
router.get('/package/marketplacePackage/:serviceName/list', PackageCtrl.getMarketplacePackageList);
router.get('/package/marketplacePackage/:packageId/info', checkSudoPermission(), PackageCtrl.getMarketplacePackageInfo);
router.get('/package/marketplacePackage/:serviceName/purchased', checkSudoPermission(), PackageCtrl.getCompanyProductMarketplacePackage);

export { router };
