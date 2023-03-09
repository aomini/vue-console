import { getManager } from 'typeorm';
import { SupportPackage } from './../models/supportPackage';
import { PackageManagement } from '../models/packageManagement';

export enum packageManagementStatus {
  InActive = 2,
  Active = 1,
  NotCost = 3
}

enum supportPackageIsPublic {
  NoPublic = 1,
  Public = 2
}

enum supportPackageStatus {
  InActive = 1,
  Active = 2
}

export enum supportPackageAvailableTo {
  CN = 1,
  ROW = 2
}

export enum supportPackageType {
  DefaultCN = 1,
  DefaultROW = 2,
  Other = 3
}

export enum packageManagementType {
  Support = 1,
  MarketPlace = 2,
  Minutes = 3,
  Refund = 4
}

export const getSupportPackageByCompany = async (companyId: number) => {
  const res = await getManager().createQueryBuilder(PackageManagement, 'packageManagement')
    .leftJoinAndSelect('packageManagement.supportPackage', 'supportPackage')
    .where('packageManagement.companyId = :companyId and packageManagement.status = :status and packageManagement.type = :type', {
      companyId: companyId,
      status: packageManagementStatus.Active,
      type: packageManagementType.Support
    })
    .getOne();
  return res;
};

export const getDefaultSupportPackageByCompany = async (area: string) => {
  const res = await getManager().createQueryBuilder(SupportPackage, 'supportPackage')
    .where('supportPackage.package_type = :package_type', {
      package_type: area === 'CN' ? supportPackageType.DefaultCN : supportPackageType.DefaultROW
    })
    .getOne();
  return res;
};

export const getSupportPackageInfo = async (packageId: number) => {
  const res = await getManager().createQueryBuilder(SupportPackage, 'supportPackage')
    .where('supportPackage.id = :packageId', {
      packageId: Number(packageId)
    })
    .getOne();
  return res;
};

export const getSupportPackageList = async (area: string) => {
  const res = await getManager().createQueryBuilder(SupportPackage, 'supportPackage')
    .where('supportPackage.is_public = :is_public and supportPackage.package_status = :package_status and supportPackage.available_to = :available_to', {
      is_public: supportPackageIsPublic.Public,
      package_status: supportPackageStatus.Active,
      available_to: area === 'CN' ? supportPackageAvailableTo.CN : supportPackageAvailableTo.ROW
    })
    .getMany();
  return res;
};
