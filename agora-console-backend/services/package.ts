import { getManager } from 'typeorm';
import { MinPackage } from './../models/minPackage';
import { Voucher } from './../models/voucher';
import { VoucherUsage } from './../models/voucherUsage';
import { VoucherRequest } from './../models/voucherRequest';
import { PackageManagement } from '../models/packageManagement';
import { MarketplacePackage } from './../models/marketplacePackage';
import { MarketplacePackageQuota } from '../models/marketplacePackageQuota';
import { ErrCode } from '../controller/apiCodes';
import * as IdentityService from '../services/identity';
import { ListReply, ListParams } from '../models/listReply';
import * as moment from 'moment';

export enum packageManagementStatus {
  InActive = 2,
  Active = 1,
  NotCost = 3
}

export enum packageManagementType {
  MinPackage = 3,
  SupportPackage = 1,
  Marketplace = 2
}

export enum minPackageIsPublic {
  NoPublic = 1,
  Public = 2
}

export enum minPackageStatus {
  InActive = 1,
  Active = 2
}

export enum minPackageAvailableTo {
  CN = 1,
  ROW = 2
}

export enum minPackageType {
  DefaultCN = 1,
  DefaultROW = 2,
  Other = 3
}

export enum VoucherCurrency {
  CNY = 1,
  USD = 2
}

export enum VoucherAuthentication {
  NEED = 1,
  NONEED = 2
}

export enum AuthStatus {
  REJECT = 2
}

export enum VoucherisAvailable {
  InActive = 2,
  Active = 1
}

export enum VoucherPackageType {
  Support = 1,
  MarketPlace = 2,
  Usage = 3,
  AA = 4
}

export enum VoucherRequestStatus {
  PENDING = 1,
  SUCCESS = 2,
  FAIL = 3
}

export enum PackageQuotaStatus {
  NORMAL = 1,
  EXPIRE = 2,
  OVERDUE = 3
}

export const checkVoucherPackage = (selectPackageIds: string, voucherPackageIds: string) => {
  const selectPackageIdsArray = selectPackageIds.split(',');
  const voucherPackageIdsArray = voucherPackageIds.split(',');
  let packageId = undefined;

  for (let i = 0; i < voucherPackageIdsArray.length; i++) {
    if (selectPackageIdsArray.indexOf(voucherPackageIdsArray[i]) !== -1) {
      packageId = voucherPackageIdsArray[i];
      break;
    }
  }
  return packageId;
};

export const getPackageIds = (packages: Array<any>) => {
  const packageIds = [];
  packages.forEach(item => {
    packageIds.push(item.packageId);
  });
  return packageIds.join(',');
};

export const getMinPackageByCompany = async (companyId: number, filter?: {}) => {
  const query = getManager().createQueryBuilder(PackageManagement, 'packageManagement')
    .innerJoin('packageManagement.minPackage', 'minPackage')
    .innerJoin('minPackage.minPackageProduct', 'minPackageProduct')
    .select('packageManagement.expireDate', 'expireDate')
    .addSelect('packageManagement.effective_date', 'effectiveDate')
    .addSelect('packageManagement.status', 'status')
    .addSelect('minPackageProduct.product_type', 'productType')
    .addSelect('minPackageProduct.media_type', 'mediaType')
    .addSelect('minPackageProduct.usage_quote', 'usageQuote')
    .where('packageManagement.companyId = :companyId and packageManagement.type = :type', {
      companyId: companyId,
      type: packageManagementType.MinPackage
    });

  const res = await query.getRawMany();
  return res;
};

