
import { Entity, Column, JoinColumn, BaseEntity, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Company } from './company';

export const LANG_ZH = 'chinese';
export const LANG_EN = 'english';
export const LANG_CN = LANG_ZH;
export const DEFAULT_ROLE = 1;
export const NONDEFAULT_ROLE = 0;
export const VALID_PRIVILEGE = 1;
export const INVALID_PRIVILEGE = 0;
export const VALID_USER = 1;
export const INVALID_USER = 0;
export const VALID_EMAIL = 1;
export const INVALID_EMAIL = 0;

@Entity({ name: 't_privilege' })
export class Privilege extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'privilege_id' })
  id: number;

  @Column({ name: 'name_zh' })
  nameCN: string;

  @Column({ name: 'name_us' })
  nameEN: string;

  @Column({ default: 0 })
  status: boolean;

  @Column()
  description: string;
}

export interface User {
  id: number;

  firstName: string;

  lastName: string;

  displayName: string;

  locale: string;

  language: string;

  email: string;

  companyId: number;

  accountId: number;

  company: Company;

  verifyPhone: string;

  privileges: Privilege[];

  settings: any;

  permissions: {};

  isMember: boolean;

  created: number;

  packageInfo: {};
}

@Entity({ name: 't_users' })
export class TUser extends BaseEntity implements User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column()
  language: string;

  @Column()
  email: string;

  @Column({ name: 'email_status' })
  emailStatus: number;

  @Column({ name: 'company_id' })
  companyId: number;

  accountId: number;

  @Column()
  status: number;

  @Column()
  password: string;

  @Column({ name: 'verify_phone' })
  verifyPhone: string;

  @Column({ name: 'phone' })
  phoneNumber: string;

  @Column()
  salt: string;

  @Column({ name: 'create_time' })
  createdTime: string;

  created: number;

  @JoinColumn({ name: 'company_id' })
  company: Company;

  privileges: Privilege[];

  permissions: {};

  packageInfo: {};

  settings: any;

  isMember: boolean;

  get displayName (): string {
    if (this.language === LANG_ZH) {
      return this.lastName + this.firstName;
    } else {
      return `${this.firstName} ${this.lastName}`;
    }
  }
  get locale (): string {
    return this.language === LANG_ZH ? 'cn' : 'en';
  }
}

@Entity({ name: 'user_profile' })
export class UserProfile extends BaseEntity implements User {
  @PrimaryColumn()
  id: number;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'account_id' })
  accountId: number;

  @Column()
  language: string;

  @Column()
  email: string;

  @Column()
  step: number;

  @Column({ name: 'phone' })
  phoneNumber: string;

  @Column({ name: 'verify_phone' })
  verifyPhone: string;

  @Column({ name: 'verify_date' })
  verifyDate: Date;

  @Column({ name: 'email_status' })
  emailStatus: number;

  @Column({ name: 'company_id' })
  companyId: number;

  @OneToOne(type => UserProfile)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  privileges: Privilege[];

  settings: any;

  permissions: {};

  packageInfo: {};

  isMember: boolean;

  @Column({ name: 'created' })
  created: number;

  @Column({ name: 'extras_info' })
  extrasInfo: string;

  get displayName (): string {
    if (this.language === LANG_ZH) {
      return this.lastName + this.firstName;
    } else {
      return `${this.firstName} ${this.lastName}`;
    }
  }

  get locale (): string {
    return this.language === LANG_ZH ? 'cn' : 'en';
  }
}

@Entity({ name: 't_roles' })
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'role_id' })
  id: number;

  @Column({ name: 'role_name_zh' })
  nameCN: string;

  @Column({ name: 'role_name_us' })
  nameEN: string;

  @Column()
  description: string;

  @Column({ default: false })
  default: boolean;

  @Column({ name: 'create_time', type: 'timestamp' })
  createdAt: Date;
}

@Entity({ name: 't_role_privilege' })
export class RolePrivilege extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'role_privilege_id' })
  id: number;

  @OneToOne(type => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToOne(type => Privilege)
  @JoinColumn({ name: 'privilege_id' })
  privilege: Privilege;

  @Column({ name: 'privilege_type' })
  privilegeType: number;

  roleName: string;

  privilegeId: number;
}

@Entity({ name: 't_user_role' })
export class UserRole extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'user_role_id' })
  id: number;

  @OneToOne(type => TUser)
  @JoinColumn({ name: 'user_id' })
  user: TUser;

  @Column()
  type: number;

  @OneToOne(type => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  userId: number;
  email: string;
  created: string;
  roleId: number;
  roleName: string;
  privilegeId: number;
}
