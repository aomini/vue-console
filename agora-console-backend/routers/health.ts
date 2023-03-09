import * as Router from 'koa-router';
import { getConnection } from 'typeorm';

const router = new Router();

router.get('/api/v2/health', (ctx) => {
  ctx.body = {
    msg: 'OK',
    timestamp: Date.now()
  };
});

router.get('/api/v2/health/db/console', async (ctx) => {
  ctx.body = await getConnection().query('select 1');
});

router.get('/api/v2/health/db/console_access', async (ctx) => {
  ctx.body = await getConnection('web_logs_db').query('select 2');
});

export { router };
