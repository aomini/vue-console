import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

export const AREA_CN = 'CN';
export const AREA_NON_CN = 'Non-CN';

@Entity()
export class Company extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  industry: string;

  @Column()
  interest: string;

  @Column()
  environment: string;

  @Column()
  country: string;

  @Column()
  source: number;

  @Column({ name: 'sales_id' })
  salesId: number;

  @Column({ name: 'sales_email' })
  salesEmail: string;

  @Column({ name: 'api_key' })
  apiKey: string;

  @Column({ name: 'api_secret' })
  apiSecret: string;

  @Column({ name: 'app_limit' })
  appLimit: number;

  @Column({ name: 'member_limit' })
  memberLimit: number;

  @Column({ name: 'status' })
  status: number;

  @Column({ name: 'area' })
  area: string;

  @Column({ name: 'reseller_id' })
  resellerId: number;

  @Column({ name: 'restful_key_limit' })
  restfulKeyLimit: number;

  @Column({ name: 'internal_industry' })
  internalIndustry: string;
}

@Entity()
export class CompanyField extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'onboarding_status' })
  onboardingStatus: number;

  @Column({ name: 'view_aa_status' })
  viewAAStatus: number;

  @Column({ name: 'feedback_status' })
  feedbackStatus: number;

  @Column({ name: 'show_vendor_creator' })
  showVendorCreator: number;
}
