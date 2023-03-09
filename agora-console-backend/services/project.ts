import { getManager } from 'typeorm';
import * as moment from 'moment';
import { config } from '../config';
import { ListReply, ListParams } from '../models/listReply';
import { VendorInfo, VENDORVALID, VENDORSTOP, ALLOW_STATIC_WITH_DYNAMIC } from '../models/vendorInfo';
import { AppInfo } from '../models/marketAppInfo';
import { VendorGroup } from '../models/vendorGroup';
import { VendorSignal } from '../models/vendorSignal';
import { Company } from '../models/company';
import { generateUUID, generateShortId } from '../utils/encryptTool';
import { ProjectCocos } from '../models/projectCocos';
import { ResPermission } from '../models/permission';
import { ProjectUsageSnapshot } from '../models/projectUsageSnapshot';
import {
  ProjectUseCase,
  InternalIndustryMetadata,
  SectorMetadata
} from '../models/projectUseCase';
import { CertificateBackupInfo } from '../models/certificateBackupInfo';
import { ProjectRelation } from '../models/projectRelation';
import { ProjectRelationModel } from '../dataModel/projectModel';
import { TUser } from '../models/user';

enum Order {
  DESC = 'DESC',
  ASC = 'ASC'
}

enum MarketProjectStatus {
  ENABLED = '0',
  DISABLED = '1',
  ALL = '2',
  REVIEW = '3'
}

enum CertificateBackupStatus {
  ENABLED = 1,
  DISABLED = 2
}

enum projectStage {
  'Not specified'= 1,
  'Live' = 2,
  'Testing' = 3
}

