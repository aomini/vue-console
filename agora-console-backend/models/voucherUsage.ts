import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class VoucherUsage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'bill_id' })
  billId: number;

  @Column({ name: 'updated_at' })
  updatedAt: string;
}
