import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class CsrfTokens extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'expire_at' })
  expireAt: Date;

  @Column({ name: 'account_id' })
  accountId: number;

  @Column({ name: 'company_id' })
  companyId: number;
}
