import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class VoucherRequest extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'operator_id' })
  operatorId: number;

  @Column({ name: 'transaction_id' })
  transactionId: number;

  @Column()
  index: number;

  @Column()
  status: number;

  @Column({ name: 'updated_at' })
  updatedAt: string;
}