export const getMinPackageList = async (area: string, productType: number, mediaType: number, packageIds: Array<Number> = []) => {
  const query = getManager().createQueryBuilder(MinPackage, 'minPackage')
    .leftJoin('minPackage.minPackageProduct', 'minPackageProduct')
    .select('minPackage.id', 'id')
    .addSelect('minPackage.name', 'packageName')
    .addSelect('minPackage.available_to', 'availableTo')
    .addSelect('minPackage.description', 'description')
    .addSelect('minPackage.description', 'description')
    .addSelect('minPackage.price_cny', 'priceCNY')
    .addSelect('minPackage.price_usd', 'priceUSD')
    .addSelect('minPackage.duration', 'duration')
    .addSelect('minPackage.max_quantity', 'maxQuantity')
    .addSelect('minPackageProduct.id', 'productId')
    .addSelect('minPackageProduct.product_type', 'productType')
    .addSelect('minPackageProduct.media_type', 'mediaType')
    .addSelect('minPackageProduct.usage_quote', 'usageQuote')
    .where('minPackage.is_public = :is_public and minPackage.package_status = :package_status and minPackage.available_to = :available_to', {
      is_public: minPackageIsPublic.Public,
      package_status: minPackageStatus.Active,
      available_to: area === 'CN' ? minPackageAvailableTo.CN : minPackageAvailableTo.ROW
    });
  if (productType) {
    query.andWhere(`minPackageProduct.product_type = ${productType}`);
  }
  if (mediaType) {
    query.andWhere(`minPackageProduct.media_type = ${mediaType}`);
  }
  if (packageIds.length > 0) {
    query.andWhere('minPackage.id IN (:...ids)', { ids: packageIds });
  }
  const res = await query.getRawMany();
  return res;
};

export const checkCompanyVoucher = async (
  code: string,
  packageType: number,
  packageIds: string,
  companyId: number,
  accountCurrency: string,
  companyInfo: any
) => {
  const voucherInfo = await Voucher.findOne({ where: { code: code } });

  if (!voucherInfo || voucherInfo.isAvailable === VoucherisAvailable.InActive) {
    return { allow: false, code: ErrCode.VOUCHER_INVALID_ERROR };
  }

  if (voucherInfo.packageType !== packageType) {
    return { allow: false, code: ErrCode.VOUCHER_INVALID_ERROR };
  }

  if (Date.now() < voucherInfo.startAt || Date.now() >= voucherInfo.endAt) {
    return { allow: false, code: ErrCode.VOUCHER_PERIOD_ERROR };
  }

  if (voucherInfo.availableTo === minPackageAvailableTo.CN) {
    if (companyInfo.area !== 'CN') {
      return { allow: false, code: ErrCode.VOUCHER_AREA_ERROR };
    }
  }

  if (voucherInfo.availableTo === minPackageAvailableTo.ROW) {
    if (companyInfo.area !== 'Non-CN') {
      return { allow: false, code: ErrCode.VOUCHER_AREA_ERROR };
    }
  }

  if (VoucherCurrency[accountCurrency] !== voucherInfo.currency) {
    return { allow: false, code: ErrCode.VOUCHER_CURRENCY_ERROR };
  }

  if (!checkVoucherPackage(packageIds, voucherInfo.packageIds)) {
    return { allow: false, code: ErrCode.VOUCHER_PACKAGE_ERROR };
  }

  const voucherUsageInfo = await VoucherUsage.find({ where: { code: code, companyId: companyId } });
  if (voucherUsageInfo.length >= voucherInfo.companyQuota) {
    return { allow: false, code: ErrCode.VOUCHER_USAGE_ERROR, limit: voucherInfo.companyQuota };
  }

  if (voucherInfo.needAuthentication === VoucherAuthentication.NEED) {
    const identity = await IdentityService.getCompanyAuthentication(companyId);
    if (!('authStatus' in identity) || identity['authStatus'] === AuthStatus.REJECT) {
      return { allow: false, code: ErrCode.VOUCHER_AUTHENTICATION_ERROR };
    }
  }

  return { allow: true, voucherInfo: voucherInfo };
};

export const createCompanyVoucherUsage = async (code: string, billId: number, companyId: number) => {
  const voucherUsage = new VoucherUsage();
  voucherUsage.billId = billId;
  voucherUsage.companyId = companyId;
  voucherUsage.code = code;
  const voucherUsageDB = getManager().getRepository(VoucherUsage);
  await voucherUsageDB.save(voucherUsage);
  return voucherUsage;
};

export const getVoucherInfo = async (code: string) => {
  const voucherInfo = await Voucher.findOne({ where: { code: code } });
  return voucherInfo;
};

export const getVoucherAmount = async (code: string) => {
  if (!code) return 0;
  const voucherInfo = await getVoucherInfo(code);
  return voucherInfo ? voucherInfo.voucherAmount : 0;
};

export const getMinPackagesAmount = async (packages: Array<any>, voucherAmount: number, currency: string) => {
  const amouts = [];
  let realPrice = 0;
  packages.forEach((item) => {
    const packagePrice = currency === 'USD' ? Number(item.priceUSD) * item.num : Number(item.priceCNY) * item.num;
    amouts.push(packagePrice);
  });
  const totalPackagePrice = amouts.reduce((total, num) => total + num);
  if (voucherAmount && voucherAmount > 0) {
    realPrice = (totalPackagePrice > voucherAmount) ? (totalPackagePrice - voucherAmount) : 0;
  } else {
    realPrice = totalPackagePrice;
  }

  return realPrice;
};

