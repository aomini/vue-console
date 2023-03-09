import * as assert from 'assert';
import 'mocha';
import { getConnection } from "typeorm";
import { getMembersByCompany, getMemberByEmail, checkMemberEmail, checkMemberLimit, createOrUpdateMember, deleteMember } from './member';
import { TUser } from '../models/user'
import { Company } from '../models/company'
import { Account } from '../models/account'
let testCompanyId;
let testRoleId;
let testRoleId2;

describe('member-service', () => {
  before(async()=>{
    let account = new Account()
    account.email = 'testAccount@agora.io'
    account.level = 1
    account.status = 1
    await account.save()
    let company = new Company()
    company.country = 'cn'
    company.memberLimit = 10
    await company.save()
    testCompanyId = company.id
    let user = new TUser()
    user.companyId = testCompanyId
    user.email = 'test@agora.io'
    user.language = 'chinese'
    await user.save()
  })
  describe('get member', () => {
    it('get members by company', async () => {
      const members = await getMembersByCompany(testCompanyId)
      assert.notEqual(members, undefined)
      const member = await getMemberByEmail('test@agora.io')
      assert.notEqual(member, undefined)
    });
  });

  describe('create, update or delete member', () => {
    it('create new member', async () => {
      const newMember = await createOrUpdateMember('newMember@aogra.io', testRoleId, 'chinese', testCompanyId)
      assert.notEqual(newMember, undefined)
      const member = await getMemberByEmail('newMember@aogra.io')
      assert.notEqual(member, undefined)
    });
    it('update an existing member', async () => {
      const existingMember = await createOrUpdateMember('test@agora.io', testRoleId2, 'chinese', testCompanyId)
      assert.equal(existingMember.role.id, testRoleId2)
    });
    it('remove an existing member', async () => {
      const removedMember = await deleteMember('test@agora.io')
      assert.notEqual(removedMember, undefined)

      const member = await getMemberByEmail('test@agora.io')
      assert.equal(member, undefined)
    });
  });

  describe('member info check', () => {
    it('check member email', async () => {
      const check1 = await checkMemberEmail('testAccount@agora.io')
      assert.equal(check1, false)
      const check2 = await checkMemberEmail('test@agora.io')
      assert.equal(check2, false)
      const check3 = await checkMemberEmail('new@agora.io')
      assert.equal(check3, true)
    });
    it('check member limit', async () => {
      const check1 = await checkMemberLimit(testCompanyId, 0)
      assert.equal(check1, true)
      const check2 = await checkMemberLimit(testCompanyId, 2)
      assert.equal(check2, false)
    });
  });

  after(async() => {
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Account)
      .where("id > :id", { id: 0 })
      .execute();
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Company)
      .where("id > :id", { id: 0 })
      .execute();
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(TUser)
      .where("user_id > :id", { id: 0 })
      .execute();
  })
});
