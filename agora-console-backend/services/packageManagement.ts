import { getManager } from 'typeorm';
import { PackageManagement } from '../models/packageManagement';
import { SupportPackage } from '../models/supportPackage';
import { MinPackage } from '../models/minPackage';
import { ListParams } from '../models/listReply';
import { packageManagementType } from './support';
import { MarketplacePackage } from '../models/marketplacePackage';

export const getPackageManagementList = async (companyId: number, params: ListParams) => {
  let query = getManager().createQueryBuilder(PackageManagement, 'packageManagement')
    .where('packageManagement.companyId = :companyId and packageManagement.amount != :amount and packageManagement.amount != :zeroAmount', {
      companyId: companyId,
      amount: '-',
      zeroAmount: 0
    });

  if (params.params.startDate && params.params.endDate) {
    query = query.andWhere('packageManagement.effectiveDate BETWEEN :begin AND :end', {
      begin: `${params.params.startDate} 00:00:00`,
      end: `${params.params.endDate} 23:59:59`
    });
  }

  query = query.offset(params.skip).limit(params.limit).addOrderBy('packageManagement.effectiveDate', 'DESC');

  const [items, total] = await query.getManyAndCount();
  for (const item of items) {
    if (item.type === packageManagementType.Support) {
      const supportPackage = await SupportPackage.findOne({ where: { id: item.packageId } });
      item.supportPackage = supportPackage;
    }
    if (item.type === packageManagementType.Minutes) {
      const minPackage = await MinPackage.findOne({ where: { id: item.packageId } });
      item.minPackage = minPackage;
    }
    if (item.type === packageManagementType.MarketPlace) {
      const minPackage = await MarketplacePackage.findOne({ where: { id: item.packageId } });
      item.marketplacePackage = minPackage;
    }
  }
  return {
    list: items,
    total
  };
};

export const getPackageManagementAll = async (companyId: number, params: ListParams) => {
  let query = getManager().createQueryBuilder(PackageManagement, 'packageManagement')
  .leftJoinAndSelect('packageManagement.supportPackage', 'supportPackage')
  .where('packageManagement.companyId = :companyId', {
    companyId: companyId
  });

  if (params.params.startDate && params.params.endDate) {
    query = query.andWhere('packageManagement.effectiveDate BETWEEN :begin AND :end', {
      begin: `${params.params.startDate} 00:00:00`,
      end: `${params.params.endDate} 23:59:59`
    });
  }

  const res = await query.getMany();

  return res;
};

export const getUnpaidPackageManagementByTransactionId = async (companyId: number, transactionId: string) => {
  const packageManagementQuery = getManager().createQueryBuilder(PackageManagement, 'packageManagement')
  .leftJoinAndSelect('packageManagement.minPackage', 'minPackage')
  .where('packageManagement.companyId = :companyId and packageManagement.transactionId = :transactionId and packageManagement.status = 3', {
    companyId: companyId, transactionId: transactionId
  });

  const res = await packageManagementQuery.getMany();

  return res;
};

export const getUnpaidMarketplacePackageManagementByTransactionId = async (companyId: number, transactionId: string) => {
  const packageManagementQuery = getManager().createQueryBuilder(PackageManagement, 'packageManagement')
  .leftJoinAndSelect('packageManagement.marketplacePackage', 'marketplacePackage')
  .leftJoinAndSelect('marketplacePackage.marketplacePackageProduct', 'marketplacePackageProduct')
  .where('packageManagement.companyId = :companyId and packageManagement.transactionId = :transactionId and packageManagement.status = 3', {
    companyId: companyId, transactionId: transactionId
  });

  const res = await packageManagementQuery.getMany();

  return res;
};

export const getMarketplacePackageManagementByTransactionId = async (companyId: number, transactionId: string) => {
  const res = await PackageManagement.findOne({ where: { companyId: companyId, transactionId: transactionId, type: packageManagementType.MarketPlace } });
  return res;
};
