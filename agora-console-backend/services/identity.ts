import { CompanyAuthentication, PersonIdentity, CompanyIdentity } from '../models/identity';
import { OssResource } from '../models/ossResource';
import { getManager, getConnection } from 'typeorm';
import * as moment from 'moment';
import { AliIdentity, IdentityStatus } from '../models/aliIdentity';

enum IdentityType {
  Company = 0,
  Person = 1
}

export const getPersonIdentity = async (companyId: number): Promise<PersonIdentity> => {
  const identity = await PersonIdentity.findOne({ where : { companyId: companyId } });
  return identity;
};

export const getIdentity = async (companyId: number) => {
  const identity = await AliIdentity.findOne({ where : { companyId: companyId } });
  return identity;
};

export const getCompanyIdentity = async (companyId: number): Promise<CompanyIdentity> => {
  const identity = await CompanyIdentity.findOne({ where : { companyId: companyId } });
  return identity;
};

export const getCompanyAuthentication = async (companyId: number) => {
  const result = {
    identity: {}
  };
  const identity = await CompanyAuthentication.findOne({ where : { companyId: companyId } });
  if (!identity) {
    return result;
  }
  result['authStatus'] = identity.status;
  if (identity.identityType === 0) {
    const companyIdentity = await getCompanyIdentity(companyId);
    if (companyIdentity) {
      result['identity'] = companyIdentity;
    }
    result['identity']['identityType'] = 0;
  } else if (identity.identityType === 1) {
    const oldPersonIdentity = await getPersonIdentity(companyId);
    if (oldPersonIdentity && oldPersonIdentity.status === 1) {
      result['identity'] = oldPersonIdentity;
      result['identity']['identityType'] = 1;
    } else {
      const personIdentity = await getIdentity(companyId);
      if (personIdentity) {
        result['identity'] = personIdentity;
      }
      result['identity']['identityType'] = 1;
    }
  }
  return result;
};

export const getCompanyFullIdentityInfo = async (companyId: number) => {
  const data: any = {};
  {
    const authentication = await CompanyAuthentication.findOne({ where : { companyId: companyId } });
    if (authentication) {
      data.basicInfo = authentication;
    }
  }
  {
    const authentication = await getCompanyIdentity(companyId);
    if (authentication) {
      data.companyInfo = authentication;
    }
  }
  {
    const authentication = await getIdentity(companyId);
    if (authentication) {
      data.personalInfo = authentication;
    }
  }
  return data;
};

export const getCompanyIdentityStatus = async (companyId: number) => {
  const identity = await CompanyAuthentication.findOne({ where : { companyId: companyId } });
  return identity;
};

export const checkIDNumber = async (IdNumber: string, companyId: number) => {
  const identityDB = getManager().getRepository(PersonIdentity);
  const total = await identityDB.createQueryBuilder('personIdentity')
    .where('personIdentity.number = :number and personIdentity.company_id != :companyId', { number: IdNumber, companyId: companyId })
    .getCount();
  return total > 0;
};

export const checkCompanyCreditCode = async (IdNumber: string, companyId: number) => {
  const identityDB = getManager().getRepository(CompanyIdentity);
  const total = await identityDB.createQueryBuilder('companyIdentity')
    .where('companyIdentity.credit_code = :number and companyIdentity.company_id != :companyId and companyIdentity.status != :status', { number: IdNumber, companyId: companyId, status: IdentityStatus.Reject })
    .getCount();
  return total >= 10;
};

export const checkBankAccount = async (bankAccount: string) => {
  const identityDB = getManager().getRepository(CompanyIdentity);
  const total = await identityDB.createQueryBuilder('companyIdentity')
    .where('companyIdentity.bank_account = :bankAccount and companyIdentity.status != :status', { bankAccount: bankAccount, status: IdentityStatus.Reject })
    .getCount();
  return total > 0;
};

export const checkCompanyName = async (name: string) => {
  const identityDB = getManager().getRepository(CompanyIdentity);
  const total = await identityDB.createQueryBuilder('companyIdentity')
    .where('companyIdentity.name = :name and companyIdentity.status != :status', { name: name, status: IdentityStatus.Reject })
    .getCount();
  return total > 0;
};

