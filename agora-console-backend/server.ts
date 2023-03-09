import * as Koa from 'koa';
import * as Http from 'http';

// import * as jwt from 'koa-jwt';
import * as bodyParser from 'koa-bodyparser';
import * as helmet from 'koa-helmet';
// import * as cors from '@koa/cors';
// import * as dotenv from 'dotenv';
// import { createConnection } from 'typeorm';
import * as session from 'koa-session';
import 'reflect-metadata';

import { logMiddle } from './middlewares/log';
import { catchInject } from './middlewares/catch';
// import { csrfMiddleware } from './middlewares/csrf';
// import accessLog from './middlewares/accessLog';
import { config, init as ConfigInit } from './config';
import { router, routerWithoutCsrf } from './routers';
import { MysqlStore, externalKey, genid } from './services/sessionstore';
import { ConsoleAlert } from './externalService/ConsoleAlert';
import { Logger } from './logging';
import { WebApplication } from './services/system/Application';

// Load environment variables from .env file, where API keys and passwords are configured
// dotenv.config({ path: '.env' });

// create connection with database
// note that its not active database connection
// TypeORM creates you connection pull to uses connections from pull on your requests
ConfigInit().then(() => {
  const app = new Koa();
  const server = new Http.Server(app.callback());

  app.keys = [ 'a', 'b' ];
  const options = {
    store: new MysqlStore(),
    externalKey: externalKey,
    genid: genid,
    maxAge: config.cookie.maxAge
  };

  // Provides important security headers to make your app more secure
  app.use(helmet());
  app.use(session(options, app));
  // Enable cors with default options
  // app.use(cors());

  // Logger middleware -> use winston as logger (logging.ts with config)
  app.use(logMiddle());

  // app.use(accessLog);

  // catch exception
  app.use(catchInject());

  // Enable bodyParser with default options
  app.use(bodyParser());

  routerWithoutCsrf(app);

  // app.use(csrfMiddleware());

  // JWT middleware -> below this line routes are only reached if JWT token is valid, secret as env variable
  // app.use(jwt({ secret: config.jwtSecret }));

  // this routes are protected by the JWT middleware, also include middleware to respond with "Method Not Allowed - 405".
  // app.use(router.routes()).use(router.allowedMethods());
  router(app);

  server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    const appInfo = WebApplication.appInfo;
    const logger = Logger();
    const infos = [`[${appInfo.codeVersion}][${appInfo.tags.join(', ')}] Console Server launched.`];
    ConsoleAlert.notify(logger, infos.join('\n'));
  });

}).catch(error => {
  const logger = Logger();
  console.error('TypeORM connection error: ', error);
  ConsoleAlert.notify(logger, `健康检查有误. ${error.message}`);
});
