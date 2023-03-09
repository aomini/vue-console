import * as Router from 'koa-router';
import * as MarketplaceCtrl from '../apiController/marketplace';
import * as InnerMarketplaceCtrl from '../controller/marketplace';

const router = new Router({ prefix: '/api/v2/external/marketplace' });

router.get('/vendors', InnerMarketplaceCtrl.getVendorList);
router.get('/vendor/:serviceName', InnerMarketplaceCtrl.getVendorInfo);
router.get('/package/marketplacePackage/:serviceName/list', MarketplaceCtrl.getMarketplacePackageList);

export { router };