export const createOrUpdatePersonIdentity = async (companyId: number, name: string, Idnumber: string, facePhotoId: string, backPhotoId: string, facePhotoKey: string, backPhotoKey: string): Promise<PersonIdentity> => {
  let newIdentity = undefined;
  const identityDB = getManager().getRepository(PersonIdentity);
  const authDB = getManager().getRepository(CompanyAuthentication);
  const authtication = new CompanyAuthentication();
  const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  authtication.companyId = companyId;
  const currentAuthentication = await authDB.findOne(authtication);
  authtication.identityType = 1;
  authtication.status = 0;
  if (!currentAuthentication) {
    await authDB.save(authtication);
  } else {
    const oldAuth = await authDB.createQueryBuilder('companyAuthentication')
    .where('companyAuthentication.company_id = :id', { id: companyId })
    .getOne();
    if (!oldAuth) return;
    oldAuth.identityType = 1;
    oldAuth.status = 0;
    await authDB.save(oldAuth);
  }
  const identity = new PersonIdentity();
  identity.companyId = companyId;
  const currentIdentity = await identityDB.findOne(identity);
  if (!currentIdentity) {
    identity.name = name;
    identity.number = Idnumber;
    identity.facePhotoId = facePhotoId;
    identity.backPhotoId = backPhotoId;
    identity.facePhotoKey = facePhotoKey;
    identity.backPhotoKey = backPhotoKey;
    identity.submitTime = timestamp;
    identity.status = 0;
    newIdentity = await identityDB.save(identity);
  } else {
    newIdentity = await identityDB.createQueryBuilder('personIdentity')
    .where('personIdentity.company_id = :id', { id: companyId })
    .getOne();
    if (!newIdentity) return;
    newIdentity.name = name;
    newIdentity.number = Idnumber;
    newIdentity.facePhotoId = facePhotoId;
    newIdentity.backPhotoId = backPhotoId;
    newIdentity.facePhotoKey = facePhotoKey;
    newIdentity.backPhotoKey = backPhotoKey;
    newIdentity.submitTime = timestamp;
    newIdentity.status = 0;
    await identityDB.save(newIdentity);
  }
  return newIdentity;
};

export const createOrUpdateEnterpriseIdentity = async (companyId: number, name: string, creditCode: string, licensePhoto: string, licensePhotoKey: string, bankName: string, bankBranch: string, bankAccount: string): Promise<CompanyIdentity> => {
  let newIdentity = undefined;
  const identityDB = getManager().getRepository(CompanyIdentity);
  const authDB = getManager().getRepository(CompanyAuthentication);
  const authtication = new CompanyAuthentication();
  const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  authtication.companyId = companyId;
  const currentAuthentication = await authDB.findOne(authtication);
  authtication.identityType = 0;
  authtication.status = 0;
  if (!currentAuthentication) {
    await authDB.save(authtication);
  } else {
    const oldAuth = await authDB.createQueryBuilder('companyAuthentication')
    .where('companyAuthentication.company_id = :id', { id: companyId })
    .getOne();
    if (!oldAuth) return;
    oldAuth.identityType = 0;
    oldAuth.status = 0;
    await authDB.save(oldAuth);
  }
  const identity = new CompanyIdentity();
  identity.companyId = companyId;
  const currentIdentity = await identityDB.findOne(identity);
  if (!currentIdentity) {
    identity.name = name;
    identity.creditCode = creditCode;
    identity.licensePhoto = licensePhoto;
    identity.licensePhotoKey = licensePhotoKey;
    identity.bankName = bankName;
    identity.bankAccount = bankAccount;
    identity.bankBranch = bankBranch;
    identity.submitTime = timestamp;
    identity.status = 0;
    newIdentity = await identityDB.save(identity);
  } else {
    newIdentity = await identityDB.createQueryBuilder('companyIdentity')
    .where('companyIdentity.company_id = :id', { id: companyId })
    .getOne();
    if (!newIdentity) return;
    newIdentity.name = name;
    newIdentity.creditCode = creditCode;
    newIdentity.licensePhoto = licensePhoto;
    newIdentity.licensePhotoKey = licensePhotoKey;
    newIdentity.bankName = bankName;
    newIdentity.bankAccount = bankAccount;
    newIdentity.bankBranch = bankBranch;
    newIdentity.submitTime = timestamp;
    newIdentity.status = 0;
    await identityDB.save(newIdentity);
  }
  return newIdentity;
};

