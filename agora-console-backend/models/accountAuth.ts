import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity({ name: 'account_auth' })
export class AccountAuth extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'account_id' })
  accountId: number;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column()
  status: number;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;
}

export enum AccountAuthStatus {
  Yes = 1,
  No = 2
}
