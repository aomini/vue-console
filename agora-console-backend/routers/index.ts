import * as Koa from 'koa';

import { router as ProjectRoutes } from './projects';
import { router as MessageRoutes } from './message';
import { router as OAuthRoutes } from './oauth';
import { router as OAuth2Routes } from './oauth2';
import { router as FinanceRoutes } from './finance';
import { router as ActionRoutes } from './action';
import { router as MemberRoutes } from './member';
import { router as PermissionRoutes } from './permission';
import { router as GeneralRoutes } from './general';
import { router as SupportRoutes } from './support';
import { router as ThirdPartner } from './thirdPartner';
import { router as AccountRoutes } from './account';
import { router as ExternalRoutes } from './external';
import { router as AnalyticsRoutes } from './analytics';
import { router as UsageRoutes } from './usage';
import { router as OldRoutes } from './oldRoutes';
import { router as IdentityRoutes } from './identity';
import { router as ReceiptRoutes } from './receipt';
import { router as ToExternalRoutes } from './toExternal';
import { router as NotificationRoutes } from './notification';
import { router as AccountVerify } from './accountVerify';
import { router as PackageManagementRouter } from './packageManagement';
import { router as PackageRouter } from './package';
import { router as TwoFactorRouter } from './twoFactor';
import { router as VerificationRouter } from './verification';
import { router as restfulApiRouter } from './restfulApi';
import { router as healthRouter } from './health';
import { router as XLARouter } from './XLA';
import { router as marketplaceRouter } from './marketplace';
import { router as AuthenticationCredentialsRouter } from './authenticationCredentials';
import { router as netlessRouter } from './netless';
import { router as goodsRouter } from './goods';
import { router as ArticleRouter } from './article';
import { router as AgoraChatRouter } from './agora-chat';
import { router as ProductTypeRouter } from './productType';
import { router as SsoManagementRouter } from './ssoManagement';
import { router as LicenseRouter } from './license';
import { router as SearchRouter } from './search';

export const router = (app: Koa) => {
  app.use(OAuthRoutes.routes());
  app.use(ProjectRoutes.routes());
  app.use(MessageRoutes.routes());
  app.use(FinanceRoutes.routes());
  app.use(restfulApiRouter.routes());
  app.use(AuthenticationCredentialsRouter.routes());
  app.use(ActionRoutes.routes());
  app.use(MemberRoutes.routes());
  app.use(PermissionRoutes.routes());
  app.use(GeneralRoutes.routes());
  app.use(SupportRoutes.routes());
  app.use(ThirdPartner.routes());
  app.use(AccountRoutes.routes());
  app.use(AnalyticsRoutes.routes());
  app.use(UsageRoutes.routes());
  app.use(IdentityRoutes.routes());
  app.use(ReceiptRoutes.routes());
  app.use(NotificationRoutes.routes());
  app.use(AccountVerify.routes());
  app.use(PackageManagementRouter.routes());
  app.use(PackageRouter.routes());
  app.use(TwoFactorRouter.routes());
  app.use(VerificationRouter.routes());
  app.use(XLARouter.routes());
  app.use(marketplaceRouter.routes());
  app.use(netlessRouter.routes());
  app.use(goodsRouter.routes());
  app.use(ArticleRouter.routes());
  app.use(AgoraChatRouter.routes());
  app.use(ProductTypeRouter.routes());
  app.use(SsoManagementRouter.routes());
  app.use(LicenseRouter.routes());
  app.use(SearchRouter.routes());
};

export const routerWithoutCsrf = (app: Koa) => {
  app.use(OldRoutes.routes());
  app.use(ToExternalRoutes.routes());
  app.use(ExternalRoutes.routes());
  app.use(OAuth2Routes.routes());
  app.use(healthRouter.routes());
};