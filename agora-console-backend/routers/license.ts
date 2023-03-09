import * as Router from 'koa-router';
import { authUser } from '../controller/auth';
import * as LicenseCtrl from '../controller/license';

const router = new Router({ prefix: '/api/v2' });
router.use(authUser);

router.get('/license/config', LicenseCtrl.getCompanyLicenseConfig);
router.get('/license/usage', LicenseCtrl.getCompanyLicenseUsage);
router.get('/license/apply', LicenseCtrl.getCompanyApplyOrderHistory);
router.get('/license/renew', LicenseCtrl.getCompanyRenewOrderHistory);
router.get('/license/info/export', LicenseCtrl.exportCompanyLicenseInfo);
router.get('/license/:pid/quota', LicenseCtrl.getCompanyProductLicenseQuota);
router.post('/license/quota', LicenseCtrl.postLicenseQuota);

export { router };