export const getProjectsByCompany = async (params: ListParams): Promise<ListReply<any>> => {
  const listReply: ListReply<VendorInfo> = {
    total: 0,
    items: []
  };

  const vendorInfoDB = getManager().getRepository(VendorInfo);
  let vendorInfoDBQuery = vendorInfoDB.createQueryBuilder('vendorInfo')
    .leftJoinAndSelect(ProjectUsageSnapshot, 'projectUsageSnapshot', 'projectUsageSnapshot.vendorId = vendorInfo.id')
    .where('(vendorInfo.company = :companyId and vendorInfo.is_deleted = 0)', { companyId: params.params.companyId });

  if (params.params.filter && params.params.roleId && !params.params.admin) {
    vendorInfoDBQuery = vendorInfoDBQuery.leftJoin(ProjectRelation, 'ProjectRelation', 'ProjectRelation.vendor_id = vendorInfo.id').leftJoin(ResPermission, 'ResPermission', 'ResPermission.res_id = vendorInfo.project_id')
      .andWhere('(ResPermission.role_id = :roleId OR ProjectRelation.creator = :userId)', { roleId: params.params.roleId, userId: params.params.userId });
  }

  if (params.params.marketplaceStatus !== undefined && params.params.serviceName) {
    vendorInfoDBQuery = vendorInfoDBQuery.leftJoinAndMapMany('vendorInfo.AppInfo', AppInfo, 'appInfo', 'appInfo.app_id = vendorInfo.key and appInfo.serviceName = :serviceName', { serviceName: params.params.serviceName });
    if (params.params.marketplaceStatus === MarketProjectStatus.DISABLED) {
      vendorInfoDBQuery.andWhere('(appInfo.disabled is null or (appInfo.disabled = :status))', { status: MarketProjectStatus.DISABLED });
    } else if (params.params.marketplaceStatus === MarketProjectStatus.ENABLED) {
      vendorInfoDBQuery.andWhere('(appInfo.disabled = :status)', { status: MarketProjectStatus.ENABLED });
    } else if (params.params.marketplaceStatus === MarketProjectStatus.REVIEW) {
      vendorInfoDBQuery.andWhere('(appInfo.disabled = :status)', { status: MarketProjectStatus.REVIEW });
    }
  }

  if (params.params.stage && params.params.stage !== '0') {
    if (params.params.stage === projectStage.Live.toString()) {
      vendorInfoDBQuery.andWhere('(vendorInfo.stage = :stage or (vendorInfo.stage = :stageNotSpecified and projectUsageSnapshot.usage7d > 0))', { stage: params.params.stage, stageNotSpecified: projectStage['Not specified'] });
    } else {
      vendorInfoDBQuery.andWhere('(vendorInfo.stage = :stage or (vendorInfo.stage = :stageNotSpecified and projectUsageSnapshot.usage7d is NULL))', { stage: params.params.stage, stageNotSpecified: projectStage['Not specified'] });
    }
  }

  if (params.params.key) {
    vendorInfoDBQuery = vendorInfoDBQuery.andWhere('(vendorInfo.key like :key or vendorInfo.name like :key)', { key: `%${params.params.key}%` });
  }

  if (params.params.status) {
    vendorInfoDBQuery = vendorInfoDBQuery.andWhere('(vendorInfo.status = :status)', { status: params.params.status });
  }

  vendorInfoDBQuery.select('vendorInfo.id')
    .addSelect('vendorInfo.name')
    .addSelect('vendorInfo.key')
    .addSelect('vendorInfo.signkey')
    .addSelect('vendorInfo.allowStaticWithDynamic')
    .addSelect('vendorInfo.projectId')
    .addSelect('vendorInfo.status')
    .addSelect('vendorInfo.stage')
    .addSelect('projectUsageSnapshot.usage7d')
    // 列表中stage顺序需要按照上线(2)-测试中(3)-未标明(1)排序
    // 这里给对应的值设置权重，并将其生成为新的列rankStage，然后按照rankStage降序即可拿到符合条件的列表
    .addSelect(`
      CASE
        WHEN vendorInfo.stage = 2 THEN 100
        WHEN vendorInfo.stage = 3 THEN 99
        WHEN vendorInfo.stage = 1 THEN 98
      END`, 'rankStage')
    .addSelect('vendorInfo.createdAt');

  if (params.params.marketplaceStatus !== undefined && params.params.serviceName) {
    vendorInfoDBQuery.addSelect('appInfo.appId')
      .addSelect('appInfo.serviceName')
      .addSelect('appInfo.disabled');
  }
  let prop = 'rankStage';
  let order: Order = Order.DESC;
  if (params.params.sortProp === 'name') {
    prop = 'vendorInfo.name';
  }
  if (params.params.sortProp === 'key') {
    prop = 'vendorInfo.key';
  }
  if (params.params.sortProp === 'status') {
    prop = 'vendorInfo.status';
  }
  if (params.params.sortProp === 'stage') {
    prop = 'rankStage';
  }
  if (params.params.sortProp === 'createdAt') {
    prop = 'vendorInfo.createdAt';
  }
  if (params.params.sortOrder === 'ascending') {
    order = Order.ASC;
  } else {
    order = Order.DESC;
  }

  // 默认按照prop排序，其中对于`stage`使用rankStage做特殊排序。
  // 除去默认排序外，对于stage排序，相同的需要按照日期降序，非stage排序，相同的需要按照rankStage降序。
  // 兼容前端
  vendorInfoDBQuery = vendorInfoDBQuery.addOrderBy(prop, order);
  if (params.params.sortProp && params.params.sortProp !== 'stage') {
    vendorInfoDBQuery = vendorInfoDBQuery.addOrderBy('rankStage', Order.DESC);
  } else {
    vendorInfoDBQuery.addOrderBy('vendorInfo.createdAt', Order.DESC);
  }

  if (!params.params.fetchAll) {
    vendorInfoDBQuery = vendorInfoDBQuery.offset(params.skip).limit(params.limit);
  }
  const rawItems = await vendorInfoDBQuery.getRawMany();
  const [items, total] = await vendorInfoDBQuery.getManyAndCount();
  items.forEach((item, index) => {
    if (item.stage === projectStage['Not specified'] && item.id === rawItems[index]['vendorInfo_vendor_id']) {
      item.stage = rawItems[index]['projectUsageSnapshot_usage_7d'] > 0 ? projectStage.Live : projectStage.Testing;
    }
  });
  listReply.total = total;
  listReply.items = items;
  return listReply;
};

