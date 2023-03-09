import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

export const TRANSACTION_TYPE = {
  SP_ALIPAY: 1,
  MIN_ALIPAY: 2,
  DEPOSIT_ALIPAY: 3,
  SP_STRIPE: 4,
  MIN_STRIPE: 5,
  DEPOSIT_STRIPE: 6,
  MARKETPLACE_ALIPAY: 2,
  AA_ALIPAY: 7
};

export const TRANSACTION_STATUS = {
  PENDING: 1,
  SUCCESS: 2,
  FAIL: 3
};

@Entity()
export class PaymentTransactions extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'operator_id' })
  operatorId: number;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column()
  type: number;

  @Column()
  status: number;

  @Column({ name: 'transaction_id' })
  transactionId: string;

  @Column()
  amount: string;
}
