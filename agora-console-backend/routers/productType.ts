import * as Router from 'koa-router';
import * as ProductTypeCtrl from '../controller/productType';
import { authUser } from '../controller/auth';

const router = new Router({ prefix: '/api/v2' });

router.use(authUser);

router.get('/product-type', ProductTypeCtrl.getProductTypeList);
router.get('/regist-source', ProductTypeCtrl.getRegistSource);
router.get('/extension-metadata', ProductTypeCtrl.getExtensionMetadata);

export { router };