export const getProjectDetail = async (projectId: string, companyId: number): Promise<VendorInfo> => {
  const vendorInfoDB = getManager().getRepository(VendorInfo);
  const projectDetail = await vendorInfoDB.createQueryBuilder('vendorInfo')
    .where('vendorInfo.project_id = :projectId and vendorInfo.company_id = :companyId', { projectId: projectId, companyId: companyId })
    .getOne();
  if (!projectDetail) return;
  const vendorSignalDB = getManager().getRepository(VendorSignal);
  const vendorSignal = await vendorSignalDB.createQueryBuilder('vendorSignal')
    .where('vendorSignal.id = :vendorInfoId', { vendorInfoId: projectDetail.id })
    .getOne();
  projectDetail.vendorSignal = vendorSignal;
  const projectUsageSnapshotDB = getManager().getRepository(ProjectUsageSnapshot);
  const projectUsage = await projectUsageSnapshotDB.createQueryBuilder('projectUsageSnapshot')
    .where('projectUsageSnapshot.vendorId = :vendorInfoId', { vendorInfoId: projectDetail.id })
    .getOne();

  if (projectDetail.stage === projectStage['Not specified']) {
    projectDetail.stage = (projectUsage && projectUsage.usage7d > 0) ? projectStage.Live : projectStage.Testing;
  }
  return projectDetail;
};

export const getProjectUsage = async (vendorId: number): Promise<any> => {
  const projectUsageSnapshotDB = getManager().getRepository(ProjectUsageSnapshot);
  const projectUsage = await projectUsageSnapshotDB.createQueryBuilder('projectUsageSnapshot')
    .where('projectUsageSnapshot.vendorId = :vendorInfoId', { vendorInfoId: vendorId })
    .getOne();
  return projectUsage;

};

export const getProjectsWithUsage = async (companyId: number, roleId: number, filter: boolean, limit: number): Promise<any> => {
  const vendorInfoDB = getManager().getRepository(VendorInfo);
  let vendorInfoDBQuery = vendorInfoDB.createQueryBuilder('vendorInfo')
    .leftJoin(ProjectUsageSnapshot, 'projectUsageSnapshot', 'projectUsageSnapshot.vendorId = vendorInfo.id')
    .where('(vendorInfo.company = :companyId and vendorInfo.is_deleted = 0)', { companyId: companyId });

  if (filter && roleId) {
    vendorInfoDBQuery = vendorInfoDBQuery.innerJoin(ResPermission, 'ResPermission', 'ResPermission.res_id = vendorInfo.project_id')
      .andWhere('(ResPermission.role_id = :roleId)', { roleId: roleId });
  }

  vendorInfoDBQuery
    .select('vendorInfo.id', 'id')
    .addSelect('vendorInfo.projectId', 'projectId')
    .addSelect('vendorInfo.name', 'name')
    .addSelect('vendorInfo.stage', 'stage')
    .addSelect('vendorInfo.key', 'key')
    .addSelect('projectUsageSnapshot.usage7d', 'usage7d')
    .addSelect(`
      CASE
        WHEN vendorInfo.stage = 2 THEN 100
        WHEN vendorInfo.stage = 3 THEN 99
        WHEN vendorInfo.stage = 1 THEN 98
      END`, 'rankStage')
    .addOrderBy('rankStage', Order.DESC)
    .addOrderBy('projectUsageSnapshot.usage7d', Order.DESC)
    .limit(limit);
  const projects = await vendorInfoDBQuery.getRawMany();
  const count = await vendorInfoDBQuery.getCount();
  return {
    total: count,
    projects
  };
};

export const checkAppLimit = async (companyId: number, appLimit: number): Promise<boolean> => {
  const vendorInfoDB = getManager().getRepository(VendorInfo);
  const total = await vendorInfoDB.createQueryBuilder('vendorInfo')
    .where('vendorInfo.company = :companyId', { companyId: companyId })
    .getCount();
  return total < appLimit;
};

export const getProjectCount = async (companyId: number): Promise<number> => {
  const vendorInfoDB = getManager().getRepository(VendorInfo);
  const total = await vendorInfoDB.createQueryBuilder('vendorInfo')
    .where('vendorInfo.company = :companyId', { companyId: companyId })
    .getCount();
  return total;
};

