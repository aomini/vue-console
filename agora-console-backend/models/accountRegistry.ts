import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity({ name: 'account_registry' })
export class AccountRegistry extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ip: string;

  @Column({ name: 'user_agent' })
  userAgent: string;

  @Column({ name: 'reg_source' })
  regSource: string;

  @Column({ name: 'utm_info' })
  utmInfo: string;

  @Column({ name: 'account_id' })
  acccountId: number;
}