export const createOssResource = async (attachmentId: string, mimeType: string, fileSize: number, ossKey: string): Promise<OssResource> => {
  const ossDB = getManager().getRepository(OssResource);
  const attachment = new OssResource();
  attachment.resourceId = attachmentId;
  let currentOss = await ossDB.findOne(attachment);
  if (!currentOss) {
    attachment.mimeType = mimeType;
    attachment.size = fileSize;
    attachment.ossKey = ossKey;
    attachment.ossState = 0;
    currentOss = await ossDB.save(attachment);
  }
  return currentOss;
};

export const getOssById = async (attachmentId: string): Promise<OssResource> => {
  const ossDB = getManager().getRepository(OssResource);
  const attachment = new OssResource();
  attachment.resourceId = attachmentId;
  const currentOss = await ossDB.findOne(attachment);
  return currentOss;
};

export const publishAttachment = async (attachmentId: string): Promise<OssResource> => {
  const ossDB = getManager().getRepository(OssResource);
  const ossResource = await ossDB.createQueryBuilder('ossResource')
    .where('ossResource.resource_id = :id', { id: attachmentId })
    .getOne();
  if (!ossResource) return;
  ossResource.ossState = 1;
  const updateOss = await ossDB.save(ossResource);
  return updateOss;
};

export const deleteAttachment = async (attachmentId: string): Promise<OssResource> => {
  const ossDB = getManager().getRepository(OssResource);
  const ossResource = await ossDB.createQueryBuilder('ossResource')
    .where('ossResource.resource_id = :id', { id: attachmentId })
    .getOne();
  if (!ossResource) return;
  ossResource.isDeleted = 1;
  const updateOss = await ossDB.save(ossResource);
  return updateOss;
};

export const createIdentity = async (companyId: number, certifyId: string) => {
  await getConnection().createQueryBuilder()
  .insert()
  .into(AliIdentity)
  .values({
    companyId: companyId,
    certifyId: certifyId,
    createdAt: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
    status: IdentityStatus.Review
  })
  .execute();
};

export const getIdentityByCompanyId = async (companyId: number) => {
  const res = await getManager()
  .createQueryBuilder(AliIdentity, 'ali_identity')
  .where('ali_identity.company_id = :companyId', { companyId: companyId })
  .getOne();

  return res;
};

export const setIdentityStatusByCompanyId = async (companyId: number, status: number) => {
  await getConnection().transaction(async transactionalEntityManager => {
    await transactionalEntityManager
    .createQueryBuilder()
    .update(AliIdentity)
    .set({ status: status })
    .where('ali_identity.company_id = :companyId', { companyId: companyId })
    .execute();

    const identity = await transactionalEntityManager
    .createQueryBuilder(CompanyAuthentication, 'company_authentication')
    .where('company_authentication.company_id = :companyId', { companyId: companyId })
    .getOne();

    if (identity) {
      await transactionalEntityManager
      .createQueryBuilder()
      .update(CompanyAuthentication)
      .set({ status: status, identityType: IdentityType.Person })
      .where('company_authentication.company_id = :companyId', { companyId: companyId })
      .execute();
    } else {
      await transactionalEntityManager
      .createQueryBuilder()
      .insert()
      .into(CompanyAuthentication)
      .values({
        companyId: companyId,
        identityType: IdentityType.Person,
        status: status
      })
      .execute();
    }
  });
};

export const setIdentityCertifyIdByCompanyId = async (companyId: number, certifyId: string) => {
  await getConnection()
  .createQueryBuilder()
  .update(AliIdentity)
  .set({ certifyId: certifyId, createdAt: moment().utc().format('YYYY-MM-DD HH:mm:ss') })
  .where('ali_identity.company_id = :companyId', { companyId: companyId })
  .execute();
};