export const getVendorGroups = async (): Promise<VendorGroup[]> => {
  const vendorGroupDB = getManager().getRepository(VendorGroup);
  const vendorGroups = await vendorGroupDB.createQueryBuilder('vendorGroup')
    .where('status = :status', { status: 1 })
    .getMany();
  return vendorGroups;
};

export const checkProjectName = async (companyId: number, name: string, id: string): Promise<boolean> => {
  const vendorInfoDB = getManager().getRepository(VendorInfo);
  let vendorInfoDBQuery = vendorInfoDB.createQueryBuilder('vendorInfo')
    .where('vendorInfo.name = :name and vendorInfo.company = :companyId', { name: name, companyId: companyId });
  if (id) {
    vendorInfoDBQuery = vendorInfoDBQuery.andWhere('vendorInfo.project_id != :id', { id: id });
  }

  const total = await vendorInfoDBQuery.getCount();
  return total > 0;
};

export const createNewProject = async (projectName: string, companyId: number, projectStatus?: boolean, useCaseId?: string): Promise<VendorInfo> => {
  const vendorInfo = new VendorInfo();
  const company = new Company();
  const vendorInfoDB = getManager().getRepository(VendorInfo);

  company.id = companyId;
  vendorInfo.name = projectName;
  vendorInfo.useCaseId = useCaseId;
  vendorInfo.company = company;
  vendorInfo.key = generateUUID();
  vendorInfo.projectId = generateShortId();
  if (projectStatus === false) {
    vendorInfo.status = VENDORSTOP;
  }
  vendorInfo.stage = 3;
  vendorInfo.signkeySignal = generateUUID();
  vendorInfo.isDeleted = false;

  const newProject = await vendorInfoDB.save(vendorInfo);
  return newProject;
};

export const createNewSecureProject = async (projectName: string, companyId: number): Promise<VendorInfo> => {
  const vendorInfo = new VendorInfo();
  const company = new Company();
  const vendorInfoDB = getManager().getRepository(VendorInfo);

  company.id = companyId;
  vendorInfo.name = projectName;
  vendorInfo.company = company;
  vendorInfo.key = generateUUID();
  vendorInfo.projectId = generateShortId();
  vendorInfo.stage = 3;
  vendorInfo.signkeySignal = generateUUID();
  vendorInfo.signkey = vendorInfo.signkeySignal;
  vendorInfo.isDeleted = false;

  const secureProject = await vendorInfoDB.save(vendorInfo);
  return secureProject;
};

export const updateProjectForCocos = async (projectId: string, projectName: string, projectStatus: boolean, projectStage?: number, tokenSwitch?: boolean, useCaseId?: string): Promise<VendorInfo> => {
  const vendorInfoDB = getManager().getRepository(VendorInfo);
  const vendorSignalDB = getManager().getRepository(VendorSignal);

  const vendor = new VendorInfo();
  vendor.projectId = projectId;
  const existingProject = await vendorInfoDB.findOne(vendor);

  let updateVendor = new VendorInfo();
  updateVendor = existingProject;
  updateVendor.name = projectName;
  // 如果需要更新需要传入boolean
  if (typeof tokenSwitch === 'boolean') {
    updateVendor.needToken = tokenSwitch ? 0 : 1;
  }

  updateVendor.stage = projectStage;
  updateVendor.status = projectStatus ? VENDORVALID : VENDORSTOP;
  updateVendor.useCaseId = useCaseId;
  const updatedVendor = await vendorInfoDB.save(updateVendor);
  if (typeof tokenSwitch === 'boolean') {
    const vendorSignal = new VendorSignal();
    vendorSignal.id = updateVendor.id;
    vendorSignal.appId = updateVendor.key;
    vendorSignal.needToken = tokenSwitch ? 0 : 1;
    const updatedSignal = await vendorSignalDB.save(vendorSignal);
    updatedVendor.vendorSignal = updatedSignal;
  }
  return updatedVendor;
};

