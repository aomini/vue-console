import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class Voucher extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  code: string;

  @Column({ name: 'is_available' })
  isAvailable: number;

  @Column({ name: 'available_to' })
  availableTo: number;

  @Column()
  currency: number;

  @Column({ name: 'package_type' })
  packageType: number;

  @Column({ name: 'package_ids' })
  packageIds: string;

  @Column({ name: 'voucher_type' })
  voucherType: number;

  @Column({ name: 'voucher_amount' })
  voucherAmount: number;

  @Column({ name: 'discount_type' })
  discountType: number;

  @Column({ name: 'company_quota' })
  companyQuota: number;

  @Column({ name: 'need_authentication' })
  needAuthentication: number;

  @Column({ name: 'start_at' })
  startAt: number;

  @Column({ name: 'end_at' })
  endAt: number;
}
