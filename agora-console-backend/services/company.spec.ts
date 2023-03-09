import 'mocha';
import { Company } from '../models/company';
import * as assert from 'assert';
import { getConnection } from 'typeorm';
import { getCompanyById, } from './company';

describe('company', () => {
  before(async()=>{
    let company = new Company()
    company.id = 1
    company.name = 'test'
    company.status = 1
    await company.save()
  })
  describe('get-company-info', () => {
    it('get-company-info', async () => {
      const ret = await getCompanyById(1);
      assert.equal(ret.id, 1);
      assert.equal(ret.name, 'test')
      assert.equal(ret.status, 1)
    });
  })
  after(async() => {
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Company)
      .where("id > :id", { id: 0 })
      .execute();
  })
})