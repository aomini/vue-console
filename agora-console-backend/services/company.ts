import { getManager } from 'typeorm';
import { Company } from '../models/company';
import { CompanyRestful } from '../models/companyRestful';

export const getCompanyById = async (companyId: number): Promise<Company> => {
  const company = await Company.findOne({ where : { id: companyId } });
  return company;
};

export const getCompanyRestfulKeys = async (companyId: number) => {
  const db = getManager().getRepository(CompanyRestful);
  const restfulkeys = await db.createQueryBuilder('restful')
                      .where('company_id = :companyId and deleted_at is null', { companyId })
                      .getMany();
  return restfulkeys;
};

/**
 * 获取全量 restful api key 列表
 * @param updatedAt
 * @param limit
 * @param page
 */
export const listRestfulKeys = async (updatedAt: Date, limit: number, page: number) => {
  if (limit <= 0) limit = 10;
  if (page <= 0) page = 1;
  const db = getManager().getRepository(CompanyRestful);
  const query = db.createQueryBuilder('restful');
  if (updatedAt && !isNaN(updatedAt.getTime())) {
    query.andWhere('restful.updated_at >= :updatedAt', { updatedAt: updatedAt.toISOString() });
  }
  const restfulkeys = await query.limit(limit).offset((page - 1) * limit).orderBy('restful.key', 'ASC').getMany();
  return restfulkeys;
};