export const updateProject = async (projectId: string, projectName: string, projectStage?: number, tokenSwitch?: boolean, useCaseId?: string): Promise<VendorInfo> => {
  const vendorInfoDB = getManager().getRepository(VendorInfo);
  const vendorSignalDB = getManager().getRepository(VendorSignal);

  const vendor = new VendorInfo();
  vendor.projectId = projectId;
  const existingProject = await vendorInfoDB.findOne(vendor);
  let updateVendor = new VendorInfo();
  updateVendor = existingProject;
  updateVendor.name = projectName;
  // 如果需要更新需要传入boolean
  if (typeof tokenSwitch === 'boolean') {
    updateVendor.needToken = tokenSwitch ? 0 : 1;
  }

  updateVendor.stage = projectStage;
  updateVendor.useCaseId = useCaseId;
  const updatedVendor = await vendorInfoDB.save(updateVendor);
  if (typeof tokenSwitch === 'boolean') {
    const vendorSignal = new VendorSignal();
    vendorSignal.id = updateVendor.id;
    vendorSignal.appId = updateVendor.key;
    vendorSignal.needToken = tokenSwitch ? 0 : 1;
    const updatedSignal = await vendorSignalDB.save(vendorSignal);
    updatedVendor.vendorSignal = updatedSignal;
  }
  return updatedVendor;
};

export const enableCertificate = async (projectId: string): Promise<VendorInfo> => {
  const vendorInfoDB = getManager().getRepository(VendorInfo);
  const originalVendor = await vendorInfoDB.createQueryBuilder('vendorInfo')
    .where('vendorInfo.project_id = :projectId', { projectId: projectId })
    .getOne();

  let vendorInfo = new VendorInfo();
  vendorInfo = originalVendor;
  vendorInfo.signkey = vendorInfo.signkeySignal;
  const result = await vendorInfoDB.save(vendorInfo);
  return result;
};

export const getVendorInfo = async (projectId: string, companyId?: number, thirdPart?: any): Promise<VendorInfo> => {
  const vendorInfoDB = getManager().getRepository(VendorInfo);
  const query = vendorInfoDB.createQueryBuilder('vendorInfo')
    .where('vendorInfo.project_id = :projectId', { projectId });
  if (companyId) {
    query.andWhere('vendorInfo.company_id = :companyId', { companyId });
  }
  const projectDetail = await query.getOne();
  if (!projectDetail && thirdPart && thirdPart.isCocos && thirdPart.uid) {
    const projectCocos = await ProjectCocos.findOne({ where: { uid: thirdPart.uid, projectId } });
    if (!projectCocos) return undefined;
    const project = await vendorInfoDB.createQueryBuilder('vendorInfo')
    .where('vendorInfo.project_id = :projectId', { projectId: projectCocos.projectId }).getOne();
    return project;
  }
  return projectDetail;
};

export const getVendorInfoById = async (vid: number, companyId?: number): Promise<VendorInfo> => {
  const vendorInfoDB = getManager().getRepository(VendorInfo);
  const query = vendorInfoDB.createQueryBuilder('vendorInfo')
    .where('vendor_id = :id and company_id = :companyId', { id: vid, companyId });
  const project = await query.getOne();
  return project;
};

export const getVendorGroupByCompanyId = async (companyId: number): Promise<VendorGroup> => {
  const vendorGroupDB = getManager().getRepository(VendorGroup);
  const vendorGroup = vendorGroupDB.createQueryBuilder('vendorGroup')
                      .where('company_id = :companyId and status = :status', { companyId, status: 1 })
                      .getOne();
  return vendorGroup;
};

export const createOnboardingProject = async (projectName: string, useCaseId: string, internal_industry: string, companyId: number): Promise<VendorInfo> => {
  let onboardingVendor = undefined;
  await getManager().transaction((transactionalEntityManager) => {
    return transactionalEntityManager.createQueryBuilder(VendorInfo, 'vendorInfo')
      .setLock('pessimistic_write')
      .where('vendorInfo.company = :companyId', { companyId: config.assetCompanyID })
      .addOrderBy('vendorInfo.created_at', 'ASC')
      .getOne()
      .then(async (vendorInfo) => {
        const company = new Company();

        company.id = companyId;

        vendorInfo.name = projectName;
        vendorInfo.company = company;
        vendorInfo.useCaseId = useCaseId;

        onboardingVendor = await transactionalEntityManager.save(vendorInfo);
      });
  });

  const companyDB = getManager().getRepository(Company);
  const company = await Company.findOne({ id: companyId });
  if (!company) return;
  company.internalIndustry = internal_industry;
  await companyDB.save(company);
  return onboardingVendor;
};

