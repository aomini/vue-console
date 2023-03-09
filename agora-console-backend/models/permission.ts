import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export const PERMISSIONDENY = 0;
export const PERMISSIONVIEW = 1;
export const PERMISSIONEDIT = 2;

type PERMISSIONDENY = typeof PERMISSIONDENY;
type PERMISSIONVIEW = typeof PERMISSIONVIEW;
type PERMISSIONEDIT = typeof PERMISSIONEDIT;
export type PERMISSION = PERMISSIONDENY | PERMISSIONVIEW | PERMISSIONEDIT;

export const ENTITYACCOUNT = 'account';
export const ENTITYCNACCOUNT = 'CNAccount';
export const ENTITYENACCOUNT = 'ENAccount';
export const ENTITYCOCOS = 'Cocos';
export const ENTITYMEMBER = 'member';
export const ENTITYRESTFUL = 'restful';

type ENTITYACCOUNT = typeof ENTITYACCOUNT;
type ENTITYCNACCOUNT = typeof ENTITYCNACCOUNT;
type ENTITYENACCOUNT = typeof ENTITYENACCOUNT;
type ENTITYCOCOS = typeof ENTITYCOCOS;
type ENTITYMEMBER = typeof ENTITYMEMBER;
type ENTITYRESTFUL = typeof ENTITYRESTFUL;
export type ENTITYTYPE = ENTITYACCOUNT | ENTITYMEMBER | ENTITYRESTFUL | ENTITYCNACCOUNT | ENTITYENACCOUNT | ENTITYCOCOS;

export const RESMODULE = 'module';
export const RESPROJECT = 'project';
export const RESNOTIFICATION = 'notification';

type RESMODULE = typeof RESMODULE;
type RESPROJECT = typeof RESPROJECT;
type RESNOTIFICATION = typeof RESNOTIFICATION;
export type RESTYPE = RESMODULE | RESPROJECT | RESNOTIFICATION;

export const DEFAULTROLES = ['管理员', '产品、运营', '客服、技术支持', '工程师', '财务', 'Admin', 'Product/Operation', 'CS/Maintenance', 'Engineer', 'Finance'];

@Entity()
export class ResPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'res_id' })
  resId: string;

  @Column({ name: 'res_type' })
  resType: RESTYPE;

  @Column()
  permission: PERMISSION;

  @Column({ name: 'role_id' })
  roleId: number;
}

@Entity()
export class CompanyRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column()
  auto: boolean; // 是否是系统自动生成的

  permissions: ResPermissions;
}

@Entity()
export class EntityRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'entity_id' })
  entityId: string;

  @Column({ name: 'entity_type' })
  entityType: ENTITYTYPE;

  @Column({ name: 'role_id' })
  roleId: number;
}

@Entity()
export class ResModule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key: string;

  @Column({ name: 'parent_id' })
  parentId: number;

  permission: PERMISSION;

  children: ResModule[];
}

export type ResPermissions = { [key: string]: ResPermission[] };
