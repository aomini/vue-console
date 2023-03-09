
import * as log4js from 'log4js';

declare module "Koa" {
  interface Context {
    logger: log4js.Logger;
  }
}