export const getCompanyVendors = async (minVendorId: number, minUpdateTimestamp: number | null, pagesize: number): Promise<ListReply<any>> => {
  const listReply: ListReply<VendorInfo> = {
    total: 0,
    items: []
  };

  const vendorInfoDB = getManager().getRepository(VendorInfo);
  const vendorInfoDBQuery = vendorInfoDB.createQueryBuilder('vendorInfo')
    .where('(vendorInfo.id > :vendorId)', { vendorId: minVendorId });

  if (minUpdateTimestamp) {
    const minUpdateTimestampStr = moment(minUpdateTimestamp * 1000).utc().format();
    vendorInfoDBQuery.andWhere('(vendorInfo.updated_at > :minUpdateTimestampStr)', { minUpdateTimestampStr });
  }

  vendorInfoDBQuery
    .limit(pagesize)
    .addOrderBy('vendorInfo.id', 'ASC');

  vendorInfoDBQuery.select('vendorInfo.id')
  .addSelect('vendorInfo.companyId');

  const [items, total] = await vendorInfoDBQuery.getManyAndCount();

  listReply.total = total;
  listReply.items = items;
  return listReply;
};

export const getProjectInfoByVid = async (vid: number): Promise<VendorInfo> => {
  const vendorInfoDB = getManager().getRepository(VendorInfo);
  const project = await vendorInfoDB.createQueryBuilder('vendorInfo')
    .select('vendorInfo.id', 'vendor_id')
    .addSelect('vendorInfo.key', 'app_id')
    .addSelect('vendorInfo.companyId', 'company_id')
    .addSelect('vendorInfo.name', 'project_name')
    .where('vendorInfo.vendor_id = :id', { id: vid })
    .getRawOne();
  return project;
};

export const getProjectInfoByVids = async (vids) => {
  const vendorInfoDB = getManager().getRepository(VendorInfo);
  const projects = await vendorInfoDB.createQueryBuilder('vendorInfo')
    .select('vendorInfo.id', 'vendor_id')
    .addSelect('vendorInfo.key', 'app_id')
    .addSelect('vendorInfo.companyId', 'company_id')
    .addSelect('vendorInfo.name', 'project_name')
    .addSelect('vendorInfo.user', 'user')
    .addSelect('vendorInfo.phone', 'phone')
    .addSelect('vendorInfo.email', 'email')
    .addSelect('vendorInfo.parentId', 'parent_id')
    .addSelect('vendorInfo.maxChannels', 'max_channels')
    .addSelect('vendorInfo.projectId', 'project_id')
    .where('vendorInfo.vendor_id IN (:...ids)', { ids: vids })
    .addOrderBy('vendorInfo.vendor_id', 'ASC')
    .getRawMany();
  return projects;
};

export const enablePrimaryCert = async (projectId: string, companyId: number) => {
  const projectInfo = await VendorInfo.findOne({ projectId, companyId });
  if (!projectInfo) return;
  const signkey = projectInfo.signkeySignal;
  projectInfo.signkey = signkey;
  projectInfo.allowStaticWithDynamic = ALLOW_STATIC_WITH_DYNAMIC.ALLOW;
  await projectInfo.save();
};

export const enableBackupCert = async (projectId: string, companyId: number) => {
  const projectInfo = await VendorInfo.findOne({ projectId, companyId });
  if (!projectInfo) return;
  const certificateBackupInfo = new CertificateBackupInfo();
  const backUpKey = generateUUID();
  projectInfo.signkeyBackup = backUpKey;
  certificateBackupInfo.status = CertificateBackupStatus.ENABLED;
  certificateBackupInfo.projectId = projectId;
  certificateBackupInfo.companyId = companyId;
  certificateBackupInfo.signKeyBackup = backUpKey;
  await projectInfo.save();
  await certificateBackupInfo.save();
  return projectInfo;
};

