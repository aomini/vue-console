import * as Router from 'koa-router';
import * as companyCtrl from '../apiController/company';

const router = new Router({ prefix: '/api/v2' });

router.get('/company/restfulKeys', companyCtrl.listRestfulKeys);
router.get('/companies/:id/restfulKeys', companyCtrl.getCompanyRestfulKeys);
router.get('/company/:id/identity', companyCtrl.getCompanyAuthentication);

export { router };
