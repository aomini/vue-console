import { SupportPackage } from './supportPackage';
import { MinPackage } from './minPackage';
import { MarketplacePackage } from './marketplacePackage';
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, OneToOne, JoinColumn } from 'typeorm';

@Entity()
export class PackageManagement extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'effective_date' })
  effectiveDate: Date;

  @Column({ name: 'expire_date' })
  expireDate: Date;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'company_id' })
  companyId: number;

  @OneToOne(type => SupportPackage)
  @JoinColumn({ name: 'package_id' })
  supportPackage: SupportPackage;

  @OneToOne(type => MinPackage)
  @JoinColumn({ name: 'package_id' })
  minPackage: MinPackage;

  @OneToOne(type => MarketplacePackage)
  @JoinColumn({ name: 'package_id' })
  marketplacePackage: MarketplacePackage;

  @Column({ name: 'package_id' })
  packageId: number;

  @Column({ name: 'sales_email' })
  salesEmail: string;

  @Column({ name: 'sales_name' })
  salesName: string;

  @Column({ name: 'bill_id' })
  billId: number;

  @Column()
  type: number;

  @Column()
  status: number;

  @Column({ name: 'transaction_id' })
  transactionId: number;

  @Column()
  amount: string;

  @Column()
  num: number;

  @Column({ name: 'is_renew' })
  isRenew: number;

  @Column()
  renew: number;

  @Column({ name: 'voucher_code' })
  voucherCode: number;
}
