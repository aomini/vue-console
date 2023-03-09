import * as Koa from 'koa';

import { router as usageRoutes } from './usage';
import { router as notificationRoutes } from './notification';
import { router as accountRoutes } from './account';
import { router as receiptRoutes } from './receipt';
import { router as companyRoutes } from './company';
import { router as marketplaceRoutes } from './marketplace';
import { router as healthRouter } from '../routers/health';

export const router = (app: Koa) => {
  app.use(accountRoutes.routes());
  app.use(usageRoutes.routes());
  app.use(notificationRoutes.routes());
  app.use(receiptRoutes.routes());
  app.use(companyRoutes.routes());
  app.use(marketplaceRoutes.routes());
  app.use(healthRouter.routes());
};
