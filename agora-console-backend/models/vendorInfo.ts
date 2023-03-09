import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Company } from './company';
import { VendorSignal } from './vendorSignal';

export const VENDORVALID = 1;
export const VENDORSTOP = 2;

export const ALLOW_STATIC_WITH_DYNAMIC = {
  ALLOW: 1,
  DISALLOW: 0
};

@Entity()
export class VendorInfo extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'vendor_id' })
  id: number;

  @Column({ name: 'is_deleted' })
  isDeleted: boolean;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  user: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  key: string;

  @Column()
  signkey: string;

  @Column({ name: 'signkey_signal' })
  signkeySignal: string;

  @Column({ name: 'signkey_backup' })
  signkeyBackup: string;

  @Column({ name: 'allow_static_with_dynamic' })
  allowStaticWithDynamic: number;

  @Column({ name: 'need_token' })
  needToken: number;

  @Column({ name: 'api_secret' })
  apiSecret: string;

  @Column()
  status: number;

  @Column()
  stage: number;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'parent_id' })
  parentId: number;

  @Column({ name: 'max_channels' })
  maxChannels: number;

  @Column({ name: 'start_time' })
  startTime: Date;

  @Column({ name: 'end_time' })
  endTime: Date;

  @Column()
  country: string;

  @Column({ name: 'use_case_id' })
  useCaseId: string;

  @Column({ name: 'created_at' })
  createdAt: string;

  @ManyToOne(type => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'in_channel_permission' })
  inChannelPermission: number;

  @OneToOne(type => VendorSignal)
  vendorSignal: VendorSignal;
}