export const getMarketplacePackagesAmount = async (packages: Array<any>, voucherAmount: number, currency: string) => {
  const amouts = [];
  let realPrice = 0;
  packages.forEach((item) => {
    const packagePrice = currency === 'USD' ? Number(item.priceUSD) * item.num : Number(item.priceCNY) * item.num;
    amouts.push(packagePrice);
  });
  const totalPackagePrice = amouts.reduce((total, num) => total + num);
  if (voucherAmount && voucherAmount > 0) {
    realPrice = (totalPackagePrice > voucherAmount) ? (totalPackagePrice - voucherAmount) : 0;
  } else {
    realPrice = totalPackagePrice;
  }

  return realPrice;
};

export const getMarketplacePackageInfo = async (packageId: number) => {
  const res = await getManager().createQueryBuilder(MarketplacePackage, 'marketplacePackage')
    .leftJoinAndSelect('marketplacePackage.marketplacePackageProduct', 'marketplacePackageProduct')
    .where('marketplacePackage.id = :packageId', {
      packageId: Number(packageId)
    })
    .getOne();
  return res;
};

export const validateSelectedPackages = async (packageType: packageManagementType, packages = []) => {
  const result = [];
  if (packageType === packageManagementType.MinPackage) {
    await Promise.all(packages.map(async (item: any) => {
      const packageInfo = await MinPackage.findOne(item.packageId);
      if (packageInfo && packageInfo.packageStatus === minPackageStatus.Active && packageInfo.isPublic === minPackageIsPublic.Public) {
        result.push(Object.assign({}, packageInfo, { packageId: item.packageId, num: item.num, packageName: item.packageName }));
      }
    }));
  } else if (packageType === packageManagementType.Marketplace) {
    await Promise.all(packages.map(async (item: any) => {
      const packageInfo = await getMarketplacePackageInfo(item.packageId);
      if (packageInfo && packageInfo.packageStatus === minPackageStatus.Active && packageInfo.isPublic === minPackageIsPublic.Public) {
        result.push(Object.assign({}, packageInfo, { packageId: item.packageId, num: item.num, packageName: item.name }));
      }
    }));
  }
  return result;
};

export const formatMinPackageIncludeVoucher = async (
  voucherCode: string,
  packageType: packageManagementType,
  packages = []
) => {
  let validPackages = [];
  if (packageType === packageManagementType.MinPackage) {
    validPackages = await validateSelectedPackages(packageManagementType.MinPackage, packages);
  } else if (packageType === packageManagementType.Marketplace) {
    validPackages = await validateSelectedPackages(packageManagementType.Marketplace, packages);
  }
  if (!voucherCode) return validPackages;
  const voucherInfo = await getVoucherInfo(voucherCode);
  const selectPackageIds = getPackageIds(validPackages);

  const useVoucherPackageId = checkVoucherPackage(selectPackageIds, voucherInfo.packageIds);

  for (let i = 0; i < validPackages.length; i++) {
    if (validPackages[i].packageId === useVoucherPackageId) {
      validPackages[i]['voucherAmount'] = voucherInfo.voucherAmount;
      validPackages[i]['voucherCode'] = voucherInfo.code;
      validPackages[i]['voucherName'] = voucherInfo.name;
      break;
    }
  }
  return validPackages;
};

export const getVoucherRequestIndex = async (companyId: number, code: string, status: number) => {
  const voucherCount = await VoucherUsage.count({ where: { code: code, companyId: companyId } });
  return voucherCount;
};

export const insertVoucherRequest = async (companyId: number, code: string, operatorId: number, limit: number) => {
  const voucherIndex = await getVoucherRequestIndex(companyId, code, VoucherRequestStatus.SUCCESS);
  if (voucherIndex >= limit) {
    throw new Error(`voucher code limit`);
  }
  const voucherRequest = new VoucherRequest();
  voucherRequest.code = code;
  voucherRequest.companyId = companyId;
  voucherRequest.code = code;
  voucherRequest.operatorId = operatorId;
  voucherRequest.index = voucherIndex + 1;
  const voucherRequestDB = getManager().getRepository(VoucherRequest);
  await voucherRequestDB.save(voucherRequest);
  return voucherRequest;
};

