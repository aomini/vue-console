// const config = require('./config');

import * as log4js from 'log4js';
const isDev = process.env.NODE_ENV === 'development';

let pattern = '[%x{reqid}] [%d{ISO8601_WITH_TZ_OFFSET}] [%x{ip}] [%p] [%x{user}] %m%n';
if (isDev) {
  pattern = '%[[%x{reqid}] [%d{ISO8601_WITH_TZ_OFFSET}] [%x{ip}] [%p] [%x{user}]%] %m%n';
}
log4js.configure({
  pm2: true,
  appenders: {
    out: {
      type: isDev ? 'console' : 'stdout',
      layout: {
        type: 'pattern',
        pattern: pattern,
        tokens: {
          reqid(logEvent) {
            if (logEvent.context.reqid) {
              return logEvent.context.reqid;
            }
            return '';
          },
          user(logEvent) {
            if (logEvent.context.user) {
              return logEvent.context.user;
            }
            return '';
          },
          ip(logEvent) {
            if (logEvent.context.ip) {
              return logEvent.context.ip;
            }
            return '';
          }
        }
      }
    }
  },
  categories: {
    default: {
      appenders: ['out'],
      level: 'info'
    }
  }
});

export const Logger = () => {
  return log4js.getLogger();
};