export const switchToPrimaryCert = async (projectId: string, companyId: number) => {
  const projectInfo = await VendorInfo.findOne({ projectId, companyId });
  if (!projectInfo) return;
  const backUpKey = projectInfo.signkeyBackup;
  const signkey = projectInfo.signkey;
  projectInfo.signkeySignal = backUpKey;
  projectInfo.signkey = backUpKey;
  projectInfo.signkeyBackup = signkey;
  await projectInfo.save();
  return projectInfo;
};

export const getBackupCert = async (projectId: string, companyId: number) => {
  const certificateBackupInfo = await CertificateBackupInfo.findOne({ where: { projectId, companyId } });
  return certificateBackupInfo;
};

export const updateBackupCert = async (projectId: string, companyId: number, status: number) => {
  let certificateBackupInfo = await CertificateBackupInfo.findOne({ where: { projectId, companyId } });
  const vendorInfo = await VendorInfo.findOne({ where: { projectId, companyId } });
  const backUpKey = generateUUID();
  if (!certificateBackupInfo) {
    certificateBackupInfo = new CertificateBackupInfo();
    certificateBackupInfo.companyId = companyId;
    certificateBackupInfo.projectId = projectId;
  }
  if (status === CertificateBackupStatus.DISABLED) {
    certificateBackupInfo.status = CertificateBackupStatus.DISABLED;
    certificateBackupInfo.signKeyBackup = vendorInfo.signkeyBackup;
    vendorInfo.signkeyBackup = '';
  }
  if (status === CertificateBackupStatus.ENABLED) {
    certificateBackupInfo.status = CertificateBackupStatus.ENABLED;
    vendorInfo.signkeyBackup = certificateBackupInfo.signKeyBackup ? certificateBackupInfo.signKeyBackup : backUpKey;
    certificateBackupInfo.signKeyBackup = '';
  }
  await vendorInfo.save();
  await certificateBackupInfo.save();
  return vendorInfo;
};

export const deleteBackupCert = async (projectId: string, companyId: number) => {
  const projectInfo = await VendorInfo.findOne({ projectId, companyId });
  if (!projectInfo) return;
  const certificateBackupInfo = await CertificateBackupInfo.findOne({ where: { projectId, companyId } });
  await certificateBackupInfo.remove();
  projectInfo.signkeyBackup = '';
  await projectInfo.save();
  return projectInfo;
};

export const deleteNoCert = async (projectId: string, companyId: number) => {
  const projectInfo = await VendorInfo.findOne({ projectId, companyId });
  if (!projectInfo) return;
  projectInfo.allowStaticWithDynamic = ALLOW_STATIC_WITH_DYNAMIC.DISALLOW;
  await projectInfo.save();
  return projectInfo;
};

export const checkActiveProjectsAmount = async (companyId: number) => {
  const activeProjectsAmount = await VendorInfo.count({ companyId, status: VENDORVALID });
  return activeProjectsAmount;
};

export const getInternalIndustryList = async (area: string) => {
  let query = '';
  if (area === 'CN') {
    query = "case_area != 'Non-CN' and case_area != '' and status = 'Active'";
  } else {
    query = "case_area != 'CN' and case_area != '' and status = 'Active'";
  }
  const internalIndustryDB = getManager().getRepository(InternalIndustryMetadata);
  const industries = await internalIndustryDB.createQueryBuilder('internalIndustryMetadata')
    .where(query)
    .select('internalIndustryMetadata.internalIndustryId', 'internalIndustryId')
    .addSelect('internalIndustryMetadata.nameCn', 'internalIndustryMetadataNameCn')
    .addSelect('internalIndustryMetadata.nameEn', 'internalIndustryMetadataNameEn')
    .addOrderBy('internalIndustryMetadata.weight', Order.DESC)
    .getRawMany();
  industries.sort((item1, item2) => {
    return item1.weight - item2.weight;
  });
  return industries;
};

