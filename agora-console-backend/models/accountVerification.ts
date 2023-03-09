import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn } from 'typeorm';

@Entity()
export class AccountVerification extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'account_id', type: 'bigint' })
  accountId: number;

  @Column({ name: 'company_id', type: 'bigint' })
  companyId: number;

  @Column({ name: 'verification_code' })
  verificationCode: string;

  @Column({ name: 'expired_at', type: 'timestamp' })
  expiredAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'status' })
  status: number;

  @Column({ name: 'tried_count' })
  triedCount: number;

  @Column()
  type: number;
}
