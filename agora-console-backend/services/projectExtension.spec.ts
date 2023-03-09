import * as assert from 'assert';
import 'mocha';
import { getActivedExtensionList } from './projectExtension';
import { createConnections } from 'typeorm';
import { config } from '../config';

describe('test projectExtension.spec.ts', () => {
  before(async()=>{
  })
  it('extension-list', async () => {
    await createConnections(Object.values(config.mysql));
    const area = 'CN'
    const ret = await getActivedExtensionList(area);
    console.info(ret);
    assert.ok(!!ret)
  });
});
