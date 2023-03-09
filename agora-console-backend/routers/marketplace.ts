import * as Router from 'koa-router';
import * as MarketplaceCtrl from '../controller/marketplace';
import { authUser } from '../controller/auth';
import { checkReadPermission } from '../controller/checkPermission';

const router = new Router({ prefix: '/api/v2/marketplace' });

router.use(authUser);
const MODULE_NAME = 'FinanceCenter';
router.use(checkReadPermission(MODULE_NAME));

router.get('/vendor/list', MarketplaceCtrl.getVendorList);
router.get('/vendor/:serviceName', MarketplaceCtrl.getVendorInfo);
router.get('/extension/list', MarketplaceCtrl.getExtensionList);
router.get('/extension/:serviceName', MarketplaceCtrl.getExtensionInfo);
router.post('/extension/:serviceName', MarketplaceCtrl.launchExtension);
router.put('/extension/:serviceName', MarketplaceCtrl.updateExtensionInfo);
router.post('/customer/:serviceName', MarketplaceCtrl.createCustomer);
router.delete('/customer/:serviceName', MarketplaceCtrl.deleteCustomer);
router.get('/company/purchased', MarketplaceCtrl.getCompanyPurchased);
router.get('/company/:serviceName/projects', MarketplaceCtrl.getCompanyProductProjects);
router.get('/company/:serviceName/packages', MarketplaceCtrl.getCompanyServicePackage);
router.get('/appId/:appId/serviceName/:serviceName/secret', MarketplaceCtrl.getAppSecret);
router.post('/appId/:appId/serviceName/:serviceName/secret', MarketplaceCtrl.createAppSecret);
router.post('/company/apply', MarketplaceCtrl.createVendorApply);
router.post('/company/:serviceName', MarketplaceCtrl.launchProjectService);
router.post('/v2/company/:serviceName', MarketplaceCtrl.launchProjectServiceV2);
router.delete('/company/:serviceName', MarketplaceCtrl.closeProjectService);
router.get('/package/marketplacePackage/:serviceName/list', MarketplaceCtrl.getMarketplacePackageList);
router.get('/plan/:serviceName/list', MarketplaceCtrl.getPlanList);
router.post('/license/:serviceName/activated', MarketplaceCtrl.activatedLicense);
router.post('/license/:serviceName/list', MarketplaceCtrl.getLicenseList);
router.post('/sdk-deliver/:serviceName/activated', MarketplaceCtrl.launchProjectSDKDeliver);
router.delete('/sdk-deliver/:serviceName', MarketplaceCtrl.closeProjectSDKDeliver);
router.get('/usage', MarketplaceCtrl.getUsage);
router.get('/company/apply/list', MarketplaceCtrl.getVendorApplyList);
router.get('/company/apply/:id', MarketplaceCtrl.getVendorApplyInfo);
router.put('/company/apply/:id', MarketplaceCtrl.updateVendorApply);
router.get('/notice', MarketplaceCtrl.getNoticeInfo);

export { router };