export const getUseCaseByInternalId = async (internalIndustryId: string, area: string) => {
  let query = '';
  if (area === 'CN') {
    query = "case_area != 'Non-CN' and internal_industry_id = :internalIndustryId";
  } else {
    query = "case_area != 'CN' and internal_industry_id = :internalIndustryId";
  }
  const projectUseCaseDB = getManager().getRepository(ProjectUseCase);
  const useCases = await projectUseCaseDB.createQueryBuilder('projectUseCase')
    .where(query, { internalIndustryId: `${internalIndustryId}` })
    .select('projectUseCase.use_case_id', 'useCaseId')
    .addSelect('projectUseCase.name_cn', 'useCaseNameCn')
    .addSelect('projectUseCase.name_En', 'useCaseNameEn')
    .addSelect('projectUseCase.name_En', 'useCaseNameEn')
    .addSelect('projectUseCase.Link_cn', 'linkCn')
    .addSelect('projectUseCase.Link_en', 'linkEn')
    .addSelect('projectUseCase.status', 'status')
    .addOrderBy('projectUseCase.weight', Order.DESC)
    .getRawMany();
  return useCases;
};

export const getSectorByInternalId = async (internalIndustryId: string) => {
  const sectorDB = getManager().getRepository(SectorMetadata);
  const sector = await sectorDB.createQueryBuilder('sectorMetadata')
    .where('internal_industry_id = :internalIndustryId', { internalIndustryId: `${internalIndustryId}` })
    .select('sectorMetadata.sectorId', 'sectorId')
    .addSelect('sectorMetadata.nameCn', 'sectorNameCn')
    .addSelect('sectorMetadata.nameEn', 'sectorNameEn')
    .addOrderBy('sectorMetadata.weight', Order.DESC)
    .getRawMany();
  return sector;
};

export const getUseCaseBySectorId = async (sectorId: string, area: string) => {
  let query = '';
  if (area === 'CN') {
    query = "case_area != 'Non-CN' and case_area != '' and sector_metadata_id like :sectorMetadataId";
  } else {
    query = "case_area != 'CN' and case_area != '' and sector_metadata_id like :sectorMetadataId";
  }
  const projectUseCaseDB = getManager().getRepository(ProjectUseCase);
  const useCases = await projectUseCaseDB.createQueryBuilder('projectUseCase')
    .where(query, { sectorMetadataId: `%${sectorId}%` })
    .select('projectUseCase.use_case_id', 'useCaseId')
    .addSelect('projectUseCase.name_cn', 'useCaseNameCn')
    .addSelect('projectUseCase.name_En', 'useCaseNameEn')
    .addSelect('projectUseCase.Link_cn', 'linkCn')
    .addSelect('projectUseCase.Link_en', 'linkEn')
    .addSelect('projectUseCase.status', 'status')
    .addOrderBy('projectUseCase.weight', Order.DESC)
    .getRawMany();
  return useCases;
};

export const openCoHostAuth = async (projectId: string, companyId: number) => {
  const projectInfo = await VendorInfo.findOne({ projectId, companyId });
  if (!projectInfo) return;
  projectInfo.inChannelPermission = 1;
  await projectInfo.save();
};

export const getProjectRelation = async (vendorId: number) => {
  return ProjectRelation.findOne(vendorId);
};

export const updateProjectRelation = async (data: ProjectRelationModel) => {
  const projectRelation = await ProjectRelation.findOne(data.vendorId);
  if (projectRelation) {
    projectRelation.platformId = data.platformId;
    projectRelation.productTypeId = data.productTypeId;
    await projectRelation.save();
  } else {
    const projectRelation = new ProjectRelation();
    projectRelation.vendorId = data.vendorId;
    projectRelation.productTypeId = data.productTypeId;
    projectRelation.platformId = data.platformId;
    projectRelation.creator = data.creator;
    await projectRelation.save();
  }
};

export const getProjectRelationList = async (vendorIds: number[]) => {
  const projectRelationDB = getManager().getRepository(ProjectRelation);
  return projectRelationDB.createQueryBuilder('projectRelation')
    .leftJoin(TUser, 'TUser', 'TUser.user_id = projectRelation.creator')
    .where('projectRelation.vendorId IN (:...vendorIds)', { vendorIds: vendorIds })
    .addSelect('projectRelation.vendorId', 'vendorId')
    .addSelect('projectRelation.productTypeId', 'productTypeId')
    .addSelect('projectRelation.platformId', 'platformId')
    .addSelect('projectRelation.creator', 'creator')
    .addSelect('TUser.email', 'email')
    .getRawMany();
};
