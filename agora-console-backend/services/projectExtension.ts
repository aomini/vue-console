import { getManager } from 'typeorm';
import { ProjectExtension } from '../models/projectExtension';
import { ProjectExtensionType } from '../models/projectExtensionType';
import {
  ExtensionArea,
  ExtensionConfig, ExtensionMenu,
  ExtensionMetadataForClient,
  ExtensionModel,
  ExtensionStatus
} from '../dataModel/ExtensionModels';

const getAvailableMenuConfig = (menuConfig: ExtensionMenu[], status: string) => {
  let availableMenuConfig: ExtensionMenu[] = [];
  if (status === ExtensionStatus.Active) {
    availableMenuConfig = menuConfig.filter(item => item.status === ExtensionStatus.Active);
    availableMenuConfig.forEach(subMenu => {
      subMenu.children = subMenu.children.filter(navMenu => navMenu.status === ExtensionStatus.Active);
    });
  } else if (status === ExtensionStatus.PreProd) {
    availableMenuConfig = menuConfig.filter(item => item.status === ExtensionStatus.Active || item.status === ExtensionStatus.PreProd);
    availableMenuConfig.forEach(subMenu => {
      subMenu.children = subMenu.children.filter(navMenu => navMenu.status === ExtensionStatus.Active || navMenu.status === ExtensionStatus.PreProd);
    });
  }
  return availableMenuConfig;
};

export const getActivedExtensionList = async (area: string, status: string): Promise<ProjectExtension[]> => {
  const extensionDB = getManager().getRepository(ProjectExtension);
  console.log(ExtensionArea[`${area}AndPreview`]);
  const extensionList = await extensionDB.createQueryBuilder('extension')
    .where('extension.area in (:area,:areaAll,:allCNPreview,:allENPreview) and extension.status in (:status, :statusActive)', {
      area: area,
      areaAll: ExtensionArea.All,
      allCNPreview: ExtensionArea.AllCNPreview,
      allENPreview: ExtensionArea.AllENPreview,
      status: status,
      statusActive: ExtensionStatus.Active
    })
    .addOrderBy('weight', 'DESC').getMany();
  return extensionList;
};

export const getExtensionTypeList = async (): Promise<ProjectExtensionType[]> => {
  const extensionTypeDB = getManager().getRepository(ProjectExtensionType);
  const extensionTypeList = await extensionTypeDB.createQueryBuilder('extensionType').where('extensionType.status = :status', {
    status: ExtensionStatus.Active
  }).addOrderBy('weight', 'DESC').getMany();
  return extensionTypeList;
};

export const getFullExtensionData = (extensionList: ProjectExtension[], extensionTypeList: ProjectExtensionType[], area: 'CN' | 'Non-CN', status: string) => {
  const extensionListForClient: ExtensionModel[] = [];
  extensionList.forEach(extension => {
    const fullMenuConfig = extension.configMode === 'iframe' && extension.menuConfig ? JSON.parse(extension.menuConfig) as ExtensionConfig : undefined;
    extensionListForClient.push({
      extensionId: extension.extensionId,
      extensionTypeId: extension.extensionTypeId,
      nameCn: extension.nameCn,
      nameEn: extension.nameEn,
      descriptionCn: extension.descriptionCn,
      descriptionEn: extension.descriptionEn,
      configMode: extension.configMode,
      icon: extension.icon,
      area: extension.area,
      status: extension.status,
      isPublic: extension.isPublic,
      weight: extension.weight,
      trackId: extension.trackId,
      needToken: extension.needToken,
      menuConfig: fullMenuConfig ? getAvailableMenuConfig(area === 'CN' ? fullMenuConfig?.areaCn : fullMenuConfig?.areaRow, status) : undefined,
      linkConfig: extension.linkConfig
    });
  });
  const data: ExtensionMetadataForClient[] = [];
  extensionTypeList.forEach(item => {
    data.push({
      ...item,
      children: extensionListForClient.filter(extension => extension.extensionTypeId === item.extensionTypeId)
    });
  });
  return data;
};
