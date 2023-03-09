import * as assert from 'assert';
import { getConnection } from 'typeorm';

import { MysqlStore, externalKey } from './sessionstore';
import { Session } from '../models/sesson';

describe('session-store', () => {
  describe('mysql-store', () => {
    it('get session', async () => {
      const store = new MysqlStore()
      let a = await store.get('local-abc')
      assert.equal(a, undefined)
      await store.set('local-abc', { _expire: + new Date(), key: 1 })
      a = await store.get('local-abc')
      assert.equal(a, undefined)
      await store.set('local-abcd', { _expire: + new Date() + 864000, key: 1 })
      a = await store.get('local-abcd')
      assert.notEqual(a, undefined)
      assert.equal(a.key, 1)
    });
  });
  after(async()=>{
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Session)
      .where("1=1")
      .execute();
  })
});
