import * as assert from 'assert';
import 'mocha';
import { getConnection } from "typeorm";
import * as IdentityService from './identity';
import { CompanyAuthentication, PersonIdentity, CompanyIdentity } from '../models/identity';
import { ListParams } from '../models/listReply';

let testpersonCompanyId = 1;
let testEnterpriseCompanyId = 2;

describe('identity-service', () => {
  before(async()=>{
    const authtication = new CompanyAuthentication();
    const personIdentity = new PersonIdentity();
    authtication.companyId = testpersonCompanyId;
    authtication.identityType = 1;
    authtication.status = 0;
    await CompanyAuthentication.save(authtication)
    personIdentity.companyId = testpersonCompanyId;
    personIdentity.name = 'test';
    personIdentity.number = 'test';
    personIdentity.facePhotoId = 'test';
    personIdentity.backPhotoId = 'test';
    personIdentity.submitTime = 'test';
    personIdentity.status = 0;
    await PersonIdentity.save(personIdentity);

    const enterpriseAuth = new CompanyAuthentication();
    enterpriseAuth.companyId = testEnterpriseCompanyId;
    enterpriseAuth.identityType = 0;
    enterpriseAuth.status = 0;
    await CompanyAuthentication.save(enterpriseAuth);
    const enperpriseIdentity = new CompanyIdentity();
    enperpriseIdentity.name = 'test';
    enperpriseIdentity.creditCode = 'test'; 
    enperpriseIdentity.address = 'test';
    enperpriseIdentity.phone = 'test';
    enperpriseIdentity.licensePhoto = 'licensePhoto';
    enperpriseIdentity.legalPersonName = 'legalPersonName';
    enperpriseIdentity.legalPersonNumber = 'legalPersonNumber';
    enperpriseIdentity.operatorName = 'operatorName';
    enperpriseIdentity.operatorNumber = 'operatorNumber';
    enperpriseIdentity.status = 0;
    await CompanyIdentity.save(enperpriseIdentity);
  });
  describe('get identity info', () => {
    it('get person identity', async () => {
      const personIdentity = await IdentityService.getCompanyAuthentication(testpersonCompanyId);
      assert.notEqual(personIdentity, undefined);
      const personIdentity1 = await IdentityService.getCompanyAuthentication(-1);
      assert.equal(personIdentity1, undefined);
    });
    it('get enterprise identity', async () => {
      const enterpriseIdentity = await IdentityService.getCompanyAuthentication(testEnterpriseCompanyId);
      assert.notEqual(enterpriseIdentity, undefined);
      const enterpriseIdentity1 = await IdentityService.getCompanyAuthentication(-1);
      assert.equal(enterpriseIdentity1, undefined);
    })
  });
  describe('update identity', () => {
    it('update person identity', async () => {
      const identity = await IdentityService.createOrUpdatePersonIdentity(testpersonCompanyId, 'test1', 'test1', 'test1', 'test1');
      assert.equal(identity.name, 'test1')
    });
    it('update enterprise identity', async () => {
      const identity = await IdentityService.createOrUpdateEnterpriseIdentity(testEnterpriseCompanyId, 'company_name', 'credit code', 'company_test', 'company_test', 'company_test', 'company_test', 'company_test', 'company_test', 'company_test');
      assert.equal(identity.name, 'company_name')
    })
  });
  describe('check creditCode', () => {
    it ('should return true', async () => {
      const ret = await IdentityService.checkCompanyCreditCode('credit code', testEnterpriseCompanyId);
      assert.equal(ret, true);
    })
  })
})
