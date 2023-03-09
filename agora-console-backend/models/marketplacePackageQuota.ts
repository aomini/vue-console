import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class MarketplacePackageQuota extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'package_name' })
  packageName: string;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'service_name' })
  serviceName: string;

  @Column({ name: 'marketplace_package_id' })
  marketplacePackageId: number;

  @Column({ name: 'usage_quota' })
  usageQuota: number;

  @Column({ name: 'quota_used' })
  quotaUsed: number;

  @Column()
  status: number;

  @Column({ name: 'sku_type' })
  skuType: number;

  @Column({ name: 'transaction_id' })
  transactionId: number;

  @Column({ name: 'effective_date' })
  effectiveDate: Date;

  @Column({ name: 'expire_date' })
  expireDate: Date;
}
