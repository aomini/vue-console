
import 'mocha'
import * as assert from 'assert'
import * as Koa from 'koa';
import * as moxios from 'moxios';
import * as supertest from 'supertest'
import { router } from '../routers';
import { MysqlStore, externalKey, genid } from '../services/sessionstore';
import * as session from 'koa-session';
import * as bodyParser from 'koa-bodyparser';

import { logMiddle } from '../middlewares/log';
import { catchInject } from '../middlewares/catch';

const mockApp = () => {
  const app = new Koa()
  const options = {
    store: new MysqlStore(),
    externalKey: externalKey,
    genid: genid,
    maxAge: 864000
  };
  app.use(session(options, app));

  app.use(logMiddle());
  app.use(catchInject());
  app.use(bodyParser());
  router(app);
  return app
}
moxios.stubRequest('https://sso-staging.agora.io/oauth/token', {
  status: 200,
  response: {
    access_token:"64d9c06d08394d5ed254362367cf297db48614ca",
    expires_in:7199,
    refresh_token:"e92b649155cd72f37a44eb72fcaa20999824f2b6",
    scope:"read",
    token_type:"Bearer"
  }
})
moxios.stubRequest('https://sso-staging.agora.io/api/userInfo', {
  status: 200,
  response: {
    accountId: 1,
    email: "g-beckon@agora.io",
    displayName: "Beckon",
    language: "english",
    companyId: 1
  }
})
let server;
let request;
describe('auth user', () => {
  before(() => {
    server = mockApp().listen(30000)
    request = supertest(server)
    moxios.install()
  })
  after(() => {
    server.close()
    moxios.uninstall()
  })
  describe('agora oauth2', () => {
    it('get token', async () => {
      let ret = await request.get('/api/v2/oauth?code=xxxxxxx')
      assert.equal(ret.statusCode, 302)
      ret = await request.get('/api/v2/userInfo')
      assert.equal(ret.statusCode, 401)
    });
  });
  after(async()=>{
  })
});