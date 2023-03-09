export interface ProjectRelationModel {
  vendorId: number;
  productTypeId: string;
  platformId: string;
  creator: string;
}

export enum ProjectCreatorStatus {
  'MainAccount' = '0',
  'NoRecord' = '-1',
  'AccountDeleted' = '-2'
}