export const updateVoucherRequest = async (companyId: number, code: string, index: number, status: number, transationId: number) => {
  const voucherRequestDB = getManager().getRepository(VoucherRequest);
  const currentRequest = await voucherRequestDB.findOne({ where: {
    companyId,
    code,
    index
  } });
  if (!currentRequest) return;
  currentRequest.status = status;
  currentRequest.transactionId = transationId;
  await voucherRequestDB.save(currentRequest);
  return currentRequest;
};

export const getMarketplacePackageList = async (area: string, serviceName: string, skuType: number, packageIds: Array<Number> = []) => {
  const query = getManager().createQueryBuilder(MarketplacePackage, 'marketplacePackage')
    .leftJoin('marketplacePackage.marketplacePackageProduct', 'marketplacePackageProduct')
    .select('marketplacePackage.id', 'id')
    .addSelect('marketplacePackage.name', 'packageName')
    .addSelect('marketplacePackage.available_to', 'availableTo')
    .addSelect('marketplacePackage.description', 'description')
    .addSelect('marketplacePackage.description', 'description')
    .addSelect('marketplacePackage.price_cny', 'priceCNY')
    .addSelect('marketplacePackage.price_usd', 'priceUSD')
    .addSelect('marketplacePackage.duration', 'duration')
    .addSelect('marketplacePackageProduct.id', 'productId')
    .addSelect('marketplacePackageProduct.sku_type', 'skuType')
    .addSelect('marketplacePackageProduct.sku_id', 'skuId')
    .addSelect('marketplacePackageProduct.usage_quote', 'usageQuote')
    .where('marketplacePackage.is_public = :is_public and marketplacePackage.package_status = :package_status and marketplacePackage.available_to = :available_to', {
      is_public: minPackageIsPublic.Public,
      package_status: minPackageStatus.Active,
      available_to: area === 'CN' ? minPackageAvailableTo.CN : minPackageAvailableTo.ROW
    });
  if (serviceName) {
    query.andWhere(`marketplacePackageProduct.service_name = '${serviceName}'`);
  }
  if (skuType) {
    query.andWhere(`marketplacePackageProduct.sku_type = ${skuType}`);
  }
  if (packageIds.length > 0) {
    query.andWhere('marketplacePackage.id IN (:...ids)', { ids: packageIds });
  }
  const res = await query.getRawMany();
  return res;
};

export const getCompanyMarketplacePackages = async (serviceName: string, companyId: number, params: ListParams) => {
  const listReply: ListReply<MarketplacePackageQuota> = {
    total: 0,
    items: []
  };

  const usageDB = getManager().getRepository(MarketplacePackageQuota);
  let usageDBQuery = usageDB.createQueryBuilder('marketplacePackageQuota')
  .where('marketplacePackageQuota.service_name = :serviceName and marketplacePackageQuota.company_id = :companyId', {
    serviceName,
    companyId
  });

  if (params.params.status) {
    if (params.params.status === 'normal') {
      const now = moment().format('YYYY-MM-DD HH:mm:ss');
      usageDBQuery.andWhere('marketplacePackageQuota.usage_quota > marketplacePackageQuota.quota_used').andWhere('marketplacePackageQuota.expire_date > :now', { now: now });
    } else {
      usageDBQuery.andWhere('marketplacePackageQuota.status = :status', { status: params.params.status });
    }
  }

  if (!params.params.fetchAll) {
    usageDBQuery = usageDBQuery.offset(params.skip).limit(params.limit);
  }

  const [items, total] = await usageDBQuery.getManyAndCount();
  listReply.total = total;
  listReply.items = items;
  return listReply;
};

export const getCompanyMarketPackageDistinct = async (companyId: number) => {
  const usageDB = getManager().getRepository(MarketplacePackageQuota);
  const companys = await usageDB.createQueryBuilder('marketplacePackageQuota')
      .select('DISTINCT marketplacePackageQuota.service_name')
      .where('marketplacePackageQuota.company_id = :companyId', {
        companyId
      })
      .getRawMany();
  return companys;
};

export const getCompanyServiceMarketPackage = async (companyId: number, serviceName: string) => {
  const res = await MarketplacePackageQuota.find({ where: { companyId: companyId, serviceName: serviceName } });
  return res;
};
