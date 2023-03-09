import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class PackageReport extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'fee_category' })
  feeCategory: number;

  @Column({ name: 'start_date' })
  startDate: string;

  @Column({ name: 'expire_date' })
  expireDate: string;

  @Column({ name: 'update_ts' })
  updateTs: Date;

  @Column({ name: 'create_ts' })
  createTs: Date;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'bill_period' })
  billPeriod: string;

  @Column({ name: 'usage_quote' })
  usageQuote: number;

  @Column({ name: 'product_usage' })
  productUsage: number;

  @Column({ name: 'product_type' })
  productType: number;

  @Column({ name: 'package_management_id' })
  packageManagementId: number;

  @Column({ name: 'bill_id' })
  billId: number;

  @Column()
  duration: number;

  @Column()
  media: number;

  @Column()
  amount: string;

  @Column()
  currency: string;
}
