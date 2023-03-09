import * as assert from 'assert';
import 'mocha';
import { getConnection } from "typeorm";
import * as AccountService from './account';
import { getMainAccountByCompanyId, getMemberAccountByCompanyId } from './account';
import { Account } from '../models/account'
import { Company } from '../models/company'
import { UserProfile, TUser } from '../models/user'
let testCompanyId;
let testuserid;
let testEmail;


describe('account-service', () => {
  before(async()=>{
    let account = new Account()
    account.email = 'test@agora.io'
    account.level = 1
    account.status = 1
    await account.save()
    testEmail = account.email
    let company = new Company()
    company.name = 'test'
    company.description = 'test'
    company.industry = 'test'
    company.interest = 'test'
    company.country = 'cn'
    company.environment = 'test'
    company.apiKey = 'test'
    company.apiSecret = 'test'
    company.appLimit =1
    await company.save()
    testCompanyId = company.id
    let user = new UserProfile()
    user.id = account.id
    user.language = 'chinese'
    user.firstName = 'first'
    user.lastName = 'last'
    user.companyId = company.id
    await user.save()
    let member = new TUser()
    member.firstName = 'test member'
    member.language = 'chinese'
    member.lastName = 'test memeber'
    member.companyId = testCompanyId
    await member.save()
    testuserid = member.id
  })
  describe('get account info', () => {
    it('main account', async () => {
      const user = await AccountService.getMainAccountByCompanyId(testCompanyId)
      assert.notEqual(user, undefined)
      const user1 = await AccountService.getMainAccountByCompanyId(-1)
      assert.equal(user1, undefined)
    });
    it('member account', async () => {
      let user = await AccountService.getMemberAccountByCompanyId(testCompanyId, testuserid)
      assert.notEqual(user, undefined)
      user = await AccountService.getMemberAccountByCompanyId(testCompanyId, -1)
      assert.equal(user, undefined)
      user = await AccountService.getMemberAccountByCompanyId(-1, -1)
      assert.equal(user, undefined)
    })
  });
  describe('update account info', () => {
    it('update main account info', async () => {
      await AccountService.updateMainAccountInfo(testCompanyId, 'test last name', 'test first name', 'test company name')
      const user = await AccountService.getMainAccountByCompanyId(testCompanyId)
      assert.equal(user.firstName, 'test first name')
      assert.equal(user.lastName, 'test last name')
      assert.equal(user.company.name, 'test company name')
    });
    it('update member account info', async () => {
      await AccountService.updateMemberAccountInfo(testuserid, 'test last name', 'test first name')
      const user = await AccountService.getMemberAccountByCompanyId(testCompanyId, testuserid)
      assert.equal(user.firstName, 'test first name')
      assert.equal(user.lastName, 'test last name')
    });
  });
  describe('update account preference', () => {
    it ('update main account preference', async () => {
      await AccountService.updateMainAccountPreference(testCompanyId, 'english', '3', '1', '3')
      const user = await AccountService.getMainAccountByCompanyId(testCompanyId)
      assert.equal(user.language, 'english')
      assert.equal(user.company.interest, '3')
      assert.equal(user.company.environment, '1')
      assert.equal(user.company.industry, '3')
    });
    it ('update member account preference', async () => {
      await AccountService.updateMemberAccountPreference(testuserid, 'english')
      const user = await AccountService.getMemberAccountByCompanyId(testCompanyId, testuserid)
      assert.equal(user.language, 'english')
    });
  });
  describe('update account password', () => {
    it ('update main account password', async () => {
      await AccountService.setMainAccountPassword(testEmail, 'test')
      const compareRight = AccountService.checkAccountPassword(testEmail, 'test', false)
      assert.equal(compareRight, true)
      const compareWrong = AccountService.checkAccountPassword(testEmail, 'wrong password', false)
      assert.equal(compareWrong, false)
    });
    it ('update member account password', async () => {
      await AccountService.setMemberAccountPassword(testEmail, 'test')
      const compareRight = AccountService.checkAccountPassword(testEmail, 'test', true)
      assert.equal(compareRight, true)
      const compareWrong = AccountService.checkAccountPassword(testEmail, 'wrong password', true)
      assert.equal(compareWrong, false)
    });
  })
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
      .from(UserProfile)
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
