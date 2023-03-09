import { getManager } from 'typeorm';
import { CompanyRestful } from '../models/companyRestful';

export const getKeysByCompany = async (companyId: number) => {
  const RestfulDB = getManager().getRepository(CompanyRestful);
  const restfulKeys = await RestfulDB.createQueryBuilder()
    .select('`key`')
    .addSelect('downloaded')
    .where('company_id = :companyId and deleted_at is null', { companyId })
    .orderBy('created_at', 'DESC')
    .getRawMany();
  return restfulKeys;
};

export const getSecret = async (companyId: number, key: string) => {
  const RestfulDB = getManager().getRepository(CompanyRestful);
  const restfulKeys = await RestfulDB.createQueryBuilder()
    .where('company_id = :companyId and deleted_at is null and `key` = :key', { companyId, key })
    .getOne();
  return restfulKeys;
};

export const getInfoByKey = async (key: string) => {
  const RestfulDB = getManager().getRepository(CompanyRestful);
  const restfulKey = await RestfulDB.findOne({ key });
  return restfulKey;
};

export const createKey = async (key: string, secret: string, companyId: number, restfulKeyLimit: number) => {
  const manager = getManager();
  let result = false;
  await manager.transaction(async manager => {
    const RestfulDB = manager.getRepository(CompanyRestful);
    const restfulKeys = await RestfulDB.createQueryBuilder()
      .select('`key`')
      .where('company_id = :companyId and deleted_at is null', { companyId })
      .getRawMany();
    if (restfulKeys.length < restfulKeyLimit) {
      const entityRestful = RestfulDB.create({
        companyId: companyId,
        roleId: 1,
        key: key,
        secret: secret
      });
      await RestfulDB.insert(entityRestful);
      result = true;
    }
  });
  return result;
};

export const deleteKey = async (key: string, companyId: number) => {
  const RestfulDB = getManager().getRepository(CompanyRestful);
  const entityRestful = await RestfulDB.findOne({ key, companyId });
  entityRestful.deletedAt = new Date();
  const reply = await RestfulDB.save(entityRestful);
  return reply;
};

export const setKeyToDownloaded = async (companyId: number, key: string) => {
  const RestfulDB = getManager().getRepository(CompanyRestful);
  const entityRestful = await RestfulDB.findOne({ key, companyId });
  if (!entityRestful) return;
  entityRestful.downloaded = 1;
  const reply = await RestfulDB.save(entityRestful);
  return reply;
};
