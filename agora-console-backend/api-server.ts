import * as Koa from 'koa';
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
import { config, init as ConfigInit } from './config';
import { router } from './apiRouters';
import { MysqlStore, externalKey, genid } from './services/sessionstore';

// Load environment variables from .env file, where API keys and passwords are configured
// dotenv.config({ path: '.env' });

// create connection with database
// note that its not active database connection
// TypeORM creates you connection pull to uses connections from pull on your requests
ConfigInit().then(() => {
  const app = new Koa();

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

  // catch exception
  app.use(catchInject());

  // Enable bodyParser with default options
  app.use(bodyParser());

  // JWT middleware -> below this line routes are only reached if JWT token is valid, secret as env variable
  // app.use(jwt({ secret: config.jwtSecret }));

  // this routes are protected by the JWT middleware, also include middleware to respond with "Method Not Allowed - 405".
  // app.use(router.routes()).use(router.allowedMethods());
  router(app);

  app.listen(parseInt(process.env.SERVERPORT, 10));

  console.log(`Server running on port ${parseInt(process.env.SERVERPORT, 10)}`);

}).catch(error => console.log('TypeORM connection error: ', error));
